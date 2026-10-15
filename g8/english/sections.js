/* أقسام الإنجليزية المطابقة لموقع الرياضيات: رحلتي (لوحة + خريطة المسار)، الأساسيات، المغامرات، المختبر، الترتيب، إنجازاتي، تحدّي اليوم.
   يستعمل حالة الطالب نفسها في app.js، والصوت المسجَّل مسبقًا وصور الكتاب. */
window.EN_SEC=function(C){'use strict';
const {E,esc,I,ICS,AUB,EN,page,save,hdr,U,unitStatus,go}=C;const S=()=>C.S();const A=window.EN_ADV;const $=s=>document.querySelector(s);
const arrow='<span aria-hidden="true">←</span>';
const today=()=>new Date().toISOString().slice(0,10);
const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const ALLIMG=()=>Object.values(window.EN_IMG||{}).flat();
const imgOf=id=>ALLIMG().find(x=>x.f===id+'.webp');
const FIG=(id,cls)=>{const i=imgOf(id);return i?`<figure class="bk ${cls||''}"><img src="bookimg/${i.f}" loading="lazy" decoding="async" width="${i.w}" height="${i.h}" alt="صورة من كتاب الطالب"><figcaption>من كتاب الطالب ص ${i.p}</figcaption></figure>`:''};
const xp=n=>{const s=S();s.xp=(s.xp||0)+n;save();hdr()};
const st=()=>{const s=S();s.adv=s.adv||{};s.labs=s.labs||{};s.games=s.games||{};s.det=s.det||{n:0};s.dch=s.dch||null;s.goal=s.goal||10;return s};
const dailyCorrect=()=>{const s=S();return(s.log||[]).filter(l=>l.d===today()).reduce((a,l)=>a+(l.ok||0),0)+((s.dayx&&s.dayx.d===today())?s.dayx.n:0)};
const bumpDay=n=>{const s=st();if(!s.dayx||s.dayx.d!==today())s.dayx={d:today(),n:0};s.dayx.n+=n;save()};
const totalCorrect=()=>Object.values(S().skills||{}).reduce((a,v)=>a+(v.ok||0),0);
const level=()=>1+Math.floor((S().xp||0)/200);
const LVN=['بذرة','برعم','غرسة','شتلة','مجتهد','غصن قوي','شجرة صغيرة','شجرة مثمرة','زيتونة معمّرة'];
const lvName=l=>LVN[Math.min(LVN.length,l)-1];
const myName=()=>{try{const c=window.PROFILES&&PROFILES.current&&PROFILES.current();return c&&c.name||''}catch(e){return''}};
/* ---------- خطوات كل وحدة في المسار ---------- */
const STEPS=u=>{const x=S().units[u.id]||{};const m=x.modes||{};const r=[];
 if(u.kind){r.push({t:'الدرس',ic:'book',h:'#/f/'+u.id,done:!!x.lesson});r.push({t:'تدريب',ic:'dumbbell',h:'#/p/'+u.id+'/mix',done:(m.mix||0)>=60});
  r.push({t:'استماع',ic:'star',h:'#/p/'+u.id+'/listen',done:(m.listen||0)>=60});return r}
 if(u.vocab.length)r.push({t:'المفردات والحوار',ic:'book',h:'#/u/'+u.id,done:!!x.lesson});
 r.push({t:'استماع',ic:'star',h:'#/p/'+u.id+'/listen',done:(m.listen||0)>=60});
 if(u.grammar.length)r.push({t:'القواعد',ic:'pencil',h:'#/p/'+u.id+'/grammar',done:(m.grammar||0)>=60});
 r.push({t:'تدريب شامل',ic:'dumbbell',h:'#/p/'+u.id+'/mix',done:(m.mix||0)>=60});
 r.push({t:'النطق',ic:'star',h:'#/s/'+u.id,done:!!(x.speak&&x.speak.n)});return r};
const stars=id=>{const q=(S().units[id]||{}).quiz;const b=q&&q.best;return b==null?0:b>=100?3:b>=80?2:b>=60?1:0};
const starRow=n=>`<span class="stars" aria-label="${n} من 3 نجوم">${[0,1,2].map(i=>`<i class="${i<n?'on':''}">${I('star')}</i>`).join('')}</span>`;
const unitPct=u=>{const s=STEPS(u);const d=s.filter(x=>x.done).length+(unitStatus(u.id)==='mastered'?1:0);return Math.round(100*d/(s.length+1))};
const ORDER=()=>[...E.found,...E.units];
const nextStep=()=>{for(const u of ORDER()){const s=STEPS(u).find(x=>!x.done);if(s)return{u,s};if(unitStatus(u.id)!=='mastered')return{u,s:{t:'اختبار الوحدة',h:'#/q/'+u.id}}}return null};
/* ---------- رحلتي: اللوحة الرئيسية ---------- */
let sem=1,query='';
const courses=()=>{const us=E.units.filter(u=>u.sem===sem).filter(u=>!query||(u.title+' '+u.n).toLowerCase().includes(query.toLowerCase()));
 return us.length?us.map(u=>{const p=unitPct(u),n=u.n;return `<a class="course-card course-${(n-1)%4}" href="#/u/${u.id}"><div class="course-top"><span class="course-symbol">${I(['chat','book','compass','heart','users','spark','review'][(n-1)%7])}</span><span class="course-number">الوحدة ${n}</span><span class="course-arrow" aria-hidden="true">↖</span></div>
  <h3 dir="ltr" lang="en">${esc(u.title)}</h3><p>${u.revision?'وحدة مراجعة':u.vocab.length+' كلمة · '+u.dialogues.length+' حوار'} <span>·</span> ${stars(u.id)?starRow(stars(u.id)):'بانتظار أول خطوة'}</p>
  <div class="course-progress" role="progressbar" aria-label="تقدّم الوحدة ${n}" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div><div class="course-foot"><span>${p?'أكمل ما بدأته':'اكتشف الوحدة'}</span><b>${p}%</b></div></a>`}).join(''):'<div class="course-empty">لم نجد وحدة بهذا الاسم.</div>'};
function home(){C.day();const s=st();const num=s.goal,dn=Math.min(dailyCorrect(),num),pc=Math.round(dn/num*100);const nx=nextStep();const nh=!s.place?'#/place':nx?nx.s.h:'#/review';
 const dDone=s.dch&&s.dch.date===today();const lv=level(),x=(s.xp||0)%200;const nm=myName();const advDone=A.M.filter(m=>s.adv[m.id]).length;
 page('رحلتي',`<div class="dashboard">
 <div class="welcome-row"><div><div class="eyebrow">تعلّم كل يوم</div><h1>أهلًا ${esc(nm)}، <span>ما الدرس التالي؟</span></h1><p>الإنجليزية للصف الثامن وفق كتاب English for Palestine 8.</p></div><a class="map-link" href="#/journey">${I('map')} خريطة رحلتي ${arrow}</a></div>
 <div class="dashboard-grid"><div class="learning-column">
  <section class="garden-hero" aria-labelledby="garden-heading"><img class="garden-art" src="img/zaytoun-garden-v2.webp" alt="زيتون في قرية بين أشجار الزيتون" width="1536" height="1024" fetchpriority="high"><div class="garden-copy"><span class="hero-label"><i></i> الدرس التالي</span><h2 id="garden-heading">نتعلّم الإنجليزية<br><span>خطوة بعد خطوة.</span></h2><p>${nx?`${nx.u.kind?esc(nx.u.ar):'الوحدة '+nx.u.n}: ${esc(nx.s.t)}`:'أنهيت كل الخطوات. راجع ما تعلّمته.'}<br>استمع إلى كل كلمة وجملة، ثم كرّر بصوتك.</p><a class="garden-cta" href="${nh}">${s.place?'نكمل الرحلة':'ابدأ بتحديد المستوى'} ${arrow}</a><span class="hero-footnote">${I('compass')} ${s.place?'خطوتك التالية جاهزة':'نبدأ باكتشاف مستواك'}</span></div><span class="art-caption">ابدأ من هنا</span></section>
  <div class="quick-actions"><a class="quick-action" href="#/daily"><span class="quick-icon sun-icon">${I('bolt')}</span><span><b>تحدّي اليوم</b><small>${dDone?'أنجزته، أحسنت.':'5 أسئلة متنوّعة'}</small></span>${arrow}</a><a class="quick-action" href="#/review"><span class="quick-icon review-icon">${I('review')}</span><span><b>نتمرّن ونتمكّن</b><small>${s.wrong.length?s.wrong.length+' أسئلة للمراجعة':'كل محاولة تعلّمك شيئًا'}</small></span>${arrow}</a><a class="quick-action" href="#/lab"><span class="quick-icon lab-icon">${I('lab')}</span><span><b>جرّبها بيدك</b><small>اللغة أوضح في المختبر</small></span>${arrow}</a></div>
  <section class="courses-section" aria-labelledby="courses-heading"><div class="section-heading"><div><span class="eyebrow">من كلمة… إلى حوار</span><h2 id="courses-heading">ماذا سنتعلّم اليوم؟</h2></div><a href="#/journey" class="text-link">المسار الكامل ${arrow}</a></div>
   <div class="course-controls"><div class="semester-tabs" aria-label="الفصل الدراسي"><button type="button" data-esem="1" aria-pressed="${sem===1}" class="${sem===1?'active':''}">الفصل الأول (8A)</button><button type="button" data-esem="2" aria-pressed="${sem===2}" class="${sem===2?'active':''}">الفصل الثاني (8B)</button></div><label class="course-search">${I('search')}<input id="en-course-search" type="search" placeholder="ابحث عن وحدة…" aria-label="ابحث في الوحدات" value="${esc(query)}"></label></div>
   <div class="course-grid" id="en-course-grid" aria-live="polite">${courses()}</div>
   <a class="basics-strip" href="#/found"><span class="basics-icon">${I('seed')}</span><span><b>الجذور القوية تصنع شجرة قوية</b><small>الحروف والأصوات، والقراءة الصوتية، والكلمات الأكثر تكرارًا، وقواعد أساسية.</small></span><span class="basics-link">نقوّي الأساس ${arrow}</span></a>
  </section>
  <section class="adventure-section" aria-labelledby="adventure-heading"><div class="section-heading"><div><span class="eyebrow">اللغة خارج صفحات الكتاب</span><h2 id="adventure-heading">مساحة صغيرة للمغامرة</h2></div><a href="#/play" class="text-link">كل المغامرات ${arrow}</a></div><div class="adventure-grid"><a class="story-card village-story" href="#/adv/wedding"><img src="img/zaytoun-garden-v2.webp" alt="" width="1536" height="1024" loading="lazy"><div><span class="story-tag">تعلّم بقصة</span><h3>عرس فلسطيني</h3><p>السهرة والزفة والدبكة، بالإنجليزية.</p><span>لنبدأ الحكاية ${arrow}</span></div></a><a class="story-card detective-story" href="#/detective"><img src="img/zaytoun-discovery-v2.webp" alt="" width="1536" height="1024" loading="lazy"><div><span class="story-tag">تحدّي تفكير</span><h3>عينك على الخطأ</h3><p>جملة فيها خطأ واحد.</p><span>كن المحقّق ${arrow}</span></div></a></div></section>
  ${s.place?'':`<a class="card tap cta" href="#/place">${I('target','ic')}<span><b>ابدأ باختبار تحديد المستوى</b><small>أسئلة قصيرة نعرف بعدها من أين تبدأ.</small></span></a>`}
  <footer class="garden-footer"><span>زيتون</span> نزرع الفهم، ونحصد المعرفة <span></span></footer>
 </div><aside class="growth-column" aria-label="تقدّمك وأهدافك">
  <section class="daily-card"><div class="aside-heading"><h2>قطاف اليوم</h2><span class="aside-icon">${I('target')}</span></div><p>قليلٌ كل يوم، كثيرٌ مع الوقت.</p><div class="daily-ring" style="--progress:${pc*3.6}deg"><div><b dir="ltr">${dn}<span> / ${num}</span></b><small>إجابات صحيحة</small></div></div><div class="goal-message">${pc>=100?'حققت هدف اليوم. أحسنت.':dn?'تقدّمك مستمر.':'ابدأ بخطوتك الأولى.'}</div><a class="aside-button" href="${nh}">${pc>=100?'نكتشف المزيد':'نزرع أول خطوة'} ${arrow}</a></section>
  <section class="level-card"><div class="aside-heading"><h2>شجرتك تكبر</h2><span class="level-badge">${I('seed')}</span></div><div class="level-detail"><span><b>المستوى ${lv}</b><small>${lvName(lv)}</small></span><img src="img/rank-${Math.min(8,lv)}.webp" alt="شارة مستواك" width="58" height="58"></div><div class="level-track" role="progressbar" aria-label="نقاط المستوى" aria-valuenow="${x}" aria-valuemin="0" aria-valuemax="200"><i style="width:${x/2}%"></i></div><div class="level-meta"><span>إلى المستوى التالي</span><b dir="ltr">${x} / 200 XP</b></div><div class="growth-stats"><span><b>${E.units.filter(u=>unitStatus(u.id)==='mastered').length}</b><small>وحدات متقنة</small></span><span><b>${s.streak||0}</b><small>أيام متتالية</small></span></div></section>
  <section class="coach-note"><span class="note-tape" aria-hidden="true"></span><img src="img/zaytoun-think.webp" alt="زيتون يفكّر" width="105" height="124" loading="lazy"><span class="handwritten">زيتون يقول لك</span><h3>«لا بأس أن تخطئ في النطق،<br>المهم أن تسمع وتجرّب.»</h3><p>${advDone?`أنهيت ${advDone} من ${A.M.length} مغامرات.`:'جرّب مغامرة قصيرة من الكتاب.'}</p><a href="#/play">نتعلّم معًا ${arrow}</a></section>
  <a class="next-step-card" href="${nh}"><span class="eyebrow">خطوتك القادمة</span><span class="next-step-icon">${I(s.place?'book':'compass')}</span><b>${!s.place?'اكتشف نقطة بدايتك':nx?esc(nx.s.t):'راجع ما تعلّمته'}</b><small>${!s.place?'اختبار تحديد المستوى':nx?(nx.u.kind?esc(nx.u.ar):'الوحدة '+nx.u.n):''}</small>${arrow}</a>
 </aside></div></div>`,'home');
 setTimeout(()=>{try{C.zayWelcome&&C.zayWelcome()}catch(e){}},0)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-esem]');if(!b)return;sem=+b.dataset.esem;query='';document.querySelectorAll('[data-esem]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});const s=$('#en-course-search');if(s)s.value='';$('#en-course-grid').innerHTML=courses()});
