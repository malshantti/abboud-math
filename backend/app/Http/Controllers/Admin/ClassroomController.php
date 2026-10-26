<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Classroom;
use App\Models\Setting;
use App\Models\Student;
use App\Models\User;
use App\Support\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

/** Teacher classes. Admins manage them; teachers only see their own classes and the students in them. */
class ClassroomController extends Controller
{
    private const MSG = ['name.required' => 'اكتب اسم الصف.', 'max' => 'النص أطول من الحد المسموح.'];

    private function visible(Request $request, Classroom $classroom): void
    {
        abort_unless(Classroom::query()->visibleTo($request->user())->whereKey($classroom->id)->exists(), 404);
    }

    public function index(Request $request): View
    {
        $classes = Classroom::query()->visibleTo($request->user())->withCount('students')->with('teachers:id,name')->orderBy('grade')->orderBy('name')->get();

        return view('manage.classes', ['classes' => $classes, 'grades' => Setting::gradeOptions(), 'teachers' => $this->teacherOptions()]);
    }

    public function show(Request $request, Classroom $classroom): View
    {
        $this->visible($request, $classroom);
        $classroom->load(['teachers:id,name,email', 'students' => fn ($q) => $q->with('user:id,name,email')->orderBy('name')]);
        $candidates = collect();
        if ($request->user()->isAdminRole() && ($s = trim((string) $request->query('q'))) !== '') {
            $candidates = Student::with('user:id,name,email')->whereNotIn('id', $classroom->students->pluck('id'))
                ->where(fn ($w) => $w->where('name', 'like', "%$s%")->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%$s%")->orWhere('name', 'like', "%$s%")))
                ->when($classroom->grade, fn ($q) => $q->orderByRaw('grade = ? desc', [$classroom->grade]))->limit(30)->get();
        }

        return view('manage.classroom', ['c' => $classroom, 'grades' => Setting::gradeOptions(), 'teachers' => $this->teacherOptions(), 'candidates' => $candidates]);
    }

    /** Class report: one row per student, reusing the per-student report numbers (PR #88). */
    public function report(Request $request, Classroom $classroom): View
    {
        $this->visible($request, $classroom);
        $rows = [];
        $subjects = [];
        foreach ($classroom->students()->orderBy('name')->get() as $st) {
            $r = Report::build($st);
            $rows[] = ['student' => $st, 'r' => $r];
            foreach ($r['subjects'] as $s) {
                $k = $s['code'];
                $subjects[$k] ??= ['name' => $s['name'].' — '.\App\Support\Ar::grade($s['grade']), 'students' => 0, 'answered' => 0, 'correct' => 0, 'ms' => 0, 'done' => 0];
                $subjects[$k]['students']++;
                $subjects[$k]['answered'] += $s['answered'];
                $subjects[$k]['correct'] += $s['correct'];
                $subjects[$k]['ms'] += $s['ms'];
                $subjects[$k]['done'] += (int) ($s['progress']['done'] ?? 0);
            }
        }

        return view('manage.classroom-report', ['c' => $classroom, 'rows' => $rows, 'subjects' => $subjects]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80'], 'grade' => ['nullable', Rule::in(array_keys(Setting::gradeOptions()))], 'teacher_id' => ['nullable', 'integer']], self::MSG);
        $c = Classroom::create(['name' => trim($data['name']), 'grade' => $data['grade'] ?: null, 'code' => Classroom::newCode(), 'join_open' => true]);
        if (! empty($data['teacher_id']) && ($t = $this->teacher((int) $data['teacher_id']))) {
            $c->teachers()->syncWithoutDetaching([$t->id]);
        }
        ActivityLog::record('class.create', $c->name);

        return redirect()->route('manage.class', $c)->with('status', 'أُنشئ الصف. رمز الانضمام: '.$c->code);
    }

    public function update(Request $request, Classroom $classroom): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80'], 'grade' => ['nullable', Rule::in(array_keys(Setting::gradeOptions()))]], self::MSG);
        $classroom->update(['name' => trim($data['name']), 'grade' => $data['grade'] ?: null, 'join_open' => $request->boolean('join_open')]);
        ActivityLog::record('class.update', $classroom->name);

        return back()->with('status', 'حُفظ الصف.');
    }

    public function destroy(Request $request, Classroom $classroom): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']], ['confirm.accepted' => 'أكّد الحذف أولًا.']);
        ActivityLog::record('class.delete', $classroom->name);
        $classroom->delete();

        return redirect()->route('manage.classes')->with('status', 'حُذف الصف. الطلاب أنفسهم وتقدّمهم لم يُحذفوا.');
    }

    public function regenerate(Classroom $classroom): RedirectResponse
    {
        $classroom->update(['code' => Classroom::newCode()]);
        ActivityLog::record('class.code', $classroom->name);

        return back()->with('status', 'رمز جديد: '.$classroom->code.' — الرمز القديم لم يعد يعمل.');
    }

    public function addTeacher(Request $request, Classroom $classroom): RedirectResponse
    {
        $t = $this->teacher((int) $request->input('teacher_id'));
        if (! $t) {
            return back()->withErrors(['teacher_id' => 'اختر حساب معلّم.']);
        }
        $classroom->teachers()->syncWithoutDetaching([$t->id]);
        ActivityLog::record('class.teacher', $classroom->name, 'إضافة '.$t->name);

        return back()->with('status', 'أُضيف المعلّم '.$t->name.'.');
    }

    public function removeTeacher(Classroom $classroom, User $user): RedirectResponse
    {
        $classroom->teachers()->detach($user->id);
        ActivityLog::record('class.teacher', $classroom->name, 'إزالة '.$user->name);

        return back()->with('status', 'أُزيل المعلّم من الصف.');
    }

    public function addStudents(Request $request, Classroom $classroom): RedirectResponse
    {
        $ids = array_map('intval', (array) $request->input('student_ids', []));
        $ids = Student::whereIn('id', $ids)->pluck('id')->all();
        if (! $ids) {
            return back()->withErrors(['student_ids' => 'اختر طالبًا واحدًا على الأقل.']);
        }
        $classroom->students()->syncWithoutDetaching(array_fill_keys($ids, ['joined_at' => now()]));
        ActivityLog::record('class.students', $classroom->name, 'إضافة '.count($ids));

        return redirect()->route('manage.class', $classroom)->with('status', 'أُضيف '.\App\Support\Ar::num(count($ids)).' طالب إلى الصف.');
    }

    public function removeStudent(Classroom $classroom, Student $student): RedirectResponse
    {
        $classroom->students()->detach($student->id);
        ActivityLog::record('class.students', $classroom->name, 'إزالة '.$student->name);

        return back()->with('status', 'أُزيل الطالب من الصف.');
    }

    private function teacher(int $id): ?User
    {
        return User::whereKey($id)->where('role', 'teacher')->first();
    }

    private function teacherOptions()
    {
        return User::where('role', 'teacher')->orderBy('name')->get(['id', 'name', 'email']);
    }
}
