(function(){
'use strict';
const C=window.CURR,KEY='abboud_math_v1',$=s=>document.querySelector(s),FX=window.FX,I=window.ICON,LAB=window.LAB;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const pick=a=>a[Math.floor(Math.random()*a.length)];
// ---------- الفهرس ----------
const PRE={};C.prerequisites.forEach(p=>PRE[p.id]=p);
const LES={},UNITS={};
C.semesters.forEach(s=>s.units.forEach(u=>{UNITS[u.id]=Object.assign({sem:s},u);u.lessons.forEach(l=>{l.unit=u.id;l.sem=s.id;l.review=/تمارين عامة/.test(l.title);LES[l.id]=l})}));
const FULL={has:()=>true};
const ALLSK=[...C.prerequisites.map(p=>p.id),...Object.values(LES).filter(l=>!l.review).map(l=>l.id)];
const title=id=>PRE[id]?PRE[id].title:LES[id]?LES[id].title:UNITS[id]?UNITS[id].title:id;
const short=t=>{t=t.split(/[،(:]/)[0].trim();const w=t.split(' ');return w.length>4?w.slice(0,4).join(' ')+'…':t};
const depth={};const dep=id=>depth[id]!=null?depth[id]:(depth[id]=1+Math.max(0,...(PRE[id].depends_on||[]).map(dep)));C.prerequisites.forEach(p=>dep(p.id));
const COVER={U1:'u1',U2:'u2',U3:'u3',U4:'u4',U5:'u5',U6:'u6',U7:'u7',U8:'u8'};
// محطات رحلة التشخيص (مجالات الرادار)
const STATIONS=[
 {id:'int',name:'وادي الأعداد الصحيحة',short:'الأعداد',cover:'basics',skills:['P01','P02','P08'],cls:'سيّاف الأعداد'},
 {id:'frac',name:'مخبز الكسور',short:'الكسور',cover:'u1',skills:['P03','P04','P05','P06','P22'],cls:'طاهي الكسور'},
 {id:'alg',name:'برج الرموز',short:'الجبر',cover:'u2',skills:['P07','P09','P10','P11'],cls:'ساحر الرموز'},
 {id:'geo',name:'قلعة الأشكال',short:'الهندسة',cover:'u3',skills:['P12','P13','P14','P15','P16','P17'],cls:'مهندس القلاع'},
 {id:'data',name:'سوق البيانات',short:'البيانات',cover:'u4',skills:['P18','P19','P21','P20'],cls:'قارئ النجوم'}];
const RANKS=['البذرة الصاعدة','المستكشف','المحارب','صانع الأدوات','الفارس','المهندس','العبقري','البطل'];
// ---------- الحالة (متوافقة مع الإصدارات السابقة) ----------
function fresh(){return{name:'عبّود',created:new Date().toISOString(),points:0,streak:0,lastDay:null,time:0,skills:{},mis:{},diag:null,quizzes:[],sessions:[]}}
let S;try{S=JSON.parse(localStorage.getItem(KEY))||fresh()}catch(e){S=fresh()}
const norm=()=>{S.points=+S.points||0;S.time=+S.time||0;S.streak=+S.streak||0;S.created=S.created||new Date().toISOString();S.sessions=S.sessions||[];S.hearts=S.hearts==null?5:+S.hearts;S.hLost=S.hLost||0;S.ach=S.ach||{};S.daily=S.daily||{date:today(),n:0};S.goal=S.goal||10;S.quizzes=S.quizzes||[];S.mis=S.mis||{};S.skills=S.skills||{};S.review=S.review||{};S.games=S.games||{};S.dch=S.dch||null;S.labs=S.labs||{};S.reviewed=S.reviewed||0};norm();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}hdr()};
const sk=id=>S.skills[id]||(S.skills[id]={status:'untested',att:0,cor:0,best:null,time:0,run:0});
function status(id){const s=sk(id).status;if(PRE[id])return s;if(s==='untested'&&locked(id))return'locked';return s}
function locked(id){const l=LES[id];if(!l||S.skills[id]&&S.skills[id].unlocked)return false;
 return (l.prerequisites||[]).some(p=>{const st=sk(p).status;return st==='weak'||st==='untested'})}
const SL={mastered:'متقَن',learning:'قيد التعلّم',weak:'يحتاج تقوية',untested:'لم يُختبر',locked:'مقفل'};
const SI={mastered:'check',learning:'book',weak:'dumbbell',untested:'question',locked:'lock'};
const chip=(id,txt)=>{const st=status(id);return`<a class="chip st-${st}" href="#/lesson/${id}">${I(SI[st],'sm')}${esc(txt||title(id))}</a>`};
const XPL=200,level=()=>1+Math.floor(S.points/XPL);
function dailyN(){if(S.daily.date!==today())S.daily={date:today(),n:0};return S.daily.n}
const PTSH=[],LOADH=[];
function addPts(n,el){const before=level();S.points+=n;if(cur)sk(cur).lastAt=Date.now();PTSH.forEach(f=>{try{f(n)}catch(e){}});const d=today();
 if(S.lastDay!==d){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak=S.lastDay===y?S.streak+1:1;S.lastDay=d}
 FX.pop('+'+n+' XP',el);setTimeout(()=>FX.bump('hpts'),300);
 if(level()>before){const L=FX.lvInfo(level());setTimeout(()=>{FX.mega();FX.modal(`${FX.rankImg(level(),140,'badge-big')}<h2>مستوى جديد: ${level()}</h2><p>أصبحت الآن <b>«${L.name}»</b><br>استمر يا ${esc(S.name)}، أنت تتقدم بسرعة!</p>`)},600)}}
function countCorrect(){dailyN();S.daily.n++;if(S.daily.n===S.goal)setTimeout(()=>{FX.mega();FX.toast(I('target')+' حققت هدف اليوم! +30 XP');addPts(30)},900)}
function progress(){const m=ALLSK.filter(i=>sk(i).status==='mastered').length;return Math.round(100*m/ALLSK.length)}
function hearts(){const k=Math.floor((Date.now()-(S.hLost||0))/(20*60e3));if(k>0&&S.hearts<5){S.hearts=Math.min(5,S.hearts+k);S.hLost=Date.now()}return S.hearts}
function hdr(){const hh=$('#hhearts');if(hh)hh.textContent=hearts();$('#hpts').textContent=S.points;$('#hstreak').textContent=S.streak;$('#hlvl').textContent=level();$('#hname').textContent=S.name;
 $('#hlvlname').textContent=FX.lvInfo(level()).name;$('#hrank').innerHTML=FX.rankImg(level(),30);const x=S.points%XPL;$('#hxp').style.width=(100*x/XPL)+'%';$('#hxpt').textContent=x+'/'+XPL;
 $('#hflame').classList.toggle('off',S.lastDay!==today());const rc=dueReviews().length,b=$('#revbadge');if(b){b.textContent=rc;b.hidden=!rc}}
function noteMis(m,id){if(!m)return;const o=S.mis[m]||(S.mis[m]={n:0,skills:{}});o.n++;o.skills[id]=(o.skills[id]||0)+1}
// ---------- قائمة مراجعة الأخطاء (تكرار متباعد: صناديق لايتنر) ----------
const BOXD=[0,1,3,7,14];
function addReview(id,mis){if(!window.hasGen(id)&&!/^S\d-\d-/.test(id))return;const r=S.review[id]||{box:0,due:Date.now(),n:0,mis:null};r.box=0;r.due=Date.now();r.n++;if(mis)r.mis=mis;S.review[id]=r}
const dueReviews=()=>Object.entries(S.review).filter(([,r])=>r.due<=Date.now()).map(([id])=>id);
function reviewResult(id,ok){const r=S.review[id];if(!r)return;if(ok){r.box++;S.reviewed++;if(r.box>=BOXD.length){delete S.review[id];FX.toast(I('check')+' أتقنت مراجعة: '+esc(short(title(id))))}else r.due=Date.now()+BOXD[r.box]*864e5}else{r.box=0;r.due=Date.now()}}
// ---------- الإنجازات ----------
const totCor=()=>Object.values(S.skills).reduce((a,s)=>a+(s.cor||0),0);
const nMast=()=>ALLSK.filter(i=>sk(i).status==='mastered').length;
const ACH=[
 ['first','target','أول خطوة','أول إجابة صحيحة',()=>totCor()>=1],
 ['diag','journey','المستكشف','أنهيت رحلة تحديد المستوى',()=>!!S.diag],
 ['c10','hand','عشرة على عشرة','10 إجابات صحيحة',()=>totCor()>=10],
 ['c50','dumbbell','لا يتوقف','50 إجابة صحيحة',()=>totCor()>=50],
 ['c200','rocket','صاروخ','200 إجابة صحيحة',()=>totCor()>=200],
 ['m1','star','أول إتقان','أتقنت مهارة واحدة',()=>nMast()>=1],
 ['m5','spark','خمس نجوم','أتقنت 5 مهارات',()=>nMast()>=5],
 ['m15','crown','سلسلة نجوم','أتقنت 15 مهارة',()=>nMast()>=15],
 ['base','shield','الأساس متين','أتقنت كل الأساسيات',()=>C.prerequisites.every(p=>sk(p.id).status==='mastered')],
 ['u1','fraction','سيد الأعداد','أتقنت الوحدة الأولى',()=>UNITS.U1.lessons.filter(l=>!l.review).every(l=>sk(l.id).status==='mastered')],
 ['u2','tiles','سيد الجبر','أتقنت الوحدة الثانية',()=>UNITS.U2.lessons.filter(l=>!l.review).every(l=>sk(l.id).status==='mastered')],
 ['q100','medal','علامة كاملة','100% في اختبار',()=>S.quizzes.some(q=>q.score===100)],
 ['q5','quiz','مختبِر','أنهيت 5 اختبارات',()=>S.quizzes.length>=5],
 ['s3','flame','ثلاثة أيام','3 أيام متتالية',()=>S.streak>=3],
 ['s7','bolt','أسبوع ناري','7 أيام متتالية',()=>S.streak>=7],
 ['goal','target','هدف اليوم','أنجزت هدف اليوم',()=>S.daily&&S.daily.date===today()&&S.daily.n>=S.goal||!!S.ach.goal],
 ['lab','lab','عالِم صغير','جربت 3 أدوات في المختبر',()=>Object.keys(S.labs).length>=3],
 ['race','race','سريع البرق','15 نقطة في سباق الأعداد',()=>(S.games.race||0)>=15],
 ['rev','review','لا أكرر خطئي','10 مراجعات صحيحة',()=>S.reviewed>=10],
 ['dch','calendar','بطل التحدي','أنهيت تحدي اليوم',()=>!!(S.dch&&S.dch.done)],
 ['t60','clock','ساعة تعلّم','60 دقيقة تعلّم',()=>S.time>=3600],
 ['p1000','trophy','ألف نقطة','1000 نقطة',()=>S.points>=1000],
];
const medal=(ic,on)=>`<svg viewBox="0 0 80 80" class="medal ${on?'on':''}" aria-hidden="true"><defs><linearGradient id="mg${on?1:0}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${on?'#ffe08a':'#e5e7eb'}"/><stop offset="1" stop-color="${on?'#f59e0b':'#9ca3af'}"/></linearGradient></defs><path d="M28 2h24l-6 20H34z" fill="${on?'#7c5cff':'#cbd5e1'}"/><circle cx="40" cy="46" r="30" fill="url(#mg${on?1:0})"/><circle cx="40" cy="46" r="23" fill="${on?'#fff7e0':'#f3f4f6'}" stroke="${on?'#d97706':'#cbd5e1'}" stroke-width="2"/></svg><span class="medal-ic">${I(ic)}</span>`;
function checkAch(){let n=0;ACH.forEach(a=>{if(!S.ach[a[0]]&&a[4]()){S.ach[a[0]]=new Date().toISOString();n++;setTimeout(()=>{FX.toast(`${I(a[1])} إنجاز جديد: <b>${a[2]}</b>`);FX.confetti(innerWidth/2,90,50,6)},1200+n*900)}});if(n)save()}
// تتبع الوقت + تنظيف عند مغادرة الصفحة
let cur=null,leave=[];setInterval(()=>{if(cur&&document.visibilityState==='visible'){S.time+=5;sk(cur).time+=5;if(S.time%30===0)save()}},5000);
// ---------- الشخصية ----------
const MROW=(pose,msg)=>`<div class="mrow" id="mascot">${FX.MASCOT(pose||'think','m-img')}<div class="m-bubble ${msg?'show':''}">${esc(msg||'')}</div></div>`;
// ---------- عرض سؤال ----------
// mode: practice | test | diag (مع شريط الثقة)
function renderOld(el,id,item,mode,done){let si=0,firstTry=true,usedHint=false,conf=2;
 const draw=()=>{const s=item.steps[si];const multi=item.steps.length>1;
  el.innerHTML=(multi?`<div class="stepdots">${item.steps.map((_,i)=>`<i class="${i<=si?'on':''}"></i>`).join('')}</div><div class="muted">خطوة ${si+1} من ${item.steps.length}</div>`:'')+
  `<div class="q">${esc(s.q)}</div>`+
  (mode==='diag'?`<div class="conf" role="radiogroup" aria-label="كم أنت متأكد؟"><span>كم أنت متأكد قبل أن تجيب؟</span><div class="conf-seg">${[[1,'أخمّن'],[2,'متأكد نوعاً ما'],[3,'متأكد جداً']].map(([v,t])=>`<button role="radio" aria-checked="${v===conf}" class="cseg ${v===conf?'on':''}" data-c="${v}">${t}</button>`).join('')}</div></div>`:'')+
  `<div class="choices">${s.choices.map((c,i)=>`<button class="choice" data-i="${i}">${esc(c.t)}</button>`).join('')}</div>`+
  (mode==='practice'?`<button class="btn ghost" id="hintb">${I('bulb')} تلميح</button>`:'')+(mode==='diag'?`<button class="btn ghost" id="idk">${I('question')} لا أعرف</button>`:'')+`<div id="fb" aria-live="polite"></div>`;
  const fb=el.querySelector('#fb');
  el.querySelectorAll('.cseg').forEach(b=>b.onclick=()=>{conf=+b.dataset.c;el.querySelectorAll('.cseg').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',x===b)})});
  if(mode==='practice')el.querySelector('#hintb').onclick=()=>{usedHint=true;fb.innerHTML=`<div class="fb hint">${I('bulb')} ${esc(s.hint||'اقرأ السؤال مرة أخرى ببطء.')}</div>`;FX.mascot('teacher','فكّر معي')};
  if(mode==='diag')el.querySelector('#idk').onclick=()=>{FX.mascot('encourage','ولا يهمك، سنتعلمها معاً');conf=0;finish(false)};
  const lockAll=()=>el.querySelectorAll('.choice').forEach(x=>x.disabled=true);
  el.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{const c=s.choices[+b.dataset.i];
   if(c.ok){b.classList.add('ok');lockAll();const last=si===item.steps.length-1;
    if(mode==='diag'){if(last)return finish(firstTry);si++;return draw()}
    if(firstTry){FX.burst(b);FX.mascot('celebrate',pick(FX.HAPPY))}else FX.mascot('celebrate','هكذا!');
    fb.innerHTML=`<div class="fb ok">${I('check')} ${pick(['أحسنت!','ممتاز!','رائع يا '+esc(S.name)+'!','صحيح!'])}${last&&item.explain?'<br>'+esc(item.explain):''}</div>`+
     `<button class="btn wide" id="nx">${last?'التالي':'الخطوة التالية'} ${I('arrow')}</button>`;
    fb.querySelector('#nx').onclick=()=>{if(last)finish(firstTry,b);else{si++;draw()}};fb.querySelector('#nx').focus({preventScroll:true});
   }else{firstTry=false;b.classList.add('bad');b.disabled=true;noteMis(c.m,id);if(mode!=='diag')addReview(id,c.m);if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){}
    if(mode==='diag'){lockAll();if(c.m)S._lastMis=c.m;return finish(false)}
    FX.mascot('encourage',pick(FX.SAD));const why=c.m?`<b>انتبه:</b> ${esc(c.m)}`:'ليست هذه الإجابة.';
    if(mode==='test'){lockAll();el.querySelectorAll('.choice').forEach(x=>{if(s.choices[+x.dataset.i].ok)x.classList.add('ok')});
     fb.innerHTML=`<div class="fb bad">${I('x')} ${why}<br>الإجابة الصحيحة: <b>${esc(s.a)}</b></div><button class="btn wide" id="nx">التالي ${I('arrow')}</button>`;
     fb.querySelector('#nx').onclick=()=>finish(false);
    }else fb.innerHTML=`<div class="fb bad">${why}<br>حاول مرة أخرى ${s.hint?'<br><span class="muted">'+I('bulb','sm')+' '+esc(s.hint)+'</span>':''}</div>`;
   }});
 };
 const finish=(ok,b)=>done(ok,usedHint,b,conf);draw()}

// ---------- v7: تدفق السؤال: اختر ← تحقّق ← ورقة ملاحظات خضراء/حمراء ← متابعة ----------
const getBar=()=>{let b=$('#checkbar');if(!b){b=document.createElement('div');b.id='checkbar';document.body.appendChild(b)}return b};
document.addEventListener('keydown',e=>{if(e.key==='Enter'){const c=$('#chk');if(c&&!c.disabled&&document.activeElement.tagName!=='INPUT'){e.preventDefault();c.click()}}});
const mt=s=>esc(s).replace(/[\d,]*√[\d,]+/g,'<bdi class="m" dir="ltr">$&</bdi>');
const PRAISE=['أحسنت!','ممتاز!','رائع!','إجابة صحيحة!','عمل متقن!'];
function renderItem(el,id,item,mode,done){if(mode==='diag')return renderOld(el,id,item,mode,done);
 let si=0,firstTry=true,usedHint=false;const bar=getBar();
 const draw=()=>{const s=item.steps[si],multi=item.steps.length>1;let sel=-1,state='pick';
  el.innerHTML=`<div class="qkind">${I(multi?'tiles':'pencil','sm')} ${multi?'خطوة '+(si+1)+' من '+item.steps.length:'اختر الإجابة الصحيحة'}</div>
  <div class="qrow">${FX.MASCOT(si%2?'think':'read','')}<div class="q">${mt(s.q)}</div></div>
  <div class="choices">${s.choices.map((c,i)=>`<button class="choice" data-i="${i}">${mt(c.t)}</button>`).join('')}</div>
  ${mode==='practice'&&s.hint?`<button class="hintlink" id="hintb">${I('bulb','sm')} تلميح</button><div id="hintt"></div>`:''}`;
  bar.className='checkbar';bar.innerHTML=`<div class="in"><div class="sheet"><span class="sh-ic"></span><div><div class="sh-t"></div><div class="sh-b"></div></div></div><button class="btn off" id="chk" disabled>تحقّق</button></div>`;
  const chk=bar.querySelector('#chk'),cs=[...el.querySelectorAll('.choice')],last=si===item.steps.length-1;
  const hb=el.querySelector('#hintb');if(hb)hb.onclick=()=>{usedHint=true;el.querySelector('#hintt').innerHTML=`<div class="fb hint">${I('bulb','sm')} ${esc(s.hint)}</div>`;hb.remove()};
  cs.forEach(b=>b.onclick=()=>{if(state!=='pick')return;sel=+b.dataset.i;cs.forEach(x=>x.classList.toggle('sel',x===b));chk.disabled=false;chk.classList.remove('off')});
  const sheet=(cls,ic,t,body,btn)=>{bar.className='checkbar '+cls;bar.querySelector('.sh-ic').innerHTML=I(ic);bar.querySelector('.sh-t').textContent=t;bar.querySelector('.sh-b').innerHTML=body;chk.textContent=btn;chk.disabled=false;chk.classList.remove('off');chk.focus({preventScroll:true})};
  chk.onclick=()=>{const b=cs[sel];
   if(state==='pick'){if(sel<0)return;const c=s.choices[sel];cs.forEach(x=>x.disabled=true);b.classList.remove('sel');
    if(c.ok){b.classList.add('ok');state='ok';FX.mascot('celebrate');sheet('ok','check',pick(PRAISE),last&&item.explain?esc(item.explain):'','متابعة')}
    else{firstTry=false;b.classList.add('bad');cs.forEach(x=>{if(s.choices[+x.dataset.i].ok)x.classList.add('ok')});noteMis(c.m,id);addReview(id,c.m);if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){}
     state='bad';sheet('bad','x','الإجابة الصحيحة:',`<b>${mt(s.a)}</b>${c.m?'<br>'+esc(c.m):''}`,'فهمت')}
    return}
   if(state==='ok'&&!last){si++;return draw()}
   done(state==='ok'&&firstTry,usedHint,b)};
 };draw()}
