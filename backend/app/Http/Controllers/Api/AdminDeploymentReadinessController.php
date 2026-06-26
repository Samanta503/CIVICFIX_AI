<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DeploymentReadinessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDeploymentReadinessController extends Controller
{
    public function __construct(
        private DeploymentReadinessService $deploymentReadinessService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->role?->slug !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'You cannot access deployment readiness report.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Deployment readiness report loaded successfully.',
            'data' => $this->deploymentReadinessService->buildReport(),
        ]);
    }
}