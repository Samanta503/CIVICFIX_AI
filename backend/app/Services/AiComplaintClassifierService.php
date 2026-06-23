<?php

namespace App\Services;

use App\Models\ComplaintCategory;
use Illuminate\Support\Facades\Schema;

class AiComplaintClassifierService
{
    public function predict(array $input): array
    {
        $title = trim((string) ($input['title'] ?? ''));
        $description = trim((string) ($input['description'] ?? ''));
        $address = trim((string) ($input['address'] ?? ''));

        $combinedText = $this->normalize($title . ' ' . $description . ' ' . $address);

        $categoryResult = $this->predictCategory($combinedText);
        $priorityResult = $this->predictPriority($combinedText, $categoryResult['category'] ?? null);

        $confidence = $this->calculateConfidence(
            $categoryResult['score'],
            $priorityResult['score'],
            count($categoryResult['matched_keywords']),
            count($priorityResult['matched_keywords'])
        );

        $summary = $this->makeSummary($title, $description);

        $reasoning = $this->makeReasoning(
            $categoryResult['category']?->name,
            $categoryResult['category']?->department?->name,
            $priorityResult['priority'],
            $categoryResult['matched_keywords'],
            $priorityResult['matched_keywords'],
            $confidence
        );

        return [
            'model_name' => 'local-ai-classifier-v1',
            'input_title' => $title,
            'input_description' => $description,
            'input_address' => $address,

            'predicted_category_id' => $categoryResult['category']?->id,
            'predicted_category_name' => $categoryResult['category']?->name,

            'predicted_department_id' => $categoryResult['category']?->department?->id,
            'predicted_department_name' => $categoryResult['category']?->department?->name,

            'predicted_priority' => $priorityResult['priority'],
            'confidence_score' => $confidence,

            'predicted_summary' => $summary,
            'reasoning' => $reasoning,

            'matched_keywords' => [
                'category' => $categoryResult['matched_keywords'],
                'priority' => $priorityResult['matched_keywords'],
            ],

            'raw_output' => [
                'category_score' => $categoryResult['score'],
                'priority_score' => $priorityResult['score'],
                'classifier_type' => 'local_rule_based_ai_ready_baseline',
            ],
        ];
    }

    private function predictCategory(string $text): array
    {
        $query = ComplaintCategory::query()
            ->with('department:id,name,slug');

        if (Schema::hasColumn('complaint_categories', 'is_active')) {
            $query->where('is_active', true);
        }

        $categories = $query->get();

        $bestCategory = null;
        $bestScore = 0;
        $bestMatchedKeywords = [];

        foreach ($categories as $category) {
            $keywords = $this->keywordsForCategory($category);
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
                $bestCategory = $category;
                $bestMatchedKeywords = array_values(array_unique($matched));
            }
        }

