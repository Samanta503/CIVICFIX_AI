<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplaintFeedback;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFeedbackController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ComplaintFeedback::query()
            ->with([
                'citizen:id,name,email,phone',
                'complaint:id,complaint_no,title,status,priority,department_id,category_id,zone_id,resolved_at',
                'complaint.department:id,name,slug',
                'complaint.category:id,name,slug',
                'complaint.zone:id,name,city,ward_number',
            ])
            ->when($request->filled('rating'), function ($query) use ($request) {
                $query->where('rating', $request->integer('rating'));
            })
            ->when($request->filled('response_quality'), function ($query) use ($request) {
                $query->where('response_quality', $request->string('response_quality'));
            })
            ->when($request->filled('issue_resolved'), function ($query) use ($request) {
                $query->where('issue_resolved', filter_var($request->input('issue_resolved'), FILTER_VALIDATE_BOOLEAN));
            })
            ->when($request->filled('department_id'), function ($query) use ($request) {
                $query->whereHas('complaint', function ($complaintQuery) use ($request) {
                    $complaintQuery->where('department_id', $request->integer('department_id'));
                });
            });

        $feedback = $query
            ->latest()
            ->get()
            ->map(fn (ComplaintFeedback $feedback) => $this->formatFeedback($feedback));

        $stats = [
            'total_feedback' => ComplaintFeedback::count(),
            'average_rating' => round((float) ComplaintFeedback::avg('rating'), 2),
            'five_star' => ComplaintFeedback::where('rating', 5)->count(),
            'four_star' => ComplaintFeedback::where('rating', 4)->count(),
            'three_star' => ComplaintFeedback::where('rating', 3)->count(),
            'two_star' => ComplaintFeedback::where('rating', 2)->count(),
            'one_star' => ComplaintFeedback::where('rating', 1)->count(),
            'low_rating' => ComplaintFeedback::where('rating', '<=', 2)->count(),
            'unresolved_feedback' => ComplaintFeedback::where('issue_resolved', false)->count(),
        ];

        $departmentSummary = Department::query()
            ->withCount([
                'complaints as feedback_count' => function ($query) {
                    $query->whereHas('feedback');
                },
            ])
            ->get()
            ->map(function (Department $department) {
                $avgRating = ComplaintFeedback::query()
                    ->whereHas('complaint', function ($query) use ($department) {
                        $query->where('department_id', $department->id);
                    })
                    ->avg('rating');

                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'slug' => $department->slug,
                    'feedback_count' => $department->feedback_count,
                    'average_rating' => round((float) $avgRating, 2),
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Admin feedback loaded successfully.',
            'data' => [
                'stats' => $stats,
                'department_summary' => $departmentSummary,
                'feedback' => $feedback,
            ],
        ]);
    }

    private function formatFeedback(ComplaintFeedback $feedback): array
    {
        return [
            'id' => $feedback->id,
            'rating' => $feedback->rating,
            'response_quality' => $feedback->response_quality,
            'issue_resolved' => $feedback->issue_resolved,
            'comment' => $feedback->comment,
            'submitted_at' => $feedback->submitted_at?->toISOString(),
            'created_at' => $feedback->created_at?->toISOString(),

            'citizen' => $feedback->citizen ? [
                'id' => $feedback->citizen->id,
                'name' => $feedback->citizen->name,
                'email' => $feedback->citizen->email,
                'phone' => $feedback->citizen->phone,
            ] : null,

            'complaint' => $feedback->complaint ? [
                'id' => $feedback->complaint->id,
                'complaint_no' => $feedback->complaint->complaint_no,
                'title' => $feedback->complaint->title,
                'status' => $feedback->complaint->status,
                'priority' => $feedback->complaint->priority,
                'resolved_at' => $feedback->complaint->resolved_at?->toISOString(),

                'department' => $feedback->complaint->department ? [
                    'id' => $feedback->complaint->department->id,
                    'name' => $feedback->complaint->department->name,
                    'slug' => $feedback->complaint->department->slug,
                ] : null,

                'category' => $feedback->complaint->category ? [
                    'id' => $feedback->complaint->category->id,
                    'name' => $feedback->complaint->category->name,
                    'slug' => $feedback->complaint->category->slug,
                ] : null,

                'zone' => $feedback->complaint->zone ? [
                    'id' => $feedback->complaint->zone->id,
                    'name' => $feedback->complaint->zone->name,
                    'city' => $feedback->complaint->zone->city,
                    'ward_number' => $feedback->complaint->zone->ward_number,
                ] : null,
            ] : null,
        ];
    }
}