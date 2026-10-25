/* محرّر صيغ محلي؛ بيانات محدودة وآمنة، دون تحليل شيفرة أو حساب الإجابات. */
(() => {
  'use strict';
  const MAX_TOKENS = 40, TEXT_LIMIT = 200, FIELD_LIMIT = 120;
  const TYPES = {text:'نص رياضي',fraction:'كسر',root:'جذر',power:'قوة'};
  const FIELDS = {text:[['value','النص الرياضي']],fraction:[['numerator','البسط'],['denominator','المقام']],root:[['value','ما تحت الجذر'],['index','دليل الجذر — اختياري']],power:[['base','الأساس'],['exponent','الأس']]};
  const SYMBOLS = ['س','ص','جـ','+','−','×','÷','=','<','>','≤','≥','(',')'];
  const mounts = new WeakMap();
  let sequence = 0;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const arabic = value => String(value).replace(/[0-9۰-۹]/g, ch => '٠١٢٣٤٥٦٧٨٩'[ch >= '۰' ? ch.charCodeAt(0)-0x6f0 : Number(ch)]);
  const latin = value => String(value).replace(/[٠-٩۰-۹]/g, ch => String(ch.charCodeAt(0)-(ch >= '۰' ? 0x6f0 : 0x660)));
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  // Keep visual direction/joining controls out of the saved mathematical text.
  const plain = value => String(value).replace(/[\u061c\u2009\u200c-\u200f\u202a-\u202e\u2066-\u2069]/g,'');
  const atoms = value => plain(value).match(/[0-9٠-٩۰-۹]+(?:[٫.][0-9٠-٩۰-۹]+)?|[ء-ي][ـ\u064b-\u065f\u0670]*|[a-zA-Z]+|\s+|./gu) || [];
  const inputValue = value => atoms(value).map((part,index,parts)=>(index?'\u200c\u200e'+(!/\s$/u.test(parts[index-1])&&!/^\s/u.test(part)?'\u2009':''):'')+part).join('');
  function caretAt(value, rawOffset) {
    let count=0;
    for(let i=0;i<value.length;i++){if(plain(value[i]))count++;if(count>=rawOffset)return rawOffset?i+1:0;}
    return value.length;
  }
  const inlineMath = value => atoms(value).map(part=>'<bdi class="me-atom'+(/^\s+$/u.test(part)?' me-space':'')+'" dir="'+(/^[ء-ي]/u.test(part)?'rtl':'ltr')+'">'+esc(part)+'</bdi>').join('');
  const zero = value => {
    const number = latin(value).trim().replace(/[−–]/g,'-').replace(/٬/g,'').replace(/[٫,]/g,'.');
    return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(number) && Number(number) === 0;
  };
  const fresh = () => ({version:1,tokens:[]});
  const copy = value => ({version:1,tokens:value.tokens.map(token=>({...token}))});

  function validate(value, {allowIncomplete = false} = {}) {
    const errors = [];
    if (!object(value) || value.version !== 1 || !Array.isArray(value.tokens)) return {ok:false,errors:['صيغة المعادلة غير معتمدة.'],value:null};
    if (value.tokens.length > MAX_TOKENS) return {ok:false,errors:['الحد الأقصى للصيغة ٤٠ جزءًا.'],value:null};
    if (!allowIncomplete && !value.tokens.length) errors.push('أضف جزءًا واحدًا على الأقل إلى الصيغة.');
    const tokens = [];
    value.tokens.forEach((token,index) => {
      const prefix = 'الجزء '+arabic(index+1)+': ';
      if (!object(token) || typeof token.kind !== 'string' || !Object.hasOwn(TYPES,token.kind)) {errors.push(prefix+'نوع الجزء غير معتمد.');return;}
      const row = {kind:token.kind};
      for (const [key,label] of FIELDS[token.kind]) {
        const optional = token.kind === 'root' && key === 'index';
        if (optional && !Object.hasOwn(token,key)) continue;
        const field = token[key], limit = token.kind === 'text' ? TEXT_LIMIT : FIELD_LIMIT;
        if (typeof field !== 'string' || field.length > limit) {errors.push(prefix+label+' يجب أن يكون نصًا لا يتجاوز '+arabic(limit)+' حرفًا.');continue;}
        if (!allowIncomplete && !optional && !field.trim()) errors.push(prefix+'أكمل حقل '+label+'.');
        row[key] = arabic(plain(field));
      }
      if (token.kind === 'fraction' && typeof token.denominator === 'string' && zero(plain(token.denominator))) errors.push(prefix+'لا يجوز أن يكون المقام صفرًا.');
      tokens.push(row);
    });
    return {ok:errors.length===0,errors,value:errors.length?null:{version:1,tokens}};
  }

  const visible = value => value && value.trim() ? inlineMath(value) : '<span class="me-placeholder">□</span>';
  function describe(token) {
    if (token.kind === 'text') return token.value || 'نص غير مكتمل';
    if (token.kind === 'fraction') return (token.numerator || 'بسط غير مكتمل')+' على '+(token.denominator || 'مقام غير مكتمل');
    if (token.kind === 'root') return 'جذر '+(token.value || 'قيمة غير مكتملة')+(token.index ? '، دليله '+token.index : '');
    return (token.base || 'أساس غير مكتمل')+' أس '+(token.exponent || 'أس غير مكتمل');
  }
  function tokenHTML(token) {
    if (token.kind === 'text') return '<span class="me-text">'+visible(token.value)+'</span>';
    if (token.kind === 'fraction') return '<span class="me-fraction"><span class="me-numerator">'+visible(token.numerator)+'</span><span class="me-denominator">'+visible(token.denominator)+'</span></span>';
    if (token.kind === 'root') return '<span class="me-root">'+(token.index ? '<sup class="me-root-index">'+inlineMath(token.index)+'</sup>' : '')+'<span class="me-radical">√</span><span class="me-radicand">'+visible(token.value)+'</span></span>';
    return '<span class="me-power"><span>'+visible(token.base)+'</span><sup>'+visible(token.exponent)+'</sup></span>';
  }
  function render(value) {
    const checked = validate(value,{allowIncomplete:true});
    if (!checked.ok) return '<span class="me-invalid">صيغة رياضية غير صالحة</span>';
    const tokens = checked.value.tokens;
    if (!tokens.length) return '';
    return '<span class="me-math" role="math" tabindex="0" aria-label="'+esc(tokens.map(describe).join(' '))+'"><span class="me-math-visual" aria-hidden="true">'+tokens.map(tokenHTML).join('')+'</span></span>';
  }

  function mount(container, value, onChange) {
    if (!container || typeof container.addEventListener !== 'function') throw new TypeError('حاوية محرّر الصيغ غير صالحة.');
    const previous = mounts.get(container);if (previous) previous.destroy();
    const checked = validate(value === undefined || value === null ? fresh() : value,{allowIncomplete:true});
    let state = checked.ok ? checked.value : fresh(), selected = state.tokens.length ? 0 : -1, focusedField = null;
    const prefix = 'me-'+(++sequence), controller = new AbortController(), signal = controller.signal;
    const fieldBox = () => container.querySelector('[data-me-fields]');
    const current = () => state.tokens[selected];
    const notify = () => {if (typeof onChange === 'function') onChange(copy(state));};
    container.innerHTML = '<section class="me-editor" aria-labelledby="'+prefix+'-heading"><div class="me-heading"><div><h3 id="'+prefix+'-heading">المعادلات والكسور</h3><p>أضف الأجزاء بالترتيب، ثم حدّد أي جزء لتعديله. الصيغة اختيارية.</p></div><span class="chip">عرض رياضي</span></div><div class="me-toolbar" role="group" aria-label="إضافة جزء إلى الصيغة">'+Object.entries(TYPES).map(([kind,label])=>'<button type="button" class="button secondary small" data-me-add="'+kind+'">إضافة '+label+'</button>').join('')+'</div><div class="me-palette" role="group" aria-label="رموز رياضية محلية">'+SYMBOLS.map(symbol=>'<button type="button" data-me-symbol="'+esc(symbol)+'" aria-label="إدراج '+esc(symbol)+'">'+esc(symbol)+'</button>').join('')+'</div><ol class="me-token-list" data-me-list aria-label="أجزاء الصيغة"></ol><div data-me-fields></div><div class="me-preview"><span class="me-preview-label">معاينة الصيغة</span><div class="me-preview-scroll" tabindex="0" aria-label="معاينة الصيغة، قابلة للتمرير عند الحاجة" data-me-preview></div></div><p class="me-validation" data-me-validation role="status"></p></section>';

    function list() {
      container.querySelector('[data-me-list]').innerHTML = state.tokens.length ? state.tokens.map((token,index)=>'<li><button type="button" class="me-token-pick'+(index===selected?' selected':'')+'" data-me-select="'+index+'" aria-pressed="'+(index===selected)+'"><span class="me-token-number">'+arabic(index+1)+'</span><span>'+TYPES[token.kind]+'</span></button></li>').join('') : '<li class="me-empty">ابدأ بنص رياضي، أو كسر، أو جذر، أو قوة.</li>';
      container.querySelectorAll('[data-me-add]').forEach(button=>{button.disabled=state.tokens.length>=MAX_TOKENS;});
      container.querySelectorAll('[data-me-symbol]').forEach(button=>{button.disabled=state.tokens.length>=MAX_TOKENS&&!current();});
    }
    function fields(focus = false) {
      const token = current();focusedField = null;
      if (!token) {fieldBox().innerHTML='';if(focus)container.querySelector('[data-me-add]').focus();return;}
      fieldBox().innerHTML = '<div class="me-fields"><div class="me-field-heading"><strong>'+TYPES[token.kind]+' — الجزء '+arabic(selected+1)+'</strong><div class="me-part-actions"><button type="button" class="button secondary small" data-me-move="-1"'+(selected===0?' disabled':'')+'>السابق</button><button type="button" class="button secondary small" data-me-move="1"'+(selected===state.tokens.length-1?' disabled':'')+'>التالي</button><button type="button" class="button secondary small me-remove" data-me-remove>حذف الجزء</button></div></div><div class="me-field-grid">'+FIELDS[token.kind].map(([key,label])=>'<label class="me-field" for="'+prefix+'-'+key+'"><span>'+label+'</span><input id="'+prefix+'-'+key+'" data-me-field="'+key+'" value="'+esc(inputValue(token[key] || ''))+'" maxlength="'+(token.kind==='text'?TEXT_LIMIT:FIELD_LIMIT)+'" autocomplete="off" spellcheck="false" dir="ltr"></label>').join('')+'</div></div>';
      fieldBox().querySelectorAll('input').forEach(input=>{input.maxLength=(token.kind==='text'?TEXT_LIMIT:FIELD_LIMIT)*4;});
      if (focus) {const first=fieldBox().querySelector('input');if(first) first.focus();}
    }
    function preview() {
      container.querySelector('[data-me-preview]').innerHTML = render(state) || '<span class="me-empty">ستظهر الصيغة هنا.</span>';
      const strict=validate(state), el=container.querySelector('[data-me-validation]');
      el.textContent = state.tokens.length && !strict.ok ? strict.errors.join(' ') : '';
    }
    function update(focus = false) {list();fields(focus);preview();}
    function add(kind) {
      if (state.tokens.length>=MAX_TOKENS) return;
      const token={kind};FIELDS[kind].forEach(([key])=>{token[key]='';});
      state.tokens.push(token);selected=state.tokens.length-1;update(true);notify();
    }
    function insert(symbol) {
      if (!current()) {if(state.tokens.length>=MAX_TOKENS)return;state.tokens.push({kind:'text',value:''});selected=state.tokens.length-1;update();}
      const input = focusedField && fieldBox().querySelector('[data-me-field="'+focusedField+'"]') || fieldBox().querySelector('input');
      if (!input) return;
      const start=plain(input.value.slice(0,input.selectionStart===null?input.value.length:input.selectionStart)).length,end=plain(input.value.slice(0,input.selectionEnd===null?input.value.length:input.selectionEnd)).length;
      const raw=plain(input.value),next=raw.slice(0,start)+symbol+raw.slice(end);
      if(next.length>(current().kind==='text'?TEXT_LIMIT:FIELD_LIMIT))return;
      input.focus();commitInput(input,next,start+symbol.length);
    }
    function commitInput(input,value,start,end=start) {
      const next=arabic(plain(value)).slice(0,current().kind==='text'?TEXT_LIMIT:FIELD_LIMIT);
      input.value=inputValue(next);
      input.setSelectionRange(caretAt(input.value,Math.min(start,next.length)),caretAt(input.value,Math.min(end,next.length)));
      current()[input.dataset.meField]=next;list();preview();notify();
    }
    container.addEventListener('focusin',event=>{if(event.target.matches('[data-me-field]')) focusedField=event.target.dataset.meField;},{signal});
    container.addEventListener('input',event=>{
      const input=event.target;if(!input.matches('[data-me-field]')||!current())return;
      const start=plain(input.value.slice(0,input.selectionStart)).length,end=plain(input.value.slice(0,input.selectionEnd)).length;
      commitInput(input,input.value,start,end);
    },{signal});
    container.addEventListener('keydown',event=>{
      const input=event.target;if(!input.matches('[data-me-field]')||!current()||event.ctrlKey||event.metaKey||event.altKey)return;
      if(event.key==='Backspace'||event.key==='Delete'){
        const raw=plain(input.value);let start=plain(input.value.slice(0,input.selectionStart)).length,end=plain(input.value.slice(0,input.selectionEnd)).length;
        if(start===end){if(event.key==='Backspace'&&start)start-=Array.from(raw.slice(0,start)).pop().length;else if(event.key==='Delete'&&end<raw.length)end+=Array.from(raw.slice(end))[0].length;}
        event.preventDefault();commitInput(input,raw.slice(0,start)+raw.slice(end),start);
      }else if((event.key==='ArrowLeft'||event.key==='ArrowRight')&&!event.shiftKey&&input.selectionStart===input.selectionEnd){
        const step=event.key==='ArrowLeft'?-1:1;let pos=input.selectionStart+step;
        while(pos>0&&pos<input.value.length&&!plain(input.value[step<0?pos:pos-1]))pos+=step;
        event.preventDefault();input.setSelectionRange(Math.max(0,Math.min(input.value.length,pos)),Math.max(0,Math.min(input.value.length,pos)));
      }
    },{signal});
    for(const type of ['copy','cut'])container.addEventListener(type,event=>{
      const input=event.target;if(!input.matches('[data-me-field]')||!event.clipboardData)return;
      const start=plain(input.value.slice(0,input.selectionStart)).length,end=plain(input.value.slice(0,input.selectionEnd)).length,raw=plain(input.value);
      if(start===end)return;
      event.clipboardData.setData('text/plain',raw.slice(start,end));event.preventDefault();
      if(type==='cut'&&current())commitInput(input,raw.slice(0,start)+raw.slice(end),start);
    },{signal});
    container.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button||!container.contains(button)||button.disabled)return;
      if(button.hasAttribute('data-me-add')) add(button.dataset.meAdd);
      else if(button.hasAttribute('data-me-select')) {selected=Number(button.dataset.meSelect);update(true);}
      else if(button.hasAttribute('data-me-symbol')) insert(button.dataset.meSymbol);
      else if(button.hasAttribute('data-me-remove')) {state.tokens.splice(selected,1);selected=state.tokens.length?Math.min(selected,state.tokens.length-1):-1;update(true);notify();}
      else if(button.hasAttribute('data-me-move')) {
        const next=selected+Number(button.dataset.meMove);if(next<0||next>=state.tokens.length)return;
        [state.tokens[selected],state.tokens[next]]=[state.tokens[next],state.tokens[selected]];selected=next;update(true);notify();
      }
    },{signal});
    update();
    if(!checked.ok)container.querySelector('[data-me-validation]').textContent=checked.errors.join(' ');
    const binding={destroy(){controller.abort();if(mounts.get(container)===binding)mounts.delete(container);}};
    mounts.set(container,binding);return binding;
  }
  (typeof window === 'undefined' ? globalThis : window).MATH_EDITOR = {mount,render,validate};
})();
