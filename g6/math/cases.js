// حالات "عبود المعلم" و"محقق الأخطاء": حل صحيح خطوة بخطوة + محاولات خاطئة مرتبطة بقائمة الأخطاء الشائعة
(function(){
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),NZ=(a,b)=>{let x=0;while(!x)x=R(a,b);return x},pick=a=>a[Math.floor(Math.random()*a.length)];
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1},lcm=(a,b)=>a*b/gcd(a,b);
const M=n=>n<0?'−'+(-n):''+n,P=n=>n<0?'('+M(n)+')':''+n,sg=n=>n<0?'− '+(-n):'+ '+n;
const fr=(n,d)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);n/=g;d/=g;return d===1?M(n):(n<0?'−':'')+Math.abs(n)+'/'+d};
const X='س';const lin=(a,b)=>{let s=a===0?'':(a===1?'':a===-1?'−':M(a))+X;if(b)s+=(s?' '+sg(b):M(b));return s||'0'};
const WHY={ordMul:'الضرب قبل الجمع في أولويات العمليات',powRep:'الأس يدل على عدد مرات ضرب الأساس في نفسه',group:'نرتب الحدود المتشابهة متجاورة',pctDef:'النسبة المئوية كسر مقامه 100',circRule:'محيط الدائرة = 2 × π × نق',subOpp:'الطرح يساوي جمع المعكوس',diffSign:'إشارتان مختلفتان: نطرح القيمتين ونأخذ إشارة الأكبر قيمةً مطلقة',lcm:'نحتاج مقاماً يقبل القسمة على المقامين معاً',
 equiv:'نضرب البسط والمقام في العدد نفسه فلا تتغير قيمة الكسر',addNum:'عندما يتساوى المقامان نجمع البسوط ونُبقي المقام',simplify:'نقسم البسط والمقام على عاملهما المشترك الأكبر',
 recip:'القسمة على كسر تساوي الضرب في مقلوبه',signMul:'سالب × موجب = سالب',dist:'نضرب العدد خارج القوس في كل حد داخله',distN:'الإشارة السالبة قبل القوس تغيّر إشارة كل حد داخله',
 like:'نجمع معاملات الحدود المتشابهة فقط',facRule:'(س + م)(س + ن) = س² + (م + ن)س + م×ن',pair:'العددان يحققان الشرطين معاً: حاصل الضرب والمجموع',write:'نكتب كل عدد مع س داخل قوس',
 verify:'التحقق بالتوزيع أو التعويض يكشف أي خطأ',inverse:'نطرح العدد نفسه (أو نضيفه) من الطرفين لتبقى المعادلة متوازنة',divide:'نقسم الطرفين على معامل س',compute:'نحسب الناتج مع الانتباه للإشارة',
 pyth:'في المثلث القائم: مربع الوتر = مجموع مربعي الضلعين القائمين',squares:'مربع العدد = العدد × نفسه',sqrt:'نأخذ الجذر التربيعي الموجب لنجد الطول'};
const MISX={order:'نبدأ بالضرب والقسمة قبل الجمع والطرح، ما لم توجد أقواس.',powMul:'الأس يعني تكرار الضرب: 3² = 3 × 3 وليس 3 × 2.',pct:'النسبة المئوية جزء من 100، فنضرب في الكسر ولا نطرح.',circ:'محيط الدائرة = 2 × π × نق.',unlike:'لا نجمع حدًّا فيه س مع عدد ثابت.',likeTerms:'جمع الحدود المتشابهة لا يغيّر أس المتغير.',fracAdd:'لا نجمع المقامات؛ نوحّدها أولًا.',divCoef:'المعامل يضرب س، لذلك نقسم الطرفين عليه ولا نطرحه.'};
const T={};
T.ord=()=>{const a=R(2,9),b=R(2,9),c=R(2,9);const q=`${a} + ${b} × ${c}`;
 return{topic:'ord',tname:'أولويات العمليات',prob:'احسب: '+q,steps:[{t:`${q} = ${a} + ${b*c}`,why:'ordMul'},{t:`= ${a+b*c}`,why:'compute'}],
 v:[{lines:[`${q} = ${a+b} × ${c}`,`= ${(a+b)*c}`],at:0,mis:'order',fix:[`${a} + ${b*c}`,`${a+b} × ${c}`,`${a} + ${b+c}`]},
    {lines:[`${q} = ${a} + ${b*c}`,`= ${a+b*c+1}`],at:1,mis:'',fix:[''+(a+b*c),''+(a+b*c+1),''+(a*b*c)]}]}};
