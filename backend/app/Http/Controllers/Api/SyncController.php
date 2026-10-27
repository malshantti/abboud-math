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

    /** Public price summary for the landing; short public cache so admin changes appear within a minute. */
    public function prices(): JsonResponse
    {
        return response()->json(Setting::publicPrices(), 200, [], JSON_UNESCAPED_UNICODE)
            ->header('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=30');
    }

    /** Public site settings; staff never see maintenance (they bypass it). */
    private function siteFor($user): array
    {
        $site = Setting::publicData();
        if ($user && ! $user->isDisabled() && $user->isStaff()) {
            $site['maintenance'] = null;
        }

        return $site;
    }

    public function site(Request $request): JsonResponse
    {
        return response()->json($this->siteFor($request->user()), 200, [], JSON_UNESCAPED_UNICODE)->header('Cache-Control', 'private, max-age=60');
    }

    public function session(Request $request): JsonResponse
    {
        $user = $request->user();
        $base = ['site' => $this->siteFor($user), 'csrf' => csrf_token(), 'urls' => [
            'login' => route('account.login'), 'register' => route('account.register'), 'account' => route('account.home'), 'subscribe' => route('account.subscribe'),
        ]];
        if (! $user || $user->isDisabled()) {
            return response()->json($base + ['authenticated' => false] + (($request->attributes->get('device_revoked') || (! $user && \App\Support\Devices::revokedGuest($request))) ? ['revoked' => true, 'message' => \App\Support\Devices::MESSAGE] : []));
        }
        $access = Access::state($user);

        return response()->json($base + [
            'authenticated' => true,
            'user' => ['name' => $user->name, 'email' => $user->email],
            'access' => ['allowed' => $access['access'], 'kind' => $access['kind'], 'ends_at' => $access['ends_at']?->toIso8601String(), 'days_left' => $access['ends_at'] ? max(1, (int) ceil(($access['ends_at']->getTimestamp() - now()->getTimestamp()) / 86400)) : null, 'subjects' => $access['subjects'], 'expiring' => Access::expiringSoon($user)],
            // The only students a device may show: the ones the parent registered on the account page.
            'students' => $user->students()->orderBy('id')->get()->map(fn (Student $s) => $s->toApi($access))->values(),
        ]);
    }

    private function own(Request $request, Student $student): void
    {
        abort_unless($student->user_id === $request->user()->id, 404);
    }

    /**
     * A PIN chosen on a device (login.html) is saved to the account so it works on every device.
     * Only when the student has no PIN yet: a PIN set by the family on the account page is never overwritten from a device.
     */
    public function storePin(Request $request, Student $student): JsonResponse
    {
        $this->own($request, $student);
        $data = $request->validate([
            'salt' => ['required', 'string', 'regex:/^[0-9a-f]{16}$/'],
            'hash' => ['required', 'string', 'regex:/^sha256:[0-9a-f]{64}$/'],
        ]);
        if (! $student->hasPin()) {
            $student->forceFill(['pin_salt' => $data['salt'], 'pin_hash' => $data['hash']])->save();
        }

        return response()->json(['student' => $student->fresh()->toApi(), 'saved' => $student->pin_hash === $data['hash']]);
    }

    public function storeStudent(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:24'], 'grade' => ['nullable', Rule::in(array_keys(Setting::gradeOptions()))],
            'avatar' => ['nullable', 'string', 'max:20'], 'local_id' => ['nullable', 'string', 'max:40', 'regex:/^p\w+$/'],
        ]);
        $user = $request->user();
        if (! empty($data['local_id']) && ($existing = $user->students()->where('local_id', $data['local_id'])->first())) {
            return response()->json(['student' => $existing->toApi()]);
        }

        // Students (and their grade) are added by the parent on the account page only, never from the site.
        return response()->json(['message' => 'students are managed from the account page', 'manage' => route('account.home')], 403);
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

        $items = $this->merge($request, $student, $rejected);

        return response()->json(['student' => $student->toApi(), 'items' => $items, 'rejected' => $rejected, 'saved' => true]);
    }

    public function import(Request $request, Student $student): JsonResponse
    {
        $this->own($request, $student);
        $items = $this->merge($request, $student, $rejected);
        ActivityLog::record('progress.import', $student->name, Ar::num(count($request->input('items', []))).' مفتاح');

        return response()->json(['student' => $student->toApi(), 'items' => $items, 'rejected' => $rejected, 'imported' => true]);
    }

    /** Subject code (e.g. g6-math) a progress key belongs to, or null for shared settings keys. */
    public static function subjectOf(string $key): ?string
    {
        if ($key === 'abboud_math_v1') {
            return 'g8-math';
        }

        return preg_match('/^bustan_g(\d+)_([a-z]+)_v1$/', $key, $m) ? 'g'.$m[1].'-'.$m[2] : null;
    }

    /** A student may save a subject only of their own grade, and only with an active trial or subscription for it. */
    private function entitled(Student $student, string $code): bool
    {
        return $student->grade && $code === 'g'.$student->grade.'-'.explode('-', $code, 2)[1]
            && Access::allows($student->user, $code);
    }

    private function merge(Request $request, Student $student, ?array &$rejected = null): array
    {
        $request->validate(['items' => ['present', 'array', 'max:40']]);
        $items = $request->input('items', []);
        $rejected = [];
        foreach (array_keys($items) as $key) {
            $code = is_string($key) ? static::subjectOf($key) : null;
            // The grade is fixed by the parent; subject progress needs grade + entitlement.
            if ($key === 'bustan_grade' || ($code !== null && ! $this->entitled($student, $code))) {
                $rejected[] = $key;
                unset($items[$key]);
            }
        }
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
                    if ($subj = static::subjectOf($key)) {
                        \App\Support\Funnel::log('lesson_first', ['user_id' => $student->user_id, 'student_id' => $student->id, 'subject' => $subj]);
                    }
                } elseif ($updated > $row->client_updated_at) {
                    $row->update(['value' => $value, 'client_updated_at' => $updated]);
                }
            }
            $student->last_synced_at = now();
            $student->save();
        });

        return $this->items($student);
    }
}
