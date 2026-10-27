<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Subscription;
use App\Payments\WhatsAppGateway;
use App\Support\Access;
use App\Support\Ar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class HomeController extends Controller
{
    private const MSG = ['name.required' => 'أدخل اسم الطالب.', 'name.max' => 'اسم الطالب أطول من ٢٤ محرفًا.', 'grade.required' => 'اختر الصف.', 'grade.in' => 'اختر صفًا من القائمة.', 'pin.digits' => 'الرقم السري أربعة أرقام.'];

    public function index(Request $request): View
    {
        $user = $request->user()->load(['students' => fn ($q) => $q->orderBy('id')->with('classrooms:id,name')]);
        $subs = $user->subscriptions()->latest()->take(10)->get();
        $this->funnelTrial($user);

        return view('account.home', ['user' => $user, 'access' => Access::state($user), 'subscriptions' => $subs, 'expiring' => Access::expiringSoon($user), 'grades' => Setting::gradeOptions(), 'pinOn' => (bool) config('app.child_pin'), 'childAdded' => session('child_added'), 'siteUrl' => rtrim((string) config('app.student_site_url'), '/')]);
    }

    /** Once per account: note in the journey log that the free trial ends within two days (or has ended). */
    private function funnelTrial($user): void
    {
        try {
            $t = $user->trial_ends_at;
            if (! $t || $user->isStaff() || $t->gt(now()->addDays(2)) || ! \App\Support\Funnel::ready()) {
                return;
            }
            $ev = $t->isPast() ? 'trial_ended' : 'trial_ending';
            if (! \Illuminate\Support\Facades\DB::table('funnel_events')->where('user_id', $user->id)->where('event', $ev)->exists()) {
                \App\Support\Funnel::log($ev, ['user_id' => $user->id, 'meta' => ['until' => $t->toDateString()]]);
            }
        } catch (\Throwable) {
        }
    }

    private function rules(): array
    {
        return ['name' => ['required', 'string', 'max:24'], 'grade' => ['required', Rule::in(array_keys(Setting::gradeOptions()))], 'pin' => ['nullable', 'digits:4']];
    }

    /** Arabic-Indic digits are accepted and normalised. */
    private function pin(Request $request): ?string
    {
        $pin = strtr((string) $request->input('pin', ''), ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']);

        return preg_match('/^\d{4}$/', $pin) ? $pin : null;
    }

    public function storeStudent(Request $request): RedirectResponse
    {
        $request->merge(['pin' => $this->pin($request) ?? ($request->filled('pin') ? 'x' : null)]);
        $data = $request->validate($this->rules(), self::MSG);
        if ($request->user()->students()->count() >= ($max = Setting::int('max_students', 1, 50))) {
            return back()->withErrors(['name' => 'وصلت إلى الحد الأقصى لعدد الطلاب في الحساب ('.Ar::num($max).').']);
        }
        $s = $request->user()->students()->make(['name' => trim($data['name']), 'grade' => (int) $data['grade']]);
        if (config('app.child_pin')) {
            $s->setPin($this->pin($request));
        }
        $s->save();
        ActivityLog::record('student.create', $s->name);
        \App\Support\Funnel::log('child_created', ['student_id' => $s->id, 'meta' => ['grade' => $s->grade]]);

        return back()->with('status', 'أُضيف «'.$s->name.'» بنجاح 🌱 اضغط «ابدأ التعلّم» ليبدأ أول درس.')->with('child_added', $s->id);
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $request->merge(['pin' => $this->pin($request) ?? ($request->filled('pin') ? 'x' : null)]);
        $data = $request->validate($this->rules(), self::MSG);
        $student->fill(['name' => trim($data['name']), 'grade' => (int) $data['grade']]);
        if (config('app.child_pin')) {
            $student->setPin($this->pin($request)); // PIN off: the saved PIN is kept untouched
        }
        $student->save();
        ActivityLog::record('student.update', $student->name);

        return back()->with('status', 'حُفظت بيانات الطالب.');
    }

    /** Daily reminder on/off for this account (all devices). */
    public function toggleReminders(Request $request): RedirectResponse
    {
        $on = $request->boolean('on');
        $request->user()->forceFill(['push_reminders' => $on])->save();

        return back()->with('status', $on ? 'سنذكّرك يوميًا بدرس اليوم.' : 'أوقفنا التذكير اليومي. يمكنك تشغيله متى شئت.');
    }

    public function destroyStudent(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $request->validate(['confirm' => ['accepted']], ['confirm.accepted' => 'أكّد الحذف أولًا.']);
        ActivityLog::record('student.delete', $student->name);
        $student->delete();

        return back()->with('status', 'حُذف الطالب وتقدّمه من الخادم. يبقى ما على الأجهزة كما هو.');
    }

    /** Subjects (plan codes) a student already has, active or waiting for payment: they cannot be ordered again. */
    private function taken($user, ?Student $student): array
    {
        $out = [];
        foreach ($user->subscriptions()->whereIn('status', ['pending', 'active'])->where(fn ($q) => $student ? $q->where('student_id', $student->id)->orWhereNull('student_id') : $q)->get() as $s) {
            if ($s->status === 'active' && $s->ends_at && $s->ends_at->isPast()) {
                continue;
            }
            $out[$s->plan] = $s->status === 'active' ? 'active' : ($out[$s->plan] ?? 'pending');
        }

        return $out;
    }

    private function pickStudent(Request $request, $user, $id): ?Student
    {
        $students = $user->students->sortBy('id')->values();
        if ($students->isEmpty()) {
            return null;
        }

        return ($id ? $students->firstWhere('id', (int) $id) : null) ?? $students->first();
    }

    public function subscribe(Request $request): View
    {
        $user = $request->user()->load('students');
        $student = $this->pickStudent($request, $user, $request->query('student', old('student_id')));
        \App\Support\Funnel::log('subscribe_view', ['student_id' => $student?->id, 'meta' => ['pending' => $user->subscriptions()->where('status', 'pending')->count()]]);
        // Only the chosen child's grade: no other grades to pick by mistake.
        $plans = $student ? array_filter(Setting::plans(true), fn ($p) => (int) $p['grade'] === (int) $student->grade) : [];

        return view('account.subscribe', [
            'user' => $user, 'student' => $student, 'taken' => $student ? $this->taken($user, $student) : [], 'sent' => $request->boolean('sent'),
            'access' => Access::state($user), 'plans' => $plans, 'currency' => Setting::get('currency'), 'instructions' => Setting::get('payment_instructions'),
            'pending' => $user->subscriptions()->where('status', 'pending')->with('student:id,name')->latest()->get(),
            'hasNumber' => WhatsAppGateway::number() !== '', 'gateway' => new WhatsAppGateway,
        ]);
    }

    public function requestSubscription(Request $request): RedirectResponse
    {
        \App\Models\Subscription::sweep();
        $plans = Setting::plans(true);
        $data = $request->validate([
            'plan' => ['required_without:plans', 'nullable', Rule::in(array_keys($plans))],
            'plans' => ['required_without:plan', 'nullable', 'array', 'max:16'],
            'plans.*' => ['string', Rule::in(array_keys($plans))],
            'student_id' => ['nullable', 'integer'],
        ], ['plan.required_without' => 'اختر مادة واحدة على الأقل.', 'plans.required_without' => 'اختر مادة واحدة على الأقل.', 'plan.in' => 'اختر مادة من القائمة.', 'plans.*.in' => 'اختر مادة من القائمة.', 'plans.max' => 'اختر ١٦ مادة على الأكثر.']);
        $codes = array_values(array_unique(array_filter(array_merge((array) ($data['plans'] ?? []), [$data['plan'] ?? null]))));
        if ($codes === []) {
            return back()->withErrors(['plan' => 'اختر مادة واحدة على الأقل.']);
        }
        $user = $request->user();
        $student = ! empty($data['student_id']) ? $user->students()->findOrFail($data['student_id']) : null;
        if (! $student && $user->students()->exists()) {
            return back()->withErrors(['plan' => 'اختر طفلك أولًا، ثم اختر مواد صفه.']);
        }
        if ($student && ($wrong = array_filter($codes, fn ($c) => (int) $plans[$c]['grade'] !== (int) $student->grade))) {
            return back()->withErrors(['plan' => 'هذه المواد ليست من صف '.$student->name.'. اختر من مواد '.Ar::grade($student->grade).'.'])->withInput();
        }
        $back = fn () => redirect()->route('account.subscribe', array_filter(['student' => $student?->id]));
        // Dedupe on the server: a subject already active for this child is skipped; one already waiting is reused (no second request).
        $taken = $this->taken($user, $student);
        $active = array_values(array_filter($codes, fn ($c) => ($taken[$c] ?? null) === 'active'));
        $codes = array_values(array_filter($codes, fn ($c) => ($taken[$c] ?? null) !== 'active'));
        if ($codes === []) {
            return $back()->withErrors(['plan' => 'هذه المواد مفعّلة لطفلك من قبل، ولا حاجة لطلبها مرة أخرى.']);
        }
        $existing = $user->subscriptions()->where('status', 'pending')->whereIn('plan', $codes)
            ->where(fn ($q) => $student ? $q->where('student_id', $student->id) : $q->whereNull('student_id'))->get()->keyBy('plan');
        $new = array_values(array_filter($codes, fn ($c) => ! $existing->has($c)));
        $pending = $user->subscriptions()->where('status', 'pending')->count();
        $max = Setting::int('max_pending', 1, 50);
        if ($new && $pending + count($new) > $max) {
            return $back()->withErrors(['plan' => 'لديك طلبات بانتظار الدفع. الحد الأقصى للطلبات المفتوحة '.Ar::num($max).'؛ أتمّ الدفع أو انتظر معالجة طلباتك السابقة.']);
        }
        $subs = [];
        $batch = count($new) > 1 ? 'R-'.strtoupper(Str::random(6)) : null;
        foreach ($new as $code) {
            $plan = $plans[$code];
            $sub = new Subscription([
                'code' => strtoupper(Str::random(4)).'-'.random_int(1000, 9999), 'plan' => $plan['code'], 'plan_name' => $plan['name'],
                'price' => $plan['price'], 'currency' => Setting::get('currency'), 'days' => $plan['days'],
                'scope' => $plan['code'], 'gateway' => 'whatsapp', 'status' => 'pending',
            ]);
            $sub->student_id = $student?->id;
            $sub->batch = $batch;
            $user->subscriptions()->save($sub);
            $subs[] = $sub->setRelation('user', $user)->setRelation('student', $student);
        }
        if ($subs) {
            // One submission = one activity entry listing every subject (codes kept for the WhatsApp match).
            ActivityLog::record('subscription.request', $batch ?? $subs[0]->code, collect($subs)->map(fn ($s) => $s->code.' '.$s->plan_name)->join('؛ '));
            \App\Support\Funnel::log('order_created', ['student_id' => $student?->id, 'count' => count($subs), 'meta' => ['plans' => collect($subs)->pluck('plan')->join(','), 'ref' => $batch ?? $subs[0]->code]]);
        } else {
            \App\Support\Funnel::log('order_repeat', ['student_id' => $student?->id, 'count' => $existing->count(), 'meta' => ['plans' => $existing->keys()->join(',')]]);
        }
        foreach ($existing as $e) {
            $subs[] = $e->setRelation('user', $user)->setRelation('student', $student);
        }
        $url = (new WhatsAppGateway)->batchCheckoutUrl($subs);
        $list = collect($subs)->pluck('code')->join('، ');

        return $url ? redirect()->away($url) : $back()->with('status', 'تم استلام طلبك برمز '.$list.'. سنتواصل معك لإتمام الدفع، ونفعّل المواد فور التأكيد.');
    }

    /** Parent puts a child in a teacher's class with the class code. */
    public function joinClass(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $code = \App\Models\Classroom::normalizeCode((string) $request->input('code'));
        $c = $code !== '' ? \App\Models\Classroom::where('code', $code)->where('join_open', true)->first() : null;
        if (! $c) {
            return back()->withErrors(['code'.$student->id => 'رمز الصف غير صحيح أو أن الانضمام مغلق. تأكد من الرمز مع المعلّم.'])->withInput();
        }
        $c->students()->syncWithoutDetaching([$student->id => ['joined_at' => now()]]);
        \App\Models\ActivityLog::record('class.join', $student->name, $c->name);

        return back()->with('status', 'انضم '.$student->name.' إلى «'.$c->name.'». يستطيع معلّم الصف الآن رؤية تقدّمه.');
    }

    public function leaveClass(Request $request, Student $student, \App\Models\Classroom $classroom): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $classroom->students()->detach($student->id);
        \App\Models\ActivityLog::record('class.leave', $student->name, $classroom->name);

        return back()->with('status', 'غادر '.$student->name.' «'.$classroom->name.'»، ولم يعد معلّمه يرى تقدّمه.');
    }
}
