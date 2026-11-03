@extends('school.layout')
@section('title', $h->title)
@section('head-end')<a class="btn ghost small" href="{{ route('school.tasks', [$school, $section]) }}">الواجبات</a>@endsection
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@section('css')
@include('school._dash')
@endsection
@section('content')
<div class="top2"><h1>{{ $h->title }}</h1><span class="chip grey">{{ $section->name }}</span></div>
<p class="sub">{{ \App\Support\SchoolStats::subjectName($h->subject) }} · التسليم: {{ $h->due_at ? $ar::date($h->due_at) : '—' }} @if($h->due_at && $h->due_at->isPast())<span class="tag t-recent">انتهى الموعد</span>@endif</p>
<div class="kpis">
<div class="kpi"><span class="ring" style="--p:{{ $sum['pct'] }}"><i>{{ $ar::num($sum['pct']) }}٪</i></span><b>{{ $ar::num($sum['done']) }}<small class="muted" style="font-size:16px"> / {{ $ar::num($sum['n']) }}</small></b><span>أنجزوا كل الدروس</span></div>
<div class="kpi {{ $sum['late'] ? 'bad' : '' }}"><b>{{ $ar::num($sum['late']) }}</b><span>متأخرون</span></div>
<div class="kpi"><b>{{ $pc($sum['score']) }}</b><span>متوسط العلامة</span></div>
</div>
<section class="card"><h2>الطلاب</h2><p class="sub">العلامة = أفضل نتيجة في اختبار الدرس داخل الموقع (تُحدَّث عند مزامنة جهاز الطالب).</p>
<table><thead><tr><th>الطالب</th><th>الحالة</th>@foreach ($h->items as $it)<th class="hm">{{ \Illuminate\Support\Str::limit($lessons[$it]['t'] ?? $it, 28) }}</th>@endforeach<th>المتوسط</th></tr></thead><tbody>
@foreach ($rows as $r)
<tr class="{{ $r['state'] === 'late' ? 'idle7' : '' }}"><td><a class="nm" href="{{ route('school.student', [$school, $r['id']]) }}">{{ $r['name'] }}</a></td>
<td><span class="tag t-{{ $r['state'] }}">{{ ['done' => 'أنجز', 'late' => 'متأخر', 'partial' => 'بدأ ('.$ar::num($r['done']).'/'.$ar::num($r['total']).')', 'todo' => 'لم يبدأ'][$r['state'] ] }}</span></td>
@foreach ($h->items as $it)<td class="hm">{!! $r['items'][$it] === null ? '<span class="muted">—</span>' : '<span class="ok">✓ '.e($ar::num($r['items'][$it])).'٪</span>' !!}</td>@endforeach
<td>{{ $pc($r['score']) }}</td></tr>
@endforeach</tbody></table></section>
<form method="post" action="{{ route('school.homework.delete', [$school, $section, $h->id]) }}" class="noprint" onsubmit="return confirm('حذف هذا الواجب؟')">@csrf<button class="btn ghost small">حذف الواجب</button></form>
@endsection
