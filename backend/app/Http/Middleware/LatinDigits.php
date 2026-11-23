<?php

namespace App\Http\Middleware;

use App\Support\Ar;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** The admin panel shows Western digits (0–9); family-facing pages, emails and messages keep Arabic-Indic digits. */
class LatinDigits
{
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->is('admin', 'admin/*');
        Ar::useLatinDigits($admin);
        try {
            return $next($request);
        } finally {
            Ar::useLatinDigits(false);
        }
    }
}
