// محرّك دروس عامّ للصفوف الجديدة: الرحلة، الدرس (الأفكار، المفاهيم، أمثلة محلولة)، التدريب المولّد، المغامرات، الورشة.
(function(){
'use strict';
const A=window.APP,U=window.UNITS,C=window.CFG,MG=window.MG||{};
const {esc,ic,pick,shuffle,S,R,quiz}=A;
const ORDN=['الأولى','الثّانية','الثّالثة','الرّابعة','الخامسة','السّادسة','السّابعة','الثّامنة'];
const LES=[];U.forEach(u=>u.les.forEach(l=>{l.u=u;LES.push(l)}));
C.sections=()=>LES.map(l=>({key:l.id,name:'الوحدة '+ORDN[+l.u.id.slice(1)-1]+': '+l.t,href:'#/u/'+l.id}));
const strip=s=>String(s).replace(/[\u064B-\u0652\u0640]/g,'').trim();
const uniqT=ts=>[...new Map(ts.map(t=>[strip(t[0]),t])).values()];
const ALLT=uniqT(LES.flatMap(l=>l.terms||[]));
function distinct(ans,pool,n){const s=new Set([strip(ans)]),o=[];for(const x of shuffle(pool.slice())){if(!s.has(strip(x))){s.add(strip(x));o.push(x)}if(o.length===n)break}return o}
function termQs(l,n){return shuffle(uniqT(l.terms||[])).slice(0,n).map((t,i)=>i%2?{q:'ما المقصود بـ«'+esc(t[0])+'»؟',o:[t[1],...distinct(t[1],ALLT.map(x=>x[1]),3)],a:0,ex:t[0]+': '+t[1]}:{q:'أيّ مفهوم يدلّ عليه التّعريف الآتي؟<br>'+esc(t[1]),o:[t[0],...distinct(t[0],ALLT.map(x=>x[0]),3)],a:0,ex:t[0]+': '+t[1]}).filter(q=>q.o.length>=3)}
function factQs(l,n){return shuffle((l.facts||[]).slice()).slice(0,n).map(f=>({q:'صواب أم خطأ؟<br>'+esc(f[0]),o:['صواب','خطأ'],a:f[1]?0:1,keep:1,ex:f[1]?'العبارة صحيحة.':'العبارة غير صحيحة.'}))}
const gens=l=>(l.gen||[]).filter(k=>MG[k]);
function genQs(l,n){const ks=gens(l),o=[];if(!ks.length)return o;for(let i=0;i<n;i++)o.push(MG[ks[i%ks.length]]());return o}
function bookQs(l){return (l.bmc||[]).map(b=>({q:esc(b[0])+'<br><small class="mut">من أسئلة كتاب الطالب ص '+b[3]+'</small>',o:b[1].slice(),a:b[2],keep:b[1].length<3?0:0,ex:'الإجابة: '+b[1][b[2]]+' (كتاب الطالب ص '+b[3]+')'}))}
function lesQs(l){const g=gens(l).length,bk=shuffle(bookQs(l)),n=Math.max(10,Math.min(bk.length,14));const rest=shuffle(termQs(l,g?2:4).concat(factQs(l,g?2:4)).concat(genQs(l,g?6:0)));return shuffle(bk.concat(rest).slice(0,n))}
A.gen={termQs,factQs,numQs:genQs,lesQs,bookQs,LES,NUM:Object.fromEntries(LES.map(l=>[l.id,gens(l)]))};
R.home=function(){return ''};
R.u=function(id){const l=LES.find(x=>x.id===id);if(!l)return R.home();S.seen[id]=1;A.save();const u=l.u;
 let h='<div class="mut small"><a href="#/home">رحلتي</a> / الوحدة '+ORDN[+u.id.slice(1)-1]+': '+esc(u.t)+'</div><h2>'+esc(l.t)+'</h2><nav class="tabsec">'+u.les.map(x=>'<a href="#/u/'+x.id+'" class="'+(x.id===id?'on':'')+'">'+esc(x.t)+'</a>').join('')+'</nav>';
 h+='<div class="split"><div><div class="card"><div class="row" style="justify-content:space-between"><b>الأفكار الرّئيسة</b>'+(l.pg?'<span class="tag">كتاب الطالب ص '+l.pg+'</span>':'')+'</div><ul class="pts">'+l.pts.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul></div>'+
 ((l.terms||[]).length?'<div class="card"><b>المفاهيم</b><div class="voc">'+l.terms.map(t=>'<div><b style="font-family:Cairo;font-size:17px">'+esc(t[0])+'</b>'+esc(t[1])+'</div>').join('')+'</div></div>':'')+'</div><div>';
 if((l.ex||[]).length){h+='<b>أمثلة محلولة</b>';l.ex.forEach((e,i)=>{h+='<div class="card"><b>مثال '+A.ar(i+1)+'</b><p>'+esc(e[0])+'</p><details><summary>اعرض الحل</summary><p>'+esc(e[1])+'</p></details></div>'})}
 if(gens(l).length)h+='<a class="tile c2" href="#/l/'+l.id+'" style="margin:12px 0"><span class="ti">'+ic('target')+'</span><b>ورشة: تدريب متجدّد</b><small>مسائل جديدة في كل مرة على هذا الدرس</small></a>';
 if((l.bq||[]).length){h+='<b>من تمارين كتاب الطالب</b>';l.bq.forEach((e,i)=>{h+='<div class="card"><div class="row" style="justify-content:space-between"><b>تمرين '+A.ar(i+1)+'</b><span class="tag">ص '+e[2]+'</span></div><p>'+esc(e[0])+'</p><details><summary>اعرض الإجابة</summary><p>'+esc(e[1])+'</p></details></div>'})}
 h+='</div></div>';
 if((l.img||[]).length)h+='<div class="card"><div class="row" style="justify-content:space-between"><b>صفحات الدرس من كتاب الطالب</b><span class="tag">ص '+l.img[0]+'–'+l.img[l.img.length-1]+'</span></div><p class="mut small">اضغط على الصفحة لتكبيرها.</p><div class="bookrow">'+l.img.map(p=>'<figure class="book"><a href="bookimg/p'+p+'.webp" target="_blank" rel="noopener"><img src="bookimg/p'+p+'.webp" alt="صفحة '+p+' من كتاب الطالب" loading="lazy" decoding="async"></a><figcaption>'+ic('book')+'كتاب الطالب ص '+p+'</figcaption></figure>').join('')+'</div></div>';
 h+='<button class="btn big" id="go">'+ic('play')+' تمرّن على الدّرس</button>';return h};
R.after_u=id=>{const l=LES.find(x=>x.id===id);const g=A.$('#go');if(g)g.onclick=()=>quiz(lesQs(l),{key:id,title:l.t,back:'#/u/'+id})};
R.test=uid=>{const u=U.find(x=>x.id===uid);setTimeout(()=>{let q=[];u.les.forEach(l=>q=q.concat(lesQs(l).slice(0,4)));quiz(shuffle(q).slice(0,12),{key:'T:'+uid,title:'اختبار الوحدة: '+u.t,back:'#/home'})},0);return '<p class="mut">جارٍ تحضير اختبار الوحدة…</p>'};
// ———— الأساسيّات ————
const BAS=[['glossary','معجم المفاهيم','كل مفاهيم الفصل في مكان واحد، مع اختبار سريع.'],['ideas','خلاصة الفصل','الأفكار الرئيسة لكل درس، للمراجعة قبل الاختبار.']];
R.basics=()=>'<h2>الأساسيّات</h2><div class="grid">'+BAS.map((b,i)=>'<a class="tile c'+i+'" href="#/b/'+b[0]+'"><span class="ti">'+ic(['book','star'][i])+'</span><b>'+b[1]+'</b><small>'+b[2]+'</small></a>').join('')+'</div>';
R.b=id=>{const b=BAS.find(x=>x[0]===id);if(!b)return R.basics();let h='<div class="mut small"><a href="#/basics">الأساسيّات</a></div><h2>'+b[1]+'</h2>';
 if(id==='glossary')return h+'<div class="voc">'+ALLT.map(t=>'<div><b style="font-family:Cairo;font-size:17px">'+esc(t[0])+'</b>'+esc(t[1])+'</div>').join('')+'</div><button class="btn big" id="go" style="margin-top:12px">'+ic('play')+' اختبر نفسك</button>';
 return h+U.map(u=>'<div class="card"><b>'+esc(u.t)+'</b>'+u.les.map(l=>'<p style="margin:.6em 0 .2em"><a href="#/u/'+l.id+'">'+esc(l.t)+'</a></p><ul class="pts">'+l.pts.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>').join('')+'</div>').join('')+'<button class="btn big" id="go">'+ic('play')+' صواب أم خطأ؟</button>'};
R.after_b=id=>{const g=A.$('#go');if(g)g.onclick=()=>{const q=id==='glossary'?shuffle(ALLT.slice()).slice(0,10).map(t=>({q:'أيّ مفهوم يدلّ عليه التّعريف الآتي؟<br>'+esc(t[1]),o:[t[0],...distinct(t[0],ALLT.map(x=>x[0]),3)],a:0})):shuffle(LES.flatMap(l=>factQs(l,1))).slice(0,10);quiz(q,{key:'b:'+id,title:'الأساسيّات',back:'#/b/'+id})}};
// ———— المغامرات ————
const ADV=[['match','مطابقة المفاهيم','صِل كلّ مفهوم بتعريفه.','puzzle'],['tf','سباق الحقائق','صواب أم خطأ؟ عبارات من دروسك.','bolt'],['calc','تحدّي المسائل','مسائل مولَّدة من دروس الوحدة.','target'],['review','مراجعة ذكيّة','أسئلة من الدّروس الّتي تحتاج إلى مراجعة.','leaf']];
R.play=()=>'<h2>المغامرات</h2><div class="grid">'+ADV.map((a,i)=>'<a class="tile c'+i+'" href="#/adv/'+a[0]+'"><span class="ti">'+ic(a[3])+'</span><b>'+a[1]+'</b><small>'+a[2]+'</small></a>').join('')+'</div>';
let MGm=null;
R.adv=(id,scope)=>{const us=A.scopeUnits(scope),lessons=LES.filter(l=>us.includes(l.u)),bank=uniqT(lessons.flatMap(l=>l.terms||[]));const back=scope==='all'||U.some(u=>u.id===scope)?scope:U[0].id;
 if(id==='match'){const pairs=shuffle(bank.filter(t=>t[1].length<80)).slice(0,5);if(pairs.length<2)return '<p>لا تتوافر مفاهيم كافية لهذا النشاط.</p><a class="btn" href="#/play/'+back+'">المغامرات</a>';MGm={pairs,scope:back,ok:0,miss:0,sel:null};
  return '<h2>مطابقة المفاهيم</h2><p>اختر المفهوم، ثم اختر تعريفه من العمود الآخر.</p><p id="mstatus" role="status" aria-live="polite">طابقت '+A.ar(0)+' من '+A.ar(pairs.length)+' أزواج.</p><p id="mfeedback" role="status" aria-live="polite">ابدأ باختيار مفهوم.</p><div class="row" style="align-items:flex-start"><div class="chips" style="flex-direction:column;flex:1">'+shuffle(pairs.map((p,i)=>i)).map(i=>'<button class="chip" aria-pressed="false" data-l="'+i+'">'+esc(pairs[i][0])+'</button>').join('')+'</div><div class="chips" style="flex-direction:column;flex:1.6">'+shuffle(pairs.map((p,i)=>i)).map(i=>'<button class="chip" style="font-weight:600;text-align:right" data-r="'+i+'">'+esc(pairs[i][1])+'</button>').join('')+'</div></div><div id="mres"></div><a class="btn alt" href="#/play/'+back+'">العودة إلى المغامرات</a>'}
 setTimeout(()=>{let q=[];if(id==='tf')lessons.forEach(l=>q=q.concat(factQs(l,2)));if(id==='calc')lessons.forEach(l=>q=q.concat(genQs(l,2)));
  if(id==='review'){Object.entries(S.done).filter(e=>e[1]<70).forEach(([k])=>{const l=lessons.find(x=>x.id===k);if(l)q=q.concat(lesQs(l).slice(0,3))});if(!q.length)lessons.forEach(l=>q=q.concat(lesQs(l).slice(0,2)))}
  if(!q.length){A.toast('لا تتوافر أسئلة من هذا النوع في الوحدة المختارة. اختر نشاطًا آخر.');location.hash='#/play/'+back;return}quiz(shuffle(q).slice(0,10),{key:'adv:'+id,title:(ADV.find(a=>a[0]===id)||[])[1]||'',back:'#/play/'+back})},0);return '<p class="mut">جارٍ التّحضير…</p>'};
R.after_adv=id=>{if(id!=='match'||!MGm)return;const M=MGm;const fb=t=>{A.$('#mfeedback').textContent=t};
 A.$$('[data-l]').forEach(b=>b.onclick=()=>{if(b.disabled)return;A.$$('[data-r]').forEach(x=>x.classList.remove('bad'));A.$$('[data-l]').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true');M.sel=+b.dataset.l;fb('اختر تعريف «'+M.pairs[M.sel][0]+'».')});
 A.$$('[data-r]').forEach(b=>b.onclick=()=>{if(b.disabled)return;if(M.sel==null){fb('اختر مفهومًا أولًا، ثم اختر تعريفه.');return}const l=A.$('[data-l="'+M.sel+'"]');
  if(+b.dataset.r===M.sel){[b,l].forEach(x=>{x.classList.add('ok');x.classList.remove('on');x.disabled=true});M.ok++;M.sel=null;A.$('#mstatus').textContent='طابقت '+A.ar(M.ok)+' من '+A.ar(M.pairs.length)+' أزواج.';fb(M.ok===M.pairs.length?'أحسنت! طابقت جميع الأزواج.':'تطابق صحيح. اختر مفهومًا آخر.');
   if(M.ok===M.pairs.length){const xp=Math.max(10,50-M.miss*5);A.addXP(xp);S.done['adv:match']=Math.max(S.done['adv:match']||0,Math.max(0,100-M.miss*15));A.save();A.$('#mres').innerHTML='<div class="card end"><b>أحسنت! +'+A.ar(xp)+' نقطة</b><div class="row" style="justify-content:center;margin-top:8px"><button class="btn" id="again2">جولة جديدة</button></div></div>';A.$('#again2').onclick=()=>A.render()}}
  else{M.miss++;b.classList.add('bad');fb('لم يتطابق المفهوم والتعريف. حاول مجددًا.')}})};
// ———— الورشة: تدريب متجدّد لكل درس فيه مولّد ————
const WL=LES.filter(l=>gens(l).length);
R.lab=()=>'<h2>الورشة</h2><p class="mut">'+(WL.length?'تدريب متجدّد: مسائل جديدة في كل جولة.':'تدرّب على مفاهيم كل درس.')+'</p><div class="grid">'+(WL.length?WL:LES).map((l,i)=>'<a class="tile c'+(i%5)+'" href="#/l/'+l.id+'"><span class="ti">'+ic(WL.length?'target':'book')+'</span><b>'+esc(l.t)+'</b><small>'+esc(l.u.t)+'</small></a>').join('')+'</div>';
R.l=id=>{const l=LES.find(x=>x.id===id);if(!l)return R.lab();S.seen['lab:'+id]=1;A.save();setTimeout(()=>{const q=gens(l).length?genQs(l,10):lesQs(l);quiz(shuffle(q),{key:'lab:'+id,title:'الورشة: '+l.t,back:'#/lab'})},0);return '<p class="mut">جارٍ التّحضير…</p>'};
})();
