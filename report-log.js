/* سجلّ تقرير ولي الأمر (bustan_report_v1): وقت الدراسة لكل درس، وعدد الإجابات، والأخطاء الأخيرة (السؤال والاختيار الخاطئ).
   - يعمل في صفحات المواد فقط، ويُحمَّل من profiles.js. لا يغيّر منطق الدروس ولا مفاتيحها: يراقب فقط الأزرار التي تأخذ الصنف ok أو bad بعد ضغط الطالب.
   - المفتاح ضمن مفاتيح الطالب (PER) فيُحفظ لكل طالب ويُزامَن مع حساب ولي الأمر عبر sync.js كباقي التقدّم.
   - الحجم محدود (آخر ٤٠ خطأ لكل مادة، ٦٠ درسًا، ٦٠ يومًا) حتى لا يكبر التخزين. */
(function(){
'use strict';
if(window.BUSTAN_REPORT)return;
const KEY='bustan_report_v1',LS=window.localStorage;
const m=location.pathname.match(/\/(g\d+)\/([a-z]+)\//);if(!m)return;
const subj=m[1]+'-'+m[2];
const clip=(s,n)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n||120);
const day=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function load(){let d=null;try{d=JSON.parse(LS.getItem(KEY))}catch(e){}if(!d||typeof d!=='object'||d.v!==1)d={v:1,subj:{}};if(!d.subj||typeof d.subj!=='object')d.subj={};return d}
function edit(fn){try{const d=load(),s=d.subj[subj]||(d.subj[subj]={ms:0,n:0,ok:0,days:{},lessons:{},wrong:[]});fn(s);trim(s);d.t=Date.now();LS.setItem(KEY,JSON.stringify(d))}catch(e){}}
function trim(s){
 const ks=Object.keys(s.days);if(ks.length>60)ks.sort().slice(0,ks.length-60).forEach(k=>delete s.days[k]);
 const ls=Object.entries(s.lessons);if(ls.length>60)ls.sort((a,b)=>(a[1].last||0)-(b[1].last||0)).slice(0,ls.length-60).forEach(([k])=>delete s.lessons[k]);
 if(s.wrong.length>40)s.wrong=s.wrong.slice(-40);
}
// اسم الدرس الظاهر الآن: أول عنوان مرئي داخل التطبيق.
function lesson(){
 const hs=document.querySelectorAll('#app h1,#app h2,main h1,main h2,.lesson h2,.lesson-title,h1,h2');
 for(const h of hs){if(h.closest('#bustan-banner,#bustan-trial,#bustan-locked,dialog'))continue;const r=h.getBoundingClientRect();if(r.width&&r.height){const t=clip(h.textContent,60);if(t)return t}}
 return clip(document.title,60)||'عام';
}
// نص السؤال: أقرب عنصر سؤال حول الزر، وإلا أول سطر نصي في الحاوية دون الأزرار.
function question(btn){
 let el=btn.parentElement;
 for(let i=0;el&&i<6;i++,el=el.parentElement){
  const q=el.querySelector('.q,.qtext,.question,.prompt,.stem,.ask,.q-text,.task-q,[data-q]');
  if(q&&!q.contains(btn)){const t=clip(q.textContent);if(t)return t}
 }
 el=btn.closest('section,article,.card,.task,.step')||btn.parentElement&&btn.parentElement.parentElement;
 if(el){const c=el.cloneNode(true);c.querySelectorAll('button,script,style,svg').forEach(x=>x.remove());const t=clip(c.textContent);if(t)return t}
 return '';
}
const label=b=>clip(b.getAttribute('aria-label')||b.textContent,80);
// الوقت: يُحسب كل ١٥ ثانية ما دامت الصفحة ظاهرة وتفاعل الطالب خلال آخر دقيقتين.
let lastAct=Date.now(),tick=Date.now();
['pointerdown','keydown','touchstart','scroll'].forEach(e=>addEventListener(e,()=>{lastAct=Date.now()},{passive:true,capture:true}));
function flush(){
 const now=Date.now(),dt=Math.min(now-tick,30000);tick=now;
 if(document.visibilityState!=='visible'||now-lastAct>120000||dt<1000)return;
 const l=lesson(),d=day();
 edit(s=>{s.ms+=dt;s.days[d]=(s.days[d]||0)+dt;const x=s.lessons[l]||(s.lessons[l]={ms:0,n:0,ok:0});x.ms+=dt;x.last=now});
}
setInterval(flush,15000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();else tick=Date.now()});
addEventListener('pagehide',flush);
// الإجابات: الزر الذي ضغطه الطالب ثم أخذ الصنف ok (صحيح) أو bad (خطأ) خلال ثانيتين.
let pressed=null,pressedAt=0;const seen=new WeakSet();
addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button,[role=button]');if(b){pressed=b;pressedAt=Date.now()}},true);
function record(b,ok){
 if(seen.has(b))return;seen.add(b);
 const l=lesson(),q=question(b),a=label(b),now=Date.now();
 edit(s=>{s.n++;if(ok)s.ok++;const x=s.lessons[l]||(s.lessons[l]={ms:0,n:0,ok:0});x.n++;if(ok)x.ok++;x.last=now;
  if(!ok)s.wrong.push({l,q,a,t:now})});
 if(!ok)setTimeout(()=>{// الإجابة الصحيحة إن أظهرها التطبيق بعد الخطأ
  const box=b.parentElement,good=box&&[...box.querySelectorAll('.ok')].find(x=>x!==b);if(!good)return;
  edit(s=>{const w=s.wrong[s.wrong.length-1];if(w&&w.t===now)w.c=label(good)})},600);
}
new MutationObserver(list=>{
 for(const r of list){const b=r.target;if(b!==pressed||Date.now()-pressedAt>2000)continue;
  if(b.classList.contains('ok'))record(b,true);else if(b.classList.contains('bad'))record(b,false)}
}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
window.BUSTAN_REPORT={KEY,subject:subj,flush,record};
})();
