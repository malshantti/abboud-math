// عامل الخدمة: الملفّات الأساسيّة تُحفظ عند التّثبيت، وصفحات الكتاب والصّوت تُحفظ عند أوّل عرض (أو دفعة واحدة من زرّ «حفظ للعمل دون اتّصال»).
const V='g8ar-20261017-batch3-ar1-g2-profiles-launch20261021-sync1-gate1-trial1-f1-picker1-students1-onedevice1-logo1-ach1-cb1-shell1-pf2-fix1-fix2-report1-acc1-pub1-rul1-rul2-perf1-perf2-nw1-nw2-med1-nw3-bk5-bk6-ux2-ux3-ux4-g3a-fn1-tr1-20261029g457-20261029ar1-20261029en1-20261029en1-20261029sc1-20261029ar2-20261029sc2-20261029ar3-20261029en3-20261029ma3-20261029en4-20261029en5-20261029en6-20261029ar4-20261029ma4-20261029sc4-20261029sc5-20261029hp1-20261029hp1-20261029hp2-20261029ex1-20261029p2a-20261029m7p2-20261029m4p2-20261029m5p2-20261029s4p2-20261029a4p2-20261029a5p2-20261029a7p2-20261029mrev',PRE='g8ar-',F=["favicon.svg", "favicon-32.png", "apple-touch-icon.png", "../../profiles.js?v=20261029g457ar","../../report-log.js?v=20261026rul1","../../sync.js?v=20261029fm1","../../shell.js?v=20261029g457","../../shell.css?v=20261029g457","../math/img/rank-1.webp","../math/img/rank-2.webp","../math/img/rank-3.webp","../math/img/rank-4.webp","../math/img/rank-5.webp","../math/img/rank-6.webp","../math/img/rank-7.webp","../math/img/rank-8.webp", "./", "ar-banks.js?v=20261026rul2", "ar.js?v=20261026rul2", "audio-ar.js?v=20261026rul2", "content.js?v=20261026rul2", "core.css?v=20261026rul2", "core.js?v=20261027ux2", "explore.js?v=20261026rul2", "explore.css?v=20261026rul2", "fonts/OFL.txt", "fonts/baloo-arabic.woff2", "fonts/cairo-arabic.woff2", "fonts/cairo-latin.woff2", "fonts/naskh.woff2", "icon-192.png", "icon-512.png", "img/zaytoun-celebrate.webp", "img/zaytoun-discovery-v2.webp", "img/zaytoun-encourage.webp", "img/zaytoun-read.webp", "img/zaytoun-teacher.webp", "img/zaytoun-think.webp", "img/zaytoun-welcome.webp", "index.html", "manifest.webmanifest", "media.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith(PRE)&&!k.endsWith('-media')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// لا نقبل إلا فهرس هذه المادة، ونبقي المهمة حيّة حتى تنتهي رسالتها الأخيرة.
self.addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='cache-media'||typeof d.token!=='string'||!d.token||d.token.length>100||!e.source)return;
 e.waitUntil((async()=>{let total=0,saved=0;const tell=(done,error)=>{try{e.source.postMessage({type:'cache-media-progress',token:d.token,total,saved,remaining:total-saved,done,error:!!error})}catch(e){}};
  try{const base=new URL('./',self.registration.scope),client=new URL(e.source.url);if(client.origin!==base.origin||!client.pathname.startsWith(base.pathname))throw Error('client');
   const indexURL=new URL('media.js',base).href,core=await caches.open(V),index=await core.match(indexURL);let text;
   if(index)text=await index.text();else{const abort=new AbortController();let timer;try{text=await Promise.race([fetch(indexURL,{cache:'reload',signal:abort.signal}).then(r=>{if(!r.ok)throw Error('index');return r.text()}),new Promise((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('index timeout'))},45000)})])}finally{clearTimeout(timer)}}
   const match=text.match(/^\s*window\.MEDIA\s*=\s*(\[[\s\S]*\]);?\s*$/);if(!match)throw Error('index');
   const files=JSON.parse(match[1]);if(!Array.isArray(files)||!files.length)throw Error('index');
   const urlOf=u=>{if(typeof u!=='string')throw Error('path');const x=new URL(u,base);if(x.origin!==base.origin||!x.pathname.startsWith(base.pathname)||!/^\/(?:bookimg|audio)\//.test(x.pathname.slice(base.pathname.length-1))||x.search||x.hash)throw Error('path');return x.href};
   const allowed=new Set(files.map(urlOf));if(!Array.isArray(d.files))throw Error('files');const requested=[...new Set(d.files.map(urlOf))];if(requested.length!==allowed.size||requested.some(u=>!allowed.has(u)))throw Error('files');
   total=requested.length;const c=await caches.open(PRE+'media');tell(false);let next=0;
   async function download(){while(next<total){const url=requested[next++];try{if(!await c.match(url)){const abort=new AbortController();let timer;try{await Promise.race([c.add(new Request(url,{cache:'reload',signal:abort.signal})),new Promise((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('timeout'))},45000)})])}finally{clearTimeout(timer)}}saved++}catch(e){}tell(false)}}
   await Promise.all(Array.from({length:Math.min(4,total)},download));tell(true,saved!==total);
  }catch(e){tell(true,true)}
 })())});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const p=new URL(e.request.url).pathname;const media=/\/(bookimg|audio)\//.test(p);
 const network=()=>fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(media?PRE+'media':V).then(c=>c.put(e.request,copy))}return res});
 const cached=()=>caches.match(e.request,{ignoreSearch:true});
 if(e.request.mode==='navigate'){
  e.respondWith(new Promise(res=>{let done=false;const fb=()=>cached().then(r=>r||caches.match('./index.html')).then(r=>{if(!done&&r){done=true;res(r)}});const t=setTimeout(fb,3500);
   network().then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));
 }else if(/\.(?:js|css)$/.test(p)){
  e.respondWith(cached().then(r=>{const n=network().catch(()=>null);if(r){e.waitUntil(n);return r}return n.then(x=>x||Response.error())}));
 }else e.respondWith(cached().then(r=>r||network()).catch(()=>Response.error()));
});
