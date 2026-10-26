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

    public function pushSubscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /** Classes this teacher is assigned to. */
    public function classrooms(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Classroom::class, 'classroom_teacher');
    }

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /** Parent (family) accounts only: excludes admins, teachers and legacy is_admin flags. */
    /** Test/QA/bot domains kept out of the admin stats (accounts still visible in the users list). */
    public static function testEmailPatterns(): array
    {
        return array_map(fn ($d) => '%@'.$d, (array) config('app.test_email_domains', []));
    }

    public function isTest(): bool
    {
        foreach ((array) config('app.test_email_domains', []) as $d) {
            if (str_ends_with(strtolower((string) $this->email), '@'.strtolower($d))) {
                return true;
            }
        }

        return false;
    }

    /** Real accounts only: excludes test/QA emails. */
    public function scopeReal($query)
    {
        foreach (self::testEmailPatterns() as $p) {
            $query->where('email', 'not like', $p);
        }

        return $query;
    }

    public function scopeTest($query)
    {
        $patterns = self::testEmailPatterns();
        if ($patterns === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function ($q) use ($patterns) {
            foreach ($patterns as $p) {
                $q->orWhere('email', 'like', $p);
            }
        });
    }

    public function scopeParents($query)
    {
        return $query->where('role', 'parent')->where(fn ($q) => $q->where('is_admin', false)->orWhereNull('is_admin'));
    }

    /** Readable device name from the user agent, for the admin user page. */
    public function deviceLabel(): ?string
    {
        $ua = (string) $this->active_device_ua;
        if ($ua === '') {
            return null;
        }
        $os = match (true) { str_contains($ua, 'iPhone') => 'آيفون', str_contains($ua, 'iPad') => 'آيباد', str_contains($ua, 'Android') => 'أندرويد', str_contains($ua, 'Windows') => 'ويندوز', str_contains($ua, 'Mac OS') => 'ماك', str_contains($ua, 'CrOS') => 'كروم بوك', str_contains($ua, 'Linux') => 'لينكس', default => 'جهاز' };
        $br = match (true) { str_contains($ua, 'Edg/') => 'Edge', str_contains($ua, 'SamsungBrowser') => 'Samsung Internet', str_contains($ua, 'Firefox') => 'Firefox', str_contains($ua, 'Chrome') => 'Chrome', str_contains($ua, 'Safari') => 'Safari', default => '' };

        return trim($os.($br ? ' — '.$br : ''));
    }

    public function isAdminRole(): bool
    {
        return $this->is_admin === true || $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->isAdminRole() || $this->role === 'teacher';
    }

    public function isVerified(): bool
    {
        return $this->email_verified_at !== null;
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
        \App\Support\MailCenter::send('reset', $this, \App\Support\MailCenter::resetUrl($this, $token));
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
        'remember_token', 'active_device_token',
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
            'last_login_at' => 'datetime', 'active_device_seen_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'push_reminders' => 'boolean',
            'last_reminder_on' => 'date',
            'password' => 'hashed',
        ];
    }
}
