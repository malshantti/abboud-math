<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\Finder\Finder;
use Tests\TestCase;

/**
 * Production runs PHP 8.2. Syntax from PHP 8.3+/8.4 (e.g. `new Foo()->bar()` without
 * wrapping parentheses, typed class constants) parses fine locally but makes the whole
 * controller fail to load on the server, turning every route it serves into HTTP 500.
 */
class Php82CompatibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_app_code_avoids_php83_plus_syntax(): void
    {
        $patterns = [
            'new without parentheses before ->' => '/\bnew\s+[\\\\\w]+\s*(\((?:[^()]|(?1))*\))?\s*(->|\?->|::)/',
            'typed class constant' => '/\bconst\s+(?:\??[\\\\\w|]+)\s+[A-Z_][A-Z0-9_]*\s*=/',
            'PHP 8.3+ functions' => '/\b(json_validate|mb_str_pad|str_increment|str_decrement|array_find|array_any|array_all|mb_trim)\s*\(/',
            'asymmetric visibility / Override attr' => '/\b(public|protected|private)\(set\)|#\[\\\\?Override\]/',
        ];
        $offenders = [];
        foreach ((new Finder)->files()->name('*.php')->in([base_path('app'), base_path('routes'), base_path('config'), base_path('database'), base_path('bootstrap')])->exclude('cache') as $file) {
            $code = $file->getContents();
            foreach ($patterns as $label => $re) {
                if (preg_match($re, $code, $m)) {
                    $offenders[] = $file->getRelativePathname().": {$label}: ".trim($m[0]);
                }
            }
        }
        $this->assertSame([], $offenders, "PHP 8.2-incompatible syntax:\n".implode("\n", $offenders));
    }

    public function test_guest_is_redirected_from_every_manage_page(): void
    {
        foreach (['/admin/manage', '/admin/manage/students', '/admin/manage/users', '/admin/manage/subscriptions', '/admin/manage/settings', '/admin/manage/activity'] as $url) {
            $this->get($url)->assertRedirect('/login');
        }
    }

    public function test_admin_can_open_every_manage_page(): void
    {
        $admin = User::factory()->create();
        $admin->setRole('admin');
        $admin->save();
        $parent = User::factory()->create();
        $student = $parent->students()->create(['name' => 'سامي', 'grade' => 6]);
        $this->actingAs($admin);
        foreach (['/admin', '/admin/manage', '/admin/manage/students', "/admin/manage/students/{$student->id}", '/admin/manage/users', "/admin/manage/users/{$parent->id}", '/admin/manage/subscriptions', '/admin/manage/settings', '/admin/manage/activity', '/admin/manage/export/users', '/admin/manage/export/subscriptions'] as $url) {
            $this->get($url)->assertOk();
        }
    }
}
