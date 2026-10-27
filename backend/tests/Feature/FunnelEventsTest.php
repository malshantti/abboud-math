<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FunnelEventsTest extends TestCase
{
    use RefreshDatabase;

    private function beacon(array $d, ?string $vid = null)
    {
        $req = $this->withHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/26 Mobile/15E148 Safari/604.1');
        if ($vid) {
            $req = $req->withUnencryptedCookie('bk_vid', $vid);
        }

        return $req->call('POST', '/api/t', [], $vid ? ['bk_vid' => $vid] : [], [], ['CONTENT_TYPE' => 'text/plain'], json_encode($d));
    }

    public function test_beacon_records_visit_with_facebook_source_and_ignores_unknown_events(): void
    {
        $this->beacon(['e' => 'visit', 'v' => 'vabc12345678', 'p' => 'landing', 'src' => ['utm_source' => 'facebook', 'utm_campaign' => 'g1', 'fbclid' => 'xyz']])->assertNoContent();
        $this->beacon(['e' => 'registered', 'v' => 'vabc12345678'])->assertNoContent(); // server-only event: ignored
        $this->beacon(['e' => 'answers', 'v' => 'vabc12345678', 's' => 'g1-math', 'n' => 5, 'c' => 'fb'])->assertNoContent();
        $rows = DB::table('funnel_events')->orderBy('id')->get();
        $this->assertCount(2, $rows);
        $this->assertSame('fb', $rows[0]->source);
        $this->assertStringContainsString('"fbclid":1', $rows[0]->meta);
        $this->assertSame(5, (int) $rows[1]->count);
        $this->assertSame('g1-math', $rows[1]->subject);
    }

    public function test_signup_links_anonymous_visitor_and_logs_registration_trial_child_order(): void
    {
        $this->beacon(['e' => 'visit', 'v' => 'vlink1234567', 'p' => 'landing', 'src' => ['ref' => 'l.facebook.com']]);
        $this->withUnencryptedCookie('bk_vid', 'vlink1234567')->post('/account/register', ['name' => 'عائلة', 'email' => 'fam@example.com', 'password' => 'secret-pass-1'])->assertRedirect();
        $u = User::where('email', 'fam@example.com')->firstOrFail();
        $this->assertSame($u->id, (int) DB::table('funnel_events')->where('event', 'visit')->value('user_id'));
        $this->assertTrue(DB::table('funnel_events')->where('event', 'registered')->where('user_id', $u->id)->exists());
        $this->post('/account/students', ['name' => 'سارة', 'grade' => 1])->assertRedirect();
        $this->assertSame('{"grade":1}', DB::table('funnel_events')->where('event', 'child_created')->value('meta'));
        $this->get('/account/subscribe')->assertOk();
        $this->assertTrue(DB::table('funnel_events')->where('event', 'subscribe_view')->where('user_id', $u->id)->exists());
        $this->post('/account/subscribe', [])->assertRedirect();
        $this->assertTrue(DB::table('funnel_events')->where('event', 'form_error')->where('page', 'subscribe')->exists());
    }

    public function test_admin_funnel_page_backfill_and_family_timeline(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
        $p = User::factory()->create(['role' => 'parent', 'email' => 'p1@example.com', 'created_at' => now()->subDays(2)]);
        $p->students()->create(['name' => 'علي', 'grade' => 6]);
        $this->artisan('funnel:backfill')->assertSuccessful();
        $this->assertTrue(DB::table('funnel_events')->where('backfill', true)->where('event', 'registered')->where('user_id', $p->id)->exists());
        $page = $this->actingAs($admin)->get('/admin/manage/funnel')->assertOk();
        $page->assertSee('رحلة العائلات')->assertSee('أضاف طفلًا ولم يفتح درسًا')->assertDontSee('ولي الأمر')->assertDontSee('وليّ الأمر');
        $this->actingAs($admin)->get('/admin/manage/funnel?source=fb&stuck=any&from=2026-01-01&to=2026-12-31')->assertOk();
        $this->actingAs($admin)->get('/admin/manage/funnel/families/'.$p->id)->assertOk()->assertSee('أضاف طفلًا')->assertDontSee('ولي الأمر');
    }
}
