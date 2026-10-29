/* هدية شهر بستان: نافذة ترحيب تظهر مرة واحدة لكل حساب عائلة بعد الدخول.
   لا تعمل إلا إن أرسل الخادم session.gift (مفتاح gift_notice_on في الإعدادات + هدية مفعّلة + لم تُغلق سابقًا).
   الإغلاق يُحفظ في الحساب (POST api/gift/seen) فلا تظهر على أي جهاز آخر. */
(function(){
'use strict';
if(window.__bkGift)return;window.__bkGift=1;
const root=new URL('./',document.currentScript&&document.currentScript.src||location.href);
const API=window.BUSTAN_API||new URL('admin-api/api/',root).href;
const SEEN='bustan_gift_seen';
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
let csrf='';
async function load(){
 // معاينة محلية فقط (لا تعمل على الموقع الحقيقي): ?gift_preview=1 أو 2 لعدة أطفال
 const pv=local&&new URLSearchParams(location.search).get('gift_preview');
 if(pv)return {id:'preview',until:'٢٨/١١/٢٠٢٦',whatsapp:'https://wa.me/972592945557',many:pv==='2',children:pv==='2'
  ?[{name:'عبد الرحمن',grade:'الصف الثامن',subjects:['الرياضيات','العربية','الإنجليزية','العلوم'],until:'٢٦/١٢/٢٠٢٦'},{name:'ميرا',grade:'الصف السادس',subjects:['الرياضيات','العربية','الإنجليزية','العلوم'],until:'٢٦/١٢/٢٠٢٦'}]
  :[{name:'حاتم',grade:'الصف الأول',subjects:['الرياضيات','العربية','الإنجليزية','التربية الحياتية'],until:'٢٨/١١/٢٠٢٦'}]};
 if(!get('bustan_account'))return null;
 const r=await fetch(API+'session',{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}});
 if(!r.ok)return null;const s=await r.json();csrf=s.csrf||'';
 if(!s.authenticated||!s.gift||get(SEEN)===s.gift.id)return null;
 return s.gift;
}
function seen(g){set(SEEN,g.id);if(g.id==='preview')return;
 fetch(API+'gift/seen',{method:'POST',credentials:'same-origin',keepalive:true,headers:{Accept:'application/json','Content-Type':'application/json','X-CSRF-TOKEN':csrf},body:'{}'}).catch(()=>{})}
function show(g){
 const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('gift.css?v=20261029g1',root).href;document.head.append(l);
 const many=!!g.many,kid=many?'لأطفالكم':'لطفلكم',grade=many?'صفوفهم':'صفّه';
 const kids=(g.children||[]).map(c=>`<li class="gm-kid"><span class="gm-av" aria-hidden="true">${esc((c.name||'؟').trim().charAt(0))}</span><span><b>${esc(c.name)}</b><small>${esc(c.grade)} · ${esc((c.subjects||[]).join('، '))}</small></span><span class="gm-tag">كل المواد</span></li>`).join('');
 const back=document.createElement('div');back.className='gm-back';
 back.innerHTML=`<div class="gm" role="dialog" aria-modal="true" aria-labelledby="gm-t" aria-describedby="gm-d" tabindex="-1" dir="rtl">
 <div class="gm-top"><div class="gm-grip" aria-hidden="true"></div>
  <button class="gm-x" type="button" aria-label="إغلاق"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
  <div class="gm-art" aria-hidden="true"><img src="${new URL('assets/img/z-celebrate.webp',root).href}" alt="" width="98" height="112">
   <svg class="gm-box" viewBox="0 0 64 64"><rect x="9" y="27" width="46" height="31" rx="6" fill="#6c854c"/><rect x="6" y="19" width="52" height="12" rx="5" fill="#86a061"/><rect x="28" y="19" width="8" height="39" fill="#dca349"/><path d="M32 19c-4-9-15-11-15-4 0 5 9 5 15 4zm0 0c4-9 15-11 15-4 0 5-9 5-15 4z" fill="none" stroke="#dca349" stroke-width="4" stroke-linejoin="round"/><path d="M14 36h4M46 44h4" stroke="#eaf1df" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg></div>
  <span class="gm-kicker">شهرٌ مجاني كامل</span>
  <h2 id="gm-t">هديةٌ من بستان التعلّم 🎁</h2></div>
 <div class="gm-body">
  <p class="gm-lead" id="gm-d">تقديرًا لثقتكم، فعّلنا ${kid} شهرًا مجانيًا كاملًا على جميع مواد ${grade}.</p>
  <ul class="gm-kids">${kids}</ul>
  <p class="gm-until"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>متاح مجانًا حتى ${esc(g.until)} — دون أي دفع</p>
  <button class="gm-cta" type="button">ابدأ التعلّم الآن</button>
  <button class="gm-later" type="button">إغلاق</button>
 </div>
 <div class="gm-foot">للدعم الفني عبر واتساب: <a class="gm-wa" href="${esc(g.whatsapp||'https://wa.me/972592945557')}" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg><span dir="ltr">0592945557</span></a><span class="gm-sign">فريق بستان التعلّم</span></div>
 </div>`;
 const prev=document.activeElement,box=back.querySelector('.gm');
 const close=()=>{seen(g);back.remove();document.removeEventListener('keydown',key);document.documentElement.style.overflow='';try{prev&&prev.focus()}catch(e){}};
 const key=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const f=[...box.querySelectorAll('button,a')];const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}};
 back.querySelector('.gm-x').onclick=close;back.querySelector('.gm-later').onclick=close;
 back.querySelector('.gm-cta').onclick=()=>{close();if(!/login\.html/.test(location.pathname))location.href=new URL('login.html',root).href};
 back.addEventListener('click',e=>{if(e.target===back)close()});
 document.addEventListener('keydown',key);document.documentElement.style.overflow='hidden';
 document.body.append(back);setTimeout(()=>box.focus(),30);
}
function go(){load().then(g=>{if(g)setTimeout(()=>show(g),600)}).catch(()=>{})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
