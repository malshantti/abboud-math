<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SetupRouteTest extends TestCase
{
    use RefreshDatabase;

    private string $token = 'abcdefghijklmnopqrstuvwxyz0123456789';

    public function test_setup_is_hidden_without_a_strong_token(): void
    {
        config(['app.setup_token' => '']);
        $this->post('/setup/migrate', ['token' => ''])->assertNotFound();
        config(['app.setup_token' => 'short']);
        $this->post('/setup/migrate', ['token' => 'short'])->assertNotFound();
    }

    public function test_wrong_token_is_rejected_and_right_token_migrates(): void
    {
        config(['app.setup_token' => $this->token]);
        $this->post('/setup/migrate', ['token' => 'wrong'])->assertNotFound();
        $this->post('/setup/migrate', ['token' => $this->token])->assertOk();
    }

    public function test_first_admin_only_once(): void
    {
        config(['app.setup_token' => $this->token]);
        $body = ['token' => $this->token, 'name' => 'A', 'email' => 'A@Example.com', 'password' => 'long-password-123', 'password_confirmation' => 'long-password-123'];
        $this->post('/setup/admin', $body)->assertCreated();
        $this->assertTrue(User::where('email', 'a@example.com')->first()->is_admin);
        $this->post('/setup/admin', ['email' => 'b@example.com'] + $body)->assertStatus(409);
    }
}
