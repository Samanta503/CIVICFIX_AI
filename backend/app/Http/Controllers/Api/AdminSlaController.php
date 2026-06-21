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

class AdminSlaController extends Controller
{
    public function __construct(
        private SlaEscalationService $slaService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->slaService->alertQuery();

        $this->slaService->applyAlertFilters($query, $request->only([
            'type',
            'department_id',
            'priority',
            'status',
        ]));

        $alerts = $query
            ->latest('sla_due_at')
            ->get()
            ->map(fn (Complaint $complaint) => $this->slaService->formatAlert($complaint));

        return response()->json([
            'success' => true,
            'message' => 'Admin SLA alerts loaded successfully.',
            'data' => [
                'stats' => $this->slaService->stats(),
                'alerts' => $alerts,
            ],
        ]);
    }

    public function runCheck(Request $request): JsonResponse
    {
        $created = $this->slaService->autoEscalateOverdue($request->user());

        return response()->json([
            'success' => true,
            'message' => 'SLA check completed successfully.',
            'data' => [
                'created_escalations' => $created,
            ],
        ]);
    }

    public function escalate(
        ManualEscalateRequest $request,
        Complaint $complaint
    ): JsonResponse {
        $escalation = $this->slaService->escalate(
            complaint: $complaint,
            actor: $request->user(),
            reason: $request->input('reason', 'manual_admin_escalation'),
            note: $request->input('note')
        );

        $complaint->load([
            'citizen:id,name,email,phone',
            'category:id,name,slug,default_priority,default_sla_hours',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'assignedOfficer:id,name,email,phone,department_id,zone_id',
            'slaEscalations.escalatedBy:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Complaint escalated successfully.',
            'data' => [
                'escalation' => $escalation,
                'alert' => $this->slaService->formatAlert($complaint),
            ],
        ]);
    }

    public function resolve(
        ResolveEscalationRequest $request,
        SlaEscalation $escalation
    ): JsonResponse {
        $resolved = $this->slaService->resolveEscalation(
            escalation: $escalation,
            actor: $request->user(),
            note: $request->input('note')
        );

        return response()->json([
            'success' => true,
            'message' => 'SLA escalation resolved successfully.',
            'data' => [
                'escalation' => $resolved,
            ],
        ]);
    }
}