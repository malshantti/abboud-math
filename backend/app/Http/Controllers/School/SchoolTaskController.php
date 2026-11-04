<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\School;
use App\Models\SchoolHomework;
use App\Models\SchoolQuiz;
use App\Models\SchoolQuizAttempt;
use App\Models\SchoolSection;
use App\Models\Student;
use App\Models\User;
use App\Support\SchoolStats;
use App\Support\SchoolTasks;
use App\Support\Schools;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

/** Schools phase 3: homework, quizzes (builder, taking, results), manager overview and monthly reports. */
class SchoolTaskController extends Controller
{
    // ---------- access ----------

    private function staff(Request $request, School $school): ?User
    {
        $u = $request->user();

        return $u && $u->isSchoolStaff() && (int) $u->school_id === (int) $school->id && ! $u->isDisabled() ? $u : null;
    }

    private function guard(Request $request, School $school): User
    {
        $u = $this->staff($request, $school);
        abort_unless($u, 403);

        return $u;
    }

    private function sectionFor(User $u, School $school, SchoolSection $section): SchoolSection
    {
        abort_unless((int) $section->school_id === (int) $school->id, 404);
        abort_unless($u->school_role === 'manager' || $section->teachers()->whereKey($u->id)->exists(), 404);

        return $section;
    }

    private function toLogin(School $school): RedirectResponse
    {
        return redirect()->route('school.login', ['school' => $school, 'tab' => 'staff']);
    }

    /** The signed-in child of this school (hidden holder user → student). */
    private function child(Request $request, School $school): ?Student
    {
        $u = $request->user();
        if (! $u || (int) $u->school_id !== (int) $school->id || $u->school_role !== 'student' || $u->isDisabled()) {
            return null;
        }
        $s = Student::with('section')->where('user_id', $u->id)->first();

        return $s && ! $s->archived_at && $s->section && (int) $s->section->school_id === (int) $school->id ? $s : null;
    }

    private function quizOf(SchoolSection $section, int $id): SchoolQuiz
    {
        return SchoolQuiz::where('school_section_id', $section->id)->findOrFail($id);
    }

    // ---------- teacher: homework + quizzes list ----------

