// مختبر «أجرّب» للعلوم — الصفّ الثالث.
(function(){
'use strict';
const A=window.APP,{shuffle}=A;
const order=(t,d,ic,items,ok)=>({t,d,ic,html:()=>'<p class="mut">اضغط البطاقات بالترتيب الصحيح.</p><div class="ctl" id="ob"></div><ol class="readout" id="os"></ol><div class="ctl"><button class="btn alt" id="orr">من جديد</button></div><div class="readout" id="om" hidden></div>',
 init(){let k=0;const go=()=>{k=0;A.$('#os').innerHTML='';A.$('#om').hidden=true;A.$('#ob').innerHTML=shuffle(items.map((x,i)=>[x,i])).map(([x,i])=>'<button class="chip big" data-i="'+i+'">'+x+'</button>').join('');
  A.$$('#ob .chip').forEach(b=>b.onclick=()=>{const m=A.$('#om');m.hidden=false;if(+b.dataset.i===k){k++;b.disabled=true;A.$('#os').insertAdjacentHTML('beforeend','<li>'+b.textContent+'</li>');m.textContent=k===items.length?ok:'صحيح، تابع.';if(k===items.length)A.addXP(8)}else m.textContent='ليست هذه. فكّر: ماذا يحدث أوّلًا؟'})};A.$('#orr').onclick=go;go()}});
const match=(t,d,ic,pairs)=>({t,d,ic,html:()=>'<div class="readout" id="mq" style="text-align:center;font-size:24px"></div><div class="ctl" id="mo"></div><div class="readout" id="mm" hidden></div>',
 init(){let p=shuffle(pairs),k=0,ok=0;const show=()=>{const m=A.$('#mm');if(k>=p.length){A.$('#mq').textContent='أحسنت! '+ok+' من '+p.length;A.digits(A.$('#mq'));A.$('#mo').innerHTML='';A.addXP(ok*2);return}A.$('#mq').textContent=p[k][0];A.$('#mo').innerHTML=shuffle(pairs.map(x=>x[1])).map(x=>'<button class="chip big">'+x+'</button>').join('');
  A.$$('#mo .chip').forEach(b=>b.onclick=()=>{m.hidden=false;if(b.textContent===p[k][1]){ok++;k++;m.textContent='صحيح!';show()}else m.textContent='حاول مرّة أخرى.'})};show()}});
window.G3X={labs:{
 parts:match('أجزاء النبات','أصل كلّ جزء بوظيفته.','leaf',[['الجذر','يمتصّ الماء ويثبّت النبات'],['الساق','تنقل الماء'],['الورقة','تصنع الغذاء'],['الزهرة','تكوّن الثمرة'],['الثمرة','تحمي البذور']]),
 germ:order('مراحل الإنبات','أرتّب ما يحدث للبذرة.','leaf',['تمتصّ الماء','تنتفخ','يتشقّق الغلاف','يخرج الجذير','تخرج الريشة','تظهر الأوراق'],'أحسنت! هكذا تنبت البذرة.'),
 layers:order('طبقات الأرض','أرتّب الطبقات من الخارج إلى الداخل.','globe',['القشرة','الستار','اللبّ'],'أحسنت! من الخارج إلى المركز.'),
 cycle:order('دورة الماء','أرتّب مراحل دورة الماء.','globe',['التبخّر','التكاثف','الهطول','الجريان'],'أحسنت! وتعود الدورة من جديد.')}};
})();
