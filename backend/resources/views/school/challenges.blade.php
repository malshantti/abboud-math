@extends('school.layout')
@section('title', 'تحدّيات الشعب')
@section('head-end')<a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@php($stName = ['live' => 'جارٍ الآن', 'soon' => 'قريبًا', 'done' => 'انتهى'])
@section('css')
@include('school._dash')
.ch{margin:0 0 16px}.ch h2{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.lb{display:grid;gap:8px}.lb .r{display:grid;grid-template-columns:34px minmax(90px,170px) 1fr auto;gap:8px;align-items:center}
.lb .r .bar{height:14px}.lb .n{font:800 20px Baloo,Cairo,sans-serif;text-align:center}.lb .r.w .n{color:#b37a00}
.secs{display:flex;flex-wrap:wrap;gap:6px 14px}
@endsection
@section('content')
<div class="top2"><h1>🏆 تحدّيات الشعب</h1>@if ($school->is_test)<span class="tag t-idle3">بيانات تجريبية للاختبار</span>@endif</div>
<p class="sub">تتنافس الشعب في الجهد: نجوم، أيام تعلّم، دقائق، أو إنجاز الواجبات. يُحسب كل شيء «لكل طالب» حتى تتنافس الشعب الصغيرة والكبيرة بعدل. لا علامات.</p>
@if (session('ok'))<div class="card" role="status" style="margin:0 0 12px">{{ session('ok') }}</div>@endif
@if ($errors->any())<div class="card" role="alert" style="margin:0 0 12px;border-color:#eba59f">{{ $errors->first() }}</div>@endif
@forelse ($list as $x)@php($c = $x['c'])
<section class="card ch"><h2>{{ $c->title }} <span class="tag {{ $c->state() === 'live' ? 't-today' : ($c->state() === 'done' ? 't-recent' : 't-idle3') }}">{{ $stName[$c->state()] }}</span></h2>
<p class="sub">{{ \App\Models\SchoolChallenge::METRICS[$c->metric] }} · من {{ $ar::num($c->starts_on->format('Y/m/d')) }} إلى {{ $ar::num($c->ends_on->format('Y/m/d')) }}</p>
<div class="lb">@foreach ($x['st'] as $s)<div class="r {{ $s['rank'] === 1 ? 'w' : '' }}"><span class="n">{{ $s['rank'] === 1 ? '🥇' : ($s['rank'] === 2 ? '🥈' : ($s['rank'] === 3 ? '🥉' : $ar::num($s['rank']))) }}</span><b>{{ $s['sec']->name }}</b><span class="bar"><i style="width:{{ $s['bar'] }}%"></i></span><span>{{ $ar::num($s['val']) }} <small class="muted">{{ \App\Support\SchoolMotivation::unit($c->metric) }}</small></span></div>@endforeach</div>
@if ($me->school_role === 'manager')<form method="post" action="{{ route('school.challenges.delete', [$school, $c->id]) }}" onsubmit="return confirm('حذف هذا التحدّي؟')" style="margin-top:10px">@csrf<button class="btn ghost small" type="submit">حذف</button></form>@endif
</section>
@empty<section class="card"><p class="muted">لا تحدّيات بعد.</p></section>@endforelse
@if ($me->school_role === 'manager')
<section class="card"><h2>تحدٍّ جديد</h2>
<form method="post" action="{{ route('school.challenges.store', $school) }}">@csrf
<div class="f2"><label>العنوان<input name="title" required maxlength="120" value="{{ old('title', 'تحدّي المثابرة') }}"></label>
<label>نقيس<select name="metric">@foreach (\App\Models\SchoolChallenge::METRICS as $k => $v)<option value="{{ $k }}">{{ $v }}</option>@endforeach</select></label>
<label>من<input type="date" name="starts_on" required value="{{ old('starts_on', $today) }}"></label>
<label>إلى<input type="date" name="ends_on" required value="{{ old('ends_on', \Illuminate\Support\Carbon::parse($today)->addDays(6)->format('Y-m-d')) }}"></label></div>
<p style="font-weight:800;margin:12px 0 4px">الشعب المتنافسة (شعبتان على الأقل)</p>
<div class="secs">@foreach ($sections as $s)<label class="chk"><input type="checkbox" name="sections[]" value="{{ $s->id }}">{{ $s->name }}</label>@endforeach</div>
<button class="btn" type="submit" style="margin-top:10px">أنشئ التحدّي</button></form></section>
@endif
@endsection
