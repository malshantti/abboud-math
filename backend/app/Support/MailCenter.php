<?php

namespace App\Support;

use App\Mail\BrandMail;
use App\Models\MailLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

/** One place that renders, sends and logs every account email (verify, reset, welcome). */
class MailCenter
{
    public const TYPES = ['verify' => 'تفعيل الحساب', 'reset' => 'إعادة تعيين كلمة المرور', 'welcome' => 'رسالة الترحيب', 'trial_reminder' => 'تذكير قبل نهاية التجربة', 'activated' => 'تفعيل الاشتراك', 'gift' => 'هدية الشهر المجاني'];

    public const BUTTONS = ['verify' => 'تفعيل الحساب', 'reset' => 'تعيين كلمة مرور جديدة', 'welcome' => 'ادخل إلى الموقع', 'trial_reminder' => 'اختر المواد واشترك', 'activated' => 'ابدأ التعلّم', 'gift' => 'ابدأ التعلّم الآن'];

    public const PLACEHOLDERS = ['{name}' => 'اسم صاحب الحساب', '{site}' => 'اسم الموقع', '{trial_days}' => 'أيام التجربة', '{whatsapp}' => 'رقم واتساب', '{minutes}' => 'صلاحية رابط الاستعادة بالدقائق', '{days}' => 'صلاحية رابط التفعيل بالأيام', '{until}' => 'تاريخ نهاية التجربة أو الاشتراك', '{subjects}' => 'المواد المفعّلة', '{student}' => 'اسم الطالب', '{gift_intro}' => 'جملة الهدية (طفل/أطفال، مشترك أو لا)', '{to_kids}' => 'لطفلكم / لأطفالكم', '{kid}' => 'طفلكم / أطفالكم'];

    /** Arabic aliases the admin may type instead of the Latin placeholders. */
    public const AR_PLACEHOLDERS = ['{اسم_ولي_الأمر}' => '{name}', '{الاسم}' => '{name}', '{اسم_الموقع}' => '{site}', '{أيام_التجربة}' => '{trial_days}', '{واتساب}' => '{whatsapp}', '{الدقائق}' => '{minutes}', '{الأيام}' => '{days}'];

    public const VERIFY_DAYS = 3;

    public const DEFAULT_WHATSAPP = '972592945557';

    public static function enabled(string $type): bool
    {
        return Setting::flag('mail_'.$type.'_on');
    }

    public static function siteUrl(): string
    {
        return rtrim(config('app.student_site_url') ?: 'https://bustankids.com', '/').'/';
    }

    public static function logoUrl(): string
    {
        return 'https://bustankids.com/assets/brand/logo-horizontal.png';
    }

    public static function whatsapp(): string
    {
        return preg_replace('/\D+/', '', Setting::get('whatsapp_number')) ?: self::DEFAULT_WHATSAPP;
    }

    public static function verifyUrl(User $user): string
    {
        return URL::temporarySignedRoute('account.verify', now()->addDays(self::VERIFY_DAYS), ['id' => $user->id, 'hash' => sha1($user->email)]);
    }

    public static function resetUrl(User $user, string $token): string
    {
        $minutes = (int) config('auth.passwords.users.expire', 60);

        return URL::temporarySignedRoute('account.password.reset', now()->addMinutes($minutes), ['token' => $token, 'email' => $user->email]);
    }

