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
    public const TYPES = ['verify' => 'تفعيل الحساب', 'reset' => 'إعادة تعيين كلمة المرور', 'welcome' => 'رسالة الترحيب'];

    public const BUTTONS = ['verify' => 'تفعيل الحساب', 'reset' => 'تعيين كلمة مرور جديدة', 'welcome' => 'ادخل إلى الموقع'];

    public const PLACEHOLDERS = ['{name}' => 'اسم ولي الأمر', '{site}' => 'اسم الموقع', '{trial_days}' => 'أيام التجربة', '{whatsapp}' => 'رقم واتساب', '{minutes}' => 'صلاحية رابط الاستعادة بالدقائق', '{days}' => 'صلاحية رابط التفعيل بالأيام'];

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
    public static function render(string $type, string $name, string $link): array
    {
        $wa = self::whatsapp();
        $vars = [
            '{name}' => trim($name) !== '' ? trim($name) : 'ولي الأمر',
            '{site}' => Setting::get('site_name'),
            '{trial_days}' => Ar::num(max(0, (int) Setting::get('trial_days'))),
            '{whatsapp}' => Ar::num('00'.$wa),
            '{minutes}' => Ar::num((int) config('auth.passwords.users.expire', 60)),
            '{days}' => Ar::num(self::VERIFY_DAYS),
        ];
        $fill = fn (string $s) => strtr($s, $vars);
        $body = str_replace("\r\n", "\n", $fill(Setting::get('mail_'.$type.'_body')));
        $paragraphs = array_values(array_filter(array_map('trim', preg_split("/\n\s*\n/", $body)), fn ($p) => $p !== ''));

        return [
            'type' => $type, 'subject' => trim($fill(Setting::get('mail_'.$type.'_subject'))) ?: self::TYPES[$type],
            'paragraphs' => $paragraphs, 'button' => self::BUTTONS[$type], 'link' => $link,
            'whatsapp' => $type === 'welcome' ? 'https://wa.me/'.$wa : null, 'whatsapp_label' => Ar::num('00'.$wa),
            'site_url' => self::siteUrl(), 'logo' => self::logoUrl(), 'site' => Setting::get('site_name'),
            'note' => match ($type) {
                'reset' => 'لحمايتك، لا يُستخدم الرابط إلا مرة واحدة، وينتهي بعد '.$vars['{minutes}'].' دقيقة.',
                'verify' => 'إن لم يعمل الزر، فانسخ الرابط التالي وألصقه في المتصفح.',
                default => 'لأي استفسار، راسلنا عبر واتساب على الرقم '.$vars['{whatsapp}'].'.',
            },
        ];
    }

    /** Send one email and log it. Never throws: a mail failure must not break registration or reset. */
    public static function send(string $type, User $user, string $link, bool $test = false, ?string $to = null): MailLog
    {
        $to ??= $user->email;
        $data = self::render($type, $user->name, $link);
        $log = ['user_id' => $test ? null : $user->id, 'to' => mb_substr($to, 0, 255), 'type' => $type, 'subject' => mb_substr($data['subject'], 0, 255), 'is_test' => $test];
        if (! $test && ! self::enabled($type)) {
            return MailLog::create($log + ['status' => 'disabled']);
        }
        try {
            Mail::to($to)->send(new BrandMail($data, Setting::get('mail_from_name') ?: Setting::get('site_name')));

            return MailLog::create($log + ['status' => 'sent']);
        } catch (\Throwable $e) {
            report($e);

            return MailLog::create($log + ['status' => 'failed', 'error' => mb_substr($e->getMessage(), 0, 500)]);
        }
    }

    /** Welcome link: the parent's account home (add children there). */
    public static function welcomeLink(): string
    {
        return route('account.home');
    }
}
