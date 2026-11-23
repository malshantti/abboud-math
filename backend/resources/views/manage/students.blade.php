@extends('layouts.manage')
@section('title', 'الطلاب')
@section('content')
<style>
.st-tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 12px}
.st-search{position:relative;flex:1 1 260px;min-width:0}
.st-search .ico{position:absolute;inset-inline-start:12px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--muted);pointer-events:none}
.st-search input{width:100%;min-height:44px;padding-inline-start:40px}
.st-tools select{flex:0 1 170px;min-height:44px;width:auto}
.st-tabs{display:flex;gap:4px;overflow-x:auto;margin:0 0 12px;padding-bottom:2px;scrollbar-width:none}
.st-tabs a{display:inline-flex;align-items:center;gap:6px;flex:none;min-height:36px;padding:0 12px;border-radius:999px;color:var(--ink2);font:500 13.5px/1 Plex,sans-serif;text-decoration:none;border:1px solid transparent}
.st-tabs a small{color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.st-tabs a:hover{background:#eef2e8}
.st-tabs a[aria-current]{background:var(--olive);color:#fff}.st-tabs a[aria-current] small{color:var(--olive-ink)}
.st-tabs a.warn small{color:#9a6b00}
.st-list{list-style:none;margin:0;padding:4px 0;overflow:hidden}
.st{border-bottom:1px solid var(--line2)}.st:last-child{border-bottom:0}
.st>a{display:grid;grid-template-columns:40px minmax(0,1fr) auto 16px;grid-template-rows:auto auto;gap:2px 12px;align-items:center;padding:10px 16px;color:inherit;font-weight:400;text-decoration:none}
.st>a:hover{background:#f7f9f3}
.st-av{grid-column:1;grid-row:1/3;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--gl);color:var(--gd);font:600 17px/1 Plex,sans-serif}
.st-av.g1,.st-av.g2{background:var(--yl);color:#7a5200}.st-av.g3,.st-av.g4{background:var(--sky);color:var(--bd)}.st-av.g7,.st-av.g8{background:#f1e9f7;color:#6a3b8c}.st-av.g0{background:#eef0ea;color:var(--muted)}
.st-name{grid-column:2;grid-row:1;min-width:0;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;font-size:15px;line-height:1.4}
.st-name b{font-weight:600;color:var(--ink)}
.st-name .g{color:var(--muted);font-size:13px}
.st-tag{font:500 11.5px/1.7 Plex,sans-serif;padding:0 7px;border-radius:999px;background:#eef2e8;color:var(--muted)}
.st-tag.school{background:var(--sky);color:var(--bd)}
.st-owner{grid-column:2;grid-row:2;font-weight:400;min-width:0;color:var(--muted);font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-owner span[dir]{unicode-bidi:isolate}
.st-prog{grid-column:3;grid-row:1/3;display:flex;flex-direction:column;align-items:flex-end;gap:2px;white-space:nowrap;font-variant-numeric:tabular-nums}
.st-prog b{font:600 14px/1.3 Plex,sans-serif;color:var(--ink)}
.st-prog small{color:var(--muted);font-size:12px;font-weight:400}
.st.idle .st-prog b{color:#b9c2b5;font-weight:500}
.st-go{grid-column:4;grid-row:1/3;width:16px;height:16px;color:#b9c2b5}
.st-sum{margin:0 0 10px;color:var(--muted);font-size:13px}
@media (max-width:560px){.st>a{grid-template-columns:36px minmax(0,1fr) auto;padding:10px 12px}.st-av{width:36px;height:36px}.st-go{display:none}}
</style>
@php
  $tz = config('app.display_timezone', 'Asia/Gaza');
  $today = now($tz)->startOfDay();
  $synced = function ($t) use ($ar, $tz, $today) {
      if (! $t) { return 'لم يزامن بعد'; }
      $t = $t->copy()->timezone($tz);
      if ($t->gte($today)) { return 'اليوم '.$ar::num($t->format('h:i')).' '.($t->format('A') === 'AM' ? 'ص' : 'م'); }
      if ($t->gte($today->copy()->subDay())) { return 'أمس'; }
      return $ar::num($t->format($t->year === $today->year ? 'd/m' : 'd/m/Y'));
  };
  $tab = fn ($o) => route('manage.students', array_filter(['q' => request('q'), 'grade' => request('grade'), 'owner' => $o]));
@endphp
<div class="head"><h1>الطلاب والتقدّم</h1>@can('manage-site')<a class="btn ghost small" href="{{ route('manage.export','students') }}">@include('partials.admin-icon',['name'=>'download'])تصدير CSV</a>@endcan</div>
@cannot('manage-site')<p class="lead">تظهر هنا طلاب صفوفك فقط.</p>@endcannot

<form class="st-tools" method="get" id="st-filter">
  @if ($owner)<input type="hidden" name="owner" value="{{ $owner }}">@endif
  <label class="st-search">@include('partials.admin-icon',['name'=>'search'])<input type="search" name="q" value="{{ request('q') }}" placeholder="ابحث باسم الطالب أو الأهل أو البريد" aria-label="بحث"></label>
  <select name="grade" aria-label="الصف" onchange="this.form.submit()"><option value="">كل الصفوف</option>@foreach (\App\Models\Setting::gradeOptions() as $g => $l)<option value="{{ $g }}" @selected((int) request('grade') === $g)>{{ $l }}</option>@endforeach</select>
  <noscript><button class="btn small" type="submit">بحث</button></noscript>
</form>

@if ($counts)
<nav class="st-tabs" aria-label="نوع الحساب">
  @foreach (['' => 'الكل', 'parents' => 'أولياء الأمور', 'school' => 'المدارس', 'review' => 'بحاجة إلى مراجعة'] as $o => $label)
    @if ($o === '' || $counts[$o] || $owner === $o)
    <a href="{{ $tab($o) }}" @if ($owner === $o) aria-current="page" @endif @class(['warn' => $o === 'review' && $counts[$o]])>{{ $label }} <small>{{ $ar::num($counts[$o]) }}</small></a>
    @endif
  @endforeach
</nav>
@endif

<section class="card" style="padding:0">
<ul class="st-list">
@forelse ($students as $s)
  @php($school = $s->user?->role === 'school')
  <li @class(['st', 'idle' => ! $s->progress_count])>
    <a href="{{ route('manage.student', $s) }}">
      <span class="st-av g{{ (int) $s->grade }}" aria-hidden="true">{{ mb_substr(trim($s->name), 0, 1) }}</span>
      <span class="st-name"><b>{{ $s->name }}</b><span class="g">{{ $ar::grade($s->grade) }}</span>@if ($school)<span class="st-tag school">مدرسة</span>@endif</span>
      <span class="st-owner">{{ $school ? 'حساب مدرسة' : ($s->user?->name ?? '—') }}@can('manage-site')@if ($s->user?->email && ! $school) · <span dir="ltr">{{ $s->user->email }}</span>@endif @endcan</span>
      <span class="st-prog"><b>{{ $s->progress_count ? $ar::num($s->progress_count).' '.($s->progress_count === 1 ? 'مادة' : ($s->progress_count === 2 ? 'مادتان' : 'مواد')) : 'لا تقدّم' }}</b><small>{{ $synced($s->last_synced_at) }}</small></span>
      <svg class="st-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
    </a>
  </li>
@empty<li class="hint" style="padding:24px 16px;text-align:center">لا نتائج.</li>@endforelse
</ul>
</section>
@if ($students->total() > $students->count())<p class="st-sum" style="margin-top:10px">{{ $ar::num($students->firstItem()) }}–{{ $ar::num($students->lastItem()) }} من {{ $ar::num($students->total()) }}</p>@endif
@include('partials.pager', ['p' => $students])
@endsection
