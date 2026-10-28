<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Read-only view model for the admin subscriptions page: summary numbers, pending requests
 * (grouped by request batch) and one card per family with each child's subjects and problems.
 */
class SubscriptionBoard
{
    public const TZ = 'Asia/Hebron';

    /** Display states of one subject row. */
    public const STATES = [
        'pending' => ['بانتظار الدفع', 'warn'],
        'trial' => ['تجربة', 'sky'],
        'active' => ['فعّال', ''],
        'expired' => ['منتهي', 'grey'],
        'cancelled' => ['ملغى', 'bad'],
    ];

    public const FILTERS = ['pending' => 'بانتظار الدفع', 'active' => 'فعّال', 'trial' => 'تجربة', 'expiring' => 'ينتهي خلال ٧ أيام', 'expired' => 'منتهي', 'cancelled' => 'ملغى', 'problems' => 'فيها ملاحظات'];

    public static function planLabel(string $plan, ?string $fallback = null): string
    {
        $cat = Setting::catalog();
        if (isset($cat[$plan])) {
            return $cat[$plan][1].' — '.Ar::grade($cat[$plan][0]);
        }

        return $fallback ?: $plan;
    }

    public static function planGrade(string $plan): ?int
    {
        $cat = Setting::catalog();
        if (isset($cat[$plan])) {
            return (int) $cat[$plan][0];
        }

        return preg_match('/^g(\d+)-/', $plan, $m) ? (int) $m[1] : null;
    }

    public static function planSubject(string $plan, ?string $fallback = null): string
    {
        $cat = Setting::catalog();

        return $cat[$plan][1] ?? ($fallback ? preg_replace('/\s*—.*$/u', '', $fallback) : $plan);
    }

    public static function state(Subscription $s): string
    {
        if ($s->status === 'active' && $s->ends_at && $s->ends_at->isPast()) {
            return 'expired';
        }

        return array_key_exists($s->status, self::STATES) ? $s->status : 'cancelled';
    }

    public static function daysLeft(?Carbon $end): ?int
    {
        if (! $end) {
            return null;
        }

        $d = now()->diffInSeconds($end, false) / 86400;

        return (int) ($d >= 0 ? ceil($d) : floor($d));
    }

