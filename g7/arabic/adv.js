// مغامرات إضافية للصفوف ٤ و٥ و٧ (بمستوى الصف السادس): مهمّات الوحدات، سباق المفاهيم، مسائل المختبر، تحدّيات اللغة — كلّها من محتوى كتاب الطالب.
(function(){
'use strict';
const A=window.APP,U=window.UNITS,C=window.CFG||{};if(!A||!U||!A.gen)return;
const {esc,ic,shuffle,S,R,quiz}=A;const Gn=A.gen,LES=Gn.LES||[];const AR=n=>A.ar?A.ar(n):String(n);
const SUB=C.subject,G=+C.grade,LAB=window.LAB||{items:[]};
const oldPlay=R.play,oldAdv=R.adv,oldAfter=R.after_adv;
const ORD=['الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة','التاسعة','العاشرة','الحادية عشرة','الثانية عشرة','الثالثة عشرة','الرابعة عشرة','الخامسة عشرة','السادسة عشرة','السابعة عشرة','الثامنة عشرة','التاسعة عشرة','العشرون'];
const uname=(u,i)=>'الوحدة '+(ORD[i]||AR(i+1));
const EN=SUB==='english';const W=t=>EN?'<span class="ltr" dir="ltr">'+esc(t)+'</span>':esc(t);
const safe=f=>{try{return f()||[]}catch(e){return []}};
const mc=(q,o,a,ex,pre)=>({q,o,a,ex:ex||'',pre:pre||'',html:0});
// ——— مسائل المختبر: قوانين كتاب العلوم للصف السابع ———
const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const opts=(c,unit)=>{const s=new Set([c]);const cand=[c*2,c/2,c+r(1,5),c-r(1,5),c*10,c+10].map(x=>Math.round(x*100)/100).filter(x=>x>0&&!s.has(x));const o=[c];for(const x of shuffle(cand)){if(o.length>=4)break;if(!o.includes(x))o.push(x)}const oo=shuffle(o);return[oo.map(x=>AR(x)+' '+unit),oo.indexOf(c)]};
const NUMG=G===7&&SUB==='science'?[
 ['U3L1',()=>{const t=r(2,10),v=r(2,12),d=v*t;const[o,a]=opts(v,'م/ث');return mc('قطع جسم '+AR(d)+' مترًا في '+AR(t)+' ثوانٍ. ما سرعته؟',o,a,'السرعة = المسافة ÷ الزمن = '+AR(d)+' ÷ '+AR(t)+' = '+AR(v)+' م/ث')}],
 ['U3L2',()=>{const t=r(2,8),a0=r(1,5),v1=r(0,10),v2=v1+a0*t;const[o,a]=opts(a0,'م/ث²');return mc('زادت سرعة سيارة من '+AR(v1)+' م/ث إلى '+AR(v2)+' م/ث خلال '+AR(t)+' ث. ما تسارعها؟',o,a,'ت = (ع٢ − ع١) ÷ ز = ('+AR(v2)+' − '+AR(v1)+') ÷ '+AR(t)+' = '+AR(a0)+' م/ث²')}],
 ['U3L4',()=>{const m=r(2,20),ac=r(1,6),f=m*ac;const[o,a]=opts(f,'نيوتن');return mc('ما القوة المحصّلة اللازمة لإكساب جسم كتلته '+AR(m)+' كغم تسارعًا مقداره '+AR(ac)+' م/ث²؟',o,a,'ق = ك × ت = '+AR(m)+' × '+AR(ac)+' = '+AR(f)+' نيوتن')}],
 ['U3L4',()=>{const m=r(2,20),g=10,w=m*g;const[o,a]=opts(w,'نيوتن');return mc('ما وزن جسم كتلته '+AR(m)+' كغم؟ (ج = ١٠ م/ث²)',o,a,'الوزن = ك × ج = '+AR(m)+' × ١٠ = '+AR(w)+' نيوتن')}],
 ['U5L1',()=>{const v=r(2,20)*5,d=[0.5,1,2,2.5,4,8][r(0,5)],m=v*d;const[o,a]=opts(d,'غم/سم³');return mc('جسم كتلته '+AR(m)+' غم وحجمه '+AR(v)+' سم³. ما كثافته؟ وهل يطفو على الماء؟',o,a,'الكثافة = الكتلة ÷ الحجم = '+AR(d)+' غم/سم³؛ '+(d<1?'أقلّ من كثافة الماء فيطفو.':d>1?'أكبر من كثافة الماء فيغوص.':'تساوي كثافة الماء.'))}],
 ['U5L2',()=>{const A2=r(1,10),p=r(2,30)*10,f=p*A2;const[o,a]=opts(p,'باسكال');return mc('قوة عمودية مقدارها '+AR(f)+' نيوتن تؤثّر في سطح مساحته '+AR(A2)+' م². ما الضغط؟',o,a,'ض = ق ÷ م = '+AR(f)+' ÷ '+AR(A2)+' = '+AR(p)+' باسكال')}],
 ['U5L3',()=>{const h=r(1,20),d=1000,p=h*d*10;const[o,a]=opts(p,'باسكال');return mc('احسب ضغط الماء على عمق '+AR(h)+' م (ث = ١٠٠٠ كغم/م³، ج = ١٠).',o,a,'ض = ل × ث × ج = '+AR(h)+' × ١٠٠٠ × ١٠ = '+AR(p)+' باسكال')}],
 ['U5L3',()=>{const a1=r(1,10),k=r(5,40),a2=a1*k,f1=r(1,10)*10,f2=f1*k;const[o,a]=opts(f2,'نيوتن');return mc('مكبس هيدروليكي: مساحة مكبسه الصغير '+AR(a1)+' سم² ومساحة الكبير '+AR(a2)+' سم². أثّرنا في الصغير بقوة '+AR(f1)+' نيوتن. ما القوة الناتجة على الكبير؟',o,a,'ق١ ÷ م١ = ق٢ ÷ م٢ ⇒ ق٢ = '+AR(f1)+' × '+AR(a2)+' ÷ '+AR(a1)+' = '+AR(f2)+' نيوتن')}],
 ['U5L4',()=>{const wa=r(10,60),b=r(2,wa-2),ww=wa-b;const[o,a]=opts(b,'نيوتن');return mc('وزن جسم في الهواء '+AR(wa)+' نيوتن، ووزنه وهو مغمور في الماء '+AR(ww)+' نيوتن. ما قوة الطفو؟',o,a,'قوة الطفو = الوزن في الهواء − الوزن في الماء = '+AR(b)+' نيوتن')}],
 ['U6L2',()=>{const v=r(1,5),c=r(2,20)*5,m=c*v;const[o,a]=opts(c,'غم/لتر');return mc('أذيب '+AR(m)+' غم من الملح في ماء فتكوّن محلول حجمه '+AR(v)+' لتر. ما تركيزه؟',o,a,'التركيز = كتلة المذاب ÷ حجم المحلول = '+AR(c)+' غم/لتر')}],
 ['U6L3',()=>{const w=[50,100,200,250][r(0,3)],s=r(5,40),m=s*w/100;const[o,a]=opts(s,'غم/١٠٠ غم ماء');return mc('أذيب '+AR(m)+' غم من مادة في '+AR(w)+' غم ماء حتى الإشباع. ما ذائبيتها؟',o,a,'الذائبية = كتلة المذاب × ١٠٠ ÷ كتلة الماء = '+AR(s)+' غم/١٠٠ غم ماء')}],
 ['U8L1',()=>{const C2=[['الماء',4000],['الحديد',460],['النحاس',400],['الذهب',125]][r(0,3)],m=r(1,5),dt=r(1,10)*5,q=m*C2[1]*dt;const[o,a]=opts(q,'جول');return mc('ما كمية الحرارة اللازمة لرفع درجة حرارة '+AR(m)+' كغم من '+C2[0]+' بمقدار '+AR(dt)+' س°؟ (الحرارة النوعية '+AR(C2[1])+' جول/كغم.س°)',o,a,'كمية الحرارة = الكتلة × الحرارة النوعية × التغيّر في درجة الحرارة = '+AR(q)+' جول')}]
]:[];
const SIMS=window.SIMS||{};
const simQs=us=>{const q=[];const ids=new Set(LES.filter(l=>us.includes(l.u)).map(l=>l.id));
 (LAB.items||[]).filter(x=>x.k==='sim'&&x.les.some(i=>ids.has(i))).forEach(it=>{const M=SIMS[it.sim];if(!M)return;
  if(M.items&&M.bins)M.items.forEach(x=>{if(M.bins.length<2)return;const o=M.bins.slice(0,6);q.push(mc((M.intro?esc(M.intro)+'<br>':'')+'<b>'+esc(x[0])+'</b>',o,o.indexOf(x[1]),'«'+x[0]+'» ← '+x[1]+(x[2]?' — '+x[2]:''),'من المختبر: '+esc(it.t)))});
  if(M.seq&&M.seq.length>2)for(let i=0;i<M.seq.length-1;i++){const o=shuffle(M.seq.filter((y,j)=>j!==i)).slice(0,3);if(!o.includes(M.seq[i+1]))o[0]=M.seq[i+1];const oo=shuffle(o);q.push(mc(esc(M.intro||'')+'<br>ما الذي يأتي بعد «'+esc(M.seq[i])+'»؟',oo,oo.indexOf(M.seq[i+1]),M.seq.join(' ← '),'من المختبر: '+esc(it.t)))}});
 return q};
const numQs=us=>{const ids=new Set(LES.filter(l=>us.includes(l.u)).map(l=>l.id));return NUMG.filter(g=>ids.has(g[0])).flatMap(g=>[g[1](),g[1]()])};
const drillQs=us=>{const ids=new Set(LES.filter(l=>us.includes(l.u)).map(l=>l.id));return (LAB.items||[]).filter(x=>x.k==='drill'&&(!x.les.length||x.les.some(i=>ids.has(i)))).flatMap(x=>x.data.map(d=>mc(esc(d[0]),d[1].slice(),d[2],(d[3]||'الإجابة: '+d[1][d[2]])+(d[4]?' (الكتاب ص '+(d[4]%1000)+')':''),esc(x.t))))};
const sentQs=us=>{const ids=new Set(LES.filter(l=>us.includes(l.u)).map(l=>l.id));const q=[];(LAB.items||[]).filter(x=>x.k==='build'&&x.les.some(i=>ids.has(i))).forEach(x=>x.data.forEach(d=>{const w=d[0].split(' ');if(w.length<4)return;const bad=new Set();for(let k=0;k<12&&bad.size<3;k++){const s=shuffle(w.slice()).join(' ');if(s!==d[0])bad.add(s)}if(bad.size<2)return;const o=shuffle([d[0],...bad]);q.push({q:EN?'Choose the sentence in the correct order:':'اختر الجملة المرتّبة ترتيبًا صحيحًا:',o:o.map(W),a:o.indexOf(d[0]),html:1,ex:(EN?'':'من الكتاب ص ')+(EN?'':AR(d[1]%1000)),pre:''})}));return q};
const lesQ=l=>{const b=safe(()=>Gn.bookQs(l)),t=safe(()=>Gn.termQs(l,3)),f=safe(()=>Gn.factQs(l,2)),n=SUB==='math'?safe(()=>Gn.numQs(l,2)):[];return b.concat(t,f,n).map(q=>Object.assign({},q,{pre:(q.pre?q.pre+' · ':'')+'درس: '+esc(l.t)+(l.pg?' (ص '+AR(l.pg%1000)+')':'')}))};
// ——— قائمة المغامرات ———
const XA=[['mission','مهمّات الوحدات','مهمّة لكلّ وحدة: أسئلة الكتاب وصفحاته ومفاهيمه درسًا درسًا.','compass'],['race','سباق المفاهيم','دقيقة واحدة: كم مفهومًا من الكتاب تعرف؟','bolt']];
if(SUB==='science')XA.push(['labq','مسائل المختبر',G===7?'مسائل عددية بقوانين الكتاب وأسئلة من محاكاة المختبر.':'أسئلة من محاكاة المختبر وتجاربه.','flask']);
if(SUB==='arabic'&&(LAB.items||[]).some(x=>x.k==='drill'))XA.push(['lang','تحدّي الإملاء والقواعد','همزات، تاء، لام، إعراب: من تدريبات الكتاب.','pen']);
if((LAB.items||[]).some(x=>x.k==='build'))XA.push(['order',EN?'Sentence Quest — ترتيب الجمل':'ترتيب الجمل','نختار الجملة الصحيحة الترتيب من جمل الكتاب.','puzzle']);
XA.push(['mixed','الجولة الشاملة','أسئلة من كلّ وحدات الكتاب معًا.','star']);
R.play=(...a)=>{const h=oldPlay?oldPlay(...a):'';const extra='<h3 style="margin-top:16px">مغامرات أكثر</h3><div class="grid">'+XA.map((x,i)=>'<a class="tile c'+((i+2)%5)+'" href="#/adv/'+x[0]+'"><span class="ti">'+ic(x[3])+'</span><b>'+x[1]+'</b><small>'+x[2]+'</small></a>').join('')+'</div>';return h+extra};
let RACE=null;
const pickUnits=id=>'<h2>'+XA.find(x=>x[0]===id)[1]+'</h2><p class="mut">اختر الوحدة:</p><div class="grid">'+U.map((u,i)=>'<a class="tile c'+(i%5)+'" href="#/adv/'+id+'/'+u.id+'"><span class="ti">'+ic('book')+'</span><b>'+uname(u,i)+'</b><small>'+esc(u.t)+'</small></a>').join('')+(id!=='mission'?'<a class="tile c4" href="#/adv/'+id+'/all"><span class="ti">'+ic('star')+'</span><b>كلّ الوحدات</b><small>جولة من الكتاب كلّه</small></a>':'')+'</div><a class="btn alt" href="#/play">العودة إلى المغامرات</a>';
R.adv=(id,scope)=>{const X=XA.find(x=>x[0]===id);if(!X){RACE=null;return oldAdv(id,scope)}
 if(!scope&&id!=='mixed')return pickUnits(id);
 const us=id==='mixed'||scope==='all'?U:U.filter(u=>u.id===scope);if(!us.length)return pickUnits(id);
 const lessons=LES.filter(l=>us.includes(l.u));const back='#/adv/'+id;
 if(id==='race'){const bank=[];lessons.forEach(l=>(l.terms||[]).forEach(t=>{if(t[1]&&t[1].length<110)bank.push([t[0],t[1],l])}));if(bank.length<4)return '<p>لا تتوافر مفاهيم كافية في هذه الوحدة.</p><a class="btn" href="'+back+'">رجوع</a>';
  RACE={bank,ok:0,n:0,end:0,best:+(S.raceBest&&S.raceBest[scope])||0,scope};
  return '<h2>سباق المفاهيم</h2><p class="mut">اختر المفهوم الذي يطابق التعريف. لديك ٦٠ ثانية!</p><div class="row"><span class="pill" id="rt">٦٠</span><span class="pill" id="rs">٠</span><span class="pill">أفضل نتيجة: '+AR(RACE.best)+'</span></div><div class="card"><div id="rq" style="font-weight:700;min-height:60px'+(EN?';direction:ltr;text-align:left':'')+'"></div><div class="chips" id="ro" style="justify-content:center"></div></div><div class="row"><button class="btn" id="rgo">ابدأ</button><a class="btn alt" href="'+back+'">رجوع</a></div>'}
 setTimeout(()=>{let q=[];
  if(id==='mission'){lessons.forEach(l=>q=q.concat(shuffle(lesQ(l)).slice(0,3)));q=q.concat(shuffle(simQs(us)).slice(0,3),numQs(us).slice(0,2),shuffle(drillQs(us)).slice(0,3));
   q=q.map(x=>{if(x.img)return x;const l=lessons.find(l=>x.pre&&x.pre.includes(esc(l.t)));return x})}
  if(id==='labq')q=shuffle(numQs(us)).concat(shuffle(simQs(us))).slice(0,12);
  if(id==='lang')q=shuffle(drillQs(us));
  if(id==='order')q=shuffle(sentQs(us));
  if(id==='mixed'){lessons.forEach(l=>q=q.concat(shuffle(lesQ(l)).slice(0,1)));q=shuffle(q)}
  if(!q.length){A.toast('لا تتوافر أسئلة من هذا النوع في الوحدة المختارة. اختر وحدة أخرى.');location.hash=back;return}
  quiz(id==='mission'?q.slice(0,14):shuffle(q).slice(0,12),{key:'adv:'+id,title:X[1]+(scope&&scope!=='all'?' — '+uname(null,U.findIndex(u=>u.id===scope)):''),back:'#/play'})},0);return '<p class="mut">جارٍ تجهيز المهمّة…</p>'};
R.after_adv=(id,scope)=>{if(id!=='race'||!RACE){return oldAfter&&oldAfter(id,scope)}const RC=RACE;let tm=null;
 const next=()=>{const t=RC.bank[Math.floor(Math.random()*RC.bank.length)];const o=shuffle([t[0],...shuffle(RC.bank.filter(x=>x[0]!==t[0])).slice(0,3).map(x=>x[0])]);
  A.$('#rq').innerHTML=W(t[1]);A.$('#ro').innerHTML=o.map(x=>'<button class="chip">'+W(x)+'</button>').join('');
  A.$$('#ro .chip').forEach((b,i)=>b.onclick=()=>{if(!RC.end)return;RC.n++;if(o[i]===t[0]){RC.ok++;b.classList.add('ok')}else b.classList.add('bad');A.$('#rs').textContent=AR(RC.ok);setTimeout(()=>{if(RC.end&&document.getElementById('ro'))next()},250)})};
 A.$('#rgo').onclick=()=>{RC.ok=0;RC.n=0;RC.end=Date.now()+60000;A.$('#rgo').disabled=true;next();clearInterval(tm);tm=setInterval(()=>{const e=document.getElementById('rt');if(!e){clearInterval(tm);return}const left=Math.max(0,Math.ceil((RC.end-Date.now())/1000));e.textContent=AR(left);
  if(!left){clearInterval(tm);RC.end=0;S.raceBest=S.raceBest||{};if(RC.ok>(S.raceBest[RC.scope]||0))S.raceBest[RC.scope]=RC.ok;A.addXP&&A.addXP(RC.ok);A.save();A.$('#rq').innerHTML='انتهى الوقت! أجبت '+AR(RC.ok)+' إجابة صحيحة من '+AR(RC.n)+'.';A.$('#ro').innerHTML='';A.$('#rgo').disabled=false;A.$('#rgo').textContent='مرّة أخرى'}},250)}};
})();
