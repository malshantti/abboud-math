<?php

namespace App\Support;

use App\Models\School;
use App\Models\SchoolChallenge;
use App\Models\SchoolHomework;
use App\Models\SchoolQuizAttempt;
use App\Models\SchoolSection;
use App\Models\Student;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Phase 4 — motivation. Everything here rewards EFFORT (days, minutes, homework finished, quizzes taken),
 * never marks: no score or accuracy is used for stars, honor boards, challenges or certificates.
 *
 * Stars for a period: ★1 per active day, ★1 per 15 minutes (max 8 per week-equivalent),
 * ★2 per homework finished (due in the period), ★1 per quiz taken (submitted in the period).
 */
class SchoolMotivation
{
    public const MIN_PER_STAR = 15;

    /** Week starts on Saturday (Palestinian school week). $offset 0 = this week, 1 = last week. */
    public static function week(int $offset = 0): array
    {
        $tz = SchoolStats::tz();
        $today = now($tz)->startOfDay();
        $from = $today->copy()->subDays(($today->dayOfWeek + 1) % 7)->subWeeks($offset);

        return [$from, $from->copy()->addDays(6)->endOfDay()];
    }

    /** Per-student effort for [from, to] in one section. Returns rows keyed by student id. */
    public static function effort(SchoolSection $section, Carbon $from, Carbon $to, ?Collection $rows = null): array
    {
        $rows ??= SchoolStats::section($section)['rows'];
        $f = $from->format('Y-m-d');
        $t = $to->format('Y-m-d');
        $weeks = max(1, (int) ceil(($from->diffInDays($to) + 1) / 7));
        $hwDone = [];
        $hwN = 0;
        foreach (SchoolHomework::where('school_section_id', $section->id)->whereBetween('due_at', [$from->copy()->utc(), $to->copy()->utc()])->get() as $hw) {
            $hwN++;
            foreach (SchoolTasks::homeworkRows($hw, $rows) as $r) {
                if ($r['done'] === $r['total'] && $r['total'] > 0) {
                    $hwDone[$r['id']] = ($hwDone[$r['id']] ?? 0) + 1;
                }
            }
        }
        $quiz = SchoolQuizAttempt::whereIn('student_id', $rows->pluck('id'))->whereNotNull('submitted_at')
            ->whereBetween('submitted_at', [$from->copy()->utc(), $to->copy()->utc()])
            ->whereHas('quiz', fn ($q) => $q->where('school_section_id', $section->id))
            ->selectRaw('student_id, count(distinct school_quiz_id) n')->groupBy('student_id')->pluck('n', 'student_id');
        $out = [];
        foreach ($rows as $r) {
            $days = array_filter((array) $r['days'], fn ($d) => $d >= $f && $d <= $t, ARRAY_FILTER_USE_KEY);
            $nd = count($days);
            $min = (int) round(array_sum($days) / 60000);
            $hw = $hwDone[$r['id']] ?? 0;
            $qz = (int) ($quiz[$r['id']] ?? 0);
            $stars = $nd + min(8 * $weeks, intdiv($min, self::MIN_PER_STAR)) + 2 * $hw + $qz;
            $out[$r['id']] = ['id' => $r['id'], 'name' => $r['name'], 'days' => $nd, 'min' => $min, 'hw' => $hw, 'hw_n' => $hwN, 'quiz' => $qz, 'stars' => $stars];
        }

        return $out;
    }

    /** Weekly honor board: top stars, most days, most minutes, all homework done. Ties share the title. */
    public static function honor(SchoolSection $section, int $offset = 0): array
    {
        [$from, $to] = self::week($offset);
        $e = collect(self::effort($section, $from, $to))->sortByDesc('stars')->values();
        $pos = $e->filter(fn ($x) => $x['stars'] > 0);
        $top = $pos->take(3)->pluck('stars')->last();
        $maxDays = $pos->max('days') ?: 0;
        $maxMin = $pos->max('min') ?: 0;
        $titles = [];
        foreach ($pos as $x) {
            $t = [];
            if ($top !== null && $x['stars'] >= $top) {
                $t[] = ['star', 'نجم الأسبوع'];
            }
            if ($maxDays >= 2 && $x['days'] === $maxDays) {
                $t[] = ['days', 'الأكثر مثابرة'];
            }
            if ($maxMin >= 15 && $x['min'] === $maxMin) {
                $t[] = ['time', 'بطل الوقت'];
            }
            if ($x['hw_n'] > 0 && $x['hw'] >= $x['hw_n']) {
                $t[] = ['hw', 'أنجز كل الواجبات'];
            }
            if ($t) {
                $titles[$x['id']] = $t;
            }
        }

        return ['from' => $from, 'to' => $to, 'rows' => $e, 'titles' => $titles,
            'board' => $e->filter(fn ($x) => isset($titles[$x['id']]))->values(),
            'sum' => ['stars' => $e->sum('stars'), 'active' => $e->where('days', '>', 0)->count(), 'n' => $e->count(), 'min' => $e->sum('min')]];
    }

