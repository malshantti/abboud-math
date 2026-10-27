<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use App\Support\Access;
use App\Support\MailCenter;
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

    /** Remember a same-site page (a lesson) to return to after login/register. Anything off-site is ignored. */
    public static function rememberReturn(Request $request): void
    {
        $url = $request->query('return');
        if (! is_string($url) || $url === '' || strlen($url) > 2000 || preg_match('#[\s\x5c]#', $url)) {
            return;
        }
        $origin = $request->getSchemeAndHttpHost();
        if (str_starts_with($url, '/') && ! str_starts_with($url, '//')) {
            $url = $origin.$url;
        }
        $p = parse_url($url);
        if (! $p || ! in_array($p['scheme'] ?? '', ['http', 'https'], true) || isset($p['user']) || isset($p['pass'])
            || strcasecmp($p['host'] ?? '', $request->getHost()) !== 0 || ($p['scheme'].'://'.$p['host'].(isset($p['port']) ? ':'.$p['port'] : '')) !== $origin) {
            return;
        }
        if (\App\Support\Landing::isAdminUrl($request, $url)) {
            return; // never send account users back to an admin page
        }
        $request->session()->put('url.intended', $url);
    }

    /** One free trial per email (normalized), even if the account is deleted and re-created. Call inside a transaction. */
    public static function claimTrial(User $user): void
    {
        $hash = Access::normalizedEmailHash($user->email);
        if (! DB::table('trial_claims')->where('email_hash', $hash)->exists()) {
            $user->trial_ends_at = now()->addDays(max(0, (int) Setting::get('trial_days')));
            DB::table('trial_claims')->insert(['email_hash' => $hash, 'created_at' => now()]);
        }
    }

    public function registerForm(Request $request): View
    {
        self::rememberReturn($request);
        return view('account.register', ['open' => Setting::flag('registration_open')]);
    }

    public function register(Request $request): RedirectResponse
    {
        abort_unless(Setting::flag('registration_open'), 403, 'التسجيل مغلق حاليًا.');
        $this->botCheck($request);
        $this->lower($request);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            // No confirmation field on the signup form (show-password toggle instead); reset keeps 'confirmed'.
            'password' => ['required', 'string', PasswordRule::min(8), 'max:72'],
        ], self::MESSAGES);

        $user = DB::transaction(function () use ($data) {
            $user = new User(['name' => trim($data['name']), 'email' => $data['email'], 'password' => $data['password']]);
            $user->setRole('parent');
            self::claimTrial($user);
            $user->last_login_at = now();
            $user->save();

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();
        \App\Support\Devices::claim($request, $user);
        ActivityLog::record('register', $user->email, null, $user);
        self::funnelSignup($user, 'email');
        // Welcome email right away (the account works fully without verification), then the optional activation link.
        // If activation emails are switched off, the account simply counts as verified.
        MailCenter::send('welcome', $user, MailCenter::welcomeLink());
        if (MailCenter::enabled('verify')) {
            MailCenter::send('verify', $user, MailCenter::verifyUrl($user));
        } else {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
        \App\Support\Landing::scrubIntended($request);

        return redirect()->intended(route('account.home', absolute: false))->with('status', 'أهلًا بك! أُنشئ حسابك. أضف الآن طلابك.');
    }

    /** Minimum seconds between showing the signup form and submitting it (bots post instantly). */
    public const MIN_FILL_SECONDS = 3;

    /** Hidden honeypot field + signed form timestamp, both checked server-side. Google sign-in is not affected. */
    private function botCheck(Request $request): void
    {
        if (app()->runningUnitTests() && ! config('app.bot_check')) {
            return; // feature tests post the form directly; BotCheckTest turns this on
        }
        $reason = null;
        if (trim((string) $request->input('website', '')) !== '') {
            $reason = 'honeypot';
        } else {
            try {
                $at = (int) \Illuminate\Support\Facades\Crypt::decryptString((string) $request->input('form_t'));
            } catch (\Throwable) {
                $at = 0;
            }
            if ($at <= 0) {
                $reason = 'no_token';
            } elseif (time() - $at < self::MIN_FILL_SECONDS) {
                $reason = 'too_fast';
            }
        }
        if ($reason !== null) {
            \Illuminate\Support\Facades\Log::warning('register.blocked '.$reason, ['ip' => $request->ip(), 'ua' => mb_substr((string) $request->userAgent(), 0, 200)]);
            throw ValidationException::withMessages(['form' => 'لم يكتمل التسجيل. انتظر لحظة ثم اضغط «إنشاء الحساب» مرة أخرى.']);
        }
    }

    public function loginForm(Request $request): View
    {
        self::rememberReturn($request);
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
        \App\Support\Devices::claim($request, $user);
        ActivityLog::record('login', $user->email);
        if (! $user->isStaff()) {
            \App\Support\Funnel::link($user);
            \App\Support\Funnel::log('login', ['user_id' => $user->id, 'meta' => ['method' => 'email']]);
        }
        \App\Support\Landing::scrubIntended($request);

        return redirect()->intended(\App\Support\Landing::home($user));
    }

    /** Journey log for a new family account: link the anonymous visitor, then registered + trial started. Never blocks. */
    public static function funnelSignup(User $user, string $method): void
    {
        \App\Support\Funnel::link($user);
        \App\Support\Funnel::log('registered', ['user_id' => $user->id, 'meta' => ['method' => $method]]);
        if ($user->trial_ends_at) {
            \App\Support\Funnel::log('trial_started', ['user_id' => $user->id, 'meta' => ['until' => $user->trial_ends_at->toDateString()]]);
        }
    }

    public function logout(Request $request): RedirectResponse
    {
        ActivityLog::record('logout');
        if (($u = $request->user()) && ! $u->isStaff()) {
            \App\Support\Funnel::log('logout', ['user_id' => $u->id]);
        }
        Auth::logout();
        \App\Support\Devices::forget();
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
        // Links in our emails are signed and expire with the token (60 minutes).
        $expired = $request->has('signature') && ! $request->hasValidSignature();

        return view('account.reset', ['token' => $token, 'email' => (string) $request->query('email', ''), 'expired' => $expired]);
    }

    /** Activation link from the email. Works without being logged in (another device is fine). */
    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::find($id);
        $to = Auth::check() ? route('account.home') : route('account.login');
        if (! $request->hasValidSignature() || ! $user || ! hash_equals(sha1($user->email), $hash)) {
            return redirect($to)->withErrors(['email' => 'رابط التفعيل غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة حسابك.']);
        }
        if (! $user->isVerified()) {
            $user->forceFill(['email_verified_at' => now()])->save();
            ActivityLog::record('email.verify', $user->email, null, $user);
            \App\Support\Funnel::log('email_verified', ['user_id' => $user->id]);
            // Accounts created before the welcome moved to signup still get it once.
            if (! MailCenter::alreadySent($user, 'welcome')) {
                MailCenter::send('welcome', $user, MailCenter::welcomeLink());
            }
        }

        return redirect($to)->with('status', 'تم تفعيل حسابك وتأكيد بريدك الإلكتروني. شكرًا لك.');
    }

    public function resendVerification(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user->isVerified()) {
            return back()->with('status', 'حسابك مفعّل من قبل.');
        }
        $log = MailCenter::send('verify', $user, MailCenter::verifyUrl($user));

        return back()->with('status', $log->status === 'sent' ? 'أرسلنا رابط تفعيل جديدًا إلى بريدك. تفقّد صندوق الوارد والرسائل غير المرغوب فيها.' : 'تعذّر إرسال الرسالة الآن. حاول لاحقًا.');
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
