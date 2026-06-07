<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PublicStatusController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'CivicFix AI public API is available.',
            'data' => [
                'public_complaints_available' => false,
                'public_map_available' => false,
                'tracking_available' => false,
                'note' => 'Public complaint APIs will be added in a later chunk.',
            ],
        ]);
    }
}
