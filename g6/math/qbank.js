// بنك الأسئلة من لوحة الإدارة (/admin/manage/questions): أسئلة مفعّلة لكل درس تُمزج مع أسئلة المولّد أو تحل محلها.
// يُحفظ آخر بنك محليًا ليعمل دون اتصال؛ وإن تعذّر الوصول إليه تبقى أسئلة الملفات الأصلية كما هي.
(function(){'use strict';if(!window.GEN||typeof window.genFor!=='function')return;
const KEY='bk_qbank_g6math',base=new URL('../../',location.href),API=new URL('admin-api/api/questions/6/math',base).href;
let B=null;try{B=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
const orig=window.genFor,rnd=n=>Math.floor(Math.random()*n);
const mix=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
function fromBank(id){const L=B&&B.lessons&&B.lessons[id];if(!L||!Array.isArray(L.items)||!L.items.length)return null;
 if(L.mode!=='only'&&Math.random()<.5)return null;const it=L.items[rnd(L.items.length)];
 const ch=mix((it.choices||[]).map(c=>({t:String(c.t),ok:!!c.ok,m:c.m||''})));const ok=ch.find(c=>c.ok);if(!ok||ch.length<2)return null;
 let img='';try{img=it.img?new URL(it.img,base).href:''}catch(e){}
 return {steps:[{q:String(it.q),a:ok.t,choices:ch,hint:it.hint||'',img}],explain:it.explain||'',bank:it.id}}
window.genFor=function(id){try{const b=fromBank(id);if(b)return b}catch(e){}return orig.apply(this,arguments)};
if(!document.getElementById('qbank-css')){const st=document.createElement('style');st.id='qbank-css';st.textContent='.q-img{display:block;max-width:min(100%,420px);max-height:260px;margin:10px auto 0;border-radius:14px;object-fit:contain;background:#fff}';document.head.append(st)}
try{fetch(API,{credentials:'omit',cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.lessons&&typeof j.lessons==='object'){B=j;try{localStorage.setItem(KEY,JSON.stringify(j))}catch(e){}}}).catch(()=>{})}catch(e){}
})();
