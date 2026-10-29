<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use App\Support\GiftMonth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GiftMonthTest extends TestCase
{
    use RefreshDatabase;

    public function test_gift_extends_paid_and_is_idempotent_and_notice_is_flagged(): void
    {
        $u = User::factory()->create(['role' => 'parent', 'email' => 'fam@gmail.com']);
        $u->students()->create(['name' => 'سارة', 'grade' => 6]);
        $paid = $u->subscriptions()->save(new Subscription(['code' => 'P1', 'plan' => 'g6-math', 'plan_name' => 'x', 'days' => 30, 'status' => 'active', 'gateway' => 'manual']));
        $paid->forceFill(['starts_at' => now(), 'ends_at' => now()->addDays(10)])->save();

        $plan = GiftMonth::plan();
        $this->assertSame(4, GiftMonth::apply($plan));
        $this->assertSame(0, GiftMonth::apply(GiftMonth::plan()));
        $math = Subscription::where('batch', GiftMonth::BATCH)->where('plan', 'g6-math')->first();
        $this->assertEqualsWithDelta(now()->addDays(40)->timestamp, $math->ends_at->timestamp, 5);

        $this->assertNull(GiftMonth::notice($u->fresh()));
        Setting::put(['gift_notice_on' => '1']);
        $this->assertNotNull(GiftMonth::notice($u->fresh()));
        $this->actingAs($u)->postJson('/api/gift/seen')->assertOk();
        $this->assertNull(GiftMonth::notice($u->fresh()));
    }
}
