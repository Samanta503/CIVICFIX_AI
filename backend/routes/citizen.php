<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:citizen'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Citizen dashboard loaded successfully.',
            'data' => [
                'role' => 'citizen',
                'title' => 'Citizen Dashboard',
                'features' => [
                    'Submit complaints',
                    'Track complaint status',
                    'View complaint history',
                    'Rate resolved complaints',
                ],
            ],
        ]);
    })->name('dashboard');
});