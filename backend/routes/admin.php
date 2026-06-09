<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Admin dashboard loaded successfully.',
            'data' => [
                'role' => 'super_admin',
                'title' => 'Super Admin Dashboard',
                'features' => [
                    'Manage users',
                    'Manage departments',
                    'Manage roles and permissions',
                    'Monitor full city complaint system',
                ],
            ],
        ]);
    })->name('dashboard');
});