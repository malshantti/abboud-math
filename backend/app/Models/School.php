<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    protected $fillable = ['name', 'slug', 'color', 'color2', 'is_test'];

    protected function casts(): array
    {
        return ['is_test' => 'boolean'];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(SchoolSection::class)->orderBy('grade')->orderBy('name');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(User::class)->whereIn('school_role', ['manager', 'teacher']);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function logoUrl(): ?string
    {
        return $this->logo_path ? route('school.logo', ['school' => $this->slug, 'v' => substr(md5($this->logo_path), 0, 8)]) : null;
    }

    /** Safe CSS color (hex only). */
    public static function hex(?string $c, string $fallback): string
    {
        return is_string($c) && preg_match('/^#[0-9a-fA-F]{6}$/', $c) ? strtolower($c) : $fallback;
    }
}
