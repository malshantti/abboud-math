<?php

use App\Http\Controllers\Admin\WorkspaceAssetController;
use App\Http\Controllers\Admin\WorkspaceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::view('/admin', 'admin.index')
    ->middleware(['auth', 'can:access-admin'])
    ->name('admin.index');

Route::prefix('admin')->middleware(['auth', 'can:access-admin'])->group(function () {
    Route::get('api/session', fn () => response()->json(['token' => csrf_token()]));
    Route::get('assets/{asset}', WorkspaceAssetController::class)->where('asset', '.*')->name('admin.assets');
    Route::get('api/summary', [WorkspaceController::class, 'summary']);
    Route::get('api/documents', [WorkspaceController::class, 'index']);
    Route::post('api/documents', [WorkspaceController::class, 'store']);
    Route::get('api/documents/{document}', [WorkspaceController::class, 'show'])->whereNumber('document');
    Route::put('api/documents/{document}', [WorkspaceController::class, 'update'])->whereNumber('document');
    Route::delete('api/documents/{document}', [WorkspaceController::class, 'trash'])->whereNumber('document');
    Route::post('api/documents/{document}/restore', [WorkspaceController::class, 'restore'])->whereNumber('document');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
