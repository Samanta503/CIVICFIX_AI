<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminWorkloadController extends Controller
{
    public function index(): JsonResponse
    {
        $departmentWorkload = Department::query()
            ->withCount([
                'complaints as total_complaints',
                'complaints as submitted_count' => function ($query) {
                    $query->where('status', 'submitted');
                },
                'complaints as assigned_count' => function ($query) {
                    $query->where('status', 'assigned');
                },
                'complaints as in_progress_count' => function ($query) {
                    $query->where('status', 'in_progress');
                },
                'complaints as resolved_count' => function ($query) {
                    $query->where('status', 'resolved');
                },
                'complaints as overdue_count' => function ($query) {
                    $query
                        ->whereNotNull('sla_due_at')
                        ->where('sla_due_at', '<', now())
                        ->whereNotIn('status', ['resolved', 'closed', 'rejected']);
                },
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (Department $department) => [
                'id' => $department->id,
                'name' => $department->name,
                'slug' => $department->slug,
                'total_complaints' => $department->total_complaints,
                'submitted' => $department->submitted_count,
                'assigned' => $department->assigned_count,
                'in_progress' => $department->in_progress_count,
                'resolved' => $department->resolved_count,
                'overdue' => $department->overdue_count,
            ]);

        $officerWorkload = User::query()
            ->where('status', 'active')
            ->whereHas('role', function ($query) {
                $query->where('slug', 'officer');
            })
            ->with([
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->withCount([
                'assignedComplaints as total_assigned',
                'assignedComplaints as assigned_count' => function ($query) {
                    $query->where('status', 'assigned');
                },
                'assignedComplaints as in_progress_count' => function ($query) {
                    $query->where('status', 'in_progress');
                },
                'assignedComplaints as resolved_count' => function ($query) {
                    $query->where('status', 'resolved');
                },
                'assignedComplaints as overdue_count' => function ($query) {
                    $query
                        ->whereNotNull('sla_due_at')
                        ->where('sla_due_at', '<', now())
                        ->whereNotIn('status', ['resolved', 'closed', 'rejected']);
                },
            ])
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
                'total_assigned' => $officer->total_assigned,
                'assigned' => $officer->assigned_count,
                'in_progress' => $officer->in_progress_count,
                'resolved' => $officer->resolved_count,
                'overdue' => $officer->overdue_count,
            ]);

        $summary = [
            'total_complaints' => Complaint::count(),
            'active_complaints' => Complaint::whereIn('status', ['submitted', 'under_review', 'assigned', 'in_progress'])->count(),
            'resolved_complaints' => Complaint::where('status', 'resolved')->count(),
            'overdue_complaints' => Complaint::query()
                ->whereNotNull('sla_due_at')
                ->where('sla_due_at', '<', now())
                ->whereNotIn('status', ['resolved', 'closed', 'rejected'])
                ->count(),
            'due_today' => Complaint::query()
                ->whereDate('sla_due_at', now()->toDateString())
                ->whereNotIn('status', ['resolved', 'closed', 'rejected'])
                ->count(),
            'unassigned_complaints' => Complaint::query()
                ->whereNull('assigned_officer_id')
                ->whereNotIn('status', ['resolved', 'closed', 'rejected'])
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Admin workload analytics loaded successfully.',
            'data' => [
                'summary' => $summary,
                'department_workload' => $departmentWorkload,
                'officer_workload' => $officerWorkload,
            ],
        ]);
    }
}