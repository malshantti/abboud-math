/* أنشطة الصف الأول: خطوة واحدة في الشاشة، وحفظ مستقل لكل طفل. */
(() => {
  'use strict';
  const ar=value=>String(value??'').replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shown=value=>esc(ar(value));
  const direction=value=>/[\u0621-\u064a\u066e-\u06d3]/.test(String(value).replace(/[٠-٩۰-۹]/g,''))?'rtl':'ltr';
  function normalize(raw,ids) {
    let input;try{input=typeof raw==='string'?JSON.parse(raw):raw;}catch(_){input=null;}
    const out={version:1,completed:{},rounds:0,last:null};
    if(!input||typeof input!=='object'||Array.isArray(input)||input.version!==1)return out;
    const records=input.completed&&typeof input.completed==='object'&&!Array.isArray(input.completed)?input.completed:{};
    for(const id of ids){if(!Object.hasOwn(records,id))continue;const record=records[id];
      if(record&&typeof record==='object'&&typeof record.at==='string'&&Number.isFinite(Date.parse(record.at))&&Number.isInteger(record.attempts)&&record.attempts>0&&record.attempts<=10000)out.completed[id]={at:record.at,attempts:record.attempts};
    }
    if(Number.isInteger(input.rounds)&&input.rounds>=0&&input.rounds<=100000)out.rounds=input.rounds;
    if(ids.includes(input.last))out.last=input.last;
    return out;
  }
  /* يوزّع موضع الإجابة الصحيحة: لا يتكرر الموضع نفسه في سؤالين متتاليين، ويبدّل نمط المواضع. */
  function order(task,current){const list=task.choices.map((choice,i)=>({choice,i}));const n=list.length,correct=list[task.answer];
    if(!current.slots||!current.slots.length){const a=[...Array(n).keys()];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}current.slots=a;}
    let pos=current.slots.shift()%n;if(pos===current.lastPos&&n>1)pos=(pos+1+Math.floor(Math.random()*(n-1)))%n;current.lastPos=pos;
    const rest=list.filter(x=>x!==correct);for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
    rest.splice(pos,0,correct);return rest;}
  window.G1_ORDER=order;
  window.G1_PROGRESS=Object.freeze({normalize});
  if(typeof document==='undefined')return;
  const C=window.G1_COURSE,P=window.PROFILES,A=window.G1_ART,app=document.getElementById('app');
  if(!C||!P||!A){app.innerHTML='<p class="g1-notice" role="alert">تعذّر تحميل النشاط. أعد فتح الصفحة.</p>';return;}
  /* درس مدموج (mergedInto): يُخفى من القوائم، ويبقى معرّفه وإنجازه السابق محسوبًا للدرس الذي دُمج فيه. */
  const merged={};const unmerge=list=>list.filter(lesson=>{if(!lesson.mergedInto)return true;(merged[lesson.mergedInto]=merged[lesson.mergedInto]||[]).push(lesson.id);return false;});
  C.units.forEach(unit=>{unit.lessons=unmerge(unit.lessons);});if(C.foundations)C.foundations=unmerge(C.foundations);
  const curriculum=C.units.flatMap(unit=>unit.lessons.map(lesson=>({...lesson,unit:unit.title,term:unit.term})));
  const foundations=(C.foundations||[]).map(lesson=>({...lesson,unit:'أساسياتي'}));
  const lessons=[...curriculum,...foundations],ids=[...lessons.map(lesson=>lesson.id),...Object.values(merged).flat()];
  const routeNames={home:'رحلتي',basics:'أساسياتي',play:'مغامراتي',lab:'أجرّب',report:'لوليّ الأمر'};
  const shortNames={home:'رحلتي',basics:'الأساس',play:'ألعب',lab:'أجرّب',report:'للأهل'};
  const routes={home:'home',basics:'seed',play:'map',lab:'lab',report:'report'};
  const icon=name=>A.icon(name),scene=value=>value?A.scene(value):'';
  const query=selector=>app.querySelector(selector);
  let state,save,student,term=1,session=null,serial=0,labCount=0,labTarget=3,traceLetter=null,labMode='count';
  const done=id=>Object.hasOwn(state.completed,id)||(merged[id]||[]).some(old=>Object.hasOwn(state.completed,old));
  const nextLesson=()=>{const selected=curriculum.filter(lesson=>lesson.term===term);return selected.find(lesson=>!done(lesson.id))||selected[0];};
  const totalDone=()=>curriculum.filter(lesson=>done(lesson.id)).length;
  const currentRoute=()=>Object.hasOwn(routeNames,location.hash.slice(2))?location.hash.slice(2):'home';
  const button=(label,action,style='g1-primary',extra='')=>'<button type="button" class="'+style+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
  const AU=window.G1_AUDIO||null,lang=C.id==='english'?undefined:'ar';
  const say=(text,opts)=>AU?AU.button(text,opts):'';
  const lessonButton=(lesson,index)=>'<button type="button" class="g1-lesson '+(done(lesson.id)?'g1-done':'')+'" data-lesson="'+esc(lesson.id)+'"><span class="g1-node">'+(done(lesson.id)?icon('check'):ar(index+1))+'</span><span><b>'+shown(lesson.title)+'</b><small class="g1-goal">'+shown(lesson.goal)+'</small></span><span aria-hidden="true">'+icon('arrow')+'</span>'+(done(lesson.id)?'<span class="g1-sr">أتممت هذا التدريب</span>':'')+'</button>';
  const cover='../../assets/early/'+C.id+'.webp';
  const unitScene=unit=>{const first=unit.lessons.find(lesson=>lesson.steps?.some(step=>step.scene)),picture=first?.steps.find(step=>step.scene)?.scene;if(!picture)return icon('book');if(C.id==='math'&&picture.type==='symbol'&&/[+−]/.test(picture.value))return icon(picture.value.includes('+')?'plus':'minus');if(picture.type==='place-value')return scene({type:'symbol',value:ar((picture.hundreds||0)*100+(picture.tens||0)*10+(picture.ones||0))});if(picture.type==='operation')return scene({type:'symbol',value:ar(picture.left)+' '+(picture.operator==='-'?'−':'+')+' '+ar(picture.right)});return scene(picture);};
  const termPicker=()=>'<div class="g1-tabs" role="group" aria-label="الفصل الدراسي">'+[1,2].map(value=>button('الفصل '+(value===1?'الأول':'الثاني'),'term','g1-secondary '+(value===term?'g1-selected':''),'data-term="'+value+'" aria-pressed="'+(value===term)+'"')).join('')+'</div>';
  const coverImage=(className,alt)=>'<img class="'+className+'" src="'+cover+'" width="520" height="520" alt="'+alt+'" decoding="async">';
  function reference(lesson) {
    const refs=Array.isArray(lesson.references)&&lesson.references.length?lesson.references:[{book:lesson.book,page:lesson.page}];
    const links=refs.map(ref=>{const book=C.books.find(item=>item.id===ref.book);if(!book)return '';const page=Number.isInteger(ref.page)&&ref.page>0?ref.page:null,pdfPage=Number.isInteger(ref.pdfPage)?ref.pdfPage:page&&Number.isInteger(book.pdfOffset)?page+book.pdfOffset:null;
      return '<a href="'+esc(book.url.split('#')[0]+(pdfPage?'#page='+pdfPage:''))+'" target="_blank" rel="noopener" data-book-link>'+shown(book.title)+(page?' · الصفحة المطبوعة '+ar(page):'')+'</a>';}).filter(Boolean);
    const practice=Array.isArray(lesson.guidedPractice)?lesson.guidedPractice.slice():[];
    if(lesson.homeActivity&&typeof lesson.homeActivity.text==='string')practice.push({title:lesson.homeActivity.title||'أجرّب مع الكبير',text:lesson.homeActivity.text,say:lesson.homeActivity.say});
    return (links.length?'<p class="g1-reference">'+shown(lesson.referenceLabel||'نشاط مساند؛ المرجع:')+' '+links.join(' · ')+' <span>يفتح المصدر مع الإنترنت.</span></p>':'')+(practice.length?'<details class="g1-card g1-guided-practice"><summary>مع الكبير: أقرأ وأحكي وأكتب</summary><p>أنشطة شفهية وورقية؛ لا يصححها الموقع ولا يسجّل إتقانها.</p><ol>'+practice.map(item=>'<li><b>'+shown(item.title)+'</b><div class="g1-say-row">'+(typeof say==='function'?say(item.text,{size:'lg',say:item.say}):'')+'<p>'+shown(item.text)+'</p></div></li>').join('')+'</ol></details>':'');
  }
  function home() {
    const next=nextLesson(),count=totalDone();
    const units=C.units.filter(unit=>unit.term===term);
    return '<section class="g1-hero j-hero"><div class="g1-hero-copy"><span class="g1-kicker">الصف الأول · '+shown(C.title)+'</span><h1>هَيّا يا '+shown(student.name)+'!</h1><p>خطوتنا التالية</p><h2 class="j-next-title">'+shown(next?.title||'نراجع ما تعلّمنا')+'</h2>'+(next?button((count?'نكمل رحلتنا':'نبدأ رحلتنا')+' '+icon('arrow'),'continue'):'')+'</div><div class="g1-hero-art">'+coverImage('j-hero-image','زيتون يستكشف '+shown(C.title))+'</div></section>'+
      '<section class="g1-summary" aria-label="تقدّمك"><span>'+icon('seed')+' أتممت '+ar(count)+' من '+ar(curriculum.length)+' تدريبًا</span><div class="g1-progress" role="progressbar" aria-label="تقدّم تدريبات المادة" aria-valuemin="0" aria-valuemax="'+curriculum.length+'" aria-valuenow="'+count+'"><span class="g1-progress-fill" style="width:'+(curriculum.length?Math.round(count/curriculum.length*100):0)+'%"></span></div></section>'+
      '<div class="g1-section-head"><div><span class="g1-kicker">خطوة بعد خطوة</span><h2>وحدات رحلتي</h2></div>'+termPicker()+'</div>'+
      '<div class="j-course-grid">'+units.map((unit,index)=>{const completed=unit.lessons.filter(l=>done(l.id)).length;return '<details class="g1-unit"><summary class="g1-unit-head"><span class="j-unit-number" aria-hidden="true">'+ar(index+1)+'</span><span class="j-unit-visual" aria-hidden="true">'+unitScene(unit)+'</span><span class="j-unit-title"><h2>'+shown(unit.title)+'</h2><small class="j-unit-progress">'+ar(completed)+' من '+ar(unit.lessons.length)+' مكتملة</small><span class="j-unit-meter" aria-hidden="true"><i style="width:'+Math.round(completed/unit.lessons.length*100)+'%"></i></span></span>'+icon('arrow')+'</summary><div class="g1-path">'+unit.lessons.map(lessonButton).join('')+'</div></details>';}).join('')+'</div>';
  }
  function basics() {
    return '<section class="j-basics-hero"><div class="g1-hero-copy"><span class="g1-kicker">على مهل</span><h1>نبني الأساس</h1><p>خطوات صغيرة نعود إليها متى احتجنا.</p></div>'+coverImage('j-hero-image','')+'</section><div class="g1-path">'+(foundations.length?foundations:curriculum.slice(0,3)).map(lessonButton).join('')+'</div>';
  }
  function play() {
    return '<section class="j-page-intro"><div><span class="g1-kicker">نلعب بالفكرة</span><h1>مغامراتي</h1><p>جولة قصيرة من الأسئلة. اختر مغامرتك.</p></div>'+coverImage('j-intro-image','')+'</section><div class="j-play-terms">'+termPicker()+'</div><div class="j-adventure-grid">'+C.units.filter(unit=>unit.term===term&&unit.lessons.some(l=>l.tasks.length)).map((unit,index)=>'<article class="g1-card j-adventure-card"><div class="j-adventure-image" aria-hidden="true">'+unitScene(unit)+'</div><span class="g1-kicker">مغامرة '+ar(index+1)+'</span><h2>'+shown(unit.title)+'</h2>'+button('ألعب الآن '+icon('arrow'),'adventure','g1-primary','data-unit="'+esc(unit.id)+'"')+'</article>').join('')+'</div>';
  }
  function mathLab() {
    return '<div class="j-lab-picker" role="group" aria-label="اختر التجربة">'+button(icon('apple')+' أعدّ التفاحات','lab-mode','g1-secondary '+(labMode==='count'?'g1-selected':''),'data-mode="count" aria-pressed="'+(labMode==='count')+'"')+button(scene({type:'shape',value:'triangle'})+' أتعرّف الأشكال','lab-mode','g1-secondary '+(labMode==='shapes'?'g1-selected':''),'data-mode="shapes" aria-pressed="'+(labMode==='shapes')+'"')+'</div><section class="g1-lab j-count-lab" '+(labMode==='count'?'':'hidden')+'><div class="j-lab-heading"><span class="g1-kicker">أضيف، أزيل، ثم أعدّ</span><h2>نضع ونعدّ</h2><div class="g1-say-row j-count-prompt">'+say((AU&&AU.ENGINE.labCount)||'كَوِّنْ مَجْمُوعَةً مِنَ التُّفَّاحَاتِ.',{size:'lg'})+'<p>كَوِّنْ مَجْمُوعَةً مِنْ <b>'+ar(labTarget)+'</b> تُفَّاحَاتٍ.</p></div></div><div data-counter-scene>'+scene({type:'count',icon:'apple',count:labCount})+'</div><div class="g1-lab-controls j-count-controls">'+button(icon('minus'),'subtract','g1-secondary','aria-label="أزل تفاحة" '+(labCount===0?'disabled':''))+'<output class="g1-counter" data-counter aria-live="polite" aria-label="عدد التفاحات">'+ar(labCount)+'</output>'+button(icon('plus'),'add','g1-secondary','aria-label="أضف تفاحة" '+(labCount===20?'disabled':''))+'</div><div class="j-count-actions">'+button('أتحقق '+icon('check'),'check-counter')+button('مجموعة جديدة','new-counter','g1-secondary')+'</div><p class="g1-feedback" data-lab-feedback role="status"></p></section><section class="g1-lab j-shape-lab" '+(labMode==='shapes'?'':'hidden')+'><div class="j-lab-heading"><span class="g1-kicker">ألمس الشكل وألاحظ</span><div class="g1-say-row">'+say((AU&&AU.ENGINE.labShapes)||'أَتَعَرَّفُ الْأَشْكَالَ.',{size:'lg'})+'<h2>أتعرّف الأشكال</h2></div></div><div class="g1-symbol-picker">'+[['circle','دائرة'],['square','مربّع'],['triangle','مثلّث'],['rectangle','مستطيل']].map(([shape,name])=>button(scene({type:'shape',value:shape})+'<span>'+name+'</span>','shape','g1-secondary','data-shape="'+shape+'" aria-pressed="false"')).join('')+'</div><p class="g1-feedback" data-shape-feedback role="status">اختر شكلًا لتتعرّف إليه.</p></section>';
  }
  function traceLab() {
    const letters=C.id==='english'?'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').flatMap(letter=>[letter.toLowerCase(),letter]):(C.traceGroups?.flatMap(group=>group.forms)||C.traceForms||['أ','إ','ء','ب','بـ','ـبـ','ـب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي']);
    if(!letters.includes(traceLetter))traceLetter=letters[0];
    const option=letter=>'<option '+(letter===traceLetter?'selected':'')+'>'+shown(letter)+'</option>';
    const options=C.id==='arabic'&&C.traceGroups?C.traceGroups.map(group=>'<optgroup label="'+esc(group.label)+'">'+group.forms.map(option).join('')+'</optgroup>').join(''):letters.map(option).join('');
    return '<section class="g1-lab"><div class="g1-say-row">'+say((AU&&AU.ENGINE.labTrace)||'أَرْسُمُ الْحَرْفَ بِإِصْبَعِي.',{size:'lg'})+'<h2>أرسم الحرف بإصبعي</h2></div><p>اختر حرفًا، ثم تدرّب على رسمه. هذا تدريب، ولا يُقيّم خطّك.</p><label class="g1-trace-label">الحرف <select data-trace-letter>'+options+'</select></label><div class="g1-trace-area"><span class="g1-trace-guide" aria-hidden="true" dir="'+(C.id==='english'?'ltr':'rtl')+'">'+shown(traceLetter)+'</span><canvas class="g1-canvas" aria-label="مساحة لتجربة رسم الحرف '+esc(traceLetter)+' بالإصبع أو القلم" role="img"></canvas></div>'+button('أمسح الرسم وأجرّب','clear-trace','g1-secondary')+'<p class="g1-caption">يمكنك أيضًا رسم الحرف على ورقة. لا يُحفظ الرسم.</p></section>';
  }
  const senses=[{icon:'eye',name:'العين',text:'أرى الأشياء بعيني.'},{icon:'ear',name:'الأذن',text:'أسمع الأصوات بأذني.'},{icon:'nose',name:'الأنف',text:'أشمّ الروائح بأنفي.'},{icon:'tongue',name:'اللسان',text:'أتذوّق الطعام بلساني. لا أتذوّق مادة مجهولة.'},{icon:'hand',name:'الجلد',text:'أحسّ بالملمس بجلدي، مثل جلد يدي. لا ألمس شيئًا ساخنًا أو مؤذيًا.'}];
  function lifeLab() {
    return '<section class="g1-lab"><div class="g1-say-row">'+say((AU&&AU.ENGINE.labSenses)||'أَكْتَشِفُ حَوَاسِّي.',{size:'lg'})+'<h2>أكتشف حواسّي</h2></div><p>اختر عضوًا لنتعرّف إلى حاسّته.</p><div class="g1-symbol-picker">'+senses.map((sense,index)=>button(scene({type:'items',icons:[sense.icon]})+'<span>'+sense.name+'</span>','sense','g1-secondary','data-sense="'+index+'" aria-pressed="false"')).join('')+'</div><div class="g1-feedback" data-sense-feedback role="status">نستخدم الحواسّ لنتعرّف إلى ما حولنا.</div></section>';
  }
  function lab(){return '<section class="j-page-intro"><div><span class="g1-kicker">أكتشف بيدي</span><h1>أجرّب وألاحظ</h1><p>ألعب وأتعلّم. لا درجات هنا.</p></div>'+coverImage('j-intro-image','')+'</section>'+(C.id==='math'?mathLab():C.id==='life'?lifeLab():traceLab());}
  function report() {
    return '<section class="g1-parent"><span class="g1-kicker">مرافقة الطفل</span><h1>خطوات '+shown(student.name)+'</h1><p>هذا التقرير يخصّ الطالب الحالي في '+shown(C.title)+' على هذا الجهاز.</p><div class="g1-grid"><article class="g1-card"><h2>'+ar(totalDone())+'</h2><p>من '+ar(curriculum.length)+' تدريبًا مكتملًا في رحلة الكتاب</p></article><article class="g1-card"><h2>'+ar(state.rounds)+'</h2><p>جولات مغامرة مكتملة</p></article></div><h2>كيف نساعد الطفل؟</h2><ul><li>اقرأ التعليمات معه، ودعه يختار بنفسه.</li><li>استخدم أشياء من البيت للعدّ والمطابقة.</li><li>توقّف عند التعب، وأعد الفكرة في وقت آخر.</li><li>اضغط زر السماعة ليسمع الطفل السؤال أو الكلمة. التسجيلات معدّة مسبقًا، ويمكن إيقاف الصوت التلقائي من أعلى النشاط.</li></ul><h2>الكتاب والأنشطة</h2><p>'+shown(C.sourceNote||'أنشطة تفاعلية تأسيسية داعمة لموضوعات الكتاب. لا تمثل نقلًا كاملًا لنصوصه وتمارينه.')+'</p>'+C.books.map(book=>'<p><a class="g1-book-link" href="'+esc(book.url)+'" target="_blank" rel="noopener">'+shown(book.title)+' — افتح المصدر مع الإنترنت</a></p>').join('')+'<div class="g1-table-wrap"><table class="g1-table"><caption>التدريبات المنجزة في هذه المادة</caption><thead><tr><th scope="col">التدريب</th><th scope="col">الحالة</th></tr></thead><tbody>'+lessons.filter(l=>done(l.id)).map(lesson=>'<tr><th scope="row">'+shown(lesson.title)+'</th><td>مكتمل</td></tr>').join('')+'</tbody></table></div>'+(!Object.keys(state.completed).length?'<p class="g1-empty">لم يُكمل الطفل تدريبًا بعد.</p>':'')+button('طباعة التقرير','print','g1-secondary')+'<p class="g1-caption">يُسجَّل الاكتمال بعد الإجابة عن مهام التدريب. التقرير لا يقيس القراءة أو الكتابة اليدوية تلقائيًا.</p></section>';
  }
  function render() {
    closeSession();const route=currentRoute();
    document.title=C.title+' — '+routeNames[route]+' — الصف الأول';
    app.innerHTML='<div class="j-shell"><aside class="j-sidebar"><a class="g1-brand" href="../../?change=1"><img src="../../assets/brand/logo-mascot-sm.webp" width="44" height="58" alt=""><span>بستان التعلّم<small>الصف الأول · '+shown(C.title)+'</small></span></a><nav class="g1-nav" aria-label="أقسام المادة">'+Object.entries(routeNames).map(([id,name])=>'<a href="#/'+id+'" '+(id===route?'aria-current="page"':'')+'>'+icon(routes[id])+'<span class="g1-nav-full">'+name+'</span><span class="g1-nav-short">'+shortNames[id]+'</span></a>').join('')+'</nav></aside><div class="j-workspace" data-route="'+route+'"><header class="g1-topbar"><div class="j-topbar-title">'+shown(routeNames[route])+' <small>في '+shown(C.title)+'</small></div><div class="g1-actions"><span class="g1-connection" role="status">'+(navigator.onLine?'جاهزون لنتعلّم':'نتعلّم دون إنترنت')+'</span><a class="g1-switch" href="../../login.html?switch=1">تبديل الطالب</a></div></header><main id="main" class="g1-wrap" tabindex="-1">'+({home,basics,play,lab,report})[route]()+'</main><footer class="g1-footer">كل محاولة تساعدنا على الفهم.</footer></div><dialog class="g1-modal" id="g1-lesson-dialog" aria-labelledby="g1-activity-title"></dialog></div>';
    if(route==='lab'&&(C.id==='arabic'||C.id==='english'))bindCanvas();
  }
  function closeSession(){if(AU)AU.stop();serial++;session=null;const dialog=query('#g1-lesson-dialog');if(dialog?.open)dialog.close();}
  function begin(lesson,adventure=false) {
    const trigger=document.activeElement;closeSession();session={trigger,token:serial,lesson,adventure,index:0,attempts:0,answered:false,busy:false};
    const dialog=query('#g1-lesson-dialog');dialog.showModal();dialog.addEventListener('cancel',()=>{serial++;session=null;},{once:true});drawStage();
  }
  const voiced=(text,tag,cls,sp)=>'<div class="g1-say-row">'+say(text,{size:'lg',say:sp})+'<'+tag+' class="'+cls+'">'+shown(text)+'</'+tag+'></div>';
  const numeral=v=>Number(String(v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim());
  /* مهام تفاعلية: «build» أسحب أو ألمس الأشياء إلى السلة، و«line» ألمس العدد على خط الأعداد. الإجابة تطابق تسمية أحد الاختيارات. */
  function interactive(task){
    if(task.kind==='line'){const min=task.min??0,max=task.max??10,ticks=[];for(let v=min;v<=max;v++)ticks.push(v);
      return '<div class="g1-line" dir="ltr" role="group" aria-label="خط الأعداد من '+ar(min)+' إلى '+ar(max)+'">'+ticks.map(v=>'<button type="button" class="g1-tick'+(v===task.start?' g1-tick-start':'')+'" data-action="tick" data-value="'+v+'" aria-label="'+ar(v)+'"><i aria-hidden="true"></i><b>'+ar(v)+'</b></button>').join('')+'</div>';}
    if(task.kind==='build'){const total=task.pool||10,item=icon(task.icon||'apple');
      return '<div class="g1-build"><div class="g1-build-source" data-source aria-label="الأشياء">'+Array.from({length:total},(_,i)=>'<button type="button" class="g1-build-item" data-action="build-item" data-item="'+i+'" aria-label="ضع واحدة في السلة">'+item+'</button>').join('')+'</div><div class="g1-build-basket" data-basket aria-label="السلة">'+icon('basket')+'<div class="g1-build-in" data-in></div></div><div class="g1-build-bar"><output class="g1-counter" data-build-count aria-live="polite">'+ar(0)+'</output>'+button('أتحقق '+icon('check'),'build-check')+button(icon('back'),'build-reset','g1-secondary','aria-label="أبدأ من جديد"')+'</div></div>';}
    return '';}
  function drawStage() {
    if(!session)return;const {lesson,adventure,index}=session,steps=adventure?[]:lesson.steps,taskIndex=index-steps.length,task=lesson.tasks[taskIndex],step=steps[index],total=steps.length+lesson.tasks.length;
    const choiceOrder=task&&!task.kind?order(task,session):[];
    query('#g1-lesson-dialog').innerHTML='<header class="g1-modal-head"><div><span class="g1-kicker">'+(adventure?'مغامرة صغيرة':'نفهم ثم نجرّب')+'</span><h2 id="g1-activity-title">'+shown(lesson.title)+'</h2></div>'+'<div class="g1-head-tools">'+(AU?AU.autoToggle():'')+button(icon('close'),'close','g1-close','aria-label="إغلاق التدريب"')+'</div></header><div class="g1-progress" role="progressbar" aria-label="خطوات النشاط" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+index+'"><span class="g1-progress-fill" style="width:'+Math.round(index/total*100)+'%"></span></div><div class="g1-modal-body"><p class="g1-caption">الخطوة '+ar(index+1)+' من '+ar(total)+'</p><section class="g1-stage">'+(task?voiced(task.prompt,'h3','g1-step-text',task.say)+scene(task.scene)+(task.kind?interactive(task):'<div class="g1-choices'+(task.choices.length===3?' g1-choices-3':'')+'">'+choiceOrder.map(({choice,i})=>'<div class="g1-choice-wrap">'+button((choice.scene?scene(choice.scene):'')+'<bdi dir="'+direction(choice.label)+'">'+shown(choice.label)+'</bdi>'+(choice.caption?'<small class="g1-choice-caption">'+shown(choice.caption)+'</small>':''),'answer','g1-choice'+(choice.big?' g1-choice-big':''),'data-answer="'+i+'" aria-label="'+esc(choice.aria||choice.label)+'"')+(task.listen?'':say(choice.label,{className:'g1-say-choice',say:choice.say}))+'</div>').join('')+'</div>')+'<p class="g1-feedback" role="status" data-activity-feedback></p>'+button('نكمل '+icon('arrow'),'next','g1-primary','hidden'):voiced(step.text,'p','g1-step-text',step.say)+scene(step.scene)+button('هَيّا نجرّب '+icon('arrow'),'next'))+'</section>'+(!adventure?reference(lesson):'')+'</div>';
    if(AU)AU.autoplay([task?{text:task.prompt,say:task.say}:{text:step.text,say:step.say}],lang);const heading=query('.g1-step-text');heading.tabIndex=-1;heading.focus({preventScroll:true});query('#g1-lesson-dialog').scrollTop=0;
  }
  async function finish() {
    const current=session;if(!current||current.busy)return;current.busy=true;
    const next=normalize(state,ids);
    if(current.adventure)next.rounds=Math.min(100000,next.rounds+1);
    else {next.last=current.lesson.id;if(!Object.hasOwn(next.completed,current.lesson.id))next.completed[current.lesson.id]={at:new Date().toISOString(),attempts:Math.min(10000,Math.max(1,current.attempts))};}
    const ok=await save(JSON.stringify(next));if(session!==current||serial!==current.token)return;
    if(!ok){current.busy=false;query('.g1-modal-body').innerHTML='<p class="g1-notice" role="alert">تعذّر حفظ الخطوة. تأكّد من ملف الطالب والمساحة المتاحة، ثم أعد المحاولة.</p>'+button('أحاول حفظ الخطوة','retry-save');return;}
    state=next;if(AU)AU.autoplay(AU.ENGINE.done,'ar');query('#g1-lesson-dialog').innerHTML='<div class="g1-finish"><img src="../../assets/img/av-celebrate.webp" width="170" height="170" alt="زيتون يحتفل بخطوتك"><h2 id="g1-activity-title">أحسنت، أتممت الخطوة!</h2><p>فهمنا الفكرة وجرّبناها معًا.</p>'+button('العودة إلى رحلتي '+icon('arrow'),'finish')+'</div>';query('[data-action="finish"]').focus();
  }
  function nextStage(){if(!session||session.busy)return;const steps=session.adventure?[]:session.lesson.steps;if(session.index>=steps.length&&!session.answered)return;session.index++;session.answered=false;if(session.index>=steps.length+session.lesson.tasks.length)finish();else drawStage();}
  function answer(index){if(!session||session.answered||session.busy)return;const offset=session.adventure?0:session.lesson.steps.length,task=session.lesson.tasks[session.index-offset];if(!task||!Number.isInteger(index)||index<-1||index>=task.choices.length)return;session.attempts++;const feedback=query('[data-activity-feedback]');
    if(index!==task.answer){feedback.className='g1-feedback g1-retry';feedback.textContent='لِننظر مرة أخرى. جرّب اختيارًا آخر.';if(AU)AU.play(AU.ENGINE.retry,'ar');const picked=query('[data-answer="'+index+'"]');if(picked)picked.setAttribute('aria-pressed','false');return;}
    session.answered=true;feedback.className='g1-feedback g1-success';feedback.textContent='أحسنت! '+ar(task.explain);if(AU){AU.play([{text:AU.ENGINE.good,lang:'ar'},{text:task.explain,lang:'ar',say:task.sayExplain}]);feedback.insertAdjacentHTML('afterbegin',say(task.explain,{say:task.sayExplain}));}app.querySelectorAll('[data-answer],[data-action="tick"],[data-action^="build"]').forEach(choice=>{choice.disabled=true;if(choice.dataset.answer!==undefined)choice.classList.toggle('g1-selected',Number(choice.dataset.answer)===index);});query('[data-action="next"]').hidden=false;query('[data-action="next"]').focus({preventScroll:true});
  }
  function currentTask(){if(!session)return null;const offset=session.adventure?0:session.lesson.steps.length;return session.lesson.tasks[session.index-offset]||null;}
  function buildCount(){const out=query('[data-build-count]');if(out)out.textContent=ar(query('[data-in]').children.length);}
  function moveItem(item){const basket=query('[data-in]'),source=query('[data-source]');if(!basket||!source)return;(item.parentNode===basket?source:basket).appendChild(item);buildCount();}
  /* سحب بالإصبع: نسحب الشيء ونفلته فوق السلة؛ اللمس وحده يضعه أيضًا. */
  let drag=null;
  app.addEventListener('pointerdown',event=>{const item=event.target.closest('.g1-build-item');if(!item||item.disabled)return;drag={item,x:event.clientX,y:event.clientY,moved:false};});
  app.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<8)return;drag.moved=true;drag.item.classList.add('g1-dragging');drag.item.style.transform='translate('+dx+'px,'+dy+'px)';event.preventDefault();});
  const endDrag=event=>{if(!drag)return;const {item,moved}=drag;drag=null;item.classList.remove('g1-dragging');item.style.transform='';if(!moved)return;item.dataset.dragged='1';const basket=query('[data-basket]');if(!basket)return;const r=basket.getBoundingClientRect(),inside=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;if(inside!==(item.parentNode===query('[data-in]')))moveItem(item);};
  app.addEventListener('pointerup',endDrag);app.addEventListener('pointercancel',endDrag);
  app.addEventListener('click',event=>{const item=event.target.closest('.g1-build-item');if(item&&item.dataset.dragged){delete item.dataset.dragged;event.stopImmediatePropagation();event.preventDefault();}},true);
  function counter(){query('[data-counter-scene]').innerHTML=scene({type:'count',icon:'apple',count:labCount});query('[data-counter]').textContent=ar(labCount);query('[data-action="subtract"]').disabled=labCount===0;query('[data-action="add"]').disabled=labCount===20;query('[data-lab-feedback]').textContent='';}
  function bindCanvas(){const canvas=query('.g1-canvas');if(!canvas)return;const ratio=Math.min(2,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(ratio,ratio);ctx.strokeStyle='#526d37';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';let drawing=false;
    const point=event=>{const bounds=canvas.getBoundingClientRect();return [event.clientX-bounds.left,event.clientY-bounds.top];};
    canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;drawing=true;canvas.setPointerCapture(event.pointerId);ctx.beginPath();const [x,y]=point(event);ctx.moveTo(x,y);ctx.lineTo(x+.1,y+.1);ctx.stroke();});
    canvas.addEventListener('pointermove',event=>{if(!drawing)return;ctx.lineTo(...point(event));ctx.stroke();});
    ['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,()=>{drawing=false;}));
  }
  app.addEventListener('change',event=>{if(event.target.matches('[data-trace-letter]')){traceLetter=event.target.value;render();query('[data-trace-letter]').focus({preventScroll:true});}});
  app.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target||target.disabled)return;
    if(target.dataset.lesson){const lesson=lessons.find(l=>l.id===target.dataset.lesson);if(lesson)begin(lesson);return;}
    const action=target.dataset.action;
    if(action==='continue'){const lesson=nextLesson();if(lesson)begin(lesson);}
    else if(action==='term'){term=Number(target.dataset.term);render();}
    else if(action==='close'){const trigger=session?.trigger;closeSession();if(trigger?.isConnected)trigger.focus({preventScroll:true});}
    else if(action==='finish'){if(currentRoute()!=='home')location.hash='/home';else{render();query('#main').focus();}}
    else if(action==='next')nextStage();
    else if(action==='retry-save')finish();
    else if(action==='answer')answer(Number(target.dataset.answer));
    else if(action==='tick'||action==='build-check'){const task=currentTask();if(!task)return;const value=action==='tick'?Number(target.dataset.value):query('[data-in]').children.length;if(action==='tick'){app.querySelectorAll('.g1-tick').forEach(t=>t.classList.toggle('g1-selected',t===target));}answer(task.choices.findIndex(c=>numeral(c.label)===value));}
    else if(action==='build-item'){moveItem(target);}
    else if(action==='build-reset'){app.querySelectorAll('[data-in] .g1-build-item').forEach(item=>query('[data-source]').appendChild(item));buildCount();}
    else if(action==='adventure'){const unit=C.units.find(u=>u.id===target.dataset.unit);if(!unit)return;const pool=unit.lessons.flatMap(l=>l.tasks);const shuffled=pool.map(task=>({task,key:Math.random()})).sort((a,b)=>a.key-b.key).slice(0,3).map(row=>row.task);if(shuffled.length)begin({title:unit.title,tasks:shuffled,steps:[]},true);}
    else if(action==='lab-mode'){labMode=target.dataset.mode;query('.j-count-lab').hidden=labMode!=='count';query('.j-shape-lab').hidden=labMode!=='shapes';app.querySelectorAll('[data-action="lab-mode"]').forEach(item=>{const selected=item.dataset.mode===labMode;item.setAttribute('aria-pressed',String(selected));item.classList.toggle('g1-selected',selected);});const shown=query(labMode==='count'?'.j-count-lab':'.j-shape-lab');if(shown){shown.classList.remove('g1-flash');void shown.offsetWidth;shown.classList.add('g1-flash');shown.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});}}
    else if(action==='add'||action==='subtract'){labCount=Math.max(0,Math.min(20,labCount+(action==='add'?1:-1)));counter();}
    else if(action==='new-counter'){labTarget=1+Math.floor(Math.random()*10);labCount=0;query('.j-count-prompt b').textContent=ar(labTarget);counter();}
    else if(action==='check-counter'){const ok=labCount===labTarget,feedback=query('[data-lab-feedback]');feedback.className='g1-feedback '+(ok?'g1-success':'g1-retry');feedback.textContent=ok?'أحسنت، هذه هي المجموعة المطلوبة.':'عُدّ التفاحات، ثم أضف أو أزل حتى تصبح '+ar(labTarget)+'.';}
    else if(action==='shape'){const texts={circle:'هذه دائرة. حدّها منحنٍ، وليس لها أضلاع مستقيمة.',square:'هذا مربّع. له أربعة أضلاع متساوية.',triangle:'هذا مثلّث. له ثلاثة أضلاع.',rectangle:'هذا مستطيل. له أربعة أضلاع، وكل ضلعين متقابلين متساويان.'};query('[data-shape-feedback]').textContent=texts[target.dataset.shape];app.querySelectorAll('[data-shape]').forEach(item=>item.setAttribute('aria-pressed',String(item===target)));}
    else if(action==='sense'){query('[data-sense-feedback]').textContent=senses[Number(target.dataset.sense)].text;app.querySelectorAll('[data-sense]').forEach(item=>{item.setAttribute('aria-pressed',String(item===target));item.classList.toggle('g1-selected',item===target);});const fb=query('[data-sense-feedback]');fb.classList.remove('g1-flash');void fb.offsetWidth;fb.classList.add('g1-flash');}
    else if(action==='clear-trace'){const canvas=query('.g1-canvas'),ctx=canvas.getContext('2d');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.restore();}
    else if(action==='print')window.print();
  });
  window.addEventListener('hashchange',()=>{render();query('#main').focus();});
  window.addEventListener('storage',event=>{if(['bustan_owner','bustan_session'].includes(event.key))closeSession();});
  for(const event of ['online','offline'])window.addEventListener(event,()=>{const target=query('.g1-connection');if(target)target.textContent=navigator.onLine?'جاهزون لنتعلّم':'نتعلّم دون إنترنت';});
  P.ready.then(ok=>{if(!ok){app.innerHTML='<p class="g1-notice" role="alert">'+esc(P.error()||'تعذّر قراءة ملفك. أعد فتحه من صفحة الدخول.')+'</p>';return;}if(!P.PER.includes(C.key)){app.innerHTML='<p class="g1-notice" role="alert">أعد فتح الموقع متصلًا بالإنترنت لاستكمال تجهيز الصف الأول.</p>';return;}student=P.current();if(!student){location.replace('../../login.html?next='+encodeURIComponent('g1/'+C.id+'/'));return;}save=P.writer(C.key);state=normalize(P.readProgress(C.key),ids);render();P.writer('bustan_last')(JSON.stringify({grade:1,subject:C.id,path:'g1/'+C.id+'/',t:Date.now()}));
    if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{const target=query('.g1-connection');if(target)target.textContent='تعذّر تجهيز الأنشطة دون إنترنت. أبقِ الصفحة مفتوحة.';});
  }).catch(()=>{app.innerHTML='<p class="g1-notice" role="alert">تعذّر فتح ملف الطالب. عُد إلى صفحة الدخول.</p>';});
})();

/* إطلاق: روابط الكتاب الرسمية خارجية؛ دون اتصال نعرض ملاحظة بدل صفحة معطلة. */
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-book-link]');if(!a||navigator.onLine!==false)return;e.preventDefault();var n=a.parentNode.querySelector('.g1-offline-book');if(!n){n=document.createElement('span');n.className='g1-offline-book';n.setAttribute('role','status');a.insertAdjacentElement('afterend',n);}n.textContent='كتاب الوزارة يحتاج إلى اتصال بالإنترنت. يمكنك متابعة التدريب الآن، وفتح الكتاب حين يعود الاتصال.';},true);
