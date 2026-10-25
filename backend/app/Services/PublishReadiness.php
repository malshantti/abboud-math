<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

/** فحص اكتمال المسودة قبل نشرها للطلاب (المسودة نفسها فُحصت بنيويًا في AuthoringValidator). */
class PublishReadiness
{
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['document' => $message]);
    }

    private function filled(mixed $v): bool
    {
        return is_string($v) && trim($v) !== '';
    }

    private function question(mixed $q, string $where): void
    {
        if (! is_array($q) || ! $this->filled($q['prompt'] ?? null) || ! is_int($q['answer'] ?? null) || count(array_filter($q['options'] ?? [], fn ($o) => $this->filled($o))) !== 4) {
            $this->fail('لا يمكن النشر: أكمل نص السؤال وخياراته الأربعة والإجابة الصحيحة في '.$where.'.');
        }
    }

    /** يعيد نطاق النشر: أزواج [الصف، المادة] التي يظهر فيها المحتوى. */
    public function check(string $kind, array $doc): array
    {
        if ($kind === 'quiz') {
            $meta = $doc['metadata'] ?? [];
            $questions = $doc['questions'] ?? [];
            if (! $questions) {
                $this->fail('لا يمكن النشر: الاختبار بلا أسئلة.');
            }
            if (! $this->filled($meta['title'] ?? null)) {
                $this->fail('لا يمكن النشر: أضف عنوان الاختبار.');
            }
            foreach ($questions as $i => $q) {
                $where = 'السؤال '.($i + 1);
                if (! $this->filled($q['prompt'] ?? null)) {
                    $this->fail('لا يمكن النشر: نص '.$where.' فارغ.');
                }
                $ok = match ($q['type'] ?? null) {
                    'mcq' => is_int($q['answer'] ?? null) && count(array_filter($q['options'] ?? [], fn ($o) => $this->filled($o))) === 4,
                    'tf' => is_bool($q['answer'] ?? null),
                    'short' => count(array_filter($q['acceptedAnswers'] ?? [], fn ($o) => $this->filled($o))) > 0,
                    default => false,
                };
                if (! $ok) {
                    $this->fail('لا يمكن النشر: حدّد الإجابة الصحيحة وأكمل الخيارات في '.$where.'.');
                }
            }

            return [[(int) $meta['grade'], (string) $meta['subject']]];
        }
        $items = $doc['items'] ?? [];
        if (! $items) {
            $this->fail('لا يمكن النشر: الحزمة لا تحتوي عناصر.');
        }
        $scope = [];
        foreach ($items as $item) {
            $where = '«'.($item['title'] ?? '').'»';
            if (! $this->filled($item['title'] ?? null)) {
                $this->fail('لا يمكن النشر: يوجد عنصر بلا عنوان.');
            }
            if ($item['type'] === 'lesson') {
                if (! $item['steps'] || array_filter($item['steps'], fn ($s) => ! $this->filled($s['body'] ?? null) && ! isset($s['image']) && ! isset($s['math']))) {
                    $this->fail('لا يمكن النشر: أكمل خطوات الشرح في الدرس '.$where.'.');
                }
                $this->question($item['check'], 'سؤال التحقق في الدرس '.$where);
            } elseif ($item['type'] === 'adventure') {
                if (! $item['stages']) {
                    $this->fail('لا يمكن النشر: المغامرة '.$where.' بلا مراحل.');
                }
                foreach ($item['stages'] as $stage) {
                    $this->question($stage, 'مراحل المغامرة '.$where);
                }
            } elseif ($item['type'] === 'lab' && ($item['template'] ?? '') === 'observe') {
                if (! $this->filled($item['config']['question'] ?? null) || ! array_filter($item['config']['observations'] ?? [], fn ($o) => $this->filled($o))) {
                    $this->fail('لا يمكن النشر: أكمل سؤال المختبر '.$where.' ومشاهداته.');
                }
            }
            $scope[$item['grade'].'-'.$item['subject']] = [(int) $item['grade'], (string) $item['subject']];
        }

        return array_values($scope);
    }
}
