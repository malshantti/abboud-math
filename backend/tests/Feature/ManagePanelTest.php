<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagePanelTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $u = User::factory()->create(['email' => 'admin@example.test', 'password' => 'An-example-passphrase-123']);
        $u->setRole('admin');
        $u->save();

        return $u;
    }

    private function teacher(): User
    {
        $u = User::factory()->create(['email' => 'teacher@example.test', 'password' => 'An-example-passphrase-123']);
        $u->setRole('teacher');
        $u->save();

        return $u;
    }

    public function test_guests_and_parents_cannot_open_management(): void
    {
        $this->get('/admin/manage')->assertRedirect('/login');
        $this->get('/admin/manage/users')->assertRedirect('/login');
        $parent = User::factory()->create();
        foreach (['/admin/manage', '/admin/manage/students', '/admin/manage/users', '/admin/manage/settings', '/admin/manage/activity', '/admin/manage/export/users'] as $url) {
            $this->actingAs($parent)->get($url)->assertRedirect('/account');
        }
    }

    public function test_teacher_can_log_in_and_see_students_but_not_admin_sections(): void
    {
        $t = $this->teacher();
        $this->post('/login', ['email' => 'teacher@example.test', 'password' => 'An-example-passphrase-123'])->assertRedirect('/admin/manage');
        $this->get('/admin')->assertOk();
        $this->get('/admin/manage')->assertRedirect('/admin/manage/classes');
        $this->get('/admin/manage/classes')->assertOk()->assertSee('صفوفي')->assertDontSee('سجل النشاط');
        $s = User::factory()->create()->students()->create(['name' => 'سامي', 'grade' => 6]);
        // Privacy: a teacher only sees students in their own classes.
        $this->get('/admin/manage/students')->assertOk()->assertDontSee('سامي');
        $c = \App\Models\Classroom::create(['name' => 'ص', 'code' => 'ABCDEF']);
        $c->teachers()->attach($t->id);
        $c->students()->attach($s->id);
        $this->get('/admin/manage/students')->assertOk()->assertSee('سامي');
        $this->get("/admin/manage/students/{$s->id}")->assertOk();
        foreach (['/admin/manage/users', '/admin/manage/settings', '/admin/manage/activity', '/admin/manage/subscriptions', '/admin/manage/export/users'] as $url) {
            $this->get($url)->assertForbidden();
        }
        $this->delete("/admin/manage/students/{$s->id}", ['confirm' => 1])->assertForbidden();
    }

    public function test_parent_cannot_use_admin_login(): void
    {
        User::factory()->create(['email' => 'p@example.test', 'password' => 'An-example-passphrase-123']);
        $this->post('/login', ['email' => 'p@example.test', 'password' => 'An-example-passphrase-123'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_dashboard_shows_real_numbers(): void
    {
        $admin = $this->admin();
        $p = User::factory()->count(3)->create();
        $p[0]->students()->create(['name' => 'أ', 'grade' => 6]);
        $p[1]->students()->create(['name' => 'ب', 'grade' => 6]);
        $this->actingAs($admin)->get('/admin/manage')->assertOk()->assertSeeInOrder(['٣', 'أولياء الأمور', '٢', 'الطلاب'], false);
    }

    public function test_admin_manages_users(): void
    {
        $admin = $this->admin();
        $u = User::factory()->create(['name' => 'سعاد', 'email' => 's@example.test']);
        $this->actingAs($admin)->get('/admin/manage/users?q=سعاد')->assertOk()->assertSee('s@example.test');
        $this->get('/admin/manage/users?q=zzz')->assertDontSee('s@example.test');
        $this->put("/admin/manage/users/{$u->id}", ['name' => 'سعاد م', 'email' => 's@example.test', 'role' => 'teacher'])->assertSessionHas('status');
        $this->assertSame('teacher', $u->fresh()->role);
        $this->post("/admin/manage/users/{$u->id}/toggle");
        $this->assertNotNull($u->fresh()->disabled_at);
        $this->post("/admin/manage/users/{$u->id}/password", ['password' => 'brand-new-99']);
        $this->assertTrue(password_verify('brand-new-99', $u->fresh()->password));
        $this->delete("/admin/manage/users/{$u->id}", ['confirm_email' => 'wrong'])->assertSessionHasErrors('confirm_email');
        $this->delete("/admin/manage/users/{$u->id}", ['confirm_email' => 's@example.test'])->assertRedirect('/admin/manage/users');
        $this->assertNull($u->fresh());
        // Cannot lock self out.
        $this->post("/admin/manage/users/{$admin->id}/toggle")->assertStatus(422);
        $this->put("/admin/manage/users/{$admin->id}", ['name' => 'a', 'email' => $admin->email, 'role' => 'parent'])->assertSessionHasErrors('role');
        $this->assertDatabaseHas('activity_logs', ['action' => 'user.delete']);
        $this->get('/admin/manage/activity')->assertOk()->assertSee('حذف مستخدم');
    }

    public function test_settings_drive_public_api_and_trial(): void
    {
        $admin = $this->admin();
        $prices = [];
        foreach (\App\Support\Ar::SUBJECTS as $code => $_) {
            $prices[$code] = ['price' => 10, 'days' => 30];
        }
        $prices['g6-math'] = ['price' => 25, 'days' => 60];
        $this->actingAs($admin)->put('/admin/manage/settings', [
            'site_name' => 'بستان التعلّم', 'tagline' => 'نزرع الفهم، ونحصد المعرفة', 'announcement' => 'عطلة الجمعة', 'announcement_active' => '1',
            'registration_open' => '0', 'gating_enabled' => '1', 'trial_days' => 5, 'whatsapp_number' => '+970 599 123456', 'currency' => 'شيكل', 'prices' => $prices,
        ])->assertSessionHas('status');
        $this->assertSame('970599123456', Setting::get('whatsapp_number'));
        $this->assertSame(25, Setting::plans()['g6-math']['price']);
        $this->assertSame(60, Setting::plans()['g6-math']['days']);
        auth()->logout();
        $this->getJson('/api/site')->assertJson(['announcement' => 'عطلة الجمعة', 'registration_open' => false]);
    }

    public function test_admin_activates_whatsapp_request_and_exports_csv(): void
    {
        $admin = $this->admin();
        $u = User::factory()->create(['trial_ends_at' => now()->subDay(), 'name' => '=cmd']);
        $sub = $u->subscriptions()->save(new Subscription(['code' => 'ABCD-1234', 'plan' => 'g1-arabic', 'plan_name' => 'العربية — الصف الأول', 'price' => 15, 'currency' => 'شيكل', 'days' => 30, 'status' => 'pending']));
        $this->actingAs($admin)->get('/admin/manage/subscriptions?q=ABCD')->assertOk()->assertSee('ABCD-1234');
        $this->post("/admin/manage/subscriptions/{$sub->id}/activate", ['days' => 30])->assertSessionHas('status');
        $sub->refresh();
        $this->assertSame('active', $sub->status);
        $this->assertTrue(\App\Support\Access::allows($u, 'g1-arabic'));
        $this->assertFalse(\App\Support\Access::allows($u, 'g6-math'));

        $csv = $this->get('/admin/manage/export/users');
        $csv->assertOk()->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $body = $csv->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $body);
        $this->assertStringContainsString("'=cmd", $body);
        $this->get('/admin/manage/export/subscriptions')->assertOk();
        $this->get('/admin/manage/export/nope')->assertNotFound();
    }

    public function test_student_progress_view_groups_by_grade_and_subject(): void
    {
        $admin = $this->admin();
        $s = User::factory()->create()->students()->create(['name' => 'سامي', 'grade' => 6]);
        $s->progress()->create(['key' => 'bustan_g6_math_v1', 'value' => '{"points":42,"done":[1,2,3]}', 'client_updated_at' => 1700000000000]);
        $s->progress()->create(['key' => 'bustan_g1_arabic_v1', 'value' => '{}', 'client_updated_at' => 1700000000000]);
        $this->actingAs($admin)->get("/admin/manage/students/{$s->id}")->assertOk()
            ->assertSeeInOrder(['الصف الأول', 'العربية', 'الصف السادس', 'الرياضيات', '٤٢', '٣']);
    }

    public function test_bulk_actions(): void
    {
        $admin = $this->admin();
        $us = User::factory()->count(3)->create();
        $this->actingAs($admin)->post('/admin/manage/users/bulk', ['ids' => [$us[0]->id, $us[1]->id, $admin->id], 'action' => 'disable'])->assertSessionHas('status');
        $this->assertNotNull($us[0]->fresh()->disabled_at);
        $this->assertNull($admin->fresh()->disabled_at);
        $this->post('/admin/manage/users/bulk', ['ids' => [$us[2]->id], 'action' => 'delete'])->assertStatus(422);
        $this->post('/admin/manage/users/bulk', ['ids' => [$us[2]->id], 'action' => 'delete', 'confirm' => 1]);
        $this->assertNull($us[2]->fresh());
        $sub = $us[0]->subscriptions()->save(new Subscription(['code' => 'B-1', 'plan' => 'g8-math', 'plan_name' => 'x', 'days' => 30, 'status' => 'pending']));
        $this->post('/admin/manage/subscriptions/bulk', ['ids' => [$sub->id], 'action' => 'activate']);
        $this->assertSame('active', $sub->fresh()->status);
        $this->assertTrue($sub->fresh()->ends_at->isAfter(now()->addDays(29)));
    }
}
