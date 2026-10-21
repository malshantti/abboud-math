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
        return $user->subscriptions()->where('status', 'active')->where('ends_at', '>', now())->pluck('plan')->unique()->values()->all();
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
