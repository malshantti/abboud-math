@extends('layouts.manage')
@section('title', $c->name)
@section('content')
@php($admin = auth()->user()->can('manage-site'))
<div class="head"><h1>{{ $c->name }}</h1><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn small" href="{{ route('manage.class.report', $c) }}">@include('partials.admin-icon',['name'=>'activity'])تقرير الصف</a><a class="btn ghost small" href="{{ route('manage.classes') }}">@include('partials.admin-icon',['name'=>'back'])كل الصفوف</a></div></div>
@if ($errors->any())<p class="alert err" role="alert">{{ $errors->first() }}</p>@endif
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));margin-bottom:18px">
<section class="card"><h2>@include('partials.admin-icon',['name'=>'link'])رمز الانضمام</h2>
  <p style="font:800 34px/1.3 Baloo,monospace;letter-spacing:6px;margin:4px 0" dir="ltr">{{ $c->code }}</p>
  <p class="hint">يكتبه وليّ الأمر في صفحة «حسابي» تحت اسم طفله ← «الانضمام إلى صف».@unless($c->join_open) <b>الانضمام بالرمز مغلق حاليًا.</b>@endunless</p>
  @if ($admin)<form method="post" action="{{ route('manage.class.code', $c) }}" onsubmit="return confirm('إنشاء رمز جديد؟ الرمز القديم سيتوقف.')">@csrf<button class="btn ghost small" type="submit">رمز جديد</button></form>@endif
</section>
@if ($admin)
<section class="card"><h2>@include('partials.admin-icon',['name'=>'settings'])بيانات الصف</h2>
<form method="post" action="{{ route('manage.class.update', $c) }}">@csrf @method('put')
  <div class="field"><label for="n">الاسم</label><input id="n" name="name" value="{{ $c->name }}" required maxlength="80"></div>
  <div class="field"><label for="g">الصف الدراسي</label><select id="g" name="grade"><option value="">—</option>@foreach ($grades as $g => $l)<option value="{{ $g }}" @selected($c->grade === $g)>{{ $l }}</option>@endforeach</select></div>
  <label class="check"><input type="checkbox" name="join_open" value="1" @checked($c->join_open)> السماح بالانضمام بالرمز</label>
  <button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'save'])حفظ</button>
</form>
<form method="post" action="{{ route('manage.class.destroy', $c) }}" style="margin-top:10px" onsubmit="return confirm('حذف الصف؟ لن يُحذف أي طالب.')">@csrf @method('delete')<input type="hidden" name="confirm" value="1"><button class="btn danger small" type="submit">@include('partials.admin-icon',['name'=>'trash'])حذف الصف</button></form>
</section>
@endif
<section class="card"><h2>@include('partials.admin-icon',['name'=>'users'])المعلّمون</h2>
  <ul style="margin:0;padding:0 18px 0 0">@forelse ($c->teachers as $t)<li style="margin:4px 0">{{ $t->name }} @if($admin)<small dir="ltr">{{ $t->email }}</small> <form method="post" action="{{ route('manage.class.teachers.remove', [$c, $t]) }}" style="display:inline">@csrf @method('delete')<button class="btn ghost small" type="submit">إزالة</button></form>@endif</li>@empty<li>لا يوجد معلّم بعد.</li>@endforelse</ul>
  @if ($admin && $teachers->isNotEmpty())<form method="post" action="{{ route('manage.class.teachers.add', $c) }}" style="display:flex;gap:8px;margin-top:10px">@csrf<select name="teacher_id" aria-label="المعلّم">@foreach ($teachers as $t)<option value="{{ $t->id }}">{{ $t->name }}</option>@endforeach</select><button class="btn small" type="submit">إضافة</button></form>@endif
</section>
</div>

<h2>الطلاب ({{ $ar::num($c->students->count()) }})</h2>
<div class="table-wrap stack"><table>
<thead><tr><th>الطالب</th><th>الصف</th><th>وليّ الأمر</th><th>آخر مزامنة</th><th></th></tr></thead><tbody>
@forelse ($c->students as $s)
<tr><td data-label="الطالب"><b>{{ $s->name }}</b></td><td data-label="الصف">{{ $ar::grade($s->grade) }}</td><td data-label="وليّ الأمر">{{ $s->user?->name }}@if($admin)<br><small dir="ltr">{{ $s->user?->email }}</small>@endif</td><td data-label="آخر مزامنة">{{ $ar::when($s->last_synced_at) }}</td>
<td class="actions"><a class="btn ghost small" href="{{ route('manage.student.report', $s) }}">التقرير</a>@if($admin) <form method="post" action="{{ route('manage.class.students.remove', [$c, $s]) }}" style="display:inline">@csrf @method('delete')<button class="btn ghost small" type="submit">إزالة</button></form>@endif</td></tr>
@empty<tr><td colspan="5" class="empty">لا طلاب في هذا الصف بعد.</td></tr>@endforelse
</tbody></table></div>

@if ($admin)
<section class="card" style="margin-top:18px"><h2>@include('partials.admin-icon',['name'=>'plus'])إضافة طلاب</h2>
<form method="get" class="filters" style="margin:0"><div><label for="q">ابحث عن طالب</label><input id="q" name="q" value="{{ request('q') }}" placeholder="اسم الطالب أو ولي الأمر أو البريد"></div><div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])بحث</button></div></form>
@if ($candidates->isNotEmpty())
<form method="post" action="{{ route('manage.class.students.add', $c) }}">@csrf
<div class="table-wrap"><table><tbody>
@foreach ($candidates as $s)<tr><td><label class="check" style="margin:0"><input type="checkbox" name="student_ids[]" value="{{ $s->id }}"> <b>{{ $s->name }}</b> — {{ $ar::grade($s->grade) }}</label></td><td>{{ $s->user?->name }} <small dir="ltr">{{ $s->user?->email }}</small></td></tr>@endforeach
</tbody></table></div>
<button class="btn small" type="submit" style="margin-top:10px">إضافة المحدَّدين</button></form>
@elseif (request('q'))<p class="hint">لا نتائج.</p>@endif
</section>
@endif
@endsection