document.addEventListener('input',e=>{if(e.target.id!=='en-course-search')return;query=e.target.value.trim();$('#en-course-grid').innerHTML=courses()});
/* ---------- خريطة الرحلة (مسار مثل دولينجو) ---------- */
const UC=[['#58cc02','#58a700'],['#ce82ff','#a568cc'],['#1cb0f6','#1899d6'],['#ff9600','#cc7900'],['#ff4b4b','#ea2b2b'],['#2b70c9','#1f5aa3'],['#00b894','#00916f'],['#e05fb6','#b8468f']];
const OFF=[0,44,70,44,0,-44,-70,-44];
function journey(){const nx=nextStep();let pi=0;const poses=['read','pencil','think','teacher','idle','encourage','welcome','celebrate'];
 const sec=(u,small,name,c)=>{const side=pi++%2?'right':'left';const ss=STEPS(u);let firstOpen=ss.findIndex(x=>!x.done);if(firstOpen<0)firstOpen=ss.length;
  const nodes=ss.map((x,i)=>{const cur=nx&&nx.u===u&&nx.s.h===x.h;const cls=x.done?'done':(i>firstOpen)&&!cur?'locked':'';const ic=x.done?'check':cls==='locked'?'lock':x.ic;
   return `<a class="pn ${cls}${cur?' cur':''}" style="transform:translateX(${(side==='left'?1:-1)*OFF[i%8]}px)" href="${x.h}" aria-label="${esc(x.t)}">${cur?'<span class="start-bub">ابدأ</span>':''}<span class="disc">${I(ic)}</span><span class="lbl">${esc(x.t)}</span></a>`}).join('');
  const qd=unitStatus(u.id)==='mastered';const qn=`<a class="pn trophy ${qd?'done':''}" style="transform:translateX(${(side==='left'?1:-1)*OFF[ss.length%8]}px)" href="#/q/${u.id}" aria-label="اختبار"><span class="disc">${I('trophy')}</span><span class="lbl">${u.kind?'اختبار المرحلة':'اختبار الوحدة'} ${u.kind?'':starRow(stars(u.id))}</span></a>`;
  const m=`<img class="path-m" src="img/zaytoun-${poses[pi%poses.length]}.webp" alt="" loading="lazy" style="top:${Math.min(2,ss.length-1)*104+20}px;${side==='left'?'left':'right'}:2%">`;
  return `<section class="usec" style="--c:${c[0]};--cd:${c[1]}"><div class="ubanner" style="background:${c[0]};box-shadow:0 4px 0 ${c[1]}"><div><small>${small}</small><b ${u.kind?'':'dir="ltr" lang="en"'}>${esc(name)}</b></div><a class="guide" href="${u.kind?'#/f/'+u.id:'#/u/'+u.id}">${I('book')} الدليل</a></div><div class="path">${nodes}${qn}${m}</div></section>`};
 let h='';E.found.forEach((f,i)=>{h+=sec(f,'الأساسيات · المرحلة '+(i+1),f.ar,UC[0])});
 E.units.forEach((u,i)=>{h+=sec(u,(u.sem===1?'الفصل الأول':'الفصل الثاني')+' · الوحدة '+u.n,u.title,UC[1+i%7])});
 const tot=ORDER().length,ms=ORDER().filter(u=>unitStatus(u.id)==='mastered').length;
 page('خريطة الرحلة',`<a class="back" href="#/home">${I('back','ic')} رحلتي</a><h1 class="h1">${I('map','ic')} خريطة رحلتي</h1><div class="card jsum"><div>${FXring(Math.round(100*ms/tot))}</div><p>أتقنت <b>${ms}</b> من <b>${tot}</b> مراحل ووحدات. كل عقدة خطوة قصيرة؛ العقد المقفلة تنفتح بعد إنهاء ما قبلها، ويمكنك فتحها متى شئت. النجوم في اختبار الوحدة: نجمة من 60%، ونجمتان من 80%، وثلاث عند 100%.</p></div>${h}<p class="unit-end">${I('flag','sm')} نهاية كتاب الصف الثامن</p>`,'home');
 setTimeout(()=>{const e=$('.pn.cur');if(e)e.scrollIntoView({block:'center'})},60)}
