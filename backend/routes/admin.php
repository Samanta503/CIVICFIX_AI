<?php

use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Admin dashboard API placeholder.',
        'data' => [
            'total_users' => 0,
            'total_complaints' => 0,
            'total_departments' => 0,
            'ai_enabled' => config('ai.enabled'),
        ],
    ]);
})->name('dashboard');
