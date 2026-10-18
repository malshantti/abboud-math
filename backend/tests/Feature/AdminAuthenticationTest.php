<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'email' => 'owner@example.test',
            'password' => 'An-example-passphrase-123',
            'is_admin' => true,
        ], $attributes));
    }

    public function test_guests_are_redirected_without_caching_the_private_response(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/login');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertGuest();
    }

    public function test_login_is_an_arabic_csrf_form_without_a_service_worker_or_demo_students(): void
    {
        $response = $this->get('/login');

        $response->assertOk()->assertSee('دخول المشرفين')->assertSee('name="_token"', false);
        $response->assertDontSee('demo-data.js')->assertDontSee('serviceWorker');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_an_admin_can_log_in_with_normalized_email_and_a_new_session_id(): void
    {
        $admin = $this->admin();
        $this->withSession(['session-probe' => 'kept']);
        $oldSessionId = session()->getId();

        $response = $this->post('/login', [
            'email' => ' OWNER@EXAMPLE.TEST ',
            'password' => 'An-example-passphrase-123',
        ]);

        $response->assertRedirect('/admin')->assertSessionHas('session-probe', 'kept');
        $this->assertAuthenticatedAs($admin);
        $this->assertNotSame($oldSessionId, session()->getId());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_private_account_details_are_escaped_and_not_cached(): void
    {
        $admin = $this->admin(['name' => '<script>alert(1)</script>']);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertOk()->assertSee($admin->name)->assertDontSee($admin->name, false);
        $response->assertSee($admin->email)->assertSee('تسجيل الخروج');
        $response->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->assertStringContainsString('private', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_wrong_password_and_a_non_admin_account_receive_the_same_generic_error(): void
    {
        $this->admin();
        User::factory()->create(['email' => 'member@example.test', 'password' => 'An-example-passphrase-123']);

        $first = $this->from('/login')->post('/login', [
            'email' => 'owner@example.test', 'password' => 'incorrect-password',
        ]);
        $first->assertRedirect('/login')->assertSessionHasErrors('email');
        $message = session('errors')->first('email');
        $this->assertGuest();

        $second = $this->from('/login')->post('/login', [
            'email' => 'member@example.test', 'password' => 'An-example-passphrase-123',
        ]);
        $second->assertRedirect('/login')->assertSessionHasErrors('email');
        $this->assertSame($message, session('errors')->first('email'));
        $this->assertNull(session('_old_input.password'));
        $this->assertGuest();
    }

    public function test_non_admins_and_revoked_admins_cannot_open_the_private_page(): void
    {
        $member = User::factory()->create();
        $response = $this->actingAs($member)->get('/admin');
        $response->assertForbidden()->assertSee('لا توجد صلاحية')->assertSee('تسجيل الخروج');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));

        $admin = $this->admin();
        $this->actingAs($admin)->get('/admin')->assertOk();
        $admin->is_admin = false;
        $admin->save();
        $this->get('/admin')->assertForbidden();
    }

    public function test_the_admin_flag_is_not_mass_assignable_and_existing_accounts_default_to_no_access(): void
    {
        $user = User::factory()->create();
        $user->fill(['is_admin' => true])->save();

        $this->assertFalse($user->fresh()->is_admin);
    }

    public function test_logout_invalidates_the_session_and_private_page_access(): void
    {
        $this->actingAs($this->admin())->withSession(['private-probe' => 'remove-me']);
        $oldToken = session()->token();

        $response = $this->post('/logout');

        $response->assertRedirect('/login')->assertSessionMissing('private-probe');
        $this->assertGuest();
        $this->assertNotSame($oldToken, session()->token());
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_five_failures_block_the_identity_even_when_email_case_changes_then_expire(): void
    {
        $this->admin();

        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['email' => 'OWNER@EXAMPLE.TEST', 'password' => 'wrong'])
                ->assertSessionHasErrors('email');
        }

        $this->post('/login', ['email' => 'owner@example.test', 'password' => 'An-example-passphrase-123'])
            ->assertSessionHasErrors('email');
        $this->assertStringContainsString('محاولات الدخول كثيرة', session('errors')->first('email'));
        $this->assertGuest();

        $this->travel(61)->seconds();
        $this->post('/login', ['email' => 'owner@example.test', 'password' => 'An-example-passphrase-123'])
            ->assertRedirect('/admin');
        $this->assertAuthenticated();
    }

    public function test_an_ip_cannot_bypass_the_limit_by_changing_email_addresses(): void
    {
        $this->admin();

        for ($i = 0; $i < 30; $i++) {
            $this->post('/login', ['email' => 'missing'.$i.'@example.test', 'password' => 'wrong'])
                ->assertSessionHasErrors('email');
        }

        $this->post('/login', ['email' => 'owner@example.test', 'password' => 'An-example-passphrase-123'])
            ->assertSessionHasErrors('email');
        $this->assertStringContainsString('محاولات الدخول كثيرة', session('errors')->first('email'));
        $this->assertGuest();
    }

    public function test_malformed_inputs_are_rejected_without_authenticating(): void
    {
        $this->post('/login', ['email' => ['invalid'], 'password' => ['invalid']])
            ->assertSessionHasErrors(['email', 'password']);
        $this->assertGuest();
    }

    public function test_login_and_logout_enforce_csrf_outside_the_test_environment(): void
    {
        // Laravel normally bypasses CSRF while testing; exercise the real middleware here.
        $this->app->detectEnvironment(fn () => 'local');

        $response = $this->post('/login', ['email' => 'owner@example.test', 'password' => 'irrelevant']);
        $response->assertStatus(419)->assertSee('انتهت الجلسة');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));

        $admin = $this->admin();
        $this->actingAs($admin)->post('/logout')->assertStatus(419);
        $this->assertAuthenticatedAs($admin);
    }

    public function test_there_is_no_public_registration_or_logout_over_get(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register')->assertNotFound();
        $this->get('/logout')->assertStatus(405);
    }
}
