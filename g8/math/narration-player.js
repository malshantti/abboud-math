/* «استمع إلى الشرح»: ملفات صوتية مسجّلة مسبقًا فقط (لا توليد كلام في المتصفح). مقطع لكل جملة مع تظليلها. */
(function(){'use strict';
let au=null,q=[],i=0,id=null,state='idle',fails=0;
const N=()=>window.MATH_NARR,btn=()=>document.getElementById('narr'),st=()=>document.getElementById('narr-st');
const icon=n=>window.ICON?window.ICON(n):'';
function label(){const b=btn();if(!b)return;const on=state==='playing';b.setAttribute('aria-pressed',String(on));b.classList.toggle('playing',on);b.innerHTML=on?icon('pause')+' إيقاف مؤقت':state==='paused'?icon('play')+' متابعة الاستماع':icon('play')+' استمع إلى الشرح'}
function mark(k){document.querySelectorAll('.narr-on').forEach(e=>e.classList.remove('narr-on'));if(!k)return;const e=document.querySelector('[data-nk="'+k+'"]');if(e){e.classList.add('narr-on');if(e.scrollIntoView)e.scrollIntoView({block:'nearest',behavior:'smooth'})}}
function stop(){if(au){au.pause();au.onended=au.onerror=null}state='idle';i=0;mark(null);label()}
function finish(msg){stop();const s=st();if(s)s.textContent=msg||''}
function next(){i++;if(i<q.length)play();else finish(fails&&fails===q.length?'التسجيل الصوتي غير متاح الآن، ويمكنك قراءة الشرح.':'')}
function play(){const k=q[i];mark(k);if(!au){au=new Audio();au.preload='none'}au.volume=.35;au.onended=next;au.onerror=()=>{fails++;next()};au.src=N().base+id+'/'+k+'.mp3';state='playing';label();
 let p;try{p=au.play()}catch(e){fails++;return next()}if(p&&p.catch)p.catch(()=>{if(state==='playing'){state='paused';label()}})}
function toggle(b){if(state==='playing'){au.pause();state='paused';label();return}
 if(state==='paused'&&id===b.dataset.id){state='playing';label();const p=au.play();if(p&&p.catch)p.catch(()=>{state='paused';label()});return}
 id=b.dataset.id;q=(N().L[id]||[]).slice();i=0;fails=0;const s=st();if(s)s.textContent='';if(q.length)play()}
if(typeof document!=='undefined'&&document.addEventListener){document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#narr');if(b&&N())toggle(b)});
 addEventListener('hashchange',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing'){au.pause();state='paused';label()}})}
window.MATH_NARR_PLAYER={toggle,stop,get state(){return state},get index(){return i}};
})();
