// الإصدار 4: عبود المعلم، محقق الأخطاء، قصة القرية، لوحة الكتابة، سماء النجوم، المدرب الذكي، تحديات الأصدقاء
window.V4=function(A){'use strict';
const {V,esc,pick}=A,I=window.ICON,FX=window.FX,CS=window.CASES,HW=window.HW,$=s=>document.querySelector(s)||document.createElement('div');
const S=()=>A.S();const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const mx=t=>`<span class="mx" dir="ltr">${esc(t)}</span>`;// سطر رياضي من اليسار لليمين
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const norm4=()=>{const s=S();s.teach=s.teach||{n:0,topics:{}};s.det=s.det||{solved:0,stars:0,log:[]};s.village=s.village||{done:{}};s.board=s.board||{done:0};s.coach=s.coach||{n:0};s.week=s.week||{id:'',xp:0}};norm4();
A.onLoad(norm4);
const banner=(img,ic,t,sub)=>`<div class="banner">${FX.cover(img)}<div class="banner-t"><h1>${I(ic)} ${t}</h1><span>${sub}</span></div></div>`;
const back=(h,t)=>`<a class="back" href="${h}">${I('back','sm')} ${t}</a>`;
const ZB=(pose,html,cls)=>`<div class="dlg z ${cls||''}"><img src="img/zaytoun-${pose}.webp" alt="زيتون" class="dlg-av"><div class="bub">${html}</div></div>`;
const AB=html=>`<div class="dlg a"><span class="dlg-av ab">${I('user')}</span><div class="bub">${html}</div></div>`;
const NB=(name,ic,html)=>`<div class="dlg n"><span class="dlg-av nb">${I(ic)}</span><div class="bub"><b class="who">${name}</b>${html}</div></div>`;
function reward(n,el,skill){A.setCur(skill||null);A.addPts(n,el);A.countCorrect();FX.burst(el);A.save();A.checkAch()}
// ================= 1) عبود هو المعلم =================
V.teach=topic=>{const c=CS.make(CS.TOPICS.includes(topic)?topic:null),v=c.v[0];A.setCur(CS.skill[c.topic]);let errs=0;
 setTimeout(()=>{const box=$('#tbox'),act=$('#tact');const add=h=>{box.insertAdjacentHTML('beforeend',h);const l=box.lastElementChild;l.classList.add('in');l.scrollIntoView({block:'nearest',behavior:'smooth'})};
  const zlines=`<div class="zwork">${v.lines.map(l=>`<div>${mx(l)}</div>`).join('')}</div>`;
  add(ZB('think',`عندي مسألة: <b>${mx(c.prob.split(': ')[1]||c.prob)}</b><br>حاولت حلّها هكذا، لكن المعلمة قالت إن فيها خطأ!${zlines}علّمني الحل الصحيح خطوة خطوة يا أستاذ ${esc(S().name)}.`));
  let k=0;const order=()=>{act.innerHTML=`<p class="act-t">${I('hand','sm')} اختر الخطوة ${k+1} من ${c.steps.length}:</p><div class="opts">${shuf(c.steps.map((s,i)=>({s,i})).filter(o=>o.i>=k)).map(o=>`<button class="opt" data-i="${o.i}">${mx(o.s.t)}</button>`).join('')}</div>`;
   act.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(+b.dataset.i===k){add(AB(mx(c.steps[k].t)));k++;if(k<c.steps.length)order();else{add(ZB('read','رائع! كتبت الخطوات. لكن لماذا كل خطوة صحيحة؟ اشرح لي.'));k=0;why()}}else{errs++;b.classList.add('no');FX.mascot('encourage');add(ZB('encourage','همم... هل هذه هي الخطوة التالية فعلاً؟ ماذا نحتاج أولاً؟','short'))}})};
  const why=()=>{const s=c.steps[k],right=CS.WHY[s.why],ds=shuf(Object.values(CS.WHY).filter(w=>w!==right)).slice(0,2);add(ZB('think',`لماذا كتبت: ${mx(s.t)} ؟`,'short'));
   act.innerHTML=`<p class="act-t">${I('bulb','sm')} اختر التبرير الصحيح:</p><div class="opts">${shuf([right,...ds]).map(w=>`<button class="opt txt" data-ok="${w===right?1:0}">${esc(w)}</button>`).join('')}</div>`;
   act.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(b.dataset.ok==='1'){add(AB('لأن '+esc(right)));add(ZB('celebrate',pick(['آها! فهمت.','منطقي!','واضح الآن.']),'short'));k++;if(k<c.steps.length)why();else fix()}else{errs++;b.classList.add('no');add(ZB('encourage','لست مقتنعاً بهذا السبب... فكّر مرة أخرى.','short'))}})};
  const fix=()=>{add(ZB('pencil','الآن انظر إلى حلّي القديم. في أي سطر أخطأت؟'));act.innerHTML=`<p class="act-t">${I('search','sm')} اضغط السطر الخاطئ في حل زيتون:</p><div class="opts">${v.lines.map((l,i)=>`<button class="opt" data-i="${i}">${mx(l)}</button>`).join('')}</div>`;
   act.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(+b.dataset.i!==v.at){errs++;b.classList.add('no');add(ZB('think','هذا السطر يبدو صحيحاً لي... ابحث عن غيره.','short'));return}
    add(AB('أخطأت هنا: '+mx(v.lines[v.at])));add(ZB('think','وكيف أصحّحه؟','short'));const right=v.fix[0];
    act.innerHTML=`<p class="act-t">${I('pencil','sm')} اختر التصحيح:</p><div class="opts">${shuf(v.fix).map(f=>`<button class="opt" data-ok="${f===right?1:0}">${mx(f)}</button>`).join('')}</div>`;
    act.querySelectorAll('.opt').forEach(b2=>b2.onclick=()=>{if(b2.dataset.ok!=='1'){errs++;b2.classList.add('no');add(ZB('encourage','لا أظن ذلك. جرّب تصحيحاً آخر.','short'));return}
     add(AB('الصحيح: '+mx(right)));const s=S();s.teach.n++;s.teach.topics[c.topic]=(s.teach.topics[c.topic]||0)+1;const pts=errs===0?25:errs<3?18:12;
     add(ZB('celebrate',`شكراً يا أستاذ ${esc(S().name)}! الآن فهمت خطئي: <i>${esc(CS.mis(v.mis))}</i>`));reward(pts,b2,CS.skill[c.topic]);FX.confetti(innerWidth/2,200,70,8);
     act.innerHTML=`<div class="center"><p><b>${errs===0?'شرح مثالي!':'أحسنت التعليم!'}</b> +${pts} XP · أخطاؤك أثناء الشرح: ${errs}</p><a class="btn" href="#/teach/${c.topic}" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')),0)">${I('refresh')} مسألة أخرى</a> <a class="btn ghost" href="#/teach">${I('book')} موضوع آخر</a></div>`})})};
  order()});
 return`${back('#/play','المغامرات')}${banner('scene-explorer','user','عبود هو المعلم','زيتون محتار. علّمه وستفهم أنت أكثر!')}
 <div class="chips-row">${CS.TOPICS.map(t=>`<a class="chip ${t===c.topic?'st-mastered':''}" href="#/teach/${t}">${esc(CS.T[t]().tname)}</a>`).join('')}</div>
 <div class="card teach"><div class="tcount muted">${I('medal','sm')} علّمت زيتون ${S().teach.n} مرة · الموضوع: <b>${esc(c.tname)}</b></div><div id="tbox" class="dlgbox"></div><div id="tact" class="act"></div></div>`};
