@extends('school.layout')
@section('title', 'نتائج: '.$q->title)
@section('head-end')<a class="btn ghost small" href="{{ route('school.tasks', [$school, $section]) }}">الواجبات والاختبارات</a>@endsection
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@php($tz = \App\Support\SchoolStats::tz())
@php($s = $res['sum'])
@section('css')
@include('school._dash')
@endsection
@section('content')
<div class="top2"><h1>{{ $q->title }}</h1><span class="chip grey">{{ $section->name }}</span><span class="tag {{ ['open' => 't-done', 'soon' => 't-todo', 'closed' => 't-recent'][$q->state()] }}">{{ ['open' => 'مفتوح', 'soon' => 'لم يبدأ', 'closed' => 'مغلق'][$q->state()] }}</span></div>
<p class="sub">{{ \App\Support\SchoolStats::subjectName($q->subject) }} · يفتح {{ $q->starts_at ? $ar::date($q->starts_at) : '—' }} · يغلق {{ $q->ends_at ? $ar::date($q->ends_at) : '—' }} · {{ $ar::num($q->duration_min) }} دقيقة · {{ $ar::num($q->attempts) }} {{ $q->attempts == 1 ? 'محاولة' : 'محاولات' }} · {{ $q->shuffle ? 'مخلوط' : 'دون خلط' }} · النتيجة {{ $q->show_results === 'now' ? 'فور التسليم' : 'بعد الإغلاق' }}</p>
<div class="filters"><a class="csv" href="{{ route('school.quiz', [$school, $section, $q->id, 'format' => 'csv']) }}">تنزيل CSV</a></div>
<div class="kpis">
<div class="kpi"><span class="ring" style="--p:{{ $s['pct'] }}"><i>{{ $ar::num($s['pct']) }}٪</i></span><b>{{ $ar::num($s['took']) }}<small class="muted" style="font-size:16px"> / {{ $ar::num($s['n']) }}</small></b><span>أدّوا الاختبار</span></div>
<div class="kpi"><b>{{ $pc($s['avg']) }}</b><span>متوسط العلامة</span></div>
<div class="kpi {{ count($res['missing']) ? 'warn' : '' }}"><b>{{ $ar::num(count($res['missing'])) }}</b><span>لم يؤدّوه</span></div>
</div>
<section class="card"><h2>نتائج الطلاب</h2><p class="sub">أفضل محاولة لكل طالب. الوقت بتوقيت فلسطين. «مغادرة الصفحة» = عدد مرات ترك صفحة الاختبار أثناء الحل.</p>
<table><thead><tr><th>الطالب</th><th>العلامة</th><th class="hm">صحيح</th><th>الوقت</th><th class="hm">سلّم</th><th>مغادرة الصفحة</th><th></th></tr></thead><tbody>
@foreach ($res['rows'] as $r)@php($b = $r['best'])
<tr class="{{ ! $b && ! $r['live'] ? 'idle3' : '' }}"><td><b>{{ $r['name'] }}</b></td>
@if ($b)
<td class="{{ $b->score < 50 ? 'no' : 'ok' }}">{{ $ar::num($b->score) }}٪</td><td class="hm">{{ $ar::num($b->correct) }} / {{ $ar::num($b->total) }}</td>
<td>{{ $ar::num((int) ceil($b->seconds() / 60)) }} د</td><td class="hm muted">{{ $b->submitted_at->copy()->timezone($tz)->format('m/d H:i') }}@if($b->auto_submitted) <span class="tag t-idle3">تلقائي</span>@endif</td>
<td class="{{ $r['tabs'] >= 3 ? 'no' : '' }}">{{ $ar::num($r['tabs']) }}</td><td><a href="{{ route('school.attempt', [$school, $section, $q->id, $b->id]) }}">الإجابات</a></td>
@elseif ($r['live'])<td colspan="6"><span class="tag t-partial">يحلّ الآن</span></td>
@else<td colspan="6"><span class="tag t-late">لم يؤدِّه</span></td>@endif</tr>
@endforeach</tbody></table></section>
<section class="card"><h2>تحليل الأسئلة</h2><p class="sub">نسبة الإجابة الصحيحة لكل سؤال، وأكثر إجابة خاطئة.</p>
<table><thead><tr><th>#</th><th>السؤال</th><th>الصواب</th><th class="hm">الإجابة الشائعة الخاطئة</th></tr></thead><tbody>
@foreach ($res['questions'] as $i => $p)
<tr><td>{{ $ar::num($i + 1) }}</td><td>{{ $p['q']['q'] }} @if($p['q']['src'] === 'teacher')<span class="tag mine">من إعداد المعلّم</span>@else<span class="tag bankt">الكتاب{{ ! empty($p['q']['pg']) ? ' ص '.$ar::num($p['q']['pg']) : '' }}</span>@endif<br><small class="muted">الصحيحة: <span class="ok">{{ \App\Support\SchoolTasks::rightText($p['q']) }}</span></small></td>
<td><div class="cell"><div class="bar"><i style="width:{{ $p['pct'] ?? 0 }}%;background:{{ ($p['pct'] ?? 100) < 50 ? '#d9534f' : 'var(--g)' }}"></i></div><small>{{ $pc($p['pct']) }}</small></div></td>
<td class="hm">@if($p['answers'])<span class="no">{{ array_key_first($p['answers']) }}</span> <small class="muted">({{ $ar::num(reset($p['answers'])) }})</small>@else — @endif</td></tr>
@endforeach</tbody></table></section>
@if ($res['missing'])<section class="card"><h2>لم يؤدّوا الاختبار</h2><p>{{ collect($res['missing'])->pluck('name')->implode('، ') }}</p></section>@endif
<form method="post" action="{{ route('school.quiz.delete', [$school, $section, $q->id]) }}" class="noprint" onsubmit="return confirm('حذف الاختبار ونتائجه؟')">@csrf<button class="btn ghost small">حذف الاختبار</button></form>
@endsection
