@extends('school.layout')
@section('title', $q->title.' — '.$a->student->name)
@section('head-end')@if($staff)<a class="btn ghost small" href="{{ route('school.quiz', [$school, $section, $q->id]) }}">النتائج</a>@else<a class="btn ghost small" href="{{ route('school.me', $school) }}">واجباتي</a>@endif @endsection
@section('css')
@include('school._dash')
@include('school._media')
.rq{border:2px solid var(--line);border-radius:16px;padding:12px;margin:0 0 10px;background:#fff}.rq.y{border-color:#9fd27a}.rq.n{border-color:#eba59f}
@endsection
@section('content')
<h1>{{ $q->title }}</h1>
<p class="sub">{{ $a->student->name }} · العلامة <b>{{ $ar::num($a->score) }}٪</b> ({{ $ar::num($a->correct) }} من {{ $ar::num($a->total) }}) · {{ $ar::num((int) ceil(($a->seconds() ?? 0) / 60)) }} دقيقة @if($staff) · مغادرة الصفحة: {{ $ar::num($a->tab_switches) }}@if($a->auto_submitted) · سُلّم تلقائيًا عند انتهاء الوقت@endif @endif</p>
@foreach ($a->layout as $n => [$qi, $opts])@php($x = $q->questions[$qi])@php($v = $a->answers[$qi] ?? null)@php($ok = \App\Support\SchoolTasks::isRight($x, $v))
<div class="rq {{ $ok ? 'y' : 'n' }}"><b>{{ $ar::num($n + 1) }}.</b> {!! \App\Support\SchoolTasks::qHtml($school, $x) !!} @if($x['src'] === 'teacher')<span class="tag mine">من إعداد المعلّم</span>@endif
<div>إجابته: <span class="{{ $ok ? 'ok' : 'no' }}">{!! $v === null ? 'دون إجابة' : \App\Support\SchoolTasks::answerHtml($school, $x, $v) !!} {{ $ok ? '✓' : '✗' }}</span>@unless($ok) · الصحيحة: <span class="ok">{!! \App\Support\SchoolTasks::rightHtml($school, $x) !!}</span>@endunless</div></div>
@endforeach
@endsection
