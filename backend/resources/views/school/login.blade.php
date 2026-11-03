@extends('school.layout')
@section('title', 'الدخول')
@section('css')
.box{max-width:560px;margin:8px auto 0;padding:22px clamp(16px,4vw,30px)}
.tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f1efe2;border-radius:16px;padding:5px;margin:0 0 18px}
.tabs button{min-height:48px;border:0;border-radius:12px;background:transparent;font:800 17px Baloo,Cairo,sans-serif;color:var(--ink2);cursor:pointer}
.tabs button[aria-selected=true]{background:#fff;color:var(--gd);box-shadow:0 2px 0 var(--line)}
h1{font-size:26px;margin:0 0 4px}
.pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin:14px 0 0;padding:0;list-style:none}
.pick button{width:100%;min-height:64px;padding:8px 10px;border:2px solid var(--line);border-radius:16px;background:#fff;font:800 18px/1.3 Baloo,Cairo,sans-serif;color:var(--ink);cursor:pointer;box-shadow:0 4px 0 var(--line)}
.pick button small{display:block;font:600 13px Cairo,sans-serif;color:var(--muted)}
.pick button:hover,.pick button:focus-visible{border-color:var(--g);background:var(--gl)}
.step-h{display:flex;align-items:center;gap:8px;margin:0}
.back{border:0;background:none;color:var(--gd);font:800 16px Cairo,sans-serif;cursor:pointer;min-height:44px;padding:0 6px}
.who{font:800 24px Baloo,Cairo,sans-serif;text-align:center;margin:8px 0 2px}
.pin{display:flex;justify-content:center;gap:10px;direction:ltr;margin:16px 0 6px}
.pin input{width:62px;height:70px;min-height:70px;text-align:center;font:800 30px Baloo,Cairo,sans-serif;padding:0;border-radius:16px}
.msg{min-height:28px;text-align:center;font-weight:800}.msg.err{color:#8a2a24}.msg.ok{color:var(--gd)}
[hidden]{display:none!important}
@endsection
@section('content')
@if ($stale)<div class="alert err" role="alert" style="max-width:560px;margin:8px auto">هذا الرابط أو الرمز قديم. اطلب البطاقة أو الرابط الجديد من معلّمك، أو اختر شعبتك من القائمة.</div>@endif
<section class="card box">
  <div class="tabs" role="tablist" aria-label="نوع الدخول">
    <button type="button" role="tab" id="t-child" aria-controls="p-child" aria-selected="{{ $tab === 'child' ? 'true' : 'false' }}">أنا طالب</button>
    <button type="button" role="tab" id="t-staff" aria-controls="p-staff" aria-selected="{{ $tab === 'staff' ? 'true' : 'false' }}">المعلّمون والإدارة</button>
  </div>
  <div id="p-child" role="tabpanel" aria-labelledby="t-child" @if($tab==='staff') hidden @endif>
    <div id="s1" @if($section) hidden @endif>
      <h1>أهلًا بك! اختر شعبتك</h1>
      <ul class="pick">@forelse ($sections as $s)<li><button type="button" data-sec="{{ $s->id }}" data-label="{{ $s->name }}">{{ $s->name }}<small>{{ \App\Support\Ar::grade($s->grade) }}</small></button></li>@empty<li class="muted">لم تُضف شعب بعد.</li>@endforelse</ul>
    </div>
    <div id="s2" hidden>
      <p class="step-h"><button type="button" class="back" data-go="s1">→ رجوع</button><b id="s2-title"></b></p>
      <h1>اختر اسمك</h1>
      <ul class="pick" id="names" aria-live="polite"></ul>
    </div>
    <form id="s3" method="post" action="{{ route('school.child', $school) }}" hidden>
      @csrf<input type="hidden" name="student" id="sid" value="{{ $pre?->id }}">
      <p class="step-h"><button type="button" class="back" data-go="s2">→ رجوع</button></p>
      <p class="who" id="who">{{ $pre?->name }}</p>
      <p class="muted" style="text-align:center;margin:0">اكتب رقمك السري (٤ أرقام) من بطاقتك</p>
      <div class="pin"><input id="pin" name="pin" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="one-time-code" aria-label="الرقم السري من أربعة أرقام" style="width:220px;letter-spacing:22px"></div>
      <p class="msg" id="msg" role="status"></p>
      <button class="btn wide" type="submit">ادخل</button>
    </form>
  </div>
  <form id="p-staff" role="tabpanel" aria-labelledby="t-staff" method="post" action="{{ route('school.staff', $school) }}" @if($tab!=='staff') hidden @endif>
    @csrf
    <h1>دخول المعلّمين والإدارة</h1>
    <div class="field"><label for="u">اسم المستخدم</label><input id="u" name="username" dir="ltr" autocomplete="username" value="{{ old('username') }}" required></div>
    <div class="field"><label for="p">كلمة المرور</label><input id="p" name="password" type="password" dir="ltr" autocomplete="current-password" required></div>
    <button class="btn wide" type="submit">دخول</button>
  </form>
</section>
@endsection
@section('js')
<script>
(function(){
var $=function(i){return document.getElementById(i)},names={},cur=null,
 NAMES=@json(route('school.names', ['school' => $school, 'section' => 0])).replace(/\/0\/names$/,'/'),
 pre=@json($pre ? ['id' => $pre->id, 'name' => $pre->name] : null), sec=@json($section ? ['id' => $section->id, 'name' => $section->name] : null);
function step(id){['s1','s2','s3'].forEach(function(s){$(s).hidden=s!==id});var f=$(id).querySelector('button,input:not([type=hidden])');if(f)f.focus({preventScroll:true});}
document.querySelectorAll('[role=tab]').forEach(function(t){t.onclick=function(){document.querySelectorAll('[role=tab]').forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);$(x.getAttribute('aria-controls')).hidden=!on;});};});
document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){step(b.dataset.go)}});
function esc(s){var d=document.createElement('i');d.textContent=s;return d.innerHTML}
function openSec(id,label){cur=id;$('s2-title').textContent=label;$('names').innerHTML='<li class="muted">لحظة…</li>';step('s2');
 var go=function(list){$('names').innerHTML=list.length?list.map(function(n){return '<li><button type="button" data-id="'+n.id+'">'+esc(n.name)+'</button></li>'}).join(''):'<li class="muted">لا أسماء في هذه الشعبة بعد.</li>';};
 if(names[id])return go(names[id]);
 fetch(NAMES+id+'/names',{headers:{Accept:'application/json'}}).then(function(r){return r.json()}).then(function(d){names[id]=d.names;go(d.names)}).catch(function(){$('names').innerHTML='<li class="muted">تعذّر التحميل، أعد المحاولة.</li>'});}