    public function tasks(Request $request, School $school, SchoolSection $section): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);
        $stats = SchoolStats::section($section)['rows'];
        $hw = SchoolHomework::where('school_section_id', $section->id)->latest('id')->take(30)->get()
            ->map(fn ($h) => ['hw' => $h, 'sum' => SchoolTasks::homeworkSummary(SchoolTasks::homeworkRows($h, $stats)), 'lessons' => SchoolTasks::lessons($h->subject)]);
        $students = $section->students()->get(['id', 'name']);
        $qz = SchoolQuiz::where('school_section_id', $section->id)->latest('id')->take(30)->get()
            ->map(fn ($q) => ['quiz' => $q, 'sum' => SchoolTasks::results($q, $students)['sum']]);

        return view('school.tasks', ['school' => $school, 'section' => $section, 'me' => $u, 'homework' => $hw, 'quizzes' => $qz,
            'courses' => SchoolTasks::courses((int) $section->grade)]);
    }

    /** Units, lessons and textbook questions of one course (for the pickers). */
    public function bank(Request $request, School $school, SchoolSection $section, string $code): JsonResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        abort_unless(str_starts_with($code, 'g'.$section->grade.'-'), 404);

        return response()->json(['units' => SchoolTasks::bank($code)])->header('Cache-Control', 'private, max-age=600');
    }

    public function storeHomework(Request $request, School $school, SchoolSection $section): RedirectResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        $courses = SchoolTasks::courses((int) $section->grade);
        $data = $request->validate([
            'subject' => ['required', Rule::in(array_keys($courses))], 'title' => ['nullable', 'string', 'max:120'],
            'items' => ['required', 'array', 'min:1', 'max:12'], 'items.*' => ['string', 'max:24'], 'due' => ['required', 'date'],
        ], ['items.required' => 'اختر درسًا واحدًا على الأقل.', 'due.required' => 'حدّد موعد التسليم.']);
        $known = SchoolTasks::lessons($data['subject']);
        $items = array_values(array_unique(array_filter($data['items'], fn ($i) => isset($known[$i]))));
        if (! $items) {
            return back()->withErrors(['items' => 'اختر درسًا واحدًا على الأقل.']);
        }
        $title = trim((string) ($data['title'] ?? '')) ?: $courses[$data['subject']].': '.$known[$items[0]]['t'].(count($items) > 1 ? ' و'.\App\Support\Ar::num(count($items) - 1).' غيره' : '');
        SchoolHomework::create(['school_id' => $school->id, 'school_section_id' => $section->id, 'teacher_id' => $u->id, 'subject' => $data['subject'],
            'title' => mb_substr($title, 0, 120), 'items' => $items, 'due_at' => SchoolTasks::parseLocal($data['due'])?->setSecond(0), 'is_test' => (bool) $school->is_test]);
        ActivityLog::record('school.homework', 'section:'.$section->id);

        return redirect()->route('school.tasks', [$school, $section])->with('status', 'أُرسل الواجب. يظهر للطلاب في «واجباتي» عند دخولهم.');
    }

    public function homework(Request $request, School $school, SchoolSection $section, int $hw): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);
        $h = SchoolHomework::where('school_section_id', $section->id)->findOrFail($hw);
        $rows = SchoolTasks::homeworkRows($h, SchoolStats::section($section)['rows']);
        usort($rows, fn ($a, $b) => [array_search($a['state'], ['late', 'todo', 'partial', 'done']), $a['name']] <=> [array_search($b['state'], ['late', 'todo', 'partial', 'done']), $b['name']]);

        return view('school.homework', ['school' => $school, 'section' => $section, 'me' => $u, 'h' => $h, 'rows' => $rows,
            'sum' => SchoolTasks::homeworkSummary($rows), 'lessons' => SchoolTasks::lessons($h->subject)]);
    }

    public function deleteHomework(Request $request, School $school, SchoolSection $section, int $hw): RedirectResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        SchoolHomework::where('school_section_id', $section->id)->findOrFail($hw)->delete();

        return redirect()->route('school.tasks', [$school, $section])->with('status', 'حُذف الواجب.');
    }

    // ---------- teacher: quizzes ----------

    public function newQuiz(Request $request, School $school, SchoolSection $section): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);

        return view('school.quiz-new', ['school' => $school, 'section' => $section, 'me' => $u, 'courses' => SchoolTasks::courses((int) $section->grade),
            'start' => now(SchoolStats::tz())->addMinutes(5)->format('Y-m-d\TH:i'), 'end' => now(SchoolStats::tz())->addDays(2)->setTime(20, 0)->format('Y-m-d\TH:i')]);
    }

    public function storeQuiz(Request $request, School $school, SchoolSection $section): RedirectResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        $courses = SchoolTasks::courses((int) $section->grade);
        $data = $request->validate([
            'subject' => ['required', Rule::in(array_keys($courses))], 'title' => ['required', 'string', 'max:120'],
            'picked' => ['array', 'max:60'], 'picked.*' => ['string', 'max:30'], 'own' => ['array', 'max:30'], 'own.*' => ['array'],
            'starts' => ['required', 'date'], 'ends' => ['required', 'date', 'after:starts'], 'duration' => ['required', 'integer', 'between:1,180'],
            'attempts' => ['required', 'integer', 'between:1,5'], 'shuffle' => ['nullable', 'boolean'], 'show' => ['required', Rule::in(['now', 'after'])],
        ], ['title.required' => 'اكتب عنوان الاختبار.', 'ends.after' => 'وقت الإغلاق يجب أن يكون بعد وقت البدء.']);
        $qs = SchoolTasks::buildQuestions($data['subject'], $data['picked'] ?? [], $data['own'] ?? [], (int) $school->id);
        if (! $qs) {
            return back()->withInput()->withErrors(['picked' => 'أضف سؤالًا واحدًا على الأقل: من بنك الكتاب أو من إعدادك.']);
        }
        SchoolQuiz::create(['school_id' => $school->id, 'school_section_id' => $section->id, 'teacher_id' => $u->id, 'subject' => $data['subject'],
            'title' => trim($data['title']), 'questions' => $qs, 'starts_at' => SchoolTasks::parseLocal($data['starts']), 'ends_at' => SchoolTasks::parseLocal($data['ends']),
            'duration_min' => (int) $data['duration'], 'attempts' => (int) $data['attempts'], 'shuffle' => $request->boolean('shuffle'), 'show_results' => $data['show'], 'is_test' => (bool) $school->is_test]);
        ActivityLog::record('school.quiz', 'section:'.$section->id);

        return redirect()->route('school.tasks', [$school, $section])->with('status', 'نُشر الاختبار ('.\App\Support\Ar::count(count($qs), 'سؤال').'). يظهر للطلاب تنبيه «اختبار جديد».');
    }

    /** Teacher uploads a question/option image → resized WebP stored for this school only. */
    public function uploadMedia(Request $request, School $school, SchoolSection $section): JsonResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        $v = \Illuminate\Support\Facades\Validator::make($request->all(), ['image' => ['required', 'file', 'max:6144', 'mimes:jpg,jpeg,png,webp,gif', 'mimetypes:image/jpeg,image/png,image/webp,image/gif']],
            ['image.max' => 'الصورة أكبر من ٦ ميغابايت.', 'image.mimes' => 'الصيغ المقبولة: JPG أو PNG أو WebP أو GIF.', 'image.mimetypes' => 'الصيغ المقبولة: JPG أو PNG أو WebP أو GIF.', 'image.required' => 'اختر صورة.']);
        if ($v->fails()) {
            return response()->json(['error' => $v->errors()->first()], 422);
        }
        $r = \App\Support\SchoolMedia::store((int) $school->id, $request->file('image'));
        if (isset($r['error'])) {
            return response()->json($r, 422);
        }
        ActivityLog::record('school.media', 'section:'.$section->id);

        return response()->json($r + ['url' => route('school.media', [$school, $r['name']])]);
    }

    /** Serve a quiz image — only to staff or students of the same school. */
    public function media(Request $request, School $school, string $name)
    {
        abort_unless($this->staff($request, $school) || $this->child($request, $school), 403);
        $path = \App\Support\SchoolMedia::path((int) $school->id, $name);
        abort_unless($path, 404);

        return response()->file($path, ['Content-Type' => 'image/webp', 'Cache-Control' => 'private, max-age=31536000, immutable', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function quiz(Request $request, School $school, SchoolSection $section, int $quiz)
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);
        $q = $this->quizOf($section, $quiz);
        $res = SchoolTasks::results($q, $section->students()->orderBy('name')->get(['id', 'name']));
        if ($request->query('format') === 'csv') {
            return $this->quizCsv($q, $res);
        }

        return view('school.quiz-results', ['school' => $school, 'section' => $section, 'me' => $u, 'q' => $q, 'res' => $res]);
    }

    private function quizCsv(SchoolQuiz $q, array $res)
    {
        $tz = SchoolStats::tz();

        return response()->streamDownload(function () use ($q, $res, $tz) {
            $o = fopen('php://output', 'w');
            fwrite($o, "\xEF\xBB\xBF");
            $head = ['الاسم', 'المحاولات', 'العلامة %', 'صحيح', 'من', 'الوقت (دقائق)', 'بدأ ('.$tz.')', 'سلّم ('.$tz.')', 'تسليم تلقائي', 'مرات مغادرة الصفحة'];
            foreach ($q->questions as $i => $x) {
                $head[] = 'س'.($i + 1).($x['src'] === 'teacher' ? ' (معلّم)' : '');
            }
            \App\Support\CsvSafe::put($o, $head);
            foreach ($res['rows'] as $r) {
                $b = $r['best'];
                $line = [$r['name'], $r['attempts'], $b?->score ?? '', $b?->correct ?? '', $b?->total ?? '', $b ? round($b->seconds() / 60, 1) : '',
                    $b ? $b->started_at->copy()->timezone($tz)->format('Y-m-d H:i') : '', $b ? $b->submitted_at->copy()->timezone($tz)->format('Y-m-d H:i') : '',
                    $b ? ($b->auto_submitted ? 'نعم' : 'لا') : '', $r['tabs']];
                foreach ($q->questions as $i => $x) {
                    $line[] = $b ? SchoolTasks::answerText($x, $b->answers[$i] ?? null).(SchoolTasks::isRight($x, $b->answers[$i] ?? null) ? ' ✓' : ' ✗') : '';
                }
                \App\Support\CsvSafe::put($o, $line);
            }
            fclose($o);
        }, 'quiz-'.$q->id.'-'.now($tz)->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store, private']);
    }

    public function attempt(Request $request, School $school, SchoolSection $section, int $quiz, int $attempt): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);
        $q = $this->quizOf($section, $quiz);
        $a = SchoolQuizAttempt::where('school_quiz_id', $q->id)->with('student:id,name')->findOrFail($attempt);
        SchoolTasks::finalizeIfExpired($a, $q);

        return view('school.quiz-review', ['school' => $school, 'section' => $section, 'q' => $q, 'a' => $a, 'staff' => true]);
    }

    public function deleteQuiz(Request $request, School $school, SchoolSection $section, int $quiz): RedirectResponse
    {
        $u = $this->guard($request, $school);
        $this->sectionFor($u, $school, $section);
        $this->quizOf($section, $quiz)->delete();

        return redirect()->route('school.tasks', [$school, $section])->with('status', 'حُذف الاختبار ونتائجه.');
    }

    // ---------- student ----------

    public function me(Request $request, School $school): View|RedirectResponse
    {
        if (! $s = $this->child($request, $school)) {
            return redirect()->route('school.login', $school);
        }
        $t = SchoolTasks::forStudent($s);
        $s->forceFill(['school_seen_at' => now()])->saveQuietly();

        return view('school.me', ['school' => $school, 's' => $s, 't' => $t, 'mo' => \App\Support\SchoolMotivation::forStudent($s), 'start' => \App\Support\MailCenter::siteUrl().'login.html?sync=1']);
    }

    /** Small JSON for in-site badges: pending count, new quizzes, closing soon. */
    public function meJson(Request $request, School $school): JsonResponse
    {
        if (! $s = $this->child($request, $school)) {
            return response()->json(['pending' => 0], 200)->header('Cache-Control', 'no-store');
        }
        $t = SchoolTasks::forStudent($s);

        return response()->json(['pending' => $t['pending'], 'new' => $t['new'], 'soon' => count($t['soon']), 'url' => route('school.me', $school)])->header('Cache-Control', 'no-store');
    }

    private function myQuiz(Request $request, School $school, int $quiz): array
    {
        $s = $this->child($request, $school);
        abort_unless($s, 403);
        $q = SchoolQuiz::where('school_section_id', $s->school_section_id)->findOrFail($quiz);

        return [$s, $q];
    }

    public function take(Request $request, School $school, int $quiz): View|RedirectResponse
    {
        if (! $this->child($request, $school)) {
            return redirect()->route('school.login', $school);
        }
        [$s, $q] = $this->myQuiz($request, $school, $quiz);
        $a = SchoolQuizAttempt::where('school_quiz_id', $q->id)->where('student_id', $s->id)->whereNull('submitted_at')->first();
        if ($a) {
            SchoolTasks::finalizeIfExpired($a, $q);
        }
        $done = SchoolQuizAttempt::where('school_quiz_id', $q->id)->where('student_id', $s->id)->whereNotNull('submitted_at')->orderByDesc('id')->first();
        if ($a && ! $a->submitted_at) {
            return view('school.quiz-take', ['school' => $school, 's' => $s, 'q' => $q, 'a' => $a]);
        }
        $used = SchoolQuizAttempt::where('school_quiz_id', $q->id)->where('student_id', $s->id)->count();

        return view('school.quiz-intro', ['school' => $school, 's' => $s, 'q' => $q, 'done' => $done, 'left' => max(0, $q->attempts - $used)]);
    }

    public function begin(Request $request, School $school, int $quiz): RedirectResponse
    {
        [$s, $q] = $this->myQuiz($request, $school, $quiz);
        $a = SchoolTasks::start($q, $s);
        if (is_string($a)) {
            return redirect()->route('school.take', [$school, $q->id])->withErrors(['quiz' => $a]);
        }

        return redirect()->route('school.take', [$school, $q->id]);
    }

    private function live(Student $s, SchoolQuiz $q): ?SchoolQuizAttempt
    {
        return SchoolQuizAttempt::where('school_quiz_id', $q->id)->where('student_id', $s->id)->whereNull('submitted_at')->first();
    }

    public function save(Request $request, School $school, int $quiz): JsonResponse
    {
        [$s, $q] = $this->myQuiz($request, $school, $quiz);
        $a = $this->live($s, $q);
        $ok = $a && SchoolTasks::save($a, (array) $request->input('answers', []));

        return response()->json(['ok' => $ok, 'left' => $a ? max(0, now()->diffInSeconds($a->deadline_at, false)) : 0], $ok ? 200 : 409);
    }

    public function tab(Request $request, School $school, int $quiz): JsonResponse
    {
        [$s, $q] = $this->myQuiz($request, $school, $quiz);
        if ($a = $this->live($s, $q)) {
            $a->increment('tab_switches');
        }

        return response()->json(['ok' => true]);
    }

    public function submit(Request $request, School $school, int $quiz): RedirectResponse
    {
        [$s, $q] = $this->myQuiz($request, $school, $quiz);
        if ($a = $this->live($s, $q)) {
            SchoolTasks::save($a, (array) $request->input('answers', [])); // ignored after deadline + grace
            SchoolTasks::submit($a->refresh(), $q, $request->boolean('auto'));
        }

        return redirect()->route('school.take', [$school, $q->id]);
    }

    public function myAttempt(Request $request, School $school, int $quiz): View
    {
        [$s, $q] = $this->myQuiz($request, $school, $quiz);
        abort_unless($q->resultsVisible(), 403);
        $a = SchoolQuizAttempt::where('school_quiz_id', $q->id)->where('student_id', $s->id)->whereNotNull('submitted_at')->orderByDesc('score')->firstOrFail();

        return view('school.quiz-review', ['school' => $school, 'section' => $s->section, 'q' => $q, 'a' => $a->setRelation('student', $s), 'staff' => false]);
    }

    // ---------- manager overview ----------

    public function overview(Request $request, School $school): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        abort_unless($u->school_role === 'manager', 403);

        return view('school.overview', ['school' => $school, 'me' => $u] + \App\Support\SchoolOverview::build($school));
    }

    // ---------- monthly reports ----------

    private function month(Request $request): array
    {
        $tz = SchoolStats::tz();
        $m = preg_match('/^\d{4}-\d{2}$/', (string) $request->query('m')) ? (string) $request->query('m') : now($tz)->format('Y-m');
        $from = Carbon::createFromFormat('Y-m-d', $m.'-01', $tz)->startOfDay();

        return [$m, $from, $from->copy()->endOfMonth()];
    }

    public function monthly(Request $request, School $school): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        [$m, $from, $to] = $this->month($request);
        $sid = $request->query('section');
        $sections = Schools::sectionsFor($u)->orderBy('grade')->orderBy('name')->get();
        if ($sid) {
            $sections = $sections->where('id', (int) $sid)->values();
            abort_unless($sections->count(), 404);
        }

        return view('school.monthly', ['school' => $school, 'me' => $u, 'm' => $m, 'from' => $from, 'to' => $to, 'one' => (bool) $sid]
            + \App\Support\SchoolOverview::monthly($school, $sections, $from, $to));
    }

    public function family(Request $request, School $school, Student $student): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        abort_unless($student->section, 404);
        $section = $this->sectionFor($u, $school, $student->section);
        [$m, $from, $to] = $this->month($request);

        return view('school.family', ['school' => $school, 'section' => $section, 'm' => $m, 'from' => $from, 'to' => $to]
            + \App\Support\SchoolOverview::family($student, $section, $from, $to));
    }
}
