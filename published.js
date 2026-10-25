/* المحتوى المنشور من لوحة التحكم (منشئ المحتوى والاختبارات) يظهر في صفحة المادة نفسها.
   - يُحمَّل من profiles.js في صفحات مواد الصفين ٦ و٨ فقط، ولا يغيّر محتوى المادة الثابت ولا مفاتيح تقدّمها.
   - يقرأ /admin-api/api/public/content ويحفظ آخر نسخة في المتصفح لتعمل دون إنترنت.
   - يظهر زر «جديد من المعلّم» فقط عند وجود محتوى منشور. الإجابات تُسجَّل في تقرير وليّ الأمر (report-log.js). */
(function(){
'use strict';
if(window.BUSTAN_PUBLISHED)return;
const m=location.pathname.match(/\/g(6|8)\/(math|arabic|english|science)\//);if(!m)return;
const grade=+m[1],subject=m[2],KEY='bustan_pub_g'+grade+'_'+subject;
const me=document.currentScript&&document.currentScript.src?new URL('./',document.currentScript.src):new URL('../../',location.href);
const ver=document.currentScript?new URL(document.currentScript.src).search:'';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar=v=>String(v).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const LS=window.localStorage;let data=null;
try{data=JSON.parse(LS.getItem(KEY)||'null')}catch(e){}
const count=d=>d?(d.items||[]).filter(x=>x.type!=='unit').length+(d.quizzes||[]).length:0;
function load(){return fetch(new URL('admin-api/api/public/content?grade='+grade+'&subject='+subject,me),{credentials:'same-origin',cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(d=>{if(!d||!Array.isArray(d.items))return;data=d;try{LS.setItem(KEY,JSON.stringify(d))}catch(e){try{LS.removeItem(KEY)}catch(_){}}render()}).catch(()=>{})}
let assets=null;
function need(){if(assets)return assets;const add=(tag,attrs)=>new Promise((ok,no)=>{const el=document.createElement(tag);Object.assign(el,attrs);el.onload=ok;el.onerror=no;document.head.append(el)});
 assets=Promise.all([add('link',{rel:'stylesheet',href:new URL('assets/pub/content-builder.css'+ver,me).href}),add('link',{rel:'stylesheet',href:new URL('assets/pub/math-editor.css'+ver,me).href}),add('script',{src:new URL('assets/pub/math-editor.js'+ver,me).href})]).then(()=>add('script',{src:new URL('assets/pub/content-preview.js'+ver,me).href}));return assets}
const css='#bk-pub-fab{position:fixed;inset-inline-start:16px;bottom:84px;z-index:60;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:11px 18px;background:#5b7a2e;color:#fff;font:800 15px Cairo,system-ui,sans-serif;box-shadow:0 6px 18px rgba(40,60,20,.28);cursor:pointer}#bk-pub-fab b{background:#f2c14e;color:#3a2a00;border-radius:999px;min-width:24px;padding:0 6px;text-align:center}'+
'#bk-pub{--olive:#5b7a2e;--olive-dark:#3f5820;--olive-soft:#eef3e2;--muted:#66705a;--line:#dfe4d3;--surface:#fff;--gold-soft:#fbefc9;--ink:#24301a;position:fixed;inset:0;z-index:70;background:rgba(30,40,20,.45);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:16px;font-family:Cairo,system-ui,sans-serif}#bk-pub[hidden]{display:none}'+
'#bk-pub .bp-box{background:#fbfcf7;color:var(--ink);border-radius:20px;width:min(860px,100%);padding:18px 18px 26px;box-shadow:0 20px 50px rgba(0,0,0,.25)}#bk-pub .bp-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}#bk-pub h2{margin:0;font-size:22px}#bk-pub .bp-x{border:0;background:var(--olive-soft);border-radius:12px;padding:8px 14px;font:700 15px Cairo,sans-serif;cursor:pointer}'+
'#bk-pub .bp-list{display:grid;gap:10px}#bk-pub .bp-item{display:flex;gap:10px;align-items:center;text-align:start;width:100%;border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px 14px;font:700 16px Cairo,sans-serif;cursor:pointer;color:inherit}#bk-pub .bp-item small{display:block;font-weight:400;color:var(--muted);font-size:13px}#bk-pub .bp-tag{background:var(--olive-soft);color:var(--olive-dark);border-radius:999px;padding:2px 10px;font-size:13px;white-space:nowrap}#bk-pub h3.bp-h{margin:16px 0 6px;font-size:17px;color:var(--olive-dark)}'+
'#bk-pub .bp-q{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0}#bk-pub .bp-q p{margin:0 0 8px;font-weight:700}#bk-pub .bp-opts{display:grid;gap:6px}#bk-pub .bp-opt{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 12px;text-align:start;font:600 15px Cairo,sans-serif;cursor:pointer}#bk-pub .bp-opt[aria-pressed=true]{border-color:var(--olive);background:var(--olive-soft)}#bk-pub .bp-opt.ok{background:#dff3d6;border-color:#3d8b2f}#bk-pub .bp-opt.bad{background:#fbe0dc;border-color:#c0392b}#bk-pub input.bp-in{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font:600 15px Cairo,sans-serif}#bk-pub .bp-btn{border:0;background:var(--olive);color:#fff;border-radius:12px;padding:10px 18px;font:800 15px Cairo,sans-serif;cursor:pointer;margin-top:10px}#bk-pub .bp-res{font-weight:800;margin-top:10px}#bk-pub .bp-note{font-size:13px;color:var(--muted);margin-top:6px}#bk-pub img{max-width:100%;height:auto}#bk-pub .button{border:0;background:var(--olive);color:#fff;border-radius:12px;padding:10px 18px;font:800 15px Cairo,sans-serif;cursor:pointer}#bk-pub .button.secondary{background:var(--olive-soft);color:var(--olive-dark)}#bk-pub .cp-option,#bk-pub .cp-piece,#bk-pub button{color:var(--ink);font-family:Cairo,system-ui,sans-serif}#bk-pub .cp-option{font-size:16px;font-weight:600;width:100%}#bk-pub .button{color:#fff}#bk-pub .button.secondary{color:var(--olive-dark)}';
const labels={lesson:'درس',adventure:'مغامرة',lab:'مختبر',unit:'وحدة'};
let box,fab,stack=[];
function record(el,ok,o){try{window.BUSTAN_REPORT&&window.BUSTAN_REPORT.record(el,ok,o)}catch(e){}}
function ensure(){if(box)return;const st=document.createElement('style');st.textContent=css;document.head.append(st);
 box=document.createElement('div');box.id='bk-pub';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','جديد من المعلّم');box.dir='rtl';
 box.innerHTML='<div class="bp-box"><div class="bp-top"><h2 id="bp-title">جديد من المعلّم</h2><div><button type="button" class="bp-x" data-bp-back hidden>رجوع</button> <button type="button" class="bp-x" data-bp-close aria-label="إغلاق">إغلاق ✕</button></div></div><div id="bp-body"></div></div>';
 document.body.append(box);
 box.addEventListener('click',e=>{if(e.target===box||e.target.closest('[data-bp-close]'))close();else if(e.target.closest('[data-bp-back]'))list();else{const b=e.target.closest('[data-bp-open]');if(b)open(b.dataset.bpOpen)}});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close()});
}
function close(){box.hidden=true;document.documentElement.style.overflow='';if(fab)fab.focus()}
let preview=null;
function list(){if(preview){try{preview.destroy()}catch(e){}preview=null}
 box.querySelector('[data-bp-back]').hidden=true;box.querySelector('#bp-title').textContent='جديد من المعلّم';
 const items=data.items||[],units=items.filter(x=>x.type==='unit'),rest=items.filter(x=>x.type!=='unit');
 const row=(key,x,tag)=>'<button type="button" class="bp-item" data-bp-open="'+esc(key)+'"><span class="bp-tag">'+esc(tag)+'</span><span>'+esc(ar(x.title))+(x.description?'<small>'+esc(ar(x.description)).slice(0,160)+'</small>':'')+'</span></button>';
 let h='';
 [1,2].forEach(t=>{const inT=rest.filter(x=>x.term===t);if(!inT.length&&!units.some(u=>u.term===t))return;h+='<h3 class="bp-h">الفصل '+(t===1?'الأول':'الثاني')+'</h3><div class="bp-list">';
  units.filter(u=>u.term===t).forEach(u=>{h+=row('i:'+u.doc+':'+u.id,u,'وحدة');});
  inT.forEach(x=>{h+=row('i:'+x.doc+':'+x.id,x,labels[x.type]||'نشاط')});h+='</div>'});
 if((data.quizzes||[]).length){h+='<h3 class="bp-h">اختبارات</h3><div class="bp-list">'+data.quizzes.map(q=>row('q:'+q.id,{title:q.title,description:ar(q.questions.length)+' سؤال'},'اختبار')).join('')+'</div>'}
 box.querySelector('#bp-body').innerHTML=h||'<p>لا يوجد محتوى منشور بعد.</p>';
}
function open(key){const body=box.querySelector('#bp-body');box.querySelector('[data-bp-back]').hidden=false;
 if(key.startsWith('q:')){const q=(data.quizzes||[]).find(x=>'q:'+x.id===key);if(q)quiz(q,body);return}
 const item=(data.items||[]).find(x=>'i:'+x.doc+':'+x.id===key);if(!item)return list();
 box.querySelector('#bp-title').textContent=labels[item.type]||'جديد من المعلّم';body.innerHTML='<p role="status">جارٍ التحميل…</p>';
 need().then(()=>{if(preview){try{preview.destroy()}catch(e){}}
  preview=window.CONTENT_PREVIEW.mount(body,item,{live:true,items:(data.items||[]).filter(x=>x.doc===item.doc),onViewChild:id=>open('i:'+item.doc+':'+id),
   onAnswer:(btn,ok,row)=>record(btn,ok,{l:item.title,q:row.prompt,a:(row.options||[])[+btn.dataset.cpAnswer],c:ok?'':(row.options||[])[row.answer]})})})
 .catch(()=>{body.innerHTML='<p role="alert">تعذّر تحميل المحتوى. تحقّق من الاتصال ثم حاول مجددًا.</p>'});
}
const norm=s=>String(s||'').trim().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g,' ').toLowerCase();
function quiz(q,body){box.querySelector('#bp-title').textContent=q.title;
 body.innerHTML=(q.durationMinutes?'<p class="bp-note">المدة المقترحة: '+ar(q.durationMinutes)+' دقيقة</p>':'')+q.questions.map((x,i)=>{
  let a='';if(x.type==='mcq')a='<div class="bp-opts">'+x.options.map((o,j)=>'<button type="button" class="bp-opt" data-i="'+i+'" data-v="'+j+'" aria-pressed="false">'+esc(ar(o))+'</button>').join('')+'</div>';
  else if(x.type==='tf')a='<div class="bp-opts">'+[['true','صواب'],['false','خطأ']].map(([v,t])=>'<button type="button" class="bp-opt" data-i="'+i+'" data-v="'+v+'" aria-pressed="false">'+t+'</button>').join('')+'</div>';
  else a='<input class="bp-in" data-i="'+i+'" aria-label="إجابتك" autocomplete="off">';
  const img=x.image&&/^data:image\/(png|jpeg|webp);base64,/.test(x.image.dataUrl||'')?'<img src="'+esc(x.image.dataUrl)+'" alt="'+esc(x.image.alt||'')+'" loading="lazy">':'';
  return '<div class="bp-q" data-q="'+i+'"><p>'+ar(i+1)+'. '+esc(ar(x.prompt))+'</p>'+img+a+'</div>'}).join('')+'<button type="button" class="bp-btn" id="bp-grade">صحّح إجاباتي</button><div class="bp-res" id="bp-res" role="status"></div>';
 need().then(()=>{body.querySelectorAll('.bp-q').forEach((el,i)=>{const x=q.questions[i];if(x.math&&window.MATH_EDITOR){try{el.querySelector('p').insertAdjacentHTML('afterend','<div>'+window.MATH_EDITOR.render(x.math)+'</div>')}catch(e){}}})}).catch(()=>{});
 const pick={};let done=false;
 body.onclick=e=>{const b=e.target.closest('.bp-opt');if(b&&!done){const i=b.dataset.i;pick[i]=b.dataset.v;body.querySelectorAll('.bp-opt[data-i="'+i+'"]').forEach(o=>o.setAttribute('aria-pressed',String(o===b)))}
  if(e.target.id==='bp-grade'&&!done){done=true;let ok=0,pts=0,max=0;q.questions.forEach((x,i)=>{const el=body.querySelector('[data-q="'+i+'"]');let good,mine,right;
    if(x.type==='mcq'){mine=pick[i];good=mine!==undefined&&+mine===x.answer;right=x.options[x.answer]}
    else if(x.type==='tf'){mine=pick[i];good=mine!==undefined&&(mine==='true')===x.answer;right=x.answer?'صواب':'خطأ'}
    else{mine=el.querySelector('input').value;good=x.acceptedAnswers.some(a=>norm(a)===norm(mine));right=x.acceptedAnswers[0]}
    const p=x.points||1;max+=p;if(good){ok++;pts+=p}
    const chosen=el.querySelector('.bp-opt[aria-pressed=true]')||el.querySelector('input')||el;
    if(chosen.classList)chosen.classList.add(good?'ok':'bad');
    if(!good)el.insertAdjacentHTML('beforeend','<p class="bp-note">الإجابة الصحيحة: <b>'+esc(ar(right))+'</b></p>');
    record(chosen,good,{l:q.title,q:x.prompt,c:good?'':String(right)})});
   body.querySelector('#bp-grade').hidden=true;
   body.querySelector('#bp-res').innerHTML='نتيجتك: '+ar(pts)+' من '+ar(max)+' ('+ar(Math.round(100*pts/max))+'٪) — '+(pts/max>=.8?'أحسنت!':'راجع الأسئلة التي أخطأت فيها ثم حاول مجددًا.')+' <button type="button" class="bp-btn" id="bp-again">أعد الاختبار</button>'}
  if(e.target.id==='bp-again')quiz(q,body)};
}
function render(){const n=count(data);if(!n){if(fab)fab.hidden=true;return}
 ensure();if(!fab){fab=document.createElement('button');fab.type='button';fab.id='bk-pub-fab';fab.onclick=()=>{box.hidden=false;document.documentElement.style.overflow='hidden';list();box.querySelector('[data-bp-close]').focus()};document.body.append(fab)}
 fab.hidden=false;fab.innerHTML='جديد من المعلّم <b>'+ar(n)+'</b>';fab.setAttribute('aria-label','جديد من المعلّم: '+ar(n)+' عنصر');
}
const start=()=>{if(data)render();load()};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
window.BUSTAN_PUBLISHED={reload:load};
})();
