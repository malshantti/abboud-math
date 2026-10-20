/* أنشطة الصف الثاني: خطوة واحدة في الشاشة، وحفظ مستقل لكل طفل. */
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
  let state,save,student,term=1,session=null,serial=0,places={hundreds:0,tens:0,ones:0},labTarget=34,wordIndex=0,wordPicks=[],wordOrder=[],categoryIndex=0;
  const done=id=>Object.hasOwn(state.completed,id);
  const nextLesson=()=>{const selected=curriculum.filter(lesson=>lesson.term===term);return selected.find(lesson=>!done(lesson.id))||selected[0];};
  const totalDone=()=>curriculum.filter(lesson=>done(lesson.id)).length;
  const currentRoute=()=>Object.hasOwn(routeNames,location.hash.slice(2))?location.hash.slice(2):'home';
  const button=(label,action,style='g1-primary',extra='')=>'<button type="button" class="'+style+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
  const lessonButton=(lesson,index)=>'<button type="button" class="g1-lesson '+(done(lesson.id)?'g1-done':'')+'" data-lesson="'+esc(lesson.id)+'"><span class="g1-node">'+(done(lesson.id)?icon('check'):ar(index+1))+'</span><span><b>'+shown(lesson.title)+'</b><small class="g1-goal">'+shown(lesson.goal)+'</small></span><span aria-hidden="true">'+icon('arrow')+'</span>'+(done(lesson.id)?'<span class="g1-sr">أتممت هذا التدريب</span>':'')+'</button>';
  const cover='../../assets/early/'+C.id+'.webp';
  const unitScene=unit=>{const first=unit.lessons.find(lesson=>lesson.steps?.some(step=>step.scene)),picture=first?.steps.find(step=>step.scene)?.scene;if(!picture)return icon('book');if(C.id==='math'&&picture.type==='symbol'&&/[+−]/.test(picture.value))return icon(picture.value.includes('+')?'plus':'minus');if(picture.type==='place-value')return scene({type:'symbol',value:ar((picture.hundreds||0)*100+(picture.tens||0)*10+(picture.ones||0))});if(picture.type==='operation')return scene({type:'symbol',value:ar(picture.left)+' '+(picture.operator==='-'?'−':'+')+' '+ar(picture.right)});return scene(picture);};
  const termPicker=()=>'<div class="g1-tabs" role="group" aria-label="الفصل الدراسي">'+[1,2].map(value=>button('الفصل '+(value===1?'الأول':'الثاني'),'term','g1-secondary '+(value===term?'g1-selected':''),'data-term="'+value+'" aria-pressed="'+(value===term)+'"')).join('')+'</div>';
  const coverImage=(className,alt)=>'<img class="'+className+'" src="'+cover+'" width="520" height="520" alt="'+alt+'" decoding="async">';
  function reference(lesson) {
    const refs=Array.isArray(lesson.references)&&lesson.references.length?lesson.references:[{book:lesson.book,page:lesson.page}];
    const links=refs.map(ref=>{const book=C.books.find(item=>item.id===ref.book);if(!book)return '';const page=Number.isInteger(ref.page)&&ref.page>0?ref.page:null,pdfPage=Number.isInteger(ref.pdfPage)?ref.pdfPage:page&&Number.isInteger(book.pdfOffset)?page+book.pdfOffset:null;
      return '<a href="'+esc(book.url.split('#')[0]+(pdfPage?'#page='+pdfPage:''))+'" target="_blank" rel="noopener">'+shown(book.title)+(page?' · الصفحة المطبوعة '+ar(page):'')+'</a>';}).filter(Boolean);
    const practice=Array.isArray(lesson.guidedPractice)?lesson.guidedPractice.slice():[];
    if(lesson.homeActivity&&typeof lesson.homeActivity.text==='string')practice.push({title:lesson.homeActivity.title||'أجرّب مع الكبير',text:lesson.homeActivity.text});
    return (links.length?'<p class="g1-reference">'+shown(lesson.referenceLabel||'نشاط مساند؛ المرجع:')+' '+links.join(' · ')+' <span>يفتح المصدر مع الإنترنت.</span></p>':'')+(practice.length?'<details class="g1-card g1-guided-practice"><summary>مع الكبير: أقرأ وأحكي وأكتب</summary><p>أنشطة شفهية وورقية؛ لا يصححها الموقع ولا يسجّل إتقانها.</p><ol>'+practice.map(item=>'<li><b>'+shown(item.title)+'</b><p>'+shown(item.text)+'</p></li>').join('')+'</ol></details>':'');
  }
  function home() {
    const next=nextLesson(),count=totalDone();
    const units=C.units.filter(unit=>unit.term===term);
    return '<section class="g1-hero j-hero"><div class="g1-hero-copy"><span class="g1-kicker">الصف الثاني · '+shown(C.title)+'</span><h1>هَيّا يا '+shown(student.name)+'!</h1><p>خطوتنا التالية</p><h2 class="j-next-title">'+shown(next?.title||'نراجع ما تعلّمنا')+'</h2>'+(next?button((count?'نكمل رحلتنا':'نبدأ رحلتنا')+' '+icon('arrow'),'continue'):'')+'</div><div class="g1-hero-art">'+coverImage('j-hero-image','زيتون يستكشف '+shown(C.title))+'</div></section>'+
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
  function mathLab(){
    const names={hundreds:'مئات',tens:'عشرات',ones:'آحاد'};
    return '<section class="g1-lab"><h2>أبني العدد</h2><p>كوّن العدد <b class="g2-target">'+ar(labTarget)+'</b> بالمئات والعشرات والآحاد.</p><div data-place-scene>'+scene({type:'place-value',...places})+'</div><div class="g2-place-controls">'+Object.entries(names).map(([key,name])=>'<div><h3>'+name+'</h3>'+button(icon('plus'),'place','g1-secondary','data-place="'+key+'" data-delta="1" aria-label="أضف إلى '+name+'"')+'<output data-place-value="'+key+'" aria-label="عدد '+name+'">'+ar(places[key])+'</output>'+button(icon('minus'),'place','g1-secondary','data-place="'+key+'" data-delta="-1" aria-label="أنقص من '+name+'"')+'</div>').join('')+'</div>'+button('أتحقق من العدد','check-places')+'<p data-lab-feedback class="g1-feedback" role="status"></p>'+button('عدد جديد','new-number','g1-secondary')+'<p class="g1-caption">كل مئة مكوّنة من عشر عشرات، وكل عشرة من عشرة آحاد. هذا تدريب حرّ لا يضيف درجة إلى الرحلة.</p></section>';
  }
  function wordLab(){
    const data=C.lab;if(!data?.items?.length)return '<p class="g1-empty">أعود إلى تدريبات الكلمات في رحلتي.</p>';
    const item=data.items[wordIndex%data.items.length],dir=C.id==='english'?'ltr':'rtl';
    if(wordOrder.length!==item.words.length)wordOrder=item.words.map((word,index)=>({index,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(row=>row.index);
    return '<section class="g1-lab"><h2>'+shown(data.title)+'</h2><p>'+shown(data.prompt)+'</p>'+scene(item.scene)+'<p class="g1-caption">'+shown(item.hint||'أرتّب الكلمات لتكوين جملة مفيدة.')+'</p><div class="g2-sentence" data-sentence dir="'+dir+'" aria-live="polite">'+(wordPicks.length?wordPicks.map(i=>'<bdi>'+shown(item.words[i])+'</bdi>').join(' '):'<span>اختر الكلمات بالترتيب.</span>')+'</div><div class="g2-word-bank" dir="'+dir+'">'+wordOrder.map(i=>button('<bdi>'+shown(item.words[i])+'</bdi>','word-pick','g1-secondary','data-word="'+i+'" '+(wordPicks.includes(i)?'disabled':''))).join('')+'</div><div class="g2-lab-actions">'+button('أتحقق من الجملة','check-words')+button('أتراجع خطوة','word-undo','g1-secondary',wordPicks.length?'':'disabled')+button('أرتّب من جديد','word-clear','g1-secondary',wordPicks.length?'':'disabled')+'</div><p data-lab-feedback class="g1-feedback" role="status"></p>'+button('جملة أخرى','new-sentence','g1-secondary')+'<p class="g1-caption">هذا تدريب على ترتيب الكلمات. لا يصحّح الخطّ اليدوي ولا يقيس النطق، ولا يحفظ إجابات المختبر.</p></section>';
  }
  function updateWords(){
    const item=C.lab.items[wordIndex%C.lab.items.length];
    query('[data-sentence]').innerHTML=wordPicks.length?wordPicks.map(i=>'<bdi>'+shown(item.words[i])+'</bdi>').join(' '):'<span>اختر الكلمات بالترتيب.</span>';
    app.querySelectorAll('[data-word]').forEach(item=>{item.disabled=wordPicks.includes(Number(item.dataset.word));});
    query('[data-action="word-undo"]').disabled=!wordPicks.length;query('[data-action="word-clear"]').disabled=!wordPicks.length;
    query('[data-lab-feedback]').textContent='';
    const next=query('[data-word]:not(:disabled)')||query('[data-action="check-words"]');next.focus({preventScroll:true});
  }
  function lifeLab(){
    const data=C.lab;if(!data?.items?.length)return '<p class="g1-empty">أعود إلى أنشطة الاكتشاف في رحلتي.</p>';
    const item=data.items[categoryIndex%data.items.length];
    return '<section class="g1-lab"><h2>'+shown(data.title)+'</h2><p>'+shown(data.prompt)+'</p><div class="g2-category-item">'+scene({type:'items',icons:[item.icon]})+'<h3>'+shown(item.label)+'</h3></div><div class="g1-choices">'+data.categories.map((label,i)=>button(shown(label),'category','g1-choice','data-category="'+i+'"')).join('')+'</div><p data-lab-feedback class="g1-feedback" role="status"></p>'+button('صورة أخرى','new-category','g1-secondary')+'</section>';
  }
  function lab(){return '<section class="j-page-intro"><div><span class="g1-kicker">أكتشف بيدي</span><h1>أجرّب وأفهم</h1><p>أتعلم بالمحاولة. لا درجات هنا.</p></div>'+coverImage('j-intro-image','')+'</section>'+(C.id==='math'?mathLab():C.id==='life'?lifeLab():wordLab());}
  function labFeedback(ok,text){const target=query('[data-lab-feedback]');target.className='g1-feedback '+(ok?'g1-success':'g1-retry');target.textContent=text;}

  function report() {
    return '<section class="g1-parent"><span class="g1-kicker">مرافقة الطفل</span><h1>خطوات '+shown(student.name)+'</h1><p>هذا التقرير يخصّ الطالب الحالي في '+shown(C.title)+' على هذا الجهاز.</p><div class="g1-grid"><article class="g1-card"><h2>'+ar(totalDone())+'</h2><p>من '+ar(curriculum.length)+' تدريبًا مكتملًا في رحلة الكتاب</p></article><article class="g1-card"><h2>'+ar(state.rounds)+'</h2><p>جولات مغامرة مكتملة</p></article></div><h2>كيف نساعد الطفل؟</h2><ul><li>اقرأ التعليمات معه، ودعه يختار بنفسه.</li><li>استخدم أشياء من البيت للعدّ والمطابقة.</li><li>توقّف عند التعب، وأعد الفكرة في وقت آخر.</li><li>أصوات الدروس غير مضافة في هذه الدفعة؛ لا يعتمد النشاط على قراءة آلية.</li></ul><h2>الكتاب والأنشطة</h2><p>'+shown(C.sourceNote||'أنشطة تفاعلية تأسيسية داعمة لموضوعات الكتاب. لا تمثل نقلًا كاملًا لنصوصه وتمارينه.')+'</p>'+C.books.map(book=>'<p><a class="g1-book-link" href="'+esc(book.url)+'" target="_blank" rel="noopener">'+shown(book.title)+' — افتح المصدر مع الإنترنت</a></p>').join('')+'<div class="g1-table-wrap"><table class="g1-table"><caption>التدريبات المنجزة في هذه المادة</caption><thead><tr><th scope="col">التدريب</th><th scope="col">الحالة</th></tr></thead><tbody>'+lessons.filter(l=>done(l.id)).map(lesson=>'<tr><th scope="row">'+shown(lesson.title)+'</th><td>مكتمل</td></tr>').join('')+'</tbody></table></div>'+(!Object.keys(state.completed).length?'<p class="g1-empty">لم يُكمل الطفل تدريبًا بعد.</p>':'')+button('طباعة التقرير','print','g1-secondary')+'<p class="g1-caption">يُسجَّل الاكتمال بعد الإجابة عن مهام التدريب. التقرير لا يقيس القراءة أو الكتابة اليدوية تلقائيًا.</p></section>';
  }
  function render() {
    closeSession();const route=currentRoute();
    document.title=C.title+' — '+routeNames[route]+' — الصف الثاني';
    app.innerHTML='<div class="j-shell"><aside class="j-sidebar"><a class="g1-brand" href="../../?change=1"><img src="../../assets/brand/favicon.svg" width="42" height="42" alt=""><span>بستان التعلّم<small>الصف الثاني · '+shown(C.title)+'</small></span></a><nav class="g1-nav" aria-label="أقسام المادة">'+Object.entries(routeNames).map(([id,name])=>'<a href="#/'+id+'" '+(id===route?'aria-current="page"':'')+'>'+icon(routes[id])+'<span class="g1-nav-full">'+name+'</span><span class="g1-nav-short">'+shortNames[id]+'</span></a>').join('')+'</nav></aside><div class="j-workspace" data-route="'+route+'"><header class="g1-topbar"><div class="j-topbar-title">'+shown(routeNames[route])+' <small>في '+shown(C.title)+'</small></div><div class="g1-actions"><span class="g1-connection" role="status">'+(navigator.onLine?'جاهزون لنتعلّم':'نتعلّم دون إنترنت')+'</span><a class="g1-switch" href="../../login.html?switch=1">تبديل الطالب</a></div></header><main id="main" class="g1-wrap" tabindex="-1">'+({home,basics,play,lab,report})[route]()+'</main><footer class="g1-footer">كل محاولة تساعدنا على الفهم.</footer></div><dialog class="g1-modal" id="g1-lesson-dialog" aria-labelledby="g1-activity-title"></dialog></div>';

  }
  function closeSession(){serial++;session=null;const dialog=query('#g1-lesson-dialog');if(dialog?.open)dialog.close();}
  function begin(lesson,adventure=false) {
    const trigger=document.activeElement;closeSession();session={trigger,token:serial,lesson,adventure,index:0,attempts:0,answered:false,busy:false};
    const dialog=query('#g1-lesson-dialog');dialog.showModal();dialog.addEventListener('cancel',()=>{serial++;session=null;},{once:true});drawStage();
  }
  function drawStage() {
    if(!session)return;const {lesson,adventure,index}=session,steps=adventure?[]:lesson.steps,taskIndex=index-steps.length,task=lesson.tasks[taskIndex],step=steps[index],total=steps.length+lesson.tasks.length;
    const choiceOrder=task?task.choices.map((choice,i)=>({choice,i,sort:Math.random()})).sort((a,b)=>a.sort-b.sort):[];
    query('#g1-lesson-dialog').innerHTML='<header class="g1-modal-head"><div><span class="g1-kicker">'+(adventure?'مغامرة صغيرة':'نفهم ثم نجرّب')+'</span><h2 id="g1-activity-title">'+shown(lesson.title)+'</h2></div>'+button(icon('close'),'close','g1-close','aria-label="إغلاق التدريب"')+'</header><div class="g1-progress" role="progressbar" aria-label="خطوات النشاط" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+index+'"><span class="g1-progress-fill" style="width:'+Math.round(index/total*100)+'%"></span></div><div class="g1-modal-body"><p class="g1-caption">الخطوة '+ar(index+1)+' من '+ar(total)+'</p><section class="g1-stage">'+(task?'<h3 class="g1-step-text">'+shown(task.prompt)+'</h3>'+scene(task.scene)+'<div class="g1-choices">'+choiceOrder.map(({choice,i})=>button((choice.scene?scene(choice.scene):'')+'<bdi dir="'+direction(choice.label)+'">'+shown(choice.label)+'</bdi>','answer','g1-choice','data-answer="'+i+'"')).join('')+'</div><p class="g1-feedback" role="status" data-activity-feedback></p>'+button('نكمل '+icon('arrow'),'next','g1-primary','hidden'):'<p class="g1-step-text">'+shown(step.text)+'</p>'+scene(step.scene)+button('هَيّا نجرّب '+icon('arrow'),'next'))+'</section>'+(!adventure?reference(lesson):'')+'</div>';
    const heading=query('.g1-step-text');heading.tabIndex=-1;heading.focus({preventScroll:true});query('#g1-lesson-dialog').scrollTop=0;
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
    session.answered=true;feedback.className='g1-feedback g1-success';feedback.textContent='أحسنت! '+ar(task.explain);app.querySelectorAll('[data-answer]').forEach(choice=>{choice.disabled=true;choice.classList.toggle('g1-selected',Number(choice.dataset.answer)===index);});query('[data-action="next"]').hidden=false;query('[data-action="next"]').focus({preventScroll:true});
  }
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
    else if(action==='adventure'){const unit=C.units.find(u=>u.id===target.dataset.unit);if(!unit)return;const pool=unit.lessons.flatMap(l=>l.tasks);const shuffled=pool.map(task=>({task,key:Math.random()})).sort((a,b)=>a.key-b.key).slice(0,3).map(row=>row.task);if(shuffled.length)begin({title:unit.title,tasks:shuffled,steps:[]},true);}
    else if(action==='place'){const key=target.dataset.place,delta=Number(target.dataset.delta);if(!Object.hasOwn(places,key)||![1,-1].includes(delta))return;places[key]=Math.max(0,Math.min(9,places[key]+delta));query('[data-place-value="'+key+'"]').textContent=ar(places[key]);query('[data-place-scene]').innerHTML=scene({type:'place-value',...places});query('[data-lab-feedback]').textContent='';}
    else if(action==='check-places'){const value=places.hundreds*100+places.tens*10+places.ones;labFeedback(value===labTarget,value===labTarget?'أحسنت! المجموعات تمثّل العدد '+ar(labTarget)+'.':'أعدّ المئات والعشرات والآحاد، ثم غيّر المجموعات لتكوّن '+ar(labTarget)+'.');}
    else if(action==='new-number'){labTarget=1+Math.floor(Math.random()*999);places={hundreds:0,tens:0,ones:0};render();}
    else if(action==='word-pick'){const i=Number(target.dataset.word),item=C.lab.items[wordIndex%C.lab.items.length];if(!Number.isInteger(i)||i<0||i>=item.words.length||wordPicks.includes(i))return;wordPicks.push(i);updateWords();}
    else if(action==='word-undo'){wordPicks.pop();updateWords();}
    else if(action==='word-clear'){wordPicks=[];updateWords();}
    else if(action==='new-sentence'){wordIndex=(wordIndex+1)%C.lab.items.length;wordPicks=[];wordOrder=[];query('.g1-lab').outerHTML=wordLab();query('[data-word]').focus({preventScroll:true});}
    else if(action==='check-words'){const item=C.lab.items[wordIndex%C.lab.items.length],ok=wordPicks.length===item.words.length&&wordPicks.every((value,index)=>item.words[value]===item.words[index]);labFeedback(ok,ok?'أحسنت! نقرأ الجملة: '+item.words.join(' '):'أقرأ التلميح وأتأمل الكلمات، ثم أرتّبها من جديد.');}
    else if(action==='category'){const item=C.lab.items[categoryIndex%C.lab.items.length],ok=Number(target.dataset.category)===item.category;labFeedback(ok,ok?'أحسنت! '+item.label+' من '+C.lab.categories[item.category]+'.':'أفكّر في معنى المجموعة، ثم أجرّب مرة أخرى.');}
    else if(action==='new-category'){categoryIndex=(categoryIndex+1)%C.lab.items.length;render();}

    else if(action==='print')window.print();
  });
  window.addEventListener('hashchange',()=>{render();query('#main').focus();});
  window.addEventListener('storage',event=>{if(['bustan_owner','bustan_session'].includes(event.key))closeSession();});
  for(const event of ['online','offline'])window.addEventListener(event,()=>{const target=query('.g1-connection');if(target)target.textContent=navigator.onLine?'جاهزون لنتعلّم':'نتعلّم دون إنترنت';});
  P.ready.then(ok=>{if(!ok){app.innerHTML='<p class="g1-notice" role="alert">'+esc(P.error()||'تعذّر قراءة ملفك. أعد فتحه من صفحة الدخول.')+'</p>';return;}if(!P.PER.includes(C.key)){app.innerHTML='<p class="g1-notice" role="alert">أعد فتح الموقع متصلًا بالإنترنت لاستكمال تجهيز الصف الثاني.</p>';return;}student=P.current();if(!student){location.replace('../../login.html?next='+encodeURIComponent('g2/'+C.id+'/'));return;}save=P.writer(C.key);state=normalize(P.readProgress(C.key),ids);render();try{if(P.current()?.id===student.id)localStorage.setItem('bustan_last',JSON.stringify({grade:2,subject:C.id,path:'g2/'+C.id+'/',t:Date.now()}));}catch(_){}
    if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{const target=query('.g1-connection');if(target)target.textContent='تعذّر تجهيز الأنشطة دون إنترنت. أبقِ الصفحة مفتوحة.';});
  }).catch(()=>{app.innerHTML='<p class="g1-notice" role="alert">تعذّر فتح ملف الطالب. عُد إلى صفحة الدخول.</p>';});
})();
