<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use App\Support\Ar;
use App\Support\StudentAudit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ManageDashboardLayoutTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $u = User::factory()->create(['email' => 'admin@example.test']);
        $u->setRole('admin');
        $u->save();

        return $u;
    }

    public function test_student_count_only_counts_parent_students_and_flags_the_rest(): void
    {
        $admin = $this->admin();
        $admin->students()->create(['name' => 'تجربة', 'grade' => 6]);
        $legacy = User::factory()->create();
        $legacy->is_admin = true; // old admin created with the default role
        $legacy->save();
        $legacy->students()->create(['name' => 'قديم', 'local_id' => 'p123']);
        $parent = User::factory()->create();
        $parent->students()->create(['name' => 'سندس', 'grade' => 6]);
        $parent->students()->create(['name' => 'سندس', 'grade' => 6]);

        $audit = StudentAudit::summary();
        $this->assertSame([2, 1, 1], [$audit['staff'], $audit['duplicate'], $audit['legacy']]);
        $page = $this->actingAs($admin)->get('/admin/manage')->assertOk();
        $page->assertSee('data-stat="parents"', false)->assertSee('لدى ١ وليّ أمر')->assertSee('مراجعتها');
        $html = $page->getContent();
        preg_match('/data-stat="students".*?<b>(.*?)<\/b>/s', $html, $m);
        $this->assertSame('١', strip_tags($m[1]), 'Duplicate excluded');
        preg_match('/data-stat="parents".*?<b>(.*?)<\/b>/s', $html, $m);
        $this->assertSame('١', strip_tags($m[1]), 'Admin with legacy role is not a parent');
        $this->actingAs($admin)->get('/admin/manage/students?owner=review')->assertOk()->assertSee('تجربة')->assertSee('قديم');
    }

    public function test_export_buttons_are_one_menu_and_zero_is_readable(): void
    {
        $page = $this->actingAs($this->admin())->get('/admin/manage')->assertOk();
        $this->assertSame(1, substr_count($page->getContent(), '<details class="menu">'));
        $this->assertStringNotContainsString('تصدير المستخدمين', $page->getContent());
        $page->assertSee('<i class="z0">٠</i>', false);
        $this->assertSame('<span class="n" dir="ltr"><i class="z0">٠</i></span>', (string) Ar::html(0));
        $this->assertSame('<span class="n" dir="ltr"><span>١</span><i class="z0">٠</i></span>', (string) Ar::html(10));
    }

    public function test_dates_use_gaza_time_with_twelve_hour_clock(): void
    {
        $this->assertSame('٢٢/١٠/٢٠٢٦ — ١٢:٥٧ ص', Ar::date(Carbon::parse('2026-10-21 21:57:00', 'UTC')));
        $this->assertSame('٢٢/١٠/٢٠٢٦ — ٠١:٠٥ م', Ar::date(Carbon::parse('2026-10-22 10:05:00', 'UTC')));
        $this->assertSame('٢٢/١٠/٢٠٢٦', Ar::date('2026-10-22 10:05:00', false));
    }

    public function test_multi_subject_request_is_one_activity_entry_but_separate_subscriptions(): void
    {
        $admin = $this->admin();
        $u = User::factory()->create(['name' => 'وليّ', 'email' => 'a-very-long-parent-address-for-testing@example-family-domain.test']);
        $s = $u->students()->create(['name' => 'سندس', 'grade' => 6]);
        $this->actingAs($u)->post('/account/subscribe', ['plans' => ['g6-math', 'g6-science', 'g6-arabic', 'g6-english'], 'student_id' => $s->id]);
        $subs = $u->subscriptions()->get();
        $this->assertCount(4, $subs);
        $this->assertCount(1, $subs->pluck('batch')->unique()->filter());
        $this->assertSame(1, ActivityLog::where('action', 'subscription.request')->count());
        $page = $this->actingAs($admin)->get('/admin/manage')->assertOk();
        $page->assertSee('٤ مواد في طلب واحد')->assertSee('class="act-mail"', false);
        $this->assertSame(1, substr_count($page->getContent(), '>طلب اشتراك<'));
        $this->actingAs($admin)->get('/admin/manage/subscriptions?q='.$subs[0]->batch)->assertOk()->assertSee($subs[3]->code);
        // Activation still per subject.
        $this->post('/admin/manage/subscriptions/'.$subs[0]->id.'/activate')->assertRedirect();
        $this->assertSame(['active', 'pending', 'pending', 'pending'], $u->subscriptions()->orderBy('id')->pluck('status')->all());
    }

    public function test_legacy_per_subject_logs_are_grouped(): void
    {
        $u = User::factory()->create();
        foreach (['AAAA-1111' => 'الرياضيات — الصف السادس', 'BBBB-2222' => 'العلوم — الصف السادس'] as $code => $name) {
            ActivityLog::create(['user_id' => $u->id, 'action' => 'subscription.request', 'subject' => $code, 'details' => $name]);
        }
        $g = ActivityLog::grouped(ActivityLog::latest('id')->get());
        $this->assertCount(1, $g);
        $this->assertSame([['AAAA-1111', 'الرياضيات — الصف السادس'], ['BBBB-2222', 'العلوم — الصف السادس']], $g[0]['items']);
    }

    public function test_student_page_shows_useful_progress_not_data_size(): void
    {
        $admin = $this->admin();
        $s = User::factory()->create(['name' => 'أبو سندس'])->students()->create(['name' => 'سندس', 'grade' => 6]);
        $json = json_encode(['points' => 90, 'streak' => 1, 'lastDay' => '2026-10-21', 'skills' => ['a' => ['status' => 'mastered'], 'b' => ['status' => 'learning'], 'c' => ['status' => 'mastered']], 'quizzes' => [['score' => 60, 'date' => '2026-10-20T10:00:00Z'], ['score' => 90, 'date' => '2026-10-21T10:00:00Z']]]);
        $s->progress()->create(['key' => 'bustan_g6_math_v1', 'value' => $json, 'client_updated_at' => 1761000000000]);
        $page = $this->actingAs($admin)->get("/admin/manage/students/{$s->id}")->assertOk();
        $page->assertDontSee('حجم البيانات')->assertSee('الدروس المنجزة')->assertSee('role="progressbar"', false)
            ->assertSeeInOrder(['النقاط', '٩', 'أيام متتالية', '١'], false)->assertSee('متوسط الاختبارات')->assertSee('٧٥')->assertSee('<details>', false)->assertSee('class="facts"', false);
        $p = Ar::progress('bustan_g6_math_v1', $json);
        $this->assertSame([2, 59, 3, 75, [90, 60]], [$p['done'], $p['total'], $p['pct'], $p['quiz_avg'], $p['quiz_last']]);
    }
}
