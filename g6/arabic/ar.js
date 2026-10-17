// مادّة اللغة العربيّة: الرّحلة، الأقسام، الأسئلة المولَّدة، المختبر، الأساسيّات، المغامرات
(function(){
'use strict';
const A=window.APP,B=window.ARB,U=window.UNITS,C=window.CFG,G=C.grade;
const {esc,ic,pick,shuffle,rnd,S,R,quiz,say,fig}=A;
const strip=s=>String(s).replace(/[\u064B-\u0652\u0640\u0670]/g,'').replace(/[أإآ]/g,'ا').trim();
const SEC={read:['القِراءَة','book'],poem:['النَّصُّ الشِّعْرِيّ','feather'],grammar:['القَواعِد','puzzle'],balagha:['البَلاغَة','star'],imla:['الإِمْلاء','pen'],khatt:['الخَطّ','quill'],taabir:['التَّعْبير','pen']};
const ORD=['read','poem','grammar','balagha','imla','khatt','taabir'];
const ORDN=['الأولى','الثّانية','الثّالثة','الرّابعة','الخامسة','السّادسة','السّابعة','الثّامنة','التّاسعة','العاشرة'];
const uById=id=>U.find(u=>u.id===id);
const uname=u=>(u.sec.read&&u.sec.read.t)||'';
C.sections=()=>{const o=[];U.forEach(u=>ORD.forEach(k=>{if(u.sec[k])o.push({key:u.id+':'+k,name:'الوحدة '+ORDN[u.n-1]+' (ج'+u.part+') — '+SEC[k][0]+': '+u.sec[k].t,href:'#/u/'+u.id+'/'+k})}));return o};
const ap=C.ap;
// ———— مولّدات الأسئلة (كلّها تُفحص في fuzz-ar.js) ————
const POOL={voc:[],verses:[],terms:[]};
U.forEach(u=>{['read','poem'].forEach(k=>{const s=u.sec[k];if(s&&s.voc)s.voc.forEach(v=>{if(v[0]&&v[1]&&v[1].length<90)POOL.voc.push(v)})});
 ['grammar','balagha','imla'].forEach(k=>{const s=u.sec[k];if(s&&s.pts)s.pts.forEach(p=>{const m=/^([^:：]{2,40})[:：]\s*(.{8,})$/.exec(p);if(m)POOL.terms.push([m[1].trim(),m[2].trim(),u.id+':'+k])})})});
function distinct(correct,pool,n,key){key=key||strip;const seen=new Set([key(correct)]);const out=[];for(const x of shuffle(pool)){const k=key(x);if(!k||seen.has(k))continue;seen.add(k);out.push(x);if(out.length>=n)break}return out}
function vocabQs(u,n){const own=[],sw=new Set();['read','poem'].forEach(k=>{const s=u.sec[k];if(s&&s.voc)s.voc.forEach(v=>{if(v[0]&&v[1]&&v[1].length<90&&!sw.has(v[0])){sw.add(v[0]);own.push(v)}})});
 return shuffle(own).slice(0,n).map(v=>{const d=distinct(v[1],POOL.voc.map(x=>x[1]),3);return d.length<3?null:{q:'ما معنى <span class="ar">«'+esc(v[0])+'»</span>؟',o:[v[1],...d],a:0,ex:v[0]+': '+v[1]}}).filter(Boolean)}
const STOP=new Set(['الذي','التي','الذين','هذا','هذه','ذلك','تلك','كان','كانت','على','الى','إلى','عن','حتى','بين','عند','لكن','ولكن','قال','فقال','كل','بعد','قبل','منذ','فيها','فيه','منها','منه','انه','انها','ثم','لقد','وقد','هذا','هو','هي','هم','نحن']);
function words(t){return t.split(/\s+/).map(w=>w.replace(/^[«"(\[\-–]+|[»")\].,،؛:!؟?\-–]+$/g,'')).filter(Boolean)}
function clozeQs(u,n){const r=u.sec.read;if(!r)return[];const text=r.paras.join(' ');const allW=[...new Set(words(text).filter(w=>strip(w).length>=4&&!/[0-9٠-٩]/.test(w)))];
 const sents=text.split(/(?<=[.؟!؛])\s+/).map(s=>s.trim()).filter(s=>{const c=words(s).length;return c>=6&&c<=24&&!/[0-9٠-٩]/.test(s)});
 const out=[];for(const s of shuffle(sents)){if(out.length>=n)break;const ws=words(s);const cand=ws.filter(w=>strip(w).length>=4&&!STOP.has(strip(w))&&!STOP.has(strip(w).replace(/^و/,'')));if(!cand.length)continue;
  const w=pick(cand);const inS=new Set(ws.map(strip));const d=distinct(w,allW.filter(x=>!inS.has(strip(x))&&Math.abs(strip(x).length-strip(w).length)<=3),3);if(d.length<3)continue;
  const i=s.indexOf(w);if(i<0)continue;out.push({q:'اختر الكلمة المناسبة للفراغ كما وردت في النّصّ:<br><span class="ar">'+esc(s.slice(0,i))+' ـــــــ '+esc(s.slice(i+w.length))+'</span>',o:[w,...d],a:0,arOpt:1,ex:'من نصّ «'+r.t+'»'})}return out}
