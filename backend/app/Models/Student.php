<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = ['name', 'grade', 'avatar', 'local_id'];

    protected function casts(): array
    {
        return ['grade' => 'integer', 'last_synced_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(StudentProgress::class);
    }

    public function toApi(): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'grade' => $this->grade, 'avatar' => $this->avatar, 'local_id' => $this->local_id];
    }
}