const FXring=p=>window.FX&&FX.ring?FX.ring(p,80):`<b>${p}%</b>`;
const FXringT=(p,t)=>window.FX&&FX.ring?FX.ring(p,80,t,'#f59e0b'):`<b>${t}</b>`;
/* ---------- الأساسيات ---------- */
const FGROUP=[['الحروف والأصوات','اسم الحرف وصوته، مع كلمة لكل حرف.',['F1']],['القراءة الصوتية','أصوات الحروف المتحركة والحروف المزدوجة، ثم دمج الأصوات لقراءة الكلمة.',['F2','F3']],['الكلمات الأكثر تكرارًا','كلمات تتكرّر في كل نص تقريبًا؛ نتعلّمها بالسمع والنظر.',['F4','F5']],['قواعد أساسية','فعل الكينونة، و There is / are، و have، والمضارع، والضمائر.',['F6','F7']]];
function found(){const all=E.found;const ms=all.filter(f=>unitStatus(f.id)==='mastered').length;const pc=Math.round(100*ms/all.length);const nf=all.find(f=>unitStatus(f.id)!=='mastered');
 page('الأساسيات',`<div class="unit-hub unit-tone-0"><div class="unit-breadcrumb"><a href="#/home">رحلتي</a><span aria-hidden="true">/</span><b>الأساسيات</b></div>
 <header class="unit-intro"><div class="unit-intro-copy"><span class="unit-kicker">قبل الصف الثامن وفي أثنائه</span><h1>الأساسيات</h1><p>${all.length} مراحل: درس قصير، ثم تدريب، ثم اختبار إتقان (80%). هذا المسار ليس من الكتاب المدرسي؛ أُعدّ لتقوية الأساس.</p><a class="unit-start" href="${nf?'#/f/'+nf.id:'#/journey'}">نبدأ الخطوة التالية ${arrow}</a></div><span class="unit-emblem" aria-hidden="true">${I('seed')}<span class="unit-emblem-note">خطوة بخطوة</span></span></header>
 <div class="unit-layout"><section class="unit-lessons"><div class="unit-section-heading"><h2>طريقك في الأساسيات</h2><span>كل مرحلة، مهارة جديدة.</span></div>
 ${FGROUP.map(([t,d,ids])=>`<h3 class="fgroup">${esc(t)}</h3><p class="muted fgroup-d">${esc(d)}</p><div class="unit-lesson-list">${ids.map(id=>E.byId[id]).filter(Boolean).map(f=>{const s=unitStatus(f.id);const q=(S().units[f.id]||{}).quiz||{};const lab={new:['book','جاهز للاكتشاف'],learning:['book','نكمّل التعلّم'],mastered:['check','أتقنتها']}[s];
  return `<a class="unit-lesson-row ${s==='mastered'?'lesson-mastered':''}" href="#/f/${f.id}"><span class="lesson-step">${s==='mastered'?I('check'):all.indexOf(f)+1}</span><div class="lesson-row-copy"><small dir="ltr" lang="en">${esc(f.title)}</small><h3>${esc(f.ar)}</h3><span class="lesson-state state-${s==='new'?'untested':s}">${I(lab[0])} ${lab[1]}${q.best!=null?' · أفضل اختبار '+q.best+'%':''}</span></div><span class="lesson-row-arrow" aria-hidden="true">←</span></a>`}).join('')}</div>`).join('')}
 <a class="unit-exam" href="#/lab/pb"><span class="unit-exam-icon">${I('lab')}</span><div><span>في المختبر</span><h3>دمج الأصوات وعائلات الكلمات</h3><p>اختر بداية الكلمة ونهايتها، واسمعها تُدمج.</p></div><span class="exam-action">جرّب ${arrow}</span></a></section>
 <aside class="unit-aside"><section class="unit-progress-panel"><span class="unit-kicker">قطاف الأساسيات</span><div class="unit-progress-number"><b>${pc}<span>%</span></b><span>${ms} من ${all.length}<small>مراحل متقنة</small></span></div><div class="unit-progress-track" role="progressbar" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100" aria-label="إتقان الأساسيات"><i style="width:${pc}%"></i></div><p>الإتقان: 80% أو أكثر في اختبار المرحلة.</p></section>
 <section class="unit-next"><img src="img/zaytoun-read.webp" alt="زيتون يقرأ معك" width="170" height="200" loading="lazy"><span class="unit-kicker">نصيحة زيتون</span><h2>اسمع، ثم كرّر</h2><p>اضغط السماعة عند كل كلمة، واستعمل السرعة البطيئة عند الحاجة.</p><a href="#/place">اختبار تحديد المستوى ${arrow}</a></section></aside></div></div>`,'home')}
/* ---------- المغامرات ---------- */
function play(){const s=st();const done=A.M.filter(m=>s.adv[m.id]).length;const nm=A.M.find(m=>!s.adv[m.id])||A.M[0];
 page('المغامرات',`<div class="adventure-hub">
 <header class="adventure-intro"><div><span class="eyebrow">الخطوة التالية</span><h1>كل وحدة، <span>باب لمغامرة.</span></h1><p>قصص قصيرة من وحدات الكتاب: استمع إلى الحوار، واختر، وتحدَّ نفسك في المفردات والقواعد.</p></div><a href="#/home" class="adventure-home">${I('map')} ارجع لرحلتك ${arrow}</a></header>
 <section class="story-worlds" aria-label="قصص وتحدّيات"><a class="world-card village-world" href="#/adv/${nm.id}"><img src="img/zaytoun-garden-v2.webp" alt="زيتون بين أشجار الزيتون" width="1536" height="1024"><div class="world-copy"><span class="world-label">${I('olive')} حكايات من الكتاب</span><h2>مهمّات قصيرة.<br><span>حوار وصور وتحدٍّ.</span></h2><p>عرس فلسطيني، ومتنزّه وطني، ومائدة فلسطينية،<br>ومعنى الأسماء، ورحلة إلى الأندلس.</p><span class="world-button">${done?'نكمل المغامرات':'ابدأ المغامرة'} ${arrow}</span></div><div class="world-bottom"><span>${I('flag')} ${done?done+' من '+A.M.length+' مهمّات مكتملة':A.M.length+' مهمّات تنتظرك'}</span><span class="chapter-dots" aria-hidden="true">${A.M.map(m=>`<i class="${s.adv[m.id]?'complete':''}"></i>`).join('')}</span></div></a>
 <a class="world-card detective-world" href="#/detective"><div class="detective-art"><img src="img/zaytoun-discovery-v2.webp" alt="زيتون يفحص بعدسة المحقّق" width="1536" height="1024" loading="lazy"></div><div class="detective-copy"><span class="world-label">${I('search')} قضية تحتاج عينك</span><h2>في الجمل…<br><span>جملة فيها خطأ.</span></h2><p>اقرأ الجمل، اكتشف الخطأ،<br>واسمع الصواب.</p><div class="detective-foot"><span>${s.det.n?s.det.n+' قضايا محلولة':'أول قضية بانتظارك'}</span><span class="round-arrow" aria-hidden="true">←</span></div></div></a></section>
 <section class="thinking-activities" aria-labelledby="missions-heading"><div class="adventure-section-title"><div><span class="eyebrow">من وحدات الكتاب</span><h2 id="missions-heading">اختر مهمّة</h2></div><span class="section-note">كل مهمّة 10 دقائق تقريبًا.</span></div>
 <div class="mission-grid">${A.M.map(m=>{const r=s.adv[m.id];const u=E.byId[m.u];const i=imgOf(m.img);return `<a class="mission-card" href="#/adv/${m.id}"><span class="mission-img">${i?`<img src="bookimg/${i.f}" alt="" loading="lazy" decoding="async" width="${i.w}" height="${i.h}">`:''}</span><span class="mission-copy"><small>${esc(m.tag)} · الوحدة ${u.n}</small><b>${esc(m.title)}</b><span>${esc(m.sum)}</span><em>${r?starRow(r.stars)+' أفضل نتيجة '+r.best+'%':m.steps.length+' خطوات'}</em></span></a>`}).join('')}</div></section>
 <section class="other-pathways"><div class="adventure-section-title"><div><span class="eyebrow">أنشطة أخرى</span><h2>طرق أخرى للتعلّم</h2></div></div><div class="pathway-list"><a href="#/lab"><span class="pathway-icon">${I('lab')}</span><span><b>المختبر</b><small>ابنِ الجمل، وغيّر الأزمنة، وادمج الأصوات.</small></span>${arrow}</a><a href="#/lab/race"><span class="pathway-icon">${I('race')}</span><span><b>سباق الكلمات</b><small>جاهز لتحدّي السرعة؟</small></span>${arrow}</a><a href="#/friends"><span class="pathway-icon">${I('users')}</span><span><b>تحدّيات الأصدقاء <em>تجريبي</em></b><small>اكتشف فكرة التحدّي الجماعي.</small></span>${arrow}</a></div></section>
 <footer class="adventure-footer">${I('olive')} لا توجد طريقة واحدة للتعلّم. اكتشف طريقتك.</footer></div>`,'play')}
/* مشغّل المهمّة */
let MS=null;
function prep(m){m.steps.forEach(s=>{delete s.done;if(s.opts){const idx=sh(s.opts.map((_,j)=>j));s.o=idx.map(j=>s.opts[j]);s.a0=idx.indexOf(s.a)}if(s.t==='order'){let o=sh(s.tiles);if(o.join(' ')===s.tiles.join(' '))o=o.reverse();s.o=o}})}
function adv(id){const m=A.M.find(x=>x.id===id);if(!m)return go('#/play');prep(m);MS={m,i:0,ok:0,n:0};AU.zay(11);step()}
function step(){const {m,i}=MS;const s=m.steps[i];if(!s)return advDone();const tot=m.steps.length;
 const top=`<div class="qtop-en"><a class="back" href="#/play" aria-label="خروج">${I('x','ic')}</a><div class="bar"><i style="width:${100*i/tot}%"></i></div><b>${i+1} / ${tot}</b></div>`;
 let body='';const nextB=`<button class="btn wide" id="anext" type="button">التالي ${arrow}</button>`;let dl=null;
 if(s.t==='say')body=`<div class="card adv-say">${FIG(s.img,'wide')}<p class="adv-ar">${esc(s.ar)}</p></div>${nextB}`;
 else if(s.t==='dlg'){const d=E.byId[s.u].dialogues[0];dl=d.lines.slice(s.from,s.to);body=`<div class="card adv-dlg">${s.img?FIG(s.img,'wide'):''}${s.ar?`<p class="adv-ar">${esc(s.ar)}</p>`:'<p class="adv-ar">استمع إلى الحوار جملة جملة، أو اضغط «استمع إلى الكل».</p>'}<button class="btn sec sm" id="aall" type="button">${ICS.spk} استمع إلى الكل</button><ul class="dlg-lines">${dl.map(l=>`<li>${AUB(l.en,{v:l.g})}<b class="sp" dir="ltr">${esc(l.sp)}</b>${EN(l.en)}</li>`).join('')}</ul></div>${nextB}`}
 else if(s.t==='read')body=`<div class="card adv-read">${FIG(s.img,'wide')}<p class="adv-ar">${esc(s.ar)}</p><p class="qen" dir="ltr" lang="en">${esc(s.en)}</p>${AUB(s.en,{big:1,label:'استمع'})}</div>${nextB}`;
 else if(s.t==='mc'||s.t==='gap'){const en=s.t==='gap'||s.en;body=`<div class="card qcard-en"><p class="adv-ar">${esc(s.ar)}</p>${s.say?`<div class="qa">${AUB(s.say,{big:1,label:'استمع'})}</div>`:''}${s.t==='gap'?`<p class="qen" dir="ltr" lang="en">${esc(s.en).replace('___','<span class="gap">_____</span>')}</p>`:''}<div class="opts-en${en?'':' ar'}">${s.o.map((o,j)=>`<button class="opt" type="button" data-j="${j}" ${en?'dir="ltr" lang="en"':''}>${esc(o)}</button>`).join('')}</div></div><div id="afb"></div>`}
 else if(s.t==='pic')body=`<div class="card qcard-en"><p class="adv-ar">${esc(s.ar)}</p><div class="qa">${AUB(s.say,{big:1,label:'استمع'})}</div><div class="opts-pic">${s.o.map((o,j)=>{const im=imgOf(o);return `<button class="opt pic" type="button" data-j="${j}" aria-label="الصورة ${j+1}"><img src="bookimg/${o}.webp" alt="" loading="lazy" decoding="async"><small>ص ${im?im.p:''}</small></button>`}).join('')}</div></div><div id="afb"></div>`;
 else if(s.t==='order')body=`<div class="card qcard-en"><p class="adv-ar">${esc(s.ar)}</p><div class="qa">${AUB(s.say,{big:1,label:'استمع'})}</div><div class="bline" id="abl" dir="ltr"></div><div class="tiles-en" dir="ltr">${s.o.map((t,j)=>`<button class="tile-en" type="button" data-t="${j}">${esc(t)}</button>`).join('')}</div><button class="btn wide" id="achk" type="button">تحقّق</button></div><div id="afb"></div>`;
 else if(s.t==='spell')body=`<div class="card qcard-en"><p class="adv-ar">${esc(s.ar)}</p><div class="qa">${AUB(s.say,{big:1,label:'استمع'})}</div><input id="asp" class="spin" dir="ltr" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type here" aria-label="اكتب الاسم"><button class="btn wide" id="achk" type="button">تحقّق</button></div><div id="afb"></div>`;
 page(m.title,`<div class="adv-run">${top}<h1 class="h1 adv-h">${esc(m.title)}</h1>${body}</div>`,'play');
 const nb=$('#anext');if(nb)nb.onclick=()=>{MS.i++;step()};
 const ab=$('#aall');if(ab&&dl)ab.onclick=async()=>{if(ab.dataset.on){ab.dataset.on='';AU.stop();return}ab.dataset.on=1;await AU.playSeq(dl.map(l=>({en:l.en,g:l.g})),{stopped:()=>!ab.dataset.on});ab.dataset.on=''};
 if(s.t==='mc'||s.t==='gap'||s.t==='pic')document.querySelectorAll('.opt[data-j]').forEach(b=>b.onclick=()=>ans(+b.dataset.j===s.a0,b,s));
 if(s.t==='order'){const line=[];const bl=$('#abl');const draw=()=>{bl.innerHTML=line.map((j,k)=>`<button class="tile-en in" type="button" data-k="${k}">${esc(s.o[j])}</button>`).join('');bl.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const j=line.splice(+b.dataset.k,1)[0];document.querySelector(`.tiles-en [data-t="${j}"]`).disabled=false;draw()})};
  document.querySelectorAll('.tiles-en [data-t]').forEach(b=>b.onclick=()=>{line.push(+b.dataset.t);b.disabled=true;draw()});
  $('#achk').onclick=()=>{if(line.length<s.o.length)return;ans(line.map(j=>s.o[j]).join(' ')===s.tiles.join(' '),null,s)}}
 if(s.t==='spell'){const inp=$('#asp');const f=()=>{const v=inp.value.trim();if(!v)return;ans(v.toLowerCase()===s.ans.toLowerCase(),null,s,v)};$('#achk').onclick=f;inp.onkeydown=e=>{if(e.key==='Enter')f()}}}