function verseQs(u,n){const p=u.sec.poem;if(p&&p.lines&&!p.verses.length){const L=p.lines.filter(l=>l!=='*');const pr=[];for(let i=0;i+1<L.length;i++)if(L[i+1].length>12&&L[i].length>8)pr.push([L[i],L[i+1]]);if(pr.length<4)return[];return shuffle(pr).slice(0,n).map(v=>{const d=distinct(v[1],pr.map(x=>x[1]),3);return{q:'ما السّطر الّذي يلي:<br><span class="ar">'+esc(v[0])+' ...</span>',o:[v[1],...d],a:0,arOpt:1,ex:'من قصيدة «'+p.t+'»'}})}if(!p||p.verses.length<4)return[];return shuffle(p.verses.map((v,i)=>i)).slice(0,n).map(i=>{const v=p.verses[i];const d=distinct(v[1],p.verses.map(x=>x[1]),3);return{q:'أكمل البيت:<br><span class="ar">'+esc(v[0])+' ...</span>',o:[v[1],...d],a:0,arOpt:1,ex:'من قصيدة «'+p.t+'»'}})}
function termQs(key,n){const own=POOL.terms.filter(t=>t[2]===key);return shuffle(own).slice(0,n).map(t=>{const d=distinct(t[0],POOL.terms.map(x=>x[0]),3);return d.length<2?null:{q:'أيّ مصطلح يطابق هذا التّعريف؟<br>'+esc(t[1]),o:[t[0],...d],a:0,ex:t[0]+': '+t[1]}}).filter(Boolean)}
const BQ={
 wasl:()=>B.wasl.map(x=>({q:'همزة الكلمة <span class="ar">«'+x[0].replace('_','')+'»</span> همزة:',o:[x[1],x[1]==='قطع'?'وصل':'قطع'],a:0,ex:x[2]})),
 hamza:()=>B.hamza.map(x=>({q:'اختر صورة الهمزة الصّحيحة:<br><span class="ar" style="font-size:30px">'+x[0].replace('_','؟')+'</span>',o:[x[1],...['أ','ؤ','ئ','ء'].filter(s=>s!==x[1])],a:0,arOpt:1,ex:why(x)})),
 taa:()=>B.taa.map(x=>({q:'أكمل بالتّاء المناسبة: <span class="ar">'+x[0].replace('_','؟')+'</span>',o:[x[1],x[1]==='ة'?'ت':'ة'],a:0,arOpt:1,ex:x[2]})),
 alif:()=>B.alif.map(x=>({q:'أكمل بالألف المناسبة: <span class="ar">'+x[0].replace('_','؟')+'</span>',o:[x[1],x[1]==='ا'?'ى':'ا'],a:0,arOpt:1,ex:x[2]})),
 alif8:()=>B.alif8.map(x=>({q:'اكتب الكلمة <span class="ar">'+x[0]+'</span> كتابةً صحيحة:',o:[x[1],...B.wrongAlt[x[1]]],a:0,arOpt:1,ex:x[2]})),
 irab:lv=>{const P=B.irab.filter(x=>x[3]<=lv);return P.map(x=>({q:'ما إعراب <span class="ar">«'+x[1]+'»</span> في: <span class="ar">'+x[0]+'</span>؟',o:[x[2],...distinct(x[2],P.map(y=>y[2]),3,s=>s)],a:0,ex:x[2]}))},
 mazid:()=>B.mazid.map(x=>({q:'الفعل <span class="ar">«'+x[0]+'»</span>:',o:[x[1],...distinct(x[1],B.mazidOpts,3,s=>s)],a:0,ex:x[0]+': '+x[1]})),
 kalima:()=>B.kalima.map(x=>({q:'الكلمة <span class="ar">«'+x[0]+'»</span>:',o:[x[1],...['اسم','فعل','حرف'].filter(s=>s!==x[1])],a:0})),
 shams:()=>B.shams.map(x=>({q:'اللّام في <span class="ar">«'+x[0]+'»</span>:',o:[x[1],x[1]==='شمسيّة'?'قمريّة':'شمسيّة'],a:0,ex:x[1]==='شمسيّة'?'تُكتب ولا تُلفظ، ويُشدَّد الحرف بعدها':'تُكتب وتُلفظ'})),
 haraka:()=>B.haraka.map(x=>({q:x[0],o:[x[1],...distinct(x[1],B.haraka.map(y=>y[1]),3,s=>s)],a:0})),
 jumla:()=>B.jumla.map(x=>({q:'الجملة <span class="ar">«'+x[0]+'»</span>:',o:[x[1],x[1]==='اسميّة'?'فعليّة':'اسميّة'],a:0,ex:x[1]==='اسميّة'?'بدأت باسم':'بدأت بفعل'})),
 damir:()=>B.damir.map(x=>({q:'الضّمير <span class="ar">«'+x[0]+'»</span> يُستعمل:',o:[x[1],...distinct(x[1],B.damir.map(y=>y[1]),3,s=>s)],a:0}))};
['farqa','amr','hadhf','zaid','mawsul','tarqim'].forEach(k=>BQ[k]=()=>B[k].map(x=>({q:x[0].includes('___')?'اختر الصّواب: <span class="ar">'+x[0].replace('___','ــــ')+'</span>':x[0],o:x[1],a:0,arOpt:1,ex:x[2]})));
const VN={k:'الكسرة',u:'الضّمّة',a:'الفتحة',s:'السّكون',A:'ألف ساكنة',W:'واو مدّ ساكنة',Y:'ياء ساكنة','':''};
function why(x){if(x[4]==='e')return 'همزة متطرّفة: تُكتب على حرف يناسب حركة ما قبلها ('+VN[x[3]]+') فتكون «'+x[1]+'».';
 return 'همزة متوسّطة: حركتها '+VN[x[2]]+'، وقبلها '+VN[x[3]]+'، فتُكتب «'+x[1]+'».'}
