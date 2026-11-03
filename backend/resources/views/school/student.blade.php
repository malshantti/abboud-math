@extends('school.layout')
@section('title', $r['name'])
@section('head-end')<a class="btn ghost small" href="{{ route('school.report', [$school, $section]) }}">لوحة {{ $section->name }}</a><a class="btn small" href="{{ route('school.family', [$school, $r['id']]) }}">تقرير الأهل الشهري</a>@endsection
@php($tz = \App\Support\SchoolStats::tz())
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@section('css')
h1{margin:0;font-size:28px}h2{font-size:21px;margin:0 0 10px}
.top2{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:0 0 16px}
.kpi{background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 14px}.kpi b{display:block;font:800 26px/1.2 Baloo,Cairo,sans-serif}.kpi span{color:var(--muted);font-weight:700;font-size:15px}
section.card{margin:0 0 18px;overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:15px}th,td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:start}th{color:var(--muted);font-size:13px}
.bar{height:9px;border-radius:9px;background:var(--line);min-width:70px;overflow:hidden}.bar i{display:block;height:100%;background:var(--g)}
.subj{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.sc{border:2px solid var(--line);border-radius:16px;padding:12px 14px;background:#fff}.sc h3{margin:0 0 6px;font-size:19px}
.chart{display:flex;align-items:flex-end;gap:4px;height:90px;border-bottom:2px solid var(--line);padding-top:6px}
.chart div{flex:1;background:var(--g);border-radius:5px 5px 0 0;min-height:2px;position:relative}.chart div.z{background:var(--line)}
.labels{display:flex;gap:4px;font-size:11px;color:var(--muted)}.labels span{flex:1;text-align:center}
.ok{color:#2f5f10;font-weight:800}.no{color:#8a2a24;font-weight:800}
.tag{display:inline-block;border-radius:999px;padding:1px 10px;font-weight:800;font-size:13px}.t-today{background:#e3f4d7}.t-recent{background:#eef3f8}.t-idle3{background:#ffe7a8}.t-idle7,.t-never{background:#ffd2cc}
@endsection
@section('content')
<div class="top2"><h1>{{ $r['name'] }}</h1><span class="chip grey">{{ $section->name }}</span><span dir="ltr" class="muted">{{ $r['username'] }}</span>
<span class="tag t-{{ $r['status'] }}">{{ $r['last'] ? 'آخر ظهور '.$ar::date($r['last']) : 'لم يدخل بعد' }}</span></div>
<div class="kpis">
  <div class="kpi"><b>{{ $ar::html($r['week_days']) }}</b><span>أيام نشاط هذا الأسبوع</span></div>
  <div class="kpi"><b>{{ $ar::html($r['week_min']) }}</b><span>دقائق هذا الأسبوع</span></div>
  <div class="kpi"><b>{{ $ar::html($r['done']) }}</b><span>دروس منجزة</span></div>
  <div class="kpi"><b>{{ $pc($r['progress']) }}</b><span>متوسط التقدّم</span></div>
  <div class="kpi"><b>{{ $pc($r['acc']) }}</b><span>الإجابات الصحيحة ({{ $ar::num($r['answered']) }})</span></div>
</div>
<section class="card"><h2>دقائق التعلّم — آخر ١٤ يومًا</h2>
@php($series = collect(range(13, 0))->map(fn ($i) => now($tz)->subDays($i)->format('Y-m-d')))
@php($mx = max(1, max(array_map(fn ($d) => $r['days'][$d] ?? 0, $series->all()))))
<div class="chart" role="img" aria-label="دقائق التعلّم يوميًا">@foreach ($series as $dd)@php($m = (int) round(($r['days'][$dd] ?? 0) / 60000))<div class="{{ $m ? '' : 'z' }}" style="height:{{ max(2, round(100 * ($r['days'][$dd] ?? 0) / $mx)) }}%" title="{{ $dd }}: {{ $m }} د"></div>@endforeach</div>
<div class="labels">@foreach ($series as $dd)<span>{{ $ar::num((int) substr($dd, 8)) }}</span>@endforeach</div></section>
<div class="subj">
@foreach ($r['subjects'] as $x)
<div class="sc"><h3>{{ $x['name'] }}</h3>
@if (! $x['opened'])<p class="muted">لم يفتح هذه المادة بعد.</p>@else
<div class="bar"><i style="width:{{ $x['pct'] ?? 0 }}%"></i></div>
<p style="margin:6px 0">{{ $ar::num($x['done']) }} درسًا @if($x['total'])من {{ $ar::num($x['total']) }} ({{ $pc($x['pct']) }})@endif · الصواب {{ $pc($x['acc']) }} @if($x['quiz_count'])· الاختبارات {{ $pc($x['quiz_avg']) }}@endif · {{ $ar::num($x['min']) }} دقيقة</p>
@if ($x['lessons'])<table><thead><tr><th>الدرس</th><th>الصواب</th><th>آخر مرة</th></tr></thead><tbody>
@foreach (array_slice($x['lessons'], 0, 12) as $l)<tr><td>{{ $l['name'] }}</td><td class="{{ $l['pct'] !== null && $l['pct'] < 60 ? 'no' : '' }}">{{ $l['answered'] ? $pc($l['pct']).' ('.$ar::num($l['answered']).')' : 'فُتح' }}</td><td class="muted">{{ $l['last'] ? $ar::date($l['last'], false) : '—' }}</td></tr>@endforeach
</tbody></table>@endif
@endif</div>
@endforeach
</div>
@php($wrong = collect($r['subjects'])->flatMap(fn ($x) => collect($x['wrong'])->map(fn ($w) => $w + ['s' => $x['name']]))->sortByDesc(fn ($w) => $w['at']?->getTimestamp() ?? 0)->take(20))
<section class="card" style="margin-top:18px"><h2>آخر الأخطاء</h2>
<table><thead><tr><th>السؤال</th><th>إجابته</th><th>الصحيحة</th><th>متى</th></tr></thead><tbody>
@forelse ($wrong as $w)<tr><td><b>{{ $w['q'] }}</b><br><small class="muted">{{ $w['s'] }}@if($w['lesson']) · {{ $w['lesson'] }}@endif</small></td><td class="no">{{ $w['a'] ?: '—' }}</td><td class="ok">{{ $w['c'] ?: '—' }}</td><td class="muted">{{ $w['at'] ? $ar::date($w['at']) : '—' }}</td></tr>
@empty<tr><td colspan="4" class="muted">لا أخطاء مسجّلة.</td></tr>@endforelse</tbody></table></section>
@endsection
