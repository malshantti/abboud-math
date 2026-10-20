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
  window.G1_PROGRESS=Object.freeze({normalize});
  if(typeof document==='undefined')return;
  const C=window.G1_COURSE,P=window.PROFILES,A=window.G1_ART,app=document.getElementById('app');
  if(!C||!P||!A){app.innerHTML='<p class="g1-notice" role="alert">تعذّر تحميل النشاط. أعد فتح الصفحة.</p>';return;}
  const curriculum=C.units.flatMap(unit=>unit.lessons.map(lesson=>({...lesson,unit:unit.title,term:unit.term})));
  const foundations=(C.foundations||[]).map(lesson=>({...lesson,unit:'أساسياتي'}));
  const lessons=[...curriculum,...foundations],ids=lessons.map(lesson=>lesson.id);
  const routeNames={home:'رحلتي',basics:'أساسياتي',play:'مغامراتي',lab:'أجرّب',report:'لوليّ الأمر'};
  const shortNames={home:'رحلتي',basics:'الأساس',play:'ألعب',lab:'أجرّب',report:'للأهل'};
  const routes={home:'home',basics:'seed',play:'map',lab:'lab',report:'report'};
  const icon=name=>A.icon(name),scene=value=>value?A.scene(value):'';
  const query=selector=>app.querySelector(selector);
  let state,save,student,term=1,session=null,serial=0,labCount=0,labTarget=3,traceLetter=null;
  const done=id=>Object.hasOwn(state.completed,id);
  const totalDone=()=>curriculum.filter(lesson=>done(lesson.id)).length;
  const currentRoute=()=>Object.hasOwn(routeNames,location.hash.slice(2))?location.hash.slice(2):'home';
  const button=(label,action,style='g1-primary',extra='')=>'<button type="button" class="'+style+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
  const lessonButton=(lesson,index)=>'<button type="button" class="g1-lesson '+(done(lesson.id)?'g1-done':'')+'" data-lesson="'+esc(lesson.id)+'"><span class="g1-node">'+(done(lesson.id)?icon('check'):ar(index+1))+'</span><span><b>'+shown(lesson.title)+'</b><small class="g1-goal">'+shown(lesson.goal)+'</small></span><span aria-hidden="true">'+icon('arrow')+'</span>'+(done(lesson.id)?'<span class="g1-sr">أتممت هذا التدريب</span>':'')+'</button>';
  function reference(lesson) {
    const refs=Array.isArray(lesson.references)&&lesson.references.length?lesson.references:[{book:lesson.book,page:lesson.page}];
    const links=refs.map(ref=>{const book=C.books.find(item=>item.id===ref.book);if(!book)return '';const page=Number.isInteger(ref.page)&&ref.page>0?ref.page:null,pdfPage=Number.isInteger(ref.pdfPage)?ref.pdfPage:page&&Number.isInteger(book.pdfOffset)?page+book.pdfOffset:null;
      return '<a href="'+esc(book.url.split('#')[0]+(pdfPage?'#page='+pdfPage:''))+'" target="_blank" rel="noopener">'+shown(book.title)+(page?' · الصفحة المطبوعة '+ar(page):'')+'</a>';}).filter(Boolean);
    const practice=Array.isArray(lesson.guidedPractice)?lesson.guidedPractice.slice():[];
    if(lesson.homeActivity&&typeof lesson.homeActivity.text==='string')practice.push({title:lesson.homeActivity.title||'أجرّب مع الكبير',text:lesson.homeActivity.text});
    return (links.length?'<p class="g1-reference">'+shown(lesson.referenceLabel||'نشاط مساند؛ المرجع:')+' '+links.join(' · ')+' <span>يفتح المصدر مع الإنترنت.</span></p>':'')+(practice.length?'<details class="g1-card g1-guided-practice"><summary>مع الكبير: أقرأ وأحكي وأكتب</summary><p>أنشطة شفهية وورقية؛ لا يصححها الموقع ولا يسجّل إتقانها.</p><ol>'+practice.map(item=>'<li><b>'+shown(item.title)+'</b><p>'+shown(item.text)+'</p></li>').join('')+'</ol></details>':'');
  }
  function home() {
    const next=curriculum.find(lesson=>!done(lesson.id))||curriculum[0],count=totalDone();
    return '<section class="g1-hero"><div class="g1-hero-copy"><span class="g1-kicker">الصف الأول · '+shown(C.title)+'</span><h1>هَيّا يا '+shown(student.name)+'!</h1><p>نفهم الفكرة، ثم نجرّب معًا.</p>'+(next?button('نبدأ خطوة صغيرة '+icon('arrow'),'continue'):'')+'</div><div class="g1-hero-art"><img src="../../assets/img/av-read.webp" width="180" height="180" alt="زيتون يقرأ معك"></div></section><section class="g1-summary" aria-label="تقدّمك"><span>'+icon('seed')+' أتممت '+ar(count)+' من '+ar(curriculum.length)+' تدريبًا</span><div class="g1-progress" role="progressbar" aria-label="تقدم تدريبات المادة" aria-valuemin="0" aria-valuemax="'+curriculum.length+'" aria-valuenow="'+count+'"><span class="g1-progress-fill" style="width:'+(curriculum.length?Math.round(count/curriculum.length*100):0)+'%"></span></div></section><div class="g1-section-head"><h2>خطوات رحلتي</h2><div class="g1-tabs" role="group" aria-label="الفصل الدراسي">'+[1,2].map(value=>button('الفصل '+(value===1?'الأول':'الثاني'),'term','g1-secondary '+(value===term?'g1-selected':''),'data-term="'+value+'" aria-pressed="'+(value===term)+'"')).join('')+'</div></div>'+C.units.filter(unit=>unit.term===term).map((unit,index)=>'<details class="g1-unit" '+(!index?'open':'')+'><summary class="g1-unit-head"><span class="g1-node">'+ar(index+1)+'</span><span><h2>'+shown(unit.title)+'</h2><small>'+ar(unit.lessons.filter(l=>done(l.id)).length)+' من '+ar(unit.lessons.length)+' تدريبات</small></span>'+icon('arrow')+'</summary><div class="g1-path">'+unit.lessons.map(lessonButton).join('')+'</div></details>').join('');
  }
  function basics() {
    return '<div class="g1-section-head"><div><span class="g1-kicker">على مهل</span><h1>نبني الأساس</h1><p>خطوات صغيرة نعود إليها متى احتجنا.</p></div><img src="../../assets/img/av-encourage.webp" width="110" height="110" alt=""></div><div class="g1-path">'+(foundations.length?foundations:curriculum.slice(0,3)).map(lessonButton).join('')+'</div>';
  }
  function play() {
    return '<section class="g1-hero"><div class="g1-hero-copy"><span class="g1-kicker">نلعب بالفكرة</span><h1>مغامرة بخطوات صغيرة</h1><p>اختر جولتك. يمكنك المحاولة من جديد.</p></div><div class="g1-hero-art">'+scene({type:'items',icons:C.id==='math'?['apple','ball','flower']:C.id==='life'?['eye','tree','water']:['book','pen','bag']})+'</div></section><div class="g1-grid">'+C.units.filter(unit=>unit.lessons.some(l=>l.tasks.length)).map((unit,index)=>'<article class="g1-card"><span class="g1-node">'+ar(index+1)+'</span><h2>'+shown(unit.title)+'</h2><p>نلعب ونتعلّم، بلا استعجال.</p>'+button('ابدأ المغامرة '+icon('map'),'adventure','g1-primary','data-unit="'+esc(unit.id)+'"')+'</article>').join('')+'</div>';
  }
  function mathLab() {
    return '<section class="g1-lab"><h2>نضع ونعدّ</h2><p>كوّن مجموعة من <b>'+ar(labTarget)+'</b> تفاحات.</p><div data-counter-scene>'+scene({type:'count',icon:'apple',count:labCount})+'</div><div class="g1-lab-controls">'+button(icon('minus')+' أقلّ','subtract','g1-secondary','aria-label="أزل تفاحة"')+'<output class="g1-counter" data-counter aria-live="polite">'+ar(labCount)+'</output>'+button(icon('plus')+' أكثر','add','g1-secondary','aria-label="أضف تفاحة"')+'</div>'+button('هل مجموعتي صحيحة؟','check-counter')+'<p class="g1-feedback" data-lab-feedback role="status"></p>'+button('مجموعة جديدة','new-counter','g1-secondary')+'</section><section class="g1-lab"><h2>أتعرّف الأشكال</h2><div class="g1-symbol-picker">'+[['circle','دائرة'],['square','مربّع'],['triangle','مثلّث'],['rectangle','مستطيل']].map(([shape,name])=>button(scene({type:'shape',value:shape})+'<span>'+name+'</span>','shape','g1-secondary','data-shape="'+shape+'"')).join('')+'</div><p class="g1-feedback" data-shape-feedback role="status">اختر شكلًا لتتعرّف إليه.</p></section>';
  }
  function traceLab() {
    const letters=C.id==='english'?'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').flatMap(letter=>[letter.toLowerCase(),letter]):(C.traceGroups?.flatMap(group=>group.forms)||C.traceForms||['أ','إ','ء','ب','بـ','ـبـ','ـب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي']);
    if(!letters.includes(traceLetter))traceLetter=letters[0];
    const option=letter=>'<option '+(letter===traceLetter?'selected':'')+'>'+shown(letter)+'</option>';
    const options=C.id==='arabic'&&C.traceGroups?C.traceGroups.map(group=>'<optgroup label="'+esc(group.label)+'">'+group.forms.map(option).join('')+'</optgroup>').join(''):letters.map(option).join('');
    return '<section class="g1-lab"><h2>أرسم الحرف بإصبعي</h2><p>اختر حرفًا، ثم تدرّب على رسمه. هذا تدريب، ولا يُقيّم خطّك.</p><label class="g1-trace-label">الحرف <select data-trace-letter>'+options+'</select></label><div class="g1-trace-area"><span class="g1-trace-guide" aria-hidden="true" dir="'+(C.id==='english'?'ltr':'rtl')+'">'+shown(traceLetter)+'</span><canvas class="g1-canvas" aria-label="مساحة لتجربة رسم الحرف '+esc(traceLetter)+' بالإصبع أو القلم" role="img"></canvas></div>'+button('أمسح الرسم وأجرّب','clear-trace','g1-secondary')+'<p class="g1-caption">يمكنك أيضًا رسم الحرف على ورقة. لا يُحفظ الرسم.</p></section>';
  }
  const senses=[{icon:'eye',name:'العين',text:'أرى الأشياء بعيني.'},{icon:'ear',name:'الأذن',text:'أسمع الأصوات بأذني.'},{icon:'nose',name:'الأنف',text:'أشمّ الروائح بأنفي.'},{icon:'tongue',name:'اللسان',text:'أتذوّق الطعام بلساني. لا أتذوّق مادة مجهولة.'},{icon:'hand',name:'الجلد',text:'أحسّ بالملمس بجلدي، مثل جلد يدي. لا ألمس شيئًا ساخنًا أو مؤذيًا.'}];
  function lifeLab() {
    return '<section class="g1-lab"><h2>أكتشف حواسّي</h2><p>اختر عضوًا لنتعرّف إلى حاسّته.</p><div class="g1-symbol-picker">'+senses.map((sense,index)=>button(scene({type:'items',icons:[sense.icon]})+'<span>'+sense.name+'</span>','sense','g1-secondary','data-sense="'+index+'"')).join('')+'</div><div class="g1-feedback" data-sense-feedback role="status">نستخدم الحواسّ لنتعرّف إلى ما حولنا.</div></section>';
  }
  function lab() {return '<div class="g1-section-head"><div><span class="g1-kicker">أكتشف بيدي</span><h1>أجرّب وألاحظ</h1><p>هذه مساحة للّعب والتجربة. لا درجات هنا.</p></div>'+icon('lab')+'</div>'+(C.id==='math'?mathLab():C.id==='life'?lifeLab():traceLab());}
  function report() {
    return '<section class="g1-parent"><span class="g1-kicker">مرافقة الطفل</span><h1>خطوات '+shown(student.name)+'</h1><p>هذا التقرير يخصّ الطالب الحالي في '+shown(C.title)+' على هذا الجهاز.</p><div class="g1-grid"><article class="g1-card"><h2>'+ar(totalDone())+'</h2><p>من '+ar(curriculum.length)+' تدريبًا مكتملًا في رحلة الكتاب</p></article><article class="g1-card"><h2>'+ar(state.rounds)+'</h2><p>جولات مغامرة مكتملة</p></article></div><h2>كيف نساعد الطفل؟</h2><ul><li>اقرأ التعليمات معه، ودعه يختار بنفسه.</li><li>استخدم أشياء من البيت للعدّ والمطابقة.</li><li>توقّف عند التعب، وأعد الفكرة في وقت آخر.</li><li>أصوات الدروس غير مضافة في هذه الدفعة؛ لا يعتمد النشاط على قراءة آلية.</li></ul><h2>الكتاب والأنشطة</h2><p>'+shown(C.sourceNote||'أنشطة تفاعلية تأسيسية داعمة لموضوعات الكتاب. لا تمثل نقلًا كاملًا لنصوصه وتمارينه.')+'</p>'+C.books.map(book=>'<p><a class="g1-book-link" href="'+esc(book.url)+'" target="_blank" rel="noopener">'+shown(book.title)+' — افتح المصدر مع الإنترنت</a></p>').join('')+'<div class="g1-table-wrap"><table class="g1-table"><caption>التدريبات المنجزة في هذه المادة</caption><thead><tr><th scope="col">التدريب</th><th scope="col">الحالة</th></tr></thead><tbody>'+lessons.filter(l=>done(l.id)).map(lesson=>'<tr><th scope="row">'+shown(lesson.title)+'</th><td>مكتمل</td></tr>').join('')+'</tbody></table></div>'+(!Object.keys(state.completed).length?'<p class="g1-empty">لم يُكمل الطفل تدريبًا بعد.</p>':'')+button('طباعة التقرير','print','g1-secondary')+'<p class="g1-caption">يُسجَّل الاكتمال بعد الإجابة عن مهام التدريب. التقرير لا يقيس القراءة أو الكتابة اليدوية تلقائيًا.</p></section>';
  }
  function render() {
    closeSession();const route=currentRoute();
    document.title=C.title+' — '+routeNames[route]+' — الصف الأول';
    app.innerHTML='<header class="g1-topbar"><a class="g1-brand" href="../../?change=1"><img src="../../assets/brand/favicon.svg" width="38" height="38" alt=""><span>بستان التعلّم<small>الصف الأول · '+shown(C.title)+'</small></span></a><div class="g1-actions"><span class="g1-connection" role="status">'+(navigator.onLine?'جاهزون لنتعلّم':'نتعلّم دون إنترنت')+'</span><a class="g1-switch" href="../../login.html?switch=1">تبديل الطالب</a></div></header><main id="main" class="g1-wrap" tabindex="-1">'+({home,basics,play,lab,report})[route]()+'</main><nav class="g1-nav" aria-label="أقسام المادة">'+Object.entries(routeNames).map(([id,name])=>'<a href="#/'+id+'" '+(id===route?'aria-current="page"':'')+'>'+icon(routes[id])+'<span class="g1-nav-full">'+name+'</span><span class="g1-nav-short">'+shortNames[id]+'</span></a>').join('')+'</nav><footer class="g1-footer">كل محاولة تساعدنا على الفهم.</footer><dialog class="g1-modal" id="g1-lesson-dialog" aria-labelledby="g1-activity-title"></dialog>';
    if(route==='lab'&&(C.id==='arabic'||C.id==='english'))bindCanvas();
  }
  function closeSession(){serial++;session=null;const dialog=query('#g1-lesson-dialog');if(dialog?.open)dialog.close();}
  function begin(lesson,adventure=false) {
    closeSession();session={token:serial,lesson,adventure,index:0,attempts:0,answered:false,busy:false};
    const dialog=query('#g1-lesson-dialog');dialog.showModal();dialog.addEventListener('cancel',()=>{serial++;session=null;},{once:true});drawStage();
  }
  function drawStage() {
    if(!session)return;const {lesson,adventure,index}=session,steps=adventure?[]:lesson.steps,taskIndex=index-steps.length,task=lesson.tasks[taskIndex],step=steps[index],total=steps.length+lesson.tasks.length;
    const choiceOrder=task?task.choices.map((choice,i)=>({choice,i,sort:Math.random()})).sort((a,b)=>a.sort-b.sort):[];
    query('#g1-lesson-dialog').innerHTML='<header class="g1-modal-head"><div><span class="g1-kicker">'+(adventure?'مغامرة صغيرة':'نفهم ثم نجرّب')+'</span><h2 id="g1-activity-title">'+shown(lesson.title)+'</h2></div>'+button(icon('close'),'close','g1-close','aria-label="إغلاق التدريب"')+'</header><div class="g1-progress" role="progressbar" aria-label="خطوات النشاط" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+index+'"><span class="g1-progress-fill" style="width:'+Math.round(index/total*100)+'%"></span></div><div class="g1-modal-body"><p class="g1-caption">الخطوة '+ar(index+1)+' من '+ar(total)+'</p><section class="g1-stage">'+(task?'<h3 class="g1-step-text">'+shown(task.prompt)+'</h3>'+scene(task.scene)+'<div class="g1-choices">'+choiceOrder.map(({choice,i})=>button((choice.scene?scene(choice.scene):'')+'<bdi dir="'+direction(choice.label)+'">'+shown(choice.label)+'</bdi>','answer','g1-choice','data-answer="'+i+'"')).join('')+'</div><p class="g1-feedback" role="status" data-activity-feedback></p>'+button('نكمل '+icon('arrow'),'next','g1-primary','hidden'):'<p class="g1-step-text">'+shown(step.text)+'</p>'+scene(step.scene)+button('هَيّا نجرّب '+icon('arrow'),'next'))+'</section>'+(!adventure?reference(lesson):'')+'</div>';
    query('.g1-close').focus({preventScroll:true});
  }
  async function finish() {
    const current=session;if(!current||current.busy)return;current.busy=true;
    const next=normalize(state,ids);
    if(current.adventure)next.rounds=Math.min(100000,next.rounds+1);
    else {next.last=current.lesson.id;if(!Object.hasOwn(next.completed,current.lesson.id))next.completed[current.lesson.id]={at:new Date().toISOString(),attempts:Math.min(10000,Math.max(1,current.attempts))};}
    const ok=await save(JSON.stringify(next));if(session!==current||serial!==current.token)return;
    if(!ok){current.busy=false;query('.g1-modal-body').innerHTML='<p class="g1-notice" role="alert">تعذّر حفظ الخطوة. تأكّد من ملف الطالب والمساحة المتاحة، ثم أعد المحاولة.</p>'+button('أحاول حفظ الخطوة','retry-save');return;}
    state=next;query('#g1-lesson-dialog').innerHTML='<div class="g1-finish"><img src="../../assets/img/av-celebrate.webp" width="170" height="170" alt="زيتون يحتفل بخطوتك"><h2 id="g1-activity-title">أحسنت، أتممت الخطوة!</h2><p>فهمنا الفكرة وجرّبناها معًا.</p>'+button('العودة إلى رحلتي '+icon('arrow'),'finish')+'</div>';query('[data-action="finish"]').focus();
  }
  function nextStage(){if(!session||session.busy)return;const steps=session.adventure?[]:session.lesson.steps;if(session.index>=steps.length&&!session.answered)return;session.index++;session.answered=false;if(session.index>=steps.length+session.lesson.tasks.length)finish();else drawStage();}
  function answer(index){if(!session||session.answered||session.busy)return;const offset=session.adventure?0:session.lesson.steps.length,task=session.lesson.tasks[session.index-offset];if(!task||!Number.isInteger(index)||index<0||index>=task.choices.length)return;session.attempts++;const feedback=query('[data-activity-feedback]');
    if(index!==task.answer){feedback.className='g1-feedback g1-retry';feedback.textContent='لِننظر مرة أخرى. جرّب اختيارًا آخر.';query('[data-answer="'+index+'"]').setAttribute('aria-pressed','false');return;}
    session.answered=true;feedback.className='g1-feedback g1-success';feedback.textContent='أحسنت! '+ar(task.explain);app.querySelectorAll('[data-answer]').forEach(choice=>{choice.disabled=true;choice.classList.toggle('g1-selected',Number(choice.dataset.answer)===index);});query('[data-action="next"]').hidden=false;
  }
  function counter(){query('[data-counter-scene]').innerHTML=scene({type:'count',icon:'apple',count:labCount});query('[data-counter]').textContent=ar(labCount);query('[data-lab-feedback]').textContent='';}
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
    if(action==='continue'){const lesson=curriculum.find(l=>!done(l.id))||curriculum[0];if(lesson)begin(lesson);}
    else if(action==='term'){term=Number(target.dataset.term);render();}
    else if(action==='close'){closeSession();}
    else if(action==='finish'){if(currentRoute()!=='home')location.hash='/home';else{render();query('#main').focus();}}
    else if(action==='next')nextStage();
    else if(action==='retry-save')finish();
    else if(action==='answer')answer(Number(target.dataset.answer));
    else if(action==='adventure'){const unit=C.units.find(u=>u.id===target.dataset.unit);if(!unit)return;const pool=unit.lessons.flatMap(l=>l.tasks);const shuffled=pool.map(task=>({task,key:Math.random()})).sort((a,b)=>a.key-b.key).slice(0,3).map(row=>row.task);if(shuffled.length)begin({title:unit.title,tasks:shuffled,steps:[]},true);}
    else if(action==='add'||action==='subtract'){labCount=Math.max(0,Math.min(20,labCount+(action==='add'?1:-1)));counter();}
    else if(action==='new-counter'){labTarget=1+Math.floor(Math.random()*10);labCount=0;query('.g1-lab').outerHTML=(()=>{const holder=document.createElement('div');holder.innerHTML=mathLab();return holder.firstElementChild.outerHTML;})();}
    else if(action==='check-counter'){const ok=labCount===labTarget,feedback=query('[data-lab-feedback]');feedback.className='g1-feedback '+(ok?'g1-success':'g1-retry');feedback.textContent=ok?'أحسنت، هذه هي المجموعة المطلوبة.':'عُدّ التفاحات، ثم أضف أو أزل حتى تصبح '+ar(labTarget)+'.';}
    else if(action==='shape'){const texts={circle:'هذه دائرة. حدّها منحنٍ، وليس لها أضلاع مستقيمة.',square:'هذا مربّع. له أربعة أضلاع متساوية.',triangle:'هذا مثلّث. له ثلاثة أضلاع.',rectangle:'هذا مستطيل. له أربعة أضلاع، وكل ضلعين متقابلين متساويان.'};query('[data-shape-feedback]').textContent=texts[target.dataset.shape];}
    else if(action==='sense'){query('[data-sense-feedback]').textContent=senses[Number(target.dataset.sense)].text;}
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
