@extends('school.layout')
@section('title', 'لوحة الشرف — '.$section->name)
@section('head-end')<button class="btn small" onclick="print()">طباعة</button><a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@php($ic = ['star' => '🌟', 'days' => '📅', 'time' => '⏱️', 'hw' => '✅'])
@section('css')
@include('school._dash')
.hb{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));margin:0 0 18px}
.hc{background:#fff;border:3px solid var(--sun);border-radius:20px;padding:14px;text-align:center}
.hc b{display:block;font:800 20px/1.3 Baloo,Cairo,sans-serif}.hc .st{font:800 26px Baloo,Cairo,sans-serif;color:#b37a00}
.hc .tt{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:6px}.hc .tt span{background:#fff4cf;border-radius:999px;padding:1px 9px;font-weight:800;font-size:13px}
.how{font-size:14px;color:var(--muted)}
@media print{.noprint,.tabs{display:none}.hc{break-inside:avoid}}
@endsection
@section('content')
<div class="top2"><h1>⭐ لوحة الشرف</h1><span class="chip grey">{{ $section->name }} · {{ $ar::grade($section->grade) }}</span>@if ($school->is_test)<span class="tag t-idle3">بيانات تجريبية للاختبار</span>@endif</div>
@include('school._nav', ['on' => 'honor'])
<form class="filters noprint"><a class="{{ $w ? '' : 'on' }}" href="?w=0">هذا الأسبوع</a><a class="{{ $w ? 'on' : '' }}" href="?w=1">الأسبوع الماضي</a></form>
<p class="sub">من السبت {{ $ar::num($h['from']->format('Y/m/d')) }} إلى الجمعة {{ $ar::num($h['to']->format('Y/m/d')) }} · النجوم للجهد والمثابرة فقط، لا للعلامات.</p>
<div class="kpis">
<div class="kpi"><b>{{ $ar::num($h['sum']['stars']) }}</b><span>نجمة جمعتها الشعبة</span></div>
<div class="kpi"><b>{{ $ar::num($h['sum']['active']) }}<small class="muted" style="font-size:16px"> / {{ $ar::num($h['sum']['n']) }}</small></b><span>تعلّموا هذا الأسبوع</span></div>
<div class="kpi"><b>{{ $ar::num($h['sum']['min']) }}</b><span>دقيقة تعلّم</span></div>
</div>
@if (count($h['board']))
<div class="hb">@foreach ($h['board'] as $x)<div class="hc"><b>{{ $x['name'] }}</b><div class="st">⭐ {{ $ar::num($x['stars']) }}</div><div class="tt">@foreach ($h['titles'][$x['id']] as [$k, $t])<span>{{ $ic[$k] }} {{ $t }}</span>@endforeach</div></div>@endforeach</div>
@else<section class="card"><p class="muted">لم يجمع أحد نجومًا بعد هذا الأسبوع. شجّعوا الطلاب على درس قصير اليوم!</p></section>@endif
<section class="card"><h2>نجوم الجميع</h2><table><thead><tr><th>الطالب</th><th>النجوم</th><th>أيام التعلّم</th><th class="hm">دقائق</th><th class="hm">واجبات أُنجزت</th><th class="hm">اختبارات أُدّيت</th></tr></thead><tbody>
@foreach ($h['rows'] as $x)<tr><td><b>{{ $x['name'] }}</b></td><td>⭐ {{ $ar::num($x['stars']) }}</td><td>{{ $ar::num($x['days']) }}</td><td class="hm">{{ $ar::num($x['min']) }}</td><td class="hm">{{ $ar::num($x['hw']) }}/{{ $ar::num($x['hw_n']) }}</td><td class="hm">{{ $ar::num($x['quiz']) }}</td></tr>@endforeach
</tbody></table>
<p class="how">كيف تُحسب النجوم: نجمة لكل يوم تعلّم، ونجمة لكل {{ $ar::count(\App\Support\SchoolMotivation::MIN_PER_STAR, 'دقيقة') }} (حتى ٨ في الأسبوع)، ونجمتان لكل واجب مكتمل، ونجمة لكل اختبار أدّاه الطالب — مهما كانت علامته.</p></section>
@endsection
