<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Question;
use App\Models\QuestionLesson;
use App\Support\MediaLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class QuestionController extends Controller
{
    public const SUBJECTS = ['math' => 'الرياضيات', 'arabic' => 'العربية', 'english' => 'الإنجليزية', 'science' => 'العلوم', 'life' => 'التربية الحياتية'];

    public function index(Request $request): View
    {
        $grade = (int) $request->query('grade', 6);
        $subject = (string) $request->query('subject', 'math');
        $lesson = (string) $request->query('lesson', '');
        $base = Question::where(compact('grade', 'subject'));
        $lessons = (clone $base)->selectRaw('lesson, max(lesson_title) as title, max(unit) as unit, count(*) as n, sum(case when active then 1 else 0 end) as live')
            ->groupBy('lesson')->get()->sortBy(fn ($r) => $this->order($r->lesson))->values();
        $rows = (clone $base)->when($lesson !== '', fn ($q) => $q->where('lesson', $lesson))
            ->when($request->filled('q'), fn ($q) => $q->where('q', 'like', '%'.$request->query('q').'%'))
            ->when($request->query('state') === 'live', fn ($q) => $q->where('active', true))
            ->when($request->query('state') === 'off', fn ($q) => $q->where('active', false))
            ->orderBy('lesson')->orderBy('position')->orderBy('id')->paginate(40)->withQueryString();
        $modes = QuestionLesson::where(compact('grade', 'subject'))->pluck('mode', 'lesson')->all();
        $pairs = Question::selectRaw('grade, subject, count(*) as n, sum(case when active then 1 else 0 end) as live')->groupBy('grade', 'subject')->get();

        return view('manage.questions', compact('grade', 'subject', 'lesson', 'lessons', 'rows', 'modes', 'pairs') + [
            'subjects' => self::SUBJECTS, 'live' => in_array("$grade-$subject", Question::LIVE, true),
        ]);
    }

    public function create(Request $request): View
    {
        $q = new Question(['grade' => (int) $request->query('grade', 6), 'subject' => (string) $request->query('subject', 'math'),
            'lesson' => (string) $request->query('lesson', ''), 'choices' => [['t' => '', 'ok' => true], ['t' => ''], ['t' => '']], 'active' => true]);
        if ($q->lesson && $o = Question::where(['grade' => $q->grade, 'subject' => $q->subject, 'lesson' => $q->lesson])->first()) {
            $q->lesson_title = $o->lesson_title;
            $q->unit = $o->unit;
        }

        return view('manage.question', ['question' => $q, 'subjects' => self::SUBJECTS]);
    }

    public function edit(Question $question): View
    {
        return view('manage.question', ['question' => $question, 'subjects' => self::SUBJECTS]);
    }

    public function store(Request $request): RedirectResponse
    {
        $q = new Question(['origin' => 'admin']);
        $this->fill($request, $q);
        ActivityLog::record('question.create', "g{$q->grade}/{$q->subject} {$q->lesson}");

        return redirect()->route('manage.questions', $this->back($q))->with('status', 'أُضيف السؤال.'.($q->active ? ' يظهر للطلاب الآن.' : ''));
    }

    public function update(Request $request, Question $question): RedirectResponse
    {
        $this->fill($request, $question);
        ActivityLog::record('question.update', "g{$question->grade}/{$question->subject} {$question->lesson} #{$question->id}");

        return redirect()->route('manage.questions', $this->back($question))->with('status', 'حُفظ السؤال.'.($question->active ? ' يظهر للطلاب عند فتح الدرس التالي.' : ''));
    }

    public function toggle(Question $question): RedirectResponse
    {
        $question->update(['active' => ! $question->active]);
        ActivityLog::record('question.update', "#{$question->id} ".($question->active ? 'on' : 'off'));

        return back()->with('status', $question->active ? 'فُعّل السؤال.' : 'أُوقف السؤال.');
    }

    public function destroy(Question $question): RedirectResponse
    {
        $back = $this->back($question);
        $question->delete();
        ActivityLog::record('question.delete', "#{$question->id}");

        return redirect()->route('manage.questions', $back)->with('status', 'حُذف السؤال.');
    }

    public function mode(Request $request): RedirectResponse
    {
        $d = $request->validate(['grade' => ['required', 'integer', 'between:1,12'], 'subject' => ['required', Rule::in(array_keys(self::SUBJECTS))],
            'lesson' => ['required', 'string', 'max:40'], 'mode' => ['required', Rule::in(array_keys(Question::MODES))]]);
        QuestionLesson::updateOrCreate(['grade' => $d['grade'], 'subject' => $d['subject'], 'lesson' => $d['lesson']], ['mode' => $d['mode']]);

        return back()->with('status', 'حُفظ وضع الدرس.');
    }

    /** Public: active questions for one subject page. */
    public function feed(int $grade, string $subject): JsonResponse
    {
        abort_unless(preg_match('/^[a-z]{2,12}$/', $subject) && $grade >= 1 && $grade <= 12, 404);

        return response()->json(Question::feed($grade, $subject))->header('Cache-Control', 'public, max-age=60');
    }

    private function fill(Request $request, Question $q): void
    {
        $d = $request->validate([
            'grade' => ['required', 'integer', 'between:1,12'], 'subject' => ['required', Rule::in(array_keys(self::SUBJECTS))],
            'lesson' => ['required', 'string', 'max:40', 'regex:/^[A-Za-z0-9_.\-]+$/'], 'lesson_title' => ['nullable', 'string', 'max:190'],
            'q' => ['required', 'string', 'max:2000'], 'choices' => ['required', 'array', 'min:2', 'max:6'],
            'choices.*.t' => ['nullable', 'string', 'max:300'], 'choices.*.m' => ['nullable', 'string', 'max:500'],
            'correct' => ['required', 'integer', 'min:0'], 'hint' => ['nullable', 'string', 'max:1000'], 'explain' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'string', 'max:300'], 'image_file' => ['nullable', 'file', 'max:4096', 'mimes:png,jpg,jpeg,webp,gif'],
            'remove_image' => ['nullable', 'boolean'], 'active' => ['nullable', 'boolean'], 'position' => ['nullable', 'integer', 'min:0'],
        ], ['q.required' => 'اكتب نص السؤال.', 'correct.required' => 'اختر الإجابة الصحيحة.']);
        $choices = [];
        foreach (array_values($d['choices']) as $i => $c) {
            $t = trim((string) ($c['t'] ?? ''));
            if ($t === '') {
                if ($i === (int) $d['correct']) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['correct' => 'الإجابة الصحيحة فارغة.']);
                }

                continue;
            }
            $choices[] = array_filter(['t' => $t, 'ok' => $i === (int) $d['correct'], 'm' => trim((string) ($c['m'] ?? ''))], fn ($v) => $v !== '');
        }
        if (count($choices) < 2 || count(array_unique(array_column($choices, 't'))) !== count($choices)) {
            throw \Illuminate\Validation\ValidationException::withMessages(['choices' => 'يلزم خياران مختلفان على الأقل.']);
        }
        $image = $q->image;
        if ($request->hasFile('image_file')) {
            $image = MediaLibrary::store($request->file('image_file'));
        } elseif ($request->boolean('remove_image')) {
            $image = null;
        } elseif (isset($d['image']) && $d['image'] !== ($q->image ?? '')) {
            $image = MediaLibrary::safe($d['image']) ?? throw \Illuminate\Validation\ValidationException::withMessages(['image' => 'مسار الصورة غير موجود في مكتبة الوسائط.']);
        }
        $q->fill(['grade' => $d['grade'], 'subject' => $d['subject'], 'lesson' => $d['lesson'], 'lesson_title' => $d['lesson_title'] ?? $q->lesson_title,
            'q' => trim($d['q']), 'choices' => $choices, 'hint' => $d['hint'] ?? null, 'explain' => $d['explain'] ?? null, 'image' => $image,
            'active' => $request->boolean('active'), 'position' => $d['position'] ?? $q->position ?? 0, 'updated_by' => $request->user()->id]);
        $q->save();
    }

    private function back(Question $q): array
    {
        return ['grade' => $q->grade, 'subject' => $q->subject, 'lesson' => $q->lesson];
    }

    private function order(string $lesson): string
    {
        return preg_replace_callback('/\d+/', fn ($m) => str_pad($m[0], 4, '0', STR_PAD_LEFT), $lesson);
    }
}
