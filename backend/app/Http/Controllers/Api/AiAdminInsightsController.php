<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiAdminInsightsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAdminInsightsController extends Controller
{
    public function __construct(
        private AiAdminInsightsService $insightsService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot access AI admin insights.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'AI admin insights loaded successfully.',
            'data' => $this->insightsService->buildDashboard(),
        ]);
    }

    private function canAccess(Request $request): bool
    {
        $role = $request->user()?->role?->slug;

        return in_array($role, ['super_admin', 'department_admin'], true);
    }
}