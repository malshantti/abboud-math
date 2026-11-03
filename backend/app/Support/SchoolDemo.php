<?php

namespace App\Support;

use App\Models\School;
use App\Models\SchoolSection;
use Illuminate\Support\Facades\DB;

/** Realistic TEST activity for a test school only (is_test). Never runs on a real school. */
class SchoolDemo
{
    private const LESSONS = [
        'math' => ['الأعداد ضمن ٩٩٩٩٩٩', 'القيمة المنزلية', 'مقارنة الأعداد وترتيبها', 'الجمع مع إعادة التجميع', 'الطرح مع الاستلاف', 'الضرب في عدد من منزلة واحدة', 'القسمة مع باقٍ', 'الكسور المتكافئة'],
        'arabic' => ['درس القراءة: الأمانة', 'همزة الوصل وهمزة القطع', 'الفعل الماضي', 'الجملة الاسمية', 'التاء المربوطة والمبسوطة', 'الإملاء: الألف اللينة'],
        'english' => ['My School', 'Daily Routines', 'Animals Around Us', 'Food and Drinks', 'Telling the Time', 'Weather'],
        'science' => ['أجزاء النبات', 'دورة حياة الحشرة', 'حالات المادة', 'الضوء والظل', 'السلسلة الغذائية', 'الصخور والتربة'],
    ];

    private const WRONG = [
        'math' => [['ما القيمة المنزلية للرقم ٧ في العدد ٣٧٤٥٢١؟', 'آلاف', 'عشرات الألوف', 'القيمة المنزلية'], ['٤٠٠٢ − ١٥٨٧ = ؟', '٢٥٢٥', '٢٤١٥', 'الطرح مع الاستلاف'],
            ['ناتج ٣٦٤ × ٧ = ؟', '٢٤٤٨', '٢٥٤٨', 'الضرب في عدد من منزلة واحدة'], ['ما الكسر المكافئ لـ ٢/٣؟', '٣/٤', '٤/٦', 'الكسور المتكافئة'], ['٥٧ ÷ ٤ = ؟', '١٤ والباقي ٢', '١٤ والباقي ١', 'القسمة مع باقٍ']],
        'arabic' => [['اختر الكلمة التي تبدأ بهمزة وصل:', 'أمل', 'استمع', 'همزة الوصل وهمزة القطع'], ['أين التاء المربوطة؟', 'بنت', 'مدرسة', 'التاء المربوطة والمبسوطة'], ['ما الفعل الماضي في: «كتبَ سامي الدرس»؟', 'سامي', 'كتبَ', 'الفعل الماضي']],
        'english' => [['What time is it? (7:30)', 'seven o\'clock', 'half past seven', 'Telling the Time'], ['Choose: She ___ to school every day.', 'go', 'goes', 'Daily Routines'], ['Which one is a drink?', 'bread', 'juice', 'Food and Drinks']],
        'science' => [['أيّ جزء من النبات يمتصّ الماء؟', 'الورقة', 'الجذر', 'أجزاء النبات'], ['تتحوّل المادة من سائل إلى غاز عند:', 'التجمّد', 'التبخّر', 'حالات المادة'], ['ماذا يتكوّن عندما يحجب جسم الضوء؟', 'قوس قزح', 'الظل', 'الضوء والظل']],
    ];

    /** profile per student index: [days since last seen (null = never), activity level 0–1, accuracy]. */
    private const PROFILES = [[0, 0.9, 0.86], [0, 0.6, 0.72], [1, 0.75, 0.64], [2, 0.4, 0.8], [4, 0.35, 0.55], [5, 0.2, 0.7], [9, 0.15, 0.5], [null, 0, 0]];

