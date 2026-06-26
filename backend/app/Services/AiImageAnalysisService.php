<?php

namespace App\Services;

use App\Models\ComplaintMedia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AiImageAnalysisService
{
    public function analyzeMedia(ComplaintMedia $media): array
    {
        $media->loadMissing([
            'complaint.category:id,name,slug',
            'complaint.department:id,name,slug',
            'complaint.zone:id,name,city,ward_number',
        ]);

        $complaint = $media->complaint;

        $fileName = (string) $this->firstAvailable($media, [
            'original_name',
            'file_name',
            'filename',
            'name',
        ]);

        $storedPath = (string) $this->firstAvailable($media, [
            'file_path',
            'path',
            'storage_path',
            'media_path',
        ]);

        $localPath = $this->resolveLocalPath($storedPath);

        $mimeType = $this->firstAvailable($media, [
            'mime_type',
            'mime',
            'file_type',
            'content_type',
        ]);

        if (!$mimeType && $localPath && File::exists($localPath)) {
            $mimeType = File::mimeType($localPath);
        }

        if (!$mimeType) {
            $mimeType = $this->guessMimeTypeFromName($fileName ?: $storedPath);
        }

        $fileSize = $this->firstAvailable($media, [
            'file_size',
            'size',
            'size_bytes',
            'file_size_bytes',
        ]);

        if (!$fileSize && $localPath && File::exists($localPath)) {
            $fileSize = File::size($localPath);
        }

        $dimensions = $this->extractDimensions($localPath, (string) $mimeType);

        $contextText = $this->normalize(
            ($complaint?->title ?? '') . ' ' .
            ($complaint?->description ?? '') . ' ' .
            ($complaint?->address ?? '') . ' ' .
            ($complaint?->category?->name ?? '') . ' ' .
            ($complaint?->department?->name ?? '') . ' ' .
            ($complaint?->zone?->name ?? '') . ' ' .
            $fileName . ' ' .
            $storedPath
        );

        $issueResult = $this->detectIssueType($contextText);
        $qualityScore = $this->calculateQualityScore(
            $dimensions['width'],
            $dimensions['height'],
            $fileSize ? (int) $fileSize : null,
            (string) $mimeType
        );

        $visualSeverity = $this->detectVisualSeverity(
            (string) ($complaint?->priority ?? 'medium'),
            $issueResult['detected_issue_type'],
            $contextText,
            $qualityScore
        );

        $confidenceScore = $this->calculateConfidenceScore(
            $issueResult['score'],
            $qualityScore,
            $dimensions['width'],
            $dimensions['height'],
            (string) $mimeType
        );

        $summary = $this->makeSummary(
            $issueResult['detected_issue_type'],
            $visualSeverity,
            $confidenceScore,
            $qualityScore,
            $dimensions['width'],
            $dimensions['height']
        );

        $safetyObservations = $this->makeSafetyObservations(
            $issueResult['detected_issue_type'],
            $visualSeverity,
            $contextText
        );

        return [
            'model_name' => 'local-image-analyzer-v1',
            'detected_issue_type' => $issueResult['detected_issue_type'],
            'visual_severity' => $visualSeverity,
            'confidence_score' => $confidenceScore,
            'quality_score' => $qualityScore,
            'image_width' => $dimensions['width'],
            'image_height' => $dimensions['height'],
            'file_size_bytes' => $fileSize ? (int) $fileSize : null,
            'mime_type' => $mimeType ?: null,
            'analysis_summary' => $summary,
            'safety_observations' => $safetyObservations,
            'matched_visual_clues' => $issueResult['matched_visual_clues'],
            'recommendations' => $this->recommendationsForIssue(
                $issueResult['detected_issue_type'],
                $visualSeverity
            ),
            'raw_output' => [
                'analyzer_type' => 'rule_based_metadata_context_analyzer',
                'local_file_found' => (bool) ($localPath && File::exists($localPath)),
                'stored_path_available' => $storedPath !== '',
                'file_name' => $fileName ?: null,
                'mime_type_detected' => $mimeType ?: null,
                'context_keyword_score' => $issueResult['score'],
                'quality_score' => $qualityScore,
                'width' => $dimensions['width'],
                'height' => $dimensions['height'],
                'note' => 'This is a local baseline image analysis. Future upgrade can replace it with a trained Python/FastAPI computer vision model.',
            ],
        ];
    }

    private function detectIssueType(string $text): array
    {
        $profiles = [
            'solid_waste' => [
                'garbage',
                'waste',
                'trash',
                'dump',
                'dumping',
                'dirty',
                'bin',
                'rubbish',
                'ময়লা',
                'আবর্জনা',
                'ডাস্টবিন',
            ],
            'road_damage' => [
                'road',
                'pothole',
                'broken road',
                'crack',
                'hole',
                'damaged road',
                'traffic',
                'accident',
                'রাস্তা',
                'গর্ত',
                'ভাঙ্গা',
            ],
            'water_logging' => [
                'water logging',
                'flood',
                'drain',
                'drainage',
                'sewer',
                'blocked drain',
                'overflow',
                'জলাবদ্ধতা',
                'ড্রেন',
                'পানি',
            ],
            'street_light' => [
                'street light',
                'light',
                'lamp',
                'dark',
                'electric pole',
                'বিদ্যুৎ',
                'লাইট',
                'বাতি',
                'অন্ধকার',
            ],
            'water_supply' => [
                'water supply',
                'pipe',
                'leak',
                'broken pipe',
                'dirty water',
                'tap',
                'পাইপ',
                'পানি সরবরাহ',
                'লিক',
            ],
            'public_safety' => [
                'fire',
                'danger',
                'hazard',
                'unsafe',
                'collapse',
                'injury',
                'emergency',
                'আগুন',
                'বিপদ',
                'ঝুঁকি',
            ],
            'building_infrastructure' => [
                'building',
                'wall',
                'bridge',
                'footpath',
                'sidewalk',
                'construction',
                'ভবন',
                'ফুটপাত',
                'ব্রিজ',
            ],
            'noise_pollution' => [
                'noise',
                'sound',
                'loud',
                'horn',
                'speaker',
                'শব্দ',
                'হর্ন',
                'মাইক',
            ],
        ];

        $bestType = 'general_civic_issue';
        $bestScore = 0;
        $matchedClues = [];

        foreach ($profiles as $issueType => $keywords) {
            $score = 0;
            $matched = [];

            foreach ($keywords as $keyword) {
                $normalizedKeyword = $this->normalize($keyword);

                if ($normalizedKeyword !== '' && str_contains($text, $normalizedKeyword)) {
                    $score += $this->keywordWeight($normalizedKeyword);
                    $matched[] = $keyword;
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestType = $issueType;
                $matchedClues = $matched;
            }
        }

        if ($bestScore === 0) {
            $matchedClues[] = 'General civic issue context detected';
        }

        return [
            'detected_issue_type' => $bestType,
            'score' => $bestScore,
            'matched_visual_clues' => array_values(array_unique($matchedClues)),
        ];
    }

    private function calculateQualityScore(
        ?int $width,
        ?int $height,
        ?int $fileSize,
        string $mimeType
    ): float {
        $score = 30;

        if (str_starts_with($mimeType, 'image/')) {
            $score += 20;
        }

        if ($width && $height) {
            $pixels = $width * $height;

            if ($pixels >= 2000000) {
                $score += 35;
            } elseif ($pixels >= 1000000) {
                $score += 28;
            } elseif ($pixels >= 500000) {
                $score += 20;
            } elseif ($pixels >= 150000) {
                $score += 10;
            } else {
                $score += 3;
            }
        }

        if ($fileSize) {
            if ($fileSize >= 300000 && $fileSize <= 8000000) {
                $score += 15;
            } elseif ($fileSize > 8000000) {
                $score += 8;
            } elseif ($fileSize < 80000) {
                $score -= 8;
            }
        }

        return round(max(0, min(100, $score)), 2);
    }

    private function calculateConfidenceScore(
        int $issueKeywordScore,
        float $qualityScore,
        ?int $width,
        ?int $height,
        string $mimeType
    ): float {
        $score = 20;

        $score += min(35, $issueKeywordScore * 2);
        $score += $qualityScore * 0.30;

        if ($width && $height) {
            $score += 10;
        }

        if (str_starts_with($mimeType, 'image/')) {
            $score += 10;
        }

        return round(max(0, min(100, $score)), 2);
    }

    private function detectVisualSeverity(
        string $priority,
        string $issueType,
        string $contextText,
        float $qualityScore
    ): string {
        $priority = strtolower($priority);

        $score = match ($priority) {
            'critical' => 85,
            'high' => 70,
            'medium' => 50,
            default => 35,
        };

        $criticalWords = [
            'fire',
            'danger',
            'emergency',
            'collapse',
            'accident',
            'injury',
            'unsafe',
            'আগুন',
            'বিপদ',
            'জরুরি',
        ];

        foreach ($criticalWords as $word) {
            if (str_contains($contextText, $this->normalize($word))) {
                $score += 15;
            }
        }

        if (in_array($issueType, ['public_safety', 'water_logging', 'road_damage'], true)) {
            $score += 8;
        }

        if ($qualityScore < 35) {
            $score -= 8;
        }

        if ($score >= 85) {
            return 'critical';
        }

        if ($score >= 65) {
            return 'high';
        }

        if ($score >= 40) {
            return 'medium';
        }

        return 'low';
    }

    private function makeSummary(
        string $issueType,
        string $severity,
        float $confidence,
        float $quality,
        ?int $width,
        ?int $height
    ): string {
        $issueLabel = $this->issueLabel($issueType);

        $dimensionText = $width && $height
            ? " Image resolution detected as {$width}x{$height}."
            : " Image resolution could not be detected.";

        return "AI image analysis suggests this media may show {$issueLabel}. Visual severity is estimated as {$severity}. Confidence score is {$confidence}% and image quality score is {$quality}%.{$dimensionText}";
    }

    private function makeSafetyObservations(
        string $issueType,
        string $severity,
        string $contextText
    ): string {
        if ($severity === 'critical') {
            return 'This complaint may need urgent human review because the visual/context signals indicate possible public safety risk.';
        }

        if ($issueType === 'road_damage') {
            return 'Road-related complaints may affect traffic movement and pedestrian safety.';
        }

        if ($issueType === 'water_logging') {
            return 'Water logging or drainage issues may create health and transport risks if not resolved quickly.';
        }

        if ($issueType === 'solid_waste') {
            return 'Waste-related complaints may create hygiene and public health concerns.';
        }

        if ($issueType === 'street_light') {
            return 'Street light issues may reduce night-time visibility and public safety.';
        }

        if (str_contains($contextText, 'danger') || str_contains($contextText, 'unsafe')) {
            return 'Complaint text contains safety-related keywords and should be reviewed carefully.';
        }

        return 'No direct critical safety signal was detected by the baseline image analyzer.';
    }

    private function recommendationsForIssue(string $issueType, string $severity): array
    {
        $common = [
            'Review uploaded image manually before final decision.',
            'Compare image analysis result with complaint title, category, and location.',
        ];

        $specific = match ($issueType) {
            'solid_waste' => [
                'Send to waste management team for cleanup verification.',
                'Check whether repeated complaints exist in the same zone.',
            ],
            'road_damage' => [
                'Send to road maintenance team for inspection.',
                'Prioritize if the issue is on a busy road or near public facilities.',
            ],
            'water_logging' => [
                'Send to drainage/water team for urgent inspection.',
                'Check if nearby complaints report the same drainage problem.',
            ],
            'street_light' => [
                'Send to electricity or street-light maintenance team.',
                'Prioritize if the location is a high-risk dark area.',
            ],
            'public_safety' => [
                'Escalate to responsible authority for urgent manual verification.',
                'Check whether emergency response is required.',
            ],
            default => [
                'Assign to the responsible department after manual verification.',
            ],
        };

        if ($severity === 'critical') {
            array_unshift($specific, 'Treat this as high-priority until reviewed by an admin/officer.');
        }

        return array_values(array_unique([...$specific, ...$common]));
    }

    private function issueLabel(string $issueType): string
    {
        return match ($issueType) {
            'solid_waste' => 'solid waste or garbage problem',
            'road_damage' => 'road damage or pothole problem',
            'water_logging' => 'water logging or drainage problem',
            'street_light' => 'street light or electrical visibility problem',
            'water_supply' => 'water supply or pipe leakage problem',
            'public_safety' => 'public safety hazard',
            'building_infrastructure' => 'building or infrastructure issue',
            'noise_pollution' => 'noise pollution issue',
            default => 'general civic issue',
        };
    }

    private function extractDimensions(?string $localPath, string $mimeType): array
    {
        if (!$localPath || !File::exists($localPath) || !str_starts_with($mimeType, 'image/')) {
            return [
                'width' => null,
                'height' => null,
            ];
        }

        $size = @getimagesize($localPath);

        if (!$size) {
            return [
                'width' => null,
                'height' => null,
            ];
        }

        return [
            'width' => isset($size[0]) ? (int) $size[0] : null,
            'height' => isset($size[1]) ? (int) $size[1] : null,
        ];
    }

    private function resolveLocalPath(string $storedPath): ?string
    {
        $storedPath = trim(str_replace('\\', '/', $storedPath));

        if ($storedPath === '' || Str::startsWith($storedPath, ['http://', 'https://'])) {
            return null;
        }

        $candidates = [];

        if (File::exists($storedPath)) {
            $candidates[] = $storedPath;
        }

        $cleanPath = ltrim($storedPath, '/');

        $candidates[] = storage_path('app/' . $cleanPath);
        $candidates[] = storage_path('app/public/' . $cleanPath);
        $candidates[] = public_path($cleanPath);

        if (Str::startsWith($cleanPath, 'storage/')) {
            $withoutStorage = Str::after($cleanPath, 'storage/');
            $candidates[] = storage_path('app/public/' . $withoutStorage);
            $candidates[] = public_path($cleanPath);
        }

        if (Str::startsWith($cleanPath, 'public/')) {
            $withoutPublic = Str::after($cleanPath, 'public/');
            $candidates[] = storage_path('app/public/' . $withoutPublic);
            $candidates[] = public_path('storage/' . $withoutPublic);
        }

        foreach ($candidates as $candidate) {
            if ($candidate && File::exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function guessMimeTypeFromName(string $name): ?string
    {
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        return match ($extension) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => null,
        };
    }

    private function firstAvailable(object $model, array $keys): mixed
    {
        foreach ($keys as $key) {
            $value = data_get($model, $key);

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    private function keywordWeight(string $keyword): int
    {
        $length = mb_strlen($keyword);

        if ($length >= 12) {
            return 5;
        }

        if ($length >= 8) {
            return 4;
        }

        if ($length >= 5) {
            return 3;
        }

        return 2;
    }

    private function normalize(?string $text): string
    {
        $text = mb_strtolower((string) $text);
        $text = preg_replace('/[^a-z0-9\s\-_\p{Bengali}]/u', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text ?? '');
    }
}