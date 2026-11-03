<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Funnel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LiveDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $u = User::factory()->create(['email' => 'admin@example.test']);
        $u->setRole('admin');
        $u->save();

        return $u;
    }

    public function test_online_and_today_lists_and_counts(): void
    {
        $admin = $this->admin();
        $on = User::factory()->create(['name' => 'عائلة متصلة']);
        $on->forceFill(['active_device_seen_at' => now()->subMinute()])->save();
        $kid = $on->students()->create(['name' => 'سلمى', 'grade' => 4]);
        $kid->forceFill(['last_synced_at' => now()])->save();
        $earlier = User::factory()->create(['name' => 'عائلة الصباح']);
        $earlier->forceFill(['active_device_seen_at' => now()->subMinutes(30)])->save();
        Funnel::log('lesson_open', ['user_id' => $on->id, 'student_id' => $kid->id, 'visitor_id' => 'visitor-on-1']);
        Funnel::log('visit', ['user_id' => null, 'visitor_id' => 'guest-visitor-1']);

        $page = $this->actingAs($admin)->get('/admin/manage/live')->assertOk();
        $page->assertSee('المتصلون الآن')->assertSee('عائلة متصلة')->assertSee('عائلة الصباح')->assertSee('سلمى')->assertDontSee('ولي الأمر');

        $json = $this->actingAs($admin)->getJson('/admin/manage/live/online')->assertOk()->json();
        $names = array_column($json['people'], 'name');
        $this->assertContains('عائلة متصلة', $names);
        $this->assertNotContains('عائلة الصباح', $names);
        $this->assertSame(1, $json['students']);
        $this->assertSame(1, $json['guests']);
        $this->assertStringNotContainsString('password', json_encode($json));
        $this->assertArrayNotHasKey('email', $json['people'][0]);
    }

    public function test_parents_cannot_open_it(): void
    {
        $parent = User::factory()->create();
        $this->actingAs($parent)->getJson('/admin/manage/live/online')->assertForbidden();
        $this->get('/admin/manage/live')->assertStatus(302);
    }
}
