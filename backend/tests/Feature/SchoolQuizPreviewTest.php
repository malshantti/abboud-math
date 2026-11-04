<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolQuiz;
use App\Support\Schools;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolQuizPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_preview_as_student_saves_nothing_and_builder_has_draft(): void
    {
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        $s = School::create(['name' => 'مدرسة', 'slug' => 'pv', 'is_test' => true]);
        [$t] = Schools::createStaff($s, 'معلم', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);

        $this->actingAs($t)->get('/s/pv/panel/sections/'.$sec->id.'/quizzes/new')->assertOk()
            ->assertSee('معاينة كطالب')->assertSee('حفظ كمسودة')->assertSee('quizzes/preview', false);
        $this->actingAs($t)->post('/s/pv/panel/sections/'.$sec->id.'/quizzes/preview', [
            'subject' => 'g4-math', 'title' => 'تجربة',
            'own' => [['type' => 'mcq', 'q' => 'كم ٢ + ٢؟', 'o' => ['٤', '٥'], 'a' => '0'], ['type' => 'fill', 'q' => 'أكمل: ٣ + ١ =', 'ans' => '٤']],
        ])->assertOk()->assertSee('معاينة كطالب')->assertSee('كم ٢ + ٢؟')->assertSee('أكمل: ٣ + ١ =')->assertHeader('Cache-Control', 'max-age=0, no-store, private');
        $this->assertSame(0, SchoolQuiz::count());
        $this->post('/s/pv/panel/sections/'.$sec->id.'/quizzes/preview', ['subject' => 'g4-math'])->assertOk()->assertSee('لم تُضف أسئلة بعد');
    }
}
