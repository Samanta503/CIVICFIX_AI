<?php

use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Officer dashboard API placeholder.',
        'data' => [
            'assigned_today' => 0,
            'in_progress' => 0,
            'resolved_this_month' => 0,
        ],
    ]);
})->name('dashboard');
