<?php

use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'Auth API is ready. Login and register will be added in the authentication chunk.',
    ]);
})->name('ping');
