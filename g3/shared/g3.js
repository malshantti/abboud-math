// واجهة الصفّ الثالث فوق المحرّك المشترك: رحلتي (الوحدات والدروس)، صفحة الدرس وخطواته «ابدأ الدرس»،
// التدريب بزرّ «تحقّق»، اختبار الوحدة، اختبار تحديد المستوى الاختياري، الأساسيّات، المغامرات، والمختبر «أجرّب».
(function(){
'use strict';
const A=window.APP,G=window.G3,X=window.G3X||{},C=window.CFG,R=A.R,S=A.S;
const {esc,ic,quiz,shuffle,pick,ar}=A;
const ORD=['الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة','التاسعة','العاشرة'];
const LES=[];G.units.forEach(u=>u.les.forEach(l=>{l.u=u;LES.push(l)}));
const find=id=>LES.find(l=>l.id===id);
const img=n=>'../shared/img/zaytoun-'+n+'.webp';
// أسئلة الدرس: الثابتة من المحتوى + المولَّدة (للرياضيات)
function lesQs(l,n){let q=(l.qs||[]).slice();const g=l.gen&&X.gen&&X.gen[l.gen];if(g){for(let i=0;i<12;i++)q.push(g())}
 q=shuffle(q);const seen=new Set();q=q.filter(x=>{const k=x.q+'|'+x.o[x.a];if(seen.has(k))return false;seen.add(k);return true});return q.slice(0,n||8)}
C.sections=()=>LES.map(l=>({key:l.id,name:l.t,href:'#/u/'+l.id})).concat(G.units.map(u=>({key:'T:'+u.id,name:'اختبار الوحدة: '+u.t,href:'#/test/'+u.id})));
const bk=(pg)=>'<span class="tag">'+ic('feather')+' كتاب الطالب ص '+pg+'</span>';
// ———— رحلتي ————
R.home=function(){const m=A.mastery(S.done);
 let h='<div class="card hero"><img src="'+img('welcome')+'" alt="زيتون يرحّب" width="92"><div><h1>'+esc(G.name)+'</h1><div class="mut">'+esc(G.intro)+'</div><div class="g3-prog"><i style="width:'+Math.round(m.lessons/Math.max(1,m.total)*100)+'%"></i></div><small class="mut">أتقنت '+m.lessons+' من '+m.total+'</small></div></div>';
 if(!S.seen.place)h+='<a class="card g3-place" href="#/place"><img src="'+img('think')+'" alt="" width="64"><div><b>اختبار قصير لتحديد البداية</b><small class="mut">اختياريّ: أسئلة قليلة تخبرك من أين تبدأ.</small></div>'+ic('arrow')+'</a>';
 else if(S.seen.place!=='skip'){const u=G.units.find(x=>x.id===S.seen.place);if(u)h+='<div class="card g3-tip">'+ic('compass')+' <span>نقترح أن تبدأ من <b>الوحدة '+ORD[G.units.indexOf(u)]+': '+esc(u.t)+'</b>. <a href="#/place">أعد الاختبار</a></span></div>'}
 h+='<div class="part-h">'+esc(G.term)+'</div>';
 G.units.forEach((u,ui)=>{const d=u.les.filter(l=>(S.done[l.id]||0)>=70).length;
  h+='<div class="unit-band b'+(ui%4)+'" id="unit-'+u.id+'"><div><small>الوحدة '+ORD[ui]+' · '+d+'/'+u.les.length+'</small><b>'+esc(u.t)+'</b></div><a href="#/u/'+u.les[0].id+'">افتح</a></div><div class="path">';
  u.les.forEach(l=>{const sc=S.done[l.id];h+='<div class="node-w"><a class="node '+(sc>=70?'done':'')+'" href="#/u/'+l.id+'" aria-label="'+esc(l.t)+'">'+ic(sc>=70?'check':l.lab?'lab':'book')+'</a>'+esc(l.t)+'</div>'});
  h+='<div class="node-w"><a class="node '+((S.done['T:'+u.id]||0)>=70?'done':'')+'" href="#/test/'+u.id+'" style="border-radius:18px" aria-label="اختبار الوحدة">'+ic('trophy')+'</a>اختبار الوحدة</div></div>'});
 return h+'<p class="source-note mut small">'+esc(G.source)+'</p>'};
// ———— صفحة الدرس ————
R.u=function(id){const l=find(id);if(!l)return R.home();const u=l.u,ui=G.units.indexOf(u),sc=S.done[id];
 let h='<div class="mut small"><a href="#/home">رحلتي</a> / الوحدة '+ORD[ui]+': '+esc(u.t)+'</div><h2>'+esc(l.t)+'</h2><nav class="tabsec">'+u.les.map(x=>'<a href="#/u/'+x.id+'" class="'+(x.id===id?'on':'')+'">'+esc(x.t)+'</a>').join('')+'</nav>';
 h+='<div class="card hero"><img src="'+img('teacher')+'" alt="" width="80"><div><b>سأتعلّم في هذا الدرس</b><ul class="pts">'+l.goals.map(g=>'<li>'+esc(g)+'</li>').join('')+'</ul>'+bk(l.pg)+'</div></div>';
 h+='<a class="btn big" href="#/s/'+id+'/0">'+ic('play')+' ابدأ الدرس</a>';
 h+='<div class="grid g3-acts" style="margin-top:12px"><button class="tile c1" id="go"><span class="ti">'+ic('compass')+'</span><b>تدرّب</b><small>'+(sc!=null?'أفضل نتيجة: '+sc+'٪':'أسئلة مع زرّ «تحقّق»')+'</small></button>'+
  (l.lab&&X.labs&&X.labs[l.lab]?'<a class="tile c2" href="#/l/'+l.lab+'"><span class="ti">'+ic('lab')+'</span><b>أجرّب</b><small>'+esc(X.labs[l.lab].t)+'</small></a>':'')+'</div>';
 return h};
R.after_u=id=>{const l=find(id);const g=A.$('#go');if(g)g.onclick=()=>quiz(lesQs(l),{key:id,title:l.t,back:'#/u/'+id})};
// خطوات الدرس: بطاقة واحدة في كلّ مرّة
R.s=function(id,n){const l=find(id);if(!l)return R.home();n=+n||0;const st=l.steps,s=st[n];if(!s)return location.hash='#/u/'+id,null;
 S.seen[id]=1;A.save();
 const dots='<div class="g3-dots" aria-label="الخطوة '+(n+1)+' من '+st.length+'">'+st.map((_,i)=>'<i class="'+(i<n?'d':i===n?'c':'')+'"></i>').join('')+'</div>';
 let h='<div class="mut small"><a href="#/u/'+id+'">'+esc(l.t)+'</a></div>'+dots+'<div class="card g3-step"><h3>'+esc(s.h)+(s.say?' '+A.say(s.say):'')+'</h3>'+s.b+'</div>';
 if(s.ck)h+='<div class="card g3-ck"><b>'+ic('eye')+' سؤال سريع</b><p class="qq">'+s.ck.q+'</p><div class="chips">'+shuffle(s.ck.o.map((o,i)=>[o,i])).map(([o,i])=>'<button class="chip big" data-ck="'+i+'">'+o+'</button>').join('')+'</div><div class="readout" id="ckr" hidden></div></div>';
 h+='<div class="row g3-nav">'+(n>0?'<a class="btn alt" href="#/s/'+id+'/'+(n-1)+'">السابق</a>':'')+(n<st.length-1?'<a class="btn" href="#/s/'+id+'/'+(n+1)+'">التالي</a>':'<button class="btn acc" id="go">'+ic('compass')+' تدرّب الآن</button>')+'</div>';
 return h};
R.after_s=(id,n)=>{const l=find(id),s=l&&l.steps[+n||0];if(!s)return;const g=A.$('#go');if(g)g.onclick=()=>quiz(lesQs(l),{key:id,title:l.t,back:'#/u/'+id});
 if(s.ck)A.$$('[data-ck]').forEach(b=>b.onclick=()=>{const ok=+b.dataset.ck===s.ck.a;A.$$('[data-ck]').forEach(x=>x.classList.remove('ok','bad'));b.classList.add(ok?'ok':'bad');const r=A.$('#ckr');r.hidden=false;r.textContent=ok?'أحسنت! '+(s.ck.ex||''):'حاول مرّة أخرى.';A.digits(r)});
 if(s.init&&X.init&&X.init[s.init])X.init[s.init]()};
// اختبار الوحدة
R.test=uid=>{const u=G.units.find(x=>x.id===uid);if(!u)return R.home();setTimeout(()=>{let q=[];u.les.forEach(l=>q=q.concat(lesQs(l,4)));quiz(shuffle(q).slice(0,12),{key:'T:'+uid,title:'اختبار الوحدة: '+u.t,back:'#/home'})},0);return '<p class="mut">جارٍ تحضير اختبار الوحدة…</p>'};
// ———— تحديد المستوى (اختياريّ) ————
let PL=null;
R.place=function(){return '<h2>من أين أبدأ؟</h2><div class="card hero"><img src="'+img('think')+'" alt="" width="80"><div><p>سؤالان من كلّ وحدة. لا يؤثّر الاختبار في نقاطك ولا في الإتقان، ويمكنك تخطّيه.</p></div></div><button class="btn big" id="pgo">'+ic('play')+' ابدأ الاختبار</button><button class="btn alt big" id="pskip" style="margin-top:10px">تخطَّ وابدأ من الوحدة الأولى</button>'};
R.after_place=()=>{A.$('#pskip').onclick=()=>{S.seen.place='skip';A.save();location.hash='#/home'};
 A.$('#pgo').onclick=()=>{const qs=[];G.units.forEach(u=>{const pool=[];u.les.forEach(l=>pool.push(...lesQs(l,3)));shuffle(pool).slice(0,2).forEach(q=>qs.push(Object.assign({},q,{unit:u.id})))});
  PL=qs;quiz(qs,{title:'تحديد المستوى',back:'#/placed',review:true})}};
R.placed=function(){const log=S.log[S.log.length-1];let rec=G.units[0];
 // نعيد حساب النتيجة لكل وحدة من آخر محاولة: الوحدة الأولى التي لم تُجب عن سؤاليها بشكل صحيح
 if(PL&&window.__g3wrong){const bad=new Set(window.__g3wrong.map(q=>q.unit));rec=G.units.find(u=>bad.has(u.id))||G.units[G.units.length-1]}
 S.seen.place=rec.id;A.save();PL=null;
 return '<h2>نتيجة تحديد المستوى</h2><div class="card hero"><img src="'+img('celebrate')+'" alt="" width="80"><div><p>نقترح أن تبدأ من <b>الوحدة '+ORD[G.units.indexOf(rec)]+': '+esc(rec.t)+'</b>.</p>'+(log?'<small class="mut">دقّتك: '+log.pc+'٪</small>':'')+'</div></div><a class="btn big" href="#/u/'+rec.les[0].id+'">'+ic('play')+' ابدأ من هنا</a>'};
// ———— الأساسيّات: بطاقات قلّابة ثمّ اختبار ————
R.basics=()=>'<h2>الأساسيات</h2><div class="grid">'+G.basics.map((b,i)=>'<a class="tile c'+(i%4)+'" href="#/b/'+b.id+'"><span class="ti">'+ic(b.ic||'book')+'</span><b>'+esc(b.t)+'</b><small>'+esc(b.d)+'</small></a>').join('')+'</div>';
R.b=id=>{const b=G.basics.find(x=>x.id===id);if(!b)return R.basics();
 return '<div class="mut small"><a href="#/basics">الأساسيات</a></div><h2>'+esc(b.t)+'</h2><p class="mut">اضغط البطاقة لترى الجواب.</p><div class="g3-cards">'+b.cards.map((c,i)=>'<button class="g3-flip'+(b.ltr?' ltr':'')+'" data-f="'+i+'"><span class="f">'+c[0]+(c[2]?' '+A.say(c[2]):'')+'</span><span class="k">'+c[1]+'</span></button>').join('')+'</div><button class="btn big" id="go" style="margin-top:12px">'+ic('play')+' اختبر نفسك</button>'};
R.after_b=id=>{const b=G.basics.find(x=>x.id===id);if(!b)return;A.$$('.g3-flip').forEach(x=>x.onclick=e=>{if(e.target.closest('[data-say]'))return;x.classList.toggle('on')});
 A.$('#go').onclick=()=>{const all=b.cards.map(c=>c[1]);quiz(shuffle(b.cards).slice(0,8).map(c=>({q:(b.ask||'ما الجواب؟')+'<br><b class="'+(b.ltr?'ltr':'')+'">'+c[0]+'</b>',html:true,o:[c[1],...shuffle(all.filter(x=>x!==c[1])).slice(0,3)],a:0})),{key:'b:'+id,title:b.t,back:'#/b/'+id})}};
// ———— المغامرات ————
const ADV=[['race','سباق الدقيقة','أجب عن أكبر عدد من الأسئلة في دقيقة واحدة.','bolt'],['mix','رحلة الوحدات','عشرة أسئلة من كلّ الدروس.','compass'],['match','لعبة المطابقة','صِل كلّ بطاقة بما يناسبها.','puzzle'],['review','مراجعة ذكيّة','أسئلة من الدروس التي تحتاج إلى مراجعة.','leaf']];
R.play=()=>'<h2>المغامرات</h2><div class="grid">'+ADV.map((a,i)=>'<a class="tile c'+i+'" href="#/adv/'+a[0]+'"><span class="ti">'+ic(a[3])+'</span><b>'+a[1]+'</b><small>'+a[2]+'</small></a>').join('')+'</div>';
let RACE=null;
R.adv=id=>{
 if(id==='mix'||id==='review'){setTimeout(()=>{let ls=LES;if(id==='review'){ls=LES.filter(l=>S.done[l.id]!=null&&S.done[l.id]<70);if(!ls.length)ls=LES.filter(l=>S.done[l.id]==null);if(!ls.length)ls=LES}
   let q=[];ls.forEach(l=>q=q.concat(lesQs(l,3)));quiz(shuffle(q).slice(0,10),{key:'adv:'+id,title:id==='mix'?'رحلة الوحدات':'مراجعة ذكيّة',back:'#/play'})},0);return '<p class="mut">جارٍ التحضير…</p>'}
 if(id==='match'){const pool=shuffle([].concat(...G.basics.map(b=>b.cards.map(c=>[c[0],c[1],b.ltr]))));const seen=new Set(),pairs=[];for(const p of pool){if(seen.has(p[0])||seen.has(p[1]))continue;seen.add(p[0]);seen.add(p[1]);pairs.push(p);if(pairs.length===4)break}
  RACE={pairs,left:pairs.length};return '<h2>لعبة المطابقة</h2><p class="mut">اختر بطاقة من اليمين ثمّ ما يناسبها من اليسار.</p><div class="g3-match"><div>'+pairs.map((p,i)=>'<button class="chip big'+(p[2]?' ltr':'')+'" data-m="a'+i+'">'+p[0]+'</button>').join('')+'</div><div>'+shuffle(pairs.map((p,i)=>[p,i])).map(([p,i])=>'<button class="chip big" data-m="b'+i+'">'+p[1]+'</button>').join('')+'</div></div><div class="readout" id="mres" hidden></div>'}
 if(id==='race')return '<h2>سباق الدقيقة</h2><div class="card hero"><img src="'+img('encourage')+'" alt="" width="80"><div><p>لديك ٦٠ ثانية. كلّ إجابة صحيحة تزيد نقاطك.</p><p class="mut small">أفضل نتيجة: <b>'+(S.seen.race||0)+'</b></p></div></div><button class="btn big" id="rgo">'+ic('bolt')+' انطلق</button><div id="rbox"></div>';
 return R.play()};
R.after_adv=id=>{
 if(id==='match'){let sel=null;A.$$('[data-m]').forEach(b=>b.onclick=()=>{if(b.disabled)return;const side=b.dataset.m[0];
  if(side==='a'){A.$$('[data-m^=a]').forEach(x=>x.classList.remove('on'));b.classList.add('on');sel=b;return}
  if(!sel)return;const ok=sel.dataset.m.slice(1)===b.dataset.m.slice(1);if(ok){[sel,b].forEach(x=>{x.classList.remove('on');x.classList.add('ok');x.disabled=true});sel=null;if(--RACE.left===0){const r=A.$('#mres');r.hidden=false;r.textContent='أحسنت! طابقت كلّ البطاقات.';S.done['adv:match']=100;A.addXP(20);A.checkAch()}}else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),500)}})}
 if(id==='race'){A.$('#rgo').onclick=()=>{let q=[];LES.forEach(l=>q=q.concat(lesQs(l,4)));q=shuffle(q);let i=0,ok=0,t=60;const box=A.$('#rbox');A.$('#rgo').hidden=true;
  const show=()=>{const x=q[i%q.length],oo=shuffle(x.o.map((o,j)=>({o,ok:j===x.a})));box.innerHTML='<div class="card"><div class="row" style="justify-content:space-between"><b>'+ic('bolt')+' <span id="rt">'+ar(t)+'</span> ثانية</b><b>'+ic('trophy')+' '+ar(ok)+'</b></div><div class="qq">'+x.q+'</div><div class="opts">'+oo.map((o,j)=>'<button class="opt" data-r="'+j+'">'+(x.html?o.o:esc(o.o))+'</button>').join('')+'</div></div>';A.digits(box);
   A.$$('[data-r]').forEach(b=>b.onclick=()=>{const good=oo[+b.dataset.r].ok;S.qs++;if(good){ok++;S.ok++}b.classList.add(good?'ok':'bad');setTimeout(()=>{i++;if(t>0)show()},good?250:700)})};
  show();const tm=setInterval(()=>{t--;const e=A.$('#rt');if(e)e.textContent=ar(t);if(t<=0||!A.$('#rbox')){clearInterval(tm);if(!A.$('#rbox'))return;S.seen.race=Math.max(S.seen.race||0,ok);A.addXP(ok*5);S.done['adv:race']=Math.min(100,ok*10);S.log.push({t:Date.now(),k:'adv:race',n:'سباق الدقيقة',pc:Math.min(100,ok*10)});A.save();A.checkAch();
   box.innerHTML='<div class="card end qz"><img src="'+img('celebrate')+'" alt="" width="110"><h2>انتهى الوقت!</h2><div class="big-n">'+ar(ok)+'</div><p>إجابة صحيحة</p><a class="btn" href="#/play">متابعة</a></div>'}},1000)}}};
// ———— المختبر «أجرّب» ————
R.lab=()=>{const L=X.labs||{};return '<h2>المختبر: أجرّب بنفسي</h2><div class="grid">'+Object.keys(L).map((k,i)=>'<a class="tile c'+(i%4)+'" href="#/l/'+k+'"><span class="ti">'+ic(L[k].ic||'lab')+'</span><b>'+esc(L[k].t)+'</b><small>'+esc(L[k].d)+'</small></a>').join('')+'</div>'};
R.l=id=>{const L=(X.labs||{})[id];if(!L)return R.lab();S.seen['lab:'+id]=1;A.save();A.checkAch();return '<div class="mut small"><a href="#/lab">المختبر</a></div><h2>'+esc(L.t)+'</h2><p class="mut">'+esc(L.d)+'</p><div class="card g3-lab">'+L.html()+'</div>'};
R.after_l=id=>{const L=(X.labs||{})[id];if(L&&L.init)L.init()};
})();
