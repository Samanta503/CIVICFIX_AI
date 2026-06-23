<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Citizen\StoreComplaintFeedbackRequest;
use App\Models\Complaint;
use App\Models\ComplaintFeedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenFeedbackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->where('citizen_id', $request->user()->id)
            ->whereIn('status', ['resolved', 'closed'])
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'feedback',
            ])
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatComplaintFeedbackItem($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Citizen feedback items loaded successfully.',
            'data' => [
                'items' => $complaints,
            ],
        ]);
    }

    public function context(Request $request, string $complaintNo): JsonResponse
    {
        $complaint = Complaint::query()
            ->where('complaint_no', $complaintNo)
            ->where('citizen_id', $request->user()->id)
            ->whereIn('status', ['resolved', 'closed'])
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'feedback',
            ])
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Resolved complaint was not found for feedback.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Feedback context loaded successfully.',
            'data' => [
                'item' => $this->formatComplaintFeedbackItem($complaint),
            ],
        ]);
    }

    public function store(
        StoreComplaintFeedbackRequest $request,
        string $complaintNo
    ): JsonResponse {
        $complaint = Complaint::query()
            ->where('complaint_no', $complaintNo)
            ->where('citizen_id', $request->user()->id)
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint was not found.',
            ], 404);
        }

        if (!in_array($complaint->status, ['resolved', 'closed'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback can only be submitted after the complaint is resolved.',
            ], 422);
        }

        $existingFeedback = ComplaintFeedback::query()
            ->where('complaint_id', $complaint->id)
            ->where('citizen_id', $request->user()->id)
            ->first();

        if ($existingFeedback) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted feedback for this complaint.',
            ], 422);
        }

        $validated = $request->validated();

        $feedback = ComplaintFeedback::create([
            'complaint_id' => $complaint->id,
            'citizen_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'response_quality' => $validated['response_quality'] ?? null,
            'issue_resolved' => $validated['issue_resolved'],
            'comment' => $validated['comment'] ?? null,
            'submitted_at' => now(),
        ]);

        $complaint->load([
            'category:id,name,slug',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'feedback',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully.',
            'data' => [
                'feedback' => $this->formatFeedback($feedback),
                'item' => $this->formatComplaintFeedbackItem($complaint),
            ],
        ], 201);
    }

    private function formatComplaintFeedbackItem(Complaint $complaint): array
    {
        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
            'status' => $complaint->status,
            'priority' => $complaint->priority,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'resolved_at' => $complaint->resolved_at?->toISOString(),

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

            'feedback' => $complaint->feedback
                ? $this->formatFeedback($complaint->feedback)
                : null,
        ];
    }

    private function formatFeedback(ComplaintFeedback $feedback): array
    {
        return [
            'id' => $feedback->id,
            'complaint_id' => $feedback->complaint_id,
            'citizen_id' => $feedback->citizen_id,
            'rating' => $feedback->rating,
            'response_quality' => $feedback->response_quality,
            'issue_resolved' => $feedback->issue_resolved,
            'comment' => $feedback->comment,
            'submitted_at' => $feedback->submitted_at?->toISOString(),
            'created_at' => $feedback->created_at?->toISOString(),
        ];
    }
}