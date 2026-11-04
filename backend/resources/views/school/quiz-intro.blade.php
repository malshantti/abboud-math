@extends('school.layout')
@section('title', $q->title)
@section('head-end')<a class="btn ghost small" href="{{ route('school.me', $school) }}">واجباتي</a>@endsection
@section('css')
@include('school._kid')
@endsection
@section('content')
<div class="task">
<h1>{{ $q->title }}</h1>
<p class="sub">{{ \App\Support\SchoolStats::subjectName($q->subject) }} · {{ $ar::count(count($q->questions), 'سؤال') }} · {{ $ar::count($q->duration_min, 'دقيقة') }} · يُغلق {{ $q->ends_at ? $ar::date($q->ends_at) : '—' }}</p>
@if ($errors->has('quiz'))<div class="alert err">{{ $errors->first('quiz') }}</div>@endif
@if ($done)
  @if ($q->resultsVisible())<p style="font-size:22px">علامتك: <b class="ok">{{ $ar::num($done->score) }}٪</b> ({{ $ar::num($done->correct) }} من {{ $ar::num($done->total) }})@if($done->auto_submitted) <small class="muted">— سُلّم تلقائيًا عند انتهاء الوقت</small>@endif</p><a class="btn ghost" href="{{ route('school.result', [$school, $q->id]) }}">إجاباتي</a>
  @else<p style="font-size:20px">✓ سُلّم اختبارك. تظهر العلامة بعد إغلاق الاختبار.</p>@endif
@endif
@if ($q->state() === 'open' && $left > 0)
<ul><li>عندك {{ $ar::count($q->duration_min, 'دقيقة') }} من لحظة البدء، والعدّاد يعمل حتى لو أغلقت الصفحة.</li><li>يُسلَّم تلقائيًا عند انتهاء الوقت.</li><li>ابقَ في صفحة الاختبار حتى تنتهي.</li>@if($left == 1)<li>هذه محاولتك الوحيدة{{ $done ? ' المتبقية' : '' }}.</li>@else<li>بقي لك {{ $ar::count($left, 'محاولة') }}.</li>@endif</ul>
<form method="post" action="{{ route('school.begin', [$school, $q->id]) }}">@csrf<button class="btn" style="font-size:20px">ابدأ الآن</button></form>
@elseif ($q->state() === 'soon')<p>يفتح الاختبار {{ $ar::date($q->starts_at) }}.</p>
@elseif (! $done)<p class="no">{{ $q->state() === 'closed' ? 'أُغلق الاختبار.' : 'لا محاولات متبقية.' }}</p>@endif
</div>
@endsection
