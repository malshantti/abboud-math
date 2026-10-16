// محرّك مشترك لمواد العربية والعلوم (الصفّان السادس والثامن)
(function(){
'use strict';
const C=window.CFG;const K=C.key;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DIG='٠١٢٣٤٥٦٧٨٩';const ar=n=>String(n).replace(/(\d)\.(\d)/g,'$1٫$2').replace(/[0-9]/g,d=>DIG[d]);
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
// أيقونات مرسومة بخطّ موحّد
const P={home:'<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',lab:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9"/>',
book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7"/>',chart:'<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',heart:'<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',flame:'<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-4 3.5-5.5 4-10 3 2 6.5 5.5 6.5 10.3 1-.8 1.5-2 1.5-3.3 1.2 1.3 1.5 3 1.5 4C19 18.4 16 21 12 21z"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',speaker:'<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
pen:'<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',leaf:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15zM5 19c4-4 7-7 10-11"/>',feather:'<path d="M20 4C10 4 6 10 5 19M20 4c0 8-5 13-13 13M9 15l6-6"/>',atom:'<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)"/>',
flask:'<path d="M9 3h6M10 3v5L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3"/>',trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4c0 3 2 5 4 5M16 6h4c0 3-2 5-4 5M12 13v4M8 21h8M9 17h6"/>',bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',quill:'<path d="M4 20c4-1 6-3 8-6M20 4c-6 0-11 4-12 10 5 0 9-3 12-10zM10 14l-2-2"/>',puzzle:'<path d="M5 8h4V6a2 2 0 0 1 4 0v2h4v4h-2a2 2 0 0 0 0 4h2v4H5v-4h2a2 2 0 0 0 0-4H5z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z"/>',swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',door:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M16 7h5M19 4l2 3-2 3"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',play:'<path d="M8 5v14l11-7z"/>',arrow:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',cell:'<ellipse cx="12" cy="12" rx="9" ry="7"/><circle cx="13" cy="11" r="2.8"/><path d="M6 14h2M15 16h2"/>',
wave:'<path d="M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0"/>',magnet:'<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'};
const ic=(n,cls)=>'<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(P[n]||P.star)+'</svg>';
// الحالة
const blank=()=>({xp:0,streak:0,last:'',hearts:5,hday:'',done:{},seen:{},ach:[],days:{},log:[],qs:0,ok:0});
const storedProgress=()=>window.PROFILES&&PROFILES.readProgress?PROFILES.readProgress(K):localStorage.getItem(K);
let S;try{S=Object.assign(blank(),JSON.parse(storedProgress()||'{}'))}catch(e){S=blank()}
const writeProgress=window.PROFILES&&PROFILES.writer?PROFILES.writer(K):v=>{try{localStorage.setItem(K,v);return true}catch(e){return false}};
const save=()=>writeProgress(JSON.stringify(S));
if(S.hday!==today()){S.hearts=5;S.hday=today();save()}
function addXP(n){S.xp+=n;const t=today();S.days[t]=(S.days[t]||0)+n;
 if(S.last!==t){const y=new Date(Date.now()-864e5);const ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();S.streak=S.last===ys?S.streak+1:1;S.last=t}save();hdr()}
const LV=['بذرة','برعم','شتلة','غصن','شجيرة','شجرة','زيتونة','بستان'];
const lvl=()=>{let l=1,need=100,x=S.xp;while(x>=need&&l<99){x-=need;l++;need=Math.round(need*1.25)}return{l,x,need}};
function hdr(){const L=lvl();$('#hstreak').textContent=ar(S.streak);$('#hpts').textContent=ar(S.xp);$('#hhearts').textContent=ar(S.hearts);
 $('#hlvl').textContent=ar(L.l);$('#hlvlname').textContent=LV[Math.min(LV.length-1,Math.floor((L.l-1)/2))];$('#hxp').style.width=Math.round(L.x/L.need*100)+'%';$('#hxpt').textContent=ar(L.x)+' / '+ar(L.need)}
// الصوت: ملفات مسجّلة فقط، ولا قراءة آلية. إن غاب الملفّ يبقى النصّ وحده.
const AUD=window.AR_AUDIO||{};let cur=null;
function say(id){return C.audio&&AUD[id]?'<button class="say" data-say="'+esc(id)+'" aria-label="استمع">'+ic('speaker')+'</button>':''}
document.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(!b)return;const id=b.dataset.say;
 if(cur){cur.pause();$$('.say.playing').forEach(x=>x.classList.remove('playing'))}
 const a=new Audio('audio/'+AUD[id]);cur=a;b.classList.add('playing');a.onended=a.onerror=()=>b.classList.remove('playing');a.play().catch(()=>b.classList.remove('playing'))});
