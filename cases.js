// حالات "عبود المعلم" و"محقق الأخطاء": حل صحيح خطوة بخطوة + محاولات خاطئة مرتبطة بقائمة الأخطاء الشائعة
(function(){
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),NZ=(a,b)=>{let x=0;while(!x)x=R(a,b);return x},pick=a=>a[Math.floor(Math.random()*a.length)];
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1},lcm=(a,b)=>a*b/gcd(a,b);
const M=n=>n<0?'−'+(-n):''+n,P=n=>n<0?'('+M(n)+')':''+n,sg=n=>n<0?'− '+(-n):'+ '+n;
const fr=(n,d)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);n/=g;d/=g;return d===1?M(n):(n<0?'−':'')+Math.abs(n)+'/'+d};
const X='س';const lin=(a,b)=>{let s=a===0?'':(a===1?'':a===-1?'−':M(a))+X;if(b)s+=(s?' '+sg(b):M(b));return s||'0'};
const WHY={subOpp:'الطرح يساوي جمع المعكوس',diffSign:'إشارتان مختلفتان: نطرح القيمتين ونأخذ إشارة الأكبر قيمةً مطلقة',lcm:'نحتاج مقاماً يقبل القسمة على المقامين معاً',
 equiv:'نضرب البسط والمقام في العدد نفسه فلا تتغير قيمة الكسر',addNum:'عندما يتساوى المقامان نجمع البسوط ونُبقي المقام',simplify:'نقسم البسط والمقام على عاملهما المشترك الأكبر',
 recip:'القسمة على كسر تساوي الضرب في مقلوبه',signMul:'سالب × موجب = سالب',dist:'نضرب العدد خارج القوس في كل حد داخله',distN:'الإشارة السالبة قبل القوس تغيّر إشارة كل حد داخله',
 like:'نجمع معاملات الحدود المتشابهة فقط',facRule:'(س + م)(س + ن) = س² + (م + ن)س + م×ن',pair:'العددان يحققان الشرطين معاً: حاصل الضرب والمجموع',write:'نكتب كل عدد مع س داخل قوس',
 verify:'التحقق بالتوزيع أو التعويض يكشف أي خطأ',inverse:'نطرح العدد نفسه (أو نضيفه) من الطرفين لتبقى المعادلة متوازنة',divide:'نقسم الطرفين على معامل س',compute:'نحسب الناتج مع الانتباه للإشارة',
 pyth:'في المثلث القائم: مربع الوتر = مجموع مربعي الضلعين القائمين',squares:'مربع العدد = العدد × نفسه',sqrt:'نأخذ الجذر التربيعي الموجب لنجد الطول'};
const MISX={divCoef:'المعامل يضرب س، لذلك نقسم الطرفين عليه ولا نطرحه.'};
const T={};
T.int=()=>{const a=R(2,9);let b=R(2,9);while(b===a)b=R(2,9);const q=`${M(-a)} − (${M(-b)})`;
 return{topic:'int',tname:'الأعداد الصحيحة',prob:'احسب: '+q,steps:[{t:`${q} = ${M(-a)} + ${b}`,why:'subOpp'},{t:`= ${M(b-a)}`,why:'diffSign'}],
 v:[{lines:[`${q} = ${M(-a)} − ${b}`,`= ${M(-a-b)}`],at:0,mis:'subSign',fix:[`${M(-a)} + ${b}`,`${M(-a)} − ${b}`,`${a} + ${b}`]},
    {lines:[`${q} = ${M(-a)} + ${b}`,`= ${M(a-b)}`],at:1,mis:'absAdd',fix:[M(b-a),M(a-b),M(-a-b)]}]}};
