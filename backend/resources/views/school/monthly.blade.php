@extends('school.layout')
@php($months = ['', 'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'])
@php($mName = $months[(int) $from->format('n')].' '.$ar::num($from->format('Y')))
@section('title', 'التقرير الشهري — '.$mName)
@section('head-end')<button class="btn small" onclick="print()">طباعة / حفظ PDF</button><a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@section('css')
@include('school._dash')
.rep-h{border-bottom:3px solid var(--g);margin:0 0 14px;padding:0 0 8px}
@media print{.sh{padding:0 0 8px}h2{font-size:17px}table{font-size:12px}@page{size:A4;margin:12mm}}
@endsection
@section('content')
<div class="rep-h"><h1>التقرير الشهري{{ $one ? ' — '.$sections[0]['sec']->name : '' }}</h1><p class="sub" style="margin:0">{{ $mName }} · من {{ $ar::num($from->format('Y/m/d')) }} إلى {{ $ar::num($to->format('Y/m/d')) }} · أُعدّ في {{ $ar::date(now()) }}@if($school->is_test) · <b>بيانات تجريبية للاختبار</b>@endif</p></div>
<form class="filters noprint" method="get">@if($one)<input type="hidden" name="section" value="{{ $sections[0]['sec']->id }}">@endif
@for ($i = 0; $i < 6; $i++)@php($mm = now(\App\Support\SchoolStats::tz())->startOfMonth()->subMonths($i))<a class="{{ $mm->format('Y-m') === $m ? 'on' : '' }}" href="?{{ http_build_query(array_filter(['m' => $mm->format('Y-m'), 'section' => $one ? $sections[0]['sec']->id : null])) }}">{{ $months[(int) $mm->format('n')] }}</a>@endfor
</form>
<div class="kpis">
<div class="kpi"><span class="ring" style="--p:{{ $sum['active_pct'] }}"><i>{{ $ar::num($sum['active_pct']) }}٪</i></span><b>{{ $ar::num($sum['active']) }}<small class="muted" style="font-size:16px"> / {{ $ar::num($sum['n']) }}</small></b><span>تعلّموا هذا الشهر</span></div>
<div class="kpi"><b>{{ $ar::num($sum['min']) }}</b><span>دقيقة تعلّم</span></div>
<div class="kpi"><b>{{ $pc($sum['hw_pct']) }}</b><span>إنجاز الواجبات ({{ $ar::num($sum['hw_n']) }})</span></div>
<div class="kpi"><b>{{ $pc($sum['quiz_avg']) }}</b><span>متوسط الاختبارات ({{ $ar::num($sum['quiz_n']) }})</span></div>
</div>
@if (! $one && count($sections) > 1)
<section class="card"><h2>الشعب</h2><table><thead><tr><th>الشعبة</th><th>تعلّموا</th><th>دقائق</th><th>التقدّم</th><th>الواجبات</th><th>الاختبارات</th></tr></thead><tbody>
@foreach ($sections as $x)<tr><td><b>{{ $x['sec']->name }}</b></td><td>{{ $ar::num($x['active']) }}/{{ $ar::num($x['n']) }} ({{ $pc($x['active_pct']) }})</td><td>{{ $ar::num($x['min']) }}</td><td>{{ $pc($x['progress']) }}</td><td>{{ $pc($x['hw_pct']) }}</td><td>{{ $pc($x['quiz_avg']) }}</td></tr>@endforeach
</tbody></table></section>
@endif
@foreach ($sections as $x)
<section class="card" style="break-before:{{ $loop->first ? 'auto' : 'page' }}"><h2>{{ $x['sec']->name }} · {{ $ar::grade($x['sec']->grade) }}</h2>
<p class="sub">تعلّم {{ $ar::num($x['active']) }} من {{ $ar::num($x['n']) }} · {{ $ar::count($x['min'], 'دقيقة') }} · متوسط التقدّم {{ $pc($x['progress']) }} · الصواب {{ $pc($x['acc']) }}</p>
<div class="cols">
<div><h3>الأكثر اجتهادًا</h3><ol>@forelse ($x['top'] as $t)<li><b>{{ $t['name'] }}</b> — {{ $ar::count($t['days'], 'يوم') }}، {{ $ar::count($t['min'], 'دقيقة') }}</li>@empty<li class="muted">لا نشاط مسجّل هذا الشهر.</li>@endforelse</ol></div>
<div><h3>دروس تحتاج مراجعة</h3><ul>@forelse (array_slice($x['weak'], 0, 4) as $l)<li>{{ $l['lesson'] }} <small class="muted">({{ $l['subject'] }} · {{ $ar::num($l['acc']) }}٪)</small></li>@empty<li class="muted">لا بيانات كافية.</li>@endforelse</ul></div>
</div>
<h3>الواجبات</h3>
<table><thead><tr><th>الواجب</th><th>التسليم</th><th>أنجزوه</th><th>متأخرون</th><th>المتوسط</th></tr></thead><tbody>
@forelse ($x['hw'] as $h)<tr><td>{{ $h['hw']->title }}</td><td class="muted">{{ $ar::date($h['hw']->due_at) }}</td><td>{{ $ar::num($h['sum']['done']) }}/{{ $ar::num($h['sum']['n']) }} ({{ $pc($h['sum']['pct']) }})</td><td>{{ $ar::num($h['sum']['late']) }}</td><td>{{ $pc($h['sum']['score']) }}</td></tr>
@empty<tr><td colspan="5" class="muted">لا واجبات مستحقة هذا الشهر.</td></tr>@endforelse</tbody></table>
<h3>الاختبارات</h3>
<table><thead><tr><th>الاختبار</th><th>أُغلق</th><th>أدّوه</th><th>المتوسط</th></tr></thead><tbody>
@forelse ($x['qz'] as $q)<tr><td>{{ $q['quiz']->title }}</td><td class="muted">{{ $ar::date($q['quiz']->ends_at) }}</td><td>{{ $ar::num($q['res']['sum']['took']) }}/{{ $ar::num($q['res']['sum']['n']) }}</td><td>{{ $pc($q['res']['sum']['avg']) }}</td></tr>
@empty<tr><td colspan="4" class="muted">لا اختبارات هذا الشهر.</td></tr>@endforelse</tbody></table>
<h3>الطلاب</h3>
<table><thead><tr><th>الطالب</th><th>أيام</th><th>دقائق</th><th>التقدّم</th><th>واجبات</th><th>اختبارات</th><th class="noprint">تقرير الأهل</th></tr></thead><tbody>
@foreach ($x['students'] as $s)<tr><td>{{ $s['name'] }}</td><td>{{ $ar::num($s['days']) }}</td><td>{{ $ar::num($s['min']) }}</td><td>{{ $pc($s['progress']) }}</td><td>{{ $ar::num($s['hw']) }}/{{ $ar::num($x['hw']->count()) }}</td><td>{{ $pc($s['quiz']) }}</td>
<td class="noprint"><a href="{{ route('school.family', [$school, $s['id'], 'm' => $m]) }}">فتح</a></td></tr>@endforeach
</tbody></table></section>
@endforeach
@endsection