    public static function summary(): array
    {
        $now = now();
        $monthStart = $now->copy()->timezone(self::TZ)->startOfMonth()->utc();
        $pending = Subscription::where('status', 'pending');

        return [
            'active' => Subscription::where('status', 'active')->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now))->count(),
            'active_families' => Subscription::where('status', 'active')->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now))->distinct()->count('user_id'),
            'trials' => User::parents()->real()->where('trial_ends_at', '>', $now)->count(),
            'pending' => (clone $pending)->count(),
            'pending_requests' => (clone $pending)->get(['id', 'batch'])->map(fn ($s) => $s->batch ?: 'id'.$s->id)->unique()->count(),
            'pending_total' => (int) (clone $pending)->sum('price'),
            'expiring' => Subscription::where('status', 'active')->whereBetween('ends_at', [$now, $now->copy()->addDays(7)])->count(),
            'revenue_month' => (int) Subscription::whereIn('status', ['active', 'expired'])->where('starts_at', '>=', $monthStart)->sum('price'),
            'revenue_count' => Subscription::whereIn('status', ['active', 'expired'])->where('starts_at', '>=', $monthStart)->count(),
            'currency' => Setting::get('currency') ?: 'شيكل',
        ];
    }

    /** Pending requests grouped by batch (one WhatsApp request = one group). */
    public static function pendingRequests(): Collection
    {
        return Subscription::with(['user', 'student'])->where('status', 'pending')->orderBy('created_at')->get()
            ->groupBy(fn ($s) => $s->batch ?: 'single-'.$s->id)
            ->map(function (Collection $rows) {
                $first = $rows->first();

                return (object) [
                    'key' => $first->batch ?: $first->code,
                    'ids' => $rows->pluck('id')->all(),
                    'rows' => $rows,
                    'user' => $first->user,
                    'student' => $first->student,
                    'subjects' => $rows->map(fn ($s) => self::planSubject($s->plan, $s->plan_name))->all(),
                    'grades' => $rows->map(fn ($s) => self::planGrade($s->plan))->filter()->unique()->values()->all(),
                    'total' => (int) $rows->sum('price'),
                    'currency' => $first->currency,
                    'created_at' => $rows->min('created_at'),
                    'days' => (int) $rows->max('days'),
                ];
            })->values();
    }

    /**
     * Family cards. Each: user, children[] (student, items[], trial), orphans[] (rows without a child), problems[].
     */
    public static function families(array $f): Collection
    {
        $subs = Subscription::with('user')->orderBy('id')->get();
        $userIds = $subs->pluck('user_id')->merge(User::parents()->real()->where('trial_ends_at', '>', now())->pluck('id'))->unique()->filter();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');
        $students = Student::whereIn('user_id', $userIds)->orderBy('id')->get()->groupBy('user_id');
        $bySub = $subs->groupBy('user_id');

        $out = collect();
        foreach ($users as $uid => $u) {
            $rows = $bySub->get($uid, collect());
            $kids = $students->get($uid, collect());
            $trial = $u->trial_ends_at && $u->trial_ends_at->isFuture() ? $u->trial_ends_at : null;
            $problems = [];
            $children = [];
            foreach ($kids as $k) {
                $items = $rows->where('student_id', $k->id)->map(fn ($s) => self::item($s, $k))->values();
                foreach ($items as $it) {
                    if ($it->mismatch) {
                        $problems[] = 'مادة «'.$it->label.'» لا تطابق صف '.$k->name.' ('.Ar::grade($k->grade).').';
                    }
                }
                $children[] = (object) ['student' => $k, 'items' => $items, 'trial' => $trial];
            }
            $orphans = $rows->filter(fn ($s) => ! $s->student_id || ! $kids->contains('id', $s->student_id))->map(fn ($s) => self::item($s, null))->values();
            if ($orphans->isNotEmpty()) {
                $problems[] = Ar::num($orphans->count()).' اشتراك غير مربوط بطفل محدد.';
            }
            // Duplicates: two live (pending/active) rows for the same subject and child.
            $dupIds = [];
            $live = $rows->filter(fn ($s) => in_array(self::state($s), ['pending', 'active'], true));
            foreach ($live->groupBy(fn ($s) => $s->plan.'|'.($s->student_id ?: 0)) as $grp) {
                if ($grp->count() > 1) {
                    $problems[] = 'مكرر: '.self::planLabel($grp->first()->plan, $grp->first()->plan_name).' ('.Ar::num($grp->count()).' مرات'.($grp->pluck('status')->unique()->count() > 1 ? '، منها طلب بانتظار الدفع لمادة مفعّلة' : '').').';
                    foreach ($grp as $s) {
                        $dupIds[$s->id] = true;
                    }
                }
            }
            foreach ($children as $c) {
                $c->items->each(fn ($it) => $it->dup = isset($dupIds[$it->sub->id]));
            }
            $orphans->each(fn ($it) => $it->dup = isset($dupIds[$it->sub->id]));

            $states = $rows->map(fn ($s) => self::state($s))->unique()->values()->all();
            if ($trial) {
                $states[] = 'trial';
            }
            $out->push((object) [
                'user' => $u, 'children' => $children, 'orphans' => $orphans, 'problems' => $problems, 'trial' => $trial,
                'states' => $states, 'rows' => $rows, 'grades' => $kids->pluck('grade')->merge($rows->map(fn ($s) => self::planGrade($s->plan)))->filter()->unique()->all(),
                'expiring' => $rows->contains(fn ($s) => $s->status === 'active' && $s->ends_at && $s->ends_at->isFuture() && $s->ends_at->lt(now()->addDays(7))),
                'last' => $rows->max('created_at') ?? $u->created_at,
                'pending' => in_array('pending', $states, true),
            ]);
        }

        return $out->filter(fn ($fam) => self::matches($fam, $f))
            ->sortBy([fn ($a, $b) => $b->pending <=> $a->pending, fn ($a, $b) => (count($b->problems) > 0) <=> (count($a->problems) > 0), fn ($a, $b) => $b->last <=> $a->last])->values();
    }

    protected static function item(Subscription $s, ?Student $k): object
    {
        $g = self::planGrade($s->plan);
        $state = self::state($s);

        return (object) [
            'sub' => $s, 'state' => $state, 'label' => self::planLabel($s->plan, $s->plan_name), 'subject' => self::planSubject($s->plan, $s->plan_name), 'grade' => $g,
            'mismatch' => $k && $k->grade && $g && (int) $k->grade !== $g,
            'days_left' => in_array($state, ['active', 'expired'], true) ? self::daysLeft($s->ends_at) : null,
            'dup' => false,
        ];
    }

    protected static function matches(object $fam, array $f): bool
    {
        if (($st = $f['status'] ?? '') !== '') {
            $ok = match ($st) {
                'expiring' => $fam->expiring,
                'problems' => count($fam->problems) > 0,
                default => in_array($st, $fam->states, true),
            };
            if (! $ok) {
                return false;
            }
        }
        if (($g = (int) ($f['grade'] ?? 0)) > 0 && ! in_array($g, array_map('intval', $fam->grades), true)) {
            return false;
        }
        if (($q = mb_strtolower(trim((string) ($f['q'] ?? '')))) !== '') {
            $hay = mb_strtolower(implode(' ', array_merge(
                [$fam->user->name, $fam->user->email],
                array_map(fn ($c) => $c->student->name, $fam->children),
                $fam->rows->flatMap(fn ($s) => [$s->code, $s->batch])->filter()->all(),
            )));
            if (! str_contains($hay, $q)) {
                return false;
            }
        }

        return true;
    }
}