// ================= 2) محقق الأخطاء =================
const DRANK=[[0,'محقق متدرّب'],[3,'محقق مساعد'],[8,'محقق'],[15,'محقق أول'],[25,'كبير المحققين'],[40,'أسطورة التحقيق']];
const drank=n=>{let i=0;DRANK.forEach((r,k)=>{if(n>=r[0])i=k});return{i,name:DRANK[i][1],next:DRANK[i+1]}};
const STUD=['سامي','ليلى','يوسف','مريم','كريم','سلمى','آدم','هيا'];
const lens=`<svg viewBox="0 0 64 64" class="lens" aria-hidden="true"><circle cx="26" cy="26" r="17" fill="#fff7e0" stroke="#d97706" stroke-width="5"/><circle cx="26" cy="26" r="11" fill="#bfe3ff" opacity=".7"/><path d="M39 39l16 16" stroke="#7c5cff" stroke-width="8" stroke-linecap="round"/><path d="M19 21a9 9 0 0 1 8-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
V.detective=()=>{const d=S().det,rk=drank(d.solved);const c=CS.make(),v=pick(c.v),stu=pick(STUD),no=d.solved+1;A.setCur(CS.skill[c.topic]);let errs=0,phase=0;
 const wrongMis=shuf(Object.keys(window.MISC).filter(k=>k!==v.mis)).slice(0,2);
 setTimeout(()=>{const ln=$('#dlines'),act=$('#dact');const stage=t=>$('#dstage').innerHTML=t;
  ln.querySelectorAll('.wline').forEach(b=>b.onclick=()=>{if(phase)return;if(+b.dataset.i!==v.at){errs++;b.classList.add('no');FX.toast(I('x')+' هذا السطر سليم. ابحث مجدداً.');return}
   b.classList.add('caught');phase=1;stage(`${I('check','sm')} وجدت السطر! الآن: ما سبب الخطأ؟`);
   act.innerHTML=`<div class="opts">${shuf([v.mis,...wrongMis]).map(m=>`<button class="opt txt" data-ok="${m===v.mis?1:0}">${esc(CS.mis(m))}</button>`).join('')}</div>`;
   act.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{if(o.dataset.ok!=='1'){errs++;o.classList.add('no');return}o.classList.add('yes');phase=2;stage(`${I('pencil','sm')} الدافع واضح. صحّح السطر لإغلاق القضية:`);
    act.innerHTML=`<div class="opts">${shuf(v.fix).map(f=>`<button class="opt" data-ok="${f===v.fix[0]?1:0}">${mx(f)}</button>`).join('')}</div>`;
    act.querySelectorAll('.opt').forEach(f=>f.onclick=()=>{if(f.dataset.ok!=='1'){errs++;f.classList.add('no');return}
     const stars=Math.max(1,3-errs),s=S();s.det.solved++;s.det.stars+=stars;s.det.log.unshift({n:no,t:c.tname,stars,mis:v.mis,d:A.today()});s.det.log=s.det.log.slice(0,12);
     $('#dfile').classList.add('closed');reward(10+stars*5,f,CS.skill[c.topic]);const nr=drank(s.det.solved);if(nr.i>rk.i)setTimeout(()=>FX.modal(`${lens}<h2>ترقية!</h2><p>رتبتك الجديدة: <b>${nr.name}</b></p>`),900);
     stage(`${'<span class="dstar on">'+I('star')+'</span>'.repeat(stars)}${'<span class="dstar">'+I('star')+'</span>'.repeat(3-stars)} القضية مغلقة!`);
     act.innerHTML=`<div class="center"><p class="muted">الخلاصة: ${esc(CS.mis(v.mis))}</p><a class="btn" href="#/detective" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')),0)">${I('folder')} القضية التالية</a></div>`})})})});
 const prog=rk.next?Math.round(100*(d.solved-DRANK[rk.i][0])/(rk.next[0]-DRANK[rk.i][0])):100;
 return`${back('#/play','المغامرات')}<div class="det-head card">${lens}<div><h1>محقق الأخطاء</h1><p><b>${rk.name}</b> · ${d.solved} قضية · ${d.stars} نجمة</p><div class="bar"><i style="width:${prog}%"></i></div><small class="muted">${rk.next?'الرتبة التالية: '+rk.next[1]+' بعد '+(rk.next[0]-d.solved)+' قضايا':'أعلى رتبة!'}</small></div></div>
 <div class="casefile" id="dfile"><div class="tab-f">ملف القضية رقم ${no}</div><div class="stamp">مغلقة</div>
  <p class="muted">الموضوع: ${esc(c.tname)} · المشتبه به: حل الطالب <b>${stu}</b></p><h3>${esc(c.prob.split(': ')[0])}: ${mx(c.prob.split(': ')[1]||'')}</h3>${c.prob.includes(': ')?'':`<p>${esc(c.prob)}</p>`}
  <div class="paper" id="dlines">${v.lines.map((l,i)=>`<button class="wline" data-i="${i}"><span class="ln">${i+1}</span>${mx(l)}</button>`).join('')}</div></div>
 <div class="card"><p class="act-t" id="dstage">${I('search','sm')} سطر واحد فقط خاطئ. اضغطه.</p><div id="dact"></div></div>
 ${d.log.length?`<h2 class="sec-title">${I('folder')} أرشيف القضايا</h2><div class="files">${d.log.map(l=>`<div class="fcard"><b>#${l.n}</b><span>${esc(l.t)}</span><span class="fst">${'<i class="on"></i>'.repeat(l.stars)}${'<i></i>'.repeat(3-l.stars)}</span><small class="muted">${esc(CS.mis(l.mis)).slice(0,48)}…</small></div>`).join('')}</div>`:''}`};
