<?php

namespace App\Support;

use App\Models\PushSubscription;
use App\Models\Setting;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/** Daily "your lesson is ready" Web Push reminder: late afternoon Gaza time, at most one per account per day. */
class Reminders
{
    public const TZ = 'Asia/Gaza';

    public static function now(): CarbonImmutable
    {
        return CarbonImmutable::now(self::TZ);
    }

    /** Children of this account who have not studied today (Gaza day). */
    public static function idleStudents(User $user): array
    {
        $start = self::now()->startOfDay()->utc();
        $studied = DB::table('student_progress')->join('students', 'students.id', '=', 'student_progress.student_id')
            ->where('students.user_id', $user->id)->where('student_progress.updated_at', '>=', $start)
            ->distinct()->pluck('students.id')->all();

        return $user->students()->orderBy('id')->get()->reject(fn ($s) => in_array($s->id, $studied))->values()->all();
    }

    public static function message(User $user): ?array
    {
        $idle = self::idleStudents($user);
        if (! $idle) {
            return null; // every child already studied today
        }
        $names = array_map(fn ($s) => trim($s->name), array_slice($idle, 0, 2));
        $who = implode(' و', $names);

        return ['title' => 'بستان التعلّم', 'body' => $who.'، درسك اليوم جاهز في بستان 🌱', 'url' => '/?pwa=reminder', 'tag' => 'daily-reminder'];
    }

    /** Send to every device of one account. Removes gone subscriptions. Returns number delivered. */
    public static function push(User $user, array $data): int
    {
        $ok = 0;
        foreach (PushSubscription::where('user_id', $user->id)->get() as $sub) {
            $status = WebPush::send($sub->endpoint, $sub->p256dh, $sub->auth, $data);
            Log::channel('mail')->info('push.sent', ['user' => $user->id, 'sub' => $sub->id, 'status' => $status, 'host' => parse_url($sub->endpoint, PHP_URL_HOST)]);
            if ($status >= 200 && $status < 300) {
                $ok++;
                $sub->forceFill(['failures' => 0, 'last_sent_at' => now()])->save();
            } elseif (in_array($status, [404, 410], true)) {
                $sub->delete();
            } else {
                $sub->increment('failures');
                if ($sub->failures >= 5) {
                    $sub->delete();
                }
            }
        }

        return $ok;
    }

    /** @return array{sent:int,skipped:int,reason?:string} */
    public static function runDaily(bool $force = false): array
    {
        $now = self::now();
        $hour = (int) Setting::get('push_hour', '17');
        if (! $force && (! Setting::flag('push_enabled') || ! WebPush::configured())) {
            return ['sent' => 0, 'skipped' => 0, 'reason' => 'disabled'];
        }
        if (! $force && ($now->hour < $hour || $now->hour >= $hour + 3)) {
            return ['sent' => 0, 'skipped' => 0, 'reason' => 'outside window'];
        }
        $today = $now->toDateString();
        $sent = $skipped = 0;
        $users = User::whereHas('pushSubscriptions')->where('push_reminders', true)
            ->where(fn ($q) => $q->whereNull('last_reminder_on')->orWhere('last_reminder_on', '<', $today))->whereNull('disabled_at')->get();
        foreach ($users as $user) {
            $msg = self::message($user);
            if (! $msg) {
                $skipped++;

                continue;
            }
            $user->forceFill(['last_reminder_on' => $today])->save(); // at most one per day, even if a device fails
            self::push($user, $msg) > 0 ? $sent++ : $skipped++;
        }

        return ['sent' => $sent, 'skipped' => $skipped];
    }
}