const ltop=(close,h)=>`<div class="ltop"><a class="x" href="${close}" aria-label="إغلاق">${I('x')}</a><div class="lbar"><i id="lbar" style="width:0"></i></div><span class="hearts ${h?'':'inf'}" id="lh">${h?I('heart','sm')+' '+hearts():I('target','sm')}</span></div>`;
const setBar=(n,N)=>{const b=$('#lbar');if(b)b.style.width=(100*n/N)+'%'};
const mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function showDone(box,o){box.innerHTML=`<div class="done-screen">${FX.MASCOT(o.pose||'celebrate','')}<h1>${esc(o.title)}</h1>${o.sub?`<p class="muted">${o.sub}</p>`:''}
 <div class="dstats"><div class="dstat" style="--c:var(--y)"><small>مجموع النقاط</small><b>${I('star','sm')} ${o.xp}</b></div><div class="dstat" style="--c:var(--g)"><small>${o.accL||'الدقة'}</small><b>${I('target','sm')} ${o.acc}</b></div><div class="dstat" style="--c:var(--b)"><small>الوقت</small><b>${I('clock','sm')} ${o.time}</b></div></div>
 ${(o.extra||[]).map(([h,t])=>`<a class="btn sec wide" style="margin-top:14px" href="${h}">${t}</a>`).join('')}</div>`;
 const bar=getBar();bar.className='checkbar';bar.innerHTML=`<div class="in"><a class="btn wide" id="chk" href="${o.next}">متابعة</a></div>`;setBar(1,1);document.querySelectorAll('.xp-pop,.toast').forEach(e=>e.remove());if(o.party)setTimeout(()=>FX.confetti(innerWidth/2,120,36,5),200)}
