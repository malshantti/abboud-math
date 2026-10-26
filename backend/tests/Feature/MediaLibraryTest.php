<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    private string $root;

    protected function setUp(): void
    {
        parent::setUp();
        $this->root = sys_get_temp_dir().'/bk-media-'.uniqid();
        mkdir($this->root.'/g6/math/img', 0777, true);
        mkdir($this->root.'/g1/math/audio', 0777, true);
        file_put_contents($this->root.'/g6/math/img/rank-1.webp', 'RIFFxxxxWEBP');
        file_put_contents($this->root.'/g1/math/audio/one.mp3', 'ID3');
        file_put_contents($this->root.'/g6/math/app.js', 'const a="img/rank-1.webp";');
        config(['app.static_root' => $this->root]);
        Cache::flush();
    }

    private function user(string $role): User
    {
        $u = User::factory()->create();
        $u->setRole($role);
        $u->save();

        return $u;
    }

    public function test_admin_browses_filters_and_sees_usage(): void
    {
        $a = $this->user('admin');
        $this->actingAs($a)->get('/admin/manage/media')->assertOk()->assertSee('مكتبة الوسائط')->assertSee('g6/math');
        $this->getJson('/admin/manage/media/list')->assertOk()->assertJsonPath('total', 2);
        $this->getJson('/admin/manage/media/list?type=audio')->assertJsonPath('total', 1)->assertJsonPath('items.0.p', 'g1/math/audio/one.mp3');
        $this->getJson('/admin/manage/media/list?q=rank&folder=g6/math')->assertJsonPath('total', 1);
        $this->getJson('/admin/manage/media/usage?path=g6/math/img/rank-1.webp')->assertOk()->assertJsonPath('used.0.file', 'g6/math/app.js');
        $this->getJson('/admin/manage/media/usage?path=../.env')->assertNotFound();
    }

    public function test_upload_replace_and_restore(): void
    {
        $this->actingAs($this->user('admin'));
        $this->post('/admin/manage/media', ['file' => UploadedFile::fake()->createWithContent('New Pic.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))])->assertRedirect();
        $up = glob($this->root.'/media/u/new-pic-*.png');
        $this->assertCount(1, $up);

        $this->post('/admin/manage/media', ['file' => UploadedFile::fake()->create('x.svg', 1, 'image/svg+xml')])->assertSessionHasErrors('file');
        $this->post('/admin/manage/media/replace', ['path' => 'g6/math/img/rank-1.webp', 'file' => UploadedFile::fake()->createWithContent('a.mp3', 'ID3'.str_repeat("\0", 64))])->assertSessionHas('mail_error');

        $this->post('/admin/manage/media/replace', ['path' => 'g6/math/img/rank-1.webp', 'file' => UploadedFile::fake()->createWithContent('b.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))])->assertRedirect();
        $map = json_decode(Setting::get('media_map'), true);
        $this->assertStringStartsWith('media/u/rank-1-', $map['g6/math/img/rank-1.webp']);
        $this->assertFileExists($this->root.'/g6/math/img/rank-1.webp');
        $this->assertSame($map['g6/math/img/rank-1.webp'], $this->getJson('/api/site')->assertOk()->json('media')['g6/math/img/rank-1.webp']);

        $this->post('/admin/manage/media/restore', ['path' => 'g6/math/img/rank-1.webp'])->assertRedirect();
        $this->assertSame('', Setting::get('media_map'));
        $this->getJson('/api/site')->assertOk()->assertJsonPath('media', []);
    }

    public function test_teacher_and_parent_are_blocked(): void
    {
        Setting::put(['single_device' => '0']);
        $this->actingAs($this->user('teacher'))->get('/admin/manage/media')->assertForbidden();
        $this->actingAs($this->user('parent'))->getJson('/admin/manage/media/list')->assertForbidden();
    }
}