// ================= 3) قصة القرية =================
const mcq=(q,a,ds,hint)=>({q,a:''+a,ch:shuf([{t:''+a,ok:1},...ds.filter((d,i,arr)=>''+d[0]!==''+a&&arr.findIndex(e=>''+e[0]===''+d[0])===i).slice(0,3).map(d=>({t:''+d[0],m:d[1]}))]),hint});
const pyT=()=>pick([[3,4,5],[6,8,10],[5,12,13],[9,12,15]]);
const CH=[
 {id:1,name:'بستان الزيتون',part:'grove',skill:'P15',ic:'olive',
  intro:[['g','يا عبود، بستان جدّك تُرك سنوات. لنُعِد زراعته قبل موسم المطر.'],['z','وأنا زيتونة! سأساعد إخوتي الأشجار.'],['a','ماذا نحتاج أن نعرف أولاً؟'],['g','مساحة الأرض، وكم شجرة نزرع.']],
  tasks:[()=>{const l=5*R(4,8),w=5*R(2,5);return mcq(`أرض البستان مستطيلة: طولها ${l} م وعرضها ${w} م. ما مساحتها؟`,l*w+' م²',[[2*(l+w)+' م²',window.MISC.perim],[l+w+' م²',window.MISC.perim]],'المساحة = الطول × العرض.')},
   ()=>{const n=R(16,40)*25;return mcq(`نزرع شجرة لكل 25 م². كم شجرة نحتاج لأرض مساحتها ${n} م²؟`,n/25,[[n-25,''],[n*25,'نقسم المساحة على نصيب الشجرة الواحدة.']],'المساحة ÷ 25.')},
   ()=>{const k=R(3,8);return mcq(`كل 4 أشجار تعطي 3 تنكات زيت. كم تنكة تعطي ${4*k} شجرة؟`,3*k,[[4*k-1,window.MISC.additive],[4*k,'']],'التناسب: 4 ← 3، إذن '+4*k+' ← ؟ (اضرب في '+k+').')}],
  outro:'عادت الخضرة إلى التلة! أشجار الزيتون تنمو من جديد.'},
 {id:2,name:'خزّان الماء',part:'tank',skill:'S2-6-1',ic:'drop',
  intro:[['g','الأشجار والناس يحتاجون الماء. سنبني خزاناً أسطوانياً على التلة.'],['z','كم ماءً سيتسع؟'],['a','نحتاج قانون حجم الأسطوانة: π نق² ع.']],
  tasks:[()=>{const r=R(1,3),h=R(2,5);return mcq(`خزان أسطواني نصف قطر قاعدته ${r} م وارتفاعه ${h} م. حجمه بدلالة π = ؟`,r*r*h+'π م³',[[2*r*h+'π م³','هذه المساحة الجانبية لا الحجم.'],[4*r*r*h+'π م³',window.MISC.diam]],'π × نق² × ع.')},
   ()=>{const r=1,h=R(2,4);return mcq(`خزان: نق = 1 م، ع = ${h} م. كم لتراً يتسع تقريباً؟ (π ≈ 3,14، 1 م³ = 1000 لتر)`,Math.round(3.14*h*1000)+' لتر',[[Math.round(3.14*h)+' لتر','حوّل م³ إلى لتر بالضرب في 1000.'],[Math.round(3.14*h*100)+' لتر','1 م³ = 1000 لتر وليس 100.']],'الحجم ≈ 3.14 × '+h+' م³ ثم × 1000.')},
   ()=>{const r=R(2,4);return mcq(`مساحة قاعدة خزان دائرية نصف قطرها ${r} م بدلالة π = ؟`,r*r+'π م²',[[2*r+'π م²',window.MISC.circ],[4*r*r+'π م²',window.MISC.diam]],'π نق².')}],
  outro:'الخزان ممتلئ، والماء يصل إلى البستان والبيوت.'},
 {id:3,name:'المدرسة',part:'school',skill:'P15',ic:'book',
  intro:[['g','مدرسة القرية تحتاج صفاً جديداً بسقف مائل.'],['a','سأحسب البلاط والسقف!'],['z','وأنا سأعدّ البلاطات!']],
  tasks:[()=>{const l=R(5,9),w=R(4,7);return mcq(`أرضية صف مستطيلة ${l} م × ${w} م، والبلاطة مربعة طول ضلعها 0.5 م. كم بلاطة نحتاج؟`,l*w*4,[[l*w*2,'مساحة البلاطة 0.5 × 0.5 = 0.25 م² وليست 0.5.'],[l*w,'']],'مساحة الأرضية ÷ 0.25.')},
   ()=>{const b=2*R(3,6),h=R(2,4);return mcq(`واجهة السقف مثلث قاعدته ${b} م وارتفاعه ${h} م. ما مساحتها؟`,b*h/2+' م²',[[b*h+' م²',window.MISC.half],[b+h+' م²','']],'½ × القاعدة × الارتفاع.')},
   ()=>{const l=R(20,40),w=R(10,20);return mcq(`نريد سياجاً حول ساحة المدرسة المستطيلة (${l} م × ${w} م). كم متراً نحتاج؟`,2*(l+w)+' م',[[l*w+' م',window.MISC.perim],[l+w+' م','المحيط يشمل الأضلاع الأربعة.']],'المحيط = 2 × (الطول + العرض).')}],
  outro:'قُرع الجرس! الطلاب يدخلون صفهم الجديد.'},
 {id:4,name:'البيوت',part:'houses',skill:'S1-3-1',ic:'house',
  intro:[['g','عائلات تعود إلى القرية. نحتاج إصلاح الأسطح بالسلالم.'],['z','السلم والجدار والأرض... هذا مثلث قائم!'],['a','إذن نستخدم فيثاغورس.']],
  tasks:[()=>{const [a,b,c]=pyT();return mcq(`سُلّم طوله ${c} م يصل إلى نافذة ارتفاعها ${b} م. كم يبعد أسفل السلم عن الجدار؟`,a+' م',[[Math.round(Math.sqrt(c*c+b*b)*10)/10+' م',window.MISC.pyAdd],[c-b+' م',window.MISC.sqrtSum]],`${c}² − ${b}² ثم الجذر.`)},
   ()=>{const [a,b,c]=pyT();return mcq(`سقف مائل: نصف عرض البيت ${a} م وارتفاع القمة ${b} م. طول اللوح المائل = ؟`,c+' م',[[a+b+' م',window.MISC.sqrtSum],[Math.round(Math.sqrt(Math.abs(b*b-a*a))*10)/10+' م',window.MISC.hyp]],`√(${a}² + ${b}²).`)},
   ()=>{const t=pick([[6,8,10],[5,12,13],[7,24,25]]);return mcq(`هل مثلث أضلاعه ${t[0]} و ${t[1]} و ${t[2]+1} م قائم الزاوية؟`,'لا',[['نعم',window.MISC.hyp]],`قارن ${t[2]+1}² مع ${t[0]}² + ${t[1]}².`)}],
  outro:'أضيئت النوافذ. البيوت عامرة بأهلها.'},
 {id:5,name:'السوق',part:'market',skill:'P06',ic:'gift',
  intro:[['g','القرية بحاجة إلى سوق يبيع فيه الناس زيتهم وخضارهم.'],['a','سأساعد في الحسابات والأسعار!'],['z','لا تنسَ الخصومات!']],
  tasks:[()=>{const k=R(2,9)*5;return mcq(`ربح بسطة ${k*5} شيكل يُقسم بين شريكين بنسبة 2 : 3. كم نصيب الأول؟`,k*2,[[k*5/2,'القسمة بنسبة ليست بالتساوي: 2 + 3 = 5 أجزاء.'],[k*3,'هذا نصيب الشريك الثاني.']],'نصيب الجزء = المجموع ÷ 5.')},
   ()=>{const p=R(4,12)*10,d=pick([10,20,25]);return mcq(`تنكة زيت سعرها ${p} شيكل، عليها خصم ${d}%. كم السعر الجديد؟`,p-p*d/100,[[p-d,window.MISC.pct],[p*d/100,'هذا مقدار الخصم.']],`${p} − (${d}% من ${p}).`)},
   ()=>{const a=R(2,5),pa=a*R(3,6),b=a+R(1,3),pb=b*(pa/a)-R(1,3);return mcq(`علبة لبنة ${a} كغ بـ ${pa} شيكل، وأخرى ${b} كغ بـ ${pb} شيكل. أيهما أوفر للكيلو؟`,'الثانية',[['الأولى','قارن سعر الكيلو: السعر ÷ الكتلة.'],['متساويتان','']],'احسب سعر الكيلو لكل علبة.')}],
  outro:'امتلأ السوق بالأصوات والروائح الطيبة.'},
 {id:6,name:'مهرجان القطاف',part:'fest',skill:'P19',ic:'flag',
  intro:[['g','جاء موسم القطاف! سنحتفل ونسجّل محصول كل عائلة.'],['z','هذا أجمل يوم في السنة!'],['a','سأحلل بيانات المحصول.']],
  tasks:[()=>{const xs=Array.from({length:5},()=>R(2,9)*10);const s=xs.reduce((a,b)=>a+b,0);const m=Math.round(s/5*10)/10;return mcq(`محصول 5 عائلات (كغ): ${xs.join('، ')}. الوسط الحسابي = ؟`,m,[[[...xs].sort((a,b)=>a-b)[2],window.MISC.median],[s,window.MISC.mean]],'المجموع ÷ 5.')},
   ()=>{const xs=Array.from({length:5},()=>R(1,20)*5);const md=[...xs].sort((a,b)=>a-b)[2];return mcq(`الكميات: ${xs.join('، ')}. الوسيط = ؟`,md,[[xs[2],'رتّب القيم أولاً ثم خذ الوسطى.'],[Math.round(xs.reduce((a,b)=>a+b,0)/5),window.MISC.median]],'رتّب تصاعدياً وخذ القيمة الثالثة.')},
   ()=>{const g=R(1,4),t=g+R(2,6);return mcq(`في سلة ${t} حبات زيتون، منها ${g} سوداء والباقي خضراء. احتمال سحب حبة خضراء = ؟`,(t-g)+'/'+t,[[g+'/'+t,window.MISC.compl],[(t-g)+'/'+g,window.MISC.probDen]],'عدد الخضراء ÷ العدد الكلي.')}],
  outro:'غنّت القرية ودبكت. لقد أعدت بناء القرية كلها يا عبود!'}];
