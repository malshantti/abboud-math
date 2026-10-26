<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Support\MediaLibrary as Lib;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class MediaController extends Controller
{
    public function index(Request $request): View
    {
        $index = Lib::index();

        return view('manage.media', [
            'folders' => Lib::folders($index),
            'total' => count($index),
            'map' => Lib::map(),
            'site' => rtrim((string) config('app.student_site_url'), '/').'/',
            'writable' => is_writable(Lib::root()) || is_writable(Lib::root().'/media'),
        ]);
    }

    /** JSON list for the library grid and the content-builder picker. */
    public function list(Request $request): JsonResponse
    {
        $q = mb_strtolower(trim((string) $request->query('q', '')));
        $type = $request->query('type');
        $folder = trim((string) $request->query('folder', ''), '/');
        $map = Lib::map();
        $rows = array_values(array_filter(Lib::index(), function ($i) use ($q, $type, $folder, $map) {
            if (in_array($type, ['image', 'audio'], true) && $i['t'] !== $type) {
                return false;
            }
            if ($folder === '_replaced') {
                return isset($map[$i['p']]);
            }
            if ($folder !== '' && ! str_starts_with($i['p'], $folder.'/')) {
                return false;
            }

            return $q === '' || str_contains(mb_strtolower($i['p']), $q);
        }));
        $per = min(200, max(12, (int) $request->query('per', 60)));
        $page = max(1, (int) $request->query('page', 1));
        $items = array_map(fn ($i) => $i + ['r' => $map[$i['p']] ?? null], array_slice($rows, ($page - 1) * $per, $per));

        return response()->json(['total' => count($rows), 'page' => $page, 'per' => $per, 'items' => $items,
            'site' => rtrim((string) config('app.student_site_url'), '/').'/']);
    }

    public function usage(Request $request): JsonResponse
    {
        $rel = Lib::safe((string) $request->query('path'));
        abort_unless($rel, 404);

        return response()->json(['path' => $rel, 'used' => Lib::usages($rel), 'replacement' => Lib::map()[$rel] ?? null]);
    }

    public function upload(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:16384', 'mimes:'.implode(',', Lib::UPLOAD)]],
            ['file.mimes' => 'الأنواع المسموحة: صور PNG/JPG/WebP/GIF وأصوات MP3/OGG/WAV/M4A.', 'file.max' => 'الحد الأقصى ١٦ ميغابايت.']);
        $rel = Lib::store($request->file('file'));
        ActivityLog::record('media.upload', $rel);

        return $request->expectsJson() ? response()->json(['path' => $rel])
            : back()->with('status', 'رُفع الملف: '.$rel);
    }

    /** Replace = upload a new copy and point the original URL at it (original file is kept). */
    public function replace(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate(['path' => ['required', 'string'], 'file' => ['required', 'file', 'max:16384', 'mimes:'.implode(',', Lib::UPLOAD)]],
            ['file.mimes' => 'الأنواع المسموحة: صور PNG/JPG/WebP/GIF وأصوات MP3/OGG/WAV/M4A.', 'file.max' => 'الحد الأقصى ١٦ ميغابايت.']);
        $rel = Lib::safe($request->input('path'));
        abort_unless($rel, 404);
        $new = $request->file('file');
        if (Lib::type($rel) !== Lib::type('x.'.strtolower($new->getClientOriginalExtension()))) {
            return $this->fail($request, 'يجب أن يكون البديل من النوع نفسه (صورة بصورة، وصوت بصوت).');
        }
        $to = Lib::store($new, basename($rel));
        $map = Lib::map();
        $map[$rel] = $to;
        Lib::saveMap($map);
        ActivityLog::record('media.replace', $rel, $to);

        return $request->expectsJson() ? response()->json(['path' => $rel, 'replacement' => $to])
            : back()->with('status', 'استُبدل الملف. يظهر البديل للطلاب عند فتح الصفحة التالي.');
    }

    public function restore(Request $request): JsonResponse|RedirectResponse
    {
        $rel = (string) $request->input('path');
        $map = Lib::map();
        abort_unless(isset($map[$rel]), 404);
        unset($map[$rel]);
        Lib::saveMap($map);
        ActivityLog::record('media.restore', $rel);

        return $request->expectsJson() ? response()->json(['path' => $rel]) : back()->with('status', 'أُعيد الملف الأصلي.');
    }

    public function refresh(Request $request): RedirectResponse
    {
        Lib::index(true);
        \Illuminate\Support\Facades\Cache::forget('media_text_files');

        return back()->with('status', 'حُدّث فهرس الوسائط.');
    }

    private function fail(Request $request, string $msg): JsonResponse|RedirectResponse
    {
        return $request->expectsJson() ? response()->json(['message' => $msg], 422) : back()->with('mail_error', $msg);
    }
}