// ---------- الصفحات ----------
const V={};
function nextStep(){for(const i of C.diagnostic_order)if(['weak','learning'].includes(sk(i).status))return i;
 for(const i of C.diagnostic_order)if(sk(i).status==='untested'&&S.diag)return i;
 for(const i of ALLSK)if(LES[i]&&!['mastered','locked'].includes(status(i)))return i;return null}
const unitStats=u=>{const ls=u.lessons.filter(l=>!l.review);return{n:ls.length,m:ls.filter(l=>sk(l.id).status==='mastered').length}};
const baseStats=()=>({n:C.prerequisites.length,m:C.prerequisites.filter(p=>sk(p.id).status==='mastered').length});
const unitName=u=>u.title.replace(/^الوحدة [^:]+: /,'');
const OLIVE=`<svg class="olive-tree" viewBox="0 0 120 120" aria-hidden="true"><path d="M58 118c2-20-6-30 0-48M60 80c8-6 14-6 20-14" stroke="#7c4a1e" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="#4d7c0f"><ellipse cx="40" cy="44" rx="26" ry="18"/><ellipse cx="76" cy="38" rx="28" ry="20"/><ellipse cx="60" cy="22" rx="24" ry="16"/><ellipse cx="88" cy="60" rx="18" ry="12"/></g><g fill="#84cc16" opacity=".8"><ellipse cx="50" cy="34" rx="12" ry="7"/><ellipse cx="80" cy="30" rx="12" ry="7"/></g><g fill="#3f2a56"><circle cx="34" cy="50" r="3"/><circle cx="70" cy="44" r="3"/><circle cx="86" cy="62" r="3"/><circle cx="58" cy="26" r="3"/></g></svg>`;
const tile=(href,icon,ttl,sub,cls,badge)=>`<a class="card tap tile ${cls||''}" href="${href}"><span class="tile-ic">${I(icon)}</span><span class="tile-t">${ttl}</span><span class="muted">${sub}</span>${badge||''}</a>`;
const UC={base:['#58cc02','#58a700'],U1:['#ce82ff','#a568cc'],U2:['#1cb0f6','#1899d6'],U3:['#ff9600','#cc7900'],U4:['#ff4b4b','#ea2b2b'],U5:['#2b70c9','#1f5aa3'],U6:['#00b894','#00916f'],U7:['#e05fb6','#b8468f'],U8:['#8549ba','#6b3a95']};
const OFF=[0,44,70,44,0,-44,-70,-44];let PI_=0;
function pathSec(key,small,name,ids,guide,quiz,nx){const[c,cd]=UC[key];const mi=Math.min(2,ids.length-1),side=PI_++%2?'right':'left';
 const nodes=ids.map((id,i)=>{const st=status(id),isCur=id===nx,cls=st==='mastered'?'done':(st==='locked'&&!isCur)?'locked':'';
  const ic=st==='mastered'?'check':cls==='locked'?'lock':st==='weak'?'dumbbell':st==='learning'?'book':'star';
  const off=(side==='left'?1:-1)*OFF[i%8];
  return`<a class="pn ${cls}${isCur?' cur':''}" id="pn-${id}" style="transform:translateX(${off}px)" href="#/lesson/${id}" aria-label="${esc(title(id))}">${isCur?'<span class="start-bub">ابدأ</span>':''}<span class="disc">${I(ic)}</span><span class="lbl">${esc(short(title(id)))}</span></a>`}).join('');
 const qn=quiz?`<a class="pn trophy ${sk(quiz).best>=80?'done':''}" style="transform:translateX(${(side==='left'?1:-1)*OFF[ids.length%8]}px)" href="#/quiz/${quiz}" aria-label="اختبار الوحدة"><span class="disc">${I('trophy')}</span><span class="lbl">اختبار الوحدة</span></a>`:'';
 const poses=['read','pencil','think','teacher','idle','read2','encourage','welcome','celebrate'];
 const m=ids.length>1?`<img class="path-m" src="img/zaytoun-${poses[PI_%poses.length]}.webp" alt="" style="top:${mi*104+20}px;${side==='left'?'left':'right'}:2%">`:'';
 return`<section class="usec" style="--c:${c};--cd:${cd}"><div class="ubanner" style="background:${c};box-shadow:0 4px 0 ${cd}"><div><small>${small}</small><b>${esc(name)}</b></div>${guide?`<a class="guide" href="${guide}">${I('book')} الدليل</a>`:''}</div><div class="path">${nodes}${qn}${m}</div></section>`}