const IMLA=G===6?{P1U1:'wasl',P1U2:'wasl',P1U4:'wasl',P1U5:'wasl',P1U7:'hadhf',P1U8:'hadhf',P2U1:'farqa',P2U2:'zaid',P2U4:'mawsul',P2U5:'mawsul',P2U7:'tarqim',P2U8:'tarqim'}:{P1U1:'hamza',P1U2:'hamza',P1U3:'hamza',P1U4:'alif8',P1U5:'alif',P1U6:'alif',P1U7:'alif',P2U1:'farqa',P2U3:'farqa,alif',P2U5:'amr'};
const MIX=G===6?'wasl,taa,alif,hadhf,mawsul':'hamza,alif,alif8,farqa,amr,taa';
function imlaQs(u,n){const ks=(IMLA[u.id]||MIX).split(',');let all=[];ks.forEach(k=>all=all.concat(BQ[k](G)));return shuffle(all).slice(0,n)}
function secQs(u,k){const key=u.id+':'+k;let q=[];
 if(k==='read')q=vocabQs(u,4).concat(clozeQs(u,4));
 else if(k==='poem')q=verseQs(u,5).concat(vocabQs(u,2));
 else if(k==='grammar')q=(u.sec.grammar.q||[]).map(x=>({q:x[0],o:x[1],a:x[2],ex:x[3]})).concat(termQs(key,3)).concat(G===8&&/مضارع|بناء|المعرب|كان|إنّ|إِنَّ|كادَ|المُبْتَدَأ|المجهول|لِلْمَجْهولِ/.test(u.sec.grammar.t)?shuffle(BQ.irab(8)).slice(0,3):[]);
 else if(k==='balagha')q=termQs(key,4).concat(shuffle(POOL.terms.filter(t=>/balagha/.test(t[2])&&t[2]!==key)).slice(0,0));
 else if(k==='imla')q=imlaQs(u,8);
 return shuffle(q).slice(0,10)}
A.gen={vocabQs,clozeQs,verseQs,termQs,BQ,imlaQs,secQs,strip,POOL};
// ———— الرّحلة ————
R.home=function(){let h='<div class="card hero"><img src="img/zaytoun-read.webp" alt="زيتون يقرأ" width="92"><div><h1>'+C.title+'</h1><div class="mut">نصوص كتاب «لغتنا الجميلة» بجزأيه، مع صفحات الكتاب نفسها بجانب كلّ درس.</div></div></div>';
 [1,2].forEach(part=>{h+='<div class="part-h">الجزء '+(part===1?'الأوّل':'الثّاني')+'</div>';
 U.filter(u=>u.part===part).forEach((u,ui)=>{const ks=ORD.filter(k=>u.sec[k]);const done=ks.filter(k=>(S.done[u.id+':'+k]||0)>=70).length;
  h+='<div class="unit-band b'+(ui%4)+'"><div><small>الوحدة '+ORDN[u.n-1]+' · '+done+'/'+ks.length+'</small><b>'+esc(uname(u))+'</b></div><a href="#/u/'+u.id+'">افتح</a></div><div class="path">';
  ks.forEach((k,i)=>{const sc=S.done[u.id+':'+k];h+='<div class="node-w"><a class="node '+(sc>=70?'done':'')+'" href="#/u/'+u.id+'/'+k+'" aria-label="'+SEC[k][0]+'">'+ic(sc>=70?'check':SEC[k][1])+'</a>'+SEC[k][0]+'</div>'});
  h+='</div>'})});return h};
R.u=function(id,k){const u=uById(id);if(!u)return R.home();const ks=ORD.filter(x=>u.sec[x]);if(!k||!u.sec[k])k=ks[0];const s=u.sec[k];S.seen[id+':'+k]=1;A.save();
 let h='<div class="mut small"><a href="#/home">رحلتي</a> / الوحدة '+ORDN[u.n-1]+' — الجزء '+(u.part===1?'الأوّل':'الثّاني')+'</div><h2>'+esc(uname(u))+'</h2><nav class="tabsec">'+ks.map(x=>'<a href="#/u/'+id+'/'+x+'" class="'+(x===k?'on':'')+'">'+SEC[x][0]+'</a>').join('')+'</nav>';
 const imgs=(s.img||[]);const pages='<div class="bookcol">'+imgs.map((m,i)=>fig(m[0],m[1],SEC[k][0],i===0)).join('')+'</div>';
 let body='';
 if(k==='read'){body='<h3>'+esc(s.t)+'</h3><div class="mut small">النّصّ مأخوذ من كتاب الطّالب ص '+s.pg+'، وصفحة الكتاب هي المرجع في الضّبط.</div>'+(s.paras.length?'':'<div class="card mut">نصّ هذا الدّرس آياتٌ كريمة أو نصوصٌ برسمٍ خاصّ، فنقرؤه من صفحة الكتاب نفسها بضبطها الكامل.</div>')+'<div class="txt">'+s.paras.map((p,i)=>'<p>'+say(ap+'-'+id+'-read-'+i)+' '+esc(p)+'</p>').join('')+'</div>'+vocab(s,id)}
 else if(k==='poem'){body='<h3>'+esc(s.t)+'</h3>'+(s.verses.length?'<div class="card" style="padding:8px 14px">'+s.verses.map((v,i)=>'<div class="verse"><div class="h">'+esc(v[0])+'</div><div class="h">'+esc(v[1])+'</div><div class="n">'+say(ap+'-'+id+'-poem-'+i)+'<span class="tag">البيت '+(i+1)+'</span></div></div>').join('')+'</div>':s.lines?'<div class="card free" style="padding:8px 14px;text-align:center">'+(()=>{let n=0;return s.lines.map(l=>l==='*'?'<div class="stz" aria-hidden="true">***</div>':'<div class="fl"><span class="h">'+esc(l)+'</span>'+say(ap+'-'+id+'-poem-'+(n++))+'</div>').join('')})()+'</div>':'<div class="card mut">القصيدة في هذه الوحدة من الشّعر الحرّ، فنقرؤها من صفحات الكتاب كما كُتبت بضبطها الكامل.</div>')+vocab(s,id)}
 else{body='<h3>'+esc(s.t)+'</h3>'+(s.pts?'<div class="card"><ul class="pts">'+s.pts.map((p,i)=>'<li>'+esc(p)+' '+(k==='grammar'?say(ap+'-'+id+'-gr-'+i):'')+'</li>').join('')+'</ul></div>':'');
  if(k==='khatt')body+='<div class="card"><b>تدرّب على الكتابة</b><p class="mut small">اكتب بإصبعك أو بالقلم فوق الحروف الباهتة، ثمّ قارن بنموذج الكتاب.</p>'+pad(s.t)+'</div>';
  if(k==='taabir')body+='<div class="card"><b>قبل أن تكتب</b><ul class="pts"><li>أقرأ المطلوب في الكتاب جيّدًا.</li><li>أرتّب أفكاري: مقدّمة، عرض، خاتمة.</li><li>أستخدم علامات التّرقيم في مواضعها.</li><li>أراجع الإملاء، ولا سيّما الهمزات والتّاء.</li></ul></div>'}
 const hasQ=['read','poem','grammar','balagha','imla'].includes(k);
 h+='<div class="split">'+'<div>'+body+'</div>'+pages+'</div>';
 h+='<div class="row" style="margin-top:12px">'+(hasQ?'<button class="btn big" id="go">'+ic('play')+' تمرّن على هذا القسم</button>':'<button class="btn big" id="mark">'+ic('check')+' أنهيت هذا القسم</button>')+'</div>';
 return h};