document.querySelectorAll('[data-sec]').forEach(function(b){b.onclick=function(){openSec(b.dataset.sec,b.dataset.label)}});
$('names').onclick=function(e){var b=e.target.closest('button');if(!b)return;$('sid').value=b.dataset.id;$('who').textContent=b.textContent;$('pin').value='';$('msg').textContent='';step('s3');};
$('pin').oninput=function(){this.value=this.value.replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632}).replace(/\D/g,'').slice(0,4);if(this.value.length===4)$('s3').requestSubmit();};
$('s3').onsubmit=function(e){e.preventDefault();var m=$('msg');m.className='msg';m.textContent='لحظة…';
 fetch(this.action,{method:'POST',headers:{Accept:'application/json'},body:new FormData(this),credentials:'same-origin'}).then(function(r){return r.json().then(function(d){return [r.ok,d]})}).then(function(x){
  if(x[0]&&x[1].ok){m.className='msg ok';m.textContent='أهلًا '+x[1].name+'! هيّا نتعلّم';location.replace(x[1].to);}else{m.className='msg err';m.textContent=(x[1]&&x[1].message)||'تعذّر الدخول';$('pin').value='';$('pin').focus();}
 }).catch(function(){m.className='msg err';m.textContent='تحقّق من الإنترنت ثم أعد المحاولة.'});};
if(sec){openSec(sec.id,sec.name)}
if(pre){$('sid').value=pre.id;$('who').textContent=pre.name;step('s3')}
})();
</script>
@endsection