    public static function seed(SchoolSection $section): int
    {
        $school = School::findOrFail($section->school_id);
        abort_unless($school->is_test, 403, 'Test schools only');
        $g = (int) $section->grade;
        $tz = SchoolStats::tz();
        mt_srand(4242 + $section->id);
        $n = 0;
        foreach ($section->students()->orderBy('id')->get()->values() as $i => $s) {
            [$ago, $lvl, $acc] = self::PROFILES[$i % count(self::PROFILES)];
            if ($ago === null) {
                continue;
            }
            $now = now($tz)->subDays($ago)->setTime(17 - ($i % 5), 10 + 7 * $i % 50);
            $subjLog = [];
            foreach (self::LESSONS as $subj => $lessons) {
                $code = 'g'.$g.'-'.$subj;
                $key = $g === 8 && $subj === 'math' ? 'abboud_math_v1' : 'bustan_'.str_replace('-', '_', $code).'_v1';
                $take = max(1, (int) round(count($lessons) * $lvl * (0.6 + mt_rand(0, 40) / 100)));
                $done = [];
                $lesLog = [];
                $tot = ['n' => 0, 'ok' => 0, 'ms' => 0];
                $days = [];
                $dn = [];
                foreach (array_slice($lessons, 0, $take) as $j => $name) {
                    $t = $now->copy()->subDays(($take - 1 - $j) * 2)->subMinutes(mt_rand(0, 300));
                    $qn = mt_rand(6, 14);
                    $hard = str_contains(implode('|', array_column(self::WRONG[$subj], 3)), $name) ? 0.18 : 0;
                    $ok = (int) round($qn * max(0.2, min(1, $acc - $hard + mt_rand(-8, 8) / 100)));
                    $ms = mt_rand(6, 22) * 60000;
                    $done['les:'.($j + 1)] = max(10, (int) round(100 * $ok / $qn));
                    $lesLog[$name] = ['ms' => $ms, 'n' => $qn, 'ok' => $ok, 'last' => $t->getTimestampMs()];
                    $d = $t->format('Y-m-d');
                    $days[$d] = ($days[$d] ?? 0) + $ms;
                    $dn[$d] = [($dn[$d][0] ?? 0) + $qn, ($dn[$d][1] ?? 0) + $ok];
                    $tot['n'] += $qn; $tot['ok'] += $ok; $tot['ms'] += $ms;
                }
                $wrong = [];
                foreach (self::WRONG[$subj] as $k => [$q, $a, $c, $l]) {
                    if (isset($lesLog[$l]) && mt_rand(0, 100) < 100 * (1.15 - $acc)) {
                        $wrong[] = ['l' => $l, 'q' => $q, 'a' => $a, 'c' => $c, 't' => $lesLog[$l]['last']];
                    }
                }
                $quizzes = [['score' => (int) round(100 * $tot['ok'] / max(1, $tot['n'])), 'date' => $now->toIso8601String()]];
                $s->progress()->updateOrCreate(['key' => $key],
                    ['value' => json_encode(['xp' => $tot['ok'] * 10, 'streak' => $ago ? 0 : 3, 'last' => $now->format('Y-m-d'), 'done' => $done, 'quizzes' => $quizzes, 'test_data' => true], JSON_UNESCAPED_UNICODE), 'client_updated_at' => $now->getTimestampMs()]);
                $subjLog[$code] = ['ms' => $tot['ms'], 'n' => $tot['n'], 'ok' => $tot['ok'], 'days' => $days, 'dn' => $dn, 'lessons' => $lesLog, 'wrong' => $wrong];
            }
            $s->progress()->updateOrCreate(['key' => Report::LOG_KEY],
                ['value' => json_encode(['v' => 1, 'test_data' => true, 't' => $now->getTimestampMs(), 'subj' => $subjLog], JSON_UNESCAPED_UNICODE), 'client_updated_at' => $now->getTimestampMs()]);
            DB::table('student_progress')->where('student_id', $s->id)->update(['updated_at' => $now->copy()->utc(), 'created_at' => $now->copy()->utc()]);
            DB::table('students')->where('id', $s->id)->update(['last_synced_at' => $now->copy()->utc()]);
            DB::table('users')->where('id', $s->user_id)->update(['last_login_at' => $now->copy()->utc(), 'active_device_seen_at' => $now->copy()->utc()]);
            $n++;
        }

        return $n;
    }