T.frac=()=>{let b=pick([2,3,4,5,6]),d=pick([2,3,4,5,6]);while(d===b)d=pick([2,3,4,5,6]);const a=R(1,b-1),c=R(1,d-1),L=lcm(b,d),n=a*L/b+c*L/d;
 const st=[{t:`المقام المشترك = ${L}`,why:'lcm'},{t:`${a}/${b} + ${c}/${d} = ${a*L/b}/${L} + ${c*L/d}/${L}`,why:'equiv'},{t:`= ${n}/${L}`,why:'addNum'}];
 if(fr(n,L)!==n+'/'+L)st.push({t:`= ${fr(n,L)}`,why:'simplify'});
 return{topic:'frac',tname:'الكسور',prob:`احسب: ${a}/${b} + ${c}/${d}`,steps:st,
 v:[{lines:[`${a}/${b} + ${c}/${d} = ${a+c}/${b+d}`],at:0,mis:'fracAdd',fix:[`${fr(n,L)}`,`${a+c}/${b+d}`,`${a+c}/${L}`]},
    {lines:[`${a}/${b} + ${c}/${d} = ${a*L/b}/${L} + ${c*L/d}/${L}`,`= ${n}/${2*L}`],at:1,mis:'fracAdd',fix:[`${n}/${L}`,`${n}/${2*L}`,`${a+c}/${L}`]}]}};
T.pow=()=>{const a=R(2,5),n=R(2,3),b=R(2,6);const v=a**n;const q=`${a}${n===2?'²':'³'} + ${b}`;
 return{topic:'pow',tname:'الأسس',prob:'احسب: '+q,steps:[{t:`${a}${n===2?'²':'³'} = ${Array(n).fill(a).join(' × ')} = ${v}`,why:'powRep'},{t:`${q} = ${v} + ${b} = ${v+b}`,why:'compute'}],
 v:[{lines:[`${a}${n===2?'²':'³'} = ${a} × ${n} = ${a*n}`,`${q} = ${a*n+b}`],at:0,mis:'powMul',fix:[`${Array(n).fill(a).join(' × ')} = ${v}`,`${a} × ${n} = ${a*n}`,`${a} + ${n} = ${a+n}`]},
    {lines:[`${a}${n===2?'²':'³'} = ${Array(n).fill(a).join(' × ')} = ${v}`,`${q} = ${v} × ${b} = ${v*b}`],at:1,mis:'',fix:[`${v} + ${b} = ${v+b}`,`${v} × ${b} = ${v*b}`,`${a+b}${n===2?'²':'³'}`]}]}};
T.expr=()=>{const a=R(2,9),b=R(2,9),c=R(1,9);const q=`${a}${X} + ${c} + ${b}${X}`;
 return{topic:'expr',tname:'المقادير الجبرية',prob:'بسّط: '+q,steps:[{t:`= ${a}${X} + ${b}${X} + ${c}`,why:'group'},{t:`= ${a+b}${X} + ${c}`,why:'like'}],
 v:[{lines:[`= ${a}${X} + ${b}${X} + ${c}`,`= ${a+b+c}${X}`],at:1,mis:'unlike',fix:[`${a+b}${X} + ${c}`,`${a+b+c}${X}`,`${a*b}${X} + ${c}`]},
    {lines:[`= ${a}${X} + ${b}${X} + ${c}`,`= ${a+b}${X}² + ${c}`],at:1,mis:'likeTerms',fix:[`${a+b}${X} + ${c}`,`${a+b}${X}² + ${c}`,`${a*b}${X} + ${c}`]}]}};
