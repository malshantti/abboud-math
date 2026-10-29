// معيار المختبر والمغامرات (مأخوذ من الصف السادس) — ملف عامّ لكلّ صفّ يستعمل هيكل les.js.
// البيانات الخاصة بالصف في stddata.js (window.STD). المحتوى كلّه من كتاب الطالب.
(function(){
'use strict';
const A=window.APP,C=window.CFG||{},L=window.LAB||{items:[]},D=window.STD||{};if(!A)return;
const {esc,ic,shuffle,S,R,quiz}=A;const G=A.gen||{};const LES=G.LES||[];const U=window.UNITS||[];
const SUB=C.subject||(L.kind==='ma'?'math':L.kind==='en'?'english':L.kind==='ar'?'arabic':'science');
const T=A.labT||{};const AR=n=>A.ar?A.ar(n):String(n);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const PG=p=>p>=1000?AR(p-1000)+' ج٢':AR(p);
const LID=id=>LES.find(l=>l.id===id);
const lnk=l=>l?'<a href="#/u/'+l.id+'">'+esc(l.t)+'</a> (ص '+PG(l.pg)+')':'';
S.std=S.std||{};const ST=S.std;
const sv=()=>A.save();
const W=t=>'<span class="ltr" dir="ltr">'+esc(t)+'</span>';
const tile=(href,icon,t,s,c)=>'<a class="tile '+(c||'')+'" href="'+href+'"><span class="ti">'+ic(icon)+'</span><b>'+t+'</b><small>'+s+'</small></a>';
const grid=(h,p,tiles)=>'<h2>'+h+'</h2><p class="mut">'+p+'</p><div class="grid">'+tiles.join('')+'</div>';
const items=k=>(L.items||[]).filter(i=>!k||i.k===k);
const dat=k=>items(k).flatMap(i=>(i.data||[]).map(d=>Object.assign([],d,{les:i.les})));
const fin=(id,pc)=>{S.done[id]=Math.max(S.done[id]||0,pc);sv()};
const scopeLes=sc=>{const us=A.scopeUnits?A.scopeUnits(sc):U;return LES.filter(l=>us.includes(l.u)||us.some(u=>u.id===l.u||u===l.u))};
const allLes=sc=>{const a=scopeLes(sc);return a.length?a:LES};
// مخزن أسئلة الدرس (اختيار من متعدد بإجابة واحدة): مولّدات ثم أسئلة الكتاب ثم المفاهيم
const pool=(l,n)=>{let o=[];if(G.NUM&&(G.NUM[l.id]||[]).length&&G.numQs)o=o.concat(G.numQs(l,n));if(G.bookQs)o=o.concat(shuffle(G.bookQs(l)));if(o.length<n&&G.termQs)o=o.concat(G.termQs(l,n));return o.filter(q=>q&&q.o&&q.o.length>=2).slice(0,n)};
const poolAll=(ls,n)=>{const o=[];let g=0;while(o.length<n&&g++<n*4){const l=pick(ls);const q=pool(l,1)[0];if(q)o.push(Object.assign({},q,{_l:l}))}return o};
const strip=h=>String(h).replace(/<br>/g,' ').replace(/<small[^>]*>.*?<\/small>/g,'').replace(/<[^>]+>/g,'').trim();
const back=(h,t)=>'<div class="mut small"><a href="'+h+'">'+t+'</a></div>';
const NOTE='<p class="source-note small mut">كلّ الأسئلة والأمثلة من كتاب الطالب؛ رقم الصفحة بجانب كلّ سؤال.</p>';

/* ================= التعريفات لكلّ مادّة ================= */
const ADV={},LABS={};
if(SUB==='science'){
  Object.assign(ADV,{match:['مطابقة المفاهيم','صل كلّ مفهوم بتعريفه من دروسك.','puzzle'],tf:['سباق الحقائق','صواب أم خطأ؟ عشر عبارات من كلّ الوحدات.','bolt'],calc:['مسائل المختبر','مسائل عدديّة مولَّدة من دروسك.','flask'],review:['مراجعة ذكيّة','أسئلة من الدّروس الّتي أخطأت فيها أكثر.','target']});
}
if(SUB==='arabic'){
  Object.assign(ADV,{match:['مطابقة المفردات','صل كلّ مفردة بمعناها من دروسك.','puzzle'],verses:['تحدّي الأبيات','أكمل أبيات القصائد الّتي درستها.','feather'],irab:['دروب القواعد','حدّد نوع الكلمة الملوّنة في جمل من الكتاب.','quill'],review:['مراجعة ذكيّة','أسئلة من الدّروس الّتي أخطأت فيها أكثر.','target'],mixed:['جولة الوحدات','أسئلة منوّعة من كلّ وحدات الكتاب.','compass']});
  Object.assign(LABS,{hamza:['مختبر الهمزة','همزة الوصل وهمزة القطع خطوة خطوة.','pen'],irab:['بنّاء القواعد','لوّن الكلمة واختر نوعها ووظيفتها.','puzzle'],imla:['ورشة الإملاء','عشرة أسئلة إملاء من تدريبات الكتاب.','check'],sarf:['الفعل مع الضمائر','صرّف أفعال الكتاب مع الضمائر.','swap'],khatt:['لوح الخطّ','حروف وجمل خطّ النسخ من الكتاب.','feather']});
}
if(SUB==='math'){
  Object.assign(ADV,{teach:['أنت المعلم','زيتون محتار — علّمه الإجابة الصحيحة واشرح السبب.','users'],detective:['محقق الأخطاء','ثلاثة حلول، أحدها خطأ: اكشفه وارفع رتبتك.','eye'],village:['قصة القرية','ابنِ القرية: كلّ وحدة تبني جزءًا جديدًا.','home'],pad:['لوحة الكتابة','اكتب خطوات حلّ تمرين من الكتاب سطرًا سطرًا.','pen'],sky:['سماء مهاراتي','كلّ درس نجمة؛ النجوم تخفت إن لم تراجعها.','star'],coach:['المدرب: لماذا؟','أجب، ثم اختر السبب الصحيح.','target']});
}
if(SUB==='english'){
  ADV.detective=['محقق القواعد','جملة واحدة فيها خطأ — اكتشفها.','eye'];
  U.forEach((u,i)=>{const ls=LES.filter(l=>l.u===u.id||l.u===u);if(ls.some(l=>(l.bmc||[]).length))ADV['m-'+u.id]=['مهمّة: '+esc(u.t||u.title||('Unit '+(i+1))),'كل مهمّة 10 دقائق تقريبًا','book']});
  Object.assign(LABS,{sb:['باني الجمل','رتّب كلمات جمل الكتاب.','puzzle','sent'],tm:['آلة الأزمنة','حرّك الزمن وشاهد الفعل يتغيّر.','swap','sent'],pm:['مرآة النطق','استمع للنموذج، سجّل صوتك، وقارن.','speaker','sound'],sl:['مختبر الإملاء','استمع واكتب الكلمة حرفًا حرفًا.','pen','word'],race:['سباق الكلمات','٦٠ ثانية: اختر معنى كلّ كلمة.','bolt','word']});
}
if(SUB==='math')LABS.race=['سباق الأعداد','٦٠ ثانية: ٥ إجابات متتالية = +٣ ثوانٍ، والخطأ −٣.','bolt'];

/* ================= المغامرات ================= */
const oldAdv=R.adv;
R.play=()=>{const ks=Object.keys(ADV).filter(k=>!(k==='calc'&&!LES.some(l=>(G.NUM&&G.NUM[l.id]||[]).length)));
  return grid('المغامرات',SUB==='math'?'طرق جديدة للتعلّم: علّم، حقّق، ابنِ، اكتب.':'العب وتعلّم من دروس الكتاب.',ks.map((k,i)=>{const a=ADV[k];let s=a[1];const d=S.done['adv:'+k];
    if(k.startsWith('m-')){const st=d>=90?3:d>=70?2:d>=50?1:0;s+=' · '+'★'.repeat(st)+'☆'.repeat(3-st)+(d!=null?' · أفضل '+AR(d)+'٪':'')}
    else if(d!=null)s+=' · أفضل '+AR(d)+'٪';
    return tile('#/adv/'+k,a[2],a[0],s,'c'+(i%6))}))};
const QZ=(qs,key,title,sc)=>{if(!qs.length)return '<p>لا توجد أسئلة كافية في هذا النطاق.</p>';return quiz(qs,{key:'adv:'+key,title,back:'#/play/'+(sc||'')})};
R.adv=(id,sc)=>{const a=ADV[id];
  if(!a||(SUB==='science'&&['match','tf','calc','review'].includes(id))||(SUB==='arabic'&&['match','review'].includes(id))){const h=oldAdv?oldAdv(id,sc):'';return a?String(h).replace(/مطابقة المفاهيم/g,a[0]).replace(/مسائل المختبر|مسائل عدديّة/g,a[0]):h}
  const ls=allLes(sc);
  if(id==='verses')return QZ(shuffle((D.verses||[]).flatMap(p=>p.v.map((v,j)=>{const others=shuffle(p.v.filter((x,k)=>k!==j).map(x=>x[1]).concat((D.verses||[]).filter(q=>q!==p).flatMap(q=>q.v.map(x=>x[1])))).slice(0,3);return {q:'أكمل البيت من قصيدة «'+esc(p.t)+'» (ص '+PG(p.pg)+'):<br><b>'+esc(v[0])+'</b> …',o:[v[1],...others],a:0,ex:v[0]+' ** '+v[1]}}))).slice(0,10),'verses',a[0],sc);
  if(id==='irab'||id==='mixed'&&false){}
  if(id==='irab')return QZ(gramQs(10),'irab',a[0],sc);
  if(id==='mixed')return QZ(poolAll(LES,12),'mixed',a[0],sc);
  if(id==='teach')return QZ(poolAll(ls,8).map(q=>{const w=q.o.findIndex((x,i)=>i!==q.a);return Object.assign({},q,{html:1,q:'<div class="card"><b>زيتون محتار!</b> سُئل:<br>'+q.q+'<br>فأجاب: «'+(q.html?q.o[w]:esc(strip(q.o[w])))+'».</div>علّم زيتون: ما الإجابة الصحيحة؟',ex:(q.ex||'')})}),'teach',a[0],sc);
  if(id==='detective'){if(SUB==='english')return QZ(enDet(10),'detective',a[0],sc);const qs=[];for(let i=0;i<8;i++){const t=poolAll(ls,3);if(t.length<3)break;const bad=Math.floor(Math.random()*3);const o=t.map((q,j)=>{const k=j===bad?q.o.findIndex((x,m)=>m!==q.a):q.a;return strip(q.q)+' ← '+strip(q.o[k])});qs.push({q:'أيّ الحلول الآتية فيه خطأ؟',o:o,a:bad,keep:1,ex:'الحلّ الصحيح: '+strip(t[bad].q)+' ← '+strip(t[bad].o[t[bad].a])})}ST.det=(ST.det||0)+1;sv();return QZ(qs,'detective',a[0]+' · رتبتك: '+rank(),sc)}
  if(id==='coach'){const qs=[];poolAll(ls,6).forEach(q=>{qs.push(q);const others=poolAll(LES,6).map(x=>x.ex).filter(e=>e&&e!==q.ex);if(q.ex&&others.length>=2)qs.push({q:'المدرب يسأل: لماذا كانت الإجابة «'+strip(q.o[q.a])+'»؟',o:[q.ex,...shuffle([...new Set(others)]).slice(0,2)],a:0,ex:q.ex})});return QZ(qs,'coach',a[0],sc)}
  if(id==='village')return village();
  if(id==='sky')return sky();
  if(id==='pad')return pad();
  if(id.startsWith('m-')){const uid=id.slice(2);const u=U.find(x=>x.id===uid);const us=LES.filter(l=>l.u===uid||l.u===u);const vocab=dat('cards').filter(d=>d.les.some(x=>us.some(l=>l.id===x)));const sents=dat('build').filter(d=>d.les.some(x=>us.some(l=>l.id===x)));
    let qs=shuffle(us.flatMap(l=>G.bookQs?G.bookQs(l):[])).slice(0,6);
    qs=qs.concat(shuffle(vocab).slice(0,3).map(v=>({html:1,q:'ما معنى '+W(v[0])+'؟<br><small class="mut">كتاب الطالب ص '+PG(v[2])+'</small>',o:[v[1],...shuffle(vocab.filter(x=>x[1]!==v[1]).map(x=>x[1])).slice(0,3)],a:0,ex:v[0]+' = '+v[1]})));
    qs=qs.concat(shuffle(sents).slice(0,1).map(s=>{const w=s[0].split(' ');const bad=shuffle(w.slice()).join(' ');return {html:1,q:'أيّ ترتيب صحيح؟ (ص '+PG(s[1])+')',o:[W(s[0]),W(bad===s[0]?w.slice().reverse().join(' '):bad)],a:0,ex:s[0]}}));
    return QZ(qs,id,a[0],sc)}
  return oldAdv?oldAdv(id,sc):'';
};
const rank=()=>{const n=ST.det||0;return n>=20?'محقق ذهبي ★★★':n>=10?'محقق فضي ★★':n>=3?'محقق برونزي ★':'محقق مبتدئ'};
// قصة القرية: لكل وحدة جزء من القرية (يبنى عند ≥٧٠٪)
const VP=['البيت','البئر','الحقل','المدرسة','الجسر','السوق','الطاحونة','البستان','المسجد','الملعب','البرج','المكتبة'];
function village(){const parts=U.map((u,i)=>({u,p:VP[i%VP.length],ok:(S.done['adv:village:'+u.id]||0)>=70}));const n=parts.filter(x=>x.ok).length;
  const svg='<svg viewBox="0 0 '+(parts.length*60+20)+' 120" style="width:100%;max-height:170px">'+'<rect x="0" y="95" width="100%" height="25" fill="#cfe5b7"/>'+parts.map((x,i)=>{const X=10+i*60;return x.ok?'<g><rect x="'+(X+8)+'" y="55" width="40" height="40" fill="#f3c98b" stroke="#8a5a2b"/><polygon points="'+(X+4)+',57 '+(X+28)+',30 '+(X+52)+',57" fill="#c0603a"/><text x="'+(X+28)+'" y="112" font-size="10" text-anchor="middle">'+x.p+'</text></g>':'<g opacity=".35"><rect x="'+(X+8)+'" y="55" width="40" height="40" fill="none" stroke="#888" stroke-dasharray="4"/><text x="'+(X+28)+'" y="112" font-size="10" text-anchor="middle">'+x.p+'</text></g>'}).join('')+'</svg>';
  return back('#/play','المغامرات')+'<h2>قصة القرية</h2><p class="mut">أجب عن أسئلة الوحدة بنسبة ٧٠٪ أو أكثر لتبني جزءها. بُني '+AR(n)+' من '+AR(parts.length)+'.</p><div class="card">'+svg+'</div><div class="grid">'+parts.map((x,i)=>tile('#/vq/'+x.u.id,x.ok?'check':'home',x.p+' — '+esc(x.u.t||x.u.id),x.ok?'مبنيّ ✓':'ابنِه بأسئلة هذه الوحدة','c'+(i%6))).join('')+'</div>'}
R.vq=uid=>{const ls=LES.filter(l=>l.u===uid||(l.u&&l.u.id===uid));return quiz(poolAll(ls.length?ls:LES,8),{key:'adv:village:'+uid,title:'قصة القرية',back:'#/adv/village'})};
// سماء مهاراتي: سطوع النجمة = آخر نتيجة مع تلاشٍ حسب منحنى النسيان
function sky(){const now=Date.now();ST.t=ST.t||{};
  const ls=LES.map(l=>{const d=S.done[l.id]||0,t=ST.t[l.id]||0;const days=t?(now-t)/864e5:99;const b=d?d/100*Math.exp(-days/14):0;return {l,b}});
  return back('#/play','المغامرات')+'<h2>سماء مهاراتي</h2><p class="mut">كلّ درس نجمة. النجمة تلمع بنتيجتك، وتخفت مع مرور الأيام دون مراجعة. اضغط نجمة باهتة لتراجعها.</p><div class="card" style="background:#14213d;color:#fff;display:flex;flex-wrap:wrap;gap:6px;padding:14px">'+ls.map(x=>'<a href="#/sq/'+x.l.id+'" title="'+esc(x.l.t)+'" style="color:#fff;text-decoration:none;text-align:center;width:74px;font-size:11px"><div style="font-size:30px;opacity:'+(0.2+0.8*x.b).toFixed(2)+';color:#ffd54a">★</div>'+esc(x.l.t).slice(0,22)+'</a>').join('')+'</div>'}
R.sq=id=>{const l=LID(id);ST.t=ST.t||{};ST.t[id]=Date.now();sv();return quiz(pool(l,8),{key:id,title:'سماء مهاراتي: '+esc(l.t),back:'#/adv/sky'})};
// لوحة الكتابة: تمرين من الكتاب + خطوات سطرًا سطرًا + تحقّق من السطر الأخير
const exList=()=>LES.flatMap(l=>(l.ex||[]).map(e=>({l,q:e[0],a:e[1]}))).filter(e=>/\d/.test(e.a));
const nums=s=>(String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[,٬](?=\d{3}\b)/g,'').match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>x.replace(',','.'));
function pad(){return back('#/play','المغامرات')+'<h2>لوحة الكتابة</h2><p class="mut">اكتب خطوات الحلّ سطرًا سطرًا، واكتب الناتج في السطر الأخير. نتحقّق من الناتج بإجابة الكتاب.</p><div class="card" id="pd"></div>'}
const oldAA=R.after_adv;R.after_adv=(id,sc)=>{if(id==='pad')padInit();else if(oldAA)oldAA(id,sc)};
function padInit(){const box=A.$('#pd');if(!box)return;const E=exList();if(!E.length){box.innerHTML='<p>لا تمارين عددية.</p>';return}const e=pick(E);
  box.innerHTML='<p><b>'+esc(e.q)+'</b></p><p class="mut small">من درس '+lnk(e.l)+'</p><textarea id="pl" rows="5" style="width:100%;font-size:18px" placeholder="السطر ١: …"></textarea><div class="row"><button class="btn" id="pc">تحقّق</button><button class="btn ghost" id="ps">اعرض حلّ الكتاب</button><button class="btn ghost" id="pn">تمرين آخر</button></div><div id="po" class="lab-out"></div>';
  const o=A.$('#po');A.$('#pc').onclick=()=>{const ln=A.$('#pl').value.trim().split('\n').filter(Boolean);if(!ln.length){o.textContent='اكتب خطوة واحدة على الأقل.';return}const want=nums(e.a),got=nums(ln[ln.length-1]);const ok=want.length&&got.some(g=>want.includes(g));o.innerHTML=(ok?'✓ أحسنت! السطر الأخير يطابق إجابة الكتاب. عدد الخطوات: '+AR(ln.length):'✗ السطر الأخير لا يطابق إجابة الكتاب بعد. راجع خطواتك.');if(ok){ST.pad=(ST.pad||0)+1;fin('adv:pad',100);A.addXP&&A.addXP(10)}};
  A.$('#ps').onclick=()=>{o.innerHTML='حلّ الكتاب: <b>'+esc(e.a)+'</b>'};A.$('#pn').onclick=padInit}

/* ================= قواعد العربية (دروب القواعد / بنّاء القواعد) ================= */
const GR=[['الاستفهام',/^(هل|متى|أين|كيف|لماذا|ماذا|كم|مَن|أيّ)$/],['الضمير',/^(أنا|نحن|أنتَ|أنتِ|أنتما|أنتم|أنتنّ|هو|هي|هما|هم|هنّ)$/],['اسم الإشارة',/^(هذا|هذه|هذان|هاتان|هؤلاء|ذلك|تلك|أولئك)$/],['حرف الجرّ',/^(في|إلى|على|عن)$/]];
const tok=s=>s.replace(/[«»().،؟!:؛]/g,' ').split(/\s+/).filter(Boolean);
const gramBank=()=>{const out=[];LES.forEach(l=>{const ss=[].concat((l.ex||[]).map(e=>e[1]),(l.pts||[]),(l.bmc||[]).map(b=>b[0]));ss.forEach(s=>{if(!s||s.length>110)return;const w=tok(String(s).replace(/\(ص[^)]*\)/g,''));if(w.filter(x=>GR.some(g=>g[1].test(x))).length!==1)return;w.forEach((x,i)=>{const b=x.replace(/^[وف]?/,'');const g=GR.find(g=>g[1].test(x));if(g)out.push({s:w,i,g:g[0],l})})})});return out};
function gramQs(n){const B=shuffle(gramBank()).slice(0,n);return B.map(b=>({html:1,q:'ما نوع الكلمة الملوّنة؟<br>'+b.s.map((x,i)=>i===b.i?'<b style="color:#c0392b">'+esc(x)+'</b>':esc(x)).join(' ')+'<br><small class="mut">من درس «'+esc(b.l.t)+'» ص '+PG(b.l.pg)+'</small>',o:GR.map(g=>g[0]),a:GR.findIndex(g=>g[0]===b.g),keep:1,ex:'«'+b.s[b.i]+'» '+b.g+'.'}))}
// تصريف الماضي للأفعال الصحيحة من الكتاب مع الضمائر
const PR=[['أنا','ْتُ'],['نحن','ْنا'],['أنتَ','ْتَ'],['أنتِ','ْتِ'],['أنتما','ْتُما'],['أنتم','ْتُم'],['أنتنّ','ْتُنَّ'],['هو','َ'],['هي','َتْ'],['هما','ا'],['هم','وا'],['هنّ','ْنَ']];
const conj=(v,p)=>v+p[1];

