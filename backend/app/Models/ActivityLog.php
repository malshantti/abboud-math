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
        'email.verify' => 'تفعيل البريد', 'user.verify' => 'تفعيل بريد يدويًا', 'mail.settings' => 'تعديل إعدادات البريد', 'mail.test' => 'رسالة تجريبية',
        'class.create' => 'إنشاء صف', 'class.update' => 'تعديل صف', 'class.delete' => 'حذف صف', 'class.code' => 'رمز صف جديد', 'class.teacher' => 'معلّمو الصف', 'class.students' => 'طلاب الصف', 'class.join' => 'انضمام إلى صف', 'class.leave' => 'مغادرة صف', 'seo.settings' => 'تعديل عناوين جوجل', 'media.upload' => 'رفع وسائط', 'media.replace' => 'استبدال وسائط', 'media.restore' => 'إعادة وسائط أصلية', 'question.create' => 'إضافة سؤال', 'question.update' => 'تعديل سؤال', 'question.delete' => 'حذف سؤال',
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

    /** Subscription items of a request entry: list of [code, subject name]. */
    public function requestItems(): array
    {
        if ($this->action !== 'subscription.request') {
            return [];
        }
        $out = [];
        foreach (preg_split('/\s*؛\s*/u', (string) $this->details, -1, PREG_SPLIT_NO_EMPTY) as $part) {
            [$code, $name] = array_pad(preg_split('/\s+/u', $part, 2), 2, '');
            $out[] = preg_match('/^[A-Z0-9]{3,}-[A-Z0-9]+$/', $code) ? [$code, $name] : [(string) $this->subject, $part];
        }

        return $out ?: [[(string) $this->subject, '']];
    }

    /**
     * Collapse subscription requests made in one submission into one entry.
     * New submissions are logged once; older logs (one row per subject, same user, same minute) are merged here.
     *
     * @return list<array{log: self, items: array}>
     */
    public static function grouped(iterable $logs): array
    {
        $out = [];
        foreach ($logs as $log) {
            $prev = $out ? $out[array_key_last($out)] : null;
            if ($log->action === 'subscription.request' && $prev && $prev['log']->action === 'subscription.request'
                && $prev['log']->user_id === $log->user_id && $log->created_at && $prev['log']->created_at
                && $prev['log']->created_at->format('YmdHi') === $log->created_at->format('YmdHi')) {
                $out[array_key_last($out)]['items'] = array_merge($log->requestItems(), $prev['items']);

                continue;
            }
            $out[] = ['log' => $log, 'items' => $log->requestItems()];
        }

        return $out;
    }
}
