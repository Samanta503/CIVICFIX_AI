<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sla\ManualEscalateRequest;
use App\Http\Requests\Sla\ResolveEscalationRequest;
use App\Models\Complaint;
use App\Models\SlaEscalation;
use App\Services\SlaEscalationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentSlaController extends Controller
{
    public function __construct(
        private SlaEscalationService $slaService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = $this->slaService->alertQuery()
            ->where('department_id', $user->department_id);

        $filters = $request->only([
            'type',
            'priority',
            'status',
        ]);

        $filters['department_id'] = $user->department_id;

        $this->slaService->applyAlertFilters($query, $filters);

        $alerts = $query
            ->latest('sla_due_at')
            ->get()
            ->map(fn (Complaint $complaint) => $this->slaService->formatAlert($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Department SLA alerts loaded successfully.',
            'data' => [
                'stats' => $this->slaService->stats($user->department_id),
                'alerts' => $alerts,
            ],
        ]);
    }

    public function escalate(
        ManualEscalateRequest $request,
        Complaint $complaint
    ): JsonResponse {
        $user = $request->user();

        if ((int) $complaint->department_id !== (int) $user->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot escalate complaints from another department.',
            ], 403);
        }

        $escalation = $this->slaService->escalate(
            complaint: $complaint,
            actor: $user,
            reason: $request->input('reason', 'manual_department_escalation'),
            note: $request->input('note')
        );

        return response()->json([
            'success' => true,
            'message' => 'Department complaint escalated successfully.',
            'data' => [
                'escalation' => $escalation,
            ],
        ]);
    }

    public function resolve(
        ResolveEscalationRequest $request,
        SlaEscalation $escalation
    ): JsonResponse {
        $user = $request->user();
        $complaint = $escalation->complaint;

        if (!$complaint || (int) $complaint->department_id !== (int) $user->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot resolve escalations from another department.',
            ], 403);
        }

        $resolved = $this->slaService->resolveEscalation(
            escalation: $escalation,
            actor: $user,
            note: $request->input('note')
        );

        return response()->json([
            'success' => true,
            'message' => 'Department SLA escalation resolved successfully.',
            'data' => [
                'escalation' => $resolved,
            ],
        ]);
    }
}