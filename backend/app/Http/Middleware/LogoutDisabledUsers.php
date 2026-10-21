<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogoutDisabledUsers
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && $user->disabled_at !== null) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'الحساب معطّل.'], 403);
            }

            return redirect()->route('account.login')->withErrors(['email' => 'هذا الحساب معطّل. تواصل مع إدارة الموقع.']);
        }

        return $next($request);
    }
}