function ans(ok,btn,s,given){if(s.done)return;s.done=1;MS.n++;if(ok)MS.ok++;AU.sfx(ok?'ok':'bad');
 document.querySelectorAll('.opt[data-j]').forEach(b=>{b.disabled=true;if(+b.dataset.j===s.a0)b.classList.add('ok')});if(btn&&!ok)btn.classList.add('bad');document.querySelectorAll('#achk,.tile-en,#asp').forEach(b=>b.disabled=true);
 const corr=s.t==='order'?s.tiles.join(' '):s.t==='spell'?s.ans:s.t==='pic'?'':s.full||s.opts[s.a];const hear=s.full||(s.t==='order'||s.t==='spell'?s.say:null);
 C.addSkill(s.t==='gap'?'grammar':s.t==='pic'?'listening':s.t==='spell'?'dictation':s.t==='order'?'word_order':'comprehension',ok);if(ok){xp(5);bumpDay(1)}save();
 $('#afb').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}" role="status"><b>${ok?'إجابة صحيحة':'ليست صحيحة هذه المرة'}</b>${!ok&&given?`<p>كتبت: <span dir="ltr" lang="en" class="given">${esc(given)}</span></p>`:''}${corr?`<p class="corr">${hear?AUB(hear):''}<span dir="${/[\u0600-\u06FF]/.test(corr)?'rtl':'ltr'}">${esc(corr)}</span></p>`:''}${s.why?`<p>${esc(s.why)}</p>`:''}</div><button class="btn wide" id="anext" type="button">التالي ${arrow}</button>`;
 $('#anext').onclick=()=>{MS.i++;step()};$('#anext').focus();if(!ok)setTimeout(()=>AU.zay(4),300)}
function advDone(){const {m,ok,n}=MS;const p=n?Math.round(100*ok/n):100;const stn=p>=90?3:p>=70?2:1;const s=st();const prev=s.adv[m.id];s.adv[m.id]={best:Math.max(prev?prev.best:0,p),stars:Math.max(prev?prev.stars:0,stn),d:today()};xp(20);save();
 AU.zay(stn>=2?9:17);if(stn>=2&&window.FX&&FX.confetti)try{FX.confetti()}catch(e){}
 page('أنهيت المهمّة',`<div class="card done-en"><img src="img/zaytoun-${stn>=2?'celebrate':'encourage'}.webp" alt="" width="120" height="140"><h1>${esc(m.title)}</h1>${starRow(stn)}<p>${ok} من ${n} إجابات صحيحة (${p}%). +${20+ok*5} XP</p><a class="btn wide" href="#/adv/${m.id}?r=${Date.now()}">${I('refresh','ic')} أعد المهمّة</a><a class="btn sec wide" href="#/u/${m.u}">افتح درس الوحدة ${E.byId[m.u].n}</a><a class="btn ghost wide" href="#/play">كل المغامرات</a></div>`,'play')}
/* محقّق الأخطاء */
function detective(){const s=st();const c=pick(A.DET);const u=E.byId[c[0]];const others=sh(A.DET.filter(d=>d!==c)).slice(0,2).map(d=>d[1]);const opts=sh([{t:c[2],bad:1},...others.map(t=>({t}))]);
 page('محقق الأخطاء',`<a class="back" href="#/play">${I('back','ic')} المغامرات</a><h1 class="h1">${I('search','ic')} محقق الأخطاء</h1><div class="card det-card"><img src="img/zaytoun-think.webp" alt="" width="80" height="94" class="fl"><p>جملة واحدة من هذه الجمل فيها خطأ قواعدي. اضغط عليها.</p><p class="muted">من قواعد الوحدة ${u.n}. القضايا المحلولة: ${s.det.n}</p></div>
 <div class="opts-en det-opts">${opts.map((o,j)=>`<button class="opt" type="button" data-d="${j}" dir="ltr" lang="en">${esc(o.t)}</button>`).join('')}</div><div id="dfb"></div>`,'play');
 document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const ok=!!opts[+b.dataset.d].bad;document.querySelectorAll('[data-d]').forEach(x=>{x.disabled=true;if(opts[+x.dataset.d].bad)x.classList.add('bad-sent')});if(ok){s.det.n++;xp(10);bumpDay(1)}C.addSkill('grammar',ok);save();AU.sfx(ok?'ok':'bad');
  $('#dfb').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}" role="status"><b>${ok?'أحسنت، وجدت الخطأ':'ليست هذه. الجملة الخاطئة مُعلَّمة'}</b><p dir="ltr" lang="en" class="given">${esc(c[2])}</p><p>الصواب:</p><p class="corr">${AUB(c[1])}<span dir="ltr" lang="en">${esc(c[1])}</span></p><p>${esc(c[3])}</p></div><a class="btn wide" href="#/detective?r=${Date.now()}">قضية جديدة ${arrow}</a>`})}
/* ---------- المختبر ---------- */
const TOOLS={
 sb:{cat:'sent',tone:'green',title:'باني الجمل',verb:'رتّب الكلمات واسمع الجملة',desc:'اسحب الكلمات أو اضغطها لتبني جملة من الكتاب، ثم استمع إليها.',draw:'<rect class="diagram-soft" x="20" y="40" width="60" height="30" rx="8"/><rect class="diagram-fill" x="90" y="40" width="70" height="30" rx="8"/><rect class="diagram-paper" x="170" y="40" width="70" height="30" rx="8"/><path d="M30 105h200"/><path class="diagram-accent" d="M125 75v22"/>'},
 tm:{cat:'sent',tone:'gold',title:'آلة الأزمنة',verb:'غيّر الزمن وشاهد الفعل يتغيّر',desc:'اختر الفاعل والفعل والوقت، واسمع الجملة في كل زمن.',draw:'<circle class="diagram-paper" cx="130" cy="75" r="52"/><path d="M130 75V40M130 75l26 16"/><circle class="diagram-solid" cx="130" cy="75" r="6"/><path class="diagram-accent" d="M60 30q-30 45 0 90M200 30q30 45 0 90"/>'},
 pb:{cat:'sound',tone:'blue',title:'دمج الأصوات',verb:'عائلات الكلمات والقراءة الصوتية',desc:'اختر بداية ونهاية، وحرّك المنزلق لتدمجهما وتسمع الكلمة.',draw:'<rect class="diagram-soft" x="30" y="45" width="70" height="56" rx="12"/><rect class="diagram-fill" x="160" y="45" width="70" height="56" rx="12"/><path class="diagram-accent" d="M108 73h44M144 65l8 8-8 8"/><text class="diagram-label" x="56" y="82">c</text><text class="diagram-label" x="182" y="82">at</text>'},
 pm:{cat:'sound',tone:'purple',title:'مرآة النطق',verb:'سجّل صوتك وقارنه بالنموذج',desc:'شاهد موجة صوت النموذج وموجة صوتك، واستمع إليهما.',draw:'<path class="diagram-accent" d="M20 60q10-30 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0"/><path d="M20 110q10-20 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0"/>'},
 sl:{cat:'word',tone:'orange',title:'مختبر الإملاء',verb:'اسمع واكتب حرفًا حرفًا',desc:'كل حرف صحيح يظهر باللون الأخضر، والخطأ بالأحمر.',draw:'<rect class="diagram-paper" x="30" y="40" width="200" height="60" rx="10"/><g class="diagram-label"><text x="50" y="80">s</text><text x="80" y="80">p</text><text x="110" y="80">e</text><text x="140" y="80">l</text><text x="170" y="80">l</text></g>'},
 race:{cat:'word',tone:'green',title:'سباق الكلمات',verb:'كم كلمة تعرف في دقيقة؟',desc:'كلمة إنجليزية وثلاثة معانٍ؛ اختر المعنى بسرعة.',draw:'<path d="M30 110h200"/><path class="diagram-fill" d="M60 110V40h50l-10 15 10 15H60"/><circle class="diagram-solid" cx="190" cy="80" r="22"/><path class="diagram-paper" d="M190 66v14l10 6"/>'}};
