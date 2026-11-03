<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\School;
use App\Models\SchoolSection;
use App\Models\Student;
use App\Models\User;
use App\Support\Ar;
use App\Support\Devices;
use App\Support\MailCenter;
use App\Support\Schools;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

/** Branded school login (child: section → name → PIN; staff: username + password) and the school panel. */
class SchoolController extends Controller
{
    public const PIN_TRIES = 5;

    public const PIN_LOCK_MINUTES = 10;

    // ---------- Public ----------

    public function login(Request $request, School $school): View
    {
        $code = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $request->query('c', '')));
        $section = $code !== '' ? SchoolSection::where('school_id', $school->id)->where('code', $code)->first() : null;
        $pre = null;
        $stale = $code !== '' && ! $section;
        if ($section && ($u = (string) $request->query('u', '')) !== '') {
            $pre = Student::where('school_section_id', $section->id)->whereHas('user', fn ($q) => $q->where('username', $u)->where('school_id', $school->id))->first(['id', 'name']);
        }

        return view('school.login', [
            'school' => $school,
            'sections' => $school->sections()->get(['id', 'grade', 'name']),
            'section' => $section, 'pre' => $pre, 'stale' => $stale, 'tab' => $request->query('tab') === 'staff' ? 'staff' : 'child',
        ]);
    }

    public function logo(School $school): Response
    {
        abort_unless($school->logo_path && is_file($p = storage_path('app/private/'.$school->logo_path)), 404);

        return response()->file($p, ['Cache-Control' => 'public, max-age=31536000, immutable']);
    }

    /** Names of one section (for the child picker). Only within this school. */
    public function names(School $school, int $section): JsonResponse
    {
        $sec = SchoolSection::where('school_id', $school->id)->findOrFail($section);

        return response()->json(['names' => $sec->students()->get(['id', 'name'])->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])])
            ->header('Cache-Control', 'private, max-age=60');
    }

    public function child(Request $request, School $school): RedirectResponse|JsonResponse
    {
        $data = $request->validate(['student' => ['required', 'integer'], 'pin' => ['required', 'string']]);
        $pin = strtr($data['pin'], ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']);
        $fail = fn (string $m) => $request->expectsJson() ? response()->json(['message' => $m], 422) : back()->withErrors(['pin' => $m])->withInput($request->except('pin'));
        $ipKey = 'school-pin-ip:'.hash('sha256', (string) $request->ip());
        if (RateLimiter::tooManyAttempts($ipKey, 40)) {
            return $fail('محاولات كثيرة من هذا الجهاز. انتظر قليلًا ثم حاول مجددًا.');
        }
        $student = Student::with('user', 'section')->find($data['student']);
        if (! $student || ! $student->section || $student->section->school_id !== $school->id || ! $student->user || $student->user->school_id !== $school->id || $student->user->isDisabled()) {
            RateLimiter::hit($ipKey, 600);

            return $fail('اختر اسمك من القائمة.');
        }
        if ($student->pin_locked_until && $student->pin_locked_until->isFuture()) {
            return $fail('أُقفل الدخول مؤقتًا بعد محاولات خاطئة. حاول بعد '.Ar::num((int) ceil(now()->diffInSeconds($student->pin_locked_until, true) / 60)).' دقائق أو اطلب المساعدة من معلّمك.');
        }
        if (! preg_match('/^\d{4}$/', $pin) || ! $student->checkPin($pin)) {
            RateLimiter::hit($ipKey, 600);
            $fails = (int) $student->pin_fails + 1;
            ActivityLog::record('school.pin_fail', 'student:'.$student->id, $fails >= self::PIN_TRIES ? 'lock' : (string) $fails, $student->user);
            $student->forceFill($fails >= self::PIN_TRIES ? ['pin_fails' => 0, 'pin_locked_until' => now()->addMinutes(self::PIN_LOCK_MINUTES)] : ['pin_fails' => $fails])->saveQuietly();

            return $fail($fails >= self::PIN_TRIES ? 'أُقفل الدخول ١٠ دقائق بعد ٥ محاولات خاطئة.' : 'الرقم السري غير صحيح. بقي '.Ar::num(self::PIN_TRIES - $fails).' محاولات.');
        }
        $student->forceFill(['pin_fails' => 0, 'pin_locked_until' => null])->saveQuietly();
        $user = $student->user;
        $known = Devices::allows($user, (string) $request->cookie(Devices::COOKIE, ''));
        Auth::login($user, true);
        $request->session()->regenerate();
        $request->session()->put('school_login_at', now()->getTimestamp());
        if (! $known) {
            ActivityLog::record('school.new_device', 'student:'.$student->id, \Illuminate\Support\Str::limit((string) $request->userAgent(), 120, ''), $user);
        }
        $user->forceFill(['last_login_at' => now()])->saveQuietly();
        Devices::claim($request, $user);
        \App\Support\Funnel::log('login', ['user_id' => $user->id, 'student_id' => $student->id, 'meta' => ['method' => 'school_pin', 'school' => $school->id]]);
        $to = MailCenter::siteUrl().'login.html?sync=1';
        try { // Phase 3: open homework or quizzes → «واجباتي» first.
            if (\App\Support\SchoolTasks::forStudent($student)['pending'] > 0) {
                $to = route('school.me', $school);
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return $request->expectsJson() ? response()->json(['ok' => true, 'to' => $to, 'name' => $student->name]) : redirect()->away($to);
    }

    public function staffLogin(Request $request, School $school): RedirectResponse
    {
        $data = $request->validate(['username' => ['required', 'string', 'max:60'], 'password' => ['required', 'string', 'max:200']], [
            'username.required' => 'أدخل اسم المستخدم.', 'password.required' => 'أدخل كلمة المرور.',
        ]);
        $username = strtolower(trim($data['username']));
        $key = 'school-staff:'.hash('sha256', $username.'|'.$request->ip());
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return back()->withErrors(['username' => 'محاولات كثيرة. حاول بعد '.Ar::num(RateLimiter::availableIn($key)).' ثانية.'])->withInput(['username' => $username, 'tab' => 'staff']);
        }
        $user = User::where('username', $username)->where('school_id', $school->id)->whereIn('school_role', ['manager', 'teacher'])->first();
        if (! $user || $user->isDisabled() || ! Auth::attempt(['id' => $user->id, 'password' => $data['password']], true)) {
            RateLimiter::hit($key, 120);

            return back()->withErrors(['username' => 'اسم المستخدم أو كلمة المرور غير صحيحة.'])->withInput(['username' => $username, 'tab' => 'staff']);
        }
        RateLimiter::clear($key);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->saveQuietly();
        Devices::claim($request, $user);
        ActivityLog::record('school.login', $user->username);

        return redirect()->route('school.panel', $school);
    }

    public function logout(Request $request, School $school): RedirectResponse
    {
        Auth::logout();
        Devices::forget();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('school.login', $school);
    }

    // ---------- Panel ----------

    private function staff(Request $request, School $school): ?User
    {
        $u = $request->user();

        return $u && $u->isSchoolStaff() && (int) $u->school_id === (int) $school->id && ! $u->isDisabled() ? $u : null;
    }

    private function guard(Request $request, School $school): User
    {
        $u = $this->staff($request, $school);
        abort_unless($u, 403);

        return $u;
    }

    private function sectionFor(User $u, School $school, SchoolSection $section): SchoolSection
    {
        abort_unless((int) $section->school_id === (int) $school->id, 404);
        abort_unless($u->school_role === 'manager' || $section->teachers()->whereKey($u->id)->exists(), 404);

        return $section;
    }

    private static function today(): Carbon
    {
        return Carbon::now(config('app.display_timezone', 'Asia/Gaza'))->startOfDay()->utc();
    }

    public function panel(Request $request, School $school): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return redirect()->route('school.login', ['school' => $school, 'tab' => 'staff']);
        }
        $today = self::today();
        $sections = Schools::sectionsFor($u)->withCount('students')->with('teachers:id,name')->get();
        $ids = $sections->pluck('id');
        $active = Student::whereIn('school_section_id', $ids)->where(fn ($q) => $q->where('last_synced_at', '>=', $today)
            ->orWhereHas('user', fn ($w) => $w->where('last_login_at', '>=', $today)->orWhere('active_device_seen_at', '>=', $today)))
            ->selectRaw('school_section_id, count(*) n')->groupBy('school_section_id')->pluck('n', 'school_section_id');

        return view('school.panel', [
            'school' => $school, 'me' => $u, 'sections' => $sections, 'active' => $active,
            'teachers' => $u->school_role === 'manager' ? User::where('school_id', $school->id)->where('school_role', 'teacher')->with('schoolSections:id,name')->orderBy('name')->get() : collect(),
            'subjects' => Schools::SUBJECTS, 'grades' => \App\Models\Setting::gradeOptions(),
        ]);
    }

    public function storeSection(Request $request, School $school): RedirectResponse
    {
        $u = $this->guard($request, $school);
        abort_unless($u->school_role === 'manager', 403);
        $data = $request->validate(['grade' => ['required', 'integer', 'between:1,8'], 'name' => ['required', 'string', 'max:60']], ['name.required' => 'اكتب اسم الشعبة، مثل: رابع أ']);
        $sec = new SchoolSection(['grade' => $data['grade'], 'name' => trim($data['name']), 'code' => SchoolSection::newCode()]);
        $sec->school_id = $school->id;
        $sec->save();

        return redirect()->route('school.section', [$school, $sec])->with('status', 'أُنشئت الشعبة. الصق أسماء الطلاب الآن.');
    }

    public function storeTeacher(Request $request, School $school): RedirectResponse
    {
        $u = $this->guard($request, $school);
        abort_unless($u->school_role === 'manager', 403);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'sections' => ['array'], 'sections.*' => ['integer', Rule::exists('school_sections', 'id')->where('school_id', $school->id)],
            'subjects' => ['array'], 'subjects.*' => [Rule::in(array_keys(Schools::SUBJECTS))],
        ], ['name.required' => 'اكتب اسم المعلّم.']);
        [$t, $password] = Schools::createStaff($school, $data['name'], 'teacher');
        $subjects = implode(',', $data['subjects'] ?? []);
        foreach ($data['sections'] ?? [] as $sid) {
            $t->schoolSections()->attach($sid, ['subjects' => $subjects ?: null]);
        }
        ActivityLog::record('school.teacher', $t->username);

        return redirect()->route('school.panel', $school)->with('credentials', ['name' => $t->name, 'username' => $t->username, 'password' => $password]);
    }

    public function section(Request $request, School $school, SchoolSection $section): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return redirect()->route('school.login', ['school' => $school, 'tab' => 'staff']);
        }
        $this->sectionFor($u, $school, $section);
        $students = $section->students()->with('user:id,username,last_login_at,active_device_seen_at')->get();
        $names = $students->pluck('name', 'id');
        $alerts = ActivityLog::whereIn('action', ['school.pin_fail', 'school.new_device'])
            ->whereIn('subject', $students->pluck('id')->map(fn ($id) => 'student:'.$id))->where('created_at', '>=', now()->subDays(7))
            ->latest('id')->take(30)->get(['action', 'subject', 'details', 'created_at'])
            ->map(fn ($a) => ['name' => $names[(int) substr($a->subject, 8)] ?? '', 'kind' => $a->action === 'school.pin_fail' ? ($a->details === 'lock' ? 'قُفل بعد ٥ محاولات خاطئة' : 'رقم سري خاطئ') : 'دخول من جهاز جديد', 'bad' => $a->action === 'school.pin_fail', 'at' => Ar::date($a->created_at)]);

        return view('school.section', [
            'school' => $school, 'me' => $u, 'section' => $section->load('teachers:id,name'), 'students' => $students, 'alerts' => $alerts,
            'joinUrl' => route('school.login', ['school' => $school, 'c' => $section->code]),
        ]);
    }

    public function storeStudents(Request $request, School $school, SchoolSection $section): RedirectResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        $request->validate(['names' => ['nullable', 'string', 'max:20000'], 'file' => ['nullable', 'file', 'max:2048', 'mimes:csv,txt,xlsx']], [
            'file.mimes' => 'الملف يجب أن يكون Excel (xlsx) أو CSV.',
        ]);
        $names = Schools::parseNames($request->input('names'), $request->file('file'));
        if (! $names) {
            return back()->withErrors(['names' => 'لم نجد أسماء. الصق اسمًا في كل سطر أو ارفع ملف Excel فيه الأسماء في العمود الأول.']);
        }
        $existing = $section->students()->pluck('name')->map(fn ($n) => mb_strtolower($n))->all();
        $names = array_values(array_filter($names, fn ($n) => ! in_array(mb_strtolower($n), $existing, true)));
        if (! $names) {
            return back()->with('status', 'كل هذه الأسماء موجودة في الشعبة مسبقًا.');
        }
        $made = Schools::createStudents($section, $names);
        ActivityLog::record('school.students', $section->name, (string) count($made));

        return redirect()->route('school.section', [$school, $section])->with('status', 'أُضيف '.Ar::num(count($made)).' طالبًا مع أرقامهم السرية. اطبع البطاقات الآن.');
    }

    public function resetPin(Request $request, School $school, Student $student): RedirectResponse
    {
        $u = $this->guard($request, $school);
        abort_unless($student->section, 404);
        $this->sectionFor($u, $school, $student->section);
        Schools::assignPin($student, Schools::pin());
        $student->save();

        return back()->with('status', 'رقم سري جديد لـ'.$student->name.': '.Ar::num(Schools::plainPin($student)));
    }

    /** Detailed dashboard for one section: attendance, progress, hardest questions, CSV. */
    public function report(Request $request, School $school, SchoolSection $section)
    {
        if (! $u = $this->staff($request, $school)) {
            return redirect()->route('school.login', ['school' => $school, 'tab' => 'staff']);
        }
        $this->sectionFor($u, $school, $section);
        $subject = preg_match('/^[a-z]{3,10}$/', (string) $request->query('subject')) ? (string) $request->query('subject') : null;
        $d = \App\Support\SchoolStats::section($section, $subject);
        if ($request->query('format') === 'csv') {
            return $this->csv($school, $section, $d);
        }

        return view('school.report', ['school' => $school, 'section' => $section, 'me' => $u, 'd' => $d]);
    }

    private function csv(School $school, SchoolSection $section, array $d)
    {
        $tz = \App\Support\SchoolStats::tz();
        $codes = array_keys($d['subjects']);
        $head = ['الاسم', 'اسم المستخدم', 'آخر ظهور ('.$tz.')', 'أيام بلا دخول', 'أيام نشاط هذا الأسبوع', 'دقائق هذا الأسبوع', 'متوسط التقدّم %', 'الدروس المنجزة', 'إجابات', 'الصواب %'];
        foreach ($codes as $c) {
            $n = $d['subjects'][$c]['name'];
            array_push($head, $n.' — دروس', $n.' — تقدّم %', $n.' — صواب %', $n.' — متوسط الاختبارات');
        }
        $name = 'section-'.$section->id.'-'.now($tz)->format('Y-m-d').($d['subject'] ? '-'.explode('-', $d['subject'])[1] : '').'.csv';

        return response()->streamDownload(function () use ($d, $head, $codes, $tz) {
            $o = fopen('php://output', 'w');
            fwrite($o, "\xEF\xBB\xBF");
            fputcsv($o, $head);
            foreach ($d['rows']->sortBy('name') as $r) {
                $line = [$r['name'], $r['username'], $r['last'] ? $r['last']->copy()->timezone($tz)->format('Y-m-d H:i') : '', $r['idle'] ?? '', $r['week_days'], $r['week_min'], $r['progress'] ?? '', $r['done'], $r['answered'], $r['acc'] ?? ''];
                foreach ($codes as $c) {
                    $x = $r['subjects'][$c];
                    array_push($line, $x['done'], $x['pct'] ?? '', $x['acc'] ?? '', $x['quiz_avg'] ?? '');
                }
                fputcsv($o, $line);
            }
            fclose($o);
        }, $name, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store, private']);
    }

    public function student(Request $request, School $school, Student $student): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return redirect()->route('school.login', ['school' => $school, 'tab' => 'staff']);
        }
        abort_unless($student->section, 404);
        $section = $this->sectionFor($u, $school, $student->section);
        $student->load(['user:id,username,last_login_at,active_device_seen_at', 'progress']);
        $r = \App\Support\SchoolStats::student($student, (int) $section->grade, $student->progress->keyBy('key'));

        return view('school.student', ['school' => $school, 'section' => $section, 'me' => $u, 'r' => $r, 'student' => $student]);
    }

    public function rotateCode(Request $request, School $school, SchoolSection $section): RedirectResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        $section->forceFill(['code' => SchoolSection::newCode()])->save();
        ActivityLog::record('school.rotate', 'section:'.$section->id);

        return back()->with('status', 'تغيّر رمز الشعبة ورابطها. الرمز القديم والبطاقات القديمة لم تعد تفتح القائمة مباشرة؛ اطبع البطاقات من جديد.');
    }

    /** One click: sign the student out on every device and give a new PIN. */
    public function kick(Request $request, School $school, Student $student): RedirectResponse
    {
        $u = $this->guard($request, $school);
        abort_unless($student->section, 404);
        $this->sectionFor($u, $school, $student->section);
        if ($holder = $student->user) {
            $holder->setRememberToken(\Illuminate\Support\Str::random(60));
            $holder->forceFill(['school_logout_at' => now(), 'device_tokens' => null, 'active_device_token' => null])->save();
        }
        Schools::assignPin($student, Schools::pin());
        $student->save();
        ActivityLog::record('school.kick', 'student:'.$student->id);

        return back()->with('status', 'أُخرج '.$student->name.' من كل الأجهزة. رقمه السري الجديد: '.Ar::num(Schools::plainPin($student)));
    }

    public function cards(Request $request, School $school, SchoolSection $section): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return redirect()->route('school.login', ['school' => $school, 'tab' => 'staff']);
        }
        $this->sectionFor($u, $school, $section);
        $only = $request->query('s');
        $students = $section->students()->with('user:id,username')->when($only, fn ($q) => $q->whereKey((int) $only))->get();

        return view('school.cards', ['school' => $school, 'section' => $section, 'cards' => $students->map(fn ($s) => [
            'name' => $s->name, 'pin' => Schools::plainPin($s), 'username' => $s->user?->username,
            'url' => route('school.login', ['school' => $school, 'c' => $section->code, 'u' => $s->user?->username]),
        ])]);
    }
}