/* ================= المختبر ================= */
const labTiles=()=>{
  if(SUB==='science')return items('sim').map(i=>({h:'#/l/'+i.id,ic:'flask',t:i.t,s:(LID(i.les[0])||{}).t||'',id:i.id}));
  if(SUB==='math')return items().map(i=>({h:'#/l/'+i.id,ic:'lab',t:i.t,s:'مرتبط بـ '+i.les.length+' دروس',id:i.id})).concat([{h:'#/l/race',ic:'bolt',t:LABS.race[0],s:LABS.race[1],id:'race'}]);
  return Object.keys(LABS).map(k=>({h:'#/l/'+k,ic:LABS[k][2],t:LABS[k][0],s:LABS[k][1],id:k,cat:LABS[k][3]}))};
R.lab=()=>{const ts=labTiles();const tried=ts.filter(t=>S.done['lab:'+t.id]).length;
  const p=SUB==='science'?'محاكاة لكلّ فكرة رئيسة في دروس الكتاب.':SUB==='math'?'أدوات تجرّب بها أفكار الكتاب بيديك. جرّبت '+AR(tried)+' من '+AR(ts.length)+'.':'أدوات تفاعليّة مبنيّة على دروس الكتاب.';
  return grid('المختبر',p,ts.map((t,i)=>tile(t.h,t.ic,t.t+(S.done['lab:'+t.id]?' ✓':''),esc(t.s),'c'+(i%6)+(t.cat?' cat-'+t.cat:''))))};
