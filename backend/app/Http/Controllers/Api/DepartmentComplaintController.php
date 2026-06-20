<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\AssignComplaintRequest;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DepartmentComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role?->slug;

        $complaints = Complaint::query()
            ->with($this->relations())
            ->when($role === 'department_admin', function ($query) use ($user) {
                $query->where('department_id', $user->department_id);
            })
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatComplaint($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Department complaints loaded successfully.',
            'data' => [
                'complaints' => $complaints,
            ],
        ]);
    }

    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorizeDepartmentAccess($request, $complaint);

        $complaint->load($this->relations());

        return response()->json([
            'success' => true,
            'message' => 'Department complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatComplaint($complaint),
            ],
        ]);
    }

    public function officers(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role?->slug;

        $officers = User::query()
            ->where('status', 'active')
            ->whereHas('role', function ($query) {
                $query->where('slug', 'officer');
            })
            ->when($role === 'department_admin', function ($query) use ($user) {
                $query->where('department_id', $user->department_id);
            })
            ->with(['department:id,name,slug', 'zone:id,name,city,ward_number'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $officer) => [
                'id' => $officer->id,
                'name' => $officer->name,
                'email' => $officer->email,
                'phone' => $officer->phone,
                'department' => $officer->department ? [
                    'id' => $officer->department->id,
                    'name' => $officer->department->name,
                    'slug' => $officer->department->slug,
                ] : null,
                'zone' => $officer->zone ? [
                    'id' => $officer->zone->id,
                    'name' => $officer->zone->name,
                    'city' => $officer->zone->city,
                    'ward_number' => $officer->zone->ward_number,
                ] : null,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Department officers loaded successfully.',
            'data' => [
                'officers' => $officers,
            ],
        ]);
    }

    public function assign(AssignComplaintRequest $request, Complaint $complaint): JsonResponse
    {
        $this->authorizeDepartmentAccess($request, $complaint);

        $officer = User::query()
            ->where('id', $request->integer('officer_id'))
            ->where('status', 'active')
            ->whereHas('role', function ($query) {
                $query->where('slug', 'officer');
            })
            ->first();

        if (!$officer) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not an active officer.',
            ], 422);
        }

        if ((int) $officer->department_id !== (int) $complaint->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'Officer must belong to the same department as the complaint.',
            ], 422);
        }

        $oldStatus = $complaint->status;

        DB::transaction(function () use ($request, $complaint, $officer, $oldStatus) {
            $complaint->update([
                'assigned_officer_id' => $officer->id,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
                'status' => 'assigned',
            ]);

            $complaint->statusHistories()->create([
                'changed_by' => $request->user()->id,
                'old_status' => $oldStatus,
                'new_status' => 'assigned',
                'note' => $request->input('note') ?: "Complaint assigned to {$officer->name}.",
            ]);
        });

        $complaint->load($this->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint assigned to officer successfully.',
            'data' => [
                'complaint' => $this->formatComplaint($complaint),
            ],
        ]);
    }

    private function authorizeDepartmentAccess(Request $request, Complaint $complaint): void
    {
        $user = $request->user();
        $role = $user->role?->slug;

        if ($role === 'super_admin') {
            return;
        }

        if ($role === 'department_admin' && (int) $complaint->department_id === (int) $user->department_id) {
            return;
        }

        abort(response()->json([
            'success' => false,
            'message' => 'You do not have access to this department complaint.',
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
            'assignedOfficer.department:id,name,slug',
            'assignedOfficer.zone:id,name,city,ward_number',
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
                'department' => $complaint->assignedOfficer->department ? [
                    'id' => $complaint->assignedOfficer->department->id,
                    'name' => $complaint->assignedOfficer->department->name,
                    'slug' => $complaint->assignedOfficer->department->slug,
                ] : null,
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