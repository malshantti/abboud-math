<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\School;
use App\Models\SchoolSection;
use App\Models\Student;
use App\Models\User;
use App\Support\Schools;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/** Schools phase 1: isolation, PIN login + lockout, import, rotate code, logout+reset. */
class SchoolsTest extends TestCase
{
    use RefreshDatabase;

    private function school(string $slug): array
    {
        $s = School::create(['name' => 'مدرسة '.$slug, 'slug' => $slug, 'color' => '#336699', 'color2' => '#ffcc00', 'is_test' => true]);
        [$mgr] = Schools::createStaff($s, 'المدير', 'manager');
        [$t] = Schools::createStaff($s, 'المعلم', 'teacher');
        $sec = $s->sections()->create(['grade' => 4, 'name' => 'رابع أ', 'code' => SchoolSection::newCode()]);
        $sec2 = $s->sections()->create(['grade' => 5, 'name' => 'خامس ب', 'code' => SchoolSection::newCode()]);
        $sec->teachers()->attach($t->id, ['subjects' => 'math']);
        $kids = Schools::createStudents($sec, ['أحمد', 'سارة', 'ليلى']);

        return [$s, $mgr, $t, $sec, $sec2, $kids];
    }

    public function test_pages_render_and_child_pin_login_works(): void
    {
        [$s, $mgr, $t, $sec] = $this->school('alpha');
        $this->get('/s/alpha')->assertOk()->assertSee('مدرسة alpha')->assertDontSee('رابع أ')->assertSee('رمز الشعبة');
        $this->get('/s/alpha?c='.$sec->code)->assertOk()->assertSee($sec->code);
        $this->get('/s/alpha?c=ZZZZZZ')->assertOk()->assertSee('قديم');
        $this->getJson('/s/alpha/sections/'.$sec->id.'/names')->assertNotFound();
        $this->getJson('/s/alpha/sections/'.$sec->id.'/names?c=ZZZZZZ')->assertNotFound();
        $this->getJson('/s/alpha/sections/'.$sec->id.'/names?c='.strtolower($sec->code))->assertOk()->assertJsonCount(3, 'names');
        $kid = $sec->students()->first();
        $pin = Schools::plainPin($kid);
        $this->assertMatchesRegularExpression('/^\d{4}$/', $pin);
        $bad = $pin === '9999' ? '1111' : '9999';
        $this->postJson('/s/alpha/child', ['student' => $kid->id, 'pin' => $bad])->assertStatus(422);
        $this->assertGuest();
        $this->postJson('/s/alpha/child', ['student' => $kid->id, 'pin' => $pin])->assertOk();
        $this->assertAuthenticatedAs($kid->user);
        $this->assertTrue(ActivityLog::where('action', 'school.pin_fail')->exists());
        $this->assertTrue(ActivityLog::where('action', 'school.new_device')->exists());
    }

    public function test_picker_shows_short_names_and_tells_twins_apart(): void
    {
        $rows = collect([(object) ['id' => 1, 'name' => 'أحمد محمد علي'], (object) ['id' => 2, 'name' => 'أحمد محمود سالم'], (object) ['id' => 3, 'name' => 'سارة خالد يوسف'], (object) ['id' => 4, 'name' => 'منى']]);
        $this->assertSame(['أحمد محمد', 'أحمد محمود', 'سارة خ.', 'منى'], array_column(Schools::shortNames($rows), 'name'));
    }