const oldL=R.l,oldAL=R.after_l;
const lesOf=ids=>(ids||[]).map(LID).filter(Boolean);
R.l=id=>{S.done['lab:'+id]=S.done['lab:'+id]||0;
  const it=(L.items||[]).find(x=>x.id===id);
  if(SUB==='science'&&it){const l=LID(it.les[0]);const M=window.SIMS&&window.SIMS[it.sim];return '<div class="mut small"><a href="#/lab">المختبر</a>'+(l?' · مرتبط بدرس '+lnk(l):'')+'</div><h2>'+esc(it.t)+'</h2><p class="source-note">رسم تعليمي مبسّط؛ الأبعاد والسرعات في العرض ليست بمقياس رسم.</p><div class="lab card" id="sim">'+(M?M.html():'')+'</div>'}
  if(SUB==='math'){const t=it?[it.t,'جرّب أفكار الدّروس بنفسك وراقب ما يتغيّر.']:LABS.race;const body=it?(T[it.k]?T[it.k].html(it):''):'<div id="rc"></div>';
    return '<a class="mut small" href="#/lab">← المختبر</a><h1>'+esc(t[0])+'</h1><p class="mut">'+t[1]+'</p><div class="row"><img src="img/zaytoun-think.webp" alt="" style="width:56px" onerror="this.remove()"><b>جرّب بنفسك!</b></div><div class="card lab">'+body+'</div>'+(it?'<div class="card"><b>مرتبط بـ</b><div class="chips">'+lesOf(it.les).map(l=>'<a class="tag" href="#/u/'+l.id+'">'+esc(l.t)+' · ص '+PG(l.pg)+'</a>').join(' ')+'</div></div>':'')}
  const a=LABS[id];if(!a)return oldL?oldL(id):R.lab();
  return back('#/lab','المختبر')+'<h2>'+a[0]+'</h2><p class="mut">'+a[1]+'</p><div class="lab card" id="lb"></div>'+NOTE};
