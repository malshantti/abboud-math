@extends('school.layout')
@section('title', 'لوحة المدير')
@section('head-end')<a class="btn ghost small" href="{{ route('school.monthly', $school) }}">التقرير الشهري</a><a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@php($bar = fn ($v, $low = 50) => '<div class="cell"><div class="bar"><i style="width:'.($v ?? 0).'%;background:'.(($v ?? 100) < $low ? '#d9534f' : 'var(--g)').'"></i></div><small>'.e($v === null ? '—' : $ar::num($v).'٪').'</small></div>')
@section('css')
@include('school._dash')
@endsection
@section('content')
<div class="top2"><h1>لوحة المدير</h1>@if ($school->is_test)<span class="tag t-idle3">بيانات تجريبية للاختبار</span>@endif</div>
<div class="kpis">
<div class="kpi"><span class="ring" style="--p:{{ $sum['week_pct'] }}"><i>{{ $ar::num($sum['week_pct']) }}٪</i></span><b>{{ $ar::num($sum['students']) }}</b><span>طالبًا · النشطون هذا الأسبوع</span></div>
<div class="kpi"><b>{{ $ar::num($sum['today']) }}</b><span>دخلوا اليوم</span></div>
<div class="kpi"><b>{{ $pc($sum['hw_pct']) }}</b><span>إنجاز الواجبات ({{ $ar::count($sum['hw_n'], 'واجب') }}، ٤ أسابيع)</span></div>
<div class="kpi"><b>{{ $pc($sum['quiz_avg']) }}</b><span>متوسط الاختبارات ({{ $ar::num($sum['quiz_n']) }})</span></div>
</div>
<div class="cols">
<section class="card"><h2>النشاط في آخر ٤ أسابيع</h2><p class="sub">نسبة الطلاب الذين تعلّموا في كل أسبوع.</p>
<div class="spark" style="height:90px">@foreach ($trend as $w)<i style="height:{{ max(2, $w['pct']) }}%;width:48px" title="{{ $w['pct'] }}%"></i>@endforeach</div>
<div style="display:flex;gap:4px">@foreach ($trend as $w)<small style="width:48px;text-align:center">{{ $ar::num($w['pct']) }}٪<br><span class="muted">{{ $w['label'] }}</span></small>@endforeach</div></section>
<section class="card"><h2>المعلّمون</h2><table><thead><tr><th>المعلّم</th><th>نشاط طلابه</th><th class="hm">الواجبات</th><th>الاختبارات</th></tr></thead><tbody>
@forelse ($teachers as $t)<tr><td><b>{{ $t['name'] }}</b><br><small class="muted">{{ $t['sections'] ?: '—' }}</small></td><td>{!! $bar($t['week_pct']) !!}</td><td class="hm">{{ $ar::num($t['hw_n']) }} · {{ $pc($t['hw_pct']) }}</td><td>{{ $ar::num($t['quiz_n']) }} · {{ $pc($t['quiz_avg']) }}</td></tr>
@empty<tr><td colspan="4" class="muted">لا معلّمين بعد.</td></tr>@endforelse</tbody></table></section>
</div>
@foreach ($grades as $g => $secs)
<section class="card"><h2>مقارنة شعب {{ $ar::grade($g) }}</h2>
<table><thead><tr><th>الشعبة</th><th>نشطون (أسبوع)</th><th>التقدّم</th><th class="hm">الصواب</th><th>إنجاز الواجبات</th><th>متوسط الاختبارات</th><th class="hm">٤ أسابيع</th></tr></thead><tbody>
@foreach ($secs as $r)<tr><td><a class="nm" href="{{ route('school.report', [$school, $r['sec']]) }}">{{ $r['sec']->name }}</a><br><small class="muted">{{ $ar::count($r['n'], 'طالب') }} · {{ $r['teachers'] ?: 'بلا معلّم' }}</small></td>
<td>{!! $bar($r['week_pct']) !!}</td><td>{!! $bar($r['progress'], 0) !!}</td><td class="hm">{{ $pc($r['acc']) }}</td><td>{!! $bar($r['hw_pct']) !!}<small class="muted">{{ $ar::count($r['hw_n'], 'واجب') }}</small></td><td>{{ $pc($r['quiz_avg']) }} <small class="muted">({{ $ar::num($r['quiz_n']) }})</small></td>
<td class="hm"><span class="spark" style="height:28px">@foreach ($r['trend'] as $w)<i style="height:{{ max(4, $w['pct']) }}%;width:9px" title="{{ $w['label'] }}: {{ $w['pct'] }}%"></i>@endforeach</span></td></tr>@endforeach
</tbody></table></section>
@endforeach
<div class="cols">
<section class="card"><h2>أضعف الدروس في المدرسة</h2><p class="sub">أقل نسبة صواب (٨ إجابات فأكثر).</p>
<table><thead><tr><th>الدرس</th><th>الصواب</th><th class="hm">الشعب</th></tr></thead><tbody>
@forelse ($weakest as $l)<tr><td><b>{{ $l['lesson'] }}</b><br><small class="muted">{{ $l['subject'] }} · {{ $ar::grade($l['grade']) }} · {{ $ar::count($l['students'], 'طالب') }}</small></td><td>{!! $bar($l['acc'], 60) !!}</td><td class="hm">{{ implode('، ', $l['sections']) }}</td></tr>
@empty<tr><td colspan="3" class="muted">لا بيانات كافية بعد.</td></tr>@endforelse</tbody></table></section>
<section class="card"><h2>نتائج الاختبارات</h2><table><thead><tr><th>الاختبار</th><th>أدّوه</th><th>المتوسط</th></tr></thead><tbody>
@forelse ($quizzes->take(15) as $q)<tr><td><a class="nm" href="{{ route('school.quiz', [$school, $q['sec'], $q['quiz']->id]) }}">{{ $q['quiz']->title }}</a><br><small class="muted">{{ $q['sec']->name }} · {{ $q['teacher'] ?: '—' }}</small></td><td>{{ $ar::num($q['sum']['took']) }}/{{ $ar::num($q['sum']['n']) }}</td><td>{!! $bar($q['sum']['avg']) !!}</td></tr>
@empty<tr><td colspan="3" class="muted">لا اختبارات في آخر ٤ أسابيع.</td></tr>@endforelse</tbody></table></section>
</div>
@endsection
