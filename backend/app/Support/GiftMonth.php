<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * «شهر هدية»: every child on an existing family account gets 30 free days on every subject of their grade.
 * Paid subjects are extended from their current end; trial accounts start after the trial ends.
 * Gift rows are normal subscriptions (gateway=gift, price 0, batch=BATCH) so Access/expiry work unchanged,
 * and the run is idempotent: a family that already has a row of this batch is skipped.
 */
class GiftMonth
{
    public const BATCH = 'GIFT-2610';

    public const DAYS = 30;

    /** Families eligible: real parent accounts, not disabled, created before the cutoff, with at least one child in a grade that has subjects. */
    public static function plan(?Carbon $now = null, ?Carbon $cutoff = null, array $only = []): array
    {
        $now ??= now();
        $catalog = Setting::catalog();
        $out = [];
        $q = User::query()->parents()->real()->whereNull('disabled_at')->with(['students' => fn ($s) => $s->orderBy('id')])->orderBy('id');
        if ($cutoff) {
            $q->where('created_at', '<=', $cutoff);
        }
        if ($only) {
            $q->whereIn('id', $only);
        }
        foreach ($q->get() as $u) {
            $already = Subscription::where('user_id', $u->id)->where('batch', self::BATCH)->exists();
            $children = [];
            $plans = [];
            foreach ($u->students as $s) {
                $codes = array_keys(array_filter($catalog, fn ($c) => (int) $c[0] === (int) $s->grade));
                $children[] = ['id' => $s->id, 'name' => $s->name, 'grade' => $s->grade, 'grade_name' => Ar::grade($s->grade), 'subjects' => array_map(fn ($c) => $catalog[$c][1], $codes)];
                foreach ($codes as $c) {
                    $plans[$c] ??= $s->id; // access is per account+subject: one row per subject, linked to the first child of that grade
                }
            }
            $rows = [];
            foreach ($plans as $code => $sid) {
                $cur = Subscription::where('user_id', $u->id)->where('plan', $code)->where('status', 'active')->where('ends_at', '>', $now)->max('ends_at');
                $base = $cur ? Carbon::parse($cur) : $now->copy();
                $kind = $cur ? 'extend' : 'new';
                if (! $cur && $u->trial_ends_at && $u->trial_ends_at->gt($base)) {
                    $base = $u->trial_ends_at->copy();
                    $kind = 'after_trial';
                }
                $rows[] = ['plan' => $code, 'plan_name' => $catalog[$code][1].' — '.Ar::grade($catalog[$code][0]), 'student_id' => $sid, 'kind' => $kind,
                    'current_end' => $cur ? Carbon::parse($cur)->toIso8601String() : null, 'starts_at' => $base->toIso8601String(), 'ends_at' => $base->copy()->addDays(self::DAYS)->toIso8601String()];
            }
            $out[] = ['user_id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'trial_ends_at' => $u->trial_ends_at?->toIso8601String(),
                'skip' => $already ? 'already_gifted' : ($rows ? null : 'no_children'), 'children' => $children, 'rows' => $rows];
        }

        return $out;
    }

    /** Writes the gift rows in one transaction. Returns the number of subscription rows created. */
    public static function apply(array $plan): int
    {
        $n = 0;
        DB::transaction(function () use ($plan, &$n) {
            foreach ($plan as $f) {
                if ($f['skip'] || Subscription::where('user_id', $f['user_id'])->where('batch', self::BATCH)->lockForUpdate()->exists()) {
                    continue;
                }
                foreach ($f['rows'] as $r) {
                    $s = new Subscription(['code' => 'GFT-'.strtoupper(bin2hex(random_bytes(4))), 'batch' => self::BATCH, 'plan' => $r['plan'], 'plan_name' => $r['plan_name'],
                        'price' => 0, 'currency' => (string) Setting::get('currency'), 'days' => self::DAYS, 'scope' => $r['plan'], 'gateway' => 'gift', 'status' => 'active',
                        'student_id' => $r['student_id'], 'note' => 'هدية شهر مجاني لجميع مواد الصف']);
                    $s->user_id = $f['user_id'];
                    $s->forceFill(['starts_at' => Carbon::parse($r['starts_at']), 'ends_at' => Carbon::parse($r['ends_at'])])->save();
                    $n++;
                }
                \App\Models\ActivityLog::record('subscription.gift', 'user#'.$f['user_id'], count($f['rows']).' subjects');
            }
        });

        return $n;
    }

