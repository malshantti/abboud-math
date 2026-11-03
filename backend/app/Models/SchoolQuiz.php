<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolQuiz extends Model
{
    protected $fillable = ['school_id', 'school_section_id', 'teacher_id', 'subject', 'title', 'questions', 'starts_at', 'ends_at', 'duration_min', 'attempts', 'shuffle', 'show_results', 'is_test'];

    protected $hidden = ['questions'];

    protected function casts(): array
    {
        return ['questions' => 'array', 'starts_at' => 'datetime', 'ends_at' => 'datetime', 'shuffle' => 'boolean', 'is_test' => 'boolean', 'duration_min' => 'integer', 'attempts' => 'integer'];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(SchoolSection::class, 'school_section_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function attemptsRel(): HasMany
    {
        return $this->hasMany(SchoolQuizAttempt::class, 'school_quiz_id');
    }

    public function isOpen(): bool
    {
        return (! $this->starts_at || $this->starts_at->isPast()) && (! $this->ends_at || $this->ends_at->isFuture());
    }

    public function state(): string
    {
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'soon';
        }

        return $this->ends_at && $this->ends_at->isPast() ? 'closed' : 'open';
    }

    public function resultsVisible(): bool
    {
        return $this->show_results === 'now' || $this->state() === 'closed';
    }
}
