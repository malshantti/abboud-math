<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\Setting;
use App\Models\User;
use App\Support\Reminders;
use App\Support\WebPush;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PushReminderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $k = WebPush::generateKeys();
        config(['services.vapid.public' => $k['public'], 'services.vapid.private' => $k['private']]);
    }

    private function device(User $u): PushSubscription
    {
        $ua = WebPush::generateKeys();

        return PushSubscription::create(['user_id' => $u->id, 'endpoint' => 'https://fcm.googleapis.com/fcm/send/x'.$u->id, 'endpoint_hash' => hash('sha256', 'x'.$u->id), 'p256dh' => $ua['public'], 'auth' => WebPush::b64e(random_bytes(16))]);
    }

    public function test_key_and_subscribe_requires_login(): void
    {
        $this->getJson('/api/push/key')->assertOk()->assertJsonPath('enabled', true)->assertJsonPath('reminders', null);
        $this->postJson('/api/push/subscribe', [])->assertStatus(401);
        $u = User::factory()->create();
        $ua = WebPush::generateKeys();
        $this->actingAs($u)->postJson('/api/push/subscribe', ['endpoint' => 'https://fcm.googleapis.com/fcm/send/abc', 'keys' => ['p256dh' => $ua['public'], 'auth' => 'aaaaaaaaaaaaaaaaaaaaaa']])->assertOk();
        $this->assertSame(1, $u->pushSubscriptions()->count());
    }

    public function test_daily_reminder_window_once_per_day_and_skips_studied(): void
    {
        Http::fake(['*' => Http::response('', 201)]);
        $u = User::factory()->create();
        $s1 = $u->students()->create(['name' => 'سارة', 'grade' => 1]);
        $s2 = $u->students()->create(['name' => 'علي', 'grade' => 2]);
        $this->device($u);

        Carbon::setTestNow(Carbon::parse('2026-10-27 12:00', 'Asia/Gaza')); // too early
        $this->assertSame('outside window', Reminders::runDaily()['reason']);

        Carbon::setTestNow(Carbon::parse('2026-10-27 17:30', 'Asia/Gaza'));
        DB::table('student_progress')->insert(['student_id' => $s1->id, 'key' => 'bustan_g1_math_v1', 'value' => '{}', 'created_at' => now(), 'updated_at' => now()]);
        $this->assertSame(1, Reminders::runDaily()['sent']);
        Http::assertSent(fn ($r) => $r->hasHeader('Content-Encoding', 'aes128gcm') && str_starts_with($r->header('Authorization')[0], 'vapid t='));
        $this->assertSame(0, Reminders::runDaily()['sent']); // at most one per day
        $this->assertStringContainsString('علي، درسك اليوم جاهز في بستان', Reminders::message($u)['body']);
        $this->assertStringNotContainsString('ولي الأمر', Reminders::message($u)['body']);

        // both studied next day: skip
        Carbon::setTestNow(Carbon::parse('2026-10-28 17:10', 'Asia/Gaza'));
        DB::table('student_progress')->where('student_id', $s1->id)->update(['updated_at' => now()]);
        DB::table('student_progress')->insert(['student_id' => $s2->id, 'key' => 'bustan_g2_math_v1', 'value' => '{}', 'created_at' => now(), 'updated_at' => now()]);
        $this->assertSame(['sent' => 0, 'skipped' => 1], Reminders::runDaily());
    }

    public function test_opt_out_admin_toggle_and_gone_subscription(): void
    {
        Http::fake(['*' => Http::response('', 410)]);
        Carbon::setTestNow(Carbon::parse('2026-10-27 18:00', 'Asia/Gaza'));
        $u = User::factory()->create();
        $u->students()->create(['name' => 'ليلى', 'grade' => 1]);
        $this->device($u);
        Setting::put(['push_enabled' => '0']);
        $this->assertSame('disabled', Reminders::runDaily()['reason']);
        Setting::put(['push_enabled' => '1']);
        $this->actingAs($u)->post('/account/reminders', ['on' => 0])->assertRedirect();
        $this->assertSame(0, Reminders::runDaily()['sent']);
        $this->assertFalse($u->fresh()->push_reminders);
        $u->forceFill(['push_reminders' => true])->save();
        Reminders::runDaily();
        $this->assertSame(0, PushSubscription::count()); // 410 removes the device
    }
}
