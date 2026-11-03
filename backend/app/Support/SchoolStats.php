<?php

namespace App\Support;

use App\Http\Controllers\Api\SyncController;
use App\Models\SchoolSection;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Teacher dashboard numbers for one section, read only from data the site already syncs:
 * subject blobs (done: lesson → score, quizzes) and the report log bustan_report_v1
 * (per-lesson answers n/ok, last 40 wrong answers per subject, minutes per day). No new tracking.
 */
class SchoolStats
{
    public const SUBJECTS = ['math' => 'الرياضيات', 'arabic' => 'العربية', 'english' => 'الإنجليزية', 'science' => 'العلوم', 'life' => 'التربية الحياتية'];

    /** Lessons per course, counted from each grade's content.js (UNITS[].les). Missing → show counts only. */
    public const TOTALS = [
        'g4-math' => 52, 'g4-arabic' => 30, 'g4-english' => 25, 'g4-science' => 29,
        'g5-math' => 43, 'g5-arabic' => 50, 'g5-english' => 25, 'g5-science' => 17,
        'g6-math' => 59, 'g6-science' => 23, 'g7-math' => 31, 'g7-arabic' => 55, 'g7-english' => 25, 'g7-science' => 30,
        'g8-math' => 59, 'g8-science' => 25,
    ];

    public static function tz(): string
    {
        return (string) config('app.display_timezone', 'Asia/Gaza');
    }

    /** Subject codes (g4-math …) taught in this grade. */
    public static function codes(int $grade): array
    {
        $out = [];
        foreach (Ar::KEYS as $key => [$g]) {
            if ($g === $grade && ($c = SyncController::subjectOf($key))) {
                $out[$c] = $key;
            }
        }
        uksort($out, fn ($a, $b) => array_search(explode('-', $a)[1], array_keys(self::SUBJECTS)) <=> array_search(explode('-', $b)[1], array_keys(self::SUBJECTS)));

        return $out;
    }

    public static function subjectName(string $code): string
    {
        return self::SUBJECTS[explode('-', $code, 2)[1] ?? ''] ?? $code;
    }

