<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use App\Mail\BrandMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    private function register(array $over = [])
    {
        return $this->post('/account/register', array_merge(['name' => 'أم سامي', 'email' => 'Parent@Example.test', 'password' => 'secret-pass-1', 'password_confirmation' => 'secret-pass-1'], $over));
    }

    public function test_register_page_is_arabic_rtl_without_external_assets(): void
    {
        $r = $this->get('/account/register')->assertOk()->assertSee('أنشئ حسابك المجاني')->assertDontSee('ولي الأمر')->assertDontSee('password_confirmation', false)->assertSee('dir="rtl"', false)->assertSee('name="_token"', false);
        $this->assertDoesNotMatchRegularExpression('#(fonts\.googleapis|cdn\.|unpkg|jsdelivr)#', $r->getContent());
        $this->assertStringContainsString('٣', $r->getContent());
    }

    public function test_account_and_admin_login_pages_use_one_local_brand_font_that_resolves(): void
    {
        foreach (['/account/register', '/account/login', '/login'] as $url) {
            $html = $this->get($url)->assertOk()->assertSee('class="brand-font"', false)->getContent();
            preg_match_all('#url\("([^"]+\.woff2)"\)#', $html, $m);
            $this->assertCount(4, $m[1], $url);
            foreach ($m[1] as $font) {
                $this->assertStringContainsString('/ui/fonts/', $font);
                $this->assertFileExists(public_path(ltrim(parse_url($font, PHP_URL_PATH), '/')));
            }
        }
        $this->assertStringContainsString('class="back-link"', $this->get('/login')->getContent());
    }

    public function test_parent_registers_gets_trial_and_hashed_password(): void
    {
        $this->register()->assertRedirect('/account');
        $u = User::firstOrFail();
        $this->assertSame('parent@example.test', $u->email);
        $this->assertSame('parent', $u->role);
        $this->assertFalse($u->is_admin);
        $this->assertNotSame('secret-pass-1', $u->getRawOriginal('password'));
        $this->assertTrue(password_verify('secret-pass-1', $u->password));
        $this->assertTrue($u->trial_ends_at->between(now()->addDays(3)->subMinute(), now()->addDays(3)->addMinute()));
        $this->assertAuthenticatedAs($u);
        $this->assertDatabaseHas('activity_logs', ['action' => 'register']);
        // A parent cannot open the admin panel.
        $this->get('/admin')->assertRedirect('/account');
        $this->get('/admin/manage')->assertRedirect('/account');
    }

    public function test_parent_never_lands_on_admin_after_login_or_register_even_with_stale_intended_url(): void
    {
        \App\Models\Setting::put(['registration_open' => '1']);
        // Parent first opened the admin area as a guest: Laravel stored /admin as the intended URL.
        $this->get('/admin')->assertRedirect('/login');
        $this->assertStringEndsWith('/admin', session('url.intended'));
        $this->register()->assertRedirect('/account');
        $this->get('/account')->assertOk();
        $this->post('/account/logout');

        $this->get('/admin/manage/users');
        $this->post('/account/login', ['email' => 'parent@example.test', 'password' => 'secret-pass-1'])->assertRedirect('/account');

        // ?return= pointing at admin is ignored.
        $this->post('/account/logout');
        $this->get('/account/login?return=/admin');
        $this->assertNull(session('url.intended'));
        // A logged-in parent visiting a guest-only page is sent to the account, not admin.
        $this->post('/account/login', ['email' => 'parent@example.test', 'password' => 'secret-pass-1'])->assertRedirect('/account');
        $this->get('/login')->assertRedirect('/account');
        $this->get('/account/login')->assertRedirect('/account');
        $this->get('/admin')->assertRedirect('/account');
    }

    public function test_staff_still_land_in_the_admin_area_from_account_login(): void
    {
        $admin = User::factory()->create(['email' => 'boss@example.test', 'password' => 'secret-pass-1']);
        $admin->setRole('admin');
        $admin->save();
        $this->post('/account/login', ['email' => 'boss@example.test', 'password' => 'secret-pass-1'])->assertRedirect('/admin/manage');
        $this->get('/login')->assertRedirect('/admin/manage');
    }

    public function test_trial_is_granted_once_per_normalized_email(): void
    {
        $this->post('/account/register', ['name' => 'a', 'email' => 'sami.ali@gmail.com', 'password' => 'secret-pass-1', 'password_confirmation' => 'secret-pass-1']);
        User::query()->delete();
        auth()->logout();
        $this->post('/account/register', ['name' => 'a', 'email' => 'samiali+2@gmail.com', 'password' => 'secret-pass-1', 'password_confirmation' => 'secret-pass-1'])->assertRedirect('/account');
        $this->assertNull(User::firstOrFail()->trial_ends_at);
    }

    public function test_trial_length_is_configurable(): void
    {
        Setting::put(['trial_days' => 7]);
        $this->register();
        $this->assertTrue(User::first()->trial_ends_at->isAfter(now()->addDays(6)));
    }

    public function test_registration_validation_and_closed_registration(): void
    {
        $this->register(['email' => 'noconfirm@example.test', 'password_confirmation' => 'other'])->assertSessionHasNoErrors(); // confirmation no longer required
        auth()->guard()->logout();
        $this->register(['password' => 'short', 'password_confirmation' => 'short'])->assertSessionHasErrors('password');
        User::factory()->create(['email' => 'parent@example.test']);
        $this->register()->assertSessionHasErrors('email');
        Setting::put(['registration_open' => '0']);
        $this->get('/account/register')->assertSee('التسجيل مغلق');
        $this->register(['email' => 'x@example.test'])->assertForbidden();
    }

    public function test_register_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/account/register', ['name' => 'x', 'email' => "bad$i", 'password' => 'a']);
        }
        $this->post('/account/register', ['name' => 'x'])->assertStatus(429);
    }

    public function test_login_logout_and_disabled_accounts(): void
    {
        $u = User::factory()->create(['email' => 'p@example.test', 'password' => 'secret-pass-1']);
        $this->post('/account/login', ['email' => 'P@example.test', 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->post('/account/login', ['email' => 'P@example.test', 'password' => 'secret-pass-1'])->assertRedirect('/account');
        $this->assertAuthenticatedAs($u);
        $this->get('/account')->assertOk()->assertSee('أهلًا');
        $this->post('/account/logout')->assertRedirect('/account/login');
        $this->assertGuest();

        $u->forceFill(['disabled_at' => now()])->save();
        $this->post('/account/login', ['email' => 'p@example.test', 'password' => 'secret-pass-1'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_disabled_user_with_live_session_is_logged_out(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->get('/account')->assertOk();
        $u->forceFill(['disabled_at' => now()])->save();
        $this->get('/account')->assertRedirect('/account/login');
        $this->assertGuest();
    }

    public function test_login_is_rate_limited_per_identity(): void
    {
        User::factory()->create(['email' => 'p@example.test', 'password' => 'secret-pass-1']);
        for ($i = 0; $i < 5; $i++) {
            $this->post('/account/login', ['email' => 'p@example.test', 'password' => 'bad']);
        }
        $this->post('/account/login', ['email' => 'p@example.test', 'password' => 'secret-pass-1'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_password_reset_by_email(): void
    {
        Mail::fake();
        $u = User::factory()->create(['email' => 'p@example.test']);
        $this->post('/account/forgot-password', ['email' => 'nobody@example.test'])->assertSessionHas('status');
        $this->post('/account/forgot-password', ['email' => 'P@example.test'])->assertSessionHas('status');
        Mail::assertSentCount(1);
        $link = null;
        Mail::assertSent(BrandMail::class, function (BrandMail $m) use (&$link) {
            $link = $m->mail['link'];
            $this->assertSame('reset', $m->mail['type']);
            $this->assertStringContainsString(e($link), $m->render());

            return $m->hasTo('p@example.test');
        });
        $this->assertStringContainsString('signature=', $link);
        preg_match('#/account/reset-password/([^?]+)#', $link, $mm);
        $token = $mm[1];
        $this->get($link)->assertOk()->assertSee('كلمة مرور جديدة')->assertDontSee('انتهت صلاحية');
        $this->get('/account/reset-password/'.$token.'?email=p@example.test')->assertOk()->assertSee('كلمة مرور جديدة');
        $this->post('/account/reset-password', ['token' => 'bad', 'email' => 'p@example.test', 'password' => 'new-pass-123', 'password_confirmation' => 'new-pass-123'])->assertSessionHasErrors('email');
        $this->post('/account/reset-password', ['token' => $token, 'email' => 'p@example.test', 'password' => 'new-pass-123', 'password_confirmation' => 'new-pass-123'])->assertRedirect('/account/login');
        $this->assertTrue(password_verify('new-pass-123', $u->fresh()->password));
        $this->assertSame(1, ActivityLog::where('action', 'password.reset')->count());
    }

    public function test_parent_manages_own_students_only(): void
    {
        $u = User::factory()->create();
        $other = User::factory()->create();
        $theirs = $other->students()->create(['name' => 'غريب', 'grade' => 6]);
        $this->actingAs($u)->post('/account/students', ['name' => 'سامي', 'grade' => 6])->assertRedirect();
        $this->post('/account/students', ['name' => 'ليلى', 'grade' => 1]);
        $this->post('/account/students', ['name' => 'خطأ', 'grade' => 5])->assertSessionHasErrors('grade');
        $this->assertSame(['سامي', 'ليلى'], $u->students()->pluck('name')->all());
        $s = $u->students()->first();
        $this->put("/account/students/{$s->id}", ['name' => 'سامي ع', 'grade' => 8]);
        $this->assertSame(8, $s->fresh()->grade);
        $this->put("/account/students/{$theirs->id}", ['name' => 'x', 'grade' => 1])->assertNotFound();
        $this->delete("/account/students/{$theirs->id}", ['confirm' => 1])->assertNotFound();
        $this->delete("/account/students/{$s->id}", ['confirm' => 1]);
        $this->assertSame(1, $u->students()->count());
    }

    public function test_subscription_request_opens_whatsapp_with_prefilled_message(): void
    {
        Setting::put(['whatsapp_number' => '970599123456']);
        $u = User::factory()->create(['name' => 'أبو سامي', 'email' => 'p@example.test']);
        $s = $u->students()->create(['name' => 'سامي', 'grade' => 6]);
        $this->actingAs($u)->get('/account/subscribe')->assertOk()->assertSee('أرسل الطلب عبر واتساب')->assertSee('الرياضيات');
        $r = $this->post('/account/subscribe', ['plan' => 'g6-math', 'student_id' => $s->id]);
        $sub = $u->subscriptions()->firstOrFail();
        $this->assertSame('pending', $sub->status);
        $this->assertSame('g6-math', $sub->plan);
        $loc = $r->headers->get('Location');
        $this->assertStringStartsWith('https://wa.me/970599123456?text=', $loc);
        $text = rawurldecode(substr($loc, strpos($loc, '=') + 1));
        foreach (['أبو سامي', 'p@example.test', 'سامي', 'الرياضيات — الصف السادس', '٢٠', $sub->code] as $part) {
            $this->assertStringContainsString($part, $text);
        }
        $this->post('/account/subscribe', ['plan' => 'g5-art'])->assertSessionHasErrors('plan');
    }

    public function test_multi_subject_request_creates_one_subscription_per_subject_and_one_whatsapp_message(): void
    {
        $u = User::factory()->create(['name' => 'أم ليلى', 'email' => 'm@example.test']);
        $s = $u->students()->create(['name' => 'ليلى', 'grade' => 6]);
        $page = $this->actingAs($u)->get('/account/subscribe')->assertOk();
        $page->assertSee('name="plans[]"', false)->assertSee('type="checkbox"', false)->assertSee('اختر الطالب')->assertSee('اختر المواد')->assertSee('ادفع عبر واتساب وسنفعّل الاشتراك بعد التأكيد')->assertSee('المجموع');
        $r = $this->post('/account/subscribe', ['plans' => ['g6-math', 'g6-science', 'g6-math'], 'student_id' => $s->id]);
        $subs = $u->subscriptions()->orderBy('id')->get();
        $this->assertCount(2, $subs);
        $this->assertSame(['g6-math', 'g6-science'], $subs->pluck('plan')->all());
        $this->assertTrue($subs->every(fn ($x) => $x->status === 'pending' && $x->student_id === $s->id && $x->price === 20));
        $loc = $r->headers->get('Location');
        $this->assertStringStartsWith('https://wa.me/972592945557?text=', $loc);
        $text = rawurldecode(substr($loc, strpos($loc, '=') + 1));
        foreach (['أم ليلى', 'ليلى', 'الرياضيات — الصف السادس', 'العلوم — الصف السادس', 'المجموع: ٤٠', $subs[0]->code, $subs[1]->code] as $part) {
            $this->assertStringContainsString($part, $text);
        }
        $this->post('/account/subscribe', ['plans' => ['g6-math', 'g5-art']])->assertSessionHasErrors('plans.1');
        $this->post('/account/subscribe', [])->assertSessionHasErrors();
        $this->assertSame(2, $u->subscriptions()->count());
    }

    public function test_prices_default_by_grade_when_unset_and_admin_values_override(): void
    {
        Setting::put(['prices' => "g6-math|0|30\ng8-arabic|35|60"]);
        $p = Setting::plans();
        $this->assertCount(16, $p);
        $this->assertSame([15, 30], [$p['g1-math']['price'], $p['g1-math']['days']]);
        $this->assertSame(15, $p['g2-life']['price']);
        $this->assertSame([20, 30], [$p['g6-math']['price'], $p['g6-math']['days']]);
        $this->assertSame(20, $p['g8-science']['price']);
        $this->assertSame([35, 60], [$p['g8-arabic']['price'], $p['g8-arabic']['days']]);
        Setting::put(['prices' => '']);
        $u = User::factory()->create();
        $this->actingAs($u)->get('/account/subscribe')->assertOk()->assertSee('data-price="15"', false)->assertSee('data-price="20"', false)->assertDontSee('data-price="0"', false);
    }

    public function test_subscribe_page_shows_trial_days_left_or_expired(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->addDays(2)->addHour()]);
        $this->actingAs($u)->get('/account/subscribe')->assertOk()->assertSee('متبقٍّ ٣ أيام');
        $u->forceFill(['trial_ends_at' => now()->subDay()])->save();
        $this->actingAs($u->fresh())->get('/account/subscribe')->assertOk()->assertSee('انتهت الفترة التجريبية');
    }

    public function test_login_returns_to_the_lesson_that_required_sign_in(): void
    {
        $this->register()->assertRedirect('/account');
        $this->post('/account/logout');
        $this->get('/account/login')->assertOk();
        $origin = request()->getSchemeAndHttpHost();
        $this->get('/account/login?return='.urlencode($origin.'/g1/math/'))->assertOk();
        $this->post('/account/login', ['email' => 'parent@example.test', 'password' => 'secret-pass-1'])->assertRedirect($origin.'/g1/math/');
    }

    public function test_register_returns_to_the_lesson_and_offsite_returns_are_ignored(): void
    {
        $this->get('/account/register?return=%2Fg8%2Fscience%2F')->assertOk();
        $this->register()->assertRedirect(request()->getSchemeAndHttpHost().'/g8/science/');
        $this->post('/account/logout');
        foreach (['https://evil.test/g1/math/', '//evil.test/x', '/\\evil.test', 'javascript:alert(1)', 'http://localhost.evil.test/'] as $bad) {
            $this->get('/account/login?return='.urlencode($bad))->assertOk();
            $this->post('/account/login', ['email' => 'parent@example.test', 'password' => 'secret-pass-1'])->assertRedirect('/account');
            $this->post('/account/logout');
        }
    }
}