T.frac=()=>{let b=pick([2,3,4,5,6]),d=pick([2,3,4,5,6]);while(d===b)d=pick([2,3,4,5,6]);const a=R(1,b-1),c=R(1,d-1),L=lcm(b,d),n=a*L/b+c*L/d;
 const st=[{t:`المقام المشترك = ${L}`,why:'lcm'},{t:`${a}/${b} + ${c}/${d} = ${a*L/b}/${L} + ${c*L/d}/${L}`,why:'equiv'},{t:`= ${n}/${L}`,why:'addNum'}];
 if(fr(n,L)!==n+'/'+L)st.push({t:`= ${fr(n,L)}`,why:'simplify'});
 return{topic:'frac',tname:'الكسور',prob:`احسب: ${a}/${b} + ${c}/${d}`,steps:st,
 v:[{lines:[`${a}/${b} + ${c}/${d} = ${a+c}/${b+d}`],at:0,mis:'fracAdd',fix:[`${fr(n,L)}`,`${a+c}/${b+d}`,`${a+c}/${L}`]},
    {lines:[`${a}/${b} + ${c}/${d} = ${a*L/b}/${L} + ${c*L/d}/${L}`,`= ${n}/${2*L}`],at:1,mis:'fracAdd',fix:[`${n}/${L}`,`${n}/${2*L}`,`${a+c}/${L}`]}]}};
T.rat=()=>{const p=R(1,7),r=R(1,7);let q=R(2,9);while(q===p)q=R(2,9);let s=R(2,9);while(s===r)s=R(2,9);const q0=`(−${p}/${q}) ÷ (${r}/${s})`;
 return{topic:'rat',tname:'الأعداد النسبية',prob:'احسب: '+q0,steps:[{t:`${q0} = (−${p}/${q}) × (${s}/${r})`,why:'recip'},{t:`= −(${p}×${s})/(${q}×${r})`,why:'signMul'},{t:`= ${fr(-p*s,q*r)}`,why:'simplify'}],
 v:[{lines:[`${q0} = (−${p}/${q}) × (${r}/${s})`,`= ${fr(-p*r,q*s)}`],at:0,mis:'fracDiv',fix:[`(−${p}/${q}) × (${s}/${r})`,`(−${p}/${q}) × (${r}/${s})`,`(−${q}/${p}) × (${r}/${s})`]},
    {lines:[`${q0} = (−${p}/${q}) × (${s}/${r})`,`= ${fr(p*s,q*r)}`],at:1,mis:'sign',fix:[fr(-p*s,q*r),fr(p*s,q*r),fr(-p*r,q*s)]}]}};
T.expr=()=>{const k=R(2,5),m=R(1,9);let a=R(1,6);const neg=Math.random()<.5;if(neg)while(a===k)a=R(1,6);
 if(!neg){const q=`${a}${X} + ${k}(${X} − ${m})`;return{topic:'expr',tname:'المقادير الجبرية',prob:'بسّط: '+q,steps:[{t:`= ${a}${X} + ${k}${X} − ${k*m}`,why:'dist'},{t:`= ${lin(a+k,-k*m)}`,why:'like'}],
  v:[{lines:[`= ${a}${X} + ${k}${X} − ${m}`,`= ${lin(a+k,-m)}`],at:0,mis:'distFirst',fix:[`${a}${X} + ${k}${X} − ${k*m}`,`${a}${X} + ${k}${X} − ${m}`,`${a}${X} + ${k}${X} + ${k*m}`]},
     {lines:[`= ${a}${X} + ${k}${X} − ${k*m}`,`= ${a+k}${X}² − ${k*m}`],at:1,mis:'likeTerms',fix:[lin(a+k,-k*m),`${a+k}${X}² − ${k*m}`,lin(a+k-k*m,0)]}]}}
 const q=`${a}${X} − ${k}(${X} − ${m})`;return{topic:'expr',tname:'المقادير الجبرية',prob:'بسّط: '+q,steps:[{t:`= ${a}${X} − ${k}${X} + ${k*m}`,why:'distN'},{t:`= ${lin(a-k,k*m)}`,why:'like'}],
  v:[{lines:[`= ${a}${X} − ${k}${X} − ${k*m}`,`= ${lin(a-k,-k*m)}`],at:0,mis:'distNeg',fix:[`${a}${X} − ${k}${X} + ${k*m}`,`${a}${X} − ${k}${X} − ${k*m}`,`${a}${X} + ${k}${X} − ${k*m}`]},
     {lines:[`= ${a}${X} − ${k}${X} + ${k*m}`,`= ${lin(a-k+k*m,0)}`],at:1,mis:'unlike',fix:[lin(a-k,k*m),lin(a-k+k*m,0),lin(a+k,k*m)]}]}};
