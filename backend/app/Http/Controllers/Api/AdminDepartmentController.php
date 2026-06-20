<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDepartmentRequest;
use App\Http\Requests\Admin\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminDepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::query()
            ->withCount(['users', 'categories', 'complaints'])
            ->orderBy('name')
            ->get()
            ->map(fn (Department $department) => [
                'id' => $department->id,
                'name' => $department->name,
                'slug' => $department->slug,
                'users_count' => $department->users_count,
                'categories_count' => $department->categories_count,
                'complaints_count' => $department->complaints_count,
                'created_at' => $department->created_at?->toISOString(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Departments loaded successfully.',
            'data' => [
                'departments' => $departments,
            ],
        ]);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $department = Department::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully.',
            'data' => [
                'department' => $department,
            ],
        ], 201);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $validated = $request->validated();

        $department->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully.',
            'data' => [
                'department' => $department,
            ],
        ]);
    }
}