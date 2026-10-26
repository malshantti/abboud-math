<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Classroom extends Model
{
    protected $fillable = ['name', 'grade', 'code', 'join_open'];

    protected function casts(): array
    {
        return ['grade' => 'integer', 'join_open' => 'boolean'];
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'classroom_teacher');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'classroom_student')->withPivot('joined_at');
    }

    /** Short, unambiguous join code (no 0/O/1/I). */
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

    public static function normalizeCode(string $c): string
    {
        $c = strtr(trim($c), ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9']);

        return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $c));
    }

    /** Classes the user may open: admins all, teachers only their own. */
    public function scopeVisibleTo($q, User $u)
    {
        return $u->isAdminRole() ? $q : $q->whereHas('teachers', fn ($t) => $t->whereKey($u->id));
    }
}