R.after_l=id=>{const it=(L.items||[]).find(x=>x.id===id);const root=A.$('#app');const mark=()=>{if(!S.done['lab:'+id]){S.done['lab:'+id]=100;sv();A.checkAch&&A.checkAch()}};
  root.addEventListener('click',mark,{once:true});
  if(SUB==='science'&&it){const M=window.SIMS&&window.SIMS[it.sim];if(M&&M.init)M.init(A.$('#sim'));return}
  if(SUB==='math'&&it){T[it.k]&&T[it.k].init&&T[it.k].init(it,root);return}
  const box=A.$('#lb')||A.$('#rc');if(!box){oldAL&&oldAL(id);return}
  (LI[id]||(()=>{}))(box)};
const LI={};
// سباق (الأعداد / الكلمات): ٦٠ ثانية، ٥ متتالية = +٣ ث، خطأ = −٣ ث
function race(box,gen){let t=60,sc=0,st=0,q,tm;const best='race';box.innerHTML='<div class="row"><b id="rt">⏱ ٦٠</b> · <b id="rs">النقاط: ٠</b> · <span class="mut">أفضل: '+AR(ST[best]||0)+'</span></div><div id="rq"></div><button class="btn" id="rg">ابدأ</button>';
  const nx=()=>{q=gen();if(q){const r=q.o[q.a],o=shuffle(q.o.slice());q={q:q.q,o:o,a:o.indexOf(r)}}if(!q){A.$('#rq').innerHTML='لا أسئلة.';return}A.$('#rq').innerHTML='<p class="big">'+q.q+'</p><div class="chips">'+q.o.map((o,i)=>'<button class="chip" data-i="'+i+'">'+o+'</button>').join('')+'</div>';A.$$('#rq .chip').forEach(b=>b.onclick=()=>{if(t<=0)return;if(+b.dataset.i===q.a){sc++;st++;if(st%5===0){t+=3;A.toast&&A.toast('+٣ ثوانٍ!')}}else{st=0;t=Math.max(0,t-3)}A.$('#rs').textContent='النقاط: '+AR(sc);nx()})};
  A.$('#rg').onclick=()=>{A.$('#rg').remove();nx();tm=setInterval(()=>{t--;const e=A.$('#rt');if(!e){clearInterval(tm);return}e.textContent='⏱ '+AR(Math.max(t,0));if(t<=0){clearInterval(tm);ST[best]=Math.max(ST[best]||0,sc);S.done['lab:race']=100;sv();A.addXP&&A.addXP(sc*2);A.$('#rq').innerHTML='<h3>انتهى الوقت! نقاطك: '+AR(sc)+'</h3><a class="btn" href="#/l/race">مرة أخرى</a>'}},1000)}}
