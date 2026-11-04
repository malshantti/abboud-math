@extends('school.layout')
@section('title', 'اختبار جديد — '.$section->name)
@section('head-end')<a class="btn ghost small" href="{{ route('school.tasks', [$school, $section]) }}">الواجبات والاختبارات</a>@endsection
@section('css')
@include('school._dash')
@include('school._media')
.up{display:inline-flex;align-items:center;gap:6px}.up input[type=file]{display:none}.thumb{max-height:60px;border-radius:8px;border:1px solid var(--line)}.own .opt{border-top:1px dashed #cdd9e5;padding-top:4px}
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

<section class="card"><h2>٣. أسئلة من إعدادك <span class="tag mine">من إعداد المعلّم</span></h2><p class="sub">تظهر للطالب بعلامة «من إعداد المعلّم». الإكمال: اكتب الإجابات المقبولة مفصولة بـ | (مثل: ٢٥ | خمسة وعشرون).<br>🖼 أضف صورة للسؤال أو لأي خيار (تُصغَّر تلقائيًا). ∑ استخدم أزرار المعادلات (كسر، أُس، جذر، × ÷ ≤ ≥ π) — تظهر المعاينة تحت الحقل.</p>
<div id="own"></div>
<div class="actions"><button type="button" class="btn ghost small" data-add="mcq">+ اختيار من متعدد</button><button type="button" class="btn ghost small" data-add="tf">+ صح أو خطأ</button><button type="button" class="btn ghost small" data-add="fill">+ أكمل الفراغ</button></div></section>

<section class="card"><h2>٤. الإعدادات</h2><p class="sub">الأوقات بتوقيت فلسطين (Asia/Hebron).</p>
<div class="f2">
<label>يفتح<input type="datetime-local" name="starts" required value="{{ old('starts', $start) }}"></label>
<label>يغلق<input type="datetime-local" name="ends" required value="{{ old('ends', $end) }}"></label>
<label>المدة (دقائق)<input type="number" name="duration" min="1" max="180" required value="{{ old('duration', 15) }}"></label>
<label>عدد المحاولات<input type="number" name="attempts" min="1" max="5" required value="{{ old('attempts', 1) }}"></label>
<label>إظهار النتيجة<select name="show"><option value="now">فور التسليم</option><option value="after" @selected(old('show') === 'after')>بعد إغلاق الاختبار</option></select></label>
<label class="chk" style="align-self:end"><input type="hidden" name="shuffle" value="0"><input type="checkbox" name="shuffle" value="1" checked> <span>خلط ترتيب الأسئلة</span> <small class="mut">(الخيارات تُخلط دائمًا)</small></label>
</div>
<p class="sub" style="margin-top:8px">المؤقّت يُحسب على الخادم: يُسلَّم الاختبار تلقائيًا عند انتهاء الوقت، ولا تُقبل إجابات بعده. تُسجَّل مرات مغادرة صفحة الاختبار.</p></section>

<div class="sticky"><b id="cnt">٠ سؤال</b><span id="dst" class="muted" role="status" aria-live="polite"></span><button type="button" class="btn ghost" id="draft">حفظ كمسودة</button><button type="submit" class="btn ghost" formaction="{{ route('school.quiz.preview', [$school, $section]) }}" formtarget="_blank" formnovalidate>معاينة كطالب</button><button class="btn" id="pub">نشر الاختبار للشعبة</button></div>
</form>
@endsection
@section('js')
<script src="{{ asset('ui/school-math.js') }}?v=2"></script>
<script>
(()=>{const subj=document.getElementById('subj'),bank=document.getElementById('bank'),own=document.getElementById('own'),cnt=document.getElementById('cnt'),base={!! json_encode(route('school.bank', [$school, $section, 'CODE'])) !!};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const num=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
function count(){const n=document.querySelectorAll('#bank input:checked').length+own.children.length;cnt.textContent=num(n)+' سؤال'}
async function load(){bank.textContent='جارٍ تحميل البنك…';try{const u=(await (await fetch(base.replace('CODE',subj.value),{headers:{Accept:'application/json'}})).json()).units;
bank.innerHTML=u.map(u=>`<details class="u"><summary>${esc(u.t)}</summary>${u.les.map(l=>`<details class="u"><summary>${esc(l.t)} <small class="muted">(${num(l.q.length)})</small></summary>${l.q.length?`<button type="button" class="btn ghost small" data-rnd="${esc(l.id)}">اختر ٥ عشوائيًا</button>`:'<p class="muted">لا أسئلة في البنك لهذا الدرس.</p>'}${l.q.map((q,i)=>`<label class="chk" data-l="${esc(l.id)}"><input type="checkbox" name="picked[]" value="${esc(l.id)}|${i}"><span>${esc(q[0])}<br><small class="muted">${q[1].map((o,j)=>j===q[2]?'<b class="ok">'+esc(o)+'</b>':esc(o)).join(' · ')}${q[3]?' · <span class="pg">ص '+num(q[3])+'</span>':''}</small></span></label>`).join('')}</details>`).join('')}</details>`).join('')||'<p class="muted">لا بنك لهذه المادة.</p>';count()}catch(e){bank.textContent='تعذّر تحميل البنك.'}}
bank.addEventListener('change',count);bank.addEventListener('click',e=>{const b=e.target.closest('[data-rnd]');if(!b)return;const box=[...bank.querySelectorAll(`label[data-l="${CSS.escape(b.dataset.rnd)}"] input`)].filter(i=>!i.checked);box.sort(()=>Math.random()-.5).slice(0,5).forEach(i=>i.checked=true);count()});
subj.addEventListener('change',load);load();let k=0;
const up={!! json_encode(route('school.media.upload', [$school, $section])) !!},tok=document.querySelector('#qf [name=_token]').value;
const pic=(name,label)=>`<label class="up btn ghost small">🖼 ${label}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-up="${name}"></label><input type="hidden" name="${name}" value=""><span class="upst"></span>`;
own.addEventListener('change',async e=>{const f=e.target;if(!f.matches('[data-up]')||!f.files[0])return;const box=f.closest('label').parentElement,hid=box.querySelector(`input[type=hidden][name="${CSS.escape(f.dataset.up)}"]`),st=hid.nextElementSibling;
 if(f.files[0].size>6*1024*1024){st.textContent='الصورة أكبر من ٦ ميغابايت.';f.value='';return}st.textContent='جارٍ الرفع…';const d=new FormData();d.append('_token',tok);d.append('image',f.files[0]);
 try{const r=await fetch(up,{method:'POST',body:d,headers:{Accept:'application/json'}}),j=await r.json();if(!r.ok)throw new Error(j.error||j.message||'تعذّر الرفع');hid.value=j.name;
  st.innerHTML=`<img class="thumb" src="${esc(j.url)}" alt=""> <button type="button" class="btn ghost small" data-rm>إزالة</button>`;st.querySelector('[data-rm]').onclick=()=>{hid.value='';st.textContent=''}}catch(err){st.textContent=err.message;hid.value=''}f.value=''});
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.add,i=k++,d=document.createElement('div');d.className='own';
d.innerHTML=`<div class="row"><span class="tag mine">${({mcq:'اختيار من متعدد',tf:'صح أو خطأ',fill:'أكمل الفراغ'})[t]} — من إعداد المعلّم</span><button type="button" class="btn ghost small" data-del style="margin-inline-start:auto">حذف</button></div><input type="hidden" name="own[${i}][type]" value="${t}">
<input type="text" class="qt" name="own[${i}][q]" maxlength="600" placeholder="نص السؤال (يمكن تركه فارغًا إذا أضفت صورة)" style="width:100%"><div class="row">${pic(`own[${i}][img]`,'صورة للسؤال')}</div>`+(t==='mcq'?[0,1,2,3].map(j=>`<div class="opt"><div class="row"><input type="radio" name="own[${i}][a]" value="${j}" ${j?'':'checked'} aria-label="الإجابة الصحيحة"><input type="text" class="qt" name="own[${i}][o][${j}]" maxlength="240" placeholder="الخيار ${num(j+1)}${j<2?'':' (اختياري)'}"></div><div class="row">${pic(`own[${i}][oimg][${j}]`,'صورة للخيار')}</div></div>`).join('')+'<small class="muted">اختر الدائرة بجانب الإجابة الصحيحة. الخيار يكفيه نص أو صورة.</small>':t==='tf'?`<div class="row"><label class="chk"><input type="radio" name="own[${i}][a]" value="1" checked> صح</label><label class="chk"><input type="radio" name="own[${i}][a]" value="0"> خطأ</label></div>`:`<input type="text" class="qt" name="own[${i}][ans]" required placeholder="الإجابات المقبولة: ٢٥ | خمسة وعشرون" style="width:100%">`);
d.querySelector('[data-del]').onclick=()=>{d.remove();count()};own.appendChild(d);d.querySelectorAll('input.qt').forEach(x=>SchoolMath.bar(x));d.querySelector('input.qt').focus();count()}));
document.getElementById('qf').addEventListener('submit',e=>{for(const o of own.children){const q=o.querySelector('[name$="[q]"]').value.trim(),im=o.querySelector('[name$="[img]"]').value;if(!q&&!im){e.preventDefault();alert('كل سؤال يحتاج نصًا أو صورة.');o.scrollIntoView({block:'center'});return}}});
/* مسودة على هذا الجهاز: تُحفظ تلقائيًا وبزر «حفظ كمسودة»، وتُستعاد عند العودة، وتُمسح بعد النشر. */
const DK='bustan_quiz_draft_{{ $school->id }}_{{ $section->id }}',form=document.getElementById('qf'),dst=document.getElementById('dst');let pk=null,dt;
function snap(){const d={f:{},picked:[...bank.querySelectorAll('input:checked')].map(i=>i.value),own:[]};
 for(const el of form.elements){if(!el.name||el.name==='_token'||el.name.startsWith('own[')||el.name.startsWith('picked')||el.type==='file')continue;if((el.type==='radio'||el.type==='checkbox')&&!el.checked)continue;d.f[el.name]=el.value}
 for(const o of own.children){const t=o.querySelector('[name$="[type]"]').value,v={};o.querySelectorAll('input,textarea,select').forEach(x=>{if(!x.name||x.type==='file')return;const k=x.name.replace(/^own\[\d+\]/,'');if(x.type==='radio'||x.type==='checkbox'){if(x.checked)v[k+'='+x.value]=1}else v[k]=x.value});d.own.push({t,v})}return d}
