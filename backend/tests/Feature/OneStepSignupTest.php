<?php

namespace Tests\Feature;

use App\Models\MailLog;
use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OneStepSignupTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_signup_creates_parent_child_and_free_month_without_email(): void
    {
        Mail::fake();
        Setting::put(['free_month_until' => now()->addDays(20)->format('Y-m-d')]);
        $this->get('/account/register')->assertOk()->assertSee('رقم الجوال')->assertSee('من وين سمعت عنا؟');
        $r = $this->post('/account/register', ['name' => 'أم سارة', 'phone' => '٠٥٩١٢٣٤٥٦٧', 'password' => 'abc123', 'grade' => 6, 'child_name' => 'سارة', 'heard_from' => 'whatsapp']);
        $r->assertRedirect();
        $this->assertStringContainsString('login.html?sync=1', $r->headers->get('Location'));
        $u = User::where('phone', '0591234567')->firstOrFail();
        $this->assertSame('whatsapp', $u->heard_from);
        $this->assertTrue(User::isPlaceholderEmail($u->email));
        $this->assertSame('سارة', $u->students()->first()->name);
        $this->assertSame(4, Subscription::where('gateway', 'free_promo')->where('status', 'active')->where('price', 0)->count());
        Mail::assertNothingSent();
        $this->assertSame(0, MailLog::where('status', 'sent')->count());

        auth()->logout();
        $this->post('/account/login', ['email' => '+970 591 234 567', 'password' => 'abc123'])->assertRedirect();
        $this->assertAuthenticatedAs($u);
    }

    public function test_duplicate_phone_and_bad_phone_are_rejected(): void
    {
        $this->post('/account/register', ['name' => 'أب', 'phone' => '0591111111', 'password' => 'abc123', 'grade' => 4]);
        auth()->logout();
        $this->post('/account/register', ['name' => 'أب ٢', 'phone' => '0591111111', 'password' => 'abc123', 'grade' => 4])->assertSessionHasErrors('phone');
        $this->post('/account/register', ['name' => 'أب ٣', 'phone' => '12', 'password' => 'abc123', 'grade' => 4])->assertSessionHasErrors('phone');
    }
}
