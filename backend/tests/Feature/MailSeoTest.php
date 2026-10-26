<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Support\MailCenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MailSeoTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->setRole('admin');
        $u->save();

        return $u;
    }

    public function test_arabic_placeholders_and_fallback_to_default_text(): void
    {
        Setting::put(['mail_welcome_subject' => 'مرحبا {اسم_ولي_الأمر} في {اسم_الموقع}', 'mail_welcome_body' => '']);
        $m = MailCenter::render('welcome', 'سامي', '#');
        $this->assertSame('مرحبا سامي في بستان التعلّم', $m['subject']);
        $this->assertStringContainsString('يسعدنا انضمامك', implode(' ', $m['paragraphs']));
    }

    public function test_preview_renders_unsaved_text(): void
    {
        $this->actingAs($this->admin())->post('/admin/manage/mail/preview', ['type' => 'reset', 'subject' => 'عنوان {الاسم}', 'body' => 'نص تجريبي'])
            ->assertOk()->assertSee('نص تجريبي')->assertSee('عنوان');
    }

    public function test_mail_page_renders_with_log_rows(): void
    {
        \App\Models\MailLog::create(['to' => 'a@b.c', 'type' => 'verify', 'subject' => 'x', 'status' => 'sent', 'is_test' => false]);
        $this->actingAs($this->admin())->get('/admin/manage/mail')->assertOk()->assertSee('{اسم_ولي_الأمر}')->assertSee('a@b.c');
    }

    public function test_mail_save_allows_blank_fields(): void
    {
        $this->actingAs($this->admin())->put('/admin/manage/mail', ['mail_from_name' => 'بستان', 'mail_verify_subject' => '', 'mail_verify_body' => ''])->assertSessionHasNoErrors();
        $this->assertSame('تفعيل حسابك في بستان التعلّم', MailCenter::render('verify', 'x', '#')['subject']);
    }

    public function test_seo_writes_static_files_and_restores_originals(): void
    {
        $root = sys_get_temp_dir().'/seo'.uniqid();
        mkdir($root.'/g6/math', 0777, true);
        $html = '<html><head><meta name="description" content="قديم"><title>عنوان قديم</title><meta property="og:title" content="عنوان قديم"><meta property="og:description" content="قديم"></head></html>';
        file_put_contents($root.'/index.html', $html);
        file_put_contents($root.'/g6/math/index.html', $html);
        config(['app.static_root' => $root]);
        $a = $this->admin();
        $this->actingAs($a)->get('/admin/manage/seo')->assertOk()->assertSee('معاينة نتيجة جوجل')->assertSee('عنوان قديم');
        $this->actingAs($a)->put('/admin/manage/seo', ['seo' => ['_home' => ['title' => 'جديد "<b>"', 'description' => 'وصف جديد'], 'g6/math' => ['title' => '', 'description' => 'رياضيات']]])->assertSessionHas('status');
        $h = file_get_contents($root.'/index.html');
        $this->assertStringContainsString('<title>جديد &quot;&lt;b&gt;&quot;</title>', $h);
        $this->assertStringContainsString('og:description" content="وصف جديد"', $h);
        $g = file_get_contents($root.'/g6/math/index.html');
        $this->assertStringContainsString('<title>عنوان قديم</title>', $g);
        $this->assertStringContainsString('name="description" content="رياضيات"', $g);
        $this->actingAs($a)->put('/admin/manage/seo', ['seo' => []]);
        $this->assertSame($html, file_get_contents($root.'/index.html'));
    }

    public function test_teacher_cannot_edit_seo(): void
    {
        $t = User::factory()->create();
        $t->setRole('teacher');
        $t->save();
        $this->actingAs($t)->get('/admin/manage/seo')->assertForbidden();
    }
}
