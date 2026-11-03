<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolChallenge;
use App\Models\SchoolSection;
use App\Models\User;
use App\Support\SchoolMotivation;
use App\Support\SchoolStats;
use App\Support\Schools;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

/** Schools phase 4: weekly honor board, section challenges, monthly certificates (effort, never marks). */
class SchoolMotivationController extends Controller
{
    private function staff(Request $request, School $school): ?User
    {
        $u = $request->user();

        return $u && $u->isSchoolStaff() && (int) $u->school_id === (int) $school->id && ! $u->isDisabled() ? $u : null;
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

    public function honor(Request $request, School $school, SchoolSection $section): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);
        $w = $request->query('w') === '1' ? 1 : 0;

        return view('school.honor', ['school' => $school, 'section' => $section, 'me' => $u, 'w' => $w, 'h' => SchoolMotivation::honor($section, $w)]);
    }

    public function challenges(Request $request, School $school): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $mine = Schools::sectionsFor($u)->pluck('id')->all();
        $list = SchoolChallenge::where('school_id', $school->id)->orderByDesc('ends_on')->limit(30)->get()
            ->filter(fn ($c) => $u->school_role === 'manager' || array_intersect($mine, (array) $c->section_ids))
            ->map(fn ($c) => ['c' => $c, 'st' => SchoolMotivation::standings($c)])->values();

        return view('school.challenges', ['school' => $school, 'me' => $u, 'list' => $list,
            'sections' => SchoolMotivation::sectionsOfSchool($school), 'today' => now(SchoolStats::tz())->format('Y-m-d')]);
    }

    public function storeChallenge(Request $request, School $school): RedirectResponse
    {
        $u = $this->staff($request, $school);
        abort_unless($u && $u->school_role === 'manager', 403);
        $ids = SchoolSection::where('school_id', $school->id)->pluck('id')->all();
        $d = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'metric' => ['required', Rule::in(array_keys(SchoolChallenge::METRICS))],
            'sections' => ['required', 'array', 'min:2', 'max:30'],
            'sections.*' => ['integer', Rule::in($ids)],
            'starts_on' => ['required', 'date_format:Y-m-d'],
            'ends_on' => ['required', 'date_format:Y-m-d', 'after_or_equal:starts_on'],
        ], ['sections.min' => 'اختر شعبتين على الأقل.']);
        abort_if(Carbon::parse($d['starts_on'])->diffInDays(Carbon::parse($d['ends_on'])) > 62, 422, 'المدة القصوى شهران.');
        SchoolChallenge::create(['school_id' => $school->id, 'created_by' => $u->id, 'title' => $d['title'], 'metric' => $d['metric'],
            'section_ids' => array_values(array_unique(array_map('intval', $d['sections']))), 'starts_on' => $d['starts_on'], 'ends_on' => $d['ends_on'],
            'is_test' => (bool) $school->is_test]);

        return redirect()->route('school.challenges', $school)->with('ok', 'أُنشئ التحدّي.');
    }

    public function deleteChallenge(Request $request, School $school, int $challenge): RedirectResponse
    {
        $u = $this->staff($request, $school);
        abort_unless($u && $u->school_role === 'manager', 403);
        SchoolChallenge::where('school_id', $school->id)->findOrFail($challenge)->delete();

        return redirect()->route('school.challenges', $school)->with('ok', 'حُذف التحدّي.');
    }

    public function certificates(Request $request, School $school, SchoolSection $section): View|RedirectResponse
    {
        if (! $u = $this->staff($request, $school)) {
            return $this->toLogin($school);
        }
        $this->sectionFor($u, $school, $section);
        $tz = SchoolStats::tz();
        $m = preg_match('/^\d{4}-\d{2}$/', (string) $request->query('m')) ? (string) $request->query('m') : now($tz)->format('Y-m');
        $from = Carbon::createFromFormat('Y-m-d', $m.'-01', $tz)->startOfDay();
        $to = $from->copy()->endOfMonth();
        $certs = SchoolMotivation::certificates($section, $from, $to);
        if ($sid = (int) $request->query('student')) {
            $certs = array_values(array_filter($certs, fn ($c) => $c['id'] === $sid));
        }

        return view('school.certificates', ['school' => $school, 'section' => $section, 'm' => $m, 'from' => $from, 'certs' => $certs]);
    }
}