LI.race=box=>{if(SUB==='math')race(box,()=>{const l=pick(LES.filter(l=>(G.NUM&&G.NUM[l.id]||[]).length||(l.bmc||[]).length));return l?Object.assign({html:1},pool(l,1)[0]):null});
  else{const V=dat('cards');race(box,()=>{const v=pick(V);return {q:W(v[0]),o:[esc(v[1]),...[...new Set(V.filter(x=>x[1]!==v[1]).map(x=>x[1]))].sort(()=>Math.random()-.5).slice(0,3).map(esc)],a:0}})}};
// العربية
LI.hamza=box=>{const X=dat('drill').filter(d=>d[1].includes('أ'))||[];const W2=(L.items.find(i=>i.id==='x-wasl')||{data:[]}).data;let d;
  const go=()=>{d=pick(W2);const word=d[0].replace('▢','<b style="color:#c0392b">؟</b>');box.innerHTML='<p class="big">'+word+'</p><p class="mut small">من كتاب الطالب ص '+PG(d[4])+'</p><p><b>الخطوة ١:</b> هل الهمزة تُلفظ عند وصل الكلام؟</p><div class="chips"><button class="chip" data-s="q">نعم، تُلفظ ← همزة قطع</button><button class="chip" data-s="w">لا، تسقط ← همزة وصل</button></div><div id="h2"></div><div id="ho" class="lab-out"></div><button class="btn ghost" id="hn">كلمة أخرى</button>';
    const right=d[1][d[2]],isW=right==='ا';
    A.$$('#lb .chip[data-s]').forEach(b=>b.onclick=()=>{const ok=(b.dataset.s==='w')===isW;A.$('#ho').textContent=ok?'✓ صحيح.':'✗ فكّر مرّة أخرى: انطقها بعد «و».';if(!ok)return;
      A.$('#h2').innerHTML='<p><b>الخطوة ٢:</b> اختر الصورة الصحيحة:</p><div class="chips">'+d[1].map((o,i)=>'<button class="chip" data-i="'+i+'">'+o+'</button>').join('')+'</div>';
      A.$$('#h2 .chip').forEach(c=>c.onclick=()=>{A.$('#ho').textContent=+c.dataset.i===d[2]?'✓ '+d[3]:'✗ حاول مجددًا.'})});
    A.$('#hn').onclick=go};go()};