let labCat='all';
const labRows=()=>Object.entries(TOOLS).filter(([,t])=>labCat==='all'||t.cat===labCat).map(([k,t])=>{const n=st().labs[k]||0;return `<a class="experiment-row tone-${t.tone}" href="#/lab/${k}"><div class="experiment-diagram" aria-hidden="true"><svg viewBox="0 0 260 150">${t.draw}</svg></div><div class="experiment-copy"><span class="experiment-name">${esc(t.title)}</span><h3>${t.verb}</h3><p>${t.desc}</p><span class="experiment-link">${n?n+' تجارب ناجحة':'جرّب بنفسك'} ${arrow}</span></div></a>`}).join('');
document.addEventListener('click',e=>{const c=e.target.closest('[data-en-cat]');if(!c)return;labCat=c.dataset.enCat;document.querySelectorAll('[data-en-cat]').forEach(b=>{b.classList.toggle('selected',b===c);b.setAttribute('aria-pressed',String(b===c))});$('#experiment-list').innerHTML=labRows()});
function lab(k){if(k&&LT[k])return LT[k]();
 page('المختبر',`<div class="lab-hub"><header class="lab-intro"><div><span class="eyebrow">مختبر اللغة الصغير</span><h1>اللغة أوضح، <span>عندما تجرّبها.</span></h1><p>رتّب وغيّر واستمع، ثم لاحظ النتيجة.</p></div><span class="lab-count">${I('lab')} ${Object.keys(TOOLS).length} أدوات للاكتشاف</span></header>
 <a href="#/lab/tm" class="lab-spotlight"><div class="lab-spotlight-copy"><span class="experiment-name">ابدأ بشيء تعرفه</span><h2>فعل واحد.<br><span>وخمسة أزمنة.</span></h2><p>play، plays، playing، played…<br>غيّر الوقت، واسمع كيف يتغيّر الفعل.</p><span class="spotlight-button">نجرّب آلة الأزمنة ${arrow}</span></div><div class="fraction-scene" aria-hidden="true"><span class="fraction-note">الفهم يبدأ بالتجربة</span><svg viewBox="0 0 300 250"><ellipse cx="149" cy="218" rx="91" ry="12" fill="#dbe3c9"/><circle cx="150" cy="120" r="90" fill="#fffdf6" stroke="#c6d3ad" stroke-width="2"/><path d="M150 120V48M150 120l50 30" stroke="#a3b47c" stroke-width="10" stroke-linecap="round"/><circle cx="150" cy="120" r="9" fill="#647b43"/></svg><span class="fraction-caption" dir="ltr">played</span><img src="img/zaytoun-pencil.webp" alt="" width="170" height="200" loading="lazy"></div></a>
 <section class="experiments-section" aria-labelledby="experiments-heading"><div class="lab-tools-heading"><h2 id="experiments-heading">أي مهارة تريد أن تجرّب؟</h2><span>اختر أداة وجرّبها.</span></div><div class="lab-categories" aria-label="مجال الأدوات">${[['all','كل الأدوات'],['sent','الجمل والقواعد'],['sound','الأصوات والنطق'],['word','الكلمات والإملاء']].map(([id,t])=>`<button type="button" data-en-cat="${id}" class="${labCat===id?'selected':''}" aria-pressed="${labCat===id}">${t}</button>`).join('')}</div><div class="experiment-list" id="experiment-list">${labRows()}</div></section>
 <a class="lab-race-link" href="#/listen"><span class="race-mark">${ICS.spk}</span><span><small>أنشطة أخرى للتعلّم</small><b>تمارين الاستماع لكل وحدة.</b></span><span class="race-action">نستمع ${arrow}</span></a>
 <a class="lab-race-link" href="#/speak"><span class="race-mark">${ICS.mic}</span><span><small>أنشطة أخرى للتعلّم</small><b>تدريب النطق كلمة كلمة.</b></span><span class="race-action">ننطق ${arrow}</span></a>
 <footer class="adventure-footer">${I('seed')} جرّب، لاحظ، وافهم. كل تجربة تقرّبك من الإتقان.</footer></div>`,'lab')}