V.home=()=>{PI_=0;const nx=nextStep()||(S.diag?null:C.prerequisites[0].id);const dn=dailyN();const rv=dueReviews().length;const dchDone=S.dch&&S.dch.date===today()&&S.dch.done;
 const quests=`<div class="quests"><a class="quest q-y" href="#/ach">${I('target')}هدف اليوم<div class="qbar"><i style="width:${100*Math.min(dn,S.goal)/S.goal}%"></i></div><small>${Math.min(dn,S.goal)}/${S.goal}</small></a>
  <a class="quest q-o" href="#/daily">${I('calendar')}تحدي اليوم<small>${dchDone?'أنجزته':'5 مسائل'}</small></a><a class="quest q-b" href="#/review">${I('review')}الأخطاء<small>${rv?rv+' للمراجعة':'لا شيء الآن'}</small></a></div>`;
 const start=!S.diag?`<div class="card path-start">${FX.MASCOT('welcome','')}<div><h2>أهلاً ${esc(S.name)}!</h2><p class="muted">رحلة قصيرة تحدد من أين تبدأ، فلا تعيد ما تعرفه.</p><a class="btn" href="#/diag">ابدأ رحلة تحديد المستوى</a></div></div>`:'';
 let h=quests+start+pathSec('base','قبل الصف الثامن','الأساسيات (مراجعة الصفوف 4–7)',C.prerequisites.map(p=>p.id),'#/map',null,nx);
 C.semesters.forEach((s,si)=>s.units.forEach((u,ui)=>{h+=pathSec(u.id,`${si?'الفصل الثاني':'الفصل الأول'} · الوحدة ${u.id.slice(1)}`,unitName(u),u.lessons.filter(l=>!l.review).map(l=>l.id),'#/unit/'+u.id,u.id,nx)}));
 setTimeout(()=>{const e=nx&&$('#pn-'+nx);if(e&&S.diag)e.scrollIntoView({block:'center'})},50);
 return h+`<p class="unit-end">${I('flag','sm')} نهاية كتاب الصف الثامن</p>`};
V.map=()=>{const lv={};C.prerequisites.forEach(p=>(lv[depth[p.id]]=lv[depth[p.id]]||[]).push(p.id));const nx=nextStep();
 const leg=['mastered','learning','weak','untested','locked'].map(s=>`<span class="chip st-${s}">${I(SI[s],'sm')}${SL[s]}</span>`).join('');
 const node=i=>`<a class="node st-${status(i)}${i===nx?' next':''}" href="#/lesson/${i}"><span class="dot">${status(i)==='mastered'?I('check'):status(i)==='locked'?I('lock'):i.replace(/^S\d-/,'')}</span>${esc(short(title(i)))}</a>`;
 return`<h1>${I('map')} خريطة المهارات</h1><div class="card"><div class="row">${FX.ring(progress(),80)}<div class="legend">${leg}</div></div></div>
 <div class="card"><div class="lesson-head">${FX.cover('basics')}<div><h2>الأساسيات (الصفوف 4–7)</h2><p class="muted">ابدأ من الأعلى؛ كل مستوى يعتمد على الذي فوقه.</p></div></div>
 <div class="tree">${Object.keys(lv).sort().map(d=>`<div class="tlevel"><div class="tlabel">المستوى ${d}</div>${lv[d].map(node).join('')}</div>`).join('')}</div></div>
 ${C.semesters.map(s=>`<h2>${I('book')} ${esc(s.name)}</h2>`+s.units.map(u=>{const st=unitStats(u);
  return`<div class="card"><a class="lesson-head" style="text-decoration:none;color:inherit" href="#/unit/${u.id}">${FX.cover(COVER[u.id])}<div><h3>${esc(u.title)}</h3><span class="muted">${st.m}/${st.n}${FULL.has(u.id)?'':' · تمهيدي'}</span></div></a><div class="tlevel">${u.lessons.filter(l=>!l.review).map(l=>node(l.id)).join('')}</div></div>`}).join('')).join('')}`};
const toolFor=id=>Object.entries(LAB.T).filter(([k,t])=>t.skills.includes(id)||((window.CONTENT[id]||{}).tools||[]).includes(k)).map(([k,t])=>`<a class="btn sec" href="#/lab/${k}">${I(t.icon)} ${t.title}</a>`).join('');
V.unit=id=>{const u=UNITS[id];if(!u)return'<p>غير موجود</p>';const best=sk(id).best,st=unitStats(u);
 return`<a class="back" href="#/home">${I('back','sm')} المسار</a><div class="banner" style="background:${UC[id][0]};box-shadow:0 4px 0 ${UC[id][1]}">${FX.cover(COVER[id])}<div class="banner-t"><h1>${esc(u.title)}</h1><span>${esc(u.sem.name)} · ${st.m}/${st.n} متقنة</span></div></div>
 ${FULL.has(id)?'':`<div class="soon">${I('warn','sm')} وحدة تمهيدية في هذا الإصدار: الأهداف وبعض التمارين متاحة، والشرح الكامل قريباً.</div>`}
 <div class="card"><h3>الدروس</h3>${u.lessons.map(l=>l.review?`<a class="lesson" href="#/quiz/${id}"><span><span class="num">${l.number}</span>${esc(l.title)} (اختبار الوحدة)</span>${I('quiz')}</a>`:
  `<a class="lesson" href="#/lesson/${l.id}"><span><span class="num">${l.number}</span>${esc(l.title)}</span><span class="chip st-${status(l.id)}">${I(SI[status(l.id)],'sm')}${SL[status(l.id)]}</span></a>`).join('')}</div>
 <div class="two"><div class="card"><h3>${I('target')} نتاجات الوحدة (من الكتاب)</h3><ul>${u.unit_objectives_verified.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>
 <div class="card"><h3>${I('warn')} أخطاء شائعة</h3><ul>${u.misconceptions.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div></div>
 <a class="btn wide gold" href="#/quiz/${id}">${I('quiz')} اختبار الوحدة ${best!=null?'(أفضل نتيجة '+best+'%)':''}</a>`};
