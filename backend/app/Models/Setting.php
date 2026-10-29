<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    protected $table = 'site_settings';

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public const DEFAULTS = [
        'site_name' => 'بستان التعلّم',
        'tagline' => 'نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا',
        'registration_open' => '1',
        'announcement' => '',
        'announcement_active' => '0',
        'trial_days' => '3',
        'whatsapp_number' => '972592945557',
        'currency' => 'شيكل',
        // One subject per line: gradeSubject|price|days  (e.g. g6-math|20|30). Unit = one subject in one grade.
        'prices' => "g1-math|15|30\ng1-arabic|15|30\ng1-english|15|30\ng1-life|15|30\ng2-math|15|30\ng2-arabic|15|30\ng2-english|15|30\ng2-life|15|30\ng3-math|15|30\ng3-arabic|15|30\ng3-english|15|30\ng3-science|15|30\ng6-math|20|30\ng6-arabic|20|30\ng6-english|20|30\ng6-science|20|30\ng8-math|20|30\ng8-arabic|20|30\ng8-english|20|30\ng8-science|20|30",
        'gating_enabled' => '1',
        // Trial and subscriptions
        'grace_days' => '0',
        'reminder_days' => '3',
        'max_pending' => '16',
        // Free-month promo: last day (Y-m-d, Asia/Gaza) of «اشترك مجانًا لمدة شهر». Empty = off; the paid per-grade flow returns the day after.
        'free_month_until' => '',
        'free_month_banner' => 'بستان التعلّم مجاني بالكامل حتى {until} — جميع مواد الصف بضغطة واحدة',
        'mail_welcome_free_body' => "مرحبًا {name}،\n\nيسعدنا انضمامك إلى {site}. بستان التعلّم مجاني بالكامل حتى {free_until}: جميع مواد صف طفلك متاحة دون أي دفع.\n\nأضف طفلك من حسابك، ثم اضغط «اشترك مجانًا لمدة شهر» لتُفعَّل جميع مواد صفّه بضغطة واحدة.\n\nللدعم الفني عبر واتساب: {whatsapp_local}\n\nمع خالص التقدير،\nفريق بستان التعلّم",
        'auto_expire' => '1',
        'pending_expire_days' => '14',
        // Extra grade+subject units beyond the built-in catalog, one per line: code|grade|subject (e.g. g3-math|3|الرياضيات).
        'catalog_extra' => '',
        // Learning rules read by every subject page: hidden grade+subject codes (one per line), badges on/off, points multiplier.
        'subjects_hidden' => '',
        'badges_enabled' => '1',
        'points_multiplier' => '1',
        // Payment
        'whatsapp_template' => "السلام عليكم، أرغب في الاشتراك في {site}.\nالاسم: {parent}\nالبريد الإلكتروني: {email}\nالطالب: {student}\nالمواد المطلوبة:\n{subjects}\nالمجموع: {total}\nرمز الطلب: {code}",
        'payment_instructions' => 'اختر المواد ثم اضغط «أرسل الطلب عبر واتساب». بعد تأكيد الدفع نفعّل المواد فورًا، ويصلك إشعار في حسابك.',
        // Identity and homepage
        'hero_title' => 'طفلك يفهم الدرس',
        'hero_title_mark' => 'ويحبّ أن يتعلّمه.',
        'hero_subtitle' => 'دروس تفاعلية قصيرة بالصوت والصورة، مرتّبة كما في كتاب المدرسة، مع زيتون الذي يشجّع طفلك عند كل إجابة. وأنت تتابع تقدّمه من حسابك.',
        'hero_badge' => 'مطابق لكتب المنهاج الفلسطيني كاملًا',
        'announcement_color' => 'sun',
        'announcement_link' => '',
        'announcement_from' => '',
        'announcement_to' => '',
        'faq' => '',
        // Accounts and security
        'require_verification' => '0',
        // Web Push daily reminder (late afternoon, Asia/Gaza)
        'push_enabled' => '1',
        'push_hour' => '17',
        'single_device' => '1',
        'max_students' => '12',
        'session_minutes' => '',
        // Landing voice tour
        'voice_enabled' => '1',
        'voice_volume' => '35',
        'voice_autoplay' => '1',
        // Contact and social
        'facebook_url' => '',
        'instagram_url' => '',
        'contact_email' => '',
        'footer_text' => 'نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا',
        // Maintenance (student site; staff bypass)
        'maintenance_on' => '0',
        'maintenance_message' => 'نجري الآن تحسينات على البستان، وسنعود خلال وقت قصير. شكرًا لصبركم.',
        // SEO per static page (JSON {path:{title,description}}) and the shipped originals (managed by App\Support\Seo).
        'seo_pages' => '',
        'seo_originals' => '',
        // Media library replacements (JSON {original:replacement}, managed by App\Support\MediaLibrary).
        'media_map' => '',
        'mail_from_name' => 'بستان التعلّم',
        'mail_verify_on' => '1',
        'mail_verify_subject' => 'تفعيل حسابك في {site}',
        'mail_verify_body' => "مرحبًا {name}،\n\nشكرًا لتسجيلك في {site}. لتأكيد بريدك الإلكتروني وتفعيل حسابك، اضغط الزر أدناه. يبقى الرابط صالحًا مدة {days} أيام.\n\nإن لم تُنشئ هذا الحساب، فتجاهل هذه الرسالة.",
        'mail_reset_on' => '1',
        'mail_reset_subject' => 'إعادة تعيين كلمة المرور في {site}',
        'mail_reset_body' => "مرحبًا {name}،\n\nتلقّينا طلبًا لإعادة تعيين كلمة المرور لحسابك. اضغط الزر أدناه لاختيار كلمة مرور جديدة. ينتهي هذا الرابط بعد {minutes} دقيقة.\n\nإن لم تطلب ذلك، فتجاهل هذه الرسالة، وستبقى كلمة المرور الحالية كما هي.",
        'mail_trial_reminder_on' => '1',
        'mail_trial_reminder_subject' => 'تجربتك في {site} تنتهي قريبًا',
        'mail_trial_reminder_body' => "مرحبًا {name}،\n\nنأمل أن أبناءك استمتعوا بالدروس في {site}. تنتهي الفترة التجريبية المجانية في {until}.\n\nحتى يستمر التعلّم دون توقف، افتح صفحة الاشتراك، واختر طفلك ومواد صفه، ثم اضغط «أرسل الطلب عبر واتساب».\n\nنحن هنا لأي سؤال، ويسعدنا أن نساعدك.",
        'mail_activated_on' => '1',
        'mail_activated_subject' => 'فُعّل اشتراكك في {site} 🌱',
        'mail_activated_body' => "مرحبًا {name}،\n\nشكرًا لك! وصلنا الدفع وفعّلنا الاشتراك: {subjects}.\n\nالاشتراك فعّال حتى {until}. يستطيع طفلك الآن متابعة كل الدروس.\n\nنتمنى لأبنائك رحلة تعلّم ممتعة.",
        'mail_gift_on' => '1',
        'mail_gift_subject' => 'هديةٌ {to_kids} من {site} 🎁',
        'mail_gift_body' => "أهلًا بالأهل الكرام،\n\n{gift_intro}\n\nما فُعّل في الحساب:\n{subjects}\n\nالشهر المجاني ساري حتى {until}، ولا يلزمكم أي دفع أو إجراء؛ يكفي الدخول إلى الموقع ليبدأ {kid} التعلّم فورًا.\n\nنتمنى لأبنائكم رحلة تعلّم ممتعة ومثمرة.\n\nمع خالص التقدير،\nفريق بستان التعلّم",
        // Gift month on-site notice (static site modal). Off until the campaign is launched.
        'gift_notice_on' => '0',
        'mail_welcome_on' => '1',
        'mail_welcome_subject' => 'أهلًا بك في {site}',
        'mail_welcome_body' => "مرحبًا {name}،\n\nيسعدنا انضمامك إلى {site}. لديك فترة تجريبية مجانية مدتها {trial_days} أيام، يتصفح فيها أبناؤك جميع المواد والدروس دون أي التزام.\n\nأولًا، أضف أبناءك: من صفحة «حسابي» اكتب اسم كل طالب واختر صفه الدراسي.\n\nثانيًا، اختر المواد: افتح صفحة الاشتراك واختر المواد التي يحتاجها كل طالب، فيظهر لك رمز الطلب والمبلغ.\n\nثالثًا، ادفع عبر واتساب: أرسل رمز الطلب إلى الرقم {whatsapp}، وتُفعَّل المواد فور تأكيد الدفع.\n\nنتمنى لأبنائك رحلة تعلّم ممتعة ومثمرة.",
    ];

    /** Old tagline that the full-curriculum migration replaces when it is still stored verbatim. */
    public const OLD_TAGLINE = 'نزرع الفهم، ونحصد المعرفة';

    public const ANNOUNCEMENT_COLORS = [
        'sun' => ['label' => 'أصفر', 'bg' => '#fff4d6', 'line' => '#f0d58a', 'ink' => '#5a4000'],
        'leaf' => ['label' => 'زيتوني', 'bg' => '#eaf3d9', 'line' => '#b9d48a', 'ink' => '#2f4a1c'],
        'sky' => ['label' => 'سماوي', 'bg' => '#e3f1fb', 'line' => '#a9d2ee', 'ink' => '#0f4566'],
        'rose' => ['label' => 'أحمر', 'bg' => '#fde7e5', 'line' => '#f3b9b3', 'ink' => '#7a1d16'],
    ];

    public const DEFAULT_FAQ = [
        ['q' => 'هل المحتوى مطابق لكتب المدرسة؟', 'a' => 'نعم. الدروس منظّمة حسب وحدات كتب المنهاج الفلسطيني بجزأيها، وكل نشاط يذكر صفحته في الكتاب المطبوع. البستان مساند للكتاب والمعلّم ولا يغني عنهما.'],
        ['q' => 'ماذا يحدث بعد انتهاء الأيام المجانية؟', 'a' => 'لا يُخصم أي مبلغ تلقائيًا. إن أعجبك البستان، راسلنا عبر واتساب واختر المواد، فنفعّلها لمدة {days}.'],
        ['q' => 'هل أستطيع إضافة أكثر من طفل؟', 'a' => 'نعم، يضيف الأهل ملفًا مستقلًا لكل طفل، ويتابع تقدّم كل واحد منهم من حسابه.'],
        ['q' => 'هل يحتاج طفلي إلى إنترنت دائم؟', 'a' => 'يلزم الاتصال عند تسجيل الدخول أول مرة وعند تنزيل الدروس. بعدها تعمل الدروس المنزّلة على الجهاز نفسه حتى مع انقطاع الشبكة.'],
        ['q' => 'على أي جهاز يعمل؟', 'a' => 'على الهاتف والجهاز اللوحي والحاسوب، من المتصفح مباشرة ودون تثبيت تطبيق.'],
    ];

    public static function all_(): array
    {
        return Cache::remember('site_settings', 60, function () {
            try {
                $stored = Schema::hasTable('site_settings') ? static::query()->pluck('value', 'key')->all() : [];
            } catch (\Throwable) {
                $stored = [];
            }

            return array_merge(self::DEFAULTS, array_intersect_key(array_map(fn ($v) => (string) $v, $stored), self::DEFAULTS));
        });
    }

    public static function get(string $key): string
    {
        return (string) (static::all_()[$key] ?? '');
    }

    public static function flag(string $key): bool
    {
        return static::get($key) === '1';
    }

    public static function int(string $key, int $min = 0, int $max = PHP_INT_MAX): int
    {
        return max($min, min($max, (int) static::get($key)));
    }

    public static function put(array $values): array
    {
        $before = static::all_();
        $changed = [];
        foreach ($values as $k => $v) {
            if (array_key_exists($k, self::DEFAULTS) && (string) ($before[$k] ?? '') !== (string) $v) {
                static::query()->updateOrCreate(['key' => $k], ['value' => (string) $v]);
                $changed[] = $k;
            }
        }
        Cache::forget('site_settings');

        return $changed;
    }

    /** Subscription units: built-in subjects (with content) plus admin-added ones. code => [grade, subject, builtin]. */
    public static function catalog(): array
    {
        $out = [];
        foreach (\App\Support\Ar::SUBJECTS as $code => [$g, $subj]) {
            $out[$code] = [$g, $subj, true];
        }
        foreach (static::extraCatalog() as $code => [$g, $subj]) {
            $out[$code] ??= [$g, $subj, false];
        }
        $order = array_flip(array_keys($out));
        uksort($out, fn ($a, $b) => [$out[$a][0], $order[$a]] <=> [$out[$b][0], $order[$b]]);

        return $out;
    }

    /** @return array<string, array{0:int,1:string}> */
    public static function extraCatalog(): array
    {
        $out = [];
        foreach (preg_split('/\R/', static::get('catalog_extra'), -1, PREG_SPLIT_NO_EMPTY) as $line) {
            $p = array_map('trim', explode('|', $line));
            if (count($p) === 3 && preg_match('/^g(\d{1,2})-[a-z][a-z0-9]{1,19}$/', $p[0], $m) && (int) $m[1] === (int) $p[1]
                && isset(\App\Support\Ar::GRADE_WORDS[(int) $p[1]]) && $p[2] !== '') {
                $out[$p[0]] = [(int) $p[1], mb_substr($p[2], 0, 40)];
            }
        }

        return $out;
    }

    /** Grades a student can be placed in: every grade that has at least one unit in the catalog. grade => name. */
    public static function gradeOptions(): array
    {
        $out = [];
        foreach (static::catalog() as [$g]) {
            $out[$g] = \App\Support\Ar::grade($g);
        }
        ksort($out);

        return $out;
    }

    /** Default price when the admin has not set one: 15 for grades 1-3, 20 for grades 6 and 8, 30 days. */
    public static function defaultPlan(int $grade): array
    {
        return ['price' => $grade <= 3 ? 15 : 20, 'days' => 30];
    }

    /**
     * Price list, one entry per grade+subject. Stored as lines code|price|days|active (active defaults to 1).
     *
     * @return array<string, array{code:string,name:string,price:int,days:int,grade:int,subject:string,active:bool,builtin:bool}>
     */
    public static function plans(bool $activeOnly = false): array
    {
        $set = [];
        foreach (preg_split('/\R/', static::get('prices')) as $line) {
            $p = array_map('trim', explode('|', $line));
            if (count($p) >= 3 && ctype_digit($p[1]) && ctype_digit($p[2]) && (int) $p[1] > 0 && (int) $p[2] > 0) {
                $set[$p[0]] = ['price' => (int) $p[1], 'days' => (int) $p[2], 'active' => ($p[3] ?? '1') !== '0'];
            }
        }
        $out = [];
        foreach (static::catalog() as $code => [$g, $subj, $builtin]) {
            $v = $set[$code] ?? static::defaultPlan($g) + ['active' => $builtin];
            if ($activeOnly && ! $v['active']) {
                continue;
            }
            $out[$code] = ['code' => $code, 'name' => $subj.' — '.\App\Support\Ar::grade($g), 'price' => $v['price'], 'days' => $v['days'], 'grade' => $g, 'subject' => $subj, 'active' => $v['active'], 'builtin' => $builtin];
        }

        return $out;
    }

    /** Grade groups shown on the landing pricing cards; any other priced grade gets its own card. */
    public const PRICE_GROUPS = [[1, 2, 3], [6, 8]];

    /** Public price summary for the static landing: one entry per grade group, min/max from the active admin-set prices. */
    public static function publicPrices(): array
    {
        $plans = static::plans(true);
        $grades = array_values(array_unique(array_column($plans, 'grade')));
        sort($grades);
        $groupsDef = self::PRICE_GROUPS;
        $known = array_merge(...self::PRICE_GROUPS);
        foreach ($grades as $g) {
            if (! in_array($g, $known, true)) {
                $groupsDef[] = [$g];
            }
        }
        $groups = [];
        foreach ($groupsDef as $gs) {
            $set = array_values(array_filter($plans, fn ($p) => in_array($p['grade'], $gs, true)));
            if (! $set) {
                continue;
            }
            $present = array_values(array_unique(array_column($set, 'grade')));
            $prices = array_column($set, 'price');
            $days = array_column($set, 'days');
            $groups[] = [
                'key' => implode('-', $gs), 'grades' => $present, 'title' => \App\Support\Ar::gradeGroup($present),
                'subjects' => array_values(array_unique(array_column($set, 'subject'))),
                'min' => min($prices), 'max' => max($prices), 'from' => min($prices) !== max($prices),
                'days' => min($days), 'days_vary' => min($days) !== max($days),
            ];
        }

        return ['free_month' => static::freeMonth()] + [
            'currency' => static::get('currency'), 'trial_days' => static::int('trial_days', 0, 365),
            'whatsapp' => preg_replace('/\D+/', '', static::get('whatsapp_number')),
            'payment_instructions' => static::get('payment_instructions'),
            'groups' => $groups,
            'plans' => array_map(fn ($p) => ['price' => $p['price'], 'days' => $p['days'], 'grade' => $p['grade'], 'subject' => $p['subject']], $plans),
        ];
    }

    /** FAQ list as [{q, a}], falling back to the defaults when nothing valid is stored. */
    public static function faq(): array
    {
        $items = json_decode(static::get('faq'), true);
        $items = is_array($items) ? array_values(array_filter($items, fn ($i) => is_array($i) && trim((string) ($i['q'] ?? '')) !== '' && trim((string) ($i['a'] ?? '')) !== '')) : [];

        return $items ?: self::DEFAULT_FAQ;
    }

    /** "يومًا واحدًا / يومين / ٣ أيام / ١١ يومًا" for running text. */
    public static function daysText(int $n): string
    {
        return match (true) {
            $n === 1 => 'يومًا واحدًا', $n === 2 => 'يومين',
            $n >= 3 && $n <= 10 => \App\Support\Ar::num($n).' أيام',
            default => \App\Support\Ar::num($n).' يومًا',
        };
    }

    private static function at(string $v): ?\Illuminate\Support\Carbon
    {
        if (trim($v) === '') {
            return null;
        }
        try {
            return \Illuminate\Support\Carbon::parse($v, config('app.display_timezone', 'Asia/Gaza'));
        } catch (\Throwable) {
            return null;
        }
    }

    /** The announcement is live when switched on, not empty, and inside its optional from/to window. */
    public static function announcementLive(): bool
    {
        if (! static::flag('announcement_active') || trim(static::get('announcement')) === '') {
            return false;
        }
        $from = static::at(static::get('announcement_from'));
        $to = static::at(static::get('announcement_to'));

        return ! ($from && now()->lt($from)) && ! ($to && now()->gt($to));
    }

    public static function publicData(): array
    {
        $live = static::announcementLive();
        $color = static::ANNOUNCEMENT_COLORS[static::get('announcement_color')] ?? static::ANNOUNCEMENT_COLORS['sun'];
        $plans = static::plans(true);
        $days = $plans ? min(array_column($plans, 'days')) : 30;
        $fill = fn (string $t) => strtr($t, ['{days}' => static::daysText($days), '{trial_days}' => static::daysText(static::int('trial_days', 0, 365))]);

        $faq = array_map(fn ($i) => ['q' => $fill((string) $i['q']), 'a' => $fill((string) $i['a'])], static::faq());
        if ($fmi = static::freeMonth()) {
            // During the free month: no «الأيام المجانية» answers; one clear answer about the free month instead.
            $faq = array_values(array_filter($faq, fn ($i) => ! preg_match('/مجاني|تجرب/u', $i['q'].' '.$i['a'])));
            array_unshift($faq, ['q' => 'هل البستان مجاني الآن؟', 'a' => 'نعم. بستان التعلّم مجاني بالكامل حتى '.$fmi['until_ar'].'. أضف طفلك واضغط «اشترك مجانًا لمدة شهر» فتُفعَّل جميع مواد صفّه بضغطة واحدة، دون أي دفع.']);
            $faq[] = ['q' => 'ماذا يحدث بعد انتهاء الشهر المجاني؟', 'a' => 'لا يُخصم أي مبلغ تلقائيًا. إن أعجبك البستان، اشترك في صف طفلك من حسابك والدفع عبر واتساب.'];
        }

        return [
            'site_name' => static::get('site_name'), 'tagline' => static::get('tagline'),
            'registration_open' => static::flag('registration_open'),
            'announcement' => $fmi ? $fmi['banner'] : ($live ? static::get('announcement') : ''),
            'announcement_link' => $fmi ? 'https://bustankids.com/admin-api/account/register' : ($live ? static::get('announcement_link') : ''),
            'announcement_color' => ['bg' => $color['bg'], 'line' => $color['line'], 'ink' => $color['ink']],
            'hero' => ['title' => static::get('hero_title'), 'mark' => static::get('hero_title_mark'), 'subtitle' => static::get('hero_subtitle'), 'badge' => static::get('hero_badge')],
            'faq' => $faq,
            'voice' => ['enabled' => static::flag('voice_enabled'), 'volume' => static::int('voice_volume', 0, 100), 'autoplay' => static::flag('voice_autoplay')],
            'contact' => ['facebook' => static::get('facebook_url'), 'instagram' => static::get('instagram_url'), 'email' => static::get('contact_email'),
                'whatsapp' => preg_replace('/\D+/', '', static::get('whatsapp_number')), 'footer' => static::get('footer_text')],
            'trial_days' => static::int('trial_days', 0, 365),
            'free_month' => $fm = static::freeMonth(),
            'rules' => static::learningRules(),
            'media' => (object) \App\Support\MediaLibrary::map(),
            'maintenance' => static::flag('maintenance_on') ? ['message' => static::get('maintenance_message')] : null,
        ];
    }

    /** Allowed points multipliers (stored as text). */
    public const POINT_STEPS = ['0', '0.5', '1', '1.5', '2', '3'];

    /** @return list<string> grade+subject codes hidden from students. */
    public static function hiddenSubjects(): array
    {
        $cat = static::catalog();

        return array_values(array_filter(array_unique(array_map('trim', preg_split('/\R/', static::get('subjects_hidden'), -1, PREG_SPLIT_NO_EMPTY))), fn ($c) => isset($cat[$c])));
    }

    /** Rules the static subject pages apply (sync.js): hidden subjects, badges switch and points multiplier. */
    public static function learningRules(): array
    {
        $m = static::get('points_multiplier');

        return ['hidden' => static::hiddenSubjects(), 'badges' => static::flag('badges_enabled'), 'points' => in_array($m, self::POINT_STEPS, true) ? (float) $m : 1.0];
    }

    /** Free-month promo info for the public site (null when off): until (Y-m-d), until_ar («٢٨/١١»), banner text. */
    public static function freeMonth(): ?array
    {
        $end = static::freeMonthEnds();
        if (! $end) {
            return null;
        }
        $local = $end->copy()->setTimezone(config('app.display_timezone', 'Asia/Gaza'));
        $ar = \App\Support\Ar::num($local->day.'/'.$local->month);

        return ['until' => $local->format('Y-m-d'), 'until_ar' => $ar, 'banner' => strtr((string) static::get('free_month_banner') ?: static::DEFAULTS['free_month_banner'], ['{until}' => $ar])];
    }

    /** End of the free-month promo (end of its last day) while it is running, else null. */
    public static function freeMonthEnds(): ?\Illuminate\Support\Carbon
    {
        $d = trim((string) static::get('free_month_until'));
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) {
            return null;
        }
        $end = \Illuminate\Support\Carbon::parse($d, config('app.display_timezone', 'Asia/Gaza'))->endOfDay()->utc();

        return $end->isFuture() ? $end : null;
    }
}
