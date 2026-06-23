<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintAiPrediction;
use App\Services\AiComplaintClassifierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiComplaintController extends Controller
{
    public function __construct(
        private AiComplaintClassifierService $classifier
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role?->slug;

        $complaints = Complaint::query()
            ->with([
                'citizen:id,name,email,phone',
                'category:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
                'aiPrediction.predictedCategory:id,name,slug',
                'aiPrediction.predictedDepartment:id,name,slug',
                'aiPrediction.createdBy:id,name,email',
            ])
            ->when($role === 'citizen', function ($query) use ($user) {
                $query->where('citizen_id', $user->id);
            })
            ->when($role === 'officer', function ($query) use ($user) {
                $query->where('assigned_officer_id', $user->id);
            })
            ->latest()
            ->get()
            ->map(fn (Complaint $complaint) => $this->formatComplaintItem($complaint));

        return response()->json([
            'success' => true,
            'message' => 'AI complaint items loaded successfully.',
            'data' => [
                'items' => $complaints,
            ],
        ]);
    }

    public function predictText(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:5000'],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        $prediction = $this->classifier->predict($validated);

        return response()->json([
            'success' => true,
            'message' => 'AI prediction generated successfully.',
            'data' => [
                'prediction' => $prediction,
            ],
        ]);
    }

    public function predictComplaint(Request $request, Complaint $complaint): JsonResponse
    {
        if (!$this->canAccessComplaint($request, $complaint)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot analyze this complaint.',
            ], 403);
        }

        $prediction = $this->classifier->predict([
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
        ]);

        $storedPrediction = ComplaintAiPrediction::updateOrCreate(
            [
                'complaint_id' => $complaint->id,
            ],
            [
                'predicted_category_id' => $prediction['predicted_category_id'],
                'predicted_department_id' => $prediction['predicted_department_id'],
                'created_by' => $request->user()->id,
                'model_name' => $prediction['model_name'],
                'input_title' => $prediction['input_title'],
                'input_description' => $prediction['input_description'],
                'input_address' => $prediction['input_address'],
                'predicted_priority' => $prediction['predicted_priority'],
                'confidence_score' => $prediction['confidence_score'],
                'predicted_summary' => $prediction['predicted_summary'],
                'reasoning' => $prediction['reasoning'],
                'matched_keywords' => $prediction['matched_keywords'],
                'raw_output' => $prediction['raw_output'],
            ]
        );

        $storedPrediction->load([
            'predictedCategory:id,name,slug',
            'predictedDepartment:id,name,slug',
            'createdBy:id,name,email',
        ]);

        $complaint->load([
            'citizen:id,name,email,phone',
            'category:id,name,slug',
            'department:id,name,slug',
            'zone:id,name,city,ward_number',
            'aiPrediction.predictedCategory:id,name,slug',
            'aiPrediction.predictedDepartment:id,name,slug',
            'aiPrediction.createdBy:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'AI prediction saved successfully.',
            'data' => [
                'prediction' => $this->formatPrediction($storedPrediction),
                'item' => $this->formatComplaintItem($complaint),
            ],
        ]);
    }

    public function showPrediction(Request $request, Complaint $complaint): JsonResponse
    {
        if (!$this->canAccessComplaint($request, $complaint)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot view this AI prediction.',
            ], 403);
        }

        $complaint->load([
            'aiPrediction.predictedCategory:id,name,slug',
            'aiPrediction.predictedDepartment:id,name,slug',
            'aiPrediction.createdBy:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'AI prediction loaded successfully.',
            'data' => [
                'prediction' => $complaint->aiPrediction
                    ? $this->formatPrediction($complaint->aiPrediction)
                    : null,
            ],
        ]);
    }

    private function canAccessComplaint(Request $request, Complaint $complaint): bool
    {
        $user = $request->user();
        $role = $user?->role?->slug;

        if ($role === 'super_admin' || $role === 'department_admin') {
            return true;
        }

        if ($role === 'citizen') {
            return (int) $complaint->citizen_id === (int) $user->id;
        }

        if ($role === 'officer') {
            return (int) $complaint->assigned_officer_id === (int) $user->id;
        }

        return false;
    }

    private function formatComplaintItem(Complaint $complaint): array
    {
        return [
            'id' => $complaint->id,
            'complaint_no' => $complaint->complaint_no,
            'title' => $complaint->title,
            'description' => $complaint->description,
            'address' => $complaint->address,
            'priority' => $complaint->priority,
            'status' => $complaint->status,
            'submitted_at' => $complaint->submitted_at?->toISOString(),
            'created_at' => $complaint->created_at?->toISOString(),

            'citizen' => $complaint->citizen ? [
                'id' => $complaint->citizen->id,
                'name' => $complaint->citizen->name,
                'email' => $complaint->citizen->email,
                'phone' => $complaint->citizen->phone,
            ] : null,

            'category' => $complaint->category ? [
                'id' => $complaint->category->id,
                'name' => $complaint->category->name,
                'slug' => $complaint->category->slug,
            ] : null,

            'department' => $complaint->department ? [
                'id' => $complaint->department->id,
                'name' => $complaint->department->name,
                'slug' => $complaint->department->slug,
            ] : null,

            'zone' => $complaint->zone ? [
                'id' => $complaint->zone->id,
                'name' => $complaint->zone->name,
                'city' => $complaint->zone->city,
                'ward_number' => $complaint->zone->ward_number,
            ] : null,

            'ai_prediction' => $complaint->aiPrediction
                ? $this->formatPrediction($complaint->aiPrediction)
                : null,
        ];
    }

    private function formatPrediction(ComplaintAiPrediction $prediction): array
    {
        return [
            'id' => $prediction->id,
            'complaint_id' => $prediction->complaint_id,
            'model_name' => $prediction->model_name,

            'input_title' => $prediction->input_title,
            'input_description' => $prediction->input_description,
            'input_address' => $prediction->input_address,

            'predicted_priority' => $prediction->predicted_priority,
            'confidence_score' => $prediction->confidence_score,
            'predicted_summary' => $prediction->predicted_summary,
            'reasoning' => $prediction->reasoning,
            'matched_keywords' => $prediction->matched_keywords,
            'raw_output' => $prediction->raw_output,

            'predicted_category' => $prediction->predictedCategory ? [
                'id' => $prediction->predictedCategory->id,
                'name' => $prediction->predictedCategory->name,
                'slug' => $prediction->predictedCategory->slug,
            ] : null,

            'predicted_department' => $prediction->predictedDepartment ? [
                'id' => $prediction->predictedDepartment->id,
                'name' => $prediction->predictedDepartment->name,
                'slug' => $prediction->predictedDepartment->slug,
            ] : null,

            'created_by' => $prediction->createdBy ? [
                'id' => $prediction->createdBy->id,
                'name' => $prediction->createdBy->name,
                'email' => $prediction->createdBy->email,
            ] : null,

            'reviewed_at' => $prediction->reviewed_at?->toISOString(),
            'created_at' => $prediction->created_at?->toISOString(),
            'updated_at' => $prediction->updated_at?->toISOString(),
        ];
    }
}