V.lesson=id=>{const P_=PRE[id],L=LES[id];if(!P_&&!L)return'<p>غير موجود</p>';cur=id;const c=window.CONTENT[id],s=sk(id),st=status(id);
 const deps=P_?P_.depends_on:L.prerequisites,needed=P_?P_.needed_by_lessons:[];const tools=toolFor(id);
 const uc=UC[L?L.unit:'base'];let h=`<a class="back" href="${L?'#/unit/'+L.unit:'#/map'}">${I('back','sm')} رجوع</a><div class="banner" style="background:${uc[0]};box-shadow:0 4px 0 ${uc[1]}">${FX.cover(L?COVER[L.unit]:'basics')}<div class="banner-t"><h1><span class="num">${L?L.number:id}</span>${esc(title(id))}</h1>
 <span class="chip st-${st}">${I(SI[st],'sm')}${SL[st]}</span>${s.best!=null?` · أفضل اختبار ${s.best}%`:''}</div></div>`;
 if(st==='locked')h+=`<div class="card fb bad">${I('lock')} هذا الدرس يعتمد على مهارات لم تُتقن بعد. ابدأ بها:<br>${deps.filter(d=>['weak','untested'].includes(sk(d).status)).map(d=>chip(d)).join('')}<br><button class="btn ghost" id="unl">افتحه على أي حال</button></div>`;
 if(deps&&deps.length)h+=`<div class="card"><h3>${I('tiles')} يعتمد على</h3>${deps.map(d=>chip(d)).join('')}</div>`;
 const NR=window.NRM||(x=>x);if(c)h+=`<div class="card teach">${FX.MASCOT('teacher','teach-m')}${c.pg?`<p class="pgref">${I('book','sm')} الكتاب المدرسي: الجزء ${c.b===2?'الثاني':'الأول'}، صفحة ${c.pg}</p>`:''}${c.pgNote?`<p class="muted">${esc(c.pgNote)}</p>`:''}<h3>${I('book')} الفكرة</h3><p class="idea">${esc(NR(c.t))}</p>${c.r&&c.r.length?`<h3>${I('star')} القاعدة كما في الكتاب</h3>${c.r.map(r=>`<div class="rule">${esc(NR(r))}</div>`).join('')}`:''}${c.act?`<h3>${I('hand')} نشاط</h3><div class="ex act">${esc(NR(c.act))}</div>`:''}<h3>${I('pencil')} أمثلة محلولة</h3>${c.ex.map(e=>`<div class="ex"><b>${esc(NR(e[0]))}</b>${esc(NR(e[1]))}</div>`).join('')}${c.vill?`<a class="btn sec" href="#/village/${c.vill}">${I('map')} فصل القرية المرتبط بالدرس</a>`:''}</div>`;
 else h+=`<div class="card"><div class="soon">${I('warn','sm')} الشرح الكامل لهذا الدرس قريباً.</div><h3>${I('target')} ماذا ستتعلم</h3><ul>${L.skills.map(k=>`<li>${esc(k.text)}${k.verified?'':' <span class="muted">(استنتاج)</span>'}</li>`).join('')}</ul><p class="muted">صفحة ${L.page} في الكتاب المدرسي.</p></div>`;
 if(tools)h+=`<div class="card"><h3>${I('lab')} جرّبها بيدك في المختبر</h3>${tools}</div>`;
 if(L)h+=`<div class="card"><h3>${I('warn')} أخطاء شائعة</h3><ul>${UNITS[L.unit].misconceptions.slice(0,4).map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>`;
 if(needed&&needed.length)h+=`<div class="card"><h3>${I('rocket')} ستحتاجها في الصف الثامن</h3>${needed.map(d=>chip(d,LES[d]?LES[d].number+' '+LES[d].title:d)).join('')}</div>`;
 h+=`<a class="btn wide" href="#/practice/${id}">${I('dumbbell')} تدرّب (أسئلة غير محدودة)</a><a class="btn wide gold" href="#/quiz/${id}">${I('quiz')} اختبار الدرس (8 أسئلة · النجاح 80%)</a>`;
 setTimeout(()=>{const b=$('#unl');if(b)b.onclick=()=>{sk(id).unlocked=true;save();route()}});return h};
V.practice=id=>{cur=id;const N=10;setTimeout(()=>{let n=0,ok=0,xp=0;const t0=Date.now(),box=$('#pbox');
  const lh=()=>{const e=$('#lh');if(e)e.innerHTML=I('heart','sm')+' '+S.hearts};
  const end=out=>showDone(box,{title:out?'نفدت القلوب':'أكملت التدريب!',sub:out?'راجع الشرح أو أخطاءك لتستعيد القلوب، ثم عد.':'',pose:out?'encourage':'celebrate',party:!out,xp,acc:Math.round(100*ok/Math.max(n,1))+'%',time:mmss(Math.round((Date.now()-t0)/1000)),next:'#/lesson/'+id,extra:out?[['#/review','مراجعة الأخطاء (تعيد القلوب)']]:[['#/practice/'+id,'تدرّب مرة أخرى'],['#/quiz/'+id,'اختبار الدرس']]});
  const nextQ=()=>{setBar(n,N);lh();if(n>=N)return end(false);if(hearts()<=0)return end(true);
   renderItem(box,id,window.genFor(id),'practice',(first,hint,b)=>{n++;const s=sk(id);s.att++;
    if(first){ok++;s.cor++;s.run=(s.run||0)+1;const p=hint?5:10;xp+=p;addPts(p,b);countCorrect()}else{s.run=0;S.hearts=Math.max(0,S.hearts-1);S.hLost=Date.now()}
    if(s.run>=5&&['untested','weak','locked'].includes(s.status)){s.status='learning';FX.toast(I('book')+' انتقلت إلى «قيد التعلّم»!')}
    save();checkAch();nextQ()})};nextQ()});
 return ltop('#/lesson/'+id,true)+`<div class="card qcard" id="pbox"></div>`};
function quizRun(box,pr,gens,N,onEnd,mode){let i=0,score=0;const p0=S.points,t0=Date.now();
 const nextQ=()=>{setBar(i,N);if(i>=N)return onEnd(score,S.points-p0,mmss(Math.round((Date.now()-t0)/1000)));if(pr)pr.innerHTML='';
  const gid=gens[i%gens.length];renderItem(box,gid,window.genFor(gid),mode||'test',(ok,_,b)=>{if(ok){score++;addPts(15,b);countCorrect()}i++;save();nextQ()})};nextQ()}
V.quiz=id=>{cur=id;const unit=UNITS[id];const N=unit?10:8;const gens=unit?unit.lessons.filter(l=>!l.review).map(l=>l.id):[id];
 setTimeout(()=>quizRun($('#qbox'),$('#qpr'),gens,N,(score,xp,tm)=>{const pct=Math.round(100*score/N),s=sk(id),was=s.status;s.best=Math.max(s.best||0,pct);
   S.quizzes.push({id,date:new Date().toISOString(),score:pct,n:N});
   (unit?gens:[id]).forEach(t=>{const x=sk(t);if(pct>=80)x.status='mastered';else if(pct>=50){if(x.status!=='mastered')x.status='learning'}else if(x.status!=='mastered')x.status='weak'});
   if(pct>=80&&was!=='mastered')addPts(50);save();$('#qpr').innerHTML='';
   if(pct>=80)FX.mega();
   showDone($('#qbox'),{title:pct>=80?'أتقنتها!':pct>=50?'في الطريق الصحيح':'لا بأس، لنتدرّب',sub:`${score} من ${N} إجابات صحيحة · النجاح 80%`,pose:pct>=80?'celebrate':pct>=50?'encourage':'read',party:pct>=80,xp,acc:pct+'%',accL:'النتيجة',time:tm,next:`#/${unit?'unit':'lesson'}/${id}`,extra:[['#/practice/'+(unit?gens[0]:id),'تدرّب'],['#/home','مسار الدروس']]});checkAch()}));
 return ltop(`#/${unit?'unit':'lesson'}/${id}`,false)+`<div id="qpr"></div><div class="card qcard" id="qbox"></div>`};
// ---------- مراجعة الأخطاء ----------
V.review=()=>{const due=dueReviews(),all=Object.keys(S.review);
 if(!due.length)return`<h1>${I('review')} مراجعة الأخطاء</h1><div class="card empty">${FX.MASCOT('read','empty-m float')}<h2>لا توجد أخطاء للمراجعة الآن</h2><p class="muted">كل سؤال تخطئ فيه يدخل هنا، ويعود لك بعد يوم ثم 3 أيام ثم أسبوع حتى تثبت المعلومة.${all.length?' لديك '+all.length+' مهارة مجدولة لاحقاً.':''}</p><a class="btn" href="#/daily">${I('calendar')} جرّب تحدي اليوم</a></div>`;
 setTimeout(()=>{let k=0,ok=0;const box=$('#rbox'),pr=$('#rpr');const p0=S.points,t0=Date.now();const nx=()=>{setBar(k,due.length);if(k>=due.length){showDone(box,{title:'انتهت المراجعة',sub:'الإجابات الصحيحة تؤجَّل لموعد أبعد، والخاطئة تبقى للغد. كل إجابة صحيحة تعيد قلباً.',xp:S.points-p0,acc:ok+'/'+due.length,accL:'صحيحة',time:mmss(Math.round((Date.now()-t0)/1000)),next:'#/home'});pr.innerHTML='';if(ok===due.length)FX.mega();save();checkAch();return}
   const id=due[k],r=S.review[id];pr.innerHTML=`<div class="qtop"><span>${k+1} من ${due.length}</span><span>${esc(short(title(id)))}</span></div>`+(r.mis?`<div class="fb hint">${I('bulb','sm')} تذكير بخطئك السابق: ${esc(r.mis)}</div>`:'');
   renderItem(box,id,window.genFor(id),'test',(o,_,b)=>{if(o){ok++;addPts(12,b);countCorrect();S.hearts=Math.min(5,S.hearts+1)}reviewResult(id,o);k++;save();nx()})};nx()});
 return ltop('#/home',false)+`<div id="rpr"></div><div class="card qcard" id="rbox"></div>`};
