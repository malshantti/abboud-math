<?php

namespace App\Support;

class Ar
{
    public static function num(mixed $value): string
    {
        return strtr((string) $value, ['0' => '٠', '1' => '١', '2' => '٢', '3' => '٣', '4' => '٤', '5' => '٥', '6' => '٦', '7' => '٧', '8' => '٨', '9' => '٩', ',' => '٬', '.' => '٫']);
    }

    public static function date($date, bool $time = true): string
    {
        if (! $date) {
            return '—';
        }
        $d = \Illuminate\Support\Carbon::parse($date)->timezone(config('app.display_timezone', 'Asia/Gaza'));
        $out = $d->format('d/m/Y');
        if ($time) {
            $out .= ' — '.$d->format('h:i').' '.($d->format('A') === 'AM' ? 'ص' : 'م');
        }

        return static::num($out);
    }

    /** Escaped HTML in which every Arabic-Indic zero is drawn as a clear ring (Baloo/Cairo render ٠ as a dot). */
    public static function html(mixed $value): \Illuminate\Support\HtmlString
    {
        $text = e(static::num($value));
        if (! str_contains($text, '٠')) {
            return new \Illuminate\Support\HtmlString($text);
        }

        // Bidi treats the drawn zero as a neutral and would reorder the digits around it (١٠ as ٠١),
        // so the pieces sit in a left-to-right inline flex row: order is fixed by layout, not by bidi.
        $parts = preg_split('/(٠)/u', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        $html = implode('', array_map(fn ($p) => $p === '٠' ? '<i class="z0">٠</i>' : '<span>'.$p.'</span>', $parts));

        return new \Illuminate\Support\HtmlString('<span class="n" dir="ltr">'.$html.'</span>');
    }

    /** date() as HTML: readable zeros, and date/time isolated so the order survives RTL ("٢٢/١٠/٢٠٢٦ — ١٢:٥٧ ص"). */
    public static function when($date, bool $time = true): \Illuminate\Support\HtmlString
    {
        $text = static::date($date, $time);
        if ($text === '—') {
            return new \Illuminate\Support\HtmlString('—');
        }
        $parts = explode(' — ', $text);
        $html = '<bdi dir="ltr">'.static::html($parts[0]).'</bdi>';
        if (isset($parts[1])) {
            [$clock, $ampm] = explode(' ', $parts[1]);
            $html .= ' — <bdi dir="ltr">'.static::html($clock).'</bdi> '.e($ampm);
        }

        return new \Illuminate\Support\HtmlString('<span class="dt">'.$html.'</span>');
    }

    public const GRADES = [1 => 'الصف الأول', 2 => 'الصف الثاني', 6 => 'الصف السادس', 8 => 'الصف الثامن'];

    public static function grade(?int $g): string
    {
        return static::GRADES[$g] ?? 'غير محدد';
    }

    /** Progress key => [grade, subject label]. Mirrors the static site's localStorage keys. */
    public const KEYS = [
        'abboud_math_v1' => [8, 'الرياضيات'], 'bustan_g8_english_v1' => [8, 'الإنجليزية'], 'bustan_g8_arabic_v1' => [8, 'العربية'], 'bustan_g8_science_v1' => [8, 'العلوم'],
        'bustan_g6_math_v1' => [6, 'الرياضيات'], 'bustan_g6_english_v1' => [6, 'الإنجليزية'], 'bustan_g6_arabic_v1' => [6, 'العربية'], 'bustan_g6_science_v1' => [6, 'العلوم'],
        'bustan_g1_math_v1' => [1, 'الرياضيات'], 'bustan_g1_arabic_v1' => [1, 'العربية'], 'bustan_g1_english_v1' => [1, 'الإنجليزية'], 'bustan_g1_life_v1' => [1, 'التربية الحياتية'],
        'bustan_g2_math_v1' => [2, 'الرياضيات'], 'bustan_g2_arabic_v1' => [2, 'العربية'], 'bustan_g2_english_v1' => [2, 'الإنجليزية'], 'bustan_g2_life_v1' => [2, 'التربية الحياتية'],
    ];

    /** Subscription units: grade+subject code => [grade, subject]. Code = folder on the static site (g6/math). */
    public const SUBJECTS = [
        'g1-math' => [1, 'الرياضيات'], 'g1-arabic' => [1, 'العربية'], 'g1-english' => [1, 'الإنجليزية'], 'g1-life' => [1, 'التربية الحياتية'],
        'g2-math' => [2, 'الرياضيات'], 'g2-arabic' => [2, 'العربية'], 'g2-english' => [2, 'الإنجليزية'], 'g2-life' => [2, 'التربية الحياتية'],
        'g6-math' => [6, 'الرياضيات'], 'g6-arabic' => [6, 'العربية'], 'g6-english' => [6, 'الإنجليزية'], 'g6-science' => [6, 'العلوم'],
        'g8-math' => [8, 'الرياضيات'], 'g8-arabic' => [8, 'العربية'], 'g8-english' => [8, 'الإنجليزية'], 'g8-science' => [8, 'العلوم'],
    ];

    public static function subject(string $code): string
    {
        return isset(static::SUBJECTS[$code]) ? static::SUBJECTS[$code][1].' — '.static::grade(static::SUBJECTS[$code][0]) : $code;
    }

    /** Keys the sync API accepts (profiles.js PER list). */
    public const SYNC_KEYS = ['abboud_math_v1', 'bustan_g8_english_v1', 'bustan_g6_math_v1', 'bustan_g6_english_v1', 'bustan_g6_arabic_v1', 'bustan_g6_science_v1', 'bustan_g8_arabic_v1', 'bustan_g8_science_v1', 'en_rate', 'en_sfx', 'en_zay', 'abboud_coach_cfg', 'bustan_last', 'bustan_grade', 'bustan_student_name', 'bustan_g1_math_v1', 'bustan_g1_arabic_v1', 'bustan_g1_english_v1', 'bustan_g1_life_v1', 'bustan_g2_math_v1', 'bustan_g2_arabic_v1', 'bustan_g2_english_v1', 'bustan_g2_life_v1'];

    /** Lessons per math course: prerequisites + non-review lessons (the ALLSK list in g6/math and g8/math app.js; checked by tests/admin-dashboard.cjs). */
    public const LESSON_TOTALS = ['bustan_g6_math_v1' => 59, 'abboud_math_v1' => 59];

    /**
     * Useful progress for the owner from one subject's JSON blob, without assuming a single schema.
     * Returns null when the blob cannot be read.
     *
     * @return array{done:?int,total:?int,pct:?int,points:?int,streak:?int,quiz_avg:?int,quiz_count:int,quiz_last:list<int>,last:?string}|null
     */
    public static function progress(string $key, ?string $json, ?int $updatedMs = null): ?array
    {
        $data = json_decode((string) $json, true);
        if (! is_array($data)) {
            return null;
        }
        $done = null;
        $total = static::LESSON_TOTALS[$key] ?? null;
        if (isset($data['skills']) && is_array($data['skills'])) {
            $done = count(array_filter($data['skills'], fn ($s) => is_array($s) && ($s['status'] ?? null) === 'mastered'));
            $total ??= count($data['skills']) ?: null;
        } else {
            foreach (['done', 'completed', 'lessons'] as $k) {
                if (isset($data[$k]) && is_array($data[$k])) {
                    $done = count(array_filter($data[$k]));
                    break;
                }
            }
        }
        if ($total !== null && $done !== null) {
            $done = min($done, $total);
        }
        $scores = [];
        foreach ((array) ($data['quizzes'] ?? []) as $q) {
            if (is_array($q) && isset($q['score']) && is_numeric($q['score'])) {
                $scores[] = max(0, min(100, (int) round($q['score'])));
            }
        }
        $last = null;
        foreach ([$data['lastDay'] ?? null, $data['last'] ?? null, (is_array($data['quizzes'] ?? null) && $data['quizzes'] ? end($data['quizzes']) : null)] as $c) {
            $c = is_array($c) ? ($c['date'] ?? null) : $c;
            if (is_string($c) && strtotime($c)) {
                $last = max($last ?? '', date('c', strtotime($c)));
            }
        }
        if ($updatedMs) {
            $last = max($last ?? '', date('c', intdiv($updatedMs, 1000)));
        }
        $int = fn ($k) => isset($data[$k]) && is_numeric($data[$k]) ? (int) $data[$k] : null;

        return [
            'done' => $done, 'total' => $total, 'pct' => $total && $done !== null ? (int) round(100 * $done / $total) : null,
            'points' => $int('points') ?? $int('xp') ?? $int('stars'), 'streak' => $int('streak'),
            'quiz_avg' => $scores ? (int) round(array_sum($scores) / count($scores)) : null, 'quiz_count' => count($scores),
            'quiz_last' => array_reverse(array_slice($scores, -3)), 'last' => $last ?: null,
        ];
    }
}
