// v5: أدوات مختبر جديدة: مستكشف المثلث والنسب المثلثية، محاكي النرد والقرص الدوار، بنّاء القطاعات الدائرية
(function(){const T=window.LAB.T,I=(n,c)=>window.ICONS&&window.ICONS.svg?window.ICONS.svg(n,c):'';const D=x=>(Math.round(x*100)/100+'').replace('.',',');
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const fb=(root,ok,html)=>{const f=root.querySelector('.lab-fb');f.className='lab-fb fb '+(ok?'ok':'bad');f.innerHTML=html};
const rad=d=>d*Math.PI/180;
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
   if(n>=100&&!checked){checked=true;const g=window.AR_NUM.normalize(root.querySelector('#prG').value||'').trim();const[k,t]=theo();let v=NaN;if(/^\d+\/\d+$/.test(g)){const[a,b]=g.split('/').map(Number);v=a/b}else v=parseFloat(g);
    if(Math.abs(v-k/t)<1e-6){fb(root,true,`توقّعك صحيح: ${k}/${t}. لاحظ أن التكرار النسبي ${D(hit/n)} قريب منه، ويقترب أكثر كلما زادت الرميات.`);ctx.reward(10,root.querySelector('#prsvg'))}
    else if(g){fb(root,false,`الاحتمال النظري ${k}/${t}: عدد عناصر الحادث ÷ عدد عناصر Ω.`);ctx.miss('S2-8-1',window.MISC.probDen||'')}}};
  root.querySelector('#prM').onchange=fillE;root.querySelector('#prE').onchange=reset;root.querySelector('#pr1').onclick=()=>roll(1);root.querySelector('#pr100').onclick=()=>roll(100);root.querySelector('#pr0').onclick=reset;fillE()}};
})();
