// مختبر الأدوات التفاعلية + لعبة سباق الأعداد الصحيحة
(function(){
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),NZ=(a,b)=>{let x=0;while(!x)x=R(a,b);return x};
const M=n=>n<0?'−'+(-n):''+n,P=n=>n<0?'('+M(n)+')':''+n,I=window.ICON;
const svgPt=(svg,e)=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
const fb=(root,ok,html)=>{const f=root.querySelector('.lab-fb');f.className='lab-fb fb '+(ok?'ok':'bad');f.innerHTML=html;if(!ok){f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake')}};
const T={};
// ===== 1) خط الأعداد القابل للسحب =====
T.nl={title:'خط الأعداد',icon:'numline',skills:['P01','P02','S1-1-4'],desc:'اسحب النقطة البرتقالية إلى الجواب. القفز يميناً = جمع موجب، يساراً = سالب.',
 html:()=>`<div class="lab-task" id="nlq"></div><svg class="nl" viewBox="0 0 640 150" id="nlsvg"><g id="nlarc"></g><line x1="20" y1="100" x2="620" y2="100" class="nl-axis"/>${Array.from({length:21},(_,i)=>{const v=i-10,x=20+i*30;return`<line x1="${x}" y1="${v%5?92:86}" x2="${x}" y2="${v%5?108:114}" class="nl-tick"/><text x="${x}" y="134" class="nl-num" text-anchor="middle">${M(v)}</text>`}).join('')}<circle id="nlstart" r="7" cy="100" class="nl-start"/><g id="nlm" class="nl-marker" tabindex="0" role="slider" aria-label="المؤشر"><circle r="17" cy="100" class="nl-knob"/><text y="106" text-anchor="middle" class="nl-kt" id="nlmt">0</text></g></svg>
 <div class="lab-row"><button class="btn" id="nlc">${I('check')} تحقق</button><button class="btn sec" id="nln">${I('refresh')} مسألة جديدة</button></div><div class="lab-fb"></div>`,
 init(root,ctx){const svg=root.querySelector('#nlsvg'),m=root.querySelector('#nlm');let v=0,a,b,drag=false;
  const X=v=>20+(v+10)*30;const set=n=>{v=Math.max(-10,Math.min(10,n));m.setAttribute('transform',`translate(${X(v)},0)`);root.querySelector('#nlmt').textContent=M(v)};
  const story=[(a,b)=>`كانت درجة الحرارة في الصباح ${M(a)}° ثم ${b>0?'ارتفعت':'انخفضت'} ${Math.abs(b)}°. كم أصبحت؟`,(a,b)=>`مصعد في الطابق ${M(a)}، ${b>0?'صعد':'نزل'} ${Math.abs(b)} طوابق. في أي طابق صار؟`,(a,b)=>`احسب: ${M(a)} + ${P(b)}`];
  const nw=()=>{do{a=NZ(-8,8);b=NZ(-9,9)}while(Math.abs(a+b)>10);set(a);root.querySelector('#nlstart').setAttribute('cx',X(a));root.querySelector('#nlarc').innerHTML='';
   root.querySelector('#nlq').textContent=story[R(0,2)](a,b);root.querySelector('.lab-fb').className='lab-fb'};
  m.addEventListener('pointerdown',e=>{drag=true;m.setPointerCapture(e.pointerId)});m.addEventListener('pointermove',e=>{if(drag)set(Math.round((svgPt(svg,e).x-20)/30)-10)});m.addEventListener('pointerup',()=>drag=false);
  svg.addEventListener('click',e=>{if(e.target.closest('#nlm'))return;set(Math.round((svgPt(svg,e).x-20)/30)-10)});
  m.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')set(v-1);if(e.key==='ArrowRight')set(v+1)});
  root.querySelector('#nln').onclick=nw;
  root.querySelector('#nlc').onclick=()=>{const c=a+b;if(v===c){const x1=X(a),x2=X(c);root.querySelector('#nlarc').innerHTML=`<path d="M${x1} 92 Q${(x1+x2)/2} ${30} ${x2} 92" class="nl-jump"/><text x="${(x1+x2)/2}" y="46" text-anchor="middle" class="nl-jt">${b>0?'+':''}${M(b)}</text>`;
    fb(root,true,`صحيح! ${M(a)} + ${P(b)} = ${M(c)}`);ctx.reward(8,m)}
   else{ctx.miss('P01',v===a-b?'الطرح يعني جمع المعكوس: انتبه لاتجاه القفز.':v===-c?'تذكّر قاعدة الإشارات وراجع اتجاه الحركة.':'');fb(root,false,`ليس بعد. ابدأ من ${M(a)} وتحرّك ${Math.abs(b)} خطوات ${b>0?'يميناً':'يساراً'}.`)}};nw()}};
// ===== 2) أشرطة الكسور والبيتزا =====
T.fr={title:'بنّاء الكسور',icon:'fraction',skills:['P03','P04','S1-1-1'],desc:'اختر عدد الأجزاء (المقام) ثم اضغط على الأجزاء لتلوينها. الشريط والبيتزا يتغيران معاً.',
 html:()=>`<div class="lab-task" id="frq"></div><div class="lab-row center"><button class="btn sec sq" id="frm" aria-label="أنقص">−</button><span class="stepper-v">المقام: <b id="frd">4</b></span><button class="btn sec sq" id="frp" aria-label="زد">+</button></div>
 <div class="fr-wrap"><svg viewBox="0 0 220 220" class="pizza" id="frpz"></svg><div class="fbar" id="frbar"></div></div><div class="center fr-val" id="frv"></div>
 <div class="lab-row"><button class="btn" id="frc">${I('check')} تحقق</button><button class="btn sec" id="frn">${I('refresh')} مسألة جديدة</button></div><div class="lab-fb"></div>`,
 init(root,ctx){let d=4,on=new Set(),tn,td,mode,need;
  const draw=()=>{root.querySelector('#frd').textContent=d;const bar=root.querySelector('#frbar');bar.innerHTML='';
   for(let i=0;i<d;i++){const c=document.createElement('button');c.className='fcell'+(on.has(i)?' on':'');c.setAttribute('aria-label','جزء '+(i+1));c.onclick=()=>{on.has(i)?on.delete(i):on.add(i);draw()};bar.appendChild(c)}
   let s='<circle cx="110" cy="110" r="100" class="crust"/>';for(let i=0;i<d;i++){const a0=-Math.PI/2+2*Math.PI*i/d,a1=a0+2*Math.PI/d,x0=110+95*Math.cos(a0),y0=110+95*Math.sin(a0),x1=110+95*Math.cos(a1),y1=110+95*Math.sin(a1);
    s+=`<path data-i="${i}" class="slice${on.has(i)?' on':''}" d="M110 110 L${x0} ${y0} A95 95 0 ${d===1?1:0} 1 ${x1} ${y1}Z"/>`;if(on.has(i)){const am=(a0+a1)/2;s+=`<circle cx="${110+55*Math.cos(am)}" cy="${110+55*Math.sin(am)}" r="${Math.max(4,14-d)}" class="pep"/>`}}
   const pz=root.querySelector('#frpz');pz.innerHTML=s;pz.querySelectorAll('.slice').forEach(p=>p.onclick=()=>{const i=+p.dataset.i;on.has(i)?on.delete(i):on.add(i);draw()});
   root.querySelector('#frv').innerHTML=`الملوّن: <b>${on.size}/${d}</b>`};
  root.querySelector('#frm').onclick=()=>{if(d>1){d--;on=new Set([...on].filter(i=>i<d));draw()}};root.querySelector('#frp').onclick=()=>{if(d<12){d++;draw()}};
  const nw=()=>{const ps=[[1,2],[1,3],[2,3],[3,4],[1,4],[2,5],[3,5],[5,6],[3,8]];[tn,td]=ps[R(0,ps.length-1)];mode=R(0,2);on=new Set();d=R(2,8);
   if(mode===0)root.querySelector('#frq').textContent=`أهل الحارة طلبوا بيتزا. لوّن ${tn}/${td} من البيتزا.`;
   else if(mode===1){need=td*R(2,3)>12?td*2:td*R(2,3);if(need>12)need=td;root.querySelector('#frq').textContent=`لوّن كسراً يساوي ${tn}/${td} لكن باستخدام ${need} أجزاء (كسور متكافئة).`}
   else{const a=R(1,3),b=R(1,3);tn=a*3+b*2;td=6;root.querySelector('#frq').textContent=`اجمع: ${a}/2 + ${b}/3 — لوّن الناتج (تلميح: المقام المشترك 6).`;if(tn>6){tn=a*3;root.querySelector('#frq').textContent=`لوّن ${a}/2 من بيتزا مقسمة إلى 6 أجزاء.`}}
   draw();root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#frn').onclick=nw;
  root.querySelector('#frc').onclick=()=>{const eq=on.size*td===tn*d;const okd=mode!==1||d===need;
   if(eq&&okd){fb(root,true,`ممتاز! ${on.size}/${d} = ${tn}/${td}`);ctx.reward(8,root.querySelector('#frpz'))}
   else if(eq&&!okd)fb(root,false,`القيمة صحيحة لكن المطلوب ${need} أجزاء.`);
   else{ctx.miss('P03',mode===2&&on.size===2?'لا نجمع المقامات! نوحّد المقامات أولاً ثم نجمع البسوط فقط.':'');fb(root,false,`لديك ${on.size}/${d}. المطلوب يساوي ${tn}/${td}. جرّب تغيير عدد الأجزاء أو التلوين.`)}};nw()}};
// ===== 3) بلاطات الجبر (نموذج المساحة) =====
T.at={title:'بلاطات الجبر',icon:'tiles',skills:['S1-2-2','S1-2-4'],desc:'المستطيل طوله (س + أ) وعرضه (س + ب). عدّل أ و ب حتى تساوي البلاطات المقدار المطلوب.',
 html:()=>`<div class="lab-task" id="atq"></div><div class="lab-row center"><span class="stepper-v">أ:</span><button class="btn sec sq" data-k="a" data-d="-1">−</button><b id="ata">1</b><button class="btn sec sq" data-k="a" data-d="1">+</button>
 <span class="stepper-v">ب:</span><button class="btn sec sq" data-k="b" data-d="-1">−</button><b id="atb">1</b><button class="btn sec sq" data-k="b" data-d="1">+</button></div>
 <svg class="tiles" id="atsvg" viewBox="0 0 300 300"></svg><div class="center fr-val" id="atv"></div><div class="tile-legend"><span><i class="tl-x2"></i>س²</span><span><i class="tl-x"></i>س</span><span><i class="tl-1"></i>1</span></div>
 <div class="lab-row"><button class="btn" id="atc">${I('check')} تحقق</button><button class="btn sec" id="atn">${I('refresh')} مسألة جديدة</button></div><div class="lab-fb"></div>`,
 init(root,ctx){let a=1,b=1,ta,tb;const X=110,U=22;
  const draw=()=>{root.querySelector('#ata').textContent=a;root.querySelector('#atb').textContent=b;let s='';const o=20;
   s+=`<rect class="t-x2" x="${o}" y="${o}" width="${X}" height="${X}" rx="4"/><text x="${o+X/2}" y="${o+X/2+8}" text-anchor="middle" class="t-l">س²</text>`;
   for(let i=0;i<a;i++)s+=`<rect class="t-x" x="${o+X+4+i*(U+3)}" y="${o}" width="${U}" height="${X}" rx="3"/>`;
   for(let j=0;j<b;j++)s+=`<rect class="t-x" x="${o}" y="${o+X+4+j*(U+3)}" width="${X}" height="${U}" rx="3"/>`;
   for(let i=0;i<a;i++)for(let j=0;j<b;j++)s+=`<rect class="t-1" x="${o+X+4+i*(U+3)}" y="${o+X+4+j*(U+3)}" width="${U}" height="${U}" rx="3"/>`;
   s+=`<text x="${o+(X+4+a*(U+3))/2}" y="12" text-anchor="middle" class="t-dim">س + ${a}</text><text x="8" y="${o+(X+4+b*(U+3))/2}" text-anchor="middle" class="t-dim" transform="rotate(-90 8 ${o+(X+4+b*(U+3))/2})">س + ${b}</text>`;
   const svg=root.querySelector('#atsvg');svg.setAttribute('viewBox',`0 0 ${Math.max(300,o+X+8+a*(U+3))} ${Math.max(300,o+X+8+b*(U+3))}`);svg.innerHTML=s;
   root.querySelector('#atv').innerHTML=`(س + ${a})(س + ${b}) = <b>س² + ${a+b}س + ${a*b}</b>`};
  root.querySelectorAll('[data-k]').forEach(bt=>bt.onclick=()=>{const k=bt.dataset.k,dd=+bt.dataset.d;if(k==='a')a=Math.max(0,Math.min(6,a+dd));else b=Math.max(0,Math.min(6,b+dd));draw()});
  const nw=()=>{ta=R(1,5);tb=R(1,5);a=1;b=1;root.querySelector('#atq').innerHTML=`حلّل باستخدام البلاطات: <b>س² + ${ta+tb}س + ${ta*tb}</b>`;draw();root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#atn').onclick=nw;
  root.querySelector('#atc').onclick=()=>{if(a+b===ta+tb&&a*b===ta*tb){fb(root,true,`أحسنت! س² + ${ta+tb}س + ${ta*tb} = (س + ${a})(س + ${b})`);ctx.reward(10,root.querySelector('#atsvg'))}
   else{if(a+b===ta+tb)ctx.miss('S1-2-4','تحقق من الإشارات: حاصل ضرب العددين = الحد الثابت ومجموعهما = معامل س.');
    fb(root,false,a+b!==ta+tb?`عدد بلاطات س عندك ${a+b} والمطلوب ${ta+tb}.`:`بلاطات س صحيحة، لكن الوحدات ${a*b} والمطلوب ${ta*tb}.`)}};nw()}};
// ===== 4) ميزان المعادلات =====
T.bs={title:'ميزان المعادلات',icon:'scale',skills:['P11'],desc:'المعادلة ميزان متوازن. أي عملية تفعلها في كفة افعلها في الأخرى حتى تبقى س وحدها.',
 html:()=>`<div class="lab-task" id="bsq"></div><svg viewBox="0 0 340 230" class="balance" id="bssvg"></svg><div class="center eqn" id="bse"></div>
 <div class="lab-row"><button class="btn sec" id="bs1">اطرح 1 من الطرفين</button><button class="btn sec" id="bsd">اقسم الطرفين على معامل س</button><button class="btn ghost" id="bsl">اطرح 1 من اليسار فقط</button></div>
 <div class="lab-row"><button class="btn sec" id="bsn">${I('refresh')} معادلة جديدة</button></div><div class="lab-fb"></div><ol class="bs-log" id="bslog"></ol>`,
 init(root,ctx){let a,b,c,x,L,tilt=0;
  const draw=()=>{const lw=a*x+b+L,rw=c;tilt=Math.max(-12,Math.min(12,(rw-lw)*3));
   let boxes='';for(let i=0;i<a;i++)boxes+=`<g transform="translate(${30+(i%4)*27},${-26-Math.floor(i/4)*26})"><rect width="24" height="24" rx="4" class="b-x"/><text x="12" y="17" text-anchor="middle" class="b-xt">س</text></g>`;
   const nl=b+L;for(let i=0;i<nl;i++)boxes+=`<circle cx="${32+((a+i)%4)*27+10}" cy="${-12-Math.floor((a+i)/4)*26}" r="10" class="b-1"/>`;
   let rb='';for(let i=0;i<c;i++)rb+=`<circle cx="${218+(i%5)*20+10}" cy="${-12-Math.floor(i/5)*21}" r="9" class="b-1"/>`;
   root.querySelector('#bssvg').innerHTML=`<path d="M170 210 L150 228 H190Z" class="b-base"/><rect x="166" y="70" width="8" height="142" rx="3" class="b-base"/>
    <g class="b-beam" style="--t:${tilt}deg"><rect x="20" y="66" width="300" height="8" rx="4" class="b-base"/><g transform="translate(0,${110})"><path d="M20 0 H160 L148 14 H32Z" class="b-pan"/>${boxes}</g><g transform="translate(0,110)"><path d="M180 0 H320 L308 14 H192Z" class="b-pan"/>${rb}</g>
    <line x1="90" y1="74" x2="90" y2="110" class="b-str"/><line x1="250" y1="74" x2="250" y2="110" class="b-str"/></g>`;
   root.querySelector('#bse').innerHTML=`<b>${a===1?'':a}س${b+L?' + '+(b+L):''} = ${c}</b>${tilt?' <span class="bad-t">(غير متوازن!)</span>':''}`;
   root.querySelector('#bsd').disabled=!(b+L===0&&a>1&&!tilt);root.querySelector('#bs1').disabled=(b+L===0)||(c===0)||!!tilt};
  const log=t=>{root.querySelector('#bslog').insertAdjacentHTML('beforeend',`<li>${t}</li>`)};
  const nw=()=>{a=R(1,4);x=R(1,5);b=R(1,7);c=a*x+b;L=0;root.querySelector('#bslog').innerHTML='';root.querySelector('#bsq').textContent=pick(['اشترى عبود '+a+' دفاتر بنفس السعر وقلماً بـ '+b+' شيكل فدفع '+c+' شيكل. كم سعر الدفتر؟','على الميزان '+a+' صناديق متساوية و '+b+' أوزان صغيرة، وفي الكفة الأخرى '+c+' أوزان. كم وزن الصندوق؟']);draw();root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#bsn').onclick=nw;
  root.querySelector('#bs1').onclick=()=>{if(b>0)b--;else L--;c--;log('طرحنا 1 من الطرفين');draw();check()};
  root.querySelector('#bsl').onclick=()=>{if(b+L<=0)return;L--;draw();ctx.miss('P11','عند نقل حد إلى الطرف الآخر تتغير إشارته (أو نطرح من الطرفين).');fb(root,false,'مال الميزان! ما نفعله بطرف يجب أن نفعله بالآخر.');setTimeout(()=>{L++;draw();root.querySelector('.lab-fb').className='lab-fb'},1800)};
  root.querySelector('#bsd').onclick=()=>{log(`قسمنا الطرفين على ${a}`);c=c/a;a=1;draw();check()};
  const check=()=>{if(a===1&&b+L===0){fb(root,true,`حللتها! س = ${c}. تحقق: ${'('+c+')'} في المعادلة الأصلية يوازن الميزان.`);ctx.reward(10,root.querySelector('#bssvg'))}};
  const pick=a=>a[R(0,a.length-1)];nw()}};
// ===== 5) مربعات فيثاغورس =====
T.py={title:'مربعات فيثاغورس',icon:'triangle',skills:['S1-3-1','S1-3-2'],desc:'غيّر طولي الضلعين القائمين، وشاهد كيف أن مساحة مربع الوتر = مجموع مساحتي المربعين الآخرين.',
 html:()=>`<div class="lab-task">التحدي: اجعل طول الوتر عدداً صحيحاً (مثل مثلث العمّال القديم 3، 4، 5).</div>
 <label class="sl">الضلع الأول أ = <b id="pya">3</b><input type="range" min="1" max="9" value="3" id="pyA"></label><label class="sl">الضلع الثاني ب = <b id="pyb">2</b><input type="range" min="1" max="9" value="2" id="pyB"></label>
 <svg viewBox="-20 -20 360 360" class="pyth" id="pysvg"></svg><div class="center eqn" id="pye"></div><div class="lab-fb"></div>`,
 init(root,ctx){const won=new Set();const draw=()=>{const a=+root.querySelector('#pyA').value,b=+root.querySelector('#pyB').value;root.querySelector('#pya').textContent=a;root.querySelector('#pyb').textContent=b;
   const k=Math.min(110/Math.max(a,b),18),A=a*k,B=b*k,c=Math.hypot(a,b),ox=150,oy=180;
   const sqC=`${ox},${oy-A} ${ox+B},${oy} ${ox+B+A},${oy-B} ${ox+A},${oy-A-B}`;
   root.querySelector('#pysvg').innerHTML=`<rect x="${ox-A}" y="${oy-A}" width="${A}" height="${A}" class="py-a"/><rect x="${ox}" y="${oy}" width="${B}" height="${B}" class="py-b"/><polygon points="${sqC}" class="py-c"/>
    <polygon points="${ox},${oy} ${ox},${oy-A} ${ox+B},${oy}" class="py-t"/><path d="M${ox} ${oy-10} h10 v10" class="py-r"/>
    <text x="${ox-A/2}" y="${oy-A/2+6}" text-anchor="middle" class="py-l">${a*a}</text><text x="${ox+B/2}" y="${oy+B/2+6}" text-anchor="middle" class="py-l">${b*b}</text><text x="${ox+(A+B)/2}" y="${oy-(A+B)/2+12}" text-anchor="middle" class="py-l">${a*a+b*b}</text>`;
   const ci=Number.isInteger(c);root.querySelector('#pye').innerHTML=`${a}² + ${b}² = ${a*a} + ${b*b} = <b>${a*a+b*b}</b> ← الوتر = √${a*a+b*b} ${ci?'= <b>'+c+'</b>':'≈ '+c.toFixed(2)}`;
   const key=[a,b].sort().join();if(ci&&!won.has(key)){won.add(key);fb(root,true,`اكتشاف! المثلث ${Math.min(a,b)}، ${Math.max(a,b)}، ${c} أطواله أعداد صحيحة.`);ctx.reward(10,root.querySelector('#pysvg'))}else if(!ci)root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#pyA').oninput=draw;root.querySelector('#pyB').oninput=draw;draw()}};
// ===== لعبة: سباق الأعداد الصحيحة =====
const RACE={title:'سباق الأعداد',icon:'race',
 html:()=>`<div class="race-hud"><span>${I('clock')} <b id="rt">60</b></span><span>${I('star')} <b id="rs">0</b></span><span class="combo" id="rc"></span></div>
 <div class="track"><div class="lane"></div><img src="img/zaytoun-celebrate.webp" alt="" class="runner" id="rr"><span class="finish">${I('flag')}</span></div>
 <div class="race-q" id="rq">جاهز؟</div><div class="choices" id="ro"></div><button class="btn wide gold" id="rgo">${I('play')} ابدأ السباق</button><div class="lab-fb"></div>`,
 init(root,ctx){let t,score,combo,timer,q;const opts=root.querySelector('#ro');
  const nq=()=>{const a=NZ(-12,12),b=NZ(-12,12),op=['+','−','×'][R(0,score>8?2:1)];const v=op==='+'?a+b:op==='−'?a-b:a*b;
   const ds=new Set([v]);const wrong=[op==='×'?-v:op==='−'?a+b:-(a+b),v+R(1,3),v-R(1,3)];wrong.forEach(w=>ds.add(w));const arr=[...ds].slice(0,4).sort(()=>Math.random()-.5);
   q={v};root.querySelector('#rq').textContent=`${M(a)} ${op} ${P(b)}`;opts.innerHTML=arr.map(x=>`<button class="choice" data-v="${x}">${M(x)}</button>`).join('');
   opts.querySelectorAll('.choice').forEach(bt=>bt.onclick=()=>{if(+bt.dataset.v===q.v){score++;combo++;bt.classList.add('ok');if(combo%5===0){t+=3;window.FX.pop('+3 ث',bt)}window.FX.burst(bt)}else{combo=0;t=Math.max(0,t-3);bt.classList.add('bad');ctx.miss('P01','')}
    root.querySelector('#rs').textContent=score;root.querySelector('#rc').textContent=combo>1?'×'+combo:'';root.querySelector('#rr').style.insetInlineStart=Math.min(88,score*4.4)+'%';setTimeout(nq,220)})};
  const end=()=>{clearInterval(timer);opts.innerHTML='';const best=ctx.best('race',score);root.querySelector('#rq').innerHTML=`انتهى الوقت! النتيجة: <b>${score}</b> — أفضل نتيجة: <b>${best}</b>`;root.querySelector('#rgo').hidden=false;
   if(score){ctx.reward(Math.min(60,score*3),root.querySelector('#rq'))}if(score>=best&&score>0)window.FX.mega()};
  root.querySelector('#rgo').onclick=()=>{t=60;score=0;combo=0;root.querySelector('#rs').textContent=0;root.querySelector('#rr').style.insetInlineStart='0%';root.querySelector('#rgo').hidden=true;nq();
   timer=setInterval(()=>{t--;root.querySelector('#rt').textContent=t;if(t<=0)end()},1000);ctx.onLeave(()=>clearInterval(timer))}}};
window.LAB={T,RACE};
})();
