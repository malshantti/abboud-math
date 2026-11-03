/* بستان التعلّم — tiny equation helper (self-hosted, ~3KB). $…$ → MathML, plus an Arabic toolbar with live preview. */
(function(w){
var SYM={times:['mo','×'],div:['mo','÷'],le:['mo','≤'],leq:['mo','≤'],ge:['mo','≥'],geq:['mo','≥'],ne:['mo','≠'],neq:['mo','≠'],pm:['mo','±'],cdot:['mo','·'],pi:['mi','π'],degree:['mo','°'],circ:['mo','°'],lt:['mo','<'],gt:['mo','>'],approx:['mo','≈'],infty:['mi','∞'],angle:['mo','∠'],triangle:['mo','△'],'%':['mo','%']};
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function math(t){var c=Array.from(t),p={i:0};return '<math dir="ltr" class="eq"><mrow>'+seq(c,p,null)+'</mrow></math>'}
function seq(c,p,stop){var it=[];while(p.i<c.length){var ch=c[p.i];if(stop!==null&&ch===stop){p.i++;break}if(ch===' '){p.i++;continue}
 if((ch==='^'||ch==='_')&&it.length){p.i++;var a=arg(c,p),b=it.pop();it.push(ch==='^'?'<msup>'+b+a+'</msup>':'<msub>'+b+a+'</msub>');continue}it.push(atom(c,p))}return it.join('')}
function arg(c,p){while(c[p.i]===' ')p.i++;if(c[p.i]==='{'){p.i++;return '<mrow>'+seq(c,p,'}')+'</mrow>'}return p.i<c.length?atom(c,p):'<mrow></mrow>'}
function atom(c,p){var ch=c[p.i];if(ch==='{'){p.i++;return '<mrow>'+seq(c,p,'}')+'</mrow>'}
 if(ch==='\\'){p.i++;var n='';while(p.i<c.length&&/[a-zA-Z]/.test(c[p.i]))n+=c[p.i++];if(!n&&p.i<c.length)n=c[p.i++];
  if(n==='frac'){var a=arg(c,p);return '<mfrac>'+a+arg(c,p)+'</mfrac>'}
  if(n==='sqrt'){if(c[p.i]==='['){p.i++;var x='<mrow>'+seq(c,p,']')+'</mrow>';return '<mroot>'+arg(c,p)+x+'</mroot>'}return '<msqrt>'+arg(c,p)+'</msqrt>'}
  if(SYM[n])return SYM[n][0]==='mi'?'<mi mathvariant="normal">'+SYM[n][1]+'</mi>':'<mo>'+SYM[n][1]+'</mo>';return '<mi mathvariant="normal">'+e(n)+'</mi>'}
 if(/[0-9٠-٩]/.test(ch)){var m='';while(p.i<c.length&&/[0-9٠-٩.,٫]/.test(c[p.i]))m+=c[p.i++];var tail=/[.,٫]$/.test(m)?'<mo>'+e(m.slice(-1))+'</mo>':'';return '<mn>'+e(m.replace(/[.,٫]+$/,''))+'</mn>'+tail}
 if(/[\u0600-\u06FF]/.test(ch)&&!/[٠-٩٫]/.test(ch)){var wd='';while(p.i<c.length&&/[\u0600-\u06FF]/.test(c[p.i])&&!/[٠-٩٫]/.test(c[p.i]))wd+=c[p.i++];return '<mi mathvariant="normal">'+e(wd)+'</mi>'}
 p.i++;return /[a-zA-Zπ∞]/.test(ch)?'<mi mathvariant="normal"'+(/[a-zA-Z]/.test(ch)?' class="v"':'')+'>'+e(ch)+'</mi>':'<mo>'+e(ch)+'</mo>'}
function html(s){return String(s||'').split(/(\$[^$]+\$)/).map(function(x){return x.length>2&&x[0]==='$'&&x[x.length-1]==='$'?math(x.slice(1,-1)):e(x)}).join('')}
var BTN=[['كسر','\\frac{}{}',6],['أُس','^{}',2],['جذر','\\sqrt{}',6],['×','\\times ',7],['÷','\\div ',5],['≤','\\le ',4],['≥','\\ge ',4],['≠','\\ne ',4],['π','\\pi ',4]];
function bar(inp,small){if(inp.dataset.eq)return;inp.dataset.eq=1;var b=document.createElement('div');b.className='eqbar';b.setAttribute('role','toolbar');b.setAttribute('aria-label','أدوات المعادلات');
 var pv=document.createElement('div');pv.className='eqpv';pv.setAttribute('aria-live','polite');
 b.innerHTML=(small?'':'<button type="button" data-w title="اجعل النص المحدّد معادلة">∑ معادلة</button>')+BTN.map(function(x,i){return '<button type="button" data-i="'+i+'">'+x[0]+'</button>'}).join('');
 inp.insertAdjacentElement('afterend',pv);inp.insertAdjacentElement('afterend',b);
 function upd(){pv.innerHTML=/\$[^$]+\$/.test(inp.value)?'معاينة: '+html(inp.value):''}
 b.addEventListener('mousedown',function(ev){ev.preventDefault()});
 b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var v=inp.value,s=inp.selectionStart==null?v.length:inp.selectionStart,en=inp.selectionEnd==null?s:inp.selectionEnd,ins,pos;
  if(t.hasAttribute('data-w')){var sel=v.slice(s,en)||'';ins='$'+sel+'$';pos=s+1+sel.length}
  else{var x=BTN[+t.dataset.i],inside=(v.slice(0,s).split('$').length-1)%2===1;ins=inside?x[1]:'$'+x[1]+'$';pos=s+(inside?0:1)+x[2]}
  inp.value=v.slice(0,s)+ins+v.slice(en);inp.focus();inp.setSelectionRange(pos,pos);upd();inp.dispatchEvent(new Event('input',{bubbles:true}))});
 inp.addEventListener('input',upd);upd()}
w.SchoolMath={html:html,bar:bar};
})(window);
