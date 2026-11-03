@extends('school.layout')
@section('title', $q->title)
@section('css')
@include('school._kid')
.clock{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;background:#fff;border:2px solid var(--line);border-radius:16px;padding:8px 14px;margin:0 0 12px;font-weight:800}
.clock b{font:800 26px Baloo,Cairo,sans-serif;direction:ltr}.clock.low{border-color:#eba59f;background:#fff1ef;color:#8a2a24}
.qq{background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 14px;margin:0 0 12px}.qq p{font-weight:800;font-size:19px;margin:0 0 8px}
.op{display:flex;gap:10px;align-items:center;border:2px solid var(--line);border-radius:14px;padding:10px 12px;margin:6px 0;cursor:pointer;font-size:18px}
.op input{width:22px;height:22px}.op:has(input:checked){border-color:var(--g);background:var(--gl)}
.qq input[type=text]{font:inherit;font-size:18px;padding:10px;border:2px solid var(--line);border-radius:12px;width:100%;box-sizing:border-box}
#saved{color:var(--muted);font-size:13px;margin-inline-start:auto}
@endsection
@section('content')
<h1>{{ $q->title }}</h1>
<div class="clock" id="clock" role="timer" aria-live="off">⏳ الوقت المتبقي <b id="left">--:--</b><span id="saved"></span></div>
<form method="post" action="{{ route('school.submit', [$school, $q->id]) }}" id="qf">@csrf<input type="hidden" name="auto" id="auto" value="0">
@foreach ($a->layout as $n => [$qi, $opts])@php($x = $q->questions[$qi])@php($v = $a->answers[$qi] ?? null)
<fieldset class="qq"><p>{{ $ar::num($n + 1) }}. {{ $x['q'] }} @if($x['src'] === 'teacher')<span class="tag mine">من إعداد المعلّم</span>@endif</p>
@if ($x['type'] === 'fill')<input type="text" name="answers[{{ $qi }}]" value="{{ $v }}" maxlength="120" autocomplete="off" aria-label="إجابتك">
@else @foreach ($opts as $oi)<label class="op"><input type="radio" name="answers[{{ $qi }}]" value="{{ $oi }}" @checked($v !== null && (string) $v === (string) $oi)> {{ $x['o'][$oi] }}</label>@endforeach @endif
</fieldset>
@endforeach
<button class="btn" style="font-size:20px;width:100%" onclick="return confirm('تسليم الاختبار الآن؟')">سلّم الاختبار</button>
</form>
@endsection
@section('js')
<script>
(()=>{const f=document.getElementById('qf'),out=document.getElementById('left'),clock=document.getElementById('clock'),saved=document.getElementById('saved'),tok=f.querySelector('[name=_token]').value;
const end=Date.now()+{{ max(0, now()->diffInSeconds($a->deadline_at, false)) }}*1000,num=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);let sent=false,t;
function tick(){const s=Math.max(0,Math.round((end-Date.now())/1000));out.textContent=num(String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'));clock.classList.toggle('low',s<=60);
 if(s<=0&&!sent){sent=true;document.getElementById('auto').value=1;saved.textContent='انتهى الوقت — يُسلَّم الآن';f.submit()}}
tick();setInterval(tick,500);
function data(){const d=new FormData(f);d.delete('auto');return d}
async function save(){try{const r=await fetch({!! json_encode(route('school.save', [$school, $q->id])) !!},{method:'POST',body:data(),headers:{Accept:'application/json'}});saved.textContent=r.ok?'حُفظت إجاباتك ✓':'انتهى الوقت'}catch(e){saved.textContent='سيُعاد الحفظ…'}}
f.addEventListener('change',()=>{clearTimeout(t);t=setTimeout(save,400)});f.addEventListener('input',e=>{if(e.target.type==='text'){clearTimeout(t);t=setTimeout(save,1200)}});
f.addEventListener('submit',()=>{sent=true});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&!sent){const d=new FormData();d.append('_token',tok);navigator.sendBeacon({!! json_encode(route('school.tab', [$school, $q->id])) !!},d);save()}});})();
</script>
@endsection
