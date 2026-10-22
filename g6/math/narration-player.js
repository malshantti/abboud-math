/* «استمع إلى الشرح»: ملفات صوتية مسجّلة مسبقًا فقط (لا توليد كلام في المتصفح). مقطع لكل جملة مع تظليلها.
   يبدأ تلقائيًا عند فتح الدرس (أو عند أول لمسة إن منع المتصفح التشغيل)، ما لم يوقفه المستخدم؛ ويُحفظ اختياره على الجهاز. */
(function(){'use strict';
const KEY='math_narr_auto';
let au=null,q=[],i=0,id=null,state='idle',fails=0,armed=null,autoDone=null;
const N=()=>window.MATH_NARR,btn=()=>document.getElementById('narr'),st=()=>document.getElementById('narr-st');
const icon=n=>window.ICON?window.ICON(n):'';
const store=()=>{try{return window.localStorage}catch(e){return null}};
const auto=()=>{const s=store();return !s||s.getItem(KEY)!=='0'};
const setAuto=on=>{const s=store();try{s&&s.setItem(KEY,on?'1':'0')}catch(e){}const c=document.getElementById('narr-auto');if(c)c.checked=on};
function stopBar(){let b=document.getElementById('narr-stop');const on=state==='playing'||state==='paused'||state==='waiting';
 if(on&&!b&&document.createElement&&document.body){b=document.createElement('button');b.type='button';b.id='narr-stop';b.className='narr-stop';b.innerHTML=icon('x')+' إيقاف الصوت';document.body.appendChild(b)}
 if(b)b.hidden=!on}
function label(){const b=btn();stopBar();if(!b)return;const on=state==='playing';b.setAttribute('aria-pressed',String(on));b.classList.toggle('playing',on);b.innerHTML=on?icon('pause')+' إيقاف مؤقت':state==='paused'?icon('play')+' متابعة الاستماع':state==='waiting'?icon('play')+' المس الشاشة لبدء الشرح الصوتي':icon('play')+' استمع إلى الشرح'}
function mark(k){document.querySelectorAll('.narr-on').forEach(e=>e.classList.remove('narr-on'));if(!k)return;const e=document.querySelector('[data-nk="'+k+'"]');if(e){e.classList.add('narr-on');if(e.scrollIntoView)e.scrollIntoView({block:'nearest',behavior:'smooth'})}}
function disarm(){if(armed){['pointerdown','keydown','touchstart'].forEach(t=>document.removeEventListener&&document.removeEventListener(t,armed,true));armed=null}}
function stop(){disarm();if(au){au.pause();au.onended=au.onerror=null}state='idle';i=0;mark(null);label()}
function finish(msg){stop();const s=st();if(s)s.textContent=msg||''}
function next(){i++;if(i<q.length)play();else finish(fails&&fails===q.length?'التسجيل الصوتي غير متاح الآن، ويمكنك قراءة الشرح.':'')}
function waitGesture(){state='waiting';label();if(armed||!document.addEventListener)return;armed=()=>{disarm();if(state==='waiting')play()};['pointerdown','keydown','touchstart'].forEach(t=>document.addEventListener(t,armed,true))}
function play(){const k=q[i];mark(k);if(!au){au=new Audio();au.preload='none'}au.volume=.35;au.onended=next;au.onerror=()=>{fails++;next()};if(!au.src||au.src.indexOf(id+'/'+k+'.mp3')<0)au.src=N().base+id+'/'+k+'.mp3';state='playing';label();
 let p;try{p=au.play()}catch(e){fails++;return next()}if(p&&p.catch)p.catch(err=>{if(state!=='playing')return;if(err&&err.name==='NotAllowedError')waitGesture();else{state='paused';label()}})}
function start(lesson){id=lesson;q=(N().L[id]||[]).slice();i=0;fails=0;const s=st();if(s)s.textContent='';if(q.length)play()}
function toggle(b){if(state==='playing'){au.pause();state='paused';label();return}
 if((state==='paused'||state==='waiting')&&id===b.dataset.id){disarm();play();return}
 setAuto(true);start(b.dataset.id)}
function autostart(){const b=btn();if(!b||!N()||!auto()||autoDone===b.dataset.id||state!=='idle')return;autoDone=b.dataset.id;start(b.dataset.id)}
if(typeof document!=='undefined'&&document.addEventListener){
 document.addEventListener('click',e=>{const t=e.target;if(t.closest&&t.closest('#narr-stop')){stop();setAuto(false);return}const b=t.closest&&t.closest('#narr');if(b&&N())toggle(b)});
 document.addEventListener('change',e=>{if(e.target&&e.target.id==='narr-auto'){setAuto(e.target.checked);if(!e.target.checked&&state!=='idle')stop()}});
 addEventListener('hashchange',()=>{stop();autoDone=null});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing'){au.pause();state='paused';label()}});
 if(typeof MutationObserver!=='undefined'&&document.body)new MutationObserver(()=>{const c=document.getElementById('narr-auto');if(c&&c.checked!==auto())c.checked=auto();if(btn())setTimeout(autostart,400);else if(state!=='idle')stop()}).observe(document.body,{childList:true,subtree:true})}
window.MATH_NARR_PLAYER={toggle,stop,autostart,get state(){return state},get index(){return i},get auto(){return auto()}};
})();
