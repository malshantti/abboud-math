@extends('school.layout')
@section('title', 'لوحة المدرسة')
@section('head-end')@if($me->school_role === 'manager')<a class="btn small" href="{{ route('school.overview', $school) }}">لوحة المدير</a>@endif<a class="btn ghost small" href="{{ route('school.monthly', $school) }}">التقرير الشهري</a><span class="muted">{{ $me->name }} · {{ $me->school_role === 'manager' ? 'مدير المدرسة' : 'معلّم' }}</span><form method="post" action="{{ route('school.logout', $school) }}">@csrf<button class="btn ghost small" type="submit">خروج</button></form>@endsection
@section('css')
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:0 0 18px}
.kpi{background:#fff;border:2px solid var(--line);border-radius:18px;padding:14px 16px}.kpi b{display:block;font:800 30px/1.2 Baloo,Cairo,sans-serif}.kpi span{color:var(--muted);font-weight:700}
.cols{display:grid;gap:18px;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}@media(max-width:820px){.cols{grid-template-columns:1fr}}
.secs{list-style:none;margin:0;padding:0}.secs li{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid var(--line)}
.secs a.name{font:800 19px Baloo,Cairo,sans-serif;text-decoration:none}.secs .end{margin-inline-start:auto;display:flex;gap:6px;flex-wrap:wrap}
.inline{display:grid;grid-template-columns:120px 1fr auto;gap:8px;align-items:end}@media(max-width:520px){.inline{grid-template-columns:1fr}}
.checks{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0}.checks label{display:flex;gap:6px;align-items:center;font-weight:600;margin:0}
.cred{background:var(--yl);border:2px dashed var(--sun-d);border-radius:16px;padding:14px 18px;margin:0 0 18px}.cred code{font:800 20px/1.6 monospace;direction:ltr;display:inline-block;background:#fff;padding:0 10px;border-radius:8px}
h2{font-size:21px;margin:0 0 10px}
@endsection
@section('content')
@if ($c = session('credentials'))
<div class="cred" role="status"><b>بيانات دخول {{ $c['name'] }} — تظهر مرة واحدة، انسخها أو اطبعها الآن:</b><br>اسم المستخدم: <code>{{ $c['username'] }}</code> · كلمة المرور: <code>{{ $c['password'] }}</code><br><span class="muted">رابط الدخول: {{ route('school.login', ['school' => $school, 'tab' => 'staff']) }}</span></div>
@endif
@php($total = $sections->sum('students_count'))
<div class="kpis">
  <div class="kpi"><b>{{ $ar::html($sections->count()) }}</b><span>{{ $me->school_role === 'manager' ? 'الشعب' : 'شعبي' }}</span></div>
  <div class="kpi"><b>{{ $ar::html($total) }}</b><span>الطلاب</span></div>
  <div class="kpi"><b>{{ $ar::html($active->sum()) }}</b><span>دخلوا اليوم</span></div>
  @if ($me->school_role === 'manager')<div class="kpi"><b>{{ $ar::html($teachers->count()) }}</b><span>المعلّمون</span></div>@endif
</div>
<div class="cols">
  <section class="card"><h2>{{ $me->school_role === 'manager' ? 'الشعب' : 'شعبي' }}</h2>
    <ul class="secs">
    @forelse ($sections as $s)
      <li><a class="name" href="{{ route('school.section', [$school, $s]) }}">{{ $s->name }}</a><span class="chip grey">{{ $ar::grade($s->grade) }}</span>
        <span class="muted">{{ $ar::num($s->students_count) }} طالبًا · دخل اليوم {{ $ar::num($active[$s->id] ?? 0) }}</span>
        @if ($s->teachers->count())<span class="muted">· {{ $s->teachers->pluck('name')->join('، ') }}</span>@endif
        <span class="end"><a class="btn small" href="{{ route('school.report', [$school, $s]) }}">لوحة المتابعة</a><a class="btn ghost small" href="{{ route('school.tasks', [$school, $s]) }}">الواجبات والاختبارات</a><a class="btn ghost small" href="{{ route('school.section', [$school, $s]) }}">الطلاب</a><a class="btn ghost small" href="{{ route('school.cards', [$school, $s]) }}" target="_blank" rel="noopener">طباعة البطاقات</a></span></li>
    @empty<li class="muted">{{ $me->school_role === 'manager' ? 'أضف أول شعبة من النموذج.' : 'لم تُسند إليك شعبة بعد. اطلب من مدير المدرسة.' }}</li>@endforelse
    </ul>
  </section>
  @if ($me->school_role === 'manager')
  <div class="grid">
    <section class="card"><h2>شعبة جديدة</h2>
      <form method="post" action="{{ route('school.sections.store', $school) }}" class="inline">@csrf
        <div><label for="g">الصف</label><select id="g" name="grade">@foreach (range(1, 8) as $g)<option value="{{ $g }}">{{ $grades[$g] ?? $ar::grade($g) }}</option>@endforeach</select></div>
        <div><label for="sn">اسم الشعبة</label><input id="sn" name="name" placeholder="مثل: رابع أ" required maxlength="60"></div>
        <button class="btn" type="submit">إضافة</button>
      </form>
    </section>
    <section class="card"><h2>معلّم جديد</h2>
      <form method="post" action="{{ route('school.teachers.store', $school) }}">@csrf
        <label for="tn">اسم المعلّم</label><input id="tn" name="name" required maxlength="80">
        @if ($sections->count())<p class="mt0" style="margin:10px 0 0"><b>شعبه</b></p><div class="checks">@foreach ($sections as $s)<label><input type="checkbox" name="sections[]" value="{{ $s->id }}">{{ $s->name }}</label>@endforeach</div>@endif
        <p style="margin:6px 0 0"><b>المواد</b></p><div class="checks">@foreach ($subjects as $k => $v)<label><input type="checkbox" name="subjects[]" value="{{ $k }}">{{ $v }}</label>@endforeach</div>
        <button class="btn wide" type="submit">إنشاء حساب المعلّم</button>
        <p class="hint">يُنشأ اسم مستخدم وكلمة مرور ويظهران هنا مرة واحدة.</p>
      </form>
      @if ($teachers->count())<ul class="secs">@foreach ($teachers as $t)<li><b>{{ $t->name }}</b><code dir="ltr">{{ $t->username }}</code><span class="muted">{{ $t->schoolSections->pluck('name')->join('، ') ?: 'بلا شعب' }}</span></li>@endforeach</ul>@endif
    </section>
  </div>
  @endif
</div>
@endsection
