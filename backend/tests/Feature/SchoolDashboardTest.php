<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use App\Support\SchoolDemo;
use App\Support\Schools;
use App\Support\SchoolStats;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Schools phase 2: section dashboard (attendance, progress, hardest questions, CSV) and student page. */
class SchoolDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function setupSchool(bool $test = true): array
    {
        $s = School::create(['name' => 'مدرسة', 'slug' => $test ? 'demo' : 'real', 'is_test' => $test]);
        [$m] = Schools::createStaff($s, 'مدير', 'manager');
        [$t] = Schools::createStaff($s, 'معلم', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع أ', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec2 = $s->sections()->create(['grade' => 4, 'name' => 'رابع ب', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);
        Schools::createStudents($sec, ['أ1', 'ب2', 'ج3', 'د4', 'ه5', 'و6', 'ز7', 'ح8']);
        Schools::createStudents($sec2, ['خارج']);

        return [$s, $m, $t, $sec, $sec2];
    }

    public function test_stats_attendance_progress_and_hardest(): void
    {
        [$s, , $t, $sec] = $this->setupSchool();
        $this->assertSame(7, SchoolDemo::seed($sec));
        $d = SchoolStats::section($sec);
        $this->assertSame(8, $d['sum']['n']);
        $this->assertSame(2, $d['sum']['today']);
        $this->assertSame(1, $d['sum']['never']);
        $this->assertSame(2, $d['sum']['idle3']);
        $this->assertSame(2, $d['sum']['idle7']); // 9 days + never
        $this->assertNotNull($d['sum']['progress']);
        $this->assertNotEmpty($d['questions']);
        $this->assertNotEmpty($d['lessons']);
        $m = SchoolStats::section($sec, 'math');
        $this->assertSame('g4-math', $m['subject']);
        $this->assertTrue(collect($m['questions'])->every(fn ($q) => $q['subject'] === 'الرياضيات'));
    }

    public function test_pages_csv_and_isolation(): void
    {
        [$s, $mgr, $t, $sec, $sec2] = $this->setupSchool();
        SchoolDemo::seed($sec);
        $this->actingAs($t);
        $this->get('/s/demo/panel/sections/'.$sec->id.'/report')->assertOk()->assertSee('أصعب الأسئلة')->assertSee('الحضور')->assertSee('غائب');
        $this->get('/s/demo/panel/sections/'.$sec->id.'/report?subject=math')->assertOk()->assertSee('الرياضيات');
        $csv = $this->get('/s/demo/panel/sections/'.$sec->id.'/report?format=csv');
        $csv->assertOk();
        $body = $csv->streamedContent();
        $this->assertStringContainsString('أ1', $body);
        $this->assertStringNotContainsString('خارج', $body);
        $kid = $sec->students()->first();
        $this->get('/s/demo/panel/students/'.$kid->id)->assertOk()->assertSee('آخر الأخطاء')->assertSee($kid->name);
        // teacher can't open another section's dashboard or student
        $this->get('/s/demo/panel/sections/'.$sec2->id.'/report')->assertNotFound();
        $this->get('/s/demo/panel/students/'.$sec2->students()->first()->id)->assertNotFound();
        $this->actingAs($mgr)->get('/s/demo/panel/sections/'.$sec2->id.'/report')->assertOk();
        // other school staff blocked
        $o = School::create(['name' => 'أخرى', 'slug' => 'other']);
        [$ot] = Schools::createStaff($o, 'غريب', 'manager');
        $this->actingAs($ot)->get('/s/demo/panel/sections/'.$sec->id.'/report')->assertRedirect();
        $this->get('/s/other/panel/students/'.$kid->id)->assertNotFound();
    }

    public function test_demo_refuses_real_school(): void
    {
        [, , , $sec] = $this->setupSchool(false);
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        SchoolDemo::seed($sec);
    }
}
