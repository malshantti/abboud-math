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

    public function statusLabel(): string
    {
        if ($this->status === 'active' && $this->ends_at && $this->ends_at->isPast()) {
            return self::STATUS['expired'];
        }

        return self::STATUS[$this->status] ?? $this->status;
    }
}
