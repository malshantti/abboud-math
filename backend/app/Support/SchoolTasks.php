<?php

namespace App\Support;

use App\Models\SchoolHomework;
use App\Models\SchoolQuiz;
use App\Models\SchoolQuizAttempt;
use App\Models\SchoolSection;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Schools phase 3: homework completion (from the progress the site already syncs), the textbook
 * question bank (each grade's content.js «bmc», built by resources/school/build-bank.cjs) and the quiz engine.
 */
class SchoolTasks
{
    /** Seconds accepted after the server deadline (network delay). Later answers are not accepted. */
    public const GRACE = 20;

    private static array $bank = [];

    /** Units → lessons {id,t,q:[[question,[options],correct,page]]} for one course (g4-math …), or []. */
    public static function bank(string $code): array
    {
        if (! preg_match('/^g[1-8]-(math|arabic|english|science)$/', $code)) {
            return [];
        }
        if (! array_key_exists($code, self::$bank)) {
            $f = resource_path('school/bank/'.$code.'.json');
            self::$bank[$code] = is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
        }

        return self::$bank[$code];
    }

    /** Lesson / unit lookup: id → [title, unit title]. */
    public static function lessons(string $code): array
    {
        $out = [];
        foreach (self::bank($code) as $u) {
            $out['T:'.$u['id']] = ['t' => 'اختبار الوحدة: '.$u['t'], 'u' => $u['t']];
            foreach ($u['les'] as $l) {
                $out[$l['id']] = ['t' => $l['t'], 'u' => $u['t'], 'n' => count($l['q'])];
            }
        }

        return $out;
    }

    /** Courses of this grade that have a bank. */
    public static function courses(int $grade): array
    {
        $out = [];
        foreach (array_keys(SchoolStats::TOTALS + ['g'.$grade.'-math' => 0, 'g'.$grade.'-arabic' => 0, 'g'.$grade.'-english' => 0, 'g'.$grade.'-science' => 0]) as $code) {
            if (str_starts_with($code, 'g'.$grade.'-') && self::bank($code)) {
                $out[$code] = SchoolStats::subjectName($code);
            }
        }

        return $out;
    }

    /** The link a student follows from «واجباتي»: the site login syncs, then opens the lesson or unit test. */
    public static function link(string $code, string $item): string
    {
        [$g, $s] = explode('-', $code, 2);
        if (str_starts_with($item, 'T:')) {
            $hash = '#/test/'.substr($item, 2);
        } elseif ($code === 'g6-math') {
            $hash = '#/lesson/'.$item;              // g6 math routes lessons as #/lesson/S1-1-1
        } elseif ($code === 'g6-arabic' || $code === 'g6-english') {
            $hash = '#/u/'.preg_replace('/L\d+$/', '', $item); // bank lesson P1U1L1 / U3L1 → unit page #/u/P1U1 / #/u/U3
        } else {
            $hash = '#/u/'.$item;
        }

        return MailCenter::siteUrl().'login.html?sync=1&next='.rawurlencode($g.'/'.$s.'/'.$hash);
    }

    // ---------- Homework ----------

    /** Per student: items done (score) for one homework, from the synced subject blob (done[lessonId] / done['T:unit']). */
    public static function homeworkRows(SchoolHomework $hw, Collection $statsRows): array
    {
        $out = [];
        $late = $hw->due_at && $hw->due_at->isPast();
        foreach ($statsRows as $r) {
            $ids = $r['subjects'][$hw->subject]['ids'] ?? [];
            $items = [];
            foreach ($hw->items as $it) {
                $items[$it] = isset($ids[$it]) ? (int) $ids[$it] : null;
            }
            $doneN = count(array_filter($items, fn ($v) => $v !== null));
            $scores = array_filter($items, fn ($v) => $v !== null);
            $state = $doneN === count($items) ? 'done' : ($late ? 'late' : ($doneN ? 'partial' : 'todo'));
            $out[] = ['id' => $r['id'], 'name' => $r['name'], 'items' => $items, 'done' => $doneN, 'total' => count($items),
                'score' => $scores ? (int) round(array_sum($scores) / count($scores)) : null, 'state' => $state];
        }

        return $out;
    }

    public static function homeworkSummary(array $rows): array
    {
        $n = count($rows);
        $done = count(array_filter($rows, fn ($r) => $r['state'] === 'done'));
        $sc = array_filter(array_column($rows, 'score'), fn ($v) => $v !== null);

        return ['n' => $n, 'done' => $done, 'late' => count(array_filter($rows, fn ($r) => $r['state'] === 'late')),
            'pct' => $n ? (int) round(100 * $done / $n) : 0, 'score' => $sc ? (int) round(array_sum($sc) / count($sc)) : null];
    }

    // ---------- Quiz ----------

    /** Build the question snapshot from picked bank questions ("lesson|index") and teacher questions. */
    public static function buildQuestions(string $code, array $picked, array $own, int $schoolId = 0): array
    {
        $lessons = [];
        foreach (self::bank($code) as $u) {
            foreach ($u['les'] as $l) {
                $lessons[$l['id']] = $l;
            }
        }
        $qs = [];
        foreach (array_unique($picked) as $p) {
            [$lid, $i] = array_pad(explode('|', (string) $p, 2), 2, null);
            $x = $lessons[$lid]['q'][(int) $i] ?? null;
            if ($x && ctype_digit((string) $i)) {
                $qs[] = ['src' => 'bank', 'type' => 'mcq', 'lesson' => $lid, 'lt' => $lessons[$lid]['t'], 'pg' => $x[3], 'q' => $x[0], 'o' => array_values($x[1]), 'a' => (int) $x[2]];
            }
        }
        $img = fn ($n) => $schoolId && SchoolMedia::valid($schoolId, $n) ? $n : null;
        foreach ($own as $o) {
            $type = $o['type'] ?? '';
            $q = mb_substr(trim((string) ($o['q'] ?? '')), 0, 600);
            $qi = $img($o['img'] ?? null);
            if ($q === '' && ! $qi) {
                continue;
            }
            $x = null;
            if ($type === 'mcq') {
                $opts = [];
                $oimg = [];
                $raw = (array) ($o['o'] ?? []);
                $rimg = (array) ($o['oimg'] ?? []);
                $a = (int) ($o['a'] ?? 0);
                $na = -1;
                foreach ($raw as $j => $v) {
                    $v = mb_substr(trim((string) $v), 0, 240);
                    $im = $img($rimg[$j] ?? null);
                    if ($v === '' && ! $im) {
                        continue;
                    }
                    if ((int) $j === $a) {
                        $na = count($opts);
                    }
                    $opts[] = $v;
                    $oimg[] = $im;
                }
                if (count($opts) >= 2 && $na >= 0) {
                    $x = ['src' => 'teacher', 'type' => 'mcq', 'q' => $q, 'o' => $opts, 'a' => $na];
                    if (array_filter($oimg)) {
                        $x['oi'] = $oimg;
                    }
                }
            } elseif ($type === 'tf') {
                $x = ['src' => 'teacher', 'type' => 'tf', 'q' => $q, 'o' => ['صح', 'خطأ'], 'a' => ($o['a'] ?? '1') === '0' || ($o['a'] ?? 1) === 0 ? 1 : 0];
            } elseif ($type === 'fill') {
                $ans = array_values(array_filter(array_map(fn ($v) => mb_substr(trim($v), 0, 120), self::splitAns((string) ($o['ans'] ?? ''))), fn ($v) => $v !== ''));
                if ($ans) {
                    $x = ['src' => 'teacher', 'type' => 'fill', 'q' => $q, 'ans' => $ans];
                }
            }
            if ($x) {
                if ($qi) {
                    $x['img'] = $qi;
                }
                if (SchoolMath::has($q) || ($x['type'] === 'mcq' && SchoolMath::has(implode(' ', $x['o']))) || ($x['type'] === 'fill' && SchoolMath::has(implode(' ', $x['ans'])))) {
                    $x['math'] = 1;
                }
                $qs[] = $x;
            }
        }

        return $qs;
    }

    /** Split accepted answers on | — but not inside $…$ equations. */
    public static function splitAns(string $s): array
    {
        $out = [''];
        $in = false;
        foreach (mb_str_split($s) as $ch) {
            if ($ch === '$') {
                $in = ! $in;
            }
            if ($ch === '|' && ! $in) {
                $out[] = '';
            } else {
                $out[count($out) - 1] .= $ch;
            }
        }

        return $out;
    }

    /** Arabic/English answer normaliser for fill-in questions. */
    public static function norm(string $v): string
    {
        $v = str_replace(['*', ' '], ['×', ''], SchoolMath::plain($v));
        $v = self::letters($v);

        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', $v)));
    }

    /** Digits, letter variants, tashkeel and invisible marks. Keeps spaces. */
    private static function letters(string $v): string
    {
        $v = strtr($v, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            'أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ٱ' => 'ا', 'ى' => 'ي', 'ة' => 'ه', '،' => ',', '٫' => '.', '−' => '-', '–' => '-', ' ' => ' ']);

        return preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}\x{200B}-\x{200F}\x{061C}\x{FEFF}]/u', '', $v);
    }

    /**
     * Does a typed answer match one accepted answer? Conservative: exact match after normalisation,
     * the same number written another way (0.5 = ½ = 1/2 = ٠٫٥), or the same Arabic words with an optional «ال».
     */
    public static function answerMatches(string $given, string $accepted): bool
    {
        $g = self::norm($given);
        $a = self::norm($accepted);
        if (preg_match('/\d/', $g.$a)) {
            // Keep a space only between two digits, so «1 1/2» never equals «11/2».
            $sp = fn ($v) => mb_strtolower(trim(preg_replace(['/\s+/u', '/(?<=\D) | (?=\D)/u'], [' ', ''], self::letters(str_replace('*', '×', SchoolMath::plain($v))))));
            $g = $sp($given);
            $a = $sp($accepted);
        }
        if ($g === '' || $a === '') {
            return false;
        }
        if ($g === $a || self::trimPunct($g) === self::trimPunct($a)) {
            return true;
        }
        $gn = self::number($given);
        $an = self::number($accepted);
        if ($gn !== null && $an !== null) {
            return $gn[0] * $an[1] === $an[0] * $gn[1];
        }
        if ($gn !== null || $an !== null || preg_match('/\d/', $g.$a)) {
            return false;
        }

        return self::words($given) === self::words($accepted) && self::words($given) !== '';
    }

    private static function trimPunct(string $v): string
    {
        return preg_replace('/^[\s«»"\']+|[\s.,،!?؟؛;:«»"\']+$/u', '', $v);
    }

    /** Arabic words without «ال» (only when ≥2 letters remain), punctuation stripped. */
    private static function words(string $v): string
    {
        $v = mb_strtolower(self::trimPunct(trim(preg_replace('/\s+/u', ' ', self::letters($v)))));
        if (! preg_match('/^[\p{Arabic} ]+$/u', $v)) {
            return '';
        }
        $out = [];
        foreach (explode(' ', $v) as $w) {
            if (mb_substr($w, 0, 2) === 'ال' && mb_strlen($w) >= 4) {
                $w = mb_substr($w, 2);
            }
            $out[] = $w;
        }

        return implode(' ', $out);
    }

    /** A plain number as a reduced fraction [num, den], or null. Accepts 3, -2, 0.5, 1,500, 0,5, 1/2, 1 1/2, ½, \frac{1}{2}. */
    public static function number(string $v): ?array
    {
        $v = strtr(SchoolMath::plain($v), ['½' => '1/2', '¼' => '1/4', '¾' => '3/4', '⅓' => '1/3', '⅔' => '2/3', '÷' => '/', '⁄' => '/', '∕' => '/']);
        $v = self::trimPunct(trim(preg_replace('/\s+/u', ' ', self::letters($v))));
        $v = preg_replace('/\s*\/\s*/', '/', $v);
        $v = preg_replace('/^\((.*)\)$/', '$1', $v);
        $dec = function (string $t): ?array {
            if (preg_match('/^\d{1,3}(,\d{3})+$/', $t)) {
                $t = str_replace(',', '', $t);
            } elseif (preg_match('/^\d+,\d+$/', $t)) {
                $t = str_replace(',', '.', $t);
            }
            if (! preg_match('/^(\d+)(?:\.(\d+))?$|^\.(\d+)$/', $t, $m)) {
                return null;
            }
            $int = $m[1] ?? '';
            $frac = ($m[2] ?? '') !== '' ? $m[2] : ($m[3] ?? '');
            $frac = rtrim($frac, '0');
            $int = ltrim($int, '0');
            if (strlen($int) + strlen($frac) > 9) {
                return null;
            }

            return [(int) ($int.$frac), 10 ** strlen($frac)];
        };
        $sign = 1;
        if (preg_match('/^[-+]/', $v)) {
            $sign = $v[0] === '-' ? -1 : 1;
            $v = ltrim(substr($v, 1));
        }
        if (preg_match('/^(\d+) (\d+)\/(\d+)$/', $v, $m)) {
            [$w, $n, $d] = [(int) $m[1], (int) $m[2], (int) $m[3]];
            if ($d === 0 || strlen($m[1].$m[2].$m[3]) > 12 || $n >= $d) {
                return null;
            }
            $r = [$w * $d + $n, $d];
        } elseif (str_contains($v, '/')) {
            $parts = explode('/', $v);
            if (count($parts) !== 2) {
                return null;
            }
            [$n, $d] = [$dec($parts[0]), $dec($parts[1])];
            if (! $n || ! $d || $d[0] === 0) {
                return null;
            }
            $r = [$n[0] * $d[1], $n[1] * $d[0]];
        } else {
            $r = $dec($v);
            if (! $r) {
                return null;
            }
        }
        $g = self::gcd($r[0], $r[1]) ?: 1;

        return [$sign * intdiv($r[0], $g), intdiv($r[1], $g)];
    }

    private static function gcd(int $a, int $b): int
    {
        $a = abs($a);
        $b = abs($b);
        while ($b) {
            [$a, $b] = [$b, $a % $b];
        }

        return $a;
    }

    /** Start (or resume) an attempt. Server decides the deadline: min(start + duration, quiz end). */
    public static function start(SchoolQuiz $quiz, Student $s): SchoolQuizAttempt|string
    {
        $mine = $quiz->attemptsRel()->where('student_id', $s->id)->orderBy('attempt')->get();
        foreach ($mine as $a) {
            self::finalizeIfExpired($a, $quiz);
        }
        if ($open = $mine->first(fn ($a) => ! $a->submitted_at)) {
            return $open;
        }
        if ($quiz->state() !== 'open') {
            return $quiz->state() === 'soon' ? 'لم يبدأ الاختبار بعد.' : 'انتهى وقت الاختبار.';
        }
        if ($mine->count() >= max(1, (int) $quiz->attempts)) {
            return 'استخدمت كل المحاولات المسموحة.';
        }
        $n = count($quiz->questions);
        $layout = [];
        foreach (range(0, $n - 1) as $qi) {
            $q = $quiz->questions[$qi];
            $opts = isset($q['o']) ? range(0, count($q['o']) - 1) : [];
            // MCQ options are always shown in a random order (fixed for this attempt); grading uses original indexes.
            // The teacher's «خلط» setting controls the question order only.
            if ($q['type'] === 'mcq' && count($opts) > 1) {
                shuffle($opts);
            }
            $layout[] = [$qi, $opts];
        }
        if ($quiz->shuffle) {
            shuffle($layout);
        }
        $start = now();
        $deadline = $start->copy()->addMinutes(max(1, (int) $quiz->duration_min));
        if ($quiz->ends_at && $quiz->ends_at->lt($deadline)) {
            $deadline = $quiz->ends_at->copy();
        }
        try {
            return SchoolQuizAttempt::create(['school_quiz_id' => $quiz->id, 'student_id' => $s->id, 'attempt' => $mine->count() + 1,
                'started_at' => $start, 'deadline_at' => $deadline, 'layout' => $layout, 'answers' => [], 'total' => $n]);
        } catch (\Illuminate\Database\QueryException $e) {
            return 'المحاولة مفتوحة على جهاز آخر.';
        }
    }

    /** Store answers (autosave). Rejected once the server deadline + grace has passed. */
    public static function save(SchoolQuizAttempt $a, array $answers): bool
    {
        if ($a->submitted_at || now()->gt($a->deadline_at->copy()->addSeconds(self::GRACE))) {
            return false;
        }
        $n = count($a->layout);
        $clean = [];
        foreach ($answers as $qi => $v) {
            if (ctype_digit((string) $qi) && (int) $qi < $n && is_scalar($v) && (string) $v !== '') {
                $clean[(int) $qi] = mb_substr((string) $v, 0, 120);
            }
        }
        $a->answers = $clean;
        $a->save();

        return true;
    }

    /** Grade and close. Answers are keyed by original question index; option answers are original option indexes. */
    public static function submit(SchoolQuizAttempt $a, SchoolQuiz $quiz, bool $auto = false): SchoolQuizAttempt
    {
        if ($a->submitted_at) {
            return $a;
        }
        $ok = 0;
        foreach ($quiz->questions as $qi => $q) {
            $ok += self::isRight($q, $a->answers[$qi] ?? null) ? 1 : 0;
        }
        $n = count($quiz->questions);
        $end = now()->gt($a->deadline_at) ? $a->deadline_at->copy() : now();
        $a->forceFill(['submitted_at' => $end, 'correct' => $ok, 'total' => $n, 'score' => $n ? (int) round(100 * $ok / $n) : 0, 'auto_submitted' => $auto])->save();

        return $a;
    }

    public static function isRight(array $q, $ans): bool
    {
        if ($ans === null || $ans === '') {
            return false;
        }
        if ($q['type'] === 'fill') {
            foreach ($q['ans'] as $acc) {
                if (self::answerMatches((string) $ans, (string) $acc)) {
                    return true;
                }
            }

            return false;
        }

        return ctype_digit((string) $ans) && (int) $ans === (int) $q['a'];
    }

    public static function finalizeIfExpired(SchoolQuizAttempt $a, ?SchoolQuiz $quiz = null): SchoolQuizAttempt
    {
        if (! $a->submitted_at && now()->gt($a->deadline_at->copy()->addSeconds(self::GRACE))) {
            self::submit($a, $quiz ?? $a->quiz, true);
        }

        return $a;
    }

    /** Teacher results: per student best attempt, per question analysis, who did not take it. */
    public static function results(SchoolQuiz $quiz, Collection $students): array
    {
        $atts = $quiz->attemptsRel()->get();
        foreach ($atts as $a) {
            self::finalizeIfExpired($a, $quiz);
        }
        $by = $atts->groupBy('student_id');
        $rows = [];
        $per = [];
        foreach ($quiz->questions as $qi => $q) {
            $per[$qi] = ['q' => $q, 'n' => 0, 'ok' => 0, 'answers' => []];
        }
        foreach ($students as $s) {
            $mine = $by->get($s->id, collect());
            $best = $mine->whereNotNull('submitted_at')->sortByDesc('score')->first();
            $rows[] = ['id' => $s->id, 'name' => $s->name, 'attempts' => $mine->count(), 'best' => $best, 'live' => $mine->first(fn ($a) => ! $a->submitted_at),
                'tabs' => (int) $mine->sum('tab_switches')];
            if ($best) {
                foreach ($quiz->questions as $qi => $q) {
                    $v = $best->answers[$qi] ?? null;
                    $per[$qi]['n']++;
                    $right = self::isRight($q, $v);
                    $per[$qi]['ok'] += $right ? 1 : 0;
                    if (! $right) {
                        $label = $v === null ? 'دون إجابة' : self::answerText($q, $v);
                        $per[$qi]['answers'][$label] = ($per[$qi]['answers'][$label] ?? 0) + 1;
                    }
                }
            }
        }
        foreach ($per as &$p) {
            arsort($p['answers']);
            $p['pct'] = $p['n'] ? (int) round(100 * $p['ok'] / $p['n']) : null;
        }
        unset($p);
        $took = array_filter($rows, fn ($r) => $r['best']);
        $sc = array_map(fn ($r) => $r['best']->score, $took);

        return ['rows' => $rows, 'questions' => $per, 'missing' => array_values(array_filter($rows, fn ($r) => ! $r['best'] && ! $r['live'])),
            'sum' => ['n' => count($rows), 'took' => count($took), 'avg' => $sc ? (int) round(array_sum($sc) / count($sc)) : null,
                'pct' => count($rows) ? (int) round(100 * count($took) / count($rows)) : 0]];
    }

    public static function answerText(array $q, $v): string
    {
        if ($v === null || $v === '') {
            return '—';
        }
        if ($q['type'] === 'fill') {
            return SchoolMath::plain((string) $v);
        }

        return self::optPlain($q, (int) $v);
    }

    public static function rightText(array $q): string
    {
        return $q['type'] === 'fill' ? implode(' / ', array_map([SchoolMath::class, 'plain'], $q['ans'])) : self::optPlain($q, (int) $q['a']);
    }

    private static function optPlain(array $q, int $i): string
    {
        $t = SchoolMath::plain((string) ($q['o'][$i] ?? ''));

        return ! empty($q['oi'][$i]) ? trim($t.' [صورة]') : ($t !== '' ? $t : '—');
    }

    /** Question text (with equations) + its image, as safe HTML. */
    public static function qHtml(\App\Models\School $school, array $q): string
    {
        return SchoolMath::html($q['q'] ?? '').(! empty($q['img']) ? self::imgTag($school, $q['img'], 'qimg') : '');
    }

    public static function optHtml(\App\Models\School $school, array $q, int $i): string
    {
        return (! empty($q['oi'][$i]) ? self::imgTag($school, $q['oi'][$i], 'oimg') : '').SchoolMath::html((string) ($q['o'][$i] ?? ''));
    }

    public static function answerHtml(\App\Models\School $school, array $q, $v): string
    {
        if ($v === null || $v === '') {
            return '—';
        }

        return $q['type'] === 'fill' ? SchoolMath::html(str_contains((string) $v, '\\') && ! str_contains((string) $v, '$') ? '$'.$v.'$' : (string) $v) : self::optHtml($school, $q, (int) $v);
    }

    public static function rightHtml(\App\Models\School $school, array $q): string
    {
        return $q['type'] === 'fill' ? implode(' / ', array_map([SchoolMath::class, 'html'], $q['ans'])) : self::optHtml($school, $q, (int) $q['a']);
    }

    public static function imgTag(\App\Models\School $school, string $name, string $cls): string
    {
        return '<img class="'.$cls.'" src="'.e(route('school.media', [$school, $name])).'" alt="صورة السؤال" loading="lazy" decoding="async">';
    }

    // ---------- Student side ----------

    /** Open homework and quizzes for a student's section, newest first. */
    public static function forStudent(Student $s): array
    {
        $sec = $s->section;
        if (! $sec) {
            return ['homework' => [], 'quizzes' => [], 'pending' => 0, 'new' => 0, 'soon' => []];
        }
        $rows = collect([SchoolStats::student($s, (int) $sec->grade, $s->progress()->get()->keyBy('key'))]);
        $hw = SchoolHomework::where('school_section_id', $sec->id)->where(fn ($q) => $q->whereNull('due_at')->orWhere('due_at', '>=', now()->subDays(14)))
            ->orderByRaw('due_at is null')->orderBy('due_at')->take(20)->get()
            ->map(function ($h) use ($rows) {
                $r = self::homeworkRows($h, $rows)[0];
                $lessons = self::lessons($h->subject);

                return ['hw' => $h, 'row' => $r, 'items' => collect($h->items)->map(fn ($it) => ['id' => $it, 't' => $lessons[$it]['t'] ?? $it, 'done' => $r['items'][$it], 'url' => self::link($h->subject, $it)])->all()];
            });
        $qz = SchoolQuiz::where('school_section_id', $sec->id)->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()->subDays(14)))
            ->orderBy('ends_at')->take(20)->get();
        $atts = SchoolQuizAttempt::whereIn('school_quiz_id', $qz->pluck('id'))->where('student_id', $s->id)->get();
        foreach ($atts as $a) {
            self::finalizeIfExpired($a, $qz->firstWhere('id', $a->school_quiz_id));
        }
        $atts = $atts->groupBy('school_quiz_id');
        $quizzes = $qz->map(function ($q) use ($atts, $s) {
            $mine = $atts->get($q->id, collect());
            $best = $mine->whereNotNull('submitted_at')->sortByDesc('score')->first();
            $left = max(0, (int) $q->attempts - $mine->count());
            $live = $mine->first(fn ($a) => ! $a->submitted_at);
            $can = $q->state() === 'open' && ($left > 0 || $live);

            return ['quiz' => $q, 'best' => $best, 'live' => $live, 'can' => $can, 'left' => $left,
                'new' => $can && ! $mine->count() && (! $s->school_seen_at || $q->created_at->gt($s->school_seen_at)),
                'closing' => $can && ! $best && $q->ends_at && $q->ends_at->lt(now()->addDay())];
        });
        $pendingHw = $hw->filter(fn ($h) => $h['row']['state'] !== 'done' && (! $h['hw']->due_at || $h['hw']->due_at->gt(now()->subDays(3))))->count();
        $pendingQz = $quizzes->filter(fn ($q) => $q['can'] && ! $q['best'])->count();

        return ['homework' => $hw->all(), 'quizzes' => $quizzes->all(), 'pending' => $pendingHw + $pendingQz,
            'new' => $quizzes->where('new', true)->count(), 'soon' => $quizzes->where('closing', true)->values()->all()];
    }

    public static function local(?Carbon $d, string $fmt = 'Y-m-d\TH:i'): string
    {
        return $d ? $d->copy()->timezone(SchoolStats::tz())->format($fmt) : '';
    }

    public static function parseLocal(?string $v): ?Carbon
    {
        return $v ? Carbon::parse($v, SchoolStats::tz())->utc() : null;
    }
}
