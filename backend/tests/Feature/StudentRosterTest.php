<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The student picker lists only the parent's registered students, with grade in words, subjects and the parent-set PIN. */
class StudentRosterTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_lists_only_own_students_with_grade_words_subjects_and_pin(): void
    {
        config(['app.child_pin' => true]);
        $other = User::factory()->create();
        $other->students()->create(['name' => 'ميرا', 'grade' => 3]);
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(2)]);
        $this->actingAs($u)->post('/account/students', ['name' => 'عبد اللطيف', 'grade' => 1, 'pin' => '١٢٣٤'])->assertRedirect();
        $this->post('/account/students', ['name' => 'سندس', 'grade' => 6])->assertRedirect();
        $s = $this->getJson('/api/session')->assertOk()->json('students');
        $this->assertSame(['عبد اللطيف', 'سندس'], array_column($s, 'name'));
        $this->assertSame(['الصف الأول', 'الصف السادس'], array_column($s, 'grade_name'));
        $this->assertContains('الرياضيات', array_column($s[0]['subjects'], 'name'));
        $this->assertSame([1], array_unique(array_map(fn ($c) => (int) substr($c['code'], 1), $s[0]['subjects'])));
        $pin = $s[0]['pin'];
        $this->assertSame('sha256:'.hash('sha256', 'bustan:'.$pin['salt'].':1234'), $pin['hash']);
        $this->assertNull($s[1]['pin']);
        $this->assertArrayNotHasKey('pin_hash', $u->students()->first()->toArray());
    }

    public function test_pin_is_four_digits_and_blank_keeps_it(): void
    {
        config(['app.child_pin' => true]);
        $u = User::factory()->create();
        $st = $u->students()->create(['name' => 'سندس', 'grade' => 6]);
        $this->actingAs($u)->put("/account/students/{$st->id}", ['name' => 'سندس', 'grade' => 6, 'pin' => '12'])->assertSessionHasErrors('pin');
        $this->put("/account/students/{$st->id}", ['name' => 'سندس', 'grade' => 6, 'pin' => '4321'])->assertSessionHasNoErrors();
        $hash = $st->fresh()->pin_hash;
        $this->assertNotNull($hash);
        $this->put("/account/students/{$st->id}", ['name' => 'سندس', 'grade' => 6, 'pin' => ''])->assertSessionHasNoErrors();
        $this->assertSame($hash, $st->fresh()->pin_hash);
    }

    public function test_paid_account_subjects_are_only_the_subscribed_ones(): void
    {
        Setting::put(['gating_enabled' => '1']);
        $u = User::factory()->create(['trial_ends_at' => now()->subDay()]);
        $u->students()->create(['name' => 'سندس', 'grade' => 6]);
        $s = $this->actingAs($u)->getJson('/api/session')->json('students.0');
        $this->assertSame('الصف السادس', $s['grade_name']);
        $this->assertIsArray($s['subjects']);
    }

    public function test_pin_off_by_default_keeps_saved_pin_and_reports_flag(): void
    {
        $u = User::factory()->create(['role' => 'parent']);
        $st = $u->students()->create(['name' => 'سندس', 'grade' => 6]);
        $st->forceFill(['pin_hash' => 'sha256:x', 'pin_salt' => 'y'])->save();
        $this->actingAs($u)->put("/account/students/{$st->id}", ['name' => 'سندس', 'grade' => 6, 'pin' => '4321'])->assertSessionHasNoErrors();
        $this->assertSame('sha256:x', $st->fresh()->pin_hash);
        $this->assertFalse($this->getJson('/api/session')->json('pin_required'));
        $this->get('/account')->assertDontSee('اختياري: ٤ أرقام يكتبها طفلك عند الدخول');
    }
}
