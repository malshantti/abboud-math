// واجهة خفيفة لمواد العربية والعلوم، تستخدم محتوى المادة وأصولها المحلية.
(function(){
'use strict';
const A=window.APP,C=window.CFG,U=window.UNITS,{R,S,esc,ic,ar}=A;
const science=C.subject==='science';
// الشريط الجانبي يحمل هوية زيتون نفسها في مادتي الرياضيات والإنجليزية.
const side=A.$('.tabs .side');
const utilityLinks=[...side.querySelectorAll('a')].map(a=>a.outerHTML).join('');
side.className='side-brand';
side.innerHTML='<a href="#/home"><span class="brand-symbol"><img src="../../assets/brand/logo-mascot-sm.webp" width="44" height="58" alt=""></span><span>بستان التعلّم<small>نزرع الفهم، ونحصد المعرفة</small></span></a><div class="class-label">'+esc(C.title)+'<span>المنهاج الفلسطيني</span></div><div class="subject-utilities">'+utilityLinks+'</div>';
const caption=document.createElement('span');caption.className='nav-caption';caption.textContent='بستانك الصغير';side.after(caption);
const sections=[['read','القِراءَة','book'],['poem','النَّصُّ الشِّعْرِيّ','feather'],['grammar','القَواعِد','puzzle'],['balagha','البَلاغَة','star'],['imla','الإِمْلاء','pen'],['khatt','الخَطّ','quill'],['taabir','التَّعْبير','pen']];
const title=u=>science?u.t:(u.sec.read||Object.values(u.sec)[0]).t;
const items=u=>science?u.les.map(l=>({key:l.id,t:l.t,href:'#/u/'+l.id,icon:l.sim?'flask':'book',pg:l.pg})):sections.filter(([k])=>u.sec[k]).map(([k,t,icon])=>({key:u.id+':'+k,t,href:'#/u/'+u.id+'/'+k,icon,pg:u.sec[k].pg}));
const partName=p=>p===1?'الجزء الأول':'الجزء الثاني';
const unitName=u=>'الوحدة '+ar(science?+u.id.slice(1):u.n)+' · '+partName(u.part);
A.scopeUnits=id=>id==='all'?U:U.filter(u=>u.id===(id||U[0].id));
const scopeSelect=(id,route)=>'<div class="scope"><label for="unit-scope">اختر الوحدة</label><select id="unit-scope" data-route="'+route+'">'+U.map(u=>'<option value="'+u.id+'"'+(u.id===id?' selected':'')+'>'+esc(unitName(u)+' — '+title(u))+'</option>').join('')+'<option value="all"'+(id==='all'?' selected':'')+'>جميع الوحدات — مراجعة شاملة</option></select></div>';
const banner=(tag,h,description,image)=>'<header class="explore-hero"><div><span class="eyebrow">'+tag+'</span><h1>'+esc(h)+'</h1><p>'+description+'</p></div><img src="img/'+image+'.webp" alt="" width="148" height="148"></header>';
R.home=function(part){
 const p=part==='2'?2:1,units=U.filter(u=>u.part===p),list=units.flatMap(items),done=list.filter(i=>(S.done[i.key]||0)>=70).length;
 const next=list.find(i=>(S.done[i.key]||0)<70)||list[0],nextUnit=units.find(u=>items(u).some(i=>i.key===next.key));
 let h=banner('خطوة جديدة في رحلتك',C.title,science?'اقرأ الفكرة، وشاهد أشكال الكتاب، ثم جرّب وتدرّب.':'اقرأ النص، وافهم القاعدة، ثم تدرّب عليها. صفحات الكتاب مرجعك في كل درس.',science?'zaytoun-discovery-v2':'zaytoun-read');
 h+='<nav class="part-switch" aria-label="أجزاء الكتاب">'+[1,2].map(n=>'<a href="#/home/'+n+'"'+(n===p?' aria-current="page"':'')+'>'+ic('book')+partName(n)+'</a>').join('')+'</nav>';
 h+='<div class="journey-summary"><div><span class="eyebrow">'+partName(p)+'</span><h2>منهجك، خطوة بخطوة</h2></div><span>'+ar(done)+' من '+ar(list.length)+' أقسام متقنة</span></div><div class="journey-progress" role="progressbar" aria-label="إتقان '+partName(p)+'" aria-valuemin="0" aria-valuemax="'+list.length+'" aria-valuenow="'+done+'"><i style="width:'+done/list.length*100+'%"></i></div>';
 h+='<a class="continue-card" href="'+next.href+'"><span class="continue-icon">'+ic(done===list.length?'check':'play')+'</span><div><small>'+(done===list.length?'راجع ما أتقنت':'خطوتك التالية')+' · '+esc(title(nextUnit))+'</small><b>'+esc(next.t)+'</b></div>'+ic('arrow')+'</a>';
 h+='<div class="curriculum">'+units.map(u=>{const ii=items(u),d=ii.filter(i=>(S.done[i.key]||0)>=70).length;
  return '<details class="unit-card"'+(u===nextUnit?' open':'')+'><summary><span class="unit-number">'+ar(science?+u.id.slice(1):u.n)+'</span><span><small>'+unitName(u)+'</small><b>'+esc(title(u))+'</b><small>'+ar(d)+' / '+ar(ii.length)+' أقسام متقنة</small></span><span class="unit-toggle">'+ic('arrow')+'</span></summary><ol class="lesson-list">'+ii.map(i=>'<li><a href="'+i.href+'"><span class="lesson-mark '+((S.done[i.key]||0)>=70?'done':'')+'">'+ic((S.done[i.key]||0)>=70?'check':i.icon)+'</span><span><b>'+esc(i.t)+'</b><small>'+(i.pg?'كتاب الطالب · ص '+ar(i.pg):'من كتاب الطالب')+((S.done[i.key]||0)>=70?' · متقن':'')+'</small></span>'+ic('arrow')+'</a></li>').join('')+'</ol>'+(science?'<a class="unit-review" href="#/test/'+u.id+'">'+ic('target')+' تدريب مراجعة الوحدة '+ic('arrow')+'</a>':'')+'</details>';
 }).join('')+'</div>';return h;
};
const oldPlay=R.play,oldLab=R.lab,oldBasics=R.basics;
function cards(html,kind,scope){
 const t=document.createElement('template');t.innerHTML=html;
 const grid=t.content.querySelector('.grid');if(!grid)return html;
 grid.classList.add('activity-grid');
 grid.querySelectorAll('.tile').forEach((tile,i)=>{
  const href=tile.getAttribute('href'),id=href.split('/').pop(),heading=tile.querySelector('b');
  if(kind==='play'){
   const visual=tile.querySelector('.ti');const poses={match:'read',tf:'teacher',calc:'think',review:'encourage',verses:'read',irab:'think',mixed:'celebrate'};
   visual.innerHTML='<img src="img/zaytoun-'+(poses[id]||'think')+'.webp" alt="" width="104" height="128" loading="lazy">';
  }
  if(kind==='play'){
   tile.href=href+'/'+scope;
   if(science&&id==='calc'&&!A.scopeUnits(scope).some(u=>u.les.some(l=>(A.gen.NUM[l.id]||[]).length))){tile.remove();return;}
   if(science&&id==='tf')tile.querySelector('small').textContent='صواب أم خطأ؟ راجع حقائق من نطاق المراجعة الذي تختاره.';
   if(!science&&id==='mixed')tile.querySelector('small').textContent='أسئلة منوّعة من نطاق المراجعة الذي تختاره.';
   if(!science&&id==='irab')tile.querySelector('small').textContent='تدريب مهاري عام في الإعراب مناسب لصفك.';
  }
  const badge=document.createElement('span');badge.className='activity-label';badge.textContent=kind==='play'&&id==='irab'&&!science?'مهارة عامة':kind==='lab'?'اكتشف وجرّب':kind==='basics'?'مهارة أساسية':'تحدٍّ تدريبي';
  tile.insertBefore(badge,heading);
  const end=document.createElement('span');end.className='activity-start';end.innerHTML=(kind==='lab'?'افتح النشاط':'ابدأ التدريب')+ic('arrow');tile.append(end);
  tile.style.setProperty('--delay',Math.min(i,5)*35+'ms');
 });
 return grid.outerHTML;
}
R.play=function(scope){scope=scope==='all'||U.some(u=>u.id===scope)?scope:U[0].id;
 return banner('تعلّم باللعب','مغامرة صغيرة، وفكرة تثبت',science?'طابق المفاهيم، واختبر فهمك، وحل مسائل من الوحدة التي تختارها.':'طابق المفردات، وأكمل الأبيات، وراجع ما تعلّمته في الوحدة التي تختارها.','zaytoun-celebrate')+scopeSelect(scope,'play')+cards(oldPlay(),'play',scope)+'<p class="source-note">'+ic('book')+' هذه تدريبات إضافية من الموقع، وليست نقلًا لأسئلة الكتاب.</p>';
};
R.lab=function(){return banner('مساحة للاكتشاف',science?'الفكرة أمام عينيك':'جرّب اللغة بيديك',science?'غيّر القيم، ولاحظ النتيجة. افتح النشاط لتجد الدرس المرتبط به.':'ورشة للهمزة والإعراب والإملاء والخط. اختر المهارة التي تريد تقويتها.',science?'zaytoun-discovery-v2':'zaytoun-teacher')+cards(oldLab(),'lab')+'<p class="source-note">'+ic('eye')+(science?'رسوم تعليمية مبسّطة؛ تُراجع المصطلحات والتفاصيل في كتاب الطالب.':'أنشطة مهارية مساندة، ويُرجع إلى الكتاب في ضبط النصوص.')+'</p>';};
R.basics=()=>{const html=oldBasics();return A.foundationRoundActive&&A.foundationRoundActive()?html:banner('أساس أقوى','نتقن الأساس، ثم نتقدّم',science?'مهارات تساعدك على فهم التجربة وقراءة النتائج.':'مهارات لغوية تساعدك على القراءة والكتابة بثقة.','zaytoun-teacher')+cards(html,'basics')};
const oldLesson=R.u;
R.u=function(...args){const html=oldLesson(...args);return html+'<p class="source-note">'+ic('book')+(science?'الأفكار والمصطلحات من محتوى كتاب الطالب. الأشكال المرفقة مقتطفات من الكتاب، وزر التدريب يفتح أسئلة إضافية مولّدة.':'صفحات كتاب الطالب هي المرجع في رسم الكلمات وضبطها. زر التدريب يفتح أسئلة إضافية من الموقع.')+'</p>';};
const oldAfterLab=R.after_l;
R.after_l=function(...args){if(oldAfterLab)oldAfterLab(...args);
 A.$$('#sim svg g[data-z],#sim svg g[data-p]').forEach(g=>{
  const name=g.textContent.trim();g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',g.hasAttribute('data-z')?'العنصر '+name:'الكوكب '+name);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();g.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 });
};
document.addEventListener('change',e=>{if(e.target.id==='unit-scope')location.hash='#/'+e.target.dataset.route+'/'+e.target.value;});
// النصوص الديناميكية داخل المحاكاة تُحدّث بعد التوجيه أيضًا.
let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{A.digits(A.$('#app'));queued=false;});});
observer.observe(A.$('#app'),{childList:true,subtree:true,characterData:true});
})();
