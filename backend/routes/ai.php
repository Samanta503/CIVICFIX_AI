<?php

use App\Http\Controllers\Api\AiAdminInsightsController;
use App\Http\Controllers\Api\AiComplaintController;
use App\Http\Controllers\Api\AiDuplicateComplaintController;
use App\Http\Controllers\Api\AiImageAnalysisController;
use App\Http\Controllers\Api\AiMonitoringController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/monitoring', [AiMonitoringController::class, 'index'])
        ->name('monitoring.index');

    Route::get('/admin-insights', [AiAdminInsightsController::class, 'index'])
        ->name('admin-insights.index');

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

    Route::get('/image-analysis/media', [AiImageAnalysisController::class, 'media'])
        ->name('image-analysis.media');

    Route::get('/image-analysis/results', [AiImageAnalysisController::class, 'index'])
        ->name('image-analysis.results');

    Route::post('/image-analysis/run-bulk-scan', [AiImageAnalysisController::class, 'runBulkScan'])
        ->middleware('throttle:10,1')
        ->name('image-analysis.run-bulk-scan');

    Route::post('/image-analysis/media/{media}/analyze', [AiImageAnalysisController::class, 'analyzeMedia'])
        ->middleware('throttle:30,1')
        ->name('image-analysis.media.analyze');

    Route::post('/complaints/{complaint}/image-analysis/analyze', [AiImageAnalysisController::class, 'analyzeComplaint'])
        ->middleware('throttle:20,1')
        ->name('complaints.image-analysis.analyze');

    Route::put('/image-analysis/results/{analysis}/status', [AiImageAnalysisController::class, 'updateStatus'])
        ->middleware('throttle:40,1')
        ->name('image-analysis.results.status');
});