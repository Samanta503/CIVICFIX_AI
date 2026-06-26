<?php

namespace App\Services;

use App\Models\Complaint;
use Illuminate\Support\Collection;

class AiDuplicateComplaintService
{
    private float $minimumSimilarity = 45.00;

    public function analyzeComplaint(Complaint $sourceComplaint): array
    {
        $sourceComplaint->load([
            'category:id,name,slug',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
        ]);

        $candidates = Complaint::query()
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->where('id', '!=', $sourceComplaint->id)
            ->whereNotIn('status', ['rejected'])
            ->latest()
            ->limit(100)
            ->get();

        $matches = $candidates
            ->map(fn (Complaint $candidate) => $this->compareComplaints($sourceComplaint, $candidate))
            ->filter(fn (array $result) => $result['similarity_score'] >= $this->minimumSimilarity)
            ->sortByDesc('similarity_score')
            ->values()
            ->take(10);

        return [
            'model_name' => 'local-duplicate-detector-v1',
            'source_complaint_id' => $sourceComplaint->id,
            'source_complaint_no' => $sourceComplaint->complaint_no,
            'total_candidates_checked' => $candidates->count(),
            'total_matches_found' => $matches->count(),
            'matches' => $matches->all(),
        ];
    }

    public function compareComplaints(Complaint $source, Complaint $candidate): array
    {
        $sourceText = $this->normalize(
            $source->title . ' ' . $source->description . ' ' . $source->address
        );

        $candidateText = $this->normalize(
            $candidate->title . ' ' . $candidate->description . ' ' . $candidate->address
        );

        $titleSimilarity = $this->stringSimilarity(
            $this->normalize($source->title),
            $this->normalize($candidate->title)
        );

        $descriptionSimilarity = $this->stringSimilarity(
            $this->normalize($source->description),
            $this->normalize($candidate->description)
        );

        $addressSimilarity = $this->stringSimilarity(
            $this->normalize($source->address),
            $this->normalize($candidate->address)
        );

        $tokenSimilarity = $this->tokenOverlapScore($sourceText, $candidateText);

        $textSimilarity = round(
            ($titleSimilarity * 0.35) +
            ($descriptionSimilarity * 0.35) +
            ($addressSimilarity * 0.10) +
            ($tokenSimilarity * 0.20),
            2
        );

        $categorySimilarity = $this->categorySimilarity($source, $candidate);

        $locationResult = $this->locationSimilarity($source, $candidate);

        $finalScore = round(
            ($textSimilarity * 0.60) +
            ($categorySimilarity * 0.20) +
            ($locationResult['score'] * 0.20),
            2
        );

        $reasons = $this->makeReasons(
            $source,
            $candidate,
            $textSimilarity,
            $categorySimilarity,
            $locationResult
        );

        return [
            'matched_complaint_id' => $candidate->id,
            'matched_complaint_no' => $candidate->complaint_no,
            'matched_title' => $candidate->title,
            'matched_status' => $candidate->status,
            'matched_priority' => $candidate->priority,

            'similarity_score' => $finalScore,
            'text_similarity_score' => $textSimilarity,
            'location_similarity_score' => $locationResult['score'],
            'category_similarity_score' => $categorySimilarity,
            'distance_meters' => $locationResult['distance_meters'],

            'matched_reasons' => $reasons,

            'raw_output' => [
                'title_similarity' => $titleSimilarity,
                'description_similarity' => $descriptionSimilarity,
                'address_similarity' => $addressSimilarity,
                'token_similarity' => $tokenSimilarity,
                'source_text_length' => mb_strlen($sourceText),
                'candidate_text_length' => mb_strlen($candidateText),
            ],
        ];
    }

    private function categorySimilarity(Complaint $source, Complaint $candidate): float
    {
        $score = 0;

        if ($source->category_id && $source->category_id === $candidate->category_id) {
            $score += 45;
        }

        if ($source->department_id && $source->department_id === $candidate->department_id) {
            $score += 35;
        }

        if ($source->zone_id && $source->zone_id === $candidate->zone_id) {
            $score += 20;
        }

        return min(100, $score);
    }

