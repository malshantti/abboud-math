@extends('school.layout')
@section('title', 'واجباتي')
@section('head-end')<a class="btn small" href="{{ $start }}">ابدأ التعلّم</a>@endsection
@section('css')
@include('school._kid')
@endsection
@section('content')
<h1>واجباتي @if($t['pending'])<span class="badge" aria-label="{{ $ar::num($t['pending']) }} مهام">{{ $ar::num($t['pending']) }}</span>@endif</h1>
<p class="sub">أهلًا {{ $s->name }}! هذه مهامك من معلّمك.</p>
@foreach ($t['quizzes'] as $x)@if($x['new'])
<div class="bn new" role="status">🔔 اختبار جديد: {{ $x['quiz']->title }}<a class="btn small" href="{{ route('school.take', [$school, $x['quiz']->id]) }}">افتحه</a></div>
@endif @endforeach
@foreach ($t['soon'] as $x)
<div class="bn soon" role="alert">⏰ يُغلق قريبًا: {{ $x['quiz']->title }} — {{ $ar::date($x['quiz']->ends_at) }}<a class="btn small" href="{{ route('school.take', [$school, $x['quiz']->id]) }}">ادخل الآن</a></div>
@endforeach

@if (! empty($mo) && $mo['me'])
<div class="task mo"><h3>⭐ نجومي هذا الأسبوع: {{ $ar::num($mo['me']['stars']) }}</h3>
<div class="meta">{{ $ar::num($mo['me']['days']) }} أيام تعلّم · {{ $ar::num($mo['me']['min']) }} دقيقة · نجمة لكل يوم تتعلّم فيه، ولكل ربع ساعة، ونجمتان لكل واجب تُكمله.</div>
@if (count($mo['titles']))<div class="it">🎉 أنت في لوحة الشرف: @foreach ($mo['titles'] as [$k, $tt])<span class="tag t-done">{{ $tt }}</span> @endforeach</div>
@elseif (count($mo['board']))<div class="it">في لوحة الشرف هذا الأسبوع: {{ collect($mo['board'])->take(5)->pluck('name')->implode('، ') }}. يمكنك الانضمام إليهم!</div>@endif
@foreach ($mo['challenges'] as $x)@php($mine = collect($x['st'])->first(fn ($r) => $r['sec']->id === $mo['section']->id))
<div class="it">🏆 تحدّي «{{ $x['c']->title }}»: شعبتك في المركز {{ $ar::num($mine['rank'] ?? 0) }} من {{ $ar::num(count($x['st'])) }} — حتى {{ $ar::num($x['c']->ends_on->format('Y/m/d')) }}.</div>
@endforeach</div>
@endif

<h2>الاختبارات</h2>
@forelse ($t['quizzes'] as $x)@php($q = $x['quiz'])
<div class="task"><h3>{{ $q->title }} @if($x['best'])<span class="tag t-done">أدّيته</span>@elseif($x['can'])<span class="tag t-new">مفتوح</span>@elseif($q->state() === 'soon')<span class="tag t-open">قريبًا</span>@else<span class="tag t-late">أُغلق</span>@endif</h3>
<div class="meta">{{ \App\Support\SchoolStats::subjectName($q->subject) }} · {{ $ar::num(count($q->questions)) }} سؤالًا · {{ $ar::num($q->duration_min) }} دقيقة · يُغلق {{ $q->ends_at ? $ar::date($q->ends_at) : '—' }}</div>
<div class="it">@if($x['best'] && $q->resultsVisible())علامتك: <b class="ok">{{ $ar::num($x['best']->score) }}٪</b>@elseif($x['best'])تظهر علامتك بعد إغلاق الاختبار.@elseif($q->state() === 'soon')يفتح {{ $ar::date($q->starts_at) }}@endif
@if($x['can'])<a class="btn" href="{{ route('school.take', [$school, $q->id]) }}">{{ $x['live'] ? 'أكمل الاختبار' : 'ابدأ الاختبار' }}</a>@elseif($x['best'] && $q->resultsVisible())<a class="btn ghost small" href="{{ route('school.result', [$school, $q->id]) }}">إجاباتي</a>@endif</div></div>
@empty<p class="muted">لا اختبارات الآن.</p>@endforelse

<h2>الواجبات</h2>
@forelse ($t['homework'] as $x)@php($h = $x['hw'])
<div class="task"><h3>{{ $h->title }} @if($x['row']['state'] === 'done')<span class="tag t-done">أنجزته ✓</span>@elseif($x['row']['state'] === 'late')<span class="tag t-late">متأخر</span>@endif</h3>
<div class="meta">{{ \App\Support\SchoolStats::subjectName($h->subject) }} · التسليم {{ $h->due_at ? $ar::date($h->due_at) : '—' }}</div>
@foreach ($x['items'] as $it)<div class="it"><span>{!! $it['done'] !== null ? '<span class="ok">✓</span>' : '○' !!} {{ $it['t'] }}@if($it['done'] !== null) <small class="muted">({{ $ar::num($it['done']) }}٪)</small>@endif</span><a class="btn {{ $it['done'] !== null ? 'ghost' : '' }} small" href="{{ $it['url'] }}">{{ $it['done'] !== null ? 'راجِع' : 'افتح الدرس' }}</a></div>@endforeach
</div>
@empty<p class="muted">لا واجبات الآن. أحسنت!</p>@endforelse
<p style="text-align:center;margin-top:18px"><a class="btn" href="{{ $start }}">إلى دروسي</a></p>
@endsection

@section('js')
<script>try{localStorage.setItem('bustan_school_kid',{!! json_encode($school->slug) !!})}catch(e){}</script>
@endsection
