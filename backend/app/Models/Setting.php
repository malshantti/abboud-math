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
        'prices' => "g1-math|15|30\ng1-arabic|15|30\ng1-english|15|30\ng1-life|15|30\ng2-math|15|30\ng2-arabic|15|30\ng2-english|15|30\ng2-life|15|30\ng6-math|20|30\ng6-arabic|20|30\ng6-english|20|30\ng6-science|20|30\ng8-math|20|30\ng8-arabic|20|30\ng8-english|20|30\ng8-science|20|30",
        'gating_enabled' => '1',
        'mail_from_name' => 'بستان التعلّم',
        'mail_verify_on' => '1',
        'mail_verify_subject' => 'تفعيل حسابك في {site}',
        'mail_verify_body' => "مرحبًا {name}،\n\nشكرًا لتسجيلك في {site}. لتأكيد بريدك الإلكتروني وتفعيل حسابك، اضغط الزر أدناه. يبقى الرابط صالحًا مدة {days} أيام.\n\nإن لم تُنشئ هذا الحساب، فتجاهل هذه الرسالة.",
        'mail_reset_on' => '1',
        'mail_reset_subject' => 'إعادة تعيين كلمة المرور في {site}',
        'mail_reset_body' => "مرحبًا {name}،\n\nتلقّينا طلبًا لإعادة تعيين كلمة المرور لحسابك. اضغط الزر أدناه لاختيار كلمة مرور جديدة. ينتهي هذا الرابط بعد {minutes} دقيقة.\n\nإن لم تطلب ذلك، فتجاهل هذه الرسالة، وستبقى كلمة المرور الحالية كما هي.",
        'mail_welcome_on' => '1',
        'mail_welcome_subject' => 'أهلًا بك في {site}',
        'mail_welcome_body' => "مرحبًا {name}،\n\nيسعدنا انضمامك إلى {site}. لديك فترة تجريبية مجانية مدتها {trial_days} أيام، يتصفح فيها أبناؤك جميع المواد والدروس دون أي التزام.\n\nأولًا، أضف أبناءك: من صفحة «حسابي» اكتب اسم كل طالب واختر صفه الدراسي.\n\nثانيًا، اختر المواد: افتح صفحة الاشتراك واختر المواد التي يحتاجها كل طالب، فيظهر لك رمز الطلب والمبلغ.\n\nثالثًا، ادفع عبر واتساب: أرسل رمز الطلب إلى الرقم {whatsapp}، وتُفعَّل المواد فور تأكيد الدفع.\n\nنتمنى لأبنائك رحلة تعلّم ممتعة ومثمرة.",
    ];

    public static function all_(): array
    {
        return Cache::remember('site_settings', 60, function () {
            $stored = Schema::hasTable('site_settings') ? static::query()->pluck('value', 'key')->all() : [];

            return array_merge(self::DEFAULTS, array_intersect_key($stored, self::DEFAULTS));
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

    public static function put(array $values): void
    {
        foreach ($values as $k => $v) {
            if (array_key_exists($k, self::DEFAULTS)) {
                static::query()->updateOrCreate(['key' => $k], ['value' => (string) $v]);
            }
        }
        Cache::forget('site_settings');
    }

    /** Price list, one entry per grade+subject. @return array<string, array{code:string,name:string,price:int,days:int,grade:int,subject:string}> */
    /** Default price when the admin has not set one: 15 for grades 1-2, 20 for grades 6 and 8, 30 days. */
    public static function defaultPlan(int $grade): array
    {
        return ['price' => $grade <= 2 ? 15 : 20, 'days' => 30];
    }

    public static function plans(): array
    {
        $set = [];
        foreach (preg_split('/\R/', static::get('prices')) as $line) {
            $p = array_map('trim', explode('|', $line));
            if (count($p) === 3 && isset(\App\Support\Ar::SUBJECTS[$p[0]]) && ctype_digit($p[1]) && ctype_digit($p[2]) && (int) $p[1] > 0 && (int) $p[2] > 0) {
                $set[$p[0]] = ['price' => (int) $p[1], 'days' => (int) $p[2]];
            }
        }
        $out = [];
        foreach (\App\Support\Ar::SUBJECTS as $code => [$g, $subj]) {
            $v = $set[$code] ?? static::defaultPlan($g);
            $out[$code] = ['code' => $code, 'name' => $subj.' — '.\App\Support\Ar::grade($g), 'price' => $v['price'], 'days' => $v['days'], 'grade' => $g, 'subject' => $subj];
        }

        return $out;
    }

    /** Grade groups shown on the landing pricing cards. */
    public const PRICE_GROUPS = [[1, 2], [6, 8]];

    /** Public price summary for the static landing: one entry per grade group, min/max from the admin-set prices. */
    public static function publicPrices(): array
    {
        $plans = static::plans();
        $groups = [];
        foreach (self::PRICE_GROUPS as $grades) {
            $set = array_values(array_filter($plans, fn ($p) => in_array($p['grade'], $grades, true)));
            if (! $set) {
                continue;
            }
            $prices = array_column($set, 'price');
            $days = array_column($set, 'days');
            $groups[] = [
                'key' => implode('-', $grades), 'grades' => $grades, 'title' => \App\Support\Ar::gradeGroup($grades),
                'min' => min($prices), 'max' => max($prices), 'from' => min($prices) !== max($prices),
                'days' => min($days), 'days_vary' => min($days) !== max($days),
            ];
        }

        return [
            'currency' => static::get('currency'), 'trial_days' => max(0, (int) static::get('trial_days')),
            'groups' => $groups,
            'plans' => array_map(fn ($p) => ['price' => $p['price'], 'days' => $p['days'], 'grade' => $p['grade']], $plans),
        ];
    }

    public static function publicData(): array
    {
        return [
            'site_name' => static::get('site_name'), 'tagline' => static::get('tagline'),
            'registration_open' => static::flag('registration_open'),
            'announcement' => static::flag('announcement_active') ? static::get('announcement') : '',
        ];
    }
}
