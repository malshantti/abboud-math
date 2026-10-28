<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionBoardTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $u = User::factory()->create(['email' => 'admin@example.test']);
        $u->setRole('admin');
        $u->save();

        return $u;
    }

    private function sub(User $u, string $plan, string $status, array $extra = []): Subscription
    {
        $s = new Subscription(['code' => strtoupper(substr(md5(uniqid()), 0, 4)).'-'.random_int(1000, 9999), 'plan' => $plan, 'plan_name' => $plan, 'price' => 8, 'currency' => 'شيكل', 'days' => 30, 'status' => $status] + $extra);
        foreach (['starts_at', 'ends_at'] as $k) {
            if (isset($extra[$k])) {
                $s->forceFill([$k => $extra[$k]]);
            }
        }
        $u->subscriptions()->save($s);

        return $s;
    }

    public function test_page_groups_by_family_and_flags_problems(): void
    {
        $admin = $this->admin();
        $fam = User::factory()->create(['name' => 'عائلة خالد', 'trial_ends_at' => now()->addDays(2)]);
        $kid = $fam->students()->create(['name' => 'عقل', 'grade' => 6]);
        $p1 = $this->sub($fam, 'g6-math', 'pending', ['student_id' => $kid->id, 'batch' => 'R-TEST01']);
        $this->sub($fam, 'g6-science', 'pending', ['student_id' => $kid->id, 'batch' => 'R-TEST01']);
        $this->sub($fam, 'g1-arabic', 'active', ['student_id' => $kid->id, 'starts_at' => now(), 'ends_at' => now()->addDays(5)]);
        $this->sub($fam, 'g8-math', 'active', ['starts_at' => now(), 'ends_at' => now()->addDays(20)]);
        $this->sub($fam, 'g8-math', 'active', ['starts_at' => now(), 'ends_at' => now()->addDays(40)]);

        $r = $this->actingAs($admin)->get('/admin/manage/subscriptions')->assertOk();
        $r->assertSee('طلبات بانتظار التفعيل')->assertSee('عائلة خالد')->assertSee('عقل')->assertSee('الرياضيات')
            ->assertSee('R-TEST01')->assertSee('١٦ شيكل')->assertSee('صف لا يطابق الطفل')->assertSee('مكرر')
            ->assertSee('غير مربوط بطفل')->assertSee('بانتظار الدفع')->assertSee('فعّال')->assertSee('تجربة')->assertSee('باقي');
        $r->assertDontSee('ولي الأمر')->assertDontSee('وليّ الأمر')->assertDontSee('>g6-math<', false);

        // One-click activate of the whole request uses the existing bulk action.
        $this->post('/admin/manage/subscriptions/bulk', ['action' => 'activate', 'ids' => [$p1->id, $p1->id + 1]])->assertRedirect();
        $this->assertSame(0, Subscription::where('status', 'pending')->count());
    }

    public function test_filters_by_status_grade_and_search(): void
    {
        $admin = $this->admin();
        $a = User::factory()->create(['name' => 'عائلة أ', 'trial_ends_at' => now()->subDay()]);
        $a->students()->create(['name' => 'سلمى', 'grade' => 1]);
        $this->sub($a, 'g1-math', 'pending');
        $b = User::factory()->create(['name' => 'عائلة ب', 'trial_ends_at' => now()->subDay()]);
        $b->students()->create(['name' => 'يوسف', 'grade' => 8]);
        $this->sub($b, 'g8-math', 'active', ['starts_at' => now(), 'ends_at' => now()->addDays(30)]);

        $this->actingAs($admin)->get('/admin/manage/subscriptions?status=active')->assertSee('عائلة ب')->assertDontSee('عائلة أ</a></h3>', false);
        $this->get('/admin/manage/subscriptions?grade=1')->assertSee('سلمى')->assertDontSee('يوسف');
        $this->get('/admin/manage/subscriptions?q=يوسف')->assertSee('عائلة ب')->assertDontSee('سلمى');
    }

    public function test_extend_cancel_and_grant_still_work(): void
    {
        $admin = $this->admin();
        $u = User::factory()->create();
        $s = $this->sub($u, 'g1-math', 'active', ['starts_at' => now(), 'ends_at' => now()->addDays(10)]);
        $this->actingAs($admin)->post("/admin/manage/subscriptions/{$s->id}/activate", ['days' => 30])->assertSessionHas('status');
        $this->assertTrue($s->fresh()->ends_at->gt(now()->addDays(39)));
        $this->post("/admin/manage/users/{$u->id}/grant", ['plan' => 'g1-arabic', 'days' => 15])->assertSessionHas('status');
        $this->assertSame(1, $u->subscriptions()->where('plan', 'g1-arabic')->where('status', 'active')->count());
        $this->post("/admin/manage/subscriptions/{$s->id}/cancel")->assertSessionHas('status');
        $this->assertSame('cancelled', $s->fresh()->status);
        $this->get('/admin/manage/subscriptions')->assertOk()->assertSee('ملغى')->assertSee('العربية');
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin/manage/subscriptions')->assertRedirect();
    }
}