T.fac=()=>{let m=NZ(-7,7),n=NZ(-7,7);while(m+n===0||m===n)n=NZ(-7,7);const q=`${X}² ${sg(m+n).replace(/ (\d+)$/,' $1'+X).replace(/ 1س$/,' س')} ${sg(m*n)}`;
 const f=(a,b)=>`(${X} ${sg(a)})(${X} ${sg(b)})`;
 return{topic:'fac',tname:'التحليل إلى العوامل',prob:'حلّل: '+q,steps:[{t:`نبحث عن عددين: حاصل ضربهما ${M(m*n)} ومجموعهما ${M(m+n)}`,why:'facRule'},{t:`العددان: ${M(m)} و ${M(n)}`,why:'pair'},{t:`${q} = ${f(m,n)}`,why:'write'},{t:'تحقق: بالتوزيع نعود للمقدار الأصلي',why:'verify'}],
 v:[{lines:[`حاصل الضرب ${M(m*n)} والمجموع ${M(m+n)}`,`العددان: ${M(-m)} و ${M(-n)}`,`${q} = ${f(-m,-n)}`],at:1,mis:'facSign',fix:[`${M(m)} و ${M(n)}`,`${M(-m)} و ${M(-n)}`,`${M(m)} و ${M(-n)}`]}]}};
T.eq=()=>{const a=R(2,6),x=R(-5,9),b=NZ(-9,9),c=a*x+b;const q=`${a}${X} ${sg(b)} = ${M(c)}`;const w=(c+b)/a;
 return{topic:'eq',tname:'المعادلات',prob:'حلّ: '+q,steps:[{t:`${a}${X} = ${M(c)} ${sg(-b)} = ${M(c-b)}`,why:'inverse'},{t:`${X} = ${M(c-b)} ÷ ${a}`,why:'divide'},{t:`${X} = ${M(x)}`,why:'compute'},{t:`تحقق: ${a}×${P(x)} ${sg(b)} = ${M(c)}`,why:'verify'}],
 v:[{lines:[`${a}${X} = ${M(c+b)}`,`${X} = ${Number.isInteger(w)?M(w):fr(c+b,a)}`],at:0,mis:'moveSign',fix:[`${a}${X} = ${M(c-b)}`,`${a}${X} = ${M(c+b)}`,`${X} = ${M(c-b)}`]},
    {lines:[`${a}${X} = ${M(c-b)}`,`${X} = ${M(c-b-a)}`],at:1,mis:'divCoef',fix:[`${X} = ${M(x)}`,`${X} = ${M(c-b-a)}`,`${X} = ${M(c-b)}`]}]}};
T.py=()=>{const t=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17]]),[a,b,c]=t;
 return{topic:'py',tname:'نظرية فيثاغورس',prob:`مثلث قائم ضلعاه القائمان ${a} سم و ${b} سم. أوجد طول الوتر.`,steps:[{t:`(الوتر)² = ${a}² + ${b}²`,why:'pyth'},{t:`= ${a*a} + ${b*b} = ${c*c}`,why:'squares'},{t:`الوتر = √${c*c} = ${c} سم`,why:'sqrt'}],
 v:[{lines:[`الوتر = ${a} + ${b} = ${a+b} سم`],at:0,mis:'sqrtSum',fix:[`(الوتر)² = ${a}² + ${b}²`,`الوتر = ${a} + ${b}`,`(الوتر)² = ${a} + ${b}`]},
    {lines:[`(الوتر)² = ${a}² + ${b}²`,`= ${2*a} + ${2*b} = ${2*a+2*b}`,`الوتر = √${2*a+2*b}`],at:1,mis:'powMul',fix:[`= ${a*a} + ${b*b} = ${c*c}`,`= ${2*a} + ${2*b} = ${2*a+2*b}`,`= ${a+b}² = ${(a+b)**2}`]}]}};
const TOPICS=Object.keys(T);
window.CASES={T,TOPICS,WHY,MISX,make:t=>{const k=t||pick(TOPICS);let c;for(let i=0;i<60;i++){c=T[k]();if(c.v.every(v=>new Set(v.fix).size===v.fix.length&&v.lines[v.at]!==(c.steps[v.at]||{}).t))break}return c},mis:k=>(window.MISC&&window.MISC[k])||MISX[k]||k,
 skill:{int:"P01",frac:"P04",rat:"S1-1-5",expr:"S1-2-1",fac:"S1-2-4",eq:"P11",py:"S1-3-1"}};
})();
