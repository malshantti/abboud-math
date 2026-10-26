/* زر «من مكتبة الوسائط» بجانب كل حقل صورة في منشئ المحتوى ومصمم الاختبارات.
   يجلب الصورة المختارة ويمرّرها إلى الحقل نفسه كأنها رُفعت من الجهاز، فتمرّ بالتحقق والضغط المعتادين. */
(()=>{'use strict';const C=window.ADMIN_CONFIG||{};if(!C.media)return;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dlg=null,target=null,site='',timer=0;
function ensure(){if(dlg)return dlg;dlg=document.createElement('dialog');dlg.className='mp-dlg';dlg.setAttribute('aria-label','مكتبة الوسائط');
 dlg.style.cssText='max-width:820px;width:94vw;border:0;border-radius:18px;padding:18px;direction:rtl';
 dlg.innerHTML='<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><b style="flex:1">اختر صورة من مكتبة الوسائط</b><button type="button" class="button secondary small" data-mp-close>إغلاق</button></div><input type="search" data-mp-q placeholder="ابحث باسم الملف…" dir="ltr" style="width:100%;margin-bottom:10px"><p data-mp-msg class="cb-help" aria-live="polite"></p><div data-mp-grid style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;max-height:60vh;overflow:auto"></div>';
 document.body.append(dlg);
 dlg.addEventListener('click',e=>{if(e.target.closest('[data-mp-close]'))dlg.close();const b=e.target.closest('[data-mp-p]');if(b)pick(b.dataset.mpP)});
 dlg.querySelector('[data-mp-q]').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(load,250)});return dlg}
const url=p=>site+p.split('/').map(encodeURIComponent).join('/');
async function load(){const g=dlg.querySelector('[data-mp-grid]'),m=dlg.querySelector('[data-mp-msg]');m.textContent='جارٍ التحميل…';
 try{const q=dlg.querySelector('[data-mp-q]').value;const r=await fetch(C.media+'?type=image&per=120&q='+encodeURIComponent(q),{headers:{Accept:'application/json'},credentials:'same-origin'});if(!r.ok)throw Error(r.status);const j=await r.json();site=j.site;
  const ok=j.items.filter(i=>/\.(png|jpe?g|webp)$/i.test(i.r||i.p));
  g.innerHTML=ok.map(i=>'<button type="button" data-mp-p="'+esc(i.r||i.p)+'" title="'+esc(i.p)+'" style="border:1px solid #e2e7d9;border-radius:10px;background:#f7f8f3;padding:4px;cursor:pointer"><img loading="lazy" src="'+esc(url(i.r||i.p))+'" alt="" style="width:100%;height:90px;object-fit:contain"><small dir="ltr" style="display:block;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(i.p.split('/').pop())+'</small></button>').join('');
  m.textContent=ok.length?(j.total>j.items.length?'تظهر أول '+j.items.length+' نتيجة — ضيّق البحث.':''):'لا توجد صور مطابقة (المنشئ يقبل PNG وJPG وWebP).'}catch(e){m.textContent='تعذّر تحميل المكتبة.'}}
async function pick(p){const m=dlg.querySelector('[data-mp-msg]');m.textContent='جارٍ إدراج الصورة…';
 try{const r=await fetch(url(p));if(!r.ok)throw Error(r.status);const b=await r.blob();const name=p.split('/').pop();
  const type=b.type&&/^image\//.test(b.type)?b.type:(/\.png$/i.test(name)?'image/png':/\.webp$/i.test(name)?'image/webp':'image/jpeg');
  const dt=new DataTransfer();dt.items.add(new File([b],name,{type}));target.files=dt.files;target.dispatchEvent(new Event('change',{bubbles:true}));dlg.close()}catch(e){m.textContent='تعذّر جلب الصورة.'}}
function decorate(root){root.querySelectorAll('input[type=file][accept*="image/"]:not([data-mp])').forEach(inp=>{inp.dataset.mp='1';
 const b=document.createElement('button');b.type='button';b.className='button secondary small';b.textContent='من مكتبة الوسائط';b.style.margin='6px 0';
 b.addEventListener('click',()=>{target=inp;ensure().showModal();load()});inp.insertAdjacentElement('afterend',b)})}
new MutationObserver(()=>decorate(document)).observe(document.documentElement,{childList:true,subtree:true});
document.readyState==='loading'?addEventListener('DOMContentLoaded',()=>decorate(document)):decorate(document);
})();
