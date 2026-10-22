<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = ['name', 'grade', 'avatar', 'local_id'];

    protected $hidden = ['pin_salt', 'pin_hash'];

    /** Same lightweight format the site uses (profiles.js hash()): sha256 of «bustan:salt:pin». */
    public function setPin(?string $pin): void
    {
        if ($pin === null || $pin === '') {
            return;
        }
        $salt = bin2hex(random_bytes(8));
        $this->forceFill(['pin_salt' => $salt, 'pin_hash' => 'sha256:'.hash('sha256', 'bustan:'.$salt.':'.$pin)]);
    }

    public function hasPin(): bool
    {
        return (bool) $this->pin_hash;
    }

    /** Subjects of the student's grade that the account can open now (trial/open: all of the grade). */
    public function subjectsFor(array $access): array
    {
        $out = [];
        if (! $this->grade || empty($access['access'])) {
            return $out;
        }
        foreach (Setting::catalog() as $code => [$g, $name]) {
            if ((int) $g === (int) $this->grade && ($access['subjects'] === null || in_array($code, $access['subjects'], true))) {
                $out[] = ['code' => $code, 'name' => $name];
            }
        }

        return $out;
    }

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

    public function toApi(?array $access = null): array
    {
        $out = ['id' => $this->id, 'name' => $this->name, 'grade' => $this->grade, 'grade_name' => $this->grade ? \App\Support\Ar::grade($this->grade) : null, 'avatar' => $this->avatar, 'local_id' => $this->local_id,
            'pin' => $this->pin_hash ? ['salt' => $this->pin_salt, 'hash' => $this->pin_hash] : null];
        if ($access !== null) {
            $out['subjects'] = $this->subjectsFor($access);
        }

        return $out;
    }
}