const labDone=k=>{const s=st();s.labs[k]=(s.labs[k]||0)+1;xp(3);bumpDay(1);save()};
const toolTop=(k,extra)=>`<a class="back" href="#/lab">${I('back','ic')} المختبر</a><h1 class="h1">${esc(TOOLS[k].title)}</h1><p class="muted">${esc(TOOLS[k].desc)}</p>${extra||''}`;
const unitSel=(id,v)=>`<label class="lsel">الوحدة <select id="${id}">${E.units.filter(u=>!u.revision).map(u=>`<option value="${u.id}" ${u.id===v?'selected':''}>${u.n}. ${esc(u.title)}</option>`).join('')}</select></label>`;
const hasAu=t=>!!AU.find(t);
/* باني الجمل */
let sbU='U1';
const sbPool=id=>{const u=E.byId[id];return[...new Set([...u.sentences.map(s=>s.en),...u.grammar.flatMap(g=>g.examples)])].filter(t=>{const w=t.split(/\s+/);return w.length>=4&&w.length<=9&&!/[…–"]/.test(t)&&hasAu(t)})};
function sb(){let pool=sbPool(sbU);if(!pool.length){sbU='U1';pool=sbPool(sbU)}const t=pick(pool);const words=t.split(/\s+/);let line=[],bank=sh(words.map((w,i)=>({w,i})));if(bank.map(x=>x.w).join(' ')===t)bank=bank.reverse();
 page('باني الجمل',`<div class="lab-tool">${toolTop('sb',unitSel('sbu',sbU))}<div class="card"><div class="row-h"><b>استمع إلى الجملة، ثم ابنِها</b>${AUB(t,{label:'استمع'})}</div><p class="muted small-note">اسحب الكلمة إلى السطر، أو اضغطها. اسحب كلمة داخل السطر لتغيير مكانها، واضغطها لإعادتها.</p>
 <div class="bline sbline" id="sbl" dir="ltr" aria-label="سطر الجملة"></div><div class="tiles-en" id="sbb" dir="ltr"></div>
 <div class="acts-row"><button class="btn sec" id="sbh" type="button">${ICS.spk} اسمع جملتك</button><button class="btn" id="sbc" type="button">تحقّق</button><button class="btn ghost" id="sbn" type="button">جملة أخرى</button></div><div id="sbf"></div></div></div>`,'lab');
 const L=$('#sbl'),Bk=$('#sbb');
 const draw=()=>{L.innerHTML=line.map((x,k)=>`<span class="tile-en in" data-k="${k}" tabindex="0" role="button">${esc(x.w)}</span>`).join('')||'<span class="ph">ضع الكلمات هنا</span>';Bk.innerHTML=bank.map((x,k)=>`<span class="tile-en" data-b="${k}" tabindex="0" role="button">${esc(x.w)}</span>`).join('')};
 draw();
 const toLine=(k,pos)=>{const x=bank.splice(k,1)[0];line.splice(pos==null?line.length:pos,0,x);draw()};
 const toBank=k=>{bank.push(line.splice(k,1)[0]);draw()};
 const posAt=(cx,cy)=>{const ts=[...L.querySelectorAll('[data-k]')];for(let i=0;i<ts.length;i++){const r=ts[i].getBoundingClientRect();if(cy<r.bottom+4&&cy>r.top-4&&cx<r.left+r.width/2)return i;if(cy<r.top-4)return i}return ts.length};
 let drag=null;
 const down=e=>{const el=e.target.closest('[data-k],[data-b]');if(!el)return;drag={el,x:e.clientX,y:e.clientY,moved:false,src:el.dataset.k!=null?'line':'bank',k:+(el.dataset.k!=null?el.dataset.k:el.dataset.b)};try{el.setPointerCapture(e.pointerId)}catch(_){}};
 const move=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<8)return;drag.moved=true;drag.el.classList.add('dragging');drag.el.style.transform=`translate(${dx}px,${dy}px)`;e.preventDefault()};
 const up=e=>{if(!drag)return;const d=drag;drag=null;d.el.style.transform='';d.el.classList.remove('dragging');
  if(!d.moved){if(d.src==='bank')toLine(d.k);else toBank(d.k);return}
  const r=L.getBoundingClientRect();const inLine=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top-24&&e.clientY<=r.bottom+24;
  if(inLine){const pos=posAt(e.clientX,e.clientY);if(d.src==='bank')toLine(d.k,pos);else{const x=line.splice(d.k,1)[0];line.splice(pos>d.k?pos-1:pos,0,x);draw()}}else if(d.src==='line')toBank(d.k);else draw()};
 [L,Bk].forEach(c=>{c.addEventListener('pointerdown',down);c.addEventListener('pointermove',move);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',()=>{if(drag){drag.el.style.transform='';drag=null}});
  c.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const el=e.target.closest('[data-k],[data-b]');if(!el)return;e.preventDefault();if(el.dataset.b!=null)toLine(+el.dataset.b);else toBank(+el.dataset.k)})});
 $('#sbu').onchange=e=>{sbU=e.target.value;sb()};$('#sbn').onclick=()=>sb();
 $('#sbh').onclick=()=>{if(line.length)AU.play(line.map(x=>x.w).join(' '))};
 $('#sbc').onclick=()=>{if(line.length<words.length){$('#sbf').innerHTML='<div class="fb-en bad" role="status"><b>استعمل كل الكلمات أولًا.</b></div>';return}const ok=line.map(x=>x.w).join(' ')===t;AU.sfx(ok?'ok':'bad');if(ok){labDone('sb');setTimeout(()=>AU.play(t),300)}C.addSkill('word_order',ok);save();
  $('#sbf').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}" role="status"><b>${ok?'جملة صحيحة':'ترتيب مختلف عن الكتاب'}</b>${ok?'':`<p class="corr">${AUB(t)}<span dir="ltr" lang="en">${esc(t)}</span></p>`}</div>`}}
/* آلة الأزمنة */
let TMs={s:1,v:0,t:0};
function tm(){const r=A.tmSent(TMs.s,TMs.v,TMs.t);const T=A.TIMES[TMs.t];const p=r.parts;
 const seg=(arr,key,lab)=>`<div class="seg" role="group" aria-label="${lab}">${arr.map((x,i)=>`<button type="button" class="${TMs[key]===i?'on':''}" data-tm="${key}" data-i="${i}">${x}</button>`).join('')}</div>`;
 page('آلة الأزمنة',`<div class="lab-tool">${toolTop('tm')}<div class="card tm-card">
 <h3>الفاعل</h3>${seg(A.SUBJ.map(x=>`<span dir="ltr">${x[0]}</span> <small>${x[1]}</small>`),'s','الفاعل')}
 <h3>الفعل</h3>${seg(A.VERBS.map(v=>`<span dir="ltr">${v.b} ${v.o}</span>`),'v','الفعل')}
 <h3>الوقت</h3>${seg(A.TIMES.map(x=>x.ar),'t','الوقت')}
 <div class="tm-out" dir="ltr" lang="en" aria-live="polite"><span>${esc(p[0])}</span> <mark>${esc(p[1])}</mark> <span>${esc(p[2])}</span>${p[3]?` <em>${esc(p[3])}</em>`:''}.</div>${AUB(r.text,{big:1,label:'استمع'})}
 <div class="tm-rule"><b>${esc(T.name)}</b><p>${esc(T.rule)}</p></div>
 <details class="tm-all"><summary>الفعل نفسه في الأزمنة الخمسة</summary><ul>${A.TIMES.map((x,i)=>{const q=A.tmSent(TMs.s,TMs.v,i);return `<li>${AUB(q.text)}<span dir="ltr" lang="en">${esc(q.text)}</span> <small>${esc(x.name)}</small></li>`}).join('')}</ul></details></div>
 <div class="card"><h3>تحقّق من فهمك</h3><p id="tmq"></p><div class="opts-en" id="tmo"></div><div id="tmf"></div></div></div>`,'lab');
 document.querySelectorAll('[data-tm]').forEach(b=>b.onclick=()=>{TMs[b.dataset.tm]=+b.dataset.i;tm();setTimeout(()=>AU.play(A.tmSent(TMs.s,TMs.v,TMs.t).text),50)});
 const si=Math.floor(Math.random()*3),vi=Math.floor(Math.random()*5),ti=Math.floor(Math.random()*5);const q=A.tmSent(si,vi,ti);const opts=sh([...new Set(A.TIMES.map((_,i)=>A.tmSent(si,vi,i).parts[1]))]).slice(0,3);if(!opts.includes(q.parts[1]))opts[0]=q.parts[1];const os=sh(opts);
 $('#tmq').innerHTML=`<span dir="ltr" lang="en">${esc(q.parts[0])} <span class="gap">_____</span> ${esc(q.parts[2])}${q.parts[3]?' '+esc(q.parts[3]):''}.</span>`;
 $('#tmo').innerHTML=os.map((o,i)=>`<button class="opt" type="button" data-o="${i}" dir="ltr" lang="en">${esc(o)}</button>`).join('');
 document.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const ok=os[+b.dataset.o]===q.parts[1];document.querySelectorAll('[data-o]').forEach(x=>{x.disabled=true;if(os[+x.dataset.o]===q.parts[1])x.classList.add('ok')});if(!ok)b.classList.add('bad');AU.sfx(ok?'ok':'bad');C.addSkill('grammar',ok);if(ok)labDone('tm');save();
  $('#tmf').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}" role="status"><b>${ok?'صحيح':'الإجابة الصحيحة ملوّنة بالأخضر'}</b><p class="corr">${AUB(q.text)}<span dir="ltr" lang="en">${esc(q.text)}</span></p><p>${esc(A.TIMES[ti].name)}: ${esc(A.TIMES[ti].rule)}</p></div><button class="btn sec" type="button" id="tmn">سؤال آخر</button>`;$('#tmn').onclick=()=>tm()})}
/* دمج الأصوات */
let PB={f:0,o:0};
function pb(){const F=A.FAM[PB.f];const on=F.on[PB.o];const w=on+F.r;
 page('دمج الأصوات',`<div class="lab-tool">${toolTop('pb')}<div class="card pb-card">
 <h3>عائلة الكلمات</h3><div class="seg">${A.FAM.map((f,i)=>`<button type="button" class="${PB.f===i?'on':''}" data-pf="${i}" dir="ltr">-${f.r}</button>`).join('')}</div>
 <h3>بداية الكلمة</h3><div class="seg">${F.on.map((o,i)=>`<button type="button" class="${PB.o===i?'on':''}" data-po="${i}" dir="ltr">${o}</button>`).join('')}</div>
 <div class="blend" dir="ltr" id="blend" style="--g:0"><span class="b-on">${esc(on)}</span><span class="b-r">${esc(F.r)}</span></div>
 <label class="blend-sl">حرّك لتدمج الصوتين<input type="range" min="0" max="100" value="0" id="pbr" aria-label="دمج الصوتين"></label>
 <div class="acts-row"><button class="btn" type="button" id="pbp">${ICS.spk} ادمج واسمع</button>${AUB(w,{label:'الكلمة'})}</div>
 <p class="pb-ar"><b dir="ltr" lang="en">${esc(w)}</b> ${esc(A.AR[w]||'')}</p>
 <p class="muted small-note">نقرأ الكلمة بدمج صوت البداية مع صوت النهاية: ${esc(on)} + ${esc(F.r)} = ${esc(w)}. نسمعها ببطء ثم بالسرعة العادية.</p></div>
 <div class="card"><h3>كلمات العائلة <span dir="ltr">-${F.r}</span></h3><div class="chips-en">${F.on.map(o=>`<span class="chip-en">${AUB(o+F.r)}<span dir="ltr" lang="en">${esc(o+F.r)}</span></span>`).join('')}</div></div>
 <div class="card"><h3>تحدٍّ: اسمع واختر بداية الكلمة</h3><div id="pbq"></div></div></div>`,'lab');
 document.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{PB={f:+b.dataset.pf,o:0};pb()});
 document.querySelectorAll('[data-po]').forEach(b=>b.onclick=()=>{PB.o=+b.dataset.po;pb()});
 const bl=$('#blend');const blendNow=async()=>{bl.style.setProperty('--g',1);$('#pbr').value=100;await AU.play(w,{rate:.75});await AU.play(w)};
 $('#pbr').oninput=e=>{bl.style.setProperty('--g',e.target.value/100);if(+e.target.value>=95&&!bl.dataset.p){bl.dataset.p=1;blendNow();labDone('pb')}};
 $('#pbp').onclick=()=>{blendNow()};
 const quiz=()=>{const f=A.FAM[Math.floor(Math.random()*A.FAM.length)];const o=pick(f.on);const ops=sh([o,...sh(f.on.filter(x=>x!==o)).slice(0,2)]);
  $('#pbq').innerHTML=`<div class="qa">${AUB(o+f.r,{big:1,label:'استمع'})}</div><div class="opts-en">${ops.map((x,i)=>`<button class="opt" type="button" data-pq="${i}" dir="ltr">${esc(x)}<small> + ${esc(f.r)}</small></button>`).join('')}</div><div id="pbf"></div>`;
  document.querySelectorAll('[data-pq]').forEach(b=>b.onclick=()=>{const ok=ops[+b.dataset.pq]===o;document.querySelectorAll('[data-pq]').forEach(x=>{x.disabled=true;if(ops[+x.dataset.pq]===o)x.classList.add('ok')});if(!ok)b.classList.add('bad');AU.sfx(ok?'ok':'bad');C.addSkill('phonics',ok);if(ok)labDone('pb');save();
   $('#pbf').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}"><b>${ok?'صحيح':'الكلمة هي'}: <span dir="ltr">${esc(o+f.r)}</span> ${esc(A.AR[o+f.r]||'')}</b></div><button class="btn sec" id="pbn" type="button">كلمة أخرى</button>`;$('#pbn').onclick=quiz})};quiz()}
/* مرآة النطق */
let PMu='U1';
function pm(){const u=E.byId[PMu];const items=[...u.vocab.map(w=>w.en),...u.sentences.map(s=>s.en)].filter(t=>t.split(' ').length<=8&&hasAu(t)).slice(0,30);
 const can=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
 page('مرآة النطق',`<div class="lab-tool">${toolTop('pm',unitSel('pmu',PMu))}<div class="card pm-card">
 <label class="lsel">الكلمة أو الجملة <select id="pmi">${items.map((t,i)=>`<option value="${i}" dir="ltr">${esc(t)}</option>`).join('')}</select></label>
 <p class="pm-t" dir="ltr" lang="en" id="pmt">${esc(items[0]||'')}</p>
 <div class="wave"><span>النموذج</span><canvas id="wv1" width="600" height="90" aria-label="موجة صوت النموذج"></canvas></div>
 <div class="wave"><span>صوتك</span><canvas id="wv2" width="600" height="90" aria-label="موجة صوتك"></canvas></div>
 <div class="acts-row"><button class="btn sec" id="pmm" type="button">${ICS.spk} النموذج</button><button class="btn" id="pmr" type="button" ${can?'':'disabled'}>${ICS.mic} سجّل (4 ثوانٍ)</button><button class="btn sec" id="pmp" type="button" disabled>${ICS.spk} تسجيلي</button></div>
 <div id="pmf" aria-live="polite">${can?'<p class="muted small-note">يبقى تسجيلك على جهازك فقط، ولا يُرسَل إلى أي مكان.</p>':'<div class="note">هذا المتصفح لا يسمح بالتسجيل. استمع إلى النموذج وكرّر بصوت مرتفع.</div>'}</div></div></div>`,'lab');
 let model=null,mine=null,mineURL=null;const ctxA=()=>window.__pmctx||(window.__pmctx=new (window.AudioContext||window.webkitAudioContext)());
 const env=(buf,n)=>{const d=buf.getChannelData(0),st=Math.floor(d.length/n),o=[];for(let i=0;i<n;i++){let m=0;for(let j=i*st;j<(i+1)*st&&j<d.length;j++)m=Math.max(m,Math.abs(d[j]));o.push(m)}const mx=Math.max(...o,1e-4);return o.map(x=>x/mx)};
 const trim=e=>{let a=0,b=e.length-1;while(a<b&&e[a]<.08)a++;while(b>a&&e[b]<.08)b--;return e.slice(a,b+1)};
 const drawW=(cv,buf,col)=>{const g=cv.getContext('2d'),W=cv.width,H=cv.height;g.clearRect(0,0,W,H);if(!buf)return;const e=env(buf,150);g.fillStyle=col;e.forEach((v,i)=>{const h=Math.max(2,v*(H-10));g.fillRect(i*W/150,(H-h)/2,W/150-1,h)})};
 const load=async t=>{model=null;drawW($('#wv1'),null);const f=AU.find(t);if(!f)return;try{const r=await fetch('audio/'+f);const ab=await r.arrayBuffer();model=await ctxA().decodeAudioData(ab);drawW($('#wv1'),model,'#647b43')}catch(e){}};
 const cur=()=>items[+$('#pmi').value]||'';if(items.length)load(cur());
 $('#pmu').onchange=e=>{PMu=e.target.value;pm()};$('#pmi').onchange=()=>{$('#pmt').textContent=cur();mine=null;drawW($('#wv2'),null);$('#pmp').disabled=true;load(cur())};
 $('#pmm').onclick=()=>AU.play(cur());
 $('#pmp').onclick=()=>{if(mineURL)new Audio(mineURL).play().catch(()=>{})};
 $('#pmr').onclick=async()=>{const b=$('#pmr');try{const s=await navigator.mediaDevices.getUserMedia({audio:true});const rec=new MediaRecorder(s);const ch=[];rec.ondataavailable=e=>ch.push(e.data);
  rec.onstop=async()=>{s.getTracks().forEach(t=>t.stop());b.disabled=false;b.innerHTML=ICS.mic+' سجّل مرة أخرى';const blob=new Blob(ch,{type:rec.mimeType||'audio/webm'});if(mineURL)URL.revokeObjectURL(mineURL);mineURL=URL.createObjectURL(blob);$('#pmp').disabled=false;
   try{mine=await ctxA().decodeAudioData(await blob.arrayBuffer());drawW($('#wv2'),mine,'#d97706');compare()}catch(e){$('#pmf').innerHTML='<p class="muted">سُجّل صوتك؛ استمع إليه وقارنه بالنموذج.</p>'}};
  rec.start();b.disabled=true;b.textContent='جارٍ التسجيل…';setTimeout(()=>{if(rec.state==='recording')rec.stop()},4000)}catch(e){$('#pmf').innerHTML='<div class="note">لم نتمكّن من استعمال الميكروفون. اسمح للموقع باستعماله من إعدادات المتصفح، أو استمع وكرّر بصوت مرتفع.</div>'}};
 const compare=()=>{if(!model||!mine)return;const a=trim(env(model,120)),b=trim(env(mine,120));const da=a.length/120*model.duration,db=b.length/120*mine.duration;
  const n=40,rs=e=>Array.from({length:n},(_,i)=>e[Math.floor(i*e.length/n)]||0);const x=rs(a),y=rs(b);const mx=x.reduce((p,v)=>p+v,0)/n,my=y.reduce((p,v)=>p+v,0)/n;let num=0,sx=0,sy=0;for(let i=0;i<n;i++){num+=(x[i]-mx)*(y[i]-my);sx+=(x[i]-mx)**2;sy+=(y[i]-my)**2}const cor=sx&&sy?num/Math.sqrt(sx*sy):0;const sim=Math.max(0,Math.round(cor*100));
  const ratio=db/Math.max(.2,da);const lenMsg=b.length<5?'لم نسمع صوتًا واضحًا. اقترب من الميكروفون وتكلّم بصوت أعلى.':ratio>1.5?'كلامك أبطأ من النموذج. حاول أن تنطقه بإيقاع أسرع قليلًا.':ratio<.6?'كلامك أسرع أو أقصر من النموذج. انطق كل مقطع بوضوح.':'طول كلامك قريب من النموذج.';
  if(b.length>=5){labDone('pm');C.addSkill('speaking',sim>=50)}save();
  $('#pmf').innerHTML=`<div class="fb-en ${sim>=50&&ratio>=.6&&ratio<=1.5?'ok':'bad'}"><b>تشابه شكل الموجة: ${sim}%</b><p>${lenMsg}</p><p class="muted small-note">المقارنة تقريبية: تقيس الإيقاع وطول الكلام، لا صحة كل صوت. استمع إلى تسجيلك وقارنه بالنموذج بأذنك.</p></div>`}}
/* مختبر الإملاء */
let SLu='U1',SLs={n:0,ok:0};
function sl(){const u=E.byId[SLu];const ws=u.vocab.map(w=>w).filter(w=>/^[a-z]+$/i.test(w.en)&&w.en.length>=3&&hasAu(w.en));const w=pick(ws.length?ws:E.byId.U1.vocab.filter(x=>/^[a-z]+$/i.test(x.en)));let hint=0;
 page('مختبر الإملاء',`<div class="lab-tool">${toolTop('sl',unitSel('slu',SLu))}<div class="card sl-card"><div class="qa">${AUB(w.en,{big:1,label:'استمع'})}</div><p class="muted">المعنى: ${esc(w.ar)} · عدد الحروف: ${w.en.length}</p>
 <div class="sl-boxes" dir="ltr" id="slb">${[...w.en].map(()=>'<span></span>').join('')}</div>
 <input id="sli" class="spin" dir="ltr" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="${w.en.length+3}" placeholder="type here" aria-label="اكتب الكلمة">
 <div class="acts-row"><button class="btn" id="slc" type="button">تحقّق</button><button class="btn sec" id="slh" type="button">أظهر حرفًا</button><button class="btn ghost" id="sln" type="button">كلمة أخرى</button></div><div id="slf"></div><p class="muted small-note">في هذه الجلسة: ${SLs.ok} من ${SLs.n} صحيحة.</p></div></div>`,'lab');
 const boxes=()=>[...$('#slb').children];const inp=$('#sli');
 const paint=(v,final)=>{boxes().forEach((b,i)=>{const c=v[i]||'';b.textContent=c||(i<hint?w.en[i]:'');b.className=c?(c.toLowerCase()===w.en[i].toLowerCase()?'g':final?'r':'p'):i<hint?'h':''})};
 inp.oninput=()=>paint(inp.value,false);
 $('#slh').onclick=()=>{hint=Math.min(w.en.length-1,hint+1);paint(inp.value,false)};
 $('#sln').onclick=()=>sl();$('#slu').onchange=e=>{SLu=e.target.value;sl()};
 const chk=()=>{const v=inp.value.trim();if(!v)return;const ok=v.toLowerCase()===w.en.toLowerCase();paint(v,true);SLs.n++;if(ok){SLs.ok++;labDone('sl')}C.addSkill('dictation',ok);save();AU.sfx(ok?'ok':'bad');
  $('#slf').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}" role="status"><b>${ok?'كتابة صحيحة':'الحروف الحمراء تحتاج تصحيحًا'}</b><p class="corr">${AUB(w.en)}<span dir="ltr" lang="en">${esc(w.en)}</span></p></div>`};
 $('#slc').onclick=chk;inp.onkeydown=e=>{if(e.key==='Enter')chk()}}
/* سباق الكلمات */
let RT=null;
function race(){const s=st();const best=s.games.race||0;
 page('سباق الكلمات',`<div class="lab-tool">${toolTop('race')}<div class="card race-card" id="rc"><p>عندك 60 ثانية. تظهر كلمة إنجليزية من وحدات الكتاب، فاختر معناها بالعربية.</p><p>أفضل نتيجة لك: <b>${best}</b></p><button class="btn wide" id="rgo" type="button">${I('race','ic')} ابدأ السباق</button></div></div>`,'lab');
 $('#rgo').onclick=()=>{const all=E.units.flatMap(u=>u.vocab).filter(w=>w.ar&&w.en.length<20);let sc=0,n=0,end=Date.now()+60000;
  const tick=()=>{const t=Math.max(0,Math.ceil((end-Date.now())/1000));const el=$('#rtm');if(el)el.textContent=t;if(t<=0)return fin();RT=setTimeout(tick,250)};
  const q=()=>{const w=pick(all);const ops=sh([w.ar,...sh([...new Set(all.filter(x=>x.ar!==w.ar).map(x=>x.ar))]).slice(0,2)]);
   $('#rc').innerHTML=`<div class="race-top"><span>${I('clock','ic')} <b id="rtm">60</b></span><span>النقاط: <b>${sc}</b></span></div><h2 class="race-w" dir="ltr" lang="en">${esc(w.en)}</h2><div class="opts-en ar">${ops.map((o,i)=>`<button class="opt" type="button" data-r="${i}">${esc(o)}</button>`).join('')}</div>`;
   document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{n++;const ok=ops[+b.dataset.r]===w.ar;if(ok)sc++;AU.sfx(ok?'ok':'bad');b.classList.add(ok?'ok':'bad');setTimeout(()=>{if(Date.now()<end)q()},ok?150:600)})};
  const fin=()=>{clearTimeout(RT);const s=st();s.games.race=Math.max(s.games.race||0,sc);if(sc)labDone('race');xp(sc);save();
   $('#rc').innerHTML=`<img src="img/zaytoun-${sc>=10?'celebrate':'encourage'}.webp" alt="" width="100" height="117" class="fl"><h2>${sc} إجابة صحيحة من ${n}</h2><p>أفضل نتيجة لك: ${s.games.race}</p><a class="btn wide" href="#/lab/race?r=${Date.now()}">${I('refresh','ic')} سباق جديد</a>`};
  q();tick()}}
window.addEventListener('hashchange',()=>{clearTimeout(RT)});
const LT={sb,tm,pb,pm,sl,race};
/* ---------- تحدّي اليوم ---------- */
function daily(){const s=st();if(s.dch&&s.dch.date===today())return page('تحدّي اليوم',`<h1 class="h1">${I('calendar','ic')} تحدّي اليوم</h1><div class="card done-en"><img src="img/zaytoun-celebrate.webp" alt="" width="120" height="140"><h2>أنجزت تحدّي اليوم: ${s.dch.score} من 5</h2><p class="muted">عد غدًا لتحدٍّ جديد.</p><a class="btn wide" href="#/lab/race">${I('race','ic')} العب سباق الكلمات</a><a class="btn sec wide" href="#/home">رحلتي</a></div>`,'home');
 const studied=E.units.filter(u=>S().units[u.id]&&!u.revision);const pool=studied.length?studied:[E.byId.U1];const qs=[];const keys=new Set();let g=0;
 while(qs.length<5&&g++<300){const u=pick(pool);const q=C.GEN.forUnit(u,null);if(!q||C.GEN.valid(q))continue;const k=q.type+(q.en||'')+(q.audio||'')+q.ans;if(keys.has(k))continue;keys.add(k);q.u=u.id;q.k=null;qs.push(q)}
 C.runSet(qs,{id:pool[0].id,mode:'mix',label:'تحدّي اليوم',back:'#/home',onDone:(p,ses)=>{const s=st();s.dch={date:today(),score:ses.ok};xp(ses.ok*5+20);save();if(ses.ok>=4&&window.FX&&FX.confetti)try{FX.confetti()}catch(e){}
  page('تحدّي اليوم',`<div class="card done-en"><img src="img/zaytoun-${ses.ok>=4?'celebrate':'encourage'}.webp" alt="" width="120" height="140"><h1>${ses.ok} من ${ses.qs.length}</h1><p>${ses.ok>=4?'تحدٍّ قوي!':'أحسنت المحاولة'} +${ses.ok*5+20} نقطة مكافأة التحدّي</p><a class="btn wide" href="#/home">رحلتي</a></div>`,'home')}})}
/* ---------- الترتيب (تجريبي مثل الرياضيات) ---------- */
const weekId=()=>{const d=new Date();const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+String(Math.ceil(((t-y)/864e5+1)/7)).padStart(2,'0')};
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0)/4294967296};
function friends(){const s=st();const wk=weekId();if(!s.week||s.week.id!==wk){s.week={id:wk,base:s.xp||0};save()}const my=(s.xp||0)-s.week.base;const nm=myName()||'أنا';
 const names=['ريم','أحمد','تالا','محمود','جود','عمر','لين','بشير','سارة'];const demo=names.map((n,i)=>({n,xp:Math.round(40+hash(wk+n+'en')*380),team:i%2})).concat([{n:nm+' (أنت)',xp:my,team:0,me:1}]).sort((a,b)=>b.xp-a.xp);
 const teams=[{n:'فريق الزيتون',ic:'olive'},{n:'فريق النخيل',ic:'spark'}].map((t,i)=>({...t,xp:demo.filter(d=>d.team===i).reduce((a,d)=>a+d.xp,0)}));
 const th=[['أسبوع الحوارات','chat','أنهِ 3 مهمّات من المغامرات'],['أسبوع الأزمنة','clock','أجب عن 10 أسئلة في آلة الأزمنة'],['أسبوع الإملاء','pencil','اكتب 15 كلمة صحيحة في مختبر الإملاء'],['أسبوع المحققين','search','حلّ 5 قضايا في محقق الأخطاء']][Math.floor(hash(wk)*4)];
 const ch=[['اجمع 300 XP هذا الأسبوع',Math.min(1,Math.max(0,my)/300)],['أنهِ 3 مغامرات',Math.min(1,Object.keys(s.adv).length/3)],['حلّ 5 قضايا تحقيق',Math.min(1,s.det.n/5)]];
 page('الترتيب',`<div class="demo-flag">${I('warn','sm')} وضع تجريبي: الأسماء والنقاط والفرق وهمية، ولا يوجد اتصال بالإنترنت. نقاطك أنت فقط حقيقية (محفوظة على هذا الجهاز).</div>
 <h1>${I('users')} تحديات الأصدقاء</h1><div class="card weekly"><span class="tile-ic big">${I(th[1])}</span><div><small class="muted">تحدي الأسبوع ${wk}</small><h2>${th[0]}</h2><p>${th[2]}</p></div></div>
 <div class="card"><h3>${I('target','sm')} تحدياتك الأسبوعية</h3>${ch.map(([t,p])=>`<div class="wch"><span>${t}</span><div class="bar"><i style="width:${p*100}%"></i></div><b>${Math.round(p*100)}%</b></div>`).join('')}</div>
 <div class="two">${teams.map(t=>`<div class="card team"><span class="tile-ic">${I(t.ic)}</span><b>${t.n}</b><span class="muted">${t.xp} XP</span></div>`).join('')}</div>
 <div class="card"><h3>${I('trophy','sm')} لوحة الصدارة الأسبوعية <span class="tag">تجريبي</span></h3><ol class="lb">${demo.map((d,i)=>`<li class="${d.me?'me':''}"><span class="lbr">${i+1}</span><span class="lbn">${esc(d.n)}</span><span class="muted">${['الزيتون','النخيل'][d.team]}</span><b>${d.xp}</b></li>`).join('')}</ol></div>
 <button class="btn ghost" id="einv" type="button">${I('send')} تحدَّ صديقًا</button>`,'friends');
 $('#einv').onclick=()=>{if(window.FX&&FX.modal)FX.modal(`<h2>يحتاج اتصالًا بالإنترنت</h2><p>دعوة الأصدقاء والفرق الحقيقية تحتاج خادمًا وحسابات بإذن الأهل. هذه الميزة غير مفعّلة بعد في الوضع التجريبي.</p>`)}}
