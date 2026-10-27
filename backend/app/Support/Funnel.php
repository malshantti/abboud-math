<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Family journey log (funnel_events). Every write is best effort: it never throws and never blocks a page.
 * Anonymous visitors carry a random id (localStorage + the bk_vid cookie); it is linked to user_id on signup/login.
 */
class Funnel
{
    /** Ordered funnel steps: key => [label, events that count as reaching it]. */
    public const STEPS = [
        'visit' => ['زار الموقع', ['visit', 'page_view']],
        'pricing' => ['شاهد الأسعار', ['pricing_view']],
        'register_view' => ['فتح صفحة التسجيل', ['register_view', 'register_start', 'google_start']],
        'registered' => ['أنشأ حسابًا', ['registered']],
        'child' => ['أضاف طفلًا', ['child_created']],
        'lesson' => ['فتح أول درس', ['lesson_open', 'lesson_first']],
        'answered' => ['أجاب عن أسئلة', ['answers']],
        'subscribe_view' => ['فتح صفحة الاشتراك', ['subscribe_view', 'subjects_selected']],
        'order' => ['أرسل طلب الاشتراك', ['order_created', 'wa_click']],
        'paid' => ['فُعّل الاشتراك (دفع)', ['paid']],
    ];

    public const LABELS = [
        'visit' => 'زيارة الصفحة الرئيسية', 'page_view' => 'فتح صفحة', 'pricing_view' => 'شاهد الأسعار', 'register_view' => 'فتح صفحة التسجيل',
        'register_start' => 'بدأ التسجيل', 'google_start' => 'بدأ الدخول بحساب Google', 'registered' => 'أنشأ حسابًا', 'login' => 'سجّل الدخول',
        'logout' => 'سجّل الخروج', 'email_verified' => 'أكّد البريد الإلكتروني', 'child_created' => 'أضاف طفلًا', 'lesson_open' => 'فتح مادة',
        'lesson_first' => 'أول تقدّم محفوظ في مادة', 'answers' => 'أجاب عن أسئلة', 'trial_started' => 'بدأت الفترة التجريبية', 'trial_ending' => 'الفترة التجريبية تنتهي قريبًا',
        'trial_ended' => 'انتهت الفترة التجريبية', 'subscribe_view' => 'فتح صفحة الاشتراك', 'subjects_selected' => 'اختار مواد', 'wa_click' => 'ضغط «ادفع عبر واتساب»',
        'order_created' => 'أُنشئ طلب اشتراك', 'paid' => 'فُعّل الاشتراك', 'google_fail' => 'تعثّر الدخول بحساب Google', 'form_error' => 'خطأ في نموذج',
        'inapp' => 'متصفح داخل تطبيق (فيسبوك/إنستغرام)', 'cta_click' => 'ضغط زر دعوة',
    ];

    /** Events the public beacon may send (everything else is server-side only). */
    public const CLIENT = ['visit', 'page_view', 'pricing_view', 'register_view', 'register_start', 'lesson_open', 'answers', 'subjects_selected', 'wa_click', 'inapp', 'cta_click', 'form_error'];

    public const PAGES = ['landing', 'pricing', 'register', 'login', 'login_site', 'account', 'subscribe', 'lesson', 'forgot', 'reset', 'report', 'other'];

    private static ?bool $ready = null;

    public static function ready(): bool
    {
        if (self::$ready === null) {
            try {
                self::$ready = Schema::hasTable('funnel_events');
            } catch (\Throwable) {
                self::$ready = false;
            }
        }

        return self::$ready;
    }

    public static function visitorId(?Request $request = null): ?string
    {
        $request ??= request();
        $v = $request ? (string) $request->cookie('bk_vid', '') : '';

        return self::cleanVid($v);
    }

    public static function cleanVid(?string $v): ?string
    {
        return is_string($v) && preg_match('/^[A-Za-z0-9_-]{8,40}$/', $v) ? $v : null;
    }

    public static function cleanSource(?string $s): ?string
    {
        return in_array($s, ['fb', 'google', 'direct', 'other'], true) ? $s : null;
    }

    /** First-touch source code from utm / fbclid / referrer (the landing script sends these once). */
    public static function sourceFrom(array $src, ?string $ua = null): string
    {
        $u = strtolower((string) ($src['utm_source'] ?? '').' '.($src['utm_medium'] ?? ''));
        $ref = strtolower((string) ($src['ref'] ?? ''));
        if (! empty($src['fbclid']) || preg_match('/\b(fb|facebook|ig|instagram|meta|messenger)\b/', $u) || preg_match('/(facebook|instagram|fb)\.(com|me)/', $ref)
            || in_array(InApp::detect($ua), ['facebook', 'instagram', 'messenger'], true)) {
            return 'fb';
        }
        if (str_contains($u, 'google') || str_contains($ref, 'google.')) {
            return 'google';
        }

        return $ref === '' && trim($u) === '' ? 'direct' : 'other';
    }

    /**
     * Record one event. Never throws.
     *
     * @param  array{user_id?:int|null,visitor_id?:string|null,student_id?:int|null,subject?:string|null,page?:string|null,source?:string|null,count?:int|null,meta?:array|null,at?:mixed,backfill?:bool}  $d
     */
    public static function log(string $event, array $d = []): void
    {
        try {
            if (! self::ready()) {
                return;
            }
            $request = request();
            $user = array_key_exists('user_id', $d) ? $d['user_id'] : auth()->id();
            $vid = array_key_exists('visitor_id', $d) ? self::cleanVid($d['visitor_id']) : self::visitorId($request);
            $source = array_key_exists('source', $d) ? self::cleanSource($d['source']) : ($request ? self::cleanSource((string) $request->cookie('bk_src', '')) : null);
            $meta = $d['meta'] ?? null;
            DB::table('funnel_events')->insert([
                'event' => mb_substr($event, 0, 32), 'visitor_id' => $vid, 'user_id' => $user ?: null,
                'student_id' => $d['student_id'] ?? null, 'subject' => isset($d['subject']) ? mb_substr((string) $d['subject'], 0, 24) : null,
                'page' => isset($d['page']) ? mb_substr((string) $d['page'], 0, 32) : null, 'source' => $source,
                'count' => isset($d['count']) ? max(0, min(1_000_000, (int) $d['count'])) : null,
                'meta' => $meta ? mb_substr(json_encode($meta, JSON_UNESCAPED_UNICODE), 0, 500) : null,
                'backfill' => (bool) ($d['backfill'] ?? false), 'created_at' => $d['at'] ?? now(),
            ]);
        } catch (\Throwable $e) {
            try {
                \Illuminate\Support\Facades\Log::warning('funnel.log failed: '.$e->getMessage());
            } catch (\Throwable) {
            }
        }
    }

    /** Attach this browser's anonymous events to the account (signup / login). */
    public static function link(?User $user, ?string $vid = null): void
    {
        try {
            $vid = $vid ? self::cleanVid($vid) : self::visitorId();
            if (! $user || ! $vid || ! self::ready()) {
                return;
            }
            DB::table('funnel_events')->where('visitor_id', $vid)->whereNull('user_id')->update(['user_id' => $user->id]);
        } catch (\Throwable) {
        }
    }

    /** Index of the furthest funnel step an event counts toward (-1 if none). */
    public static function stepOf(string $event): int
    {
        static $map = null;
        if ($map === null) {
            $map = [];
            $i = 0;
            foreach (self::STEPS as $step) {
                foreach ($step[1] as $e) {
                    $map[$e] = $i;
                }
                $i++;
            }
        }

        return $map[$event] ?? -1;
    }
}
