<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use App\Support\Funnel;
use App\Support\InApp;
use App\Support\MailCenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

/** "الدخول بحساب Google" for parent accounts. */
class GoogleAuthController extends Controller
{
    private function fail(string $message): RedirectResponse
    {
        Funnel::log('google_fail', ['meta' => ['reason' => 'refused', 'msg' => mb_substr($message, 0, 50)]]);
        return redirect()->route('account.login')->withErrors(['email' => $message]);
    }

    public static function enabled(): bool
    {
        return (string) config('services.google.client_id') !== '' && (string) config('services.google.client_secret') !== '';
    }

    /** One structured log line per Google attempt step, so failures are measurable (grep "google.oauth"). */
    private static function trace(Request $request, string $event, array $extra = []): void
    {
        Log::channel('google')->info('google.oauth '.$event, $extra + [
            'ip' => $request->ip(), 'host' => $request->getHost(), 'ua' => mb_substr((string) $request->userAgent(), 0, 300),
            'inapp' => InApp::of($request), 'has_cookie' => $request->hasCookie(config('session.cookie')),
            'has_state' => $request->filled('state'), 'retry' => (bool) $request->session()->get('google_retry'),
        ]);
        // Journey log: the start of a Google attempt and every way it can fail (bots/crawlers excluded).
        if ($event === 'started') {
            Funnel::log('google_start', ['meta' => array_filter(['inapp' => InApp::of($request)])]);
        } elseif (in_array($event, ['inapp_blocked', 'state_fail_retry', 'state_fail_final', 'error', 'cancelled', 'no_code'], true)) {
            Funnel::log('google_fail', ['meta' => array_filter(['reason' => $event, 'inapp' => InApp::of($request)])]);
        }
    }

    public function redirect(Request $request): RedirectResponse
    {
        if (! self::enabled()) {
            return $this->fail('الدخول بحساب Google غير متاح حاليًا. استخدم البريد الإلكتروني وكلمة المرور.');
        }
        // Google blocks sign-in inside Facebook/Instagram/TikTok webviews (disallowed_useragent): send them to the
        // "open in browser" helper on the register page instead of a Google error page.
        if (InApp::of($request)) {
            self::trace($request, 'inapp_blocked');

            return redirect()->route('account.register', array_filter(['return' => $request->query('return')]));
        }
        AuthController::rememberReturn($request);
        if ($request->boolean('retry')) {
            $request->session()->put('google_retry', 1);
        } else {
            $request->session()->forget('google_retry');
        }
        self::trace($request, 'started');

        return Socialite::driver('google')->scopes(['openid', 'email', 'profile'])->with(['prompt' => 'select_account'])->redirect();
    }

    /** State lost (cookie dropped, tab switched, back button): restart once, then fall back to email signup. */
    private function stateFailed(Request $request): RedirectResponse
    {
        if (! $request->session()->get('google_retry') && ! $request->cookie('bk_g_retry')) {
            self::trace($request, 'state_fail_retry');

            return redirect()->route('account.google', ['retry' => 1])->withCookie(cookie('bk_g_retry', '1', 5, null, null, true, true, false, 'lax'));
        }
        self::trace($request, 'state_fail_final');
        $request->session()->forget('google_retry');

        return redirect()->route('account.register', ['email' => 1])->withoutCookie('bk_g_retry')
            ->with('status', 'لم يكتمل الدخول بحساب Google هذه المرة. أنشئ حسابك بالبريد الإلكتروني في أقل من دقيقة، أو جرّب Google لاحقًا.');
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! self::enabled()) {
            return $this->fail('الدخول بحساب Google غير متاح حاليًا. استخدم البريد الإلكتروني وكلمة المرور.');
        }
        if ($request->has('error')) {
            self::trace($request, 'cancelled', ['error' => mb_substr((string) $request->query('error'), 0, 60)]);

            return redirect()->route('account.register')->with('status', 'أُلغي الدخول بحساب Google. يمكنك المحاولة مرة أخرى أو التسجيل بالبريد الإلكتروني.');
        }
        // Link-preview crawlers (facebookexternalhit…) and bots open the bare callback URL with no state/code.
        if (! $request->filled('state') || ! $request->filled('code')) {
            self::trace($request, InApp::isBot($request->userAgent()) ? 'bot_hit' : 'no_code');

            return redirect()->route('account.login');
        }
        try {
            $g = Socialite::driver('google')->user();
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            return $this->stateFailed($request);
        } catch (\Throwable $e) {
            self::trace($request, 'error', ['ex' => class_basename($e), 'msg' => mb_substr($e->getMessage(), 0, 200)]);

            return redirect()->route('account.register', ['email' => 1])->with('status', 'تعذّر الدخول بحساب Google الآن. أنشئ حسابك بالبريد الإلكتروني، أو جرّب Google بعد قليل.');
        }
        self::trace($request, 'callback_ok');
        $request->session()->forget('google_retry');
        \Illuminate\Support\Facades\Cookie::queue(\Illuminate\Support\Facades\Cookie::forget('bk_g_retry'));

