/* مصمم اختبارات محلي: مسودة في الذاكرة فقط، دون حسابات أو نشر أو API. */
(() => {
  'use strict';
  const VERSION = 'bustan-quiz-draft-v1';
  const MAX_IMAGE_BYTES=500*1024, MAX_UPLOAD_BYTES=8*1024*1024, MAX_JSON_BYTES=12*1024*1024;
  const IMAGE_MIMES=['image/png','image/jpeg','image/webp'];
  const SUBJECTS = {math:'الرياضيات',arabic:'اللغة العربية',english:'اللغة الإنجليزية',science:'العلوم والحياة'};
  const TYPES = {mcq:'اختيار من متعدد',tf:'صواب أو خطأ',short:'إجابة قصيرة'};
  const digits = value => String(value).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const latin = value => String(value).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => esc(digits(value));
  const integer = value => {const v = latin(value).trim();return /^\d+$/.test(v) && Number.isSafeInteger(Number(v)) ? Number(v) : null;};
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const boundedText = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
  const boundedInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const canonicalText = value => digits(latin(value)).trim().normalize('NFC');
  const questionCount = count => count===0?'لا أسئلة':count===1?'سؤال واحد':count===2?'سؤالان':digits(count)+(count%100>=3&&count%100<=10?' أسئلة':count%100>=11?' سؤالًا':' سؤال');
  const paths = {
    plus:'<path d="M12 5v14M5 12h14"/>',
    list:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h.1M11 9h6M7 15h.1M11 15h6"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    up:'<path d="m6 14 6-6 6 6"/>',
    down:'<path d="m6 10 6 6 6-6"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    book:'<path d="M12 6c-3-3-7-3-10-2v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.list}</svg>`;
  const fresh = () => ({version:VERSION,metadata:{title:'',grade:8,subject:'math',durationMinutes:null},questions:[]});
  let draft = fresh(), activeId = null, sequence = 0, host = null, binding = null, importSequence = 0;
  let mathTarget = 'question', mathInstance = null;
  let imageTicket=0, draftGeneration=0;
  let deletedQuestion=null;

  function decodeBase64(value) {
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',size=value.length/4*3-(value.endsWith('==')?2:value.endsWith('=')?1:0);
    const bytes=new Uint8Array(size);let buffer=0,bits=0,index=0;
    for(let i=0;i<value.length&&value[i]!=='=';i++){
      buffer=(buffer<<6)|alphabet.indexOf(value[i]);bits+=6;
      if(bits>=8){bits-=8;bytes[index++]=(buffer>>bits)&255;}
    }
    return bytes;
  }
  function rasterSize(bytes,mime) {
    const at=(i,text)=>Array.from(text).every((c,j)=>bytes[i+j]===c.charCodeAt(0));
    const be16=i=>bytes[i]*256+bytes[i+1];
    const be32=i=>bytes[i]*16777216+bytes[i+1]*65536+bytes[i+2]*256+bytes[i+3];
    const le24=i=>bytes[i]+bytes[i+1]*256+bytes[i+2]*65536;
    if(mime==='image/png'){
      if(bytes.length<33||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)||be32(8)!==13||!at(12,'IHDR'))return null;
      return {width:be32(16),height:be32(20)};
    }
    if(mime==='image/jpeg'){
      if(bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)return null;
      let i=2;
      while(i<bytes.length){
        if(bytes[i++]!==255)return null;
        while(bytes[i]===255)i++;
        const marker=bytes[i++];
        if(marker===217||marker===218)return null;
        if(marker===216||marker===1||(marker>=208&&marker<=215))continue;
        if(i+2>bytes.length)return null;
        const size=be16(i);if(size<2||i+size>bytes.length)return null;
        if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return size>=8?{width:be16(i+5),height:be16(i+3)}:null;
        i+=size;
      }
      return null;
    }
    if(mime==='image/webp'){
      if(bytes.length<25||!at(0,'RIFF')||!at(8,'WEBP'))return null;
      const riffSize=bytes[4]+bytes[5]*256+bytes[6]*65536+bytes[7]*16777216;
      if(riffSize+8!==bytes.length)return null;
      if(at(12,'VP8X')&&bytes.length>=30)return {width:le24(24)+1,height:le24(27)+1};
      if(at(12,'VP8L')&&bytes[20]===47)return {width:1+bytes[21]+((bytes[22]&63)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)};
      if(at(12,'VP8 ')&&bytes.length>=30&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42)return {width:(bytes[26]+bytes[27]*256)&16383,height:(bytes[28]+bytes[29]*256)&16383};
    }
    return null;
  }
  function validateImage(value,allowIncomplete) {
    const errors=[];
    if(!object(value))return {errors:['بيانات صورة السؤال غير صالحة.'],image:null};
    if(!IMAGE_MIMES.includes(value.mime))errors.push('الصورة يجب أن تكون PNG أو JPEG أو WebP.');
    if(!boundedInt(value.width,1,1600)||!boundedInt(value.height,1,1600))errors.push('أبعاد صورة السؤال من ١ إلى ١٦٠٠ بكسل.');
    if(!boundedText(value.alt,allowIncomplete?0:1,300))errors.push('اكتب وصفًا بديلًا واضحًا للصورة لا يتجاوز ٣٠٠ حرف.');
    let size=null;
    if(typeof value.dataUrl!=='string'||value.dataUrl.length>Math.ceil(MAX_IMAGE_BYTES/3)*4+40)errors.push('صورة السؤال غير صالحة أو تتجاوز ٥٠٠ كيلوبايت.');
    else{
      const match=/^data:(image\/png|image\/jpeg|image\/webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value.dataUrl);
      if(!match||match[1]!==value.mime||match[2].length%4!==0)errors.push('لا تُقبل روابط الصور أو ملفات SVG. اختر صورة بصيغة PNG أو JPEG أو WebP.');
      else{
        const bytes=decodeBase64(match[2]);
        if(bytes.length>MAX_IMAGE_BYTES)errors.push('صورة السؤال تتجاوز ٥٠٠ كيلوبايت.');
        else size=rasterSize(bytes,value.mime);
        if(!size||size.width!==value.width||size.height!==value.height)errors.push('بيانات الصورة لا تطابق الملف المرفق.');
      }
    }
    return {errors,image:errors.length?null:{dataUrl:value.dataUrl,mime:value.mime,width:value.width,height:value.height,alt:value.alt}};
  }
  function utf8Size(value,limit=MAX_JSON_BYTES) {
    let size=0;
    for(let i=0;i<value.length;i++){
      const code=value.charCodeAt(i);
      if(code<128)size++;else if(code<2048)size+=2;else if(code>=55296&&code<=56319&&i+1<value.length&&value.charCodeAt(i+1)>=56320&&value.charCodeAt(i+1)<=57343){size+=4;i++;}else size+=3;
      if(size>limit)return size;
    }
    return size;
  }

  function validateDraft(value, {allowIncomplete=false}={}) {
    const errors = [];
    if (!object(value) || value.version !== VERSION || !object(value.metadata) || !Array.isArray(value.questions)) {
      return {ok:false,errors:['صيغة الملف غير معتمدة. اختر ملف مسودة من مصمم الاختبارات.'],draft:null};
    }
    const m = value.metadata;
    if (!boundedText(m.title,allowIncomplete?0:1,160)) errors.push('اكتب عنوانًا للاختبار لا يتجاوز ١٦٠ حرفًا.');
    if (![6,8].includes(m.grade)) errors.push('اختر الصف السادس أو الثامن.');
    if (typeof m.subject !== 'string' || !Object.hasOwn(SUBJECTS,m.subject)) errors.push('اختر مادة من المواد الأربع.');
    if (m.durationMinutes !== null && !boundedInt(m.durationMinutes,1,300)) errors.push('المدة اختيارية، وعند تحديدها تكون عددًا صحيحًا من ١ إلى ٣٠٠ دقيقة.');
    if ((!allowIncomplete&&value.questions.length<1) || value.questions.length>100) errors.push('أضف سؤالًا واحدًا على الأقل للمعاينة؛ الحد الأقصى ١٠٠ سؤال.');
    function copyMath(expression,label) {
      if(!window.MATH_EDITOR||typeof window.MATH_EDITOR.validate!=='function'){errors.push(label+'تعذر تحميل محرر الرياضيات؛ أعد فتح الصفحة قبل استخدام التعبيرات.');return null;}
      const result=window.MATH_EDITOR.validate(expression,{allowIncomplete});
      if(!result.ok){errors.push(...result.errors.map(message=>label+message));return null;}
      return result.value.tokens.length?result.value:null;
    }
    const ids = new Set(), clean = [];
    value.questions.slice(0,100).forEach((q,i) => {
      const label = 'السؤال '+digits(i+1)+': ';
      if (!object(q)) {errors.push(label+'بنية السؤال غير صحيحة.');return;}
      if (typeof q.id !== 'string' || !/^[a-z][a-z0-9-]{0,49}$/.test(q.id) || ids.has(q.id)) errors.push(label+'معرّف السؤال غير صالح أو مكرر.');
      ids.add(q.id);
      if (typeof q.type !== 'string' || !Object.hasOwn(TYPES,q.type)) {errors.push(label+'نوع السؤال غير معتمد.');return;}
      if (!boundedText(q.prompt,allowIncomplete?0:1,3000)) errors.push(label+'اكتب نصًا لا يتجاوز ٣٠٠٠ حرف.');
      if (!(allowIncomplete&&q.points===null) && !boundedInt(q.points,1,100)) errors.push(label+'العلامة عدد صحيح من ١ إلى ١٠٠.');
      const ref = object(q.reference) ? q.reference : {};
      if (!boundedText(ref.book,0,200) || (ref.page !== null && !boundedInt(ref.page,1,2000))) errors.push(label+'راجع مرجع الكتاب ورقم الصفحة، من ١ إلى ٢٠٠٠.');
      const row = {id:q.id,type:q.type,prompt:q.prompt,points:q.points,reference:{book:ref.book,page:ref.page}};
      if(Object.hasOwn(q,'image')){const result=validateImage(q.image,allowIncomplete);errors.push(...result.errors.map(message=>label+message));if(result.image)row.image=result.image;}
      if(Object.hasOwn(q,'math')){const expression=copyMath(q.math,label);if(expression)row.math=expression;}
      if (q.type === 'mcq') {
        let optionMath=[null,null,null,null];
        if(Object.hasOwn(q,'optionMath')){
          if(!Array.isArray(q.optionMath)||q.optionMath.length!==4)errors.push(label+'التعبيرات الرياضية للخيارات تحتاج إلى أربع خانات.');
          else optionMath=Array.from({length:4},(_,j)=>q.optionMath[j]===null?null:copyMath(q.optionMath[j],label+'الخيار '+digits(j+1)+': '));
          if(optionMath.some(Boolean))row.optionMath=optionMath;
        }
        const validOptions = Array.isArray(q.options) && q.options.length === 4 && Array.from({length:4},(_,j)=>boundedText(q.options[j],0,500)).every(Boolean);
        const filled=validOptions&&q.options.every((v,j)=>v.trim().length>0||optionMath[j]);
        const fingerprints=validOptions?q.options.map((v,j)=>canonicalText(v)+'\u001f'+(optionMath[j]?window.MATH_EDITOR.render(optionMath[j]):'')):[];
        if (!validOptions || (!allowIncomplete&&(!filled||new Set(fingerprints).size!==4))) errors.push(label+'اكتب أربعة خيارات مختلفة، نصًا أو تعبيرًا رياضيًا، بحد أقصى ٥٠٠ حرف للنص.');
        if (!(allowIncomplete&&q.answer===null) && !boundedInt(q.answer,0,3)) errors.push(label+'حدّد الخيار الصحيح.');
        row.options = Array.isArray(q.options) ? q.options.slice() : [];
        row.answer = q.answer;
      } else if (q.type === 'tf') {
        if (!(allowIncomplete&&q.answer===null) && typeof q.answer !== 'boolean') errors.push(label+'حدّد هل الإجابة الصحيحة صواب أم خطأ.');
        row.answer = q.answer;
      } else {
        const validAnswers = Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.length >= (allowIncomplete?0:1) && q.acceptedAnswers.length <= 10 && q.acceptedAnswers.every(v=>boundedText(v,allowIncomplete?0:1,500));
        if (!validAnswers || (!allowIncomplete&&new Set((validAnswers?q.acceptedAnswers:[]).map(canonicalText)).size !== (validAnswers?q.acceptedAnswers.length:0))) errors.push(label+'اكتب من إجابة واحدة إلى ١٠ إجابات مقبولة مختلفة، كل إجابة في سطر، وبحد أقصى ٥٠٠ حرف للإجابة.');
        row.acceptedAnswers = Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.slice() : [];
      }
      clean.push(row);
    });
    const cleanDraft={version:VERSION,metadata:{title:m.title,grade:m.grade,subject:m.subject,durationMinutes:m.durationMinutes},questions:clean};
    if(!errors.length){const encodedImages=clean.reduce((size,q)=>size+(q.image?q.image.dataUrl.length:0),0);if(encodedImages>MAX_JSON_BYTES||utf8Size(JSON.stringify(cleanDraft,null,2))>MAX_JSON_BYTES)errors.push('حجم المسودة مع الصور يتجاوز ١٢ ميغابايت؛ قلّل عدد الصور أو حجمها.');}
    return {ok:errors.length===0,errors,draft:errors.length?null:cleanDraft};
  }

  const find = id => host && host.querySelector('#'+id);
  const active = () => draft.questions.find(q=>q.id===activeId);
  function announce(message) {const el=find('qb-status');if(el)el.textContent=message;}
  function showErrors(errors) {
    const el=find('qb-errors');if(!el)return;
    el.hidden=!errors.length;
    el.innerHTML=errors.length?'<h2>راجع المسودة أولًا</h2><ul>'+errors.slice(0,30).map(e=>'<li>'+text(e)+'</li>').join('')+'</ul>':'';
    if(errors.length)el.focus();
  }
  function clearErrors() {const el=find('qb-errors');if(el){el.hidden=true;el.textContent='';}}
  const option = (value,label,current) => `<option value="${esc(value)}"${current===value?' selected':''}>${text(label)}</option>`;
  function field(id,label,value,extra='') {return `<label class="qb-field" for="${id}"><span>${label}</span><input id="${id}" value="${text(value)}" ${extra}></label>`;}
  function summary() {
    const count=find('qb-count');if(count)count.textContent=questionCount(draft.questions.length);
    const points=draft.questions.reduce((n,q)=>n+(Number.isInteger(q.points)?q.points:0),0);
    const total=find('qb-total');if(total)total.textContent='مجموع العلامات: '+digits(points);
    const undo=find('qb-undo-delete');if(undo)undo.hidden=!deletedQuestion||deletedQuestion.generation!==draftGeneration||draft.questions.length>=100;
  }
  function list() {
    const el=find('qb-question-list');if(!el)return;
    el.innerHTML=draft.questions.length?draft.questions.map((q,i)=>`<li><button type="button" class="qb-question-pick${q.id===activeId?' selected':''}" data-qb-select="${esc(q.id)}"${q.id===activeId?' aria-current="true"':''}><span class="qb-number">${digits(i+1)}</span><span><b>${text(q.prompt.trim() || 'سؤال جديد')}</b><small>${TYPES[q.type]} · العلامة: ${digits(q.points == null?'—':q.points)}</small></span></button></li>`).join(''):'<li class="qb-list-empty">ابدأ بسؤال واحد، ثم ابنِ الاختبار على مهل.</li>';
    summary();
  }
  function destroyMath() {if(mathInstance){mathInstance.destroy();mathInstance=null;}}
  function mountMath() {
    destroyMath();
    const container=find('qb-math-editor'),q=active();
    if(!container||!q||!window.MATH_EDITOR)return;
    const target=mathTarget;
    const value=target==='question'?q.math:(q.optionMath||[])[Number(target)];
    mathInstance=window.MATH_EDITOR.mount(container,value,expression=>{
      if(!draft.questions.includes(q))return;
      if(target==='question'){if(expression.tokens.length)q.math=expression;else delete q.math;}
      else{
        if(!Array.isArray(q.optionMath))q.optionMath=[null,null,null,null];
        q.optionMath[Number(target)]=expression.tokens.length?expression:null;
        if(q.optionMath.every(value=>value===null))delete q.optionMath;
      }
      clearErrors();announce('حُدّث التعبير الرياضي في المسودة. صدّرها للاحتفاظ بها.');
    });
  }
  function editor() {
    ++imageTicket;
    destroyMath();
    const el=find('qb-editor');if(!el)return;
    const q=active();
    if(!q){el.innerHTML=`<div class="qb-empty">${icon('book')}<span class="eyebrow">مساحة لفكرة واضحة</span><h2>كيف تريد أن تسأل الطالب؟</h2><p>اختر نوع السؤال من القائمة. اكتب نصه كما في المرجع، ثم راجع الخيارات ومفتاح الإجابة.</p><button type="button" class="button" data-qb-add="mcq">${icon('plus')}أضف أول سؤال</button></div>`;return;}
    const index=draft.questions.indexOf(q);
    let answers='';
    if(q.type==='mcq') answers=`<fieldset class="qb-options"><legend>خيارات الإجابة</legend><p class="qb-help">أربعة خيارات مختلفة. حدّد الصحيح من القائمة أدناه.</p>${q.options.map((v,i)=>field('qb-option-'+i,'الخيار '+digits(i+1),v,'type="text" maxlength="500" data-qb-option="'+i+'"')).join('')}</fieldset><label class="qb-field" for="qb-answer"><span>مفتاح الإجابة: الخيار الصحيح</span><select id="qb-answer"><option value="">اختر الإجابة الصحيحة</option>${q.options.map((_,i)=>option(String(i),'الخيار '+digits(i+1),q.answer===null?'':String(q.answer))).join('')}</select></label>`;
    if(q.type==='tf') answers=`<label class="qb-field" for="qb-answer"><span>مفتاح الإجابة</span><select id="qb-answer"><option value="">اختر الإجابة الصحيحة</option>${option('true','صواب',q.answer===null?'':String(q.answer))}${option('false','خطأ',q.answer===null?'':String(q.answer))}</select></label>`;
    if(q.type==='short') answers=`<label class="qb-field" for="qb-accepted"><span>مفتاح الإجابة: الإجابات المقبولة</span><textarea id="qb-accepted" rows="4" maxlength="5010" aria-describedby="qb-accepted-help">${text(q.acceptedAnswers.join('\n'))}</textarea></label><p id="qb-accepted-help" class="qb-help">اكتب إجابة مقبولة في كل سطر؛ بحد أقصى ١٠ إجابات. لا يوجد تصحيح آلي في هذه المعاينة.</p>`;
    el.innerHTML=`<div class="qb-editor-heading"><div><span class="eyebrow">${TYPES[q.type]}</span><h2 id="qb-editor-title">السؤال ${digits(index+1)}</h2></div><div class="qb-question-actions"><button class="icon-btn" type="button" data-qb-move="up" aria-label="نقل السؤال إلى أعلى"${index===0?' disabled':''}>${icon('up')}</button><button class="icon-btn" type="button" data-qb-move="down" aria-label="نقل السؤال إلى أسفل"${index===draft.questions.length-1?' disabled':''}>${icon('down')}</button><button class="icon-btn qb-danger" type="button" data-qb-remove="${esc(q.id)}" aria-label="حذف السؤال الحالي">${icon('trash')}</button></div></div><label class="qb-field" for="qb-prompt"><span>نص السؤال</span><textarea id="qb-prompt" rows="4" maxlength="3000" placeholder="اكتب السؤال بوضوح، دون إجابة داخله.">${text(q.prompt)}</textarea></label><div class="qb-editor-meta">${field('qb-points','علامة السؤال',q.points==null?'':q.points,'type="text" inputmode="numeric" maxlength="3" data-qb-numeric="true" aria-describedby="qb-points-help"')}<p class="qb-help" id="qb-points-help">عدد صحيح من ١ إلى ١٠٠.</p></div>${answers}<fieldset class="qb-reference"><legend>${icon('book')}مرجع السؤال</legend><p class="qb-help">مرجع اختياري يراجعه المعلّم؛ إدخاله لا يعني التحقق من مطابقة المنهاج.</p><div class="qb-reference-fields">${field('qb-reference','اسم الكتاب أو الجزء',q.reference.book,'type="text" maxlength="200"')}${field('qb-page','رقم الصفحة',q.reference.page==null?'':q.reference.page,'type="text" inputmode="numeric" maxlength="4" data-qb-numeric="true"')}</div></fieldset>`;
    el.insertAdjacentHTML('beforeend',imageEditor(q));
    if(draft.metadata.subject==='math'||q.math||(q.optionMath||[]).some(Boolean)){
      if(q.type!=='mcq')mathTarget='question';
      const targets=option('question','نص السؤال',mathTarget)+(q.type==='mcq'?q.options.map((_,i)=>option(String(i),'الخيار '+digits(i+1),mathTarget)).join(''):'');
      el.insertAdjacentHTML('beforeend',`<section class="qb-math-workspace" aria-labelledby="qb-math-heading"><h3 id="qb-math-heading">مصمم المعادلات والكسور</h3><p class="qb-help">أضف تعبيرًا إلى نص السؤال أو أحد خياراته. يمكنك ترك نص الخيار فارغًا إذا كان يحتوي على تعبير مكتمل.</p><label class="qb-field" for="qb-math-target"><span>موضع التعبير الرياضي</span><select id="qb-math-target">${targets}</select></label><div id="qb-math-editor"></div></section>`);
      mountMath();
    }
  }
  function imageEditor(q) {
    return `<section class="qb-image-section" aria-labelledby="qb-image-heading"><h3 id="qb-image-heading">صورة السؤال</h3><p class="qb-help">أرفق شكلًا أو رسمًا من جهازك. تظهر الصورة مع السؤال وتُحفظ داخل ملف المسودة.</p><input id="qb-image-file" type="file" accept="image/png,image/jpeg,image/webp" hidden aria-label="اختيار صورة السؤال"><div class="qb-image-actions"><button type="button" id="qb-image-add" class="button secondary small">${icon('upload')}${q.image?'استبدال الصورة':'إضافة صورة'}</button>${q.image?'<button type="button" id="qb-image-remove" class="button secondary small qb-danger">حذف الصورة</button>':''}</div>${q.image?`<figure class="qb-question-image"><img id="qb-image-preview" src="${esc(q.image.dataUrl)}" alt="${text(q.image.alt)}" width="${q.image.width}" height="${q.image.height}" decoding="async"></figure><label class="qb-field" for="qb-image-alt"><span>وصف بديل للصورة</span><textarea id="qb-image-alt" rows="2" maxlength="300" aria-describedby="qb-image-help">${text(q.image.alt)}</textarea></label><p class="qb-help" id="qb-image-help">صف الشكل دون كشف الإجابة. الوصف مطلوب لمعاينة الاختبار.</p>`:''}<p id="qb-image-status" class="qb-help" role="status">صورة بصيغة PNG أو JPEG أو WebP، بحجم لا يتجاوز ٨ ميغابايت.</p></section>`;
  }
  function decodePicture(source) {
    return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('تعذرت قراءة الصورة. اختر ملف صورة صالحًا.'));image.src=source;});
  }
  async function prepareImage(file) {
    let objectUrl;
    try{
      if(!file||!IMAGE_MIMES.includes(file.type)||file.size>MAX_UPLOAD_BYTES)throw Error('اختر صورة PNG أو JPEG أو WebP لا تتجاوز ٨ ميغابايت.');
      const bytes=new Uint8Array(await file.arrayBuffer());
      const original=rasterSize(bytes,file.type);
      if(!original||!Number.isInteger(original.width)||!Number.isInteger(original.height)||original.width<1||original.height<1||original.width>16000||original.height>16000||original.width*original.height>32000000)throw Error('الملف ليس صورة صالحة، أو أبعاده كبيرة جدًا.');
      objectUrl=URL.createObjectURL(file);
      const picture=await decodePicture(objectUrl);
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('تعذر تجهيز الصورة في هذا المتصفح.');
      let prepared=null,edge=1600;
      for(let attempt=0;attempt<5&&!prepared;attempt++,edge=Math.round(edge*.8)){
        const scale=Math.min(1,edge/Math.max(picture.naturalWidth,picture.naturalHeight));
        canvas.width=Math.max(1,Math.round(picture.naturalWidth*scale));canvas.height=Math.max(1,Math.round(picture.naturalHeight*scale));
        ctx.drawImage(picture,0,0,canvas.width,canvas.height);
        const candidates=[canvas.toDataURL('image/png'),canvas.toDataURL('image/webp',.86),canvas.toDataURL('image/webp',.68)];
        for(const dataUrl of candidates){const mime=dataUrl.slice(5,dataUrl.indexOf(';')),image={dataUrl,mime,width:canvas.width,height:canvas.height,alt:''};if(!validateImage(image,true).errors.length){prepared=image;break;}}
      }
      if(!prepared)throw Error('تعذر تقليل حجم الصورة. جرّب صورة أصغر.');
      return prepared;
    }finally{if(objectUrl)URL.revokeObjectURL(objectUrl);}
  }
  async function uploadImage(file,input) {
    const question=active(),currentHost=host,generation=draftGeneration,ticket=++imageTicket;
    if(!file||!question)return;
    const current=()=>ticket===imageTicket&&generation===draftGeneration&&host===currentHost&&active()===question&&host.contains(input);
    try{
      find('qb-image-status').textContent='جارٍ تجهيز الصورة…';
      const prepared=await prepareImage(file);
      if(!current())return;
      prepared.alt=question.image?question.image.alt:'';
      const prospective={...draft,questions:draft.questions.map(q=>q===question?{...q,image:prepared}:q)};
      if(utf8Size(JSON.stringify(prospective,null,2))>MAX_JSON_BYTES)throw Error('حجم المسودة سيزيد على ١٢ ميغابايت. احذف صورة أخرى أو استخدم صورة أصغر.');
      question.image=prepared;clearErrors();editor();announce('أُضيفت الصورة إلى السؤال. اكتب وصفها البديل ثم راجع المعاينة.');find('qb-image-alt').focus();
    }catch(error){if(current()){find('qb-image-status').textContent=error.message;announce(error.message);}}
    finally{input.value='';}
  }
  function addQuestion(type) {
    if(!Object.hasOwn(TYPES,type))return;
    if(draft.questions.length>=100){showErrors(['وصلت إلى الحد الأقصى: ١٠٠ سؤال.']);return;}
    let id;do{id='qb-q-'+(++sequence);}while(draft.questions.some(q=>q.id===id));
    const q={id,type,prompt:'',points:1,reference:{book:'',page:null}};
    if(type==='mcq'){q.options=['','','',''];q.answer=null;}
    else if(type==='tf')q.answer=null;
    else q.acceptedAnswers=[];
    draft.questions.push(q);activeId=id;clearErrors();list();editor();find('qb-prompt').focus();announce('أُضيف سؤال جديد.');
  }
  function moveQuestion(direction) {
    const from=draft.questions.findIndex(q=>q.id===activeId),to=from+(direction==='up'?-1:1);
    if(from<0||to<0||to>=draft.questions.length)return;
    const q=draft.questions.splice(from,1)[0];draft.questions.splice(to,0,q);list();editor();announce('انتقل السؤال إلى الموضع '+digits(to+1)+'.');
    const control=host.querySelector('[data-qb-move="'+direction+'"]');if(control&&!control.disabled)control.focus();else find('qb-prompt').focus();
  }
  function removeQuestion(id) {
    const index=draft.questions.findIndex(q=>q.id===id);if(index<0)return;
    deletedQuestion={question:draft.questions[index],index,generation:draftGeneration};
    draft.questions.splice(index,1);activeId=(draft.questions[Math.min(index,draft.questions.length-1)]||{}).id||null;
    list();editor();announce('حُذف السؤال من المسودة. يمكنك التراجع عن آخر حذف.');
    const control=find('qb-prompt')||find('qb-add-mcq');if(control)control.focus();
  }
  function undoDelete() {
    if(!deletedQuestion||deletedQuestion.generation!==draftGeneration||draft.questions.length>=100)return;
    const item=deletedQuestion;deletedQuestion=null;
    draft.questions.splice(Math.min(item.index,draft.questions.length),0,item.question);activeId=item.question.id;
    list();editor();announce('استُعيد السؤال إلى موضعه السابق.');find('qb-prompt').focus();
  }
  function normalizeInput(el) {
    const next=digits(el.value).replace(/[۰-۹]/g,d=>'٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
    if(next!==el.value){const start=el.selectionStart,end=el.selectionEnd;el.value=next;if(start!==null)el.setSelectionRange(start,end);}
  }
  function updateInput(el) {
    if(!find('qb-heading')||!el.matches('input,textarea,select')||el.id==='qb-file'||el.id==='qb-image-file'||el.id==='qb-teacher-key'||el.closest('#qb-math-editor'))return;
    if(el.id==='qb-math-target'){if(mathTarget!==el.value){mathTarget=el.value;mountMath();}return;}
    if(el.closest('#qb-preview-dialog')){if(el.tagName==='TEXTAREA')normalizeInput(el);return;}
    if(el.matches('input,textarea'))normalizeInput(el);
    clearErrors();
    const m=draft.metadata,q=active();
    if(el.id==='qb-title')m.title=el.value;
    else if(el.id==='qb-grade')m.grade=Number(el.value);
    else if(el.id==='qb-subject'){m.subject=el.value;editor();}
    else if(el.id==='qb-duration')m.durationMinutes=el.value.trim()===''?null:(integer(el.value)===null?el.value:integer(el.value));
    else if(q){
      if(el.id==='qb-prompt')q.prompt=el.value;
      else if(el.id==='qb-points')q.points=el.value.trim()===''?null:(integer(el.value)===null?el.value:integer(el.value));
      else if(el.id==='qb-reference')q.reference.book=el.value;
      else if(el.id==='qb-page')q.reference.page=el.value.trim()===''?null:(integer(el.value)===null?el.value:integer(el.value));
      else if(el.hasAttribute('data-qb-option'))q.options[Number(el.dataset.qbOption)]=el.value;
      else if(el.id==='qb-answer')q.answer=el.value===''?null:q.type==='tf'?el.value==='true':Number(el.value);
      else if(el.id==='qb-accepted')q.acceptedAnswers=el.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      else if(el.id==='qb-image-alt'&&q.image)q.image.alt=el.value;
      list();
    }
    announce('المسودة في ذاكرة الصفحة فقط؛ صدّرها للاحتفاظ بها.');
  }
  function checkedDraft(allowIncomplete=false) {
    const result=validateDraft(draft,{allowIncomplete});showErrors(result.errors);return result.ok?result.draft:null;
  }
  function exportDraft() {
    const value=checkedDraft(true);if(!value)return;
    const serialized=JSON.stringify(value,null,2);
    if(utf8Size(serialized)>MAX_JSON_BYTES){showErrors(['حجم المسودة مع الصور يتجاوز ١٢ ميغابايت؛ قلّل عدد الصور أو حجمها.']);return;}
    const url=URL.createObjectURL(new Blob([serialized],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='bustan-quiz-draft.json';a.hidden=true;host.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    announce('جُهّز ملف المسودة للتنزيل. لم يُنشر اختبار ولم تُرسل بيانات إلى خادم.');
  }
  async function importDraft(file,input) {
    if(!file)return;
    const ticket=++importSequence;
    if(file.size>MAX_JSON_BYTES){input.value='';showErrors(['حجم الملف أكبر من الحد المسموح: ١٢ ميغابايت.']);return;}
    let value;
    try{const source=await file.text();if(utf8Size(source)>MAX_JSON_BYTES)throw Error('size');value=JSON.parse(source);}catch(e){input.value='';showErrors(['تعذرت قراءة الملف. اختر ملف JSON صالحًا لا يتجاوز ١٢ ميغابايت.']);return;}
    if(ticket!==importSequence||!host||!host.contains(input))return;
    input.value='';
    const result=validateDraft(value,{allowIncomplete:true});if(!result.ok){showErrors(result.errors);return;}
    if(typeof Image!=='undefined'){
      try{
        for(const q of result.draft.questions){if(q.image){const picture=await decodePicture(q.image.dataUrl);if(picture.naturalWidth!==q.image.width||picture.naturalHeight!==q.image.height)throw Error('dimensions');}}
      }catch(error){if(ticket===importSequence&&host&&host.contains(input))showErrors(['تعذر عرض إحدى صور الملف. بقيت المسودة الحالية دون تغيير.']);return;}
      if(ticket!==importSequence||!host||!host.contains(input))return;
    }
    if((draft.questions.length||draft.metadata.title.trim())&&!window.confirm('سيستبدل الاستيراد المسودة الموجودة في ذاكرة الصفحة. هل تريد المتابعة؟')){announce('أُلغي الاستيراد؛ بقيت المسودة الحالية.');return;}
    ++draftGeneration;++imageTicket;draft=result.draft;activeId=draft.questions.length?draft.questions[0].id:null;const currentHost=host;mount(currentHost);announce('استُوردت المسودة محليًا. راجع المحتوى ومفتاح الإجابة قبل أي استخدام.');
  }
  function answerKey(q) {
    if(q.type==='mcq')return text(q.options[q.answer])+renderMath((q.optionMath||[])[q.answer]);
    if(q.type==='tf')return q.answer?'صواب':'خطأ';
    return text(q.acceptedAnswers.join(' / '));
  }
  function renderMath(value) {return value&&window.MATH_EDITOR?window.MATH_EDITOR.render(value):'';}
  function renderPreview() {
    const value=validateDraft(draft).draft;if(!value)return;
    const showKey=find('qb-teacher-key').checked,m=value.metadata;
    const questions=value.questions.map((q,i)=>{
      let choices='';
      if(q.type==='mcq')choices='<div class="qb-student-options">'+q.options.map((o,j)=>'<label><input type="radio" name="preview-'+esc(q.id)+'" value="'+j+'"><span>'+text(o)+renderMath((q.optionMath||[])[j])+'</span></label>').join('')+'</div>';
      else if(q.type==='tf')choices='<div class="qb-student-options qb-tf"><label><input type="radio" name="preview-'+esc(q.id)+'" value="true"><span>صواب</span></label><label><input type="radio" name="preview-'+esc(q.id)+'" value="false"><span>خطأ</span></label></div>';
      else choices='<label class="qb-field"><span class="sr-only">إجابة السؤال '+digits(i+1)+'</span><textarea rows="3" maxlength="2000" placeholder="مساحة الإجابة"></textarea></label>';
      return `<section class="qb-preview-question"><div class="qb-preview-question-head"><b>السؤال ${digits(i+1)}</b><span>العلامة: ${digits(q.points)}</span></div><p class="qb-question-text">${text(q.prompt)}</p>${q.image?`<figure class="qb-question-image"><img src="${esc(q.image.dataUrl)}" alt="${text(q.image.alt)}" width="${q.image.width}" height="${q.image.height}" loading="lazy" decoding="async"></figure>`:''}${q.math?'<div class="qb-question-expression">'+renderMath(q.math)+'</div>':''}${choices}${showKey?'<div class="qb-key"><b>مفتاح الإجابة:</b> '+answerKey(q)+'</div>':''}${showKey&&(q.reference.book||q.reference.page!==null)?'<p class="qb-help">المرجع: '+text(q.reference.book||'غير محدّد')+(q.reference.page===null?'':' · صفحة '+digits(q.reference.page))+'</p>':''}</section>`;
    }).join('');
    find('qb-preview-sheet').innerHTML=`<header class="qb-paper-heading"><span>${m.grade===8?'الصف الثامن':'الصف السادس'} · ${SUBJECTS[m.subject]}</span><h3>${text(m.title)}</h3><p>${questionCount(value.questions.length)} · مجموع العلامات: ${digits(value.questions.reduce((sum,q)=>sum+q.points,0))}${m.durationMinutes===null?'':' · المدة بالدقائق: '+digits(m.durationMinutes)}</p><b class="qb-paper-label">${showKey?'نسخة مراجعة المعلّم — تظهر الإجابات':'معاينة نسخة الطالب — دون مفتاح الإجابة'}</b></header>${questions}`;
  }
  function preview() {
    if(!checkedDraft())return;
    find('qb-teacher-key').checked=false;renderPreview();find('qb-preview-dialog').showModal();
  }
  function mount(container) {
    if(binding)binding.abort();
    destroyMath();
    if(host){const previous=find('qb-preview-dialog');if(previous&&previous.open)previous.close();}
    host=container;binding=new AbortController();++importSequence;++imageTicket;
    const m=draft.metadata;
    host.innerHTML=`<section class="qb-shell" aria-labelledby="qb-heading"><div class="page-heading"><div><span class="eyebrow">من فكرة إلى سؤال واضح</span><h1 id="qb-heading">مصمم الاختبارات</h1><p>رتّب أسئلتك، وراجع نسخة الطالب، واحتفظ بالمسودة في ملف على جهازك.</p></div><button class="button" type="button" id="qb-preview">${icon('eye')}معاينة الاختبار</button></div><div class="qb-draft-notice"><span class="chip">مسودة غير منشورة</span><p>المسودة في ذاكرة الصفحة فقط، وتبقى أثناء التنقل داخل اللوحة. تحديث الصفحة أو إغلاقها يفقدها؛ صدّرها للاحتفاظ بها. يتحقق المعلّم من مطابقة الأسئلة للمنهاج والكتاب.</p></div><div id="qb-errors" class="qb-errors" role="alert" tabindex="-1" hidden></div><section class="panel qb-settings" aria-labelledby="qb-settings-title"><div class="panel-head"><div><span class="eyebrow">نبدأ بإطار بسيط</span><h2 id="qb-settings-title">بيانات الاختبار</h2></div>${icon('book')}</div><div class="qb-settings-grid">${field('qb-title','عنوان الاختبار',m.title,'type="text" maxlength="160" autocomplete="off" placeholder="اكتب عنوانًا واضحًا للاختبار"')}<label class="qb-field" for="qb-grade"><span>الصف</span><select id="qb-grade">${option('8','الصف الثامن',String(m.grade))}${option('6','الصف السادس',String(m.grade))}</select></label><label class="qb-field" for="qb-subject"><span>المادة</span><select id="qb-subject">${Object.entries(SUBJECTS).map(([id,name])=>option(id,name,m.subject)).join('')}</select></label>${field('qb-duration','المدة بالدقائق — اختياري',m.durationMinutes===null?'':m.durationMinutes,'type="text" inputmode="numeric" maxlength="3" data-qb-numeric="true" placeholder="دون مدة محدّدة"')}</div></section><div class="qb-columns"><aside class="panel qb-sidebar" aria-labelledby="qb-list-title"><div class="qb-list-heading"><h2 id="qb-list-title">أسئلة الاختبار</h2><span class="chip" id="qb-count"></span></div><p class="qb-help">اختر نوع السؤال لإضافته.</p><div class="qb-add-buttons"><button class="button secondary small" type="button" id="qb-add-mcq" data-qb-add="mcq">${icon('plus')}اختيار من متعدد</button><button class="button secondary small" type="button" id="qb-add-tf" data-qb-add="tf">${icon('plus')}صواب أو خطأ</button><button class="button secondary small" type="button" id="qb-add-short" data-qb-add="short">${icon('plus')}إجابة قصيرة</button></div><ol id="qb-question-list" class="qb-question-list"></ol><button type="button" id="qb-undo-delete" class="button secondary small" hidden>تراجع عن حذف السؤال</button><p id="qb-total" class="qb-total"></p></aside><section id="qb-editor" class="panel qb-editor" aria-label="محرر السؤال"></section></div><footer class="panel qb-footer"><div><b>مسودتك معك، على جهازك.</b><p>التصدير يحفظ الأسئلة ومفتاح الإجابة في ملف JSON. الاستيراد يستبدل مسودة الصفحة بعد التحقق من الملف.</p></div><div class="qb-file-actions"><button class="button secondary" type="button" id="qb-import">${icon('upload')}استيراد مسودة</button><button class="button" type="button" id="qb-export">${icon('download')}تصدير المسودة</button><input id="qb-file" type="file" accept=".json,application/json" hidden aria-label="ملف مسودة الاختبار"></div></footer><p id="qb-status" class="qb-status" role="status" aria-live="polite">لم تُرسل بيانات إلى خادم، ولا يوجد نشر من هذه الواجهة.</p><dialog id="qb-preview-dialog" class="qb-preview-dialog" aria-labelledby="qb-preview-title"><div class="qb-preview-toolbar"><div><h2 id="qb-preview-title">معاينة الاختبار</h2><p>معاينة محلية؛ لا تُحفظ إجابات التجربة ولا تُصحّح.</p></div><button type="button" class="icon-btn" data-qb-close aria-label="إغلاق معاينة الاختبار">${icon('close')}</button></div><label class="qb-teacher-toggle"><input type="checkbox" id="qb-teacher-key">إظهار مفتاح الإجابة للمعلّم</label><div id="qb-preview-sheet" class="qb-preview-sheet"></div><div class="qb-dialog-footer"><button type="button" class="button secondary" data-qb-close>إغلاق المعاينة</button></div></dialog></section>`;
    list();editor();
    const signal=binding.signal;
    host.addEventListener('click',event=>{
      if(!find('qb-heading'))return;
      const button=event.target.closest('button');if(!button||!host.contains(button))return;
      if(button.dataset.qbAdd)addQuestion(button.dataset.qbAdd);
      else if(button.dataset.qbSelect){activeId=button.dataset.qbSelect;clearErrors();list();editor();find('qb-prompt').focus();}
      else if(button.dataset.qbMove)moveQuestion(button.dataset.qbMove);
      else if(button.dataset.qbRemove)removeQuestion(button.dataset.qbRemove);
      else if(button.hasAttribute('data-qb-close'))find('qb-preview-dialog').close();
      else if(button.id==='qb-preview')preview();
      else if(button.id==='qb-export')exportDraft();
      else if(button.id==='qb-import')find('qb-file').click();
      else if(button.id==='qb-image-add')find('qb-image-file').click();
      else if(button.id==='qb-image-remove'){const q=active();if(q){++imageTicket;delete q.image;editor();announce('حُذفت الصورة من السؤال.');find('qb-image-add').focus();}}
      else if(button.id==='qb-undo-delete')undoDelete();
    },{signal});
    host.addEventListener('input',event=>updateInput(event.target),{signal});
    host.addEventListener('change',event=>{
      if(!find('qb-heading'))return;
      if(event.target.id==='qb-file')importDraft(event.target.files[0],event.target);
      else if(event.target.id==='qb-image-file')uploadImage(event.target.files[0],event.target);
      else if(event.target.id==='qb-teacher-key')renderPreview();
      else if(event.target.tagName==='SELECT')updateInput(event.target);
    },{signal});
    find('qb-preview-dialog').addEventListener('close',()=>{const control=find('qb-preview');if(control&&host.isConnected)control.focus();},{signal});
  }
  window.QUIZ_BUILDER={mount,validateDraft,images:{prepare:prepareImage,validate:validateImage}};
})();
