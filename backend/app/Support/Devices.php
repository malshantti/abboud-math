<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * One active device per account: the latest login wins. The device token lives in a long-lived
 * encrypted cookie (so «remember me» and an expired session on the same device keep working)
 * and on the user row. A device whose cookie no longer matches is signed out on its next request.
 */
class Devices
{
    public const COOKIE = 'bustan_device';

    public const MESSAGE = 'تم تسجيل الدخول إلى هذا الحساب من جهاز آخر، لذلك أُغلقت الجلسة هنا.';

    /** This device's token: the long-lived cookie, or the session copy (same device, cookie not yet stored). */
    public static function current(Request $request): string
    {
        return (string) ($request->cookie(self::COOKIE) ?: $request->session()->get(self::COOKIE, ''));
    }

    /** A guest whose device cookie no longer belongs to any account was signed out by a newer login (or by an admin). */
    public static function revokedGuest(Request $request): bool
    {
        $mine = (string) $request->cookie(self::COOKIE, '');
        if ($mine === '' || User::where('active_device_token', $mine)->exists()) {
            return false;
        }
        Cookie::queue(Cookie::forget(self::COOKIE));

        return true;
    }

    public static function forget(): void
    {
        Cookie::queue(Cookie::forget(self::COOKIE));
    }

    public static function enforced(?User $user): bool
    {
        return $user !== null && ! $user->isAdminRole() && Setting::flag('single_device');
    }

    /** Called on every successful login/registration. */
    public static function claim(Request $request, User $user): void
    {
        $token = Str::random(48);
        Cookie::queue(Cookie::make(self::COOKIE, $token, 60 * 24 * 400, null, null, null, true, false, 'lax'));
        $request->cookies->set(self::COOKIE, $token);
        $request->session()->put(self::COOKIE, $token);
        $user->forceFill(['active_device_token' => $token, 'active_device_ua' => Str::limit((string) $request->userAgent(), 250, ''), 'active_device_seen_at' => now()])->save();
        if (self::enforced($user)) {
            self::dropSessions($user, $request->session()->getId());
        }
    }

    /** Admin action: every device is signed out (including remembered logins). */
    public static function revokeAll(User $user): void
    {
        $user->forceFill(['active_device_token' => 'revoked:'.Str::random(40), 'remember_token' => Str::random(60)])->save();
        self::dropSessions($user, null);
    }

    private static function dropSessions(User $user, ?string $keep): void
    {
        if (config('session.driver') !== 'database') {
            return;
        }
        $q = DB::table(config('session.table', 'sessions'))->where('user_id', $user->id);
        if ($keep) {
            $q->where('id', '!=', $keep);
        }
        $q->delete();
    }
}