    /** Section standings for a challenge: per-student averages so small and big sections compete fairly. */
    public static function standings(SchoolChallenge $c): array
    {
        $tz = SchoolStats::tz();
        $from = Carbon::parse($c->starts_on->format('Y-m-d'), $tz)->startOfDay();
        $to = Carbon::parse($c->ends_on->format('Y-m-d'), $tz)->endOfDay();
        $out = [];
        foreach (SchoolSection::where('school_id', $c->school_id)->whereIn('id', (array) $c->section_ids)->get() as $sec) {
            $e = collect(self::effort($sec, $from, $to));
            $n = max(1, $e->count());
            $val = match ($c->metric) {
                'days' => round($e->sum('days') / $n, 1),
                'minutes' => (int) round($e->sum('min') / $n),
                'homework' => ($hn = $e->first()['hw_n'] ?? 0) ? (int) round(100 * $e->sum('hw') / ($hn * $n)) : 0,
                default => round($e->sum('stars') / $n, 1),
            };
            $out[] = ['sec' => $sec, 'n' => $e->count(), 'active' => $e->where('days', '>', 0)->count(), 'val' => $val];
        }
        usort($out, fn ($a, $b) => $b['val'] <=> $a['val']);
        $max = max(1, (float) ($out[0]['val'] ?? 1));
        foreach ($out as $i => &$o) {
            $o['rank'] = $i > 0 && $o['val'] == $out[$i - 1]['val'] ? $out[$i - 1]['rank'] : $i + 1;
            $o['bar'] = (int) round(100 * $o['val'] / $max);
        }

        return $out;
    }

    public static function unit(string $metric): string
    {
        return ['stars' => 'نجمة لكل طالب', 'days' => 'يوم تعلّم لكل طالب', 'minutes' => 'دقيقة لكل طالب', 'homework' => '٪ إنجاز الواجبات'][$metric] ?? '';
    }

    /** Monthly certificates for a section. Effort-based only. */
    public static function certificates(SchoolSection $section, Carbon $from, Carbon $to): array
    {
        $e = collect(self::effort($section, $from, $to));
        $maxStars = $e->max('stars') ?: 0;
        $won = SchoolChallenge::where('school_id', $section->school_id)->whereBetween('ends_on', [$from->format('Y-m-d'), $to->format('Y-m-d')])
            ->whereDate('ends_on', '<', now(SchoolStats::tz())->format('Y-m-d'))->get()
            ->filter(fn ($c) => in_array($section->id, (array) $c->section_ids) && (self::standings($c)[0]['sec']->id ?? 0) === $section->id);
        $certs = [];
        foreach ($e as $x) {
            if ($maxStars >= 5 && $x['stars'] === $maxStars) {
                $certs[] = $x + ['type' => 'star', 'title' => 'شهادة نجم الشهر', 'why' => 'لأنّه جمع أكثر نجوم الجهد في شعبته: '.Ar::num($x['stars']).' نجمة.'];
            }
            if ($x['days'] >= 8) {
                $certs[] = $x + ['type' => 'days', 'title' => 'شهادة المثابرة', 'why' => 'لأنّه تعلّم '.Ar::num($x['days']).' يومًا هذا الشهر.'];
            }
            if ($x['hw_n'] > 0 && $x['hw'] >= $x['hw_n']) {
                $certs[] = $x + ['type' => 'hw', 'title' => 'شهادة إنجاز الواجبات', 'why' => 'لأنّه أنجز كل واجبات الشهر ('.Ar::num($x['hw_n']).').'];
            }
            foreach ($won as $c) {
                if ($x['days'] > 0) {
                    $certs[] = $x + ['type' => 'team', 'title' => 'شهادة الفريق الفائز', 'why' => 'لمشاركته في فوز شعبته في تحدّي «'.$c->title.'».'];
                }
            }
        }

        return $certs;
    }

    /** For the student's own page: my stars this week, am I on the board, my section's live challenges. */
    public static function forStudent(Student $s): array
    {
        $sec = $s->section;
        if (! $sec) {
            return [];
        }
        $h = self::honor($sec);
        $me = collect($h['rows'])->firstWhere('id', $s->id);
        $ch = SchoolChallenge::where('school_id', $sec->school_id)->whereDate('ends_on', '>=', now(SchoolStats::tz())->format('Y-m-d'))
            ->get()->filter(fn ($c) => in_array($sec->id, (array) $c->section_ids) && $c->state() === 'live')
            ->map(fn ($c) => ['c' => $c, 'st' => self::standings($c)])->values();

        return ['me' => $me, 'titles' => $h['titles'][$s->id] ?? [], 'board' => $h['board'], 'challenges' => $ch, 'section' => $sec];
    }

    /** Parent dashboard: days since a child last learned (null = never opened). */
    public static function idleDays(Student $s): ?int
    {
        $rows = $s->progress()->get()->keyBy('key');
        $r = SchoolStats::student($s, (int) $s->grade, $rows);

        return $r['idle'];
    }

    public static function sectionsOfSchool(School $school): Collection
    {
        return SchoolSection::where('school_id', $school->id)->orderBy('grade')->orderBy('name')->get();
    }
}
