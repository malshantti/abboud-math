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
  function render(root) {
    if (root.nodeType === 3) {
      if(root.parentElement && !skipped(root.parentElement)) {
        const next=arabic(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;
      }
      return;
    }
    if (root.nodeType !== 1 || skipped(root)) return;
    const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()) {
      const node=walker.currentNode;
      if(!skipped(node.parentElement)) {const next=arabic(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}
    }
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
