<?php

use App\Http\Controllers\Api\CitizenComplaintController;
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

    Route::get('/complaints', [CitizenComplaintController::class, 'index'])
        ->name('complaints.index');

    Route::post('/complaints', [CitizenComplaintController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('complaints.store');

    Route::get('/complaints/{complaintNo}', [CitizenComplaintController::class, 'show'])
        ->name('complaints.show');
});