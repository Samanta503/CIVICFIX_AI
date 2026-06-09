<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:department_admin,super_admin'])->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'success' => true,
            'message' => 'Department dashboard loaded successfully.',
            'data' => [
                'role' => 'department_admin',
                'title' => 'Department Dashboard',
                'features' => [
                    'Assign complaints to officers',
                    'Monitor department SLA',
                    'Review department workload',
                    'Escalate delayed complaints',
                ],
            ],
        ]);
    })->name('dashboard');
});