LI.irab=box=>{const B=gramBank();const go=()=>{const b=pick(B);box.innerHTML='<p class="big">'+b.s.map((x,i)=>i===b.i?'<b style="color:#c0392b">'+esc(x)+'</b>':esc(x)).join(' ')+'</p><p class="mut small">من درس «'+esc(b.l.t)+'» ص '+PG(b.l.pg)+'</p><p>نوع الكلمة الملوّنة:</p><div class="chips">'+GR.map((g,i)=>'<button class="chip" data-i="'+i+'">'+g[0]+'</button>').join('')+'</div><div id="io" class="lab-out"></div><button class="btn ghost" id="in">جملة أخرى</button>';
  A.$$('#lb .chip').forEach(c=>c.onclick=()=>{const ok=GR[+c.dataset.i][0]===b.g;c.classList.add(ok?'on':'');A.$('#io').textContent=ok?'✓ «'+b.s[b.i]+'» '+b.g+'.':'✗ ليست '+GR[+c.dataset.i][0]+'.'});A.$('#in').onclick=go};go()};
LI.imla=box=>{const X=shuffle(dat('drill')).slice(0,10).map(d=>({q:'أكمل الكلمة: '+d[0].replace('▢','ـــ')+'<br><small class="mut">كتاب الطالب ص '+PG(d[4])+'</small>',html:1,o:d[1],a:d[2],keep:1,ex:d[3]}));box.innerHTML='';R._imla=X;location.replace('#/imla')};
R.imla=()=>quiz(R._imla||[],{key:'lab:imla',title:'ورشة الإملاء',back:'#/lab'});
LI.sarf=box=>{const V=D.verbs||[];let v=V[0];const draw=()=>{box.innerHTML='<p>اختر فعلًا من الكتاب:</p><div class="chips">'+V.map((x,i)=>'<button class="chip'+(x===v?' on':'')+'" data-v="'+i+'">'+x[0]+'</button>').join('')+'</div><p class="mut small">ص '+PG(v[1])+'</p><table class="tbl">'+PR.map(p=>'<tr><td>'+p[0]+'</td><td><b>'+conj(v[0],p)+'</b></td></tr>').join('')+'</table><hr><p><b>اختبر نفسك:</b> <span id="sq"></span></p><div class="chips" id="sc"></div><div id="so" class="lab-out"></div>';
  A.$$('#lb [data-v]').forEach(b=>b.onclick=()=>{v=V[+b.dataset.v];draw()});const p=pick(PR);A.$('#sq').textContent='«'+v[0]+'» مع «'+p[0]+'»';const o=shuffle([p,...shuffle(PR.filter(x=>x!==p)).slice(0,2)]);A.$('#sc').innerHTML=o.map(x=>'<button class="chip" data-c="'+(x===p?1:0)+'">'+conj(v[0],x)+'</button>').join('');A.$$('#sc .chip').forEach(c=>c.onclick=()=>{A.$('#so').textContent=c.dataset.c==='1'?'✓ صحيح':'✗ حاول مجددًا'})};if(v)draw()};
