// مختبر «أجرّب» للغتنا الجميلة — الصفّ الثالث.
(function(){
'use strict';
const A=window.APP,{shuffle,rnd}=A;
const sortLab=(t,d,cats,items)=>({t,d,ic:'puzzle',html:()=>'<p class="mut">اضغط الكلمة ثمّ اختر صندوقها.</p><div class="readout ar-t" id="sw" style="text-align:center;font-size:32px"></div><div class="ctl">'+cats.map((c,i)=>'<button class="chip big" data-c="'+i+'">'+c+'</button>').join('')+'</div><div class="readout" id="sm" hidden></div>',
 init(){let it=shuffle(items),k=0,ok=0;const show=()=>{if(k>=it.length){A.$('#sw').textContent='أحسنت! '+ok+' من '+it.length;A.digits(A.$('#sw'));A.addXP(ok*2);return}A.$('#sw').textContent=it[k][0]};
  A.$$('[data-c]').forEach(b=>b.onclick=()=>{if(k>=it.length)return;const m=A.$('#sm');m.hidden=false;if(+b.dataset.c===it[k][1]){ok++;m.textContent='صحيح!';k++;show()}else m.textContent='حاول مرّة أخرى.'});show()}});
const build=(t,d,words)=>({t,d,ic:'quill',html:()=>'<p class="mut">رتّب الحروف لتكوّن الكلمة.</p><div class="readout ar-t" id="bw" style="text-align:center;font-size:34px;min-height:60px"></div><div class="ctl" id="bl"></div><div class="ctl"><button class="btn alt" id="bc">امسح</button><button class="btn" id="bn">كلمة أخرى</button></div><div class="readout" id="bm" hidden></div>',
 init(){let w,cur='';const nw=()=>{w=words[rnd(words.length)];cur='';A.$('#bw').textContent='';A.$('#bm').hidden=true;A.$('#bl').innerHTML=shuffle(w.split('')).map(c=>'<button class="chip big ar">'+c+'</button>').join('');
  A.$$('#bl .chip').forEach(b=>b.onclick=()=>{cur+=b.textContent;b.disabled=true;A.$('#bw').textContent=cur;if(cur.length===w.length){const m=A.$('#bm');m.hidden=false;if(cur===w){m.textContent='أحسنت! '+w;A.addXP(5)}else m.textContent='ليست صحيحة. امسح وحاول.'}})};
  A.$('#bc').onclick=()=>{cur='';A.$('#bw').textContent='';A.$$('#bl .chip').forEach(b=>b.disabled=false);A.$('#bm').hidden=true};A.$('#bn').onclick=nw;nw()}});
window.G3X={labs:{
 lam:sortLab('اللام الشمسيّة والقمريّة','أضع كلّ كلمة في صندوقها.',['شمسيّة','قمريّة'],[['الشمس',0],['النهر',0],['الطالبات',0],['النظافة',0],['الدرس',0],['القمر',1],['الكتاب',1],['المدرسة',1],['البستان',1],['الأرض',1]]),
 tanween:sortLab('أنواع التنوين','أعرف نوع التنوين في آخر الكلمة.',['فتح','ضمّ','كسر'],[['ذهبًا',0],['أرضًا',0],['كتابًا',0],['خيرٌ',1],['وفيرٌ',1],['قمرٌ',1],['حالةٍ',2],['بيتٍ',2],['شجرةٍ',2]]),
 number:sortLab('مفرد، مثنّى، جمع','أصنّف الكلمات كما في درس دينا والقمر.',['مفرد','مثنّى','جمع'],[['وردة',0],['مدير',0],['عصفور',0],['مدرستان',1],['موظّفان',1],['كبيرتان',1],['صامدون',2],['مسلمون',2],['مجتهدات',2]]),
 letters:build('أكوّن كلمة','أرتّب الحروف كما في درس حذاء الحكيم.',['بحر','لحم','قلم','رمل','حذاء','خبز','نملة','عسل','قمر','يافا'])}};
// نربط أقسام الإملاء والتدريبات بالمختبر المناسب
const map={tanween:'tanween',lam:'lam'};
window.G3.units.forEach((u,i)=>{u.les[1].lab=i===4?'number':i===7?'letters':null;const s=u.les[2].t;u.les[2].lab=/التنوين/.test(s)?'tanween':/الشمسيّة/.test(s)?'lam':null});
})();
