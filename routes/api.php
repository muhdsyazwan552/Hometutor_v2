<?php

use App\Http\Controllers\Api\IntegrationSyncController;
use App\Http\Controllers\Api\IntegrationTokenController;
use Illuminate\Support\Facades\Route;

Route::prefix('integration/v1')->middleware('throttle:60,1')->group(function () {
    Route::post('/auth/token', IntegrationTokenController::class)
        ->middleware('throttle:10,1')
        ->name('integration.token');

    Route::get('/children', [IntegrationSyncController::class, 'children'])
        ->middleware('integration.jwt:children:read')
        ->name('integration.children');

    Route::get('/subscriptions', [IntegrationSyncController::class, 'subscriptions'])
        ->middleware('integration.jwt:subscriptions:read')
        ->name('integration.subscriptions');
});
