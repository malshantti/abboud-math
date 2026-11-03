@extends('school.layout')
@section('title', 'لوحة '.$section->name)
@section('head-end')<a class="btn ghost small" href="{{ route('school.section', [$school, $section]) }}">إدارة الطلاب</a><a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@php($tz = \App\Support\SchoolStats::tz())
@php($s = $d['sum'])
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@php($when = fn ($c) => $c ? $ar::date($c) : 'لم يدخل بعد')
@section('css')
h1{margin:0;font-size:28px}h2{font-size:21px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 12px;font-size:15px}
.top2{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:0 0 16px}
.kpi{background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 14px}.kpi b{display:block;font:800 30px/1.2 Baloo,Cairo,sans-serif}.kpi span{color:var(--muted);font-weight:700;font-size:15px}
.kpi.warn{border-color:#f0c36d;background:#fff8e6}.kpi.bad{border-color:#eba59f;background:#fff1ef}
.ring{--p:0;width:54px;height:54px;border-radius:50%;background:conic-gradient(var(--g) calc(var(--p)*1%),var(--line) 0);display:grid;place-items:center;float:inline-end}
.ring i{width:40px;height:40px;border-radius:50%;background:#fff;display:grid;place-items:center;font:800 13px Cairo,sans-serif;font-style:normal}
.filters{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}.filters a{padding:6px 14px;border-radius:999px;border:2px solid var(--line);background:#fff;text-decoration:none;font-weight:800;color:var(--ink)}
.filters a.on{background:var(--g);border-color:var(--g);color:#fff}.filters .csv{margin-inline-start:auto;border-style:dashed}
section.card{margin:0 0 18px;overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:15px}th,td{padding:8px 6px;border-bottom:1px solid var(--line);text-align:start;vertical-align:middle}th{color:var(--muted);font-size:13px;white-space:nowrap}
tr.idle3{background:#fff8e6}tr.idle7,tr.never{background:#fff1ef}
.tag{display:inline-block;border-radius:999px;padding:1px 10px;font-weight:800;font-size:13px;white-space:nowrap}
.t-today{background:#e3f4d7;color:#2f5f10}.t-recent{background:#eef3f8;color:#2d4f70}.t-idle3{background:#ffe7a8;color:#6b4800}.t-idle7,.t-never{background:#ffd2cc;color:#8a2a24}
.bar{height:9px;border-radius:9px;background:var(--line);min-width:70px;overflow:hidden}.bar i{display:block;height:100%;background:var(--g);border-radius:9px}
.cell{display:grid;gap:3px;min-width:84px}.cell small{color:var(--muted);font-size:12px}
.hq{list-style:none;margin:0;padding:0}.hq li{padding:10px 0;border-bottom:1px solid var(--line)}.hq q{font-weight:800;quotes:none}.hq .meta{color:var(--muted);font-size:14px}
.ok{color:#2f5f10;font-weight:800}.no{color:#8a2a24;font-weight:800}
.cols{display:grid;gap:18px;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}@media(max-width:860px){.cols{grid-template-columns:1fr}}
.days{display:flex;gap:3px}.days i{width:12px;height:12px;border-radius:3px;background:var(--line)}.days i.on{background:var(--g)}
a.nm{font-weight:800;text-decoration:none}
@media(max-width:600px){h1{font-size:23px}.kpi b{font-size:25px}th.hm,td.hm{display:none}}
@endsection
@section('content')
<div class="top2"><h1>{{ $section->name }}</h1><span class="chip grey">{{ $ar::grade($section->grade) }}</span>
@if ($school->is_test)<span class="tag t-idle3">بيانات تجريبية للاختبار</span>@endif</div>

<div class="filters" role="navigation" aria-label="تصفية حسب المادة">
  <a href="{{ route('school.report', [$school, $section]) }}" class="{{ $d['subject'] ? '' : 'on' }}">كل المواد</a>
  @foreach ($d['subjects'] as $c => $x)<a href="{{ route('school.report', [$school, $section, 'subject' => $x['slug']]) }}" class="{{ $d['subject'] === $c ? 'on' : '' }}">{{ $x['name'] }}</a>@endforeach
  <a class="csv" href="{{ route('school.report', array_filter([$school, $section, 'subject' => $d['subject'] ? explode('-', $d['subject'])[1] : null, 'format' => 'csv'])) }}">تنزيل CSV</a>
</div>

<div class="kpis">
  <div class="kpi"><span class="ring" style="--p:{{ $s['week_pct'] }}"><i>{{ $ar::num($s['week_pct']) }}٪</i></span><b>{{ $ar::html($s['week']) }}<small class="muted" style="font-size:16px"> / {{ $ar::num($s['n']) }}</small></b><span>نشطون هذا الأسبوع</span></div>
  <div class="kpi"><b>{{ $ar::html($s['today']) }}</b><span>دخلوا اليوم</span></div>
  <div class="kpi"><span class="ring" style="--p:{{ $s['progress'] ?? 0 }}"><i>{{ $pc($s['progress']) }}</i></span><b>{{ $pc($s['progress']) }}</b><span>متوسط التقدّم{{ $d['subject'] ? ' — '.$d['subjects'][$d['subject']]['name'] : '' }}</span></div>
  <div class="kpi"><b>{{ $pc($s['acc']) }}</b><span>متوسط الإجابات الصحيحة</span></div>
  <div class="kpi {{ $s['idle3'] ? 'warn' : '' }}"><b>{{ $ar::html($s['idle3']) }}</b><span>غائبون ٣–٦ أيام</span></div>
  <div class="kpi {{ $s['idle7'] ? 'bad' : '' }}"><b>{{ $ar::html($s['idle7']) }}</b><span>غائبون ٧ أيام فأكثر أو لم يدخلوا</span></div>
</div>

@unless ($d['subject'])
<section class="card"><h2>المواد</h2><p class="sub">متوسط الشعبة لكل مادة.</p>
<table><thead><tr><th>المادة</th><th>فتحها</th><th>الدروس المنجزة (متوسط)</th><th>التقدّم</th><th>الصواب</th></tr></thead><tbody>
@foreach ($d['subjects'] as $c => $x)
<tr><td><a class="nm" href="{{ route('school.report', [$school, $section, 'subject' => $x['slug']]) }}">{{ $x['name'] }}</a></td><td>{{ $ar::num($x['opened']) }} / {{ $ar::num($s['n']) }}</td>
<td>{{ $ar::num($x['done']) }}@if($x['total']) <small class="muted">من {{ $ar::num($x['total']) }}</small>@endif</td>
<td><div class="cell"><div class="bar"><i style="width:{{ $x['pct'] ?? 0 }}%"></i></div><small>{{ $pc($x['pct']) }}</small></div></td><td>{{ $pc($x['acc']) }}</td></tr>
@endforeach</tbody></table></section>
@endunless

<section class="card"><h2>الحضور</h2><p class="sub">آخر ظهور بتوقيت فلسطين ({{ $tz === 'Asia/Gaza' ? 'Asia/Hebron' : $tz }}). الأصفر: ٣ أيام فأكثر، الأحمر: ٧ أيام فأكثر.</p>
<table><thead><tr><th>الطالب</th><th>الحالة</th><th>آخر ظهور</th><th class="hm">آخر ٧ أيام</th><th class="hm">دقائق الأسبوع</th></tr></thead><tbody>
@foreach ($d['rows'] as $r)
@php($lbl = ['today' => 'دخل اليوم', 'recent' => 'منذ '.$ar::num($r['idle']).' '.($r['idle'] == 1 ? 'يوم' : 'أيام'), 'idle3' => 'غائب '.$ar::num($r['idle']).' أيام', 'idle7' => 'غائب '.$ar::num($r['idle']).' '.($r['idle'] <= 10 ? 'أيام' : 'يومًا'), 'never' => 'لم يدخل بعد'][$r['status']])
<tr class="{{ $r['status'] }}"><td><a class="nm" href="{{ route('school.student', [$school, $r['id']]) }}">{{ $r['name'] }}</a></td><td><span class="tag t-{{ $r['status'] }}">{{ $lbl }}</span></td>
<td class="muted">{{ $when($r['last']) }}</td>
<td class="hm"><span class="days" aria-label="{{ $ar::num($r['week_days']) }} أيام نشاط">@for ($i = 6; $i >= 0; $i--)@php($dd = now($tz)->subDays($i)->format('Y-m-d'))<i class="{{ isset($r['days'][$dd]) || ($i === 0 && $r['today']) ? 'on' : '' }}" title="{{ $dd }}"></i>@endfor</span></td>
<td class="hm">{{ $ar::num($r['week_min']) }}</td></tr>
@endforeach</tbody></table></section>

<section class="card"><h2>التقدّم{{ $d['subject'] ? ' — '.$d['subjects'][$d['subject']]['name'] : ' في كل مادة' }}</h2><p class="sub">اضغط اسم الطالب لتفاصيل الدروس والأخطاء.</p>
<table><thead><tr><th>الطالب</th>
@if ($d['subject'])<th>الدروس المنجزة</th><th>التقدّم</th><th>الصواب</th><th class="hm">متوسط الاختبارات</th><th class="hm">آخر درس</th>
@else @foreach ($d['subjects'] as $x)<th>{{ $x['name'] }}</th>@endforeach<th>الصواب</th>@endif</tr></thead><tbody>
@foreach ($d['rows']->sortBy('name') as $r)
<tr><td><a class="nm" href="{{ route('school.student', [$school, $r['id']]) }}">{{ $r['name'] }}</a></td>
@if ($d['subject'])@php($x = $r['subjects'][$d['subject']])
<td>{{ $ar::num($x['done']) }}@if($x['total']) <small class="muted">/ {{ $ar::num($x['total']) }}</small>@endif</td>
<td><div class="cell"><div class="bar"><i style="width:{{ $x['pct'] ?? 0 }}%"></i></div><small>{{ $pc($x['pct']) }}</small></div></td>
<td class="{{ $x['acc'] !== null && $x['acc'] < 60 ? 'no' : '' }}">{{ $pc($x['acc']) }}</td><td class="hm">{{ $pc($x['quiz_avg']) }}</td><td class="hm muted">{{ $x['lessons'][0]['name'] ?? '—' }}</td>
@else
@foreach ($d['subjects'] as $c => $sx)@php($x = $r['subjects'][$c])
<td><div class="cell">@if($x['opened'])<div class="bar"><i style="width:{{ $x['pct'] ?? 0 }}%"></i></div><small>{{ $ar::num($x['done']) }} درسًا · {{ $pc($x['pct']) }}</small>@else<small>لم يفتحها</small>@endif</div></td>
@endforeach<td class="{{ $r['acc'] !== null && $r['acc'] < 60 ? 'no' : '' }}">{{ $pc($r['acc']) }}</td>
@endif</tr>
@endforeach</tbody></table></section>

<div class="cols">
<section class="card"><h2>أصعب الأسئلة</h2><p class="sub">أكثر الأسئلة التي أخطأ فيها طلاب الشعبة (آخر ٤٠ خطأ محفوظًا لكل طالب في كل مادة).</p>
<ul class="hq">@forelse ($d['questions'] as $h)
<li><q>{{ $h['q'] }}</q><div class="meta">{{ $h['subject'] }}@if($h['lesson']) · {{ $h['lesson'] }}@endif</div>
<div>أخطأ فيه <b>{{ $ar::num($h['n']) }}</b> {{ $h['n'] == 1 ? 'طالب' : 'طلاب' }} ({{ $ar::num($h['times']) }} مرة)@if($h['common']) · الإجابة الشائعة: <span class="no">{{ $h['common'] }}</span>@endif @if($h['c']) · الصحيحة: <span class="ok">{{ $h['c'] }}</span>@endif</div>
<div class="meta">{{ implode('، ', array_slice($h['students'], 0, 6)) }}</div></li>
@empty<li class="muted">لا أخطاء مسجّلة بعد.</li>@endforelse</ul></section>
<section class="card"><h2>أصعب الدروس</h2><p class="sub">أقل نسبة صواب (٥ إجابات فأكثر).</p>
<table><thead><tr><th>الدرس</th><th>الصواب</th><th class="hm">طلاب</th></tr></thead><tbody>
@forelse ($d['lessons'] as $l)<tr><td><b>{{ $l['lesson'] }}</b><br><small class="muted">{{ $l['subject'] }} · {{ $ar::num($l['answered']) }} إجابة</small></td>
<td><div class="cell"><div class="bar"><i style="width:{{ $l['acc'] }}%;background:{{ $l['acc'] < 60 ? '#d9534f' : 'var(--g)' }}"></i></div><small>{{ $ar::num($l['acc']) }}٪</small></div></td><td class="hm">{{ $ar::num($l['students']) }}</td></tr>
@empty<tr><td colspan="3" class="muted">لا بيانات كافية بعد.</td></tr>@endforelse</tbody></table></section>
</div>
@endsection
