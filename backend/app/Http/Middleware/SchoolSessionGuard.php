<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/** A teacher's «logout + new PIN» signs a school student out of every device on its next request. */
class SchoolSessionGuard
{
    public function handle(Request $request, Closure $next): Response
    {
        $u = $request->user();
        if ($u && $u->role === 'school' && $u->school_role === 'student' && $u->school_logout_at
            && (int) $request->session()->get('school_login_at', 0) < $u->school_logout_at->getTimestamp()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            if ($request->expectsJson() || $request->is('api/*')) {
                return $request->is('api/session') ? $next($request) : response()->json(['message' => 'انتهت الجلسة. ادخل من جديد برقمك السري.'], 401);
            }
        }

        return $next($request);
    }
}