    /** Gift details for one account, from the applied rows (null when the account has no gift). */
    public static function forUser(User $u): ?array
    {
        $rows = Subscription::where('user_id', $u->id)->where('batch', self::BATCH)->where('status', 'active')->get();
        if ($rows->isEmpty()) {
            return null;
        }
        $catalog = Setting::catalog();
        $codes = $rows->pluck('plan')->all();
        $children = [];
        foreach ($u->students()->orderBy('id')->get() as $s) {
            $mine = $rows->filter(fn ($r) => (int) ($catalog[$r->plan][0] ?? 0) === (int) $s->grade);
            if ($mine->isEmpty()) {
                continue;
            }
            $children[] = ['name' => $s->name, 'grade' => Ar::grade($s->grade), 'subjects' => $mine->map(fn ($r) => $catalog[$r->plan][1] ?? $r->plan)->values()->all(),
                'until' => Ar::date($mine->max('ends_at'), false), 'extended' => Subscription::where('user_id', $u->id)->whereIn('plan', $mine->pluck('plan'))->where('status', 'active')->where(fn ($q) => $q->whereNull('batch')->orWhere('batch', '!=', self::BATCH))->exists()];
        }

        return ['children' => $children, 'until' => Ar::date($rows->max('ends_at'), false), 'codes' => $codes];
    }

    /** Text pieces for the gift email (placeholders {student} {subjects} {until} {gift_intro}). */
    public static function mailExtra(User $u): ?array
    {
        $g = self::forUser($u);
        if (! $g || ! $g['children']) {
            return null;
        }
        $lines = array_map(fn ($c) => '• '.$c['name'].' — '.$c['grade'].': '.implode('، ', $c['subjects']).' (حتى '.$c['until'].')', $g['children']);
        $paid = collect($g['children'])->contains('extended', true);
        $names = array_column($g['children'], 'name');
        $many = count($names) > 1;

        return ['to_kids' => $many ? 'لأطفالكم' : 'لطفلكم', 'kid' => $many ? 'أطفالكم' : 'طفلكم', 'student' => self::join($names), 'subjects' => implode("\n", $lines), 'until' => $g['until'],
            'gift_intro' => 'تقديرًا لثقتكم، فعّلنا '.($many ? 'لأطفالكم' : 'لطفلكم').' شهرًا مجانيًا كاملًا على جميع مواد '.($many ? 'صفوفهم' : 'صفّه')
                .($paid ? '، وأضفناه إلى ما تبقّى من اشتراككم الحالي دون أي تكلفة.' : '.')];
    }

    public static function join(array $names): string
    {
        if (count($names) < 2) {
            return (string) ($names[0] ?? '');
        }
        $last = array_pop($names);

        return implode('، ', $names).' و'.$last;
    }

    /** On-site notice payload: only when the flag is on, the account has a gift and has not dismissed it. */
    public static function notice(User $u): ?array
    {
        if (! Setting::flag('gift_notice_on') || $u->gift_notice_seen_at || $u->isStaff()) {
            return null;
        }
        $g = self::forUser($u);
        if (! $g || ! $g['children']) {
            return null;
        }

        return ['id' => self::BATCH, 'until' => $g['until'], 'children' => $g['children'], 'many' => count($g['children']) > 1, 'whatsapp' => 'https://wa.me/'.MailCenter::whatsapp()];
    }
}
