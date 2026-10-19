<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthoringDocument;
use App\Models\User;
use App\Services\AuthoringValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class WorkspaceController extends Controller
{
    public function summary(): JsonResponse
    {
        $counts = ['unit' => 0, 'lesson' => 0, 'adventure' => 0, 'lab' => 0, 'questions' => 0];
        foreach (AuthoringDocument::select('counts')->cursor() as $document) {
            foreach ($counts as $key => $value) {
                $counts[$key] += $document->counts[$key] ?? 0;
            }
        }

        return response()->json([
            'documents' => AuthoringDocument::count(), 'quizzes' => AuthoringDocument::where('kind', 'quiz')->count(),
            'trash' => AuthoringDocument::onlyTrashed()->count(), 'counts' => $counts,
            'admins' => User::where('is_admin', true)->count(),
            'accounts' => User::where('is_admin', true)->orderBy('id')->limit(20)->get(['id', 'name', 'email', 'created_at']),
            'activities' => DB::table('admin_activities')->leftJoin('users', 'users.id', '=', 'admin_activities.user_id')->orderByDesc('admin_activities.id')->limit(8)->get(['admin_activities.action', 'admin_activities.title', 'admin_activities.created_at', 'users.name']),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $input = $request->validate(['kind' => ['nullable', Rule::in(['content', 'quiz'])], 'search' => ['nullable', 'string', 'max:160'], 'trash' => ['nullable', 'boolean'], 'page' => ['nullable', 'integer', 'min:1']]);
        $query = AuthoringDocument::query()->with('editor:id,name')->select(['id', 'kind', 'title', 'counts', 'revision', 'updated_at', 'updated_by', 'deleted_at']);
        if ($request->boolean('trash')) {
            $query->onlyTrashed();
        }
        if (! empty($input['kind'])) {
            $query->where('kind', $input['kind']);
        }
        if (! empty($input['search'])) {
            $query->whereRaw("title LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $input['search']).'%']);
        }

        return response()->json($query->orderByDesc('updated_at')->orderByDesc('id')->paginate(12));
    }

    public function show(AuthoringDocument $document): JsonResponse
    {
        return response()->json($document->only(['id', 'kind', 'title', 'document', 'counts', 'revision', 'updated_at']));
    }

    public function store(Request $request, AuthoringValidator $validator): JsonResponse
    {
        $input = $request->validate(['kind' => ['required', Rule::in(['content', 'quiz'])], 'title' => ['required', 'string', 'max:160'], 'document' => ['required', 'array']]);
        $counts = $validator->validate($input['kind'], $input['document']);
        $document = DB::transaction(function () use ($input, $counts, $request) {
            $document = AuthoringDocument::create([...$input, 'counts' => $counts, 'updated_by' => $request->user()->id]);
            $this->activity($request, $document, 'created');

            return $document;
        });

        return response()->json($document->only(['id', 'kind', 'title', 'revision', 'updated_at']), 201);
    }

    public function update(Request $request, int $document, AuthoringValidator $validator): JsonResponse
    {
        $input = $request->validate(['title' => ['required', 'string', 'max:160'], 'document' => ['required', 'array'], 'revision' => ['required', 'integer', 'min:1']]);
        $saved = DB::transaction(function () use ($input, $request, $document, $validator) {
            $record = AuthoringDocument::whereKey($document)->lockForUpdate()->firstOrFail();
            $this->checkRevision($record, $input['revision']);
            $counts = $validator->validate($record->kind, $input['document']);
            $record->fill(['title' => $input['title'], 'document' => $input['document'], 'counts' => $counts, 'revision' => $record->revision + 1, 'updated_by' => $request->user()->id])->save();
            $this->activity($request, $record, 'updated');

            return $record;
        });

        return response()->json($saved->only(['id', 'kind', 'title', 'revision', 'updated_at']));
    }

    public function trash(Request $request, int $document): JsonResponse
    {
        return $this->changeTrash($request, $document, false);
    }

    public function restore(Request $request, int $document): JsonResponse
    {
        return $this->changeTrash($request, $document, true);
    }

    private function changeTrash(Request $request, int $id, bool $restore): JsonResponse
    {
        $input = $request->validate(['revision' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($request, $id, $restore, $input) {
            $record = ($restore ? AuthoringDocument::onlyTrashed() : AuthoringDocument::query())->whereKey($id)->lockForUpdate()->firstOrFail();
            $this->checkRevision($record, $input['revision']);
            $record->revision++;
            $record->updated_by = $request->user()->id;
            if ($restore) {
                $record->restore();
            } else {
                $record->save();
                $record->delete();
            }
            $this->activity($request, $record, $restore ? 'restored' : 'trashed');
        });

        return response()->json(['ok' => true]);
    }

    private function checkRevision(AuthoringDocument $document, int $revision): void
    {
        abort_if($document->revision !== $revision, 409, 'حُفظت نسخة أحدث من هذه المسودة. افتح النسخة الحديثة من المكتبة قبل التعديل؛ تغييراتك الحالية لم تُستبدل.');
    }

    private function activity(Request $request, AuthoringDocument $document, string $action): void
    {
        DB::table('admin_activities')->insert(['user_id' => $request->user()->id, 'document_id' => $document->id, 'action' => $action, 'title' => $document->title, 'created_at' => now()]);
    }
}
