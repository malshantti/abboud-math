@extends('school.layout')
@section('title', 'الواجبات والاختبارات — '.$section->name)
@section('head-end')<a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@php($pc = fn ($v) => $v === null ? '—' : $ar::num($v).'٪')
@php($dt = fn ($d) => $d ? $ar::date($d) : '—')
@section('css')
@include('school._dash')
@endsection
@section('content')
<div class="top2"><h1>{{ $section->name }}</h1><span class="chip grey">{{ $ar::grade($section->grade) }}</span>@if ($school->is_test)<span class="tag t-idle3">بيانات تجريبية للاختبار</span>@endif</div>
@include('school._nav', ['on' => 'tasks'])

<div class="actions noprint" style="margin:0 0 14px">
  <a class="btn" href="{{ route('school.quiz.new', [$school, $section]) }}">+ اختبار جديد</a>
  <a class="btn ghost" href="#new-hw" onclick="document.getElementById('new-hw').open=true">+ واجب جديد</a>
</div>

@if (! $courses)
<div class="alert">لا يوجد بنك أسئلة من الكتاب لهذا الصف بعد. يمكنك كتابة أسئلتك في الاختبار.</div>
@endif

<details class="card" id="new-hw" @if($errors->has('items')) open @endif style="margin:0 0 18px"><summary style="font-weight:800;cursor:pointer;font-size:19px">واجب جديد: دروس من الكتاب</summary>
<form method="post" action="{{ route('school.homework.store', [$school, $section]) }}" style="margin-top:10px">@csrf
<div class="f2">
<label>المادة<select name="subject" id="hw-subj" required>@foreach ($courses as $c => $n)<option value="{{ $c }}">{{ $n }}</option>@endforeach</select></label>
<label>موعد التسليم (بتوقيت فلسطين)<input type="datetime-local" name="due" required value="{{ now(\App\Support\SchoolStats::tz())->addDays(3)->setTime(20, 0)->format('Y-m-d\TH:i') }}"></label>
<label>العنوان (اختياري)<input name="title" maxlength="120" placeholder="مثل: واجب الأسبوع"></label>
</div>
<p class="sub" style="margin-top:10px">اختر الدروس أو اختبار الوحدة. يُحسب الواجب منجزًا عندما يُنهي الطالب اختبار الدرس في الموقع.</p>
<div id="hw-list" class="muted">جارٍ تحميل الدروس…</div>
<button class="btn" style="margin-top:10px">إرسال الواجب للشعبة</button>
</form></details>

<section class="card"><h2>الاختبارات</h2>
<table><thead><tr><th>الاختبار</th><th>الحالة</th><th class="hm">يفتح</th><th>يغلق</th><th>أدّوه</th><th>المتوسط</th></tr></thead><tbody>
@forelse ($quizzes as $x)@php($q = $x['quiz'])@php($st = $q->state())
<tr><td><a class="nm" href="{{ route('school.quiz', [$school, $section, $q->id]) }}">{{ $q->title }}</a><br><small class="muted">{{ \App\Support\SchoolStats::subjectName($q->subject) }} · {{ $ar::count(count($q->questions), 'سؤال') }} · {{ $ar::count($q->duration_min, 'دقيقة') }}</small></td>
<td><span class="tag {{ ['open' => 't-done', 'soon' => 't-todo', 'closed' => 't-recent'][$st] }}">{{ ['open' => 'مفتوح', 'soon' => 'لم يبدأ', 'closed' => 'مغلق'][$st] }}</span></td>
<td class="hm muted">{{ $dt($q->starts_at) }}</td><td class="muted">{{ $dt($q->ends_at) }}</td>
<td>{{ $ar::num($x['sum']['took']) }} / {{ $ar::num($x['sum']['n']) }}</td><td>{{ $pc($x['sum']['avg']) }}</td></tr>
@empty<tr><td colspan="6" class="muted">لا اختبارات بعد.</td></tr>@endforelse</tbody></table></section>

<section class="card"><h2>الواجبات</h2>
<table><thead><tr><th>الواجب</th><th>التسليم</th><th>أنجزوه</th><th>متأخرون</th><th class="hm">المتوسط</th></tr></thead><tbody>
@forelse ($homework as $x)@php($h = $x['hw'])
<tr><td><a class="nm" href="{{ route('school.homework', [$school, $section, $h->id]) }}">{{ $h->title }}</a><br><small class="muted">{{ \App\Support\SchoolStats::subjectName($h->subject) }} · {{ $ar::num(count($h->items)) }} {{ count($h->items) == 1 ? 'درس' : 'دروس' }}</small></td>
<td class="muted">{{ $dt($h->due_at) }}</td>
<td><div class="cell"><div class="bar"><i style="width:{{ $x['sum']['pct'] }}%"></i></div><small>{{ $ar::num($x['sum']['done']) }} / {{ $ar::num($x['sum']['n']) }}</small></div></td>
<td class="{{ $x['sum']['late'] ? 'no' : '' }}">{{ $ar::num($x['sum']['late']) }}</td><td class="hm">{{ $pc($x['sum']['score']) }}</td></tr>
@empty<tr><td colspan="5" class="muted">لا واجبات بعد.</td></tr>@endforelse</tbody></table></section>
@endsection
@section('js')
<script>
(()=>{const sel=document.getElementById('hw-subj'),box=document.getElementById('hw-list');if(!sel)return;const base={!! json_encode(route('school.bank', [$school, $section, 'CODE'])) !!};const cache={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function load(){const c=sel.value;box.textContent='جارٍ تحميل الدروس…';try{cache[c]=cache[c]||(await (await fetch(base.replace('CODE',c),{headers:{Accept:'application/json'}})).json()).units;
box.innerHTML=cache[c].map(u=>`<details class="u"><summary>${esc(u.t)}</summary><label class="chk"><input type="checkbox" name="items[]" value="T:${esc(u.id)}"> <span><b>اختبار الوحدة</b></span></label>${u.les.map(l=>`<label class="chk"><input type="checkbox" name="items[]" value="${esc(l.id)}"> <span>${esc(l.t)}</span></label>`).join('')}</details>`).join('')}catch(e){box.textContent='تعذّر التحميل. حدّث الصفحة.'}}
sel.addEventListener('change',load);document.getElementById('new-hw').addEventListener('toggle',function(){if(this.open&&!box.dataset.l){box.dataset.l=1;load()}},{once:false});if(document.getElementById('new-hw').open){box.dataset.l=1;load()}})();
</script>
@endsection
