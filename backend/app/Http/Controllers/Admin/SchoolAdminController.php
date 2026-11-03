<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\School;
use App\Models\Student;
use App\Support\Schools;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

/** Super-admin: create a school + its manager in one short form, change its logo/colors. */
class SchoolAdminController extends Controller
{
    public function index(): View
    {
        $schools = School::withCount(['sections', 'staff'])->orderByDesc('id')->get();
        $students = Student::join('school_sections', 'school_sections.id', '=', 'students.school_section_id')
            ->selectRaw('school_sections.school_id, count(*) n')->groupBy('school_sections.school_id')->pluck('n', 'school_id');

        return view('manage.schools', ['schools' => $schools, 'students' => $students]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['slug' => Str::slug((string) $request->input('slug')) ?: null]);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9-]+$/', Rule::unique('schools', 'slug')],
            'manager' => ['required', 'string', 'max:80'],
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'], 'color2' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:1024'],
            'is_test' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'اكتب اسم المدرسة.', 'slug.required' => 'اكتب رابطًا قصيرًا بالإنجليزية، مثل: alamal', 'slug.unique' => 'هذا الرابط مستخدم لمدرسة أخرى.',
            'slug.regex' => 'الرابط بحروف إنجليزية صغيرة وأرقام وشرطة فقط.', 'manager.required' => 'اكتب اسم مدير المدرسة.',
        ]);
        $school = new School([
            'name' => trim($data['name']), 'slug' => $data['slug'], 'color' => $data['color'] ?? '#6f9e23', 'color2' => $data['color2'] ?? '#ffc83d',
            'is_test' => (bool) ($data['is_test'] ?? false),
        ]);
        $school->save();
        if ($request->hasFile('logo')) {
            $this->saveLogo($school, $request->file('logo'));
        }
        [$m, $password] = Schools::createStaff($school, $data['manager'], 'manager');
        ActivityLog::record('school.create', $school->slug);

        return redirect()->route('manage.schools')->with('credentials', ['school' => $school->name, 'name' => $m->name, 'username' => $m->username, 'password' => $password, 'url' => route('school.login', $school)]);
    }

    public function update(Request $request, School $school): RedirectResponse
    {
        $data = $request->validate([
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'], 'color2' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:1024'],
        ]);
        $school->forceFill(array_filter(['color' => $data['color'] ?? null, 'color2' => $data['color2'] ?? null]))->save();
        if ($request->hasFile('logo')) {
            $this->saveLogo($school, $request->file('logo'));
        }

        return back()->with('status', 'حُفظت هوية المدرسة.');
    }

    private function saveLogo(School $school, $file): void
    {
        $rel = 'schools/'.$school->id.'-'.Str::random(8).'.'.strtolower($file->extension() === 'jpeg' ? 'jpg' : $file->extension());
        $file->storeAs(dirname($rel), basename($rel), 'local');
        $school->forceFill(['logo_path' => $rel])->save();
    }
}
