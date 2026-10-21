<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use App\Support\Access;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class AuthController extends Controller
{
    public const MESSAGES = [
        'name.required' => 'أدخل الاسم.', 'name.max' => 'الاسم أطول من الحد المسموح.',
        'email.required' => 'أدخل البريد الإلكتروني.', 'email.email' => 'أدخل بريدًا إلكترونيًا صالحًا.',
        'email.max' => 'البريد الإلكتروني أطول من الحد المسموح.', 'email.unique' => 'هذا البريد مسجّل من قبل. سجّل الدخول أو استعد كلمة المرور.',
        'password.required' => 'أدخل كلمة المرور.', 'password.min' => 'كلمة المرور يجب أن تتكون من ٨ محارف على الأقل.',
        'password.confirmed' => 'كلمتا المرور غير متطابقتين.', 'password.max' => 'كلمة المرور أطول من الحد المسموح.',
        'token.required' => 'رابط إعادة التعيين غير صالح.',
    ];

    private function lower(Request $request): void
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => Str::lower(trim($request->input('email')))]);
        }
    }

    private function passwordRules(): array
    {
        return ['required', 'string', 'confirmed', PasswordRule::min(8), 'max:72'];
    }

    public function registerForm(): View
    {
        return view('account.register', ['open' => Setting::flag('registration_open')]);
    }

    public function register(Request $request): RedirectResponse
    {
        abort_unless(Setting::flag('registration_open'), 403, 'التسجيل مغلق حاليًا.');
        $this->lower($request);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
        ], self::MESSAGES);

        $user = DB::transaction(function () use ($data) {
            $user = new User(['name' => trim($data['name']), 'email' => $data['email'], 'password' => $data['password']]);
            $user->setRole('parent');
            // One free trial per email (normalized), even if the account is deleted and re-created.
            $hash = Access::normalizedEmailHash($data['email']);
            if (! DB::table('trial_claims')->where('email_hash', $hash)->exists()) {
                $user->trial_ends_at = now()->addDays(max(0, (int) Setting::get('trial_days')));
                DB::table('trial_claims')->insert(['email_hash' => $hash, 'created_at' => now()]);
            }
            $user->last_login_at = now();
            $user->save();

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();
        ActivityLog::record('register', $user->email, null, $user);

        return redirect()->route('account.home')->with('status', 'أهلًا بك! أُنشئ حسابك. أضف الآن طلابك.');
    }

    public function loginForm(): View
    {
        return view('account.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $this->lower($request);
        $data = $request->validate(['email' => ['required', 'string', 'email', 'max:255'], 'password' => ['required', 'string', 'max:1024']], self::MESSAGES);
        $key = 'account-login:'.hash('sha256', $data['email'].'|'.$request->ip());
        $ipKey = 'account-login-ip:'.hash('sha256', (string) $request->ip());
        if (RateLimiter::tooManyAttempts($key, 5) || RateLimiter::tooManyAttempts($ipKey, 30)) {
            $s = max(RateLimiter::availableIn($key), RateLimiter::availableIn($ipKey));
            throw ValidationException::withMessages(['email' => 'محاولات الدخول كثيرة. حاول مجددًا بعد '.\App\Support\Ar::num($s).' ثانية.']);
        }
        if (! Auth::attempt(['email' => $data['email'], 'password' => $data['password']], $request->boolean('remember'))) {
            RateLimiter::hit($key, 60);
            RateLimiter::hit($ipKey, 60);
            throw ValidationException::withMessages(['email' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة.']);
        }
        $user = Auth::user();
        if ($user->isDisabled()) {
            Auth::logout();
            throw ValidationException::withMessages(['email' => 'هذا الحساب معطّل. تواصل مع إدارة الموقع.']);
        }
        RateLimiter::clear($key);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->save();
        ActivityLog::record('login', $user->email);

        return redirect()->intended(route('account.home', absolute: false));
    }

    public function logout(Request $request): RedirectResponse
    {
        ActivityLog::record('logout');
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('account.login')->with('status', 'تم تسجيل الخروج. تقدّم الطلاب محفوظ.');
    }

    public function forgotForm(): View
    {
        return view('account.forgot');
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $this->lower($request);
        $data = $request->validate(['email' => ['required', 'string', 'email', 'max:255']], self::MESSAGES);
        $user = User::where('email', $data['email'])->first();
        if ($user && ! $user->isDisabled()) {
            Password::sendResetLink(['email' => $data['email']]);
        }

        // Same answer whether or not the address exists (no account enumeration).
        return back()->with('status', 'إن كان البريد مسجّلًا لدينا فستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة خلال دقائق.');
    }

    public function resetForm(Request $request, string $token): View
    {
        return view('account.reset', ['token' => $token, 'email' => (string) $request->query('email', '')]);
    }

    public function reset(Request $request): RedirectResponse
    {
        $this->lower($request);
        $request->validate(['token' => ['required'], 'email' => ['required', 'email'], 'password' => $this->passwordRules()], self::MESSAGES);
        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
            ActivityLog::record('password.reset', $user->email, null, $user);
        });
        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => 'رابط إعادة التعيين غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.']);
        }

        return redirect()->route('account.login')->with('status', 'تم تعيين كلمة المرور الجديدة. سجّل الدخول الآن.');
    }
}