    public function test_pin_lockout_after_five_failures(): void
    {
        [, , , $sec] = $this->school('beta');
        $kid = $sec->students()->first();
        $pin = Schools::plainPin($kid);
        $bad = $pin === '9999' ? '1111' : '9999';
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/s/beta/child', ['student' => $kid->id, 'pin' => $bad])->assertStatus(422);
        }
        $this->postJson('/s/beta/child', ['student' => $kid->id, 'pin' => $pin])->assertStatus(422);
        $this->assertGuest();
        $this->assertNotNull($kid->fresh()->pin_locked_until);
    }

    public function test_isolation_between_schools_and_teacher_sections(): void
    {
        [$a, $mgrA, $tA, $secA, $secA2] = $this->school('gamma');
        [$b, , , $secB] = $this->school('delta');
        $kidB = $secB->students()->first();
        // student of B cannot log in via A
        $this->postJson('/s/gamma/child', ['student' => $kidB->id, 'pin' => Schools::plainPin($kidB)])->assertStatus(422);
        $this->getJson('/s/gamma/sections/'.$secB->id.'/names?c='.$secB->code)->assertNotFound();

        $this->actingAs($mgrA);
        $this->get('/s/gamma/panel')->assertOk()->assertSee('رابع أ')->assertSee('خامس ب');
        $this->get('/s/gamma/panel/sections/'.$secB->id)->assertNotFound();
        $this->get('/s/delta/panel')->assertRedirect();
        $this->post('/s/gamma/panel/students/'.$kidB->id.'/pin')->assertNotFound();

        $this->actingAs($tA);
        $this->get('/s/gamma/panel')->assertOk()->assertSee('رابع أ')->assertDontSee('خامس ب');
        $this->get('/s/gamma/panel/sections/'.$secA->id)->assertOk()->assertSee('أحمد');
        $this->get('/s/gamma/panel/sections/'.$secA2->id)->assertNotFound();
        $this->get('/s/gamma/panel/sections/'.$secA->id.'/cards')->assertOk()->assertSee('سارة');
        $this->post('/s/gamma/panel/sections', ['grade' => 3, 'name' => 'x'])->assertForbidden();
        // staff never reach the admin panel
        $this->assertNotSame(200, $this->get('/admin/manage')->status());
    }

    public function test_import_paste_csv_xlsx_and_staff_login(): void
    {
        [$s, $mgr, $t, $sec] = $this->school('eps');
        $this->actingAs($mgr);
        $this->post('/s/eps/panel/sections/'.$sec->id.'/students', ['names' => "1. خالد\nسارة\nخالد\n\nمنى"])->assertRedirect();
        $this->assertSame(5, $sec->students()->count());
        $csv = UploadedFile::fake()->createWithContent('n.csv', "\xEF\xBB\xBFالاسم,الصف\nيوسف,4\nريم,4\n");
        $this->post('/s/eps/panel/sections/'.$sec->id.'/students', ['file' => $csv])->assertRedirect();
        $this->assertSame(7, $sec->students()->count());
        $zipPath = tempnam(sys_get_temp_dir(), 'x').'.xlsx';
        $z = new \ZipArchive; $z->open($zipPath, \ZipArchive::CREATE);
        $z->addFromString('xl/sharedStrings.xml', '<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>نور</t></si><si><t>هادي</t></si></sst>');
        $z->addFromString('xl/worksheets/sheet1.xml', '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c></row></sheetData></worksheet>');
        $z->close();
        $x = new UploadedFile($zipPath, 'n.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
        $this->post('/s/eps/panel/sections/'.$sec->id.'/students', ['file' => $x])->assertRedirect();
        $this->assertSame(9, $sec->students()->count());

        // one-form teacher creation shows credentials once
        $this->post('/s/eps/panel/teachers', ['name' => 'معلمة جديدة', 'sections' => [$sec->id], 'subjects' => ['math']])->assertSessionHas('credentials');
        $cred = session('credentials');
        auth()->logout();
        $this->post('/s/eps/staff', ['username' => $cred['username'], 'password' => $cred['password']])->assertRedirect(route('school.panel', $s));
    }

    public function test_rotate_code_and_logout_reset(): void
    {
        [$s, $mgr, $t, $sec] = $this->school('zeta');
        $old = $sec->code;
        $this->actingAs($t)->post('/s/zeta/panel/sections/'.$sec->id.'/code')->assertRedirect();
        $this->assertNotSame($old, $sec->fresh()->code);
        auth()->logout();
        $this->get('/s/zeta?c='.$old)->assertSee('قديم');

        $kid = $sec->students()->first();
        $pin = Schools::plainPin($kid);
        $this->postJson('/s/zeta/child', ['student' => $kid->id, 'pin' => $pin])->assertOk();
        $this->assertAuthenticatedAs($kid->user);
        $this->travel(2)->seconds();
        $kidSession = $this->app['session']->all();
        $this->flushSession();
        $this->withoutMiddleware(\App\Http\Middleware\SingleDevice::class);
        $this->actingAs($t)->post('/s/zeta/panel/students/'.$kid->id.'/kick')->assertSessionHas('status');
        $this->assertNotSame($pin, Schools::plainPin($kid->fresh()));
        $this->assertNotNull($kid->user->fresh()->school_logout_at);
        // the kid's old session is rejected
        auth()->forgetGuards();
        $this->withSession($kidSession);
        $this->actingAs($kid->user->fresh());
        $this->session(['school_login_at' => now()->subMinute()->getTimestamp()]);
        $this->get('/s/zeta');
        $this->assertGuest();
    }

    public function test_admin_creates_school_and_families_untouched(): void
    {
        $fam = User::factory()->create(['role' => 'parent']);
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/admin/manage/schools')->assertOk();
        $this->post('/admin/manage/schools', ['name' => 'مدرسة تجريبية', 'slug' => 'test-school', 'manager' => 'مدير', 'color' => '#336699', 'color2' => '#ffcc00', 'is_test' => 1])
            ->assertSessionHas('credentials');
        $this->assertTrue(School::where('slug', 'test-school')->value('is_test'));
        $this->get('/admin/manage/schools')->assertSee('تجريبية');
        $this->assertSame('parent', $fam->fresh()->role);
        $this->assertNull($fam->fresh()->school_id);
    }
}
