@extends('layouts.manage')
@section('title', 'لوحة المعلومات')
@section('content')
<div class="head"><h1>لوحة المعلومات</h1>@can('manage-site')@include('partials.export-menu')@endcan</div>
@php($subs = [
  'students' => $stats['families'] ? 'لدى '.$ar::num($stats['families']).' '.($stats['families'] === 1 ? 'وليّ أمر' : 'من أولياء الأمور') : 'لم يُضف وليّ أمر طالبًا بعد',
  'parents' => $stats['parents'] - $stats['families'] > 0 ? $ar::num($stats['parents'] - $stats['families']).' بلا طلاب بعد' : null,
])
<div class="stats">
  @foreach ([['parents','أولياء الأمور','users',''],['students','الطلاب','students','t-sky'],['new_week','حسابات جديدة هذا الأسبوع','plus',''],['active_week','طلاب نشطون هذا الأسبوع','activity','t-sky'],['trials','في فترة تجريبية','clock','t-sun'],['subs_active','اشتراكات فعّالة','check',''],['subs_pending','طلبات بانتظار الدفع','card','t-o'],['staff','المشرفون والمعلّمون','shield','t-grey'],['disabled','حسابات معطّلة','lock','t-red'],['drafts','مسودات المحتوى','book','t-grey']] as [$k,$label,$icon,$tone])
  <div class="stat {{ $tone }}" data-stat="{{ $k }}"><div class="ic">@include('partials.admin-icon',['name'=>$icon])</div><div class="txt"><b>{{ $ar::html($stats[$k]) }}</b><span>{{ $label }}</span>@if (! empty($subs[$k]))<small>{{ $subs[$k] }}</small>@endif</div></div>
  @endforeach
</div>
@can('manage-site')
@if (count($audit['ids']))
<div class="note" role="note">@include('partials.admin-icon',['name'=>'alert'])<p>يوجد {{ $ar::num(count($audit['ids'])) }} {{ count($audit['ids']) === 1 ? 'سجلّ طالب غير محسوب' : 'من سجلّات الطلاب غير المحسوبة' }} في العدد أعلاه (طلاب حسابات الإدارة التجريبيون، أو مكرّرون، أو قدامى أُنشئوا من الموقع).
<a href="{{ route('manage.students', ['owner' => 'review']) }}">مراجعتها</a></p></div>
@endif
@endcan
<div class="grid dash">
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'students'])الطلاب حسب الصف</h2>
    @php($max = max(1, $byGrade->max() ?? 1))
    @foreach ($ar::GRADES + [0 => 'غير محدد'] as $g => $label)
      @php($n = $byGrade[$g ?: null] ?? ($g === 0 ? ($byGrade[''] ?? 0) : 0))
      <div class="meter"><div class="meter-row"><span>{{ $label }}</span><b>{{ $ar::html($n) }}</b></div><div class="bar-track"><div class="bar" style="width:{{ max(2, $n / $max * 100) }}%"></div></div></div>
    @endforeach
  </section>
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'book'])طلاب لديهم تقدّم في كل مادة</h2>
    <ul class="list">
    @foreach ($ar::KEYS as $key => [$g, $subj])
      @if (isset($bySubject[$key]))<li><span>{{ $subj }} — {{ $ar::grade($g) }}</span><span class="chip" style="margin-inline-start:auto">{{ $ar::html($bySubject[$key]) }}</span></li>@endif
    @endforeach
    @if (empty($bySubject))<li class="hint">لا يوجد تقدّم متزامن بعد.</li>@endif
    </ul>
  </section>
  @can('manage-site')
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'card'])طلبات اشتراك جديدة</h2>
    <ul class="list act">
    @forelse ($pending as $group)
      @php($first = $group->first())
      <li><div class="act-top"><span class="chip warn mono" dir="ltr">{{ $first->batch ?? $first->code }}</span><b class="who">{{ $first->user?->name }}</b><a class="btn ghost small" href="{{ route('manage.subscriptions', ['q' => $first->batch ?? $first->code]) }}">مراجعة</a></div>
        <div class="act-items">@foreach ($group as $s)<span class="pill">{{ $s->plan_name }}</span>@endforeach</div></li>
    @empty<li class="hint">لا طلبات معلّقة.</li>@endforelse
    </ul>
  </section>
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'activity'])آخر النشاط</h2>
    @include('manage.partials.activity-list', ['entries' => $recent])
    <p class="more"><a href="{{ route('manage.activity') }}">السجلّ كاملًا</a></p>
  </section>
  @endcan
</div>
@endsection
