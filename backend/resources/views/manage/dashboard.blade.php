@extends('layouts.manage')
@section('title', 'لوحة المعلومات')
@section('content')
@php($subs = [
  'students' => $stats['families'] ? 'لدى '.$ar::num($stats['families']).' '.($stats['families'] === 1 ? 'وليّ أمر' : 'من أولياء الأمور') : 'لم يُضف وليّ أمر طالبًا بعد',
  'parents' => trim(($stats['parents'] - $stats['families'] > 0 ? $ar::num($stats['parents'] - $stats['families']).' بلا طلاب بعد' : '').(! empty($stats['test_accounts']) ? ' · لا تُحتسب '.$ar::num($stats['test_accounts']).' حسابات تجريبية' : ''), ' ·') ?: null,
  'subs_active' => $stats['subs_expiring'] ? $ar::num($stats['subs_expiring']).' تنتهي خلال ٧ أيام' : null,
  'active_week' => $stats['students'] ? 'من أصل '.$ar::num($stats['students']).' طالبًا' : null,
])
<div class="head dash-head">
  <div><h1>لوحة المعلومات</h1><p class="dash-date">{{ $ar::num(now()->timezone(config('app.display_timezone', 'Asia/Gaza'))->format('d/m/Y')) }}</p></div>
  <div class="row"><a class="btn ghost small" href="{{ route('manage.live') }}">@include('partials.admin-icon',['name'=>'online'])المتصلون الآن</a>@can('manage-site')@include('partials.export-menu')@endcan</div>
</div>

@can('manage-site')
{{-- What needs the admin today comes first; each tile links straight to the place to act. --}}
@php($todo = array_filter([
  ['n' => $stats['subs_pending'], 'label' => 'طلبات اشتراك بانتظار الدفع', 'hint' => 'فعّلها بعد وصول المبلغ', 'href' => route('manage.subscriptions').'#pending', 'icon' => 'wallet', 'tone' => 't-o'],
  ['n' => $stats['subs_expiring'], 'label' => 'اشتراكات تنتهي خلال ٧ أيام', 'hint' => 'ذكّر العائلات بالتجديد', 'href' => route('manage.subscriptions', ['status' => 'expiring']), 'icon' => 'clock', 'tone' => 't-sun'],
  ['n' => count($audit['ids']), 'label' => 'سجلّات طلاب غير محسوبة', 'hint' => 'تجريبية أو مكرّرة أو قديمة: مراجعتها', 'href' => route('manage.students', ['owner' => 'review']), 'icon' => 'alert', 'tone' => 't-red'],
], fn ($t) => $t['n'] > 0))
<section class="todo" aria-label="يحتاج إجراء">
  @forelse ($todo as $t)
  <a class="todo-item {{ $t['tone'] }}" href="{{ $t['href'] }}"><span class="ic">@include('partials.admin-icon',['name'=>$t['icon']])</span><span class="txt"><b>{{ $ar::html($t['n']) }}</b><span>{{ $t['label'] }}</span><small>{{ $t['hint'] }}</small></span>@include('partials.admin-icon',['name'=>'arrow'])</a>
  @empty
  <p class="todo-ok">@include('partials.admin-icon',['name'=>'check'])لا شيء ينتظرك الآن: لا طلبات دفع، ولا اشتراكات على وشك الانتهاء.</p>
  @endforelse
</section>
@endcan

<div class="stats kpi">
  @foreach ([['parents','أولياء الأمور','users',''],['students','الطلاب','students','t-sky'],['active_week','طلاب نشطون هذا الأسبوع','activity','t-sky'],['subs_active','اشتراكات فعّالة','check','']] as [$k,$label,$icon,$tone])
  <div class="stat {{ $tone }}" data-stat="{{ $k }}"><div class="ic">@include('partials.admin-icon',['name'=>$icon])</div><div class="txt"><b>{{ $ar::html($stats[$k]) }}</b><span>{{ $label }}</span>@if (! empty($subs[$k]))<small>{{ $subs[$k] }}</small>@endif</div></div>
  @endforeach
</div>
<ul class="minor" aria-label="أرقام أخرى">
  @foreach ([['new_week','حسابات جديدة هذا الأسبوع'],['trials','في فترة تجريبية'],['staff','المشرفون والمعلّمون'],['disabled','حسابات معطّلة'],['drafts','مسودات المحتوى']] as [$k,$label])
  <li data-stat="{{ $k }}"><b>{{ $ar::html($stats[$k]) }}</b><span>{{ $label }}</span></li>
  @endforeach
</ul>

<div class="grid dash">
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'students'])الطلاب حسب الصف</h2>
    @php($max = max(1, $byGrade->max() ?? 1))
    @foreach (\App\Models\Setting::gradeOptions() + [0 => 'غير محدد'] as $g => $label)
      @php($n = $byGrade[$g ?: null] ?? ($g === 0 ? ($byGrade[''] ?? 0) : 0))
      @continue($g === 0 && ! $n)
      <div class="meter"><div class="meter-row"><span>{{ $label }}</span><b>{{ $ar::html($n) }}</b></div><div class="bar-track"><div class="bar" style="width:{{ $n ? max(2, $n / $max * 100) : 0 }}%"></div></div></div>
    @endforeach
  </section>
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'book'])طلاب لديهم تقدّم في كل مادة</h2>
    <ul class="list cols">
    @foreach ($bySubject as [$g, $subj, $n])
      <li><span>{{ $subj }} — {{ $ar::grade($g) }}</span><span class="chip" style="margin-inline-start:auto">{{ $ar::html($n) }}</span></li>
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
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'list'])آخر النشاط</h2>
    @include('manage.partials.activity-list', ['entries' => $recent])
    <p class="more"><a href="{{ route('manage.activity') }}">السجلّ كاملًا</a></p>
  </section>
  @endcan
</div>
@endsection
