<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Access;
use App\Support\TrialReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentsSwitchTest extends TestCase
{
    use RefreshDatabase;

    private function parentWithExpiredTrial(): User
    {
        $u = User::factory()->create(['role' => 'parent', 'email' => 'fam@example.test', 'email_verified_at' => now()]);
        $u->forceFill(['trial_ends_at' => now()->subDays(5)])->save();
        $u->students()->create(['name' => 'سارة', 'grade' => 6]);

        return $u;
    }

    public function test_payments_on_by_default_keeps_the_paid_flow(): void
    {
        $u = $this->parentWithExpiredTrial();
        Setting::put(['gating_enabled' => '1']);

        $this->assertTrue(Setting::paymentsOn());
        $this->assertNull(Setting::freeNow());
        $this->assertSame('expired', Access::state($u)['kind']);
        $this->actingAs($u)->get('/account/subscribe')->assertOk();
        $this->getJson('/api/site')->assertOk()->assertJsonPath('free_now', null);
    }

    public function test_payments_off_opens_everything_and_says_free_everywhere(): void
    {
        $u = $this->parentWithExpiredTrial();
        Setting::put(['gating_enabled' => '1', 'payments_enabled' => '0', 'free_month_until' => now()->addDays(10)->format('Y-m-d')]);

        $state = Access::state($u);
        $this->assertSame([true, 'free', null], [$state['access'], $state['kind'], $state['subjects']]);
        $this->assertNull(Setting::freeMonth(), 'The dated free month gives way to «free now»');

        // Account: a warm message, no subscribe button, and the subscribe pages lead back home.
        $home = $this->actingAs($u)->get('/account')->assertOk();
        $home->assertSee('مجاني الآن')->assertSee('كل مواد صف طفلك مفتوحة الآن')->assertDontSee('الاشتراك والمواد');
        $this->get('/account/subscribe')->assertRedirect(route('account.home'));
        $this->post('/account/subscribe', ['plans' => ['g6-math'], 'student_id' => $u->students()->first()->id])->assertRedirect(route('account.home'));
        $this->assertSame(0, Subscription::count());

        // Public data for the static site: banner, FAQ and flags.
        $site = $this->getJson('/api/site')->assertOk()->json();
        $this->assertSame(Setting::DEFAULTS['free_now_banner'], $site['announcement']);
        $this->assertNull($site['free_month']);
        $this->assertSame('هل البستان مجاني الآن؟', $site['faq'][0]['q']);
        $this->assertCount(0, array_filter(array_slice($site['faq'], 1), fn ($i) => preg_match('/تجرب|يُخصم|اشترا?ك/u', $i['q'].$i['a'])));
        $this->getJson('/api/public/prices')->assertOk()->assertJsonPath('free_now.banner', Setting::DEFAULTS['free_now_banner']);

        // Welcome mail and sign-up page.
        $mail = implode(' ', \App\Support\MailCenter::render('welcome', 'سارة', 'https://bustankids.com')['paragraphs']);
        $this->assertStringContainsString('مجاني بالكامل', $mail);
        $this->assertStringNotContainsString('لمدة شهر', $mail);
        auth()->logout();
        $this->get('/account/register')->assertOk()->assertSee('البستان مجاني بالكامل الآن');
    }

    public function test_custom_texts_and_no_trial_reminders_while_free(): void
    {
        Setting::put(['payments_enabled' => '0', 'free_now_banner' => 'مجاني لكل أطفال غزة', 'free_now_message' => 'رسالة مخصّصة']);
        $this->assertSame(['banner' => 'مجاني لكل أطفال غزة', 'message' => 'رسالة مخصّصة'], Setting::freeNow());

        $u = User::factory()->create(['role' => 'parent']);
        $u->forceFill(['trial_ends_at' => now()->addHours(5)])->save();
        $this->assertSame(['candidates' => 0, 'emailed' => 0, 'pushed' => 0], TrialReminder::run(24));
    }

    public function test_admin_switches_payments_off_and_on_from_settings(): void
    {
        $admin = User::factory()->create(['email' => 'admin@example.test']);
        $admin->setRole('admin');
        $admin->save();

        $page = $this->actingAs($admin)->get('/admin/manage/settings?tab=payment')->assertOk();
        $page->assertSee('تفعيل الدفع')->assertSee('name="payments_enabled"', false);

        // The form posts every field; an unchecked switch is simply absent.
        $this->put('/admin/manage/settings', ['_sent' => '1', 'tab' => 'payment', 'free_now_banner' => 'شريط تجربة'] + $this->formBase())->assertRedirect();
        $this->assertFalse(Setting::paymentsOn());
        $this->assertSame('شريط تجربة', Setting::freeNow()['banner']);

        $this->put('/admin/manage/settings', ['_sent' => '1', 'payments_enabled' => '1'] + $this->formBase())->assertRedirect()->assertSessionHasNoErrors();
        $this->assertTrue(Setting::paymentsOn());
    }

    /** The minimal valid settings form, as the page posts it. */
    private function formBase(): array
    {
        $s = Setting::all_();
        $prices = [];
        foreach (Setting::plans() as $code => $p) {
            $prices[$code] = ['price' => $p['price'], 'days' => $p['days'], 'active' => $p['active'] ? '1' : null];
        }

        return array_intersect_key($s, array_flip(['trial_days', 'grace_days', 'reminder_days', 'max_pending', 'pending_expire_days', 'whatsapp_number', 'whatsapp_template', 'currency',
            'site_name', 'hero_title', 'hero_subtitle', 'announcement_color', 'max_students', 'voice_volume', 'maintenance_message', 'points_multiplier'])) + ['prices' => $prices, 'session_minutes' => ''];
    }
}
