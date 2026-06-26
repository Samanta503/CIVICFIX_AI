<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintDuplicateSuggestion;
use App\Models\NotificationLog;
use App\Services\AiDuplicateComplaintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AiDuplicateComplaintController extends Controller
{
    public function __construct(
        private AiDuplicateComplaintService $duplicateService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $suggestions = ComplaintDuplicateSuggestion::query()
            ->with($this->relations())
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->get()
            ->map(fn (ComplaintDuplicateSuggestion $suggestion) => $this->formatSuggestion($suggestion));

        $stats = [
            'total' => ComplaintDuplicateSuggestion::count(),
            'pending' => ComplaintDuplicateSuggestion::where('status', 'pending')->count(),
            'confirmed' => ComplaintDuplicateSuggestion::where('status', 'confirmed')->count(),
            'rejected' => ComplaintDuplicateSuggestion::where('status', 'rejected')->count(),
            'ignored' => ComplaintDuplicateSuggestion::where('status', 'ignored')->count(),
            'high_similarity' => ComplaintDuplicateSuggestion::where('similarity_score', '>=', 75)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Duplicate suggestions loaded successfully.',
            'data' => [
                'stats' => $stats,
                'suggestions' => $suggestions,
            ],
        ]);
    }

    public function scanComplaint(Request $request, Complaint $complaint): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot run duplicate detection.',
            ], 403);
        }

        $analysis = $this->duplicateService->analyzeComplaint($complaint);

        $storedSuggestions = [];

        foreach ($analysis['matches'] as $match) {
            $suggestion = ComplaintDuplicateSuggestion::updateOrCreate(
                [
                    'source_complaint_id' => $complaint->id,
                    'matched_complaint_id' => $match['matched_complaint_id'],
                ],
                [
                    'created_by' => $request->user()->id,
                    'model_name' => $analysis['model_name'],
                    'similarity_score' => $match['similarity_score'],
                    'text_similarity_score' => $match['text_similarity_score'],
                    'location_similarity_score' => $match['location_similarity_score'],
                    'category_similarity_score' => $match['category_similarity_score'],
                    'distance_meters' => $match['distance_meters'],
                    'matched_reasons' => $match['matched_reasons'],
                    'raw_output' => $match['raw_output'],
                    'status' => 'pending',
                    'review_note' => null,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                ]
            );

            $suggestion->load($this->relations());

            $storedSuggestions[] = $this->formatSuggestion($suggestion);
        }

        return response()->json([
            'success' => true,
            'message' => 'Duplicate detection completed successfully.',
            'data' => [
                'analysis' => $analysis,
                'suggestions' => $storedSuggestions,
            ],
        ]);
    }

    public function runBulkScan(Request $request): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot run duplicate detection.',
            ], 403);
        }

        $complaints = Complaint::query()
            ->latest()
            ->limit(50)
            ->get();

        $totalStored = 0;

        foreach ($complaints as $complaint) {
            $analysis = $this->duplicateService->analyzeComplaint($complaint);

            foreach ($analysis['matches'] as $match) {
                ComplaintDuplicateSuggestion::updateOrCreate(
                    [
                        'source_complaint_id' => $complaint->id,
                        'matched_complaint_id' => $match['matched_complaint_id'],
                    ],
                    [
                        'created_by' => $request->user()->id,
                        'model_name' => $analysis['model_name'],
                        'similarity_score' => $match['similarity_score'],
                        'text_similarity_score' => $match['text_similarity_score'],
                        'location_similarity_score' => $match['location_similarity_score'],
                        'category_similarity_score' => $match['category_similarity_score'],
                        'distance_meters' => $match['distance_meters'],
                        'matched_reasons' => $match['matched_reasons'],
                        'raw_output' => $match['raw_output'],
                        'status' => 'pending',
                        'review_note' => null,
                        'reviewed_by' => null,
                        'reviewed_at' => null,
                    ]
                );

                $totalStored++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Bulk duplicate detection completed successfully.',
            'data' => [
                'complaints_checked' => $complaints->count(),
                'suggestions_saved' => $totalStored,
            ],
        ]);
    }

    public function updateStatus(
        Request $request,
        ComplaintDuplicateSuggestion $suggestion
    ): JsonResponse {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot review duplicate suggestions.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,rejected,ignored'],
            'review_note' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $suggestion, $validated) {
            $suggestion->update([
                'status' => $validated['status'],
                'review_note' => $validated['review_note'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            if ($validated['status'] === 'confirmed') {
                $this->handleConfirmedDuplicate($request, $suggestion->fresh());
            }
        });

        $suggestion->load($this->relations());

        return response()->json([
            'success' => true,
            'message' => 'Duplicate suggestion status updated successfully.',
            'data' => [
                'suggestion' => $this->formatSuggestion($suggestion),
            ],
        ]);
    }

    private function handleConfirmedDuplicate(
        Request $request,
        ComplaintDuplicateSuggestion $suggestion
    ): void {
        $suggestion->load([
            'sourceComplaint.citizen:id,name,email',
            'matchedComplaint:id,complaint_no,title,status,priority',
            'reviewedBy:id,name,email',
        ]);

        $sourceComplaint = $suggestion->sourceComplaint;
        $matchedComplaint = $suggestion->matchedComplaint;

        if (!$sourceComplaint || !$sourceComplaint->citizen) {
            return;
        }

        $matchedNo = $matchedComplaint?->complaint_no ?? 'another complaint';

        $note = $suggestion->review_note
            ?: "This complaint was confirmed as a duplicate of {$matchedNo}.";

        $sourceComplaint->statusHistories()->create([
            'changed_by' => $request->user()->id,
            'old_status' => $sourceComplaint->status,
            'new_status' => $sourceComplaint->status,
            'note' => "Duplicate confirmed. {$note}",
        ]);

        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');

        NotificationLog::create([
            'user_id' => $sourceComplaint->citizen_id,
            'sender_id' => $request->user()->id,
            'complaint_id' => $sourceComplaint->id,
            'type' => 'duplicate_complaint_confirmed',
            'channel' => 'database',
            'title' => 'Your complaint was marked as duplicate',
            'message' => "Your complaint {$sourceComplaint->complaint_no} was confirmed as a duplicate of {$matchedNo}. Your issue is already being tracked under the matched complaint.",
            'action_url' => "{$frontendUrl}/citizen/complaints/{$sourceComplaint->complaint_no}",
            'email_to' => $sourceComplaint->citizen->email,
            'email_status' => 'skipped',
            'sent_at' => now(),
            'meta' => [
                'duplicate_suggestion_id' => $suggestion->id,
                'source_complaint_id' => $sourceComplaint->id,
                'source_complaint_no' => $sourceComplaint->complaint_no,
                'matched_complaint_id' => $matchedComplaint?->id,
                'matched_complaint_no' => $matchedComplaint?->complaint_no,
                'similarity_score' => $suggestion->similarity_score,
            ],
        ]);
    }

    private function canAccess(Request $request): bool
    {
        $role = $request->user()?->role?->slug;

        return in_array($role, ['super_admin', 'department_admin'], true);
    }

    private function relations(): array
    {
        return [
            'sourceComplaint:id,complaint_no,title,description,address,status,priority,category_id,department_id,zone_id,citizen_id,submitted_at',
            'sourceComplaint.citizen:id,name,email,phone',
            'sourceComplaint.category:id,name,slug',
            'sourceComplaint.department:id,name,slug',
            'sourceComplaint.zone:id,name,city,ward_number',

            'matchedComplaint:id,complaint_no,title,description,address,status,priority,category_id,department_id,zone_id,citizen_id,submitted_at',
            'matchedComplaint.citizen:id,name,email,phone',
            'matchedComplaint.category:id,name,slug',
            'matchedComplaint.department:id,name,slug',
            'matchedComplaint.zone:id,name,city,ward_number',

            'createdBy:id,name,email',
            'reviewedBy:id,name,email',
        ];
    }

    private function formatSuggestion(ComplaintDuplicateSuggestion $suggestion): array
    {
        return [
            'id' => $suggestion->id,
            'model_name' => $suggestion->model_name,
            'similarity_score' => $suggestion->similarity_score,
            'text_similarity_score' => $suggestion->text_similarity_score,
            'location_similarity_score' => $suggestion->location_similarity_score,
            'category_similarity_score' => $suggestion->category_similarity_score,
            'distance_meters' => $suggestion->distance_meters,
            'matched_reasons' => $suggestion->matched_reasons,
            'raw_output' => $suggestion->raw_output,
            'status' => $suggestion->status,
            'review_note' => $suggestion->review_note,
            'reviewed_at' => $suggestion->reviewed_at?->toISOString(),
            'created_at' => $suggestion->created_at?->toISOString(),
            'updated_at' => $suggestion->updated_at?->toISOString(),

            'source_complaint' => $this->formatComplaint($suggestion->sourceComplaint),
            'matched_complaint' => $this->formatComplaint($suggestion->matchedComplaint),

            'created_by' => $suggestion->createdBy ? [
                'id' => $suggestion->createdBy->id,
                'name' => $suggestion->createdBy->name,
                'email' => $suggestion->createdBy->email,
            ] : null,

            'reviewed_by' => $suggestion->reviewedBy ? [
                'id' => $suggestion->reviewedBy->id,
                'name' => $suggestion->reviewedBy->name,
                'email' => $suggestion->reviewedBy->email,
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
                'phone' => $complaint->citizen->phone,
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
}