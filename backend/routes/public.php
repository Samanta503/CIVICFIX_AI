<?php

use App\Http\Controllers\Api\PublicStatusController;
use Illuminate\Support\Facades\Route;

Route::get('/status', [PublicStatusController::class, 'index'])
    ->name('status');

Route::get('/complaints', function () {
    return response()->json([
        'success' => true,
        'message' => 'Public complaint list API will be added later.',
        'data' => [],
    ]);
})->name('complaints.index');

Route::get('/map/complaints', function () {
    return response()->json([
        'success' => true,
        'message' => 'Public complaint map API will be added later.',
        'data' => [],
    ]);
})->name('map.complaints');
