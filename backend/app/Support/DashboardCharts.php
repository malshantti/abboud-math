<?php

namespace App\Support;

use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Time series for the dashboard charts, in the site's display timezone. Raw numbers and dates only:
 * labels are formatted in the view. Four small queries, read on every dashboard load.
 */
class DashboardCharts
{
    public const MONTHS = [1 => 'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];

    public static function all(): array
    {
        // Not cached: the KPI numbers are read from the same series, so every number on the page agrees.
        $signups = self::signups(30);

        return ['week' => self::week(array_slice($signups, -7)), 'signups' => $signups, 'revenue' => self::revenue(6)];
    }

    /**
     * Last seven days, oldest first: new accounts (from the 30-day series), active families and students
     * (by each real student's latest sync, so everyone counts once in the week) and subscription requests.
     * Two queries, so the dashboard stays cheap.
     */
    public static function week(array $signups): array
    {
        $tz = LiveStats::tz();
        $from = LiveStats::dayStart(6);
        $students = [];
        $families = [];
        $synced = Student::whereHas('user', fn ($u) => $u->parents()->real())->where('last_synced_at', '>=', $from)->get(['user_id', 'last_synced_at']);
        foreach ($synced as $s) {
            $key = Carbon::parse($s->last_synced_at)->timezone($tz)->format('Y-m-d');
            $students[$key] = ($students[$key] ?? 0) + 1;
            $latest[$s->user_id] = max($latest[$s->user_id] ?? '', $key);
        }
        foreach ($latest ?? [] as $key) {
            $families[$key] = ($families[$key] ?? 0) + 1;
        }
        $requests = [];
        foreach (Subscription::where('created_at', '>=', $from)->get(['batch', 'code', 'created_at']) as $s) {
            $key = Carbon::parse($s->created_at)->timezone($tz)->format('Y-m-d');
            $requests[$key][$s->batch ?? $s->code] = true; // a request with several subjects counts once
        }
        $out = [];
        foreach ($signups as $d) {
            $key = $d['date'];
            $out[] = ['date' => $key, 'signups' => $d['n'], 'accounts' => $families[$key] ?? 0, 'students' => $students[$key] ?? 0, 'requests' => count($requests[$key] ?? [])];
        }

        return $out;
    }

    /** New parent accounts per day for the last $n days, oldest first. */
    public static function signups(int $n): array
    {
        $tz = LiveStats::tz();
        $from = LiveStats::dayStart($n - 1);
        $counts = [];
        foreach (User::parents()->real()->where('created_at', '>=', $from)->pluck('created_at') as $at) {
            $key = Carbon::parse($at)->timezone($tz)->format('Y-m-d');
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }
        $out = [];
        for ($d = $n - 1; $d >= 0; $d--) {
            $key = LiveStats::dayStart($d)->timezone($tz)->format('Y-m-d');
            $out[] = ['date' => $key, 'n' => $counts[$key] ?? 0];
        }

        return $out;
    }

    /** Paid subscriptions by the month they started, last $n months, oldest first: amount and count. */
    public static function revenue(int $n): array
    {
        $tz = LiveStats::tz();
        $start = Carbon::now($tz)->startOfMonth()->subMonths($n - 1);
        $sums = [];
        $rows = Subscription::whereIn('status', ['active', 'expired'])->whereNotNull('starts_at')
            ->where('starts_at', '>=', $start->copy()->utc())->where('price', '>', 0)->get(['starts_at', 'price']);
        foreach ($rows as $s) {
            $key = Carbon::parse($s->starts_at)->timezone($tz)->format('Y-m');
            $sums[$key]['amount'] = ($sums[$key]['amount'] ?? 0) + (int) $s->price;
            $sums[$key]['count'] = ($sums[$key]['count'] ?? 0) + 1;
        }
        $out = [];
        for ($i = 0; $i < $n; $i++) {
            $m = $start->copy()->addMonths($i);
            $key = $m->format('Y-m');
            $out[] = ['month' => self::MONTHS[(int) $m->format('n')], 'year' => (int) $m->format('Y'), 'amount' => $sums[$key]['amount'] ?? 0, 'count' => $sums[$key]['count'] ?? 0];
        }

        return $out;
    }
}
