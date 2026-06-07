<?php

use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Citizen dashboard API placeholder.',
        'data' => [
            'total_complaints' => 0,
            'pending_complaints' => 0,
            'resolved_complaints' => 0,
        ],
    ]);
})->name('dashboard');
