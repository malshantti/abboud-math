// مولّدات أسئلة الرياضيات ومختبر «أجرّب» للصفّ الثالث.
(function(){
'use strict';
const A=window.APP,G=window.G3,{ar,rnd,shuffle,esc}=A;
const r=(a,b)=>a+rnd(b-a+1);
// خيارات فريدة: الصحيح أوّلًا
function Q(q,good,bad,ex){const o=[String(good)];bad.map(String).forEach(b=>{if(!o.includes(b)&&o.length<4)o.push(b)});let k=1;while(o.length<3){const x=String((+good||0)+k*(k%2?1:-1)*(1+rnd(9)));if(!o.includes(x)&&+x>=0)o.push(x);k++}return{q,o,a:0,ex}}
const PL=['آحاد','عشرات','مئات','آلاف','عشرات الآلاف'];
const digitsOf=n=>String(n).split('').reverse().map(Number);
function placeQ(n){const d=digitsOf(n);let i=rnd(d.length);while(d[i]===0)i=rnd(d.length);const v=d[i]*Math.pow(10,i);
 return Q('ما قيمة الرقم '+d[i]+' في العدد '+n+'؟',v,[d[i]*Math.pow(10,(i+1)%d.length),d[i]*Math.pow(10,Math.max(0,i-1)),d[i]],'الرقم '+d[i]+' في منزلة '+PL[i]+'، فقيمته '+v+'.')}
function expQ(n){const d=digitsOf(n);const parts=d.map((x,i)=>x*Math.pow(10,i)).filter(x=>x).reverse();const sw=String(n).split('');const k=rnd(sw.length-1);[sw[k],sw[k+1]]=[sw[k+1],sw[k]];
 return Q(parts.join(' + ')+' = ؟',n,[+sw.join(''),n+Math.pow(10,rnd(d.length)),Math.max(1,n-Math.pow(10,rnd(d.length)))])}
function cmpQ(lo,hi){let a=r(lo,hi),b=rnd(3)?a+(rnd(2)?1:-1)*Math.pow(10,rnd(String(a).length)):a;if(b<lo)b=a+1;const s=a>b?'>':a<b?'<':'=';return{q:'أيّ إشارة نضع؟ '+a+' ◯ '+b,o:['>','<','='],a:['>','<','='].indexOf(s),keep:1}}
const GEN={
 read4(){const t=rnd(4);if(t===0){const n=r(1000,9998);return Q('ما العدد التالي للعدد '+n+'؟',n+1,[n-1,n+10,n+100])}
  if(t===1){const n=r(1001,9999);return Q('ما العدد السابق للعدد '+n+'؟',n-1,[n+1,n-10,n-100])}
  if(t===2){const th=r(1,9),h=rnd(10),te=rnd(10),o=rnd(10),n=th*1000+h*100+te*10+o;return Q(th+' آلاف و'+h+' مئات و'+te+' عشرات و'+o+' آحاد = ؟',n,[o*1000+te*100+h*10+th,th*1000+te*100+h*10+o,n+1000])}
  const n=r(1000,9999);return Q('كم رقمًا في العدد '+n+'؟','٤',['٣','٥','٢'])},
 place4(){return rnd(2)?placeQ(r(1000,9999)):expQ(r(1000,9999))},
 place5(){return rnd(2)?placeQ(r(10000,99999)):expQ(r(10000,99999))},
 read5(){const t=rnd(3);if(t===0){const n=r(10000,99998);return Q('ما العدد التالي للعدد '+n+'؟',n+1,[n-1,n+10,n+1000])}
  if(t===1)return placeQ(r(10000,99999));const n=r(10000,99999),d=digitsOf(n);return Q('ما الرقم في منزلة عشرات الآلاف في العدد '+n+'؟',d[4],[d[3],d[0],d[2]])},
 cmp4(){if(rnd(4)===0){const a=shuffle([r(1000,9999),r(1000,9999),r(1000,9999)]);const s=a.slice().sort((x,y)=>x-y);return Q('أيّ الأعداد هو الأكبر؟ '+a.join(' ، '),s[2],[s[0],s[1]])}return cmpQ(1000,9999)},
 cmp5(){if(rnd(4)===0){const a=[r(10000,99999),r(10000,99999),r(1000,9999)];const s=a.slice().sort((x,y)=>x-y);return Q('أيّ الأعداد هو الأصغر؟ '+shuffle(a).join(' ، '),s[0],[s[1],s[2]])}return cmpQ(10000,99999)},
 round(){const t=rnd(3),p=[10,100,1000][t],n=t===0?r(11,999):t===1?r(101,9999):r(1001,9999);const lo=Math.floor(n/p)*p,res=n-lo>=p/2?lo+p:lo;
  return Q('قرّب العدد '+n+' لأقرب '+['عشرة','مئة','ألف'][t]+':',res,[res===lo?lo+p:lo,n,res+p],'يقع '+n+' بين '+lo+' و'+(lo+p)+'.')},
 addNo(){let a,b;do{a=r(1000,8999);b=r(1000,8999)}while(digitsOf(a).some((d,i)=>d+digitsOf(b)[i]>9));return Q(a+' + '+b+' = ؟',a+b,[a+b+10,a+b-100,a+b+1])},
 addCarry(){let a,b;do{a=r(1000,7999);b=r(1000,1999)}while(!digitsOf(a).some((d,i)=>d+digitsOf(b)[i]>9)||a+b>9999);const s=a+b;
  const noCarry=+digitsOf(a).map((d,i)=>(d+digitsOf(b)[i])%10).reverse().join('');return Q(a+' + '+b+' = ؟',s,[noCarry,s+10,s-10],'لا تنسَ الحمل.')},
 subNo(){let a,b;do{a=r(2000,9999);b=r(1000,a-1)}while(digitsOf(a).some((d,i)=>d<(digitsOf(b)[i]||0)));return Q(a+' − '+b+' = ؟',a-b,[a-b+10,a-b-1,a-b+100])},
 subBorrow(){let a,b;do{a=r(2000,9999);b=r(1000,a-1)}while(!digitsOf(a).some((d,i)=>d<(digitsOf(b)[i]||0)));const s=a-b;
  const wrong=+digitsOf(a).map((d,i)=>Math.abs(d-(digitsOf(b)[i]||0))).reverse().join('');return Q(a+' − '+b+' = ؟',s,[wrong,s+10,s-10],'نستلف من المنزلة التالية عندما يكون الرقم الأعلى أصغر.')}};
// أسئلة ثابتة للهندسة والبيانات (من أنشطة الكتاب)
const QS={
 m12:[['شكل له طرفان:','القطعة المستقيمة','الشعاع','المستقيم'],['ينتج الشعاع من مدّ القطعة المستقيمة من:','أحد طرفيها','طرفيها معًا','وسطها'],['ينتج المستقيم من مدّ القطعة المستقيمة من:','طرفيها','أحد طرفيها','لا نمدّها'],['حافّة المسطرة مثال على:','قطعة مستقيمة','مستقيم','زاوية'],['شعاع الضوء من المصباح مثال على:','الشعاع','القطعة المستقيمة','المثلّث'],['القطعة المستقيمة أب هي نفسها:','ب أ','أ ج','ب ج']],
 m13:[['نقطة التقاء ضلعي الزاوية تسمّى:','الرأس','الضلع','الشعاع'],['زاوية الكتاب زاوية:','قائمة','حادّة','منفرجة'],['الزاوية الأصغر من القائمة:','حادّة','منفرجة','مستقيمة'],['الزاوية الأكبر من القائمة:','منفرجة','حادّة','قائمة'],['للزاوية ضلعان هما:','شعاعان','مستقيمان','مثلّثان'],['عقربا الساعة عند الساعة الثالثة يصنعان زاوية:','قائمة','حادّة','منفرجة']],
 m14:[['عدد رؤوس المستطيل:','٤','٣','٥'],['زوايا المستطيل كلّها:','قائمة','حادّة','منفرجة'],['في المستطيل كلّ ضلعين متقابلين:','متساويان','مختلفان','متقاطعان'],['شكل أضلاعه الأربعة متساوية وزواياه قائمة:','المربّع','المستطيل','المثلّث'],['مستطيل طول أحد ضلعيه ٧ وحدات. طول الضلع المقابل له:','٧ وحدات','٣ وحدات','١٤ وحدة'],['عدد أضلاع المربّع:','٤','٣','٦']],
 m15:[['عدد رؤوس المثلّث:','٣','٤','٢'],['عدد زوايا المثلّث:','٣','٤','٦'],['شكل له ٣ أضلاع:','المثلّث','المربّع','المستطيل'],['يتكوّن المثلّث من:','٣ قطع مستقيمة','٤ قطع مستقيمة','شعاعين فقط'],['أيّ الأشكال ليس له زاوية قائمة دائمًا؟','المثلّث','المربّع','المستطيل']],
 m16:[['في التمثيل بالصور: كلّ ● = حبّة. التفّاح ● ● ● ● . كم حبّة تفّاح؟','٤','٣','٥'],['شربت منى ٣ أكواب حليب وشرب عوني ٢. كم كوبًا شربا معًا؟','٥','٦','١'],['اشترى صيّاد ٩ كغ سردين و١٢ كغ بوري. أيّهما أكثر؟','البوري','السردين','متساويان'],['● ● ● للفراولة و ● ● ● ● ● للتفّاح. الفرق بينهما:','٢','٣','٨'],['التمثيل بالصور يساعدنا على:','مقارنة الأعداد بسرعة','الرسم فقط','حفظ الأسماء']],
 m17:[['في الجدول: بصريّة ٨، سمعيّة ١١، متعدّدة ٢٥. أكبر عدد:','متعدّدة','سمعيّة','بصريّة'],['مجموع مدارس البصريّة والسمعيّة:','١٩','١٨','٣٣'],['الجدول يتكوّن من:','صفوف وأعمدة','دوائر','أسهم فقط'],['الفرق بين ٢٥ و١١:','١٤','١٦','٣٦'],['نضع في الجدول عنوانًا لكلّ:','عمود','صورة','رقم']]};
G.units.forEach(u=>u.les.forEach(l=>{if(QS[l.id])l.qs=QS[l.id].map(x=>({q:x[0],o:x.slice(1),a:0}))}));
// ———— المختبر ————
const LAB={
 blocks:{t:'أبني العدد بالقطع',d:'أضيف آلافًا ومئات وعشرات وآحادًا وأرى العدد.',ic:'puzzle',html:()=>'<div class="ctl">'+[['th','ألف',1000],['h','مئة',100],['t','عشرة',10],['o','واحد',1]].map(x=>'<button class="chip big" data-add="'+x[2]+'">+ '+x[1]+'</button>').join('')+'</div><div class="stage" id="bst"></div><div class="readout" style="text-align:center;font-size:30px" id="bn">0</div><div class="mut small" id="bx"></div><div class="ctl"><button class="btn alt" id="bclr">امسح</button><button class="btn" id="bgoal">تحدٍّ: ابنِ عددًا</button></div><div class="readout" id="bmsg" hidden></div>',
  init(){let n=0,goal=0;const draw=()=>{const d=[Math.floor(n/1000),Math.floor(n/100)%10,Math.floor(n/10)%10,n%10];A.$('#bst').innerHTML=['th','h','t','o'].map((c,i)=>'<span class="blk '+c+'"></span>'.repeat(d[i])).join(' ');A.$('#bn').textContent=ar(n);A.$('#bx').textContent=ar(d[0]+' آلاف و'+d[1]+' مئات و'+d[2]+' عشرات و'+d[3]+' آحاد');
    if(goal){const m=A.$('#bmsg');m.hidden=false;if(n===goal){m.textContent='أحسنت! بنيت العدد '+ar(goal)+'.';A.addXP(10);goal=0}else m.textContent='ابنِ العدد '+ar(goal)}};
   A.$$('[data-add]').forEach(b=>b.onclick=()=>{const v=+b.dataset.add;if(n+v<=9999){const d=Math.floor(n/v)%10;if(d<9){n+=v;draw()}else A.toast('عشرة من هذه المنزلة تساوي واحدًا من المنزلة التالية!')}});
   A.$('#bclr').onclick=()=>{n=0;draw()};A.$('#bgoal').onclick=()=>{goal=r(1000,9999);n=0;draw()};draw()}},
 compare:{t:'من الأكبر؟',d:'أختار الإشارة المناسبة بين عددين.',ic:'compass',html:()=>'<div class="readout" style="text-align:center;font-size:30px"><span id="ca"></span> ◯ <span id="cb"></span></div><div class="ctl">'+['>','<','='].map(s=>'<button class="chip big ltr" data-s="'+s+'">'+s+'</button>').join('')+'</div><div class="readout" id="cm" hidden></div><button class="btn alt" id="cn">عددان جديدان</button>',
  init(){let a,b;const nw=()=>{a=r(1000,99999);b=rnd(2)?a+(rnd(2)?1:-1)*Math.pow(10,rnd(4)):r(1000,99999);A.$('#ca').textContent=ar(a);A.$('#cb').textContent=ar(b);A.$('#cm').hidden=true};
   A.$$('[data-s]').forEach(x=>x.onclick=()=>{const s=a>b?'>':a<b?'<':'=';const m=A.$('#cm');m.hidden=false;if(x.dataset.s===s){m.textContent='صحيح!';A.addXP(5);setTimeout(nw,800)}else m.textContent='قارن من المنزلة الكبرى أوّلًا.'});A.$('#cn').onclick=nw;nw()}},
 round:{t:'خطّ الأعداد والتقريب',d:'أحرّك العدد وأرى إلى أيّ عشرة أو مئة هو أقرب.',ic:'compass',html:()=>'<div class="ctl"><button class="chip on" data-p="10">لأقرب عشرة</button><button class="chip" data-p="100">لأقرب مئة</button><button class="chip" data-p="1000">لأقرب ألف</button></div><input type="range" id="rr" min="0" max="100" value="37" aria-label="العدد"><svg id="rsv" viewBox="0 0 340 70" width="100%" height="70"></svg><div class="readout" id="rt" style="text-align:center;font-size:24px"></div>',
  init(){let p=10;const base=()=>p===10?40:p===100?300:4000;const draw=()=>{const v=+A.$('#rr').value,lo=base(),n=lo+Math.round(v/100*p),res=n-lo>=p/2?lo+p:lo,x=20+300*(n-lo)/p;
    A.$('#rsv').innerHTML='<line x1="20" y1="35" x2="320" y2="35" stroke="#888" stroke-width="3"/><text x="20" y="65" text-anchor="middle" font-size="16">'+ar(lo)+'</text><text x="320" y="65" text-anchor="middle" font-size="16">'+ar(lo+p)+'</text><line x1="170" y1="25" x2="170" y2="45" stroke="#aaa" stroke-width="2"/><circle cx="'+x+'" cy="35" r="10" fill="#c98a2e"/><text x="'+x+'" y="18" text-anchor="middle" font-size="16" font-weight="800">'+ar(n)+'</text>';
    A.$('#rt').textContent=ar(n)+' ≈ '+ar(res)};A.$('#rr').oninput=draw;A.$$('[data-p]').forEach(b=>b.onclick=()=>{p=+b.dataset.p;A.$$('[data-p]').forEach(x=>x.classList.toggle('on',x===b));draw()});draw()}},
 column:{t:'الجمع والطرح العموديّ',d:'أحلّ خطوة خطوة من الآحاد إلى الآلاف.',ic:'quill',html:()=>'<div class="ctl"><button class="chip on" data-op="+">جمع</button><button class="chip" data-op="−">طرح</button></div><table class="ltr" style="margin:auto;font-size:30px;border-collapse:collapse" id="ct"></table><p class="mut" id="chint"></p><div class="ctl" id="cdig"></div><button class="btn alt" id="cnew">مسألة جديدة</button>',
  init(){let op='+',a,b,res,col,carry;const nw=()=>{if(op==='+'){a=r(1000,7999);b=r(1000,9999-a)}else{a=r(3000,9999);b=r(1000,a-1)}res=op==='+'?a+b:a-b;col=0;draw()};
   const draw=()=>{const rs=String(res).padStart(4,' ');A.$('#ct').innerHTML='<tr><td></td>'+String(a).split('').map(d=>'<td style="padding:2px 10px">'+ar(d)+'</td>').join('')+'</tr><tr><td>'+op+'</td>'+String(b).padStart(4,' ').split('').map(d=>'<td style="padding:2px 10px">'+ar(d.trim())+'</td>').join('')+'</tr><tr style="border-top:3px solid currentColor"><td></td>'+rs.split('').map((d,i)=>'<td style="padding:2px 10px;color:var(--pri)">'+(3-i<col?ar(d.trim()):'?')+'</td>').join('')+'</tr>';
    A.$('#chint').textContent=col<4?'ما رقم '+['الآحاد','العشرات','المئات','الآلاف'][col]+' في الناتج؟':'أحسنت! الناتج '+ar(res);A.$('#cdig').innerHTML=col<4?[0,1,2,3,4,5,6,7,8,9].map(d=>'<button class="chip big" data-d="'+d+'">'+ar(d)+'</button>').join(''):'';
    A.$$('[data-d]').forEach(x=>x.onclick=()=>{const want=Math.floor(res/Math.pow(10,col))%10;if(+x.dataset.d===want){col++;if(col===4)A.addXP(10);draw()}else{x.classList.add('bad');A.toast(op==='+'?'تذكّر الحمل من المنزلة السابقة.':'هل تحتاج إلى استلاف؟')}})};
   A.$$('[data-op]').forEach(x=>x.onclick=()=>{op=x.dataset.op;A.$$('[data-op]').forEach(y=>y.classList.toggle('on',y===x));nw()});A.$('#cnew').onclick=nw;nw()}},
 lines:{t:'قطعة أم شعاع أم مستقيم؟',d:'أمدّ القطعة المستقيمة من طرف أو من طرفين.',ic:'arrow',html:()=>'<svg id="lsv" viewBox="0 0 320 70" width="100%" height="70"></svg><div class="ctl"><button class="chip big" data-e="r">أمدّ من اليمين</button><button class="chip big" data-e="l">أمدّ من اليسار</button><button class="chip" data-e="0">ابدأ من جديد</button></div><div class="readout" id="lt" style="text-align:center;font-size:24px"></div>',
  init(){let L=0,Rr=0;const draw=()=>{A.$('#lsv').innerHTML='<line x1="'+(L?15:90)+'" y1="35" x2="'+(Rr?305:230)+'" y2="35" stroke="#2f7fb5" stroke-width="5"/>'+(L?'<path d="M15 25L0 35l15 10z" fill="#2f7fb5"/>':'<circle cx="90" cy="35" r="7" fill="#c98a2e"/>')+(Rr?'<path d="M305 25l15 10-15 10z" fill="#2f7fb5"/>':'<circle cx="230" cy="35" r="7" fill="#c98a2e"/>');A.$('#lt').textContent=L&&Rr?'مستقيم: لا بداية ولا نهاية':L||Rr?'شعاع: له نقطة بداية واحدة':'قطعة مستقيمة: لها طرفان'};
   A.$$('[data-e]').forEach(b=>b.onclick=()=>{const e=b.dataset.e;if(e==='0'){L=0;Rr=0}else if(e==='l')L=1;else Rr=1;draw()});draw()}},
 angle:{t:'أصنع زاوية',d:'أحرّك الضلع وأرى نوع الزاوية.',ic:'compass',html:()=>'<svg id="asv" viewBox="0 0 220 160" width="100%" height="180"></svg><input type="range" id="ang" min="10" max="170" value="60" aria-label="فتحة الزاوية"><div class="readout" id="at" style="text-align:center;font-size:24px"></div>',
  init(){const draw=()=>{const d=+A.$('#ang').value,rad=d*Math.PI/180,x=40+150*Math.cos(rad),y=140-150*Math.sin(rad);
    A.$('#asv').innerHTML='<path d="M40 140H200" stroke="#647b43" stroke-width="5"/><path d="M40 140L'+x.toFixed(1)+' '+y.toFixed(1)+'" stroke="#2f7fb5" stroke-width="5"/>'+(Math.abs(d-90)<4?'<path d="M40 115h25v25" fill="none" stroke="#c98a2e" stroke-width="3"/>':'')+'<circle cx="40" cy="140" r="7" fill="#c98a2e"/>';
    A.$('#at').textContent=Math.abs(d-90)<4?'زاوية قائمة':d<90?'زاوية حادّة':'زاوية منفرجة'};A.$('#ang').oninput=draw;draw()}}};
window.G3X={gen:GEN,labs:LAB};
})();
