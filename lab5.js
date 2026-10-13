// v5: أدوات مختبر جديدة: مستكشف المثلث والنسب المثلثية، محاكي النرد والقرص الدوار، بنّاء القطاعات الدائرية
(function(){const T=window.LAB.T,I=(n,c)=>window.ICONS&&window.ICONS.svg?window.ICONS.svg(n,c):'';const D=x=>(Math.round(x*100)/100+'').replace('.',',');
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const fb=(root,ok,html)=>{const f=root.querySelector('.lab-fb');f.className='lab-fb fb '+(ok?'ok':'bad');f.innerHTML=html};
const rad=d=>d*Math.PI/180;
T.trig={title:'مستكشف المثلث القائم',icon:'triangle',skills:['S2-7-1','S2-7-2','S2-7-3'],desc:'غيّر قياس الزاوية س وطول الوتر، وشاهد المقابل والمجاور وقيم جا س، جتا س، ظا س. لاحظ أن النسب لا تتغير بتغير حجم المثلث.',
 html:()=>`<div class="lab-task" id="trT"></div>
 <label class="sl">الزاوية س = <b id="tra">30</b>°<input type="range" min="5" max="85" value="30" id="trA"></label><label class="sl">الوتر = <b id="trh">10</b><input type="range" min="4" max="14" value="10" id="trH"></label>
 <svg viewBox="0 0 340 240" class="pyth" id="trsvg"></svg><div class="center eqn" id="tre"></div>
 <div class="row" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"><input id="trIn" inputmode="decimal" placeholder="جوابك" style="max-width:120px"><button class="btn" id="trGo">تحقق</button></div><div class="lab-fb"></div>`,
 init(root,ctx){const sp=[30,45,60];let task;const newT=()=>{const a=sp[R(0,2)],fn=['جا','جتا','ظا'][R(0,2)];task={a,fn};root.querySelector('#trT').textContent=`التحدي: اضبط الزاوية على ${a}° ثم اكتب قيمة ${fn}${a}° بفاصلة عشرية (منزلتان).`};
  const draw=()=>{const a=+root.querySelector('#trA').value,h=+root.querySelector('#trH').value;root.querySelector('#tra').textContent=a;root.querySelector('#trh').textContent=h;
   const k=18,adj=h*Math.cos(rad(a)),opp=h*Math.sin(rad(a)),x0=300,y0=215,xA=x0-adj*k,yC=y0-opp*k;
   root.querySelector('#trsvg').innerHTML=`<polygon points="${xA},${y0} ${x0},${y0} ${x0},${yC}" class="py-t"/><path d="M${x0-12} ${y0} v-12 h12" class="py-r"/>
   <text x="${xA+28}" y="${y0-6}" class="py-l">س</text><text x="${(xA+x0)/2}" y="${y0+20}" text-anchor="middle" class="py-l">المجاور ${D(adj)}</text>
   <text x="${x0+4}" y="${(y0+yC)/2}" class="py-l">المقابل ${D(opp)}</text><text x="${(xA+x0)/2-40}" y="${(y0+yC)/2-14}" text-anchor="end" class="py-l">الوتر ${h}</text>`;
   root.querySelector('#tre').innerHTML=`جا س = المقابل ÷ الوتر = <b>${D(opp/h)}</b> · جتا س = المجاور ÷ الوتر = <b>${D(adj/h)}</b> · ظا س = المقابل ÷ المجاور = <b>${D(opp/adj)}</b><br>جتا(90° − ${a}°) = جتا${90-a}° = ${D(Math.cos(rad(90-a)))} = جا${a}°`};
  root.querySelector('#trA').oninput=draw;root.querySelector('#trH').oninput=draw;
  root.querySelector('#trGo').onclick=()=>{const a=+root.querySelector('#trA').value,v=parseFloat((root.querySelector('#trIn').value||'').replace(',','.').replace('٫','.'));
   const tv={جا:Math.sin,جتا:Math.cos,ظا:Math.tan}[task.fn](rad(task.a));
   if(a!==task.a){fb(root,false,`اضبط الزاوية على ${task.a}° أولاً.`);return}
   if(Math.abs(v-tv)<0.015){fb(root,true,`صحيح! ${task.fn}${task.a}° ≈ ${D(tv)}`);ctx.reward(10,root.querySelector('#trsvg'));newT()}
   else{fb(root,false,'راجع: أي ضلعين في النسبة؟ الوتر في مقام جا وجتا.');ctx.miss('S2-7-1',window.MISC.hypDen||'')}};
  newT();draw()}};
T.prob={title:'محاكي النرد والقرص',icon:'question',skills:['S2-8-1','S2-8-2','S2-8-3'],desc:'ارمِ حجر النرد أو أدر القرص مرات كثيرة، وقارن التكرار النسبي للحادث مع الاحتمال النظري ل(ح) = ع(ح) ÷ ع(Ω).',
 html:()=>`<div class="lab-task">اختر حادثاً، وتوقّع احتماله، ثم ارمِ 100 مرة وقارن.</div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"><select id="prM"><option value="d">حجر نرد (Ω = {1، ...، 6})</option><option value="s">قرص دوار بـ 8 قطاعات متساوية</option></select>
 <select id="prE"></select></div>
 <div class="center" style="margin:8px"><label>توقّعك ل(ح) = <input id="prG" placeholder="مثل 1/2" style="max-width:90px"></label></div>
 <div style="display:flex;gap:6px;justify-content:center"><button class="btn" id="pr1">رمية واحدة</button><button class="btn gold" id="pr100">100 رمية</button><button class="btn ghost" id="pr0">تصفير</button></div>
 <svg viewBox="0 0 340 170" id="prsvg" class="pyth"></svg><div class="center eqn" id="pre"></div><div class="lab-fb"></div>`,
 init(root,ctx){const EV={d:[['ظهور عدد زوجي',x=>x%2===0],['ظهور عدد أولي',x=>[2,3,5].includes(x)],['ظهور عدد أكبر من 4',x=>x>4],['ح̄: عدم ظهور 6',x=>x!==6]],s:[['الوقوف على عدد فردي',x=>x%2===1],['الوقوف على مضاعف للعدد 3',x=>x%3===0],['الوقوف على عدد أقل من 3',x=>x<3]]};
  let n=0,hit=0,cnt=[],last=null,checked=false;const N=()=>root.querySelector('#prM').value==='d'?6:8;
  const fillE=()=>{root.querySelector('#prE').innerHTML=EV[root.querySelector('#prM').value].map((e,i)=>`<option value="${i}">${e[0]}</option>`).join('');reset()};
  const ev=()=>EV[root.querySelector('#prM').value][+root.querySelector('#prE').value];
  const theo=()=>{let k=0;for(let x=1;x<=N();x++)if(ev()[1](x))k++;return[k,N()]};
  const reset=()=>{n=0;hit=0;cnt=Array(N()+1).fill(0);last=null;checked=false;draw()};
  const draw=()=>{const m=N(),mx=Math.max(1,...cnt);let s='';for(let x=1;x<=m;x++){const w=300/m,h=cnt[x]/mx*110,on=ev()[1](x);s+=`<rect x="${20+(x-1)*w+4}" y="${140-h}" width="${w-8}" height="${h}" fill="${on?'#2f7d4f':'#c9b38a'}" rx="4"/><text x="${20+(x-.5)*w}" y="160" text-anchor="middle" class="py-l">${x}</text><text x="${20+(x-.5)*w}" y="${135-h}" text-anchor="middle" font-size="11">${cnt[x]}</text>`}
   if(last)s+=`<text x="170" y="20" text-anchor="middle" font-size="16" font-weight="700">آخر نتيجة: ${last}</text>`;root.querySelector('#prsvg').innerHTML=s;
   const[k,t]=theo();root.querySelector('#pre').innerHTML=`عدد الرميات ${n} · مرات وقوع الحادث ${hit} · التكرار النسبي = ${n?D(hit/n):'—'}<br>الاحتمال النظري ل(ح) = ع(ح) ÷ ع(Ω) = ${k}/${t} ≈ ${D(k/t)}`};
  const roll=c=>{for(let i=0;i<c;i++){const x=R(1,N());cnt[x]++;n++;if(ev()[1](x))hit++;last=x}draw();
   if(n>=100&&!checked){checked=true;const g=(root.querySelector('#prG').value||'').trim().replace(',','.');const[k,t]=theo();let v=NaN;if(/^\d+\/\d+$/.test(g)){const[a,b]=g.split('/').map(Number);v=a/b}else v=parseFloat(g);
    if(Math.abs(v-k/t)<1e-6){fb(root,true,`توقّعك صحيح: ${k}/${t}. لاحظ أن التكرار النسبي ${D(hit/n)} قريب منه، ويقترب أكثر كلما زادت الرميات.`);ctx.reward(10,root.querySelector('#prsvg'))}
    else if(g){fb(root,false,`الاحتمال النظري ${k}/${t}: عدد عناصر الحادث ÷ عدد عناصر Ω.`);ctx.miss('S2-8-1',window.MISC.probDen||'')}}};
  root.querySelector('#prM').onchange=fillE;root.querySelector('#prE').onchange=reset;root.querySelector('#pr1').onclick=()=>roll(1);root.querySelector('#pr100').onclick=()=>roll(100);root.querySelector('#pr0').onclick=reset;fillE()}};
T.pie={title:'بنّاء القطاعات الدائرية',icon:'chart',skills:['S1-4-1'],desc:'أدخل تكرار كل فئة، واحسب زاوية قطاعها: (التكرار ÷ المجموع) × 360°، ثم شاهد التمثيل بالقطاعات الدائرية.',
 html:()=>`<div class="lab-task" id="pT"></div><div id="pRows"></div>
 <svg viewBox="-120 -120 240 240" id="psvg" class="pyth" style="max-width:260px;display:block;margin:auto"></svg><div class="lab-fb"></div>`,
 init(root,ctx){const names=['الرياضة','القراءة','الرسم','الحاسوب'],col=['#2f7d4f','#e0a030','#4f7fbf','#b5523b'];let data,ans,done;
  const nw=()=>{const tot=[120,180,240,360][R(0,3)];let left=tot;data=names.map((n,i)=>{if(i===3)return left;const v=Math.max(tot/12,Math.round(R(1,Math.floor(left/(tot/12))-(3-i))*(tot/12)));left-=v;return v});if(data[3]<=0)return nw();
   ans=Array(4).fill('');done=false;root.querySelector('#pT').textContent=`استبانة شملت ${tot} طالباً عن الهواية المفضلة. اكتب زاوية كل قطاع.`;
   root.querySelector('#pRows').innerHTML=names.map((n,i)=>`<label class="sl"><span style="color:${col[i]}">■</span> ${n}: ${data[i]} طالباً، الزاوية = <input data-i="${i}" inputmode="numeric" style="max-width:70px">°</label>`).join('')+'<button class="btn" id="pGo">ارسم وتحقّق</button> <button class="btn ghost" id="pNew">بيانات جديدة</button>';
   root.querySelector('#pGo').onclick=check;root.querySelector('#pNew').onclick=nw;draw([])};
  const draw=angs=>{let a0=-90,s='<circle r="100" fill="none" stroke="#999" stroke-dasharray="4 4"/>';angs.forEach((g,i)=>{if(!(g>0))return;const a1=a0+g,l=g>180?1:0,p=(a)=>[100*Math.cos(rad(a)),100*Math.sin(rad(a))];const[x0,y0]=p(a0),[x1,y1]=p(a1);
    s+=g>=360?`<circle r="100" fill="${col[i]}"/>`:`<path d="M0 0L${x0} ${y0}A100 100 0 ${l} 1 ${x1} ${y1}Z" fill="${col[i]}" stroke="#fff"/>`;const[mx,my]=p((a0+a1)/2);s+=`<text x="${mx*.6}" y="${my*.6+4}" text-anchor="middle" fill="#fff" font-size="12">${g}°</text>`;a0=a1});root.querySelector('#psvg').innerHTML=s};
  const check=()=>{const tot=data.reduce((a,b)=>a+b,0),v=[...root.querySelectorAll('#pRows input')].map(x=>+x.value),right=data.map(d=>d/tot*360);draw(v);
   const bad=v.map((x,i)=>Math.abs(x-right[i])>0.5?i:-1).filter(i=>i>=0);const sum=v.reduce((a,b)=>a+b,0);
   if(!bad.length){fb(root,true,`أحسنت! مجموع الزوايا = 360°.`);if(!done){done=true;ctx.reward(10,root.querySelector('#psvg'))}}
   else{const i=bad[0],m=Math.abs(v[i]-data[i]/tot*100)<0.5?window.MISC.pie100:'زاوية القطاع = (التكرار ÷ المجموع) × 360°.';fb(root,false,`راجع قطاع «${names[i]}»: (${data[i]} ÷ ${tot}) × 360°. ${sum!==360?'مجموع زواياك '+sum+'° وليس 360°. ':''}${m}`);ctx.miss('S1-4-1',m)}};
  nw()}};
})();
