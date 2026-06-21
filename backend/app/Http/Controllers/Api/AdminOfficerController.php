<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOfficerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $officers = User::query()
            ->where('status', 'active')
            ->whereHas('role', function ($query) {
                $query->where('slug', 'officer');
            })
            ->when($request->filled('department_id'), function ($query) use ($request) {
                $query->where('department_id', $request->integer('department_id'));
            })
            ->when($request->filled('zone_id'), function ($query) use ($request) {
                $query->where('zone_id', $request->integer('zone_id'));
            })
            ->with([
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->withCount([
                'assignedComplaints as total_assigned_count',
                'assignedComplaints as active_assigned_count' => function ($query) {
                    $query->whereIn('status', ['assigned', 'in_progress']);
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
                'workload' => [
                    'total_assigned' => $officer->total_assigned_count,
                    'active_assigned' => $officer->active_assigned_count,
                    'resolved' => $officer->resolved_count,
                    'overdue' => $officer->overdue_count,
                ],
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin officers loaded successfully.',
            'data' => [
                'officers' => $officers,
            ],
        ]);
    }
}