function villageSVG(done,fresh){const on=k=>done[k]?'built'+(fresh===k?' rise':''):'ghost';
 const tree=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-4" width="6" height="18" rx="2" fill="#7a5230"/><ellipse cx="0" cy="-12" rx="16" ry="12" fill="#6d9b3a"/><ellipse cx="-7" cy="-16" rx="9" ry="7" fill="#89b84a"/><circle cx="5" cy="-9" r="2" fill="#2f4a12"/><circle cx="-4" cy="-6" r="1.8" fill="#2f4a12"/></g>`;
 const house=(x,y,c)=>`<g transform="translate(${x} ${y})"><rect x="0" y="0" width="34" height="26" fill="${c}" stroke="#a78657"/><path d="M-4 1L17-16 38 1z" fill="#c2410c"/><rect x="13" y="12" width="8" height="14" fill="#7a5230"/><rect x="4" y="6" width="7" height="6" fill="#fde68a" class="win"/><rect x="24" y="6" width="7" height="6" fill="#fde68a" class="win"/></g>`;
 return`<svg viewBox="0 0 400 240" class="village" role="img" aria-label="مشهد القرية"><defs><linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#fff1cf"/></linearGradient></defs>
 <rect width="400" height="240" fill="url(#vsky)"/><circle cx="340" cy="44" r="22" fill="#ffd166" class="sun"/><g class="clouds"><ellipse cx="80" cy="40" rx="30" ry="9" fill="#fff" opacity=".85"/><ellipse cx="210" cy="28" rx="24" ry="7" fill="#fff" opacity=".7"/></g>
 <path d="M0 150Q80 100 170 140T400 130V240H0z" fill="#b7d77a"/><path d="M0 185Q120 150 230 180T400 170V240H0z" fill="#9cc65a"/><path d="M0 240V215Q200 195 400 212V240z" fill="#d9c08f"/>
 <g class="part ${on('grove')}">${tree(40,138,1)}${tree(78,128,.9)}${tree(112,136,1.05)}${tree(60,165,1.1)}${tree(100,170,.95)}</g>
 <g class="part ${on('tank')}" transform="translate(160 92)"><rect x="4" y="30" width="4" height="22" fill="#6b7280"/><rect x="30" y="30" width="4" height="22" fill="#6b7280"/><rect x="0" y="6" width="38" height="26" fill="#60a5fa"/><ellipse cx="19" cy="6" rx="19" ry="5" fill="#93c5fd"/><ellipse cx="19" cy="32" rx="19" ry="5" fill="#3b82f6"/><path d="M19 52v20" stroke="#3b82f6" stroke-width="3" class="pipe"/></g>
 <g class="part ${on('school')}" transform="translate(222 110)"><rect x="0" y="10" width="70" height="36" fill="#fef3c7" stroke="#d97706"/><path d="M-6 11L35-10 76 11z" fill="#7c5cff"/><rect x="30" y="26" width="10" height="20" fill="#7a5230"/>${[6,18,48,60].map(x=>`<rect x="${x}" y="18" width="7" height="7" fill="#93c5fd"/>`).join('')}<path d="M35-10v-18" stroke="#374151" stroke-width="2"/><path d="M35-28h14l-4 4 4 4H35" fill="#16a34a" class="flagw"/></g>
 <g class="part ${on('houses')}">${house(300,148,'#fde7c8')}${house(345,160,'#f5e1c0')}${house(258,172,'#fbe9d0')}</g>
 <g class="part ${on('market')}" transform="translate(120 196)">${[0,46,92].map((x,i)=>`<g transform="translate(${x} 0)"><rect x="2" y="10" width="38" height="18" fill="#fff7e0" stroke="#a78657"/><path d="M0 10h42l-4-10H4z" fill="${['#e11d48','#16a34a','#ff9f1c'][i]}"/><circle cx="12" cy="16" r="3" fill="#89b84a"/><circle cx="21" cy="16" r="3" fill="#ef4444"/><circle cx="30" cy="16" r="3" fill="#f59e0b"/></g>`).join('')}</g>
 <g class="part ${on('fest')}"><path d="M10 92Q200 132 390 92" stroke="#6b7280" fill="none"/>${Array.from({length:12},(_,i)=>{const x=25+i*31,y=92+40*Math.sin(Math.PI*(x-10)/380)*.98;return`<path d="M${x-6} ${y}l6 12 6-12z" fill="${['#e11d48','#16a34a','#111827','#fff'][i%4]}" class="bunt" style="animation-delay:${i*.15}s"/>`}).join('')}</g>
 </svg>`}
V.village=id=>{const vd=S().village.done;const ch=CH.find(c=>''+c.id===id);
 if(!ch){const n=CH.filter(c=>vd[c.part]).length;const nxt=CH.find(c=>!vd[c.part]);
  return`${back('#/play','المغامرات')}${banner('scene-village','house','قصة القرية','أعد بناء قريتنا الفلسطينية بالرياضيات')}<div class="card vscene">${villageSVG(vd,V.village.fresh)}<div class="vprog"><b>${n}/${CH.length}</b> أجزاء مبنية</div></div>
  <div class="chapters">${CH.map((c,i)=>{const lock=i>0&&!vd[CH[i-1].part],done=vd[c.part];return`<a class="card tap chap ${lock?'lock':''} ${done?'done':''}" href="${lock?'#/village':'#/village/'+c.id}"><span class="tile-ic">${I(lock?'lock':done?'check':c.ic)}</span><div><b>الفصل ${c.id}: ${c.name}</b><span class="muted">${lock?'أنهِ الفصل السابق أولاً':done?'مبني. يمكنك إعادة اللعب':'ابدأ الفصل'}</span></div></a>`}).join('')}</div>${nxt?'':`<div class="card center">${FX.MASCOT('celebrate','empty-m float')}<h2>القرية مكتملة!</h2></div>`}`}
 const idx=CH.indexOf(ch);if(idx>0&&!vd[CH[idx-1].part])return V.village('');A.setCur(ch.skill);
 setTimeout(()=>{const box=$('#vbox'),act=$('#vact');const add=h=>{box.insertAdjacentHTML('beforeend',h);const l=box.lastElementChild;l.classList.add('in');l.scrollIntoView({block:'nearest',behavior:'smooth'})};
  const line=([w,t])=>w==='g'?NB('الجدة أم خليل','user',esc(t)):w==='z'?ZB('welcome',esc(t),'short'):AB(esc(t));let i=0,ti=0,ok=0;
  const talk=()=>{if(i<ch.intro.length){add(line(ch.intro[i++]));act.innerHTML=`<button class="btn" id="vnext">${I('arrow')} التالي</button>`;$('#vnext').onclick=talk}else task()};
  const task=()=>{if(ti>=ch.tasks.length)return finish();const t=ch.tasks[ti]();add(NB('مهمة '+(ti+1)+' من '+ch.tasks.length,'target',esc(t.q)));let first=true;
   act.innerHTML=`<div class="opts">${t.ch.map(c=>`<button class="opt" data-ok="${c.ok?1:0}" data-m="${esc(c.m||'')}">${esc(c.t)}</button>`).join('')}</div><div id="vfb"></div>`;
   act.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(b.dataset.ok==='1'){if(first)ok++;add(AB(esc(b.textContent)));reward(first?12:6,b,ch.skill);ti++;setTimeout(task,500)}
    else{first=false;b.classList.add('no');b.disabled=true;if(b.dataset.m)A.noteMis(Object.keys(window.MISC).find(k=>window.MISC[k]===b.dataset.m),ch.skill);$('#vfb').innerHTML=`<div class="fb bad">${I('bulb')} ${esc(b.dataset.m||t.hint)}<br><small>${esc(t.hint)}</small></div>`;FX.mascot('encourage')}})};
  const finish=()=>{const s=S(),was=s.village.done[ch.part];s.village.done[ch.part]=A.today();A.save();A.checkAch();add(ZB('celebrate',esc(ch.outro)));FX.mega();
   $('#vmini').innerHTML=villageSVG(s.village.done,ch.part);act.innerHTML=`<div class="center"><p>${was?'أعدت الفصل':'بُني جزء جديد'}: <b>${ch.name}</b> · ${ok}/${ch.tasks.length} من المحاولة الأولى</p>${CH[idx+1]?`<a class="btn" href="#/village/${CH[idx+1].id}">${I('play')} الفصل التالي: ${CH[idx+1].name}</a>`:''} <a class="btn ghost" href="#/village" onclick="window.__vf='${ch.part}'">${I('house')} القرية</a></div>`};
  talk()});
 return`${back('#/village','القرية')}<h1>${I(ch.ic)} الفصل ${ch.id}: ${ch.name}</h1><div class="card vscene small" id="vmini">${villageSVG(vd)}</div><div class="card"><div id="vbox" class="dlgbox"></div><div id="vact" class="act"></div></div><div class="card"><h3>الدرس المرتبط</h3>${A.chip(ch.skill,A.short(A.title(ch.skill)))}</div>`};