/* ---------- إنجازاتي ---------- */
const ACH=[['star','أول خطوة','أول إجابة صحيحة',()=>totalCorrect()>=1],['check','عشرة على عشرة','10 إجابات صحيحة',()=>totalCorrect()>=10],['rocket','لا يتوقف','50 إجابة صحيحة',()=>totalCorrect()>=50],['crown','صاروخ','200 إجابة صحيحة',()=>totalCorrect()>=200],
 ['compass','المستكشف','أنهيت تحديد المستوى',()=>!!S().place],['seed','الجذور الأولى','أتقنت مرحلة من الأساسيات',()=>E.found.some(f=>unitStatus(f.id)==='mastered')],['shield','الأساس متين','أتقنت كل الأساسيات',()=>E.found.every(f=>unitStatus(f.id)==='mastered')],
 ['medal','أول وحدة','أتقنت وحدة من الكتاب',()=>E.units.some(u=>unitStatus(u.id)==='mastered')],['trophy','نصف الطريق','أتقنت 7 وحدات',()=>E.units.filter(u=>unitStatus(u.id)==='mastered').length>=7],['star','ثلاث نجوم','100% في اختبار وحدة',()=>E.units.some(u=>stars(u.id)===3)],
 ['flag','أول مغامرة','أنهيت مهمّة من المغامرات',()=>Object.keys(st().adv).length>=1],['olive','راوي الحكايات','أنهيت كل المغامرات',()=>A.M.every(m=>st().adv[m.id])],['search','محقّق ماهر','حللت 5 قضايا',()=>st().det.n>=5],
 ['lab','عالِم لغة صغير','جرّبت 3 أدوات في المختبر',()=>Object.keys(st().labs).length>=3],['race','سريع البديهة','10 نقاط في سباق الكلمات',()=>(st().games.race||0)>=10],['flame','ثلاثة أيام','3 أيام متتالية',()=>(S().streak||0)>=3],['flame','أسبوع ناري','7 أيام متتالية',()=>(S().streak||0)>=7],['calendar','هدف اليوم','أنجزت تحدّي اليوم',()=>!!st().dch]];
