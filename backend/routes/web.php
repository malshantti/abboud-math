<?php

use App\Http\Controllers\Admin\WorkspaceAssetController;
use App\Http\Controllers\Admin\WorkspaceController;
use App\Http\Controllers\Account\AuthController as AccountAuth;
use App\Http\Controllers\Account\HomeController as AccountHome;
use App\Http\Controllers\Admin\ManageController as Manage;
use App\Http\Controllers\Api\SyncController;
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

// ---- Parents and students (public accounts) ----
Route::get('/brand/{asset}', App\Http\Controllers\PublicAssetController::class)->where('asset', '[a-z0-9./-]+')->name('brand.asset');
Route::prefix('account')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('register', [AccountAuth::class, 'registerForm'])->name('account.register');
        Route::post('register', [AccountAuth::class, 'register'])->middleware('throttle:register')->name('account.register.store');
        Route::get('login', [AccountAuth::class, 'loginForm'])->name('account.login');
        Route::post('login', [AccountAuth::class, 'login'])->middleware('throttle:account-login')->name('account.login.store');
        Route::get('google', [App\Http\Controllers\Account\GoogleAuthController::class, 'redirect'])->middleware('throttle:20,1')->name('account.google');
        Route::get('google/callback', [App\Http\Controllers\Account\GoogleAuthController::class, 'callback'])->middleware('throttle:20,1')->name('account.google.callback');
        Route::get('forgot-password', [AccountAuth::class, 'forgotForm'])->name('account.password.request');
        Route::post('forgot-password', [AccountAuth::class, 'sendResetLink'])->middleware('throttle:password-email')->name('account.password.email');
        Route::get('reset-password/{token}', [AccountAuth::class, 'resetForm'])->name('account.password.reset');
        Route::post('reset-password', [AccountAuth::class, 'reset'])->middleware('throttle:password-email')->name('account.password.update');
    });
    Route::get('verify/{id}/{hash}', [AccountAuth::class, 'verify'])->whereNumber('id')->middleware('throttle:20,1')->name('account.verify');
    Route::middleware('auth')->group(function () {
        Route::get('/', [AccountHome::class, 'index'])->name('account.home');
        Route::post('logout', [AccountAuth::class, 'logout'])->name('account.logout');
        Route::post('verify/resend', [AccountAuth::class, 'resendVerification'])->middleware('throttle:verify-resend')->name('account.verify.resend');
        Route::post('students', [AccountHome::class, 'storeStudent'])->name('account.students.store');
        Route::put('students/{student}', [AccountHome::class, 'updateStudent'])->name('account.students.update');
        Route::delete('students/{student}', [AccountHome::class, 'destroyStudent'])->name('account.students.destroy');
        Route::get('students/{student}/report', [App\Http\Controllers\ReportController::class, 'parent'])->name('account.report');
        Route::post('students/{student}/report/share', [App\Http\Controllers\ReportController::class, 'share'])->middleware('throttle:10,1')->name('account.report.share');
        Route::delete('students/{student}/report/share', [App\Http\Controllers\ReportController::class, 'unshare'])->name('account.report.unshare');
        Route::get('subscribe', [AccountHome::class, 'subscribe'])->name('account.subscribe');
        Route::post('subscribe', [AccountHome::class, 'requestSubscription'])->middleware('throttle:10,1')->name('account.subscribe.store');
    });
});
// Read-only progress report share link (unguessable 40-char token, revocable by the parent).
Route::get('/report/{token}', [App\Http\Controllers\ReportController::class, 'shared'])->middleware('throttle:30,1')->name('report.shared');

// Named so Laravel's password broker can build links.
Route::get('/password-reset/{token}', fn (string $token) => redirect()->route('account.password.reset', ['token' => $token] + request()->query()))->name('password.reset');

// ---- Progress sync API for the static site (same origin: /admin-api/api/...) ----
Route::prefix('api')->middleware('throttle:api-sync')->group(function () {
    Route::get('site', [SyncController::class, 'site']);
    Route::get('public/prices', [SyncController::class, 'prices']);
    Route::get('session', [SyncController::class, 'session']);
    Route::middleware('auth')->group(function () {
        Route::post('students', [SyncController::class, 'storeStudent']);
        Route::get('students/{student}/progress', [SyncController::class, 'show']);
        Route::put('students/{student}/progress', [SyncController::class, 'update']);
        Route::post('students/{student}/import', [SyncController::class, 'import']);
    });
});

