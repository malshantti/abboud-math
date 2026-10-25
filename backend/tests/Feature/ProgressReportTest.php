<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressReportTest extends TestCase
{
    use RefreshDatabase;

    private function studentWithProgress(User $u)
    {
        $s = $u->students()->create(['name' => 'عبّود', 'grade' => 8]);
        $log = ['v' => 1, 'subj' => ['g8-math' => ['ms' => 3_720_000, 'n' => 10, 'ok' => 7, 'days' => ['2026-10-25' => 3_720_000],
            'lessons' => ['القوى والجذور' => ['ms' => 3_720_000, 'n' => 10, 'ok' => 7, 'last' => 1_761_400_000_000]],
            'wrong' => [['l' => 'القوى والجذور', 'q' => 'ما قيمة ٢ أس ٣؟', 'a' => '٦', 'c' => '٨', 't' => 1_761_400_000_000]]]]];
        $s->progress()->create(['key' => 'abboud_math_v1', 'value' => '{"skills":{"a":{"status":"mastered"},"b":{"status":"learning"}},"quizzes":[{"score":80,"date":"2026-10-25"}]}', 'client_updated_at' => 1_761_400_000_000]);
        $s->progress()->create(['key' => 'bustan_report_v1', 'value' => json_encode($log, JSON_UNESCAPED_UNICODE), 'client_updated_at' => 1_761_400_000_000]);

        return $s;
    }

    public function test_report_log_key_is_accepted_by_sync(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(3)]);
        $s = $u->students()->create(['name' => 'س', 'grade' => 6]);
        $this->actingAs($u)->putJson("/api/students/{$s->id}/progress", ['items' => ['bustan_report_v1' => ['value' => '{"v":1,"subj":{}}', 'updated' => 2000]]])
            ->assertOk()->assertJsonPath('items.bustan_report_v1.value', '{"v":1,"subj":{}}')->assertJsonPath('rejected', []);
    }

    public function test_parent_sees_own_report_with_mistakes_and_time(): void
    {
        $u = User::factory()->create();
        $s = $this->studentWithProgress($u);
        $this->actingAs($u)->get("/account/students/{$s->id}/report")->assertOk()
            ->assertSee('تقرير تقدّم عبّود')->assertSee('ما قيمة ٢ أس ٣؟')->assertSee('القوى والجذور')->assertSee('١ س ٢ د')->assertSee('(٧ من', false)
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get('/account')->assertSee("/account/students/{$s->id}/report", false);
    }

    public function test_other_family_and_guests_cannot_see_report(): void
    {
        $s = $this->studentWithProgress(User::factory()->create());
        $this->actingAs(User::factory()->create())->get("/account/students/{$s->id}/report")->assertNotFound();
        auth()->logout();
        $this->get("/account/students/{$s->id}/report")->assertRedirect();
    }

    public function test_share_link_is_read_only_and_revocable(): void
    {
        $u = User::factory()->create();
        $s = $this->studentWithProgress($u);
        $this->actingAs($u)->post("/account/students/{$s->id}/report/share")->assertRedirect();
        $token = $s->fresh()->report_token;
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9]{40}$/', $token);
        auth()->logout();
        $this->get("/report/$token")->assertOk()->assertSee('ما قيمة ٢ أس ٣؟')->assertDontSee('إيقاف الرابط');
        $this->get('/report/'.str_repeat('a', 40))->assertNotFound();
        $this->actingAs($u)->delete("/account/students/{$s->id}/report/share")->assertRedirect();
        $this->assertNull($s->fresh()->report_token);
        auth()->logout();
        $this->get("/report/$token")->assertNotFound();
        $this->assertArrayNotHasKey('report_token', $s->fresh()->toArray());
    }

    public function test_teacher_can_open_report_from_manage_panel(): void
    {
        $s = $this->studentWithProgress(User::factory()->create());
        $t = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($t)->get("/admin/manage/students/{$s->id}")->assertOk()->assertSee("/admin/manage/students/{$s->id}/report", false);
        $this->actingAs($t)->get("/admin/manage/students/{$s->id}/report")->assertOk()->assertSee('ما قيمة ٢ أس ٣؟');
        $this->actingAs(User::factory()->create())->get("/admin/manage/students/{$s->id}/report")->assertRedirect();
    }

    public function test_empty_report_renders(): void
    {
        $u = User::factory()->create();
        $s = $u->students()->create(['name' => 'ليلى', 'grade' => 1]);
        $this->actingAs($u)->get("/account/students/{$s->id}/report")->assertOk()->assertSee('لا يوجد تقدّم متزامن');
    }
}
