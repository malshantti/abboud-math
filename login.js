/* الدخول: اختيار ملف الطالب من أبناء الحساب، رقم سري من ٤ أرقام، وزيتون يتفاعل */
(function(){
'use strict';
const P=window.PROFILES,$=s=>document.querySelector(s),view=$('#view'),zt=$('#zt'),bubble=$('#bubble');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const latin=s=>String(s).replace(/[٠-٩]/g,c=>c.charCodeAt(0)-0x660).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-0x6f0);
const q=new URLSearchParams(location.search);
const next=(()=>{const n=q.get('next')||'./';return /^(\.\/|g\d+\/[a-z]+\/)?([#?][\w\-\/=&#?.%]*)?$/.test(n)?n:'./'})();
const ICON={plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M5 12h14M13 6l6 6-6 6"/>',lock:'<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',go:'<path d="M19 12H5M11 6l-6 6 6 6"/>',moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'};
const svg=(k,s=22)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[k]}</svg>`;

// ---------- زيتون ----------
let pose='welcome',blinkT=0,idleT=0,hold=0;
function setPose(p){pose=p;zt.dataset.pose=p}
function say(t){bubble.textContent=t;bubble.classList.remove('say');void bubble.offsetWidth;bubble.classList.add('say')}
function blinkLoop(){clearTimeout(blinkT);blinkT=setTimeout(()=>{if(pose==='idle'&&!RM){zt.classList.add('blink');setTimeout(()=>zt.classList.remove('blink'),170);if(Math.random()<.25)setTimeout(()=>{zt.classList.add('blink');setTimeout(()=>zt.classList.remove('blink'),170)},260)}blinkLoop()},2200+Math.random()*3200)}
function rest(){clearTimeout(idleT);idleT=setTimeout(()=>{if(Date.now()<hold)return;if(!document.activeElement||!document.activeElement.closest||!document.activeElement.closest('.panel input'))setPose('idle')},250)}
function fx(cls,ms){zt.classList.remove(cls);void zt.offsetWidth;zt.classList.add(cls);setTimeout(()=>zt.classList.remove(cls),ms)}
zt.addEventListener('animationend',e=>{if(e.animationName==='enter')zt.classList.add('entered','idlebreathe')});
if(RM)zt.classList.add('entered');
setTimeout(()=>{if(pose==='welcome')setPose('idle')},RM?600:3900);
blinkLoop();
function confetti(){if(RM)return;const box=$('#confetti'),cols=['#6c854c','#dca349','#e2b657','#90ac70','#df8274','#6b96ac'];box.innerHTML='';
 for(let i=0;i<34;i++){const c=document.createElement('i');c.style.background=cols[i%cols.length];box.appendChild(c);
  const a=Math.random()*Math.PI*2,d=110+Math.random()*170,x=Math.cos(a)*d,y=Math.sin(a)*d*.8-120;
  c.animate([{transform:'translate(-50%,-50%) rotate(0) scale(.4)',opacity:1},{transform:`translate(${x}px,${y}px) rotate(${Math.random()*720-360}deg) scale(1)`,opacity:1,offset:.6},{transform:`translate(${x*1.1}px,${y+160}px) rotate(${Math.random()*900}deg) scale(.9)`,opacity:0}],{duration:1300+Math.random()*500,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'})}}
function celebrate(t){hold=Date.now()+60000;setPose('celebrate');say(t);fx('jump',1500);confetti()}
function oops(t){hold=Date.now()+1800;setPose('think');say(t);fx('shake',520);setTimeout(()=>{if(Date.now()>=hold&&pose==='think'){const a=document.activeElement;setPose(a&&a.matches&&a.matches('[data-pin]')?'shy':'idle')}},1850)}

// ---------- ربط الحقول بتفاعل زيتون ----------
function pinBox(id){return `<div class="pin" id="${id}"><span class="cell"><i></i></span><span class="cell"><i></i></span><span class="cell"><i></i></span><span class="cell"><i></i></span><input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="الرقم السري من أربعة أرقام" data-pin></div>`}
function bindPin(wrap,onFull){
 const inp=wrap.querySelector('input'),cells=[...wrap.querySelectorAll('.cell')];
 const paint=()=>{const n=inp.value.length;cells.forEach((c,i)=>{c.classList.toggle('on',i<n);c.classList.toggle('cur',i===Math.min(n,3))})};
 inp.addEventListener('focus',()=>{hold=0;wrap.classList.add('focus');setPose('shy');say('أغمضت عينيّ، لن أختلس النظر!');paint()});
 inp.addEventListener('blur',()=>{wrap.classList.remove('focus');zt.classList.remove('peek');rest()});
 inp.addEventListener('input',()=>{wrap.classList.remove('bad');inp.value=latin(inp.value).replace(/\D/g,'').slice(0,4);paint();if(!RM&&inp.value.length===2){zt.classList.add('peek');setTimeout(()=>zt.classList.remove('peek'),420)}if(inp.value.length===4&&onFull)onFull(inp.value)});
 paint();return inp}

// ---------- الشاشات ----------
let firstView=true;
function show(html,focusSel){view.innerHTML=`<div class="view-in">${html}</div>`;const f=firstView;firstView=false;if(focusSel&&!f){const el=view.querySelector(focusSel);if(el)setTimeout(()=>el.focus({preventScroll:true}),RM?0:350)}}
function saveError(){let m=$('#msg');if(!m){m=document.createElement('p');m.id='msg';view.append(m)}m.className='msg err';m.textContent=P.error()||'تعذّر الحفظ. أبقِ الصفحة مفتوحة ثم أعد المحاولة.';
 if(!$('#save-copy')){const b=document.createElement('button');b.type='button';b.id='save-copy';b.className='btn';b.textContent='تنزيل نسخة من التقدّم';b.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(P.backup())],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='نسخة-التقدم.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};m.after(b)}oops('لم يكتمل الحفظ؛ أبقِ الصفحة مفتوحة.');return false}
async function done(p){if(!p||(!(P.current()&&P.current().id===p.id)&&!await P.login(p.id)))return saveError();celebrate(`أهلًا ${p.name}! هيّا نتعلّم`);
 const m=view.querySelector('.msg');if(m){m.className='msg ok';m.textContent='تم الدخول بنجاح'}
 setTimeout(()=>location.replace(next),RM?250:1500);return true}
// الطلاب هم أبناء حساب ولي الأمر فقط (يضيفهم مع صفوفهم من صفحة الحساب). لا يُنشأ ملف من هذه الشاشة.
const ACCOUNT=new URL('admin-api/account',location.href).href;
const GRADES=['','الصف الأول','الصف الثاني','الصف الثالث','الصف الرابع','الصف الخامس','الصف السادس','الصف السابع','الصف الثامن','الصف التاسع','الصف العاشر','الصف الحادي عشر','الصف الثاني عشر'];
const account=()=>{try{return JSON.parse(localStorage.getItem('bustan_account'))}catch(e){return null}};
const signedIn=()=>!!account();
const LOGIN=()=>new URL('admin-api/account/login',location.href).href+'?return='+encodeURIComponent(new URL('login.html?sync=1',location.href).href);
let picking=false,pickNote='',checked=false,checkT=0;
// قائمة الخادم لهذا الحساب فقط: ملف محلي لا يظهر إلا إن كان مرتبطًا بطالب سجّله ولي الأمر.
function accountProfiles(){const r=P.roster(),acc=account();if(!r||!Array.isArray(r.students)||!acc||r.email!==acc.email)return null;
 return r.students.map(s=>{const p=P.find(s.local);return p?{p,s}:null}).filter(Boolean)}
const manageLink=()=>`<p class="manage"><a href="${esc(ACCOUNT)}">إدارة الطلاب من صفحة الحساب</a></p>`;
function pick(note){
 picking=true;pickNote=note||'';
 const a=accountProfiles();
 // على الاتصال: ننتظر قائمة الخادم قبل العرض حتى لا تظهر ملفات قديمة لحظة واحدة.
 if(!checked&&navigator.onLine){
  if(!checkT)checkT=setTimeout(()=>{checked=true;if(picking)pick(pickNote)},8000);
  say('لحظة، أجهّز أسماء الطلاب');
  show(`<h1>من يتعلّم اليوم؟</h1><p class="sub">نتحقق من حساب ولي الأمر المرتبط بهذا الجهاز...</p>`);return}
 if(!signedIn()){
  say('سجّل الدخول بحساب ولي الأمر أولًا');
  show(`<h1>سجّل الدخول أولًا</h1><p class="sub">يظهر هنا الطلاب الذين أضافهم ولي الأمر إلى حسابه. سجّل الدخول بحساب ولي الأمر على هذا الجهاز مرة واحدة.</p>
  <div class="actions"><a class="btn" id="signin" href="${esc(LOGIN())}">${svg('lock',18)} تسجيل الدخول</a></div>${note?`<p class="msg ok">${esc(note)}</p>`:''}`);
  let kicked=false;try{kicked=localStorage.getItem('bustan_kicked')==='1'}catch(e){}
  if(navigator.onLine&&!note&&!kicked)location.replace(LOGIN());// جهاز أُغلقت جلسته: تبقى رسالة sync.js ظاهرة
  return}
 say(note||'من سيتعلّم اليوم؟');if(pose!=='welcome')setPose('idle');
 if(!a||!a.length){show(`<h1>من يتعلّم اليوم؟</h1><p class="sub">لم يُضف ولي الأمر طلابًا إلى الحساب بعد. أضف كل طالب مع صفه ورقمه السري من صفحة الحساب.</p><div class="actions"><a class="btn" href="${esc(ACCOUNT)}">إضافة الطلاب</a></div>${note?`<p class="msg ok">${esc(note)}</p>`:''}`);return}
 show(`<h1>من يتعلّم اليوم؟</h1><p class="sub">اختر اسمك، ثم اكتب رقمك السري.</p>
  <div class="profiles">${a.map(({p,s})=>{const subj=Array.isArray(s.subjects)?(s.subjects.length?s.subjects.join('، '):'لا مواد مفعّلة'):'';
   return `<button type="button" class="pcard" data-id="${esc(p.id)}"><img src="${P.avatarSrc(p.avatar)}" alt="" width="72" height="72"><b>${esc(p.name)}</b><small>${esc(s.grade_name||GRADES[s.grade]||'لم يُحدَّد الصف')}</small>${subj?`<span class="subj">${esc(subj)}</span>`:''}</button>`}).join('')}</div>
  ${manageLink()}
  ${note?`<p class="msg ok">${esc(note)}</p>`:''}`);
 view.querySelectorAll('.pcard[data-id]').forEach(b=>b.onclick=()=>{const p=P.find(b.dataset.id);p.pin?enter(p):setpin(p)})}
addEventListener('bustan-roster',()=>{checked=true;clearTimeout(checkT);if(picking)pick(pickNote)});
function enter(p){
 picking=false;
 say(`أهلًا ${p.name}! اكتب رقمك السري`);setPose('idle');
 show(`<div class="who"><img src="${P.avatarSrc(p.avatar)}" alt="" width="58" height="58"><div><h1>${esc(p.name)}</h1><p class="sub" style="margin:0">اكتب رقمك السري المكوّن من ٤ أرقام</p></div></div>
  ${pinBox('pinIn')}<p class="msg" id="msg"></p>
  <div class="actions"><button type="button" class="btn ghost" id="back">${svg('back',18)} ملف آخر</button></div>`,'#pinIn input');
 const wrap=$('#pinIn'),msg=$('#msg');
 const inp=bindPin(wrap,async v=>{const lock=P.lockedFor(p.id);if(lock){msg.className='msg err';msg.textContent=`محاولات كثيرة. انتظر ${AR(Math.ceil(lock/1000))} ثانية.`;inp.value='';return}
  if(await P.check(p.id,v)){inp.blur();done(p)}else{const n=P.fail(p.id);wrap.classList.add('bad');inp.value='';wrap.querySelectorAll('.cell').forEach(c=>c.classList.remove('on'));msg.className='msg err';msg.textContent=n>=5?'محاولات كثيرة. انتظر ٣٠ ثانية ثم حاول.':'الرقم غير صحيح، حاول مرة أخرى.';inp.blur();oops('لا بأس، جرّب مرة أخرى!');if(!RM){wrap.animate([{transform:'translateX(0)'},{transform:'translateX(-10px)'},{transform:'translateX(10px)'},{transform:'translateX(-6px)'},{transform:'translateX(0)'}],{duration:380})}}});
 $('#back').onclick=()=>pick()}
function twoPins(title,sub,extra,onOk){
 picking=false;
 show(`${title}<p class="sub">${sub}</p>${extra||''}<div class="field"><span>رقم سري من ٤ أرقام</span>${pinBox('p1')}</div><div class="field"><span>أعد كتابة الرقم للتأكيد</span>${pinBox('p2')}</div><p class="msg" id="msg"></p>
  <div class="actions"><button type="button" class="btn" id="ok" disabled>${svg('lock',18)} احفظ وادخل</button>${P.list().length?`<button type="button" class="btn ghost" id="back">${svg('back',18)} رجوع</button>`:''}</div>
  <p class="note">${svg('lock',16)}<span>الرقم السري يميّز ملفات الإخوة على هذا الجهاز. يستطيع ولي الأمر تحديده أو تغييره من صفحة الحساب.</span></p>`,extra?'#nm':'#p1 input');
 const msg=$('#msg'),ok=$('#ok');let a='',b='';
 const i1=bindPin($('#p1'),v=>{a=v;$('#p2 input').focus()}),i2=bindPin($('#p2'),v=>{b=v;check()});
 const check=()=>{a=i1.value;b=i2.value;const nm=$('#nm');const nameOk=!nm||nm.value.trim().length>=2;const good=a.length===4&&b.length===4&&a===b&&nameOk;ok.disabled=!good;
  if(a.length===4&&b.length===4&&a!==b){msg.className='msg err';msg.textContent='الرقمان غير متطابقين.';$('#p2').classList.add('bad');oops('الرقمان مختلفان، أعد المحاولة')}else{msg.className='msg';msg.textContent=nameOk||!nm?'':'اكتب اسمًا من حرفين على الأقل.'}};
 [i1,i2].forEach(i=>i.addEventListener('input',check));if($('#nm'))$('#nm').addEventListener('input',check);
 ok.onclick=async()=>{check();if(ok.disabled)return;ok.disabled=true;try{if(await onOk(i1.value)===false)ok.disabled=false}catch(e){saveError();ok.disabled=false}};
 if($('#back'))$('#back').onclick=()=>pick()}
function setpin(p){
 say(`أهلًا ${p.name}! تقدّمك محفوظ، اختر رقمًا سريًا`);setPose('idle');
 twoPins(`<div class="who"><img src="${P.avatarSrc(p.avatar)}" alt="" width="58" height="58"><div><h1>${esc(p.name)}</h1></div></div>`,'لم يحدّد ولي الأمر رقمًا سريًا لك بعد. اختر أربعة أرقام تتذكّرها، وستكتبها في كل دخول.','',async pin=>{if(!await P.setPin(p.id,pin))throw Error('storage');return done(P.find(p.id))})}

// ---------- البداية ----------
const tb=$('#theme');const paint=()=>{tb.innerHTML=svg(document.documentElement.dataset.theme==='dark'?'sun':'moon',22)};paint();
tb.onclick=()=>{const d=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=d;try{localStorage.setItem('abboud_theme',d)}catch(e){}paint()};
async function start(){if(!await P.ready){pick();saveError();return}
 if(q.has('logout')||q.has('switch')){const ok=await P.logout();pick(ok&&q.has('logout')?'تم تسجيل الخروج، وتقدّمك محفوظ.':'');if(!ok)saveError()}
 else if(P.current()&&(!signedIn()||(P.roster()&&!P.accountStudent(P.current().id)))){await P.logout();pick()}// لا حساب مرتبط أو ملف لا يخصّ الحساب
 else if(P.current())location.replace(next);
 else pick();
}start();
})();
