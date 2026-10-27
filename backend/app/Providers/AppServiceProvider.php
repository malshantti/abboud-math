<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Ar;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('access-admin', fn (User $user): bool => ! $user->isDisabled() && $user->isStaff());
        Gate::define('manage-site', fn (User $user): bool => ! $user->isDisabled() && $user->isAdminRole());

        $key = fn (Request $r) => (string) $r->ip();
        RateLimiter::for('register', fn (Request $r) => [Limit::perMinute(5)->by($key($r)), Limit::perDay(30)->by($key($r))]);
        RateLimiter::for('account-login', fn (Request $r) => Limit::perMinute(20)->by($key($r)));
        RateLimiter::for('password-email', fn (Request $r) => [Limit::perMinute(3)->by($key($r).'|'.strtolower((string) $r->input('email'))), Limit::perHour(20)->by($key($r))]);
        RateLimiter::for('verify-resend', fn (Request $r) => [Limit::perMinutes(10, 3)->by('u'.$r->user()?->id), Limit::perDay(10)->by('u'.$r->user()?->id)]);
        RateLimiter::for('funnel', fn (Request $r) => [Limit::perMinute(60)->by('f'.$key($r)), Limit::perDay(3000)->by('f'.$key($r))]);
        RateLimiter::for('api-sync', fn (Request $r) => Limit::perMinute(120)->by($r->user()?->id ?: $key($r)));

        View::share('ar', new Ar);

        // Session length from the settings center (minutes); empty keeps the server default.
        try {
            $m = (int) \App\Models\Setting::get('session_minutes');
            if ($m >= 15 && $m <= 525600) {
                config(['session.lifetime' => $m]);
            }
        } catch (\Throwable) {
        }
    }
}
