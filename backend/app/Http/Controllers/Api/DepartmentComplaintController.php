<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\AssignComplaintRequest;
use App\Models\Complaint;
use App\Models\User;
use App\Services\ComplaintFormatterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DepartmentComplaintController extends Controller
{
    public function __construct(
        private ComplaintFormatterService $formatter
    ) {
    }

    public function index(): JsonResponse
    {
        $complaints = Complaint::query()
            ->with($this->formatter->relations())
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

    public function show(Complaint $complaint): JsonResponse
    {
        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Department complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
            ],
        ]);
    }

    public function officers(): JsonResponse
    {
        $officers = User::query()
            ->where('status', 'active')
            ->whereHas('role', function ($query) {
                $query->where('slug', 'officer');
            })
            ->with([
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (User $officer) => [
                'id' => $officer->id,
                'name' => $officer->name,
                'email' => $officer->email,
                'phone' => $officer->phone,
                'status' => $officer->status,
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
            'message' => 'Officers loaded successfully.',
            'data' => [
                'officers' => $officers,
            ],
        ]);
    }

    public function assign(AssignComplaintRequest $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validated();

        $officerId = $validated['assigned_officer_id']
            ?? $validated['officer_id']
            ?? $request->input('assigned_officer_id')
            ?? $request->input('officer_id');

        if (!$officerId) {
            return response()->json([
                'success' => false,
                'message' => 'Please select an officer.',
            ], 422);
        }

        $officer = User::query()
            ->where('id', $officerId)
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

        DB::transaction(function () use ($request, $complaint, $officer, $validated) {
            $oldStatus = $complaint->status;

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
                'note' => $validated['note'] ?? "Complaint assigned to {$officer->name}.",
            ]);
        });

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint assigned successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
            ],
        ]);
    }
}