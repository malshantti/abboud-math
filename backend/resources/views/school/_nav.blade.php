<nav class="tabs noprint" aria-label="أقسام الشعبة">
<a class="btn {{ ($on ?? '') === 'report' ? '' : 'ghost' }} small" href="{{ route('school.report', [$school, $section]) }}">لوحة الشعبة</a>
<a class="btn {{ ($on ?? '') === 'tasks' ? '' : 'ghost' }} small" href="{{ route('school.tasks', [$school, $section]) }}">الواجبات والاختبارات</a>
<a class="btn {{ ($on ?? '') === 'month' ? '' : 'ghost' }} small" href="{{ route('school.monthly', [$school, 'section' => $section->id]) }}">التقرير الشهري</a>
<a class="btn {{ ($on ?? '') === 'honor' ? '' : 'ghost' }} small" href="{{ route('school.honor', [$school, $section]) }}">⭐ لوحة الشرف</a>
<a class="btn ghost small" href="{{ route('school.certs', [$school, $section]) }}">🏅 الشهادات</a>
<a class="btn ghost small" href="{{ route('school.challenges', $school) }}">🏆 التحدّيات</a>
<a class="btn ghost small" href="{{ route('school.section', [$school, $section]) }}">إدارة الطلاب</a>
</nav>
