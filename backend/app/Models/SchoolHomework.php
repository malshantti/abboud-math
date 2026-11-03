<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolHomework extends Model
{
    protected $table = 'school_homework';

    protected $fillable = ['school_id', 'school_section_id', 'teacher_id', 'subject', 'title', 'items', 'due_at', 'is_test'];

    protected function casts(): array
    {
        return ['items' => 'array', 'due_at' => 'datetime', 'is_test' => 'boolean'];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(SchoolSection::class, 'school_section_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
