<?php

use App\Http\Controllers\Api\PublicComplaintController;
use App\Http\Controllers\Api\PublicMetaController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PublicComplaintTrackingController;

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



Route::post('/track-complaint', [PublicComplaintTrackingController::class, 'track'])
    ->middleware('throttle:30,1')
    ->name('track-complaint');

Route::get('/track-complaint/{complaintNo}', [PublicComplaintTrackingController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('track-complaint.show');