// ================= 4) لوحة الكتابة =================
const BT=[{type:'eq',start:'2x+3=11',show:'حلّ: 2س + 3 = 11',traps:[{line:'2x=14',mis:'moveSign'},{line:'x=11-3-2',mis:'divCoef'}],skill:'P11'},
 {type:'eq',start:'3x-5=10',show:'حلّ: 3س − 5 = 10',traps:[{line:'3x=5',mis:'moveSign'}],skill:'P11'},
 {type:'eq',start:'4(x-1)=12',show:'حلّ: 4(س − 1) = 12',traps:[{line:'4x-1=12',mis:'distFirst'}],skill:'P11'},
 {type:'eq',start:'5x+4=2x+13',show:'حلّ: 5س + 4 = 2س + 13',traps:[{line:'7x=9',mis:'moveSign'},{line:'3x=17',mis:'moveSign'}],skill:'P11'},
 {type:'expr',start:'3(x+2)-x',show:'بسّط: 3(س + 2) − س',traps:[{line:'3x+2-x',mis:'distFirst'}],skill:'S1-2-1'},
 {type:'expr',start:'2(x-3)+5x',show:'بسّط: 2(س − 3) + 5س',traps:[{line:'2x-3+5x',mis:'distFirst'}],skill:'S1-2-1'},
 {type:'num',start:'3/4+1/2',show:'احسب: 3/4 + 1/2',traps:[{line:'4/6',mis:'fracAdd'}],skill:'P04'},
 {type:'num',start:'(-6)×(-3)+2',show:'احسب: (−6) × (−3) + 2',traps:[{line:'-18+2',mis:'sign'},{line:'-16',mis:'sign'}],skill:'P01'}];
V.board=k=>{const ti=Math.min(BT.length-1,Math.max(0,parseInt(k)||0)),t=BT[ti];A.setCur(t.skill);const NL=4;
 setTimeout(()=>{const pads=[],ins=[...document.querySelectorAll('.bl-in')];let focus=0;
  document.querySelectorAll('.bl-cv').forEach((cv,i)=>{pads[i]=HW.Pad(cv,()=>{const r=pads[i].rec();ins[i].value=HW.pretty(r);ins[i].dataset.raw=r;mark(i,null)})});
  window.__pads=pads;const mark=(i,st)=>{const e=document.querySelectorAll('.bl-st')[i];e.className='bl-st '+(st===true?'ok':st===false?'bad':'');e.innerHTML=st===true?I('check'):st===false?I('x'):''+(i+1)};
  ins.forEach((e,i)=>e.onfocus=()=>{focus=i;document.querySelectorAll('.bline').forEach((b,j)=>b.classList.toggle('foc',j===i))});
  document.querySelectorAll('.bl-undo').forEach((b,i)=>b.onclick=()=>pads[i].undo());document.querySelectorAll('.bl-clr').forEach((b,i)=>b.onclick=()=>{pads[i].clear();ins[i].value='';ins[i].dataset.raw='';mark(i,null)});
  const raw=e=>(e.dataset.raw!=null&&HW.pretty(e.dataset.raw)===e.value?e.dataset.raw:e.value.replace(/−/g,'-').replace(/س/g,'x'));
  document.querySelectorAll('.kp button').forEach(b=>b.onclick=()=>{const e=ins[focus],k=b.dataset.k;if(k==='del')e.value=e.value.slice(0,-1);else if(k==='clr')e.value='';else e.value+=k;e.dataset.raw=null;mark(focus,null)});
  $('#kpt').onclick=()=>$('#kp').classList.toggle('open');window.addEventListener('resize',()=>pads.forEach(p=>p.fit()),{once:true});
  $('#bchk').onclick=()=>{const lines=ins.map(raw);const r=HW.check(t,lines);const fb=$('#bfb');r.lines.forEach(l=>l.ok!=null&&mark(l.k,l.ok));
   if(r.stop>=0){const l=r.lines[r.stop];A.noteMis(l.mis,t.skill);if(l.mis)A.addReview(t.skill,l.mis);FX.mascot('encourage');
    fb.innerHTML=`<div class="fb bad">${I('warn')} توقفت عند السطر ${r.stop+1}: <b>${mx(ins[r.stop].value||'')}</b><br>${esc(l.err||(l.mis?CS.mis(l.mis):'هذا السطر لا يكافئ السطر الذي قبله. راجع آخر عملية قمت بها.'))}<br><small class="muted">إن قرأ الجهاز خطك خطأ، صحّح النص بلوحة الأرقام.</small></div>`;return}
   if(!lines.some(x=>x.trim())){fb.innerHTML=`<div class="fb">${I('pencil')} اكتب خطوتك الأولى في السطر 1.</div>`;return}
   if(!r.done){fb.innerHTML=`<div class="fb ok">${I('check')} كل الخطوات صحيحة حتى الآن. أكمل حتى ${t.type==='eq'?'تصل إلى س = عدد':t.type==='num'?'تصل إلى عدد واحد':'تبسّط المقدار'}.</div>`;return}
   fb.innerHTML=`<div class="fb ok">${I('check')} حل صحيح خطوة بخطوة! أحسنت.</div><a class="btn" href="#/board/${(ti+1)%BT.length}">${I('arrow')} المسألة التالية</a>`;S().board.done++;reward(20,$('#bchk'),t.skill);FX.mascot('celebrate')};
 });
 const keys=['7','8','9','+','4','5','6','−','1','2','3','×','0','x','=','÷','(',')','/','del'];
 return`${back('#/play','المغامرات')}<h1>${I('pen')} لوحة الكتابة</h1><p class="muted">اكتب كل خطوة في سطر بإصبعك أو بالقلم. س تُكتب x. يفحص الموقع الخطوات سطراً سطراً ويتوقف عند أول خطأ.</p>
 <div class="chips-row">${BT.map((b,i)=>`<a class="chip ${i===ti?'st-mastered':''}" href="#/board/${i}">${i+1}</a>`).join('')}</div>
 <div class="card board"><h2 class="bprob">${mx(t.show.split(': ')[1])}<small>${esc(t.show.split(': ')[0])}</small></h2>
 ${Array.from({length:NL},(_,i)=>`<div class="bline ${i?'':'foc'}"><span class="bl-st">${i+1}</span><canvas class="bl-cv" aria-label="سطر ${i+1} للكتابة"></canvas><div class="bl-row"><input class="bl-in" dir="ltr" placeholder="النص المقروء يظهر هنا" aria-label="نص السطر ${i+1}"><button class="ib bl-undo" aria-label="تراجع">${I('undo','sm')}</button><button class="ib bl-clr" aria-label="مسح">${I('eraser','sm')}</button></div></div>`).join('')}
 <div class="brow"><button class="btn" id="bchk">${I('check')} افحص خطواتي</button><button class="btn ghost" id="kpt">${I('keypad')} لوحة الأرقام</button></div>
 <div class="kp" id="kp">${keys.map(k=>`<button data-k="${k==='del'?'del':k}">${k==='del'?I('back','sm'):k==='x'?'س':k}</button>`).join('')}</div><div id="bfb" aria-live="polite"></div></div>
 <div class="card muted small-note">${I('warn','sm')} التعرّف على الخط يعمل على جهازك دون إنترنت، وقد يخطئ في قراءة بعض الرموز المتشابهة (1 و / و ( مثلاً). اكتب الرموز كبيرة ومنفصلة، وصحّح أي قراءة خاطئة بلوحة الأرقام.</div>`};
