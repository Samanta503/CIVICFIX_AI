<?php

use App\Http\Controllers\Api\AppInfoController;
use App\Http\Controllers\Api\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index'])
    ->name('api.health');

Route::get('/app-info', [AppInfoController::class, 'index'])
    ->name('api.app-info');

Route::prefix('auth')->name('api.auth.')->group(base_path('routes/auth.php'));

Route::prefix('public')->name('api.public.')->group(base_path('routes/public.php'));

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('citizen')->name('api.citizen.')->group(base_path('routes/citizen.php'));
    Route::prefix('officer')->name('api.officer.')->group(base_path('routes/officer.php'));
    Route::prefix('department')->name('api.department.')->group(base_path('routes/department.php'));
    Route::prefix('admin')->name('api.admin.')->group(base_path('routes/admin.php'));
});

Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found.',
    ], 404);
});
