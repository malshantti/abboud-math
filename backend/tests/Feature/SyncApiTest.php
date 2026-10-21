<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_for_guest_returns_public_settings_only(): void
    {
        Setting::put(['announcement' => 'إعلان مهم', 'announcement_active' => '1']);
        $this->getJson('/api/session')->assertOk()->assertJson(['authenticated' => false, 'site' => ['announcement' => 'إعلان مهم', 'tagline' => 'نزرع الفهم، ونحصد المعرفة']])->assertJsonMissingPath('students');
        $this->getJson('/api/site')->assertOk()->assertJsonPath('site_name', 'بستان التعلّم');
        $this->postJson('/api/students', ['name' => 'x'])->assertUnauthorized();
    }

    public function test_first_login_imports_local_profile_and_progress(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(3)]);
        $this->actingAs($u);
        $session = $this->getJson('/api/session')->assertOk()->assertJson(['authenticated' => true, 'access' => ['allowed' => true, 'kind' => 'trial', 'days_left' => 3, 'subjects' => null]]);
        $this->assertNotEmpty($session['csrf']);

        // The site cannot create students; the parent adds them (with a grade) on the account page.
        $this->postJson('/api/students', ['name' => 'عبّود', 'local_id' => 'p1', 'avatar' => 'idle'])->assertForbidden();
        $this->assertSame(0, $u->students()->count());
        $id = $u->students()->create(['name' => 'عبّود', 'grade' => 8, 'local_id' => 'p1'])->id;
        // A local profile the server already knows is linked, not duplicated.
        $this->postJson('/api/students', ['name' => 'عبّود', 'local_id' => 'p1'])->assertOk()->assertJsonPath('student.id', $id);

        $local = ['abboud_math_v1' => ['value' => '{"points":120,"done":["a","b"]}', 'updated' => 1000], 'bustan_grade' => ['value' => '2', 'updated' => 1000], 'evil_key' => ['value' => 'x', 'updated' => 5]];
        $this->postJson("/api/students/$id/import", ['items' => $local])->assertOk()->assertJsonPath('items.abboud_math_v1.value', '{"points":120,"done":["a","b"]}')->assertJsonMissingPath('items.evil_key')->assertJsonMissingPath('items.bustan_grade')->assertJsonPath('rejected', ['bustan_grade']);
        $this->assertSame(8, $u->students()->first()->grade, 'grade stays as the parent set it');
        $this->assertDatabaseHas('activity_logs', ['action' => 'progress.import']);
    }

    public function test_newest_timestamp_wins_per_key(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(3)]);
        $s = $u->students()->create(['name' => 'س', 'grade' => 6]);
        $this->actingAs($u);
        $this->putJson("/api/students/{$s->id}/progress", ['items' => ['bustan_g6_math_v1' => ['value' => 'new', 'updated' => 2000]]])->assertOk();
        $this->putJson("/api/students/{$s->id}/progress", ['items' => ['bustan_g6_math_v1' => ['value' => 'old', 'updated' => 1500]]])->assertJsonPath('items.bustan_g6_math_v1.value', 'new');
        $this->putJson("/api/students/{$s->id}/progress", ['items' => ['bustan_g6_math_v1' => ['value' => 'newer', 'updated' => 2500]]])->assertJsonPath('items.bustan_g6_math_v1.value', 'newer');
        $this->getJson("/api/students/{$s->id}/progress")->assertJsonPath('items.bustan_g6_math_v1.updated', 2500);
        $this->putJson("/api/students/{$s->id}/progress", ['items' => 'nope'])->assertUnprocessable();
    }

    public function test_cannot_read_or_write_another_familys_student(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        $s = $b->students()->create(['name' => 'ب']);
        $this->actingAs($a)->getJson("/api/students/{$s->id}/progress")->assertNotFound();
        $this->putJson("/api/students/{$s->id}/progress", ['items' => []])->assertNotFound();
        $this->postJson("/api/students/{$s->id}/import", ['items' => []])->assertNotFound();
    }

    public function test_api_writes_require_csrf_outside_tests(): void
    {
        $u = User::factory()->create();
        $s = $u->students()->create(['name' => 'س']);
        $this->app['env'] = 'production';
        $this->actingAs($u)->putJson("/api/students/{$s->id}/progress", ['items' => []])->assertStatus(419);
    }

    public function test_access_after_trial_is_per_subject_subscription(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->subDay()]);
        $this->actingAs($u)->getJson('/api/session')->assertJson(['access' => ['allowed' => false, 'kind' => 'expired', 'subjects' => []]]);
        $sub = new Subscription(['code' => 'T-1', 'plan' => 'g6-math', 'plan_name' => 'x', 'days' => 30, 'status' => 'active']);
        $sub->ends_at = now()->addDays(30);
        $u->subscriptions()->save($sub);
        $this->getJson('/api/session')->assertJson(['access' => ['allowed' => true, 'kind' => 'paid', 'subjects' => ['g6-math']]]);
        // Progress is accepted only for the student's own grade and an entitled subject.
        $s = $u->students()->create(['name' => 'س', 'grade' => 6]);
        $this->putJson("/api/students/{$s->id}/progress", ['items' => [
            'bustan_g6_math_v1' => ['value' => 'ok', 'updated' => 1], 'bustan_g6_arabic_v1' => ['value' => 'x', 'updated' => 1],
            'bustan_g8_science_v1' => ['value' => 'x', 'updated' => 1], 'en_rate' => ['value' => '1', 'updated' => 1],
        ]])->assertOk()->assertJsonPath('items.bustan_g6_math_v1.value', 'ok')->assertJsonPath('items.en_rate.value', '1')
            ->assertJsonMissingPath('items.bustan_g6_arabic_v1')->assertJsonMissingPath('items.bustan_g8_science_v1')
            ->assertJsonPath('rejected', ['bustan_g6_arabic_v1', 'bustan_g8_science_v1']);
        // A student without a grade set by the parent cannot save subject progress.
        $n = $u->students()->create(['name' => 'ن']);
        $this->putJson("/api/students/{$n->id}/progress", ['items' => ['bustan_g6_math_v1' => ['value' => 'x', 'updated' => 1]]])->assertJsonPath('rejected', ['bustan_g6_math_v1']);
    }

    public function test_trial_allows_only_the_students_grade(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(3)]);
        $s = $u->students()->create(['name' => 'س', 'grade' => 1]);
        $this->actingAs($u)->postJson("/api/students/{$s->id}/import", ['items' => [
            'bustan_g1_math_v1' => ['value' => 'a', 'updated' => 1], 'abboud_math_v1' => ['value' => 'b', 'updated' => 1],
        ]])->assertOk()->assertJsonPath('items.bustan_g1_math_v1.value', 'a')->assertJsonPath('rejected', ['abboud_math_v1']);
    }
}
