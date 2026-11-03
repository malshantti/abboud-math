<?php

namespace App\Support;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * «المتصلون الآن» and today's numbers for the admin dashboard. Read-only.
 * Activity signals: users.active_device_seen_at (updated by SingleDevice at most once a minute per request),
 * students.last_synced_at (progress sync), funnel_events (site beacon, lessons, logins, guests).
 * Times are stored in UTC; "today" is the Asia/Gaza calendar day.
 */
class LiveStats
{
    /** Admin, demo and test accounts: listed with a flag but never counted. */
    public const EXCLUDED = [1, 60, 67];

    public const ONLINE_MINUTES = 5;

    public static function tz(): string
    {
        return (string) config('app.display_timezone', 'Asia/Gaza');
    }

    /** Start of the Gaza day $daysAgo days back, in UTC. */
    public static function dayStart(int $daysAgo = 0): Carbon
    {
        return Carbon::now(self::tz())->startOfDay()->subDays($daysAgo)->utc();
    }

    private static function funnel()
    {
        return Funnel::ready() ? DB::table('funnel_events') : null;
    }

    /** user_id => latest activity time (UTC Carbon) since $since. */
    public static function activeUsers(Carbon $since): array
    {
        $at = [];
        $put = function ($id, $t) use (&$at) {
            if (! $id || ! $t) {
                return;
            }
            $t = Carbon::parse($t, 'UTC');
            if (! isset($at[$id]) || $t->gt($at[$id])) {
                $at[$id] = $t;
            }
        };
        foreach (User::where('active_device_seen_at', '>=', $since)->get(['id', 'active_device_seen_at']) as $u) {
            $put($u->id, $u->getRawOriginal('active_device_seen_at'));
        }
        foreach (Student::where('last_synced_at', '>=', $since)->get(['user_id', 'last_synced_at']) as $s) {
            $put($s->user_id, $s->getRawOriginal('last_synced_at'));
        }
        if ($f = self::funnel()) {
            foreach ($f->whereNotNull('user_id')->where('created_at', '>=', $since)->where('backfill', false)
                ->groupBy('user_id')->selectRaw('user_id, max(created_at) as t')->get() as $r) {
                $put($r->user_id, $r->t);
            }
        }
        arsort($at);

        return $at;
    }

    /** student_id => latest activity since $since. */
    public static function activeStudents(Carbon $since): array
    {
        $at = [];
        foreach (Student::where('last_synced_at', '>=', $since)->get(['id', 'last_synced_at']) as $s) {
            $at[$s->id] = Carbon::parse($s->getRawOriginal('last_synced_at'), 'UTC');
        }
        if ($f = self::funnel()) {
            foreach ($f->whereNotNull('student_id')->where('created_at', '>=', $since)->where('backfill', false)
                ->groupBy('student_id')->selectRaw('student_id, max(created_at) as t')->get() as $r) {
                $t = Carbon::parse($r->t, 'UTC');
                if (! isset($at[$r->student_id]) || $t->gt($at[$r->student_id])) {
                    $at[$r->student_id] = $t;
                }
            }
        }

        return $at;
    }

    /** Rows for a people list: family account, its students (grade), last activity, source; newest first. */
    public static function people(Carbon $since, int $limit = 60): array
    {
        $users = self::activeUsers($since);
        $students = self::activeStudents($since);
        $ids = array_slice(array_keys($users), 0, $limit);
        if (! $ids) {
            return [];
        }
        $models = User::whereIn('id', $ids)->with('students:id,user_id,name,grade')->get(['id', 'name', 'role', 'is_admin', 'created_at'])->keyBy('id');
        $sources = [];
        $lastEvent = [];
        if ($f = self::funnel()) {
            foreach (DB::table('funnel_events')->whereIn('user_id', $ids)->whereNotNull('source')->orderBy('id')->get(['user_id', 'source']) as $r) {
                $sources[$r->user_id] = $sources[$r->user_id] ?? $r->source; // first known source of the family
            }
            foreach (DB::table('funnel_events')->whereIn('user_id', $ids)->where('created_at', '>=', $since)->orderBy('id')->get(['user_id', 'event']) as $r) {
                $lastEvent[$r->user_id] = $r->event;
            }
        }
        $rows = [];
        foreach ($ids as $id) {
            $u = $models[$id] ?? null;
            if (! $u) {
                continue;
            }
            $kids = $u->students->map(fn ($s) => [
                'name' => $s->name, 'grade' => Ar::grade($s->grade), 'active' => isset($students[$s->id]),
            ])->values()->all();
            $rows[] = [
                'id' => $u->id, 'name' => $u->name,
                'excluded' => in_array($u->id, self::EXCLUDED, true) || $u->isStaff(),
                'staff' => $u->isStaff(),
                'students' => $kids,
                'at' => $users[$id]->toIso8601String(),
                'time' => Ar::num($users[$id]->copy()->timezone(self::tz())->format('h:i')).' '.($users[$id]->copy()->timezone(self::tz())->format('A') === 'AM' ? 'ص' : 'م'),
                'ago' => self::ago($users[$id]),
                'source' => isset($sources[$id]) ? self::sourceLabel($sources[$id]) : null,
                'last' => isset($lastEvent[$id]) ? (Funnel::LABELS[$lastEvent[$id]] ?? null) : null,
                'new_today' => $u->created_at && $u->created_at->gte(self::dayStart()),
            ];
        }

        return $rows;
    }

