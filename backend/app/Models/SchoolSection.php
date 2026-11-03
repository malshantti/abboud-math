<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolSection extends Model
{
    protected $fillable = ['grade', 'name', 'code'];

    protected function casts(): array
    {
        return ['grade' => 'integer'];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class)->orderBy('name');
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'school_section_teacher')->withPivot('subjects');
    }

    /** Short join code without look-alike characters (0/O/1/I). */
    public static function newCode(): string
    {
        do {
            $c = '';
            for ($i = 0; $i < 6; $i++) {
                $c .= 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[random_int(0, 31)];
            }
        } while (static::where('code', $c)->exists());

        return $c;
    }
}
