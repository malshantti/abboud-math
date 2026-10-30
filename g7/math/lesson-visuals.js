/* Visual mathematics: the scenes are calculated examples, separate from assessment and saved progress. */
(function(){
'use strict';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace('.',',');// الفاصلة العشرية كما في الكتاب
const eqs=n=>Math.abs(n*100-Math.round(n*100))<1e-9?'=':'≈';
const ct=(k,v)=>k===0?'':(k<0?' − ':' + ')+(Math.abs(k)===1&&v?'':fmt(Math.abs(k)))+v;// حد بمعامله دون «1س» أو «+ 0»
const sign=n=>n<0?' − '+fmt(-n):' + '+fmt(n);
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
const fraction=(a,b)=>{const g=gcd(a,b);return b/g===1?String(a/g):`${a/g}/${b/g}`};
const pi=Math.PI;
const range=(name,label,min,max,value,step=1)=>({name,label,min,max,value,step});
const ENGINES={
 integer:{name:'نمشي على خط الأعداد',controls:[range('a','نقطة البداية',-6,6,-3),range('b','عدد الخطوات',-6,6,5)]},
 absolute:{name:'المسافة عن الصفر',controls:[range('a','حرّك العدد',-8,8,-5)]},
 compare:{name:'مكان العدد يحكي قيمته',controls:[range('a','بسط الكسر الأول، مقامه 2',-6,6,-3),range('b','بسط الكسر الثاني، مقامه 3',-6,6,2)]},
 fraction:{name:'الجزء من الكلّ',controls:[range('a','الأجزاء الملوّنة',0,8,3),range('b','عدد أجزاء الكلّ',2,8,4)]},
 fractionAdd:{name:'نجمع أجزاء بالحجم نفسه',controls:[range('a','بسط الكسر الأول، مقامه 6',0,6,2),range('b','بسط الكسر الثاني، مقامه 6',0,6,3)]},
 fractionMultiply:{name:'جزء من جزء',controls:[range('a','أجزاء الكسر الأول من 4',1,4,3),range('b','أجزاء الكسر الثاني من 4',1,4,2)]},
 decimal:{name:'مئة جزء، وفكرة واحدة',controls:[range('a','الأجزاء من مئة',0,100,35)]},
 percent:{name:'نرى النسبة المئوية',controls:[range('a','النسبة من مئة',0,100,40)]},
 powerCompare:{name:'أيّ العددين الأسّيين أكبر؟',controls:[range('a','أساس العدد الأول',2,6,3),range('b','أس العدد الأول',1,6,4),range('c','أساس العدد الثاني',2,6,2),range('d','أس العدد الثاني',1,6,6)]},
 sqrtLine:{name:'نحصر العدد بين مربعين كاملين',controls:[range('a','العدد تحت الجذر',1,100,12)]},
 cbrtLine:{name:'نحصر العدد بين مكعبين كاملين',controls:[range('a','العدد تحت الجذر التكعيبي',1,216,72)]},
 unitMix:{name:'القوى والجذور مع أولويات العمليات',controls:[range('a','أساس القوة (أس 2)',2,6,3),range('b','الجذر التربيعي للعدد',1,10,7),range('c','الجذر التكعيبي للعدد',1,5,3)]},
 triKind:{name:'نرسم المثلث من زاويتين ونصنّفه',controls:[range('a','قياس الزاوية ب',20,120,70,5),range('b','قياس الزاوية جـ',20,120,60,5)]},
 triSides:{name:'هل تصنع الأطوال الثلاثة مثلثًا؟',controls:[range('a','طول الضلع الأول (سم)',1,12,6),range('b','طول الضلع الثاني (سم)',1,12,5),range('c','طول الضلع الثالث (سم)',1,12,3)]},
 isoAltitude:{name:'العمود في المثلث متساوي الساقين',controls:[range('a','طول القاعدة ب جـ (سم)',4,16,10,2),range('b','قياس زاوية الرأس أ',30,140,80,10)]},
 trapezoid:{name:'القاعدتان والساقان في شبه المنحرف',controls:[range('a','طول القاعدة العليا أ د',2,8,3),range('b','طول القاعدة السفلى ب جـ',3,10,7),range('c','إزاحة القاعدة العليا',-3,3,0)]},
 trapIso:{name:'زوايا شبه المنحرف متساوي الساقين',controls:[range('a','قياس الزاوية أ',40,85,40,5)]},
 paraProps:{name:'خصائص متوازي الأضلاع',controls:[range('a','طول الضلع ب جـ (سم)',3,8,6),range('b','طول الضلع أ ب (سم)',2,6,4),range('c','قياس الزاوية ب',40,90,60,5)]},
 termParts:{name:'المعامل والمتغير في الحد الجبري',controls:[range('a','المعامل',1,6,3),range('b','قيمة س',1,9,4)]},
 substitute:{name:'محيط الحوض بالتعويض',controls:[range('a','قيمة س (م)',2,12,10),range('b','قيمة ص (م)',2,10,7)]},
 likeTerms:{name:'نجمع الحدود المتشابهة فقط',controls:[range('a','معامل س الأول',1,5,3),range('b','معامل ص',1,4,2),range('c','معامل س الثاني',1,4,2)]},
 areaDistribute:{name:'نضرب الحد في كل حدود المقدار',controls:[range('a','العدد خارج القوسين',2,6,5),range('b','العدد داخل القوسين',1,6,3)]},
 power:{name:'الأساس يتكرر بعدد الأس',controls:[range('a','الأساس',2,5,3),range('b','الأس',1,6,4)]},
 powers:{name:'الضرب المتكرر يصنع مربعًا',controls:[range('a','طول ضلع المربع',1,6,4)]},
 root:{name:'من المساحة إلى طول الضلع',controls:[range('a','طول ضلع المربع',1,6,4)]},
 cubeRoot:{name:'من الحجم إلى طول الحرف',controls:[range('a','طول حرف المكعب',1,5,3)]},
 irrational:{name:'بين عددين، جذر جديد',controls:[range('a','عدد تحت الجذر',2,10,2)]},
 radicals:{name:'نجمع الجذور المتشابهة',controls:[range('a','عدد الجذور في المجموعة الأولى',1,4,2),range('b','عدد الجذور في الثانية',1,4,3)]},
 order:{name:'الخطوة الأولى تغيّر الجواب',controls:[range('a','العدد الأول',1,8,2),range('b','العدد الثاني',1,6,3),range('c','العدد الثالث',1,5,4)]},
 terms:{name:'نجمع الأشياء المتشابهة',controls:[range('a','عدد حدود س في المجموعة الأولى',1,6,3),range('b','عدد حدود س في الثانية',1,6,2)]},
 distribute:{name:'كل صف يأخذ نصيبه',controls:[range('a','عدد الصفوف',2,5,3),range('b','الوحدات بجانب س',1,5,2)]},
 factor:{name:'نرجع إلى العامل المشترك',controls:[range('a','العامل المشترك',2,5,3),range('b','الوحدات في كل صف',1,5,2)]},
 factorQuadratic:{name:'المقدار على صورة مستطيل',controls:[range('a','الإضافة الأولى إلى س',1,5,2),range('b','الإضافة الثانية',1,5,3)]},
 differenceSquares:{name:'المساحة الباقية تتغيّر شكلًا',controls:[range('a','ضلع المربع الكبير',5,9,6),range('b','ضلع المربع الصغير',1,4,2)]},
 divide:{name:'نوزّع المقدار بالتساوي',controls:[range('a','عدد المجموعات',2,5,3),range('b','حدود س في كل مجموعة',1,5,2)]},
 balance:{name:'الطرفان يبقيان متساويين',controls:[range('a','معامل س',1,4,2),range('b','العدد المضاف',1,6,3),range('c','قيمة س في هذا المثال',1,5,4)]},
 coordinates:{name:'نحدد المكان بخطوتين',controls:[range('a','الإحداثي س',-4,4,3),range('b','الإحداثي ص',-4,4,2)]},
 angle:{name:'لاحظ تغيّر الزاوية',controls:[range('a','قياس الزاوية',15,165,60,15)]},
 triangle:{name:'نكتشف أضلاع المثلث القائم',controls:[range('a','الضلع القائم الأول',2,7,3),range('b','الضلع القائم الثاني',2,7,4)]},
 pythagoras:{name:'ثلاثة مربعات، علاقة واحدة',controls:[range('a','الضلع القائم الأول',2,7,3),range('b','الضلع القائم الثاني',2,7,4)]},
 converse:{name:'هل الأضلاع تصنع زاوية قائمة؟',controls:[range('c','الضلع الثالث (الأطول)، مع ضلعين 3 و4',5,6.5,5,.5)]},
 congruent:{name:'نفس الشكل، مهما تغيّر اتجاهه',controls:[range('a','دوران المثلث الثاني',0,90,30,15)]},
 similar:{name:'يكبر الشكل، وتبقى النسبة',controls:[range('a','معامل تكبير المثلث الثاني',1,3,2,.5)]},
 area:{name:'نعدّ المربعات داخل الشكل',controls:[range('a','طول القاعدة',3,8,5),range('b','الارتفاع العمودي',2,6,3)]},
 parallelogram:{name:'نقصّ قطعة، ونصنع مستطيلًا',controls:[range('a','طول القاعدة',3,8,5),range('b','الارتفاع العمودي',2,6,3)]},
 circle:{name:'نصف القطر يغيّر الدائرة',controls:[range('a','نصف القطر',1,5,3)]},
 sector:{name:'جزء من زاوية… جزء من دائرة',controls:[range('a','نصف القطر',2,5,3),range('b','زاوية القطاع',30,270,90,30)]},
 segment:{name:'قطاع ناقص مثلث',controls:[range('a','نصف القطر',2,5,3),range('b','الزاوية المركزية',30,150,90,15)]},
 prism:{name:'المساحة تتكرّر عبر الارتفاع',controls:[range('a','طول القاعدة، وعرضها 2',2,5,3),range('b','ارتفاع المجسّم',2,7,4)]},
 cylinder:{name:'دائرة فوق دائرة',controls:[range('a','نصف قطر القاعدة',1,5,3),range('b','ارتفاع الأسطوانة',2,7,4)]},
 cone:{name:'ثلث حجم الأسطوانة المناظرة',controls:[range('a','نصف قطر القاعدة',1,5,3),range('b','ارتفاع المخروط',2,7,4)]},
 bars:{name:'نرى البيانات بدل ما نحفظها',controls:[range('a','قيمة العمود الأول',1,10,3),range('b','قيمة العمود الثاني',1,10,7)]},
 stats:{name:'نرتّب القيم ونبحث عن الوسط',controls:[range('a','القيمة الأولى',1,10,3),range('b','القيمة الثانية',1,10,7)]},
 spread:{name:'من أصغر قيمة إلى أكبرها',controls:[range('a','القيمة الأولى',1,10,3),range('b','القيمة الثانية',1,10,7)]},
 pie:{name:'لكل فئة نصيب من الدائرة',controls:[range('a','عدد عناصر الفئة الأولى',1,8,3),range('b','عدد عناصر الفئة الثانية',1,8,2)]},
 probability:{name:'نعدّ النتائج الممكنة',controls:[range('a','الحادث: ظهور عدد أكبر من',1,5,3)]},
 sets:{name:'أين تلتقي المجموعتان؟',controls:[range('a','المجموعة ك: الأعداد الأكبر من',1,5,3)]},
 union:{name:'نجمع الحادثين دون تكرار',controls:[range('a','الحادث ك: الأعداد الأكبر من',1,5,3)]},
 complement:{name:'الحادث، وكل ما ليس فيه',controls:[range('a','الحادث ح: الأعداد الأكبر من',1,5,3)]},
 quadratic:{name:'حيث يقطع المنحنى خطّ الصفر',controls:[range('a','الجذر الأول في هذا المثال',-4,4,2),range('b','الجذر الثاني',-4,4,3)]},
 completeSquare:{name:'نكمل الزاوية الناقصة',controls:[range('a','نصف معامل س',1,5,2),range('b','جذر الطرف الآخر بعد الإكمال',1,4,3)]},
 generalQuadratic:{name:'المميّز يكشف عدد الحلول',controls:[range('a','معامل س²',1,3,1),range('b','معامل س',-6,6,-5),range('c','الحد الثابت',-4,4,4)]},
 cubesDifference:{name:'الفرق بين حجمين',controls:[range('a','حرف المكعب الأول',3,5,4),range('b','حرف المكعب الثاني',1,3,2)]},
 cubesSum:{name:'نجمع حجمين، ونفكّك المقدار',controls:[range('a','حرف المكعب الأول',3,5,4),range('b','حرف المكعب الثاني',1,3,2)]},
 system:{name:'نقطة تلتقي عندها المعادلتان',controls:[range('a','إضافة المستقيم الصاعد',-3,3,1),range('b','إضافة المستقيم الهابط',0,6,5)]},
 trig:{name:'تتغيّر الزاوية، فتتغيّر النسب',controls:[range('a','قياس الزاوية الحادة',15,75,30,5),range('b','طول الوتر',5,12,10)]},
 elevation:{name:'من زاوية النظر إلى الارتفاع',controls:[range('a','زاوية الارتفاع',15,60,30,5),range('b','البعد الأفقي',3,9,6)]}
};
const TYPES={"U1L1": "integer", "U1L2": "compare", "U1L3": "absolute", "U1L4": "integer", "U1L5": "integer", "U1L6": "distribute", "U2L1": "coordinates", "U2L2": "reflect", "U2L3": "prism", "U2L4": "pyramid", "U2L5": "pyrArea", "U2L6": "pyramid", "U3L1": "ratio", "U3L2": "ratio", "U3L3": "inverse", "U3L4": "scale", "U4L1": "stats", "U4L2": "stats", "U4L3": "stats", "U5L1": "sets", "U5L2": "sets", "U5L3": "sets", "U5L4": "complement", "U5L5": "union", "U5L6": "difference", "U6L1": "substitute", "U6L2": "likeTerms", "U6L3": "balance", "U6L4": "balance"};
/* محرّكات إضافية لصفوف ٤ و٥ و٧ على نمط مشاهد الصف السادس (أمثلة محسوبة، لا تغيّر التقدّم) */
const SV=(type,out)=>`<svg viewBox="0 0 540 340" direction="ltr" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;
const digitsOf=(n,len)=>String(n).padStart(len,' ').split('');
const colScene=(type,a,b,op,res,step)=>{const L=Math.max(String(a).length,String(b).length,String(res).length)+1;let o='';const X=i=>420-(L-1-i)*48;const da=digitsOf(a,L),db=digitsOf(b,L),dr=digitsOf(res,L);const P=['آ','ع','م','أ','ع.أ','م.أ','مل'];for(let i=0;i<L;i++){const pl=L-1-i;if(pl<P.length)o+=text(X(i),40,P[pl],'lv-quiet');o+=text(X(i),95,da[i].trim());o+=text(X(i),145,db[i].trim());if(step===2)o+=text(X(i),225,dr[i].trim(),'lv-ink');}o+=text(X(0)-48,145,op)+`<line x1="${X(0)-70}" y1="170" x2="${X(L-1)+30}" y2="170" class="lv-axis"/>`;if(step===1)o+=rect(X(L-1)-24,70,48,90,'lv-gold-soft')+text(X(L-1),95,da[L-1].trim())+text(X(L-1),145,db[L-1].trim());return SV(type,o)};
const dots=(n,cols,x0,y0,cls,gap=26)=>{let o='';for(let i=0;i<n;i++)o+=`<circle cx="${x0+(i%cols)*gap}" cy="${y0+Math.floor(i/cols)*gap}" r="9" class="${cls}"/>`;return o};
const EXT={
 placeValue:{name:'لوحة المنازل',controls:[range('a','عدد الآلاف',0,999,608),range('b','عدد الآحاد',0,999,757)],
  model:(a,b)=>{const n=a*1000+b;return{result:n,steps:[`${a} ألفًا و ${b}`,`${a} × 1000 + ${b}`,`= ${n}`],notes:['نقرأ العدد في دورتين: دورة الآلاف ودورة الآحاد.','قيمة الرقم = الرقم × قيمة منزلته.','نكتب العدد في لوحة المنازل ونقرؤه.']}},
  scene:(m,s)=>{const n=String(m.result).padStart(6,'0').split('');const P=['مئات الآلاف','عشرات الآلاف','آلاف','مئات','عشرات','آحاد'];let o='';n.forEach((d,i)=>{const x=50+i*78;o+=rect(x,90,70,90,i<3?'lv-gold-soft':'lv-green-soft')+text(x+35,75,P[i],'lv-quiet')+text(x+35,145,d);if(s>=1)o+=text(x+35,215,(+d*10**(5-i))||'0','lv-quiet')});if(s===2)o+=text(270,285,'العدد = '+m.result);return SV('placeValue',o)}},
 colAdd:{name:'نجمع المنازل المتشابهة',controls:[range('a','العدد الأول',100,9999,2738),range('b','العدد الثاني',100,9999,1456)],
  model:(a,b)=>({result:a+b,steps:[`${a} + ${b}`,'نبدأ بالآحاد، وإذا زاد المجموع عن 9 نحمل 1 للمنزلة التالية',`${a} + ${b} = ${a+b}`],notes:['نكتب العددين عموديًّا بحيث تتقابل المنازل.','نجمع الآحاد أوّلًا ثم العشرات ثم المئات…','الناتج هو مجموع كل المنازل.']}),
  scene:(m,s)=>colScene('colAdd',m.a,m.b,'+',m.result,s)},
 colSub:{name:'نطرح المنزلة من المنزلة',controls:[range('a','المطروح منه',1000,9999,5302),range('b','المطروح',100,999,768)],
  model:(a,b)=>({result:a-b,steps:[`${a} − ${b}`,'نبدأ بالآحاد، وإذا لم يكفِ الرقم نستلف من المنزلة التالية',`${a} − ${b} = ${a-b}`],notes:['نكتب العددين عموديًّا بحيث تتقابل المنازل.','نطرح الآحاد أوّلًا، ونستلف عند الحاجة.','نتحقّق: الناتج + المطروح = المطروح منه.']}),
  scene:(m,s)=>colScene('colSub',m.a,m.b,'−',m.result,s)},
 round:{name:'إلى أيّ عدد أقرب؟',controls:[range('a','العدد',100,9999,4372),range('b','التقريب لأقرب (1=عشرة، 2=مئة، 3=ألف)',1,3,2)],
  model:(a,b)=>{const p=10**b,lo=Math.floor(a/p)*p,hi=lo+p,r=a-lo>=p/2?hi:lo;return{result:r,lo,hi,steps:[`${a} بين ${lo} و ${hi}`,`ننظر إلى الرقم على يمين منزلة التقريب`,`${a} ≈ ${r}`],notes:['نحصر العدد بين عددين متتاليين من منزلة التقريب.','إذا كان الرقم 5 أو أكثر نقرّب للأعلى، وإلا للأدنى.','العدد المقرّب هو الأقرب على خط الأعداد.']}},
  scene:(m,s)=>{const X=v=>60+(v-m.lo)/(m.hi-m.lo)*420;let o=`<line x1="60" y1="177" x2="480" y2="177" class="lv-axis"/>`+text(60,215,m.lo)+text(480,215,m.hi)+text(270,215,(m.lo+m.hi)/2,'lv-quiet');o+=`<circle cx="${X(m.a)}" cy="177" r="11" class="lv-gold"/>`+text(X(m.a),140,m.a);if(s===2)o+=`<circle cx="${X(m.result)}" cy="177" r="15" class="lv-green"/>`+text(270,290,'≈ '+m.result);return SV('round',o)}},
 mulArea:{name:'نقسم المستطيل إلى عشرات وآحاد',controls:[range('a','العامل الأول (منزلة واحدة)',2,9,6),range('b','العامل الثاني',11,99,34)],
  model:(a,b)=>{const t=Math.floor(b/10)*10,u=b%10;return{result:a*b,t,u,steps:[`${a} × ${b}`,`${a} × ${t} + ${a} × ${u} = ${a*t} + ${a*u}`,`${a} × ${b} = ${a*b}`],notes:['نحلّل العامل الثاني إلى عشرات وآحاد.','نضرب في كل جزء على حدة.','نجمع الناتجين.']}},
  scene:(m,s)=>{const W=360*m.t/m.b,w=360*m.u/m.b;let o=rect(90,90,W,140,'lv-green-soft')+(m.u?rect(90+W,90,w,140,'lv-gold-soft'):'')+text(90+W/2,75,m.t)+(m.u?text(90+W+w/2,75,m.u):'')+text(70,165,m.a);if(s>=1)o+=text(90+W/2,165,m.a*m.t)+(m.u?text(90+W+w/2,165,m.a*m.u):'');if(s===2)o+=text(270,280,'المجموع = '+m.result);return SV('mulArea',o)}},
 mul2:{name:'ضرب عددين بالتحليل',controls:[range('a','العامل الأول',11,999,23),range('b','العامل الثاني',11,99,45)],
  model:(a,b)=>{const t=Math.floor(b/10)*10,u=b%10;return{result:a*b,t,u,steps:[`${a} × ${b}`,`${a} × ${u} = ${a*u}  ،  ${a} × ${t} = ${a*t}`,`${a*u} + ${a*t} = ${a*b}`],notes:['نضرب العدد الأول في آحاد العدد الثاني.','ثم نضربه في عشرات العدد الثاني.','نجمع حاصلي الضرب.']}},
  scene:(m,s)=>{let o=rect(90,90,250,140,'lv-green-soft')+rect(340,90,110,140,'lv-gold-soft')+text(215,75,m.t)+text(395,75,m.u)+text(65,165,m.a);if(s>=1)o+=text(215,165,m.a*m.t)+text(395,165,m.a*m.u);if(s===2)o+=text(270,280,'الناتج = '+m.result);return SV('mul2',o)}},
 divGroups:{name:'نوزّع بالتساوي، وما يبقى هو الباقي',controls:[range('a','المقسوم',10,60,29),range('b','المقسوم عليه',2,9,4)],
  model:(a,b)=>{const q=Math.floor(a/b),r=a%b;return{result:q,q,r,steps:[`${a} ÷ ${b}`,`${b} × ${q} = ${b*q}`,r?`${a} ÷ ${b} = ${q} والباقي ${r}`:`${a} ÷ ${b} = ${q}`],notes:['نوزّع العناصر على مجموعات متساوية.','نعدّ ما في كل مجموعة: هذا هو ناتج القسمة.','ما لا يكفي لمجموعة كاملة هو الباقي، وهو أصغر من المقسوم عليه.']}},
  scene:(m,s)=>{let o='';for(let g=0;g<m.b;g++){const x=30+(g%5)*100,y=40+Math.floor(g/5)*150;o+=rect(x,y,90,130,'lv-empty');if(s>=1)o+=dots(m.q,3,x+19,y+20,'lv-green',26)}if(s===0)o+=dots(m.a,15,40,300-Math.ceil(m.a/15)*26,'lv-gold',30);if(s>=1&&m.r)o+=dots(m.r,10,40,320,'lv-gold',26);return SV('divGroups',o)}},
 divLong:{name:'القسمة الطويلة خطوة خطوة',controls:[range('a','المقسوم',100,999,756),range('b','المقسوم عليه',11,99,21)],
  model:(a,b)=>{const q=Math.floor(a/b),r=a%b;return{result:q,steps:[`${a} ÷ ${b}`,`نقدّر: ${b} × ${q} = ${b*q}`,r?`${a} ÷ ${b} = ${q} والباقي ${r}`:`${a} ÷ ${b} = ${q}`],notes:['نقرّب المقسوم عليه لتقدير الناتج.','نضرب ونطرح ونتأكّد أنّ الباقي أصغر من المقسوم عليه.','نتحقّق: الناتج × المقسوم عليه + الباقي = المقسوم.']}},
  scene:(m,s)=>{let o=text(380,90,m.a)+text(200,90,m.b)+`<path d="M300 60V110H460" class="lv-outline"/>`;if(s>=1)o+=text(380,160,'− '+m.b*m.result)+text(380,40,m.result,'lv-ink');if(s===2)o+=`<line x1="320" y1="180" x2="450" y2="180" class="lv-axis"/>`+text(380,215,m.a%m.b);return SV('divLong',o)}},
 multiples:{name:'نقفز على خط الأعداد بالقفزة نفسها',controls:[range('a','العدد',2,10,4),range('b','عدد القفزات',1,10,6)],
  model:(a,b)=>{const L=Array.from({length:b},(_,i)=>a*(i+1));return{result:a*b,L,steps:[`مضاعفات ${a}`,L.join(' ، '),`${a} × ${b} = ${a*b}`],notes:['مضاعف العدد هو ناتج ضربه في عدد صحيح.','كل قفزة تضيف العدد نفسه.','آخر نقطة نصل إليها = العدد × عدد القفزات.']}},
  scene:(m,s)=>{const max=m.a*10,X=v=>40+v/max*460;let o=`<line x1="40" y1="200" x2="500" y2="200" class="lv-axis"/>`+text(40,235,0)+text(500,235,max);const shown=s===0?1:m.L.length;m.L.slice(0,shown).forEach((v,i)=>{const x0=X(v-m.a),x1=X(v);o+=`<path d="M${x0} 200Q${(x0+x1)/2} 130 ${x1} 200" class="lv-outline"/>`+`<circle cx="${x1}" cy="200" r="8" class="lv-green"/>`+text(x1,(i%2?265:120),v)});return SV('multiples',o)}},
 divisible:{name:'هل يقبل العدد القسمة؟',controls:[range('a','العدد',10,999,354),range('b','على (2 أو 3 أو 5 أو 6)',2,6,3)],
  model:(a,b)=>{if(b===4)b=3;const ds=String(a).split('').map(Number),sum=ds.reduce((x,y)=>x+y,0),last=a%10;const ok=a%b===0;let rule;if(b===2)rule=`رقم الآحاد ${last} ${last%2===0?'زوجي':'فردي'}`;else if(b===3)rule=`مجموع الأرقام ${ds.join(' + ')} = ${sum}`;else if(b===5)rule=`رقم الآحاد ${last}`;else rule=`زوجي؟ ${a%2===0?'نعم':'لا'} ، مجموع الأرقام ${sum}`;return{result:ok?1:0,b,steps:[`${a} ÷ ${b} ؟`,rule,`${a} ${ok?'يقبل':'لا يقبل'} القسمة على ${b}`],notes:[b===2?'العدد يقبل القسمة على 2 إذا كان رقم آحاده زوجيًّا.':b===3?'العدد يقبل القسمة على 3 إذا قبل مجموع أرقامه القسمة على 3.':b===5?'العدد يقبل القسمة على 5 إذا كان رقم آحاده 0 أو 5.':'العدد يقبل القسمة على 6 إذا قبل القسمة على 2 وعلى 3 معًا.','نطبّق القاعدة على العدد.','نحكم ونتحقّق بالقسمة.']}},
  scene:(m,s)=>{const d=String(m.a).split('');let o='';d.forEach((x,i)=>{o+=rect(150+i*80,100,70,90,(s>=1&&(i===d.length-1||m.b===3||m.b===6))?'lv-gold-soft':'lv-green-soft')+text(185+i*80,155,x)});if(s===2)o+=text(270,270,m.result?'✓ يقبل القسمة':'✗ لا يقبل القسمة',m.result?'lv-ink':'lv-quiet');return SV('divisible',o)}},
 mixed:{name:'من العدد الكسري إلى الكسر',controls:[range('a','العدد الصحيح',1,4,2),range('b','بسط الكسر (المقام 4)',1,3,3)],
  model:(a,b)=>({result:a*4+b,steps:[`${a} و ${b}/4`,`${a} × 4 + ${b} = ${a*4+b}`,`${a} و ${b}/4 = ${a*4+b}/4`],notes:['العدد الكسري = عدد صحيح + كسر.','كل واحد صحيح فيه 4 أرباع.','نجمع كل الأرباع لنكتب كسرًا واحدًا.']}),
  scene:(m,s)=>{let o='';for(let k=0;k<=m.a;k++){for(let i=0;i<4;i++){const on=k<m.a||i<m.b;o+=rect(40+k*120+i*27,110,25,100,on?(k<m.a?'lv-green':'lv-gold'):'lv-empty')}}if(s===2)o+=text(270,280,'عدد الأرباع = '+m.result);return SV('mixed',o)}},
 perimeter:{name:'نمشي حول الشكل',controls:[range('a','الطول',2,12,7),range('b','العرض',2,12,4)],
  model:(a,b)=>({result:2*(a+b),steps:[`الطول ${a} والعرض ${b}`,a===b?`محيط المربع = 4 × ${a}`:`محيط المستطيل = 2 × (${a} + ${b})`,`المحيط = ${2*(a+b)}`],notes:[a===b?'عندما يتساوى الطول والعرض يكون الشكل مربّعًا.':'في المستطيل كل ضلعين متقابلين متساويان.','المحيط هو مجموع أطوال الأضلاع.','نكتب الناتج بوحدة الطول نفسها.']}),
  scene:(m,s)=>{const k=Math.min(30,360/m.a,200/m.b),W=m.a*k,H=m.b*k,x=270-W/2,y=160-H/2;let o=rect(x,y,W,H,'lv-green-soft')+text(270,y-12,m.a)+text(x-20,160,m.b);if(s>=1)o+=`<rect x="${x}" y="${y}" width="${W}" height="${H}" class="lv-outline" fill="none" stroke-width="5"/>`;if(s===2)o+=text(270,y+H+40,'المحيط = '+m.result);return SV('perimeter',o)}},
 units:{name:'نحوّل بين وحدات القياس',controls:[range('a','الطول بالأمتار',1,20,3),range('b','وسنتيمترات إضافية',0,99,25)],
  model:(a,b)=>({result:a*100+b,steps:[`${a} م و ${b} سم`,`${a} × 100 = ${a*100} سم`,`${a*100} + ${b} = ${a*100+b} سم`],notes:['المتر = 100 سنتيمتر.','نحوّل الأمتار إلى سنتيمترات بالضرب في 100.','نجمع السنتيمترات الإضافية.']}),
  scene:(m,s)=>{let o='';for(let i=0;i<Math.min(m.a,10);i++)o+=rect(30+i*48,130,44,40,'lv-green-soft')+text(52+i*48,155,'1م');o+=rect(30+Math.min(m.a,10)*48,130,Math.max(4,m.b*0.44),40,'lv-gold-soft');if(s>=1)o+=text(270,100,m.a+' م = '+m.a*100+' سم');if(s===2)o+=text(270,240,m.result+' سم');return SV('units',o)}},
 primes:{name:'نحلّل العدد إلى عوامله الأولية',controls:[range('a','العدد',4,120,60)],
  model:(a)=>{let n=a,f=[];for(let p=2;p*p<=n;p++)while(n%p===0){f.push(p);n/=p}if(n>1)f.push(n);return{result:f.length,f,steps:[`${a}`,f.length===1?`${a} عدد أوّلي`:`${a} = ${f.join(' × ')}`,f.length===1?'له عاملان فقط: 1 ونفسه':`العوامل الأولية: ${[...new Set(f)].join(' ، ')}`],notes:['العدد الأوّلي له عاملان فقط: 1 ونفسه.','نقسم على أصغر عدد أوّلي ممكن ونكرّر.','نكتب العدد حاصل ضرب عوامل أولية.']}},
  scene:(m,s)=>{let o=text(270,50,m.a);let cur=m.a;const show=s===0?0:m.f.length;for(let i=0;i<show;i++){const p=m.f[i];cur/=p;o+=`<circle cx="${150+i*60}" cy="${110+i*40}" r="18" class="lv-gold-soft"/>`+text(150+i*60,116+i*40,p)+text(330+i*30,116+i*40,cur>1?cur:'')}if(s===2)o+=text(270,310,m.f.join(' × '));return SV('primes',o)}},
 gcdLcm:{name:'العوامل المشتركة والمضاعفات المشتركة',controls:[range('a','العدد الأول',2,40,12),range('b','العدد الثاني',2,40,18)],
  model:(a,b)=>{const g=gcd(a,b),l=a*b/g;return{result:g,g,l,steps:[`${a} و ${b}`,`ع.م.أ = ${g}`,`م.م.أ = ${l}`],notes:['نكتب عوامل كل عدد أو مضاعفاته.','أكبر عامل مشترك بينهما هو ع.م.أ.','أصغر مضاعف مشترك بينهما هو م.م.أ.']}},
  scene:(m,s)=>{const fa=[];for(let i=1;i<=m.a;i++)if(m.a%i===0)fa.push(i);const fb=[];for(let i=1;i<=m.b;i++)if(m.b%i===0)fb.push(i);let o='<ellipse cx="210" cy="160" rx="140" ry="110" class="lv-green-soft"/><ellipse cx="330" cy="160" rx="140" ry="110" class="lv-gold-soft"/>'+text(150,40,'عوامل '+m.a)+text(390,40,'عوامل '+m.b);const both=fa.filter(x=>fb.includes(x));fa.filter(x=>!both.includes(x)).forEach((x,i)=>o+=text(130,100+i*30,x));fb.filter(x=>!both.includes(x)).forEach((x,i)=>o+=text(410,100+i*30,x));both.forEach((x,i)=>o+=text(270,100+i*30,x,s>=1&&x===m.g?'lv-ink':''));if(s===2)o+=text(270,310,'م.م.أ = '+m.l);return SV('gcdLcm',o)}},
 ratio:{name:'جدول التناسب',controls:[range('a','الكمية الأولى',1,10,2),range('b','الكمية الثانية',1,10,5)],
  model:(a,b)=>({result:b/a,steps:[`${a} : ${b}`,`${a}/${b} = ${2*a}/${2*b} = ${3*a}/${3*b}`,`الثابت = ${fmt(b/a)}`],notes:['النسبة مقارنة بين كمّيّتين.','في التناسب الطردي إذا ضاعفنا الأولى تضاعفت الثانية.','ناتج قسمة الثانية على الأولى ثابت.']}),
  scene:(m,s)=>{let o='';for(let k=1;k<=4;k++){const sh=s===0?k===1:true;if(sh)o+=rect(40+(k-1)*120,90,110,60,'lv-green-soft')+text(95+(k-1)*120,128,k*m.a)+rect(40+(k-1)*120,160,110,60,'lv-gold-soft')+text(95+(k-1)*120,198,k*m.b)}if(s===2)o+=text(270,280,'الثابت = '+fmt(m.b/m.a));return SV('ratio',o)}},
 inverse:{name:'التناسب العكسي: الحاصل ثابت',controls:[range('a','عدد العمّال',1,12,3),range('b','عدد الأيام',1,12,8)],
  model:(a,b)=>({result:a*b,steps:[`${a} عمّال × ${b} أيام`,`${a} × ${b} = ${a*b}`,`لو صاروا ${2*a} عمّالًا: ${a*b} ÷ ${2*a} = ${fmt(a*b/(2*a))} يومًا`],notes:['في التناسب العكسي تزيد كمّيّة فتنقص الأخرى.','حاصل ضرب الكمّيّتين ثابت.','نقسم الثابت على القيمة الجديدة.']}),
  scene:(m,s)=>{const W=Math.min(40,300/m.b),H=Math.min(22,200/m.a);let o='';for(let r=0;r<m.a;r++)for(let c=0;c<m.b;c++)o+=rect(80+c*W,50+r*H,W-3,H-3,'lv-green-soft');if(s>=1)o+=text(270,300,'المساحة = '+m.a*m.b);return SV('inverse',o)}},
 scale:{name:'من الخريطة إلى الواقع',controls:[range('a','الطول على الرسم (سم)',1,15,4),range('b','كل 1 سم يمثّل (كم)',1,20,5)],
  model:(a,b)=>({result:a*b,steps:[`مقياس الرسم 1 : ${b} كم`,`${a} × ${b}`,`الطول الحقيقي = ${a*b} كم`],notes:['مقياس الرسم = الطول على الرسم : الطول الحقيقي.','نضرب الطول على الرسم في ما يمثّله السنتيمتر.','نكتب الناتج بالوحدة الحقيقية.']}),
  scene:(m,s)=>{let o=`<line x1="60" y1="140" x2="${60+m.a*28}" y2="140" class="lv-outline" stroke-width="6"/>`;for(let i=0;i<=m.a;i++)o+=`<line x1="${60+i*28}" y1="130" x2="${60+i*28}" y2="150" class="lv-axis"/>`;o+=text(60+m.a*14,115,m.a+' سم');if(s>=1)for(let i=0;i<m.a;i++)o+=text(74+i*28,175,m.b,'lv-quiet');if(s===2)o+=text(270,260,m.a*m.b+' كم');return SV('scale',o)}},
 freqTable:{name:'من الإشارات إلى الجدول',controls:[range('a','تكرار الفئة الأولى',1,12,7),range('b','تكرار الفئة الثانية',1,12,4)],
  model:(a,b)=>({result:a+b,steps:['نعدّ الإشارات',`الأولى ${a} ، الثانية ${b}`,`المجموع = ${a+b}`],notes:['كل خمس إشارات نرسمها حزمة واحدة.','عدد الإشارات هو التكرار.','مجموع التكرارات = عدد كل البيانات.']}),
  scene:(m,s)=>{const tally=(n,x,y)=>{let o='';for(let i=0;i<n;i++){const g=Math.floor(i/5),k=i%5;if(k<4)o+=`<line x1="${x+g*70+k*12}" y1="${y}" x2="${x+g*70+k*12}" y2="${y+40}" class="lv-axis" stroke-width="4"/>`;else o+=`<line x1="${x+g*70-6}" y1="${y+35}" x2="${x+g*70+42}" y2="${y+5}" class="lv-axis" stroke-width="4"/>`}return o};let o=text(70,130,'الأولى')+tally(m.a,140,100)+text(70,220,'الثانية')+tally(m.b,140,190);if(s>=1)o+=text(470,130,m.a,'lv-ink')+text(470,220,m.b,'lv-ink');if(s===2)o+=text(270,300,'المجموع '+m.result);return SV('freqTable',o)}},
 lineGraph:{name:'نمثّل التغيّر بالخطوط',controls:[range('a','القيمة الأولى',1,10,3),range('b','القيمة الأخيرة',1,10,8)],
  model:(a,b)=>({result:b-a,steps:[`من ${a} إلى ${b}`,'نصل النقاط بخطوط مستقيمة',b>a?`زيادة مقدارها ${b-a}`:b<a?`نقص مقداره ${a-b}`:'لا تغيّر'],notes:['نعيّن كل قيمة نقطة فوق زمنها.','نصل النقاط بالترتيب.','ميل الخط يبيّن الزيادة أو النقص.']}),
  scene:(m,s)=>{const v=[m.a,Math.round((2*m.a+m.b)/3),Math.round((m.a+2*m.b)/3),m.b],X=i=>90+i*120,Y=q=>280-q*22;let o=`<line x1="60" y1="280" x2="500" y2="280" class="lv-axis"/><line x1="60" y1="280" x2="60" y2="40" class="lv-axis"/>`;v.forEach((q,i)=>o+=`<circle cx="${X(i)}" cy="${Y(q)}" r="8" class="lv-gold"/>`+text(X(i),Y(q)-16,q));if(s>=1)o+=`<path d="M${v.map((q,i)=>X(i)+' '+Y(q)).join('L')}" class="lv-outline" fill="none" stroke-width="4"/>`;return SV('lineGraph',o)}},
 quad:{name:'نصنّف الشكل الرباعي',controls:[range('a','طول الضلع الأفقي',2,9,6),range('b','طول الضلع المائل',2,9,4),range('c','قياس الزاوية',30,90,90,15)],
  model:(a,b,c)=>{const n=c===90?(a===b?'مربع':'مستطيل'):(a===b?'معيّن':'متوازي أضلاع');return{result:0,name:n,steps:[`أضلاع ${a} و ${b} ، زاوية ${c}°`,c===90?'كل الزوايا قوائم':'الزوايا ليست قوائم',`الشكل: ${n}`],notes:['الشكل الرباعي له أربعة أضلاع وأربع زوايا مجموعها 360°.','نفحص الزوايا: هل هي قوائم؟','نفحص الأضلاع: هل هي متساوية؟ ثم نسمّي الشكل.']}},
  scene:(m,s)=>{const k=30,r=m.c*Math.PI/180,dx=m.b*k*Math.cos(r),dy=m.b*k*Math.sin(r),x=130,y=250;let o=`<path d="M${x} ${y}h${m.a*k}l${dx} ${-dy}h${-m.a*k}Z" class="lv-green-soft"/>`+text(x+m.a*k/2,y+28,m.a)+text(x+dx/2-18,y-dy/2,m.b);if(s>=1)o+=text(x+30,y-12,m.c+'°','lv-quiet');if(s===2)o+=text(270,40,m.name);return SV('quad',o)}},
 cuboidArea:{name:'نفرد متوازي المستطيلات',controls:[range('a','الطول',1,8,5),range('b','العرض',1,6,3),range('c','الارتفاع',1,6,2)],
  model:(a,b,c)=>{const L=2*c*(a+b),T=L+2*a*b;return{result:T,steps:[`${a} × ${b} × ${c}`,`المساحة الجانبية = 2 × ${c} × (${a} + ${b}) = ${L}`,`المساحة الكلية = ${L} + 2 × ${a} × ${b} = ${T}`],notes:['لمتوازي المستطيلات 6 أوجه، كل وجهين متقابلين متطابقان.','المساحة الجانبية = محيط القاعدة × الارتفاع.','المساحة الكلية = الجانبية + مساحة القاعدتين.']}},
  scene:(m,s)=>{const k=22,A=m.a*k,B=m.b*k,C=m.c*k,x=80,y=110;let o='';const faces=[[x,y,B,C,'lv-gold-soft'],[x+B,y,A,C,'lv-green-soft'],[x+B+A,y,B,C,'lv-gold-soft'],[x+2*B+A,y,A,C,'lv-green-soft']];faces.forEach(f=>o+=rect(...f));if(s===2)o+=rect(x+B,y-B,A,B,'lv-blue-soft')+rect(x+B,y+C,A,B,'lv-blue-soft');o+=text(270,300,s===0?'نفرد الأوجه':s===1?'الجانبية '+2*m.c*(m.a+m.b):'الكلية '+m.result);return SV('cuboidArea',o)}},
 pyramid:{name:'الهرم الرباعي: ثلث المنشور',controls:[range('a','طول ضلع القاعدة',2,8,6),range('b','الارتفاع',2,9,4)],
  model:(a,b)=>({result:a*a*b/3,steps:[`قاعدة مربعة ضلعها ${a} ، ارتفاع ${b}`,`مساحة القاعدة = ${a} × ${a} = ${a*a}`,`الحجم = 1/3 × ${a*a} × ${b} = ${fmt(a*a*b/3)}`],notes:['قاعدة الهرم الرباعي المنتظم مربع.','نحسب مساحة القاعدة.','حجم الهرم = ثلث مساحة القاعدة × الارتفاع.']}),
  scene:(m,s)=>{const k=24,A=m.a*k,H=m.b*k,x=270-A/2,y=280;let o=`<path d="M${x} ${y}h${A}l40 -30h${-A}Z" class="lv-gold-soft"/><path d="M${x} ${y}L${270+20} ${y-15-H}L${x+A} ${y}Z" class="lv-green-soft"/><path d="M${x+A} ${y}L${290} ${y-15-H}L${x+A+40} ${y-30}Z" class="lv-green"/>`;if(s>=1)o+=`<line x1="290" y1="${y-15}" x2="290" y2="${y-15-H}" class="lv-outline" stroke-dasharray="6 5"/>`+text(310,y-15-H/2,'ع '+m.b);if(s===2)o+=text(270,40,'الحجم = '+fmt(m.result));return SV('pyramid',o)}},
 reflect:{name:'الانعكاس والانسحاب في المستوى',controls:[range('a','الإحداثي س',-5,5,3),range('b','الإحداثي ص',-5,5,2),range('c','الانسحاب أفقيًّا',-4,4,-3)],
  model:(a,b,c)=>({result:0,steps:[`النقطة (${a} ، ${b})`,`صورتها بالانعكاس في محور الصادات (${-a} ، ${b})`,`صورتها بالانسحاب ${c} وحدات أفقيًّا (${a+c} ، ${b})`],notes:['نحدّد النقطة بإحداثييها.','الانعكاس في محور الصادات يغيّر إشارة الإحداثي السيني.','الانسحاب يحرّك كل نقطة المسافة نفسها.']}),
  scene:(m,s)=>{const X=v=>270+v*24,Y=v=>170-v*24;let o=`<line x1="20" y1="170" x2="520" y2="170" class="lv-axis"/><line x1="270" y1="20" x2="270" y2="320" class="lv-axis"/>`+`<circle cx="${X(m.a)}" cy="${Y(m.b)}" r="10" class="lv-green"/>`;if(s>=1)o+=`<circle cx="${X(-m.a)}" cy="${Y(m.b)}" r="10" class="lv-gold"/>`;if(s===2)o+=`<circle cx="${X(m.a+m.c)}" cy="${Y(m.b)}" r="10" class="lv-blue-soft"/>`;return SV('reflect',o)}},
 decAdd:{name:'نجمع الأعشار مع الأعشار',controls:[range('a','العدد الأول (أعشار)',1,99,37),range('b','العدد الثاني (أعشار)',1,99,25)],
  model:(a,b)=>({result:(a+b)/10,steps:[`${fmt(a/10)} + ${fmt(b/10)}`,`${a} عُشرًا + ${b} عُشرًا = ${a+b} عُشرًا`,`= ${fmt((a+b)/10)}`],notes:['نرتّب الفاصلتين العشريتين فوق بعضهما.','نجمع الأعشار مع الأعشار والآحاد مع الآحاد.','نضع الفاصلة في الناتج تحت الفاصلتين.']}),
  scene:(m,s)=>{let o='';const bar=(n,y,cls)=>{let q='';for(let i=0;i<n;i++)q+=rect(30+(i%50)*9.6,y+Math.floor(i/50)*14,8,12,cls);return q};o+=bar(m.a,60,'lv-green')+bar(m.b,130,'lv-gold');if(s===2)o+=bar(m.a+m.b,210,'lv-blue-soft')+text(270,320,fmt(m.result));return SV('decAdd',o)}},
 decMul:{name:'نضرب ثم نعدّ المنازل العشرية',controls:[range('a','العامل الأول (أعشار)',1,99,12),range('b','العامل الثاني (أعشار)',1,99,15)],
  model:(a,b)=>({result:a*b/100,steps:[`${fmt(a/10)} × ${fmt(b/10)}`,`${a} × ${b} = ${a*b}`,`منزلتان عشريتان: ${fmt(a*b/100)}`],notes:['نضرب العددين كأنهما صحيحان.','نعدّ المنازل العشرية في العاملين معًا.','نضع الفاصلة في الناتج بعدد تلك المنازل.']}),
  scene:(m,s)=>{const W=Math.min(380,m.a*12),H=Math.min(250,m.b*12);let o=rect(80,40,W,H,'lv-green-soft')+text(80+W/2,30,fmt(m.a/10))+text(60,40+H/2,fmt(m.b/10));if(s===2)o+=text(270,320,'= '+fmt(m.result));return SV('decMul',o)}},
 decDiv:{name:'نجعل المقسوم عليه عددًا صحيحًا',controls:[range('a','المقسوم (أعشار)',1,99,48),range('b','المقسوم عليه (أعشار)',1,9,4)],
  model:(a,b)=>({result:a/b,steps:[`${fmt(a/10)} ÷ ${fmt(b/10)}`,`نضرب الاثنين في 10: ${a} ÷ ${b}`,`= ${fmt(a/b)}`],notes:['ننقل الفاصلة في المقسوم عليه ليصبح عددًا صحيحًا.','ننقلها بالعدد نفسه من المنازل في المقسوم.','نقسم كما نقسم الأعداد الصحيحة.']}),
  scene:(m,s)=>{let o=text(380,90,s?m.a:fmt(m.a/10))+text(200,90,s?m.b:fmt(m.b/10))+`<path d="M300 60V110H460" class="lv-outline"/>`;if(s===1)o+=text(270,180,'× 10','lv-quiet');if(s===2)o+=text(380,40,fmt(m.result),'lv-ink');return SV('decDiv',o)}},
 pyrArea:{name:'نفرد الهرم الرباعي',controls:[range('a','طول ضلع القاعدة',2,8,6),range('b','الارتفاع الجانبي',2,9,5)],
  model:(a,b)=>{const L=4*a*b/2;return{result:L+a*a,steps:[`قاعدة ${a} ، ارتفاع جانبي ${b}`,`المساحة الجانبية = 4 × ½ × ${a} × ${b} = ${fmt(L)}`,`الكلية = ${fmt(L)} + ${a*a} = ${fmt(L+a*a)}`],notes:['للهرم الرباعي المنتظم 4 أوجه مثلثة متطابقة.','المساحة الجانبية = ½ × محيط القاعدة × الارتفاع الجانبي.','الكلية = الجانبية + مساحة القاعدة.']}},
  scene:(m,s)=>{const k=18,A=m.a*k,B=m.b*k,cx=270,cy=170,h=A/2;let o=rect(cx-h,cy-h,A,A,s===2?'lv-gold':'lv-gold-soft');[[cx-h,cy-h,cx+h,cy-h,cx,cy-h-B],[cx+h,cy-h,cx+h,cy+h,cx+h+B,cy],[cx+h,cy+h,cx-h,cy+h,cx,cy+h+B],[cx-h,cy+h,cx-h,cy-h,cx-h-B,cy]].forEach(t=>o+=`<path d="M${t[0]} ${t[1]}L${t[2]} ${t[3]}L${t[4]} ${t[5]}Z" class="${s>=1?'lv-green':'lv-green-soft'}"/>`);return SV('pyrArea',o)}},
 fracMulInt:{name:'نكرّر الكسر',controls:[range('a','العدد الصحيح',1,6,3),range('b','بسط الكسر (المقام 4)',1,3,3)],
  model:(a,b)=>({result:a*b/4,steps:[`${a} × ${b}/4`,`${b}/4 + … (${a} مرات) = ${a*b}/4`,`= ${fraction(a*b,4)}`],notes:['ضرب عدد صحيح في كسر = جمع الكسر مكرّرًا.','نضرب العدد الصحيح في البسط ونبقي المقام.','نبسّط الناتج أو نكتبه عددًا كسريًّا.']}),
  scene:(m,s)=>{let o='';for(let k=0;k<m.a;k++)for(let i=0;i<4;i++)o+=rect(30+k*82+i*19,110,17,100,i<m.b?'lv-green':'lv-empty');if(s===2)o+=text(270,280,fraction(m.a*m.b,4));return SV('fracMulInt',o)}}
};
Object.keys(EXT).forEach(k=>ENGINES[k]={name:EXT[k].name,controls:EXT[k].controls});

ENGINES.fractionDivide={name:'كم جزءًا يحتوي هذا الجزء؟',controls:[range('a','بسط الكسر الأول، مقامه 4',1,4,3),range('b','بسط الكسر الثاني، مقامه 4',1,4,2)]};
ENGINES.triangleArea={name:'مثلث هو نصف مستطيل',controls:ENGINES.area.controls};
ENGINES.trapRight={name:'زوايا شبه المنحرف قائم الزاوية',controls:[range('a','قياس الزاوية د',40,85,60,5)]};
ENGINES.fractionSubtract={name:'نطرح أجزاء بالحجم نفسه',controls:ENGINES.fractionAdd.controls};
ENGINES.difference={name:'في الحادث الأول، خارج الثاني',controls:ENGINES.union.controls};
const VARIANTS={};
function model(type,s){
 const a=+s.a||0,b=+s.b||0,c=+s.c||0,m={type,a,b,c,steps:[],notes:[],result:0};if(EXT[type])return Object.assign(m,EXT[type].model(a,b,c));
 const set=(result,steps,notes)=>Object.assign(m,{result,steps,notes});
 if(type==='fractionSubtract')return set((a-b)/6,[`${a}/6 − ${b}/6`,`${a} − ${b} = ${a-b}`,`${a}/6 − ${b}/6 = ${fraction(a-b,6)}`],['للكسرين المقام نفسه، فأجزاؤهما بالحجم نفسه.','الطرح يحرّكنا يسارًا على الخط، بعدد الأجزاء المطروحة.','نطرح البسطين ونحافظ على المقام، وقد يكون الفرق سالبًا.']);
 if(type==='difference'){const sets=model('sets',s),only=sets.A.filter(n=>!sets.B.includes(n));return Object.assign(m,sets,{type,result:only.length/6,chosen:only,steps:[`ح = {2 ، 4 ، 6}  ،  ك = {${sets.B.join(' ، ')}}`,`ح − ك = {${only.join(' ، ')}}`,`ل(ح − ك) = ${only.length}/6 = ${fraction(only.length,6)}`],notes:['نحدد الحادثين داخل الفضاء العيني نفسه.','نحتفظ بما في الحادث الأول، ونزيل ما يشترك فيه مع الثاني.','نقسم عدد النتائج المتبقية على مجموع النتائج الممكنة.']});}
 if(type==='fractionDivide')return set(a/b,[`${a}/4 ÷ ${b}/4`,`${a}/4 × 4/${b}`,`${a}/4 ÷ ${b}/4 = ${fraction(a,b)}`],['نقارن أجزاء لها وحدة قياس واحدة: الربع.','لقسمة الكسور نضرب في مقلوب الكسر الثاني.','النسبة بين الشريطين تعطي ناتج القسمة، وقد تكون أقل من واحد.']);
 if(type==='triangleArea')return set(a*b/2,[`مستطيل قاعدته ${a} وارتفاعه ${b}`,`مساحة المستطيل = ${a} × ${b} = ${a*b}`,`مساحة المثلث = 1/2 × ${a} × ${b} = ${fmt(a*b/2)}`],['نضع المثلث داخل مستطيل له القاعدة والارتفاع نفسيهما.','القطر يقسم المستطيل إلى مثلثين متساويي المساحة.','كل مثلث يأخذ نصف مساحة المستطيل.']);
 if(type==='integer')return set(a+b,[`${a} + (${b})`,`${a} ${b>=0?'→':'←'} ${Math.abs(b)} خطوات`,`${a} + (${b}) = ${a+b}`],['نبدأ من العدد الأول.','الموجب يحرّكنا يمينًا، والسالب يسارًا.','المكان الذي وصلنا إليه هو المجموع.']);
 if(type==='absolute')return set(Math.abs(a),[`${a}`,`المسافة إلى 0: ${Math.abs(a)}`,`|${a}| = ${Math.abs(a)}`],['حدّد العدد على الخط.','نعدّ المسافة بينه وبين الصفر.','المسافة غير سالبة، مهما كانت إشارة العدد.']);
 if(type==='compare'){m.left=a/2;m.right=b/3;const cmp=m.left>m.right?'>':m.left<m.right?'<':'=';return set(cmp,[`${a}/2  ?  ${b}/3`,`${a*3}/6  ?  ${b*2}/6`,`${a}/2 ${cmp} ${b}/3`],['نضع العددين على الخط.','يمكن توحيد المقامين إلى ستة.','العدد الموجود إلى اليمين هو الأكبر.']);}
 if(type==='fraction'){m.count=Math.min(a,b);return set(m.count/b,[`${m.count}/${b}`,`${m.count} أجزاء من ${b}`,`${m.count}/${b} ${eqs(m.count/b)} ${fmt(m.count/b)}`],['المقام يحدّد عدد الأجزاء المتساوية.','البسط يحدّد كم جزءًا أخذنا.','القسمة تعطينا قيمة هذا الجزء من الكل.']);}
 if(type==='fractionAdd')return set((a+b)/6,[`${a}/6 + ${b}/6`,`${a} + ${b} = ${a+b}`,`${a}/6 + ${b}/6 = ${fraction(a+b,6)}`],['الأجزاء في الشريطين متساوية الحجم.','نجمع عدد الأجزاء، ونحافظ على المقام.','إذا تجاوز المجموع الكلّ، نكمل في شريط ثانٍ.']);
 if(type==='fractionMultiply')return set(a*b/16,[`${a}/4 × ${b}/4`,`${a} × ${b} = ${a*b} أجزاء من 16`,`${a}/4 × ${b}/4 = ${fraction(a*b,16)}`],['نلوّن أجزاء في اتجاهين.','التداخل هو جزء من جزء.','عدد خلايا التداخل فوق مجموع الخلايا يعطي الناتج.']);
 if(['decimal','percent'].includes(type))return set(a/100,[`${a}/100`,`${fmt(a/100)}`,`${a}/100 = ${fmt(a/100)} = ${a}%`],['الشبكة فيها مئة خانة متساوية.','كل خانة ملوّنة تمثّل جزءًا من مئة.','الكسر والعشري والنسبة طرق لكتابة القيمة نفسها.']);
 if(['powers','root','cubeRoot'].includes(type)){const cube=type==='cubeRoot',n=cube?a*a*a:a*a;return set(n,[cube?`${a} × ${a} × ${a}`:`${a} × ${a}`,`${a}${cube?'³':'²'} = ${n}`,type==='root'?`√${n} = ${a}`:cube?`∛${n} = ${a}`:`${a}² = ${n}`],['نبدأ من طول الضلع أو الحرف.','المربع صفوف وأعمدة، والمكعب له عمق أيضًا.','الجذر يعيدنا من المساحة أو الحجم إلى الطول.']);}
 if(type==='irrational'){const r=Math.sqrt(a),lo=Math.floor(r);m.root=r;m.low=lo;m.high=Math.ceil(r);return set(r,[`√${a}`,`${lo}² ≤ ${a} ≤ ${m.high}²`,`√${a} ${Number.isInteger(r)?'=':'≈'} ${fmt(r)}`],['نبحث عن عدد مربّعه يساوي العدد المعطى.','نحصر الجذر بين جذري مربعين كاملين.','إذا لم يكن العدد مربعًا كاملًا، فالكتابة العشرية هنا تقريبية.']);}
 if(type==='radicals')return set((a+b)*Math.sqrt(2),[`${a}√2 + ${b}√2`,`${a} + ${b} = ${a+b}`,`${a}√2 + ${b}√2 = ${a+b}√2`],['كل قطعة تمثّل الطول نفسه: جذر اثنين.','الجذور متشابهة، فنعدّ القطع.','نجمع المعاملات، ويبقى الجذر كما هو.']);
 if(type==='triKind'){let A=a,B=b;if(A+B>170)B=170-A;const C=180-A-B,mx=Math.max(A,B,C),kind=mx<90?'حاد الزوايا':mx===90?'قائم الزاوية':'منفرج الزاوية';Object.assign(m,{A,B,C,kind,mx});
  return set(C,[`${A}° + ${B}° + ؟ = 180°`,`الزاوية أ = 180° − ${A+B}° = ${C}°`,`المثلث ${kind}`],['نرسم القاعدة ب جـ، ثم الزاويتين عند طرفيها بالمنقلة، فيتقاطع الشعاعان في الرأس أ.','مجموع قياسات زوايا المثلث 180°، فنطرح الزاويتين المعلومتين.',`أكبر زاوية ${mx}°، ${mx<90?'وكل الزوايا حادة':mx===90?'وهي قائمة':'وهي منفرجة'}، إذن المثلث ${kind}.`]);}
 if(type==='triSides'){const q=[a,b,c].sort((x,y)=>x-y),sum=q[0]+q[1],ok=sum>q[2],kind=a===b&&b===c?'متساوي الأضلاع':a===b||b===c||a===c?'متساوي الساقين':'مختلف الأضلاع',sg=sum>q[2]?'>':sum===q[2]?'=':'<';Object.assign(m,{q,ok,kind,sum,sg});
  return set(ok?1:0,[`الأطوال: ${q.join(' ، ')}`,`${q[0]} + ${q[1]} = ${sum} ${sg} ${q[2]}`,ok?`يصلح: مثلث ${kind}`:'لا يصلح لرسم مثلث'],['نرتّب الأطوال من الأصغر إلى الأكبر، ونرسم الضلع الأطول بالمسطرة.','نجمع طولي الضلعين القصيرين ونقارن المجموع بالضلع الأطول.',ok?`المجموع أكبر من الضلع الأطول، فيتقاطع القوسان ويتكوّن مثلث ${kind}.`:'المجموع ليس أكبر من الضلع الأطول، فلا يلتقي الضلعان ولا يتكوّن مثلث.']);}
 if(type==='isoAltitude'){const half=a/2,h=half/Math.tan(b*pi/360),base=(180-b)/2;Object.assign(m,{half,h,base});
  return set(half,[`القاعدة ب جـ = ${a} سم ، زاوية الرأس أ = ${b}°`,`ب د = د جـ = ${a} ÷ 2 = ${fmt(half)} سم`,`∠1 = ∠2 = ${b}° ÷ 2 = ${fmt(b/2)}°`],['نُنزل عمودًا من الرأس أ على القاعدة ب جـ، فيقطعها في النقطة د.','العمود النازل من رأس المثلث متساوي الساقين على القاعدة ينصّفها.',`وينصّف زاوية الرأس، فهو محور تماثل للمثلث، وكل زاوية من زاويتي القاعدة ${fmt(base)}°.`]);}
 if(type==='trapezoid'){const par=a===b;m.par=par;return set(par?1:0,[`أ د = ${a} ، ب جـ = ${b}`,par?'الساقان متوازيان أيضًا':'الساقان أ ب و د جـ يلتقيان إذا امتدّا',par?'متوازي أضلاع، وهو حالة خاصة من شبه المنحرف':'شبه منحرف: قاعدتاه أ د و ب جـ'],['الضلعان أ د و ب جـ متوازيان: هما القاعدتان، والضلعان الآخران هما الساقان.',par?'القاعدتان متساويتان في الطول، فلا يلتقي الساقان أيضًا.':'نمدّ الساقين فيلتقيان، فهما غير متوازيين.','نمدّ القاعدتين، فلا تلتقيان مهما امتدّتا.']);}
 if(type==='trapIso')return set(180-a,[`الزاوية أ = ${a}°`,`د = أ = ${a}°`,`ب = جـ = (360° − ${2*a}°) ÷ 2 = ${180-a}°`],['شبه منحرف متساوي الساقين: الساقان أ ب و د جـ متساويان.','زاويتا القاعدة الواحدة متساويتان في القياس.','مجموع زوايا الشكل الرباعي 360°، والزاويتان الباقيتان متساويتان.']);
 if(type==='trapRight')return set(180-a,[`أ = ب = 90° ، د = ${a}°`,`90° + 90° + ${a}° = ${180+a}°`,`جـ = 360° − ${180+a}° = ${180-a}°`],['شبه منحرف قائم الزاوية: الساق أ ب عمودية على القاعدتين، فتصنع زاويتين قائمتين.','نجمع قياسات الزوايا الثلاث المعلومة.','الزاوية الرابعة = 360° − المجموع.']);
 if(type==='paraProps'){const r=c*pi/180,ux=b*Math.cos(r),uy=b*Math.sin(r),d1=Math.hypot(a-ux,uy),d2=Math.hypot(a+ux,uy),shape=c===90&&a===b?'مربع':c===90?'مستطيل':a===b?'معين':'متوازي أضلاع';Object.assign(m,{d1,d2,shape});const ap=x=>(Number.isInteger(Math.round(x*10)/10)?'':'≈ ')+fmt(Math.round(x*10)/10);
  return set(c,[`أ د = ب جـ = ${a} ، أ ب = د جـ = ${b}`,`ب = د = ${c}° ، أ = جـ = (360° − ${2*c}°) ÷ 2 = ${180-c}°`,'م منتصف القطرين أ جـ و ب د'],['كل ضلعين متقابلين متساويان في الطول.','كل زاويتين متقابلتين متساويتان في القياس.',`القطران ينصّف كل منهما الآخر في م: أ م = م جـ ${ap(d1/2)}، و ب م = م د ${ap(d2/2)}. هذا الشكل: ${shape}.`]);}
 if(['termParts','substitute','likeTerms','areaDistribute'].includes(type)){const T=(k,v)=>(k===1?'':k)+v;m.T=T;
  if(type==='termParts')return set(a*b,[`الحد ${T(a,'س')}: المعامل ${a} والمتغير س`,`${T(a,'س')} = ${a} × س`,`${a} × ${b} = ${a*b}`],[a===1?'المعامل لم يظهر، فهو 1. والحرف س هو المتغير.':`العدد ${a} هو المعامل، والحرف س هو المتغير.`,`الحد ${T(a,'س')} حاصل ضرب: ${a} مرة س.`,`نعوّض س = ${b}، فالقيمة العددية للحد ${a*b}.`]);
  if(type==='substitute')return set(2*a+2*b,['المحيط = س + ص + س + ص','المحيط = 2س + 2ص',`2 × ${a} + 2 × ${b} = ${2*a+2*b} م`],['المحيط مجموع أطوال الأضلاع الأربعة.','في متوازي الأضلاع كل ضلعين متقابلين متساويان، فنجمع الحدود المتشابهة.',`نعوّض س = ${a} و ص = ${b}، ونضرب أولًا ثم نجمع.`]);
  if(type==='likeTerms')return set(a+c,[`${T(a,'س')} + ${T(b,'ص')} + ${T(c,'س')}`,`(${T(a,'س')} + ${T(c,'س')}) + ${T(b,'ص')}`,`${T(a+c,'س')} + ${T(b,'ص')}`],['بطاقات س خضراء، وبطاقات ص ذهبية.','نضع الحدود المتشابهة معًا: كل س مع س.',`نجمع معاملات س: ${a} + ${c} = ${a+c}. ويبقى ${T(b,'ص')} كما هو لأنه غير مشابه.`]);
  return set(a*b,[`${a}(س + ${b})`,`${a} × س + ${a} × ${b}`,`${a}(س + ${b}) = ${a}س + ${a*b}`],[`مستطيل عرضه ${a} وطوله س + ${b}، فمساحته ${a}(س + ${b}).`,'نقسمه إلى مستطيلين: الأول طوله س، والثاني طوله '+b+'.',`مجموع المساحتين ${a}س + ${a*b}، وهو المساحة نفسها.`]);}
 if(type==='powerCompare'){const d=+s.d||1,va=a**b,vb=c**d,cmp=va>vb?'>':va<vb?'<':'=';Object.assign(m,{d,va,vb,cmp});const A=`${a}${SPR(b)}`,B=`${c}${SPR(d)}`,rule=a===c?'الأساسان متساويان: نقارن الأسّين.':b===d?'الأسّان متساويان: نقارن الأساسين.':'الأساسان والأسّان مختلفة: نجد قيمة كل منهما.';
  return set(cmp,[`${A}  ؟  ${B}`,`${A} = ${va}  ،  ${B} = ${vb}`,`${A} ${cmp} ${B}`],[rule,'نكتب كل عدد بالضرب المتكرر ونحسب قيمته.',a===c&&b!==d?`الأساس نفسه، فالأكبر صاحب الأس الأكبر.`:b===d&&a!==c?`الأس نفسه، فالأكبر صاحب الأساس الأكبر.`:cmp==='='?'العددان متساويان رغم اختلاف صورتهما.':`${va} ${cmp} ${vb}، إذن ${A} ${cmp} ${B}.`]);}
 if(type==='sqrtLine'||type==='cbrtLine'){const k=type==='sqrtLine'?2:3,sym=k===2?'√':'∛';let lo=Math.floor(Math.round(a**(1/k)*1e6)/1e6);if((lo+1)**k<=a)lo++;const exact=lo**k===a,hi=lo+1,near=exact?lo:(a-lo**k<=hi**k-a?lo:hi);Object.assign(m,{k,lo,hi,exact,near,sym});
  const nm=k===2?'مربع':'مكعب';return set(near,[`${sym}${a}`,exact?`${a} = ${Array(k).fill(lo).join(' × ')}`:`${lo**k} < ${a} < ${hi**k}`,exact?`${sym}${a} = ${lo}`:`${sym}${a} ≈ ${near}`],[`نبحث عن عدد إذا ${k===2?'ضُرب في نفسه':'ضُرب في نفسه مرتين'} أعطى ${a}.`,exact?`${a} ${nm} كامل.`:`${a} ليس ${nm}ًا كاملًا، فنحصره بين ${lo**k} و ${hi**k}.`,exact?`الجذر هو ${lo}.`:`${a} أقرب إلى ${near**k}، فنختار ${near}.`]);}
 if(type==='unitMix'){const p=a*a,r=b,q=c,v=p+r*q;return set(v,[`${a}² + √${b*b} × ∛${c**3}`,`${p} + ${r} × ${q}`,`${p} + ${r*q} = ${v}`],['نحسب القوى والجذور أولًا.',`${a}² = ${p} ، √${b*b} = ${r} ، ∛${c**3} = ${q}`,'ثم الضرب قبل الجمع.']);}
 if(type==='power'){const sp=n=>String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join(''),v=a**b,run=[];for(let k=1;k<=b;k++)run.push(a**k);m.run=run;return set(v,[`${a}${sp(b)}`,Array(b).fill(a).join(' × '),`${a}${sp(b)} = ${Array(b).fill(a).join(' × ')} = ${v}`],[`الأساس ${a} هو العدد المكرَّر، والأس ${b} هو عدد مرات تكراره.`,`نضرب ${a} في نفسه ${b===1?'مرة واحدة فقط':b+' مرات'}، ويكبر الناتج مع كل عامل.`,`إذن ${a} أس ${b} يساوي ${v}، وليس ${a} × ${b} = ${a*b}.`]);}
 if(type==='order')return set(a+b*c,[`${a} + ${b} × ${c}`,`${a} + ${b*c}`,`${a} + ${b} × ${c} = ${a+b*c}`],['نقرأ التعبير قبل الحساب.','الضرب قبل الجمع: نحسب حاصل الضرب أولًا.','نضيف العدد الأول بعد إتمام الضرب.']);
 if(type==='terms')return set(a+b,[`${a}س + ${b}س`,`${a+b} حدود من س`,`${a}س + ${b}س = ${a+b}س`],['المجموعتان من النوع نفسه: س.','نجمع عدد الحدود المتشابهة.','المتغيّر نفسه لا يتغيّر إلى س² عند الجمع.']);
 if(['distribute','factor','divide'].includes(type))return set(a*b,type==='divide'?[`${a*b}س ÷ ${a}`,`${a*b} حدود في ${a} مجموعات`,`${a*b}س ÷ ${a} = ${b}س`]:type==='factor'?[`${a}س + ${a*b}`,`العامل المشترك: ${a}`,`${a}س + ${a*b} = ${a}(س + ${b})`]:[`${a}(س + ${b})`,`${a} × س  ،  ${a} × ${b}`,`${a}(س + ${b}) = ${a}س + ${a*b}`],['الشكل مقسّم إلى مجموعات متساوية.','ننظر إلى ما يتكرّر في كل مجموعة.','التوزيع والتحليل يعيدان ترتيب المقدار دون تغيير قيمته.']);
 if(type==='factorQuadratic')return set(a*b,[`س²${ct(a+b,'س')}${ct(a*b,'')}`,`الحدّان: ${a} و ${b}`,`س²${ct(a+b,'س')}${ct(a*b,'')} = (س + ${a})(س + ${b})`],['مربع س²، ومستطيلان، ووحدات صغيرة.','نرتّب القطع في مستطيل كامل.','طولا المستطيل يعطينا العاملين.']);
 if(type==='differenceSquares')return set(a*a-b*b,[`${a}² − ${b}²`,`${a*a} − ${b*b} = ${a*a-b*b}`,`${a}² − ${b}² = (${a} − ${b})(${a} + ${b})`],['نزيل مربعًا صغيرًا من الكبير.','نحرّك الجزء العلوي دون تغيير مساحته.','المساحة نفسها صارت مستطيلًا بطولي الفرق والمجموع.']);
 if(type==='balance'){m.total=a*c+b;return set(c,[`${a}س + ${b} = ${m.total}`,`${a}س = ${m.total-b}`,`س = (${m.total-b}) ÷ ${a} = ${c}`],['الطرفان متساويان، مثل ميزان متوازن.','نطرح العدد نفسه من الطرفين.','نقسم الطرفين على معامل س.']);}
 if(type==='coordinates')return set([a,b],[`(${a} ، ${b})`,`س = ${a}`,`ص = ${b}`],['نبدأ عند نقطة الأصل.','الإحداثي الأول يحرّكنا أفقيًا.','الإحداثي الثاني يحرّكنا رأسيًا.']);
 if(type==='angle')return set(a,[`${a}°`,`${a<90?'زاوية حادة':a===90?'زاوية قائمة':'زاوية منفرجة'}`,`${a}° + ${180-a}° = 180°`],['الشعاعان يحدّدان الزاوية.','نقارن قياسها بالزاوية القائمة.','الزاوية المكملة معها تصنع زاوية مستقيمة.']);
 if(['triangle','pythagoras'].includes(type)){m.h=Math.hypot(a,b);return set(m.h,[`(أ ب)² + (ب جـ)² = (أ جـ)²  ←  ${a}² + ${b}² = (أ جـ)²`,`${a*a} + ${b*b} = ${a*a+b*b}`,`أ جـ = √${a*a+b*b} ${Number.isInteger(m.h)?'=':'≈'} ${fmt(m.h)}`],['هذه علاقة خاصة بالمثلث القائم.','نجمع مساحتي مربعي الضلعين القائمين.','المجموع يساوي مساحة مربع الوتر.']);}
 if(type==='converse'){m.cos=(9+16-c*c)/24;return set(c===5,[`الأضلاع: 3 ، 4 ، ${fmt(c)}`,`3² + 4² = 25  ،  ${fmt(c)}² = ${fmt(c*c)}`,c===5?'25 = 25 ← المثلث قائم':'25 ≠ '+fmt(c*c)+' ← المثلث ليس قائمًا'],['الضلع الثالث هو الأطول في هذه الأمثلة.','نقارن مربع الأطول بمجموع مربعي الآخرين.','المساواة فقط تثبت أن المثلث قائم.']);}
 if(['similar','congruent'].includes(type)){m.scale=type==='similar'?a:1;return set(m.scale,[`3 ، 4 ، 5`,`3×${fmt(m.scale)} ، 4×${fmt(m.scale)} ، 5×${fmt(m.scale)}`,type==='similar'?`نسبة الأضلاع المتناظرة = ${fmt(m.scale)}`:'الأضلاع والزوايا المتناظرة متساوية'],['نقارن الأجزاء المتناظرة.','التكبير يحافظ على الزوايا، والدوران يحافظ على الأطوال أيضًا.','التطابق يحافظ على الحجم؛ التشابه يسمح بتكبير متناسب.']);}
 if(['area','parallelogram'].includes(type))return set(a*b,[`القاعدة ${a} ، الارتفاع ${b}`,`${a} صفوف × ${b} وحدات`,`${a} × ${b} = ${a*b} وحدة مربعة`],['نميّز طول القاعدة والارتفاع العمودي.','إعادة ترتيب القطع لا تغيّر المساحة.','مساحة المستطيل ومتوازي الأضلاع هي القاعدة في الارتفاع.']);
 if(['circle','sector','segment'].includes(type)){const theta=type==='circle'?360:b,rad=theta*pi/180;const sector=a*a*pi*theta/360,tri=a*a*Math.sin(rad)/2;m.theta=theta;m.sector=sector;m.triangleArea=tri;return set(type==='segment'?sector-tri:sector,[`نق = ${a}  ،  الزاوية = ${theta}°`,type==='circle'?`مساحة الدائرة = π × ${a}²`:`مساحة القطاع = (${theta}/360) × π × ${a}²`,type==='segment'?`مساحة القطعة ≈ ${fmt(sector)} − ${fmt(tri)} ≈ ${fmt(sector-tri)}`:`المساحة ≈ ${fmt(sector)}`],['نبدأ بنصف القطر والزاوية المركزية.','القطاع يأخذ من الدائرة نسبة زاويته إلى دورة كاملة.','القطعة الدائرية هي القطاع بعد إزالة المثلث بين نصفي القطر والوتر.']);}
 if(['prism','cylinder','cone'].includes(type)){m.base=type==='prism'?2*a:pi*a*a;const volume=m.base*b/(type==='cone'?3:1);return set(volume,[type==='prism'?`مساحة القاعدة = ${a} × 2 = ${2*a}`:`مساحة القاعدة = π × ${a}²`,type==='cone'?`حجم الأسطوانة المناظرة ≈ ${fmt(m.base*b)}`:`القاعدة × الارتفاع ${b}`,type==='prism'?`الحجم = ${fmt(volume)} وحدة مكعبة`:`الحجم ≈ ${fmt(volume)} وحدة مكعبة`],['المساحة تخصّ القاعدة، والحجم يضيف الارتفاع.','الطبقات تساعدنا تخيّل امتداد القاعدة في الارتفاع.','المخروط له ثلث حجم أسطوانة لها القاعدة والارتفاع نفسيهما.']);}
 if(['bars','stats','spread'].includes(type)){m.values=[a,b,4,6];m.sorted=m.values.slice().sort((x,y)=>x-y);m.mean=(a+b+10)/4;m.median=(m.sorted[1]+m.sorted[2])/2;m.range=m.sorted[3]-m.sorted[0];return set(type==='spread'?m.range:m.mean,[m.values.join(' ، '),type==='spread'?`المدى = ${m.sorted[3]} − ${m.sorted[0]} = ${m.range}`:m.sorted.join(' ، '),type==='spread'?`التباين = ${fmt(m.values.reduce((t,v)=>t+v*v,0)/4)} − ${fmt(m.mean)}² = ${fmt(m.values.reduce((t,v)=>t+v*v,0)/4-m.mean*m.mean)}  ،  الانحراف المعياري ≈ ${fmt(Math.sqrt(m.values.reduce((t,v)=>t+v*v,0)/4-m.mean*m.mean))}`:`الوسط = ${fmt(m.mean)}  ،  الوسيط = ${fmt(m.median)}`],['هذه بيانات مثال من أربع قيم.','نرتّب القيم أو نلاحظ ارتفاع الأعمدة.',type==='spread'?'المدى يقيس المسافة بين الطرفين، والتباين والانحراف المعياري يقيسان تباعد القيم عن الوسط.':'المدى يقيس المسافة بين الطرفين، والوسط يوزّع المجموع بالتساوي.']);}
 if(type==='pie'){m.values=[a,b,3,4];m.total=a+b+7;m.angle=a/m.total*360;return set(m.angle,[`مجموع العناصر = ${m.total}`,`نصيب الفئة الأولى = ${a}/${m.total}`,`زاوية قطاعها = (${a}/${m.total}) × 360 ≈ ${fmt(m.angle)}°`],['كل الدائرة تمثّل مجموع عناصر البيانات.','لكل فئة نصيب يتناسب مع عدد عناصرها.','نحوّل هذا النصيب إلى جزء من ثلاثمئة وستين درجة.']);}
 if(['probability','complement'].includes(type)){m.event=[1,2,3,4,5,6].filter(n=>n>a);m.chosen=type==='complement'?[1,2,3,4,5,6].filter(n=>n<=a):m.event;return set(m.chosen.length/6,[`الفضاء العيني: {1 ، 2 ، 3 ، 4 ، 5 ، 6}`,`عدد نتائج الحادث = ${m.event.length}`,type==='complement'?`ل(ح̄) = 1 − ${m.event.length}/6 = ${fraction(m.chosen.length,6)}`:`ل(ح) = ${m.chosen.length}/6 = ${fraction(m.chosen.length,6)}`],['كل نتيجة من النرد المتوازن لها الفرصة نفسها.','نعدّ النتائج التي تحقق وصف الحادث.','المتممة تضم كل النتائج التي لا تنتمي إلى الحادث.']);}
 if(['sets','union'].includes(type)){m.A=[2,4,6];m.B=[1,2,3,4,5,6].filter(n=>n>a);m.intersection=m.A.filter(n=>m.B.includes(n));m.united=[...new Set([...m.A,...m.B])].sort((x,y)=>x-y);return set(m.united.length/6,[`ح = {2 ، 4 ، 6}  ،  ك = {${m.B.join(' ، ')}}`,`التقاطع = {${m.intersection.join(' ، ')}}`,type==='sets'?`الاتحاد = {${m.united.join(' ، ')}}`:`ل(ح ∪ ك) = (${m.A.length}+${m.B.length}−${m.intersection.length})/6 = ${fraction(m.united.length,6)}`],['كل عدد يظهر في مكان واحد داخل الفضاء العيني.','منطقة التداخل هي العناصر المشتركة.','في الاتحاد نعدّ المشترَك مرة واحدة، فلا نكرره.']);}
 if(['quadratic','generalQuadratic','completeSquare'].includes(type)){m.qa=type==='generalQuadratic'?a:1;m.qb=type==='quadratic'?-(a+b):type==='completeSquare'?2*a:b;m.qc=type==='quadratic'?a*b:type==='completeSquare'?a*a-b*b:c;m.disc=m.qb*m.qb-4*m.qa*m.qc;m.roots=m.disc<0?[]:[(-m.qb-Math.sqrt(m.disc))/(2*m.qa),(-m.qb+Math.sqrt(m.disc))/(2*m.qa)];const eq=`${m.qa===1?'':m.qa}س²${ct(m.qb,'س')}${ct(m.qc,'')} = 0`;return set(m.roots,[eq,type==='quadratic'?`(س${ct(-a,'')})(س${ct(-b,'')}) = 0`:type==='completeSquare'?`(س + ${a})² = ${b*b}`:`المميّز = ${m.qb*m.qb} − 4 × ${m.qa} × (${m.qc}) = ${m.disc}`,m.roots.length?`س ${m.roots.some(r=>Math.abs(r-Math.round(r*100)/100)>1e-10)?'≈':'='} ${m.roots.map(fmt).join(' أو ')}`:'لا توجد حلول حقيقية'],['نبدأ بمعادلة تربيعية.','التحليل أو إكمال المربع أو المميّز يكشف الجذور.','الحلول هي مواضع وصول قيمة المقدار إلى الصفر.']);}
 if(['cubesDifference','cubesSum'].includes(type)){const sum=type==='cubesSum',v=sum?a*a*a+b*b*b:a*a*a-b*b*b;return set(v,[`${a}³ ${sum?'+':'−'} ${b}³`,`${a*a*a} ${sum?'+':'−'} ${b*b*b} = ${v}`,sum?`(${a}+${b})(${a*a}−${a*b}+${b*b}) = ${v}`:`(${a}−${b})(${a*a}+${a*b}+${b*b}) = ${v}`],['ننظر إلى حجمي المكعبين.','نجمع الحجمين أو نطرح الثاني من الأول.','الهوية الجبرية تعطي القيمة نفسها من حاصل ضرب عاملين.']);}
 if(type==='system'){m.x=(b-a)/2;m.y=(a+b)/2;return set([m.x,m.y],[`ص = س${ct(a,'')}  ،  ص = −س${ct(b,'')}`,`2ص = ${a+b}`,`س = ${fmt(m.x)}  ،  ص = ${fmt(m.y)}`],['كل مستقيم يمثل معادلة.','نقطة التقاطع تقع على المستقيمين معًا.','إحداثياها يحققان المعادلتين في الوقت نفسه.']);}
 if(['trig','elevation'].includes(type)){const rad=a*pi/180;m.opposite=type==='trig'?b*Math.sin(rad):b*Math.tan(rad);m.adjacent=type==='trig'?b*Math.cos(rad):b;m.h=type==='trig'?b:Math.hypot(m.opposite,b);return set(m.opposite,[`الزاوية = ${a}°`,type==='trig'?`المقابل ≈ ${fmt(m.opposite)} ، المجاور ≈ ${fmt(m.adjacent)}`:`البعد الأفقي = ${b}`,type==='trig'?`جا ≈ ${fmt(Math.sin(rad))} ، جتا ≈ ${fmt(Math.cos(rad))} ، ظا ≈ ${fmt(Math.tan(rad))}`:`الارتفاع فوق مستوى النظر ≈ ${fmt(m.opposite)}`],['نحدد الضلع المقابل والمجاور بالنسبة للزاوية.','النسب تعتمد على الزاوية، لا على حجم المثلث.','زاوية الارتفاع تربط البعد الأفقي بالارتفاع فوق مستوى النظر.']);}
 throw Error('Unknown visual engine: '+type);
}
const text=(x,y,t,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${escape(LTRM(t).replace(/(^|[\s(=\u200e])-(?=\d)/g,'$1−').replace(/(\d)\.(\d)/g,'$1,$2'))}</text>`;// علامة الطرح والفاصلة العشرية كما في الكتاب
const LTRM=t=>'\u200e'+String(t).replace(/ ([=≈<>×+−÷؟]) /g,' \u200e$1\u200e ');// علامة اتجاه تمنع انقلاب التعبير مع الأرقام العربية
const SPR=n=>String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
const rect=(x,y,w,h,cls='lv-green')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${cls}"/>`;
function scene(m,step){
 const {type,a,b,c}=m;if(EXT[type])return EXT[type].scene(m,step);let out='';
 if(type==='fractionDivide'){for(let r=0;r<2;r++){const count=r?b:a;for(let i=0;i<4;i++)out+=rect(100+i*85,65+r*110,76,64,i<count?(r?'lv-gold':'lv-green'):'lv-empty');out+=text(270,55+r*110,`${count}/4`);}out+=text(270,305,step?`طول الأول ÷ طول الثاني = ${fraction(a,b)}`:'الأجزاء في الشريطين بالحجم نفسه');return `<svg viewBox="0 0 540 340" direction="ltr" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;}
 if(type==='triangleArea'){const x=135,y=60,w=a*30,h=b*30;out+=rect(x,y,w,h,'lv-green-soft')+`<path d="M${x} ${y+h}L${x+w} ${y}V${y+h}Z" class="lv-green"/><path d="M${x} ${y+h}L${x+w} ${y}" class="lv-outline"/>`;if(step===2)out+=`<path d="M${x} ${y}h${w}L${x} ${y+h}Z" class="lv-empty"/>`;out+=text(x+w/2,y+h+30,'القاعدة '+a)+text(x-38,y+h/2,'ع '+b)+text(270,308,'نصف المساحة = '+fmt(a*b/2));return `<svg viewBox="0 0 540 340" direction="ltr" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;}
 const numberline=(points,extent=12)=>{const X=n=>270+n*220/extent;let s='<line x1="40" y1="177" x2="500" y2="177" class="lv-axis"/>';for(let n=-extent;n<=extent;n+=Math.max(1,Math.ceil(extent/6)))s+=`<line x1="${X(n)}" y1="170" x2="${X(n)}" y2="184" class="lv-axis"/>`+text(X(n),211,n);points.forEach(([n,label,color],i)=>{s+=`<circle cx="${X(n)}" cy="177" r="10" class="${color}"/>`+text(X(n),130-i*28,label,color);});return{s,X};};
 if(type==='fractionSubtract'){const line=numberline([[a/6,a+'/6','lv-green'],[step?(a-b)/6:a/6,step?fraction(a-b,6):a+'/6','lv-gold']],1);out=line.s;for(let i=0;i<=12;i++)out+=`<line x1="${line.X(-1+i/6)}" y1="173" x2="${line.X(-1+i/6)}" y2="181" class="lv-axis"/>`;if(step)out+=`<path d="M${line.X(a/6)} 160Q${(line.X(a/6)+line.X((a-b)/6))/2} 55 ${line.X((a-b)/6)} 160" class="lv-travel"/>`;out+=text(270,280,'كل علامة صغيرة تمثّل سدسًا');}
 else if(['integer','absolute','compare','irrational'].includes(type)){
   const end=type==='integer'?a+b:type==='absolute'?0:type==='compare'?m.right:m.root,start=type==='compare'?m.left:type==='irrational'?m.low:a,extent=type==='irrational'?5:12;
   const line=numberline([[start,type==='compare'?a+'/2':fmt(start),'lv-green'],[step?end:start,type==='compare'?b+'/3':fmt(step?end:start),'lv-gold']],extent);out=line.s;
   if(step)out+=`<path d="M${line.X(start)} 163 Q${(line.X(start)+line.X(end))/2} 50 ${line.X(end)} 163" class="lv-travel"/>`;
   if(type==='irrational')out+=text(270,275,'الموقع على الخط تقريب إلى منزلتين عشريتين','lv-label');
 }
 else if(['fraction','fractionAdd','fractionMultiply','decimal','percent'].includes(type)){
   if(['decimal','percent'].includes(type)){for(let i=0;i<100;i++)out+=rect(126+(i%10)*27,32+Math.floor(i/10)*27,22,22,i<a?'lv-green':'lv-empty');}
   else if(type==='fractionMultiply'){for(let r=0;r<4;r++)for(let col=0;col<4;col++)out+=rect(152+col*58,40+r*58,50,50,r<b&&col<a?'lv-green':r<b?'lv-gold-soft':col<a?'lv-green-soft':'lv-empty');out+=text(270,300,'التداخل هو '+a*b+' من 16 خانة');}
   else {const n=type==='fraction'?b:6,count=type==='fraction'?m.count:a+b,rows=type==='fractionAdd'?2:1;for(let r=0;r<rows;r++){for(let i=0;i<n;i++){let fill=type==='fraction'?(i<count?'lv-green':'lv-empty'):step===0?(i<(r?b:a)?r?'lv-gold':'lv-green':'lv-empty'):(r*n+i<count?'lv-green':'lv-empty');out+=rect(70+i*(400/n),105+r*80,400/n-7,56,fill);}out+=text(270,96+r*80,type==='fraction'?`${count}/${n}`:step===0?`${r?b:a}/6`:r===0?'نجمع الأجزاء المتساوية':'كلّ إضافي إذا احتجنا إليه');}}
 }
 else if(['powers','root','cubeRoot','factorQuadratic','completeSquare'].includes(type)){
   if(['powers','root','cubeRoot'].includes(type)){const size=170/a;for(let y=0;y<a;y++)for(let x=0;x<a;x++)out+=rect(165+x*size,70+y*size,size-3,size-3,'lv-green');if(type==='cubeRoot'){out+=`<path d="M165 70l60-35h170l-60 35M335 70l60-35v170l-60 35" class="lv-outline"/>`;for(let i=1;i<a;i++)out+=`<path d="M${165+i*170/a} 70l60-35M335 ${70+i*170/a}l60-35" class="lv-outline lv-faint"/>`;out+=text(270,295,`${a} × ${a} × ${a} = ${a*a*a}`);}else out+=text(250,278,`${a} × ${a} = ${a*a}`);}
   else {const y=60,x=130,v=115,k=18,p=a,q=type==='factorQuadratic'?b:a;out+=rect(x,y,v,v,'lv-green')+text(x+v/2,y+v/2+7,'س²','lv-ink');out+=rect(x+v+4,y,p*k,v,'lv-gold-soft')+text(x+v+p*k/2,y+v/2,`${p}س`);out+=rect(x,y+v+4,v,q*k,'lv-gold-soft')+text(x+v/2,y+v+q*k/2+9,`${q}س`);out+=rect(x+v+4,y+v+4,p*k,q*k,type==='completeSquare'&&step===0?'lv-empty':'lv-gold')+text(x+v+p*k/2+4,y+v+q*k/2+9,p*q);out+=text(270,310,type==='completeSquare'?'نضيف المربع الناقص إلى الطرفين':'الضلعان: (س + '+p+') و(س + '+q+')');}
 }
 else if(['terms','distribute','factor','divide','radicals'].includes(type)){
   if(type==='terms'||type==='radicals'){const n=a+b,w=Math.min(54,410/n);for(let i=0;i<n;i++)out+=rect(60+i*w,120,w-5,80,step===2||i<a?'lv-green':'lv-gold')+text(60+i*w+(w-5)/2,164,type==='terms'?'س':'√2');out+=text(270,245,`المجموع ${n} أجزاء متشابهة`);}
   else {for(let r=0;r<a;r++){out+=rect(120,40+r*48,125,39,'lv-green')+text(182,67+r*48,type==='divide'?`${b}س`:'س');for(let i=0;i<b&&type!=='divide';i++)out+=rect(251+i*35,40+r*48,29,39,'lv-gold')+text(265+i*35,67+r*48,'1');}out+=text(270,310,type==='divide'?`كل مجموعة فيها ${b}س`:`${a} صفوف من (س + ${b})`);}
 }
 else if(type==='differenceSquares'){
   const k=25,x=85,y=42;out+=rect(x,y+b*k,a*k,(a-b)*k,'lv-green');out+=`<g class="lv-rearrange" style="transform:translate(${step?x+(a+b)*k:x}px,${step?y+b*k:y}px) rotate(${step?90:0}deg)">${rect(0,0,(a-b)*k,b*k,'lv-gold')}</g>`;if(!step)out+=rect(x+(a-b)*k,y,b*k,b*k,'lv-empty')+text(x+(a-b/2)*k,y+b*k/2,b+'²');out+=text(270,305,`${a*a-b*b} وحدة مربعة قبل التحريك وبعده`);
 }
 else if(type==='balance'){
   out+='<path d="M270 64v190M231 260h78M100 87h340M155 87l-43 105h86ZM385 87l-43 105h86Z" class="lv-outline"/><path d="M100 192h110q-12 38-55 38t-55-38ZM330 192h110q-12 38-55 38t-55-38Z" class="lv-green-soft"/>';
   const blocks=step===2?1:a,units=step===2?c:step===1?a*c:m.total;
   for(let i=0;i<blocks;i++)out+=rect(111+i*23,140,19,30,'lv-green')+text(121+i*23,162,'س');if(step===0)out+=text(155,125,`+ ${b}`,'lv-gold');out+=text(385,166,units,'lv-ink');out+=text(270,308,step===0?'متساويان':step===1?`طرحنا ${b} من الطرفين`:`قسمنا الطرفين على ${a}`);
 }
 else if(type==='power'){
   const sp=n=>String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
   if(step===0){out+=rect(205,100,90,95,'lv-green-soft')+rect(270,80,40,45,'lv-gold-soft');out+=text(250,166,a,'lv-big')+text(290,113,b,'lv-big');out+=text(250,225,'الأساس','lv-label')+text(345,105,'الأس','lv-label');out+=text(270,290,`${a}${sp(b)}: نكرّر ${a} عاملًا ${b===1?'مرة واحدة':b+' مرات'}`,'lv-label');}
   else{const w=Math.min(78,460/b),x0=270-(b*w)/2;for(let k=0;k<b;k++){const x=x0+k*w;out+=rect(x+4,95,w-8,70,step===2&&k===b-1?'lv-gold':'lv-green-soft')+text(x+w/2,140,a,'lv-big');if(k<b-1)out+=text(x+w,140,'×');out+=text(x+w/2,195,m.run[k],'lv-label');}
    out+=text(270,235,'الناتج بعد كل عامل','lv-label');if(step===2)out+=text(270,290,`${a}${sp(b)} = ${m.result}`,'lv-big');else out+=text(270,290,`${b} ${b===1?'عامل':b<=10&&b>2?'عوامل':'عاملان'} كلّ منها ${a}`,'lv-label');}
 }
 else if(type==='triKind'){
   const R=x=>x*pi/180,{A,B,C}=m,sn=Math.sin(R(A+B)),h0=Math.sin(R(A))*Math.sin(R(B))/sn;let L=300;if(L*h0>210)L=210/h0;const x0=270-L/2,y0=260,ax=x0+L*Math.sin(R(B))*Math.cos(R(A))/sn,ay=y0-L*h0,gx=(x0+x0+L+ax)/3,gy=(y0+y0+ay)/3,at=(x,y,f=.32)=>[x+(gx-x)*f,y+(gy-y)*f+6];
   out+=`<polygon points="${x0},${y0} ${x0+L},${y0} ${ax},${ay}" class="${step===2?'lv-green':'lv-green-soft'}"/>`+`<path d="M${x0} ${y0}H${x0+L}" class="lv-outline"/>`;
   out+=text(x0-16,y0+26,'ب')+text(x0+L+16,y0+26,'جـ')+text(ax,ay-14,'أ');
   const [p1,q1]=at(x0,y0),[p2,q2]=at(x0+L,y0),[p3,q3]=at(ax,ay,.38);out+=text(p1,q1,A+'°','lv-label')+text(p2,q2,B+'°','lv-label')+text(p3,q3,step?C+'°':'؟','lv-label');
   out+=text(270,y0+58,step===2?'مثلث '+m.kind:step===1?`${A}° + ${B}° + ${C}° = 180°`:'القاعدة ب جـ والزاويتان عند طرفيها','lv-label');
 }
 else if(type==='triSides'){
   const [s0,s1,s2]=m.q,k=Math.min(34,330/s2),x0=270-s2*k/2,x1=270+s2*k/2,y0=250;const arc=(cx,r,t0,t1)=>`<path d="M${cx+r*Math.cos(t0)} ${y0-r*Math.sin(t0)}A${r} ${r} 0 0 0 ${cx+r*Math.cos(t1)} ${y0-r*Math.sin(t1)}" class="lv-outline lv-dashed"/>`;out+=`<path d="M${x0} ${y0}H${x1}" class="lv-travel"/>`+text(270,y0+30,s2,'lv-label');
   if(m.ok){const px=(s2*s2+s1*s1-s0*s0)/(2*s2),py=Math.sqrt(Math.max(0,s1*s1-px*px)),ax=x0+px*k,ay=y0-py*k;
     if(step>=1){const t1=Math.atan2(y0-ay,ax-x0),t2=Math.atan2(y0-ay,ax-x1);out+=arc(x0,s1*k,t1-.3,t1+.3)+arc(x1,s0*k,t2-.3,t2+.3)}
     if(step===2)out+=`<polygon points="${x0},${y0} ${x1},${y0} ${ax},${ay}" class="lv-green-soft"/>`;
     out+=`<path d="M${x0} ${y0}L${ax} ${ay}L${x1} ${y0}" class="lv-outline${step===2?'':' lv-dashed'}"/>`+text((x0+ax)/2-18,(y0+ay)/2,s1,'lv-label')+text((x1+ax)/2+18,(y0+ay)/2,s0,'lv-label');}
   else{out+=`<path d="M${x0} ${y0-14}h${s1*k}" class="lv-travel lv-gold-line"/><path d="M${x1} ${y0-34}h${-s0*k}" class="lv-travel lv-gold-line"/>`+text(x0+s1*k/2,y0-24,s1,'lv-label')+text(x1-s0*k/2,y0-46,s0,'lv-label');
     if(step>=1)out+=arc(x0,s1*k,0,pi/2)+arc(x1,s0*k,pi/2,pi)+text(270,y0-Math.max(s0,s1)*k-24,'القوسان لا يتقاطعان','lv-label');}
   out+=text(270,y0+64,step===2?(m.ok?'مثلث '+m.kind:'لا يتكوّن مثلث'):step===1?`${s0} + ${s1} = ${m.sum} ${m.sg} ${s2}`:'نرسم الضلع الأطول أولًا','lv-label');
 }
 else if(type==='isoAltitude'){
   const k=Math.min(340/a,210/m.h),hw=a*k/2,y0=255,ay=y0-m.h*k;out+=`<polygon points="${270-hw},${y0} ${270+hw},${y0} 270,${ay}" class="lv-green-soft"/>`;
   out+=`<path d="M270 ${ay}V${y0}" class="lv-travel lv-gold-line"/><path d="M270 ${y0-14}h14v14" class="lv-outline"/>`+text(270,ay-14,'أ')+text(270-hw-14,y0+24,'ب')+text(270+hw+16,y0+24,'جـ')+text(270,y0+26,'د');
   if(step>=1)out+=text(270-hw/2,y0+26,fmt(m.half),'lv-label')+text(270+hw/2,y0+26,fmt(m.half),'lv-label');
   if(step===2)out+=text(252,ay+46,'∠1','lv-label')+text(290,ay+46,'∠2','lv-label')+text(270,y0+62,`∠1 = ∠2 = ${fmt(b/2)}°`,'lv-label');else out+=text(270,y0+62,step?'العمود ينصّف القاعدة':`زاوية الرأس ${b}°`,'lv-label');
 }
 else if(type==='trapezoid'){
   const k=40,yb=250,yt=130,bl=270-b*k/2,br=270+b*k/2,tl=270-a*k/2+c*k,tr=tl+a*k;out+=`<polygon points="${bl},${yb} ${br},${yb} ${tr},${yt} ${tl},${yt}" class="lv-green-soft"/>`;
   if(step===2)out+=`<path d="M${Math.min(bl,tl)-70} ${yt}H${Math.max(br,tr)+70}M${Math.min(bl,tl)-70} ${yb}H${Math.max(br,tr)+70}" class="lv-outline lv-dashed"/>`;
   if(step>=1&&!m.par){const den=(bl-tl)-(br-tr),s=den?(bl-br)/den:0,iy=yb+(yt-yb)*s,jx=bl+(tl-bl)*s;if(Math.abs(iy-190)<260)out+=`<path d="M${bl} ${yb}L${jx} ${iy}L${br} ${yb}" class="lv-outline lv-dashed"/><circle cx="${jx}" cy="${iy}" r="6" class="lv-gold"/>`;}
   out+=`<path d="M${tl} ${yt}H${tr}M${bl} ${yb}H${br}" class="lv-travel"/><path d="M${tl} ${yt}L${bl} ${yb}M${tr} ${yt}L${br} ${yb}" class="lv-travel lv-gold-line"/>`;
   out+=text(tl-16,yt-8,'أ')+text(tr+16,yt-8,'د')+text(bl-16,yb+24,'ب')+text(br+16,yb+24,'جـ')+text((tl+tr)/2,yt-12,'قاعدة','lv-label')+text(270,yb+28,'قاعدة','lv-label')+text((tl+bl)/2-34,(yt+yb)/2,'ساق','lv-label')+text((tr+br)/2+34,(yt+yb)/2,'ساق','lv-label');
   out+=text(270,yb+64,step===2?'القاعدتان لا تلتقيان مهما امتدّتا':step===1?(m.par?'الساقان متوازيان أيضًا':'الساقان يلتقيان إذا امتدّا'):'القاعدتان بالأخضر، والساقان بالذهبي','lv-label');
 }
 else if(type==='trapIso'||type==='trapRight'){
   const k=40,yb=250,h=2.6*k,R=x=>x*pi/180;let P;const iso=type==='trapIso';
   if(iso){const sh=h/Math.tan(R(a)),W=9*k;P=[[270-W/2,yb],[270-W/2+sh,yb-h],[270+W/2-sh,yb-h],[270+W/2,yb]]}else{const sh=h/Math.tan(R(a)),W=7*k;P=[[270-W/2,yb],[270-W/2,yb-h],[270+W/2-sh,yb-h],[270+W/2,yb]]}
   const names=['أ','ب','جـ','د'],ang=iso?[a,180-a,180-a,a]:[90,90,180-a,a],show=iso?[[0],[0,3],[0,1,2,3]][step]:[[0,1,3],[0,1,3],[0,1,2,3]][step];
   out+=`<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="lv-green-soft"/>`;const gx=270,gy=yb-h/2;
   P.forEach(([x,y],i)=>{out+=text(x+(x<gx?-16:16),y+(y>gy?24:-10),names[i]);const lx=x+(gx-x)*.22,ly=y+(gy-y)*.5+6;out+=text(lx,ly,show.includes(i)?ang[i]+'°':'؟','lv-label');});
   if(!iso)out+=`<path d="M${P[0][0]} ${yb-14}h14v14M${P[1][0]} ${yb-h+14}h14v-14" class="lv-outline"/>`;
   out+=text(270,yb+56,step===2?'المجموع = 360°':step===1?(iso?'زاويتا القاعدة الواحدة متساويتان':'نجمع الزوايا المعلومة'):(iso?'الساقان متساويان':'الساق أ ب عمودية على القاعدتين'),'lv-label');
 }
 else if(type==='paraProps'){
   const k=Math.min(44,330/(a+b*Math.cos(c*pi/180))),r=c*pi/180,ux=b*k*Math.cos(r),uy=b*k*Math.sin(r),x0=270-(a*k+ux)/2,y0=250,B=[x0,y0],C=[x0+a*k,y0],A=[x0+ux,y0-uy],Dd=[x0+a*k+ux,y0-uy],M=[(A[0]+C[0])/2,(A[1]+C[1])/2];
   out+=`<polygon points="${[A,B,C,Dd].map(p=>p.join(',')).join(' ')}" class="lv-green-soft"/>`;
   out+=`<path d="M${B[0]} ${B[1]}L${C[0]} ${C[1]}M${A[0]} ${A[1]}L${Dd[0]} ${Dd[1]}" class="lv-travel"/><path d="M${A[0]} ${A[1]}L${B[0]} ${B[1]}M${Dd[0]} ${Dd[1]}L${C[0]} ${C[1]}" class="lv-travel lv-gold-line"/>`;
   out+=text(A[0]-14,A[1]-10,'أ')+text(B[0]-16,B[1]+24,'ب')+text(C[0]+16,C[1]+24,'جـ')+text(Dd[0]+16,Dd[1]-10,'د');
   out+=text((B[0]+C[0])/2,y0+26,a,'lv-label')+text((A[0]+Dd[0])/2,A[1]-12,a,'lv-label')+text((A[0]+B[0])/2-20,(A[1]+B[1])/2,b,'lv-label')+text((Dd[0]+C[0])/2+20,(Dd[1]+C[1])/2,b,'lv-label');
   if(step>=1){const inA=(P,f=.28)=>[P[0]+(M[0]-P[0])*f,P[1]+(M[1]-P[1])*f+6];[[B,c],[Dd,c],[A,180-c],[C,180-c]].forEach(([P,v])=>{const [x,y]=inA(P);out+=text(x,y,v+'°','lv-label')})}
   if(step===2)out+=`<path d="M${A[0]} ${A[1]}L${C[0]} ${C[1]}M${B[0]} ${B[1]}L${Dd[0]} ${Dd[1]}" class="lv-outline lv-dashed"/><circle cx="${M[0]}" cy="${M[1]}" r="6" class="lv-gold"/>`+text(M[0],M[1]-14,'م');
   out+=text(270,y0+62,step===2?'هذا الشكل: '+m.shape:step===1?'الزوايا المتقابلة متساوية':'الأضلاع المتقابلة متساوية','lv-label');
 }
 else if(['termParts','substitute','likeTerms','areaDistribute'].includes(type)){const T=m.T,tr=(x,y,t,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle" style="direction:rtl;unicode-bidi:embed">${escape(t)}</text>`;
  if(type==='termParts'){
   if(step===0){out+=rect(282,90,96,96,'lv-gold')+rect(170,90,96,96,'lv-green')+tr(330,152,a===1?'1':a,'lv-big')+tr(218,152,'س','lv-big')+tr(330,214,'المعامل','lv-label')+tr(218,214,'المتغير','lv-label');if(a===1)out+=tr(270,250,'نكتب الحد س، والمعامل 1 لا يظهر','lv-label');}
   else{const w=Math.min(76,420/a),x0=270+a*w/2;for(let i=0;i<a;i++){const x=x0-(i+1)*w;out+=rect(x,110,w-8,70,'lv-green')+tr(x+(w-8)/2,152,step===2?String(b):'س')}
    out+=tr(270,225,step===2?`${a} × ${b} = ${a*b}`:`${T(a,'س')} = ${a===1?'س':Array(a).fill('س').join(' + ')}`,'lv-label');}
  }
  else if(type==='substitute'){const k=Math.min(26,300/(a+3)),ux=b*k*.5,uy=b*k*.85,x0=270-(a*k+ux)/2,y0=250,B=[x0,y0],C=[x0+a*k,y0],A=[x0+ux,y0-uy],D=[x0+a*k+ux,y0-uy];
   out+=`<polygon points="${[A,B,C,D].map(p=>p.join(',')).join(' ')}" class="lv-green-soft"/><path d="M${B[0]} ${B[1]}L${C[0]} ${C[1]}M${A[0]} ${A[1]}L${D[0]} ${D[1]}" class="lv-travel"/><path d="M${A[0]} ${A[1]}L${B[0]} ${B[1]}M${D[0]} ${D[1]}L${C[0]} ${C[1]}" class="lv-travel lv-gold-line"/>`;
   const L1=step===2?a+' م':'س',L2=step===2?b+' م':'ص';out+=tr((B[0]+C[0])/2,y0+26,L1,'lv-label')+tr((A[0]+D[0])/2,A[1]-12,L1,'lv-label')+tr((A[0]+B[0])/2-24,(A[1]+B[1])/2,L2,'lv-label')+tr((D[0]+C[0])/2+24,(D[1]+C[1])/2,L2,'lv-label');
   out+=tr(270,y0+62,step===2?`المحيط = ${2*a+2*b} م`:step===1?'المحيط = 2س + 2ص':'المحيط = س + ص + س + ص','lv-label');
  }
  else if(type==='likeTerms'){const n=a+b+c,w=Math.min(56,440/n),x0=270+n*w/2;const seq=step===0?[...Array(a).fill('س'),...Array(b).fill('ص'),...Array(c).fill('س')]:[...Array(a+c).fill('س'),...Array(b).fill('ص')];
   seq.forEach((v,i)=>{const gap=step>0&&i>=a+c?14:0,x=x0-(i+1)*w-gap+7;out+=rect(x,120,w-6,64,v==='س'?'lv-green':'lv-gold')+tr(x+(w-6)/2,160,v)});
   if(step>0){const xs=x0-(a+c)*w+7;out+=`<path d="M${xs} 198H${x0+1}" class="lv-outline"/>`+tr((xs+x0)/2,222,step===2?T(a+c,'س'):'حدود س معًا','lv-label');const xe=x0-n*w-14+7;out+=`<path d="M${xe} 198H${xs-14}" class="lv-outline lv-gold-line"/>`+tr((xe+xs-14)/2,222,T(b,'ص'),'lv-label')}
   out+=tr(270,272,step===2?`${T(a+c,'س')} + ${T(b,'ص')}`:step===1?'نرتّب: كل س مع س':`${T(a,'س')} + ${T(b,'ص')} + ${T(c,'س')}`,'lv-label');
  }
  else{const k=26,H=a*k,Wx=170,Wb=b*k,xR=270+(Wx+Wb)/2,yT=80;
   out+=rect(xR-Wx,yT,Wx,H,'lv-green')+rect(xR-Wx-Wb,yT,Wb,H,'lv-gold');if(step===0)out+=`<rect x="${xR-Wx-Wb}" y="${yT}" width="${Wx+Wb}" height="${H}" class="lv-outline" fill="none"/>`;else out+=`<path d="M${xR-Wx} ${yT-6}V${yT+H+6}" class="lv-outline lv-dashed"/>`;
   out+=tr(xR-Wx/2,yT-12,'س','lv-label')+tr(xR-Wx-Wb/2,yT-12,String(b),'lv-label')+tr(xR+18,yT+H/2+6,String(a),'lv-label');
   if(step>=1)out+=tr(xR-Wx/2,yT+H/2+6,`${a}س`,'lv-big')+tr(xR-Wx-Wb/2,yT+H/2+6,String(a*b),'lv-big');
   out+=tr(270,yT+H+48,step===2?`${a}س + ${a*b}`:step===1?`${a} × س  و  ${a} × ${b}`:`${a}(س + ${b})`,'lv-label');}
 }
 else if(type==='powerCompare'){
   const A=`${a}${SPR(b)}`,B=`${c}${SPR(m.d)}`;
   out+=rect(60,70,170,80,'lv-green-soft')+rect(310,70,170,80,'lv-gold-soft')+text(145,122,A,'lv-big')+text(395,122,B,'lv-big')+text(270,122,step===2?m.cmp:'؟','lv-big');
   out+=text(145,175,`الأساس ${a} ، الأس ${b}`,'lv-label')+text(395,175,`الأساس ${c} ، الأس ${m.d}`,'lv-label');
   if(step>=1){const mx=Math.max(m.va,m.vb),wa=Math.max(6,400*m.va/mx),wb=Math.max(6,400*m.vb/mx);out+=rect(70,205,wa,26,'lv-green')+rect(70,250,wb,26,'lv-gold');out+=text(70+wa+40,224,m.va)+text(70+wb+40,269,m.vb);}
   out+=text(270,315,step===0?(a===c?'الأساسان متساويان':b===m.d?'الأسّان متساويان':'نحسب قيمة كل عدد'):step===1?'طول كل شريط يمثّل قيمة العدد':`${A} ${m.cmp} ${B}`,'lv-label');
 }
 else if(type==='sqrtLine'||type==='cbrtLine'){
   const k=m.k,lo=m.lo,hi=m.hi,L=lo**k,H=hi**k,X=x=>80+380*(x-L)/(H-L||1);
   out+=`<line x1="60" y1="170" x2="480" y2="170" class="lv-axis"/>`;
   for(const [v,lab] of [[L,`${lo}${k===2?'²':'³'} = ${L}`],[H,`${hi}${k===2?'²':'³'} = ${H}`]]){out+=`<line x1="${X(v)}" y1="155" x2="${X(v)}" y2="185" class="lv-axis"/>`+text(X(v),215,lab,'lv-label')}
   out+=text(270,80,`${m.sym}${a}`,'lv-big');
   if(step>=1){out+=`<circle cx="${X(a)}" cy="170" r="10" class="lv-gold"/>`+text(X(a),140,a);if(!m.exact){out+=text((X(L)+X(a))/2,255,a-L,'lv-label')+text((X(a)+X(H))/2,255,H-a,'lv-label')}}
   out+=text(270,300,step===2?(m.exact?`${m.sym}${a} = ${lo}`:`${m.sym}${a} ≈ ${m.near}`):step===1?(m.exact?`${a} ${k===2?'مربع':'مكعب'} كامل`:'المسافة إلى كل طرف'):`بين أيّ ${k===2?'مربعين':'مكعبين'} كاملين يقع ${a}؟`,step===2?'lv-big':'lv-label');
 }
 else if(type==='unitMix'){
   const p=a*a,cells=[[`${a}²`,p,'القوة'],[`√${b*b}`,b,'الجذر التربيعي'],[`∛${c**3}`,c,'الجذر التكعيبي']];
   cells.forEach(([e,v,lab],i)=>{const x=40+i*165;out+=rect(x,80,130,80,step?'lv-green-soft':'lv-gold-soft')+text(x+65,130,step?v:e,'lv-big')+text(x+65,185,lab,'lv-label')});
   out+=text(197,130,'+','lv-big')+text(362,130,'×','lv-big');
   out+=text(270,260,step===0?`${a}² + √${b*b} × ∛${c**3}`:step===1?`${p} + ${b} × ${c}`:`${p} + ${b*c} = ${m.result}`,'lv-big');
   out+=text(270,305,step===0?'نحسب القوى والجذور أولًا':step===1?'ثم الضرب قبل الجمع':'الناتج النهائي','lv-label');
 }
 else if(type==='order'){
   out+=rect(60,90,110,95,'lv-green-soft')+rect(200,90,280,95,step?'lv-gold':'lv-gold-soft');out+=text(115,148,a,'lv-big')+text(185,148,'+','lv-big')+text(340,148,step?`${b} × ${c} = ${b*c}`:`${b} × ${c}`,'lv-big');
   out+=text(115,215,'العدد الأول','lv-label')+text(340,215,step?`حاصل الضرب ${b*c} يُحسب أولًا`:'عملية الضرب','lv-label');
   out+=text(270,275,step===2?`${a} + ${b*c} = ${m.result}`:step===1?`يصبح التمرين: ${a} + ${b*c}`:'أيّ عملية نبدأ بها؟',step===2?'lv-big':'');
 }
 else if(['coordinates','system','quadratic','generalQuadratic'].includes(type)){
   const X=x=>270+x*26,Y=y=>200-y*20;out+='<defs><clipPath id="lv-graph-clip"><rect x="55" y="20" width="435" height="290"/></clipPath></defs>';
   for(let i=-8;i<=8;i++){out+=`<line x1="${X(i)}" y1="20" x2="${X(i)}" y2="310" class="lv-grid"/>`;if(i%2===0)out+=text(X(i),222,i);}for(let i=-5;i<=9;i++)out+=`<line x1="55" y1="${Y(i)}" x2="490" y2="${Y(i)}" class="lv-grid"/>`;out+=`<path d="M55 200h435M270 20v290" class="lv-axis"/>`+text(502,197,'س')+text(274,17,'ص');
   if(type==='coordinates')out+=`<path d="M270 200h${a*26}${step?'v'+(-b*20):''}" class="lv-travel"/><circle cx="${X(a)}" cy="${Y(step?b:0)}" r="8" class="lv-green"/>`+text(X(a)+25,Y(b)-18,`(${a}،${b})`);
   else if(type==='system'){out+=`<g clip-path="url(#lv-graph-clip)"><path d="M${X(-8)} ${Y(-8+a)}L${X(8)} ${Y(8+a)}" class="lv-travel"/><path d="M${X(-8)} ${Y(8+b)}L${X(8)} ${Y(-8+b)}" class="lv-travel lv-gold-line"/></g><circle cx="${X(m.x)}" cy="${Y(m.y)}" r="8" class="lv-gold"/>`+text(X(m.x)+35,Y(m.y)-20,`(${fmt(m.x)}،${fmt(m.y)})`);}
   else {let d='';for(let i=0;i<=160;i++){const xx=-8+i/10,yy=m.qa*xx*xx+m.qb*xx+m.qc;d+=(i?'L':'M')+X(xx)+' '+Y(yy)+' ';}out+=`<path clip-path="url(#lv-graph-clip)" d="${d}" class="lv-travel"/>`;if(step)for(const root of m.roots)out+=`<circle cx="${X(root)}" cy="200" r="8" class="lv-gold"/>`+text(X(root),253,fmt(root));}
 }
 else if(type==='angle'){
   const r=140,rad=a*pi/180,cx=230,cy=220;out+=`<path d="M${cx+r} ${cy}H${cx}L${cx+r*Math.cos(rad)} ${cy-r*Math.sin(rad)}" class="lv-travel"/><path d="M${cx} ${cy}h55A55 55 0 0 0 ${cx+55*Math.cos(rad)} ${cy-55*Math.sin(rad)}Z" class="lv-gold-soft"/>`+text(cx+78*Math.cos(rad/2),cy-78*Math.sin(rad/2),a+'°');if(step===2)out+=`<path d="M70 220H230" class="lv-axis"/>`+text(145,255,(180-a)+'°');
 }
 else if(['triangle','pythagoras','converse','trig','elevation'].includes(type)){
   let A=a,B=b;if(type==='converse'){const co=m.cos,si=Math.sqrt(1-co*co);out+=`<path d="M115 255h120L${115+160*co} ${255-160*si}Z" class="lv-green-soft"/>`+text(175,282,3)+text(93+80*co,250-80*si,4)+text(205+80*co,225-80*si,fmt(c));}
   else if(type==='pythagoras'){const k=14,x=155,y=200,ax=A*k,by=B*k;out+=rect(x,y,ax,ax,step===1?'lv-gold':'lv-gold-soft')+text(x+ax/2,y+ax/2+7,A*A);out+=rect(x+ax,y-by,by,by,'lv-green')+text(x+ax+by/2,y-by/2+7,B*B);out+=`<polygon points="${x},${y} ${x+ax},${y-by} ${x+ax-by},${y-by-ax} ${x-by},${y-ax}" class="lv-blue-soft"/>`+text(x+(ax-by)/2,y-(by+ax)/2,A*A+B*B)+`<path d="M${x} ${y}h${ax}v${-by}Z" class="lv-outline"/>`;}
   else {if(type==='trig'||type==='elevation'){A=m.adjacent;B=m.opposite;}const k=Math.min(30,260/A,190/B),x=110,y=266;out+=`<path d="M${x} ${y}h${A*k}v${-B*k}Z" class="lv-green-soft"/><path d="M${x+A*k-14} ${y}v-14h14" class="lv-outline"/>`+text(x+A*k/2,y+25,fmt(A))+text(x+A*k+25,y-B*k/2,fmt(B))+text(x+A*k/2-20,y-B*k/2-17,fmt(m.h));if(type!=='triangle')out+=text(x+50,y-12,a+'°');if(type==='elevation')out+=text(270,315,'الارتفاع محسوب فوق مستوى النظر');}
 }
 else if(['similar','congruent'].includes(type)){
   const triangle=(x,k,rotation)=>`<g style="transform:rotate(${rotation}deg);transform-origin:${x+30*k}px ${220-32*k}px"><path d="M${x} 220h${48*k}v${-64*k}Z" class="lv-green-soft"/></g>`;
   out+=triangle(100,1,0)+triangle(290,m.scale,type==='congruent'?a:0)+text(130,263,'3 ، 4 ، 5')+text(360,288,`${fmt(3*m.scale)} ، ${fmt(4*m.scale)} ، ${fmt(5*m.scale)}`);
 }
 else if(['area','parallelogram'].includes(type)){
   const w=a*29,h=b*29,x=100,y=55,o=40;out+=rect(x+(type==='parallelogram'?o:0),y,w,h,'lv-empty');if(type==='parallelogram'){out+=`<polygon points="${x+o},${y} ${x+w+o},${y} ${x+w},${y+h} ${x+o},${y+h}" class="lv-green"/><g class="lv-rearrange" style="transform:translateX(${step?w:0}px)"><path d="M${x} ${y+h}L${x+o} ${y}V${y+h}Z" class="lv-gold"/></g>`;}else for(let row=0;row<b;row++)for(let col=0;col<a;col++)out+=rect(x+col*29,y+row*29,26,26,'lv-green');out+=text(x+w/2+o/2,y+h+28,'القاعدة '+a)+text(x-32,y+h/2,'ع '+b)+text(270,310,'المساحة: '+a*b);
 }
 else if(['circle','sector','segment','pie'].includes(type)){
   const cx=270,cy=165,r=type==='pie'?110:55+a*12,point=angle=>[cx+r*Math.cos(angle),cy+r*Math.sin(angle)];
   out+=`<circle cx="${cx}" cy="${cy}" r="${r}" class="lv-empty"/>`;
   const wedge=(start,end,cls)=>{const p=point(start),q=point(end);return `<path d="M${cx} ${cy}L${p[0]} ${p[1]}A${r} ${r} 0 ${end-start>pi?1:0} 1 ${q[0]} ${q[1]}Z" class="${cls}"/>`;};
   if(type==='circle')out+=`<circle cx="${cx}" cy="${cy}" r="${r}" class="lv-green-soft"/><path d="M${cx} ${cy}h${r}" class="lv-travel"/>`+text(cx+r/2,cy-12,'نق '+a);
   else if(type==='pie'){let angle=-pi/2;m.values.forEach((value,i)=>{const end=angle+value/m.total*2*pi;out+=wedge(angle,end,['lv-green','lv-gold','lv-blue-soft','lv-purple'][i]);const mid=(angle+end)/2;out+=text(cx+r*.7*Math.cos(mid),cy+r*.7*Math.sin(mid),value);angle=end;});}
   else {const end=m.theta*pi/180;out+=wedge(0,end,'lv-green-soft');const q=point(end);if(type==='segment'&&step>=1)out+=`<path d="M${cx} ${cy}h${r}L${q[0]} ${q[1]}Z" class="${step===2?'lv-empty':'lv-gold-soft'}"/>`;out+=text(cx+25,cy+25,m.theta+'°');}
 }
 else if(['prism','cylinder','cone','cubesDifference','cubesSum'].includes(type)){
   const box=(x,y,w,h,d,cls)=>`<path d="M${x} ${y}h${w}v${h}h${-w}Z" class="${cls}"/><path d="M${x} ${y}l${d} ${-d}h${w}l${-d} ${d}M${x+w} ${y}l${d} ${-d}v${h}l${-d} ${d}" class="lv-outline"/>`;
   if(type.startsWith('cubes'))out+=box(100,110,a*30,a*30,28,'lv-green-soft')+box(330,142,b*30,b*30,22,'lv-gold-soft')+text(270,165,type==='cubesSum'?'+':'−','lv-big')+text(160,305,a+'³')+text(360,305,b+'³');
   else if(type==='prism'){out+=box(140,75,a*42,b*27,42,'lv-green-soft');if(step)for(let i=1;i<b;i++)out+=`<path d="M140 ${75+i*27}h${a*42}" class="lv-outline lv-layer" style="animation-delay:${i*90}ms"/>`;out+=text(270,315,`القاعدة ${a} × 2  ،  الارتفاع ${b}`);}
   else {const cx=270,top=60,base=top+b*30,rx=35+a*10,ry=22;if(type==='cone')out+=`<path d="M${cx} ${top}L${cx-rx} ${base}Q${cx} ${base+44} ${cx+rx} ${base}Z" class="lv-green-soft"/><path d="M${cx} ${top}V${base}" class="lv-outline lv-dashed"/>`;else out+=`<path d="M${cx-rx} ${top}v${b*30}a${rx} ${ry} 0 0 0 ${rx*2} 0V${top}" class="lv-green-soft"/><ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" class="lv-gold-soft"/>`;out+=`<ellipse cx="${cx}" cy="${base}" rx="${rx}" ry="${ry}" class="lv-outline"/>`;if(type==='cylinder'&&step)for(let i=1;i<b;i++)out+=`<ellipse cx="${cx}" cy="${top+i*30}" rx="${rx}" ry="${ry}" class="lv-outline lv-layer" style="animation-delay:${i*90}ms"/>`;out+=text(cx+rx+35,(top+base)/2,'ع '+b)+text(cx,base+48,'نق '+a);}
 }
 else if(['bars','stats','spread'].includes(type)){
   m.values.forEach((v,i)=>{out+=rect(100+i*95,270-v*20,64,v*20,i===0?'lv-gold':'lv-green');out+=text(132+i*95,255-v*20,v)+text(132+i*95,298,'فئة '+(i+1));});if(step&&type==='stats')out+=`<path d="M80 ${270-m.mean*20}H485" class="lv-travel lv-gold-line"/>`+text(270,30,'الوسط '+fmt(m.mean));else if(step&&type==='spread')out+=text(270,30,'المدى '+m.range);
 }
 else if(['probability','complement'].includes(type)){
   for(let n=1;n<=6;n++){const x=118+(n-1)%3*145,y=85+Math.floor((n-1)/3)*126;out+=rect(x-38,y-30,76,76,m.chosen.includes(n)?'lv-green':'lv-empty')+text(x,y+17,n,'lv-big');}out+=text(270,310,'النتائج الملوّنة: '+m.chosen.length+' من 6');
 }
 else if(['sets','union','difference'].includes(type)){
   out+=rect(55,30,435,260,'lv-empty')+'<ellipse cx="230" cy="157" rx="112" ry="93" class="lv-green-soft"/><ellipse cx="332" cy="157" rx="112" ry="93" class="lv-gold-soft"/>'+text(170,75,'ح')+text(385,75,'ك');let counts={left:0,right:0,both:0,none:0};for(let n=1;n<=6;n++){const inA=m.A.includes(n),inB=m.B.includes(n),group=inA&&inB?'both':inA?'left':inB?'right':'none',i=counts[group]++,x={left:186,right:381,both:280,none:81}[group],y=(group==='none'?242:121)+i*36;if(type==='difference'&&step&&m.chosen.includes(n))out+=`<circle cx="${x}" cy="${y-7}" r="18" class="lv-green"/>`;out+=text(x,y,n,type==='difference'&&step&&!m.chosen.includes(n)?'lv-quiet':'lv-ink');}
 }
 return `<svg viewBox="0 0 540 340" direction="ltr" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;
}
const INSTR_DEFAULT='حرّك الأشرطة لتغيير الأعداد، ثم اضغط الخطوات ١ و٢ و٣ بالترتيب لترى الحل.';
const INSTR={termParts:'غيّر المعامل وقيمة س بالأشرطة، ثم اضغط «التالي» لنعرف أجزاء الحد ونجد قيمته العددية.',substitute:'غيّر قيمتي س و ص، ثم اضغط «التالي» لنكتب محيط الحوض مقدارًا جبريًا ونعوّض فيه.',likeTerms:'غيّر عدد بطاقات س و ص، ثم اضغط «التالي» لنضع المتشابه معًا ونجمعه.',areaDistribute:'غيّر العدد خارج القوسين والعدد داخلهما، ثم اضغط «التالي» لنقسم المستطيل ونضرب كل جزء.',triKind:'حرّك شريطي الزاويتين ب و جـ، ثم اضغط «التالي» لنجد الزاوية الثالثة ونصنّف المثلث حسب زواياه.',triSides:'اختر أطوال الأضلاع الثلاثة بالأشرطة، ثم اضغط «التالي» لنعرف هل تصنع مثلثًا، وما نوعه حسب أضلاعه.',isoAltitude:'غيّر طول القاعدة وقياس زاوية الرأس، ثم اضغط «التالي» لترى كيف ينصّف العمود القاعدة وزاوية الرأس.',triangleArea:'غيّر طول القاعدة والارتفاع، ثم اضغط «التالي» لترى أن المثلث نصف مستطيل.',trapezoid:'غيّر طولي القاعدتين وإزاحة القاعدة العليا، ثم اضغط «التالي» لنمدّ الساقين ثم القاعدتين.',trapIso:'حرّك شريط الزاوية أ، ثم اضغط «التالي» لنجد بقية زوايا شبه المنحرف.',trapRight:'حرّك شريط الزاوية د، ثم اضغط «التالي» لنجد الزاوية الرابعة.',paraProps:'غيّر طولي الضلعين وقياس الزاوية ب، ثم اضغط «التالي» لترى خصائص متوازي الأضلاع واسم الشكل.',powerCompare:'حرّك أشرطة الأساسين والأسّين، وقارن العددين بالقاعدة المناسبة.',sqrtLine:'حرّك الشريط لاختيار عدد، وشاهد بين أيّ مربعين كاملين يقع وما قيمة جذره التربيعي.',cbrtLine:'حرّك الشريط لاختيار عدد، وشاهد بين أيّ مكعبين كاملين يقع وما قيمة جذره التكعيبي.',unitMix:'حرّك الأشرطة، واحسب القوة والجذرين أولًا ثم أكمل بأولويات العمليات.',power:'حرّك شريط الأساس وشريط الأس، وشاهد كيف يتكرر الأساس عاملًا بعدد الأس.',order:'حرّك الأشرطة لتغيير الأعداد، وشاهد كيف نحسب الضرب أولًا ثم نجمع.'};
const STEPS_DEFAULT=['نقرأ المسألة','نحسب الخطوة الأولى','نصل إلى الناتج'];
const STEPS={termParts:['المعامل والمتغير','الحد حاصل ضرب','نعوّض'],substitute:['نجمع الأضلاع','نجمع المتشابه','نعوّض ونحسب'],likeTerms:['نقرأ الحدود','نرتّب المتشابه','نجمع المعاملات'],areaDistribute:['المستطيل كله','نقسمه جزأين','نجمع المساحتين'],triKind:['نرسم القاعدة والزاويتين','نجد الزاوية الثالثة','نصنّف المثلث'],triSides:['نرسم الضلع الأطول','نجمع الضلعين القصيرين','نحكم ونصنّف'],isoAltitude:['نرسم العمود','ينصّف القاعدة','ينصّف زاوية الرأس'],triangleArea:['نرسم المستطيل','نحسب مساحة المستطيل','نأخذ النصف'],trapezoid:['نسمّي الأضلاع','نمدّ الساقين','نمدّ القاعدتين'],trapIso:['نقرأ المعطى','زاويتا القاعدة','نكمل إلى مجموع الزوايا'],trapRight:['نقرأ المعطى','نجمع المعلوم','نجد الزاوية الرابعة'],paraProps:['الأضلاع المتقابلة','الزوايا المتقابلة','القطران'],powerCompare:['نقرأ العددين','نحسب القيمتين','نقارن'],sqrtLine:['نقرأ العدد','نحصره بين مربعين','نجد الجذر'],cbrtLine:['نقرأ العدد','نحصره بين مكعبين','نجد الجذر'],unitMix:['نقرأ التمرين','نحسب القوة والجذور','نكمل بالأولويات'],power:['نقرأ الأساس والأس','نكتب الضرب المتكرر','نحسب القيمة'],order:['نقرأ التمرين','نحسب الضرب أولًا','نجمع ونصل إلى الناتج']};
let current=null,timer=null;
const controlMarkup=type=>`<h3>غيّر القيم ولاحظ الفرق.</h3>${ENGINES[type].controls.map(c=>`<label class="lv-control">${c.label}<output data-lv-output="${c.name}">${fmt(c.value)}</output><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" data-lv-input="${c.name}" dir="ltr"></label>`).join('')}<div class="lv-control-note">${window.ICON('hand')} أرقام هذا المثال للتجربة، ولا تغيّر تقدّمك.</div>`;
function install(A){
 const original=A.V.lesson;
 A.V.lesson=id=>{
   const html=original(id),type=TYPES[id];if(!type)return html;
   const engine=ENGINES[type],state=Object.fromEntries(engine.controls.map(c=>[c.name,c.value]));
   current={id,type,state,step:0};clearInterval(timer);timer=null;
   const template=document.createElement('template');template.innerHTML=html;
   const banner=template.content.querySelector('.banner');if(banner)banner.outerHTML=`<header class="visual-lesson-heading"><h1>${escape(A.title(id))}</h1></header>`;
   const widget=document.createElement('section');widget.className='visual-lesson';widget.dataset.lesson=id;widget.setAttribute('aria-label','شرح بصري تفاعلي');widget.innerHTML=`<div class="lv-top"><div><span class="eyebrow">جرّب بنفسك</span><h2>${engine.name}</h2><p class="lv-instruction">${escape(INSTR[type]||INSTR_DEFAULT)}</p></div><span class="lv-screen-count">3 مشاهد للفهم</span></div><div class="lv-layout"><div class="lv-screen"><div id="lv-stage" class="lv-stage"></div><div id="lv-equation" class="lv-equation" dir="ltr" aria-live="polite"></div></div><div class="lv-controls"><h3>غيّر القيم ولاحظ الفرق.</h3>${engine.controls.map(c=>`<label class="lv-control">${c.label}<output data-lv-output="${c.name}">${fmt(c.value)}</output><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" data-lv-input="${c.name}" dir="ltr"></label>`).join('')}<div class="lv-control-note">${window.ICON('hand')} أرقام هذا المثال للتجربة، ولا تغيّر تقدّمك.</div></div></div><div class="lv-stepbar"><div class="lv-stepinfo"><span id="lv-stepnum" aria-live="polite"></span><span class="lv-dots" id="lv-dots" aria-hidden="true"></span></div><p class="lv-story" id="lv-story"></p><div class="lv-nav"><button type="button" data-lv-action="previous">${window.ICON('back')} السابق</button><button type="button" class="lv-replay" data-lv-action="replay" aria-label="أعد عرض حركة هذه الخطوة"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg> إعادة الحركة</button><button type="button" class="lv-next" data-lv-action="next">التالي ${window.ICON('arrow')}</button></div></div>`;
   widget.querySelector('.lv-screen').append(widget.querySelector('.lv-stepbar'));const slot=template.content.querySelector('#lv-slot');if(slot)slot.replaceWith(widget);else template.content.querySelector('.visual-lesson-heading').after(widget);
   const enlarge=document.createElement('button');enlarge.type='button';enlarge.className='lv-enlarge';enlarge.dataset.lvAction='expand';enlarge.setAttribute('aria-expanded','false');enlarge.innerHTML='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg> عرض كبير';widget.querySelector('.lv-top').append(enlarge);
   const variants=VARIANTS[id];if(variants){const bar=document.createElement('div');bar.className='lv-variants';bar.setAttribute('aria-label','فكرة المشهد');bar.innerHTML=variants.map(([kind,label])=>`<button type="button" data-lv-variant="${kind}" aria-pressed="${kind===type}" class="${kind===type?'selected':''}">${label}</button>`).join('');widget.querySelector('.lv-top').after(bar);}
   setTimeout(draw);return template.innerHTML;
 };
}
function draw(){
 const root=document.querySelector('.visual-lesson');if(!root||!current)return;
 if(current.type==='fraction'){current.state.a=Math.min(current.state.a,current.state.b);const aInput=root.querySelector('[data-lv-input="a"]');aInput.max=current.state.b;aInput.value=current.state.a;}
 const m=model(current.type,current.state),step=current.step;
 root.querySelector('#lv-stage').innerHTML=scene(m,step);root.querySelector('#lv-equation').textContent=LTRM(m.steps[step]);root.querySelector('#lv-story').textContent=m.notes[step];
 if(!['coordinates','system','quadratic','generalQuadratic','differenceSquares','parallelogram'].includes(current.type)){const svg=root.querySelector('#lv-stage svg');try{const box=svg.getBBox();if(box.width>0&&box.height>0)svg.setAttribute('viewBox',`${box.x-28} ${box.y-28} ${box.width+56} ${box.height+56}`);}catch(e){}}
 const moving=root.querySelector('.lv-rearrange');if(moving){const next=moving.style.transform;if(current.previousTransform&&current.previousTransform!==next&&!matchMedia('(prefers-reduced-motion: reduce)').matches)moving.animate([{transform:current.previousTransform},{transform:next}],{duration:800,easing:'cubic-bezier(.2,.7,.3,1)'});current.previousTransform=next;}
 const names=STEPS[current.type]||STEPS_DEFAULT;root.querySelector('#lv-stepnum').textContent=`الخطوة ${step+1} من 3: ${names[step]}`;root.querySelector('#lv-dots').innerHTML=[0,1,2].map(k=>`<i class="${k===step?'on':k<step?'done':''}"></i>`).join('');
 root.querySelector('[data-lv-action="previous"]').disabled=step===0;const nx=root.querySelector('[data-lv-action="next"]');nx.innerHTML=step===2?'أعد من البداية':'التالي '+window.ICON('arrow');
 for(const c of ENGINES[current.type].controls){root.querySelector(`[data-lv-output="${c.name}"]`).textContent=fmt(current.state[c.name]);root.querySelector(`[data-lv-input="${c.name}"]`).setAttribute('aria-valuetext',window.AR_NUM.arabic(fmt(current.state[c.name])));}
}
function stop(){clearInterval(timer);timer=null;const button=document.querySelector('[data-lv-action="play"]');if(button)button.innerHTML=window.ICON('play')+' شاهد الحركة';}
function events(){
 document.addEventListener('input',e=>{if(!e.target.matches('[data-lv-input]')||!current)return;stop();current.state[e.target.dataset.lvInput]=+e.target.value;draw();});
 document.addEventListener('click',e=>{
   const variant=e.target.closest('[data-lv-variant]');if(variant&&current){stop();current.type=variant.dataset.lvVariant;current.state=Object.fromEntries(ENGINES[current.type].controls.map(c=>[c.name,c.value]));current.step=0;current.previousTransform=null;const root=document.querySelector('.visual-lesson');root.querySelector('.lv-controls').innerHTML=controlMarkup(current.type);root.querySelector('.lv-top h2').textContent=ENGINES[current.type].name;root.querySelectorAll('[data-lv-variant]').forEach(b=>{b.classList.toggle('selected',b===variant);b.setAttribute('aria-pressed',String(b===variant));});draw();return;}
   const tab=e.target.closest('[data-lv-step]');if(tab&&current){stop();current.step=+tab.dataset.lvStep;draw();return;}
   const b=e.target.closest('[data-lv-action]');if(!b||!current)return;
   if(b.dataset.lvAction==='expand'){const root=document.querySelector('.visual-lesson'),expanded=root.classList.toggle('lv-expanded');document.body.classList.toggle('lv-modal-open',expanded);root.setAttribute('role',expanded?'dialog':'region');if(expanded)root.setAttribute('aria-modal','true');else root.removeAttribute('aria-modal');b.setAttribute('aria-expanded',String(expanded));b.innerHTML=window.ICON(expanded?'x':'compass')+(expanded?' إغلاق العرض الكبير':' عرض كبير');return;}
   if(b.dataset.lvAction==='replay'){const k=current.step;if(k>0){current.step=k-1;draw();current.step=k;requestAnimationFrame(draw)}else{current.previousTransform=null;draw()}return;}
   if(b.dataset.lvAction==='next'&&current.step===2){current.step=0;current.previousTransform=null;draw();return;}
   current.step=Math.max(0,Math.min(2,current.step+(b.dataset.lvAction==='next'?1:-1)));draw();
 });
 document.addEventListener('keydown',e=>{const root=document.querySelector('.lv-expanded');if(!root)return;if(e.key==='Escape'){root.querySelector('[data-lv-action="expand"]').click();return;}if(e.key==='Tab'){const focusable=[...root.querySelectorAll('button:not([disabled]),input,a,summary')].filter(el=>el.getClientRects().length),first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 addEventListener('hashchange',()=>{stop();document.body.classList.remove('lv-modal-open');});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
}
if(typeof document!=='undefined')events();
window.LESSON_VISUALS={TYPES,ENGINES,VARIANTS,model,scene,install};
})();



window.LV_PAGES={"U1L1": "4", "U1L2": "9", "U1L3": "13", "U1L4": "16", "U1L5": "22", "U1L6": "26", "U2L1": "36", "U2L2": "40", "U2L3": "46", "U2L4": "49", "U2L5": "53", "U2L6": "56", "U3L1": "64", "U3L2": "69", "U3L3": "73", "U3L4": "77", "U4L1": "84", "U4L2": "89", "U4L3": "93", "U5L1": "5 ج٢", "U5L2": "11 ج٢", "U5L3": "18 ج٢", "U5L4": "22 ج٢", "U5L5": "25 ج٢", "U5L6": "32 ج٢", "U6L1": "41 ج٢", "U6L2": "44 ج٢", "U6L3": "51 ج٢", "U6L4": "56 ج٢"};
/* ربط مشاهد «جرّب بنفسك» بصفحة الدرس في قالب الصفوف الجديدة */
(function(){const LV=window.LESSON_VISUALS,A=window.APP;if(!LV||!A||!A.R||!A.R.u)return;
 if(!window.ICON)window.ICON=n=>({hand:'✋',arrow:'←',back:'→',play:'▶',x:'✕',compass:'⤢'}[n]||'');
 if(!window.AR_NUM)window.AR_NUM={arabic:s=>String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])};
 const R=A.R,orig=R.u,PGS=window.LV_PAGES||{};
 const fake={V:{lesson:id=>{const h=orig(id);if(!LV.TYPES[id])return h;const pg=PGS[id]?'<p class="mut small lv-src">مرتبط بكتاب الطالب ص '+PGS[id]+'</p>':'';const k=h.lastIndexOf('<button class="btn big" id="go">');return k<0?h+'<div id="lv-slot"></div>'+pg:h.slice(0,k)+'<div id="lv-slot"></div>'+pg+h.slice(k)}},title:id=>{const l=(typeof LES!=='undefined'?LES:[]).find(x=>x.id===id);return l?l.t:''}};
 LV.install(fake);R.u=id=>fake.V.lesson(id);
})();
