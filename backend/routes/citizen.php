<?php

use App\Http\Controllers\Api\CitizenComplaintController;
use App\Http\Controllers\Api\CitizenDuplicateNoticeController;
use App\Http\Controllers\Api\CitizenFeedbackController;
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
                    'View duplicate complaint notices',
                ],
            ],
        ]);
    })->name('dashboard');

    Route::get('/duplicate-notices', [CitizenDuplicateNoticeController::class, 'index'])
        ->name('duplicate-notices.index');

    Route::get('/complaints/{complaintNo}/duplicate-notice', [CitizenDuplicateNoticeController::class, 'show'])
        ->name('complaints.duplicate-notice.show');

    Route::get('/complaints', [CitizenComplaintController::class, 'index'])
        ->name('complaints.index');

    Route::post('/complaints', [CitizenComplaintController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('complaints.store');

    Route::get('/feedback', [CitizenFeedbackController::class, 'index'])
        ->name('feedback.index');

    Route::get('/complaints/{complaintNo}/feedback-context', [CitizenFeedbackController::class, 'context'])
        ->name('complaints.feedback-context');

    Route::post('/complaints/{complaintNo}/feedback', [CitizenFeedbackController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('complaints.feedback.store');

    Route::get('/complaints/{complaintNo}', [CitizenComplaintController::class, 'show'])
        ->name('complaints.show');
});