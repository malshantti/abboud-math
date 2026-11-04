@extends('school.layout')
@section('title', 'معاينة: '.$title)
@section('css')
@include('school._kid')
@include('school._media')
.pv{background:#fff7dc;border:2px solid #ecd28a;border-radius:16px;padding:10px 14px;margin:0 0 12px;font-weight:800}
.qq{background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 14px;margin:0 0 12px}.qq p{font-weight:800;font-size:19px;margin:0 0 8px}
.op{display:flex;gap:10px;align-items:center;border:2px solid var(--line);border-radius:14px;padding:10px 12px;margin:6px 0;cursor:pointer;font-size:18px;min-height:44px}
.op input{width:22px;height:22px}.op:has(input:checked){border-color:var(--g);background:var(--gl)}
.qq input[type=text]{font:inherit;font-size:18px;padding:10px;border:2px solid var(--line);border-radius:12px;width:100%;box-sizing:border-box}
@endsection
@section('content')
<p class="pv" role="status">معاينة كطالب — هكذا يرى الطلاب الاختبار. لا تُحفظ أي إجابة، والاختبار لم يُنشر بعد. أغلق هذه النافذة للعودة إلى المنشئ.</p>
<h1>{{ $title }}</h1>
@if (! $questions)<p class="pv">لم تُضف أسئلة بعد.</p>@endif
<form onsubmit="return false">
@foreach ($questions as $qi => $x)
<fieldset class="qq"><p>{{ $ar::num($loop->iteration) }}. {!! \App\Support\SchoolTasks::qHtml($school, $x) !!}</p>
@if ($x['type'] === 'fill')<input type="text" maxlength="160" autocomplete="off" aria-label="إجابتك" @if(! empty($x['math'])) data-eq dir="auto" @endif>
@else @foreach (array_keys($x['o'] ?? []) as $oi)<label class="op"><input type="radio" name="p{{ $qi }}"> <span>{!! \App\Support\SchoolTasks::optHtml($school, $x, (int) $oi) !!}</span></label>@endforeach @endif
</fieldset>
@endforeach
<button type="button" class="btn" style="font-size:20px;width:100%" onclick="window.close()">إغلاق المعاينة</button>
</form>
@endsection
@section('js')
@php($needMath = collect($questions)->contains(fn ($z) => ! empty($z['math']) && $z['type'] === 'fill'))
@if($needMath)<script src="{{ asset('ui/school-math.js') }}?v=2"></script><script>if(window.SchoolMath)document.querySelectorAll('[data-eq]').forEach(i=>SchoolMath.bar(i,1));</script>@endif
@endsection