R.after_u=function(id,k){const u=uById(id);if(!u)return;const ks=ORD.filter(x=>u.sec[x]);k=k||ks[0];const go=A.$('#go');
 if(go)go.onclick=()=>quiz(secQs(u,k),{key:id+':'+k,title:SEC[k][0]+' — '+uname(u),back:'#/u/'+id+'/'+k});
 const mk=A.$('#mark');if(mk)mk.onclick=()=>{S.done[id+':'+k]=100;A.addXP(15);A.checkAch();const nx=ks[ks.indexOf(k)+1];location.hash=nx?'#/u/'+id+'/'+nx:'#/home'};
 initPad()};
function vocab(s,id){return s.voc&&s.voc.length?'<h3>معاني المفردات</h3><div class="voc">'+s.voc.map((v,i)=>'<div><b>'+esc(v[0])+'</b>'+esc(v[1])+'</div>').join('')+'</div>':''}
// لوح الكتابة
function pad(t){const letters=(t.match(/\(([^)]+)\)/)||[,''])[1]||'';const model=letters?letters.replace(/[،,]/g,' '):'بِسْمِ اللّهِ';return '<div class="padw"><canvas class="pad" width="900" height="300" data-model="'+esc(model)+'" style="width:100%;border:2px solid var(--line);border-radius:14px;background:#fffdf6;touch-action:none"></canvas><div class="row"><button class="btn alt" data-clear>امسح</button></div></div>'}
function initPad(){A.$$('canvas.pad').forEach(cv=>{const x=cv.getContext('2d');const draw0=()=>{x.clearRect(0,0,900,300);x.fillStyle='#e7e2cf';x.font='170px Naskh, serif';x.textAlign='center';x.textBaseline='middle';x.direction='rtl';x.fillText(cv.dataset.model,450,160);x.strokeStyle='#efe9d6';x.beginPath();x.moveTo(30,220);x.lineTo(870,220);x.stroke()};
 document.fonts&&document.fonts.load('170px Naskh').then(draw0);draw0();let on=false;const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*900/r.width,(e.clientY-r.top)*300/r.height]};
 cv.onpointerdown=e=>{on=true;cv.setPointerCapture(e.pointerId);const[a,b]=pt(e);x.beginPath();x.moveTo(a,b);x.lineWidth=9;x.lineCap='round';x.strokeStyle='#4a5c30'};
 cv.onpointermove=e=>{if(!on)return;const[a,b]=pt(e);x.lineTo(a,b);x.stroke()};cv.onpointerup=()=>on=false;
 cv.parentElement.querySelector('[data-clear]').onclick=draw0})}
