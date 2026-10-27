<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Funnel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

/** «رحلة العائلات»: where families drop off between the landing page and a paid subscription. */
class FunnelController extends Controller
{
    public const STUCK = [
        'no_child' => 'سجّل ولم يضف طفلًا',
        'no_lesson' => 'أضاف طفلًا ولم يفتح درسًا',
        'no_order' => 'فتح صفحة الاشتراك/اختار مواد ولم يرسل الطلب',
        'pending' => 'طلب بانتظار الدفع',
        'trial_over' => 'انتهت التجربة دون اشتراك',
    ];

    public const SOURCES = ['' => 'كل المصادر', 'fb' => 'إعلان فيسبوك/إنستغرام', 'other' => 'مصادر أخرى'];

    private function range(Request $request): array
    {
        $tz = config('app.display_timezone', 'Asia/Gaza');
        try {
            $from = $request->filled('from') ? Carbon::parse((string) $request->query('from'), $tz)->startOfDay() : now($tz)->subDays(6)->startOfDay();
            $to = $request->filled('to') ? Carbon::parse((string) $request->query('to'), $tz)->endOfDay() : now($tz)->endOfDay();
        } catch (\Throwable) {
            $from = now($tz)->subDays(6)->startOfDay();
            $to = now($tz)->endOfDay();
        }
        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        return [$from, $to];
    }

    /** Ids of real family accounts (parents, not test/QA emails). */
    private function familyIds(): array
    {
        return User::parents()->real()->pluck('id')->all();
    }

    public function index(Request $request): View
    {
        [$from, $to] = $this->range($request);
        $source = array_key_exists((string) $request->query('source'), self::SOURCES) ? (string) $request->query('source') : '';
        $families = array_flip($this->familyIds());
        $staff = User::query()->whereNotIn('id', array_keys($families) ?: [0])->pluck('id')->flip();

        // Source of every actor = first known source across all their events.
        $firstSource = [];
        foreach (DB::table('funnel_events')->whereNotNull('source')->orderBy('id')->get(['user_id', 'visitor_id', 'source']) as $r) {
            foreach ([$r->user_id ? 'u'.$r->user_id : null, $r->visitor_id ? 'v'.$r->visitor_id : null] as $k) {
                if ($k && ! isset($firstSource[$k])) {
                    $firstSource[$k] = $r->source;
                }
            }
        }

        $reach = [];
        $raw = array_fill_keys(array_keys(Funnel::STEPS), []);
        $extra = ['google_fail' => [], 'form_error' => [], 'inapp' => [], 'login' => [], 'email_verified' => [], 'wa_click' => []];
        $rows = DB::table('funnel_events')->whereBetween('created_at', [$from->copy()->utc(), $to->copy()->utc()])
            ->orderBy('id')->get(['event', 'user_id', 'visitor_id', 'meta']);
        $stepKeys = array_keys(Funnel::STEPS);
        foreach ($rows as $r) {
            if ($r->user_id && isset($staff[$r->user_id])) {
                continue;
            }
            $actor = $r->user_id ? 'u'.$r->user_id : ($r->visitor_id ? 'v'.$r->visitor_id : null);
            if (! $actor) {
                continue;
            }
            $src = $firstSource[$actor] ?? ($r->visitor_id ? ($firstSource['v'.$r->visitor_id] ?? null) : null);
            if ($source === 'fb' && $src !== 'fb') {
                continue;
            }
            if ($source === 'other' && $src === 'fb') {
                continue;
            }
            $i = Funnel::stepOf($r->event);
            if ($i >= 0) {
                $reach[$actor] = max($reach[$actor] ?? -1, $i);
                $raw[$stepKeys[$i]][$actor] = true;
            }
            if (isset($extra[$r->event])) {
                $extra[$r->event][$actor] = true;
            }
            if ($r->event === 'visit' && $r->meta && str_contains($r->meta, '"inapp"')) {
                $extra['inapp'][$actor] = true;
            }
        }
        $steps = [];
        $prev = null;
        foreach ($stepKeys as $i => $k) {
            $n = count(array_filter($reach, fn ($m) => $m >= $i));
            $steps[] = ['key' => $k, 'label' => Funnel::STEPS[$k][0], 'n' => $n, 'raw' => count($raw[$k]),
                'pct' => $prev ? round($n / $prev * 100) : null, 'drop' => $prev ? $prev - $n : null];
            $prev = $n ?: null;
        }

        [$list, $stuckCounts] = $this->families($request, $families, $firstSource);

        return view('manage.funnel', [
            'ctl' => self::class, 'from' => $from, 'to' => $to, 'source' => $source, 'steps' => $steps, 'extra' => array_map('count', $extra),
            'list' => $list, 'stuckCounts' => $stuckCounts, 'stuck' => (string) $request->query('stuck'),
            'total' => DB::table('funnel_events')->count(), 'backfilled' => DB::table('funnel_events')->where('backfill', true)->count(),
        ]);
    }

