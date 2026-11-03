<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;

/** Quiz images: resized to ≤1200px WebP, stored per school (storage/app/private/school-media/{school_id}). */
class SchoolMedia
{
    public const MAX = 1200;

    public static function dir(int $schoolId): string
    {
        return storage_path('app/private/school-media/'.$schoolId);
    }

    public static function valid(int $schoolId, $name): bool
    {
        return is_string($name) && preg_match('/^[a-f0-9]{32}\.webp$/', $name) && is_file(self::dir($schoolId).'/'.$name);
    }

    public static function path(int $schoolId, string $name): ?string
    {
        return self::valid($schoolId, $name) ? self::dir($schoolId).'/'.$name : null;
    }

    /** Returns the stored file name, or an Arabic error message. */
    public static function store(int $schoolId, UploadedFile $f): array
    {
        $info = @getimagesize($f->getRealPath());
        if (! $info || ! in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) {
            return ['error' => 'الملف ليس صورة مدعومة (JPG أو PNG أو WebP أو GIF).'];
        }
        [$w, $h] = $info;
        if ($w < 8 || $h < 8 || $w * $h > 40_000_000) {
            return ['error' => 'أبعاد الصورة غير مناسبة.'];
        }
        $src = @imagecreatefromstring((string) file_get_contents($f->getRealPath()));
        if (! $src) {
            return ['error' => 'تعذّرت قراءة الصورة.'];
        }
        $k = min(1, self::MAX / max($w, $h));
        $nw = max(1, (int) round($w * $k));
        $nh = max(1, (int) round($h * $k));
        $dst = imagecreatetruecolor($nw, $nh);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagefill($dst, 0, 0, imagecolorallocatealpha($dst, 255, 255, 255, 127));
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        @mkdir(self::dir($schoolId), 0755, true);
        $name = bin2hex(random_bytes(16)).'.webp';
        $ok = imagewebp($dst, self::dir($schoolId).'/'.$name, 80);
        imagedestroy($src);
        imagedestroy($dst);

        return $ok ? ['name' => $name, 'w' => $nw, 'h' => $nh] : ['error' => 'تعذّر حفظ الصورة.'];
    }
}
