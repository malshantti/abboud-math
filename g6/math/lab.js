// مختبر الأدوات التفاعلية للصف السادس + لعبة سباق الأعداد
(function(){
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),NZ=(a,b)=>{let x=0;while(!x)x=R(a,b);return x};
const M=n=>n<0?'−'+(-n):''+n,P=n=>n<0?'('+M(n)+')':''+n,I=window.ICON;
const svgPt=(svg,e)=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())};
const fb=(root,ok,html)=>{const f=root.querySelector('.lab-fb');f.className='lab-fb fb '+(ok?'ok':'bad');f.innerHTML=html;if(!ok){f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake')}};
const T={};
// ===== 1) خط الأعداد القابل للسحب =====
T.fr={title:'بنّاء الكسور',icon:'fraction',skills:['P03','P04','S2-5-2','S2-5-4'],desc:'اختر عدد الأجزاء (المقام) ثم اضغط على الأجزاء لتلوينها. الشريط والبيتزا يتغيران معاً.',
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
T.bs={title:'ميزان المعادلات',icon:'scale',skills:['P11','S1-3-1','S1-3-2'],desc:'المعادلة ميزان متوازن. أي عملية تفعلها في كفة افعلها في الأخرى حتى تبقى س وحدها.',
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
  const nw=()=>{a=R(1,4);x=R(1,5);b=R(1,7);c=a*x+b;L=0;root.querySelector('#bslog').innerHTML='';root.querySelector('#bsq').textContent=pick(['اشترى سامي '+a+' دفاتر متساوية السعر وقلماً بـ '+b+' قرشًا فدفع '+c+' قرشًا. كم سعر الدفتر؟','على الميزان '+a+' صناديق متساوية و '+b+' أوزان صغيرة، وفي الكفة الأخرى '+c+' أوزان. كم وزن الصندوق؟']);draw();root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#bsn').onclick=nw;
  root.querySelector('#bs1').onclick=()=>{if(b>0)b--;else L--;c--;log('طرحنا 1 من الطرفين');draw();check()};
  root.querySelector('#bsl').onclick=()=>{if(b+L<=0)return;L--;draw();ctx.miss('P11','عند نقل حد إلى الطرف الآخر تتغير إشارته (أو نطرح من الطرفين).');fb(root,false,'مال الميزان! ما نفعله بطرف يجب أن نفعله بالآخر.');setTimeout(()=>{L++;draw();root.querySelector('.lab-fb').className='lab-fb'},1800)};
  root.querySelector('#bsd').onclick=()=>{log(`قسمنا الطرفين على ${a}`);c=c/a;a=1;draw();check()};
  const check=()=>{if(a===1&&b+L===0){fb(root,true,`حللتها! س = ${c}. تحقق: ${'('+c+')'} في المعادلة الأصلية يوازن الميزان.`);ctx.reward(10,root.querySelector('#bssvg'))}};
  const pick=a=>a[R(0,a.length-1)];nw()}};
// ===== 5) مربعات فيثاغورس =====

// ===== مربعات ومكعبات: الأسس والجذور =====
T.sq={title:'المربع الكامل والمكعب الكامل',icon:'tiles',skills:['S1-1-2','S1-1-4','S1-1-5'],desc:'غيّر طول الضلع، وشاهد المربع يتكوّن من n × n مربعًا صغيرًا، والمكعب من n × n × n مكعبًا صغيرًا. ثم أجب عن التحدي.',
 html:()=>`<div class="lab-task" id="sqT"></div><label class="sl">طول الضلع = <b id="sqv">3</b><input type="range" min="1" max="10" value="3" id="sqN"></label>
 <svg viewBox="0 0 340 200" class="pyth" id="sqsvg"></svg><div class="center eqn" id="sqe"></div>
 <div class="lab-row"><button class="btn" id="sqc">${I('check')} تحقق</button><button class="btn sec" id="sqn">${I('refresh')} تحدٍّ جديد</button></div><div class="lab-fb"></div>`,
 init(root,ctx){let tk;const N=()=>+root.querySelector('#sqN').value;
  const draw=()=>{const n=N();root.querySelector('#sqv').textContent=n;const c=Math.min(40,150/n);let s='';
   for(let i=0;i<n;i++)for(let j=0;j<n;j++)s+=`<rect x="${10+j*c}" y="${20+i*c}" width="${c-1}" height="${c-1}" rx="2" class="b-x"/>`;
   const e=Math.min(28,80/n),ox=200,oy=30;for(let k=n-1;k>=0;k--)for(let i=0;i<n;i++)for(let j=0;j<n;j++)s+=`<rect x="${ox+j*e+k*e*0.5}" y="${oy+i*e+(n-1-k)*e*0.5}" width="${e-1}" height="${e-1}" class="b-1" style="opacity:${0.45+0.55*(n-k)/n}"/>`;
   s+=`<text x="85" y="195" text-anchor="middle" class="b-xt" style="fill:currentColor">${n} × ${n} = ${n*n}</text><text x="260" y="195" text-anchor="middle" class="b-xt" style="fill:currentColor">${n} × ${n} × ${n} = ${n**3}</text>`;
   root.querySelector('#sqsvg').innerHTML=s;root.querySelector('#sqe').innerHTML=`√${n*n} = ${n} &nbsp; · &nbsp; ∛${n**3} = ${n}`};
  const nw=()=>{const n=R(2,10),k=R(0,1);tk={n,k};root.querySelector('#sqT').textContent=k?`مكعب كامل حجمه ${n**3} وحدة مكعبة. حرّك المؤشر إلى طول حرفه: ∛${n**3} = ؟`:`مربع كامل مساحته ${n*n} وحدة مربعة. حرّك المؤشر إلى طول ضلعه: √${n*n} = ؟`;root.querySelector('#sqN').value=1;draw();root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#sqN').oninput=draw;root.querySelector('#sqn').onclick=nw;
  root.querySelector('#sqc').onclick=()=>{const n=N();if(n===tk.n){fb(root,true,tk.k?`صحيح: ${n} × ${n} × ${n} = ${n**3}، إذن ∛${n**3} = ${n}.`:`صحيح: ${n} × ${n} = ${n*n}، إذن √${n*n} = ${n}.`);ctx.reward(8,root.querySelector('#sqsvg'))}
   else{ctx.miss(tk.k?'S1-1-5':'S1-1-4',tk.k&&n*3===tk.n**3?'الجذر التكعيبي ليس الثلث.':!tk.k&&n*2===tk.n*tk.n?'الجذر التربيعي ليس النصف.':'');fb(root,false,tk.k?`${n} × ${n} × ${n} = ${n**3}، والمطلوب ${tk.n**3}.`:`${n} × ${n} = ${n*n}، والمطلوب ${tk.n*tk.n}.`)}};nw()}};
// ===== شبكة المئة: النسبة المئوية =====
T.pct={title:'شبكة المئة',icon:'chart',skills:['S2-6-1','S2-6-2','P05'],desc:'مربع مقسم إلى 100 مربع صغير كما في الكتاب. لوّن المربعات، واقرأ الكسر العادي والكسر العشري والنسبة المئوية معًا.',
 html:()=>`<div class="lab-task" id="pcT"></div><div id="pcG" style="display:grid;grid-template-columns:repeat(10,1fr);gap:2px;max-width:300px;margin:8px auto;direction:ltr"></div>
 <div class="center eqn" id="pce"></div><div class="lab-row"><button class="btn sec" id="pcr">مسح</button><button class="btn" id="pcc">${I('check')} تحقق</button><button class="btn sec" id="pcn">${I('refresh')} تحدٍّ جديد</button></div><div class="lab-fb"></div>`,
 init(root,ctx){let on=new Set(),tk;const g=root.querySelector('#pcG');const gcd=(a,b)=>{while(b)[a,b]=[b,a%b];return a||1};
  const draw=()=>{g.innerHTML='';for(let i=0;i<100;i++){const c=document.createElement('button');c.className='fcell'+(on.has(i)?' on':'');c.style.aspectRatio='1';c.style.minHeight='0';c.setAttribute('aria-label','مربع '+(i+1));c.onclick=()=>{on.has(i)?on.delete(i):on.add(i);draw()};g.appendChild(c)}
   const n=on.size,d=gcd(n,100);root.querySelector('#pce').innerHTML=`${n}/100 ${d>1&&n?'= '+n/d+'/'+100/d:''} = ${(n/100).toFixed(2).replace('.',',')} = <b>${n}%</b>`};
  const nw=()=>{const o=[[1,2],[1,4],[3,4],[1,5],[2,5],[3,10],[7,20],[9,25],[1,10]][R(0,8)];tk=o[0]*100/o[1];root.querySelector('#pcT').textContent=R(0,1)?`لوّن ${o[0]}/${o[1]} من الشبكة. ما النسبة المئوية؟`:`لوّن ${tk}% من الشبكة.`;on=new Set();draw();root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#pcr').onclick=()=>{on=new Set();draw()};root.querySelector('#pcn').onclick=nw;
  root.querySelector('#pcc').onclick=()=>{if(on.size===tk){fb(root,true,`ممتاز! ${tk}/100 = ${tk}%.`);ctx.reward(8,g)}else{ctx.miss('S2-6-2','');fb(root,false,`لوّنت ${on.size} مربعًا، أي ${on.size}%. المطلوب ${tk}%.`)}};nw()}};
// ===== الدائرة والنسبة التقريبية π =====
T.circ={title:'عجلة الدائرة',icon:'target',skills:['S2-7-5','S2-7-6','S2-7-7'],desc:'غيّر نصف القطر، ودحرج الدائرة دورة كاملة لترى أن محيطها يساوي π × القطر تقريبًا، وشاهد مساحتها π نق².',
 html:()=>`<div class="lab-task" id="ciT"></div><label class="sl">نصف القطر نق = <b id="civ">2</b> سم<input type="range" min="1" max="7" value="2" id="ciR"></label>
 <svg viewBox="0 0 560 190" class="pyth" id="cisvg"></svg><div class="center eqn" id="cie"></div>
 <div class="lab-row"><button class="btn sec" id="ciroll">دحرج الدائرة</button></div>
 <div class="row" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"><input id="ciIn" inputmode="decimal" placeholder="جوابك" style="max-width:120px"><button class="btn" id="ciGo">تحقق</button><button class="btn sec" id="cin">${I('refresh')}</button></div><div class="lab-fb"></div>`,
 init(root,ctx){let tk,roll=0;const D=x=>(Math.round(x*100)/100+'').replace('.',',');const r=()=>+root.querySelector('#ciR').value;
  const draw=()=>{const n=r();root.querySelector('#civ').textContent=n;const k=10,cx=20+n*k+roll*2*Math.PI*n*k,cy=170-n*k;
   root.querySelector('#cisvg').innerHTML=`<line x1="10" y1="170" x2="555" y2="170" class="b-str"/><line x1="${20+n*k}" y1="178" x2="${20+n*k+2*Math.PI*n*k}" y2="178" class="b-base" style="stroke-width:4"/>
    <circle cx="${cx}" cy="${cy}" r="${n*k}" class="b-pan" style="fill-opacity:.35"/><line x1="${cx}" y1="${cy}" x2="${cx+n*k*Math.cos(-roll*2*Math.PI)}" y2="${cy+n*k*Math.sin(-roll*2*Math.PI)}" class="b-str" style="stroke-width:2"/><circle cx="${cx}" cy="${cy}" r="2.5"/>`;
   root.querySelector('#cie').innerHTML=`ق = ${2*n} سم · المحيط = π × ق ≈ 3,14 × ${2*n} = <b>${D(3.14*2*n)}</b> سم · المساحة = π نق² ≈ <b>${D(3.14*n*n)}</b> سم²`};
  root.querySelector('#ciR').oninput=()=>{roll=0;draw()};
  root.querySelector('#ciroll').onclick=()=>{let t=0;const st=()=>{t+=0.04;roll=Math.min(1,t);draw();if(t<1)requestAnimationFrame(st)};st()};
  const nw=()=>{const n=R(1,7),k=R(0,1);tk={n,k,a:k?3.14*n*n:2*3.14*n};root.querySelector('#ciT').textContent=k?`احسب مساحة دائرة نصف قطرها ${n} سم (π = 3,14).`:`احسب محيط دائرة نصف قطرها ${n} سم (π = 3,14).`;root.querySelector('#ciIn').value='';root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#cin').onclick=nw;
  root.querySelector('#ciGo').onclick=()=>{const v=parseFloat(root.querySelector('#ciIn').value.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫',',').replace(',','.'));
   if(Math.abs(v-tk.a)<0.011){fb(root,true,`صحيح: ${D(tk.a)} ${tk.k?'سم²':'سم'}.`);ctx.reward(10,root.querySelector('#cisvg'))}
   else{const m=tk.k?(Math.abs(v-2*3.14*tk.n)<0.011?'خلطت بين المحيط والمساحة.':Math.abs(v-3.14*4*tk.n*tk.n)<0.011?'استخدم نصف القطر لا القطر.':''):(Math.abs(v-3.14*tk.n)<0.011?'المحيط = 2 π نق؛ لا تنس 2.':Math.abs(v-3.14*tk.n*tk.n)<0.011?'خلطت بين المحيط والمساحة.':'');ctx.miss(tk.k?'S2-7-7':'S2-7-6',m);fb(root,false,(m||'راجع القانون.')+' اضبط المؤشر على '+tk.n+' وانظر إلى الحساب.')}};nw();draw()}};
// ===== زوايا المثلث وأضلاعه =====
T.tri={title:'مختبر المثلث',icon:'triangle',skills:['S1-2-1','S1-2-2','S1-2-3'],desc:'غيّر زاويتين وشاهد الثالثة (المجموع 180°) ونوع المثلث، ثم اختبر: هل تصلح ثلاثة أطوال لرسم مثلث؟',
 html:()=>`<div class="lab-task" id="trT"></div><label class="sl">الزاوية ب = <b id="tab">60</b>°<input type="range" min="10" max="150" value="60" id="tAB"></label><label class="sl">الزاوية جـ = <b id="tac">60</b>°<input type="range" min="10" max="150" value="60" id="tAC"></label>
 <svg viewBox="0 0 340 200" class="pyth" id="trsvg"></svg><div class="center eqn" id="tre"></div>
 <div class="lab-row"><button class="btn" id="trc">${I('check')} تحقق</button><button class="btn sec" id="trn">${I('refresh')} تحدٍّ جديد</button></div><div class="lab-fb"></div>`,
 init(root,ctx){let tk;const g=id=>+root.querySelector(id).value;
  const kind=(b,c)=>{const a=180-b-c;const m=Math.max(a,b,c);const k1=m<90?'حاد الزوايا':m===90?'قائم الزاوية':'منفرج الزاوية';const k2=a===b&&b===c?'متساوي الأضلاع':(a===b||b===c||a===c)?'متساوي الساقين':'مختلف الأضلاع';return[a,k1,k2]};
  const draw=()=>{const b=g('#tAB'),c=g('#tAC');root.querySelector('#tab').textContent=b;root.querySelector('#tac').textContent=c;const [a,k1,k2]=kind(b,c);
   if(a<=0){root.querySelector('#trsvg').innerHTML=`<text x="170" y="100" text-anchor="middle" class="b-xt" style="fill:#c0392b">مجموع الزاويتين ${b+c}° ≥ 180°: لا يتكوّن مثلث</text>`;root.querySelector('#tre').innerHTML='';return}
   const L=230,rb=b*Math.PI/180,rc=c*Math.PI/180;const t=L*Math.sin(rc)/Math.sin(rb+rc);const x=55+t*Math.cos(rb)*1,y=170-t*Math.sin(rb);const sc=Math.min(1,150/(170-y||1));
   const X=w=>55+(w-55)*sc,Y=h=>170-(170-h)*sc;root.querySelector('#trsvg').innerHTML=`<path d="M${X(55)} ${Y(170)} L${X(55+L)} ${Y(170)} L${X(x)} ${Y(y)}Z" class="b-pan" style="fill-opacity:.35"/><text x="${X(55)-14}" y="${Y(170)+4}" class="b-xt" style="fill:currentColor">ب</text><text x="${X(55+L)+6}" y="${Y(170)+4}" class="b-xt" style="fill:currentColor">جـ</text><text x="${X(x)}" y="${Y(y)-6}" text-anchor="middle" class="b-xt" style="fill:currentColor">أ</text>`;
   root.querySelector('#tre').innerHTML=`∠أ = 180° − ${b}° − ${c}° = <b>${a}°</b> · ${k1} · ${k2}`};
  const nw=()=>{const k=R(0,2);if(k===0)tk={k,t:'قائم الزاوية'};else if(k===1)tk={k,t:'منفرج الزاوية'};else tk={k,t:'متساوي الأضلاع'};root.querySelector('#trT').textContent=`حرّك الزاويتين حتى يصبح المثلث ${tk.t}.`;root.querySelector('.lab-fb').className='lab-fb'};
  root.querySelector('#tAB').oninput=draw;root.querySelector('#tAC').oninput=draw;root.querySelector('#trn').onclick=nw;
  root.querySelector('#trc').onclick=()=>{const b=g('#tAB'),c=g('#tAC');const [a,k1,k2]=kind(b,c);if(a>0&&(k1===tk.t||k2===tk.t)){fb(root,true,`أحسنت! الزوايا ${a}° و ${b}° و ${c}°، ومجموعها 180°.`);ctx.reward(8,root.querySelector('#trsvg'))}else{ctx.miss('S1-2-2','');fb(root,false,a<=0?'مجموع زوايا المثلث 180°.':`المثلث الآن ${k1}، ${k2}. المطلوب ${tk.t}.`)}};nw();draw()}};
const RACE={title:'سباق الأعداد',icon:'race',
 html:()=>`<div class="race-hud"><span>${I('clock')} <b id="rt">60</b></span><span>${I('star')} <b id="rs">0</b></span><span class="combo" id="rc"></span></div>
 <div class="track"><div class="lane"></div><img src="img/zaytoun-celebrate.webp" alt="" class="runner" id="rr"><span class="finish">${I('flag')}</span></div>
 <div class="race-q" id="rq">جاهز؟</div><div class="choices" id="ro"></div><button class="btn wide gold" id="rgo">${I('play')} ابدأ السباق</button><div class="lab-fb"></div>`,
 init(root,ctx){let t,score,combo,timer,q;const opts=root.querySelector('#ro');
  const nq=()=>{const k=R(0,score>8?3:2);let a,b,op,v,txt;if(k===0){a=R(5,60);b=R(5,40);v=a+b;txt=`${a} + ${b}`}else if(k===1){a=R(20,99);b=R(5,a);v=a-b;txt=`${a} − ${b}`}else if(k===2){a=R(2,12);b=R(2,12);v=a*b;txt=`${a} × ${b}`}else{a=R(2,9);b=R(2,9);const c=R(1,9);v=c+a*b;txt=`${c} + ${a} × ${b}`}
   const ds=new Set([v]);const wrong=[k===3?(v-a*b+a)*b:v+10,v+R(1,3),Math.max(0,v-R(1,3))];wrong.forEach(w=>ds.add(w));const arr=[...ds].slice(0,4).sort(()=>Math.random()-.5);
   q={v};root.querySelector('#rq').textContent=txt;opts.innerHTML=arr.map(x=>`<button class="choice" data-v="${x}">${M(x)}</button>`).join('');
   opts.querySelectorAll('.choice').forEach(bt=>bt.onclick=()=>{if(+bt.dataset.v===q.v){score++;combo++;bt.classList.add('ok');if(combo%5===0){t+=3;window.FX.pop('+3 ث',bt)}window.FX.burst(bt)}else{combo=0;t=Math.max(0,t-3);bt.classList.add('bad');ctx.miss(k===3?'S1-1-1':'P21','')}
    root.querySelector('#rs').textContent=score;root.querySelector('#rc').textContent=combo>1?'×'+combo:'';root.querySelector('#rr').style.insetInlineStart=Math.min(88,score*4.4)+'%';setTimeout(nq,220)})};
  const end=()=>{clearInterval(timer);opts.innerHTML='';const best=ctx.best('race',score);root.querySelector('#rq').innerHTML=`انتهى الوقت! النتيجة: <b>${score}</b> — أفضل نتيجة: <b>${best}</b>`;root.querySelector('#rgo').hidden=false;
   if(score){ctx.reward(Math.min(60,score*3),root.querySelector('#rq'))}if(score>=best&&score>0)window.FX.mega()};
  root.querySelector('#rgo').onclick=()=>{t=60;score=0;combo=0;root.querySelector('#rs').textContent=0;root.querySelector('#rr').style.insetInlineStart='0%';root.querySelector('#rgo').hidden=true;nq();
   timer=setInterval(()=>{t--;root.querySelector('#rt').textContent=t;if(t<=0)end()},1000);ctx.onLeave(()=>clearInterval(timer))}}};
window.LAB={T,RACE};
})();
