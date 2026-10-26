<?php

namespace App\Support;

use App\Models\Setting;

/**
 * Per-page SEO (title + description) for the static site. Overrides are stored in the
 * `seo_pages` setting and written straight into the static index.html files (server-side,
 * so crawlers see them without JavaScript). The original tags are remembered in
 * `seo_originals`, so clearing a field restores the shipped text.
 */
class Seo
{
    /** @return array<string, string> path ('' = home, 'g6/math') => Arabic label */
    public static function pages(): array
    {
        $out = ['' => 'الصفحة الرئيسية'];
        foreach (Ar::SUBJECTS as $code => [$g, $subj]) {
            $out[str_replace('-', '/', $code)] = $subj.' — '.Ar::grade($g);
        }

        return $out;
    }

    public static function root(): string
    {
        return rtrim((string) (config('app.static_root') ?: dirname(base_path()).'/public_html/bustankids.com'), '/');
    }

    public static function file(string $path): string
    {
        return self::root().'/'.($path === '' ? '' : $path.'/').'index.html';
    }

    public static function url(string $path): string
    {
        return 'https://bustankids.com/'.($path === '' ? '' : $path.'/');
    }

    /** @return array<string, array{title:string,description:string}> */
    public static function overrides(): array
    {
        $v = json_decode(Setting::get('seo_pages'), true);

        return is_array($v) ? array_filter($v, 'is_array') : [];
    }

    /** @return array{title:string,description:string}|null tags currently in the file */
    public static function read(string $path): ?array
    {
        $f = self::file($path);
        if (! is_file($f)) {
            return null;
        }
        $h = (string) file_get_contents($f);
        $title = preg_match('~<title>(.*?)</title>~su', $h, $m) ? html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8') : '';
        $desc = preg_match('~<meta\s+name="description"\s+content="([^"]*)"~u', $h, $m) ? html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8') : '';

        return ['title' => $title, 'description' => $desc];
    }

    public static function writable(): bool
    {
        return is_file(self::file('')) && is_writable(self::file(''));
    }

    /** Rewrite title/description/og/twitter tags in one HTML string. */
    public static function rewrite(string $html, string $title, string $desc): string
    {
        $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $d = htmlspecialchars($desc, ENT_QUOTES, 'UTF-8');
        $html = preg_replace('~<title>.*?</title>~su', '<title>'.$t.'</title>', $html, 1);
        $html = preg_replace('~(<meta\s+name="description"\s+content=")[^"]*(")~u', '${1}'.$d.'$2', $html);
        $html = preg_replace('~(<meta\s+(?:property|name)="(?:og|twitter):title"\s+content=")[^"]*(")~u', '${1}'.$t.'$2', $html);
        $html = preg_replace('~(<meta\s+(?:property|name)="(?:og|twitter):description"\s+content=")[^"]*(")~u', '${1}'.$d.'$2', $html);

        return $html;
    }

    /** Apply every stored override (blank = original text). Returns [written, missing]. */
    public static function apply(): array
    {
        $over = self::overrides();
        $orig = json_decode(Setting::get('seo_originals'), true);
        $orig = is_array($orig) ? $orig : [];
        $written = 0;
        $missing = [];
        foreach (array_keys(self::pages()) as $path) {
            $cur = self::read($path);
            if ($cur === null) {
                $missing[] = $path;

                continue;
            }
            $orig[$path] ??= $cur;
            $o = $over[$path] ?? [];
            $title = trim((string) ($o['title'] ?? '')) ?: $orig[$path]['title'];
            $desc = trim((string) ($o['description'] ?? '')) ?: $orig[$path]['description'];
            if ($title === $cur['title'] && $desc === $cur['description']) {
                continue;
            }
            $f = self::file($path);
            $html = self::rewrite((string) file_get_contents($f), $title, $desc);
            if (@file_put_contents($f.'.tmp', $html) !== false && @rename($f.'.tmp', $f)) {
                $written++;
            } else {
                $missing[] = $path;
            }
        }
        Setting::put(['seo_originals' => json_encode($orig, JSON_UNESCAPED_UNICODE)]);

        return [$written, $missing];
    }
}
