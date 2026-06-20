<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OfficerComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->where('assigned_officer_id', $request->user()->id)
            ->with($this->relations())
            ->latest('assigned_at')
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatComplaint($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Officer assigned complaints loaded successfully.',
            'data' => [
                'complaints' => $complaints,
            ],
        ]);
    }

    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorizeOfficerAccess($request, $complaint);

        $complaint->load($this->relations());

        return response()->json([
            'success' => true,
            'message' => 'Officer complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatComplaint($complaint),
            ],
        ]);
    }

    public function updateStatus(UpdateComplaintStatusRequest $request, Complaint $complaint): JsonResponse
    {
        $this->authorizeOfficerAccess($request, $complaint);

        $validated = $request->validated();
        $oldStatus = $complaint->status;
        $newStatus = $validated['status'];

        if ($oldStatus === 'resolved') {
            return response()->json([
                'success' => false,
                'message' => 'Resolved complaint status cannot be updated again by officer.',
            ], 422);
        }

        DB::transaction(function () use ($request, $complaint, $oldStatus, $newStatus, $validated) {
            $complaint->update([
                'status' => $newStatus,
                'resolved_at' => $newStatus === 'resolved' ? now() : $complaint->resolved_at,
            ]);

            $complaint->statusHistories()->create([
                'changed_by' => $request->user()->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'note' => $validated['note'] ?? "Officer updated status to {$newStatus}.",
            ]);
        });

        $complaint->load($this->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint status updated successfully.',
            'data' => [
                'complaint' => $this->formatComplaint($complaint),
            ],
        ]);
    }

    private function authorizeOfficerAccess(Request $request, Complaint $complaint): void
    {
        if ((int) $complaint->assigned_officer_id === (int) $request->user()->id) {
            return;
        }

        abort(response()->json([
            'success' => false,
            'message' => 'You do not have access to this assigned complaint.',
        ], 403));
    }

    private function relations(): array
    {
        return [
            'citizen:id,name,email,phone',
            'category:id,name,slug,default_priority,default_sla_hours',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'assignedOfficer:id,name,email,phone,department_id,zone_id',
            'assignedBy:id,name,email',
            'media:id,complaint_id,file_url,original_name,media_type',
            'statusHistories:id,complaint_id,changed_by,old_status,new_status,note,created_at',
            'statusHistories.changedBy:id,name,email',
        ];
    }

    private function formatComplaint(Complaint $complaint): array
    {
        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
            'latitude' => $complaint->latitude,
            'longitude' => $complaint->longitude,
            'priority' => $complaint->priority,
            'status' => $complaint->status,
            'source' => $complaint->source,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'sla_due_at' => $complaint->sla_due_at?->toISOString(),
            'resolved_at' => $complaint->resolved_at?->toISOString(),
            'assigned_at' => $complaint->assigned_at?->toISOString(),

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
                'default_priority' => $complaint->category->default_priority,
                'default_sla_hours' => $complaint->category->default_sla_hours,
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
                'email' => $complaint->assignedOfficer->email,
                'phone' => $complaint->assignedOfficer->phone,
            ] : null,

            'assigned_by' => $complaint->assignedBy ? [
                'id' => $complaint->assignedBy->id,
                'name' => $complaint->assignedBy->name,
                'email' => $complaint->assignedBy->email,
            ] : null,

            'media' => $complaint->media?->map(fn ($media) => [
                'id' => $media->id,
                'media_type' => $media->media_type,
                'file_url' => $media->file_url,
                'original_name' => $media->original_name,
            ])->values() ?? [],

            'status_histories' => $complaint->statusHistories?->map(fn ($history) => [
                'id' => $history->id,
                'old_status' => $history->old_status,
                'new_status' => $history->new_status,
                'note' => $history->note,
                'created_at' => $history->created_at?->toISOString(),
                'changed_by' => $history->changedBy ? [
                    'id' => $history->changedBy->id,
                    'name' => $history->changedBy->name,
                    'email' => $history->changedBy->email,
                ] : null,
            ])->values() ?? [],
        ];
    }
}