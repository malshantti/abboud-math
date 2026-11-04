/* أزرار الاستماع (عادي/بطيء) بجانب المفردات والجمل الإنجليزية من الكتاب التي لها ملفّ صوتي مسجّل فقط. */
(function(){if(typeof document==='undefined')return;
const SPK='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',SLW='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M3 17h13a4 4 0 004-4 5 5 0 00-10 0v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="20" cy="9" r="1.6" fill="currentColor"/></svg>';
const att=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const row=t=>'<span class="au-row" dir="ltr"><button type="button" class="au" data-en="'+att(t)+'" data-rate="1" aria-label="استمع" title="استمع">'+SPK+'</button><button type="button" class="au" data-en="'+att(t)+'" data-rate="0.75" aria-label="استمع ببطء" title="استمع ببطء">'+SLW+'</button></span>';
function deco(root){if(!window.AU)return;(root.querySelectorAll?root:document).querySelectorAll('ul.pts li,.voc>div>b').forEach(el=>{if(el.dataset.au)return;el.dataset.au=1;const t=el.textContent.trim().replace(/[\u0660-\u0669]/g,d=>String(d.charCodeAt(0)-1632));if(t&&window.AU.has(t))el.insertAdjacentHTML('beforeend',row(t))})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button.au[data-en]');if(!b||!window.AU)return;e.preventDefault();e.stopPropagation();window.AU.play(b.dataset.en,{btn:b,rate:+b.dataset.rate})},true);
const go=()=>{deco(document);new MutationObserver(()=>deco(document)).observe(document.body,{childList:true,subtree:true})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
