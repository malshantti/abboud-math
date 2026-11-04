<?php

namespace App\Support;

use App\Models\School;
use App\Models\SchoolHomework;
use App\Models\SchoolQuiz;
use App\Models\SchoolQuizAttempt;
use App\Models\SchoolSection;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/** Manager dashboard and monthly reports (school, section, one student for الأهل). Read-only. */
class SchoolOverview
{
    /** Per-section stats + homework + quizzes, computed once. */
    private static function sectionData(SchoolSection $sec, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $d = SchoolStats::section($sec);
        $students = $sec->students()->get(['id', 'name']);
        $hwq = SchoolHomework::where('school_section_id', $sec->id);
        $qzq = SchoolQuiz::where('school_section_id', $sec->id);
        if ($from) {
            $hwq->whereBetween('due_at', [$from->copy()->utc(), $to->copy()->utc()]);
            $qzq->whereBetween('ends_at', [$from->copy()->utc(), $to->copy()->utc()]);
        } else {
            $hwq->where('due_at', '>=', now()->subDays(28));
            $qzq->where('ends_at', '>=', now()->subDays(28));
        }
        $hw = $hwq->orderBy('due_at')->get()->map(fn ($h) => ['hw' => $h, 'rows' => $r = SchoolTasks::homeworkRows($h, $d['rows']), 'sum' => SchoolTasks::homeworkSummary($r)]);
        $qz = $qzq->orderBy('ends_at')->get()->map(fn ($q) => ['quiz' => $q, 'res' => SchoolTasks::results($q, $students)]);
        $hwPct = $hw->count() ? (int) round($hw->avg(fn ($x) => $x['sum']['pct'])) : null;
        $qAvg = $qz->pluck('res.sum.avg')->filter(fn ($v) => $v !== null);

        return ['sec' => $sec, 'd' => $d, 'hw' => $hw, 'qz' => $qz, 'hw_pct' => $hwPct, 'quiz_avg' => $qAvg->count() ? (int) round($qAvg->avg()) : null];
    }

    /** Share of students active in each of the last 4 weeks (7-day windows ending today, oldest first). */
    private static function trend(Collection $rows): array
    {
        $tz = SchoolStats::tz();
        $today = now($tz)->startOfDay();
        $out = [];
        for ($w = 3; $w >= 0; $w--) {
            $end = $today->copy()->subDays(7 * $w);
            $start = $end->copy()->subDays(6);
            [$a, $b] = [$start->format('Y-m-d'), $end->format('Y-m-d')];
            $act = $rows->filter(function ($r) use ($a, $b, $tz) {
                foreach (array_keys($r['days']) as $d) {
                    if ($d >= $a && $d <= $b) {
                        return true;
                    }
                }
                $l = $r['last'] ? $r['last']->copy()->timezone($tz)->format('Y-m-d') : null;

                return $l && $l >= $a && $l <= $b;
            })->count();
            $out[] = ['label' => $start->format('m/d'), 'pct' => $rows->count() ? (int) round(100 * $act / $rows->count()) : 0, 'n' => $act];
        }

        return $out;
    }

    private static function weakest(Collection $all, int $take = 10): array
    {
        $les = [];
        foreach ($all as $x) {
            foreach ($x['d']['rows'] as $r) {
                foreach ($r['subjects'] as $code => $s) {
                    foreach ($s['lessons'] as $l) {
                        if (! $l['answered'] || ! SchoolStats::isLessonName($l['name'])) {
                            continue;
                        }
                        $k = $code.'|'.$l['name'];
                        $les[$k] ??= ['subject' => $s['name'], 'grade' => (int) $x['sec']->grade, 'lesson' => $l['name'], 'answered' => 0, 'correct' => 0, 'students' => 0, 'sections' => []];
                        $les[$k]['answered'] += $l['answered'];
                        $les[$k]['correct'] += $l['correct'];
                        $les[$k]['students']++;
                        $les[$k]['sections'][$x['sec']->id] = $x['sec']->name;
                    }
                }
            }
        }

        return collect($les)->filter(fn ($x) => $x['answered'] >= 8)->map(fn ($x) => $x + ['acc' => (int) round(100 * $x['correct'] / $x['answered'])])
            ->sortBy('acc')->values()->take($take)->all();
    }

