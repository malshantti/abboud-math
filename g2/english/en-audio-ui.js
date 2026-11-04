/* الصف الثاني: زرّا استماع (عادي/بطيء) بجانب الجمل والكلمات الإنجليزية التي لها ملف صوتي مسجّل فقط (Kokoro bf_emma). */
(function(){if(typeof document==='undefined')return;
const SPK='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',SLW='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M3 17h13a4 4 0 004-4 5 5 0 00-10 0v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="20" cy="9" r="1.6" fill="currentColor"/></svg>';
const att=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const row=t=>'<span class="au-row" dir="ltr" data-au-row="1"><button type="button" class="au" data-en="'+att(t)+'" data-rate="1" aria-label="استمع: '+att(t)+'" title="'+att(t)+'">'+SPK+'</button><button type="button" class="au" data-en="'+att(t)+'" data-rate="0.75" aria-label="استمع ببطء: '+att(t)+'" title="'+att(t)+'">'+SLW+'</button></span>';
const KEYS=Object.keys(((window.EN_AUDIO||{}).map)||{}).sort((a,b)=>b.length-a.length);
const SEL='p,h1,h2,h3,li,figcaption,td,dd,.g1-prompt,.g1-step-text';
function segs(text){const out=[];let rest=text;for(const k of KEYS){if(out.length>=3)break;const i=rest.indexOf(k);if(i<0)continue;const pre=rest[i-1],post=rest[i+k.length];if((pre&&/[A-Za-z]/.test(pre))||(post&&/[A-Za-z]/.test(post)))continue;out.push([text.indexOf(k),k]);rest=rest.slice(0,i)+' '.repeat(k.length)+rest.slice(i+k.length)}return out.sort((a,b)=>a[0]-b[0]).map(x=>x[1])}
function deco(){if(!window.AU||!KEYS.length)return;document.querySelectorAll(SEL).forEach(el=>{if(el.dataset.au||el.closest('button,[data-au-row],.au-row,.g1-reference,a,footer,nav'))return;if(el.querySelector(SEL))return;const t=el.textContent;if(!/[A-Za-z]/.test(t))return;el.dataset.au=1;const s=segs(t);if(s.length)el.insertAdjacentHTML('beforeend',s.map(row).join(''))})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button.au[data-en]');if(!b||!window.AU)return;e.preventDefault();e.stopPropagation();window.AU.play(b.dataset.en,{btn:b,rate:+b.dataset.rate})},true);
let q=0;const go=()=>{deco();new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;deco()})}).observe(document.body,{childList:true,subtree:true})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
