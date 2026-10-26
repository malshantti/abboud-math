<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use App\Payments\WhatsAppGateway;
use App\Support\Access;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SettingsCenterTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->setRole('admin');
        $u->save();

        return $u;
    }

    /** A full form submission as the settings center sends it. */
    private function form(array $over = []): array
    {
        $s = Setting::all_();
        $prices = [];
        foreach (Setting::plans() as $code => $p) {
            $prices[$code] = ['price' => $p['price'], 'days' => $p['days']] + ($p['active'] ? ['active' => '1'] : []);
        }
        $base = array_intersect_key($s, \App\Http\Controllers\Admin\ManageController::SETTING_LABELS);
        unset($base['prices'], $base['catalog_extra'], $base['faq']);
        foreach (['gating_enabled', 'auto_expire', 'announcement_active', 'registration_open', 'require_verification', 'voice_enabled', 'voice_autoplay', 'maintenance_on'] as $f) {
            if ($s[$f] === '1') {
                $base[$f] = '1';
            } else {
                unset($base[$f]);
            }
        }

        return array_replace_recursive(['_sent' => '1', 'prices' => $prices, 'faq' => Setting::faq()] + $base, $over);
    }

    public function test_settings_center_renders_every_section(): void
    {
        $r = $this->actingAs($this->admin())->get('/admin/manage/settings')->assertOk();
        foreach (['الأسعار والمواد', 'التجربة والاشتراكات', 'الدفع وواتساب', 'الهوية والصفحة الرئيسية', 'الحسابات والأمان', 'الجولة الصوتية', 'التواصل والتذييل', 'وضع الصيانة', 'إعدادات البريد', 'الصف الثامن', 'طبّق على الصف كله', 'انسخ الأسعار', 'value="٢٠"'] as $t) {
            $r->assertSee($t, false);
        }
        $r->assertSee(route('manage.mail'), false)->assertDontSee('value="20"', false);
    }

    public function test_save_arabic_digits_toggles_and_logs_changes(): void
    {
        $admin = $this->admin();
        $f = $this->form(['trial_days' => '٧', 'prices' => ['g6-math' => ['price' => '٢٥', 'days' => '٦٠']], 'grace_days' => '٢', 'hero_title' => 'عنوان جديد']);
        unset($f['prices']['g6-arabic']['active']);
        $this->actingAs($admin)->put('/admin/manage/settings', $f)->assertRedirect()->assertSessionHas('status');
        $this->assertSame('7', Setting::get('trial_days'));
        $p = Setting::plans();
        $this->assertSame([25, 60, true], [$p['g6-math']['price'], $p['g6-math']['days'], $p['g6-math']['active']]);
        $this->assertFalse($p['g6-arabic']['active']);
        $this->assertArrayNotHasKey('g6-arabic', Setting::plans(true));
        $log = ActivityLog::where('action', 'settings.update')->latest('id')->first();
        $this->assertNotNull($log);
        $this->assertStringContainsString('مدة التجربة', $log->subject);
        $this->assertStringContainsString('hero_title', $log->details);
        // Inactive subject: not on the public price list, not orderable.
        $this->assertNotContains('g6-arabic', array_keys(Setting::publicPrices()['plans']));
        $u = User::factory()->create(['trial_ends_at' => now()->subDay()]);
        $this->actingAs($u)->post('/account/subscribe', ['plans' => ['g6-arabic']])->assertSessionHasErrors('plans.0');
        // Saving again without changes logs nothing new.
        $n = ActivityLog::count();
        $this->actingAs($admin)->put('/admin/manage/settings', $this->form())->assertSessionHas('status', 'لا تغييرات جديدة للحفظ.');
        $this->assertSame($n, ActivityLog::count());
    }

    public function test_validation_errors_are_arabic(): void
    {
        $this->actingAs($this->admin())->put('/admin/manage/settings', $this->form([
            'trial_days' => '500', 'facebook_url' => 'https://example.com/x', 'contact_email' => 'bad', 'site_name' => '',
            'announcement_from' => '2026-10-25T10:00', 'announcement_to' => '2026-10-24T10:00', 'prices' => ['g1-math' => ['price' => '0']],
        ]))->assertSessionHasErrors([
            'trial_days' => 'قيمة «مدة التجربة» يجب ألّا تزيد على 90.', 'facebook_url' => 'رابط فيسبوك يجب أن يكون من facebook.com.',
            'contact_email' => 'اكتب في «بريد التواصل» بريدًا إلكترونيًا صحيحًا.', 'site_name' => 'حقل «اسم الموقع» مطلوب.',
            'announcement_to' => 'يجب أن تكون «نهاية عرض الإعلان» بعد بدايته.', 'prices.g1-math.price' => 'قيمة «السعر» يجب ألّا تقل عن 1.',
        ]);
    }

    public function test_new_grade_and_subject_are_priced_but_unavailable_until_enabled(): void
    {
        $admin = $this->admin();
        $f = $this->form(['extra' => ['g3-math'], 'extra_name' => ['g3-math' => 'الرياضيات'], 'prices' => ['g3-math' => ['price' => '18', 'days' => '30']]]);
        $this->actingAs($admin)->put('/admin/manage/settings', $f)->assertSessionHasNoErrors();
        $p = Setting::plans();
        $this->assertSame('الرياضيات — الصف الثالث', $p['g3-math']['name']);
        $this->assertFalse($p['g3-math']['active']);
        $this->assertArrayHasKey(3, Setting::gradeOptions());
        $f['prices']['g3-math']['active'] = '1';
        $this->actingAs($admin)->put('/admin/manage/settings', $f)->assertSessionHasNoErrors();
        $pub = $this->getJson('/api/public/prices')->assertOk()->json();
        $g3 = collect($pub['groups'])->firstWhere('key', '3');
        $this->assertSame('الصف الثالث', $g3['title']);
        $this->assertSame(18, $g3['min']);
        // A parent can now place a student in grade 3 and order it.
        $u = User::factory()->create(['trial_ends_at' => now()->subDay()]);
        $this->actingAs($u)->post('/account/students', ['name' => 'ليان', 'grade' => 3])->assertSessionHasNoErrors();
        $this->actingAs($u)->post('/account/subscribe', ['plans' => ['g3-math']]);
        $this->assertSame(1, $u->subscriptions()->where('plan', 'g3-math')->count());
        // Removing it from the form removes it from the catalog.
        $f = $this->form();
        $f['extra'] = [];
        unset($f['prices']['g3-math']);
        $this->actingAs($admin)->put('/admin/manage/settings', $f);
        $this->assertArrayNotHasKey('g3-math', Setting::plans());
    }

    public function test_public_site_reads_identity_faq_voice_contact_and_schedule(): void
    {
        Setting::put([
            'hero_title' => 'عنوان', 'hero_title_mark' => 'مميّز', 'hero_subtitle' => 'وصف', 'hero_badge' => 'شارة', 'faq' => json_encode([['q' => 'س؟', 'a' => 'المدة {days}']]),
            'voice_enabled' => '0', 'voice_volume' => '60', 'voice_autoplay' => '0', 'facebook_url' => 'https://facebook.com/bustan', 'footer_text' => 'تذييل',
            'announcement' => 'إعلان', 'announcement_active' => '1', 'announcement_color' => 'sky', 'announcement_link' => 'https://bustankids.com/x',
            'announcement_from' => now('Asia/Gaza')->addDay()->format('Y-m-d\TH:i'),
        ]);
        $j = $this->getJson('/api/site')->assertOk()->json();
        $this->assertSame(['title' => 'عنوان', 'mark' => 'مميّز', 'subtitle' => 'وصف', 'badge' => 'شارة'], $j['hero']);
        $this->assertSame('المدة ٣٠ يومًا', $j['faq'][0]['a']);
        $this->assertSame(['enabled' => false, 'volume' => 60, 'autoplay' => false], $j['voice']);
        $this->assertSame('https://facebook.com/bustan', $j['contact']['facebook']);
        $this->assertSame('', $j['announcement'], 'scheduled in the future: hidden');
        Setting::put(['announcement_from' => now('Asia/Gaza')->subHour()->format('Y-m-d\TH:i'), 'announcement_to' => now('Asia/Gaza')->addHour()->format('Y-m-d\TH:i')]);
        $j = $this->getJson('/api/site')->json();
        $this->assertSame('إعلان', $j['announcement']);
        $this->assertSame('#e3f1fb', $j['announcement_color']['bg']);
        Setting::put(['announcement_to' => now('Asia/Gaza')->subMinute()->format('Y-m-d\TH:i')]);
        $this->assertSame('', $this->getJson('/api/site')->json('announcement'));
        $this->assertSame('', $this->getJson('/api/site')->json('announcement_link'));
    }

    public function test_maintenance_blocks_parents_but_not_staff_or_login(): void
    {
        Setting::put(['maintenance_on' => '1', 'maintenance_message' => 'نعود قريبًا']);
        $this->getJson('/api/site')->assertJsonPath('maintenance.message', 'نعود قريبًا');
        $this->get('/account/login')->assertOk();
        $this->get('/account/register')->assertStatus(503)->assertSee('نعود قريبًا');
        $u = User::factory()->create();
        $this->actingAs($u)->get('/account')->assertStatus(503);
        $this->actingAs($this->admin())->get('/account')->assertOk();
        $this->getJson('/api/site')->assertJsonPath('maintenance', null);
        $this->getJson('/api/session')->assertJsonPath('site.maintenance', null);
    }

    public function test_trial_grace_reminder_pending_limit_and_auto_expire(): void
    {
        $u = User::factory()->create(['trial_ends_at' => now()->subDays(10)]);
        $mk = fn (array $a) => $u->subscriptions()->save(new Subscription($a + ['code' => 'C'.random_int(1000, 9999).'-1', 'plan' => 'g6-math', 'plan_name' => 'x', 'price' => 20, 'currency' => 'شيكل', 'days' => 30]));
        $s = $mk(['status' => 'active']);
        $s->forceFill(['starts_at' => now()->subDays(31), 'ends_at' => now()->subDay()])->save();
        $this->assertFalse(Access::allows($u, 'g6-math'));
        Setting::put(['grace_days' => '3']);
        $this->assertTrue(Access::allows($u, 'g6-math'), 'grace keeps the subject open');
        $this->assertTrue(Access::expiringSoon($u)[0]['grace']);
        Setting::put(['grace_days' => '0', 'reminder_days' => '5']);
        $s->forceFill(['ends_at' => now()->addDays(4)])->save();
        $this->assertCount(1, Access::expiringSoon($u));
        $this->actingAs($u)->get('/account')->assertSee('يقترب الانتهاء');
        // Pending limit.
        Setting::put(['max_pending' => '2']);
        $this->actingAs($u)->post('/account/subscribe', ['plans' => ['g6-arabic', 'g6-english', 'g6-science']])->assertSessionHasErrors('plan');
        $this->actingAs($u)->post('/account/subscribe', ['plans' => ['g6-arabic', 'g6-english']]);
        $this->assertSame(2, $u->subscriptions()->where('status', 'pending')->count());
        // Auto-expire.
        $s->forceFill(['ends_at' => now()->subDays(2)])->save();
        DB::table('subscriptions')->where('status', 'pending')->update(['created_at' => now()->subDays(20)]);
        $this->artisan('subscriptions:expire')->assertSuccessful();
        $this->assertSame('expired', $s->fresh()->status);
        $this->assertSame(0, $u->subscriptions()->where('status', 'pending')->count());
    }

    public function test_verification_and_max_students(): void
    {
        $u = User::factory()->unverified()->create(['trial_ends_at' => now()->addDays(2)]);
        Setting::put(['require_verification' => '1']); // legacy flag: ignored, unverified never blocks
        $this->assertSame('trial', Access::state($u)['kind']);
        Setting::put(['require_verification' => '0', 'max_students' => '1']);
        $this->assertSame('trial', Access::state($u)['kind']);
        $this->actingAs($u)->post('/account/students', ['name' => 'أ', 'grade' => 1])->assertSessionHasNoErrors();
        $this->actingAs($u)->post('/account/students', ['name' => 'ب', 'grade' => 1])->assertSessionHasErrors('name');
        $this->assertSame(1, $u->students()->count());
    }

    public function test_whatsapp_template_placeholders(): void
    {
        Setting::put(['whatsapp_template' => 'طالب: {student} | {subjects} | المجموع {total} | رمز {code} | {site}']);
        $u = User::factory()->create(['name' => 'أحمد']);
        $s = $u->subscriptions()->save(new Subscription(['code' => 'ABCD-1234', 'plan' => 'g6-math', 'plan_name' => 'الرياضيات — الصف السادس', 'price' => 20, 'currency' => 'شيكل', 'days' => 30, 'status' => 'pending']));
        $m = (new WhatsAppGateway)->message($s->setRelation('user', $u));
        $this->assertSame('طالب: كل الطلاب في الحساب | ١) الرياضيات — الصف السادس — ٢٠ شيكل لمدة ٣٠ يومًا | المجموع ٢٠ شيكل | رمز ABCD-1234 | بستان التعلّم', $m);
    }

    public function test_session_minutes_and_tagline_migration(): void
    {
        DB::table('site_settings')->updateOrInsert(['key' => 'tagline'], ['value' => Setting::OLD_TAGLINE]);
        $m = require database_path('migrations/2026_10_22_200000_update_old_tagline_exact.php');
        $m->up();
        $this->assertSame('نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا', DB::table('site_settings')->where('key', 'tagline')->value('value'));
        DB::table('site_settings')->where('key', 'tagline')->update(['value' => 'شعار خاص']);
        $m->up();
        $this->assertSame('شعار خاص', DB::table('site_settings')->where('key', 'tagline')->value('value'));
        $this->assertSame('نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا', Setting::DEFAULTS['tagline']);
    }
}
