/* بنك أسئلة الرياضيات للصف الأول: مولِّدات حتمية (بذرة ثابتة) على نمط مهام الكتاب نفسه،
   تُضاف إلى كل وحدة في unit.bank وتُستعمل في «مغامراتي». لا تغيّر مهام الدروس ولا عدّ التقدّم. */
(function(){
  const C=window.G1_COURSE;if(!C||!C.units)return;
  const D='٠١٢٣٤٥٦٧٨٩',ar=n=>String(n).replace(/\d/g,d=>D[d]);
  const ONE=['صِفْر','وَاحِد','اثْنَان','ثَلَاثَة','أَرْبَعَة','خَمْسَة','سِتَّة','سَبْعَة','ثَمَانِيَة','تِسْعَة'];
  const TEEN=['عَشَرَة','أَحَدَ عَشَرَ','اثْنَا عَشَرَ','ثَلَاثَةَ عَشَرَ','أَرْبَعَةَ عَشَرَ','خَمْسَةَ عَشَرَ','سِتَّةَ عَشَرَ','سَبْعَةَ عَشَرَ','ثَمَانِيَةَ عَشَرَ','تِسْعَةَ عَشَرَ'];
  const TENS=['','','عِشْرُون','ثَلَاثُون','أَرْبَعُون','خَمْسُون','سِتُّون','سَبْعُون','ثَمَانُون','تِسْعُون'];
  const w=n=>n<10?ONE[n]:n<20?TEEN[n-10]:(n%10?ONE[n%10]+' وَ'+TENS[Math.floor(n/10)]:TENS[n/10]);
  let seed=20261104;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
  const num=n=>({label:ar(n),say:w(n)});
  const opts=(ans,lo,hi)=>{const s=[ans];let g=0;while(s.length<3&&g++<50){const d=ans+ri(-3,3);if(d>=lo&&d<=hi&&!s.includes(d))s.push(d);}for(let d=lo;s.length<3&&d<=hi;d++)if(!s.includes(d))s.push(d);return s.map(num);};
  const ICON={apple:['تفاحة','تُفَّاحَةً'],ball:['كرة','كُرَةً'],flower:['زهرة','زَهْرَةً'],duck:['بطة','بَطَّةً'],fish:['سمكة','سَمَكَةً'],leaf:['ورقة','وَرَقَةً'],olive:['زيتونة','زَيْتُونَةً'],car:['سيارة','سَيَّارَةً']};
  const icons=Object.keys(ICON),pick=a=>a[ri(0,a.length-1)];
  const count=()=>{const ic=pick(icons),n=ri(1,9);return {prompt:'كم '+ICON[ic][0]+'؟',say:'كَمْ '+ICON[ic][1]+'؟',scene:{type:'count',icon:ic,count:n},choices:opts(n,1,9),answer:0,explain:'أعدّ واحدًا واحدًا: '+ar(n)+'.',sayExplain:'أَعُدُّ وَاحِدًا وَاحِدًا: '+w(n)+'.'};};
  const bigger=(lo,hi)=>{const a=ri(lo,hi);let b=ri(lo,hi);while(b===a)b=ri(lo,hi);const big=rnd()<.5,x=big?Math.max(a,b):Math.min(a,b),y=a+b-x,k=big?'أكبر':'أصغر',sk=big?'أَكْبَرُ':'أَصْغَرُ';
    return {prompt:'أي العددين '+k+'؟',say:'أَيُّ الْعَدَدَيْنِ '+sk+': '+w(a)+' أَمْ '+w(b)+'؟',scene:{type:'symbol',value:ar(a)+' ، '+ar(b)},choices:[num(x),num(y)],answer:0,explain:ar(x)+' '+k+' من '+ar(y)+'.',sayExplain:w(x)+' '+sk+' مِنْ '+w(y)+'.'};};
  const SIGN=[{label:'>',big:true,caption:'أكبر من',aria:'أكبر من',say:'أَكْبَرُ مِنْ'},{label:'<',big:true,caption:'أصغر من',aria:'أصغر من',say:'أَصْغَرُ مِنْ'},{label:'=',big:true,caption:'يساوي',aria:'يساوي',say:'يُسَاوِي'}];
  const sign=(lo,hi)=>{const a=ri(lo,hi),b=rnd()<.2?a:ri(lo,hi),i=a>b?0:a<b?1:2,ch=[SIGN[i]].concat(SIGN.filter((_,j)=>j!==i));
    return {prompt:'اختر الإشارة',say:w(a)+' وَ'+w(b)+': اخْتَرِ الْإِشَارَةَ.',scene:{type:'symbol',value:ar(a)+' ؟ '+ar(b)},choices:ch,answer:0,explain:ar(a)+' '+SIGN[i].label+' '+ar(b),sayExplain:w(a)+' '+SIGN[i].say+' '+w(b)};};
  const nextPrev=(lo,hi)=>{const after=rnd()<.5,n=ri(lo+1,hi-1),ans=after?n+1:n-1;if(n===2)return nextPrev(lo,hi);
    return {prompt:after?'ما العدد التالي؟':'ما العدد السابق؟',say:'مَا الْعَدَدُ الَّذِي '+(after?'بَعْدَ ':'قَبْلَ ')+w(n)+'؟',scene:{type:'symbol',value:after?ar(n)+'، ؟':'؟، '+ar(n)},choices:opts(ans,Math.max(0,lo-1),hi+1),answer:0,explain:(after?'بعد ':'قبل ')+ar(n)+' يأتي '+ar(ans)+'.',sayExplain:(after?'بَعْدَ ':'قَبْلَ ')+w(n)+' يَأْتِي '+w(ans)+'.'};};
  const op=(type,plus,maxA,maxSum)=>{let a,b;if(plus){do{a=ri(type==='ten-bridge'?2:0,maxA);b=ri(type==='ten-bridge'?2:0,9);}while(a+b>maxSum||(type==='ten-bridge'&&a+b<11));}else{do{a=ri(type==='ten-bridge'?11:1,maxSum);b=ri(0,Math.min(9,a));}while(type==='ten-bridge'&&(a-b>=10||b>9));}
    const r=plus?a+b:a-b,o=plus?'+':'-',so=plus?' زَائِد ':' نَاقِص ',sign=plus?' + ':' − ';
    const scene=type==='operation'?{type,left:a,right:b,operator:o,icon:pick(icons)}:type==='symbol'?{type,value:ar(a)+sign+ar(b)+' = ؟'}:{type,a,b,op:o,phase:type==='ten-bridge'?1:0};
    return {prompt:'ما الناتج؟',say:w(a)+so+w(b)+'، مَا النَّاتِجُ؟',scene,choices:opts(r,0,maxSum),answer:0,explain:ar(a)+sign+ar(b)+' = '+ar(r),sayExplain:w(a)+so+w(b)+' يُسَاوِي '+w(r)};};
  const missing=()=>{const s=ri(2,9),a=ri(0,s),b=s-a;return {prompt:'ما الجزء الناقص؟',say:w(a)+' زَائِد كَمْ يُسَاوِي '+w(s)+'؟',scene:{type:'symbol',value:ar(a)+' + ؟ = '+ar(s)},choices:opts(b,0,9),answer:0,explain:ar(a)+' + '+ar(b)+' = '+ar(s),sayExplain:w(a)+' زَائِد '+w(b)+' يُسَاوِي '+w(s)};};
  const place=(lo,hi)=>{const n=ri(lo,hi),t=Math.floor(n/10),o=n%10,s=[n];for(const d of [n+10,n-10,t+o*10,n+1,n-1])if(s.length<3&&d>=lo-10&&d<=99&&d>0&&!s.includes(d))s.push(d);
    return {prompt:'ما العدد؟',say:'مَا الْعَدَدُ؟',scene:{type:'place-value',tens:t,ones:o},choices:s.map(num),answer:0,explain:ar(t*10)+' + '+ar(o)+' = '+ar(n),sayExplain:w(t*10)+' زَائِد '+w(o)+' يُسَاوِي '+w(n)};};
  const HOUR=['','الواحدة','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة','التاسعة','العاشرة','الحادية عشرة','الثانية عشرة'];
  const SHOUR=['','الْوَاحِدَةُ','الثَّانِيَةُ','الثَّالِثَةُ','الرَّابِعَةُ','الْخَامِسَةُ','السَّادِسَةُ','السَّابِعَةُ','الثَّامِنَةُ','التَّاسِعَةُ','الْعَاشِرَةُ','الْحَادِيَةَ عَشْرَةَ','الثَّانِيَةَ عَشْرَةَ'];
  const clock=()=>{const h=ri(1,12),s=[h];while(s.length<3){const d=ri(1,12);if(!s.includes(d))s.push(d);}
    return {prompt:'كم الساعة؟',say:'كَمِ السَّاعَةُ الْآنَ؟',scene:{type:'clock',hour:h,minute:0},choices:s.map(x=>({label:HOUR[x],say:SHOUR[x]})),answer:0,explain:'الساعة '+HOUR[h]+'.',sayExplain:'السَّاعَةُ '+SHOUR[h]+'.'};};
  const measure=()=>{const n=ri(2,9);return {prompt:'كم وحدة طوله؟',say:'كَمْ وَحْدَةً طُولُ الشَّرِيطِ؟',scene:{type:'measure',units:n},choices:opts(n,1,10),answer:0,explain:'عدد الوحدات '+ar(n)+'.',sayExplain:'عَدَدُ الْوَحَدَاتِ: '+w(n)+'.'};};
  const SH={triangle:['مثلث','مُثَلَّث'],square:['مربع','مُرَبَّع'],circle:['دائرة','دَائِرَة'],rectangle:['مستطيل','مُسْتَطِيل']};
  const shape=()=>{const k=Object.keys(SH),v=pick(k),o=[v].concat(k.filter(x=>x!==v).sort(()=>rnd()-.5).slice(0,2));return {prompt:'ما اسم هذا الشكل؟',say:'مَا اسْمُ هَذَا الشَّكْلِ؟',scene:{type:'shape',value:v},choices:o.map(x=>({label:SH[x][0],say:SH[x][1]})),answer:0,explain:'هذا '+SH[v][0]+'.',sayExplain:'هَذَا '+SH[v][1]+'.'};};
  const SO={cube:['مكعب','مُكَعَّب'],cuboid:['متوازي المستطيلات','مُتَوَازِي الْمُسْتَطِيلَاتِ'],sphere:['كرة','كُرَة']};
  const solid=()=>{const k=Object.keys(SO),v=pick(k),o=[v].concat(k.filter(x=>x!==v));return {prompt:'ما اسم المجسم؟',say:'مَا اسْمُ هَذَا الْمُجَسَّمِ؟',scene:{type:'solid',value:v},choices:o.map(x=>({label:SO[x][0],say:SO[x][1]})),answer:0,explain:'هذا '+SO[v][0]+'.',sayExplain:'هَذَا '+SO[v][1]+'.'};};
  const FR={2:['نصف','نِصْف'],4:['ربع','رُبْع']};
  const fraction=()=>{const p=rnd()<.5?2:4,o=p===2?[FR[2],FR[4]]:[FR[4],FR[2]];return {prompt:'ما اسم الجزء الملوّن؟',say:'مَا اسْمُ الْجُزْءِ الْمُلَوَّنِ؟',scene:{type:'fraction',parts:p,selected:1},choices:o.concat([['الشكل كله','الشَّكْلُ كُلُّهُ']]).map(x=>({label:x[0],say:x[1]})),answer:0,explain:'جزء من '+ar(p)+' أجزاء متساوية: '+FR[p][0]+'.',sayExplain:p===2?'جُزْءٌ مِنْ جُزْأَيْنِ مُتَسَاوِيَيْنِ: نِصْفٌ.':'جُزْءٌ مِنْ أَرْبَعَةِ أَجْزَاءٍ مُتَسَاوِيَةٍ: رُبْعٌ.'};};
  const PLAN={'m-u1':[count],'m-u2':[()=>bigger(1,9),()=>sign(1,9),()=>nextPrev(1,9)],'m-u3':[()=>op('operation',true,9,9),()=>op('symbol',true,9,9),missing],
    'm-u4':[()=>op('operation',false,9,9),()=>op('column-operation',false,9,9)],'m-u5':[()=>place(10,20),()=>nextPrev(10,20)],'m-u6':[clock,measure],
    'm-u7':[()=>bigger(10,20),()=>sign(10,20),()=>place(11,19)],'m-u8':[()=>op('ten-bridge',true,9,18),()=>op('symbol',true,9,18)],'m-u9':[()=>op('ten-bridge',false,9,18),()=>op('symbol',false,9,18)],
    'm-u10':[()=>place(21,99),()=>bigger(21,99),()=>nextPrev(21,99)],'m-u11':[shape,solid,fraction]};
  for(const u of C.units){const g=PLAN[u.id];if(!g)continue;const bank=[],seen=new Set();let guard=0;
    while(bank.length<12&&guard++<400){const t=g[guard%g.length]();const k=t.say+'|'+JSON.stringify(t.scene)+'|'+t.choices.map(c=>c.label).join();if(seen.has(k))continue;seen.add(k);t.bank=true;bank.push(t);}u.bank=bank;}
})();
