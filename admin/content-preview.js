/* معاينة محلية للمحتوى المؤلّف؛ لا تُسجّل تقدّمًا أو درجات. */
(() => {
  'use strict';
  const mounts = new WeakMap();
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const ar = value => String(value).replace(/[0-9]/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
  const text = value => esc(ar(value == null ? '' : value));
  const list = value => Array.isArray(value) ? value : [];
  const plain = value => typeof value === 'string' ? value : '';
  const labels = {unit:'وحدة',lesson:'درس',adventure:'مغامرة',lab:'مختبر'};
  const numeric = value => typeof value === 'number' && Number.isFinite(value);
  const integer = value => numeric(value) && Number.isInteger(value);
  let serial = 0;
  const icon = kind => '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({unit:'<path d="M4 7q6-3 12 0 6-3 12 0v20q-6-3-12 0-6-3-12 0zM16 7v20M8 12h4M8 17h4M20 12h4M20 17h4"/>',lesson:'<path d="M9 4h14v24H9zM13 10h6M13 15h6M13 20h4"/><path d="m4 10 2 2 3-4"/>',adventure:'<path d="M8 26c-8-10 20-7 15-17M23 4v7l6-3z"/><circle cx="8" cy="26" r="3"/><circle cx="14" cy="16" r="2"/>',lab:'<path d="M11 4h10M13 4v9L5 26q-1 2 2 2h18q3 0 2-2l-8-13V4M10 20h12"/><circle cx="14" cy="23" r="1"/>'}[kind] || '<circle cx="16" cy="16" r="11"/>')+'</svg>';
  function math(value) {
    if (!value || !window.MATH_EDITOR || typeof window.MATH_EDITOR.render !== 'function') return '';
    try { return '<div class="cp-math">'+window.MATH_EDITOR.render(value)+'</div>'; } catch (_) { return '<p class="cp-incomplete">أكمل الصيغة الرياضية لعرضها.</p>'; }
  }
  function image(value) {
    if (!value || typeof value !== 'object') return '';
    if (window.QUIZ_BUILDER && window.QUIZ_BUILDER.images) {
      try {const checked=window.QUIZ_BUILDER.images.validate(value,true);if(checked.errors.length)return '';} catch (_) {return '';}
    }
    const src = plain(value.src || value.dataUrl || value.data);
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(src)) return '';
    return '<figure class="cp-image"><img src="'+esc(src)+'" alt="'+esc(plain(value.alt))+'" loading="lazy">'+(value.alt ? '<figcaption>'+text(value.alt)+'</figcaption>' : '')+'</figure>';
  }
  const empty = message => '<div class="cp-incomplete">'+icon('lesson')+'<p>'+text(message)+'</p></div>';
  const fraction = (numerator,denominator) => '<span class="cp-fraction" role="math" aria-label="'+text(numerator)+' على '+text(denominator)+'"><span aria-hidden="true">'+text(numerator)+'</span><span aria-hidden="true">'+text(denominator)+'</span></span>';
  function mount(container, value, options = {}) {
    if (!container || typeof container.addEventListener !== 'function') throw new TypeError('حاوية المعاينة غير صالحة.');
    const previous = mounts.get(container); if (previous) previous.destroy();
    const item = value && typeof value === 'object' ? value : {};
    const controller = new AbortController(), prefix = 'cp-'+(++serial);
    let step = 0, selected = null, answered = false, complete = false, pieces = new Set(), observation = 0;
    const section = () => container.querySelector('[data-cp-content]');
    const feedback = (message,kind = '') => { const target = container.querySelector('[data-cp-feedback]'); if (target) {target.className = 'cp-feedback '+kind; target.textContent = ar(message);} };
    const choices = row => '<div class="cp-options">'+list(row.options).map((option,index)=>'<button type="button" class="cp-option" data-cp-answer="'+index+'"'+(answered?' disabled':'')+' aria-pressed="'+(selected===index)+'"><span class="cp-option-number">'+ar(index+1)+'</span>'+text(option)+'</button>').join('')+'</div>';
    const validQuestion = row => row && plain(row.prompt).trim() && list(row.options).length === 4 && row.options.every(option => plain(option).trim()) && integer(row.answer) && row.answer>=0 && row.answer<4;
    function unit() {
      const objectives = list(item.objectives).filter(value=>plain(value).trim());
      const children = list(options.items).filter(child=>child && child.type==='lesson' && child.unitId===item.id).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
      section().innerHTML = '<div class="cp-unit-art">'+icon('unit')+'<span>كل درس، خطوة نحو الفهم</span></div>'+image(item.image)+'<h3>ماذا سنتعلّم؟</h3>'+(objectives.length?'<ul class="cp-objectives">'+objectives.map(value=>'<li>'+text(value)+'</li>').join('')+'</ul>':empty('أضف أهداف الوحدة في محرّر المحتوى.'))+'<h3>دروس الوحدة</h3>'+(children.length?'<ol class="cp-lesson-list">'+children.map((child,index)=>'<li><span class="cp-node">'+ar(index+1)+'</span>'+(typeof options.onViewChild==='function'?'<button type="button" class="cp-child" data-cp-child="'+esc(child.id)+'">'+text(child.title || 'درس بلا عنوان')+'</button>':'<strong>'+text(child.title || 'درس بلا عنوان')+'</strong>')+'</li>').join('')+'</ol>':empty('اربط درسًا بهذه الوحدة ليظهر هنا.'));
    }
    function lesson() {
      const steps = list(item.steps);
      if (!steps.length) {section().innerHTML=empty('أضف خطوة شرح واحدة على الأقل.'); return;}
      const showCheck = step===steps.length, row = steps[Math.min(step,steps.length-1)] || {};
      section().innerHTML='<div class="cp-progress"><span>'+(showCheck?'تحقّق من فهمك':'الخطوة '+ar(step+1)+' من '+ar(steps.length))+'</span><div class="cp-progress-track"><span style="width:'+Math.round(Math.min(step+1,steps.length)/steps.length*100)+'%"></span></div></div>'+(showCheck?(validQuestion(item.check)?'<h3>'+text(item.check.prompt)+'</h3>'+choices(item.check)+'<p class="cp-feedback" data-cp-feedback role="status" aria-live="polite"></p>':empty('أكمل سؤال التحقّق والخيارات والإجابة الصحيحة في المحرّر.')):'<article class="cp-step"><span class="cp-step-count">'+ar(step+1)+'</span><h3>'+text(row.title || 'خطوة شرح')+'</h3><div class="cp-body">'+text(row.body)+'</div>'+image(row.image)+math(row.math)+'</article>')+'<div class="cp-controls"><button type="button" class="button secondary" data-cp-back'+(!step?' disabled':'')+'>الخطوة السابقة</button>'+(!showCheck?'<button type="button" class="button" data-cp-next>'+(step===steps.length-1?'تحقّق من فهمك':'الخطوة التالية')+'</button>':'<button type="button" class="button secondary" data-cp-restart>إعادة الدرس</button>')+'</div>';
    }
    function adventure() {
      const stages = list(item.stages);
      if (!stages.length) {section().innerHTML=empty('أضف مراحل المغامرة وأسئلتها في المحرّر.'); return;}
      section().innerHTML='<ol class="cp-path" aria-label="مراحل المغامرة">'+stages.map((_,index)=>'<li'+(index===step&&!complete?' aria-current="step"':'')+'><span class="cp-node '+(index<step||complete?'cp-done':'')+'">'+ar(index+1)+'</span><span>المرحلة '+ar(index+1)+'</span></li>').join('')+'</ol>'+(complete?'<div class="cp-finish">'+icon('adventure')+'<h3>أتممت تجربة المغامرة</h3>'+(options.live?'<p>أحسنت! أنهيت جميع المراحل.</p>':'<p>هذه معاينة؛ لم تُسجّل درجات أو نقاط للطالب.</p>')+'<button type="button" class="button secondary" data-cp-restart>إعادة التجربة</button></div>':validQuestion(stages[step])?'<h3>'+text(stages[step].prompt)+'</h3>'+choices(stages[step])+'<p class="cp-feedback" data-cp-feedback role="status" aria-live="polite"></p><div class="cp-controls"><button type="button" class="button" data-cp-stage-next hidden>'+(step===stages.length-1?'إنهاء التجربة':'المرحلة التالية')+'</button></div>':empty('أكمل نص المرحلة '+ar(step+1)+' وخياراتها وإجابتها الصحيحة.'));
    }
    function lab() {
      const config = item.config && typeof item.config==='object' ? item.config : {};
      if (item.template==='fraction') {
        if (!integer(config.parts)||config.parts<2||config.parts>12||!integer(config.selected)||config.selected<1||config.selected>config.parts) {section().innerHTML=empty('اختر عدد أجزاء بين ٢ و١٢، وعددًا مطلوبًا ضمن هذه الأجزاء.');return;}
        section().innerHTML='<div class="cp-lab-heading">'+icon('lab')+'<h3>كوّن الكسر المطلوب</h3></div><p class="cp-lab-instruction">حدّد '+fraction(config.selected,config.parts)+' من الأجزاء المتساوية.</p><div class="cp-pieces" style="--cp-parts:'+Math.min(config.parts,6)+'" role="group" aria-label="أجزاء متساوية">'+Array.from({length:config.parts},(_,index)=>'<button type="button" class="cp-piece" data-cp-piece="'+index+'" aria-label="الجزء '+ar(index+1)+'" aria-pressed="'+pieces.has(index)+'"></button>').join('')+'</div><div class="cp-fraction-value">الكسر الذي كوّنته <span data-cp-fraction>'+fraction(pieces.size,config.parts)+'</span></div><button type="button" class="button" data-cp-fraction-check>تحقّق من الكسر</button><p class="cp-feedback" data-cp-feedback role="status" aria-live="polite"></p>';
      } else if(item.template==='number-line') {
        if (!integer(config.min)||!integer(config.max)||config.min< -20||config.max>20||config.max<=config.min||config.max-config.min>20||!integer(config.point)||config.point<config.min||config.point>config.max) {section().innerHTML=empty('أكمل حدود خط الأعداد والنقطة المطلوبة؛ لا يتجاوز الفرق بين الحدّين ٢٠.');return;}
        section().innerHTML='<div class="cp-lab-heading">'+icon('lab')+'<h3>حدّد النقطة على خط الأعداد</h3></div><p>اختر موضع العدد <bdi dir="ltr">'+text(config.point)+'</bdi>.</p><div class="cp-line-scroll" tabindex="0" aria-label="خط الأعداد، قابل للتمرير عند الحاجة"><div class="cp-number-line" role="group" aria-label="اختيار عدد" dir="ltr">'+Array.from({length:config.max-config.min+1},(_,index)=>config.min+index).map(number=>'<button type="button" class="cp-tick" data-cp-tick="'+number+'" aria-pressed="'+(selected===number)+'"><span class="cp-tick-dot"></span><bdi dir="ltr">'+text(number)+'</bdi></button>').join('')+'</div></div><p class="cp-feedback" data-cp-feedback role="status" aria-live="polite">اختر نقطة لعرض نتيجة المحاولة.</p>';
      } else if(item.template==='observe') {
        const observations=list(config.observations).filter(value=>plain(value).trim());
        if (!plain(config.question).trim()||!observations.length) {section().innerHTML=empty('أضف سؤال الملاحظة ومشاهدات يراجعها المعلّم.');return;}
        observation=Math.min(observation,observations.length-1);
        section().innerHTML='<div class="cp-lab-heading">'+icon('lab')+'<h3>'+text(config.question)+'</h3></div><div class="cp-observation-scene" aria-hidden="true"><span class="cp-observation-lens">'+icon('lab')+'</span><div class="cp-sample-track">'+observations.map((_,index)=>'<span class="'+(index===observation?'cp-active':'')+'">'+ar(index+1)+'</span>').join('')+'</div></div><label class="cp-slider-label" for="'+prefix+'-slider">المشاهدة <span data-cp-observation-number>'+ar(observation+1)+'</span> من '+ar(observations.length)+'</label><input id="'+prefix+'-slider" class="cp-slider" type="range" min="0" max="'+(observations.length-1)+'" step="1" value="'+observation+'" data-cp-observe'+(observations.length===1?' disabled':'')+'><div class="cp-observation-text" data-cp-observation-text role="status" aria-live="polite">'+text(observations[observation])+'</div><p class="cp-note">المشاهدات من إعداد المعلّم؛ ليست محاكاة لقانون فيزيائي.</p>';
      } else section().innerHTML=empty('اختر قالب المختبر وأكمل إعداداته.');
    }
    function render() {
      container.innerHTML='<section class="cp-shell" dir="rtl" aria-labelledby="'+prefix+'-title">'+(options.live?'':'<div class="cp-draft">معاينة الطالب · مسودة غير منشورة</div>')+'<header class="cp-heading"><span class="cp-type-icon">'+icon(item.type)+'</span><div><span class="cp-kicker">'+text(labels[item.type] || 'محتوى')+'</span><h2 id="'+prefix+'-title">'+text(item.title || 'أضف عنوان المحتوى')+'</h2></div></header>'+(item.description?'<p class="cp-description">'+text(item.description)+'</p>':'')+'<div data-cp-content></div>'+(options.live?'':'<p class="cp-note cp-note-footer">التجربة داخل المعاينة فقط، ولا تغيّر تقدّم الطلاب.</p>')+'</section>';
      if(item.type==='unit') unit(); else if(item.type==='lesson') lesson(); else if(item.type==='adventure') adventure(); else if(item.type==='lab') lab(); else section().innerHTML=empty('اختر نوع المحتوى لبدء المعاينة.');
    }
    container.addEventListener('click',event=>{
      const button=event.target.closest('button'); if(!button||!container.contains(button)||button.disabled)return;
      if(button.hasAttribute('data-cp-child')) {if(typeof options.onViewChild==='function')options.onViewChild(button.dataset.cpChild);return;}
      if(button.hasAttribute('data-cp-next')) {step++;selected=null;answered=false;lesson();return;}
      if(button.hasAttribute('data-cp-back')) {step=Math.max(0,step-1);selected=null;answered=false;lesson();return;}
      if(button.hasAttribute('data-cp-restart')) {step=0;selected=null;answered=false;complete=false;render();return;}
      if(button.hasAttribute('data-cp-stage-next')) {step++;selected=null;answered=false;if(step>=list(item.stages).length)complete=true;adventure();return;}
      if(button.hasAttribute('data-cp-answer')) {
        const row=item.type==='adventure'?list(item.stages)[step]:item.check;if(!validQuestion(row)||answered)return;
        selected=Number(button.dataset.cpAnswer);container.querySelectorAll('[data-cp-answer]').forEach(option=>option.setAttribute('aria-pressed',String(Number(option.dataset.cpAnswer)===selected)));
        if(typeof options.onAnswer==='function'){try{options.onAnswer(button,selected===row.answer,row,item);}catch(_){}}if(selected===row.answer){answered=true;container.querySelectorAll('[data-cp-answer]').forEach(option=>{option.disabled=true;});feedback('إجابة صحيحة.'+(row.feedback?' '+plain(row.feedback):''),'cp-success');const next=container.querySelector('[data-cp-stage-next]');if(next)next.hidden=false;}else feedback('حاول مرة أخرى. راجع السؤال قبل اختيار الإجابة.','cp-retry');return;
      }
      if(button.hasAttribute('data-cp-piece')) {const index=Number(button.dataset.cpPiece);pieces.has(index)?pieces.delete(index):pieces.add(index);button.setAttribute('aria-pressed',String(pieces.has(index)));const target=container.querySelector('[data-cp-fraction]');if(target)target.innerHTML=fraction(pieces.size,item.config.parts);feedback('');return;}
      if(button.hasAttribute('data-cp-fraction-check')) {feedback(pieces.size===item.config.selected?'أحسنت، كوّنت الكسر المطلوب.':'عدد الأجزاء المحدّدة لا يطابق الكسر المطلوب. عدّل اختيارك ثم حاول مجددًا.',pieces.size===item.config.selected?'cp-success':'cp-retry');return;}
      if(button.hasAttribute('data-cp-tick')) {selected=Number(button.dataset.cpTick);container.querySelectorAll('[data-cp-tick]').forEach(tick=>tick.setAttribute('aria-pressed',String(Number(tick.dataset.cpTick)===selected)));feedback(selected===item.config.point?'أحسنت، هذه هي النقطة المطلوبة.':'اخترت '+ar(selected)+'؛ ابحث عن موضع العدد '+ar(item.config.point)+'.',selected===item.config.point?'cp-success':'cp-retry');}
    },{signal:controller.signal});
    container.addEventListener('input',event=>{if(!event.target.hasAttribute('data-cp-observe'))return;const rows=list(item.config.observations).filter(value=>plain(value).trim());observation=Math.max(0,Math.min(rows.length-1,Number(event.target.value)||0));container.querySelector('[data-cp-observation-number]').textContent=ar(observation+1);container.querySelector('[data-cp-observation-text]').textContent=ar(rows[observation]);container.querySelectorAll('.cp-sample-track span').forEach((node,index)=>node.classList.toggle('cp-active',index===observation));},{signal:controller.signal});
    render();
    const api={destroy(){controller.abort();container.innerHTML='';mounts.delete(container);}};mounts.set(container,api);return api;
  }
  window.CONTENT_PREVIEW=Object.freeze({mount});
})();
