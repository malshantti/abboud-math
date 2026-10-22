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
const TYPES={P01:'compare',P02:'compare',P03:'fraction',P04:'fractionAdd',P05:'decimal',P06:'decimal',P07:'factor',P08:'distribute',P09:'factor',P10:'fractionMultiply',P11:'balance',P12:'order',P13:'angle',P14:'angle',P15:'area',P16:'parallelogram',P17:'decimal',P18:'bars',P19:'bars',P20:'probability',P21:'order',P22:'compare',
 'S1-1-1':'order','S1-1-2':'powers','S1-1-3':'powers','S1-1-4':'root','S1-1-5':'cubeRoot',
 'S1-2-1':'angle','S1-2-2':'angle','S1-2-3':'angle','S1-2-4':'triangleArea','S1-2-5':'area','S1-2-6':'angle','S1-2-7':'parallelogram',
 'S1-3-1':'terms','S1-3-2':'terms','S1-3-3':'terms','S1-3-4':'distribute',
 'S1-4-1':'bars','S1-4-2':'stats','S1-4-3':'stats','S1-4-4':'bars',
 'S2-5-1':'decimal','S2-5-2':'fraction','S2-5-3':'fraction','S2-5-4':'fraction',
 'S2-6-1':'percent','S2-6-2':'percent','S2-6-3':'percent',
 'S2-7-1':'triangleArea','S2-7-2':'parallelogram','S2-7-3':'parallelogram','S2-7-4':'area','S2-7-5':'circle','S2-7-6':'circle','S2-7-7':'circle',
 'S2-8-1':'probability','S2-8-2':'probability','S2-8-3':'probability'};
ENGINES.fractionDivide={name:'كم جزءًا يحتوي هذا الجزء؟',controls:[range('a','بسط الكسر الأول، مقامه 4',1,4,3),range('b','بسط الكسر الثاني، مقامه 4',1,4,2)]};
ENGINES.triangleArea={name:'مثلث هو نصف مستطيل',controls:ENGINES.area.controls};
ENGINES.fractionSubtract={name:'نطرح أجزاء بالحجم نفسه',controls:ENGINES.fractionAdd.controls};
ENGINES.difference={name:'في الحادث الأول، خارج الثاني',controls:ENGINES.union.controls};
const VARIANTS={'P04':[['fractionAdd','جمع الكسور'],['fractionSubtract','طرح الكسور']],'P10':[['fractionMultiply','ضرب الكسور'],['fractionDivide','قسمة الكسور']],'P15':[['area','مستطيل'],['triangleArea','مثلث'],['parallelogram','متوازي أضلاع']],'S1-1-4':[['root','الجذر التربيعي'],['powers','المربع الكامل']]};
function model(type,s){
 const a=+s.a||0,b=+s.b||0,c=+s.c||0,m={type,a,b,c,steps:[],notes:[],result:0};
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
const text=(x,y,t,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${escape(String(t).replace(/(^|[\s(=])-(?=\d)/g,'$1−').replace(/(\d)\.(\d)/g,'$1,$2'))}</text>`;// علامة الطرح والفاصلة العشرية كما في الكتاب
const rect=(x,y,w,h,cls='lv-green')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${cls}"/>`;
function scene(m,step){
 const {type,a,b,c}=m;let out='';
 if(type==='fractionDivide'){for(let r=0;r<2;r++){const count=r?b:a;for(let i=0;i<4;i++)out+=rect(100+i*85,65+r*110,76,64,i<count?(r?'lv-gold':'lv-green'):'lv-empty');out+=text(270,55+r*110,`${count}/4`);}out+=text(270,305,step?`طول الأول ÷ طول الثاني = ${fraction(a,b)}`:'الأجزاء في الشريطين بالحجم نفسه');return `<svg viewBox="0 0 540 340" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;}
 if(type==='triangleArea'){const x=135,y=60,w=a*30,h=b*30;out+=rect(x,y,w,h,'lv-green-soft')+`<path d="M${x} ${y+h}L${x+w} ${y}V${y+h}Z" class="lv-green"/><path d="M${x} ${y+h}L${x+w} ${y}" class="lv-outline"/>`;if(step===2)out+=`<path d="M${x} ${y}h${w}L${x} ${y+h}Z" class="lv-empty"/>`;out+=text(x+w/2,y+h+30,'القاعدة '+a)+text(x-38,y+h/2,'ع '+b)+text(270,308,'نصف المساحة = '+fmt(a*b/2));return `<svg viewBox="0 0 540 340" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;}
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
 return `<svg viewBox="0 0 540 340" role="img" aria-label="${escape(ENGINES[type].name)}">${out}</svg>`;
}
const INSTR_DEFAULT='حرّك الأشرطة لتغيير الأعداد، ثم اضغط الخطوات ١ و٢ و٣ بالترتيب لترى الحل.';
const INSTR={order:'حرّك الأشرطة لتغيير الأعداد، وشاهد كيف نحسب الضرب أولًا ثم نجمع.'};
const STEPS_DEFAULT=['نقرأ المسألة','نحسب الخطوة الأولى','نصل إلى الناتج'];
const STEPS={order:['نقرأ التمرين','نحسب الضرب أولًا','نجمع ونصل إلى الناتج']};
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
 root.querySelector('#lv-stage').innerHTML=scene(m,step);root.querySelector('#lv-equation').textContent=m.steps[step];root.querySelector('#lv-story').textContent=m.notes[step];
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