// ================= 5) سماء النجوم =================
const GROUPS=()=>{const g=A.STATIONS.map(s=>({name:s.short,ids:s.skills}));A.C.semesters.forEach(s=>s.units.forEach(u=>g.push({name:u.title.split(/[:،]/)[0].replace(/^الوحدة\s*\S+\s*/,'').slice(0,18)||u.id,ids:u.lessons.filter(l=>!l.review).map(l=>l.id)})));return g};
const strength=id=>{const s=S().skills[id];if(!s||s.status==='untested'&&!s.att)return{v:0,d:null,st:'untested'};const st=s.status;const base={mastered:1,learning:.7,weak:.35,untested:.2}[st]||.2;
 const last=s.lastAt||(S().diag&&Date.parse(S().diag.date))||Date.parse(S().created)||Date.now();const days=(Date.now()-last)/864e5;const stab={mastered:12,learning:5,weak:3}[st]||3;return{v:base*Math.exp(-days/stab),d:days,st}};
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0)/4294967296};
V.sky=()=>{const G=GROUPS(),W=360,cw=180,chh=160,H=Math.ceil(G.length/2)*chh+20;let bright=0,dim=0,tot=0;
 const bg=Array.from({length:90},(_,i)=>`<circle cx="${(hash('x'+i)*W).toFixed(1)}" cy="${(hash('y'+i)*H).toFixed(1)}" r="${(hash('r'+i)*1.1+.3).toFixed(2)}" class="tw" style="animation-delay:${(hash('d'+i)*4).toFixed(2)}s"/>`).join('');
 const cons=G.map((g,gi)=>{const ox=(gi%2)*cw,oy=Math.floor(gi/2)*chh+10;const pts=g.ids.map((id,k)=>{const a=k/Math.max(1,g.ids.length)*Math.PI*1.7+hash(id)*0.8,r=28+hash(id+'r')*30;return[ox+cw/2+r*Math.cos(a)*1.2,oy+chh/2+r*Math.sin(a)*.9,id]});
  const lines=pts.slice(1).map((p,k)=>`<line x1="${pts[k][0].toFixed(1)}" y1="${pts[k][1].toFixed(1)}" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" class="cl"/>`).join('');
  const stars=pts.map(([x,y,id])=>{const s=strength(id);tot++;const cls=s.st==='untested'?'un':s.v>=.6?'br':'dm';if(cls==='br')bright++;if(cls==='dm')dim++;const r=2.5+s.v*4.5;
   return`<g class="star ${cls}" data-id="${id}" tabindex="0" role="button" aria-label="${esc(A.title(id))}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" class="hit"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r*2.4).toFixed(1)}" class="halo" style="opacity:${(s.v*.5).toFixed(2)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" class="core" style="opacity:${(.35+s.v*.65).toFixed(2)};animation-delay:${(hash(id)*3).toFixed(2)}s"/></g>`}).join('');
  return`<g class="cons">${lines}${stars}<text x="${ox+cw/2}" y="${oy+chh-6}" class="cn">${esc(g.name)}</text></g>`}).join('');
 setTimeout(()=>document.querySelectorAll('.star').forEach(e=>{const go=()=>{const id=e.dataset.id,s=strength(id);const p=$('#skyinfo');
  if(s.st!=='untested'&&s.v<.6){FX.toast(I('review')+' نجمة خافتة: مراجعة سريعة لـ '+esc(A.short(A.title(id))));setTimeout(()=>location.hash='#/practice/'+id,700);return}
  p.innerHTML=`<h3>${I('star','sm')} ${esc(A.title(id))}</h3><p class="muted">${s.st==='untested'?'لم تتدرب عليها بعد. ستضيء عندما تتقنها.':'لمعانها '+Math.round(s.v*100)+'% · آخر تدريب قبل '+Math.round(s.d)+' يوم'}</p><a class="btn" href="#/${s.st==='untested'?'lesson':'practice'}/${id}">${I('play')} ${s.st==='untested'?'تعلّمها':'تدرّب'}</a>`;p.scrollIntoView({behavior:'smooth',block:'nearest'})};e.onclick=go;e.onkeydown=ev=>{if(ev.key==='Enter')go()}}));
 return`${back('#/play','المغامرات')}<h1>${I('sky')} سماء مهاراتي</h1><p class="muted">كل نجمة مهارة. المتقنة تلمع، والتي لم تتدرب عليها منذ مدة تخفت تدريجياً (منحنى النسيان). اضغط نجمة خافتة لمراجعة سريعة.</p>
 <div class="skystats"><span class="pill">${I('star','sm')} لامعة: <b>${bright}</b></span><span class="pill">${I('moon','sm')} خافتة: <b>${dim}</b></span><span class="pill">${I('question','sm')} لم تُكتشف: <b>${tot-bright-dim}</b></span></div>
 <div class="skywrap"><svg viewBox="0 0 ${W} ${H}" class="skysvg"><defs><radialGradient id="skyg" cx=".5" cy=".3" r="1"><stop offset="0" stop-color="#2b2170"/><stop offset="1" stop-color="#0b0820"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#skyg)"/>${bg}${cons}</svg></div><div class="card" id="skyinfo"><p class="muted">${I('hand','sm')} اضغط أي نجمة.</p></div>`};
// ================= 6أ) المدرب الذكي (محوّل قابل للاستبدال) =================
const SOC={sign:'ماذا يحدث لو ضربت −1 في −1؟ هل الناتج أقل من صفر أم أكبر؟',subSign:'إذا كان معك 5 ثم أزلت دَيناً قيمته 3، هل يزيد ما معك أم ينقص؟',absAdd:'أي العددين أبعد عن الصفر؟ ولمن تكون الإشارة إذن؟',fracAdd:'هل نصف + نصف يساوي 2/4؟ ماذا تقول البيتزا؟',fracDiv:'كم نصفاً في العدد 3؟ هل الجواب أكبر من 3 أم أصغر؟',
 distFirst:'إذا وزّعت 2 من التفاح على كيسين، هل يأخذ الكيس الثاني شيئاً؟',distNeg:'ماذا يفعل السالب قبل القوس بكل حد داخله؟',likeTerms:'إذا كان معك 2 تفاحة و 3 تفاحات، هل صار معك تفاح مربّع؟',moveSign:'إذا أضفت 3 إلى كفة الميزان، ماذا تفعل للكفة الأخرى؟',
 facSign:'جرّب أن توزّع الأقواس التي كتبتها: هل يرجع المقدار الأصلي؟',pyAdd:'هل الضلع القائم أطول من الوتر أم أقصر؟',sqrtSum:'هل √9 + √16 يساوي √25؟ احسب الطرفين.',powMul:'هل 3² تعني 3 × 2 أم 3 × 3؟',mean:'كيف نوزّع المجموع بالتساوي على الجميع؟',median:'ما الفرق بين القيمة الوسطى والمتوسط؟',pct:'كم يساوي 10% من 100؟ وماذا عن 10% من 50؟',additive:'إذا ضاعفنا عدد الأشجار، ماذا يحدث لكمية الزيت؟'};
