<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolQuizAttempt extends Model
{
    protected $fillable = ['school_quiz_id', 'student_id', 'attempt', 'started_at', 'deadline_at', 'submitted_at', 'layout', 'answers', 'correct', 'total', 'score', 'tab_switches', 'auto_submitted'];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'deadline_at' => 'datetime', 'submitted_at' => 'datetime', 'layout' => 'array', 'answers' => 'array', 'auto_submitted' => 'boolean'];
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(SchoolQuiz::class, 'school_quiz_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function seconds(): ?int
    {
        $end = $this->submitted_at ?? null;

        return $end ? max(0, $end->getTimestamp() - $this->started_at->getTimestamp()) : null;
    }
}
