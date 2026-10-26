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

// استيراد عيّنات بنك الأسئلة (تُضاف غير مفعّلة، ولا تتكرر): php artisan questions:import database/data/questions-g6-math.json
Artisan::command('questions:import {file} {--active}', function (string $file) {
    $path = str_starts_with($file, '/') ? $file : base_path($file);
    $d = json_decode((string) @file_get_contents($path), true);
    if (! is_array($d) || empty($d['items'])) {
        $this->error('ملف غير صالح');

        return 1;
    }
    $have = App\Models\Question::where(['grade' => $d['grade'], 'subject' => $d['subject'], 'origin' => 'sample'])->pluck('lesson')->flip();
    $n = 0;
    foreach ($d['items'] as $i) {
        if (isset($have[$i['lesson']])) {
            continue;
        }
        App\Models\Question::create(['grade' => $d['grade'], 'subject' => $d['subject'], 'lesson' => $i['lesson'], 'lesson_title' => $i['lesson_title'] ?? null,
            'unit' => $i['unit'] ?? null, 'position' => $i['position'] ?? 0, 'q' => $i['q'], 'choices' => $i['choices'], 'hint' => $i['hint'] ?: null,
            'explain' => $i['explain'] ?: null, 'active' => (bool) $this->option('active'), 'origin' => 'sample']);
        $n++;
    }
    $this->info("imported $n");
})->purpose('Import question-bank samples');

// Daily Web Push reminder. Run often (cron every 15 min); it sends only inside the late-afternoon window and at most once per account per day.
Artisan::command('push:daily {--force}', function () {
    $r = \App\Support\Reminders::runDaily((bool) $this->option('force'));
    $this->info(json_encode($r));
})->purpose('Send the daily lesson reminder push');

// Test one account's devices now: php artisan push:test 1 "نص"
Artisan::command('push:test {user} {body?}', function (int $user, ?string $body = null) {
    $u = \App\Models\User::findOrFail($user);
    $n = \App\Support\Reminders::push($u, ['title' => 'بستان التعلّم', 'body' => $body ?: 'تجربة إشعار من بستان 🌱', 'url' => '/?pwa=test', 'tag' => 'test']);
    $this->info("delivered: $n of ".$u->pushSubscriptions()->count());
})->purpose('Send a test push to every device of one account');

Artisan::command('push:keys', function () {
    $k = \App\Support\WebPush::generateKeys();
    $this->line('VAPID_PUBLIC_KEY='.$k['public']);
    $this->line('VAPID_PRIVATE_KEY='.$k['private']);
})->purpose('Generate a VAPID key pair for .env');
