<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class QuestionLesson extends Model
{
    protected $fillable = ['grade', 'subject', 'lesson', 'mode'];

    protected static function booted(): void
    {
        static::saved(fn (QuestionLesson $l) => Cache::forget("qbank:{$l->grade}:{$l->subject}"));
    }
}
