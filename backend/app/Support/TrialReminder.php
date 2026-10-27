<?php

namespace App\Support;

use App\Models\User;

/** Reminder before the free trial ends: email (MailCenter type trial_reminder) + Web Push when the family has devices. Once per account. */
class TrialReminder
{
    /** @return array{candidates:int,emailed:int,pushed:int} */
    public static function run(int $hours = 24): array
    {
        $out = ['candidates' => 0, 'emailed' => 0, 'pushed' => 0];
        $users = User::parents()->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', now())->where('trial_ends_at', '<=', now()->addHours(max(1, $hours)))
            ->whereDoesntHave('subscriptions', fn ($q) => $q->where('status', 'active')->where('ends_at', '>', now()))
            ->get();
        foreach ($users as $u) {
            if ($u->isDisabled() || \App\Models\MailLog::where('user_id', $u->id)->where('type', 'trial_reminder')->where('is_test', false)->whereIn('status', ['sent', 'disabled'])->exists()) {
                continue;
            }
            $out['candidates']++;
            $until = Ar::date($u->trial_ends_at);
            $log = MailCenter::send('trial_reminder', $u, route('account.subscribe'), false, null, ['until' => $until]);
            if ($log->status === 'sent') {
                $out['emailed']++;
            }
            try {
                if ($u->pushSubscriptions()->exists()) {
                    $out['pushed'] += Reminders::push($u, ['title' => 'بستان التعلّم', 'body' => 'تنتهي التجربة المجانية في '.$until.'. اشترك ليستمر التعلّم 🌱', 'url' => '/admin-api/account/subscribe', 'tag' => 'trial-ending']);
                }
            } catch (\Throwable $e) {
                report($e);
            }
            Funnel::log('trial_reminder', ['user_id' => $u->id, 'visitor_id' => null, 'source' => null, 'meta' => ['until' => $u->trial_ends_at->toDateString(), 'mail' => $log->status]]);
        }

        return $out;
    }
}
