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
        'tagline' => 'نزرع الفهم، ونحصد المعرفة',
        'registration_open' => '1',
        'announcement' => '',
        'announcement_active' => '0',
        'trial_days' => '3',
        'whatsapp_number' => '972592945557',
        'currency' => 'شيكل',
        // One subject per line: gradeSubject|price|days  (e.g. g6-math|20|30). Unit = one subject in one grade.
        'prices' => "g1-math|15|30\ng1-arabic|15|30\ng1-english|15|30\ng1-life|15|30\ng2-math|15|30\ng2-arabic|15|30\ng2-english|15|30\ng2-life|15|30\ng6-math|20|30\ng6-arabic|20|30\ng6-english|20|30\ng6-science|20|30\ng8-math|20|30\ng8-arabic|20|30\ng8-english|20|30\ng8-science|20|30",
        'gating_enabled' => '1',
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

    public static function publicData(): array
    {
        return [
            'site_name' => static::get('site_name'), 'tagline' => static::get('tagline'),
            'registration_open' => static::flag('registration_open'),
            'announcement' => static::flag('announcement_active') ? static::get('announcement') : '',
        ];
    }
}
