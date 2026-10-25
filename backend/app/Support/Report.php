<?php

namespace App\Support;

use App\Models\Student;

/**
 * Progress report for one student, built from the synced subject blobs (Ar::progress) plus the
 * report log (bustan_report_v1, written by report-log.js on the site: time, answers, recent mistakes).
 */
class Report
{
    public const LOG_KEY = 'bustan_report_v1';

    public static function build(Student $student): array
    {
        $rows = $student->progress()->get()->keyBy('key');
        $log = json_decode((string) optional($rows->get(self::LOG_KEY))->value, true);
        $logSubj = is_array($log) && is_array($log['subj'] ?? null) ? $log['subj'] : [];
        $codeOf = fn (string $key) => \App\Http\Controllers\Api\SyncController::subjectOf($key);

        $subjects = [];
        foreach (Ar::KEYS as $key => [$g, $name]) {
            $code = $codeOf($key);
            $p = $rows->has($key) ? Ar::progress($key, $rows[$key]->value, $rows[$key]->client_updated_at ?: null) : null;
            $l = is_array($logSubj[$code] ?? null) ? $logSubj[$code] : null;
            if (! $p && ! $l) {
                continue;
            }
            $subjects[] = ['code' => $code, 'grade' => $g, 'name' => $name, 'progress' => $p] + self::fromLog($l);
        }
        usort($subjects, fn ($a, $b) => [$a['grade'], $a['code']] <=> [$b['grade'], $b['code']]);

        $days = [];
        foreach ($subjects as $s) {
            foreach ($s['days'] as $d => $ms) {
                $days[$d] = ($days[$d] ?? 0) + $ms;
            }
            if ($s['progress']['last'] ?? null) {
                $d = substr($s['progress']['last'], 0, 10);
                $days[$d] ??= 0;
            }
        }
        krsort($days);

        $answered = array_sum(array_column($subjects, 'answered'));
        $correct = array_sum(array_column($subjects, 'correct'));

        return [
            'subjects' => $subjects,
            'total_ms' => array_sum(array_column($subjects, 'ms')),
            'answered' => $answered,
            'correct' => $correct,
            'pct' => $answered ? (int) round(100 * $correct / $answered) : null,
            'done' => array_sum(array_map(fn ($s) => (int) ($s['progress']['done'] ?? 0), $subjects)),
            'days' => array_slice($days, 0, 14, true),
            'tracked' => (bool) $logSubj,
        ] + ['series' => self::series($subjects)];
    }

