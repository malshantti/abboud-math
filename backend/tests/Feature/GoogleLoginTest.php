<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google' => ['client_id' => 'test-client.apps.googleusercontent.com', 'client_secret' => 'x', 'redirect' => 'https://bustankids.com/admin-api/account/google/callback']]);
    }

    private function fakeGoogle(string $id, string $email, bool $verified = true): void
    {
        $u = (new SocialiteUser)->setRaw(['sub' => $id, 'email' => $email, 'email_verified' => $verified])->map(['id' => $id, 'email' => $email, 'name' => 'Google Parent']);
        $driver = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $driver->shouldReceive('user')->andReturn($u);
        Socialite::shouldReceive('driver')->with('google')->andReturn($driver);
    }

    public function test_login_page_shows_button_and_redirect_goes_to_google(): void
    {
        $this->get('/account/login')->assertOk()->assertSee('الدخول بحساب جوجل');
        $r = $this->get('/account/google?return=/g1/');
        $r->assertRedirect();
        $loc = $r->headers->get('Location');
        $this->assertStringStartsWith('https://accounts.google.com/o/oauth2/auth', $loc);
        $this->assertStringContainsString('client_id=test-client.apps.googleusercontent.com', $loc);
        $this->assertStringContainsString('redirect_uri='.urlencode('https://bustankids.com/admin-api/account/google/callback'), $loc);
    }

    public function test_existing_email_is_linked_and_logged_in(): void
    {
        $user = User::factory()->create(['email' => 'mom@example.com', 'email_verified_at' => null]);
        $this->fakeGoogle('g-1', 'Mom@Example.com');
        $this->get('/account/google/callback?code=c&state=s')->assertRedirect();
        $this->assertAuthenticatedAs($user->fresh());
        $this->assertSame('g-1', $user->fresh()->google_id);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_unverified_email_rejected_and_admin_rejected(): void
    {
        $this->fakeGoogle('g-2', 'x@example.com', false);
        $this->get('/account/google/callback')->assertRedirect('/account/login');
        $this->assertGuest();
    }

    public function test_admin_cannot_use_google(): void
    {
        $admin = User::factory()->create(['email' => 'boss@example.com']);
        $admin->setRole('admin'); $admin->save();
        $this->fakeGoogle('g-3', 'boss@example.com');
        $this->get('/account/google/callback')->assertRedirect('/account/login');
        $this->assertGuest();
    }
}
