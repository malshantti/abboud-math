@extends('school.layout')
@section('title', 'اختبار جديد — '.$section->name)
@section('head-end')<a class="btn ghost small" href="{{ route('school.tasks', [$school, $section]) }}">الواجبات والاختبارات</a>@endsection
@section('css')
@include('school._dash')
.qb{font-size:15px}.qb .pg{color:var(--muted);font-size:12px}.own{border:2px dashed #9fb7cf;border-radius:14px;padding:10px;margin:8px 0;background:#f7fafd}
.own .row{display:flex;gap:8px;align-items:center;margin:4px 0}.own input[type=text]{flex:1}.sticky{position:sticky;bottom:0;background:#fff;border-top:2px solid var(--line);padding:10px;display:flex;gap:10px;align-items:center;z-index:2}
@endsection
@section('content')
<h1>اختبار جديد لـ{{ $section->name }}</h1>
<form method="post" action="{{ route('school.quiz.store', [$school, $section]) }}" id="qf">@csrf
<section class="card"><h2>١. الأساسيات</h2>
<div class="f2">
<label>العنوان<input name="title" required maxlength="120" value="{{ old('title') }}" placeholder="مثل: اختبار قصير — الوحدة الأولى"></label>
<label>المادة<select name="subject" id="subj">@foreach ($courses as $c => $n)<option value="{{ $c }}" @selected(old('subject') === $c)>{{ $n }}</option>@endforeach</select></label>
</div></section>

<section class="card"><h2>٢. أسئلة من بنك الكتاب</h2><p class="sub">أسئلة اختيار من متعدد من كتاب {{ $ar::grade($section->grade) }} المقرّر، مرتّبة حسب الوحدة والدرس. اختر أسئلة بعينها أو «اختر ٥ عشوائيًا».</p>
<div id="bank" class="qb muted">جارٍ تحميل البنك…</div></section>

<section class="card"><h2>٣. أسئلة من إعدادك <span class="tag mine">من إعداد المعلّم</span></h2><p class="sub">تظهر للطالب بعلامة «من إعداد المعلّم». الإكمال: اكتب الإجابات المقبولة مفصولة بـ | (مثل: ٢٥ | خمسة وعشرون).</p>
<div id="own"></div>
<div class="actions"><button type="button" class="btn ghost small" data-add="mcq">+ اختيار من متعدد</button><button type="button" class="btn ghost small" data-add="tf">+ صح أو خطأ</button><button type="button" class="btn ghost small" data-add="fill">+ أكمل الفراغ</button></div></section>

<section class="card"><h2>٤. الإعدادات</h2><p class="sub">الأوقات بتوقيت فلسطين (Asia/Hebron).</p>
<div class="f2">
<label>يفتح<input type="datetime-local" name="starts" required value="{{ old('starts', $start) }}"></label>
<label>يغلق<input type="datetime-local" name="ends" required value="{{ old('ends', $end) }}"></label>
<label>المدة (دقائق)<input type="number" name="duration" min="1" max="180" required value="{{ old('duration', 15) }}"></label>
<label>عدد المحاولات<input type="number" name="attempts" min="1" max="5" required value="{{ old('attempts', 1) }}"></label>
<label>إظهار النتيجة<select name="show"><option value="now">فور التسليم</option><option value="after" @selected(old('show') === 'after')>بعد إغلاق الاختبار</option></select></label>
<label class="chk" style="align-self:end"><input type="hidden" name="shuffle" value="0"><input type="checkbox" name="shuffle" value="1" checked> <span>خلط الأسئلة والخيارات</span></label>
</div>
<p class="sub" style="margin-top:8px">المؤقّت يُحسب على الخادم: يُسلَّم الاختبار تلقائيًا عند انتهاء الوقت، ولا تُقبل إجابات بعده. تُسجَّل مرات مغادرة صفحة الاختبار.</p></section>

<div class="sticky"><b id="cnt">٠ سؤال</b><button class="btn">نشر الاختبار للشعبة</button></div>
</form>
@endsection
@section('js')
<script>
(()=>{const subj=document.getElementById('subj'),bank=document.getElementById('bank'),own=document.getElementById('own'),cnt=document.getElementById('cnt'),base={!! json_encode(route('school.bank', [$school, $section, 'CODE'])) !!};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const num=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
function count(){const n=document.querySelectorAll('#bank input:checked').length+own.children.length;cnt.textContent=num(n)+' سؤال'}
async function load(){bank.textContent='جارٍ تحميل البنك…';try{const u=(await (await fetch(base.replace('CODE',subj.value),{headers:{Accept:'application/json'}})).json()).units;
bank.innerHTML=u.map(u=>`<details class="u"><summary>${esc(u.t)}</summary>${u.les.map(l=>`<details class="u"><summary>${esc(l.t)} <small class="muted">(${num(l.q.length)})</small></summary>${l.q.length?`<button type="button" class="btn ghost small" data-rnd="${esc(l.id)}">اختر ٥ عشوائيًا</button>`:'<p class="muted">لا أسئلة في البنك لهذا الدرس.</p>'}${l.q.map((q,i)=>`<label class="chk" data-l="${esc(l.id)}"><input type="checkbox" name="picked[]" value="${esc(l.id)}|${i}"><span>${esc(q[0])}<br><small class="muted">${q[1].map((o,j)=>j===q[2]?'<b class="ok">'+esc(o)+'</b>':esc(o)).join(' · ')}${q[3]?' · <span class="pg">ص '+num(q[3])+'</span>':''}</small></span></label>`).join('')}</details>`).join('')}</details>`).join('')||'<p class="muted">لا بنك لهذه المادة.</p>';count()}catch(e){bank.textContent='تعذّر تحميل البنك.'}}
bank.addEventListener('change',count);bank.addEventListener('click',e=>{const b=e.target.closest('[data-rnd]');if(!b)return;const box=[...bank.querySelectorAll(`label[data-l="${CSS.escape(b.dataset.rnd)}"] input`)].filter(i=>!i.checked);box.sort(()=>Math.random()-.5).slice(0,5).forEach(i=>i.checked=true);count()});
subj.addEventListener('change',load);load();let k=0;
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.add,i=k++,d=document.createElement('div');d.className='own';
d.innerHTML=`<div class="row"><span class="tag mine">${{mcq:'اختيار من متعدد',tf:'صح أو خطأ',fill:'أكمل الفراغ'}[t]} — من إعداد المعلّم</span><button type="button" class="btn ghost small" data-del style="margin-inline-start:auto">حذف</button></div><input type="hidden" name="own[${i}][type]" value="${t}">
<div class="row"><input type="text" name="own[${i}][q]" required maxlength="400" placeholder="نص السؤال"></div>`+(t==='mcq'?[0,1,2,3].map(j=>`<div class="row"><input type="radio" name="own[${i}][a]" value="${j}" ${j?'':'checked'} aria-label="الإجابة الصحيحة"><input type="text" name="own[${i}][o][]" ${j<2?'required':''} placeholder="الخيار ${num(j+1)}${j<2?'':' (اختياري)'}"></div>`).join('')+'<small class="muted">اختر الدائرة بجانب الإجابة الصحيحة.</small>':t==='tf'?`<div class="row"><label class="chk"><input type="radio" name="own[${i}][a]" value="1" checked> صح</label><label class="chk"><input type="radio" name="own[${i}][a]" value="0"> خطأ</label></div>`:`<div class="row"><input type="text" name="own[${i}][ans]" required placeholder="الإجابات المقبولة: ٢٥ | خمسة وعشرون"></div>`);
d.querySelector('[data-del]').onclick=()=>{d.remove();count()};own.appendChild(d);d.querySelector('input[type=text]').focus();count()}));})();
</script>
@endsection
