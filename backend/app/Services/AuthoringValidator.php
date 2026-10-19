<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

/** Validates private, possibly incomplete drafts. This does not approve publication. */
class AuthoringValidator
{
    private array $ids = [];

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['document' => $message]);
    }

    private function object(mixed $value, array $keys, array $optional = []): array
    {
        if (! is_array($value) || ($value !== [] && array_is_list($value)) || array_diff(array_keys($value), $keys) || array_diff(array_diff($keys, $optional), array_keys($value))) {
            $this->fail('بنية المسودة أو أحد حقولها غير معتمدة.');
        }

        return $value;
    }

    private function text(mixed $value, int $max): void
    {
        if (! is_string($value) || mb_strlen($value) > $max) {
            $this->fail('يوجد نص من نوع غير صالح أو يتجاوز الحد المسموح.');
        }
    }

    private function number(mixed $value, int $min, int $max, bool $nullable = false): void
    {
        if (! ($nullable && $value === null) && (! is_int($value) || $value < $min || $value > $max)) {
            $this->fail('يوجد عدد خارج الحدود المسموحة.');
        }
    }

    private function listing(mixed $value, int $max, ?int $exact = null): array
    {
        if (! is_array($value) || ! array_is_list($value) || count($value) > $max || ($exact !== null && count($value) !== $exact)) {
            $this->fail('عدد العناصر أو شكل القائمة غير صالح.');
        }

        return $value;
    }

    private function choice(mixed $value, array $allowed): void
    {
        if (! in_array($value, $allowed, true)) {
            $this->fail('نوع المحتوى أو الصف أو المادة غير معتمد.');
        }
    }

    private function identity(mixed $id, bool $claim = true, bool $quiz = false): void
    {
        $pattern = $quiz ? '/^[a-z][a-z0-9-]{0,49}$/D' : '/^[A-Za-z][A-Za-z0-9_-]{0,79}$/D';
        if (! is_string($id) || ! preg_match($pattern, $id) || ($claim && isset($this->ids[$id]))) {
            $this->fail('معرّف غير صالح أو مكرر في المسودة.');
        }
        if ($claim) {
            $this->ids[$id] = true;
        }
    }

    private function reference(mixed $value, bool $quiz): void
    {
        $ref = $this->object($value, ['book', 'page']);
        $this->text($ref['book'], $quiz ? 200 : 300);
        $this->number($ref['page'], 1, $quiz ? 2000 : 9999, true);
    }

    private function image(mixed $value): void
    {
        $image = $this->object($value, ['dataUrl', 'mime', 'width', 'height', 'alt']);
        $this->choice($image['mime'], ['image/png', 'image/jpeg', 'image/webp']);
        $this->text($image['alt'], 300);
        $this->number($image['width'], 1, 1600);
        $this->number($image['height'], 1, 1600);
        if (! is_string($image['dataUrl']) || strlen($image['dataUrl']) > 683000 || ! preg_match('~^data:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$~D', $image['dataUrl'], $match) || $match[1] !== $image['mime']) {
            $this->fail('الصورة يجب أن تكون PNG أو JPEG أو WebP مضمّنة، دون روابط خارجية.');
        }
        $bytes = base64_decode($match[2], true);
        $size = $bytes === false ? false : @getimagesizefromstring($bytes);
        if ($bytes === false || strlen($bytes) > 500 * 1024 || ! $size || $size[0] !== $image['width'] || $size[1] !== $image['height'] || $size['mime'] !== $image['mime']) {
            $this->fail('توقيع الصورة أو حجمها أو أبعادها لا يطابق البيانات المرفقة.');
        }
        if (! function_exists('imagecreatefromstring') || ! ($decoded = @imagecreatefromstring($bytes))) {
            $this->fail('تعذر فك الصورة وفحصها على الخادم.');
        }
        imagedestroy($decoded);
    }

    private function math(mixed $value): void
    {
        $math = $this->object($value, ['version', 'tokens']);
        $this->choice($math['version'], [1]);
        foreach ($this->listing($math['tokens'], 40) as $token) {
            if (! is_array($token)) {
                $this->fail('صيغة رياضية غير صالحة.');
            }
            $kind = $token['kind'] ?? null;
            $fields = match ($kind) {
                'text' => ['value'], 'fraction' => ['numerator', 'denominator'],
                'root' => ['value', 'index'], 'power' => ['base', 'exponent'],
                default => $this->fail('نوع التعبير الرياضي غير معتمد.'),
            };
            $this->object($token, ['kind', ...$fields]);
            foreach ($fields as $field) {
                $this->text($token[$field], $kind === 'text' ? 200 : 120);
            }
            if ($kind === 'fraction') {
                $denominator = strtr($token['denominator'], ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9', '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9', '٫' => '.', ',' => '.', '−' => '-']);
                $denominator = preg_replace('/[\s\x{2066}-\x{2069}\x{200E}\x{200F}]/u', '', $denominator);
                if (is_numeric($denominator) && (float) $denominator === 0.0) {
                    $this->fail('لا يُسمح بمقام عددي يساوي صفرًا.');
                }
            }
        }
    }

    private function check(mixed $value, bool $stage = false): void
    {
        $check = $this->object($value, $stage ? ['id', 'prompt', 'options', 'answer', 'feedback'] : ['prompt', 'options', 'answer', 'feedback']);
        if ($stage) {
            $this->identity($check['id']);
        }
        $this->text($check['prompt'], 2000);
        $this->text($check['feedback'], 2000);
        foreach ($this->listing($check['options'], 4, 4) as $option) {
            $this->text($option, 600);
        }
        $this->number($check['answer'], 0, 3, true);
    }

    public function validate(string $kind, array $data): array
    {
        $this->ids = [];
        if (strlen(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)) > 12 * 1024 * 1024) {
            $this->fail('المسودة تتجاوز ١٢ ميغابايت.');
        }
        $counts = ['unit' => 0, 'lesson' => 0, 'adventure' => 0, 'lab' => 0, 'questions' => 0];
        if ($kind === 'quiz') {
            $this->object($data, ['version', 'metadata', 'questions']);
            $this->choice($data['version'], ['bustan-quiz-draft-v1']);
            $meta = $this->object($data['metadata'], ['title', 'grade', 'subject', 'durationMinutes']);
            $this->text($meta['title'], 160);
            $this->choice($meta['grade'], [6, 8]);
            $this->choice($meta['subject'], ['math', 'arabic', 'english', 'science']);
            $this->number($meta['durationMinutes'], 1, 300, true);
            foreach ($this->listing($data['questions'], 100) as $question) {
                if (! is_array($question)) {
                    $this->fail('سؤال غير صالح.');
                }
                $type = $question['type'] ?? null;
                $extras = match ($type) {
                    'mcq' => ['options', 'answer', 'optionMath'], 'tf' => ['answer'], 'short' => ['acceptedAnswers'], default => $this->fail('نوع السؤال غير معتمد.')
                };
                $this->object($question, ['id', 'type', 'prompt', 'points', 'reference', 'image', 'math', ...$extras], ['image', 'math', 'optionMath']);
                $this->identity($question['id'], true, true);
                $this->text($question['prompt'], 3000);
                $this->number($question['points'], 1, 100, true);
                $this->reference($question['reference'], true);
                if (isset($question['image'])) {
                    $this->image($question['image']);
                }
                if (isset($question['math'])) {
                    $this->math($question['math']);
                }
                if (array_key_exists('image', $question) && $question['image'] === null) {
                    $this->fail('صورة غير صالحة.');
                }
                if (array_key_exists('math', $question) && $question['math'] === null) {
                    $this->fail('صيغة رياضية غير صالحة.');
                }
                if ($type === 'mcq') {
                    foreach ($this->listing($question['options'], 4, 4) as $option) {
                        $this->text($option, 500);
                    }
                    $this->number($question['answer'], 0, 3, true);
                    if (array_key_exists('optionMath', $question)) {
                        foreach ($this->listing($question['optionMath'], 4, 4) as $expression) {
                            if ($expression !== null) {
                                $this->math($expression);
                            }
                        }
                    }
                } elseif ($type === 'tf') {
                    if (! is_bool($question['answer']) && $question['answer'] !== null) {
                        $this->fail('إجابة صواب وخطأ غير صالحة.');
                    }
                } else {
                    foreach ($this->listing($question['acceptedAnswers'], 10) as $answer) {
                        $this->text($answer, 500);
                    }
                }
                $counts['questions']++;
            }
        } else {
            $this->object($data, ['version', 'items']);
            $this->choice($data['version'], ['bustan-content-draft-v1']);
            $items = $this->listing($data['items'], 100);
            $map = [];
            foreach ($items as $item) {
                if (! is_array($item)) {
                    $this->fail('عنصر محتوى غير صالح.');
                }
                $type = $item['type'] ?? null;
                $extras = match ($type) {
                    'unit' => ['objectives', 'image'], 'lesson' => ['steps', 'check'], 'adventure' => ['template', 'stages'], 'lab' => ['template', 'config'], default => $this->fail('نوع المحتوى غير معتمد.')
                };
                $this->object($item, ['id', 'type', 'grade', 'subject', 'term', 'title', 'description', 'order', 'reference', 'unitId', 'lessonId', ...$extras], ['image']);
                $this->identity($item['id']);
                $this->choice($item['grade'], [6, 8]);
                $this->choice($item['subject'], ['math', 'arabic', 'english', 'science']);
                $this->choice($item['term'], [1, 2]);
                $this->text($item['title'], 160);
                $this->text($item['description'], 2000);
                $this->number($item['order'], 1, 999);
                $this->reference($item['reference'], false);
                foreach (['unitId', 'lessonId'] as $field) {
                    if ($item[$field] !== null) {
                        $this->identity($item[$field], false);
                    }
                }
                if (($type === 'unit' && ($item['unitId'] !== null || $item['lessonId'] !== null)) || ($type === 'lesson' && $item['lessonId'] !== null)) {
                    $this->fail('ارتباط الوحدة أو الدرس غير صالح.');
                }
                if ($type === 'unit') {
                    foreach ($this->listing($item['objectives'], 20) as $objective) {
                        $this->text($objective, 500);
                    }
                    if (array_key_exists('image', $item)) {
                        $this->image($item['image']);
                    }
                } elseif ($type === 'lesson') {
                    foreach ($this->listing($item['steps'], 30) as $step) {
                        $this->object($step, ['id', 'title', 'body', 'math', 'image'], ['math', 'image']);
                        $this->identity($step['id']);
                        $this->text($step['title'], 160);
                        $this->text($step['body'], 6000);
                        if (array_key_exists('image', $step)) {
                            $this->image($step['image']);
                        }
                        if (array_key_exists('math', $step)) {
                            if ($item['subject'] !== 'math') {
                                $this->fail('التعبيرات الرياضية في درس الرياضيات فقط.');
                            }
                            $this->math($step['math']);
                        }
                    }
                    $this->check($item['check']);
                } elseif ($type === 'adventure') {
                    $this->choice($item['template'], ['path']);
                    foreach ($this->listing($item['stages'], 20) as $stage) {
                        $this->check($stage, true);
                    }
                } else {
                    $template = $item['template'];
                    $fields = match ($template) {
                        'fraction' => ['parts', 'selected'], 'number-line' => ['min', 'max', 'point'], 'observe' => ['question', 'observations'], default => $this->fail('قالب المختبر غير معتمد.')
                    };
                    $config = $this->object($item['config'], $fields);
                    if ($template !== 'observe' && $item['subject'] !== 'math') {
                        $this->fail('مختبر الكسور وخط الأعداد للرياضيات فقط.');
                    }
                    if ($template === 'fraction') {
                        $this->number($config['parts'], 2, 12);
                        $this->number($config['selected'], 1, $config['parts']);
                    } elseif ($template === 'number-line') {
                        $this->number($config['min'], -20, 19);
                        $this->number($config['max'], $config['min'] + 1, min(20, $config['min'] + 20));
                        $this->number($config['point'], $config['min'], $config['max']);
                    } else {
                        $this->text($config['question'], 2000);
                        foreach ($this->listing($config['observations'], 12) as $observation) {
                            $this->text($observation, 1500);
                        }
                    }
                }
                $map[$item['id']] = $item;
                $counts[$type]++;
            }
            foreach ($items as $item) {
                foreach (['unitId' => 'unit', 'lessonId' => 'lesson'] as $field => $type) {
                    if ($item[$field] === null) {
                        continue;
                    }
                    $target = $map[$item[$field]] ?? null;
                    if (! $target || $target['type'] !== $type || $target['grade'] !== $item['grade'] || $target['subject'] !== $item['subject'] || $target['term'] !== $item['term']) {
                        $this->fail('روابط المحتوى يجب أن تشير إلى عنصر موجود في الصف والمادة والفصل نفسها.');
                    }
                    if ($field === 'unitId' && in_array($item['type'], ['adventure', 'lab']) && $item['lessonId'] !== null && ($map[$item['lessonId']]['unitId'] ?? null) !== $item['unitId']) {
                        $this->fail('وحدة النشاط لا تطابق وحدة الدرس المرتبط.');
                    }
                }
            }
        }

        return $counts;
    }
}
