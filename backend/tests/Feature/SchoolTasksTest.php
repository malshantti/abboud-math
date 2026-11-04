<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolHomework;
use App\Models\SchoolQuiz;
use App\Models\SchoolQuizAttempt;
use App\Support\SchoolDemo;
use App\Support\Schools;
use App\Support\SchoolTasks;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Schools phase 3: homework, quiz builder/engine (server timer, attempts, tabs), manager overview, monthly + family reports. */
class SchoolTasksTest extends TestCase
{
    use RefreshDatabase;

    private function setupSchool(): array
    {
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        $s = School::create(['name' => 'مدرسة', 'slug' => 'demo', 'is_test' => true]);
        [$m] = Schools::createStaff($s, 'مدير', 'manager');
        [$t] = Schools::createStaff($s, 'معلم', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع أ', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec2 = $s->sections()->create(['grade' => 4, 'name' => 'رابع ب', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);
        Schools::createStudents($sec, ['أ1', 'ب2', 'ج3']);
        Schools::createStudents($sec2, ['خارج']);

        return [$s, $m, $t, $sec, $sec2];
    }

    private function quiz($s, $t, $sec, array $over = []): SchoolQuiz
    {
        $bank = SchoolTasks::bank('g4-math');
        $lid = $bank[0]['les'][0]['id'];
        $this->actingAs($t)->post('/s/demo/panel/sections/'.$sec->id.'/quizzes', $over + [
            'subject' => 'g4-math', 'title' => 'اختبار قصير', 'picked' => [$lid.'|0', $lid.'|1'],
            'own' => [['type' => 'tf', 'q' => 'السماء زرقاء', 'a' => '1'], ['type' => 'fill', 'q' => '٢ + ٣ = ؟', 'ans' => '٥ | خمسة'], ['type' => 'mcq', 'q' => 'اختر', 'o' => ['أ', 'ب', ''], 'a' => '1']],
            'starts' => now('Asia/Gaza')->subMinute()->format('Y-m-d\TH:i'), 'ends' => now('Asia/Gaza')->addDay()->format('Y-m-d\TH:i'),
            'duration' => 10, 'attempts' => 1, 'shuffle' => 1, 'show' => 'now',
        ])->assertRedirect();

        return SchoolQuiz::latest('id')->firstOrFail();
    }

    public function test_bank_built_from_textbook(): void
    {
        $b = SchoolTasks::bank('g4-math');
        $this->assertNotEmpty($b);
        $q = $b[0]['les'][0]['q'][0];
        $this->assertIsString($q[0]);
        $this->assertArrayHasKey($q[2], $q[1]);
        $this->assertSame([], SchoolTasks::bank('../etc'));
    }

    public function test_homework_completion_and_late(): void
    {
        [$s, , $t, $sec, $sec2] = $this->setupSchool();
        $bank = SchoolTasks::bank('g4-math');
        [$l1, $l2] = [$bank[0]['les'][0]['id'], $bank[0]['les'][1]['id']];
        $this->actingAs($t)->post('/s/demo/panel/sections/'.$sec->id.'/homework', ['subject' => 'g4-math', 'items' => [$l1, $l2, 'nope'], 'due' => now('Asia/Gaza')->subDay()->format('Y-m-d\TH:i')])->assertRedirect();
        $hw = SchoolHomework::firstOrFail();
        $this->assertSame([$l1, $l2], $hw->items);
        $kids = $sec->students()->orderBy('id')->get();
        $kids[0]->progress()->updateOrCreate(['key' => 'bustan_g4_math_v1'], ['value' => json_encode(['done' => [$l1 => 80, $l2 => 60]])]);
        $kids[1]->progress()->updateOrCreate(['key' => 'bustan_g4_math_v1'], ['value' => json_encode(['done' => [$l1 => 90]])]);
        $rows = collect(SchoolTasks::homeworkRows($hw, \App\Support\SchoolStats::section($sec)['rows']))->keyBy('id');
        $this->assertSame('done', $rows[$kids[0]->id]['state']);
        $this->assertSame(70, $rows[$kids[0]->id]['score']);
        $this->assertSame('late', $rows[$kids[1]->id]['state']);
        $this->get('/s/demo/panel/sections/'.$sec->id.'/homework/'.$hw->id)->assertOk()->assertSee('متأخر')->assertSee('أنجز');
        $this->get('/s/demo/panel/sections/'.$sec->id.'/tasks')->assertOk()->assertSee($hw->title);
        $this->get('/s/demo/panel/sections/'.$sec2->id.'/tasks')->assertNotFound();
        $this->get('/s/demo/panel/sections/'.$sec2->id.'/homework/'.$hw->id)->assertNotFound();
        // the student sees it with a direct lesson link
        $this->actingAs($kids[2]->user)->get('/s/demo/me')->assertOk()->assertSee('واجباتي')->assertSee(rawurlencode('g4/math/#/u/'.$l1), false)->assertSee('bustan_school_kid', false);
        $this->getJson('/s/demo/me.json')->assertOk()->assertJsonStructure(['pending', 'new', 'soon', 'url']);
    }

    public function test_quiz_take_server_timer_attempts_and_results(): void
    {
        [$s, $m, $t, $sec, $sec2] = $this->setupSchool();
        $q = $this->quiz($s, $t, $sec);
        $this->assertCount(5, $q->questions);
        $this->assertSame(2, collect($q->questions)->where('src', 'bank')->count());
        $kid = $sec->students()->orderBy('id')->first();
        $u = $kid->user;
        $this->actingAs($u)->get('/s/demo/me')->assertOk()->assertSee('اختبار جديد');
        $this->get('/s/demo/me/quiz/'.$q->id)->assertOk()->assertSee('ابدأ الآن');
        $this->post('/s/demo/me/quiz/'.$q->id.'/start')->assertRedirect();
        $a = SchoolQuizAttempt::firstOrFail();
        $this->get('/s/demo/me/quiz/'.$q->id)->assertOk()->assertSee('الوقت المتبقي')->assertDontSee('"a":');
        $this->postJson('/s/demo/me/quiz/'.$q->id.'/tab')->assertOk();
        $answers = [];
        foreach ($q->questions as $i => $x) {
            $answers[$i] = $x['type'] === 'fill' ? 'خمسه' : (string) $x['a'];
        }
        $answers[0] = (string) (($q->questions[0]['a'] + 1) % count($q->questions[0]['o'])); // one wrong
        $this->post('/s/demo/me/quiz/'.$q->id.'/submit', ['answers' => $answers])->assertRedirect();
        $a->refresh();
        $this->assertNotNull($a->submitted_at);
        $this->assertSame(4, $a->correct);
        $this->assertSame(80, $a->score);
        $this->assertSame(1, $a->tab_switches);
        // one attempt only, enforced server side
        $this->post('/s/demo/me/quiz/'.$q->id.'/start')->assertRedirect();
        $this->assertSame(1, SchoolQuizAttempt::count());
        $this->get('/s/demo/me/quiz/'.$q->id.'/result')->assertOk()->assertSee('80');
        // another kid starts, then time runs out: late answers are refused and it auto-submits
        $k2 = $sec->students()->orderBy('id')->skip(1)->first();
        $this->actingAs($k2->user)->post('/s/demo/me/quiz/'.$q->id.'/start');
        $a2 = SchoolQuizAttempt::where('student_id', $k2->id)->firstOrFail();
        $this->postJson('/s/demo/me/quiz/'.$q->id.'/save', ['answers' => [1 => (string) $q->questions[1]['a']]])->assertOk();
        $this->travel(11)->minutes();
        $this->postJson('/s/demo/me/quiz/'.$q->id.'/save', ['answers' => $answers])->assertStatus(409);
        $this->post('/s/demo/me/quiz/'.$q->id.'/submit', ['answers' => $answers]);
        $a2->refresh();
        $this->assertSame(1, $a2->correct);
        $this->assertTrue($a2->submitted_at->lte($a2->deadline_at));
        // a kid of another section can't see it
        $this->actingAs($sec2->students()->first()->user)->get('/s/demo/me/quiz/'.$q->id)->assertNotFound();
        // teacher results + CSV
        $this->actingAs($t)->get('/s/demo/panel/sections/'.$sec->id.'/quizzes/'.$q->id)->assertOk()->assertSee('تحليل الأسئلة')->assertSee('لم يؤدّوه')->assertSee('من إعداد المعلّم');
        $csv = $this->get('/s/demo/panel/sections/'.$sec->id.'/quizzes/'.$q->id.'?format=csv')->streamedContent();
        $this->assertStringContainsString('80', $csv);
        $this->get('/s/demo/panel/sections/'.$sec->id.'/quizzes/'.$q->id.'/attempts/'.$a->id)->assertOk();
        $this->get('/s/demo/panel/sections/'.$sec2->id.'/quizzes/'.$q->id)->assertNotFound();
    }

    public function test_results_after_close_hidden(): void
    {
        [$s, , $t, $sec] = $this->setupSchool();
        $q = $this->quiz($s, $t, $sec, ['show' => 'after']);
        $kid = $sec->students()->first();
        $this->actingAs($kid->user)->post('/s/demo/me/quiz/'.$q->id.'/start');
        $this->post('/s/demo/me/quiz/'.$q->id.'/submit', ['answers' => []]);
        $this->get('/s/demo/me/quiz/'.$q->id)->assertOk()->assertSee('بعد إغلاق');
        $this->get('/s/demo/me/quiz/'.$q->id.'/result')->assertForbidden();
    }

    public function test_manager_overview_and_reports(): void
    {
        [$s, $m, $t, $sec, $sec2] = $this->setupSchool();
        SchoolDemo::seed($sec);
        SchoolDemo::seedTasks($sec);
        $this->assertGreaterThan(0, SchoolHomework::count());
        $this->assertGreaterThan(0, SchoolQuizAttempt::count());
        $this->actingAs($t)->get('/s/demo/panel/overview')->assertForbidden();
        $this->actingAs($m)->get('/s/demo/panel/overview')->assertOk()->assertSee('مقارنة شعب')->assertSee('أضعف الدروس')->assertSee('رابع ب');
        $this->get('/s/demo/panel/monthly')->assertOk()->assertSee('التقرير الشهري')->assertSee('الأكثر اجتهادًا');
        $kid = $sec->students()->first();
        $this->get('/s/demo/panel/students/'.$kid->id.'/family')->assertOk()->assertSee('إلى الأهل')->assertSee($kid->name);
        $this->actingAs($t)->get('/s/demo/panel/monthly?section='.$sec2->id)->assertNotFound();
        $this->get('/s/demo/panel/students/'.$sec2->students()->first()->id.'/family')->assertNotFound();
    }

    public function test_monthly_review_lessons_show_lesson_names_not_page_titles(): void
    {
        [$s, , $t, $sec] = $this->setupSchool();
        SchoolDemo::seed($sec);
        $title = 'العلوم — الصف الرابع — بستان التعلّم';
        foreach ($sec->students()->get() as $kid) {
            $row = $kid->progress()->where('key', \App\Support\Report::LOG_KEY)->first();
            $log = json_decode($row->value, true);
            $code = array_key_first($log['subj']);
            $log['subj'][$code]['lessons'][$title] = ['ms' => 60000, 'n' => 40, 'ok' => 2, 'last' => 1];
            $log['subj'][$code]['lessons']['درس ضعيف للاختبار'] = ['ms' => 60000, 'n' => 40, 'ok' => 1, 'last' => 1];
            $row->update(['value' => json_encode($log, JSON_UNESCAPED_UNICODE)]);
        }
        $this->assertFalse(\App\Support\SchoolStats::isLessonName($title));
        $this->assertTrue(\App\Support\SchoolStats::isLessonName('الأعداد ضمن ٩٩٩٩٩٩'));
        $this->actingAs($t)->get('/s/demo/panel/monthly')->assertOk()
            ->assertSee('دروس تحتاج مراجعة')->assertSee('درس ضعيف للاختبار')->assertDontSee($title);
    }
}
