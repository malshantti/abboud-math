<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

/** After one-step signup (mobile login), older email accounts and Google accounts still sign in; the parent page phone field is optional. */
class LoginCompatTest extends TestCase
{
    use RefreshDatabase;

    public function test_old_style_email_account_logs_in_with_email_and_password(): void
    {
        Mail::fake();
        $u = User::factory()->create(['email' => 'old@example.com', 'password' => Hash::make('secret123'), 'phone' => null]);
        $this->post('/account/login', ['email' => 'Old@Example.com', 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->post('/account/login', ['email' => 'old@example.com', 'password' => 'secret123'])->assertRedirect();
        $this->assertAuthenticatedAs($u);
        Mail::assertNothingSent();
    }

    public function test_mobile_login_works_in_any_format(): void
    {
        $u = User::factory()->create(['email' => 'p@example.com', 'password' => Hash::make('secret123'), 'phone' => '0599123456']);
        $this->post('/account/login', ['email' => '+970 599 123 456', 'password' => 'secret123'])->assertRedirect();
        $this->assertAuthenticatedAs($u);
    }

    public function test_google_users_unaffected(): void
    {
        config(['services.google' => ['client_id' => 'test-client.apps.googleusercontent.com', 'client_secret' => 'x', 'redirect' => 'https://bustankids.com/admin-api/account/google/callback']]);
        $u = User::factory()->create(['email' => 'g@example.com', 'google_id' => 'g-9', 'phone' => null]);
        $g = (new SocialiteUser)->setRaw(['sub' => 'g-9', 'email' => 'g@example.com', 'email_verified' => true])->map(['id' => 'g-9', 'email' => 'g@example.com', 'name' => 'G']);
        $d = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $d->shouldReceive('user')->andReturn($g);
        Socialite::shouldReceive('driver')->with('google')->andReturn($d);
        $this->get('/account/google/callback?code=c&state=s')->assertRedirect();
        $this->assertAuthenticatedAs($u->fresh());
    }

    public function test_parent_page_optional_phone_and_dismissible_notice(): void
    {
        Mail::fake();
        $u = User::factory()->create(['phone' => null]);
        $this->actingAs($u)->get('/account')->assertOk()->assertSee('أضيفوا رقم الجوال ليسهل التواصل معكم — اختياري')->assertSee('رقم الجوال/واتساب');
        $this->post('/account/phone', ['phone' => 'abc'])->assertSessionHasErrors('phone');
        $this->post('/account/phone', ['phone' => '٠٥٩٩١٢٣٤٥٦'])->assertSessionHasNoErrors();
        $this->assertSame('0599123456', $u->fresh()->phone);
        $this->get('/account')->assertDontSee('أضيفوا رقم الجوال ليسهل التواصل معكم');
        $other = User::factory()->create(['phone' => '0599000000']);
        $this->post('/account/phone', ['phone' => '0599000000'])->assertSessionHasErrors('phone');
        $this->post('/account/phone', ['phone' => ''])->assertSessionHasNoErrors();
        $this->assertNull($u->fresh()->phone);
        Mail::assertNothingSent();
    }
}