    /** TEST homework, quizzes and attempts for a test school (replaces earlier test tasks of this section). */
    public static function seedTasks(SchoolSection $section): array
    {
        $school = School::findOrFail($section->school_id);
        abort_unless($school->is_test, 403, 'Test schools only');
        $g = (int) $section->grade;
        $teacher = $section->teachers()->value('users.id');
        \App\Models\SchoolHomework::where('school_section_id', $section->id)->where('is_test', true)->delete();
        \App\Models\SchoolQuiz::where('school_section_id', $section->id)->where('is_test', true)->delete();
        $kids = $section->students()->orderBy('id')->get()->values();
        $made = ['homework' => 0, 'quizzes' => 0, 'attempts' => 0];
        $plan = [['math', 0, -9, [0.9, 0.8, 0.8, 0.6, 0.5, 0.3, 0.1, 0]], ['science', 0, -2, [0.9, 0.7, 0.8, 0.5, 0.3, 0.2, 0, 0]], ['math', 1, 3, [0.6, 0.4, 0.3, 0.2, 0, 0, 0, 0]], ['arabic', 0, 5, [0.3, 0.2, 0, 0, 0, 0, 0, 0]]];
        mt_srand(777 + $section->id);
        foreach ($plan as [$subj, $unit, $dueDays, $rate]) {
            $code = 'g'.$g.'-'.$subj;
            $u = SchoolTasks::bank($code)[$unit] ?? null;
            if (! $u) {
                continue;
            }
            $items = array_slice(array_column($u['les'], 'id'), 0, 3);
            $hw = \App\Models\SchoolHomework::create(['school_id' => $school->id, 'school_section_id' => $section->id, 'teacher_id' => $teacher, 'subject' => $code,
                'title' => '[تجريبي] '.SchoolStats::subjectName($code).': '.$u['t'], 'items' => $items, 'due_at' => now()->addDays($dueDays)->setTime(18, 0), 'is_test' => true]);
            $hw->forceFill(['created_at' => now()->addDays($dueDays - 5)])->save();
            $made['homework']++;
            $key = $g === 8 && $subj === 'math' ? 'abboud_math_v1' : 'bustan_'.str_replace('-', '_', $code).'_v1';
            foreach ($kids as $i => $k) {
                $r = $rate[$i % count($rate)];
                $n = $r >= 0.8 ? count($items) : (int) floor(count($items) * $r * 1.2);
                if (! $n) {
                    continue;
                }
                $row = $k->progress()->firstOrNew(['key' => $key]);
                $blob = json_decode((string) $row->value, true) ?: ['xp' => 0, 'done' => [], 'test_data' => true];
                foreach (array_slice($items, 0, $n) as $it) {
                    $blob['done'][$it] = max(40, min(100, (int) round(100 * (0.45 + $r / 2) + mt_rand(-10, 10))));
                }
                $row->value = json_encode($blob, JSON_UNESCAPED_UNICODE);
                $row->save();
            }
        }
        foreach ([['math', 0, -6, -4, [92, 75, 83, 58, 40, null, null, null]], ['science', 0, -1, 2, [100, 67, null, 50, null, null, null, null]]] as [$subj, $unit, $startD, $endD, $scores]) {
            $code = 'g'.$g.'-'.$subj;
            $u = SchoolTasks::bank($code)[$unit] ?? null;
            if (! $u) {
                continue;
            }
            $picked = [];
            foreach (array_slice($u['les'], 0, 3) as $l) {
                foreach (array_slice(array_keys($l['q']), 0, 2) as $qi) {
                    $picked[] = $l['id'].'|'.$qi;
                }
            }
            $qs = SchoolTasks::buildQuestions($code, $picked, [['type' => 'tf', 'q' => '[تجريبي] سؤال من إعداد المعلّم: الماء يغلي عند ١٠٠ درجة.', 'a' => '1'], ['type' => 'fill', 'q' => '[تجريبي] أكمل: ٥ × ٤ = …', 'ans' => '٢٠|عشرون']]);
            $quiz = \App\Models\SchoolQuiz::create(['school_id' => $school->id, 'school_section_id' => $section->id, 'teacher_id' => $teacher, 'subject' => $code,
                'title' => '[تجريبي] اختبار '.SchoolStats::subjectName($code).': '.$u['t'], 'questions' => $qs, 'starts_at' => now()->addDays($startD)->setTime(8, 0),
                'ends_at' => now()->addDays($endD)->setTime(20, 0), 'duration_min' => 15, 'attempts' => 1, 'shuffle' => true, 'show_results' => 'now', 'is_test' => true]);
            $quiz->forceFill(['created_at' => now()->addDays($startD)->setTime(7, 0)])->save();
            $made['quizzes']++;
            foreach ($kids as $i => $k) {
                $sc = $scores[$i % count($scores)];
                if ($sc === null) {
                    continue;
                }
                $n = count($qs);
                $want = (int) round($n * $sc / 100);
                $ans = [];
                foreach ($qs as $qi => $q) {
                    $right = $qi < $want;
                    $ans[$qi] = $q['type'] === 'fill' ? ($right ? $q['ans'][0] : '٢٥') : (string) ($right ? $q['a'] : ($q['a'] + 1) % count($q['o']));
                }
                $start = now()->addDays(min(0, $endD) - 1)->setTime(16, 5 + $i * 3);
                $a = \App\Models\SchoolQuizAttempt::create(['school_quiz_id' => $quiz->id, 'student_id' => $k->id, 'attempt' => 1, 'started_at' => $start,
                    'deadline_at' => $start->copy()->addMinutes(15), 'layout' => array_map(fn ($qi) => [$qi, isset($qs[$qi]['o']) ? range(0, count($qs[$qi]['o']) - 1) : []], array_keys($qs)),
                    'answers' => $ans, 'total' => $n, 'tab_switches' => $i === 4 ? 3 : ($i % 2)]);
                SchoolTasks::submit($a, $quiz);
                $a->forceFill(['submitted_at' => $start->copy()->addMinutes(6 + $i)])->save();
                $made['attempts']++;
            }
        }

        return $made;
    }

