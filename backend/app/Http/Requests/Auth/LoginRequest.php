<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower(trim($this->input('email')))]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:1024'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'أدخل البريد الإلكتروني.',
            'email.email' => 'أدخل بريدًا إلكترونيًا صالحًا.',
            'email.string' => 'أدخل البريد الإلكتروني كنص.',
            'email.max' => 'البريد الإلكتروني أطول من الحد المسموح.',
            'password.required' => 'أدخل كلمة المرور.',
            'password.string' => 'أدخل كلمة المرور كنص.',
            'password.max' => 'كلمة المرور أطول من الحد المسموح.',
        ];
    }

    public function authenticate(): void
    {
        $identityKey = 'admin-login:'.hash('sha256', $this->string('email').'|'.$this->ip());
        $ipKey = 'admin-login-ip:'.hash('sha256', (string) $this->ip());

        if (RateLimiter::tooManyAttempts($identityKey, 5) || RateLimiter::tooManyAttempts($ipKey, 30)) {
            $seconds = max(RateLimiter::availableIn($identityKey), RateLimiter::availableIn($ipKey));

            throw ValidationException::withMessages([
                'email' => 'محاولات الدخول كثيرة. حاول مجددًا بعد '.$seconds.' ثانية.',
            ]);
        }

        $ok = Auth::attempt(['email' => $this->validated('email'), 'password' => $this->validated('password')], true);
        if ($ok && ! \Illuminate\Support\Facades\Gate::allows('access-admin')) {
            Auth::logout();
            $ok = false;
        }
        if (! $ok) {
            RateLimiter::hit($identityKey, 60);
            RateLimiter::hit($ipKey, 60);

            throw ValidationException::withMessages([
                'email' => 'بيانات الدخول غير صحيحة أو لا يملك الحساب صلاحية المشرف.',
            ]);
        }

        RateLimiter::clear($identityKey);
        Auth::user()->forceFill(['last_login_at' => now()])->save();
        \App\Models\ActivityLog::record('login', Auth::user()->email, 'لوحة الإدارة');
    }
}
