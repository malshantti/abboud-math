<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\InApp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Mockery;
use Tests\TestCase;

class SignupFunnelTest extends TestCase
{
    use RefreshDatabase;

    private const FB_ANDROID = 'Mozilla/5.0 (Linux; Android 16; SM-A065F Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/156.0.8078.51 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/584.0.0.51.56;IABMV/1;]';
    private const FB_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/500.0.0.40.100;FBBV/1;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/18.7;FBSS/3;FBCR/;FBID/phone;FBLC/ar_AR;FBOP/5]';
    private const IG_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0 (iPhone14,5; iOS 18_7; ar_AR)';
    private const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1';
    private const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google' => ['client_id' => 'test-client.apps.googleusercontent.com', 'client_secret' => 'x', 'redirect' => 'https://bustankids.com/admin-api/account/google/callback']]);
    }

    public function test_in_app_detection(): void
    {
        $this->assertSame('facebook', InApp::detect(self::FB_ANDROID));
        $this->assertSame('facebook', InApp::detect(self::FB_IOS));
        $this->assertSame('instagram', InApp::detect(self::IG_IOS));
        $this->assertNull(InApp::detect(self::SAFARI));
        $this->assertNull(InApp::detect(self::CHROME_ANDROID));
        $this->assertTrue(InApp::isBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'));
        $this->assertFalse(InApp::isBot(self::SAFARI));
    }

    public function test_in_app_browser_gets_open_in_browser_button_instead_of_google(): void
    {
        $page = $this->withHeader('User-Agent', self::FB_ANDROID)->get('/account/register')->assertOk();
        $page->assertSee('افتح بالمتصفح لتسجّل بحساب Google')->assertDontSee('الدخول بحساب جوجل');
        $page->assertSee('package=com.android.chrome', false)->assertSee('google=1', false);
        $ios = $this->withHeader('User-Agent', self::FB_IOS)->get('/account/login')->assertOk();
        $ios->assertSee('x-safari-http', false)->assertSee('فتح في Safari');
        // Even a direct hit on the Google route from a webview never reaches Google's error page.
        $this->withHeader('User-Agent', self::IG_IOS)->get('/account/google')->assertRedirect(route('account.register'));
    }

    public function test_real_browser_with_google_param_auto_starts_google(): void
    {
        $this->withHeader('User-Agent', self::SAFARI)->get('/account/register?google=1')->assertOk()
            ->assertSee('الدخول بحساب جوجل')->assertSee('location.replace', false);
    }

    public function test_callback_without_state_from_crawler_is_quiet(): void
    {
        $this->withHeader('User-Agent', 'facebookexternalhit/1.1')->get('/account/google/callback')->assertRedirect(route('account.login'));
        $this->assertGuest();
    }

    public function test_invalid_state_retries_once_then_falls_back_to_email_signup(): void
    {
        $driver = Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $driver->shouldReceive('user')->andThrow(new InvalidStateException);
        Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

        $first = $this->withHeader('User-Agent', self::SAFARI)->get('/account/google/callback?state=a&code=b');
        $first->assertRedirect(route('account.google', ['retry' => 1]));
        $first->assertCookie('bk_g_retry');

        $second = $this->withHeader('User-Agent', self::SAFARI)->withSession(['google_retry' => 1])->get('/account/google/callback?state=a&code=b');
        $second->assertRedirect(route('account.register', ['email' => 1]));
        $this->followRedirects($second)->assertOk()->assertSee('أنشئ حسابك بالبريد الإلكتروني');
    }

    public function test_register_bot_check_blocks_honeypot_and_fast_posts(): void
    {
        config(['app.bot_check' => true]);
        $this->get('/account/register')->assertSee('name="website"', false)->assertSee('name="form_t"', false);
        $base = ['name' => 'أم سارة', 'email' => 'mom@site.ps', 'password' => 'secret-pass-1'];
        $this->post('/account/register', $base)->assertSessionHasErrors('form');
        $this->post('/account/register', $base + ['form_t' => Crypt::encryptString((string) time())])->assertSessionHasErrors('form');
        $this->post('/account/register', $base + ['form_t' => Crypt::encryptString((string) (time() - 10)), 'website' => 'http://spam'])->assertSessionHasErrors('form');
        $this->assertSame(0, User::count());
        $this->post('/account/register', $base + ['form_t' => Crypt::encryptString((string) (time() - 10)), 'website' => ''])->assertSessionHasNoErrors();
        $this->assertSame(1, User::count());
    }

    public function test_add_student_form_requires_choosing_a_grade(): void
    {
        $u = User::factory()->create(['role' => 'parent']);
        $page = $this->actingAs($u)->get('/account')->assertOk();
        $page->assertSee('اختر الصف')->assertDontSee('اختياري: ٤ أرقام يكتبها طفلك عند الدخول');
        config(['app.child_pin' => true]);
        $this->actingAs($u)->get('/account')->assertSee('اختياري: ٤ أرقام يكتبها طفلك عند الدخول');
        $this->actingAs($u)->post('/account/students', ['name' => 'سارة'])->assertSessionHasErrors('grade');
    }

    public function test_test_accounts_are_kept_out_of_stats(): void
    {
        config(['app.test_email_domains' => ['example.com', 'formtests.info']]);
        User::factory()->create(['role' => 'parent', 'email' => 'qa@example.com']);
        User::factory()->create(['role' => 'parent', 'email' => 'bot@formtests.info']);
        User::factory()->create(['role' => 'parent', 'email' => 'real@gmail.com']);
        $this->assertSame(1, User::parents()->real()->count());
        $this->assertSame(2, User::parents()->test()->count());
    }
}
