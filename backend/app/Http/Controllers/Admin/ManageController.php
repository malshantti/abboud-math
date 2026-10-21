<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AuthoringDocument;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentProgress;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Access;
use App\Support\Ar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ManageController extends Controller
{
    public function dashboard(): View
    {
        $since = now()->subDays(7);
        $audit = \App\Support\StudentAudit::summary();
        $stats = [
            'parents' => User::parents()->count(),
            'staff' => User::whereIn('role', ['admin', 'teacher'])->orWhere('is_admin', true)->count(),
            // Real students belong to parent accounts; staff test students and legacy rows are counted apart.
            'students' => Student::whereHas('user', fn ($u) => $u->parents())->whereNotIn('id', $audit['ids'])->count(),
            'families' => User::parents()->whereHas('students', fn ($q) => $q->whereNotIn('id', $audit['ids']))->count(),
            'students_all' => Student::count(),
            'new_week' => User::where('created_at', '>=', $since)->count(),
            'active_week' => Student::where('last_synced_at', '>=', $since)->count(),
            'trials' => User::where('trial_ends_at', '>', now())->count(),
            'subs_active' => Subscription::where('status', 'active')->where('ends_at', '>', now())->count(),
            'subs_pending' => Subscription::where('status', 'pending')->count(),
            'disabled' => User::whereNotNull('disabled_at')->count(),
            'drafts' => Schema::hasTable('authoring_documents') ? AuthoringDocument::query()->count() : 0,
        ];
        $byGrade = Student::selectRaw('grade, count(*) as n')->groupBy('grade')->pluck('n', 'grade');
        $bySubject = [];
        foreach (StudentProgress::selectRaw('`key`, count(*) as n')->whereIn('key', array_keys(Ar::KEYS))->groupBy('key')->get() as $r) {
            $bySubject[$r->key] = $r->n;
        }

        return view('manage.dashboard', [
            'stats' => $stats, 'byGrade' => $byGrade, 'bySubject' => $bySubject,
            'audit' => $audit,
            'recent' => array_slice(ActivityLog::grouped(ActivityLog::with('user')->latest('id')->take(30)->get()), 0, 8),
            'pending' => Subscription::with('user')->where('status', 'pending')->latest('id')->take(40)->get()
                ->groupBy(fn ($s) => $s->batch ?? ($s->user_id.'@'.$s->created_at?->format('YmdHi')))->take(5),
        ]);
    }

    // ---- Users ----
    public function users(Request $request): View
    {
        $q = User::query()->withCount('students');
        if ($s = trim((string) $request->query('q'))) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%"));
        }
        if (in_array($r = $request->query('role'), array_keys(User::ROLES), true)) {
            $q->where('role', $r);
        }
        if ($request->query('status') === 'disabled') {
            $q->whereNotNull('disabled_at');
        } elseif ($request->query('status') === 'active') {
            $q->whereNull('disabled_at');
        }

        return view('manage.users', ['users' => $q->latest('id')->paginate(25)->withQueryString()]);
    }

    public function editUser(User $user): View
    {
        return view('manage.user', [
            'user' => $user->load('students'), 'access' => Access::state($user),
            'subscriptions' => $user->subscriptions()->latest()->get(), 'plans' => Setting::plans(),
            'log' => ActivityLog::where('user_id', $user->id)->latest('id')->take(15)->get(),
        ]);
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(array_keys(User::ROLES))],
        ], ['email.unique' => 'هذا البريد مستخدم لحساب آخر.']);
        if ($user->is($request->user()) && $data['role'] !== 'admin') {
            return back()->withErrors(['role' => 'لا يمكنك سحب صلاحية المشرف من حسابك.']);
        }
        $user->name = trim($data['name']);
        $user->email = strtolower(trim($data['email']));
        $user->setRole($data['role']);
        $user->save();
        ActivityLog::record('user.update', $user->email, User::ROLES[$user->role]);

        return back()->with('status', 'حُفظت بيانات الحساب.');
    }

    public function toggleUser(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 422, 'لا يمكنك تعطيل حسابك.');
        $user->disabled_at = $user->disabled_at ? null : now();
        $user->save();
        ActivityLog::record($user->disabled_at ? 'user.disable' : 'user.enable', $user->email);

        return back()->with('status', $user->disabled_at ? 'عُطّل الحساب.' : 'فُعّل الحساب.');
    }

    public function destroyUser(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 422, 'لا يمكنك حذف حسابك.');
        $request->validate(['confirm_email' => ['required', Rule::in([$user->email])]], ['confirm_email.in' => 'اكتب البريد الإلكتروني للحساب كما هو لتأكيد الحذف.', 'confirm_email.required' => 'اكتب البريد الإلكتروني للحساب لتأكيد الحذف.']);
        ActivityLog::record('user.delete', $user->email);
        $user->delete();

        return redirect()->route('manage.users')->with('status', 'حُذف الحساب وطلابه وتقدّمهم.');
    }

    public function passwordUser(Request $request, User $user): RedirectResponse
    {
        if ($request->input('mode') === 'link') {
            Password::sendResetLink(['email' => $user->email]);
            ActivityLog::record('user.password', $user->email, 'رابط بالبريد');

            return back()->with('status', 'أُرسل رابط إعادة التعيين إلى بريد المستخدم.');
        }
        $data = $request->validate(['password' => ['required', 'string', PasswordRule::min(8), 'max:72']], ['password.min' => 'كلمة المرور ٨ محارف على الأقل.', 'password.required' => 'أدخل كلمة المرور الجديدة.']);
        $user->password = $data['password'];
        $user->save();
        ActivityLog::record('user.password', $user->email, 'تعيين يدوي');

        return back()->with('status', 'عُيّنت كلمة المرور الجديدة. أبلغها للمستخدم بطريقة آمنة.');
    }

    public function trialUser(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['days' => ['required', 'integer', 'min:0', 'max:365']]);
        $user->trial_ends_at = (int) $data['days'] === 0 ? now() : now()->addDays((int) $data['days']);
        $user->save();
        ActivityLog::record('user.trial', $user->email, Ar::num($data['days']).' يوم');

        return back()->with('status', 'عُدّلت الفترة التجريبية.');
    }

    public function bulkUsers(Request $request): RedirectResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:200'], 'ids.*' => ['integer'], 'action' => ['required', Rule::in(['disable', 'enable', 'delete', 'trial'])], 'days' => ['nullable', 'integer', 'min:0', 'max:365']], ['ids.required' => 'اختر حسابًا واحدًا على الأقل.']);
        $q = User::whereIn('id', $data['ids'])->where('id', '!=', $request->user()->id);
        $n = (clone $q)->count();
        match ($data['action']) {
            'disable' => $q->update(['disabled_at' => now()]),
            'enable' => $q->update(['disabled_at' => null]),
            'trial' => $q->update(['trial_ends_at' => now()->addDays((int) ($data['days'] ?? 3))]),
            'delete' => $request->boolean('confirm') ? $q->get()->each->delete() : abort(422, 'أكّد الحذف.'),
        };
        ActivityLog::record('user.'.($data['action'] === 'trial' ? 'trial' : ($data['action'] === 'delete' ? 'delete' : $data['action'])), 'إجراء جماعي', Ar::num($n).' حساب');

        return back()->with('status', 'نُفّذ الإجراء على '.Ar::num($n).' حساب.');
    }

    public function bulkSubscriptions(Request $request): RedirectResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'max:200'], 'ids.*' => ['integer'], 'action' => ['required', Rule::in(['activate', 'cancel'])]], ['ids.required' => 'اختر طلبًا واحدًا على الأقل.']);
        $subs = Subscription::whereIn('id', $data['ids'])->where('status', $data['action'] === 'activate' ? 'pending' : '!=', $data['action'] === 'activate' ? 'pending' : 'cancelled')->get();
        foreach ($subs as $s) {
            $data['action'] === 'activate' ? $this->activateSubscription((new Request(['days' => $s->days]))->setUserResolver(fn () => $request->user()), $s) : $this->cancelSubscription($s);
        }

        return back()->with('status', 'نُفّذ الإجراء على '.Ar::num($subs->count()).' طلب.');
    }

    // ---- Students ----
    public function students(Request $request): View
    {
        $q = Student::with('user')->withCount('progress');
        if ($s = trim((string) $request->query('q'))) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%$s%")->orWhere('name', 'like', "%$s%")));
        }
        if (array_key_exists((int) $request->query('grade'), Ar::GRADES)) {
            $q->where('grade', (int) $request->query('grade'));
        }
        if ($request->query('owner') === 'parents') {
            $q->whereHas('user', fn ($u) => $u->parents());
        } elseif ($request->query('owner') === 'review') {
            $q->whereIn('id', \App\Support\StudentAudit::reviewIds());
        }

        return view('manage.students', ['students' => $q->latest('id')->paginate(25)->withQueryString()]);
    }

    public function student(Student $student): View
    {
        $rows = [];
        foreach ($student->progress()->get() as $p) {
            if (isset(Ar::KEYS[$p->key])) {
                [$g, $subj] = Ar::KEYS[$p->key];
                $rows[$g][] = ['subject' => $subj, 'key' => $p->key, 'progress' => Ar::progress($p->key, $p->value, $p->client_updated_at ?: null), 'updated' => $p->client_updated_at ? date('c', intdiv($p->client_updated_at, 1000)) : null, 'raw' => $p->value];
            }
        }
        ksort($rows);

        return view('manage.student', ['student' => $student->load('user'), 'rows' => $rows]);
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:24'], 'grade' => ['nullable', Rule::in(array_keys(Ar::GRADES))]]);
        $student->update(['name' => trim($data['name']), 'grade' => $data['grade'] ?: null]);
        ActivityLog::record('student.update', $student->name, 'من لوحة الإدارة');

        return back()->with('status', 'حُفظت بيانات الطالب.');
    }

    public function destroyStudent(Request $request, Student $student): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']], ['confirm.accepted' => 'أكّد الحذف أولًا.']);
        ActivityLog::record('student.delete', $student->name, 'من لوحة الإدارة');
        $student->delete();

        return redirect()->route('manage.students')->with('status', 'حُذف الطالب وتقدّمه من الخادم.');
    }

    // ---- Subscriptions ----
    public function subscriptions(Request $request): View
    {
        $q = Subscription::with(['user', 'student']);
        if (array_key_exists($st = (string) $request->query('status'), Subscription::STATUS)) {
            $q->where('status', $st);
        }
        if ($s = trim((string) $request->query('q'))) {
            $q->where(fn ($w) => $w->where('code', 'like', "%$s%")->orWhere('batch', $s)->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%$s%")->orWhere('name', 'like', "%$s%")));
        }

        return view('manage.subscriptions', ['subs' => $q->latest('id')->paginate(25)->withQueryString()]);
    }

    public function activateSubscription(Request $request, Subscription $subscription): RedirectResponse
    {
        $data = $request->validate(['days' => ['nullable', 'integer', 'min:1', 'max:1000'], 'note' => ['nullable', 'string', 'max:500']]);
        $days = (int) ($data['days'] ?? $subscription->days);
        // Extend from the end of any running subscription for the same subject.
        $current = Subscription::where('user_id', $subscription->user_id)->where('plan', $subscription->plan)->where('status', 'active')->where('ends_at', '>', now())->max('ends_at');
        $start = $current ? \Illuminate\Support\Carbon::parse($current) : now();
        $subscription->forceFill(['status' => 'active', 'starts_at' => now(), 'ends_at' => $start->copy()->addDays($days), 'days' => $days, 'activated_by' => $request->user()->id, 'note' => $data['note'] ?? $subscription->note])->save();
        ActivityLog::record('subscription.activate', $subscription->code, $subscription->plan_name);

        return back()->with('status', 'فُعّل الاشتراك حتى '.Ar::date($subscription->ends_at, false).'.');
    }

    public function grantSubscription(Request $request, User $user): RedirectResponse
    {
        $plans = Setting::plans();
        $data = $request->validate(['plan' => ['required', Rule::in(array_keys($plans))], 'days' => ['nullable', 'integer', 'min:1', 'max:1000']]);
        $plan = $plans[$data['plan']];
        $s = new Subscription(['code' => 'ADM-'.random_int(100000, 999999), 'plan' => $plan['code'], 'plan_name' => $plan['name'], 'price' => $plan['price'], 'currency' => Setting::get('currency'), 'days' => (int) ($data['days'] ?? $plan['days']), 'scope' => $plan['code'], 'gateway' => 'manual', 'status' => 'pending']);
        $user->subscriptions()->save($s);

        return $this->activateSubscription($request, $s);
    }

    public function cancelSubscription(Subscription $subscription): RedirectResponse
    {
        $subscription->forceFill(['status' => 'cancelled'])->save();
        ActivityLog::record('subscription.cancel', $subscription->code);

        return back()->with('status', 'أُلغي الطلب.');
    }

    // ---- Settings ----
    public function settings(): View
    {
        return view('manage.settings', ['s' => Setting::all_(), 'plans' => Setting::plans()]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:80'], 'tagline' => ['nullable', 'string', 'max:160'],
            'announcement' => ['nullable', 'string', 'max:500'], 'trial_days' => ['required', 'integer', 'min:0', 'max:90'],
            'whatsapp_number' => ['nullable', 'string', 'max:20', 'regex:/^\+?[0-9 ]{8,20}$/'], 'currency' => ['required', 'string', 'max:10'],
            'prices' => ['required', 'array'], 'prices.*.price' => ['required', 'integer', 'min:0', 'max:100000'], 'prices.*.days' => ['required', 'integer', 'min:1', 'max:1000'],
        ], ['whatsapp_number.regex' => 'اكتب رقم واتساب بالصيغة الدولية بأرقام فقط، مثل 970599000000.']);
        $lines = [];
        foreach (Ar::SUBJECTS as $code => $_) {
            if (isset($data['prices'][$code])) {
                $lines[] = $code.'|'.(int) $data['prices'][$code]['price'].'|'.(int) $data['prices'][$code]['days'];
            }
        }
        Setting::put([
            'site_name' => trim($data['site_name']), 'tagline' => trim((string) $data['tagline']), 'announcement' => trim((string) $data['announcement']),
            'announcement_active' => $request->boolean('announcement_active') ? '1' : '0', 'registration_open' => $request->boolean('registration_open') ? '1' : '0',
            'gating_enabled' => $request->boolean('gating_enabled') ? '1' : '0', 'trial_days' => (int) $data['trial_days'],
            'whatsapp_number' => preg_replace('/\D+/', '', (string) $data['whatsapp_number']), 'currency' => trim($data['currency']), 'prices' => implode("\n", $lines),
        ]);
        ActivityLog::record('settings.update');

        return back()->with('status', 'حُفظت الإعدادات.');
    }

    // ---- Activity + export ----
    public function activity(Request $request): View
    {
        $q = ActivityLog::with('user');
        if (array_key_exists($a = (string) $request->query('action'), ActivityLog::LABELS)) {
            $q->where('action', $a);
        }

        $logs = $q->latest('id')->paginate(50)->withQueryString();

        return view('manage.activity', ['logs' => $logs, 'entries' => ActivityLog::grouped($logs->items())]);
    }

    public function export(Request $request, string $type): StreamedResponse
    {
        abort_unless(in_array($type, ['users', 'students', 'progress', 'subscriptions'], true), 404);
        ActivityLog::record('export', $type);
        $headers = ['Content-Type' => 'text/csv; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="bustan-'.$type.'-'.now()->format('Ymd-His').'.csv"'];

        return response()->stream(function () use ($type) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            $row = fn (array $r) => fputcsv($out, array_map(fn ($v) => is_string($v) && preg_match('/^[=+\-@\t\r]/', $v) ? "'".$v : $v, $r));
            if ($type === 'users') {
                $row(['id', 'الاسم', 'البريد', 'الدور', 'الحالة', 'عدد الطلاب', 'نهاية التجربة', 'آخر دخول', 'تاريخ التسجيل']);
                User::withCount('students')->orderBy('id')->chunk(500, fn ($c) => $c->each(fn ($u) => $row([$u->id, $u->name, $u->email, User::ROLES[$u->role] ?? $u->role, $u->disabled_at ? 'معطّل' : 'فعّال', $u->students_count, $u->trial_ends_at, $u->last_login_at, $u->created_at])));
            } elseif ($type === 'students') {
                $row(['id', 'الطالب', 'الصف', 'ولي الأمر', 'البريد', 'آخر مزامنة', 'تاريخ الإضافة']);
                Student::with('user')->orderBy('id')->chunk(500, fn ($c) => $c->each(fn ($s) => $row([$s->id, $s->name, Ar::grade($s->grade), $s->user?->name, $s->user?->email, $s->last_synced_at, $s->created_at])));
            } elseif ($type === 'progress') {
                $row(['student_id', 'الطالب', 'الصف', 'المادة', 'المفتاح', 'آخر تحديث', 'الحجم بالبايت']);
                StudentProgress::with('student')->orderBy('student_id')->chunk(500, fn ($c) => $c->each(fn ($p) => $row([$p->student_id, $p->student?->name, isset(Ar::KEYS[$p->key]) ? Ar::grade(Ar::KEYS[$p->key][0]) : '', Ar::KEYS[$p->key][1] ?? '', $p->key, $p->client_updated_at ? date('c', intdiv($p->client_updated_at, 1000)) : '', strlen((string) $p->value)])));
            } else {
                $row(['رمز الطلب', 'ولي الأمر', 'البريد', 'الطالب', 'المادة', 'السعر', 'العملة', 'الأيام', 'الحالة', 'البداية', 'النهاية', 'تاريخ الطلب']);
                Subscription::with(['user', 'student'])->orderBy('id')->chunk(500, fn ($c) => $c->each(fn ($s) => $row([$s->code, $s->user?->name, $s->user?->email, $s->student?->name, $s->plan_name, $s->price, $s->currency, $s->days, $s->statusLabel(), $s->starts_at, $s->ends_at, $s->created_at])));
            }
            fclose($out);
        }, 200, $headers);
    }
}