// ———— الأساسيّات ————
const BAS=[['haraka','الحركات والتّنوين','الفتحة والضّمّة والكسرة والسّكون والشّدّة والتّنوين: بها نضبط الكلمة فنقرؤها قراءة صحيحة.','sun'],['kalima','أقسام الكلمة','الكلمة اسم أو فعل أو حرف. الاسم يقبل (ال) والتّنوين، والفعل يدلّ على حدث وزمن، والحرف لا يظهر معناه إلّا مع غيره.','grid'],['shams','اللّام الشّمسيّة والقمريّة','اللّام الشّمسيّة تُكتب ولا تُلفظ ويُشدَّد ما بعدها (الشَّمس)، والقمريّة تُكتب وتُلفظ (القَمَر).','moon'],['jumla','الجملة الاسميّة والفعليّة','الجملة الاسميّة تبدأ باسم (العلمُ نورٌ)، والفعليّة تبدأ بفعل (سطعَ القمرُ).','book'],['damir','الضّمائر المنفصلة','الضّمائر أسماء مبنيّة تدلّ على المتكلّم أو المخاطب أو الغائب.','user'],['wasl','همزة الوصل والقطع','همزة القطع تُلفظ دائمًا وتُكتب (أ، إ)، وهمزة الوصل تُلفظ في البدء وتسقط في الوصل (ا).','pen'],['taa','التّاء المربوطة والمفتوحة','التّاء المربوطة تُلفظ هاءً عند الوقف (مدرسة)، والمفتوحة تبقى تاءً (بيت، كتبتْ).','pen'],['alif','الألف في آخر الكلمة','في الثّلاثيّ نعود إلى الأصل: الواو تُكتب ألفًا قائمة (دعا)، والياء تُكتب مقصورة (رمى).','pen']].concat(G===8?[['hamza','الهمزة المتوسّطة والمتطرّفة','نوازن بين حركة الهمزة وحركة ما قبلها: الكسرة أقوى، ثمّ الضّمّة، ثمّ الفتحة، ثمّ السّكون.','pen']]:[]);
// الجولة اختياريّة، ونتيجتها في ذاكرة الصفحة فقط؛ لا تُضاف إلى سجلّ التقدّم.
let FD=null;
A.foundationRoundActive=()=>!!(FD&&FD.i<FD.qs.length);
function foundationCard(){
 if(!FD)return '<section class="card" style="grid-column:1/-1"><h3>من أين أبدأ؟</h3><p>جرّب سؤالًا من كلّ مهارة لنقترح نقطة بداية. هذه الجولة لا تقيس الإتقان، ولا تغيّر نقاطك أو نتائج دروسك.</p><button class="btn" id="foundation-start">جرّب جولة قصيرة</button><p class="mut small">الجولة اختياريّة. يمكنك اختيار أيّ مهارة من القائمة مباشرة.</p></section>';
 const weak=BAS.filter(b=>FD.answers.some(x=>x.id===b[0]&&!x.ok));
 return '<section class="card" style="grid-column:1/-1"><h3>نقطة بدايتك</h3>'+(weak.length?'<p>لنبدأ بمراجعة <b>'+weak[0][1]+'</b>؛ أجبت عن سؤالها بصورة غير صحيحة في هذه الجولة.</p><a class="btn" href="#/b/'+weak[0][0]+'">افتح شرح المهارة وتدريبها</a>'+(weak.length>1?'<p>مهارات أخرى للمراجعة:</p><ul>'+weak.slice(1).map(b=>'<li><a href="#/b/'+b[0]+'">'+b[1]+'</a></li>').join('')+'</ul>':''):'<p>أجبت عن أسئلة الجولة بصورة صحيحة. اختر المهارة التي تريد تقويتها؛ سؤال واحد لا يكفي للحكم على إتقانها.</p>')+'<p class="mut small">هذه توصية من إجابات الجولة فقط، ولا تُحفظ نتيجتها. يمكنك اختيار أيّ مهارة من القائمة.</p><button class="btn alt" id="foundation-start">جولة جديدة</button></section>';
}
function foundationView(){
 const item=FD.qs[FD.i],q=item.q,checked=FD.checked;
 return '<h2>من أين أبدأ؟</h2><p class="mut">سؤال من كلّ مهارة، دون نقاط أو تغيير نتائج الدروس.</p><p>السؤال '+A.ar(FD.i+1)+' من '+A.ar(FD.qs.length)+' · '+BAS.find(b=>b[0]===item.id)[1]+'</p><div class="track" role="progressbar" aria-label="أسئلة الجولة المنجزة" aria-valuemin="0" aria-valuemax="'+FD.qs.length+'" aria-valuenow="'+FD.i+'"><div class="fill" style="width:'+(FD.i/FD.qs.length*100)+'%"></div></div><section class="card"><h3>'+q.q+'</h3><div class="opts">'+q.o.map((o,i)=>'<button class="opt'+(q.arOpt?' ar':'')+(FD.sel===i?' sel':'')+(checked?(i===q.a?' ok':FD.sel===i?' bad':''):'')+'" data-foundation-option="'+i+'" aria-pressed="'+(FD.sel===i)+'"'+(checked?' disabled':'')+'>'+esc(o)+'</button>').join('')+'</div>'+(checked?'<div class="readout" role="status" aria-live="polite"><b>'+(FD.sel===q.a?'إجابة صحيحة.':'الإجابة الصحيحة: '+esc(q.o[q.a]))+'</b>'+(q.ex?'<p>'+esc(q.ex)+'</p>':'')+'</div><button class="btn" id="foundation-next">'+(FD.i+1===FD.qs.length?'اعرض نقطة البداية':'السؤال التالي')+'</button>':'<p><button class="btn" id="foundation-check"'+(FD.sel==null?' disabled':'')+'>تحقّق</button></p>')+'</section><button class="btn alt" id="foundation-close">العودة إلى جميع المهارات</button>';
}
R.basics=()=>FD&&FD.i<FD.qs.length?foundationView():'<h2>الأساسيّات</h2><p class="mut">مهارات نحتاجها في كلّ وحدة. اختر مهارة، أو جرّب الجولة الاختياريّة لتحديد نقطة البداية.</p><div class="grid">'+foundationCard()+BAS.map((b,i)=>'<a class="tile c'+(i%5)+'" href="#/b/'+b[0]+'"><span class="ti">'+ic(b[3])+'</span><b>'+b[1]+'</b><small>'+((S.done['b:'+b[0]]!=null)?'أفضل نتيجة: '+S.done['b:'+b[0]]+'٪':'لم تبدأ بعد')+'</small></a>').join('')+'</div>';
R.after_basics=()=>{
 const start=A.$('#foundation-start');if(start)start.onclick=()=>{FD={qs:BAS.map(b=>{const q=pick(BQ[b[0]](G)),opts=shuffle(q.o.map((t,i)=>({t,ok:i===q.a})));return{id:b[0],q:Object.assign({},q,{o:opts.map(o=>o.t),a:opts.findIndex(o=>o.ok)})}}),i:0,sel:null,checked:false,answers:[]};A.render()};
 const close=A.$('#foundation-close');if(close)close.onclick=()=>{FD=null;A.render()};
 if(!FD||FD.i>=FD.qs.length)return;
 A.$$('[data-foundation-option]').forEach(b=>b.onclick=()=>{if(FD.checked)return;FD.sel=+b.dataset.foundationOption;A.$$('[data-foundation-option]').forEach(x=>{x.classList.toggle('sel',x===b);x.setAttribute('aria-pressed',String(x===b))});A.$('#foundation-check').disabled=false});
 const check=A.$('#foundation-check');if(check)check.onclick=()=>{if(FD.sel==null||FD.checked)return;const item=FD.qs[FD.i];FD.answers.push({id:item.id,ok:FD.sel===item.q.a});FD.checked=true;A.render()};
 const next=A.$('#foundation-next');if(next)next.onclick=()=>{if(!FD.checked)return;FD.i++;FD.sel=null;FD.checked=false;A.render()};
};
R.b=id=>{const b=BAS.find(x=>x[0]===id);if(!b)return R.basics();return '<div class="mut small"><a href="#/basics">الأساسيّات</a></div><h2>'+b[1]+'</h2><div class="card hero"><img src="img/zaytoun-teacher.webp" alt=""><div>'+b[2]+'</div></div><button class="btn big" id="go">'+ic('play')+' ابدأ التّدريب</button>'};
R.after_b=id=>{const g=A.$('#go');if(g)g.onclick=()=>quiz(shuffle(BQ[id](G)).slice(0,10),{key:'b:'+id,title:'الأساسيّات',back:'#/b/'+id})};
// ———— المغامرات ————
const ADV=[['match','مطابقة المفردات','صِل كلّ كلمة بمعناها بأسرع ما يمكن.','puzzle'],['verses','تحدّي الأبيات','أكمل أبيات القصائد الّتي درستها.','feather'],['irab','دروب الإعراب','أعرب كلمات في جمل قصيرة.','target'],['review','مراجعة ذكيّة','أسئلة من الأقسام الّتي تحتاج إلى مراجعة.','leaf'],['mixed','جولة الوحدات','أسئلة منوّعة من كلّ الوحدات.','compass']];
R.play=()=>'<h2>المغامرات</h2><div class="grid">'+ADV.map((a,i)=>'<a class="tile c'+(i%5)+'" href="#/adv/'+a[0]+'"><span class="ti">'+ic(a[3])+'</span><b>'+a[1]+'</b><small>'+a[2]+'</small></a>').join('')+'</div>';
R.adv=(id,scope)=>{const units=A.scopeUnits(scope);if(id==='match')return matchHTML(units,scope);const a=ADV.find(x=>x[0]===id);setTimeout(()=>{let q=[];
 if(id==='verses')units.forEach(u=>q=q.concat(verseQs(u,2)));
 if(id==='irab')q=BQ.irab(G);
 if(id==='mixed')units.forEach(u=>{const k=pick(['read','grammar','imla'].filter(k=>u.sec[k]));q=q.concat(secQs(u,k).slice(0,1))});
 if(id==='review'){const weak=Object.entries(S.done).filter(e=>e[1]<70&&e[0].includes(':')&&!e[0].startsWith('b:'));weak.forEach(([key])=>{const [uid,k]=key.split(':');const u=units.find(u=>u.id===uid);if(u&&u.sec[k])q=q.concat(secQs(u,k).slice(0,3))});if(!q.length){units.forEach(u=>q=q.concat(vocabQs(u,1)))}}
 if(!q.length){A.toast('لا تتوافر أسئلة لهذا النشاط في الوحدة المختارة.');location.hash='#/play/'+(scope||U[0].id);return}quiz(shuffle(q).slice(0,12),{key:'adv:'+id,title:a?a[1]:'',back:'#/play/'+(scope||U[0].id)})},0);return '<p class="mut">جارٍ التّحضير…</p>'};