    /** One row per family: furthest step, last activity, and whether it is stuck. */
    private function families(Request $request, array $families, array $firstSource): array
    {
        $ids = array_keys($families);
        if (! $ids) {
            return [[], array_fill_keys(array_keys(self::STUCK), 0)];
        }
        $agg = DB::table('funnel_events')->whereIn('user_id', $ids)->groupBy('user_id', 'event')
            ->selectRaw('user_id, event, max(created_at) as last_at')->get();
        $by = [];
        foreach ($agg as $r) {
            $by[$r->user_id][$r->event] = $r->last_at;
        }
        $kids = DB::table('students')->whereIn('user_id', $ids)->groupBy('user_id')->selectRaw('user_id, count(*) as n')->pluck('n', 'user_id');
        $pending = DB::table('subscriptions')->whereIn('user_id', $ids)->where('status', 'pending')->groupBy('user_id')->selectRaw('user_id, count(*) as n')->pluck('n', 'user_id');
        $active = DB::table('subscriptions')->whereIn('user_id', $ids)->where('status', 'active')->groupBy('user_id')->selectRaw('user_id, count(*) as n')->pluck('n', 'user_id');
        $users = User::whereIn('id', $ids)->get(['id', 'name', 'email', 'created_at', 'trial_ends_at', 'google_id']);
        $stepKeys = array_keys(Funnel::STEPS);
        $list = [];
        $counts = array_fill_keys(array_keys(self::STUCK), 0);
        foreach ($users as $u) {
            $ev = $by[$u->id] ?? [];
            $max = -1;
            $last = null;
            foreach ($ev as $e => $at) {
                $max = max($max, Funnel::stepOf($e));
                $last = max($last ?? '', $at);
            }
            $max = max($max, 3); // has an account
            if (($kids[$u->id] ?? 0) > 0) {
                $max = max($max, 4);
            }
            if (($pending[$u->id] ?? 0) > 0) {
                $max = max($max, 8);
            }
            if (($active[$u->id] ?? 0) > 0) {
                $max = 9;
            }
            $stuck = null;
            if ($max >= 9) {
                $stuck = null;
            } elseif (($pending[$u->id] ?? 0) > 0) {
                $stuck = 'pending';
            } elseif (($kids[$u->id] ?? 0) === 0) {
                $stuck = 'no_child';
            } elseif ($max < 5) {
                $stuck = 'no_lesson';
            } elseif ($max >= 7) {
                $stuck = 'no_order';
            } elseif ($u->trial_ends_at && $u->trial_ends_at->isPast()) {
                $stuck = 'trial_over';
            }
            if ($stuck) {
                $counts[$stuck]++;
            }
            $lastAt = $last ? Carbon::parse($last, 'UTC') : $u->created_at;
            $list[] = ['user' => $u, 'step' => $max, 'label' => Funnel::STEPS[$stepKeys[$max]][0], 'last' => $lastAt, 'stuck' => $stuck,
                'source' => $firstSource['u'.$u->id] ?? null, 'kids' => (int) ($kids[$u->id] ?? 0)];
        }
        $want = (string) $request->query('stuck');
        if ($want === 'any') {
            $list = array_filter($list, fn ($r) => $r['stuck'] !== null);
        } elseif (isset(self::STUCK[$want])) {
            $list = array_filter($list, fn ($r) => $r['stuck'] === $want);
        }
        usort($list, fn ($a, $b) => $b['last'] <=> $a['last']);

        return [array_slice($list, 0, 300), $counts];
    }

    public function family(User $user): View
    {
        $events = DB::table('funnel_events')->where('user_id', $user->id)->orderBy('created_at')->orderBy('id')->get();
        $vids = $events->pluck('visitor_id')->filter()->unique()->values();
        $kids = DB::table('students')->where('user_id', $user->id)->pluck('name', 'id');

        return view('manage.funnel-family', ['u' => $user, 'events' => $events, 'vids' => $vids, 'kids' => $kids,
            'subs' => $user->subscriptions()->latest()->get()]);
    }
}
