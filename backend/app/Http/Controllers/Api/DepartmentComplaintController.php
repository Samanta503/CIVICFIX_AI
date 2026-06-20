<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\AssignComplaintRequest;
use App\Models\Complaint;
use App\Models\User;
use App\Services\ComplaintFormatterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DepartmentComplaintController extends Controller
{
    public function __construct(
        private ComplaintFormatterService $formatter
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role?->slug;

        $complaints = Complaint::query()
            ->with($this->formatter->relations())
            ->when($role === 'department_admin', function ($query) use ($user) {
                $query->where('department_id', $user->department_id);
            })
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatter->format($complaint));

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

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Department complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
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

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint assigned to officer successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
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
}