<?php

namespace App\Http\Middleware;

use App\Support\Devices;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/** Latest login wins: an older device is signed out on its next request (admins are exempt). */
class SingleDevice
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }
        $mine = (string) $request->cookie(Devices::COOKIE, '');
        $held = (string) $request->session()->get(Devices::COOKIE, '');
        $active = (string) $user->active_device_token;
        if ($active === '') {
            Devices::claim($request, $user); // accounts signed in before this feature: this device becomes the active one

            return $next($request);
        }
        if (Devices::enforced($user) && ! hash_equals($active, $mine) && ! hash_equals($active, $held)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $request->attributes->set('device_revoked', true);
            if ($request->is('api/session')) {
                return $next($request); // answers authenticated:false, revoked:true
            }
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => Devices::MESSAGE, 'revoked' => true], 401);
            }

            return redirect()->route($request->is('admin', 'admin/*') ? 'login' : 'account.login')->withErrors(['email' => Devices::MESSAGE]);
        }
        if ((hash_equals($active, $mine) || hash_equals($active, $held)) && (! $user->active_device_seen_at || $user->active_device_seen_at->lt(now()->subMinute()))) {
            $user->forceFill(['active_device_seen_at' => now()])->saveQuietly();
        }

        return $next($request);
    }
}