// ---------- تحدي اليوم ----------
V.daily=()=>{if(S.dch&&S.dch.date===today()&&S.dch.done)return`<h1>${I('calendar')} تحدي اليوم</h1><div class="card empty">${FX.MASCOT('celebrate','empty-m float')}<h2>أنجزت تحدي اليوم: ${S.dch.score}/5</h2><p class="muted">عد غداً لتحدٍّ جديد.</p><a class="btn" href="#/game">${I('race')} العب سباق الأعداد</a></div>`;
 const weak=ALLSK.filter(i=>['weak','learning'].includes(sk(i).status)&&window.hasGen(i));const gens=['STORY',weak[0]||'P01','STORY',weak[1]||'P04','STORY'];
 setTimeout(()=>quizRun($('#dbox'),$('#dpr'),gens,5,(score,xp,tm)=>{S.dch={date:today(),done:true,score};addPts(score*5+20);save();checkAch();$('#dpr').innerHTML='';if(score>=4)FX.mega();
  showDone($('#dbox'),{title:score>=4?'تحدٍّ قوي!':'أحسنت المحاولة',sub:'+'+(score*5+20)+' نقطة مكافأة التحدي',xp:xp+score*5+20,acc:score+'/5',accL:'صحيحة',time:tm,next:'#/home'})}));
 return ltop('#/home',false)+`<div id="dpr"></div><div class="card qcard" id="dbox"></div>`};
// ---------- المختبر واللعبة ----------
const labCtx=key=>({reward:(n,el)=>{addPts(n,el);countCorrect();S.labs[key]=(S.labs[key]||0)+1;FX.burst(el);FX.mascot('celebrate',pick(FX.HAPPY));save();checkAch()},
 miss:(id,m)=>{noteMis(m,id);if(m)addReview(id,m);FX.mascot('encourage',pick(FX.SAD));save()},best:(k,v)=>{S.games[k]=Math.max(S.games[k]||0,v);save();return S.games[k]},onLeave:f=>leave.push(f)});
V.lab=k=>{if(k&&LAB.T[k]){const t=LAB.T[k];cur=t.skills[0];setTimeout(()=>{const r=$('#labroot');t.init(r,labCtx(k))});
  return`<a class="back" href="#/lab">${I('back','sm')} المختبر</a><h1>${I(t.icon)} ${t.title}</h1><p class="muted">${t.desc}</p>${MROW('teacher','جرّب بنفسك!')}<div class="card lab" id="labroot">${t.html()}</div><div class="card"><h3>مرتبط بـ</h3>${t.skills.map(s=>chip(s,short(title(s)))).join('')}</div>`}
 return`<h1>${I('lab')} المختبر</h1><p class="muted">أدوات تلمسها وتحرّكها بيدك لتفهم الفكرة قبل الحفظ.</p><div class="labgrid">${Object.entries(LAB.T).map(([k,t])=>`<a class="card tap labcard" href="#/lab/${k}"><span class="tile-ic big">${I(t.icon)}</span><b>${t.title}</b><span class="muted">${t.desc.split('.')[0]}.</span>${S.labs[k]?`<span class="chip st-mastered">${I('check','sm')}${S.labs[k]}</span>`:''}</a>`).join('')}
 <a class="card tap labcard game" href="#/game"><span class="tile-ic big">${I('race')}</span><b>سباق الأعداد</b><span class="muted">لعبة سرعة على الأعداد الصحيحة.</span></a></div>`};
V.game=()=>{cur='P01';setTimeout(()=>LAB.RACE.init($('#groot'),labCtx('race')));return`<a class="back" href="#/lab">${I('back','sm')} المختبر</a><h1>${I('race')} سباق الأعداد الصحيحة</h1><p class="muted">60 ثانية. كل 5 إجابات متتالية = 3 ثوانٍ إضافية، والخطأ يخصم 3 ثوانٍ.</p><div class="card" id="groot">${LAB.RACE.html()}</div>`};
// ---------- رحلة تحديد المستوى ----------
const domainScore=(res,st)=>{const v={mastered:1,learning:.6,weak:0,skipped:0};const xs=st.skills.map(i=>res[i]?v[res[i].r]||0:0);return xs.reduce((a,b)=>a+b,0)/xs.length};
function journeyMap(res,curSt){const n=STATIONS.length;const pts=STATIONS.map((s,i)=>[i%2?250:90,60+i*130]);
 let path=`M${pts[0][0]} ${pts[0][1]}`;for(let i=1;i<n;i++){const[a,b]=pts[i-1],[c,d]=pts[i];path+=` C${a} ${b+70} ${c} ${d-70} ${c} ${d}`}
 return`<div class="jmap" style="height:${n*130+20}px"><svg viewBox="0 0 340 ${n*130+20}" preserveAspectRatio="none" class="jpath" aria-hidden="true"><path d="${path}" class="jp-bg"/><path d="${path}" class="jp-fg" style="--len:${n*170}"/></svg>
 ${STATIONS.map((s,i)=>{const done=res&&s.skills.every(k=>res[k]);const sc=done?domainScore(res,s):null;const stt=i===curSt?'cur':done?'done':'todo';
  return`<div class="station ${stt}" style="top:${pts[i][1]-46}px;left:calc(${pts[i][0]/340*100}% - 46px)">${FX.cover(s.cover)}<span class="st-num">${done?I('check'):i+1}</span><span class="st-name">${s.name}${sc!=null?' · '+Math.round(sc*100)+'%':''}</span></div>`}).join('')}
 <img src="img/zaytoun-welcome.webp" class="jz float" alt="" style="top:${pts[Math.max(0,Math.min(curSt,n-1))][1]-60}px;left:calc(${pts[Math.max(0,Math.min(curSt,n-1))][0]/340*100}% ${pts[Math.max(0,Math.min(curSt,n-1))][0]<170?'+ 50px':'- 130px'})"></div>`}
V.diag=()=>{cur=null;
 if(S.diag&&!V.diag.go&&!V.diag.intro)return placementResult(false)+`<button class="btn sec wide" id="redo">${I('refresh')} إعادة الرحلة</button>`+setH(()=>$('#redo').onclick=()=>{V.diag.intro=true;route()});
 if(!V.diag.go)return`<div class="banner tall">${FX.cover('scene-explorer')}<div class="banner-t"><h1>رحلة بستان الزيتون</h1><span>ساعد زيتون في الوصول إلى البستان الكبير عبر 5 محطات</span></div></div>
 <div class="card"><div class="row">${FX.MASCOT('welcome','intro-m float')}<ul class="clean"><li>${I('flag','sm')} في كل محطة <b>حارس</b> يطرح سؤال تحدٍّ. إن هزمته بثقة، تمرّ بسرعة!</li><li>${I('target','sm')} قبل كل إجابة اختر: <b>أخمّن / متأكد نوعاً ما / متأكد جداً</b> — هكذا نفرّق بين المعرفة والحظ.</li><li>${I('question','sm')} «لا أعرف» أفضل من التخمين.</li><li>${I('clock','sm')} 10–20 دقيقة. لا علامات، فقط خريطة لمستواك.</li></ul></div></div>
 ${journeyMap(null,0)}<button class="btn wide gold" id="go">${I('play')} انطلق</button>`+setH(()=>$('#go').onclick=()=>{V.diag.go=true;V.diag.intro=false;route()});
 setTimeout(runJourney);return`<div id="jtop"></div>${MROW('think','خذ وقتك، بدون علامات')}<div class="card qcard" id="dbox"></div>`};
