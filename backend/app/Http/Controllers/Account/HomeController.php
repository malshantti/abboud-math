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
    private const MSG = ['name.required' => 'أدخل اسم الطالب.', 'name.max' => 'اسم الطالب أطول من ٢٤ محرفًا.', 'grade.required' => 'اختر الصف.', 'grade.in' => 'اختر صفًا من القائمة.'];

    public function index(Request $request): View
    {
        $user = $request->user()->load('students');
        $subs = $user->subscriptions()->latest()->take(10)->get();

        return view('account.home', ['user' => $user, 'access' => Access::state($user), 'subscriptions' => $subs, 'siteUrl' => rtrim((string) config('app.student_site_url'), '/')]);
    }

    private function rules(): array
    {
        return ['name' => ['required', 'string', 'max:24'], 'grade' => ['required', Rule::in(array_keys(Ar::GRADES))]];
    }

    public function storeStudent(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules(), self::MSG);
        abort_if($request->user()->students()->count() >= 12, 422, 'وصلت إلى الحد الأقصى لعدد الطلاب.');
        $s = $request->user()->students()->create(['name' => trim($data['name']), 'grade' => (int) $data['grade']]);
        ActivityLog::record('student.create', $s->name);

        return back()->with('status', 'أُضيف الطالب «'.$s->name.'».');
    }

    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $data = $request->validate($this->rules(), self::MSG);
        $student->update(['name' => trim($data['name']), 'grade' => (int) $data['grade']]);
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
            'user' => $user, 'access' => Access::state($user), 'plans' => Setting::plans(), 'currency' => Setting::get('currency'),
            'pending' => $user->subscriptions()->where('status', 'pending')->latest()->get(),
            'hasNumber' => WhatsAppGateway::number() !== '', 'gateway' => new WhatsAppGateway,
        ]);
    }

    public function requestSubscription(Request $request): RedirectResponse
    {
        $plans = Setting::plans();
        $data = $request->validate([
            'plan' => ['required', Rule::in(array_keys($plans))],
            'student_id' => ['nullable', 'integer'],
        ], ['plan.required' => 'اختر المادة.', 'plan.in' => 'اختر مادة من القائمة.']);
        $user = $request->user();
        $student = ! empty($data['student_id']) ? $user->students()->findOrFail($data['student_id']) : null;
        abort_if($user->subscriptions()->where('status', 'pending')->count() >= 5, 429, 'لديك طلبات كثيرة بانتظار الدفع.');
        $plan = $plans[$data['plan']];
        $sub = new Subscription([
            'code' => strtoupper(Str::random(4)).'-'.random_int(1000, 9999), 'plan' => $plan['code'], 'plan_name' => $plan['name'],
            'price' => $plan['price'], 'currency' => Setting::get('currency'), 'days' => $plan['days'],
            'scope' => $plan['code'], 'gateway' => 'whatsapp', 'status' => 'pending',
        ]);
        $sub->student_id = $student?->id;
        $user->subscriptions()->save($sub);
        ActivityLog::record('subscription.request', $sub->code, $plan['name']);
        $url = (new WhatsAppGateway)->checkoutUrl($sub->setRelation('user', $user)->load('student'));

        return $url ? redirect()->away($url) : redirect()->route('account.subscribe')->with('status', 'سُجّل طلبك برمز '.$sub->code.'. سنتواصل معك لإتمام الدفع.');
    }
}
