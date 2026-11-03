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
        $hash = str_starts_with($item, 'T:') ? '#/test/'.substr($item, 2) : '#/u/'.$item;

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
    public static function buildQuestions(string $code, array $picked, array $own): array
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
        foreach ($own as $o) {
            $type = $o['type'] ?? '';
            $q = trim((string) ($o['q'] ?? ''));
            if ($q === '') {
                continue;
            }
            $q = mb_substr($q, 0, 400);
            if ($type === 'mcq') {
                $opts = array_values(array_filter(array_map(fn ($v) => mb_substr(trim((string) $v), 0, 160), (array) ($o['o'] ?? [])), fn ($v) => $v !== ''));
                $a = (int) ($o['a'] ?? 0);
                if (count($opts) >= 2 && $a >= 0 && $a < count($opts)) {
                    $qs[] = ['src' => 'teacher', 'type' => 'mcq', 'q' => $q, 'o' => $opts, 'a' => $a];
                }
            } elseif ($type === 'tf') {
                $qs[] = ['src' => 'teacher', 'type' => 'tf', 'q' => $q, 'o' => ['صح', 'خطأ'], 'a' => ($o['a'] ?? '1') === '0' || ($o['a'] ?? 1) === 0 ? 1 : 0];
            } elseif ($type === 'fill') {
                $ans = array_values(array_filter(array_map(fn ($v) => mb_substr(trim($v), 0, 80), explode('|', (string) ($o['ans'] ?? ''))), fn ($v) => $v !== ''));
                if ($ans) {
                    $qs[] = ['src' => 'teacher', 'type' => 'fill', 'q' => $q, 'ans' => $ans];
                }
            }
        }

        return $qs;
    }

    /** Arabic/English answer normaliser for fill-in questions. */
    public static function norm(string $v): string
    {
        $v = strtr($v, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9', 'أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ى' => 'ي', 'ة' => 'ه', '،' => ',']);
        $v = preg_replace('/[\x{064B}-\x{0652}\x{0640}]/u', '', $v);

        return mb_strtolower(trim(preg_replace('/\s+/u', ' ', $v)));
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
            if ($quiz->shuffle && $q['type'] === 'mcq') {
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
            $v = self::norm((string) $ans);

            return in_array($v, array_map([self::class, 'norm'], $q['ans']), true);
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
            return (string) $v;
        }

        return (string) ($q['o'][(int) $v] ?? '—');
    }

    public static function rightText(array $q): string
    {
        return $q['type'] === 'fill' ? implode(' / ', $q['ans']) : (string) ($q['o'][$q['a']] ?? '');
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
