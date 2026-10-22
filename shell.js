/* واجهة موحّدة للشريط الجانبي في صفحات المواد: شعار البستان الحقيقي، بطاقة الطالب بقائمة صغيرة، و«خروج» أسفل الشريط.
   وتحجز مكانًا لشريط التجربة المجانية حتى لا يغطي الشريط الجانبي. */
(function(){
'use strict';
const m=location.pathname.match(/\/g(\d+)\/([a-z]+)\//);if(!m)return;
const me=document.currentScript?new URL(document.currentScript.src):new URL('../../',location.href);
const root=new URL('./',me).href;
const GR={1:'الصف الأول',2:'الصف الثاني',6:'الصف السادس',8:'الصف الثامن'};
const SU={math:'الرياضيات',arabic:'العربية',english:'الإنجليزية',science:'العلوم',life:'مهارات الحياة'};
const label=(GR[m[1]]||'الصف '+m[1])+' · '+(SU[m[2]]||m[2]);
const name=()=>{try{return (localStorage.getItem('bustan_student_name')||'').trim()}catch(e){return ''}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('link');css.rel='stylesheet';const cu=new URL('shell.css',me);cu.search=me.search;css.href=cu.href;document.head.append(css);
const brandHTML='<img class="bk-logo" src="'+root+'assets/brand/logo-mascot-sm.webp" width="44" height="58" alt=""><span class="bk-name"><b>بستان التعلّم</b><small>نزرع الفهم، ونحصد المعرفة</small></span>';
const ico={chev:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 user:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M16 7h5M19 4l2 3-2 3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 swap:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 8h13l-3-3M20 16H7l3 3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 out:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
let uid=0;
function card(){
 const id='bk-menu-'+(++uid),n=name()||'الطالب';
 const w=document.createElement('div');w.className='bk-student';
 w.innerHTML='<button type="button" class="bk-card" aria-haspopup="menu" aria-expanded="false" aria-controls="'+id+'"><span class="bk-avatar" aria-hidden="true">'+esc(Array.from(n)[0])+'</span><span class="bk-who"><b>'+esc(n)+'</b><small>'+esc(label)+'</small></span><span class="bk-chev">'+ico.chev+'</span></button>'+
 '<div class="bk-menu" id="'+id+'" role="menu" aria-label="خيارات الطالب" hidden><a role="menuitem" href="'+root+'login.html?switch=1">'+ico.user+'<span>تبديل الطالب</span></a><a role="menuitem" href="'+root+'?change=1">'+ico.swap+'<span>تغيير المادة</span></a><a role="menuitem" class="bk-danger" href="'+root+'login.html?logout=1">'+ico.out+'<span>خروج</span></a></div>';
 const b=w.querySelector('.bk-card'),menu=w.querySelector('.bk-menu'),items=()=>[...menu.querySelectorAll('a')];
 const open=f=>{menu.hidden=false;b.setAttribute('aria-expanded','true');w.classList.add('open');if(f)items()[0].focus()};
 const close=f=>{menu.hidden=true;b.setAttribute('aria-expanded','false');w.classList.remove('open');if(f)b.focus()};
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();menu.hidden?open(e.detail===0):close()});
 b.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open(true)}});
 menu.addEventListener('keydown',e=>{const l=items(),i=l.indexOf(document.activeElement);
  if(e.key==='Escape'){e.preventDefault();close(true)}
  else if(e.key==='ArrowDown'){e.preventDefault();l[(i+1)%l.length].focus()}
  else if(e.key==='ArrowUp'){e.preventDefault();l[(i-1+l.length)%l.length].focus()}
  else if(e.key==='Tab')close(false)});
 document.addEventListener('click',e=>{if(!w.contains(e.target))close(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)close(true)});
 return w}
function bottom(){const a=document.createElement('a');a.className='bk-logout';a.href=root+'login.html?logout=1';a.innerHTML=ico.out+'<span>خروج</span>';return a}
function apply(){
 // صفحات الصف السادس والثامن: الشريط الجانبي .tabs .side-brand
 const sb=document.querySelector('.tabs .side-brand');
 if(sb&&!sb.dataset.bk){sb.dataset.bk='1';
  const a=sb.querySelector(':scope>a');if(a){a.classList.add('bk-brand');a.innerHTML=brandHTML;a.setAttribute('aria-label','بستان التعلّم — الصفحة الرئيسية للمادة')}
  sb.querySelectorAll('.class-label,.subject-utilities,.switch-subject').forEach(x=>x.remove());
  const cap=sb.parentNode.querySelector('.nav-caption');if(cap)cap.remove();
  sb.append(card());sb.parentNode.append(bottom())}
 // صفحات الصفين الأول والثاني: aside.j-sidebar
 const js=document.querySelector('.j-sidebar');
 if(js&&!js.dataset.bk){js.dataset.bk='1';
  const a=js.querySelector('.g1-brand');if(a){a.classList.add('bk-brand');a.innerHTML=brandHTML;a.after(card())}
  js.append(bottom())}
}
// شريط التجربة: نقيس ارتفاعه ونحجز له مكانًا أعلى الشريط الجانبي الثابت.
let ro;
function trial(){const t=document.getElementById('bustan-trial'),h=document.documentElement;
 if(!t){h.style.removeProperty('--bk-trial');delete h.dataset.bkTrial;return}
 const set=()=>{h.style.setProperty('--bk-trial',t.offsetHeight+'px');h.dataset.bkTrial='1'};set();
 if(window.ResizeObserver&&!t.dataset.bkObs){t.dataset.bkObs='1';ro=ro||new ResizeObserver(()=>{if(t.isConnected)set()});ro.observe(t)}}
let q=0;const tick=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;apply();trial()})};
const start=()=>{tick();new MutationObserver(tick).observe(document.body,{childList:true,subtree:true})};
document.body?start():addEventListener('DOMContentLoaded',start);
})();
