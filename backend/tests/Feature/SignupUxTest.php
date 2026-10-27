<?php

namespace Tests\Feature;

use App\Mail\BrandMail;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/** Subscribe page per chosen child, request dedupe, activation mail and trial reminder. */
class SignupUxTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscribe_page_shows_only_chosen_childs_grade(): void
    {
        $u = User::factory()->create(['role' => 'parent']);
        $a = $u->students()->create(['name' => 'ليلى', 'grade' => 1]);
        $b = $u->students()->create(['name' => 'سامي', 'grade' => 2]);
        $p = $this->actingAs($u)->get('/account/subscribe?student='.$b->id)->assertOk();
        $p->assertSee('value="g2-math"', false)->assertDontSee('value="g1-math"', false)->assertSee('أرسل الطلب عبر واتساب');
        $this->post('/account/subscribe', ['plans' => ['g1-math'], 'student_id' => $b->id])->assertSessionHasErrors();
        $this->assertSame(0, $u->subscriptions()->count());
    }

    public function test_repeat_request_reuses_pending_rows(): void
    {
        $u = User::factory()->create(['role' => 'parent']);
        $s = $u->students()->create(['name' => 'ليلى', 'grade' => 2]);
        $this->actingAs($u)->post('/account/subscribe', ['plans' => ['g2-math'], 'student_id' => $s->id])->assertRedirect();
        $this->post('/account/subscribe', ['plans' => ['g2-math'], 'student_id' => $s->id])->assertRedirect();
        $this->assertSame(1, $u->subscriptions()->count());
    }

    public function test_activation_sends_mail(): void
    {
        Mail::fake();
        $admin = User::factory()->create(['role' => 'admin']);
        $u = User::factory()->create(['role' => 'parent']);
        $sub = $u->subscriptions()->save(new Subscription(['code' => 'ABCD-1234', 'plan' => 'g1-arabic', 'plan_name' => 'العربية — الصف الأول', 'price' => 15, 'currency' => 'شيكل', 'days' => 30, 'status' => 'pending']));
        $this->actingAs($admin)->post("/admin/manage/subscriptions/{$sub->id}/activate", ['days' => 30]);
        Mail::assertSent(BrandMail::class, fn (BrandMail $m) => $m->mail['type'] === 'activated');
    }

    public function test_trial_reminder_once(): void
    {
        Mail::fake();
        User::factory()->create(['role' => 'parent', 'trial_ends_at' => now()->addHours(10)]);
        User::factory()->create(['role' => 'parent', 'trial_ends_at' => now()->addDays(3)]);
        $this->artisan('trial:remind')->assertSuccessful();
        $this->artisan('trial:remind')->assertSuccessful();
        Mail::assertSent(BrandMail::class, 1);
    }
}
