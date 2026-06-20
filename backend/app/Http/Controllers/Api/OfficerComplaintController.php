<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Services\ComplaintFormatterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OfficerComplaintController extends Controller
{
    public function __construct(
        private ComplaintFormatterService $formatter
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $complaints = Complaint::query()
            ->where('assigned_officer_id', $request->user()->id)
            ->with($this->formatter->relations())
            ->latest('assigned_at')
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatter->format($complaint));

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

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Officer complaint details loaded successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
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

        $complaint->load($this->formatter->relations());

        return response()->json([
            'success' => true,
            'message' => 'Complaint status updated successfully.',
            'data' => [
                'complaint' => $this->formatter->format($complaint),
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
}