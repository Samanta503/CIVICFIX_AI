<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Role;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;

class AdminMetaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Admin meta loaded successfully.',
            'data' => [
                'roles' => Role::query()
                    ->select('id', 'name', 'slug')
                    ->orderBy('id')
                    ->get(),

                'departments' => Department::query()
                    ->select('id', 'name', 'slug')
                    ->orderBy('name')
                    ->get(),

                'zones' => Zone::query()
                    ->select('id', 'name', 'city', 'ward_number')
                    ->orderBy('name')
                    ->get(),
            ],
        ]);
    }
}