    public static function build(School $school): array
    {
        $sections = SchoolSection::where('school_id', $school->id)->with('teachers:id,name')->orderBy('grade')->orderBy('name')->get();
        $all = $sections->map(fn ($s) => self::sectionData($s));
        $rowsAll = $all->flatMap(fn ($x) => $x['d']['rows']);
        $secRows = $all->map(fn ($x) => [
            'sec' => $x['sec'], 'n' => $x['d']['sum']['n'], 'week_pct' => $x['d']['sum']['week_pct'], 'today' => $x['d']['sum']['today'],
            'progress' => $x['d']['sum']['progress'], 'acc' => $x['d']['sum']['acc'], 'hw_pct' => $x['hw_pct'], 'hw_n' => $x['hw']->count(),
            'quiz_avg' => $x['quiz_avg'], 'quiz_n' => $x['qz']->count(), 'trend' => self::trend($x['d']['rows']),
            'teachers' => $x['sec']->teachers->pluck('name')->implode('، '),
        ]);
        $teachers = User::where('school_id', $school->id)->where('school_role', 'teacher')->with('schoolSections:id')->orderBy('name')->get()->map(function ($t) use ($all) {
            $mine = $all->filter(fn ($x) => $t->schoolSections->contains('id', $x['sec']->id));
            $rows = $mine->flatMap(fn ($x) => $x['d']['rows']);
            $hw = $mine->flatMap(fn ($x) => $x['hw'])->filter(fn ($h) => (int) $h['hw']->teacher_id === (int) $t->id);
            $qz = $mine->flatMap(fn ($x) => $x['qz'])->filter(fn ($q) => (int) $q['quiz']->teacher_id === (int) $t->id);
            $qa = $qz->pluck('res.sum.avg')->filter(fn ($v) => $v !== null);

            return ['name' => $t->name, 'sections' => $mine->map(fn ($x) => $x['sec']->name)->implode('، '), 'n' => $rows->count(),
                'week_pct' => $rows->count() ? (int) round(100 * $rows->where('week', true)->count() / $rows->count()) : null,
                'hw_n' => $hw->count(), 'hw_pct' => $hw->count() ? (int) round($hw->avg(fn ($h) => $h['sum']['pct'])) : null,
                'quiz_n' => $qz->count(), 'quiz_avg' => $qa->count() ? (int) round($qa->avg()) : null];
        });
        $quizzes = $all->flatMap(fn ($x) => $x['qz']->map(fn ($q) => ['quiz' => $q['quiz'], 'sec' => $x['sec'], 'sum' => $q['res']['sum'],
            'teacher' => optional($x['sec']->teachers->firstWhere('id', $q['quiz']->teacher_id))->name ?? '']))->sortByDesc(fn ($q) => $q['quiz']->ends_at)->values();
        $hwAll = $all->flatMap(fn ($x) => $x['hw']);
        $n = $rowsAll->count();

        return [
            'sum' => ['sections' => $sections->count(), 'students' => $n, 'week_pct' => $n ? (int) round(100 * $rowsAll->where('week', true)->count() / $n) : 0,
                'today' => $rowsAll->where('today', true)->count(), 'hw_pct' => $hwAll->count() ? (int) round($hwAll->avg(fn ($h) => $h['sum']['pct'])) : null, 'hw_n' => $hwAll->count(),
                'quiz_n' => $quizzes->count(), 'quiz_avg' => ($qa = $quizzes->pluck('sum.avg')->filter(fn ($v) => $v !== null))->count() ? (int) round($qa->avg()) : null],
            'sections' => $secRows, 'grades' => $secRows->groupBy(fn ($r) => (int) $r['sec']->grade), 'teachers' => $teachers,
            'trend' => self::trend($rowsAll), 'weakest' => self::weakest($all), 'quizzes' => $quizzes,
        ];
    }

    /** Minutes and active days of a stats row inside [from, to] (local dates). */
    private static function monthEffort(array $r, Carbon $from, Carbon $to): array
    {
        [$a, $b] = [$from->format('Y-m-d'), $to->format('Y-m-d')];
        $days = array_filter($r['days'], fn ($d) => $d >= $a && $d <= $b, ARRAY_FILTER_USE_KEY);

        return ['days' => count($days), 'min' => (int) round(array_sum($days) / 60000)];
    }

