<?php

use App\Http\Middleware\PrivateAdminResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trimStrings(except: [fn (Request $request) => $request->is('admin/api/*')]);
        $middleware->convertEmptyStringsToNull(except: [fn (Request $request) => $request->is('admin/api/*')]);
        $middleware->web(prepend: [PrivateAdminResponse::class], append: [App\Http\Middleware\LogoutDisabledUsers::class]);
        $middleware->redirectGuestsTo(fn (Request $r) => $r->is('api/*') ? null : ($r->is('admin', 'admin/*') ? route('login') : route('account.login')));
        $middleware->redirectUsersTo(fn (Request $r) => \App\Support\Landing::isStaff($r->user()) ? route('manage.dashboard') : route('account.home'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // A signed-in non-staff user (parent) who opens an admin URL goes to their account instead of the bare 403.
        $exceptions->render(function (Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, Request $r) {
            $user = $r->user();
            if ($user && ! $r->expectsJson() && $r->isMethod('GET') && $r->is('admin', 'admin/*') && ! $r->is('admin/api/*', 'admin/assets/*') && ! App\Support\Landing::isStaff($user)) {
                return redirect()->route('account.home');
            }
        });
    })->create();
