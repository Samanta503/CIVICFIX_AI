<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintMedia;
use App\Models\ComplaintMediaAiAnalysis;
use App\Services\AiImageAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiImageAnalysisController extends Controller
{
    public function __construct(
        private AiImageAnalysisService $imageAnalysisService
    ) {
    }

    public function media(Request $request): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot access image analysis media.',
            ], 403);
        }

        $mediaQuery = ComplaintMedia::query()
            ->with([
                'complaint:id,complaint_no,title,description,address,status,priority,category_id,department_id,zone_id,citizen_id,submitted_at',
                'complaint.category:id,name,slug',
                'complaint.department:id,name,slug',
                'complaint.zone:id,name,city,ward_number',
                'complaint.citizen:id,name,email',
            ])
            ->whereHas('complaint')
            ->latest()
            ->limit(100);

        if ($request->filled('complaint_id')) {
            $mediaQuery->where('complaint_id', $request->integer('complaint_id'));
        }

        $mediaItems = $mediaQuery->get();

        $analysisByMediaId = ComplaintMediaAiAnalysis::query()
            ->with(['createdBy:id,name,email', 'reviewedBy:id,name,email'])
            ->whereIn('complaint_media_id', $mediaItems->pluck('id'))
            ->get()
            ->keyBy('complaint_media_id');

        $items = $mediaItems->map(function (ComplaintMedia $media) use ($analysisByMediaId) {
            return $this->formatMediaItem($media, $analysisByMediaId->get($media->id));
        });

        return response()->json([
            'success' => true,
            'message' => 'Image analysis media loaded successfully.',
            'data' => [
                'stats' => $this->stats(),
                'items' => $items,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot access image analysis results.',
            ], 403);
        }

        $analyses = ComplaintMediaAiAnalysis::query()
            ->with($this->analysisRelations())
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (ComplaintMediaAiAnalysis $analysis) => $this->formatAnalysis($analysis));

        return response()->json([
            'success' => true,
            'message' => 'Image analysis results loaded successfully.',
            'data' => [
                'stats' => $this->stats(),
                'analyses' => $analyses,
            ],
        ]);
    }

    public function analyzeMedia(Request $request, ComplaintMedia $media): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot run image analysis.',
            ], 403);
        }

        $media->loadMissing('complaint');

        if (!$media->complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Media complaint was not found.',
            ], 404);
        }

        $result = $this->imageAnalysisService->analyzeMedia($media);

        $analysis = ComplaintMediaAiAnalysis::updateOrCreate(
            [
                'complaint_media_id' => $media->id,
            ],
            [
                'complaint_id' => $media->complaint_id,
                'created_by' => $request->user()->id,
                'model_name' => $result['model_name'],
                'detected_issue_type' => $result['detected_issue_type'],
                'visual_severity' => $result['visual_severity'],
                'confidence_score' => $result['confidence_score'],
                'quality_score' => $result['quality_score'],
                'image_width' => $result['image_width'],
                'image_height' => $result['image_height'],
                'file_size_bytes' => $result['file_size_bytes'],
                'mime_type' => $result['mime_type'],
                'analysis_summary' => $result['analysis_summary'],
                'safety_observations' => $result['safety_observations'],
                'matched_visual_clues' => $result['matched_visual_clues'],
                'recommendations' => $result['recommendations'],
                'raw_output' => $result['raw_output'],
                'status' => 'pending',
                'review_note' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );

        $analysis->load($this->analysisRelations());

        return response()->json([
            'success' => true,
            'message' => 'Image analysis completed successfully.',
            'data' => [
                'analysis' => $this->formatAnalysis($analysis),
            ],
        ]);
    }

    public function analyzeComplaint(Request $request, Complaint $complaint): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot run image analysis.',
            ], 403);
        }

        $complaint->load(['media']);

        $saved = [];

        foreach ($complaint->media as $media) {
            $result = $this->imageAnalysisService->analyzeMedia($media);

            $analysis = ComplaintMediaAiAnalysis::updateOrCreate(
                [
                    'complaint_media_id' => $media->id,
                ],
                [
                    'complaint_id' => $complaint->id,
                    'created_by' => $request->user()->id,
                    'model_name' => $result['model_name'],
                    'detected_issue_type' => $result['detected_issue_type'],
                    'visual_severity' => $result['visual_severity'],
                    'confidence_score' => $result['confidence_score'],
                    'quality_score' => $result['quality_score'],
                    'image_width' => $result['image_width'],
                    'image_height' => $result['image_height'],
                    'file_size_bytes' => $result['file_size_bytes'],
                    'mime_type' => $result['mime_type'],
                    'analysis_summary' => $result['analysis_summary'],
                    'safety_observations' => $result['safety_observations'],
                    'matched_visual_clues' => $result['matched_visual_clues'],
                    'recommendations' => $result['recommendations'],
                    'raw_output' => $result['raw_output'],
                    'status' => 'pending',
                    'review_note' => null,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                ]
            );

            $analysis->load($this->analysisRelations());
            $saved[] = $this->formatAnalysis($analysis);
        }

        return response()->json([
            'success' => true,
            'message' => 'Complaint image analysis completed successfully.',
            'data' => [
                'complaint_id' => $complaint->id,
                'complaint_no' => $complaint->complaint_no,
                'total_media_analyzed' => count($saved),
                'analyses' => $saved,
            ],
        ]);
    }

    public function runBulkScan(Request $request): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot run bulk image analysis.',
            ], 403);
        }

        $mediaItems = ComplaintMedia::query()
            ->with('complaint')
            ->whereHas('complaint')
            ->latest()
            ->limit(50)
            ->get();

        $savedCount = 0;

        foreach ($mediaItems as $media) {
            if (!$media->complaint) {
                continue;
            }

            $result = $this->imageAnalysisService->analyzeMedia($media);

            ComplaintMediaAiAnalysis::updateOrCreate(
                [
                    'complaint_media_id' => $media->id,
                ],
                [
                    'complaint_id' => $media->complaint_id,
                    'created_by' => $request->user()->id,
                    'model_name' => $result['model_name'],
                    'detected_issue_type' => $result['detected_issue_type'],
                    'visual_severity' => $result['visual_severity'],
                    'confidence_score' => $result['confidence_score'],
                    'quality_score' => $result['quality_score'],
                    'image_width' => $result['image_width'],
                    'image_height' => $result['image_height'],
                    'file_size_bytes' => $result['file_size_bytes'],
                    'mime_type' => $result['mime_type'],
                    'analysis_summary' => $result['analysis_summary'],
                    'safety_observations' => $result['safety_observations'],
                    'matched_visual_clues' => $result['matched_visual_clues'],
                    'recommendations' => $result['recommendations'],
                    'raw_output' => $result['raw_output'],
                    'status' => 'pending',
                    'review_note' => null,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                ]
            );

            $savedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => 'Bulk image analysis completed successfully.',
            'data' => [
                'media_checked' => $mediaItems->count(),
                'analyses_saved' => $savedCount,
            ],
        ]);
    }

    public function updateStatus(
        Request $request,
        ComplaintMediaAiAnalysis $analysis
    ): JsonResponse {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot review image analysis.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,reviewed,ignored'],
            'review_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $analysis->update([
            'status' => $validated['status'],
            'review_note' => $validated['review_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $analysis->load($this->analysisRelations());

        return response()->json([
            'success' => true,
            'message' => 'Image analysis review status updated successfully.',
            'data' => [
                'analysis' => $this->formatAnalysis($analysis),
            ],
        ]);
    }

    private function canAccess(Request $request): bool
    {
        $role = $request->user()?->role?->slug;

        return in_array($role, ['super_admin', 'department_admin'], true);
    }

    private function stats(): array
    {
        return [
            'total_media' => ComplaintMedia::count(),
            'analyzed_media' => ComplaintMediaAiAnalysis::count(),
            'pending_review' => ComplaintMediaAiAnalysis::where('status', 'pending')->count(),
            'reviewed' => ComplaintMediaAiAnalysis::where('status', 'reviewed')->count(),
            'ignored' => ComplaintMediaAiAnalysis::where('status', 'ignored')->count(),
            'high_confidence' => ComplaintMediaAiAnalysis::where('confidence_score', '>=', 75)->count(),
            'critical_visual' => ComplaintMediaAiAnalysis::where('visual_severity', 'critical')->count(),
        ];
    }

    private function analysisRelations(): array
    {
        return [
            'complaint:id,complaint_no,title,description,address,status,priority,category_id,department_id,zone_id,citizen_id,submitted_at',
            'complaint.category:id,name,slug',
            'complaint.department:id,name,slug',
            'complaint.zone:id,name,city,ward_number',
            'complaint.citizen:id,name,email',
            'complaintMedia',
            'createdBy:id,name,email',
            'reviewedBy:id,name,email',
        ];
    }

    private function formatMediaItem(
        ComplaintMedia $media,
        ?ComplaintMediaAiAnalysis $analysis
    ): array {
        return [
            'id' => $media->id,
            'complaint_id' => $media->complaint_id,
            'media_type' => $this->firstAvailable($media, ['media_type', 'type']),
            'file_name' => $this->firstAvailable($media, ['original_name', 'file_name', 'filename', 'name']),
            'file_path' => $this->firstAvailable($media, ['file_path', 'path', 'storage_path', 'media_path']),
            'mime_type' => $this->firstAvailable($media, ['mime_type', 'mime', 'file_type', 'content_type']),
            'file_size' => $this->firstAvailable($media, ['file_size', 'size', 'size_bytes', 'file_size_bytes']),
            'image_url' => $this->mediaUrl($media),
            'created_at' => $media->created_at?->toISOString(),
            'complaint' => $this->formatComplaint($media->complaint),
            'analysis' => $analysis ? $this->formatAnalysis($analysis) : null,
        ];
    }

    private function formatAnalysis(ComplaintMediaAiAnalysis $analysis): array
    {
        return [
            'id' => $analysis->id,
            'complaint_id' => $analysis->complaint_id,
            'complaint_media_id' => $analysis->complaint_media_id,
            'model_name' => $analysis->model_name,
            'detected_issue_type' => $analysis->detected_issue_type,
            'visual_severity' => $analysis->visual_severity,
            'confidence_score' => $analysis->confidence_score,
            'quality_score' => $analysis->quality_score,
            'image_width' => $analysis->image_width,
            'image_height' => $analysis->image_height,
            'file_size_bytes' => $analysis->file_size_bytes,
            'mime_type' => $analysis->mime_type,
            'analysis_summary' => $analysis->analysis_summary,
            'safety_observations' => $analysis->safety_observations,
            'matched_visual_clues' => $analysis->matched_visual_clues,
            'recommendations' => $analysis->recommendations,
            'raw_output' => $analysis->raw_output,
            'status' => $analysis->status,
            'review_note' => $analysis->review_note,
            'reviewed_at' => $analysis->reviewed_at?->toISOString(),
            'created_at' => $analysis->created_at?->toISOString(),
            'updated_at' => $analysis->updated_at?->toISOString(),
            'complaint' => $this->formatComplaint($analysis->complaint),
            'media' => $analysis->complaintMedia ? [
                'id' => $analysis->complaintMedia->id,
                'image_url' => $this->mediaUrl($analysis->complaintMedia),
                'file_name' => $this->firstAvailable($analysis->complaintMedia, ['original_name', 'file_name', 'filename', 'name']),
                'file_path' => $this->firstAvailable($analysis->complaintMedia, ['file_path', 'path', 'storage_path', 'media_path']),
            ] : null,
            'created_by' => $analysis->createdBy ? [
                'id' => $analysis->createdBy->id,
                'name' => $analysis->createdBy->name,
                'email' => $analysis->createdBy->email,
            ] : null,
            'reviewed_by' => $analysis->reviewedBy ? [
                'id' => $analysis->reviewedBy->id,
                'name' => $analysis->reviewedBy->name,
                'email' => $analysis->reviewedBy->email,
            ] : null,
        ];
    }

    private function formatComplaint(?Complaint $complaint): ?array
    {
        if (!$complaint) {
            return null;
        }

        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
            'status' => $complaint->status,
            'priority' => $complaint->priority,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'citizen' => $complaint->citizen ? [
                'id' => $complaint->citizen->id,
                'name' => $complaint->citizen->name,
                'email' => $complaint->citizen->email,
            ] : null,
            'category' => $complaint->category ? [
                'id' => $complaint->category->id,
                'name' => $complaint->category->name,
                'slug' => $complaint->category->slug,
            ] : null,
            'department' => $complaint->department ? [
                'id' => $complaint->department->id,
                'name' => $complaint->department->name,
                'slug' => $complaint->department->slug,
            ] : null,
            'zone' => $complaint->zone ? [
                'id' => $complaint->zone->id,
                'name' => $complaint->zone->name,
                'city' => $complaint->zone->city,
                'ward_number' => $complaint->zone->ward_number,
            ] : null,
        ];
    }

    private function mediaUrl(ComplaintMedia $media): ?string
    {
        $directUrl = $this->firstAvailable($media, ['url', 'file_url', 'media_url']);

        if ($directUrl && Str::startsWith((string) $directUrl, ['http://', 'https://'])) {
            return (string) $directUrl;
        }

        $path = (string) $this->firstAvailable($media, [
            'file_path',
            'path',
            'storage_path',
            'media_path',
        ]);

        if ($path === '') {
            return null;
        }

        $path = trim(str_replace('\\', '/', $path));
        $path = ltrim($path, '/');

        if (Str::startsWith($path, 'http://') || Str::startsWith($path, 'https://')) {
            return $path;
        }

        if (Str::startsWith($path, 'storage/')) {
            return url($path);
        }

        if (Str::startsWith($path, 'public/')) {
            $path = Str::after($path, 'public/');
        }

        return asset('storage/' . $path);
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
}