<?php

use App\Http\Controllers\Api\DepartmentComplaintController;
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

    Route::get('/complaints', [DepartmentComplaintController::class, 'index'])
        ->name('complaints.index');

    Route::get('/complaints/{complaint}', [DepartmentComplaintController::class, 'show'])
        ->name('complaints.show');

    Route::get('/officers', [DepartmentComplaintController::class, 'officers'])
        ->name('officers.index');

    Route::put('/complaints/{complaint}/assign', [DepartmentComplaintController::class, 'assign'])
        ->middleware('throttle:30,1')
        ->name('complaints.assign');
});