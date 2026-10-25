<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Student;
use App\Support\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/** Student progress report: parent (own students), staff (any student), or a read-only share link. */
class ReportController extends Controller
{
    private function render(Student $student, string $mode, ?string $back = null): Response
    {
        return response()->view('report.show', ['student' => $student, 'r' => Report::build($student), 'mode' => $mode, 'back' => $back])
            ->header('X-Robots-Tag', 'noindex, nofollow')->header('Referrer-Policy', 'no-referrer')->header('Cache-Control', 'private, no-store');
    }

    public function parent(Request $request, Student $student): Response
    {
        abort_unless($student->user_id === $request->user()->id, 404);

        return $this->render($student, 'parent', route('account.home'));
    }

    public function staff(Student $student): Response
    {
        return $this->render($student, 'staff', route('manage.student', $student));
    }

    public function shared(string $token): Response
    {
        abort_unless(preg_match('/^[A-Za-z0-9]{40}$/', $token), 404);
        $student = Student::where('report_token', $token)->firstOrFail();

        return $this->render($student, 'shared');
    }

    public function share(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $student->forceFill(['report_token' => Str::random(40)])->save();
        ActivityLog::record('report.share', $student->name, 'رابط تقرير جديد');

        return redirect()->route('account.report', $student)->with('status', 'أُنشئ رابط مشاركة جديد. الرابط القديم (إن وُجد) لم يعد يعمل.');
    }

    public function unshare(Request $request, Student $student): RedirectResponse
    {
        abort_unless($student->user_id === $request->user()->id, 404);
        $student->forceFill(['report_token' => null])->save();
        ActivityLog::record('report.unshare', $student->name, 'إيقاف رابط التقرير');

        return redirect()->route('account.report', $student)->with('status', 'أُوقف رابط المشاركة.');
    }
}
