<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:officer'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Officer dashboard loaded successfully.',
            'data' => [
                'role' => 'officer',
                'title' => 'Officer Dashboard',
                'features' => [
                    'View assigned complaints',
                    'Update complaint progress',
                    'Upload resolution proof',
                    'Manage field tasks',
                ],
            ],
        ]);
    })->name('dashboard');
});