    /** Phase 4 TEST data only: a second test section with test children + activity, and one live test challenge. */
    public static function seedMotivation(School $school): array
    {
        abort_unless($school->is_test, 403, 'Test schools only');
        $first = $school->sections()->orderBy('id')->firstOrFail();
        $sec2 = $school->sections()->where('name', 'رابع ب (تجريبي)')->first()
            ?? $school->sections()->create(['grade' => $first->grade, 'name' => 'رابع ب (تجريبي)', 'code' => SchoolSection::newCode()]);
        if (! $sec2->students()->exists()) {
            Schools::createStudents($sec2, ['سلمى (تجريبي)', 'آدم (تجريبي)', 'جود (تجريبي)', 'كريم (تجريبي)', 'ريم (تجريبي)', 'زين (تجريبي)']);
        }
        $n = self::seed($sec2);
        $tz = SchoolStats::tz();
        \App\Models\SchoolChallenge::where('school_id', $school->id)->where('is_test', true)->delete();
        $c = \App\Models\SchoolChallenge::create(['school_id' => $school->id, 'title' => '[تجريبي] تحدّي المثابرة', 'metric' => 'stars',
            'section_ids' => [$first->id, $sec2->id], 'starts_on' => now($tz)->subDays(6)->format('Y-m-d'), 'ends_on' => now($tz)->addDays(3)->format('Y-m-d'), 'is_test' => true]);

        return ['section2' => $sec2->id, 'students' => $n, 'challenge' => $c->id];
    }
}
