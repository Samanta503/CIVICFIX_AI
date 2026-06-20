<?php

use App\Http\Controllers\Api\PublicComplaintController;
use App\Http\Controllers\Api\PublicMetaController;
use Illuminate\Support\Facades\Route;

Route::get('/status', function () {
    return response()->json([
        'success' => true,
        'message' => 'Public APIs are working.',
        'data' => [
            'module' => 'CivicFix AI Public Portal',
            'status' => 'online',
        ],
    ]);
})->name('status');

Route::get('/meta', [PublicMetaController::class, 'index'])
    ->name('meta');

Route::get('/complaints', [PublicComplaintController::class, 'index'])
    ->name('complaints.index');

Route::get('/complaints/{complaintNo}', [PublicComplaintController::class, 'show'])
    ->name('complaints.show');

Route::get('/map/complaints', [PublicComplaintController::class, 'map'])
    ->name('map.complaints');

Route::get('/complaint-stats', [PublicComplaintController::class, 'stats'])
    ->name('complaint-stats');