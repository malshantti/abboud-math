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
// الوضع الليلي نفسه في كل المواد (المفتاح المشترك abboud_theme)
try{if(!document.documentElement.dataset.theme)document.documentElement.dataset.theme=localStorage.getItem('abboud_theme')||'light'}catch(e){}
// الصفوف الدنيا تعرّف الخطوط باسم G1Baloo/G1Cairo؛ نعرّف Baloo وCairo من الملفات نفسها لعناصر الواجهة الموحّدة
if(+m[1]<6){const f=document.createElement('style'),u=n=>"url('"+root+'assets/fonts/'+n+".woff2') format('woff2')",ar='unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF';
 f.textContent='@font-face{font-family:Baloo;src:'+u('baloo-arabic')+';font-weight:400 800;font-display:swap;'+ar+'}@font-face{font-family:Baloo;src:'+u('baloo-latin')+';font-weight:400 800;font-display:swap}@font-face{font-family:Cairo;src:'+u('cairo-arabic')+';font-weight:200 1000;font-display:swap;'+ar+'}@font-face{font-family:Cairo;src:'+u('cairo-latin')+';font-weight:200 1000;font-display:swap}';document.head.append(f)}
const css=document.createElement('link');css.rel='stylesheet';const cu=new URL('shell.css',me);cu.search=me.search;css.href=cu.href;document.head.append(css);
const brandHTML='<img class="bk-logo" src="'+root+'assets/brand/logo-mascot-sm.webp" width="44" height="58" alt=""><span class="bk-name"><b>بستان التعلّم</b><small>نزرع الفهم، ونحصد المعرفة</small></span>';
const ico={chev:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 user:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M16 7h5M19 4l2 3-2 3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 swap:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 8h13l-3-3M20 16H7l3 3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 moon:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linejoin="round"/></svg>',
 sun:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
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
// زر الوضع الليلي لصفحات الصفوف الدنيا (صفحات الصفين السادس والثامن لها زرها الخاص #theme)
function themeBtn(){const b=document.createElement('button');b.type='button';b.className='bk-theme';
 const paint=()=>{const d=document.documentElement.dataset.theme==='dark';b.innerHTML=d?ico.sun:ico.moon;b.setAttribute('aria-label',d?'الوضع النهاري':'الوضع الليلي');b.title=b.getAttribute('aria-label')};
 b.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('abboud_theme',t)}catch(e){}paint()});paint();return b}
// الشريط العلوي للصفوف الدنيا: المسار «بستان التعلّم / الصفحة» وزر الوضع الليلي فقط، بلا عدّادات تشتّت الطفل
function earlyTop(){const t=document.querySelector('.g1-topbar');if(!t||t.dataset.bk)return;t.dataset.bk='1';
 const ttl=t.querySelector('.j-topbar-title'),cur=document.querySelector('.g1-nav a[aria-current] .g1-nav-full');
 const page=(cur&&cur.textContent)||(ttl&&ttl.firstChild&&ttl.firstChild.textContent.trim())||'رحلتي';
 const crumb=document.createElement('a');crumb.className='bk-crumb';crumb.href='#/home';
 crumb.innerHTML='<img class="bk-logo-sm" src="'+root+'assets/brand/logo-mascot-sm.webp" width="30" height="40" alt=""><span class="bk-crumb-home">بستان التعلّم</span><span class="bk-crumb-sep" aria-hidden="true">/</span><span class="bk-crumb-page">'+esc(page)+'</span>';
 if(ttl)ttl.replaceWith(crumb);else t.prepend(crumb);
 const acts=t.querySelector('.g1-actions')||t;acts.querySelectorAll('.g1-switch').forEach(x=>x.remove());
 const con=acts.querySelector('.g1-connection');if(con&&navigator.onLine)con.hidden=true;
 const me2=document.createElement('a');me2.className='bk-me';me2.href=root+'login.html?switch=1';me2.setAttribute('aria-label','تبديل الطالب');me2.title='تبديل الطالب';me2.textContent=Array.from(name()||'ط')[0];
 acts.append(themeBtn(),me2)}
function apply(){
 earlyTop();
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
  const a=js.querySelector('.g1-brand');if(a){a.classList.add('bk-brand');a.href='#/home';a.innerHTML=brandHTML;a.setAttribute('aria-label','بستان التعلّم — الصفحة الرئيسية للمادة');a.after(card())}
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
