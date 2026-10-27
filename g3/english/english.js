// مختبر «أجرّب» للإنجليزيّة — الصفّ الثالث: تهجئة الكلمات ومطابقة الصور.
(function(){
'use strict';
const A=window.APP,{shuffle,rnd}=A;
const spell=(t,d,words)=>({t,d,ic:'quill',html:()=>'<p class="mut">Tap the letters to spell the word. — رتّب الحروف.</p><div class="readout" id="hint" style="text-align:center;font-size:40px"></div><div class="readout ltr en" id="bw" style="text-align:center;font-size:32px;min-height:56px"></div><div class="ctl ltr" id="bl"></div><div class="ctl"><button class="btn alt" id="bc">امسح</button><button class="btn" id="bn">كلمة أخرى</button></div><div class="readout" id="bm" hidden></div>',
 init(){let w,cur='';const nw=()=>{const p=words[rnd(words.length)];w=p[0];A.$('#hint').textContent=p[1];cur='';A.$('#bw').textContent='';A.$('#bm').hidden=true;A.$('#bl').innerHTML=shuffle(w.split('')).map(c=>'<button class="chip big en">'+c+'</button>').join('');
  A.$$('#bl .chip').forEach(b=>b.onclick=()=>{cur+=b.textContent;b.disabled=true;A.$('#bw').textContent=cur;if(cur.length===w.length){const m=A.$('#bm');m.hidden=false;if(cur===w){m.textContent='Well done! أحسنت';A.addXP(5)}else m.textContent='Try again — حاول مرّة أخرى'}})};
  A.$('#bc').onclick=()=>{cur='';A.$('#bw').textContent='';A.$$('#bl .chip').forEach(b=>b.disabled=false);A.$('#bm').hidden=true};A.$('#bn').onclick=nw;nw()}});
window.G3X={labs:{
 food:spell('Spell the food','أتهجّى أسماء الطعام (Unit 3).',[['figs','🫐'],['melon','🍈'],['grapes','🍇'],['apples','🍎'],['carrots','🥕'],['onions','🧅']]),
 zoo:spell('Spell the animal','أتهجّى أسماء الحيوانات (Unit 4).',[['tiger','🐯'],['fox','🦊'],['snake','🐍'],['monkey','🐒'],['giraffe','🦒']]),
 body:spell('Spell the body part','أتهجّى أجزاء الجسم (Unit 6).',[['head','🙂'],['back','🧍'],['foot','🦶'],['teeth','🦷']]),
 weather:spell('Spell the weather','أتهجّى كلمات الطقس (Unit 8).',[['sunny','☀️'],['rainy','🌧️'],['windy','💨'],['cloudy','☁️'],['cold','🥶'],['hot','🥵']])}};
const L={u3:'food',u4:'zoo',u6:'body',u8:'weather'};
window.G3.units.forEach(u=>{if(L[u.id])u.les[0].lab=L[u.id]});
})();
