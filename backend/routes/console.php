<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Read-only: lists students that are not real learners of a parent account. Never deletes.
Artisan::command('students:audit', function () {
    $rows = \App\Support\StudentAudit::rows();
    $ids = \App\Support\StudentAudit::reviewIds($rows);
    $this->info('students total: '.\App\Models\Student::count().', of parent accounts: '.\App\Models\Student::whereHas('user', fn ($u) => $u->parents())->count());
    foreach ($rows as $k => $v) {
        $this->line(str_pad($k, 10).count($v).($v ? '  ids: '.implode(',', $v) : ''));
    }
    if ($ids) {
        $this->table(['id', 'name', 'grade', 'local_id', 'owner', 'role', 'progress rows', 'created'], \Illuminate\Support\Facades\DB::table('students')->leftJoin('users', 'users.id', '=', 'students.user_id')
            ->whereIn('students.id', $ids)->select('students.id', 'students.name', 'students.grade', 'students.local_id', 'users.email', 'users.role')
            ->selectRaw('(select count(*) from student_progress p where p.student_id = students.id) as n, students.created_at')->get()->map(fn ($r) => (array) $r)->all());
        $this->comment('Review, then delete with: DELETE FROM students WHERE id IN ('.implode(',', $ids).');');
    }
})->purpose('List orphan, duplicate, staff-owned and legacy students (read-only)');

// Auto-expire (settings → التجربة والاشتراكات): ends subscriptions past their grace days and cancels stale pending requests.
Artisan::command('subscriptions:expire', function () {
    [$e, $c] = \App\Models\Subscription::sweep(true);
    $this->info("expired: $e, cancelled pending: $c");
})->purpose('Expire ended subscriptions and stale pending requests');
\Illuminate\Support\Facades\Schedule::command('subscriptions:expire')->hourly();
