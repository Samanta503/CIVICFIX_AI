<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with([
                'role:id,name,slug',
                'department:id,name,slug',
                'zone:id,name,city,ward_number',
            ])
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->formatUser($user));

        return response()->json([
            'success' => true,
            'message' => 'Users loaded successfully.',
            'data' => [
                'users' => $users,
            ],
        ]);
    }

    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'department_id' => $validated['department_id'] ?? null,
            'zone_id' => $validated['zone_id'] ?? null,
            'status' => $validated['status'],
        ]);

        $user->load(['role:id,name,slug', 'department:id,name,slug', 'zone:id,name,city,ward_number']);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => [
                'user' => $this->formatUser($user),
            ],
        ], 201);
    }

    public function update(UpdateAdminUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        if ((int) $user->id === (int) $request->user()->id && $validated['status'] !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own super admin account.',
            ], 422);
        }

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role_id' => $validated['role_id'],
            'department_id' => $validated['department_id'] ?? null,
            'zone_id' => $validated['zone_id'] ?? null,
            'status' => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);

        $user->load(['role:id,name,slug', 'department:id,name,slug', 'zone:id,name,city,ward_number']);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => [
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'status' => $user->status,
            'role' => $user->role ? [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'slug' => $user->role->slug,
            ] : null,
            'department' => $user->department ? [
                'id' => $user->department->id,
                'name' => $user->department->name,
                'slug' => $user->department->slug,
            ] : null,
            'zone' => $user->zone ? [
                'id' => $user->zone->id,
                'name' => $user->zone->name,
                'city' => $user->zone->city,
                'ward_number' => $user->zone->ward_number,
            ] : null,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}