    /** One student: last seen, activity days, per-subject progress, lessons and mistakes. */
    public static function student(Student $s, int $grade, Collection $rows): array
    {
        $log = json_decode((string) optional($rows->get(Report::LOG_KEY))->value, true);
        $logSubj = is_array($log['subj'] ?? null) ? $log['subj'] : [];
        $int = fn ($v) => is_numeric($v) ? max(0, (int) $v) : 0;
        $str = fn ($v, $n) => is_string($v) ? mb_substr(trim(preg_replace('/\s+/u', ' ', $v)), 0, $n) : '';
        $last = collect([$s->last_synced_at, $s->user?->last_login_at, $s->user?->active_device_seen_at])->filter();
        foreach ($rows as $r) {
            $last->push($r->updated_at);
        }
        $days = [];
        $subjects = [];
        foreach (self::codes($grade) as $code => $key) {
            $blob = $rows->has($key) ? json_decode((string) $rows[$key]->value, true) : null;
            $blob = is_array($blob) ? $blob : [];
            $done = [];
            foreach ((array) ($blob['done'] ?? []) as $k => $v) {
                if (is_string($k) && ! str_starts_with($k, 'lab:') && ! str_starts_with($k, 'adv:') && is_numeric($v) && $v > 0) {
                    $done[$k] = max(0, min(100, (int) $v));
                }
            }
            $p = $rows->has($key) ? Ar::progress($key, $rows[$key]->value, $rows[$key]->client_updated_at ?: null) : null;
            $total = self::TOTALS[$code] ?? null;
            $l = is_array($logSubj[$code] ?? null) ? $logSubj[$code] : [];
            $lessons = [];
            foreach ((array) ($l['lessons'] ?? []) as $name => $x) {
                if (! is_array($x)) {
                    continue;
                }
                $n = $int($x['n'] ?? 0);
                $ok = min($n, $int($x['ok'] ?? 0));
                $lessons[] = ['name' => $str((string) $name, 70), 'answered' => $n, 'correct' => $ok, 'pct' => $n ? (int) round(100 * $ok / $n) : null,
                    'min' => (int) round($int($x['ms'] ?? 0) / 60000), 'last' => ($t = $int($x['last'] ?? 0)) ? Carbon::createFromTimestampMs($t) : null];
            }
            usort($lessons, fn ($a, $b) => ($b['last']?->getTimestamp() ?? 0) <=> ($a['last']?->getTimestamp() ?? 0));
            $wrong = [];
            foreach ((array) ($l['wrong'] ?? []) as $w) {
                if (is_array($w) && ($q = $str($w['q'] ?? '', 160)) !== '') {
                    $wrong[] = ['lesson' => $str($w['l'] ?? '', 70), 'q' => $q, 'a' => $str($w['a'] ?? '', 80), 'c' => $str($w['c'] ?? '', 80),
                        'at' => ($t = $int($w['t'] ?? 0)) ? Carbon::createFromTimestampMs($t) : null];
                }
            }
            foreach ((array) ($l['days'] ?? []) as $d => $ms) {
                if (is_string($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) && $int($ms) > 0) {
                    $days[$d] = ($days[$d] ?? 0) + $int($ms);
                }
            }
            if (($t = $int($l['lastT'] ?? 0)) || $lessons) {
                $last->push($lessons[0]['last'] ?? null);
            }
            $n = $int($l['n'] ?? 0);
            $ok = min($n, $int($l['ok'] ?? 0));
            $cnt = count($done);
            $subjects[$code] = [
                'code' => $code, 'name' => self::subjectName($code), 'opened' => $rows->has($key) || $l,
                'done' => $cnt, 'total' => $total, 'pct' => $total ? min(100, (int) round(100 * $cnt / $total)) : null,
                'score' => $done ? (int) round(array_sum($done) / $cnt) : null,
                'quiz_avg' => $p['quiz_avg'] ?? null, 'quiz_count' => $p['quiz_count'] ?? 0,
                'answered' => $n, 'correct' => $ok, 'acc' => $n ? (int) round(100 * $ok / $n) : null,
                'min' => (int) round($int($l['ms'] ?? 0) / 60000), 'lessons' => $lessons, 'wrong' => array_reverse($wrong),
            ];
        }
        $lastSeen = $last->filter()->map(fn ($d) => Carbon::parse($d))->max();
        $tz = self::tz();
        $today = now($tz)->startOfDay();
        $weekFrom = $today->copy()->subDays(6)->format('Y-m-d');
        $activeDays = count(array_filter(array_keys($days), fn ($d) => $d >= $weekFrom));
        if ($lastSeen && $lastSeen->copy()->timezone($tz)->format('Y-m-d') >= $weekFrom) {
            $activeDays = max($activeDays, 1);
        }
        $idle = $lastSeen ? (int) floor($lastSeen->copy()->timezone($tz)->startOfDay()->diffInDays($today, true)) : null;
        $pcts = array_filter(array_column($subjects, 'pct'), 'is_int');
        $ans = array_sum(array_column($subjects, 'answered'));
        $cor = array_sum(array_column($subjects, 'correct'));

        return [
            'id' => $s->id, 'name' => $s->name, 'username' => $s->user?->username, 'last' => $lastSeen,
            'today' => $idle === 0, 'week' => $idle !== null && $idle <= 6, 'idle' => $idle,
            'status' => $idle === null ? 'never' : ($idle === 0 ? 'today' : ($idle < 3 ? 'recent' : ($idle < 7 ? 'idle3' : 'idle7'))),
            'week_days' => $activeDays, 'week_min' => (int) round(array_sum(array_filter($days, fn ($d) => $d >= $weekFrom, ARRAY_FILTER_USE_KEY)) / 60000),
            'subjects' => $subjects, 'progress' => $pcts ? (int) round(array_sum($pcts) / count($pcts)) : null,
            'done' => array_sum(array_column($subjects, 'done')), 'answered' => $ans, 'acc' => $ans ? (int) round(100 * $cor / $ans) : null,
            'days' => $days,
        ];
    }

