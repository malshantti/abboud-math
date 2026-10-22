<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;

/** Trial and subscription entitlement for an account. */
class Access
{
    public static function normalizedEmailHash(string $email): string
    {
        $email = strtolower(trim($email));
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $local = explode('+', $local, 2)[0];
        if (in_array($domain, ['gmail.com', 'googlemail.com'], true)) {
            $local = str_replace('.', '', $local);
            $domain = 'gmail.com';
        }

        return hash('sha256', $local.'@'.$domain);
    }

    /** Subject codes (e.g. g6-math) the account has paid for and that are still running. */
    public static function paidSubjects(User $user): array
    {
        return $user->subscriptions()->where('status', 'active')->where('ends_at', '>', now()->subDays(Setting::int('grace_days', 0, 60)))->pluck('plan')->unique()->values()->all();
    }

    /** Active subscriptions that end within the reminder window (or are in their grace days). */
    public static function expiringSoon(User $user): array
    {
        $days = Setting::int('reminder_days', 0, 60);
        if ($days === 0 && Setting::int('grace_days', 0, 60) === 0) {
            return [];
        }

        return $user->subscriptions()->where('status', 'active')
            ->where('ends_at', '>', now()->subDays(Setting::int('grace_days', 0, 60)))->where('ends_at', '<=', now()->addDays($days))
            ->orderBy('ends_at')->get()
            ->map(fn ($s) => ['code' => $s->plan, 'name' => $s->plan_name, 'ends_at' => $s->ends_at->toIso8601String(), 'grace' => $s->ends_at->isPast()])->all();
    }

    /**
     * kind: staff | open (gating off) | trial (all subjects) | paid (only listed subjects) | expired.
     * subjects: null = every subject; otherwise the allowed codes.
     */
    public static function state(User $user): array
    {
        if ($user->isStaff() || ! Setting::flag('gating_enabled')) {
            return ['access' => true, 'kind' => $user->isStaff() ? 'staff' : 'open', 'ends_at' => null, 'subjects' => null];
        }
        if (Setting::flag('require_verification') && ! $user->isVerified()) {
            return ['access' => false, 'kind' => 'unverified', 'ends_at' => null, 'subjects' => []];
        }
        if ($user->trial_ends_at && $user->trial_ends_at->isFuture()) {
            return ['access' => true, 'kind' => 'trial', 'ends_at' => $user->trial_ends_at, 'subjects' => null];
        }
        $paid = static::paidSubjects($user);

        return ['access' => $paid !== [], 'kind' => $paid ? 'paid' : 'expired', 'ends_at' => null, 'subjects' => $paid];
    }

    public static function allows(User $user, string $subject): bool
    {
        $s = static::state($user);

        return $s['subjects'] === null || in_array($subject, $s['subjects'], true);
    }
}
