<?php

use App\Http\Controllers\Api\AiComplaintController;
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
});