    /** The whole section, optionally narrowed to one subject (math, arabic …). */
    public static function section(SchoolSection $section, ?string $subject = null): array
    {
        $grade = (int) $section->grade;
        $codes = self::codes($grade);
        $only = $subject && isset($codes['g'.$grade.'-'.$subject]) ? 'g'.$grade.'-'.$subject : null;
        $keys = array_merge(array_values($codes), [Report::LOG_KEY]);
        $students = $section->students()->with(['user:id,username,last_login_at,active_device_seen_at', 'progress' => fn ($q) => $q->whereIn('key', $keys)])->get();
        $rows = $students->map(function ($s) use ($grade, $only) {
            $r = self::student($s, $grade, $s->progress->keyBy('key'));
            if ($only) {
                $x = $r['subjects'][$only];
                $r['progress'] = $x['pct'];
                $r['done'] = $x['done'];
                $r['answered'] = $x['answered'];
                $r['acc'] = $x['acc'];
            }

            return $r;
        });

        // Hardest questions / lessons across the section.
        $q = [];
        $les = [];
        foreach ($rows as $r) {
            foreach ($r['subjects'] as $code => $x) {
                if ($only && $code !== $only) {
                    continue;
                }
                foreach ($x['wrong'] as $w) {
                    $k = $code.'|'.$w['q'];
                    $q[$k] ??= ['subject' => $x['name'], 'lesson' => $w['lesson'], 'q' => $w['q'], 'c' => $w['c'], 'times' => 0, 'students' => [], 'answers' => []];
                    $q[$k]['times']++;
                    $q[$k]['students'][$r['id']] = $r['name'];
                    if ($w['a'] !== '') {
                        $q[$k]['answers'][$w['a']] = ($q[$k]['answers'][$w['a']] ?? 0) + 1;
                    }
                    if ($w['c'] !== '') {
                        $q[$k]['c'] = $w['c'];
                    }
                }
                foreach ($x['lessons'] as $l) {
                    if (! $l['answered']) {
                        continue;
                    }
                    $k = $code.'|'.$l['name'];
                    $les[$k] ??= ['subject' => $x['name'], 'lesson' => $l['name'], 'answered' => 0, 'correct' => 0, 'students' => 0];
                    $les[$k]['answered'] += $l['answered'];
                    $les[$k]['correct'] += $l['correct'];
                    $les[$k]['students']++;
                }
            }
        }
        $q = collect($q)->map(function ($x) {
            arsort($x['answers']);
            $x['common'] = array_key_first($x['answers']);
            $x['n'] = count($x['students']);

            return $x;
        })->sortByDesc(fn ($x) => [$x['n'], $x['times']])->values()->take(12)->all();
        $les = collect($les)->filter(fn ($x) => $x['answered'] >= 5)->map(fn ($x) => $x + ['acc' => (int) round(100 * $x['correct'] / $x['answered'])])
            ->sortBy('acc')->values()->take(8)->all();

        $n = $rows->count();
        $prog = $rows->pluck('progress')->filter(fn ($v) => $v !== null);
        $acc = $rows->pluck('acc')->filter(fn ($v) => $v !== null);
        $bySubject = [];
        foreach ($codes as $code => $key) {
            $ps = $rows->map(fn ($r) => $r['subjects'][$code]['pct'])->filter(fn ($v) => $v !== null);
            $ds = $rows->map(fn ($r) => $r['subjects'][$code]['done']);
            $as = $rows->map(fn ($r) => $r['subjects'][$code]['acc'])->filter(fn ($v) => $v !== null);
            $bySubject[$code] = ['name' => self::subjectName($code), 'slug' => explode('-', $code)[1],
                'opened' => $rows->filter(fn ($r) => $r['subjects'][$code]['opened'])->count(),
                'pct' => $ps->count() ? (int) round($ps->avg()) : null, 'done' => $n ? round($ds->avg(), 1) : 0,
                'acc' => $as->count() ? (int) round($as->avg()) : null, 'total' => self::TOTALS[$code] ?? null];
        }

        return [
            'rows' => $rows->sortBy([fn ($a, $b) => ($b['idle'] ?? 9999) <=> ($a['idle'] ?? 9999)])->values(),
            'subject' => $only, 'subjects' => $bySubject, 'questions' => $q, 'lessons' => $les,
            'sum' => [
                'n' => $n, 'today' => $rows->where('today', true)->count(), 'week' => $rows->where('week', true)->count(),
                'week_pct' => $n ? (int) round(100 * $rows->where('week', true)->count() / $n) : 0,
                'idle3' => $rows->where('status', 'idle3')->count(), 'idle7' => $rows->whereIn('status', ['idle7', 'never'])->count(),
                'never' => $rows->where('status', 'never')->count(),
                'progress' => $prog->count() ? (int) round($prog->avg()) : null, 'acc' => $acc->count() ? (int) round($acc->avg()) : null,
            ],
        ];
    }
}
