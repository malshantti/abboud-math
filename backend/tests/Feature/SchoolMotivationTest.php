<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolChallenge;
use App\Models\User;
use App\Support\SchoolDemo;
use App\Support\SchoolMotivation;
use App\Support\Schools;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Schools phase 4: honor board, challenges, certificates, parent away alert. Effort only, never marks. */
class SchoolMotivationTest extends TestCase
{
    use RefreshDatabase;

    private function setupSchool(): array
    {
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        $s = School::create(['name' => 'مدرسة', 'slug' => 'demo', 'is_test' => true]);
        [$m] = Schools::createStaff($s, 'مدير', 'manager');
        [$t] = Schools::createStaff($s, 'معلم', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع أ', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);
        Schools::createStudents($sec, ['أ1', 'ب2', 'ج3', 'د4', 'ه5', 'و6', 'ز7', 'ح8']);
        SchoolDemo::seed($sec);

        return [$s, $m, $t, $sec];
    }

    public function test_week_starts_saturday(): void
    {
        [$from, $to] = SchoolMotivation::week();
        $this->assertSame(6, $from->dayOfWeek);
        $this->assertSame(6, (int) $from->diffInDays($to->copy()->startOfDay()));
    }

    public function test_honor_board_and_pages(): void
    {
        [$s, $m, $t, $sec] = $this->setupSchool();
        $h = SchoolMotivation::honor($sec);
        $this->assertGreaterThan(0, $h['sum']['stars']);
        $this->assertNotEmpty($h['board']);
        $this->actingAs($t)->get('/s/demo/panel/sections/'.$sec->id.'/honor')->assertOk()->assertSee('لوحة الشرف')->assertSee('نجم الأسبوع')->assertDontSee('٪ صواب');
        $this->actingAs($t)->get('/s/demo/panel/sections/'.$sec->id.'/honor?w=1')->assertOk();
        $this->actingAs($t)->get('/s/demo/panel/sections/'.$sec->id.'/certificates')->assertOk()->assertSee('شهادات');
        $this->actingAs($m)->get('/s/demo/panel/challenges')->assertOk()->assertSee('تحدٍّ جديد');
        $this->actingAs($t)->get('/s/demo/panel/challenges')->assertOk()->assertDontSee('تحدٍّ جديد');
    }

    public function test_challenges_manager_only_and_standings(): void
    {
        [$s, $m, $t, $sec] = $this->setupSchool();
        $r = SchoolDemo::seedMotivation($s);
        $c = SchoolChallenge::findOrFail($r['challenge']);
        $st = SchoolMotivation::standings($c);
        $this->assertCount(2, $st);
        $this->assertSame(1, $st[0]['rank']);
        $body = ['title' => 'تحدّي', 'metric' => 'days', 'sections' => [$sec->id, $r['section2']], 'starts_on' => '2026-11-01', 'ends_on' => '2026-11-07'];
        $this->actingAs($t)->post('/s/demo/panel/challenges', $body)->assertForbidden();
        $this->actingAs($m)->post('/s/demo/panel/challenges', ['sections' => [$sec->id]] + $body)->assertSessionHasErrors('sections');
        $this->actingAs($m)->post('/s/demo/panel/challenges', $body)->assertRedirect();
        $this->assertSame(2, SchoolChallenge::count());
        $this->actingAs($m)->get('/s/demo/panel/challenges')->assertOk()->assertSee('تحدّي المثابرة')->assertSee('🥇');
        $other = School::create(['name' => 'أخرى', 'slug' => 'other', 'is_test' => true]);
        $osec = $other->sections()->create(['grade' => 4, 'name' => 'س', 'code' => \App\Models\SchoolSection::newCode()]);
        $this->actingAs($m)->post('/s/demo/panel/challenges', ['sections' => [$sec->id, $osec->id]] + $body)->assertSessionHasErrors();
        $this->actingAs($m)->post('/s/demo/panel/challenges/'.$c->id.'/delete')->assertRedirect();
        $this->assertNull(SchoolChallenge::find($c->id));
    }

    public function test_student_sees_stars_and_seed_refuses_real_school(): void
    {
        [$s, $m, $t, $sec] = $this->setupSchool();
        SchoolDemo::seedMotivation($s);
        $kid = $sec->students()->orderBy('id')->first();
        $this->actingAs(User::findOrFail($kid->user_id))->get('/s/demo/me')->assertOk()->assertSee('نجومي هذا الأسبوع')->assertSee('تحدّي');
        $real = School::create(['name' => 'حقيقية', 'slug' => 'real', 'is_test' => false]);
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        SchoolDemo::seedMotivation($real);
    }

    public function test_parent_away_alert(): void
    {
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        [$s, $m, $t, $sec] = $this->setupSchool();
        $kids = $sec->students()->orderBy('id')->get();
        $this->assertSame(0, SchoolMotivation::idleDays($kids[0]));
        $this->assertGreaterThanOrEqual(3, SchoolMotivation::idleDays($kids[4]));
        $this->assertNull(SchoolMotivation::idleDays($kids[7]));
        $parent = User::factory()->create();
        $kids[4]->forceFill(['user_id' => $parent->id])->save();
        $kids[0]->forceFill(['user_id' => $parent->id])->save();
        $this->actingAs($parent)->get(route('account.home'))->assertOk()->assertSee('اشتقنا لـ'.$kids[4]->name)->assertDontSee('اشتقنا لـ'.$kids[0]->name);
    }
}
