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
        row[key] = arabic(field);
      }
      if (token.kind === 'fraction' && typeof token.denominator === 'string' && zero(token.denominator)) errors.push(prefix+'لا يجوز أن يكون المقام صفرًا.');
      tokens.push(row);
    });
    return {ok:errors.length===0,errors,value:errors.length?null:{version:1,tokens}};
  }

  const visible = value => value && value.trim() ? esc(value) : '<span class="me-placeholder">□</span>';
  function describe(token) {
    if (token.kind === 'text') return token.value || 'نص غير مكتمل';
    if (token.kind === 'fraction') return (token.numerator || 'بسط غير مكتمل')+' على '+(token.denominator || 'مقام غير مكتمل');
    if (token.kind === 'root') return 'جذر '+(token.value || 'قيمة غير مكتملة')+(token.index ? '، دليله '+token.index : '');
    return (token.base || 'أساس غير مكتمل')+' أس '+(token.exponent || 'أس غير مكتمل');
  }
  function tokenHTML(token) {
    if (token.kind === 'text') return '<span class="me-text">'+visible(token.value)+'</span>';
    if (token.kind === 'fraction') return '<span class="me-fraction"><span class="me-numerator">'+visible(token.numerator)+'</span><span class="me-denominator">'+visible(token.denominator)+'</span></span>';
    if (token.kind === 'root') return '<span class="me-root">'+(token.index ? '<sup class="me-root-index">'+esc(token.index)+'</sup>' : '')+'<span class="me-radical">√</span><span class="me-radicand">'+visible(token.value)+'</span></span>';
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
      fieldBox().innerHTML = '<div class="me-fields"><div class="me-field-heading"><strong>'+TYPES[token.kind]+' — الجزء '+arabic(selected+1)+'</strong><div class="me-part-actions"><button type="button" class="button secondary small" data-me-move="-1"'+(selected===0?' disabled':'')+'>السابق</button><button type="button" class="button secondary small" data-me-move="1"'+(selected===state.tokens.length-1?' disabled':'')+'>التالي</button><button type="button" class="button secondary small me-remove" data-me-remove>حذف الجزء</button></div></div><div class="me-field-grid">'+FIELDS[token.kind].map(([key,label])=>'<label class="me-field" for="'+prefix+'-'+key+'"><span>'+label+'</span><input id="'+prefix+'-'+key+'" data-me-field="'+key+'" value="'+esc(token[key] || '')+'" maxlength="'+(token.kind==='text'?TEXT_LIMIT:FIELD_LIMIT)+'" autocomplete="off" spellcheck="false" dir="ltr"></label>').join('')+'</div></div>';
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
      const start=input.selectionStart===null?input.value.length:input.selectionStart,end=input.selectionEnd===null?start:input.selectionEnd;
      const next=input.value.slice(0,start)+symbol+input.value.slice(end);
      if(next.length>input.maxLength)return;
      input.value=next;current()[input.dataset.meField]=next;input.focus();input.setSelectionRange(start+symbol.length,start+symbol.length);list();preview();notify();
    }
    container.addEventListener('focusin',event=>{if(event.target.matches('[data-me-field]')) focusedField=event.target.dataset.meField;},{signal});
    container.addEventListener('input',event=>{
      const input=event.target;if(!input.matches('[data-me-field]')||!current())return;
      const start=input.selectionStart,end=input.selectionEnd,next=arabic(input.value);
      input.value=next;if(start!==null)input.setSelectionRange(start,end);
      current()[input.dataset.meField]=next;list();preview();notify();
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
