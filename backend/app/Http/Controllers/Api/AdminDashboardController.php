<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $recentComplaints = Complaint::query()
            ->with([
                'citizen:id,name,email',
                'category:id,name',
                'department:id,name',
                'assignedOfficer:id,name,email',
            ])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Complaint $complaint) => [
                'id' => $complaint->id,
                'complaint_no' => $complaint->complaint_no,
                'title' => $complaint->title,
                'status' => $complaint->status,
                'priority' => $complaint->priority,
                'citizen' => $complaint->citizen?->name,
                'category' => $complaint->category?->name,
                'department' => $complaint->department?->name,
                'assigned_officer' => $complaint->assignedOfficer?->name,
                'created_at' => $complaint->created_at?->toISOString(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin dashboard loaded successfully.',
            'data' => [
                'stats' => [
                    'users' => User::count(),
                    'citizens' => User::whereHas('role', fn ($query) => $query->where('slug', 'citizen'))->count(),
                    'officers' => User::whereHas('role', fn ($query) => $query->where('slug', 'officer'))->count(),
                    'departments' => Department::count(),
                    'categories' => ComplaintCategory::count(),
                    'complaints' => Complaint::count(),
                    'submitted' => Complaint::where('status', 'submitted')->count(),
                    'assigned' => Complaint::where('status', 'assigned')->count(),
                    'in_progress' => Complaint::where('status', 'in_progress')->count(),
                    'resolved' => Complaint::where('status', 'resolved')->count(),
                ],
                'recent_complaints' => $recentComplaints,
            ],
        ]);
    }
}