<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AiMonitoringService
{
    private float $lowConfidenceLimit = 50.00;
    private float $mediumConfidenceLimit = 75.00;

    public function buildMonitoringDashboard(): array
    {
        $classificationLogs = $this->classificationLogs();
        $duplicateLogs = $this->duplicateLogs();
        $imageLogs = $this->imageLogs();

        $allLogs = collect()
            ->merge($classificationLogs)
            ->merge($duplicateLogs)
            ->merge($imageLogs)
            ->sortByDesc('created_at')
            ->values()
            ->take(100);

        return [
            'generated_at' => now()->toISOString(),
            'model_name' => 'local-ai-monitoring-v1',
            'stats' => $this->stats($classificationLogs, $duplicateLogs, $imageLogs),
            'feature_health' => $this->featureHealth(
                $classificationLogs,
                $duplicateLogs,
                $imageLogs
            ),
            'confidence_bands' => $this->confidenceBands(
                $classificationLogs,
                $duplicateLogs,
                $imageLogs
            ),
            'model_summary' => $this->modelSummary(
                $classificationLogs,
                $duplicateLogs,
                $imageLogs
            ),
            'low_confidence_items' => $this->lowConfidenceItems($allLogs),
            'review_queue' => $this->reviewQueue(),
            'activity_logs' => $allLogs->all(),
            'recommendations' => $this->recommendations(
                $classificationLogs,
                $duplicateLogs,
                $imageLogs
            ),
        ];
    }

    private function classificationLogs(): Collection
    {
        if (!Schema::hasTable('complaint_ai_predictions')) {
            return collect();
        }

        return DB::table('complaint_ai_predictions as p')
            ->leftJoin('complaints as c', 'c.id', '=', 'p.complaint_id')
            ->leftJoin('complaint_categories as cat', 'cat.id', '=', 'p.predicted_category_id')
            ->leftJoin('departments as d', 'd.id', '=', 'p.predicted_department_id')
            ->select(
                'p.id',
                'p.complaint_id',
                'c.complaint_no',
                'c.title as complaint_title',
                'c.status as complaint_status',
                'c.priority as complaint_priority',
                'p.model_name',
                'p.predicted_priority',
                'p.confidence_score',
                'p.predicted_summary',
                'p.reasoning',
                'p.created_at',
                'p.updated_at',
                'cat.name as predicted_category',
                'd.name as predicted_department'
            )
            ->latest('p.created_at')
            ->limit(150)
            ->get()
            ->map(function ($item) {
                $confidence = round((float) $item->confidence_score, 2);

                return [
                    'id' => 'classification-' . $item->id,
                    'raw_id' => (int) $item->id,
                    'feature' => 'classification',
                    'feature_label' => 'AI Complaint Classifier',
                    'event_type' => 'prediction_created',
                    'model_name' => $item->model_name ?? 'local-ai-classifier-v1',
                    'complaint_id' => $item->complaint_id ? (int) $item->complaint_id : null,
                    'complaint_no' => $item->complaint_no,
                    'complaint_title' => $item->complaint_title,
                    'complaint_status' => $item->complaint_status,
                    'complaint_priority' => $item->complaint_priority,
                    'result_title' => $item->predicted_category ?? 'Category prediction',
                    'result_subtitle' => $item->predicted_department ?? 'Department prediction',
                    'confidence_score' => $confidence,
                    'risk_level' => $this->confidenceRisk($confidence),
                    'status' => $this->confidenceStatus($confidence),
                    'summary' => $item->predicted_summary
                        ?: "Predicted priority: {$item->predicted_priority}.",
                    'details' => [
                        'predicted_priority' => $item->predicted_priority,
                        'predicted_category' => $item->predicted_category,
                        'predicted_department' => $item->predicted_department,
                        'reasoning' => $item->reasoning,
                    ],
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });
    }

    private function duplicateLogs(): Collection
    {
        if (!Schema::hasTable('complaint_duplicate_suggestions')) {
            return collect();
        }

        return DB::table('complaint_duplicate_suggestions as ds')
            ->leftJoin('complaints as source', 'source.id', '=', 'ds.source_complaint_id')
            ->leftJoin('complaints as matched', 'matched.id', '=', 'ds.matched_complaint_id')
            ->select(
                'ds.id',
                'ds.source_complaint_id',
                'ds.matched_complaint_id',
                'ds.model_name',
                'ds.similarity_score',
                'ds.text_similarity_score',
                'ds.location_similarity_score',
                'ds.category_similarity_score',
                'ds.distance_meters',
                'ds.status',
                'ds.review_note',
                'ds.reviewed_at',
                'ds.created_at',
                'ds.updated_at',
                'source.complaint_no as source_complaint_no',
                'source.title as source_title',
                'source.status as source_status',
                'source.priority as source_priority',
                'matched.complaint_no as matched_complaint_no',
                'matched.title as matched_title'
            )
            ->latest('ds.created_at')
            ->limit(150)
            ->get()
            ->map(function ($item) {
                $confidence = round((float) $item->similarity_score, 2);

                return [
                    'id' => 'duplicate-' . $item->id,
                    'raw_id' => (int) $item->id,
                    'feature' => 'duplicate_detection',
                    'feature_label' => 'AI Duplicate Detection',
                    'event_type' => 'duplicate_suggestion_created',
                    'model_name' => $item->model_name ?? 'local-duplicate-detector-v1',
                    'complaint_id' => $item->source_complaint_id ? (int) $item->source_complaint_id : null,
                    'complaint_no' => $item->source_complaint_no,
                    'complaint_title' => $item->source_title,
                    'complaint_status' => $item->source_status,
                    'complaint_priority' => $item->source_priority,
                    'result_title' => 'Possible duplicate complaint',
                    'result_subtitle' => $item->matched_complaint_no
                        ? "Matched with {$item->matched_complaint_no}"
                        : 'Matched complaint not found',
                    'confidence_score' => $confidence,
                    'risk_level' => $this->confidenceRisk($confidence),
                    'status' => $item->status,
                    'summary' => "Similarity score {$confidence}%. Current review status: {$item->status}.",
                    'details' => [
                        'matched_complaint_id' => $item->matched_complaint_id,
                        'matched_complaint_no' => $item->matched_complaint_no,
                        'matched_title' => $item->matched_title,
                        'text_similarity_score' => round((float) $item->text_similarity_score, 2),
                        'location_similarity_score' => round((float) $item->location_similarity_score, 2),
                        'category_similarity_score' => round((float) $item->category_similarity_score, 2),
                        'distance_meters' => $item->distance_meters ? round((float) $item->distance_meters, 2) : null,
                        'review_note' => $item->review_note,
                        'reviewed_at' => $item->reviewed_at,
                    ],
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });
    }

    private function imageLogs(): Collection
    {
        if (!Schema::hasTable('complaint_media_ai_analyses')) {
            return collect();
        }

        return DB::table('complaint_media_ai_analyses as a')
            ->leftJoin('complaints as c', 'c.id', '=', 'a.complaint_id')
            ->leftJoin('complaint_media as m', 'm.id', '=', 'a.complaint_media_id')
            ->select(
                'a.id',
                'a.complaint_id',
                'a.complaint_media_id',
                'a.model_name',
                'a.detected_issue_type',
                'a.visual_severity',
                'a.confidence_score',
                'a.quality_score',
                'a.image_width',
                'a.image_height',
                'a.mime_type',
                'a.status',
                'a.analysis_summary',
                'a.safety_observations',
                'a.review_note',
                'a.reviewed_at',
                'a.created_at',
                'a.updated_at',
                'c.complaint_no',
                'c.title as complaint_title',
                'c.status as complaint_status',
                'c.priority as complaint_priority',
                'm.file_path'
            )
            ->latest('a.created_at')
            ->limit(150)
            ->get()
            ->map(function ($item) {
                $confidence = round((float) $item->confidence_score, 2);

                return [
                    'id' => 'image-' . $item->id,
                    'raw_id' => (int) $item->id,
                    'feature' => 'image_analysis',
                    'feature_label' => 'AI Image Analysis',
                    'event_type' => 'image_analysis_created',
                    'model_name' => $item->model_name ?? 'local-image-analyzer-v1',
                    'complaint_id' => $item->complaint_id ? (int) $item->complaint_id : null,
                    'complaint_no' => $item->complaint_no,
                    'complaint_title' => $item->complaint_title,
                    'complaint_status' => $item->complaint_status,
                    'complaint_priority' => $item->complaint_priority,
                    'result_title' => $this->formatIssueType($item->detected_issue_type),
                    'result_subtitle' => "Visual severity: {$item->visual_severity}",
                    'confidence_score' => $confidence,
                    'risk_level' => $this->confidenceRisk($confidence),
                    'status' => $item->status,
                    'summary' => $item->analysis_summary
                        ?: "Image confidence {$confidence}% and quality score {$item->quality_score}%.",
                    'details' => [
                        'complaint_media_id' => $item->complaint_media_id,
                        'detected_issue_type' => $item->detected_issue_type,
                        'visual_severity' => $item->visual_severity,
                        'quality_score' => round((float) $item->quality_score, 2),
                        'image_width' => $item->image_width,
                        'image_height' => $item->image_height,
                        'mime_type' => $item->mime_type,
                        'safety_observations' => $item->safety_observations,
                        'review_note' => $item->review_note,
                        'reviewed_at' => $item->reviewed_at,
                        'file_path' => $item->file_path,
                    ],
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });
    }

    private function stats(Collection $classification, Collection $duplicates, Collection $images): array
    {
        $all = collect()->merge($classification)->merge($duplicates)->merge($images);

        $low = $all->filter(fn (array $item) => $item['confidence_score'] < $this->lowConfidenceLimit)->count();

        $medium = $all->filter(fn (array $item) =>
            $item['confidence_score'] >= $this->lowConfidenceLimit &&
            $item['confidence_score'] < $this->mediumConfidenceLimit
        )->count();

        $high = $all->filter(fn (array $item) => $item['confidence_score'] >= $this->mediumConfidenceLimit)->count();

        return [
            'total_ai_logs' => $all->count(),
            'classification_logs' => $classification->count(),
            'duplicate_logs' => $duplicates->count(),
            'image_logs' => $images->count(),
            'low_confidence_total' => $low,
            'medium_confidence_total' => $medium,
            'high_confidence_total' => $high,
            'average_confidence' => $this->averageConfidence($all),
            'pending_duplicate_reviews' => $duplicates->where('status', 'pending')->count(),
            'pending_image_reviews' => $images->where('status', 'pending')->count(),
            'critical_image_findings' => $images->filter(fn (array $item) =>
                ($item['details']['visual_severity'] ?? null) === 'critical'
            )->count(),
        ];
    }

    private function featureHealth(
        Collection $classification,
        Collection $duplicates,
        Collection $images
    ): array {
        return [
            $this->featureHealthItem(
                'classification',
                'AI Complaint Classifier',
                $classification,
                'Creates category, department, and priority predictions.'
            ),
            $this->featureHealthItem(
                'duplicate_detection',
                'AI Duplicate Detection',
                $duplicates,
                'Finds repeated complaints using similarity logic.'
            ),
            $this->featureHealthItem(
                'image_analysis',
                'AI Image Analysis',
                $images,
                'Analyzes complaint media using metadata and context.'
            ),
        ];
    }

    private function featureHealthItem(
        string $feature,
        string $label,
        Collection $logs,
        string $description
    ): array {
        $average = $this->averageConfidence($logs);
        $low = $logs->filter(fn (array $item) => $item['confidence_score'] < $this->lowConfidenceLimit)->count();
        $pending = $logs->filter(fn (array $item) => in_array($item['status'], ['pending'], true))->count();

        if ($logs->count() === 0) {
            $health = 'inactive';
            $message = 'No AI output has been generated yet.';
        } elseif ($average < 50 || $low >= 5) {
            $health = 'warning';
            $message = 'Low confidence items need review.';
        } elseif ($pending >= 5) {
            $health = 'needs_review';
            $message = 'Many AI results are waiting for review.';
        } else {
            $health = 'healthy';
            $message = 'AI feature is working normally.';
        }

        return [
            'feature' => $feature,
            'label' => $label,
            'description' => $description,
            'total_logs' => $logs->count(),
            'average_confidence' => $average,
            'low_confidence_total' => $low,
            'pending_review_total' => $pending,
            'health_status' => $health,
            'message' => $message,
        ];
    }

    private function confidenceBands(
        Collection $classification,
        Collection $duplicates,
        Collection $images
    ): array {
        return [
            $this->confidenceBandItem('classification', 'AI Complaint Classifier', $classification),
            $this->confidenceBandItem('duplicate_detection', 'AI Duplicate Detection', $duplicates),
            $this->confidenceBandItem('image_analysis', 'AI Image Analysis', $images),
        ];
    }

    private function confidenceBandItem(string $feature, string $label, Collection $logs): array
    {
        return [
            'feature' => $feature,
            'label' => $label,
            'low' => $logs->filter(fn (array $item) => $item['confidence_score'] < 50)->count(),
            'medium' => $logs->filter(fn (array $item) =>
                $item['confidence_score'] >= 50 &&
                $item['confidence_score'] < 75
            )->count(),
            'high' => $logs->filter(fn (array $item) => $item['confidence_score'] >= 75)->count(),
            'average_confidence' => $this->averageConfidence($logs),
        ];
    }

  private function modelSummary(
    Collection $classification,
    Collection $duplicates,
    Collection $images
): array {
    return collect()
        ->merge($classification)
        ->merge($duplicates)
        ->merge($images)
        ->groupBy('model_name')
        ->map(function (Collection $items, string $modelName) {
            return [
                'model_name' => $modelName,
                'total_logs' => $items->count(),
                'average_confidence' => $this->averageConfidence($items),
                'low_confidence_total' => $items
                    ->filter(fn (array $item) => $item['confidence_score'] < $this->lowConfidenceLimit)
                    ->count(),
                'latest_activity_at' => $items->max('created_at'),
            ];
        })
        ->sortByDesc('total_logs')
        ->values()
        ->all();
}

    private function lowConfidenceItems(Collection $logs): array
    {
        return $logs
            ->filter(fn (array $item) => $item['confidence_score'] < $this->lowConfidenceLimit)
            ->sortBy('confidence_score')
            ->values()
            ->take(20)
            ->all();
    }

    private function reviewQueue(): array
    {
        $queue = collect();

        if (Schema::hasTable('complaint_duplicate_suggestions')) {
            $duplicateQueue = DB::table('complaint_duplicate_suggestions as ds')
                ->leftJoin('complaints as c', 'c.id', '=', 'ds.source_complaint_id')
                ->where('ds.status', 'pending')
                ->select(
                    'ds.id',
                    'c.complaint_no',
                    'c.title',
                    'ds.similarity_score',
                    'ds.created_at'
                )
                ->latest('ds.created_at')
                ->limit(20)
                ->get()
                ->map(fn ($item) => [
                    'id' => 'duplicate-review-' . $item->id,
                    'feature' => 'duplicate_detection',
                    'title' => 'Duplicate suggestion pending review',
                    'complaint_no' => $item->complaint_no,
                    'complaint_title' => $item->title,
                    'score' => round((float) $item->similarity_score, 2),
                    'created_at' => $item->created_at,
                ]);

            $queue = $queue->merge($duplicateQueue);
        }

        if (Schema::hasTable('complaint_media_ai_analyses')) {
            $imageQueue = DB::table('complaint_media_ai_analyses as a')
                ->leftJoin('complaints as c', 'c.id', '=', 'a.complaint_id')
                ->where('a.status', 'pending')
                ->select(
                    'a.id',
                    'c.complaint_no',
                    'c.title',
                    'a.confidence_score',
                    'a.visual_severity',
                    'a.created_at'
                )
                ->latest('a.created_at')
                ->limit(20)
                ->get()
                ->map(fn ($item) => [
                    'id' => 'image-review-' . $item->id,
                    'feature' => 'image_analysis',
                    'title' => 'Image analysis pending review',
                    'complaint_no' => $item->complaint_no,
                    'complaint_title' => $item->title,
                    'score' => round((float) $item->confidence_score, 2),
                    'severity' => $item->visual_severity,
                    'created_at' => $item->created_at,
                ]);

            $queue = $queue->merge($imageQueue);
        }

        return $queue
            ->sortByDesc('created_at')
            ->values()
            ->take(30)
            ->all();
    }

    private function recommendations(
        Collection $classification,
        Collection $duplicates,
        Collection $images
    ): array {
        $recommendations = [];

        $all = collect()->merge($classification)->merge($duplicates)->merge($images);
        $lowConfidence = $all->filter(fn (array $item) => $item['confidence_score'] < $this->lowConfidenceLimit)->count();

        if ($lowConfidence > 0) {
            $recommendations[] = [
                'priority' => 'high',
                'title' => 'Review low-confidence AI outputs',
                'description' => "{$lowConfidence} AI result(s) have confidence below {$this->lowConfidenceLimit}%.",
                'action' => 'Open the low-confidence list and manually verify these results.',
            ];
        }

        $pendingDuplicates = $duplicates->where('status', 'pending')->count();

        if ($pendingDuplicates > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'title' => 'Review pending duplicate suggestions',
                'description' => "{$pendingDuplicates} duplicate suggestion(s) are still pending.",
                'action' => 'Open AI Duplicate Detection and confirm, reject, or ignore suggestions.',
            ];
        }

        $pendingImages = $images->where('status', 'pending')->count();

        if ($pendingImages > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'title' => 'Review pending image analysis results',
                'description' => "{$pendingImages} image analysis result(s) are waiting for admin review.",
                'action' => 'Open AI Image Analysis and mark results as reviewed or ignored.',
            ];
        }

        if ($all->count() === 0) {
            $recommendations[] = [
                'priority' => 'low',
                'title' => 'Generate AI outputs first',
                'description' => 'No AI logs are available yet.',
                'action' => 'Run AI classifier, duplicate detection, and image analysis first.',
            ];
        }

        if (count($recommendations) === 0) {
            $recommendations[] = [
                'priority' => 'low',
                'title' => 'AI monitoring looks stable',
                'description' => 'No urgent AI monitoring issue was detected.',
                'action' => 'Continue regular monitoring.',
            ];
        }

        return $recommendations;
    }

    private function averageConfidence(Collection $items): float
    {
        if ($items->count() === 0) {
            return 0;
        }

        return round((float) $items->avg('confidence_score'), 2);
    }

    private function confidenceRisk(float $confidence): string
    {
        if ($confidence < 50) {
            return 'high';
        }

        if ($confidence < 75) {
            return 'medium';
        }

        return 'low';
    }

    private function confidenceStatus(float $confidence): string
    {
        if ($confidence < 50) {
            return 'low_confidence';
        }

        if ($confidence < 75) {
            return 'medium_confidence';
        }

        return 'high_confidence';
    }

    private function formatIssueType(?string $value): string
    {
        if (!$value) {
            return 'Unknown issue type';
        }

        return collect(explode('_', $value))
            ->map(fn (string $part) => ucfirst($part))
            ->implode(' ');
    }
}