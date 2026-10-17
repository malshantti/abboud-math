/* تنزيل صور الكتاب مستقل عن بيانات الطالب. ملفات التشغيل تُحفظ عند تثبيت العامل. */
(function(){
'use strict';
const $=s=>document.querySelector(s),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
let busy=false,state={text:'',label:'نزّل صور الكتاب'};
function paint(){const button=$('#math-offline-start'),status=$('#math-offline-status');if(button){button.disabled=busy;button.textContent=state.label}if(status)status.textContent=state.text}
window.MATH_OFFLINE=function(route,app){if(!['home','report'].includes(route))return;const page=app.querySelector('.page');if(!page)return;
 page.insertAdjacentHTML('afterbegin','<details class="card" id="math-offline"'+(state.text?' open':'')+'><summary><b>جهّز الكتاب للعمل دون اتصال</b></summary><p class="muted">تُحفظ ملفات تشغيل الرياضيات عند تجهيز الحفظ. صور الكتاب تُحفظ عند فتحها؛ نزّل الصور كلها لتكون متاحة دون إنترنت، وانتظر تأكيد اكتمال التنزيل. ما حُفظ يبقى عند انقطاع الاتصال، ويمكن استكمال الباقي.</p><div class="row-btns"><button type="button" class="btn sec" id="math-offline-start">نزّل صور الكتاب</button></div><p class="muted" id="math-offline-status" role="status" aria-live="polite"></p></details>');paint();
};
document.addEventListener('click',e=>{if(!e.target.closest('#math-offline-start')||busy)return;const sw=navigator.serviceWorker;
 if(!sw||!sw.controller){state.text='لم يجهز الحفظ بعد. اتصل بالإنترنت وأعد فتح الصفحة ثم حاول مجددًا.';paint();return}
 const worker=sw.controller;if(new URL(worker.scriptURL).pathname!==new URL('sw.js',location.href).pathname){state.text='يجري تجهيز الحفظ لهذه المادة. أعد فتح الصفحة بعد لحظات.';paint();return}
 const token=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),script=document.createElement('script');let timer,ended=false;
 const finish=(text,complete)=>{if(ended)return;ended=true;busy=false;clearTimeout(timer);sw.removeEventListener('message',message);script.onload=script.onerror=null;script.remove();state={text,label:complete?'تحقّق من النسخة المحفوظة':'استكمل تنزيل الصور'};paint()};
 const wait=ms=>{clearTimeout(timer);timer=setTimeout(()=>finish('لم يكتمل التنزيل في الوقت المتاح. ما حُفظ باقٍ؛ استكمل عند تحسّن الاتصال.',false),ms)};
 function message(e){const d=e.data;if(!d||d.type!=='cache-media-progress'||d.token!==token||e.source!==worker)return;
  if(!Number.isInteger(d.total)||!Number.isInteger(d.saved)||!Number.isInteger(d.remaining)||d.total<0||d.saved<0||d.saved>d.total||d.remaining!==d.total-d.saved)return;
  wait(65000);const count='حُفظ '+ar(d.saved)+' من '+ar(d.total)+' صورة؛ المتبقي '+ar(d.remaining)+'.';
  if(d.done){const complete=!d.error&&d.total>0&&d.remaining===0;finish(complete?'اكتمل حفظ صور الكتاب على هذا الجهاز. يمكنك فتحها دون إنترنت.':count+' لم يكتمل الحفظ؛ استكمل الصور المتبقية.',complete)}
  else{state={text:count,label:'جارٍ الحفظ…'};paint()}
 }
 busy=true;state={text:'جارٍ تحميل فهرس صور الكتاب…',label:'جارٍ الحفظ…'};paint();sw.addEventListener('message',message);wait(20000);
 script.src='media.js';script.onerror=()=>finish('تعذّر تحميل فهرس الكتاب. اتصل بالإنترنت ثم حاول مجددًا.',false);
 script.onload=()=>{if(ended)return;if(!Array.isArray(window.MEDIA)||!window.MEDIA.length){finish('فهرس الكتاب غير متاح. أعد فتح الصفحة ثم حاول مجددًا.',false);return}wait(65000);try{worker.postMessage({type:'cache-media',token,files:window.MEDIA})}catch(e){finish('تعذّر بدء الحفظ. أعد فتح الصفحة ثم حاول مجددًا.',false)}};
 document.head.append(script);
});
})();