    public static function ago(Carbon $t): string
    {
        $m = (int) floor($t->diffInSeconds(now(), true) / 60);
        if ($m < 1) {
            return 'الآن';
        }
        if ($m < 60) {
            return 'قبل '.Ar::num($m).' د';
        }

        return 'قبل '.Ar::num(intdiv($m, 60)).' س';
    }

    public static function sourceLabel(string $s): string
    {
        return [
            'facebook' => 'فيسبوك', 'fb' => 'فيسبوك', 'instagram' => 'إنستغرام', 'ig' => 'إنستغرام', 'google' => 'جوجل',
            'whatsapp' => 'واتساب', 'wa' => 'واتساب', 'tiktok' => 'تيك توك', 'youtube' => 'يوتيوب', 'direct' => 'مباشر',
        ][strtolower($s)] ?? $s;
    }

    private static function countIds(array $ids): int
    {
        return count(array_diff(array_map('intval', $ids), self::EXCLUDED));
    }

    /** Ids of non-staff accounts (staff never counted as families). */
    private static function familyIds(array $ids): array
    {
        if (! $ids) {
            return [];
        }

        return User::whereIn('id', $ids)->parents()->whereNotIn('id', self::EXCLUDED)->pluck('id')->all();
    }

    private static function familyStudentIds(array $ids): array
    {
        if (! $ids) {
            return [];
        }

        return Student::whereIn('id', $ids)->whereNotIn('user_id', self::EXCLUDED)
            ->whereHas('user', fn ($u) => $u->parents())->pluck('id')->all();
    }

    private static function guests(Carbon $from, ?Carbon $to = null): int
    {
        if (! self::funnel()) {
            return 0;
        }
        $q = DB::table('funnel_events')->whereNull('user_id')->whereNotNull('visitor_id')->where('backfill', false)->where('created_at', '>=', $from);
        if ($to) {
            $q->where('created_at', '<', $to);
        }

        // A visitor who later signed up is linked to user_id on other rows: not a guest.
        $linked = DB::table('funnel_events')->whereNotNull('user_id')->whereNotNull('visitor_id')->select('visitor_id');

        return (int) $q->whereNotIn('visitor_id', $linked)->distinct()->count('visitor_id');
    }

    private static function eventCount(string|array $events, Carbon $from, ?Carbon $to = null): int
    {
        if (! self::funnel()) {
            return 0;
        }
        $q = DB::table('funnel_events')->whereIn('event', (array) $events)->where('backfill', false)->where('created_at', '>=', $from)
            ->where(fn ($w) => $w->whereNull('user_id')->orWhereNotIn('user_id', self::EXCLUDED));
        if ($to) {
            $q->where('created_at', '<', $to);
        }

        return (int) $q->count();
    }

    /** Progress rows (one per student and subject) saved in the window, excluded accounts left out. */
    private static function progressSaved(Carbon $from, ?Carbon $to = null): int
    {
        $q = DB::table('student_progress')->join('students', 'students.id', '=', 'student_progress.student_id')
            ->whereNotIn('students.user_id', self::EXCLUDED)->where('student_progress.updated_at', '>=', $from);
        if ($to) {
            $q->where('student_progress.updated_at', '<', $to);
        }

        return (int) $q->count();
    }

    private static function signups(Carbon $from, ?Carbon $to = null): int
    {
        $q = User::parents()->real()->whereNotIn('id', self::EXCLUDED)->where('created_at', '>=', $from);
        if ($to) {
            $q->where('created_at', '<', $to);
        }

        return $q->count();
    }

    public static function online(): array
    {
        $since = now()->subMinutes(self::ONLINE_MINUTES);
        $people = self::people($since, 100);

        return [
            'people' => $people,
            'accounts' => count(self::familyIds(array_column($people, 'id'))),
            'students' => count(self::familyStudentIds(array_keys(self::activeStudents($since)))),
            'guests' => self::guests($since),
            'checked' => Ar::num(Carbon::now(self::tz())->format('h:i:s')),
        ];
    }

    public static function summary(): array
    {
        $today = self::dayStart();
        $trend = [];
        for ($d = 6; $d >= 0; $d--) {
            $from = self::dayStart($d);
            $to = $d ? self::dayStart($d - 1) : null;
            $trend[] = [
                'day' => Ar::num($from->copy()->timezone(self::tz())->format('d/m')),
                'signups' => self::signups($from, $to),
                'accounts' => count(self::familyIds(array_keys(array_filter(self::activeUsers($from), fn ($t) => ! $to || $t->lt($to))))),
                'students' => count(self::familyStudentIds(array_keys(array_filter(self::activeStudents($from), fn ($t) => ! $to || $t->lt($to))))),
                'lessons' => self::eventCount('lesson_open', $from, $to),
                'guests' => self::guests($from, $to),
            ];
        }

        return [
            'signups' => self::signups($today),
            'accounts_today' => count(self::familyIds(array_keys(self::activeUsers($today)))),
            'students_today' => count(self::familyStudentIds(array_keys(self::activeStudents($today)))),
            'lessons_opened' => self::eventCount('lesson_open', $today),
            'progress_saved' => self::progressSaved($today),
            'guests' => self::guests($today),
            'total_accounts' => User::parents()->real()->whereNotIn('id', self::EXCLUDED)->count(),
            'total_students' => Student::whereNotIn('user_id', self::EXCLUDED)->whereHas('user', fn ($u) => $u->parents()->real())->count(),
            'trend' => $trend,
        ];
    }
}
