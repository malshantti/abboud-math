@extends('layouts.manage')
@section('title', 'بنك الأسئلة')
@section('content')
<div class="head"><h1>بنك الأسئلة</h1><a class="btn small" href="{{ route('manage.questions.create', ['grade'=>$grade,'subject'=>$subject,'lesson'=>$lesson]) }}">@include('partials.admin-icon',['name'=>'plus'])سؤال جديد</a></div>
<p class="lead">أسئلة الاختيار من متعدد لكل درس. السؤال <b>المفعّل</b> يظهر للطلاب فورًا في تدريب الدرس واختباره، وبقية الأسئلة تبقى من مولّد الدرس كما هي. «العيّنات» أمثلة صدّرناها من مولّد الدرس، وهي موقوفة حتى تراجعها وتفعّلها. إن تعذّر الوصول إلى البنك تعمل الصفحات بأسئلتها الأصلية.</p>
@if (session('status'))<p class="alert ok" role="status">{{ session('status') }}</p>@endif
@if ($errors->any())<p class="alert err" role="alert">{{ $errors->first() }}</p>@endif
@unless ($live)<div class="note">@include('partials.admin-icon',['name'=>'alert'])<p>صفحات {{ $ar::grade($grade) }} — {{ $subjects[$subject] ?? $subject }} لا تقرأ من البنك بعد؛ يمكنك تجهيز الأسئلة، لكنها لن تظهر للطلاب حتى تُربط هذه المادة.</p></div>@endunless
<form class="filters" method="get">
  <div><label for="grade">الصف</label><select id="grade" name="grade">@foreach (\App\Models\Setting::gradeOptions() as $g => $l)<option value="{{ $g }}" @selected($grade === $g)>{{ $l }}</option>@endforeach</select></div>
  <div><label for="subject">المادة</label><select id="subject" name="subject">@foreach ($subjects as $k => $l)<option value="{{ $k }}" @selected($subject === $k)>{{ $l }}</option>@endforeach</select></div>
  <div><label for="lesson">الدرس</label><select id="lesson" name="lesson"><option value="">كل الدروس</option>@foreach ($lessons as $l)<option value="{{ $l->lesson }}" @selected($lesson === $l->lesson)>{{ $l->title ?: $l->lesson }} ({{ $ar::html($l->live) }}/{{ $ar::html($l->n) }})</option>@endforeach</select></div>
  <div><label for="state">الحالة</label><select id="state" name="state"><option value="">الكل</option><option value="live" @selected(request('state')==='live')>مفعّلة</option><option value="off" @selected(request('state')==='off')>موقوفة</option></select></div>
  <div><label for="q">بحث في النص</label><input id="q" name="q" value="{{ request('q') }}"></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div>
</form>
@if ($lesson !== '')
<form method="post" action="{{ route('manage.questions.mode') }}" class="filters" style="margin-top:-6px">@csrf<input type="hidden" name="grade" value="{{ $grade }}"><input type="hidden" name="subject" value="{{ $subject }}"><input type="hidden" name="lesson" value="{{ $lesson }}">
  <div><label for="mode">كيف تظهر أسئلة البنك في هذا الدرس؟</label><select id="mode" name="mode">@foreach (\App\Models\Question::MODES as $k => $l)<option value="{{ $k }}" @selected(($modes[$lesson] ?? 'mix') === $k)>{{ $l }}</option>@endforeach</select></div>
  <div class="go"><button class="btn ghost small" type="submit">حفظ الوضع</button></div>
</form>
@endif
<div class="table-wrap stack"><table>
<thead><tr><th>الدرس</th><th>السؤال</th><th>الإجابة الصحيحة</th><th>الخيارات</th><th>الحالة</th><th></th></tr></thead><tbody>
@forelse ($rows as $r)
@php($ok = collect($r->choices)->firstWhere('ok', true))
<tr><td data-label="الدرس"><span class="chip grey" dir="ltr">{{ $r->lesson }}</span>@if($r->lesson_title)<br><small>{{ $r->lesson_title }}</small>@endif</td>
<td data-label="السؤال">{{ \Illuminate\Support\Str::limit($r->q, 140) }}@if($r->image) <span class="chip">صورة</span>@endif</td>
<td data-label="الإجابة الصحيحة"><b>{{ $ok['t'] ?? '—' }}</b></td>
<td data-label="الخيارات">{{ $ar::html(count($r->choices)) }}</td>
<td data-label="الحالة">@if($r->active)<span class="chip">مفعّل</span>@else<span class="chip grey">موقوف</span>@endif @if($r->origin==='sample')<br><small>عيّنة من المولّد</small>@endif</td>
<td class="actions"><a class="btn ghost small" href="{{ route('manage.questions.edit', $r) }}">تعديل</a>
<form method="post" action="{{ route('manage.questions.toggle', $r) }}" style="display:inline">@csrf<button class="btn ghost small" type="submit">{{ $r->active ? 'إيقاف' : 'تفعيل' }}</button></form></td></tr>
@empty<tr><td colspan="6" class="empty">لا أسئلة هنا بعد.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $rows])
@if ($pairs->count())<p class="hint" style="margin-top:14px">في البنك: @foreach ($pairs as $p){{ $ar::grade($p->grade) }} — {{ $subjects[$p->subject] ?? $p->subject }}: {{ $ar::html($p->live) }} مفعّل من {{ $ar::html($p->n) }}@if(!$loop->last)، @endif @endforeach</p>@endif
@endsection
