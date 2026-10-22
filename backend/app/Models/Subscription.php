<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = ['code', 'batch', 'plan', 'plan_name', 'price', 'currency', 'days', 'scope', 'gateway', 'status', 'student_id', 'note'];

    public const STATUS = ['pending' => 'بانتظار الدفع', 'active' => 'مفعّل', 'cancelled' => 'ملغى', 'expired' => 'منتهٍ'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'price' => 'integer', 'days' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Auto-expire (when enabled in settings): active subscriptions past their end and grace days become expired,
     * and pending requests older than pending_expire_days are cancelled. Returns [expired, cancelled].
     */
    public static function sweep(bool $force = false): array
    {
        if (! Setting::flag('auto_expire') || (! $force && ! \Illuminate\Support\Facades\Cache::add('subscriptions_sweep', 1, 600))) {
            return [0, 0];
        }
        $expired = static::where('status', 'active')->whereNotNull('ends_at')
            ->where('ends_at', '<', now()->subDays(Setting::int('grace_days', 0, 60)))->update(['status' => 'expired', 'updated_at' => now()]);
        $cancelled = 0;
        if (($d = Setting::int('pending_expire_days', 0, 365)) > 0) {
            $cancelled = static::where('status', 'pending')->where('created_at', '<', now()->subDays($d))
                ->update(['status' => 'cancelled', 'note' => 'أُلغي تلقائيًا لانقضاء مدة الانتظار', 'updated_at' => now()]);
        }

        return [$expired, $cancelled];
    }

    public function statusLabel(): string
    {
        if ($this->status === 'active' && $this->ends_at && $this->ends_at->isPast()) {
            return self::STATUS['expired'];
        }

        return self::STATUS[$this->status] ?? $this->status;
    }
}