    private function locationSimilarity(Complaint $source, Complaint $candidate): array
    {
        if (
            $source->latitude === null ||
            $source->longitude === null ||
            $candidate->latitude === null ||
            $candidate->longitude === null
        ) {
            $addressScore = $this->stringSimilarity(
                $this->normalize($source->address),
                $this->normalize($candidate->address)
            );

            return [
                'score' => round($addressScore, 2),
                'distance_meters' => null,
            ];
        }

        $distance = $this->distanceInMeters(
            (float) $source->latitude,
            (float) $source->longitude,
            (float) $candidate->latitude,
            (float) $candidate->longitude
        );

        if ($distance <= 50) {
            $score = 100;
        } elseif ($distance <= 100) {
            $score = 90;
        } elseif ($distance <= 250) {
            $score = 75;
        } elseif ($distance <= 500) {
            $score = 55;
        } elseif ($distance <= 1000) {
            $score = 35;
        } else {
            $score = 10;
        }

        return [
            'score' => round($score, 2),
            'distance_meters' => round($distance, 2),
        ];
    }

    private function makeReasons(
        Complaint $source,
        Complaint $candidate,
        float $textSimilarity,
        float $categorySimilarity,
        array $locationResult
    ): array {
        $reasons = [];

        if ($textSimilarity >= 70) {
            $reasons[] = 'Very similar title/description text';
        } elseif ($textSimilarity >= 50) {
            $reasons[] = 'Moderately similar title/description text';
        }

        if ($source->category_id && $source->category_id === $candidate->category_id) {
            $reasons[] = 'Same complaint category';
        }

        if ($source->department_id && $source->department_id === $candidate->department_id) {
            $reasons[] = 'Same responsible department';
        }

        if ($source->zone_id && $source->zone_id === $candidate->zone_id) {
            $reasons[] = 'Same zone';
        }

        if ($locationResult['distance_meters'] !== null) {
            if ($locationResult['distance_meters'] <= 100) {
                $reasons[] = 'Very close complaint location';
            } elseif ($locationResult['distance_meters'] <= 500) {
                $reasons[] = 'Nearby complaint location';
            }
        } elseif ($locationResult['score'] >= 50) {
            $reasons[] = 'Similar address/location text';
        }

        if ($categorySimilarity >= 80) {
            $reasons[] = 'Strong category-department-zone match';
        }

        if (count($reasons) === 0) {
            $reasons[] = 'General similarity detected by AI duplicate logic';
        }

        return array_values(array_unique($reasons));
    }

    private function stringSimilarity(string $first, string $second): float
    {
        if ($first === '' || $second === '') {
            return 0;
        }

        similar_text($first, $second, $percent);

        return round((float) $percent, 2);
    }

    private function tokenOverlapScore(string $first, string $second): float
    {
        $firstTokens = $this->importantTokens($first);
        $secondTokens = $this->importantTokens($second);

        if ($firstTokens->isEmpty() || $secondTokens->isEmpty()) {
            return 0;
        }

        $intersection = $firstTokens->intersect($secondTokens)->count();
        $union = $firstTokens->merge($secondTokens)->unique()->count();

        if ($union === 0) {
            return 0;
        }

        return round(($intersection / $union) * 100, 2);
    }

    private function importantTokens(string $text): Collection
    {
        $stopWords = [
            'the',
            'a',
            'an',
            'and',
            'or',
            'is',
            'are',
            'was',
            'were',
            'has',
            'have',
            'had',
            'this',
            'that',
            'there',
            'here',
            'on',
            'in',
            'at',
            'to',
            'for',
            'of',
            'with',
            'by',
            'from',
            'our',
            'my',
            'your',
            'it',
            'so',
            'very',
            'big',
            'small',
        ];

        return collect(explode(' ', $text))
            ->map(fn (string $token) => trim($token))
            ->filter(fn (string $token) => mb_strlen($token) >= 3)
            ->reject(fn (string $token) => in_array($token, $stopWords, true))
            ->unique()
            ->values();
    }

    private function distanceInMeters(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371000;

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return $earthRadius * $angle;
    }

    private function normalize(?string $text): string
    {
        $text = mb_strtolower((string) $text);
        $text = preg_replace('/[^a-z0-9\s\-_\p{Bengali}]/u', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text ?? '');
    }
}