    public static function monthly(School $school, Collection $sections, Carbon $from, Carbon $to): array
    {
        $out = [];
        foreach ($sections as $sec) {
            $x = self::sectionData($sec, $from, $to);
            $students = $x['d']['rows']->map(function ($r) use ($x, $from, $to) {
                $e = self::monthEffort($r, $from, $to);
                $hwDone = $x['hw']->filter(fn ($h) => collect($h['rows'])->firstWhere('id', $r['id'])['state'] === 'done')->count();
                $qs = $x['qz']->map(fn ($q) => collect($q['res']['rows'])->firstWhere('id', $r['id'])['best']?->score)->filter(fn ($v) => $v !== null);

                return ['id' => $r['id'], 'name' => $r['name'], 'days' => $e['days'], 'min' => $e['min'], 'progress' => $r['progress'], 'acc' => $r['acc'],
                    'hw' => $hwDone, 'quiz' => $qs->count() ? (int) round($qs->avg()) : null, 'quiz_n' => $qs->count()];
            });
            $act = $students->where('days', '>', 0)->count();
            $out[] = ['sec' => $sec, 'n' => $students->count(), 'active' => $act, 'active_pct' => $students->count() ? (int) round(100 * $act / $students->count()) : 0,
                'min' => $students->sum('min'), 'progress' => $x['d']['sum']['progress'], 'acc' => $x['d']['sum']['acc'],
                'hw' => $x['hw'], 'hw_pct' => $x['hw_pct'], 'qz' => $x['qz'], 'quiz_avg' => $x['quiz_avg'],
                'top' => $students->filter(fn ($s) => $s['min'] > 0)->sortByDesc(fn ($s) => [$s['days'], $s['min']])->take(5)->values(),
                'students' => $students->sortBy('name')->values(), 'weak' => $x['d']['lessons']];
        }
        $n = array_sum(array_column($out, 'n'));
        $act = array_sum(array_column($out, 'active'));
        $hp = array_filter(array_column($out, 'hw_pct'), fn ($v) => $v !== null);
        $qp = array_filter(array_column($out, 'quiz_avg'), fn ($v) => $v !== null);

        return ['sections' => $out, 'sum' => ['n' => $n, 'active' => $act, 'active_pct' => $n ? (int) round(100 * $act / $n) : 0, 'min' => array_sum(array_column($out, 'min')),
            'hw_pct' => $hp ? (int) round(array_sum($hp) / count($hp)) : null, 'quiz_avg' => $qp ? (int) round(array_sum($qp) / count($qp)) : null,
            'hw_n' => array_sum(array_map(fn ($s) => $s['hw']->count(), $out)), 'quiz_n' => array_sum(array_map(fn ($s) => $s['qz']->count(), $out))]];
    }

    public static function family(Student $student, SchoolSection $section, Carbon $from, Carbon $to): array
    {
        $student->load(['user:id,username,last_login_at,active_device_seen_at', 'progress']);
        $r = SchoolStats::student($student, (int) $section->grade, $student->progress->keyBy('key'));
        $e = self::monthEffort($r, $from, $to);
        $rows = collect([$r]);
        $hw = SchoolHomework::where('school_section_id', $section->id)->whereBetween('due_at', [$from->copy()->utc(), $to->copy()->utc()])->orderBy('due_at')->get()
            ->map(fn ($h) => ['hw' => $h, 'row' => SchoolTasks::homeworkRows($h, $rows)[0]]);
        $qz = SchoolQuiz::where('school_section_id', $section->id)->whereBetween('ends_at', [$from->copy()->utc(), $to->copy()->utc()])->orderBy('ends_at')->get();
        $atts = SchoolQuizAttempt::whereIn('school_quiz_id', $qz->pluck('id'))->where('student_id', $student->id)->get();
        foreach ($atts as $a) {
            SchoolTasks::finalizeIfExpired($a, $qz->firstWhere('id', $a->school_quiz_id));
        }
        $quizzes = $qz->map(fn ($q) => ['quiz' => $q, 'best' => $atts->where('school_quiz_id', $q->id)->whereNotNull('submitted_at')->sortByDesc('score')->first()]);
        $lessons = collect($r['subjects'])->flatMap(fn ($s) => collect($s['lessons'])->map(fn ($l) => $l + ['subject' => $s['name']]))->filter(fn ($l) => $l['answered'] >= 4);

        return ['student' => $student, 'r' => $r, 'effort' => $e, 'hw' => $hw, 'quizzes' => $quizzes,
            'strong' => $lessons->sortByDesc('pct')->take(3)->values(), 'practice' => $lessons->filter(fn ($l) => $l['pct'] < 70)->sortBy('pct')->take(3)->values()];
    }
}
