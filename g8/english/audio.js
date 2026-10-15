/* مشغّل الصوت: ملفات صوت طبيعية مولّدة مسبقًا (من manifest.json)، ويعود إلى نطق المتصفح عند غياب الملف.
   السرعة البطيئة بتغيير playbackRate مع الحفاظ على طبقة الصوت، فلا حاجة لملفات إضافية. */
(function(){
const norm=t=>String(t||'').replace(/[\u2018\u2019\u02bc]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
let MAN=null,BASE='audio/';const idx=new Map(),slow=new Map(),SZ=new Map();
function load(m){if(!m)return;MAN=m;BASE=m.base||'audio/';const put=(t,f,v)=>{if(!t||!f)return;const k=norm(t);if(v){idx.set(v.toLowerCase()+'|'+k,f)}if(!idx.has(k))idx.set(k,f)};
 if(Array.isArray(m.items))m.items.forEach(x=>put(x.text||x.en,x.file||x.path||x.src,x.voice||x.speaker||x.gender));
 else{const o=m.files||m.map||m;Object.entries(o).forEach(([t,f])=>{if(typeof f==='string')put(t,f);else if(f&&typeof f==='object'){const ff=f.f||f.file;if(f.z)SZ.set(ff||f.f,f.z);const sl=f.s||(f.slow&&(f.slow.file||f.slow));if(ff&&typeof ff==='string'){put(t,ff,f.voice);if(sl&&typeof sl==='string')slow.set(ff,sl)}else if(f.file)put(t,f.file,f.voice);else Object.entries(f).forEach(([v,ff])=>put(t,ff,v))}})}}
if(window.EN_AUDIO)load(window.EN_AUDIO);
const st={rate:+(localStorage.getItem('en_rate')||1),cur:null,sp:null};
const find=(t,voice)=>{const k=norm(t);return(voice&&idx.get(String(voice).toLowerCase()+'|'+k))||idx.get(k)||idx.get(k.replace(/[.!?]+$/,''))||null};
let voices=[];const pv=()=>{try{voices=speechSynthesis.getVoices()}catch(e){}};if('speechSynthesis' in window){pv();speechSynthesis.onvoiceschanged=pv}
const pickVoice=g=>{const en=voices.filter(v=>/^en[-_](GB|IE|AU|US)/i.test(v.lang));const gb=en.filter(v=>/GB/i.test(v.lang));const pool=gb.length?gb:en;if(!pool.length)return null;const fem=/female|woman|libby|sonia|hazel|susan|serena|kate|emma|amy|zira|samantha|fiona/i,mal=/male|man|ryan|thomas|george|daniel|arthur|oliver|david|mark/i;return pool.find(v=>(g==='m'?mal:fem).test(v.name))||pool[0]};
function stop(){if(st.cur){try{st.cur.pause()}catch(e){}st.cur=null}if('speechSynthesis' in window)try{speechSynthesis.cancel()}catch(e){}document.querySelectorAll('.au.playing').forEach(b=>b.classList.remove('playing'))}
function speakTTS(text,o){return new Promise(res=>{if(!('speechSynthesis' in window)){res(false);return}const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';const v=pickVoice(o.g);if(v)u.voice=v;u.rate=st.rate<1?.72:.95;u.onend=()=>res(true);u.onerror=()=>res(false);speechSynthesis.speak(u);EN_AUDIO_STATS.tts++})}
window.EN_AUDIO_STATS={file:0,tts:0,fail:0};
function play(text,o){o=o||{};stop();const f=find(text,o.voice||o.g);const btn=o.btn;if(btn)btn.classList.add('playing');
 const done=r=>{if(btn)btn.classList.remove('playing');return r};
 if(f){return new Promise(res=>{const r=o.rate||st.rate;const sf=r<1&&slow.get(f);const a=new Audio(BASE+(sf||f));a.preservesPitch=true;a.playbackRate=sf?1:r;st.cur=a;a.onended=()=>res(done(true));a.onerror=()=>{EN_AUDIO_STATS.fail++;speakTTS(text,o).then(r=>res(done(r)))};a.play().then(()=>{EN_AUDIO_STATS.file++;EN_AUDIO_STATS.last=a.src}).catch(()=>{EN_AUDIO_STATS.fail++;speakTTS(text,o).then(r=>res(done(r)))})})}
 return speakTTS(text,o).then(done)}
async function playSeq(lines,o){o=o||{};for(const l of lines){if(o.stopped&&o.stopped())break;if(o.each)o.each(l);await play(l.en,{voice:l.voice,g:l.g});await new Promise(r=>setTimeout(r,350))}}
const setRate=r=>{st.rate=r;try{localStorage.setItem('en_rate',r)}catch(e){}};
const has=t=>!!find(t);
const files=texts=>[...new Set(texts.map(t=>find(t)).filter(Boolean).flatMap(f=>slow.has(f)?[f,slow.get(f)]:[f]))].map(f=>BASE+f);
// مؤثرات بسيطة بلا آلات موسيقية: نقرة خفيفة من ضجيج مُرشَّح (صحيح) ونقرة منخفضة (خطأ)
let ac=null;function sfx(kind){if(localStorage.getItem('en_sfx')==='0')return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const n=ac.sampleRate*.06,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const s=ac.createBufferSource();s.buffer=b;const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=kind==='ok'?2400:500;f.Q.value=kind==='ok'?3:1.5;const g=ac.createGain();g.gain.value=kind==='ok'?.5:.35;s.connect(f).connect(g).connect(ac.destination);s.start();if(kind==='ok'){const s2=ac.createBufferSource();s2.buffer=b;const f2=ac.createBiquadFilter();f2.type='bandpass';f2.frequency.value=3200;f2.Q.value=3;s2.connect(f2).connect(g);s2.start(ac.currentTime+.09)}}catch(e){}}
// صوت الشرح العربي (إن وُجدت ملفاته)
const AR=new Map();let ARB='audio-ar/';(function(){const m=window.EN_AUDIO_AR;if(!m)return;ARB=m.base||ARB;Object.entries(m.map||m.files||m).forEach(([t,f])=>{const ff=typeof f==='string'?f:f&&(f.f||f.file);if(ff)AR.set(String(t).replace(/\s+/g,' ').trim(),ff)})})();
const hasAr=t=>AR.has(String(t||'').replace(/\s+/g,' ').trim());
function playAr(t,o){o=o||{};stop();const f=AR.get(String(t).replace(/\s+/g,' ').trim());if(!f)return Promise.resolve(false);if(o.btn)o.btn.classList.add('playing');return new Promise(res=>{const a=new Audio(ARB+f);st.cur=a;const end=()=>{if(o.btn)o.btn.classList.remove('playing');res(true)};a.onended=end;a.onerror=end;a.play().catch(end)})}
async function slowThenNormal(t,o){o=o||{};await play(t,Object.assign({},o,{rate:0.75}));await new Promise(r=>setTimeout(r,400));return play(t,Object.assign({},o,{rate:1}))}
const bytes=texts=>[...new Set(texts.map(t=>find(t)).filter(Boolean))].reduce((a,f)=>a+(SZ.get(f)||0),0);
const zt=n=>{const m=window.EN_AUDIO_AR;return m&&m.z&&m.z['z'+n]};
const zay=(n,o)=>{const t=zt(n);if(!t||localStorage.getItem('en_zay')==='0'||!hasAr(t))return Promise.resolve(false);return playAr(t,o)};
window.AU={zt,zay,bytes,hasAr,playAr,slowThenNormal,load,play,playSeq,stop,setRate,rate:()=>st.rate,has,find,files,norm,sfx,manifest:()=>MAN,count:()=>idx.size};
})();
