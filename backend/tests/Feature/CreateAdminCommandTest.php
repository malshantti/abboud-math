<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creation_is_explicit_and_hashes_the_hidden_password(): void
    {
        $this->artisan('admin:create', ['email' => ' OWNER@EXAMPLE.TEST ', '--name' => 'محمد'])
            ->expectsQuestion('كلمة المرور (١٢ محرفًا على الأقل)', 'A-suitable-passphrase-123')
            ->expectsQuestion('أعد كلمة المرور', 'A-suitable-passphrase-123')
            ->expectsOutput('أُنشئ حساب المشرف. يمكنك الدخول من /login.')
            ->assertSuccessful();

        $user = User::sole();
        $this->assertSame('owner@example.test', $user->email);
        $this->assertTrue($user->is_admin);
        $this->assertTrue(Hash::check('A-suitable-passphrase-123', $user->password));
        $this->assertNotSame('A-suitable-passphrase-123', $user->password);
    }

    public function test_short_passwords_and_mismatched_confirmations_do_not_create_accounts(): void
    {
        foreach ([['short', 'short'], ['A-suitable-passphrase-123', 'different']] as [$password, $confirmation]) {
            $this->artisan('admin:create', ['email' => 'owner@example.test', '--name' => 'محمد'])
                ->expectsQuestion('كلمة المرور (١٢ محرفًا على الأقل)', $password)
                ->expectsQuestion('أعد كلمة المرور', $confirmation)
                ->assertFailed();
        }

        $this->assertDatabaseCount('users', 0);
    }

    public function test_a_multibyte_password_cannot_be_silently_truncated_by_bcrypt(): void
    {
        $password = str_repeat('م', 40);

        $this->artisan('admin:create', ['email' => 'owner@example.test', '--name' => 'محمد'])
            ->expectsQuestion('كلمة المرور (١٢ محرفًا على الأقل)', $password)
            ->expectsQuestion('أعد كلمة المرور', $password)
            ->expectsOutput('كلمة المرور تتجاوز ٧٢ بايت؛ اختر عبارة أقصر.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_existing_users_are_not_promoted_or_overwritten(): void
    {
        $user = User::factory()->create(['email' => 'owner@example.test']);
        $originalHash = $user->password;

        $this->artisan('admin:create', ['email' => 'OWNER@EXAMPLE.TEST', '--name' => 'اسم آخر'])
            ->expectsOutput('هذا البريد موجود بالفعل؛ لم يُغيّر الحساب أو صلاحياته.')
            ->assertFailed();

        $this->assertFalse($user->fresh()->is_admin);
        $this->assertSame($originalHash, $user->fresh()->password);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_invalid_email_and_non_interactive_creation_are_rejected(): void
    {
        $this->artisan('admin:create', ['email' => 'invalid', '--name' => 'محمد'])
            ->expectsOutput('البريد الإلكتروني غير صالح.')
            ->assertFailed();

        $this->artisan('admin:create', ['--no-interaction' => true])
            ->expectsOutput('شغّل الأمر في طرفية تفاعلية لإدخال كلمة المرور دون إظهارها.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_migrations_and_the_default_seeder_do_not_create_any_accounts(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', 0);
    }
}
