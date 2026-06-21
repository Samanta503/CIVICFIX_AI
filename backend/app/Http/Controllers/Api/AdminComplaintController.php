<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAdminComplaintRequest;
use App\Models\Complaint;
use App\Models\User;
use App\Services\ComplaintFormatterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminComplaintController extends Controller
{
    public function __construct(
        private ComplaintFormatterService $formatter
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Complaint::query()
            ->with($this->formatter->relations());

        $this->applyFilters($query, $request);

        $complaints = $query
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatter->format($complaint));

        $statsQuery = Complaint::query();
        $this->applyFilters($statsQuery, $request);

        return response()->json([
            'success' => true,
            'message' => 'Admin complaints loaded successfully.',
            'data' => [
                'stats' => [
                    'total' => (clone $statsQuery)->count(),
                    'submitted' => (clone $statsQuery)->where('status', 'submitted')->count(),
                    'under_review' => (clone $statsQuery)->where('status', 'under_review')->count(),
                    'assigned' => (clone $statsQuery)->where('status', 'assigned')->count(),
                    'in_progress' => (clone $statsQuery)->where('status', 'in_progress')->count(),
                    'resolved' => (clone $statsQuery)->where('status', 'resolved')->count(),
                    'rejected' => (clone $statsQuery)->where('status', 'rejected')->count(),
                    'closed' => (clone $statsQuery)->where('status', 'closed')->count(),
                ],
                'complaints' => $complaints,
            ],
        ]);
    }

    public function show(Complaint $complaint): JsonResponse
    {
        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Admin complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
            ],
        ]);
    }

    public function update(UpdateAdminComplaintRequest $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validated();

        $oldStatus = $complaint->status;
        $oldOfficerId = $complaint->assigned_officer_id;

        $payload = [];

        if (array_key_exists('priority', $validated) && $validated['priority']) {
            $payload['priority'] = $validated['priority'];
        }

        if (array_key_exists('status', $validated) && $validated['status']) {
            $payload['status'] = $validated['status'];

            if ($validated['status'] === 'resolved') {
                $payload['resolved_at'] = $complaint->resolved_at ?: now();
            }

            if ($validated['status'] !== 'resolved') {
                $payload['resolved_at'] = null;
            }
        }

        if (array_key_exists('assigned_officer_id', $validated)) {
            $officerId = $validated['assigned_officer_id'];

            if ($officerId) {
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

                if (
                    $complaint->department_id &&
                    $officer->department_id &&
                    (int) $officer->department_id !== (int) $complaint->department_id
                ) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Officer must belong to the same department as the complaint.',
                    ], 422);
                }

                $payload['assigned_officer_id'] = $officer->id;
                $payload['assigned_by'] = $request->user()->id;
                $payload['assigned_at'] = now();

                if (!isset($payload['status']) && in_array($complaint->status, ['submitted', 'under_review'], true)) {
                    $payload['status'] = 'assigned';
                }
            } else {
                $payload['assigned_officer_id'] = null;
                $payload['assigned_by'] = null;
                $payload['assigned_at'] = null;
            }
        }

        if (empty($payload) && empty($validated['note'])) {
            return response()->json([
                'success' => false,
                'message' => 'No update data was provided.',
            ], 422);
        }

        DB::transaction(function () use ($request, $complaint, $payload, $validated, $oldStatus, $oldOfficerId) {
            $complaint->update($payload);

            $newStatus = $complaint->fresh()->status;
            $newOfficerId = $complaint->fresh()->assigned_officer_id;

            if ($oldStatus !== $newStatus || $oldOfficerId !== $newOfficerId || !empty($validated['note'])) {
                $complaint->statusHistories()->create([
                    'changed_by' => $request->user()->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'note' => $validated['note'] ?? $this->buildHistoryNote($oldStatus, $newStatus, $oldOfficerId, $newOfficerId),
                ]);
            }
        });

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint updated successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
            ],
        ]);
    }

    private function applyFilters($query, Request $request): void
    {
        $query
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('complaint_no', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('citizen', function ($citizenQuery) use ($search) {
                            $citizenQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->string('status'));
            })
            ->when($request->filled('priority'), function ($query) use ($request) {
                $query->where('priority', $request->string('priority'));
            })
            ->when($request->filled('department_id'), function ($query) use ($request) {
                $query->where('department_id', $request->integer('department_id'));
            })
            ->when($request->filled('category_id'), function ($query) use ($request) {
                $query->where('category_id', $request->integer('category_id'));
            })
            ->when($request->filled('zone_id'), function ($query) use ($request) {
                $query->where('zone_id', $request->integer('zone_id'));
            })
            ->when($request->filled('assigned_officer_id'), function ($query) use ($request) {
                $query->where('assigned_officer_id', $request->integer('assigned_officer_id'));
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->date('date_from'));
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->date('date_to'));
            });
    }

    private function buildHistoryNote(
        ?string $oldStatus,
        ?string $newStatus,
        ?int $oldOfficerId,
        ?int $newOfficerId
    ): string {
        if ($oldStatus !== $newStatus) {
            return "Super Admin changed status from {$oldStatus} to {$newStatus}.";
        }

        if ($oldOfficerId !== $newOfficerId) {
            return 'Super Admin updated officer assignment.';
        }

        return 'Super Admin updated complaint information.';
    }
}