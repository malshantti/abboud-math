@extends('layouts.manage')
@section('title', $student->name)
@section('content')
<div class="head"><h1>{{ $student->name }} <span class="chip">{{ $ar::grade($student->grade) }}</span></h1><a class="btn ghost small" href="{{ route('manage.students') }}">@include('partials.admin-icon',['name'=>'back'])كل الطلاب</a></div>
<p class="lead">ولي الأمر: {{ $student->user?->name }} (<span dir="ltr">{{ $student->user?->email }}</span>) — آخر مزامنة: {{ $ar::date($student->last_synced_at) }}</p>
@forelse ($rows as $g => $items)
<section class="card" style="margin:14px 0"><h2>@include('partials.admin-icon',['name'=>'book']){{ $ar::grade($g) }}</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
  @foreach ($items as $it)
    <div class="stat subj" style="align-items:stretch"><h3>{{ $it['subject'] }}</h3>
      @foreach ($it['summary'] as $label => $v)<div class="row" style="justify-content:space-between"><span>{{ $label }}</span><b>{{ $v }}</b></div>@endforeach
      <p class="hint">آخر تحديث: {{ $ar::date($it['updated']) }}</p>
      <details><summary>البيانات الخام</summary><pre>{{ \Illuminate\Support\Str::limit($it['raw'], 4000) }}</pre></details>
    </div>
  @endforeach
  </div>
</section>
@empty
<p class="card">لا يوجد تقدّم متزامن لهذا الطالب بعد.</p>
@endforelse
@can('manage-site')
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))">
<section class="card"><h2>@include('partials.admin-icon',['name'=>'students'])تعديل</h2>
  <form method="post" action="{{ route('manage.student.update', $student) }}">@csrf @method('put')
    <div class="field"><label for="name">الاسم</label><input id="name" name="name" value="{{ $student->name }}" maxlength="24" required></div>
    <div class="field"><label for="grade">الصف</label><select id="grade" name="grade"><option value="">غير محدد</option>@foreach ($ar::GRADES as $g => $l)<option value="{{ $g }}" @selected($student->grade === $g)>{{ $l }}</option>@endforeach</select></div>
    <button class="btn small" type="submit">حفظ</button></form>
</section>
<section class="card danger-zone"><h2>@include('partials.admin-icon',['name'=>'alert'])حذف</h2>
  <form method="post" action="{{ route('manage.student.destroy', $student) }}" onsubmit="return confirm('حذف الطالب وتقدّمه من الخادم؟')">@csrf @method('delete')
    <label class="check"><input type="checkbox" name="confirm" value="1" required style="width:22px;min-height:22px"> أؤكد حذف الطالب وتقدّمه من الخادم</label>
    <button class="btn danger small" type="submit" style="margin-top:12px">حذف</button></form>
</section>
</div>
@endcan
@endsection
