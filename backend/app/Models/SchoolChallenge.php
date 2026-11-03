<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolChallenge extends Model
{
    public const METRICS = ['stars' => 'نجوم الجهد', 'days' => 'أيام التعلّم', 'minutes' => 'دقائق التعلّم', 'homework' => 'إنجاز الواجبات'];

    protected $fillable = ['school_id', 'created_by', 'title', 'metric', 'section_ids', 'starts_on', 'ends_on', 'is_test'];

    protected function casts(): array
    {
        return ['section_ids' => 'array', 'starts_on' => 'date', 'ends_on' => 'date', 'is_test' => 'boolean'];
    }

    public function state(): string
    {
        $today = now(\App\Support\SchoolStats::tz())->format('Y-m-d');

        return $today < $this->starts_on->format('Y-m-d') ? 'soon' : ($today > $this->ends_on->format('Y-m-d') ? 'done' : 'live');
    }
}
