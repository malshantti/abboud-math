<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

/**
 * مكتبة الوسائط: صور الموقع الثابت وأصواته.
 * - الفهرس: مسح لمجلدات الصفوف و assets و media (مخزّن ١٠ دقائق).
 * - الرفع: إلى media/u/ باسم فريد (لا تتعارض مع ذاكرة Cloudflare/المتصفح).
 * - الاستبدال: لا يُمسّ الملف الأصلي؛ يُرفع البديل باسم جديد ويُسجَّل في `media_map`
 *   (الأصل ← البديل). تطبّقه sync.js في كل الصفحات، والإلغاء يعيد الأصل فورًا.
 */
class MediaLibrary
{
    public const IMAGE = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'];

    public const AUDIO = ['mp3', 'ogg', 'wav', 'm4a', 'opus', 'aac'];

    /** Upload types (no SVG: it could carry script on the site origin). */
    public const UPLOAD = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp3', 'ogg', 'wav', 'm4a'];

    public const DIRS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'assets', 'media'];

    public const TEXT = ['js', 'html', 'css', 'json', 'webmanifest'];

    public static function root(): string
    {
        return Seo::root();
    }

    public static function type(string $path): ?string
    {
        $e = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return in_array($e, self::IMAGE, true) ? 'image' : (in_array($e, self::AUDIO, true) ? 'audio' : null);
    }

    /** @return list<array{p:string,t:string,s:int,m:int}> */
    public static function index(bool $fresh = false): array
    {
        if ($fresh) {
            Cache::forget('media_index');
        }

        $hit = Cache::get('media_index');
        if (is_array($hit) && $hit) {
            return $hit;
        }
        $out = (function () {
            $root = self::root();
            $out = [];
            foreach (self::DIRS as $d) {
                if (! is_dir("$root/$d")) {
                    continue;
                }
                $it = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator("$root/$d", \FilesystemIterator::SKIP_DOTS));
                foreach ($it as $f) {
                    if (! $f->isFile()) {
                        continue;
                    }
                    $rel = substr($f->getPathname(), strlen($root) + 1);
                    if (str_contains($rel, '/.') || str_starts_with($rel, 'media/.')) {
                        continue;
                    }
                    if ($t = self::type($rel)) {
                        $out[] = ['p' => str_replace('\\', '/', $rel), 't' => $t, 's' => $f->getSize(), 'm' => $f->getMTime()];
                    }
                }
            }
            usort($out, fn ($a, $b) => strcmp($a['p'], $b['p']));

            return $out;
        })();
        if ($out) {
            Cache::put('media_index', $out, 600);
        }

        return $out;
    }

    /** Folder filter options: g6/math, assets, media... */
    public static function folders(array $index): array
    {
        $f = [];
        foreach ($index as $i) {
            $parts = explode('/', $i['p']);
            $k = preg_match('/^g\d$/', $parts[0]) && count($parts) > 2 ? $parts[0].'/'.$parts[1] : $parts[0];
            $f[$k] = ($f[$k] ?? 0) + 1;
        }
        ksort($f, SORT_NATURAL);

        return $f;
    }

    public static function safe(string $rel): ?string
    {
        $rel = ltrim(str_replace('\\', '/', $rel), '/');
        if ($rel === '' || str_contains($rel, '..') || str_contains($rel, "\0") || ! self::type($rel)) {
            return null;
        }
        $top = explode('/', $rel)[0];
        if (! in_array($top, self::DIRS, true)) {
            return null;
        }
        $full = self::root().'/'.$rel;

        return is_file($full) ? $rel : null;
    }

    /** @return array<string,string> original => replacement (both relative to site root) */
    public static function map(): array
    {
        $m = json_decode((string) Setting::get('media_map'), true);

        return is_array($m) ? array_filter($m, 'is_string') : [];
    }

    public static function saveMap(array $m): void
    {
        ksort($m);
        Setting::put(['media_map' => $m ? json_encode($m, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : '']);
    }

    /** Store an upload under media/u/ with a unique, cache-safe name. Returns relative path. */
    public static function store(UploadedFile $file, ?string $hint = null): string
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $base = $hint ? pathinfo($hint, PATHINFO_FILENAME) : pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $base = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($base)), '-') ?: 'file';
        $base = substr($base, 0, 40);
        $hash = substr(sha1_file($file->getRealPath()), 0, 10);
        $dir = self::root().'/media/u';
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $name = "$base-$hash.$ext";
        $file->move($dir, $name);
        @chmod("$dir/$name", 0644);
        self::index(true);

        return "media/u/$name";
    }

    /** Text files (js/html/css/json) that mention the file name. */
    public static function usages(string $rel, int $limit = 40): array
    {
        $name = basename($rel);
        $root = self::root();
        $hits = [];
        foreach (self::textFiles() as $t) {
            $s = @file_get_contents("$root/$t");
            if ($s === false || ! str_contains($s, $name)) {
                continue;
            }
            $hits[] = ['file' => $t, 'count' => substr_count($s, $name)];
            if (count($hits) >= $limit) {
                break;
            }
        }

        return $hits;
    }

    public static function textFiles(): array
    {
        return Cache::remember('media_text_files', 600, function () {
            $root = self::root();
            $out = [];
            foreach (glob("$root/*.{js,html,css,json}", GLOB_BRACE) ?: [] as $f) {
                $out[] = basename($f);
            }
            foreach (self::DIRS as $d) {
                if (! is_dir("$root/$d")) {
                    continue;
                }
                $it = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator("$root/$d", \FilesystemIterator::SKIP_DOTS));
                foreach ($it as $f) {
                    if ($f->isFile() && in_array(strtolower($f->getExtension()), self::TEXT, true) && $f->getSize() < 8_000_000) {
                        $out[] = str_replace('\\', '/', substr($f->getPathname(), strlen($root) + 1));
                    }
                }
            }

            return $out;
        });
    }
}
