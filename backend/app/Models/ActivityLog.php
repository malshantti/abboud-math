<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'action', 'subject', 'details', 'ip'];

    public const LABELS = [
        'register' => 'إنشاء حساب', 'login' => 'تسجيل دخول', 'logout' => 'تسجيل خروج', 'password.reset' => 'إعادة تعيين كلمة المرور',
        'student.create' => 'إضافة طالب', 'student.update' => 'تعديل طالب', 'student.delete' => 'حذف طالب',
        'progress.import' => 'استيراد تقدّم محلي', 'user.update' => 'تعديل مستخدم', 'user.disable' => 'تعطيل مستخدم',
        'user.enable' => 'تفعيل مستخدم', 'user.delete' => 'حذف مستخدم', 'user.password' => 'تعيين كلمة مرور', 'user.trial' => 'تعديل الفترة التجريبية',
        'settings.update' => 'تعديل الإعدادات', 'export' => 'تصدير بيانات', 'subscription.request' => 'طلب اشتراك',
        'subscription.activate' => 'تفعيل اشتراك', 'subscription.cancel' => 'إلغاء اشتراك',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(string $action, ?string $subject = null, ?string $details = null, ?User $user = null): void
    {
        $user ??= auth()->user();
        static::create([
            'user_id' => $user?->id, 'action' => $action, 'subject' => $subject ? mb_substr($subject, 0, 120) : null,
            'details' => $details, 'ip' => request()?->ip(),
        ]);
    }

    public function label(): string
    {
        return self::LABELS[$this->action] ?? $this->action;
    }
}
