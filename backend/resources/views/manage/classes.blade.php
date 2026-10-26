@extends('layouts.manage')
@section('title', 'الصفوف')
@section('content')
<div class="head"><h1>{{ auth()->user()->isAdminRole() ? 'الصفوف والمعلّمون' : 'صفوفي' }}</h1></div>
<p class="lead">@can('manage-site')كل معلّم يرى طلاب صفوفه فقط. أنشئ صفًّا، عيّن معلّمه، ثم أضف الطلاب بنفسك أو أعطِ أولياء الأمور رمز الصف ليضيفوه من صفحة «حسابي».@else هنا صفوفك وطلابها فقط. لإضافة طالب، أعطِ وليّ أمره رمز الصف ليُدخله من صفحة «حسابي».@endcan</p>
@if ($errors->any())<p class="alert err" role="alert">{{ $errors->first() }}</p>@endif
@can('manage-site')
<section class="card" style="margin-bottom:18px"><h2>@include('partials.admin-icon',['name'=>'plus'])صف جديد</h2>
<form method="post" action="{{ route('manage.classes.store') }}" class="filters" style="margin:0">@csrf
  <div><label for="cn">اسم الصف</label><input id="cn" name="name" required maxlength="80" placeholder="مثل: السادس (أ) — مدرسة الزيتون"></div>
  <div><label for="cg">الصف الدراسي</label><select id="cg" name="grade"><option value="">—</option>@foreach ($grades as $g => $l)<option value="{{ $g }}">{{ $l }}</option>@endforeach</select></div>
  <div><label for="ct">المعلّم</label><select id="ct" name="teacher_id"><option value="">لاحقًا</option>@foreach ($teachers as $t)<option value="{{ $t->id }}">{{ $t->name }} — {{ $t->email }}</option>@endforeach</select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'plus'])إنشاء</button></div>
</form>
@if ($teachers->isEmpty())<p class="hint">لا يوجد حساب معلّم بعد. غيّر دور مستخدم إلى «معلّم» من صفحة المستخدمين.</p>@endif
</section>
@endcan
<div class="table-wrap stack"><table>
<thead><tr><th>الصف</th><th>الصف الدراسي</th><th>المعلّمون</th><th>الطلاب</th><th>رمز الانضمام</th><th></th></tr></thead><tbody>
@forelse ($classes as $c)
<tr><td data-label="الصف"><b>{{ $c->name }}</b></td><td data-label="الصف الدراسي">{{ $c->grade ? $ar::grade($c->grade) : '—' }}</td>
<td data-label="المعلّمون">{{ $c->teachers->pluck('name')->join('، ') ?: '—' }}</td><td data-label="الطلاب">{{ $ar::html($c->students_count) }}</td>
<td data-label="رمز الانضمام"><code dir="ltr" style="font-weight:800;letter-spacing:2px">{{ $c->code }}</code>@unless($c->join_open) <span class="chip grey">مغلق</span>@endunless</td>
<td class="actions"><a class="btn ghost small" href="{{ route('manage.class', $c) }}">الطلاب</a> <a class="btn ghost small" href="{{ route('manage.class.report', $c) }}">تقرير الصف</a></td></tr>
@empty<tr><td colspan="6" class="empty">@can('manage-site')لا توجد صفوف بعد.@else لم تُعيَّن لك أي صفوف بعد. اطلب من الإدارة إضافتك إلى صفك.@endcan</td></tr>@endforelse
</tbody></table></div>
@endsection