    /** @return array{subject:string,paragraphs:list<string>,button:string,link:string,type:string,whatsapp:?string,site_url:string,logo:string,site:string} */
    public static function render(string $type, string $name, string $link, array $overrides = [], array $extra = []): array
    {
        $wa = self::whatsapp();
        $vars = [
            '{until}' => (string) ($extra['until'] ?? ''), '{subjects}' => (string) ($extra['subjects'] ?? ''), '{student}' => (string) ($extra['student'] ?? ''), '{gift_intro}' => (string) ($extra['gift_intro'] ?? ''), '{to_kids}' => (string) ($extra['to_kids'] ?? 'لطفلكم'), '{kid}' => (string) ($extra['kid'] ?? 'طفلكم'),
            '{name}' => trim($name) !== '' ? trim($name) : 'عائلتنا الكريمة',
            '{whatsapp_local}' => Ar::num('0'.substr($wa, 3)),
            '{site}' => Setting::get('site_name'),
            '{trial_days}' => Ar::num(max(0, (int) Setting::get('trial_days'))),
            '{whatsapp}' => Ar::num('00'.$wa),
            '{minutes}' => Ar::num((int) config('auth.passwords.users.expire', 60)),
            '{days}' => Ar::num(self::VERIFY_DAYS),
        ];
        foreach (self::AR_PLACEHOLDERS as $ar => $en) {
            $vars[$ar] = $vars[$en];
        }
        $fmi = Setting::freeMonth();
        // Must be set before $fill captures $vars (arrow fns capture by value).
        $vars['{free_until}'] = $fmi['until_ar'] ?? \App\Support\Ar::num('28/11/2026');
        $fill = fn (string $s) => strtr($s, $vars);
        $bodyTpl = $overrides['body'] ?? ($type === 'welcome' && $fmi ? Setting::get('mail_welcome_free_body') : Setting::get('mail_'.$type.'_body'));
        $subjectTpl = $overrides['subject'] ?? Setting::get('mail_'.$type.'_subject');
        // Fallback: an empty template means "use the built-in text".
        if (trim((string) $bodyTpl) === '') {
            $bodyTpl = Setting::DEFAULTS['mail_'.$type.'_body'];
        }
        if (trim((string) $subjectTpl) === '') {
            $subjectTpl = Setting::DEFAULTS['mail_'.$type.'_subject'];
        }
        $body = str_replace("\r\n", "\n", $fill((string) $bodyTpl));
        $paragraphs = array_values(array_filter(array_map('trim', preg_split("/\n\s*\n/", $body)), fn ($p) => $p !== ''));

        return [
            'type' => $type, 'subject' => trim($fill((string) $subjectTpl)) ?: self::TYPES[$type],
            'paragraphs' => $paragraphs, 'button' => self::BUTTONS[$type], 'link' => $link,
            'whatsapp' => in_array($type, ['welcome', 'trial_reminder', 'activated', 'gift'], true) ? 'https://wa.me/'.$wa : null, 'whatsapp_label' => $type === 'gift' ? $vars['{whatsapp_local}'] : Ar::num('00'.$wa),
            'show_link' => ! in_array($type, ['welcome', 'gift'], true),
            'site_url' => self::siteUrl(), 'logo' => self::logoUrl(), 'site' => Setting::get('site_name'),
            'note' => match ($type) {
                'reset' => 'لحمايتك، لا يُستخدم الرابط إلا مرة واحدة، وينتهي بعد '.$vars['{minutes}'].' دقيقة.',
                'verify' => 'إن لم يعمل الزر، فانسخ الرابط التالي وألصقه في المتصفح.',
                'gift' => 'للدعم الفني عبر واتساب: '.$vars['{whatsapp_local}'],
                default => 'لأي استفسار، راسلنا عبر واتساب على الرقم '.$vars['{whatsapp}'].'.',
            },
        ];
    }

    /** Send one email and log it. Never throws: a mail failure must not break registration or reset. */
    public static function send(string $type, User $user, string $link, bool $test = false, ?string $to = null, array $extra = []): MailLog
    {
        $to ??= $user->email;
        $data = self::render($type, $user->name, $link, [], $extra + ($test ? ['until' => Ar::date(now()->addDay()), 'subjects' => 'الرياضيات — الصف الأول', 'student' => 'سارة', 'gift_intro' => 'تقديرًا لثقتكم، فعّلنا لطفلكم شهرًا مجانيًا كاملًا على جميع مواد صفّه.'] : []));
        $log = ['user_id' => $test ? null : $user->id, 'to' => mb_substr($to, 0, 255), 'type' => $type, 'subject' => mb_substr($data['subject'], 0, 255), 'is_test' => $test];
        if (! $test && ! self::enabled($type)) {
            return MailLog::create($log + ['status' => 'disabled']);
        }
        try {
            $sent = Mail::to($to)->send(new BrandMail($data, Setting::get('mail_from_name') ?: Setting::get('site_name')));
            \Illuminate\Support\Facades\Log::channel('mail')->info('mail.sent', ['type' => $type, 'user' => $log['user_id'], 'to_domain' => \Illuminate\Support\Str::after($to, '@'), 'message_id' => $sent?->getMessageId(), 'smtp' => mb_substr((string) ($sent?->getDebug() ? \Illuminate\Support\Str::of($sent->getDebug())->afterLast('250 ')->before("\n") : ''), 0, 120)]);

            return MailLog::create($log + ['status' => 'sent']);
        } catch (\Throwable $e) {
            report($e);
            \Illuminate\Support\Facades\Log::channel('mail')->error('mail.failed', ['type' => $type, 'user' => $log['user_id'], 'to_domain' => \Illuminate\Support\Str::after($to, '@'), 'error' => mb_substr($e->getMessage(), 0, 300)]);

            return MailLog::create($log + ['status' => 'failed', 'error' => mb_substr($e->getMessage(), 0, 500)]);
        }
    }

    /** True once this account already got a mail of this type (sent). */
    public static function alreadySent(User $user, string $type): bool
    {
        return MailLog::where('user_id', $user->id)->where('type', $type)->where('status', 'sent')->where('is_test', false)->exists();
    }

    /** Welcome link: the parent's account home (add children there). */
    public static function welcomeLink(): string
    {
        return route('account.home');
    }
}
