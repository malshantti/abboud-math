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
        $d = \Illuminate\Support\Carbon::parse($date)->timezone(config('app.display_timezone', 'Asia/Hebron'));

        return static::num($d->format($time ? 'Y/m/d H:i' : 'Y/m/d'));
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

    /** A short, readable summary of a progress JSON blob without assuming one schema. */
    public static function summarize(?string $json): array
    {
        $data = json_decode((string) $json, true);
        if (! is_array($data)) {
            return [];
        }
        $out = [];
        foreach (['points' => 'النقاط', 'xp' => 'الخبرة', 'stars' => 'النجوم', 'streak' => 'أيام متتالية', 'coins' => 'العملات'] as $k => $label) {
            if (isset($data[$k]) && is_numeric($data[$k])) {
                $out[$label] = static::num((int) $data[$k]);
            }
        }
        foreach (['done' => 'دروس منجزة', 'completed' => 'دروس منجزة', 'mastery' => 'مهارات متقنة', 'lessons' => 'دروس', 'badges' => 'أوسمة', 'answers' => 'إجابات'] as $k => $label) {
            if (isset($data[$k]) && is_array($data[$k]) && ! isset($out[$label])) {
                $out[$label] = static::num(count($data[$k]));
            }
        }
        $out['حجم البيانات'] = static::num(number_format(strlen((string) $json) / 1024, 1)).' ك.ب';

        return $out;
    }
}
