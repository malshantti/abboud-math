<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassroomTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role): User
    {
        $u = User::factory()->create();
        $u->setRole($role);
        $u->save();

        return $u;
    }

    private function kid(User $parent, string $name, int $grade = 6): Student
    {
        $s = new Student(['name' => $name, 'grade' => $grade]);
        $s->user()->associate($parent);
        $s->save();

        return $s;
    }

    public function test_teacher_without_class_sees_no_students(): void
    {
        $p = $this->user('parent');
        $s = $this->kid($p, 'سري');
        $t = $this->user('teacher');
        $this->actingAs($t)->get('/admin/manage/students')->assertOk()->assertDontSee('سري');
        $this->actingAs($t)->get('/admin/manage/students/'.$s->id)->assertNotFound();
        $this->actingAs($t)->get('/admin/manage/students/'.$s->id.'/report')->assertNotFound();
        $this->actingAs($t)->get('/admin/manage')->assertRedirect('/admin/manage/classes');
        $this->actingAs($t)->get('/admin/manage/classes')->assertOk()->assertSee('لم تُعيَّن لك أي صفوف');
    }

    public function test_admin_creates_class_assigns_teacher_and_teacher_sees_only_class_students(): void
    {
        \App\Models\Setting::put(['single_device' => '0']);
        $a = $this->user('admin');
        $t = $this->user('teacher');
        $t2 = $this->user('teacher');
        $p = $this->user('parent');
        $in = $this->kid($p, 'داخل');
        $out = $this->kid($p, 'خارج');
        $this->actingAs($a)->post('/admin/manage/classes', ['name' => 'السادس أ', 'grade' => 6, 'teacher_id' => $t->id])->assertRedirect();
        $c = Classroom::firstOrFail();
        $this->assertTrue($c->teachers->contains($t));
        $this->actingAs($a)->post("/admin/manage/classes/{$c->id}/students", ['student_ids' => [$in->id]])->assertRedirect();
        $this->actingAs($t)->get('/admin/manage/students')->assertSee('داخل')->assertDontSee('خارج')->assertDontSee($p->email);
        $this->actingAs($t)->get('/admin/manage/students/'.$in->id.'/report')->assertOk();
        $this->actingAs($t)->get('/admin/manage/students/'.$out->id)->assertNotFound();
        $this->actingAs($t)->get("/admin/manage/classes/{$c->id}")->assertOk()->assertSee('داخل')->assertSee($c->code);
        $this->actingAs($t)->get("/admin/manage/classes/{$c->id}/report")->assertOk()->assertSee('داخل');
        // another teacher: nothing
        $this->actingAs($t2)->get("/admin/manage/classes/{$c->id}")->assertNotFound();
        $this->actingAs($t2)->get('/admin/manage/students')->assertDontSee('داخل');
        // teachers cannot manage classes
        $this->actingAs($t)->post('/admin/manage/classes', ['name' => 'x'])->assertForbidden();
        $this->actingAs($t)->delete("/admin/manage/classes/{$c->id}/students/{$in->id}")->assertForbidden();
        // admin still sees all
        $this->actingAs($a)->get('/admin/manage/students')->assertSee('داخل')->assertSee('خارج');
    }

    public function test_parent_joins_and_leaves_with_code(): void
    {
        $t = $this->user('teacher');
        $c = Classroom::create(['name' => 'الثامن ب', 'grade' => 8, 'code' => 'K7QH2M', 'join_open' => true]);
        $c->teachers()->attach($t->id);
        $p = $this->user('parent');
        $s = $this->kid($p, 'ليان', 8);
        $other = $this->user('parent');
        $this->actingAs($other)->post("/account/students/{$s->id}/join", ['code' => 'K7QH2M'])->assertNotFound();
        $this->actingAs($p)->post("/account/students/{$s->id}/join", ['code' => 'nope'])->assertSessionHasErrors('code'.$s->id);
        $this->actingAs($p)->post("/account/students/{$s->id}/join", ['code' => ' k7qh-2m '])->assertSessionHas('status');
        $this->assertTrue($s->isVisibleTo($t));
        $this->actingAs($p)->get('/account')->assertSee('الثامن ب');
        $this->actingAs($p)->delete("/account/students/{$s->id}/classes/{$c->id}")->assertSessionHas('status');
        $this->assertFalse($s->fresh()->isVisibleTo($t));
        $c->update(['join_open' => false]);
        $this->actingAs($p)->post("/account/students/{$s->id}/join", ['code' => 'K7QH2M'])->assertSessionHasErrors('code'.$s->id);
    }
}