// لعبة المطابقة
let MG=null;
function matchHTML(units,scope){const bank=units.flatMap(u=>['read','poem'].flatMap(k=>u.sec[k]&&u.sec[k].voc||[]));const v=shuffle(bank.filter(x=>x[1].length<40));const pairs=[];const seen=new Set();for(const p of v){const k=strip(p[0]),m=strip(p[1]);if(seen.has(k)||seen.has(m))continue;seen.add(k);seen.add(m);pairs.push(p);if(pairs.length===5)break}
 const matchScope=scope==='all'||U.some(u=>u.id===scope)?scope:U[0].id;if(!pairs.length)return '<p>لا تتوافر مفردات لهذا النشاط في هذه الوحدة.</p><a class="btn" href="#/play/'+matchScope+'">المغامرات</a>';MG={pairs,scope:matchScope,left:shuffle(pairs.map((p,i)=>i)),right:shuffle(pairs.map((p,i)=>i)),sel:null,ok:0,miss:0,t0:Date.now()};
 return '<h2>مطابقة المفردات</h2><p>اختر الكلمة، ثم اختر معناها من العمود الآخر.</p><p id="mstatus" role="status" aria-live="polite" aria-atomic="true">طابقت '+A.ar(0)+' من '+A.ar(pairs.length)+' أزواج.</p><p id="mfeedback" role="status" aria-live="polite" aria-atomic="true">ابدأ باختيار كلمة.</p><div class="row" style="align-items:flex-start"><div class="chips" style="flex-direction:column;flex:1">'+MG.left.map(i=>'<button class="chip ar" aria-pressed="false" data-l="'+i+'">'+esc(pairs[i][0])+'</button>').join('')+'</div><div class="chips" style="flex-direction:column;flex:1.4">'+MG.right.map(i=>'<button class="chip" data-r="'+i+'">'+esc(pairs[i][1])+'</button>').join('')+'</div></div><div id="mres"></div><a class="btn alt" href="#/play/'+MG.scope+'">العودة إلى المغامرات</a>'}
