<?php

use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminComplaintController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminDepartmentController;
use App\Http\Controllers\Api\AdminMetaController;
use App\Http\Controllers\Api\AdminOfficerController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminWorkloadController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/meta', [AdminMetaController::class, 'index'])
        ->name('meta');

    Route::get('/workload', [AdminWorkloadController::class, 'index'])
        ->name('workload.index');

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
});