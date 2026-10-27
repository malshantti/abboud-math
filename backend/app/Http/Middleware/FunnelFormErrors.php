<?php

namespace App\Http\Middleware;

use App\Support\Funnel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** After a family form post that bounced back with validation errors, note which form and which fields (no values). */
class FunnelFormErrors
{
    private const FORMS = [
        'account.register.store' => 'register', 'account.login.store' => 'login', 'account.students.store' => 'child',
        'account.subscribe.store' => 'subscribe', 'account.password.email' => 'forgot', 'account.password.update' => 'reset',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        try {
            $name = $request->route()?->getName();
            if ($request->isMethod('POST') && isset(self::FORMS[$name]) && $response->isRedirection() && $request->hasSession()) {
                $errors = $request->session()->get('errors');
                if ($errors instanceof \Illuminate\Support\ViewErrorBag && $errors->any()) {
                    $user = $request->user();
                    if (! $user || ! $user->isStaff()) {
                        Funnel::log('form_error', ['page' => self::FORMS[$name], 'meta' => ['fields' => implode(',', array_slice($errors->getBag('default')->keys(), 0, 6))]]);
                    }
                }
            }
        } catch (\Throwable) {
        }

        return $response;
    }
}