LI.khatt=box=>{const it=L.items.find(i=>i.k==='khatt');if(it&&T.khatt){box.innerHTML=T.khatt.html(it);T.khatt.init&&T.khatt.init(it,box)}};
// الإنجليزية
const say=t=>{try{const u=new SpeechSynthesisUtterance(t);u.lang='en-GB';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}};
LI.sb=box=>{const it={k:'build',data:dat('build')};if(T.build){box.innerHTML=T.build.html(it);T.build.init&&T.build.init(it,box)}};
LI.tm=box=>{const V=D.tm||[];let v=0,t=0;const TT=['now','every day','yesterday','tomorrow'],TL=['الآن','كلّ يوم','أمس','غدًا (going to)'];
  const draw=()=>{const x=V[v];box.innerHTML='<div class="chips">'+V.map((y,i)=>'<button class="chip'+(i===v?' on':'')+'" data-v="'+i+'">'+W(y.base)+'</button>').join('')+'</div><input type="range" min="0" max="3" value="'+t+'" id="tr" style="width:100%"><div class="row" style="justify-content:space-between">'+TL.map(x=>'<small>'+x+'</small>').join('')+'</div><p class="big">'+W(x.s[t])+'</p><p class="mut small">'+TT[t]+' · الفعل من كتاب الطالب ص '+PG(x.pg)+'</p><button class="btn ghost" id="ts">🔊</button>';
    A.$$('#lb [data-v]').forEach(b=>b.onclick=()=>{v=+b.dataset.v;draw()});A.$('#tr').oninput=e=>{t=+e.target.value;draw()};A.$('#ts').onclick=()=>say(x.s[t])};if(V.length)draw()};
