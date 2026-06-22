<?php

use App\Http\Controllers\Api\UserNotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [UserNotificationController::class, 'index'])
        ->name('index');

    Route::get('/latest', [UserNotificationController::class, 'latest'])
        ->name('latest');

    Route::get('/unread-count', [UserNotificationController::class, 'unreadCount'])
        ->name('unread-count');

    Route::put('/mark-all-read', [UserNotificationController::class, 'markAllAsRead'])
        ->name('mark-all-read');

    Route::put('/{notification}/read', [UserNotificationController::class, 'markAsRead'])
        ->name('read');
});