const LocalCoach={name:'محلي (دون إنترنت)',async reply(ctx){const {stage,item,choice,reason}=ctx;
 if(stage==='why'){if(/خمن|تخمين/.test(reason||''))return'لا بأس بالتخمين أحياناً! لكن لو كنت ستحلها بنفسك، ما الخطوة الأولى؟ فكّر ثم أخبرني إن كنت ستغيّر جوابك.';
  if(choice.ok)return pick(['تفكير جميل! كيف تتحقق من جوابك بطريقة أخرى؟','جوابك صحيح. هل يمكنك أن تشرح القاعدة بكلماتك أنت؟','ممتاز! لو تغيّرت الأعداد، هل تبقى طريقتك صحيحة؟']);
  const q=SOC[choice.mk]||(choice.m?'فكّر في هذا: '+choice.m.replace(/\.$/,'')+'... هل ينطبق على جوابك؟':'لنجرب بأعداد أصغر وأسهل. ماذا تلاحظ؟');return'سؤال لك قبل أن أخبرك: '+q}
 if(stage==='retry')return choice.ok?'رائع! أنت من اكتشف الخطأ وصححه. هذا هو التعلم الحقيقي.':'لنفكّر معاً: '+(choice.m||'راجع الخطوة الأولى')+' '+(item.hint?'تلميح: '+item.hint:'');
 return'مرحباً! سأسألك «لماذا؟» بعد كل جواب، لأن شرح السبب يثبّت الفهم.'}};
const RemoteCoach={name:'خادم خارجي',async reply(ctx,cfg){const r=await fetch(cfg.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({student:S().name,context:ctx})});if(!r.ok)throw Error(r.status);const j=await r.json();return j.reply}};
const ccfg=()=>{try{return JSON.parse(localStorage.getItem('abboud_coach_cfg'))||{mode:'local',endpoint:''}}catch(e){return{mode:'local',endpoint:''}}};
window.COACH={adapters:{local:LocalCoach,remote:RemoteCoach},async ask(ctx){const c=ccfg();if(c.mode==='remote'&&c.endpoint){try{return await RemoteCoach.reply(ctx,c)}catch(e){return LocalCoach.reply(ctx).then(t=>'(تعذّر الاتصال بالخادم، الرد من المدرب المحلي) '+t)}}return LocalCoach.reply(ctx)}};
V.coach=()=>{const s=S();const misTop=Object.entries(s.mis).sort((a,b)=>b[1].n-a[1].n)[0];const skill=misTop?Object.keys(misTop[1].skills)[0]:pick(['P01','P04','P10','P11']);A.setCur(skill);
 setTimeout(async()=>{const box=$('#cbox'),act=$('#cact');const add=h=>{box.insertAdjacentHTML('beforeend',h);box.lastElementChild.classList.add('in');box.scrollTop=box.scrollHeight};
  const typing=async ctx=>{add(ZB('think','<span class="dots"><i></i><i></i><i></i></span>','short typ'));const t=await window.COACH.ask(ctx);await new Promise(r=>setTimeout(r,500));box.querySelector('.typ')?.remove();add(ZB('teacher',esc(t),'short'))};
  await typing({stage:'hello'});const round=()=>{const it=window.genFor(skill),st=it.steps[0];add(ZB('pencil',`سؤال من «${esc(A.short(A.title(skill)))}»:<br><b class="mx2">${esc(st.q)}</b>`));
   const misK=m=>Object.keys(window.MISC).find(k=>window.MISC[k]===m);
   act.innerHTML=`<div class="opts">${st.choices.map((c,i)=>`<button class="opt" data-i="${i}">${esc(c.t)}</button>`).join('')}</div>`;
   act.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const c=st.choices[+b.dataset.i],choice={ok:!!c.ok,m:c.m||'',mk:misK(c.m)};add(AB('اخترت: '+esc(c.t)));add(ZB('think','لماذا اخترت هذا الجواب؟','short'));
    act.innerHTML=`<div class="qr">${['حسبتها خطوة بخطوة','تذكّرت قاعدة','خمّنت','لست متأكداً'].map(q=>`<button class="chip qrb">${q}</button>`).join('')}</div><form class="cin" id="cform"><input id="ctext" placeholder="أو اكتب سببك بكلماتك..." aria-label="سببك"><button class="ib" aria-label="إرسال">${I('send','sm')}</button></form>`;
    const send=async reason=>{if(!reason)return;add(AB(esc(reason)));act.innerHTML='';s.coach.n++;A.save();await typing({stage:'why',item:{q:st.q,hint:st.hint},choice,reason});
     if(choice.ok){reward(8,box.lastElementChild,skill);act.innerHTML=`<button class="btn" id="cnext">${I('arrow')} سؤال جديد</button>`;$('#cnext').onclick=round;return}
     A.noteMis(choice.mk,skill);act.innerHTML=`<p class="act-t">فكّر في سؤال المدرب، ثم اختر من جديد:</p><div class="opts">${st.choices.map((c2,i)=>`<button class="opt" data-i="${i}">${esc(c2.t)}</button>`).join('')}</div>`;
     act.querySelectorAll('.opt').forEach(b2=>b2.onclick=async()=>{const c2=st.choices[+b2.dataset.i];add(AB('أغيّر جوابي إلى: '+esc(c2.t)));act.innerHTML='';await typing({stage:'retry',item:{hint:st.hint},choice:{ok:!!c2.ok,m:c2.m||''}});if(c2.ok)reward(5,box.lastElementChild,skill);else A.addReview(skill,choice.mk);act.innerHTML=`<button class="btn" id="cnext">${I('arrow')} سؤال جديد</button>`;$('#cnext').onclick=round})};
    act.querySelectorAll('.qrb').forEach(q=>q.onclick=()=>send(q.textContent));$('#cform').onsubmit=e=>{e.preventDefault();send($('#ctext').value.trim())}})};round();
  const cf=ccfg();$('#cmode').value=cf.mode;$('#cep').value=cf.endpoint;$('#csave').onclick=()=>{localStorage.setItem('abboud_coach_cfg',JSON.stringify({mode:$('#cmode').value,endpoint:$('#cep').value.trim()}));FX.toast(I('check')+' حُفظ الإعداد');$('#cstat').textContent=$('#cmode').value==='remote'&&$('#cep').value.trim()?'خادم خارجي (تجريبي)':'محلي'}});
 const cf=ccfg();
 return`${back('#/play','المغامرات')}<h1>${I('chat')} المدرب: لماذا؟</h1><p class="muted">المدرب لا يعطيك الجواب مباشرة؛ يسألك عن سبب اختيارك ليقودك للفهم.</p>
 <div class="card chat"><div class="chat-h"><img src="img/zaytoun-teacher.webp" alt=""><div><b>المدرب زيتون</b><small class="muted">الوضع: <span id="cstat">${cf.mode==='remote'&&cf.endpoint?'خادم خارجي (تجريبي)':'محلي'}</span></small></div></div><div id="cbox" class="dlgbox chatbox"></div><div id="cact" class="act"></div></div>
 <details class="card"><summary>${I('lab','sm')} إعدادات المطوّر: محوّل المدرب</summary><p class="muted">الوضع المحلي يعمل الآن دون إنترنت ويعتمد على قائمة الأخطاء الشائعة لطرح أسئلة سقراطية. يمكن لاحقاً ربط خادم ذكاء اصطناعي: يرسل الموقع طلب POST بصيغة JSON {student, context} وينتظر {reply}. لا يوجد خادم حالياً.</p>
 <label>المحوّل <select id="cmode"><option value="local">محلي (قواعد)</option><option value="remote">خادم خارجي</option></select></label><label>عنوان الخادم <input id="cep" dir="ltr" placeholder="https://example.org/coach"></label><button class="btn ghost" id="csave">${I('check')} حفظ</button></details>`};
