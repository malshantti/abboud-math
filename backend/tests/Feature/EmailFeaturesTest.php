<?php

namespace Tests\Feature;

use App\Mail\BrandMail;
use App\Models\MailLog;
use App\Models\Setting;
use App\Models\User;
use App\Support\MailCenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EmailFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private function register(string $email = 'new@example.test')
    {
        return $this->post('/account/register', ['name' => 'أم سامي', 'email' => $email, 'password' => 'secret-pass-1', 'password_confirmation' => 'secret-pass-1']);
    }

    private function admin(): User
    {
        $a = User::factory()->create(['email' => 'admin@example.test']);
        $a->setRole('admin');
        $a->save();

        return $a;
    }

    public function test_migration_marks_existing_accounts_verified(): void
    {
        $this->assertTrue(Schema::hasTable('mail_logs'));
        $id = DB::table('users')->insertGetId(['name' => 'قديم', 'email' => 'old@example.test', 'password' => 'x', 'created_at' => now()->subYear(), 'updated_at' => now()]);
        $m = require database_path('migrations/2026_10_22_100000_add_email_features.php');
        Schema::drop('mail_logs');
        $m->up();
        $this->assertNotNull(DB::table('users')->where('id', $id)->value('email_verified_at'));
    }

    public function test_register_sends_signed_activation_then_welcome_after_verify(): void
    {
        Mail::fake();
        $this->register()->assertRedirect();
        $u = User::where('email', 'new@example.test')->first();
        $this->assertNull($u->email_verified_at);
        $link = null;
        Mail::assertSent(BrandMail::class, function (BrandMail $m) use (&$link) {
            if ($m->mail['type'] === 'verify') {
                $link = $m->mail['link'];
            }

            return true;
        });
        Mail::assertSentCount(2); // welcome right away + activation link
        $this->assertStringContainsString('signature=', $link);
        $this->get('/account')->assertSee('إعادة إرسال رابط التفعيل');

        $this->get($link.'x')->assertSessionHasErrors('email');
        $this->assertNull($u->fresh()->email_verified_at);
        $this->get($link)->assertRedirect()->assertSessionHas('status');
        $this->assertNotNull($u->fresh()->email_verified_at);
        Mail::assertSent(BrandMail::class, fn (BrandMail $m) => $m->mail['type'] === 'welcome');
        $this->app['auth']->forgetGuards();
        $this->actingAs($u->fresh())->get('/account')->assertDontSee('إعادة إرسال رابط التفعيل');
        $this->get($link);
        Mail::assertSentCount(2); // welcome only once
        $this->assertSame(2, MailLog::where('status', 'sent')->count());
    }

    public function test_activation_link_expires(): void
    {
        Mail::fake();
        $this->register();
        $u = User::where('email', 'new@example.test')->first();
        $link = MailCenter::verifyUrl($u);
        $this->travel(MailCenter::VERIFY_DAYS + 1)->days();
        $this->get($link)->assertSessionHasErrors('email');
        $this->assertNull($u->fresh()->email_verified_at);
    }

    public function test_resend_is_throttled(): void
    {
        Mail::fake();
        $this->register();
        foreach (range(1, 3) as $_) {
            $this->post('/account/verify/resend')->assertRedirect();
        }
        $this->post('/account/verify/resend')->assertStatus(429);
        Mail::assertSentCount(5); // welcome + verify at signup, then 3 resends
    }

    public function test_verify_off_welcomes_immediately(): void
    {
        Mail::fake();
        Setting::put(['mail_verify_on' => '0']);
        $this->register();
        $this->assertNotNull(User::where('email', 'new@example.test')->value('email_verified_at'));
        Mail::assertSent(BrandMail::class, fn (BrandMail $m) => $m->mail['type'] === 'welcome');
        Mail::assertSentCount(1);
    }

    public function test_reset_link_expires_and_forgot_is_throttled_without_enumeration(): void
    {
        Mail::fake();
        $u = User::factory()->create(['email' => 'p@example.test']);
        $a = $this->post('/account/forgot-password', ['email' => 'p@example.test'])->assertSessionHas('status')->getSession()->get('status');
        $b = $this->post('/account/forgot-password', ['email' => 'ghost@example.test'])->getSession()->get('status');
        $this->assertSame($a, $b);
        $link = MailCenter::resetUrl($u, 'tok');
        $this->travel(61)->minutes();
        $this->get($link)->assertOk()->assertSee('انتهت صلاحية');
        foreach (range(1, 3) as $_) {
            $this->post('/account/forgot-password', ['email' => 'z@example.test']);
        }
        $this->post('/account/forgot-password', ['email' => 'z@example.test'])->assertStatus(429);
    }

    public function test_rendered_email_is_rtl_branded_with_text_fallback(): void
    {
        $data = MailCenter::render('welcome', 'سارة', 'https://bustankids.com/admin-api/account');
        $m = new BrandMail($data, 'بستان التعلّم');
        $html = $m->render();
        $this->assertStringContainsString('dir="rtl"', $html);
        $this->assertStringContainsString('https://bustankids.com/assets/brand/logo-horizontal.png', $html);
        $this->assertStringContainsString('٠٠٩٧٢٥٩٢٩٤٥٥٥٧', $html);
        $this->assertStringContainsString('wa.me/972592945557', $html);
        $this->assertStringContainsString('٣ أيام', $html);
        $this->assertStringContainsString('سارة', $html);
        $this->assertDoesNotMatchRegularExpression('/[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]/u', $html);
        $text = view('mail.brand-text', ['m' => $data])->render();
        $this->assertStringContainsString('https://bustankids.com/admin-api/account', $text);
        $this->assertStringNotContainsString('<', $text);
    }

    public function test_disabled_email_is_logged_not_sent(): void
    {
        Mail::fake();
        Setting::put(['mail_reset_on' => '0']);
        User::factory()->create(['email' => 'p@example.test']);
        $this->post('/account/forgot-password', ['email' => 'p@example.test']);
        Mail::assertNothingSent();
        $this->assertSame('disabled', MailLog::first()->status);
    }

    public function test_failed_transport_is_logged_and_does_not_break_register(): void
    {
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.host' => '127.0.0.1', 'mail.mailers.smtp.port' => 1, 'mail.mailers.smtp.timeout' => 1]);
        $this->register()->assertRedirect();
        $this->assertAuthenticated();
        $this->assertSame('failed', MailLog::first()->status);
    }

    public function test_admin_email_settings_test_send_log_and_manual_verify(): void
    {
        Mail::fake();
        $admin = $this->admin();
        $parent = User::factory()->unverified()->create(['email' => 'u@example.test']);
        $this->actingAs($admin)->get('/admin/manage/mail')->assertOk()->assertSee('سجل الإرسال')->assertSee('{name}');
        $payload = ['mail_from_name' => 'إدارة البستان'];
        foreach (array_keys(MailCenter::TYPES) as $t) {
            $payload['mail_'.$t.'_subject'] = 'عنوان '.$t.' {name}';
            $payload['mail_'.$t.'_body'] = "نص {name}\n\nفقرة";
            $payload['mail_'.$t.'_on'] = $t === 'welcome' ? '0' : '1';
        }
        $this->put('/admin/manage/mail', $payload)->assertSessionHas('status');
        $this->assertSame('0', Setting::get('mail_welcome_on'));
        $this->assertSame('إدارة البستان', Setting::get('mail_from_name'));
        $this->post('/admin/manage/mail/test', ['type' => 'welcome', 'to' => 'box@example.test'])->assertSessionHas('status');
        Mail::assertSent(BrandMail::class, fn (BrandMail $m) => $m->hasTo('box@example.test') && $m->mail['subject'] === 'عنوان welcome '.$admin->name && $m->senderName === 'إدارة البستان');
        $this->get('/admin/manage/mail')->assertSee('box@example.test')->assertSee('تجريبية');
        $this->get('/admin/manage/users?status=unverified')->assertSee('u@example.test')->assertSee('غير مفعّل');
        $this->post('/admin/manage/users/'.$parent->id.'/verify')->assertSessionHas('status');
        $this->assertNotNull($parent->fresh()->email_verified_at);
    }

    public function test_parents_cannot_reach_email_settings(): void
    {
        $this->actingAs(User::factory()->create())->get('/admin/manage/mail')->assertRedirect();
        $this->assertTrue(true);
    }

    public function test_login_page_links_to_forgot_password(): void
    {
        $this->get('/account/login')->assertSee('نسيت كلمة السر؟')->assertSee('/account/forgot-password', false);
    }
}
