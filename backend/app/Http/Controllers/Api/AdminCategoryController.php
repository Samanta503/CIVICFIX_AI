<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\ComplaintCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ComplaintCategory::query()
            ->with('department:id,name,slug')
            ->withCount('complaints')
            ->orderBy('name')
            ->get()
            ->map(fn (ComplaintCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'default_priority' => $category->default_priority,
                'default_sla_hours' => $category->default_sla_hours,
                'complaints_count' => $category->complaints_count,
                'department' => $category->department ? [
                    'id' => $category->department->id,
                    'name' => $category->department->name,
                    'slug' => $category->department->slug,
                ] : null,
                'created_at' => $category->created_at?->toISOString(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Complaint categories loaded successfully.',
            'data' => [
                'categories' => $categories,
            ],
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $category = ComplaintCategory::create([
            'department_id' => $validated['department_id'],
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'default_priority' => $validated['default_priority'],
            'default_sla_hours' => $validated['default_sla_hours'],
        ]);

        $category->load('department:id,name,slug');

        return response()->json([
            'success' => true,
            'message' => 'Complaint category created successfully.',
            'data' => [
                'category' => $category,
            ],
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, ComplaintCategory $category): JsonResponse
    {
        $validated = $request->validated();

        $category->update([
            'department_id' => $validated['department_id'],
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'default_priority' => $validated['default_priority'],
            'default_sla_hours' => $validated['default_sla_hours'],
        ]);

        $category->load('department:id,name,slug');

        return response()->json([
            'success' => true,
            'message' => 'Complaint category updated successfully.',
            'data' => [
                'category' => $category,
            ],
        ]);
    }
}