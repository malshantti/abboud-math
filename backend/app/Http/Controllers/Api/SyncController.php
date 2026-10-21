<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\Student;
use App\Support\Access;
use App\Support\Ar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Progress sync for the static site (same origin, session cookie + CSRF header).
 * Conflict rule: per key, the newest client timestamp wins.
 */
class SyncController extends Controller
{
    private const MAX_VALUE = 1_000_000;

    public function site(): JsonResponse
    {
        return response()->json(Setting::publicData())->header('Cache-Control', 'public, max-age=60');
    }

    public function session(Request $request): JsonResponse
    {
        $user = $request->user();
        $base = ['site' => Setting::publicData(), 'csrf' => csrf_token(), 'urls' => [
            'login' => route('account.login'), 'register' => route('account.register'), 'account' => route('account.home'), 'subscribe' => route('account.subscribe'),
        ]];
        if (! $user || $user->isDisabled()) {
            return response()->json($base + ['authenticated' => false]);
        }
        $access = Access::state($user);

        return response()->json($base + [
            'authenticated' => true,
            'user' => ['name' => $user->name, 'email' => $user->email],
            'access' => ['allowed' => $access['access'], 'kind' => $access['kind'], 'ends_at' => $access['ends_at']?->toIso8601String(), 'subjects' => $access['subjects']],
            'students' => $user->students()->orderBy('id')->get()->map->toApi(),
        ]);
    }

    private function own(Request $request, Student $student): void
    {
        abort_unless($student->user_id === $request->user()->id, 404);
    }

    public function storeStudent(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:24'], 'grade' => ['nullable', Rule::in(array_keys(Ar::GRADES))],
            'avatar' => ['nullable', 'string', 'max:20'], 'local_id' => ['nullable', 'string', 'max:40', 'regex:/^p\w+$/'],
        ]);
        $user = $request->user();
        if (! empty($data['local_id']) && ($existing = $user->students()->where('local_id', $data['local_id'])->first())) {
            return response()->json(['student' => $existing->toApi()]);
        }
        abort_if($user->students()->count() >= 12, 422, 'too many students');
        $s = $user->students()->create(['name' => trim($data['name']), 'grade' => $data['grade'] ?? null, 'avatar' => $data['avatar'] ?? 'idle', 'local_id' => $data['local_id'] ?? null]);
        ActivityLog::record('student.create', $s->name, 'من الموقع');

        return response()->json(['student' => $s->toApi()], 201);
    }

    public function show(Request $request, Student $student): JsonResponse
    {
        $this->own($request, $student);

        return response()->json(['student' => $student->toApi(), 'items' => $this->items($student)]);
    }

    private function items(Student $student): array
    {
        $out = [];
        foreach ($student->progress()->get() as $p) {
            $out[$p->key] = ['value' => $p->value, 'updated' => $p->client_updated_at];
        }

        return $out;
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $this->own($request, $student);

        return response()->json(['student' => $student->toApi(), 'items' => $this->merge($request, $student), 'saved' => true]);
    }

    public function import(Request $request, Student $student): JsonResponse
    {
        $this->own($request, $student);
        $items = $this->merge($request, $student);
        ActivityLog::record('progress.import', $student->name, Ar::num(count($request->input('items', []))).' مفتاح');

        return response()->json(['student' => $student->toApi(), 'items' => $items, 'imported' => true]);
    }

    private function merge(Request $request, Student $student): array
    {
        $request->validate(['items' => ['present', 'array', 'max:40']]);
        $items = $request->input('items', []);
        DB::transaction(function () use ($items, $student) {
            foreach ($items as $key => $item) {
                if (! in_array($key, Ar::SYNC_KEYS, true) || ! is_array($item)) {
                    continue;
                }
                $value = $item['value'] ?? null;
                $updated = (int) ($item['updated'] ?? 0);
                if (($value !== null && ! is_string($value)) || strlen((string) $value) > self::MAX_VALUE || $updated <= 0) {
                    continue;
                }
                $updated = min($updated, (int) (microtime(true) * 1000) + 60_000);
                $row = $student->progress()->where('key', $key)->lockForUpdate()->first();
                if (! $row) {
                    $student->progress()->create(['key' => $key, 'value' => $value, 'client_updated_at' => $updated]);
                } elseif ($updated > $row->client_updated_at) {
                    $row->update(['value' => $value, 'client_updated_at' => $updated]);
                }
                if ($key === 'bustan_grade' && preg_match('/^\d+$/', (string) $value) && isset(Ar::GRADES[(int) $value]) && ! $student->grade) {
                    $student->grade = (int) $value;
                }
            }
            $student->last_synced_at = now();
            $student->save();
        });

        return $this->items($student);
    }
}
