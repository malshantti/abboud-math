<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Up to LIMIT active devices per account (2 during the free month): a new login beyond that signs out the oldest. The device token lives in a long-lived
 * encrypted cookie (so «remember me» and an expired session on the same device keep working)
 * and on the user row. A device whose cookie no longer matches is signed out on its next request.
 */
class Devices
{
    public const COOKIE = 'bustan_device';

    /** Devices that may be signed in at the same time on one (non-admin) account. */
    public const LIMIT = 2;

    /** Tokens of the devices allowed right now (newest last). */
    public static function tokens(User $user): array
    {
        $list = json_decode((string) ($user->device_tokens ?? ''), true);
        $list = is_array($list) ? array_values(array_filter($list, 'is_string')) : [];
        $active = (string) $user->active_device_token;
        if ($active !== '' && ! in_array($active, $list, true)) {
            $list[] = $active;
        }

        return array_slice($list, -self::LIMIT);
    }

    public static function allows(User $user, string $token): bool
    {
        return $token !== '' && in_array($token, self::tokens($user), true);
    }

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
        if ($mine === '' || User::where('active_device_token', $mine)->orWhere('device_tokens', 'like', '%"'.$mine.'"%')->exists()) {
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
        $list = array_slice(array_merge(array_values(array_filter(self::tokens($user), fn ($t) => ! str_starts_with($t, 'revoked:'))), [$token]), -self::LIMIT);
        $user->forceFill(['device_tokens' => json_encode($list), 'active_device_token' => $token, 'active_device_ua' => Str::limit((string) $request->userAgent(), 250, ''), 'active_device_seen_at' => now()])->save();
        // Sessions are not dropped: the other allowed device stays signed in; a device pushed out
        // of the list is signed out on its next request by the SingleDevice middleware.
    }

    /** Admin action: every device is signed out (including remembered logins). */
    public static function revokeAll(User $user): void
    {
        $user->forceFill(['device_tokens' => null, 'active_device_token' => 'revoked:'.Str::random(40), 'remember_token' => Str::random(60)])->save();
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