        $googleId = (string) $g->getId();
        $email = Str::lower(trim((string) $g->getEmail()));
        $verified = filter_var($g->user['email_verified'] ?? $g->user['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if ($googleId === '' || $email === '' || ! $verified) {
            return $this->fail('بريدك في Google غير مؤكَّد. أكّده في Google أولًا أو سجّل الدخول بالبريد وكلمة المرور.');
        }

        $user = User::where('google_id', $googleId)->first();
        $created = false;
        if (! $user) {
            $user = User::where('email', $email)->first();
            if ($user) {
                if ($user->google_id && $user->google_id !== $googleId) {
                    return $this->fail('هذا البريد مربوط بحساب Google آخر. سجّل الدخول بالبريد وكلمة المرور.');
                }
                if ($user->isStaff()) {
                    return $this->fail('حسابات الإدارة لا تدخل بحساب Google. استخدم صفحة دخول الإدارة.');
                }
                if ($user->isDisabled()) {
                    return $this->fail('هذا الحساب معطّل. تواصل مع إدارة الموقع.');
                }
                $user->forceFill(['google_id' => $googleId, 'email_verified_at' => $user->email_verified_at ?? now()])->save();
                ActivityLog::record('google.link', $user->email, null, $user);
            } else {
                if (! Setting::flag('registration_open')) {
                    return $this->fail('لا يوجد حساب بهذا البريد، والتسجيل مغلق حاليًا.');
                }
                $name = trim((string) ($g->getName() ?: Str::before($email, '@')));
                $user = DB::transaction(function () use ($name, $email, $googleId) {
                    $user = new User(['name' => Str::limit($name, 80, ''), 'email' => $email, 'password' => Str::random(64)]);
                    $user->setRole('parent');
                    $user->google_id = $googleId;
                    $user->email_verified_at = now();
                    AuthController::claimTrial($user);
                    $user->save();

                    return $user;
                });
                $created = true;
            }
        }

        if ($user->isStaff()) {
            return $this->fail('حسابات الإدارة لا تدخل بحساب Google. استخدم صفحة دخول الإدارة.');
        }
        if ($user->isDisabled()) {
            return $this->fail('هذا الحساب معطّل. تواصل مع إدارة الموقع.');
        }

        Auth::login($user, true);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->save();
        \App\Support\Devices::claim($request, $user);
        if ($created) {
            ActivityLog::record('register', $user->email, null, $user);
            AuthController::funnelSignup($user, 'google');
        } else {
            Funnel::link($user);
            Funnel::log('login', ['user_id' => $user->id, 'meta' => ['method' => 'google']]);
        }
        if ($created) {
            MailCenter::send('welcome', $user, MailCenter::welcomeLink());
        }
        ActivityLog::record('login', $user->email);
        \App\Support\Landing::scrubIntended($request);

        if ($created) {
            return redirect()->intended(route('account.home', absolute: false))->with('status', 'أهلًا بك! أُنشئ حسابك. أضف الآن طلابك.');
        }

        return redirect()->intended(\App\Support\Landing::home($user));
    }
}