// ================= 6ب) تحديات الأصدقاء (عرض تجريبي) =================
const weekId=()=>{const d=new Date(),t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-day);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+Math.ceil(((t-y)/864e5+1)/7)};
A.onPts(n=>{const s=S();if(s.week.id!==weekId())s.week={id:weekId(),xp:0};s.week.xp+=n});
V.friends=()=>{const s=S();if(s.week.id!==weekId())s.week={id:weekId(),xp:0};const wk=weekId(),seed=hash(wk);
 const names=['ريم','أحمد','تالا','محمود','جود','عمر','لين','بشير','سارة'];const demo=names.map((n,i)=>({n,xp:Math.round(60+hash(wk+n)*420),team:i%2})).concat([{n:s.name+' (أنت)',xp:s.week.xp,team:0,me:1}]).sort((a,b)=>b.xp-a.xp);
 const teams=[{n:'فريق الزيتون',ic:'olive'},{n:'فريق النخيل',ic:'spark'}].map((t,i)=>({...t,xp:demo.filter(d=>d.team===i).reduce((a,d)=>a+d.xp,0)}));
 const themes=[['أسبوع الكسور','fraction','حل 15 سؤال كسور'],['أسبوع المعادلات','scale','حل 10 معادلات بالميزان أو اللوحة'],['أسبوع فيثاغورس','triangle','أنهِ فصل البيوت في القرية'],['أسبوع المحققين','search','أغلق 5 قضايا']];const th=themes[Math.floor(seed*themes.length)];
 const ch=[['اجمع 300 XP هذا الأسبوع',Math.min(1,s.week.xp/300)],['أغلق 5 قضايا تحقيق',Math.min(1,s.det.solved/5)],['علّم زيتون 3 مرات',Math.min(1,s.teach.n/3)]];
 return`${back('#/play','المغامرات')}<div class="demo-flag">${I('warn','sm')} وضع تجريبي: الأسماء والنقاط والفرق وهمية، ولا يوجد اتصال بالإنترنت. نقاطك أنت فقط حقيقية (محفوظة على هذا الجهاز).</div>
 <h1>${I('users')} تحديات الأصدقاء</h1><div class="card weekly"><span class="tile-ic big">${I(th[1])}</span><div><small class="muted">تحدي الأسبوع ${wk}</small><h2>${th[0]}</h2><p>${th[2]}</p></div></div>
 <div class="card"><h3>${I('target','sm')} تحدياتك الأسبوعية</h3>${ch.map(([t,p])=>`<div class="wch"><span>${t}</span><div class="bar"><i style="width:${p*100}%"></i></div><b>${Math.round(p*100)}%</b></div>`).join('')}</div>
 <div class="two">${teams.map(t=>`<div class="card team"><span class="tile-ic">${I(t.ic)}</span><b>${t.n}</b><span class="muted">${t.xp} XP</span></div>`).join('')}</div>
 <div class="card"><h3>${I('trophy','sm')} لوحة الصدارة الأسبوعية <span class="tag">تجريبي</span></h3><ol class="lb">${demo.map((d,i)=>`<li class="${d.me?'me':''}"><span class="lbr">${i+1}</span><span class="lbn">${esc(d.n)}</span><span class="muted">${['الزيتون','النخيل'][d.team]}</span><b>${d.xp}</b></li>`).join('')}</ol></div>
 <button class="btn ghost" id="invite">${I('send')} تحدَّ صديقاً</button>`};
setTimeout(()=>{},0);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#invite'))FX.modal(`${FX.MASCOT('think','empty-m')}<h2>يحتاج اتصالاً بالإنترنت</h2><p>دعوة الأصدقاء والفرق الحقيقية تحتاج خادماً وحسابات بإذن الأهل. هذه الميزة غير مفعّلة بعد في الوضع التجريبي.</p>`)});
// ================= مركز المغامرات + الرئيسية =================
const ADV=[['#/teach','scene-explorer','user','عبود هو المعلم','علّم زيتون واكتشف خطأه',()=>S().teach.n+' درس'],['#/detective','scene-tower','search','محقق الأخطاء','اكشف السطر الخاطئ',()=>drank(S().det.solved).name],
 ['#/village','scene-village','house','قصة القرية','ابنِ القرية بالرياضيات',()=>CH.filter(c=>S().village.done[c.part]).length+'/6'],['#/board','scene-house','pen','لوحة الكتابة','اكتب خطواتك بيدك',()=>S().board.done+' حل'],
 ['#/sky','scene-glass','sky','سماء النجوم','مهاراتك كنجوم تلمع وتخفت',()=>''],['#/coach','scene-market','chat','المدرب: لماذا؟','حوار يسألك عن السبب',()=>''],['#/friends','scene-triangle','users','تحديات الأصدقاء','وضع تجريبي',()=>'تجريبي']];
const advCards=()=>`<div class="adv">${ADV.map(([h,img,ic,t,d,f])=>`<a class="advc" href="${h}">${FX.cover(img)}<span class="adv-ic">${I(ic)}</span><div class="adv-b"><b>${t}</b><span>${d}</span>${f()?`<small>${f()}</small>`:''}</div></a>`).join('')}</div>`;
V.play=()=>`${banner('scene-explorer','compass','المغامرات','طرق جديدة للتعلّم: علّم، حقّق، ابنِ، اكتب')}${advCards()}<h2 class="sec-title">${I('lab')} وأيضاً</h2><div class="tiles4"><a class="card tap tile" href="#/lab"><span class="tile-ic">${I('lab')}</span><b>المختبر</b></a><a class="card tap tile" href="#/game"><span class="tile-ic">${I('race')}</span><b>سباق الأعداد</b></a></div>`;
const oh=V.home;V.home=a=>{const h=oh(a);const i=h.indexOf('<h2 class="sec-title">');const sec=`<h2 class="sec-title">${I('compass')} مغامرات التعلّم <a class="see" href="#/play">الكل ${I('arrow','sm')}</a></h2>${advCards()}`;return i<0?h+sec:h.slice(0,i)+sec+h.slice(i)};
const ow=V.village;V.village=id=>{V.village.fresh=window.__vf||null;window.__vf=null;return ow(id)};
A.ACH.push(['teach','user','أستاذ زيتون','علّمت زيتون 3 مرات',()=>S().teach&&S().teach.n>=3],['det','search','عين المحقق','أغلقت 5 قضايا',()=>S().det&&S().det.solved>=5],
 ['vill','house','باني القرية','أعدت بناء القرية كلها',()=>S().village&&CH.every(c=>S().village.done[c.part])],['board','pen','بخط يدي','حللت مسألة على لوحة الكتابة',()=>S().board&&S().board.done>=1],['coach','chat','لماذا؟','حاورت المدرب 3 مرات',()=>S().coach&&S().coach.n>=3]);
A.tabs({teach:'play',detective:'play',village:'play',board:'play',sky:'play',coach:'play',friends:'play',play:'play'});
};