// أرقام عربية مشرقية في كلّ النصوص إلا ما وُسم ltr
function digits(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('.ltr,[dir=ltr],script,style,input,textarea')?2:/[0-9]/.test(n.nodeValue)?1:2});const ns=[];while(w.nextNode())ns.push(w.currentNode);ns.forEach(n=>n.nodeValue=ar(n.nodeValue))}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),2200)}
const R={};let curRoute='';
function render(){if(window.APP&&window.APP.stopSim)window.APP.stopSim();const h=location.hash.replace(/^#\/?/,'')||'home';const [r,...a]=h.split('/');curRoute=r;
 const app=$('#app');const f=R[r]||R.home;const html=f(...a.map(decodeURIComponent));
 if(html!=null){app.innerHTML='<div class="page">'+html+'</div>'}
 const t={home:'home',u:'home',basics:'basics',b:'basics',play:'play',adv:'play',lab:'lab',l:'lab',ach:'ach',report:'report',quiz:''}[r];
 $$('.tabs a[data-t]').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
 $('#page-label').textContent=({home:'رحلتي',basics:'الأساسيات',play:'المغامرات',lab:'المختبر',ach:'إنجازاتي',report:'تقرير التعلّم'})[t]||'';
 if(r==='home'&&html!=null)app.firstChild.insertAdjacentHTML('beforeend',offline());digits(app);if(R['after_'+r])R['after_'+r](...a.map(decodeURIComponent));digits(app);if(r!=='quiz')scrollTo(0,0);app.focus({preventScroll:true})}
addEventListener('hashchange',render);
function offline(){return '<div class="card row" style="justify-content:space-between"><div><b>العمل دون اتّصال</b><div class="mut small">الدّروس تعمل دون إنترنت بعد أوّل زيارة. لحفظ صفحات الكتاب كلّها'+(C.audio?' والتّسجيلات':'')+' دفعة واحدة:</div></div><button class="btn alt" id="offbtn">'+ic('check')+' احفظ الكتاب على الجهاز</button></div>'}
document.addEventListener('click',e=>{if(!e.target.closest('#offbtn'))return;const b=$('#offbtn');if(!('serviceWorker' in navigator)||!navigator.serviceWorker.controller){toast('افتح الموقع مرّة أخرى بعد اتّصال الإنترنت ثمّ أعد المحاولة');return}
 b.disabled=true;b.textContent='جارٍ الحفظ…';const s=document.createElement('script');s.src='media.js';s.onload=()=>{navigator.serviceWorker.controller.postMessage({cacheAll:window.MEDIA||[]})};document.head.append(s);
 navigator.serviceWorker.addEventListener('message',m=>{if(m.data&&m.data.cached){b.textContent='حُفظ الكتاب على هذا الجهاز';try{localStorage.setItem(K+'_off','1')}catch(e){}}},{once:true})});
// الاختبار
let Q=null;
function quiz(qs,meta){if(!qs.length){toast('لا تتوافر أسئلة لهذا النشاط في الوحدة المختارة؛ اختر نشاطًا آخر.');return}Q={qs:qs.map(q=>{const o=q.o.map((t,i)=>({t,ok:i===q.a}));return Object.assign({},q,{oo:q.keep?o:shuffle(o)})}),i:0,ok:0,meta,wrong:[]};location.hash='#/quiz';if(curRoute==='quiz')render()}
R.quiz=function(){if(!Q)return location.hash='#/home',null;const q=Q.qs[Q.i];const pc=Math.round(Q.i/Q.qs.length*100);
 return '<div class="qz"><div class="qbar"><button class="x" id="qx" aria-label="إنهاء">'+ic('x')+'</button><div class="track"><div class="fill" style="width:'+pc+'%"></div></div><span class="pill" style="background:var(--bad-bg);color:var(--bad)">'+ic('heart')+' <b>'+S.hearts+'</b></span></div>'+
 (q.pre?'<div class="mut small">'+q.pre+'</div>':'')+'<div class="qq">'+q.q+(q.say?' '+say(q.say):'')+'</div>'+(q.img?'<figure class="book"><img src="'+q.img+'" alt="" loading="lazy"></figure>':'')+
 '<div class="opts">'+q.oo.map((o,i)=>'<button class="opt'+(q.arOpt?' ar':'')+'" data-i="'+i+'">'+(q.html?o.t:esc(o.t))+'</button>').join('')+'</div>'+
 '<div class="chk"><button class="btn big" id="qchk" disabled>تحقّق</button></div></div><div class="fb" id="fb"><div class="in"><div><b id="fbt"></b><div id="fbx" class="small"></div></div><button class="btn" id="qnext">متابعة</button></div></div>'};
R.after_quiz=function(){if(!Q)return;let sel=-1;const q=Q.qs[Q.i];
 $$('.opt').forEach(b=>b.onclick=()=>{if($('#fb').classList.contains('show'))return;$$('.opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');sel=+b.dataset.i;$('#qchk').disabled=false});
 $('#qx').onclick=()=>{Q=null;history.back()};
 $('#qchk').onclick=()=>{if(sel<0)return;const ok=q.oo[sel].ok;S.qs++;if(ok){Q.ok++;S.ok++}else{S.hearts=Math.max(0,S.hearts-1);Q.wrong.push(q)}save();hdr();
  $$('.opt').forEach((b,i)=>{if(q.oo[i].ok)b.classList.add('ok');else if(i===sel)b.classList.add('bad')});
  const fb=$('#fb');fb.className='fb show '+(ok?'ok':'bad');$('#fbt').innerHTML=ok?pick(['أحسنت!','إجابة صحيحة','رائع، تابع']):'الإجابة الصحيحة: '+(q.html?q.oo.find(o=>o.ok).t:esc(q.oo.find(o=>o.ok).t));
  $('#fbx').innerHTML=q.ex?esc(q.ex):'';digits(fb);$('#qnext').className='btn '+(ok?'ok':'bad');$('#qchk').disabled=true;$('#qnext').focus()};
 $('#qnext').onclick=()=>{Q.i++;if(Q.i>=Q.qs.length)return finish();render()}};
function finish(){const n=Q.qs.length,pc=Math.round(Q.ok/n*100),xp=Q.ok*10+(pc===100?20:0);addXP(xp);const m=Q.meta||{};
 if(m.key){S.done[m.key]=Math.max(S.done[m.key]||0,pc)}S.log.push({t:Date.now(),k:m.key||'',n:m.title||'',pc});if(S.log.length>200)S.log.shift();save();checkAch();
 const wrong=Q.wrong;Q=null;$('#app').innerHTML='<div class="page qz end card"><img src="img/'+(pc>=70?'zaytoun-celebrate':'zaytoun-encourage')+'.webp" alt=""><h2>'+(pc>=90?'ممتاز!':pc>=70?'عمل جيّد':'نتعلّم من الخطأ')+'</h2><div class="statrow"><div><div class="big-n">'+pc+'٪</div>الدقّة</div><div><div class="big-n">+'+xp+'</div>نقاط</div></div>'+
 (wrong.length?'<div class="card" style="text-align:right"><b>راجع هذه:</b><ul>'+wrong.map(q=>'<li>'+q.q.replace(/<[^>]+>/g,'')+' — <b>'+(q.html?q.o[q.a]:esc(q.o[q.a]))+'</b></li>').join('')+'</ul></div>':'')+
 '<div class="row" style="justify-content:center;margin-top:12px">'+(wrong.length?'<button class="btn acc" id="again">أعِد الأخطاء</button>':'')+'<a class="btn" href="'+(m.back||'#/home')+'">متابعة</a></div></div>';digits($('#app'));
 const ag=$('#again');if(ag)ag.onclick=()=>quiz(wrong,m)}
// الإنجازات
const ACH=[['first','أوّل خطوة','أنهِ أوّل تمرين',()=>S.log.length>0,'leaf'],['x100','مئة نقطة','اجمع ١٠٠ نقطة',()=>S.xp>=100,'star'],['x1000','ألف نقطة','اجمع ١٠٠٠ نقطة',()=>S.xp>=1000,'trophy'],['st3','ثلاثة أيّام','واظب ٣ أيّام',()=>S.streak>=3,'flame'],['st7','أسبوع كامل','واظب ٧ أيّام',()=>S.streak>=7,'flame'],['p100','علامة كاملة','أنهِ تمرينًا دون خطأ',()=>S.log.some(l=>l.pc===100),'target'],['u5','خمس محطّات','أتقن ٥ أقسام',()=>Object.values(S.done).filter(v=>v>=70).length>=5,'book'],['u20','عشرون محطّة','أتقن ٢٠ قسمًا',()=>Object.values(S.done).filter(v=>v>=70).length>=20,'book'],['lab','مجرّب','جرّب ٣ أنشطة في المختبر',()=>Object.keys(S.seen).filter(k=>k.startsWith('lab:')).length>=3,'lab'],['q200','مثابر','أجب عن ٢٠٠ سؤال',()=>S.qs>=200,'bolt']];
function checkAch(){ACH.forEach(a=>{if(!S.ach.includes(a[0])&&a[3]()){S.ach.push(a[0]);toast('إنجاز جديد: '+a[1])}});save()}
R.ach=()=>'<h2>إنجازاتي</h2><div class="card hero"><img src="img/zaytoun-celebrate.webp" alt=""><div><b>المستوى '+lvl().l+'</b><div class="mut">'+S.xp+' نقطة، '+S.streak+' يوم متتالٍ، '+S.qs+' سؤالًا أُجيب عنه</div></div></div><div class="ach">'+ACH.map(a=>'<div class="'+(S.ach.includes(a[0])?'':'lock')+'">'+ic(a[4])+'<b style="display:block">'+a[1]+'</b><small class="mut">'+a[2]+'</small></div>').join('')+'</div>';
// تقرير وليّ الأمر
R.report=function(){const P=window.PROFILES;let name='';try{const s=JSON.parse(localStorage.getItem('bustan_session')||'null');const p=P&&P.list().find(x=>x.id===(s&&s.id));name=p?p.name:''}catch(e){}
 const d=(P&&(()=>{try{const s=JSON.parse(localStorage.getItem('bustan_session'));return P.dataOf(s.id,K)}catch(e){return null}})())||S;
 const items=C.sections();const days=[];for(let i=6;i>=0;i--){const t=new Date(Date.now()-i*864e5);const k=t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate();days.push([t.toLocaleDateString('ar',{weekday:'short'}),(d.days||{})[k]||0])}
 const mx=Math.max(10,...days.map(x=>x[1]));const acc=d.qs?Math.round(d.ok/d.qs*100):0;
 const weak=items.filter(i=>d.done[i.key]!=null&&d.done[i.key]<70);
 return '<h2>تقرير التعلّم'+(name?' — '+esc(name):'')+'</h2><p class="mut">'+C.title+'. ملخّص لوليّ الأمر من التقدّم المحفوظ على هذا الجهاز.</p>'+
 '<div class="statrow"><div><div class="big-n">'+(d.xp||0)+'</div>نقاط</div><div><div class="big-n">'+(d.streak||0)+'</div>أيّام متتالية</div><div><div class="big-n">'+acc+'٪</div>دقّة الإجابات</div><div><div class="big-n">'+Object.values(d.done).filter(v=>v>=70).length+'/'+items.length+'</div>أقسام متقنة</div></div>'+
 '<div class="card"><b>نشاط آخر سبعة أيّام</b><div style="display:flex;gap:8px;align-items:flex-end;height:120px;margin-top:10px">'+days.map(x=>'<div style="flex:1;text-align:center"><div style="height:'+Math.round(x[1]/mx*90)+'px;background:var(--pri);border-radius:6px 6px 0 0"></div><small>'+x[0]+'</small></div>').join('')+'</div></div>'+
 (weak.length?'<div class="card"><b>يحتاج إلى مراجعة</b><ul>'+weak.map(i=>'<li><a href="'+i.href+'">'+esc(i.name)+'</a> ('+d.done[i.key]+'٪)</li>').join('')+'</ul></div>':'')+
 allStudents()+'<div class="card"><div class="table-scroll"><table class="rep"><tr><th>القسم</th><th>أفضل نتيجة</th></tr>'+items.map(i=>'<tr><td><a href="'+i.href+'">'+esc(i.name)+'</a></td><td>'+(d.done[i.key]!=null?'<div class="bar"><i style="width:'+d.done[i.key]+'%"></i></div>':'<span class="mut small">لم يبدأ</span>')+'</td></tr>').join('')+'</table></div></div><div class="row"><button class="btn alt" onclick="print()">طباعة التقرير</button><button class="btn alt" id="csv">تنزيل CSV</button><button class="btn alt" id="share" hidden>مشاركة</button></div>'};
function stuRows(){const P=window.PROFILES;if(!P)return[];const n=C.sections().length;return P.list().map(p=>{const d=P.dataOf(p.id,K)||{};const done=d.done||{};const m=Object.values(done).filter(v=>v>=70).length;const last=(d.log||[]).slice(-1)[0];return[p.name,d.xp||0,d.streak||0,d.qs?Math.round(d.ok/d.qs*100):0,m+'/'+n,last?new Date(last.t).toLocaleDateString('ar'):'—']})}
function allStudents(){const rows=stuRows();if(rows.length<1)return '';return '<div class="card"><b>كلّ الطّلّاب على هذا الجهاز</b><div class="table-scroll"><table class="rep"><tr><th>الطّالب</th><th>النّقاط</th><th>أيّام متتالية</th><th>الدّقّة</th><th>أقسام متقنة</th><th>آخر نشاط</th></tr>'+rows.map(r=>'<tr>'+r.map((x,i)=>'<td>'+esc(x)+(i===3?'٪':'')+'</td>').join('')+'</tr>').join('')+'</table></div></div>'}
function csvBlob(){const rows=[['الطالب','النقاط','أيام متتالية','الدقة %','أقسام متقنة','آخر نشاط']].concat(stuRows());const txt='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');return new Blob([txt],{type:'text/csv'})}
R.after_report=function(){const name='report-'+C.ap+'.csv';$('#csv').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(csvBlob());a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 const f=new File([csvBlob()],name,{type:'text/csv'});if(navigator.canShare&&navigator.canShare({files:[f]})){const b=$('#share');b.hidden=false;b.onclick=()=>navigator.share({files:[f],title:C.title}).catch(()=>{})}};
// صورة من الكتاب
const fig=(src,pg,cap,eager)=>'<figure class="book"><img src="bookimg/'+src+'" alt="'+esc(cap||('صفحة '+pg+' من كتاب الطالب'))+'" loading="'+(eager?'eager':'lazy')+'" decoding="async"><figcaption>'+ic('book')+'من كتاب الطالب ص '+pg+(cap?' — '+esc(cap):'')+'</figcaption></figure>';
$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('abboud_theme',t)}catch(e){}};
$$('[data-ic]').forEach(e=>e.insertAdjacentHTML('afterbegin',ic(e.dataset.ic)));
window.APP={$,$$,esc,ar,rnd,pick,shuffle,ic,S,save,addXP,quiz,R,render,say,fig,toast,digits,checkAch,hdr};
addEventListener('DOMContentLoaded',()=>{hdr();render()});
})();
