<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FreeMonthTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_month_button_activates_whole_grade_and_turns_off_after_end(): void
    {
        $u = User::factory()->create(['role' => 'parent', 'email' => 'fam2@gmail.com', 'email_verified_at' => now()]);
        $s = $u->students()->create(['name' => 'سارة', 'grade' => 6]);
        Setting::put(['free_month_until' => now()->addDays(20)->format('Y-m-d')]);
        $this->actingAs($u)->get('/account/subscribe?student='.$s->id)->assertOk()->assertSee('اشترك مجانًا لمدة شهر')->assertSee('مجاني لمدة شهر');
        $this->actingAs($u)->post('/account/subscribe/free', ['student_id' => $s->id])->assertRedirect();
        $this->assertSame(4, Subscription::where('gateway', 'free_promo')->where('status', 'active')->where('price', 0)->count());
        $this->actingAs($u)->post('/account/subscribe/free', ['student_id' => $s->id]);
        $this->assertSame(4, Subscription::where('gateway', 'free_promo')->count());
        $this->actingAs($u)->get('/account/subscribe?student='.$s->id)->assertSee('جميع مواد الصف مفعّلة');

        Setting::put(['free_month_until' => now()->subDays(2)->format('Y-m-d')]);
        $this->actingAs($u)->get('/account/subscribe?student='.$s->id)->assertOk()->assertDontSee('اشترك مجانًا لمدة شهر')->assertSee('الاشتراك للصف كاملًا');
    }

    public function test_welcome_mail_renders_free_until_date(): void
    {
        Setting::put(['free_month_until' => '2026-11-28']);
        $m = \App\Support\MailCenter::render('welcome', 'سارة', 'https://bustankids.com');
        $txt = implode(' ', $m['paragraphs']);
        $this->assertStringNotContainsString('{free_until}', $txt);
        $this->assertStringContainsString('٢٨/١١', $txt);
    }
}
