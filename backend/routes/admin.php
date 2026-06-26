<?php

use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminComplaintController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminDepartmentController;
use App\Http\Controllers\Api\AdminFeedbackController;
use App\Http\Controllers\Api\AdminMetaController;
use App\Http\Controllers\Api\AdminNotificationController;
use App\Http\Controllers\Api\AdminOfficerController;
use App\Http\Controllers\Api\AdminSlaController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminWorkloadController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminDeploymentReadinessController;

Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/meta', [AdminMetaController::class, 'index'])
        ->name('meta');

    Route::get('/workload', [AdminWorkloadController::class, 'index'])
        ->name('workload.index');

    Route::get('/feedback', [AdminFeedbackController::class, 'index'])
        ->name('feedback.index');

    Route::get('/notifications', [AdminNotificationController::class, 'index'])
        ->name('notifications.index');

    Route::post('/notifications/send', [AdminNotificationController::class, 'sendToUser'])
        ->middleware('throttle:30,1')
        ->name('notifications.send');

    Route::get('/sla-alerts', [AdminSlaController::class, 'index'])
        ->name('sla-alerts.index');

    Route::post('/sla-alerts/run-check', [AdminSlaController::class, 'runCheck'])
        ->middleware('throttle:20,1')
        ->name('sla-alerts.run-check');

    Route::post('/sla-alerts/complaints/{complaint}/escalate', [AdminSlaController::class, 'escalate'])
        ->middleware('throttle:30,1')
        ->name('sla-alerts.escalate');

    Route::put('/sla-alerts/escalations/{escalation}/resolve', [AdminSlaController::class, 'resolve'])
        ->middleware('throttle:30,1')
        ->name('sla-alerts.resolve');

    Route::get('/officers', [AdminOfficerController::class, 'index'])
        ->name('officers.index');

    Route::get('/users', [AdminUserController::class, 'index'])
        ->name('users.index');

    Route::post('/users', [AdminUserController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('users.store');

    Route::put('/users/{user}', [AdminUserController::class, 'update'])
        ->middleware('throttle:30,1')
        ->name('users.update');

    Route::get('/departments', [AdminDepartmentController::class, 'index'])
        ->name('departments.index');

    Route::post('/departments', [AdminDepartmentController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('departments.store');

    Route::put('/departments/{department}', [AdminDepartmentController::class, 'update'])
        ->middleware('throttle:30,1')
        ->name('departments.update');

    Route::get('/categories', [AdminCategoryController::class, 'index'])
        ->name('categories.index');

    Route::post('/categories', [AdminCategoryController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('categories.store');

    Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])
        ->middleware('throttle:30,1')
        ->name('categories.update');

    Route::get('/complaints', [AdminComplaintController::class, 'index'])
        ->name('complaints.index');

    Route::get('/complaints/{complaint}', [AdminComplaintController::class, 'show'])
        ->name('complaints.show');

    Route::put('/complaints/{complaint}', [AdminComplaintController::class, 'update'])
        ->middleware('throttle:40,1')
        ->name('complaints.update');

    Route::get('/deployment-readiness', [AdminDeploymentReadinessController::class, 'index'])
        ->name('deployment-readiness.index');
});