T.eq=()=>{const a=R(2,9),x=R(2,12);const q=`${a}${X} = ${a*x}`;
 return{topic:'eq',tname:'المتغير',prob:'أوجد قيمة س: '+q,steps:[{t:`${X} = ${a*x} ÷ ${a}`,why:'divide'},{t:`${X} = ${x}`,why:'compute'},{t:`تحقق: ${a} × ${x} = ${a*x}`,why:'verify'}],
 v:[{lines:[`${X} = ${a*x} − ${a}`,`${X} = ${a*x-a}`],at:0,mis:'divCoef',fix:[`${X} = ${a*x} ÷ ${a}`,`${X} = ${a*x} − ${a}`,`${X} = ${a*x} × ${a}`]},
    {lines:[`${X} = ${a*x} ÷ ${a}`,`${X} = ${x+1}`],at:1,mis:'',fix:[`${X} = ${x}`,`${X} = ${x+1}`,`${X} = ${a*x}`]}]}};
T.pct=()=>{const p=pick([10,20,25,50]),n=R(2,9)*20;const v=n*p/100;
 return{topic:'pct',tname:'النسبة المئوية',prob:`أوجد ${p}% من ${n}`,steps:[{t:`${p}% = ${p}/100`,why:'pctDef'},{t:`${p}/100 × ${n} = ${v}`,why:'compute'}],
 v:[{lines:[`${p}% من ${n} = ${n} − ${p} = ${n-p}`],at:0,mis:'pct',fix:[`${p}/100 × ${n}`,`${n} − ${p}`,`${p} × ${n}`]},
    {lines:[`${p}% = ${p}/100`,`${p}/100 × ${n} = ${v*10}`],at:1,mis:'',fix:[`${v}`,`${v*10}`,`${n-p}`]}]}};
T.circ=()=>{const r=R(2,9);const D=x=>(Math.round(x*100)/100+'').replace('.',',');
 return{topic:'circ',tname:'محيط الدائرة',prob:`أوجد محيط دائرة نصف قطرها ${r} سم (π = 3,14)`,steps:[{t:`المحيط = 2 × π × نق`,why:'circRule'},{t:`= 2 × 3,14 × ${r} = ${D(6.28*r)} سم`,why:'compute'}],
 v:[{lines:[`المحيط = π × نق`,`= 3,14 × ${r} = ${D(3.14*r)} سم`],at:0,mis:'circ',fix:['2 × π × نق','π × نق','π × نق²']},
    {lines:[`المحيط = 2 × π × نق`,`= 3,14 × ${r*r} = ${D(3.14*r*r)} سم`],at:1,mis:'',fix:[`2 × 3,14 × ${r} = ${D(6.28*r)}`,`3,14 × ${r*r} = ${D(3.14*r*r)}`,`3,14 × ${r} = ${D(3.14*r)}`]}]}};
const TOPICS=Object.keys(T);
window.CASES={T,TOPICS,WHY,MISX,make:t=>{const k=t||pick(TOPICS);let c;for(let i=0;i<60;i++){c=T[k]();if(c.v.every(v=>new Set(v.fix).size===v.fix.length&&v.lines[v.at]!==(c.steps[v.at]||{}).t))break}return c},mis:k=>(window.MISC&&window.MISC[k])||MISX[k]||k,
 skill:{ord:"S1-1-1",frac:"P04",pow:"S1-1-2",expr:"S1-3-3",eq:"S1-3-1",pct:"S2-6-3",circ:"S2-7-6"}};
})();
