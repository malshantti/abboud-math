/* Private authoring editor; dashboard.js handles authenticated server persistence. */
(() => {
  'use strict';
  const VERSION='bustan-content-draft-v1', MAX_BYTES=12*1024*1024;
  const TYPES={unit:'وحدة',lesson:'درس',adventure:'مغامرة',lab:'مختبر'};
  const TYPE_ICONS={unit:'<path d="M3 5q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1ZM12 6v15"/>',lesson:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',adventure:'<path d="M5 20c-8-10 18-4 13-14M18 2v7l5-3Z"/><circle cx="5" cy="20" r="2"/>',lab:'<path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10"/>'};
  const SUBJECTS={math:'الرياضيات',arabic:'اللغة العربية',english:'اللغة الإنجليزية',science:'العلوم والحياة'};
  const TEMPLATE_NAMES={fraction:'مختبر الكسور', 'number-line':'خط الأعداد',observe:'مشاهدات متتابعة'};
  const digits=v=>String(v).replace(/[0-9۰-۹]/g,ch=>'٠١٢٣٤٥٦٧٨٩'[ch>='۰'?ch.charCodeAt(0)-0x6f0:Number(ch)]);
  const latin=v=>String(v).replace(/[٠-٩۰-۹]/g,ch=>String(ch.charCodeAt(0)-(ch>='۰'?0x6f0:0x660)));
  const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const shown=v=>escape(digits(v));
  const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
  const idOkay=v=>typeof v==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(v);
  const clone=v=>JSON.parse(JSON.stringify(v));
  let pendingOperation=Promise.resolve();
  let bundle={version:VERSION,items:[]},host=null,controller=null,activeId=null,phase=0,deleted=null,mathHandle=null,previewHandle=null,generation=0,sequence=0,uploadTicket=0,importTicket=0;
  const uid=prefix=>prefix+'-'+Date.now().toString(36)+'-'+(++sequence).toString(36);
  function validateBundle(raw,{allowIncomplete=false}={}) {
    const errors=[],items=[],known=new Set();
    try { if(new TextEncoder().encode(JSON.stringify(raw)).byteLength>MAX_BYTES)return {ok:false,errors:['حجم المسودة يتجاوز ١٢ ميغابايت.'],value:null,bundle:null}; } catch { return {ok:false,errors:['بيانات المسودة غير قابلة للقراءة.'],value:null,bundle:null}; }
    const problem=(label,message)=>errors.push(label+': '+message);
    if(!obj(raw)||raw.version!==VERSION||!Array.isArray(raw.items)||raw.items.length>100)return {ok:false,errors:['ملف المحتوى غير معتمد، أو تجاوز الحد الأقصى وهو ١٠٠ عنصر.'],value:null,bundle:null};
    const bounded=(value,max,label,required=true)=>{if(typeof value!=='string'||value.length>max||(!allowIncomplete&&required&&!value.trim())){problem(label,'نص غير مكتمل أو يتجاوز '+digits(max)+' حرفًا.');return '';}return digits(value).normalize('NFC');};
    const claim=(value,label)=>{if(!idOkay(value)||known.has(value)){problem(label,'المعرّف غير صالح أو مكرّر.');return '';}known.add(value);return value;};
    const check=(value,label)=>{
      if(!obj(value)){problem(label,'بيانات التدريب غير صالحة.');return null;}
      const out={prompt:bounded(value.prompt,2000,label+'، السؤال'),options:[],answer:value.answer,feedback:bounded(value.feedback,2000,label+'، تفسير الإجابة')};
      if(!Array.isArray(value.options)||value.options.length!==4)problem(label,'يجب أن يحتوي السؤال على أربعة خيارات.');
      else out.options=value.options.map((v,i)=>bounded(v,600,label+'، الخيار '+digits(i+1)));
      if(!(integer(value.answer,0,3)||(allowIncomplete&&value.answer===null)))problem(label,'اختر الإجابة الصحيحة.');
      if(!allowIncomplete&&new Set(out.options.map(v=>v.trim())).size!==4)problem(label,'يجب أن تكون الخيارات الأربعة مختلفة.');
      return out;
    };
    raw.items.forEach((value,index)=>{
      const label='العنصر '+digits(index+1);
      if(!obj(value)||(typeof value.type!=='string'||!Object.hasOwn(TYPES,value.type))){problem(label,'نوع المحتوى غير معتمد.');return;}
      const item={id:claim(value.id,label),type:value.type,grade:value.grade,subject:value.subject,term:value.term,title:bounded(value.title,160,label+'، العنوان'),description:bounded(value.description,2000,label+'، الوصف'),order:value.order,reference:{book:'',page:null},unitId:value.unitId,lessonId:value.lessonId};
      if(![6,8].includes(value.grade)||(typeof value.subject!=='string'||!Object.hasOwn(SUBJECTS,value.subject))||![1,2].includes(value.term)||!integer(value.order,1,999))problem(label,'الصف أو المادة أو الفصل أو ترتيب العنصر غير صالح.');
      if(!obj(value.reference))problem(label,'مرجع الكتاب غير صالح.');
      else {item.reference.book=bounded(value.reference.book,300,label+'، مرجع الكتاب');item.reference.page=value.reference.page;if(!(integer(value.reference.page,1,9999)||(allowIncomplete&&value.reference.page===null)))problem(label,'اكتب رقم صفحة صحيحًا للمرجع.');}
      for(const key of ['unitId','lessonId'])if(value[key]!==null&&!idOkay(value[key]))problem(label,'معرّف الربط غير صالح.');
      if(value.type==='unit'){
        if(value.unitId!==null||value.lessonId!==null)problem(label,'لا ترتبط الوحدة بوحدة أو درس آخر.');
        if(value.image!==undefined){const checked=globalThis.QUIZ_BUILDER?.images?.validate(value.image,allowIncomplete);if(!checked||checked.errors.length)problem(label,(checked?.errors||['أداة الصور غير متاحة.']).join(' '));else item.image=checked.image;}
        item.objectives=[];
        if(!Array.isArray(value.objectives)||value.objectives.length>20||(!allowIncomplete&&!value.objectives.length))problem(label,'أضف من هدف واحد إلى ٢٠ هدفًا للوحدة.');
        else item.objectives=value.objectives.map((v,i)=>bounded(v,500,label+'، الهدف '+digits(i+1)));
      }else if(value.type==='lesson'){
        if(value.lessonId!==null)problem(label,'الدرس يرتبط بوحدة فقط.');
        item.steps=[];
        if(!Array.isArray(value.steps)||value.steps.length>30||(!allowIncomplete&&!value.steps.length))problem(label,'أضف من خطوة واحدة إلى ٣٠ خطوة للدرس.');
        else value.steps.forEach((s,i)=>{
          const prefix=label+'، الخطوة '+digits(i+1);
          if(!obj(s)){problem(prefix,'خطوة غير صالحة.');return;}
          const step={id:claim(s.id,prefix),title:bounded(s.title,160,prefix+'، العنوان'),body:bounded(s.body,6000,prefix+'، الشرح')};
          if(s.math!==undefined){if(value.subject!=='math')problem(prefix,'تتاح الصيغ الرياضية في مادة الرياضيات.');const result=globalThis.MATH_EDITOR?.validate(s.math,{allowIncomplete});if(!result?.ok)problem(prefix,(result?.errors||['محرّر الصيغ غير متاح.']).join(' '));else step.math=result.value;}
          if(s.image!==undefined){const result=globalThis.QUIZ_BUILDER?.images?.validate(s.image,allowIncomplete);if(!result||result.errors.length)problem(prefix,(result?.errors||['أداة الصور غير متاحة.']).join(' '));else step.image=result.image;}
          item.steps.push(step);
        });
        item.check=check(value.check,label+'، تدريب الدرس');
      }else if(value.type==='adventure'){
        if(value.template!=='path')problem(label,'قالب المغامرة غير معتمد.');
        item.template='path';item.stages=[];
        if(!Array.isArray(value.stages)||value.stages.length>20||(!allowIncomplete&&!value.stages.length))problem(label,'أضف من مرحلة واحدة إلى ٢٠ مرحلة.');
        else value.stages.forEach((s,i)=>{if(!obj(s)){problem(label,'مرحلة غير صالحة.');return;}const checked=check(s,label+'، المرحلة '+digits(i+1));if(checked)item.stages.push({id:claim(s.id,label+'، المرحلة'),...checked});});
      }else {
        item.template=value.template;
        if((typeof value.template!=='string'||!Object.hasOwn(TEMPLATE_NAMES,value.template))||!obj(value.config)){problem(label,'إعدادات المختبر غير صالحة.');item.config={};}
        else if(value.template==='fraction'){
          item.config={parts:value.config.parts,selected:value.config.selected};
          if(value.subject!=='math'||!integer(item.config.parts,2,12)||!integer(item.config.selected,1,item.config.parts))problem(label,'مختبر الكسور للرياضيات، وعدد الأجزاء من ٢ إلى ١٢ والعدد المطلوب من ١ إلى عدد الأجزاء.');
        }else if(value.template==='number-line'){
          item.config={min:value.config.min,max:value.config.max,point:value.config.point};
          if(value.subject!=='math'||!integer(item.config.min,-20,19)||!integer(item.config.max,item.config.min+1,20)||item.config.max-item.config.min>20||!integer(item.config.point,item.config.min,item.config.max))problem(label,'خط الأعداد للرياضيات؛ مجاله من −٢٠ إلى ٢٠ وبطول لا يتجاوز ٢٠، والنقطة ضمن المجال.');
        }else{
          item.config={question:bounded(value.config.question,2000,label+'، مهمة المشاهدة'),observations:[]};
          if(!Array.isArray(value.config.observations)||value.config.observations.length>12||(!allowIncomplete&&value.config.observations.length<2))problem(label,'أضف من مشاهدتين إلى ١٢ مشاهدة.');
          else item.config.observations=value.config.observations.map((s,i)=>bounded(s,1500,label+'، المشاهدة '+digits(i+1)));
        }
      }
      items.push(item);
    });
    const map=new Map(items.map(item=>[item.id,item]));
    items.forEach(item=>{
      const label=item.title||TYPES[item.type];
      const relation=(key,type,required)=>{const id=item[key];if(id===null){if(required&&!allowIncomplete)problem(label,'اختر '+TYPES[type]+' مرتبطة.');return;}const target=map.get(id);if(!target||target.type!==type||target.grade!==item.grade||target.subject!==item.subject||target.term!==item.term)problem(label,'الربط يجب أن يشير إلى '+TYPES[type]+' موجودة في الصف والمادة والفصل نفسها.');};
      if(item.type==='lesson')relation('unitId','unit',true);
      if(item.type==='adventure'||item.type==='lab'){
        relation('lessonId','lesson',true);
        if(item.unitId!==null)problem(label,'تُشتق الوحدة من الدرس؛ اترك unitId فارغًا لهذا النوع.');
      }
    });
    const value=errors.length?null:{version:VERSION,items};
    return {ok:!errors.length,errors,value,bundle:value};
  }
  const active=()=>bundle.items.find(item=>item.id===activeId);
  const selector=part=>host?.querySelector('[data-cb="'+part+'"]');
  const freshCheck=()=>({prompt:'',options:['','','',''],answer:null,feedback:''});
  const newItem=type=>({id:uid(type),type,grade:8,subject:'math',term:1,title:'',description:'',order:bundle.items.filter(i=>i.type===type).length+1,reference:{book:'',page:null},unitId:null,lessonId:null,...(type==='unit'?{objectives:['']}:type==='lesson'?{steps:[{id:uid('step'),title:'',body:''}],check:freshCheck()}:type==='adventure'?{template:'path',stages:[{id:uid('stage'),...freshCheck()}]}:{template:'fraction',config:{parts:4,selected:1}})});
  function cleanup(){mathHandle?.destroy();mathHandle=null;previewHandle?.destroy();previewHandle=null;}
  const option=(value,label,selected)=>'<option value="'+escape(value)+'"'+(String(value)===String(selected)?' selected':'')+'>'+shown(label)+'</option>';
  // Build inputs separately so values are always attributes, never interpreted markup.
  const input=(name,label,value,extra='')=>'<label class="cb-field"><span>'+label+'</span><input type="text" data-field="'+name+'" value="'+shown(value??'')+'" '+extra+'></label>';
  const textarea=(name,label,value,max=2000)=>'<label class="cb-field"><span>'+label+'</span><textarea rows="3" maxlength="'+max+'" data-field="'+name+'">'+shown(value)+'</textarea></label>';
  const select=(name,label,html)=>'<label class="cb-field"><span>'+label+'</span><select data-field="'+name+'">'+html+'</select></label>';
  function relationship(item,type,key){const candidates=bundle.items.filter(i=>i.type===type&&i.grade===item.grade&&i.subject===item.subject&&i.term===item.term);return select(key,type==='unit'?'الوحدة التابعة لها':'الدرس المرتبط',option('','اختر '+TYPES[type],item[key]??'')+(item[key]&&!candidates.some(i=>i.id===item[key])?option(item[key],'الربط السابق يحتاج إلى مراجعة',item[key]):'')+candidates.map(i=>option(i.id,i.title||TYPES[type]+' بلا عنوان',item[key])).join(''));}
  function metadata(item){return '<div class="cb-form-grid">'+input('title','عنوان '+TYPES[item.type],item.title,'maxlength="160"')+select('grade','الصف',option(8,'الصف الثامن',item.grade)+option(6,'الصف السادس',item.grade))+select('subject','المادة',Object.entries(SUBJECTS).map(([key,label])=>option(key,label,item.subject)).join(''))+select('term','الفصل الدراسي',option(1,'الفصل الأول',item.term)+option(2,'الفصل الثاني',item.term))+input('order','الترتيب',item.order,'inputmode="numeric" maxlength="3"')+(item.type==='lesson'?relationship(item,'unit','unitId'):['adventure','lab'].includes(item.type)?relationship(item,'lesson','lessonId'):'')+'</div>'+textarea('description',item.type==='adventure'?'المهارة المستهدفة ووصف المغامرة':item.type==='lab'?'هدف المختبر وتعليمات الطالب':'وصف موجز',item.description)+'<fieldset class="cb-repeat-card"><legend>مرجع المنهاج</legend><p class="cb-help">اكتب اسم الكتاب وطبعة المنهاج ورقم الصفحة. وجود المرجع لا يعني أن المحتوى روجع تلقائيًا.</p><div class="cb-form-grid">'+input('reference.book','الكتاب والطبعة',item.reference.book,'maxlength="300"')+input('reference.page','صفحة الكتاب',item.reference.page,'inputmode="numeric" maxlength="4"')+'</div></fieldset>';}
  function checkEditor(value,prefix){return textarea(prefix+'.prompt','نص السؤال',value.prompt)+'<div class="cb-form-grid">'+value.options.map((v,i)=>input(prefix+'.options.'+i,'الخيار '+digits(i+1),v,'maxlength="600"')).join('')+'</div>'+select(prefix+'.answer','الإجابة الصحيحة',option('','اختر الإجابة الصحيحة',value.answer??'')+value.options.map((_,i)=>option(i,'الخيار '+digits(i+1),value.answer)).join(''))+textarea(prefix+'.feedback','تفسير الإجابة ودعم الطالب',value.feedback);}
  function imageEditor(value,target){return '<section class="cb-repeat-card cb-image"><h3>غلاف الوحدة — اختياري</h3>'+(value.image?'<img src="'+escape(value.image.dataUrl)+'" alt="'+shown(value.image.alt)+'" width="'+value.image.width+'" height="'+value.image.height+'">'+input('image.alt','وصف الصورة',value.image.alt,'maxlength="300"')+'<button type="button" class="button secondary small" data-action="remove-unit-image">إزالة الصورة</button>':'')+'<label class="cb-field"><span>اختر صورة من جهازك</span><input type="file" accept="image/png,image/jpeg,image/webp" data-unit-image="true"></label><p class="cb-help">PNG أو JPEG أو WebP، بحجم أقصى ٨ ميغابايت قبل المعالجة. تُجهَّز محليًا بحجم لا يتجاوز ٥٠٠ كيلوبايت.</p></section>'; }
  function contentEditor(item){
    if(item.type==='unit')return imageEditor(item,'unit')+'<h3>أهداف الوحدة</h3><p class="cb-help">اكتب كل هدف في سطر مستقل، بلغة يستطيع الطالب فهمها.</p>'+textarea('objectives','الأهداف',item.objectives.join('\n'),10000);
    if(item.type==='lesson')return '<div class="cb-row"><h3>خطوات الدرس</h3><button type="button" class="button secondary small" data-action="add-step">إضافة خطوة</button></div><p class="cb-help">ابدأ بالتمهيد، ثم الشرح والمثال، وأنهِ بتدريب قصير. تبقى مطابقة الكتاب مسؤولية المراجع.</p>'+item.steps.map((s,i)=>'<section class="cb-repeat-card"><div class="cb-row"><h3>الخطوة '+digits(i+1)+'</h3><div class="cb-actions"><button type="button" class="button secondary small" data-action="step-up" data-index="'+i+'" '+(!i?'disabled':'')+'>إلى أعلى</button><button type="button" class="button secondary small" data-action="step-down" data-index="'+i+'" '+(i===item.steps.length-1?'disabled':'')+'>إلى أسفل</button><button type="button" class="button secondary small cb-danger" data-action="remove-step" data-index="'+i+'" '+(item.steps.length===1?'disabled':'')+'>حذف الخطوة</button></div></div>'+input('steps.'+i+'.title','عنوان الخطوة',s.title,'maxlength="160"')+textarea('steps.'+i+'.body','الشرح',s.body,6000)+'<div class="cb-image">'+(s.image?'<img src="'+escape(s.image.dataUrl)+'" alt="'+shown(s.image.alt)+'" width="'+s.image.width+'" height="'+s.image.height+'">'+input('steps.'+i+'.image.alt','وصف الصورة للطالب الذي يستخدم قارئ الشاشة',s.image.alt,'maxlength="300"')+'<button type="button" class="button secondary small" data-action="remove-image" data-index="'+i+'">إزالة الصورة</button>':'')+'<label class="cb-field"><span>إضافة صورة توضيحية — اختياري</span><input type="file" accept="image/png,image/jpeg,image/webp" data-step-image="'+i+'"></label><p class="cb-help">PNG أو JPEG أو WebP، بحجم أقصى ٨ ميغابايت قبل المعالجة. تُجهَّز الصورة محليًا بحجم لا يتجاوز ٥٠٠ كيلوبايت.</p></div>'+(item.subject==='math'?'<button type="button" class="button secondary small" data-action="edit-math" data-index="'+i+'">'+(s.math?'تعديل الصيغة الرياضية':'إضافة صيغة رياضية')+'</button>'+(s.math?'<button type="button" class="button secondary small" data-action="remove-math" data-index="'+i+'">إزالة الصيغة</button><div>'+globalThis.MATH_EDITOR.render(s.math)+'</div>':'')+'<div data-math-step="'+i+'"></div>':s.math?'<p class="cb-help">هذه الصيغة تخص الرياضيات. أزلها أو أعد المادة إلى الرياضيات قبل إكمال المسودة.</p><button type="button" class="button secondary small" data-action="remove-math" data-index="'+i+'">إزالة الصيغة غير المتوافقة</button>':'')+'</section>').join('')+'<section class="cb-repeat-card"><h3>تدريب الدرس</h3>'+checkEditor(item.check,'check')+'</section>';
    if(item.type==='adventure')return '<div class="cb-row"><h3>مغامرة مسار المراحل</h3><button type="button" class="button secondary small" data-action="add-stage">إضافة مرحلة</button></div><p class="cb-help">كل مرحلة سؤال قصير، مع تفسير يساعد الطالب عند الخطأ. تبدأ المعاينة بالمرحلة الأولى وتتدرّج بعد الإجابة.</p>'+item.stages.map((s,i)=>'<section class="cb-repeat-card"><div class="cb-row"><h3>المرحلة '+digits(i+1)+'</h3><button type="button" class="button secondary small cb-danger" data-action="remove-stage" data-index="'+i+'" '+(item.stages.length===1?'disabled':'')+'>حذف المرحلة</button></div>'+checkEditor(s,'stages.'+i)+'</section>').join('');
    const cfg=item.config;
    return '<h3>قالب المختبر</h3>'+select('template','نوع التجربة',Object.entries(TEMPLATE_NAMES).filter(([key])=>item.subject==='math'||key==='observe').map(([key,label])=>option(key,label,item.template)).join(''))+(item.template==='fraction'?'<p class="cb-help">يحدّد الطالب أجزاء متساوية ليكوّن الكسر المطلوب. الحد الأقصى ١٢ جزءًا.</p><div class="cb-form-grid">'+input('config.parts','عدد الأجزاء المتساوية',cfg.parts,'inputmode="numeric" maxlength="2"')+input('config.selected','الأجزاء المطلوب تحديدها',cfg.selected,'inputmode="numeric" maxlength="2"')+'</div>':item.template==='number-line'?'<p class="cb-help">يحدّد الطالب موضع العدد المطلوب على خط الأعداد.</p><div class="cb-form-grid">'+input('config.min','بداية الخط',cfg.min,'inputmode="text" maxlength="3"')+input('config.max','نهاية الخط',cfg.max,'inputmode="text" maxlength="3"')+input('config.point','العدد المطلوب',cfg.point,'inputmode="text" maxlength="3"')+'</div>':textarea('config.question','مهمة الملاحظة',cfg.question)+textarea('config.observations','المشاهدات — مشاهدة واحدة في كل سطر',cfg.observations.join('\n'),18000)+'<p class="cb-help">أضف مشاهدتين على الأقل من مصدر موثّق. لا يولّد القالب بيانات علمية أو نتائج تجربة تلقائيًا.</p>');
  }
  function list(){const target=selector('list');if(!target)return;target.innerHTML=bundle.items.length?bundle.items.map(item=>'<li><button type="button" data-pick="'+escape(item.id)+'" class="cb-item-button '+(item.id===activeId?'selected':'')+'" '+(item.id===activeId?'aria-current="true"':'')+'><span class="chip">'+TYPES[item.type]+'</span><span><b>'+shown(item.title||TYPES[item.type]+' بلا عنوان')+'</b><small>'+shown(item.grade)+' · '+SUBJECTS[item.subject]+' · الفصل '+digits(item.term)+'</small></span></button></li>').join(''):'<li class="cb-empty">أضف وحدة، ثم اربط بها الدروس والمغامرات والمختبرات.</li>';}
  function announce(message){const element=selector('status');if(element)element.textContent=message;}
  function errors(messages){const target=selector('errors');if(!target)return;target.hidden=!messages.length;target.innerHTML=messages.length?'<h3>أكمل هذه النقاط</h3><ul>'+messages.map(v=>'<li>'+escape(v)+'</li>').join('')+'</ul>':'';if(messages.length)target.focus();}
  function render(){
    cleanup();++uploadTicket;list();const item=active(),target=selector('editor');if(!target)return;
    const undo=selector('undo');if(undo){undo.hidden=!deleted;undo.textContent='التراجع عن آخر حذف';}
    if(!item){target.innerHTML='<div class="cb-empty"><h2>ابنِ رحلة تعلّم مترابطة</h2><p>ابدأ بوحدة وأهدافها، ثم أضف درسًا متدرّجًا ومغامرة أو مختبرًا مرتبطًا به.</p><button class="button" type="button" data-create="unit">إضافة وحدة</button></div>';return;}
    const names=['البيانات الأساسية','بناء المحتوى','المعاينة والمراجعة'];
    target.innerHTML='<div class="cb-row"><div><span class="eyebrow">'+TYPES[item.type]+' · مسودة تأليف</span><h2>'+shown(item.title||TYPES[item.type]+' جديدة')+'</h2></div><button type="button" class="button secondary small cb-danger" data-action="delete-item">حذف '+TYPES[item.type]+'</button></div><nav class="cb-wizard" aria-label="خطوات تأليف المحتوى">'+names.map((label,i)=>'<button type="button" class="cb-step-button '+(phase===i?'selected':'')+'" data-phase="'+i+'" '+(phase===i?'aria-current="step"':'')+'><b>'+digits(i+1)+'</b>'+label+'</button>').join('')+'</nav><div class="cb-step-content">'+(phase===0?metadata(item):phase===1?contentEditor(item):'<div class="cb-notice"><p>هذه معاينة محلية للتجربة. لا تنشر المحتوى للطلاب ولا تؤكد مطابقته للكتاب. جرّب الخطوات والخيارات ثم افحص اكتمال المسودة.</p></div><div class="cb-preview" data-cb="preview"></div><button type="button" class="button" data-action="review">فحص اكتمال المسودة</button>')+'</div><div class="cb-actions"><button type="button" class="button secondary" data-action="previous" '+(!phase?'disabled':'')+'>السابق</button><button type="button" class="button" data-action="next" '+(phase===2?'disabled':'')+'>'+(phase===1?'معاينة الطالب':'التالي')+'</button></div>';
    if(phase===2&&globalThis.CONTENT_PREVIEW)previewHandle=globalThis.CONTENT_PREVIEW.mount(selector('preview'),item,{items:bundle.items,onViewChild:id=>{if(bundle.items.some(v=>v.id===id)){activeId=id;render();}}});
  }
  function updateField(target){const item=active();if(!item)return;const path=target.dataset.field.split('.');let value=target.value;
    const key=path.join('.');
    if(key==='subject'&&item.type==='lab'&&value!=='math'&&item.template!=='observe'){item.template='observe';item.config={question:'',observations:['','']};}
    if(['grade','term','order','reference.page','config.parts','config.selected','config.min','config.max','config.point'].includes(key)){const raw=latin(value).trim().replace(/−/g,'-');value=/^-?\d+$/.test(raw)?Number(raw):null;}
    else if(key==='unitId'||key==='lessonId')value=value||null;
    else if(key.endsWith('.answer'))value=value===''?null:Number(value);
    else if(key==='objectives'||key==='config.observations')value=digits(value).split(/\r?\n/);
    else value=digits(value);
    if(key==='template'){item.template=value;item.config=value==='fraction'?{parts:4,selected:1}:value==='number-line'?{min:-5,max:5,point:0}:{question:'',observations:['','']};render();return;}
    let cursor=item;for(let i=0;i<path.length-1;i++){cursor=cursor[path[i]];if(!cursor)return;}cursor[path.at(-1)]=value;
    list();if(target.tagName==='SELECT'&&['grade','subject','term','unitId','lessonId'].includes(key)){if(key==='subject'&&item.type==='lab'&&item.subject!=='math'&&item.template!=='observe')announce('هذا القالب يتطلب مادة الرياضيات. اختر قالب المشاهدات في بناء المحتوى.');render();}
  }
  async function loadImage(input){const item=active(),index=Number(input.dataset.stepImage),step=input.hasAttribute('data-unit-image')?item:item?.steps?.[index],ticket=++uploadTicket,currentGeneration=generation;if(!step||!input.files?.[0])return;const file=input.files[0];announce('جارٍ تجهيز الصورة محليًا…');try{const image=await globalThis.QUIZ_BUILDER.images.prepare(file);if(ticket!==uploadTicket||generation!==currentGeneration||active()!==item||(step!==item&&!item.steps.includes(step))||!host?.contains(input))return;step.image=image;render();announce('أُضيفت الصورة. اكتب وصفًا بديلًا واضحًا لها.');}catch(error){if(ticket===uploadTicket&&generation===currentGeneration)errors([error.message||'تعذر تجهيز الصورة.']);}}
  function download(){const result=validateBundle(bundle,{allowIncomplete:true});if(!result.ok){errors(result.errors);return;}const blob=new Blob([JSON.stringify(result.value,null,2)],{type:'application/json'});if(blob.size>MAX_BYTES){errors(['حجم المسودة يتجاوز ١٢ ميغابايت. قلّل الصور أو قسّم المحتوى إلى ملفات.']);return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='bustan-content-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('صُدّرت المسودة إلى ملف. لا يعني التصدير نشرها أو اعتماد محتواها.');}
  async function importFile(input){const file=input.files?.[0],ticket=++importTicket;if(!file)return;if(file.size>MAX_BYTES){errors(['الحد الأقصى لملف المسودة ١٢ ميغابايت.']);return;}try{const result=validateBundle(JSON.parse(await file.text()),{allowIncomplete:true});if(ticket!==importTicket||!host?.contains(input))return;if(!result.ok){errors(result.errors);return;}for(const item of result.value.items)for(const step of [item,...(item.steps||[])])if(step.image){await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>image.naturalWidth===step.image.width&&image.naturalHeight===step.image.height?resolve():reject(Error('الصورة لا تطابق الأبعاد المحفوظة.'));image.onerror=()=>reject(Error('تعذر عرض صورة في الملف.'));image.src=step.image.dataUrl;});}if(ticket!==importTicket||!host?.contains(input))return;if(bundle.items.length&&!window.confirm('سيستبدل الاستيراد مسودة المحتوى الموجودة في ذاكرة الصفحة. صدّرها أولًا إذا أردت الاحتفاظ بها. هل تريد المتابعة؟'))return;bundle=result.value;activeId=bundle.items[0]?.id||null;phase=0;deleted=null;++generation;render();errors([]);announce('استُوردت المسودة محليًا. راجع المحتوى والروابط والمرجع قبل استخدامه.');}catch(error){if(ticket===importTicket)errors(['تعذر استيراد الملف. بقيت المسودة الحالية دون تغيير. '+(error instanceof SyntaxError?'ملف JSON غير صالح.':error.message)]);}finally{input.value='';}}
  function handleClick(event){const button=event.target.closest('button');if(!button||!host.contains(button)||button.disabled)return;if(button.dataset.create){if(bundle.items.length>=100){errors(['الحد الأقصى ١٠٠ عنصر.']);return;}const item=newItem(button.dataset.create);bundle.items.push(item);activeId=item.id;phase=0;render();errors([]);announce('أُضيفت '+TYPES[item.type]+' في المسودة.');return;}if(button.dataset.pick){activeId=button.dataset.pick;phase=0;render();errors([]);return;}if(button.dataset.phase!==undefined){phase=Number(button.dataset.phase);render();return;}const action=button.dataset.action,item=active(),index=Number(button.dataset.index);
    if(action==='export'){download();return;}if(action==='undo'){if(!deleted)return;if(deleted.kind==='item')bundle.items.splice(deleted.index,0,deleted.value);else {const owner=bundle.items.find(i=>i.id===deleted.owner);if(owner)owner[deleted.kind].splice(deleted.index,0,deleted.value);}deleted=null;render();announce('استُعيد آخر عنصر محذوف.');return;}if(!item)return;
    if(action==='previous'||action==='next'){phase=Math.max(0,Math.min(2,phase+(action==='next'?1:-1)));render();}
    else if(action==='delete-item'){if(bundle.items.some(i=>i.unitId===item.id||i.lessonId===item.id)){errors(['هذا العنصر مرتبط بمحتوى آخر. غيّر ربط العناصر التابعة أو احذفها أولًا؛ لم يُحذف شيء.']);return;}const at=bundle.items.indexOf(item);deleted={kind:'item',index:at,value:item};bundle.items.splice(at,1);activeId=bundle.items[0]?.id||null;++generation;render();announce('حُذف العنصر من المسودة. يمكنك التراجع عن الحذف.');}
    else if(action==='add-step'||action==='add-stage'){const key=action==='add-step'?'steps':'stages',limit=key==='steps'?30:20;if(item[key].length>=limit){errors(['بلغت الحد الأقصى لهذا النوع.']);return;}item[key].push(key==='steps'?{id:uid('step'),title:'',body:''}:{id:uid('stage'),...freshCheck()});render();}
    else if(action==='remove-step'||action==='remove-stage'){const key=action==='remove-step'?'steps':'stages';if(item[key].length<2)return;deleted={kind:key,owner:item.id,index,value:item[key][index]};item[key].splice(index,1);render();announce('حُذف الجزء. يمكنك التراجع عن آخر حذف.');}
    else if(action==='step-up'||action==='step-down'){const next=index+(action==='step-up'?-1:1);if(next<0||next>=item.steps.length)return;[item.steps[index],item.steps[next]]=[item.steps[next],item.steps[index]];render();}
    else if(action==='remove-unit-image'){delete item.image;++uploadTicket;render();}
    else if(action==='remove-image'){delete item.steps[index].image;++uploadTicket;render();}
    else if(action==='remove-math'){delete item.steps[index].math;render();}
    else if(action==='edit-math'){cleanup();const step=item.steps[index];mathHandle=globalThis.MATH_EDITOR.mount(host.querySelector('[data-math-step="'+index+'"]'),step.math||{version:1,tokens:[]},value=>{step.math=value;});}
    else if(action==='review'){const checked=validateBundle({version:VERSION,items:bundle.items});errors(checked.errors);if(checked.ok)announce('اكتملت الحقول والروابط في المسودة. ما زالت مطابقة الكتاب والمراجعة التعليمية مطلوبة قبل النشر.');}
  }
  function mount(container){controller?.abort();cleanup();host=container;controller=new AbortController();++uploadTicket;++importTicket;const signal=controller.signal;
    host.innerHTML='<section class="cb-shell" aria-labelledby="cb-heading"><div class="page-heading"><div><span class="eyebrow">من هدف صغير إلى رحلة مفهومة</span><h1 id="cb-heading">منشئ المحتوى</h1><p>أنشئ وحدة ودرسًا ومغامرة ومختبرًا، ثم جرّبها كما يراها الطالب.</p></div><span class="chip">محرّر المحتوى</span></div><div class="cb-notice"><p>استخدم «حفظ في الخادم» أعلى المحرر لحفظ عملك. تبقى المسودة خاصة بالمشرفين، ولا تظهر للطلاب قبل ربط النشر.</p></div><div class="cb-type-grid">'+Object.entries(TYPES).map(([key,name])=>'<button type="button" class="cb-type-card" data-create="'+key+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+TYPE_ICONS[key]+'</svg><b>إضافة '+name+'</b><span>'+({unit:'أهداف ووحدات مترابطة',lesson:'شرح ومثال وتدريب',adventure:'مراحل قصيرة وتغذية راجعة',lab:'تجربة بصرية قابلة للتفاعل'})[key]+'</span></button>').join('')+'</div><div class="cb-toolbar"><button type="button" class="button secondary" data-action="export">تصدير المسودة</button><label class="button secondary">استيراد مسودة<input class="sr-only" type="file" accept="application/json,.json" data-cb="import"></label><button type="button" class="button secondary" data-action="undo" data-cb="undo" hidden>التراجع عن آخر حذف</button></div><div class="cb-error" role="alert" tabindex="-1" data-cb="errors" hidden></div><p class="cb-status" role="status" aria-live="polite" data-cb="status"></p><div class="cb-layout"><aside class="panel cb-library"><h2>مكتبة المسودة</h2><p class="cb-help">العناصر مرتّبة حسب إضافتها. غيّر حقل الترتيب لتحديد تسلسلها عند ربط الموقع.</p><ol class="cb-item-list" data-cb="list"></ol></aside><section class="panel cb-editor" data-cb="editor"></section></div></section>';
    host.addEventListener('click',handleClick,{signal});host.addEventListener('input',event=>{if(event.target.dataset.field&&event.target.tagName!=='SELECT')updateField(event.target);},{signal});host.addEventListener('change',event=>{const target=event.target;if(target.matches('select[data-field]'))updateField(target);else if((target.hasAttribute('data-step-image')||target.hasAttribute('data-unit-image')))pendingOperation=loadImage(target);else if(target===selector('import'))pendingOperation=importFile(target);},{signal});render();
    return {destroy(){controller?.abort();cleanup();++uploadTicket;++importTicket;host=null;}};
  }
  (typeof window==='undefined'?globalThis:window).CONTENT_BUILDER={mount,validateBundle,destroy(){controller?.abort();cleanup();host=null;++generation;++uploadTicket;++importTicket;},getDraft:()=>clone(bundle),loadDraft(value){const checked=validateBundle(value,{allowIncomplete:true});if(!checked.ok)throw Error(checked.errors.join(' '));cleanup();bundle=checked.value;activeId=bundle.items[0]?.id||null;deleted=null;phase=0;++generation;++uploadTicket;++importTicket;if(host)render();},async ready(){let previous;do{previous=pendingOperation;await previous;}while(previous!==pendingOperation);}};
})();
