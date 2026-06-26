<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiMonitoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiMonitoringController extends Controller
{
    public function __construct(
        private AiMonitoringService $monitoringService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        if (!$this->canAccess($request)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot access AI monitoring.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'AI monitoring dashboard loaded successfully.',
            'data' => $this->monitoringService->buildMonitoringDashboard(),
        ]);
    }

    private function canAccess(Request $request): bool
    {
        $role = $request->user()?->role?->slug;

        return in_array($role, ['super_admin', 'department_admin'], true);
    }
}