    private static function fromLog(?array $l): array
    {
        $int = fn ($v) => is_numeric($v) ? max(0, (int) $v) : 0;
        $str = fn ($v, $n) => is_string($v) ? mb_substr(trim($v), 0, $n) : '';
        $out = ['ms' => 0, 'answered' => 0, 'correct' => 0, 'pct' => null, 'lessons' => [], 'wrong' => [], 'days' => [], 'dn' => []];
        if (! $l) {
            return $out;
        }
        $out['ms'] = $int($l['ms'] ?? 0);
        $out['answered'] = $int($l['n'] ?? 0);
        $out['correct'] = min($out['answered'], $int($l['ok'] ?? 0));
        $out['pct'] = $out['answered'] ? (int) round(100 * $out['correct'] / $out['answered']) : null;
        foreach ((array) ($l['lessons'] ?? []) as $name => $x) {
            if (! is_array($x)) {
                continue;
            }
            $n = $int($x['n'] ?? 0);
            $ok = min($n, $int($x['ok'] ?? 0));
            $out['lessons'][] = ['name' => $str((string) $name, 60), 'ms' => $int($x['ms'] ?? 0), 'answered' => $n, 'correct' => $ok,
                'pct' => $n ? (int) round(100 * $ok / $n) : null, 'last' => ($t = $int($x['last'] ?? 0)) ? date('c', intdiv($t, 1000)) : null];
        }
        usort($out['lessons'], fn ($a, $b) => strcmp((string) $b['last'], (string) $a['last']));
        foreach (array_reverse((array) ($l['wrong'] ?? [])) as $w) {
            if (is_array($w) && count($out['wrong']) < 15) {
                $out['wrong'][] = ['lesson' => $str($w['l'] ?? '', 60), 'question' => $str($w['q'] ?? '', 160), 'chosen' => $str($w['a'] ?? '', 80),
                    'correct' => $str($w['c'] ?? '', 80), 'at' => ($t = $int($w['t'] ?? 0)) ? date('c', intdiv($t, 1000)) : null];
            }
        }
        foreach ((array) ($l['days'] ?? []) as $d => $ms) {
            if (is_string($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) {
                $out['days'][$d] = $int($ms);
            }
        }

        foreach ((array) ($l['dn'] ?? []) as $d => $v) {
            if (is_string($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) && is_array($v)) {
                $n = $int($v[0] ?? 0);
                $out['dn'][$d] = [$n, min($n, $int($v[1] ?? 0))];
            }
        }

        return $out;
    }

    /** Colour and icon per subject (matches the site palette). */
    public static function look(string $code): array
    {
        $s = explode('-', $code, 2)[1] ?? '';

        return match ($s) {
            'math' => ['#2e9fd8', 'math'], 'arabic' => ['#6f9e23', 'book'], 'english' => ['#8a5cd6', 'globe'],
            'science' => ['#f08a3c', 'flask'], 'life' => ['#e0a200', 'leaf'], default => ['#6f9e23', 'book'],
        };
    }

    /** Last $n calendar days (oldest first) with minutes and % correct across subjects. */
    public static function series(array $subjects, int $n = 14): array
    {
        $out = [];
        $today = now(config('app.display_timezone', 'Asia/Gaza'))->startOfDay();
        for ($i = $n - 1; $i >= 0; $i--) {
            $d = $today->copy()->subDays($i)->format('Y-m-d');
            $ms = 0; $a = 0; $ok = 0;
            foreach ($subjects as $s) {
                $ms += $s['days'][$d] ?? 0;
                $a += $s['dn'][$d][0] ?? 0;
                $ok += $s['dn'][$d][1] ?? 0;
            }
            $out[] = ['date' => $d, 'min' => (int) round($ms / 60000), 'pct' => $a ? (int) round(100 * $ok / $a) : null];
        }

        return $out;
    }

    /** Short encouraging note from the data. */
    public static function note(string $name, array $r): string
    {
        $scored = array_values(array_filter($r['subjects'], fn ($s) => $s['answered'] >= 5));
        if (! $scored) {
            return $r['total_ms'] > 0 ? "بداية جميلة يا {$name}! واصل الدراسة لنرى نقاط قوتك." : "لنبدأ رحلة التعلّم يا {$name}! أول درس ينتظرك.";
        }
        usort($scored, fn ($a, $b) => $b['pct'] <=> $a['pct']);
        $best = $scored[0];
        $out = 'أحسنت يا '.$name.'! أقوى مادة لديك: '.$best['name'].' ('.Ar::num($best['pct']).'٪ صواب).';
        $weak = end($scored);
        if (count($scored) > 1 && $weak['pct'] < 70 && $best['pct'] - $weak['pct'] >= 10) {
            $out .= ' تحتاج '.$weak['name'].' إلى قليل من التمرين الإضافي.';
        } elseif ($best['pct'] < 60) {
            $out .= ' مراجعة الأخطاء أدناه ستساعدك كثيرًا.';
        }
        $active = count(array_filter($r['series'] ?? [], fn ($d) => $d['min'] > 0));
        if ($active >= 3) {
            $out .= ' درستَ '.Ar::num($active).($active <= 10 ? ' أيام' : ' يومًا').' في الأسبوعين الأخيرين، استمر!';
        }

        return $out;
    }

    /** «٣ س ١٢ د» style duration. */
    public static function duration(int $ms): string
    {
        $m = intdiv($ms, 60000);
        if ($m < 1) {
            return $ms > 0 ? 'أقل من دقيقة' : '—';
        }
        $h = intdiv($m, 60);

        return $h ? Ar::num($h).' س '.Ar::num($m % 60).' د' : Ar::num($m).' دقيقة';
    }
}