        return [
            'category' => $bestCategory,
            'score' => $bestScore,
            'matched_keywords' => $bestMatchedKeywords,
        ];
    }

    private function predictPriority(string $text, ?ComplaintCategory $category): array
    {
        $criticalKeywords = [
            'fire',
            'accident',
            'injury',
            'death',
            'electric shock',
            'gas leak',
            'collapse',
            'danger',
            'life risk',
            'emergency',
            'explosion',
            'severe flood',
            'sewage overflow',
            'major waterlogging',
            'road blocked',
            'bridge broken',
        ];

        $highKeywords = [
            'urgent',
            'severe',
            'blocked',
            'unsafe',
            'broken',
            'flood',
            'waterlogging',
            'garbage pile',
            'bad smell',
            'open drain',
            'manhole',
            'traffic jam',
            'public suffering',
        ];

        $mediumKeywords = [
            'damaged',
            'dirty',
            'not working',
            'repair',
            'delay',
            'problem',
            'issue',
            'complaint',
            'leakage',
            'street light off',
        ];

        $lowKeywords = [
            'small',
            'minor',
            'request',
            'suggestion',
            'maintenance',
        ];

        $matchedCritical = $this->matchedKeywords($text, $criticalKeywords);
        $matchedHigh = $this->matchedKeywords($text, $highKeywords);
        $matchedMedium = $this->matchedKeywords($text, $mediumKeywords);
        $matchedLow = $this->matchedKeywords($text, $lowKeywords);

        if (count($matchedCritical) > 0) {
            return [
                'priority' => 'critical',
                'score' => 95,
                'matched_keywords' => $matchedCritical,
            ];
        }

        if (count($matchedHigh) > 0) {
            return [
                'priority' => 'high',
                'score' => 80,
                'matched_keywords' => $matchedHigh,
            ];
        }

        if (count($matchedMedium) > 0) {
            return [
                'priority' => 'medium',
                'score' => 60,
                'matched_keywords' => $matchedMedium,
            ];
        }

        if (count($matchedLow) > 0) {
            return [
                'priority' => 'low',
                'score' => 40,
                'matched_keywords' => $matchedLow,
            ];
        }

        $defaultPriority = $category?->default_priority;

        if (in_array($defaultPriority, ['low', 'medium', 'high', 'critical'], true)) {
            return [
                'priority' => $defaultPriority,
                'score' => 45,
                'matched_keywords' => ['category default priority'],
            ];
        }

        return [
            'priority' => 'medium',
            'score' => 35,
            'matched_keywords' => ['default medium priority'],
        ];
    }

    private function keywordsForCategory(ComplaintCategory $category): array
    {
        $name = $this->normalize($category->name);
        $slug = $this->normalize($category->slug ?? '');
        $departmentName = $this->normalize($category->department?->name ?? '');
        $departmentSlug = $this->normalize($category->department?->slug ?? '');

        $baseKeywords = [
            $category->name,
            $category->slug,
            $category->department?->name,
            $category->department?->slug,
        ];

        $profileKeywords = [
            'road' => [
                'road',
                'pothole',
                'street',
                'footpath',
                'sidewalk',
                'traffic',
                'bridge',
                'broken road',
                'road damage',
                'road blocked',
                'manhole',
            ],
            'waste' => [
                'waste',
                'garbage',
                'trash',
                'dustbin',
                'dirty',
                'bad smell',
                'dump',
                'cleaning',
                'solid waste',
            ],
            'water' => [
                'water',
                'drain',
                'drainage',
                'sewage',
                'pipeline',
                'leakage',
                'flood',
                'waterlogging',
                'blocked drain',
            ],
            'electric' => [
                'electric',
                'electricity',
                'street light',
                'streetlight',
                'lamp',
                'light off',
                'wire',
                'pole',
                'power',
            ],
            'health' => [
                'mosquito',
                'dengue',
                'disease',
                'health',
                'hospital',
                'medicine',
                'sanitation',
            ],
            'noise' => [
                'noise',
                'loud',
                'sound',
                'speaker',
                'disturbance',
            ],
            'park' => [
                'park',
                'tree',
                'playground',
                'garden',
                'green',
            ],
            'security' => [
                'security',
                'unsafe',
                'crime',
                'theft',
                'harassment',
                'police',
            ],
        ];

        foreach ($profileKeywords as $profile => $keywords) {
            if (
                str_contains($name, $profile) ||
                str_contains($slug, $profile) ||
                str_contains($departmentName, $profile) ||
                str_contains($departmentSlug, $profile)
            ) {
                $baseKeywords = array_merge($baseKeywords, $keywords);
            }
        }

        if (str_contains($name, 'road') || str_contains($departmentName, 'road')) {
            $baseKeywords = array_merge($baseKeywords, $profileKeywords['road']);
        }

        if (str_contains($name, 'garbage') || str_contains($name, 'waste')) {
            $baseKeywords = array_merge($baseKeywords, $profileKeywords['waste']);
        }

        if (str_contains($name, 'water') || str_contains($name, 'drain')) {
            $baseKeywords = array_merge($baseKeywords, $profileKeywords['water']);
        }

        if (str_contains($name, 'light') || str_contains($name, 'electric')) {
            $baseKeywords = array_merge($baseKeywords, $profileKeywords['electric']);
        }

        return array_values(array_filter(array_unique($baseKeywords)));
    }

    private function matchedKeywords(string $text, array $keywords): array
    {
        $matched = [];

        foreach ($keywords as $keyword) {
            $normalizedKeyword = $this->normalize($keyword);

            if ($normalizedKeyword !== '' && str_contains($text, $normalizedKeyword)) {
                $matched[] = $keyword;
            }
        }

        return array_values(array_unique($matched));
    }

    private function keywordWeight(string $keyword): int
    {
        $wordCount = str_word_count($keyword);

        if ($wordCount >= 3) {
            return 20;
        }

        if ($wordCount === 2) {
            return 15;
        }

        return 10;
    }

    private function calculateConfidence(
        int $categoryScore,
        int $priorityScore,
        int $categoryMatchCount,
        int $priorityMatchCount
    ): float {
        $confidence = 25;

        if ($categoryScore > 0) {
            $confidence += min(40, $categoryScore);
        }

        if ($priorityScore > 0) {
            $confidence += min(20, $priorityScore / 5);
        }

        $confidence += min(10, ($categoryMatchCount + $priorityMatchCount) * 2);

        return round(min(98, max(10, $confidence)), 2);
    }

    private function makeSummary(string $title, string $description): string
    {
        $text = trim($title . '. ' . $description);
        $text = preg_replace('/\s+/', ' ', $text) ?: '';

        if (mb_strlen($text) <= 180) {
            return $text;
        }

        return mb_substr($text, 0, 177) . '...';
    }

    private function makeReasoning(
        ?string $categoryName,
        ?string $departmentName,
        string $priority,
        array $categoryKeywords,
        array $priorityKeywords,
        float $confidence
    ): string {
        $category = $categoryName ?: 'No strong category match';
        $department = $departmentName ?: 'No department predicted';

        $categoryKeywordText = count($categoryKeywords) > 0
            ? implode(', ', $categoryKeywords)
            : 'no category keyword';

        $priorityKeywordText = count($priorityKeywords) > 0
            ? implode(', ', $priorityKeywords)
            : 'default priority logic';

        return "AI predicted {$category} under {$department} with {$priority} priority. Category matched from: {$categoryKeywordText}. Priority matched from: {$priorityKeywordText}. Confidence: {$confidence}%.";
    }

    private function normalize(string $text): string
    {
        $text = mb_strtolower($text);
        $text = preg_replace('/[^a-z0-9\s\-_\p{Bengali}]/u', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text ?? '');
    }
}