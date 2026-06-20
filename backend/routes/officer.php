<?php

use App\Http\Controllers\Api\OfficerComplaintController;
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

    Route::get('/assigned-complaints', [OfficerComplaintController::class, 'index'])
        ->name('assigned-complaints.index');

    Route::get('/assigned-complaints/{complaint}', [OfficerComplaintController::class, 'show'])
        ->name('assigned-complaints.show');

    Route::put('/assigned-complaints/{complaint}/status', [OfficerComplaintController::class, 'updateStatus'])
        ->middleware('throttle:30,1')
        ->name('assigned-complaints.status');
});