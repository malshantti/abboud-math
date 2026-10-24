<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use App\Support\MailCenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

/** "الدخول بحساب جوجل" for parent accounts. */
class GoogleAuthController extends Controller
{
    private function fail(string $message): RedirectResponse
    {
        return redirect()->route('account.login')->withErrors(['email' => $message]);
    }

    public static function enabled(): bool
    {
        return (string) config('services.google.client_id') !== '' && (string) config('services.google.client_secret') !== '';
    }

    public function redirect(Request $request): RedirectResponse
    {
        if (! self::enabled()) {
            return $this->fail('الدخول بحساب جوجل غير متاح حاليًا. استخدم البريد الإلكتروني وكلمة المرور.');
        }
        AuthController::rememberReturn($request);

        return Socialite::driver('google')->scopes(['openid', 'email', 'profile'])->with(['prompt' => 'select_account'])->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! self::enabled()) {
            return $this->fail('الدخول بحساب جوجل غير متاح حاليًا. استخدم البريد الإلكتروني وكلمة المرور.');
        }
        if ($request->has('error')) {
            return $this->fail('أُلغي الدخول بحساب جوجل. يمكنك المحاولة مرة أخرى.');
        }
        try {
            $g = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            Log::warning('Google sign-in failed: '.class_basename($e));

            return $this->fail('تعذّر الدخول بحساب جوجل. حاول مرة أخرى.');
        }

        $googleId = (string) $g->getId();
        $email = Str::lower(trim((string) $g->getEmail()));
        $verified = filter_var($g->user['email_verified'] ?? $g->user['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if ($googleId === '' || $email === '' || ! $verified) {
            return $this->fail('بريدك في جوجل غير مؤكَّد. أكّده في جوجل أولًا أو سجّل الدخول بالبريد وكلمة المرور.');
        }

        $user = User::where('google_id', $googleId)->first();
        $created = false;
        if (! $user) {
            $user = User::where('email', $email)->first();
            if ($user) {
                if ($user->google_id && $user->google_id !== $googleId) {
                    return $this->fail('هذا البريد مربوط بحساب جوجل آخر. سجّل الدخول بالبريد وكلمة المرور.');
                }
                if ($user->isStaff()) {
                    return $this->fail('حسابات الإدارة لا تدخل بحساب جوجل. استخدم صفحة دخول الإدارة.');
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
            return $this->fail('حسابات الإدارة لا تدخل بحساب جوجل. استخدم صفحة دخول الإدارة.');
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
