<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\SlaEscalation;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SlaEscalationService
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    public function alertQuery(): Builder
    {
        return Complaint::query()
            ->with([
                'citizen:id,name,email,phone',
                'category:id,name,slug,default_priority,default_sla_hours',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'assignedOfficer:id,name,email,phone,department_id,zone_id',
                'slaEscalations' => function ($query) {
                    $query->latest();
                },
                'slaEscalations.escalatedBy:id,name,email',
            ])
            ->whereNotIn('status', ['resolved', 'closed', 'rejected'])
            ->whereNotNull('sla_due_at');
    }

    public function applyAlertFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when(!empty($filters['type']), function ($query) use ($filters) {
                if ($filters['type'] === 'overdue') {
                    $query->where('sla_due_at', '<', now());
                }

                if ($filters['type'] === 'due_today') {
                    $query->whereDate('sla_due_at', now()->toDateString());
                }

                if ($filters['type'] === 'escalated') {
                    $query->whereHas('slaEscalations', function ($escalationQuery) {
                        $escalationQuery->where('status', 'open');
                    });
                }

                if ($filters['type'] === 'unassigned') {
                    $query->whereNull('assigned_officer_id');
                }
            })
            ->when(!empty($filters['department_id']), function ($query) use ($filters) {
                $query->where('department_id', $filters['department_id']);
            })
            ->when(!empty($filters['priority']), function ($query) use ($filters) {
                $query->where('priority', $filters['priority']);
            })
            ->when(!empty($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            });
    }

    public function autoEscalateOverdue(?User $actor = null): int
    {
        $complaints = Complaint::query()
            ->whereNotNull('sla_due_at')
            ->where('sla_due_at', '<', now())
            ->whereNotIn('status', ['resolved', 'closed', 'rejected'])
            ->whereDoesntHave('slaEscalations', function ($query) {
                $query->where('status', 'open');
            })
            ->get();

        $created = 0;

        foreach ($complaints as $complaint) {
            $this->escalate(
                complaint: $complaint,
                actor: $actor,
                reason: 'sla_overdue',
                note: 'System detected SLA overdue complaint.'
            );

            $created++;
        }

        return $created;
    }

    public function escalate(
        Complaint $complaint,
        ?User $actor,
        string $reason = 'manual',
        ?string $note = null
    ): SlaEscalation {
        return DB::transaction(function () use ($complaint, $actor, $reason, $note) {
            $latestLevel = (int) $complaint->slaEscalations()->max('level');
            $newLevel = $latestLevel + 1;

            $escalation = $complaint->slaEscalations()->create([
                'escalated_by' => $actor?->id,
                'level' => $newLevel,
                'reason' => $reason,
                'note' => $note,
                'status' => 'open',
                'escalated_at' => now(),
            ]);

            $oldStatus = $complaint->status;

            if ($complaint->status === 'submitted') {
                $complaint->update([
                    'status' => 'under_review',
                ]);
            }

            $complaint->statusHistories()->create([
                'changed_by' => $actor?->id,
                'old_status' => $oldStatus,
                'new_status' => $complaint->fresh()->status,
                'note' => $note ?: "Complaint escalated to level {$newLevel}.",
            ]);

            $this->notificationService->notifySlaEscalated(
                complaint: $complaint->fresh(),
                escalation: $escalation,
                actor: $actor
            );

            return $escalation;
        });
    }

    public function resolveEscalation(
        SlaEscalation $escalation,
        ?User $actor,
        ?string $note = null
    ): SlaEscalation {
        return DB::transaction(function () use ($escalation, $actor, $note) {
            $escalation->update([
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);

            $complaint = $escalation->complaint;

            if ($complaint) {
                $complaint->statusHistories()->create([
                    'changed_by' => $actor?->id,
                    'old_status' => $complaint->status,
                    'new_status' => $complaint->status,
                    'note' => $note ?: "SLA escalation level {$escalation->level} resolved.",
                ]);
            }

            return $escalation->fresh();
        });
    }

    public function formatAlert(Complaint $complaint): array
    {
        $openEscalation = $complaint->slaEscalations
            ->where('status', 'open')
            ->sortByDesc('level')
            ->first();

        $latestEscalation = $complaint->slaEscalations
            ->sortByDesc('level')
            ->first();

        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'status' => $complaint->status,
            'priority' => $complaint->priority,
            'address' => $complaint->address,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'sla_due_at' => $complaint->sla_due_at?->toISOString(),
            'is_overdue' => $complaint->sla_due_at ? $complaint->sla_due_at->isPast() : false,
            'is_due_today' => $complaint->sla_due_at ? $complaint->sla_due_at->isToday() : false,
            'hours_overdue' => $complaint->sla_due_at && $complaint->sla_due_at->isPast()
                ? $complaint->sla_due_at->diffInHours(now())
                : 0,

            'citizen' => $complaint->citizen ? [
                'id' => $complaint->citizen->id,
                'name' => $complaint->citizen->name,
                'email' => $complaint->citizen->email,
                'phone' => $complaint->citizen->phone,
            ] : null,

            'department' => $complaint->department ? [
                'id' => $complaint->department->id,
                'name' => $complaint->department->name,
                'slug' => $complaint->department->slug,
            ] : null,

            'category' => $complaint->category ? [
                'id' => $complaint->category->id,
                'name' => $complaint->category->name,
                'slug' => $complaint->category->slug,
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

            'open_escalation' => $openEscalation ? [
                'id' => $openEscalation->id,
                'level' => $openEscalation->level,
                'reason' => $openEscalation->reason,
                'note' => $openEscalation->note,
                'status' => $openEscalation->status,
                'escalated_at' => $openEscalation->escalated_at?->toISOString(),
                'escalated_by' => $openEscalation->escalatedBy ? [
                    'id' => $openEscalation->escalatedBy->id,
                    'name' => $openEscalation->escalatedBy->name,
                    'email' => $openEscalation->escalatedBy->email,
                ] : null,
            ] : null,

            'latest_escalation' => $latestEscalation ? [
                'id' => $latestEscalation->id,
                'level' => $latestEscalation->level,
                'reason' => $latestEscalation->reason,
                'note' => $latestEscalation->note,
                'status' => $latestEscalation->status,
                'escalated_at' => $latestEscalation->escalated_at?->toISOString(),
                'resolved_at' => $latestEscalation->resolved_at?->toISOString(),
            ] : null,
        ];
    }

    public function stats(?int $departmentId = null): array
    {
        $baseQuery = Complaint::query()
            ->whereNotIn('status', ['resolved', 'closed', 'rejected'])
            ->whereNotNull('sla_due_at')
            ->when($departmentId, function ($query) use ($departmentId) {
                $query->where('department_id', $departmentId);
            });

        return [
            'active_sla' => (clone $baseQuery)->count(),
            'overdue' => (clone $baseQuery)->where('sla_due_at', '<', now())->count(),
            'due_today' => (clone $baseQuery)->whereDate('sla_due_at', now()->toDateString())->count(),
            'open_escalations' => SlaEscalation::query()
                ->where('status', 'open')
                ->whereHas('complaint', function ($query) use ($departmentId) {
                    if ($departmentId) {
                        $query->where('department_id', $departmentId);
                    }
                })
                ->count(),
            'unassigned' => (clone $baseQuery)->whereNull('assigned_officer_id')->count(),
        ];
    }
}