function ach(){const s=st();const on=ACH.filter(a=>a[3]());const lv=level();const nm=myName();
 page('إنجازاتي',`<div class="prof"><div class="av"><img src="img/zaytoun-idle.webp" alt="" width="80" height="94"></div><div><h1>${esc(nm)}</h1><p>${lvName(lv)} · المستوى ${lv}</p></div></div>
 <div class="pstats"><div class="pstat" style="color:var(--o)">${I('flame')}<div><b style="color:var(--tx)">${s.streak||0}</b><small>يوم متتالٍ</small></div></div><div class="pstat" style="color:var(--yd)">${I('star')}<div><b style="color:var(--tx)">${s.xp||0}</b><small>مجموع النقاط</small></div></div>
 <div class="pstat" style="color:var(--g)">${I('check')}<div><b style="color:var(--tx)">${ORDER().filter(u=>unitStatus(u.id)==='mastered').length}</b><small>وحدة ومرحلة متقنة</small></div></div><div class="pstat" style="color:var(--b)">${I('trophy')}<div><b style="color:var(--tx)">${on.length}</b><small>إنجاز</small></div></div></div>
 <div class="menu">${[['#/report','chart','تقرير التقدم والإعدادات'],['#/place','journey','اختبار تحديد المستوى'],['#/journey','map','خريطة الرحلة'],['#/found','seed','الأساسيات'],['#/listen','book','تمارين الاستماع'],['#/speak','chat','تدريب النطق'],['#/review','review','مراجعة الأخطاء']].map(([h,ic,t])=>`<a href="${h}">${I(ic)}${t}<span class="chev">${I('back','sm')}</span></a>`).join('')}</div>
 <h2>${I('trophy')} الإنجازات</h2><div class="card lvcard"><img src="img/rank-${Math.min(8,lv)}.webp" alt="" width="96" height="96"><div><h2>${lvName(lv)}</h2><p>المستوى ${lv} · ${200-(s.xp||0)%200} نقطة للمستوى التالي</p><div class="bar"><i style="width:${((s.xp||0)%200)/2}%"></i></div></div>${FXringT(100*on.length/ACH.length,on.length+'/'+ACH.length)}</div>
 <div class="badges">${ACH.map(a=>`<div class="badge ${a[3]()?'on':''}"><span class="medal-w en-medal">${I(a[0])}</span><b>${a[1]}</b><small>${a[2]}</small></div>`).join('')}</div>
 <div class="card"><h3>${I('target')} هدف اليوم</h3><p class="muted">عدد الإجابات الصحيحة المطلوبة يوميًا:</p>${[5,10,15,20].map(g=>`<button class="btn ${s.goal===g?'':'sec'}" data-eg="${g}" type="button">${g}</button>`).join(' ')}</div>`,'ach');
 document.querySelectorAll('[data-eg]').forEach(b=>b.onclick=()=>{st().goal=+b.dataset.eg;save();ach()})}
return{home,journey,map:journey,found,play,adv,detective,lab,daily,friends,ach,diag:()=>go('#/place'),game:()=>go('#/lab/race'),
 tabs:{home:'home',journey:'home',map:'home',found:'home',u:'home',f:'home',p:'home',q:'home',s:'home',w:'home',place:'home',review:'home',daily:'home',listen:'lab',speak:'lab',play:'play',adv:'play',detective:'play',lab:'lab',friends:'friends',ach:'ach',report:'report'}};
};
