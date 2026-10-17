/* الصفحة العامة: العينة في الذاكرة فقط. لا تنشئ ملفًا ولا تسجّل تقدّمًا. */
(function(){
'use strict';
const $=s=>document.querySelector(s),visitor=$('#visitor-home'),student=$('#student-home');
let activeSession=null,activeOwner=null;
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
function script(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.append(s)})}
function showVisitor(message){visitor.hidden=false;student.hidden=true;activeSession=null;activeOwner=null;document.documentElement.dataset.entry='visitor';document.title='بستان التعلّم — كل فكرة تنمو معك';$('.skip').href='#visitor-main';if(message){$('#entry-message').hidden=false;$('#entry-message').textContent=message}}
function stillOwns(){try{const profiles=JSON.parse(localStorage.getItem('bustan_profiles')||'[]');return activeSession===localStorage.getItem('bustan_session')&&activeOwner===localStorage.getItem('bustan_owner')&&Array.isArray(profiles)&&profiles.some(p=>p&&p.id===activeOwner)&&!localStorage.getItem('bustan_transition')&&!localStorage.getItem('bustan_restore')}catch(e){return false}}
function changed(){showVisitor('تغيّر ملف الطالب في تبويب آخر. افتح صفحة الدخول للمتابعة بملفك الصحيح.');window.scrollTo({top:0,behavior:'instant'})}
document.addEventListener('click',e=>{if(!student.hidden&&!stillOwns()){e.preventDefault();e.stopImmediatePropagation();changed()}},true);
window.addEventListener('storage',e=>{if(activeSession&&[null,'bustan_session','bustan_owner','bustan_profiles','bustan_transition','bustan_restore'].includes(e.key)&&!stillOwns())changed()});
async function enter(){
 let s=null,owner=null,profiles=[],raw=null,pending=false;
 try{raw=localStorage.getItem('bustan_session');s=JSON.parse(raw||'null');owner=localStorage.getItem('bustan_owner');profiles=JSON.parse(localStorage.getItem('bustan_profiles')||'[]');pending=!!(localStorage.getItem('bustan_transition')||localStorage.getItem('bustan_restore'))}catch(e){}
 const plain=()=>{document.documentElement.dataset.entry='visitor'};
 if(new URLSearchParams(location.search).has('welcome'))return plain();
 if(!s||s.pending||pending||owner!==s.id||!Array.isArray(profiles)||!profiles.some(p=>p&&p.id===s.id))return plain();
 try{
  await script('profiles.js');
  if(!await window.PROFILES.ready||!window.PROFILES.current()||window.PROFILES.current().id!==s.id){showVisitor('افتح ملفك من صفحة الدخول للمتابعة. تقدّمك المحفوظ باقٍ على هذا الجهاز.');return}
  activeSession=raw;activeOwner=owner;if(!stillOwns()){changed();return}
  await script('catalog.js');
  await script('entry.js');
  if(!stillOwns()){changed();return}
  student.querySelectorAll('img[data-src]').forEach(img=>{img.src=img.dataset.src});
  visitor.hidden=true;student.hidden=false;document.documentElement.dataset.entry='student';
  document.title='بستان التعلّم — اختر صفك ومادتك';
  $('.skip').href='#main';
 }catch(e){showVisitor('تعذّر فتح قائمة المواد. أعد المحاولة أو افتح صفحة الدخول. لا تغلق درسًا لم يُحفظ بعد.')}
}
const pieces=Array.from(document.querySelectorAll('[data-piece]')),feedback=$('#fraction-feedback');
function paint(){const n=pieces.filter(b=>b.getAttribute('aria-pressed')==='true').length;$('#piece-count').textContent=AR(n);feedback.textContent='اختر أجزاء متساوية، ثم تحقّق من فكرتك.';feedback.dataset.state='idle'}
pieces.forEach(b=>b.addEventListener('click',()=>{b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));paint()}));
$('#check-fraction').addEventListener('click',()=>{const n=pieces.filter(b=>b.getAttribute('aria-pressed')==='true').length;feedback.dataset.state=n===2?'correct':'try';feedback.textContent=n===2?'أحسنت! جزآن من أربعة أجزاء متساوية يساويان النصف.':'تأمّل المستطيل: النصف يقسمه إلى مجموعتين متساويتين. جرّب مرة أخرى.'});
$('#reset-fraction').addEventListener('click',()=>{pieces.forEach(b=>b.setAttribute('aria-pressed','false'));paint();pieces[0].focus()});
const rm=matchMedia('(prefers-reduced-motion: reduce)');
if(!rm.matches&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>{el.classList.add('will-reveal');observer.observe(el)});rm.addEventListener('change',e=>{if(e.matches){observer.disconnect();document.querySelectorAll('.will-reveal').forEach(el=>el.classList.add('is-visible'))}})}
enter();
})();
