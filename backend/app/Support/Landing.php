<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/** Where a signed-in user belongs: staff go to the management panel, everyone else to their account. */
class Landing
{
    public static function isStaff(?User $user): bool
    {
        return $user !== null && Gate::forUser($user)->allows('access-admin');
    }

    public static function home(?User $user): string
    {
        return self::isStaff($user) ? route('manage.dashboard', absolute: false) : route('account.home', absolute: false);
    }

    /** True when a URL points at the admin area or the admin login, relative to the app base (e.g. /admin-api). */
    public static function isAdminUrl(Request $request, string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?? '';
        $base = rtrim($request->getBaseUrl(), '/');
        if ($base !== '' && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        $path = '/'.ltrim($path, '/');

        return (bool) preg_match('#^/(admin|login)(/|$)#i', $path);
    }

    /** Drop a remembered admin URL for a non-staff user so they never land on an admin 403 page. */
    public static function scrubIntended(Request $request): void
    {
        $intended = $request->session()->get('url.intended');
        if (is_string($intended) && ! self::isStaff($request->user()) && self::isAdminUrl($request, $intended)) {
            $request->session()->forget('url.intended');
        }
    }
}