const setH=f=>(setTimeout(f),'');
function runJourney(){const res={};let si=0;const box=$('#dbox'),top=$('#jtop');
 const solid=(ok,c)=>ok&&c>=2;
 const stationIntro=()=>{if(si>=STATIONS.length)return done();const st=STATIONS[si];
  top.innerHTML=`<div class="banner sm">${FX.cover(st.cover)}<div class="banner-t"><span>المحطة ${si+1} من ${STATIONS.length}</span><h2>${st.name}</h2></div></div><div class="bar"><i style="width:${100*si/STATIONS.length}%;animation:none"></i></div>`;
  const avail=st.skills.filter(id=>!PRE[id].depends_on.some(d=>res[d]&&res[d].r==='weak'));
  st.skills.filter(id=>!avail.includes(id)).forEach(id=>res[id]={r:'skipped',a:[],c:[]});
  if(!avail.length)return nextStation();
  const boss=[...avail].sort((a,b)=>depth[b]-depth[a])[0];FX.mascot('teacher','حارس المحطة يتحداك!');
  box.innerHTML=`<div class="boss-intro"><span class="boss-ic">${I('shield')}</span><h3>تحدي الحارس</h3><p class="muted">سؤال من أصعب مهارة في المحطة: ${esc(short(PRE[boss].title))}</p><button class="btn gold wide" id="bgo">${I('bolt')} واجه الحارس</button></div>`;
  $('#bgo').onclick=()=>renderItem(box,boss,window.genFor(boss),'diag',(ok,_,b,c)=>{const fast=solid(ok,c)&&c===3;res[boss]={r:fast?'mastered':null,a:[ok],c:[c],boss:true};
   if(fast){FX.mega();FX.mascot('celebrate','هزمت الحارس! مرور سريع')}else FX.mascot(ok?'celebrate':'encourage',ok?'جيد! لنتأكد أكثر':'لا بأس، سنمشي خطوة خطوة');
   const queue=avail.filter(x=>x!==boss||!fast);runSkills(queue,fast,()=>nextStation())})};
 const runSkills=(q,fast,cb)=>{let k=0;const one=()=>{if(k>=q.length)return cb();const id=q[k];const r=res[id]||(res[id]={r:null,a:[],c:[]});
   if(PRE[id].depends_on.some(d=>res[d]&&res[d].r==='weak')){r.r='skipped';k++;return one()}
   renderItem(box,id,window.genFor(id),'diag',(ok,_,b,c)=>{r.a.push(ok);r.c.push(c);const sol=r.a.map((o,i)=>solid(o,r.c[i])),cs=sol.filter(x=>x).length,guess=r.a.filter((o,i)=>o&&r.c[i]===1).length;
    const n=r.a.length;let dec=null;
    if(fast&&n===1&&sol[0])dec='mastered';
    else if(n>=2&&cs===n)dec='mastered';else if(n>=2&&r.a.every(o=>!o))dec='weak';else if(n>=3)dec=cs>=2?'learning':(r.a.filter(x=>x).length>=2&&guess?'learning':'weak');
    if(dec){r.r=dec;r.guess=guess;r.over=r.a.filter((o,i)=>!o&&r.c[i]===3).length;k++}one()})};one()};
 const nextStation=()=>{const st=STATIONS[si];const sc=domainScore(res,st);addPts(10);FX.toast(`${I('flag')} أنهيت محطة «${st.name}» — ${Math.round(sc*100)}%`);si++;save();stationIntro()};
 const done=()=>{const conf={guess:0,over:0};Object.entries(res).forEach(([id,o])=>{const s=sk(id);s.status=o.r==='skipped'?'untested':o.r;s.diag=o.r;conf.guess+=o.guess||0;conf.over+=o.over||0;if(o.r==='weak')addReview(id)});
  const doms=STATIONS.map(st=>({id:st.id,v:domainScore(res,st)}));const avg=doms.reduce((a,b)=>a+b.v,0)/doms.length;
  S.diag={date:new Date().toISOString(),res,v:3,domains:doms,conf,rank:Math.min(8,1+Math.floor(avg*8))};addPts(30);V.diag.go=false;save();checkAch();FX.mega();
  top.innerHTML='';box.parentNode.querySelector('#mascot')&&box.parentNode.querySelector('#mascot').remove();box.outerHTML=`<div>${placementResult(true)}</div>`};
 stationIntro()}
function placementResult(fresh){const d=S.diag,r=d.res||{},g=t=>C.diagnostic_order.filter(i=>r[i]&&r[i].r===t);
 const doms=d.domains||STATIONS.map(st=>({id:st.id,v:domainScore(r,st)}));const avg=doms.reduce((a,b)=>a+b.v,0)/doms.length;const rank=d.rank||Math.min(8,1+Math.floor(avg*8));
 const best=STATIONS[doms.reduce((bi,x,i)=>x.v>doms[bi].v?i:bi,0)],worst=STATIONS[doms.reduce((bi,x,i)=>x.v<doms[bi].v?i:bi,0)];
 const sec=(t,ic,ids,note)=>ids.length?`<div class="card"><h3>${I(ic)} ${t} (${ids.length})</h3>${note?'<p class="muted">'+note+'</p>':''}${ids.map(i=>chip(i,short(title(i)))).join('')}</div>`:'';
 const guessed=C.diagnostic_order.filter(i=>r[i]&&r[i].guess),over=C.diagnostic_order.filter(i=>r[i]&&r[i].over);const w=g('weak');
 return`<div class="rankcard ${fresh?'reveal':''}"><div class="rc-glow"></div><img src="img/rank-${rank}.webp" class="rc-badge" alt=""><div class="rc-t"><span class="muted">بطاقة مستواك</span><h1>${best.cls}</h1><p>الرتبة: <b>${RANKS[rank-1]}</b> (${rank}/8)</p><p class="muted">${new Date(d.date).toLocaleDateString('ar')}</p></div>${FX.MASCOT('celebrate','rc-m')}</div>
 <div class="card"><h2>${I('chart')} رادار مهاراتك</h2>${FX.radar(STATIONS.map((s,i)=>({label:s.short,v:doms[i]?doms[i].v:0})),320)}<p>أقوى مجال: <b>${best.short}</b> · يحتاج تقوية: <b>${worst.short}</b></p></div>
 ${d.conf?`<div class="card"><h3>${I('brain')} ماذا تقول ثقتك؟</h3><p>إجابات صحيحة بالتخمين: <b>${d.conf.guess}</b> · أخطاء وأنت «متأكد جداً»: <b>${d.conf.over}</b></p><p class="muted">${d.conf.over?'الخطأ مع الثقة العالية يعني فكرة خاطئة راسخة — هذه أهم ما سنصلحه.':''} ${d.conf.guess?'التخمين الصحيح لا يُحسب إتقاناً، لذلك وضعنا هذه المهارات «قيد التعلّم».':''}</p>${over.length?'<p>أفكار خاطئة واثقة في: '+over.map(i=>chip(i,short(title(i)))).join('')+'</p>':''}${guessed.length?'<p>تخمين في: '+guessed.map(i=>chip(i,short(title(i)))).join('')+'</p>':''}</div>`:''}
 ${sec('متقنة','check',g('mastered'))}${sec('قيد التعلّم','book',g('learning'))}${sec('تحتاج تقوية','dumbbell',w,'أضفناها إلى مراجعة الأخطاء. ابدأ بالترتيب.')}${sec('لم تُختبر (تعتمد على مهارة ضعيفة)','pause',g('skipped'))}
 ${w.length?`<a class="btn wide gold" href="#/lesson/${w[0]}">${I('play')} ابدأ بأول مهارة: ${esc(short(title(w[0])))}</a>`:`<a class="btn wide" href="#/map">${I('map')} اذهب إلى الخريطة</a>`}`}
// ---------- الإنجازات ----------
V.ach=()=>{checkAch();const on=ACH.filter(a=>S.ach[a[0]]).length;const L=FX.lvInfo(level());
 return`<div class="prof"><div class="av">${FX.MASCOT('idle','')}</div><div><h1>${esc(S.name)}</h1><p>${L.name} · المستوى ${level()}</p></div></div>
 <div class="pstats"><div class="pstat" style="color:var(--o)">${I('flame')}<div><b style="color:var(--tx)">${S.streak}</b><small>يوم متتالٍ</small></div></div><div class="pstat" style="color:var(--yd)">${I('star')}<div><b style="color:var(--tx)">${S.points}</b><small>مجموع النقاط</small></div></div>
 <div class="pstat" style="color:var(--g)">${I('check')}<div><b style="color:var(--tx)">${nMast()}</b><small>مهارة متقنة</small></div></div><div class="pstat" style="color:var(--b)">${I('trophy')}<div><b style="color:var(--tx)">${on}</b><small>إنجاز</small></div></div></div>
 <div class="menu">${[['#/report','chart','تقرير التقدم والإعدادات'],['#/diag','journey','رحلة تحديد المستوى'],['#/map','map','خريطة المهارات'],['#/sky','sky','سماء المهارات'],['#/coach','chat','المدرب'],['#/review','review','مراجعة الأخطاء']].map(([h,ic,t])=>`<a href="${h}">${I(ic)}${t}<span class="chev">${I('back','sm')}</span></a>`).join('')}</div>
 <h2>${I('trophy')} الإنجازات</h2><div class="card lvcard">${FX.rankImg(level(),96,'float')}<div><h2>${L.name}</h2><p>المستوى ${level()} · ${XPL-S.points%XPL} نقطة للمستوى التالي</p><div class="bar"><i style="width:${100*(S.points%XPL)/XPL}%"></i></div></div>${FX.ring(100*on/ACH.length,80,on+'/'+ACH.length,'#f59e0b')}</div>
 <div class="badges">${ACH.map(a=>`<div class="badge ${S.ach[a[0]]?'on':''}"><span class="medal-w">${medal(a[1],!!S.ach[a[0]])}</span><b>${a[2]}</b><small>${a[3]}</small></div>`).join('')}</div>
 <div class="card"><h3>${I('crown')} سلّم المستويات</h3><div class="ladder">${Array.from({length:9},(_,i)=>{const x=FX.lvInfo(i+1);return`<div class="rung ${i+1<=level()?'on':''}">${FX.rankImg(i+1,58)}<span>${i+1}. ${x.name}</span></div>`}).join('')}</div></div>
 <div class="card"><h3>${I('target')} هدف اليوم</h3><p class="muted">عدد الإجابات الصحيحة المطلوبة يومياً:</p>${[5,10,15,20].map(g=>`<button class="btn ${S.goal===g?'':'sec'}" data-g="${g}">${g}</button>`).join('')}</div>`+
 setH(()=>document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{S.goal=+b.dataset.g;save();route()}))};