LI.sl=box=>{const V=dat('spell');let w;const go=()=>{w=pick(V);box.innerHTML='<p>استمع واكتب الكلمة (معناها: '+esc(w[1])+' · ص '+PG(w[2])+')</p><button class="btn" id="sp">🔊 استمع</button><input id="si" dir="ltr" autocomplete="off" style="font-size:22px;width:100%"><div id="sv" class="big ltr" dir="ltr"></div><button class="btn ghost" id="sn">كلمة أخرى</button>';
  A.$('#sp').onclick=()=>say(w[0]);A.$('#si').oninput=e=>{const s=e.target.value;A.$('#sv').innerHTML=[...s].map((c,i)=>'<span style="color:'+(c.toLowerCase()===(w[0][i]||'').toLowerCase()?'#2e7d32':'#c62828')+'">'+esc(c)+'</span>').join('');if(s.toLowerCase()===w[0].toLowerCase()){A.toast&&A.toast('✓ ممتاز!');ST.sl=(ST.sl||0)+1;sv()}};A.$('#sn').onclick=go;say(w[0])};if(V.length)go()};
LI.pm=box=>{const V=dat('build').map(d=>[d[0],d[1]]);let s,rec,chunks=[];const go=()=>{s=pick(V);box.innerHTML='<p class="big">'+W(s[0])+'</p><p class="mut small">كتاب الطالب ص '+PG(s[1])+'</p><div class="row"><button class="btn" id="pa">🔊 النموذج</button><button class="btn" id="pr">⏺ سجّل</button><button class="btn ghost" id="pp" disabled>▶ صوتي</button><button class="btn ghost" id="pn">جملة أخرى</button></div><p class="mut small" id="pt">استمع للنموذج، ثم سجّل صوتك واستمع وقارن.</p>';
  A.$('#pa').onclick=()=>say(s[0]);A.$('#pn').onclick=go;let url;
  A.$('#pr').onclick=async()=>{if(rec&&rec.state==='recording'){rec.stop();return}try{const st=await navigator.mediaDevices.getUserMedia({audio:true});rec=new MediaRecorder(st);chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());url=URL.createObjectURL(new Blob(chunks));A.$('#pp').disabled=false;A.$('#pr').textContent='⏺ سجّل';A.$('#pt').textContent='استمع لصوتك ثم للنموذج وقارن.';ST.pm=(ST.pm||0)+1;sv()};rec.start();A.$('#pr').textContent='⏹ أوقف'}catch(e){A.$('#pt').textContent='لا يمكن الوصول إلى الميكروفون في هذا المتصفح.'}};
  A.$('#pp').onclick=()=>{if(url)new Audio(url).play()}};if(V.length)go()};
// محقق القواعد (الإنجليزية): جملة من الكتاب بُدّلت فيها كلمتان متجاورتان
function enDet(n){const S2=dat('build').filter(d=>d[0].split(' ').length>=4);return shuffle(S2).slice(0,n).map(d=>{const ok=shuffle(S2.filter(x=>x!==d)).slice(0,2);const w=d[0].split(' ');const i=1+Math.floor(Math.random()*(w.length-2));[w[i],w[i+1]]=[w[i+1],w[i]];const o=shuffle([w.join(' '),...ok.map(x=>x[0])]);return {html:1,q:'أيّ جملة فيها خطأ في ترتيب الكلمات؟',o:o.map(W),a:o.indexOf(w.join(' ')),keep:1,ex:'الصحيح: '+d[0]+' (ص '+PG(d[1])+')'}})}
// صفحة الدرس: «جرّب في المختبر»
const oldU=R.u;R.u=(...a)=>{let h=oldU?oldU(...a):'';const l=LID(a[0]);if(!l)return h;
  const its=SUB==='science'?items('sim').filter(i=>i.les.includes(l.id)):SUB==='math'?items().filter(i=>i.les.includes(l.id)):[];
  if(its.length){const tl='<div class="grid">'+its.map(i=>tile('#/l/'+i.id,'flask','جرّب في المختبر: '+esc(i.t),SUB==='science'?'محاكاة تفاعليّة مرتبطة بهذا الدّرس':'أداة تفاعليّة مرتبطة بهذا الدّرس','c1')).join('')+'</div>';h=String(h).replace(/(<button class="btn big" id="go")/,tl+'$1');if(!h.includes(tl))h+=tl}
  return h};
})();
