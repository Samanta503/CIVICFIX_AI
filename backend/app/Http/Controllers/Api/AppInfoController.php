<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppInfoService;
use Illuminate\Http\JsonResponse;

class AppInfoController extends Controller
{
    public function __construct(
        private readonly AppInfoService $appInfoService
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'CivicFix AI application information.',
            'data' => $this->appInfoService->getInfo(),
        ]);
    }
}
