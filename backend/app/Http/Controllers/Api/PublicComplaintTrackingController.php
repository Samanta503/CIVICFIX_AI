<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicComplaintTrackingController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'complaint_no' => ['required', 'string', 'max:50'],
        ]);

        $complaint = Complaint::query()
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'assignedOfficer:id,name,department_id,zone_id',
                'statusHistories.changedBy:id,name',
            ])
            ->where('complaint_no', $validated['complaint_no'])
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint was not found. Please check your complaint number.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Complaint tracking information loaded successfully.',
            'data' => [
                'complaint' => $this->formatPublicComplaint($complaint),
            ],
        ]);
    }

    public function show(string $complaintNo): JsonResponse
    {
        $complaint = Complaint::query()
            ->with([
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'assignedOfficer:id,name,department_id,zone_id',
                'statusHistories.changedBy:id,name',
            ])
            ->where('complaint_no', $complaintNo)
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Complaint was not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Public complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatPublicComplaint($complaint),
            ],
        ]);
    }

    private function formatPublicComplaint(Complaint $complaint): array
    {
        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
            'priority' => $complaint->priority,
            'status' => $complaint->status,
            'source' => $complaint->source,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'sla_due_at' => $complaint->sla_due_at?->toISOString(),
            'resolved_at' => $complaint->resolved_at?->toISOString(),
            'is_overdue' => $complaint->sla_due_at
                ? $complaint->sla_due_at->isPast() && !in_array($complaint->status, ['resolved', 'closed', 'rejected'], true)
                : false,

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

            'assigned_officer' => $complaint->assignedOfficer ? [
                'id' => $complaint->assignedOfficer->id,
                'name' => $complaint->assignedOfficer->name,
            ] : null,

            'timeline' => $complaint->statusHistories
                ->map(fn (ComplaintStatusHistory $history) => [
                    'id' => $history->id,
                    'old_status' => $history->old_status,
                    'new_status' => $history->new_status,
                    'note' => $history->note,
                    'changed_by' => $history->changedBy ? [
                        'id' => $history->changedBy->id,
                        'name' => $history->changedBy->name,
                    ] : null,
                    'created_at' => $history->created_at?->toISOString(),
                ])
                ->values(),
        ];
    }
}