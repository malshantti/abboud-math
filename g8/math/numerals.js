/* Arabic digits for presentation; numerical models, routes and element IDs keep their original values. */
(function () {
  'use strict';
  const digits = '٠١٢٣٤٥٦٧٨٩';
  const arabic = value => String(value).replace(/[0-9۰-۹]/g, ch => digits[ch >= '۰' ? ch.charCodeAt(0)-0x6f0 : Number(ch)]);
  const latin = value => String(value).replace(/[٠-٩۰-۹]/g, ch => String(ch.charCodeAt(0)-(ch >= '۰' ? 0x6f0 : 0x660)));
  const normalize = value => latin(value).replace(/[−–]/g,'-').replace(/٬/g,'').replace(/[٫,]/g,'.');
  window.AR_NUM = {arabic, latin, normalize, number:value=>Number(normalize(value))};
  if (typeof document === 'undefined') return;
  const mathInput = el => el.matches('input.bl-in,input[inputmode="decimal"],input[inputmode="numeric"],input#prG') && !['range','number'].includes(el.type);
  function localizeInput(el) {
    if (!mathInput(el)) return;
    const next = arabic(el.value);
    if (next === el.value) return;
    const start = el.selectionStart, end = el.selectionEnd;
    el.value = next;
    if (start != null) el.setSelectionRange(start,end);
  }
  const skipped = el => el.closest('script,style,code,pre,[data-latin-digits]');
  // كسور رأسية كما في الكتاب: البسط فوق خط الكسر والمقام تحته
  const T='(?:[٠-٩]+(?:,[٠-٩]+)?|π|[\u0621-\u064a]ـ?){1,3}[²³]?';
  const FR=new RegExp('(?<![\u0621-\u064a\u0640٠-٩/])('+T+')/('+T+')(?![\u0621-\u064a\u0640٠-٩/])','g');
  const noFrac = el => el.closest('svg,textarea,option,title,.frac,[data-nofrac],.lv-svg');
  function stack(node){
    const v=node.nodeValue;if(v.indexOf('/')<0||!node.parentElement||noFrac(node.parentElement))return;
    FR.lastIndex=0;if(!FR.test(v))return;FR.lastIndex=0;
    const frag=document.createDocumentFragment();let last=0,m;
    while((m=FR.exec(v))){if(m[0]==='و/أو')continue;
      if(m.index>last)frag.appendChild(document.createTextNode(v.slice(last,m.index)));
      const f=document.createElement('span');f.className='frac';f.setAttribute('role','math');f.setAttribute('aria-label',m[1]+' على '+m[2]);
      const n=document.createElement('span');n.className='fn';n.textContent=m[1];const d=document.createElement('span');d.className='fd';d.textContent=m[2];
      f.append(n,d);frag.appendChild(f);last=m.index+m[0].length}
    if(last===0)return;if(last<v.length)frag.appendChild(document.createTextNode(v.slice(last)));
    node.parentNode.replaceChild(frag,node)}
  function render(root) {
    if (root.nodeType === 3) {
      if(root.parentElement && !skipped(root.parentElement)) {
        const next=arabic(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;
        stack(root);
      }
      return;
    }
    if (root.nodeType !== 1 || skipped(root)) return;
    const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const todo=[];
    while(walker.nextNode()) {
      const node=walker.currentNode;
      if(!skipped(node.parentElement)) {const next=arabic(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;if(next.indexOf('/')>=0)todo.push(node);}
    }
    todo.forEach(stack);
    for(const el of [root,...root.querySelectorAll('[aria-label],[aria-valuetext],[title],[placeholder],input')]) {
      for(const attr of ['aria-label','aria-valuetext','title','placeholder']) {
        if(!el.hasAttribute(attr)||skipped(el))continue;
        const before=el.getAttribute(attr),next=arabic(before);if(next!==before)el.setAttribute(attr,next);
      }
      if(el.tagName==='INPUT')localizeInput(el);
    }
  }
  function start() {
    render(document.body);
    new MutationObserver(records=>{
      const roots=new Set();
      for(const r of records) {
        if(r.type==='childList')for(const node of r.addedNodes)roots.add(node);
        else roots.add(r.target);
      }
      roots.forEach(render);
    }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-valuetext','title','placeholder']});
    document.addEventListener('input',e=>{if(e.target.tagName==='INPUT')localizeInput(e.target);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