// ---------- التقرير ----------
V.report=()=>{cur=null;const rows=ALLSK.filter(i=>S.skills[i]&&(S.skills[i].att||S.skills[i].best!=null||S.skills[i].diag));
 const mis=Object.entries(S.mis).sort((a,b)=>b[1].n-a[1].n);const weak=ALLSK.filter(i=>sk(i).status==='weak');const d=S.diag;
 return`<h1>${I('chart')} تقرير ولي الأمر / المعلّم</h1><div class="card"><label>اسم الطالب <input type="text" id="nm" value="${esc(S.name)}"></label>
 <div class="grid" style="margin-top:10px"><div class="kpi"><b>${Math.round(S.time/60)}</b>دقيقة</div><div class="kpi"><b>${progress()}%</b>تقدّم</div><div class="kpi"><b>${S.points}</b>نقطة · مستوى ${level()}</div><div class="kpi"><b>${S.quizzes.length}</b>اختبار</div></div>
 <p class="muted">بدأ في: ${new Date(S.created).toLocaleDateString('ar')} · تحديد المستوى: ${d?new Date(d.date).toLocaleDateString('ar'):'لم يُجرَ بعد'} · مراجعات مجدولة: ${Object.keys(S.review).length} · أفضل سباق: ${S.games.race||0}</p></div>
 ${d&&d.domains?`<div class="card"><h2>${I('chart')} رادار المجالات (التشخيص)</h2>${FX.radar(STATIONS.map((s,i)=>({label:s.short,v:d.domains[i].v})),300)}${d.conf?`<p class="muted">تخمين صحيح: ${d.conf.guess} · خطأ بثقة عالية: ${d.conf.over}</p>`:''}</div>`:''}
 <div class="card"><h2>${I('dumbbell')} نقاط الضعف المحددة (${weak.length})</h2>${weak.length?weak.map(i=>chip(i)).join(''):'<p class="muted">لا توجد حالياً.</p>'}
 ${weak.length?`<p class="muted">الترتيب المقترح للعلاج: ${weak.filter(i=>PRE[i]).join(' ← ')}</p>`:''}</div>
 <div class="card"><h2>${I('brain')} الأخطاء المفاهيمية المتكررة</h2>${mis.length?`<div class="tbl"><table><tr><th>الخطأ</th><th>مرات</th><th>في</th></tr>${mis.slice(0,15).map(([m,o])=>`<tr><td>${esc(m)}</td><td>${o.n}</td><td>${Object.keys(o.skills).join('، ')}</td></tr>`).join('')}</table></div>`:'<p class="muted">لم تُسجّل أخطاء بعد.</p>'}</div>
 <div class="card"><h2>${I('chart')} المهارات</h2>${rows.length?`<div class="tbl"><table><tr><th>المهارة</th><th>الحالة</th><th>دقة التدريب</th><th>أفضل اختبار</th><th>وقت</th></tr>${rows.map(i=>{const s=S.skills[i];return`<tr><td>${i} ${esc(short(title(i)))}</td><td>${SL[status(i)]}</td><td>${s.att?Math.round(100*s.cor/s.att)+'% ('+s.att+')':'—'}</td><td>${s.best!=null?s.best+'%':'—'}</td><td>${Math.round(s.time/60)}د</td></tr>`}).join('')}</table></div>`:'<p class="muted">لا بيانات بعد.</p>'}</div>
 <div class="card"><h2>${I('quiz')} سجل الاختبارات</h2>${S.quizzes.length?`<div class="tbl"><table><tr><th>التاريخ</th><th>الاختبار</th><th>النتيجة</th></tr>${S.quizzes.slice(-20).reverse().map(q=>`<tr><td>${new Date(q.date).toLocaleDateString('ar')}</td><td>${esc(short(title(q.id)))}</td><td>${q.score}%</td></tr>`).join('')}</table></div>`:'<p class="muted">لا اختبارات بعد.</p>'}</div>
 <div class="card"><button class="btn" id="exp">${I('download')} تصدير JSON</button><label class="btn sec">${I('upload')} استيراد<input type="file" id="imp" accept=".json" hidden></label><button class="btn sec" onclick="print()">${I('print')} طباعة</button><button class="btn ghost" id="rst">${I('trash')} مسح كل التقدم</button></div>`+setH(()=>{
  $('#nm').onchange=e=>{S.name=e.target.value.trim()||'عبّود';save()};
  $('#exp').onclick=()=>{const b=new Blob([JSON.stringify({exported:new Date().toISOString(),app:'abboud-math-v1',progress:S},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`تقدم-${S.name}-${today()}.json`;a.click()};
  $('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);S=d.progress||d;norm();LOADH.forEach(f=>f());save();route();FX.toast(I('check')+' تم الاستيراد')}catch(x){alert('ملف غير صالح')}})};
  $('#rst').onclick=()=>{if(confirm('هل أنت متأكد؟ سيُحذف كل التقدم.')){S=fresh();norm();LOADH.forEach(f=>f());save();route()}}})};
// ---------- التوجيه ----------
const TABS={home:'home',map:'home',unit:'home',lesson:'home',practice:'home',quiz:'home',daily:'home',review:'home',diag:'diag',lab:'lab',game:'lab',ach:'ach',report:'report'};
function route(){const [_,v,arg]=(location.hash||'#/home').split('/');const f=V[v]||V.home;cur=null;leave.forEach(fn=>{try{fn()}catch(e){}});leave=[];
 if(v!=='diag'){V.diag.go=false;V.diag.intro=false}
 const cb=$('#checkbar');if(cb)cb.remove();document.body.classList.toggle('focus',['practice','quiz','review','daily'].includes(v));const app=$('#app');app.innerHTML=`<div class="page">${f(decodeURIComponent(arg||''))}</div>`;window.scrollTo(0,0);
 const tab=TABS[v]||'home';
 document.querySelectorAll('.tabs a').forEach(a=>a.classList.toggle('on',a.dataset.t===tab));hdr()}
const setTheme=t=>{document.documentElement.dataset.theme=t;$('#theme').innerHTML=I(t==='dark'?'sun':'moon')};
$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(t);try{localStorage.setItem('abboud_theme',t)}catch(e){}};
setTheme(document.documentElement.dataset.theme||'light');
document.querySelectorAll('[data-ic]').forEach(e=>e.insertAdjacentHTML('afterbegin',I(e.dataset.ic)));
if(window.V4)window.V4({V,S:()=>S,save,addPts,countCorrect,noteMis,addReview,sk,status,title,short,ALLSK,PRE,LES,UNITS,STATIONS,C,esc,pick,today,checkAch,chip,level,ACH,setCur:id=>{cur=id},onLoad:f=>LOADH.push(f),onPts:f=>PTSH.push(f),tabs:o=>Object.assign(TABS,o)});
Object.assign(TABS,{home:'home',map:'ach',unit:'home',lesson:'home',diag:'home',report:'ach',sky:'ach',coach:'ach',friends:'friends',ach:'ach',lab:'lab',game:'lab'});
checkAch();window.addEventListener('hashchange',route);route();
window.__APP={S:()=>S,ALLSK};
})();
