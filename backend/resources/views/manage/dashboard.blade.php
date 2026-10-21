@extends('layouts.manage')
@section('title', 'لوحة المعلومات')
@section('content')
<div class="head"><h1>لوحة المعلومات</h1>@can('manage-site')<div class="row"><a class="btn ghost small" href="{{ route('manage.export','users') }}">@include('partials.admin-icon',['name'=>'download'])تصدير المستخدمين</a><a class="btn ghost small" href="{{ route('manage.export','students') }}">@include('partials.admin-icon',['name'=>'download'])تصدير الطلاب</a><a class="btn ghost small" href="{{ route('manage.export','progress') }}">@include('partials.admin-icon',['name'=>'download'])تصدير التقدّم</a><a class="btn ghost small" href="{{ route('manage.export','subscriptions') }}">@include('partials.admin-icon',['name'=>'download'])تصدير الاشتراكات</a></div>@endcan</div>
<div class="stats">
  @foreach ([['parents','أولياء الأمور','users',''],['students','الطلاب','students','t-sky'],['new_week','حسابات جديدة هذا الأسبوع','plus',''],['active_week','طلاب نشطون هذا الأسبوع','activity','t-sky'],['trials','في فترة تجريبية','clock','t-sun'],['subs_active','اشتراكات فعّالة','check',''],['subs_pending','طلبات بانتظار الدفع','card','t-o'],['staff','المشرفون والمعلّمون','shield','t-grey'],['disabled','حسابات معطّلة','lock','t-red'],['drafts','مسودات المحتوى','book','t-grey']] as [$k,$label,$icon,$tone])
  <div class="stat {{ $tone }}"><div class="ic">@include('partials.admin-icon',['name'=>$icon])</div><div><b>{{ $ar::num($stats[$k]) }}</b><span>{{ $label }}</span></div></div>
  @endforeach
</div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));margin-top:22px">
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'students'])الطلاب حسب الصف</h2>
    @php($max = max(1, $byGrade->max() ?? 1))
    @foreach ($ar::GRADES + [0 => 'غير محدد'] as $g => $label)
      @php($n = $byGrade[$g ?: null] ?? ($g === 0 ? ($byGrade[''] ?? 0) : 0))
      <div style="margin:10px 0"><div class="row" style="justify-content:space-between"><span>{{ $label }}</span><b>{{ $ar::num($n) }}</b></div><div class="bar-track"><div class="bar" style="width:{{ max(2, $n / $max * 100) }}%"></div></div></div>
    @endforeach
  </section>
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'book'])طلاب لديهم تقدّم في كل مادة</h2>
    <ul class="list">
    @foreach ($ar::KEYS as $key => [$g, $subj])
      @if (isset($bySubject[$key]))<li><span>{{ $subj }} — {{ $ar::grade($g) }}</span><span class="chip" style="margin-inline-start:auto">{{ $ar::num($bySubject[$key]) }}</span></li>@endif
    @endforeach
    @if (empty($bySubject))<li class="hint">لا يوجد تقدّم متزامن بعد.</li>@endif
    </ul>
  </section>
  @can('manage-site')
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'card'])طلبات اشتراك جديدة</h2>
    <ul class="list">
    @forelse ($pending as $s)<li><span class="chip warn mono" dir="ltr">{{ $s->code }}</span><span>{{ $s->user?->name }} — {{ $s->plan_name }}</span><a class="btn ghost small" style="margin-inline-start:auto" href="{{ route('manage.subscriptions', ['q' => $s->code]) }}">مراجعة</a></li>
    @empty<li class="hint">لا طلبات معلّقة.</li>@endforelse
    </ul>
  </section>
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'activity'])آخر النشاط</h2>
    <ul class="list">
    @foreach ($recent as $l)<li><span class="chip grey">{{ $l->label() }}</span><span>{{ $l->user?->name ?? 'زائر' }} {{ $l->subject ? '— '.$l->subject : '' }}</span><small class="when">{{ $ar::date($l->created_at) }}</small></li>@endforeach
    </ul>
    <p><a href="{{ route('manage.activity') }}">السجل كاملًا</a></p>
  </section>
  @endcan
</div>
@endsection
