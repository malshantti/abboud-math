@extends('school.layout')
@php($months = ['', 'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'])
@php($mName = $months[(int) $from->format('n')].' '.$ar::num($from->format('Y')))
@section('title', 'تقرير '.$student->name.' — '.$mName)
@section('head-end')<button class="btn small" onclick="print()">طباعة / حفظ PDF</button><a class="btn ghost small" href="{{ route('school.monthly', [$school, 'section' => $section->id, 'm' => $m]) }}">التقرير الشهري</a>@endsection
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@section('css')
@include('school._dash')
.rep-h{border-bottom:3px solid var(--g);margin:0 0 14px;padding:0 0 8px}.note{background:var(--gl);border-radius:16px;padding:12px 14px;margin:0 0 14px;font-size:17px}
@media print{@page{size:A4;margin:12mm}.sh{padding:0 0 8px}}
@endsection
@section('content')
<div class="rep-h"><h1>تقرير شهري إلى الأهل</h1><p class="sub" style="margin:0"><b>{{ $student->name }}</b> · {{ $section->name }} · {{ $ar::grade($section->grade) }} · {{ $mName }}@if($school->is_test) · <b>بيانات تجريبية للاختبار</b>@endif</p></div>
<div class="note">أهلنا الكرام، هذا ملخّص تعلّم {{ $student->name }} على منصّة بستان التعلّم خلال {{ $mName }}، من بيانات الموقع نفسه.</div>
<div class="kpis">
<div class="kpi"><b>{{ $ar::num($effort['days']) }}</b><span>أيام تعلّم هذا الشهر</span></div>
<div class="kpi"><b>{{ $ar::num($effort['min']) }}</b><span>دقيقة تعلّم</span></div>
<div class="kpi"><b>{{ $pc($r['progress']) }}</b><span>التقدّم في المنهاج</span></div>
<div class="kpi"><b>{{ $pc($r['acc']) }}</b><span>الإجابات الصحيحة</span></div>
</div>
<section class="card"><h2>المواد</h2><table><thead><tr><th>المادة</th><th>الدروس المنجزة</th><th>التقدّم</th><th>الصواب</th></tr></thead><tbody>
@foreach ($r['subjects'] as $x)<tr><td><b>{{ $x['name'] }}</b></td><td>{{ $ar::num($x['done']) }}@if($x['total']) <small class="muted">من {{ $ar::num($x['total']) }}</small>@endif</td><td><div class="cell"><div class="bar"><i style="width:{{ $x['pct'] ?? 0 }}%"></i></div><small>{{ $pc($x['pct']) }}</small></div></td><td>{{ $pc($x['acc']) }}</td></tr>@endforeach
</tbody></table></section>
<div class="cols">
<section class="card"><h2>الواجبات</h2><table><tbody>
@forelse ($hw as $h)<tr><td>{{ $h['hw']->title }}<br><small class="muted">{{ $ar::date($h['hw']->due_at) }}</small></td><td><span class="tag t-{{ $h['row']['state'] }}">{{ ['done' => 'أنجزه', 'late' => 'لم يُنجَز', 'partial' => 'جزئيًا', 'todo' => 'لم يبدأ'][$h['row']['state']] }}</span></td><td>{{ $pc($h['row']['score']) }}</td></tr>
@empty<tr><td class="muted">لا واجبات هذا الشهر.</td></tr>@endforelse</tbody></table></section>
<section class="card"><h2>الاختبارات</h2><table><tbody>
@forelse ($quizzes as $q)<tr><td>{{ $q['quiz']->title }}<br><small class="muted">{{ $ar::date($q['quiz']->ends_at) }}</small></td><td>{!! $q['best'] ? '<b>'.e($ar::num($q['best']->score)).'٪</b>' : '<span class="no">لم يؤدِّه</span>' !!}</td></tr>
@empty<tr><td class="muted">لا اختبارات هذا الشهر.</td></tr>@endforelse</tbody></table></section>
</div>
<div class="cols">
<section class="card"><h2>نقاط قوّة</h2><ul>@forelse ($strong as $l)<li>{{ $l['name'] }} <small class="muted">({{ $l['subject'] }} · {{ $ar::num($l['pct']) }}٪)</small></li>@empty<li class="muted">نحتاج نشاطًا أكثر لنعرفها.</li>@endforelse</ul></section>
<section class="card"><h2>يحتاج تدريبًا في البيت</h2><ul>@forelse ($practice as $l)<li>{{ $l['name'] }} <small class="muted">({{ $l['subject'] }} · {{ $ar::num($l['pct']) }}٪)</small></li>@empty<li class="muted">لا دروس ضعيفة واضحة. أحسن!</li>@endforelse</ul></section>
</div>
<p class="sub">نشكر متابعتكم. يمكن لـ{{ $student->name }} الدخول من رابط المدرسة بالرقم السري المطبوع على بطاقته.</p>
@endsection
