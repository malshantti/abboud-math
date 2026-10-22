/* تنزيل صور الكتاب مستقل عن بيانات الطالب. ملفات التشغيل تُحفظ عند تثبيت العامل. */
(function(){
'use strict';
const $=s=>document.querySelector(s),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const KEY='g6math_offline_hidden',DONE='g6math_offline_done';
let busy=false,state={text:'',label:'حفظ الدروس',done:(()=>{try{return localStorage.getItem(DONE)==='1'}catch(e){return false}})(),pct:-1};
if(state.done)state.label='تحديث النسخة المحفوظة';
const hidden=()=>{try{return localStorage.getItem(KEY)==='1'}catch(e){return false}};
const CSS='#math-offline{display:flex;gap:16px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-inline-start:5px solid var(--g);border-radius:20px;padding:18px 20px;margin-bottom:18px}'+
'#math-offline .mo-ic{flex:0 0 48px;height:48px;border-radius:14px;background:var(--gl,#eaf1df);color:var(--gd,#4e6635);display:grid;place-items:center}'+
'#math-offline .mo-tx{flex:1 1 260px;min-width:0}#math-offline h2{margin:0 0 4px;font:800 19px Baloo,Cairo,sans-serif;color:var(--tx)}'+
'#math-offline p{margin:0;font:500 15px/1.7 Cairo,sans-serif;color:var(--tx2,var(--mut))}#math-offline .mo-act{display:flex;gap:8px;align-items:center}'+
'#math-offline .mo-act .btn{min-width:150px}#math-offline .mo-x{background:none;border:0;min-width:44px;min-height:44px;border-radius:12px;color:var(--mut);cursor:pointer;font:700 14px Cairo,sans-serif}'+
'#math-offline .mo-x:hover{background:var(--gl,#eaf1df)}#math-offline .mo-bar{flex:1 1 100%;height:8px;border-radius:8px;background:var(--line);overflow:hidden}'+
'#math-offline .mo-bar i{display:block;height:100%;width:0;background:var(--g);border-radius:8px;transition:width .3s}#math-offline .mo-st{flex:1 1 100%;font:600 14px Cairo,sans-serif;color:var(--mut);min-height:0}#math-offline .mo-st:empty{display:none}'+
'#math-offline.done{padding:10px 14px;gap:10px;flex-wrap:nowrap}#math-offline.done .mo-tx{flex:1 1 0}#math-offline.done .mo-ic{flex-basis:36px;height:36px;border-radius:50%;background:var(--g);color:#fff}#math-offline.done h2{font-size:16px;margin:0}#math-offline.done p,#math-offline.done .mo-st,#math-offline.done .mo-bar,#math-offline.done #math-offline-start{display:none}'+
'@media(max-width:560px){#math-offline{padding:16px}#math-offline .mo-act{flex:1 1 100%}#math-offline .mo-act .btn{flex:1}#math-offline.done .mo-act{flex:0 0 auto}}';
function style(){if(document.getElementById&&!document.getElementById('mo-css')){const st=document.createElement('style');st.id='mo-css';st.textContent=CSS;document.head.append(st)}}
const ICON='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>',
 CHECK='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
function paint(){const button=$('#math-offline-start'),status=$('#math-offline-status');if(button){button.disabled=busy;button.textContent=state.label}if(status)status.textContent=state.text;
 const card=$('#math-offline');if(!card||!card.classList)return;card.classList.toggle('done',!!state.done);card.setAttribute('aria-busy',busy?'true':'false');
 const t=$('#mo-title'),ic=$('#mo-ic'),bar=$('#mo-bar');if(t)t.textContent=state.done?'الدروس محفوظة على هذا الجهاز':'احفظ الدروس على هذا الجهاز';if(ic)ic.innerHTML=state.done?CHECK:ICON;
 if(bar){bar.hidden=!(busy&&state.pct>=0);bar.firstChild.style.width=Math.max(0,state.pct)+'%'}}
window.MATH_OFFLINE=function(route,app){if(!['home','report'].includes(route))return;const page=app.querySelector('.page');if(!page)return;if(state.done&&hidden())return;
 style();
 page.insertAdjacentHTML('afterbegin','<section class="card" id="math-offline" aria-labelledby="mo-title"><span class="mo-ic" id="mo-ic">'+ICON+'</span><div class="mo-tx"><h2 id="mo-title">احفظ الدروس على هذا الجهاز</h2><p>ليتمكّن طفلك من التعلّم حتى عند انقطاع الإنترنت.</p></div><div class="mo-act"><button type="button" class="btn" id="math-offline-start">حفظ الدروس</button><button type="button" class="mo-x" id="math-offline-hide" aria-label="إخفاء هذه البطاقة" hidden>إخفاء</button></div><div class="mo-bar" id="mo-bar" hidden><i></i></div><p class="mo-st" id="math-offline-status" role="status" aria-live="polite"></p></section>');
 const x=$('#math-offline-hide');if(x&&state.done)x.hidden=false;paint();
};
document.addEventListener('click',e=>{if(!e.target.closest('#math-offline-hide'))return;try{localStorage.setItem(KEY,'1')}catch(err){}const c=$('#math-offline');if(c)c.remove()});
document.addEventListener('click',e=>{if(!e.target.closest('#math-offline-start')||busy)return;const sw=navigator.serviceWorker;
 if(!sw||!sw.controller){state.text='لم يجهز الحفظ بعد. اتصل بالإنترنت وأعد فتح الصفحة ثم حاول مجددًا.';paint();return}
 const worker=sw.controller;if(new URL(worker.scriptURL).pathname!==new URL('sw.js',location.href).pathname){state.text='يجري تجهيز الحفظ لهذه المادة. أعد فتح الصفحة بعد لحظات.';paint();return}
 const token=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),script=document.createElement('script');let timer,ended=false;
 const finish=(text,complete)=>{if(ended)return;ended=true;busy=false;clearTimeout(timer);sw.removeEventListener('message',message);script.onload=script.onerror=null;script.remove();state={text,label:complete?'تحديث النسخة المحفوظة':'استكمال الحفظ',done:complete,pct:-1};const x=$('#math-offline-hide');if(x&&complete)x.hidden=false;try{complete?localStorage.setItem(DONE,'1'):localStorage.removeItem(DONE)}catch(e){}paint()};
 const wait=ms=>{clearTimeout(timer);timer=setTimeout(()=>finish('لم يكتمل التنزيل في الوقت المتاح. ما حُفظ باقٍ؛ استكمل عند تحسّن الاتصال.',false),ms)};
 function message(e){const d=e.data;if(!d||d.type!=='cache-media-progress'||d.token!==token||e.source!==worker)return;
  if(!Number.isInteger(d.total)||!Number.isInteger(d.saved)||!Number.isInteger(d.remaining)||d.total<0||d.saved<0||d.saved>d.total||d.remaining!==d.total-d.saved)return;
  wait(65000);const count='حُفظ '+ar(d.saved)+' من '+ar(d.total)+' صفحة؛ المتبقي '+ar(d.remaining)+'.';
  if(d.done){const complete=!d.error&&d.total>0&&d.remaining===0;finish(complete?'اكتمل حفظ الدروس على هذا الجهاز.':count+' لم يكتمل الحفظ؛ اضغط «استكمال الحفظ» لإكمال الباقي.',complete)}
  else{state={text:count,label:'جارٍ الحفظ…',done:false,pct:d.total?Math.round(d.saved*100/d.total):0};paint()}
 }
 busy=true;state={text:'جارٍ تجهيز الحفظ…',label:'جارٍ الحفظ…',done:false,pct:0};paint();sw.addEventListener('message',message);wait(20000);
 script.src='media.js';script.onerror=()=>finish('تعذّر تحميل فهرس الكتاب. اتصل بالإنترنت ثم حاول مجددًا.',false);
 script.onload=()=>{if(ended)return;if(!Array.isArray(window.MEDIA)||!window.MEDIA.length){finish('فهرس الكتاب غير متاح. أعد فتح الصفحة ثم حاول مجددًا.',false);return}wait(65000);try{worker.postMessage({type:'cache-media',token,files:window.MEDIA})}catch(e){finish('تعذّر بدء الحفظ. أعد فتح الصفحة ثم حاول مجددًا.',false)}};
 document.head.append(script);
});
})();
