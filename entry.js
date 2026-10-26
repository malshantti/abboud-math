/* صفحة الدخول: اختيار الصف والمادة من catalog.js، وتذكّر آخر اختيار */
(function(){
'use strict';
const C=window.CATALOG,$=s=>document.querySelector(s);
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const ICON={
 math:'<path d="M6 4v6M3 7h6M15 7h6M4 15l4 4M8 15l-4 4M15 15.5h6M15 19.5h6" />',
 arabic:'<path d="M4 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H4zM20 5h-4a3 3 0 0 0-3 3" /><path d="M16 14c1.5 0 2.5-1 2.5-2.2M15 17.5h4"/>',
 english:'<path d="M4 18l4-12 4 12M5.4 14h5.2M15 10v8M15 13.5a2.5 2.5 0 1 1 5 0v1a2.5 2.5 0 1 1-5 0"/>',
 life:'<path d="M12 21v-8M12 13C5 14 3 9 4 5c6 0 9 2 8 8ZM12 10C12 5 16 3 21 4c0 5-4 8-9 6Z"/>',
 science:'<path d="M9 3h6M10 3v6l-5.5 10a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L14 9V3M7 15h10"/>',
 islamic:'<path d="M16 4a7 7 0 1 0 4 12.5A8 8 0 0 1 16 4z"/><path d="M18 7l.8 1.7 1.8.3-1.3 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.2 1.8-.3z"/>',
 social:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/>',
 tech:'<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2.5 19.5h19M10 9l-2 2 2 2M14 9l2 2-2 2"/>',
 sprout:'<path d="M12 20v-7M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 11c0-3.5 2.5-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5z"/>',
 go:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'
};
const svg=(k,s=28)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[k]}</svg>`;
const entry=(g,s)=>C.entries.find(e=>e.grade===g&&e.subject===s);
// المواد التي أخفاها المشرف (من إعدادات «المواد والتحفيز»؛ يحفظها sync.js في bustan_rules)
const hid=(g,s)=>{try{const r=window.BUSTAN_RULES||JSON.parse(get('bustan_rules')||'null');return !!(r&&Array.isArray(r.hidden)&&r.hidden.includes('g'+g+'-'+s))}catch(e){return false}};
const active=(g,s)=>{const e=entry(g,s);return e&&e.status==='active'&&!hid(g,s)?e:null};
const gradeActive=g=>C.entries.some(e=>e.grade===g&&e.status==='active'&&!hid(g,e.subject));
const gname=g=>(C.grades.find(x=>x.id===g)||{}).name||'';
const sname=s=>(C.subjects.find(x=>x.id===s)||{}).name||'';
// الطالب الحالي (من صفحة الدخول)
const me=window.PROFILES&&PROFILES.current();
const myName=me?me.name:'';
// صف الطالب ثابت كما حدّده الأهل، ولا تُفتح إلا مواد صفه المشمولة بالتجربة أو الاشتراك.
const acct=me&&PROFILES.roster&&PROFILES.roster()?PROFILES.accountStudent(me.id):null;
const fixedG=acct&&acct.grade?+acct.grade:null;
const ent=(g,s)=>acct?PROFILES.entitlement(me.id,g,s):'ok';
const ACCOUNT='admin-api/account',SUBSCRIBE='admin-api/account/subscribe';
ICON.lock='<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>';
$('#hello').textContent=myName?`أهلًا ${myName}، مرحبًا في البستان`:'أهلًا بك في البستان';
ICON.user='<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M16 7h5M19 4l2 3-2 3"/>';ICON.out='<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>';
if(me)$('#userbar').innerHTML=`<img src="${PROFILES.avatarSrc(me.avatar)}" alt="" width="46" height="46"><span class="un"><b>${esc(me.name)}</b><small>${PROFILES.list().length>1?'ملفات هذا الجهاز: '+AR(PROFILES.list().length):'ملفك على هذا الجهاز'}</small></span>${acct?`<a class="btn ghost sm" href="${ACCOUNT}">إدارة الأبناء</a>`:''}<a class="btn ghost sm" href="login.html?switch=1">${svg('user',18)} تبديل المستخدم</a><a class="btn ghost sm" href="login.html?logout=1">${svg('out',18)} خروج</a>`;
function go(e){
 if(ent(e.grade,e.subject)!=='ok')return;
 set('bustan_last',JSON.stringify({grade:e.grade,subject:e.subject,path:e.path,t:Date.now()}));
 location.href=e.path;
}
let selG=null;
function renderGrades(){
 if(acct){$('#s1h').classList.add('hidden');$('#grades').classList.add('hidden');return}
 $('#grades').innerHTML=C.grades.map(g=>`<button type="button" class="tile grade" data-g="${g.id}" aria-pressed="${selG===g.id}"><span class="num">${AR(g.id)}</span><span class="gn">${esc(g.name)}</span><span class="st">${esc(g.stage)}</span>${gradeActive(g.id)?'<span class="tag on">متاح</span>':'<span class="tag">قريبًا</span>'}</button>`).join('');
 $('#grades').querySelectorAll('.tile').forEach(b=>b.onclick=()=>{selG=+b.dataset.g;set('bustan_grade',String(selG));renderGrades();renderSubjects();$('#s2h').scrollIntoView({behavior:'smooth',block:'start'})});
}
function renderSubjects(){
 const box=$('#subjects');
 if(!selG){$('#s2h').classList.add('off');$('#s2p').textContent=acct?'لم يحدّد الأهل صفك بعد؛ يحدّدونه من صفحة الحساب.':'اختر الصف أولًا';box.innerHTML=acct?`<a class="btn" href="${ACCOUNT}">إدارة الأبناء</a>`:'';return}
 $('#s2h').classList.remove('off');$('#s2t').textContent='اختر المادة — '+gname(selG);
 const any=gradeActive(selG);$('#s2p').textContent=any?'المواد المتاحة عليها زر «ابدأ»':'مواد هذا الصف قيد التحضير';
 box.innerHTML=C.subjects.filter(s=>!hid(selG,s.id)&&(!s.grades||s.grades.includes(selG))&&(!C.gradeSubjects?.[selG]||C.gradeSubjects[selG].includes(s.id))).map(s=>{const e=active(selG,s.id);
  const lk=e&&ent(selG,s.id)!=='ok';
  if(lk)return `<div class="tile subject locked"><span class="si c-${s.color}">${svg(s.icon,30)}</span><span><span class="sn">${esc(s.name)}</span><span class="sd">${svg('lock',16)} انتهت الفترة التجريبية أو المادة غير مشمولة باشتراكك.</span></span><a class="btn sm" href="${SUBSCRIBE}">اشترك</a></div>`;
  return e?`<button type="button" class="tile subject" data-s="${s.id}"><span class="si c-${s.color}">${svg(s.icon,30)}</span><span><span class="sn">${esc(s.name)}</span><span class="sd">${esc(e.desc||'')}</span></span><span class="tag on">ابدأ</span></button>`
   :`<div class="tile subject soon" aria-disabled="true"><span class="si c-${s.color}">${svg(s.icon,30)}</span><span><span class="sn">${esc(s.name)}</span><span class="sd">نحضّر دروسها، وستُزهر قريبًا.</span></span><span class="tag">قريبًا</span></div>`}).join('')
  +(any||acct?'':`<div class="empty"><img src="assets/img/zaytoun-think.webp" alt="" width="64" height="75"><span>لم تُضَف مواد ${esc(gname(selG))} بعد. جرّب <b>الصف الثامن · الرياضيات</b> الآن.</span></div>`);
 box.querySelectorAll('button.subject').forEach(b=>b.onclick=()=>go(active(selG,b.dataset.s)));
}
// متابعة سريعة لآخر اختيار
function renderResume(){
 let last=null;try{last=JSON.parse(get('bustan_last')||'null')}catch(e){}
 const e=last&&active(last.grade,last.subject)&&ent(last.grade,last.subject)==='ok'?active(last.grade,last.subject):null;const r=$('#resume');
 if(!e){r.classList.add('hidden');return}
 const sub=C.subjects.find(s=>s.id===e.subject)||{};
 r.innerHTML=`<span class="ri">${svg(sub.icon||'sprout',30)}</span><span class="rt"><b>تابع من حيث توقفت</b><small>${esc(sname(e.subject))} · ${esc(gname(e.grade))}</small></span><a class="btn" id="resumeBtn" href="${esc(e.path)}">متابعة ${svg('go',18)}</a>${acct?'':`<button type="button" class="btn ghost" id="changeBtn">${svg('swap',18)} تغيير</button>`}`;
 r.classList.remove('hidden');
 $('#resumeBtn').onclick=ev=>{ev.preventDefault();go(e)};
 if($('#changeBtn'))$('#changeBtn').onclick=()=>{selG=e.grade;renderGrades();renderSubjects();$('#s1h').scrollIntoView({behavior:'smooth'})};
}
const q=new URLSearchParams(location.search);
const g0=+(get('bustan_grade')||0);if(q.has('change')||g0)selG=C.grades.some(g=>g.id===g0)?g0:null;
if(acct)selG=fixedG;
if(!selG&&!acct){try{const l=JSON.parse(get('bustan_last')||'null');if(l)selG=l.grade}catch(e){}}
renderGrades();renderSubjects();renderResume();
addEventListener('bustan-rules',()=>{renderGrades();renderSubjects();renderResume()});
if(q.has('change'))setTimeout(()=>$('#s1h').scrollIntoView({block:'start'}),50);
// الوضع الليلي (المفتاح نفسه المستخدم داخل المادة)
const tb=$('#theme');const paint=()=>{const d=document.documentElement.dataset.theme==='dark';tb.innerHTML=svg(d?'sun':'moon',22)};paint();
tb.onclick=()=>{const d=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=d;set('abboud_theme',d);paint()};
})();
