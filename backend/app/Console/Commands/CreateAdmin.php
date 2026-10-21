<?php

namespace App\Console\Commands;

use App\Models\User;
use Closure;
use Illuminate\Console\Command;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use RuntimeException;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create {email? : البريد الإلكتروني للمشرف} {--name= : اسم المشرف}';

    protected $description = 'إنشاء حساب مشرف باختيار صريح وكلمة مرور مخفية، دون حسابات افتراضية';

    public function handle(): int
    {
        if (! $this->input->isInteractive()) {
            $this->error('شغّل الأمر في طرفية تفاعلية لإدخال كلمة المرور دون إظهارها.');

            return self::FAILURE;
        }

        $name = trim((string) ($this->option('name') ?: $this->ask('اسم المشرف')));
        $email = Str::lower(trim((string) ($this->argument('email') ?: $this->ask('البريد الإلكتروني'))));
        $identity = Validator::make(compact('name', 'email'), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ], [
            'name.required' => 'اسم المشرف مطلوب.',
            'name.max' => 'اسم المشرف أطول من الحد المسموح.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.max' => 'البريد الإلكتروني أطول من الحد المسموح.',
            'email.unique' => 'هذا البريد موجود بالفعل؛ لم يُغيّر الحساب أو صلاحياته.',
        ]);

        if ($identity->fails()) {
            $this->error($identity->errors()->first());

            return self::FAILURE;
        }

        try {
            $password = $this->secret('كلمة المرور (١٢ محرفًا على الأقل)', false);
            $confirmation = $this->secret('أعد كلمة المرور', false);
        } catch (RuntimeException) {
            $this->error('تعذّر إخفاء الإدخال؛ استخدم طرفية تدعم كلمات المرور المخفية.');

            return self::FAILURE;
        }

        $credentials = Validator::make([
            'password' => $password,
            'password_confirmation' => $confirmation,
        ], [
            'password' => [
                'required', 'string', 'confirmed', Password::min(12),
                function (string $attribute, mixed $value, Closure $fail): void {
                    // bcrypt uses at most 72 bytes, including multi-byte Arabic characters.
                    if (is_string($value) && strlen($value) > 72) {
                        $fail('كلمة المرور تتجاوز ٧٢ بايت؛ اختر عبارة أقصر.');
                    }
                },
            ],
        ], [
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.string' => 'كلمة المرور يجب أن تكون نصًا.',
            'password.confirmed' => 'كلمتا المرور غير متطابقتين.',
            'password.min' => 'كلمة المرور يجب أن تتكون من ١٢ محرفًا على الأقل.',
        ]);

        if ($credentials->fails()) {
            $this->error($credentials->errors()->first());

            return self::FAILURE;
        }

        $user = new User(['name' => $name, 'email' => $email, 'password' => $password]);
        $user->setRole('admin'); // role and is_admin together, so the admin is never counted as a parent

        try {
            $user->save();
        } catch (UniqueConstraintViolationException) {
            $this->error('هذا البريد موجود بالفعل؛ لم يُغيّر الحساب أو صلاحياته.');

            return self::FAILURE;
        }

        $this->info('أُنشئ حساب المشرف. يمكنك الدخول من /login.');

        return self::SUCCESS;
    }
}
