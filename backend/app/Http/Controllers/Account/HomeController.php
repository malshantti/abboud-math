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
        $user = $request->user()->load(['students' => fn ($q) => $q->orderBy('id')]);
        $subs = $user->subscriptions()->latest()->take(10)->get();

        return view('account.home', ['user' => $user, 'access' => Access::state($user), 'subscriptions' => $subs, 'expiring' => Access::expiringSoon($user), 'grades' => Setting::gradeOptions(), 'siteUrl' => rtrim((string) config('app.student_site_url'), '/')]);
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
        $s->setPin($this->pin($request));
        $s->save();
        ActivityLog::record('student.create', $s->name);

        return back()->with('status', 'أُضيف الطالب «'.$s->name.'».');
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $request->merge(['pin' => $this->pin($request) ?? ($request->filled('pin') ? 'x' : null)]);
        $data = $request->validate($this->rules(), self::MSG);
        $student->fill(['name' => trim($data['name']), 'grade' => (int) $data['grade']]);
        $student->setPin($this->pin($request));
        $student->save();
        ActivityLog::record('student.update', $student->name);

        return back()->with('status', 'حُفظت بيانات الطالب.');
    }

    public function destroyStudent(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $request->validate(['confirm' => ['accepted']], ['confirm.accepted' => 'أكّد الحذف أولًا.']);
        ActivityLog::record('student.delete', $student->name);
        $student->delete();

        return back()->with('status', 'حُذف الطالب وتقدّمه من الخادم. يبقى ما على الأجهزة كما هو.');
    }

    public function subscribe(Request $request): View
    {
        $user = $request->user()->load('students');

        return view('account.subscribe', [
            'user' => $user, 'access' => Access::state($user), 'plans' => Setting::plans(true), 'currency' => Setting::get('currency'), 'instructions' => Setting::get('payment_instructions'),
            'pending' => $user->subscriptions()->where('status', 'pending')->latest()->get(),
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
        $pending = $user->subscriptions()->where('status', 'pending')->count();
        $max = Setting::int('max_pending', 1, 50);
        if ($pending + count($codes) > $max) {
            return back()->withErrors(['plan' => 'لديك طلبات بانتظار الدفع. الحد الأقصى للطلبات المفتوحة '.Ar::num($max).'؛ أتمّ الدفع أو انتظر معالجة طلباتك السابقة.']);
        }
        $subs = [];
        $batch = count($codes) > 1 ? 'R-'.strtoupper(Str::random(6)) : null;
        foreach ($codes as $code) {
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
        // One submission = one activity entry listing every subject (codes kept for the WhatsApp match).
        ActivityLog::record('subscription.request', $batch ?? $subs[0]->code, collect($subs)->map(fn ($s) => $s->code.' '.$s->plan_name)->join('؛ '));
        $url = (new WhatsAppGateway)->batchCheckoutUrl($subs);
        $list = collect($subs)->pluck('code')->join('، ');

        return $url ? redirect()->away($url) : redirect()->route('account.subscribe')->with('status', (count($subs) > 1 ? 'سُجّلت طلباتك برموز ' : 'سُجّل طلبك برمز ').$list.'. سنتواصل معك لإتمام الدفع.');
    }
}
