<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Maintenance mode for the parent/student area. Staff bypass it; sign-in pages stay open so admins can log in. */
class StudentMaintenance
{
    private const OPEN = ['account/login', 'account/logout', 'account/forgot-password', 'account/reset-password/*', 'account/verify/*', 'password-reset/*'];

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is('account', 'account/*') || $request->is(...self::OPEN) || ! Setting::flag('maintenance_on')) {
            return $next($request);
        }
        $user = $request->user();
        if ($user && ! $user->isDisabled() && $user->isStaff()) {
            return $next($request);
        }

        return response()->view('account.maintenance', ['message' => Setting::get('maintenance_message')], 503)->header('Retry-After', '1800');
    }
}
