<?php

namespace App\Support;

use App\Models\Student;
use Illuminate\Support\Facades\DB;

/**
 * Students that should not be counted as real learners: owned by a non-parent (staff test) account,
 * duplicates (same owner + same name), or legacy rows auto-created by the site before accounts owned
 * students (local_id set, no grade). Orphans (owner row missing) only appear if FK checks were bypassed.
 */
class StudentAudit
{
    public static function rows(): array
    {
        $out = ['orphan' => [], 'staff' => [], 'duplicate' => [], 'legacy' => []];
        $students = DB::table('students')->leftJoin('users', 'users.id', '=', 'students.user_id')
            ->select('students.id', 'students.user_id', 'students.name', 'students.grade', 'students.local_id', 'users.id as owner', 'users.role', 'users.is_admin')
            ->selectRaw('(select count(*) from student_progress p where p.student_id = students.id) as progress_rows')
            // Of duplicates, keep the copy with progress (then the most recently synced, then the oldest).
            ->orderByDesc('progress_rows')->orderByDesc('students.last_synced_at')->orderBy('students.id')->get();
        $seen = [];
        foreach ($students as $s) {
            if ($s->owner === null) {
                $out['orphan'][] = $s->id;

                continue;
            }
            if ($s->role !== 'parent' || (bool) $s->is_admin) {
                $out['staff'][] = $s->id;
            }
            $k = $s->user_id.'|'.mb_strtolower(trim($s->name));
            if (isset($seen[$k])) {
                $out['duplicate'][] = $s->id;
            }
            $seen[$k] = true;
            if ($s->local_id !== null && $s->grade === null) {
                $out['legacy'][] = $s->id;
            }
        }

        return array_map(function ($ids) {
            sort($ids);

            return $ids;
        }, $out);
    }

    public static function summary(): array
    {
        $rows = static::rows();

        return array_map('count', $rows) + ['ids' => static::reviewIds($rows)];
    }

    public static function reviewIds(?array $rows = null): array
    {
        return array_values(array_unique(array_merge(...array_values($rows ?? static::rows()))));
    }
}
