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

// Journey log backfill: rebuild the «مستعاد» events from accounts, children, progress, subscriptions and the activity log.
// Idempotent (replaces earlier backfilled rows); only covers what happened before live tracking started.
Artisan::command('funnel:backfill', function () {
    if (! \App\Support\Funnel::ready()) {
        $this->error('funnel_events table missing: run migrate first');

        return 1;
    }
    $db = Illuminate\Support\Facades\DB::connection();
    $db->table('funnel_events')->where('backfill', true)->delete();
    $cut = $db->table('funnel_events')->min('created_at') ?? now()->addYear()->toDateTimeString();
    $cut = Illuminate\Support\Carbon::parse($cut, 'UTC');
    $rows = [];
    $add = function (string $event, $at, int $user, array $x = []) use (&$rows, $cut) {
        if (! $at) {
            return;
        }
        $at = Illuminate\Support\Carbon::parse($at, 'UTC');
        if ($at->gte($cut)) {
            return;
        }
        $rows[] = ['event' => $event, 'visitor_id' => null, 'user_id' => $user, 'student_id' => $x['student_id'] ?? null, 'subject' => $x['subject'] ?? null,
            'page' => null, 'source' => null, 'count' => $x['count'] ?? null, 'meta' => isset($x['meta']) ? json_encode($x['meta'], JSON_UNESCAPED_UNICODE) : null,
            'backfill' => true, 'created_at' => $at->toDateTimeString()];
    };
    $users = App\Models\User::parents()->get();
    $ids = $users->pluck('id')->all();
    $paidUsers = [];
    foreach ($users as $u) {
        $add('registered', $u->created_at, $u->id, ['meta' => ['method' => $u->google_id ? 'google' : 'email']]);
        if ($u->trial_ends_at) {
            $add('trial_started', $u->created_at, $u->id, ['meta' => ['until' => $u->trial_ends_at->toDateString()]]);
        }
        if ($u->email_verified_at && ! $u->google_id) {
            $add('email_verified', $u->email_verified_at, $u->id);
        }
    }
    $students = App\Models\Student::whereIn('user_id', $ids ?: [0])->get(['id', 'user_id', 'grade', 'created_at']);
    $owner = $students->pluck('user_id', 'id');
    foreach ($students as $s) {
        $add('child_created', $s->created_at, $s->user_id, ['student_id' => $s->id, 'meta' => ['grade' => $s->grade]]);
    }
    foreach ($db->table('student_progress')->whereIn('student_id', $students->pluck('id')->all() ?: [0])->get(['student_id', 'key', 'value', 'created_at', 'updated_at']) as $p) {
        $uid = (int) ($owner[$p->student_id] ?? 0);
        if ($code = App\Http\Controllers\Api\SyncController::subjectOf($p->key)) {
            $add('lesson_first', $p->created_at, $uid, ['student_id' => $p->student_id, 'subject' => $code]);
        } elseif ($p->key === 'bustan_report_v1' && ($d = json_decode((string) $p->value, true)) && is_array($d['subj'] ?? null)) {
            foreach ($d['subj'] as $code => $s) {
                if (is_array($s) && ($n = (int) ($s['n'] ?? 0)) > 0 && preg_match('/^g\d{1,2}-[a-z]+$/', (string) $code)) {
                    $add('answers', $p->updated_at, $uid, ['student_id' => $p->student_id, 'subject' => $code, 'count' => $n, 'meta' => ['total' => 1]]);
                }
            }
        }
    }
    $subs = App\Models\Subscription::whereIn('user_id', $ids ?: [0])->orderBy('id')->get();
    foreach ($subs->groupBy(fn ($s) => $s->batch ?: $s->code) as $ref => $g) {
        $f = $g->first();
        if ($f->gateway !== 'manual') {
            $add('order_created', $f->created_at, $f->user_id, ['student_id' => $f->student_id, 'count' => $g->count(), 'meta' => ['plans' => $g->pluck('plan')->join(','), 'ref' => $ref]]);
        }
        foreach ($g as $s) {
            if ($s->starts_at && in_array($s->status, ['active', 'expired'], true)) {
                $add('paid', $s->starts_at, $s->user_id, ['student_id' => $s->student_id, 'meta' => ['plan' => $s->plan, 'gateway' => $s->gateway, 'price' => $s->price]]);
                $paidUsers[$s->user_id] = true;
            }
        }
    }
    foreach ($users as $u) {
        if ($u->trial_ends_at && $u->trial_ends_at->isPast() && empty($paidUsers[$u->id])) {
            $add('trial_ended', $u->trial_ends_at, $u->id, ['meta' => ['until' => $u->trial_ends_at->toDateString()]]);
        }
    }
    $map = ['login' => 'login', 'logout' => 'logout'];
    foreach ($db->table('activity_logs')->whereIn('action', array_keys($map))->whereIn('user_id', $ids ?: [0])->get(['user_id', 'action', 'created_at']) as $l) {
        $add($map[$l->action], $l->created_at, (int) $l->user_id);
    }
    foreach (array_chunk($rows, 500) as $chunk) {
        $db->table('funnel_events')->insert($chunk);
    }
    $this->info('backfilled '.count($rows).' events for '.count($ids).' families (cutoff '.$cut->toDateTimeString().' UTC)');
})->purpose('Rebuild the family journey log from existing data');

// Trial-ending reminder: one email (and a push to the family's devices when available) about a day before the free trial ends.
// Skips families who already have an active subscription. Runs hourly; each account is reminded once.
Artisan::command('trial:remind {--hours=24}', function () {
    $r = \App\Support\TrialReminder::run((int) $this->option('hours'));
    $this->info(json_encode($r));
})->purpose('Remind families before the free trial ends');
\Illuminate\Support\Facades\Schedule::command('trial:remind')->hourly();
