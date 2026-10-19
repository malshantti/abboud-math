<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AuthoringDocument extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $attributes = ['revision' => 1];

    protected function casts(): array
    {
        return ['document' => 'array', 'counts' => 'array', 'revision' => 'integer'];
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
