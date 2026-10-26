<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Support\Seo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SeoController extends Controller
{
    public function index(): View
    {
        $orig = json_decode(Setting::get('seo_originals'), true) ?: [];
        $rows = [];
        foreach (Seo::pages() as $path => $label) {
            $rows[$path] = ['label' => $label, 'url' => Seo::url($path), 'current' => $orig[$path] ?? Seo::read($path) ?? ['title' => '', 'description' => '']];
        }

        return view('manage.seo', ['rows' => $rows, 'over' => Seo::overrides(), 'writable' => Seo::writable()]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate(['seo' => ['array'], 'seo.*.title' => ['nullable', 'string', 'max:120'], 'seo.*.description' => ['nullable', 'string', 'max:320']], ['max' => 'النص أطول من الحد المسموح.']);
        $pages = Seo::pages();
        $out = [];
        foreach ((array) ($data['seo'] ?? []) as $path => $v) {
            $path = (string) $path === '_home' ? '' : (string) $path;
            if (! array_key_exists($path, $pages)) {
                continue;
            }
            $t = trim((string) ($v['title'] ?? ''));
            $d = trim(preg_replace('/\s+/u', ' ', (string) ($v['description'] ?? '')));
            if ($t !== '' || $d !== '') {
                $out[$path] = ['title' => $t, 'description' => $d];
            }
        }
        Setting::put(['seo_pages' => json_encode($out, JSON_UNESCAPED_UNICODE)]);
        ActivityLog::record('seo.settings');

        return $this->applied('حُفظت عناوين جوجل');
    }

    public function apply(): RedirectResponse
    {
        return $this->applied('أُعيد تطبيق العناوين');
    }

    private function applied(string $msg): RedirectResponse
    {
        [$n, $missing] = Seo::apply();
        $r = back()->with('status', $msg.' وكُتبت في '.\App\Support\Ar::num($n).' صفحة.');

        return $missing ? $r->with('mail_error', 'تعذّرت الكتابة في: '.implode('، ', array_map(fn ($p) => $p === '' ? 'الرئيسية' : $p, $missing))) : $r;
    }
}