// ---- Management panel (admin + teacher; some sections admin only) ----
Route::prefix('admin/manage')->middleware(['auth', 'can:access-admin'])->group(function () {
    Route::get('/', [Manage::class, 'dashboard'])->name('manage.dashboard');
    Route::get('students', [Manage::class, 'students'])->name('manage.students');
    Route::get('students/{student}', [Manage::class, 'student'])->name('manage.student');
    Route::get('students/{student}/report', [App\Http\Controllers\ReportController::class, 'staff'])->name('manage.student.report');
    Route::middleware('can:manage-site')->group(function () {
        Route::put('students/{student}', [Manage::class, 'updateStudent'])->name('manage.student.update');
        Route::delete('students/{student}', [Manage::class, 'destroyStudent'])->name('manage.student.destroy');
        Route::get('users', [Manage::class, 'users'])->name('manage.users');
        Route::post('users/bulk', [Manage::class, 'bulkUsers'])->name('manage.users.bulk');
        Route::post('subscriptions/bulk', [Manage::class, 'bulkSubscriptions'])->name('manage.subscriptions.bulk');
        Route::get('users/{user}', [Manage::class, 'editUser'])->name('manage.user');
        Route::put('users/{user}', [Manage::class, 'updateUser'])->name('manage.user.update');
        Route::post('users/{user}/devices/revoke', [Manage::class, 'revokeDevices'])->name('manage.user.devices');
        Route::post('users/{user}/toggle', [Manage::class, 'toggleUser'])->name('manage.user.toggle');
        Route::delete('users/{user}', [Manage::class, 'destroyUser'])->name('manage.user.destroy');
        Route::post('users/{user}/password', [Manage::class, 'passwordUser'])->name('manage.user.password');
        Route::post('users/{user}/trial', [Manage::class, 'trialUser'])->name('manage.user.trial');
        Route::post('users/{user}/verify', [Manage::class, 'verifyUser'])->name('manage.user.verify');
        Route::get('mail', [Manage::class, 'mail'])->name('manage.mail');
        Route::put('mail', [Manage::class, 'updateMail'])->name('manage.mail.update');
        Route::post('mail/test', [Manage::class, 'testMail'])->middleware('throttle:10,1')->name('manage.mail.test');
        Route::post('users/{user}/grant', [Manage::class, 'grantSubscription'])->name('manage.user.grant');
        Route::get('subscriptions', [Manage::class, 'subscriptions'])->name('manage.subscriptions');
        Route::post('subscriptions/{subscription}/activate', [Manage::class, 'activateSubscription'])->name('manage.subscription.activate');
        Route::post('subscriptions/{subscription}/cancel', [Manage::class, 'cancelSubscription'])->name('manage.subscription.cancel');
        Route::get('settings', [Manage::class, 'settings'])->name('manage.settings');
        Route::put('settings', [Manage::class, 'updateSettings'])->name('manage.settings.update');
        Route::get('activity', [Manage::class, 'activity'])->name('manage.activity');
        Route::get('export/{type}', [Manage::class, 'export'])->name('manage.export');
    });
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// One-time setup (disabled unless SETUP_TOKEN has 32+ chars). See DEPLOY-AR.md.
// Stateless: no session/cookies, so it works before the sessions table exists.
Route::withoutMiddleware([
    Illuminate\Session\Middleware\StartSession::class,
    Illuminate\View\Middleware\ShareErrorsFromSession::class,
    Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    Illuminate\Cookie\Middleware\EncryptCookies::class,
])->group(function () {
    Route::post('/setup/migrate', [App\Http\Controllers\SetupController::class, 'migrate']);
    Route::post('/setup/install', [App\Http\Controllers\SetupController::class, 'install']);
    Route::post('/setup/admin', [App\Http\Controllers\SetupController::class, 'admin']);
});
