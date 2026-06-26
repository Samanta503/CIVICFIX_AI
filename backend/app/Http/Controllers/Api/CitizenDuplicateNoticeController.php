<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintDuplicateSuggestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitizenDuplicateNoticeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notices = ComplaintDuplicateSuggestion::query()
            ->with($this->relations())
            ->where('status', 'confirmed')
            ->whereHas('sourceComplaint', function ($query) use ($request) {
                $query->where('citizen_id', $request->user()->id);
            })
            ->latest()
            ->get()
            ->map(fn (ComplaintDuplicateSuggestion $suggestion) => $this->formatNotice($suggestion));

        return response()->json([
            'success' => true,
            'message' => 'Duplicate notices loaded successfully.',
            'data' => [
                'notices' => $notices,
            ],
        ]);
    }

    public function show(Request $request, string $complaintNo): JsonResponse
    {
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

        $suggestion = ComplaintDuplicateSuggestion::query()
            ->with($this->relations())
            ->where('status', 'confirmed')
            ->where('source_complaint_id', $complaint->id)
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Duplicate notice loaded successfully.',
            'data' => [
                'notice' => $suggestion ? $this->formatNotice($suggestion) : null,
            ],
        ]);
    }

    private function relations(): array
    {
        return [
            'sourceComplaint:id,complaint_no,title,description,address,status,priority,category_id,department_id,zone_id,citizen_id,submitted_at',
            'sourceComplaint.category:id,name,slug',
            'sourceComplaint.department:id,name,slug',
            'sourceComplaint.zone:id,name,city,ward_number',

            'matchedComplaint:id,complaint_no,title,description,address,status,priority,category_id,department_id,zone_id,citizen_id,submitted_at',
            'matchedComplaint.category:id,name,slug',
            'matchedComplaint.department:id,name,slug',
            'matchedComplaint.zone:id,name,city,ward_number',

            'reviewedBy:id,name,email',
        ];
    }

    private function formatNotice(ComplaintDuplicateSuggestion $suggestion): array
    {
        return [
            'id' => $suggestion->id,
            'is_duplicate' => true,
            'status' => $suggestion->status,
            'similarity_score' => $suggestion->similarity_score,
            'text_similarity_score' => $suggestion->text_similarity_score,
            'location_similarity_score' => $suggestion->location_similarity_score,
            'category_similarity_score' => $suggestion->category_similarity_score,
            'distance_meters' => $suggestion->distance_meters,
            'matched_reasons' => $suggestion->matched_reasons,
            'review_note' => $suggestion->review_note,
            'reviewed_at' => $suggestion->reviewed_at?->toISOString(),
            'created_at' => $suggestion->created_at?->toISOString(),

            'source_complaint' => $this->formatComplaint($suggestion->sourceComplaint),
            'matched_complaint' => $this->formatComplaint($suggestion->matchedComplaint),

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