<?php

use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Department dashboard API placeholder.',
        'data' => [
            'department_complaints' => 0,
            'overdue_complaints' => 0,
            'officer_workload' => [],
        ],
    ]);
})->name('dashboard');
