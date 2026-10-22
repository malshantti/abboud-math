@extends('layouts.manage')
@section('title', $student->name)
@section('content')
<div class="head"><h1>{{ $student->name }} <span class="chip">{{ $ar::grade($student->grade) }}</span></h1><a class="btn ghost small" href="{{ route('manage.students') }}">@include('partials.admin-icon',['name'=>'back'])كل الطلاب</a></div>
<dl class="facts">
  <div><dt>@include('partials.admin-icon',['name'=>'users'])وليّ الأمر</dt><dd>@if ($student->user)<a href="{{ route('manage.user', $student->user) }}">{{ $student->user->name }}</a><span class="mail" dir="ltr" title="{{ $student->user->email }}">{{ $student->user->email }}</span>@else — @endif</dd></div>
  <div><dt>@include('partials.admin-icon',['name'=>'clock'])آخر مزامنة</dt><dd><time datetime="{{ $student->last_synced_at?->toIso8601String() }}">{{ $ar::when($student->last_synced_at) }}</time></dd></div>
</dl>
@forelse ($rows as $g => $items)
<section class="card" style="margin:14px 0"><h2>@include('partials.admin-icon',['name'=>'book']){{ $ar::grade($g) }}</h2>
  <div class="grid subjects">
  @foreach ($items as $it)
    @php($p = $it['progress'])
    <article class="subj">
      <h3>{{ $it['subject'] }}</h3>
      @if ($p)
        @if ($p['done'] !== null)
        <div class="lesson">
          <div class="meter-row"><span>الدروس المنجزة</span><b>{{ $ar::html($p['done']) }}@if ($p['total']) <small>من {{ $ar::html($p['total']) }}</small>@endif</b></div>
          @if ($p['pct'] !== null)<div class="bar-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ $p['pct'] }}" aria-label="نسبة الإنجاز"><div class="bar" style="width:{{ max(2, $p['pct']) }}%"></div></div><small class="pct">{{ $ar::html($p['pct']) }}٪ من المنهاج</small>@endif
        </div>
        @endif
        <dl class="kv">
          <div><dt>متوسط الاختبارات</dt><dd>@if ($p['quiz_avg'] !== null){{ $ar::html($p['quiz_avg']) }}٪ <small>({{ $ar::num($p['quiz_count']) }} {{ $p['quiz_count'] === 1 ? 'اختبار' : 'اختبارات' }})</small>@else<span class="none">لا اختبارات بعد</span>@endif</dd></div>
          @if ($p['quiz_last'])<div><dt>آخر النتائج</dt><dd class="scores">@foreach ($p['quiz_last'] as $sc)<span class="pill {{ $sc >= 80 ? '' : ($sc >= 50 ? 'mid' : 'low') }}">{{ $ar::html($sc) }}٪</span>@endforeach</dd></div>@endif
          <div><dt>النقاط</dt><dd>{{ $p['points'] !== null ? $ar::html($p['points']) : '—' }}</dd></div>
          <div><dt>أيام متتالية</dt><dd>{{ $p['streak'] !== null ? $ar::html($p['streak']) : '—' }}</dd></div>
          <div><dt>آخر نشاط</dt><dd>{{ $ar::when($p['last'] ?? $it['updated']) }}</dd></div>
        </dl>
      @else
        <p class="hint">تعذّرت قراءة بيانات هذه المادة.</p>
      @endif
      <details><summary>البيانات الخام (للدعم الفني)</summary><pre>{{ \Illuminate\Support\Str::limit($it['raw'], 4000) }}</pre></details>
    </article>
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
    <div class="field"><label for="grade">الصف</label><select id="grade" name="grade"><option value="">غير محدد</option>@foreach (\App\Models\Setting::gradeOptions() as $g => $l)<option value="{{ $g }}" @selected($student->grade === $g)>{{ $l }}</option>@endforeach</select></div>
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
