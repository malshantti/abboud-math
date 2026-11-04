/* مشغّل ملفات الصوت المحلية؛ غياب الملف أو فشله يعرض رسالة دون توليد صوت بديل.
   السرعة البطيئة بتغيير playbackRate مع الحفاظ على طبقة الصوت، فلا حاجة لملفات إضافية. */
(function(){
const norm=t=>String(t||'').replace(/[\u2018\u2019\u02bc]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
let MAN=null,BASE='audio/';const idx=new Map(),slow=new Map(),SZ=new Map();
function load(m){if(!m)return;MAN=m;BASE=m.base||'audio/';const put=(t,f,v)=>{if(!t||!f)return;const k=norm(t);if(v){idx.set(v.toLowerCase()+'|'+k,f)}if(!idx.has(k))idx.set(k,f)};
 if(Array.isArray(m.items))m.items.forEach(x=>put(x.text||x.en,x.file||x.path||x.src,x.voice||x.speaker||x.gender));
 else{const o=m.files||m.map||m;Object.entries(o).forEach(([t,f])=>{if(typeof f==='string')put(t,f);else if(f&&typeof f==='object'){const ff=f.f||f.file;if(f.z)SZ.set(ff||f.f,f.z);const sl=f.s||(f.slow&&(f.slow.file||f.slow));if(ff&&typeof ff==='string'){put(t,ff,f.voice);if(sl&&typeof sl==='string')slow.set(ff,sl)}else if(f.file)put(t,f.file,f.voice);else Object.entries(f).forEach(([v,ff])=>put(t,ff,v))}})}}
if(window.EN_AUDIO)load(window.EN_AUDIO);
const st={rate:+(localStorage.getItem('en_rate')||1),cur:null,sp:null};
const find=(t,voice)=>{const k=norm(t);return(voice&&idx.get(String(voice).toLowerCase()+'|'+k))||idx.get(k)||idx.get(k.replace(/[.!?]+$/,''))||(/\(/.test(k)?idx.get(norm(String(t).replace(/\s*\(.*?\)/g,''))):null)||null};
function stop(){if(st.cancel)st.cancel();else if(st.cur){try{st.cur.pause()}catch(e){}st.cur=null}document.querySelectorAll('.au.playing').forEach(b=>b.classList.remove('playing'))}
window.EN_AUDIO_STATS={file:0,tts:0,fail:0};
function unavailable(o){EN_AUDIO_STATS.fail++;let note=document.getElementById('audio-status');if(!note){note=document.createElement('p');note.id='audio-status';note.className='muted small-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite')}
 const host=(o.btn&&o.btn.closest('li,.card,.step'))||document.querySelector('#app')||document.body;host.append(note);note.textContent='الصوت غير متاح لهذه العبارة الآن. يمكنك قراءة النص والمتابعة.';return false}
function playFile(src,o,rate){stop();const note=document.getElementById('audio-status');if(note)note.textContent='';const btn=o.btn;if(btn)btn.classList.add('playing');
 return new Promise(res=>{let a,settled=false;const finish=(ok,failed)=>{if(settled)return;settled=true;if(btn)btn.classList.remove('playing');if(st.cur===a){st.cur=null;st.cancel=null}if(a){a.onended=null;a.onerror=null}if(failed)unavailable(o);res(ok)};
  try{a=new Audio(src);a.preservesPitch=true;a.playbackRate=rate;st.cur=a;st.cancel=()=>{try{a.pause()}catch(e){}finish(false,false)};a.onended=()=>finish(true,false);a.onerror=()=>finish(false,true);a.play().then(()=>{if(!settled){EN_AUDIO_STATS.file++;EN_AUDIO_STATS.last=a.src}}).catch(()=>finish(false,true))}catch(e){finish(false,true)}})}
function play(text,o){o=o||{};const f=find(text,o.voice||o.g);if(!f){stop();return Promise.resolve(unavailable(o))}const r=o.rate||st.rate,sf=r<1&&slow.get(f);return playFile(BASE+(sf||f),o,sf?1:r)}
async function playSeq(lines,o){o=o||{};for(const l of lines){if(o.stopped&&o.stopped())break;if(o.each)o.each(l);await play(l.en,{voice:l.voice,g:l.g});await new Promise(r=>setTimeout(r,350))}}
const setRate=r=>{st.rate=r;try{localStorage.setItem('en_rate',r)}catch(e){}};
const has=t=>!!find(t);
const files=texts=>[...new Set(texts.map(t=>find(t)).filter(Boolean).flatMap(f=>slow.has(f)?[f,slow.get(f)]:[f]))].map(f=>BASE+f);
// لا تُولّد مؤثرات بديلة. تسجيل إيقاع بشري معتمد يحتاج قرار مصدر الصوت D03.
function sfx(){return false}
// صوت الشرح العربي (إن وُجدت ملفاته)
const AR=new Map();let ARB='audio-ar/';(function(){const m=window.EN_AUDIO_AR;if(!m)return;ARB=m.base||ARB;Object.entries(m.map||m.files||m).forEach(([t,f])=>{const ff=typeof f==='string'?f:f&&(f.f||f.file);if(ff)AR.set(String(t).replace(/\s+/g,' ').trim(),ff)})})();
const hasAr=t=>AR.has(String(t||'').replace(/\s+/g,' ').trim());
function playAr(t,o){o=o||{};const f=AR.get(String(t).replace(/\s+/g,' ').trim());if(!f){stop();return Promise.resolve(unavailable(o))}return playFile(ARB+f,o,1)}
async function slowThenNormal(t,o){o=o||{};await play(t,Object.assign({},o,{rate:0.75}));await new Promise(r=>setTimeout(r,400));return play(t,Object.assign({},o,{rate:1}))}
const bytes=texts=>[...new Set(texts.map(t=>find(t)).filter(Boolean))].reduce((a,f)=>a+(SZ.get(f)||0),0);
const zt=n=>{const m=window.EN_AUDIO_AR;return m&&m.z&&m.z['z'+n]};
const zay=(n,o)=>{const t=zt(n);if(!t||localStorage.getItem('en_zay')==='0'||!hasAr(t))return Promise.resolve(false);return playAr(t,o)};
window.AU={zt,zay,bytes,hasAr,playAr,slowThenNormal,load,play,playSeq,stop,setRate,rate:()=>st.rate,has,find,files,norm,sfx,manifest:()=>MAN,count:()=>idx.size};
})();