R.after_adv=id=>{if(id!=='match'||!MG)return;
 const feedback=text=>{A.$('#mfeedback').textContent=text};
 const clearError=()=>A.$$('[data-r]').forEach(x=>x.classList.remove('bad'));
 A.$$('[data-l]').forEach(b=>b.onclick=()=>{if(b.disabled)return;clearError();A.$$('[data-l]').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true');MG.sel=+b.dataset.l;feedback('اختر معنى «'+MG.pairs[MG.sel][0]+'».')});
 A.$$('[data-r]').forEach(b=>b.onclick=()=>{if(b.disabled)return;if(MG.sel==null){feedback('اختر كلمة أولًا، ثم اختر معناها.');return}clearError();const l=A.$('[data-l="'+MG.sel+'"]');if(+b.dataset.r===MG.sel){b.classList.add('ok');l.classList.add('ok');l.classList.remove('on');l.setAttribute('aria-pressed','false');b.disabled=l.disabled=true;MG.ok++;MG.sel=null;
  A.$('#mstatus').textContent='طابقت '+A.ar(MG.ok)+' من '+A.ar(MG.pairs.length)+' أزواج.';feedback(MG.ok===MG.pairs.length?'أحسنت! طابقت جميع الأزواج.':'تطابق صحيح. اختر كلمة أخرى.');
  if(MG.ok===MG.pairs.length){const sec=Math.round((Date.now()-MG.t0)/1000);const xp=Math.max(10,50-MG.miss*5);A.addXP(xp);S.done['adv:match']=Math.max(S.done['adv:match']||0,Math.max(0,100-MG.miss*15));A.save();A.checkAch();setTimeout(()=>{const g=A.$('#again2');if(g)g.onclick=()=>A.render()},0);A.$('#mres').innerHTML='<div class="card end"><b>أنهيت في '+A.ar(sec)+' ثانية، +'+A.ar(xp)+' نقطة</b><div class="row" style="justify-content:center;margin-top:8px"><button class="btn" id="again2">جولة جديدة</button><a class="btn alt" href="#/play/'+MG.scope+'">المغامرات</a></div></div>'}}
  else{MG.miss++;b.classList.add('bad');feedback('لم تتطابق الكلمة والمعنى. حاول مجددًا؛ ما زالت الكلمة المحددة هي «'+MG.pairs[MG.sel][0]+'».')}})};
// ———— المختبر ————
const LABS=[['hamza','مختبر الهمزة','اكتشف موضع الهمزة خطوةً خطوة بموازنة الحركات.','pen'],['irab','بنّاء الإعراب','ابنِ إعراب الكلمة: موقعها، وحالتها، وعلامتها.','puzzle'],['imla','ورشة الإملاء','التّاء المربوطة والمفتوحة، والألف القائمة والمقصورة، وهمزة الوصل والقطع.','quill'],['sarf','المجرّد والمزيد','تعرّف أحرف الزّيادة في الأفعال.','grid'],['khatt','لوح الخطّ','تدرّب على رسم الحروف بخطّ النّسخ.','feather']];
R.lab=()=>'<h2>المختبر</h2><div class="grid">'+LABS.map((a,i)=>'<a class="tile c'+(i%5)+'" href="#/l/'+a[0]+'"><span class="ti">'+ic(a[3])+'</span><b>'+a[1]+'</b><small>'+a[2]+'</small></a>').join('')+'</div>';
let LB={};
R.l=id=>{S.seen['lab:'+id]=1;A.save();const t=(LABS.find(x=>x[0]===id)||[])[1]||'';let h='<div class="mut small"><a href="#/lab">المختبر</a></div><h2>'+t+'</h2>';
 if(id==='hamza'){const x=pick(B.hamza);LB={x};h+='<div class="lab"><div class="txt" style="text-align:center;font-size:44px">'+x[0].replace('_','<span style="color:var(--acc)">؟</span>')+'</div>'+
  (x[4]==='m'?'<div class="ctl"><div>١. ما حركة الهمزة؟ <span class="chips" data-step="hv">'+['k','u','a','s'].map(v=>'<button class="chip" data-v="'+v+'">'+VN[v]+'</button>').join('')+'</span></div><div>٢. ما قبل الهمزة؟ <span class="chips" data-step="pv">'+['k','u','a','s','A','W','Y'].map(v=>'<button class="chip" data-v="'+v+'">'+VN[v]+'</button>').join('')+'</span></div>':'<div class="ctl"><div>١. الهمزة في آخر الكلمة. ما حركة الحرف قبلها؟ <span class="chips" data-step="pv">'+['k','u','a','s','A'].map(v=>'<button class="chip" data-v="'+v+'">'+VN[v]+'</button>').join('')+'</span></div>')+
  '<div>'+(x[4]==='m'?'٣':'٢')+'. اختر الصّورة: <span class="chips" data-step="seat">'+['أ','ؤ','ئ','ء'].map(v=>'<button class="chip ar" data-v="'+v+'">'+v+'</button>').join('')+'</span></div></div><div class="readout" id="hr" style="margin-top:10px">ابدأ بالخطوة الأولى.</div><div class="row" style="margin-top:10px"><a class="btn alt" href="#/l/hamza" id="nextw">كلمة أخرى</a></div></div>'}
 if(id==='irab'){const P=B.irab.filter(x=>x[3]<=G);const x=pick(P);const p=parse(x[2]);LB={x,p,ans:{}};const roles=[...new Set(P.map(y=>parse(y[2]).role))];const st=[...new Set(P.map(y=>parse(y[2]).st))];const sg=[...new Set(P.map(y=>parse(y[2]).sg))];
  h+='<div class="lab"><div class="txt" style="text-align:center">'+x[0].split(' ').map(w=>'<span style="'+(w===x[1]?'background:var(--acc);color:#fff;border-radius:8px;padding:0 8px':'')+'">'+w+'</span>').join(' ')+'</div><p>أعرب الكلمة الملوّنة <span class="ar">«'+x[1]+'»</span>:</p><div class="ctl"><div>الموقع: <div class="chips" data-k="role">'+shuffle(pickN(roles,p.role,5)).map(r=>'<button class="chip" data-v="'+esc(r)+'">'+esc(r)+'</button>').join('')+'</div></div><div>الحالة: <div class="chips" data-k="st">'+st.map(r=>'<button class="chip" data-v="'+esc(r)+'">'+esc(r)+'</button>').join('')+'</div></div><div>العلامة: <div class="chips" data-k="sg">'+shuffle(pickN(sg,p.sg,5)).map(r=>'<button class="chip" data-v="'+esc(r)+'">'+esc(r)+'</button>').join('')+'</div></div></div><div class="row" style="margin-top:10px"><button class="btn" id="chk">تحقّق</button><a class="btn alt" href="#/l/irab" id="nextw">جملة أخرى</a></div><div class="readout" id="ir" style="margin-top:10px" hidden></div></div>'}
 if(id==='imla'||id==='sarf'){h+='<p class="mut">'+(id==='imla'?'تدريب سريع من عشرة أسئلة.':'حدّد نوع الفعل من حيث التّجرّد والزّيادة.')+'</p><button class="btn big" id="go">'+ic('play')+' ابدأ</button>'}
 if(id==='khatt'){h+='<div class="card"><div class="chips" id="kl">'+'أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن هـ و ي'.split(' ').map(c=>'<button class="chip ar" data-c="'+c+'">'+c+'</button>').join('')+'</div>'+pad('(ب)')+'</div>'}
 return h};
function pickN(pool,correct,n){return [correct,...shuffle(pool.filter(x=>x!==correct)).slice(0,n-1)]}
function parse(s){const m=/^(.*?) (مرفوع|منصوب|مجرور|مجزوم|مبنيّ)(.*)$/.exec(s);if(!m)return{role:s,st:'',sg:''};let rest=m[3].trim();const sg=rest.replace(/^وعلامة (رفعه|نصبه|جرّه|جزمه) /,'').replace(/^على /,'على ');return{role:m[1],st:m[2],sg:sg||'—'}}
A.parseIrab=parse;
R.after_l=id=>{const nw=A.$('#nextw');if(nw)nw.onclick=e=>{e.preventDefault();A.render()};if(id==='hamza'){const x=LB.x;const ans={};A.$$('[data-step]').forEach(g=>g.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{const st=g.dataset.step;const v=b.dataset.v;const right=st==='hv'?x[2]:st==='pv'?x[3]:x[1];
  if(v===right){g.querySelectorAll('.chip').forEach(c=>c.disabled=true);b.classList.add('ok');ans[st]=v;
   A.$('#hr').textContent=st==='seat'?why(x)+' أحسنت!':st==='hv'?'صحيح: حركة الهمزة '+VN[v]+'.':'صحيح: قبلها '+VN[v]+'.';if(st==='seat'){A.addXP(5);S.done['lab:hamza']=100;A.save()}}
  else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),600);A.$('#hr').textContent=st==='seat'?'تذكّر: الكسرة أقوى ثمّ الضّمّة ثمّ الفتحة ثمّ السّكون.':'انظر إلى الضّبط على الحرف جيّدًا.'}}))}
 if(id==='irab'){A.$$('[data-k]').forEach(g=>g.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{g.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));b.classList.add('on');LB.ans[g.dataset.k]=b.dataset.v}));
  A.$('#chk').onclick=()=>{const p=LB.p,a=LB.ans;const ok=a.role===p.role&&a.st===p.st&&a.sg===p.sg;const r=A.$('#ir');r.hidden=false;r.innerHTML=(ok?'أحسنت! ':'')+'الإعراب: <b>'+esc(LB.x[2])+'</b>';r.style.background=ok?'var(--ok-bg)':'var(--bad-bg)';if(ok){A.addXP(8);S.done['lab:irab']=100;A.save()}}}
 if(id==='imla'){A.$('#go').onclick=()=>quiz(shuffle([].concat(BQ.taa(),BQ.alif(),BQ.wasl())).slice(0,10),{key:'lab:imla',title:'ورشة الإملاء',back:'#/l/imla'})}
 if(id==='sarf'){A.$('#go').onclick=()=>quiz(shuffle(BQ.mazid()).slice(0,10),{key:'lab:sarf',title:'المجرّد والمزيد',back:'#/l/sarf'})}
 if(id==='khatt'){initPad();A.$$('[data-c]').forEach(b=>b.onclick=()=>{const cv=A.$('canvas.pad');cv.dataset.model=b.dataset.c;cv.parentElement.querySelector('[data-clear]').click()})}};
})();
