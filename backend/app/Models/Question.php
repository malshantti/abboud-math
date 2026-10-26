<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Question extends Model
{
    protected $fillable = ['grade', 'subject', 'lesson', 'lesson_title', 'unit', 'position', 'q', 'choices', 'hint', 'explain', 'image', 'active', 'origin', 'updated_by'];

    protected $casts = ['choices' => 'array', 'active' => 'boolean', 'grade' => 'integer', 'position' => 'integer'];

    /** Subjects whose pages read the bank (others: admin can prepare, pages still use the files). */
    public const LIVE = ['6-math'];

    public const MODES = ['mix' => 'مع الأسئلة المولَّدة (مزج)', 'only' => 'أسئلة البنك فقط'];

    protected static function booted(): void
    {
        $flush = fn (Question $q) => Cache::forget("qbank:{$q->grade}:{$q->subject}");
        static::saved($flush);
        static::deleted($flush);
    }

    public function correctIndex(): ?int
    {
        foreach ((array) $this->choices as $i => $c) {
            if (! empty($c['ok'])) {
                return $i;
            }
        }

        return null;
    }

    /** Public feed for one subject page: only active questions, grouped by lesson. */
    public static function feed(int $grade, string $subject): array
    {
        return Cache::remember("qbank:$grade:$subject", 300, function () use ($grade, $subject) {
            $modes = QuestionLesson::where(compact('grade', 'subject'))->pluck('mode', 'lesson')->all();
            $out = [];
            foreach (static::where(compact('grade', 'subject'))->where('active', true)->orderBy('lesson')->orderBy('position')->orderBy('id')->get() as $q) {
                $out[$q->lesson] ??= ['mode' => $modes[$q->lesson] ?? 'mix', 'items' => []];
                $out[$q->lesson]['items'][] = array_filter(['id' => $q->id, 'q' => $q->q,
                    'choices' => array_map(fn ($c) => array_filter(['t' => (string) $c['t'], 'ok' => ! empty($c['ok']) ?: null, 'm' => ($c['m'] ?? '') ?: null], fn ($v) => $v !== null), $q->choices),
                    'hint' => $q->hint, 'explain' => $q->explain, 'img' => $q->image], fn ($v) => $v !== null && $v !== '');
            }

            return ['grade' => $grade, 'subject' => $subject, 'v' => substr(md5(json_encode($out)), 0, 10), 'lessons' => (object) $out];
        });
    }
}
