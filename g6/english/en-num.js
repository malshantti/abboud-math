/* العرض العربي: أرقام عربية مشرقية (٠١٢٣) كما في موقع الرياضيات، وعزل الكلمات الإنجليزية داخل النص العربي بـ <bdi dir="ltr"> لتظهر علامات الترقيم في مكانها. لا يمسّ النص الإنجليزي ولا الحقول. */
(function(){
const D='٠١٢٣٤٥٦٧٨٩';
const AD=v=>String(v).replace(/[0-9]/g,c=>D[+c]);
window.AD=AD;
const SKIP='script,style,input,textarea,select,option,code,pre,bdi,[dir="ltr"],[lang="en"],.ipa,[data-latin-digits]';
const AR=/[\u0600-\u06FF]/,LAT=/[A-Za-z]/;
const RUN=/[A-Za-z][A-Za-z0-9'’ ,.!?\/()+\-…]*[A-Za-z0-9'’)…]|[A-Za-z]/g;
function fix(node){
  const p=node.parentElement;if(!p||p.closest(SKIP))return;
  let t=node.nodeValue;
  if(AR.test(t)&&LAT.test(t)){
    const frag=document.createDocumentFragment();let last=0,m;RUN.lastIndex=0;
    while((m=RUN.exec(t))){frag.appendChild(document.createTextNode(AD(t.slice(last,m.index))));const b=document.createElement('bdi');b.dir='ltr';b.lang='en';b.textContent=m[0];frag.appendChild(b);last=m.index+m[0].length}
    frag.appendChild(document.createTextNode(AD(t.slice(last))));node.replaceWith(frag);return}
  if(/[0-9]/.test(t)&&!LAT.test(t))node.nodeValue=AD(t);
}
function walk(root){if(root.nodeType===3){fix(root);return}if(root.nodeType!==1||root.closest&&root.closest(SKIP))return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ns=[];while(w.nextNode())ns.push(w.currentNode);ns.forEach(fix)}
window.EN_LOCAL=walk;
function init(){walk(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fix(m.target);else m.addedNodes.forEach(walk)}}).observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
