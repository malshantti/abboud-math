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
use App\Models\MailLog;
use App\Support\MailCenter;
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
        Subscription::sweep();
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
        } elseif ($request->query('status') === 'unverified') {
            $q->whereNull('email_verified_at');
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

    public function revokeDevices(User $user): RedirectResponse
    {
        \App\Support\Devices::revokeAll($user);
        ActivityLog::record('user.devices.revoke', $user->email);

        return back()->with('status', 'سُجّل خروج هذا الحساب من كل الأجهزة.');
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
        if (array_key_exists((int) $request->query('grade'), Setting::gradeOptions())) {
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
        $data = $request->validate(['name' => ['required', 'string', 'max:24'], 'grade' => ['nullable', Rule::in(array_keys(Setting::gradeOptions()))]]);
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
        Subscription::sweep();
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
        return view('manage.settings', [
            's' => Setting::all_(), 'plans' => Setting::plans(), 'faq' => Setting::faq(),
            'subjectsList' => self::SUBJECT_CHOICES, 'colors' => Setting::ANNOUNCEMENT_COLORS,
            'placeholders' => \App\Payments\WhatsAppGateway::PLACEHOLDERS, 'labels' => self::SETTING_LABELS,
            'serverSession' => (int) config('session.lifetime'),
        ]);
    }

    /** Subjects of the Palestinian curriculum that can be added to a grade: slug => name. */
    public const SUBJECT_CHOICES = [
        'math' => 'الرياضيات', 'arabic' => 'العربية', 'english' => 'الإنجليزية', 'science' => 'العلوم', 'life' => 'التربية الحياتية',
        'islamic' => 'التربية الإسلامية', 'christian' => 'التربية المسيحية', 'social' => 'الدراسات الاجتماعية', 'national' => 'التنشئة الوطنية والحياتية',
        'tech' => 'التكنولوجيا', 'french' => 'اللغة الفرنسية', 'art' => 'التربية الفنية', 'music' => 'التربية الموسيقية', 'sport' => 'التربية الرياضية',
        'physics' => 'الفيزياء', 'chemistry' => 'الكيمياء', 'biology' => 'الأحياء', 'earth' => 'علوم الأرض', 'history' => 'التاريخ', 'geography' => 'الجغرافيا',
        'entrepreneur' => 'الريادة والابتكار',
    ];

    /** Arabic names of settings, for validation errors and the activity log. */
    public const SETTING_LABELS = [
        'prices' => 'الأسعار', 'catalog_extra' => 'الصفوف والمواد المضافة',
        'trial_days' => 'مدة التجربة', 'gating_enabled' => 'قفل المواد بعد التجربة', 'grace_days' => 'أيام السماح', 'reminder_days' => 'أيام التذكير قبل الانتهاء',
        'max_pending' => 'الحد الأقصى للطلبات المعلّقة', 'auto_expire' => 'الإنهاء التلقائي', 'pending_expire_days' => 'مدة بقاء الطلب المعلّق',
        'whatsapp_number' => 'رقم واتساب', 'whatsapp_template' => 'نص رسالة واتساب', 'currency' => 'العملة', 'payment_instructions' => 'تعليمات الدفع',
        'site_name' => 'اسم الموقع', 'tagline' => 'الشعار', 'hero_title' => 'عنوان الواجهة', 'hero_title_mark' => 'السطر المميّز في العنوان', 'hero_subtitle' => 'وصف الواجهة',
        'hero_badge' => 'شارة الواجهة', 'announcement' => 'نص الإعلان', 'announcement_active' => 'إظهار الإعلان', 'announcement_color' => 'لون الإعلان',
        'announcement_link' => 'رابط الإعلان', 'announcement_from' => 'بداية عرض الإعلان', 'announcement_to' => 'نهاية عرض الإعلان', 'faq' => 'الأسئلة الشائعة',
        'registration_open' => 'التسجيل المفتوح', 'require_verification' => 'اشتراط تفعيل البريد', 'single_device' => 'جهاز واحد لكل حساب', 'max_students' => 'الحد الأقصى للطلاب', 'session_minutes' => 'مدة الجلسة',
        'voice_enabled' => 'الجولة الصوتية', 'voice_volume' => 'مستوى الصوت', 'voice_autoplay' => 'التشغيل التلقائي',
        'facebook_url' => 'رابط فيسبوك', 'instagram_url' => 'رابط إنستغرام', 'contact_email' => 'بريد التواصل', 'footer_text' => 'نص التذييل',
        'maintenance_on' => 'وضع الصيانة', 'maintenance_message' => 'رسالة الصيانة',
        'subjects_hidden' => 'المواد المخفية', 'badges_enabled' => 'إظهار الشارات', 'points_multiplier' => 'مضاعف النقاط',
    ];

    private const FLAGS = ['gating_enabled', 'auto_expire', 'announcement_active', 'registration_open', 'require_verification', 'single_device', 'voice_enabled', 'voice_autoplay', 'maintenance_on', 'badges_enabled'];

    public function updateSettings(Request $request): RedirectResponse
    {
        $int = fn (int $min, int $max, bool $req = true) => [$req ? 'required' : 'nullable', 'integer', 'min:'.$min, 'max:'.$max];
        $text = fn (int $max, bool $req = false) => [$req ? 'required' : 'nullable', 'string', 'max:'.$max];
        $url = ['nullable', 'string', 'max:300', 'url:https,http'];
        $rules = [
            'prices' => ['required', 'array'], 'prices.*.price' => $int(1, 100000), 'prices.*.days' => $int(1, 1000),
            'extra' => ['nullable', 'array', 'max:300'], 'extra.*' => ['string', 'regex:/^g([1-9]|1[0-2])-[a-z][a-z0-9]{1,19}$/'],
            'trial_days' => $int(0, 90), 'grace_days' => $int(0, 60), 'reminder_days' => $int(0, 60), 'max_pending' => $int(1, 50), 'pending_expire_days' => $int(0, 365),
            'whatsapp_number' => ['nullable', 'string', 'max:20', 'regex:/^\+?[0-9 ]{8,20}$/'], 'whatsapp_template' => $text(2000, true),
            'currency' => $text(10, true), 'payment_instructions' => $text(1000),
            'site_name' => $text(80, true), 'tagline' => $text(160), 'hero_title' => $text(80, true), 'hero_title_mark' => $text(80), 'hero_subtitle' => $text(400, true),
            'hero_badge' => $text(80), 'announcement' => $text(500), 'announcement_color' => ['required', Rule::in(array_keys(Setting::ANNOUNCEMENT_COLORS))],
            'announcement_link' => $url, 'announcement_from' => ['nullable', 'date'], 'announcement_to' => ['nullable', 'date', 'after:announcement_from'],
            'faq' => ['nullable', 'array', 'max:20'], 'faq.*.q' => $text(200, true), 'faq.*.a' => $text(1200, true),
            'max_students' => $int(1, 50), 'session_minutes' => $int(15, 525600, false),
            'voice_volume' => $int(0, 100),
            'facebook_url' => array_merge($url, ['regex:#^https?://(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)/#i']), 'instagram_url' => array_merge($url, ['regex:#^https?://(www\.)?instagram\.com/#i']),
            'contact_email' => ['nullable', 'email', 'max:255'], 'footer_text' => $text(300),
            'maintenance_message' => $text(600, true),
            'hidden' => ['nullable', 'array', 'max:300'], 'hidden.*' => ['string', 'regex:/^g([1-9]|1[0-2])-[a-z][a-z0-9]{1,19}$/'],
            'points_multiplier' => ['required', Rule::in(Setting::POINT_STEPS)],
        ];
        $attrs = self::SETTING_LABELS + [
            'prices.*.price' => 'السعر', 'prices.*.days' => 'مدة الاشتراك', 'faq.*.q' => 'السؤال', 'faq.*.a' => 'الجواب', 'extra.*' => 'رمز المادة',
        ];
        $messages = [
            'required' => 'حقل «:attribute» مطلوب.', 'integer' => 'حقل «:attribute» يقبل عددًا صحيحًا فقط.', 'string' => 'حقل «:attribute» نصّ غير صالح.',
            'min' => ['numeric' => 'قيمة «:attribute» يجب ألّا تقل عن :min.', 'array' => 'أضف عنصرًا واحدًا على الأقل في «:attribute».'],
            'max' => ['numeric' => 'قيمة «:attribute» يجب ألّا تزيد على :max.', 'string' => 'نص «:attribute» أطول من الحد المسموح (:max حرفًا).', 'array' => 'عدد العناصر في «:attribute» أكبر من المسموح.'],
            'url' => 'اكتب في «:attribute» رابطًا كاملًا يبدأ بـ https://', 'email' => 'اكتب في «:attribute» بريدًا إلكترونيًا صحيحًا.',
            'date' => 'اكتب في «:attribute» تاريخًا صحيحًا.', 'after' => 'يجب أن تكون «نهاية عرض الإعلان» بعد بدايته.', 'in' => 'اختر قيمة صحيحة في «:attribute».',
            'whatsapp_number.regex' => 'اكتب رقم واتساب بالصيغة الدولية بأرقام فقط، مثل 970599000000.',
            'facebook_url.regex' => 'رابط فيسبوك يجب أن يكون من facebook.com.', 'instagram_url.regex' => 'رابط إنستغرام يجب أن يكون من instagram.com.',
            'extra.*.regex' => 'رمز مادة مضافة غير صالح.', 'hidden.*.regex' => 'رمز مادة مخفية غير صالح.', 'array' => 'قيمة «:attribute» غير صالحة.',
        ];
        // Numbers may arrive in Arabic-Indic digits (the form shows them so); validate them as ASCII.
        $ascii = fn ($x) => is_string($x) ? strtr(trim($x), ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']) : $x;
        $merge = [];
        foreach (['trial_days', 'grace_days', 'reminder_days', 'max_pending', 'pending_expire_days', 'max_students', 'session_minutes', 'voice_volume', 'whatsapp_number'] as $k) {
            if ($request->has($k)) {
                $merge[$k] = $ascii($request->input($k));
            }
        }
        $merge['prices'] = array_map(fn ($row) => is_array($row) ? array_map($ascii, $row) : $row, (array) $request->input('prices', []));
        // A partial submission (API or older form) keeps the stored value of every field it leaves out.
        $current = Setting::all_();
        foreach (array_keys(self::SETTING_LABELS) as $k) {
            if (! in_array($k, self::FLAGS, true) && ! in_array($k, ['prices', 'catalog_extra', 'faq', 'subjects_hidden'], true) && ! $request->exists($k)) {
                $merge[$k] = $current[$k];
            }
        }
        if (! $request->exists('faq') && ! $request->has('_sent')) {
            $merge['faq'] = Setting::get('faq') === '' ? null : Setting::faq();
        }
        if (! $request->exists('hidden') && ! $request->has('_sent')) {
            $merge['hidden'] = Setting::hiddenSubjects();
        }
        if (! $request->exists('extra') && ! $request->has('_sent')) {
            $merge['extra'] = array_keys(Setting::extraCatalog());
        }
        $request->merge($merge);
        $data = $request->validate($rules, $messages, $attrs);

        // Catalog: built-in units plus admin-added units (extra[] = code, name from SUBJECT_CHOICES or the posted name).
        $extraLines = [];
        foreach (array_unique((array) ($data['extra'] ?? [])) as $code) {
            if (isset(Ar::SUBJECTS[$code])) {
                continue;
            }
            [$g, $slug] = [(int) substr(strtok($code, '-'), 1), substr($code, strpos($code, '-') + 1)];
            $name = trim((string) $request->input('extra_name.'.$code)) ?: (Setting::extraCatalog()[$code][1] ?? self::SUBJECT_CHOICES[$slug] ?? '');
            if ($name === '' || mb_strlen($name) > 40 || str_contains($name, '|')) {
                return back()->withInput()->withErrors(['extra' => 'اكتب اسمًا صالحًا لكل مادة مضافة (أربعون حرفًا على الأكثر).']);
            }
            $extraLines[$code] = $code.'|'.$g.'|'.$name;
        }
        $known = array_merge(array_keys(Ar::SUBJECTS), array_keys($extraLines));
        $lines = [];
        foreach ($known as $code) {
            if (isset($data['prices'][$code])) {
                $lines[] = $code.'|'.(int) $data['prices'][$code]['price'].'|'.(int) $data['prices'][$code]['days'].'|'.(($request->has('_sent') ? $request->boolean('prices.'.$code.'.active') : (isset($data['prices'][$code]['active']) ? filter_var($data['prices'][$code]['active'], FILTER_VALIDATE_BOOL) : (Setting::plans()[$code]['active'] ?? true))) ? '1' : '0');
            }
        }
        $faq = array_values(array_map(fn ($i) => ['q' => trim($i['q']), 'a' => trim($i['a'])], (array) ($data['faq'] ?? [])));
        $values = [
            'prices' => implode("\n", $lines), 'catalog_extra' => implode("\n", $extraLines),
            'trial_days' => (int) $data['trial_days'], 'grace_days' => (int) $data['grace_days'], 'reminder_days' => (int) $data['reminder_days'],
            'max_pending' => (int) $data['max_pending'], 'pending_expire_days' => (int) $data['pending_expire_days'],
            'whatsapp_number' => preg_replace('/\D+/', '', (string) $data['whatsapp_number']), 'whatsapp_template' => str_replace("\r\n", "\n", trim($data['whatsapp_template'])),
            'currency' => trim($data['currency']), 'payment_instructions' => str_replace("\r\n", "\n", trim((string) $data['payment_instructions'])),
            'site_name' => trim($data['site_name']), 'tagline' => trim((string) $data['tagline']), 'hero_title' => trim($data['hero_title']),
            'hero_title_mark' => trim((string) $data['hero_title_mark']), 'hero_subtitle' => trim($data['hero_subtitle']), 'hero_badge' => trim((string) $data['hero_badge']),
            'announcement' => trim((string) $data['announcement']), 'announcement_color' => $data['announcement_color'], 'announcement_link' => trim((string) $data['announcement_link']),
            'announcement_from' => (string) ($data['announcement_from'] ?? ''), 'announcement_to' => (string) ($data['announcement_to'] ?? ''),
            'faq' => $faq ? json_encode($faq, JSON_UNESCAPED_UNICODE) : '',
            'max_students' => (int) $data['max_students'], 'session_minutes' => $data['session_minutes'] === null ? '' : (string) (int) $data['session_minutes'],
            'voice_volume' => (int) $data['voice_volume'],
            'facebook_url' => trim((string) $data['facebook_url']), 'instagram_url' => trim((string) $data['instagram_url']),
            'contact_email' => strtolower(trim((string) $data['contact_email'])), 'footer_text' => trim((string) $data['footer_text']),
            'maintenance_message' => trim($data['maintenance_message']),
            'subjects_hidden' => implode("\n", array_values(array_intersect(array_keys(Setting::catalog()), (array) ($data['hidden'] ?? [])))),
            'points_multiplier' => (string) $data['points_multiplier'],
        ];
        foreach (self::FLAGS as $f) {
            $values[$f] = ($request->has('_sent') || $request->exists($f) ? $request->boolean($f) : $current[$f] === '1') ? '1' : '0';
        }
        $changed = Setting::put($values);
        if ($changed) {
            ActivityLog::record('settings.update', implode('، ', array_map(fn ($k) => self::SETTING_LABELS[$k] ?? $k, $changed)), implode(', ', $changed));
        }
        $tab = preg_match('/^[a-z]{2,20}$/', (string) $request->input('tab')) ? $request->input('tab') : null;

        return redirect()->route('manage.settings', $tab ? ['tab' => $tab] : [])
            ->with('status', $changed ? 'حُفظت الإعدادات بنجاح ('.match (true) { count($changed) === 1 => 'تعديل واحد', count($changed) === 2 => 'تعديلان', count($changed) <= 10 => Ar::num(count($changed)).' تعديلات', default => Ar::num(count($changed)).' تعديلًا' }.').' : 'لا تغييرات جديدة للحفظ.');
    }

    // ---- Email ----
    public function mail(Request $request): View
    {
        $q = MailLog::query();
        if (array_key_exists($t = (string) $request->query('type'), MailCenter::TYPES)) {
            $q->where('type', $t);
        }
        if (array_key_exists($st = (string) $request->query('status'), MailLog::STATUS)) {
            $q->where('status', $st);
        }

        return view('manage.mail', ['s' => Setting::all_(), 'logs' => $q->latest('id')->paginate(30)->withQueryString(), 'from' => (string) config('mail.from.address'), 'mailer' => (string) config('mail.default')]);
    }

    public function updateMail(Request $request): RedirectResponse
    {
        $rules = ['mail_from_name' => ['required', 'string', 'max:80']];
        foreach (array_keys(MailCenter::TYPES) as $t) {
            $rules['mail_'.$t.'_subject'] = ['nullable', 'string', 'max:200'];
            $rules['mail_'.$t.'_body'] = ['nullable', 'string', 'max:5000'];
        }
        $data = $request->validate($rules, ['required' => 'هذا الحقل مطلوب.', 'max' => 'النص أطول من الحد المسموح.']);
        foreach (array_keys(MailCenter::TYPES) as $t) {
            $data['mail_'.$t.'_on'] = $request->boolean('mail_'.$t.'_on') ? '1' : '0';
        }
        Setting::put(array_map(fn ($v) => is_string($v) ? trim($v) : (string) $v, $data));
        ActivityLog::record('mail.settings');

        return back()->with('status', 'حُفظت إعدادات البريد.');
    }

    /** Live preview of one template (unsaved text) rendered in the real branded layout. */
    public function previewMail(Request $request): \Illuminate\Http\Response
    {
        $data = $request->validate(['type' => ['required', 'in:'.implode(',', array_keys(MailCenter::TYPES))], 'subject' => ['nullable', 'string', 'max:200'], 'body' => ['nullable', 'string', 'max:5000']]);
        $m = MailCenter::render($data['type'], (string) $request->user()->name, '#', ['subject' => (string) ($data['subject'] ?? ''), 'body' => (string) ($data['body'] ?? '')]);

        return response(view('mail.brand', ['m' => $m])->render())->header('Content-Type', 'text/html; charset=utf-8')->header('X-Frame-Options', 'SAMEORIGIN');
    }

    public function testMail(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', 'in:'.implode(',', array_keys(MailCenter::TYPES))], 'to' => ['required', 'email', 'max:255']], ['to.required' => 'أدخل بريد الاستلام.', 'to.email' => 'أدخل بريدًا إلكترونيًا صالحًا.']);
        $link = match ($data['type']) {
            'verify' => MailCenter::verifyUrl($request->user()),
            'reset' => route('account.password.request'),
            default => MailCenter::welcomeLink(),
        };
        $log = MailCenter::send($data['type'], $request->user(), $link, true, $data['to']);
        ActivityLog::record('mail.test', $data['to'], MailCenter::TYPES[$data['type']]);

        return back()->with($log->status === 'sent' ? 'status' : 'mail_error', $log->status === 'sent' ? 'أُرسلت رسالة تجريبية إلى '.$data['to'].'.' : 'فشل الإرسال: '.$log->error);
    }

    public function verifyUser(User $user): RedirectResponse
    {
        if (! $user->isVerified()) {
            $user->forceFill(['email_verified_at' => now()])->save();
            ActivityLog::record('user.verify', $user->email);
        }

        return back()->with('status', 'عُلّم البريد مفعّلًا.');
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
