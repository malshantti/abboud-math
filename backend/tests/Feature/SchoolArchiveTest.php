<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\Student;
use App\Support\Schools;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Teacher/manager «remove from section» is a soft archive: hidden + no login, data kept, restorable, strictly scoped. */
class SchoolArchiveTest extends TestCase
{
    use RefreshDatabase;

    private function setupSchools(): array
    {
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        $s = School::create(['name' => 'مدرسة', 'slug' => 'demo', 'is_test' => true]);
        [$m] = Schools::createStaff($s, 'مدير', 'manager');
        [$t] = Schools::createStaff($s, 'معلم', 'teacher');
        [$t2] = Schools::createStaff($s, 'معلم آخر', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع أ', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec2 = $s->sections()->create(['grade' => 4, 'name' => 'رابع ب', 'code' => \App\Models\SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);
        $sec2->teachers()->attach($t2->id, ['subjects' => 'math']);
        Schools::createStudents($sec, ['أحمد', 'سارة']);
        Schools::createStudents($sec2, ['خارج']);
        $o = School::create(['name' => 'أخرى', 'slug' => 'other', 'is_test' => true]);
        [$om] = Schools::createStaff($o, 'مدير آخر', 'manager');
        [$ot] = Schools::createStaff($o, 'معلم آخر', 'teacher');

        return [$s, $m, $t, $t2, $sec, $sec2, $om, $ot];
    }

    public function test_teacher_archives_and_restores_own_student_data_kept(): void
    {
        [, , $t, , $sec] = $this->setupSchools();
        $kid = $sec->students()->where('name', 'أحمد')->firstOrFail();
        $pin = Schools::plainPin($kid);
        $kid->progress()->create(['key' => 'g4-math', 'value' => '{"stars":3}']);

        $this->actingAs($t)->get('/s/demo/panel/sections/'.$sec->id)->assertOk()->assertSee('إزالة من الشعبة')->assertSee('إزالة «أحمد» من الشعبة؟', false);
        $this->actingAs($t)->post('/s/demo/panel/students/'.$kid->id.'/archive')->assertRedirect()->assertSessionHas('status');
        $kid->refresh();
        $this->assertNotNull($kid->archived_at);
        $this->assertNotNull($kid->user->school_logout_at);
        $this->assertSame(1, $kid->progress()->count());
        $this->assertSame($pin, Schools::plainPin($kid));

        // hidden from section list, name picker, cards, report; shown under «الطلاب المؤرشفون»
        $page = $this->actingAs($t)->get('/s/demo/panel/sections/'.$sec->id)->assertOk()->assertSee('الطلاب المؤرشفون')->assertSee('استعادة');
        $this->assertStringNotContainsString('/students/'.$kid->id.'/archive', $page->getContent());
        $this->get('/s/demo/panel/sections/'.$sec->id.'/cards')->assertOk()->assertDontSee('أحمد');
        $this->assertStringNotContainsString('أحمد', $this->get('/s/demo/panel/sections/'.$sec->id.'/report?format=csv')->streamedContent());
        auth()->logout();
        $names = $this->getJson('/s/demo/sections/'.$sec->id.'/names?c='.$sec->code)->assertOk()->json('names');
        $this->assertNotContains($kid->id, collect($names)->pluck('id')->all());
        $this->assertCount(1, $names);

        // cannot log in
        $this->postJson('/s/demo/child', ['student' => $kid->id, 'pin' => $pin])->assertStatus(422);
        $this->assertGuest();

        // restore → visible again, same PIN works
        $this->actingAs($t)->post('/s/demo/panel/students/'.$kid->id.'/restore')->assertRedirect();
        $this->assertNull($kid->fresh()->archived_at);
        $this->assertCount(2, $sec->students()->get());
        auth()->logout();
        $this->postJson('/s/demo/child', ['student' => $kid->id, 'pin' => $pin])->assertOk();
    }

    public function test_manager_can_archive_in_own_school(): void
    {
        [, $m, , , , $sec2] = $this->setupSchools();
        $kid = $sec2->students()->firstOrFail();
        $this->actingAs($m)->post('/s/demo/panel/students/'.$kid->id.'/archive')->assertRedirect();
        $this->assertNotNull($kid->fresh()->archived_at);
        $this->actingAs($m)->post('/s/demo/panel/students/'.$kid->id.'/restore')->assertRedirect();
        $this->assertNull($kid->fresh()->archived_at);
    }

    public function test_denied_for_other_section_other_school_students_and_guests(): void
    {
        [, , $t, , $sec, $sec2, $om, $ot] = $this->setupSchools();
        $mine = $sec->students()->firstOrFail();
        $theirs = $sec2->students()->firstOrFail();
        // teacher of another section in the same school
        $this->actingAs($t)->post('/s/demo/panel/students/'.$theirs->id.'/archive')->assertNotFound();
        $this->actingAs($t)->post('/s/demo/panel/students/'.$theirs->id.'/restore')->assertNotFound();
        // other school's manager/teacher, via either school slug
        foreach ([$om, $ot] as $x) {
            foreach (['demo', 'other'] as $slug) {
                $r = $this->actingAs($x)->post('/s/'.$slug.'/panel/students/'.$mine->id.'/archive');
                $this->assertContains($r->status(), [403, 404]);
            }
        }
        // a student cannot archive a classmate
        $this->actingAs($sec->students()->orderByDesc('id')->first()->user)->post('/s/demo/panel/students/'.$mine->id.'/archive')->assertForbidden();
        auth()->logout();
        $this->post('/s/demo/panel/students/'.$mine->id.'/archive')->assertForbidden();
        $this->assertNull($mine->fresh()->archived_at);
        $this->assertNull($theirs->fresh()->archived_at);
        $this->assertSame(1, Student::whereNull('archived_at')->where('school_section_id', $sec2->id)->count());
    }
}
