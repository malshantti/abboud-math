<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthoringDocument;
use App\Models\ContentPublication;
use App\Services\AuthoringValidator;
use App\Services\PublishReadiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/** نشر مسودات منشئ المحتوى للطلاب، وإلغاء النشر، والرجوع إلى نسخة منشورة سابقة. */
class PublishController extends Controller
{
    public const CACHE = 'public-content-v1';

    public function index(int $document): JsonResponse
    {
        $doc = AuthoringDocument::withTrashed()->findOrFail($document);
        $rows = ContentPublication::where('document_id', $doc->id)->with('publisher:id,name')->orderByDesc('version')
            ->get(['id', 'document_id', 'version', 'revision', 'title', 'scope', 'active', 'published_by', 'created_at', 'updated_at']);

        return response()->json(['document' => $doc->only(['id', 'title', 'revision']), 'publications' => $rows]);
    }

    public function publish(Request $request, int $document, AuthoringValidator $validator, PublishReadiness $readiness): JsonResponse
    {
        $input = $request->validate(['revision' => ['required', 'integer', 'min:1']]);
        $pub = DB::transaction(function () use ($request, $document, $input, $validator, $readiness) {
            $doc = AuthoringDocument::whereKey($document)->lockForUpdate()->firstOrFail();
            abort_if($doc->revision !== $input['revision'], 409, 'حُفظت نسخة أحدث من هذه المسودة. احفظ أو افتح أحدث نسخة قبل النشر.');
            $validator->validate($doc->kind, $doc->document);
            $scope = $readiness->check($doc->kind, $doc->document);
            ContentPublication::where('document_id', $doc->id)->update(['active' => false]);
            $pub = ContentPublication::create([
                'document_id' => $doc->id, 'kind' => $doc->kind, 'version' => (int) ContentPublication::where('document_id', $doc->id)->max('version') + 1,
                'revision' => $doc->revision, 'title' => $doc->title, 'payload' => $doc->document, 'scope' => $scope, 'active' => true, 'published_by' => $request->user()->id,
            ]);
            $this->activity($request, $doc, 'published');

            return $pub;
        });
        Cache::forget(self::CACHE);

        return response()->json($pub->only(['id', 'version', 'revision', 'active', 'scope', 'created_at']), 201);
    }

    public function unpublish(Request $request, int $document): JsonResponse
    {
        DB::transaction(function () use ($request, $document) {
            $doc = AuthoringDocument::withTrashed()->findOrFail($document);
            ContentPublication::where('document_id', $doc->id)->update(['active' => false]);
            $this->activity($request, $doc, 'unpublished');
        });
        Cache::forget(self::CACHE);

        return response()->json(['ok' => true]);
    }

    public function activate(Request $request, int $publication): JsonResponse
    {
        DB::transaction(function () use ($request, $publication) {
            $pub = ContentPublication::whereKey($publication)->lockForUpdate()->firstOrFail();
            $doc = AuthoringDocument::findOrFail($pub->document_id);
            ContentPublication::where('document_id', $pub->document_id)->update(['active' => false]);
            $pub->forceFill(['active' => true])->save();
            $this->activity($request, $doc, 'rolledback');
        });
        Cache::forget(self::CACHE);

        return response()->json(['ok' => true]);
    }

    public function public(Request $request): JsonResponse
    {
        $input = $request->validate(['grade' => ['required', 'integer', 'in:6,8'], 'subject' => ['required', 'string', 'in:math,arabic,english,science']]);

        return response()->json(self::forSubject((int) $input['grade'], $input['subject']))->header('Cache-Control', 'public, max-age=60');
    }

    /** المحتوى المنشور لصف ومادة: للموقع العام (دون مفتاح المعلّم الخاص إلا ما يلزم للتصحيح في المتصفح). */
    public static function forSubject(int $grade, string $subject): array
    {
        $all = Cache::remember(self::CACHE, 300, fn () => ContentPublication::where('active', true)->orderBy('document_id')
            ->get(['id', 'document_id', 'kind', 'version', 'title', 'payload', 'scope', 'updated_at'])->toArray());
        $items = [];
        $quizzes = [];
        $stamp = [];
        foreach ($all as $pub) {
            $in = false;
            foreach ($pub['scope'] as [$g, $s]) {
                $in = $in || ($g === $grade && $s === $subject);
            }
            if (! $in) {
                continue;
            }
            $stamp[] = $pub['id'].':'.$pub['version'];
            if ($pub['kind'] === 'quiz') {
                $quizzes[] = ['id' => 'q'.$pub['document_id'], 'title' => $pub['payload']['metadata']['title'] ?: $pub['title'], 'durationMinutes' => $pub['payload']['metadata']['durationMinutes'] ?? null, 'questions' => $pub['payload']['questions']];
            } else {
                foreach ($pub['payload']['items'] as $item) {
                    if ($item['grade'] === $grade && $item['subject'] === $subject) {
                        $items[] = ['doc' => $pub['document_id']] + $item;
                    }
                }
            }
        }
        usort($items, fn ($a, $b) => [$a['term'], $a['order']] <=> [$b['term'], $b['order']]);

        return ['v' => substr(sha1(implode(',', $stamp)), 0, 12), 'items' => $items, 'quizzes' => $quizzes];
    }

    private function activity(Request $request, AuthoringDocument $doc, string $action): void
    {
        DB::table('admin_activities')->insert(['user_id' => $request->user()->id, 'document_id' => $doc->id, 'action' => $action, 'title' => $doc->title, 'created_at' => now()]);
    }
}
