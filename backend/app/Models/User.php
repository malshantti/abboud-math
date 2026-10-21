<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $attributes = [
        'is_admin' => false,
        'role' => 'parent',
    ];

    public const ROLES = ['parent' => 'ولي أمر', 'teacher' => 'معلّم', 'admin' => 'مشرف'];

    public function students(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /** Parent (family) accounts only: excludes admins, teachers and legacy is_admin flags. */
    public function scopeParents($query)
    {
        return $query->where('role', 'parent')->where(fn ($q) => $q->where('is_admin', false)->orWhereNull('is_admin'));
    }

    public function isAdminRole(): bool
    {
        return $this->is_admin === true || $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->isAdminRole() || $this->role === 'teacher';
    }

    public function isDisabled(): bool
    {
        return $this->disabled_at !== null;
    }

    public function setRole(string $role): void
    {
        $this->role = array_key_exists($role, self::ROLES) ? $role : 'parent';
        $this->is_admin = $this->role === 'admin';
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordAr($token));
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_admin' => 'boolean',
            'disabled_at' => 'datetime',
            'last_login_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