function saveDraft(msg){try{localStorage.setItem(DK,JSON.stringify(snap()));dst.textContent=msg||'حُفظت المسودة على هذا الجهاز ✓'}catch(e){dst.textContent='تعذّر حفظ المسودة'}}
document.getElementById('draft').onclick=()=>saveDraft();
form.addEventListener('input',()=>{clearTimeout(dt);dt=setTimeout(()=>saveDraft('حُفظت تلقائيًا ✓'),1500)});form.addEventListener('change',()=>{clearTimeout(dt);dt=setTimeout(()=>saveDraft('حُفظت تلقائيًا ✓'),800)});
document.getElementById('pub').addEventListener('click',()=>{form.addEventListener('submit',e=>{if(!e.defaultPrevented)try{localStorage.removeItem(DK)}catch(x){}},{once:true})});
new MutationObserver(()=>{if(!pk)return;const want=new Set(pk);let hit=0;bank.querySelectorAll('input').forEach(i=>{if(want.has(i.value)){i.checked=true;hit++}});if(hit){pk=null;count()}}).observe(bank,{childList:true,subtree:true});
try{const d=JSON.parse(localStorage.getItem(DK)||'null');if(d&&!document.querySelector('.err,.errors')){
 for(const [n,v] of Object.entries(d.f||{})){const els=form.querySelectorAll(`[name="${CSS.escape(n)}"]`);els.forEach(el=>{if(el.type==='radio'||el.type==='checkbox')el.checked=el.value===v;else el.value=v})}
 if(d.f&&d.f.subject&&subj.value!==d.f.subject){subj.value=d.f.subject;load()}pk=d.picked||[];
 for(const q of d.own||[]){const b=document.querySelector(`[data-add="${CSS.escape(q.t)}"]`);if(!b)continue;b.click();const o=own.lastElementChild;
  for(const [k,v] of Object.entries(q.v)){if(k.includes('=')){const [kk,vv]=k.split('=');const x=[...o.querySelectorAll('input')].find(x=>x.name.endsWith(kk)&&x.value===vv);if(x)x.checked=true}else{const x=[...o.querySelectorAll('input,textarea,select')].find(x=>x.name&&x.name.replace(/^own\[\d+\]/,'')===k&&x.type!=='radio'&&x.type!=='checkbox');if(x)x.value=v}}
  o.querySelectorAll('input[type=hidden][name$="img]"]').forEach(h=>{if(h.value&&h.nextElementSibling)h.nextElementSibling.textContent='صورة مرفوعة ✓'})}
 count();dst.textContent='استُعيدت مسودتك المحفوظة على هذا الجهاز.'}}catch(e){}
})();
</script>
@endsection
