<?php

use App\Http\Controllers\Api\AiComplaintController;
use App\Http\Controllers\Api\AiDuplicateComplaintController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/complaints', [AiComplaintController::class, 'index'])
        ->name('complaints.index');

    Route::post('/predict', [AiComplaintController::class, 'predictText'])
        ->middleware('throttle:40,1')
        ->name('predict');

    Route::get('/complaints/{complaint}/prediction', [AiComplaintController::class, 'showPrediction'])
        ->name('complaints.prediction.show');

    Route::post('/complaints/{complaint}/predict', [AiComplaintController::class, 'predictComplaint'])
        ->middleware('throttle:40,1')
        ->name('complaints.predict');

    Route::get('/duplicates', [AiDuplicateComplaintController::class, 'index'])
        ->name('duplicates.index');

    Route::post('/duplicates/run-bulk-scan', [AiDuplicateComplaintController::class, 'runBulkScan'])
        ->middleware('throttle:10,1')
        ->name('duplicates.run-bulk-scan');

    Route::post('/complaints/{complaint}/duplicates/scan', [AiDuplicateComplaintController::class, 'scanComplaint'])
        ->middleware('throttle:30,1')
        ->name('complaints.duplicates.scan');

    Route::put('/duplicates/{suggestion}/status', [AiDuplicateComplaintController::class, 'updateStatus'])
        ->middleware('throttle:40,1')
        ->name('duplicates.status');
});