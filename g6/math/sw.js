// نواة الرياضيات عند التثبيت؛ صور الكتاب عند العرض أو من زر التنزيل القابل للاستكمال.
const V='g6math-v5-20261017-batch3-g2-profiles-launch20261021b-sync1-gate1-trial1-f1-picker1-pv1-students1-onedevice1-logo1-next1-ach1-cb1-offline34-s111v35-flow36-narr37-fresh38-s112v39-shell1-u1v40-u2v41-u3v42-pf2-path1-rev43-report1-acc1-pub1-rul1-rul2-perf1-perf2-nw1-nw2-med1-qb1-nw3-bk5-bk6-ux1-ux2-ux3-ux4-g3a-fn1-tr1-20261029g457-20261029ar1-20261029en1-20261029en1-20261029sc1-20261029ar2-20261029sc2-20261029ar3-20261029en3-20261029ma3-20261029en4-20261029en5-20261029en6-20261029ar4-20261029ma4-20261029sc4-20261029sc5-20261029hp1-20261029hp1-20261029hp2-20261029ex1-20261029p2a-20261029m7p2-20261029m4p2-20261029m5p2-20261029s4p2-20261029a4p2-20261029a5p2-20261029a7p2-20261029mrev-20261029arev-20261029mrev2-20261029arev2',PRE='g6math-',F=["review.js?v=43","./qbank.js?v=1","../../profiles.js?v=20261029g457ar","../../report-log.js?v=20261026rul1","../../sync.js?v=20261029fm1","../../shell.js?v=20261029g457","../../shell.css?v=20261029g457","favicon.svg","favicon-32.png","apple-touch-icon.png","./","./adventures.css?v=42","./app.js?v=44ux1","./narration.js?v=42","./narration-player.js?v=42","./bookfig.js?v=42","./cases.js?v=42","./content.js?v=42","./content5.js?v=42","./data.js?v=42","./fonts/OFL.txt","./fonts/baloo-arabic.woff2","./fonts/baloo-latin.woff2","./fonts/cairo-arabic.woff2","./fonts/cairo-latin.woff2","./fx.js?v=42","./gen.js?v=42","./gen5.js?v=42","./hw.js?v=42","./icon-192.png","./icon-512.png","./icons.js?v=42","./img/cover-b1.webp","./img/cover-b2.webp","./img/cover-b3.webp","./img/cover-b4.webp","./img/cover-basics.webp","./img/cover-scene-explorer.webp","./img/cover-scene-glass.webp","./img/cover-scene-house.webp","./img/cover-scene-market.webp","./img/cover-scene-tower.webp","./img/cover-scene-triangle.webp","./img/cover-scene-village.webp","./img/cover-u1.webp","./img/cover-u2.webp","./img/cover-u3.webp","./img/cover-u4.webp","./img/cover-u5.webp","./img/cover-u6.webp","./img/cover-u7.webp","./img/cover-u8.webp","./img/rank-1.webp","./img/rank-2.webp","./img/rank-3.webp","./img/rank-4.webp","./img/rank-5.webp","./img/rank-6.webp","./img/rank-7.webp","./img/rank-8.webp","./img/zaytoun-celebrate.webp","./img/zaytoun-discovery-v2.webp","./img/zaytoun-encourage.webp","./img/zaytoun-garden-v2.webp","./img/zaytoun-idle.webp","./img/zaytoun-pencil.webp","./img/zaytoun-read.webp","./img/zaytoun-read2.webp","./img/zaytoun-teacher.webp","./img/zaytoun-think.webp","./img/zaytoun-welcome.webp","./index.html","./lab.js?v=42","./lab5.js?v=42","./laboratory.css?v=42","./lesson-visuals.css?v=42","./lesson-visuals.js?v=42","./manifest.webmanifest","./numerals.js?v=42","./style.css?v=42","./switch.css?v=42","./typography.css?v=42","./ui7.css?v=42","./units.css?v=42p1","./v4.js?v=42","./zaytoun.css?v=42","./zaytoun.js?v=42p1ux1","./media.js","./offline.js?v=42"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
// ننقل الصور المحفوظة بالإصدار السابق قبل تنظيف كاشه؛ فشل النسخ يبقي الأصل.
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
 const core=await caches.open(V),index=await core.match(new URL('media.js',self.registration.scope).href);
 if(!index){await self.clients.claim();return}
 const match=(await index.text()).match(/^\s*window\.MEDIA\s*=\s*(\[[\s\S]*\]);?\s*$/);
 if(!match){await self.clients.claim();return}
 const files=JSON.parse(match[1]),media=await caches.open(PRE+'media');
 for(const key of await caches.keys()){
  if(key===V||key===PRE+'media'||!key.startsWith(PRE))continue;
  const previous=await caches.open(key);let copied=true;
  for(const file of files){const url=new URL(file,self.registration.scope).href;try{if(!await media.match(url)){const response=await previous.match(url);if(response)await media.put(url,response)}}catch(e){copied=false}}
  if(copied)await caches.delete(key);
 }
 await self.clients.claim();
})())});
// لا نقبل إلا فهرس هذه المادة، ونبقي المهمة حيّة حتى تنتهي رسالتها الأخيرة.
self.addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='cache-media'||typeof d.token!=='string'||!d.token||d.token.length>100||!e.source)return;
 e.waitUntil((async()=>{let total=0,saved=0;const tell=(done,error)=>{try{e.source.postMessage({type:'cache-media-progress',token:d.token,total,saved,remaining:total-saved,done,error:!!error})}catch(e){}};
  try{const base=new URL('./',self.registration.scope),client=new URL(e.source.url);if(client.origin!==base.origin||!client.pathname.startsWith(base.pathname))throw Error('client');
   const indexURL=new URL('media.js',base).href,core=await caches.open(V),index=await core.match(indexURL);let text;
   if(index)text=await index.text();else{const abort=new AbortController();let timer;try{text=await Promise.race([fetch(indexURL,{cache:'reload',signal:abort.signal}).then(r=>{if(!r.ok)throw Error('index');return r.text()}),new Promise((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('index timeout'))},45000)})])}finally{clearTimeout(timer)}}
   const match=text.match(/^\s*window\.MEDIA\s*=\s*(\[[\s\S]*\]);?\s*$/);if(!match)throw Error('index');
   const files=JSON.parse(match[1]);if(!Array.isArray(files)||!files.length)throw Error('index');
   const urlOf=u=>{if(typeof u!=='string')throw Error('path');const x=new URL(u,base);if(x.origin!==base.origin||!x.pathname.startsWith(base.pathname)||!/^\/(?:bookimg)\//.test(x.pathname.slice(base.pathname.length-1))||x.search||x.hash)throw Error('path');return x.href};
   const allowed=new Set(files.map(urlOf));if(!Array.isArray(d.files))throw Error('files');const requested=[...new Set(d.files.map(urlOf))];if(requested.length!==allowed.size||requested.some(u=>!allowed.has(u)))throw Error('files');
   total=requested.length;const c=await caches.open(PRE+'media');tell(false);let next=0;
   async function download(){while(next<total){const url=requested[next++];try{if(!await c.match(url)){const abort=new AbortController();let timer;try{await Promise.race([c.add(new Request(url,{cache:'reload',signal:abort.signal})),new Promise((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('timeout'))},45000)})])}finally{clearTimeout(timer)}}saved++}catch(e){}tell(false)}}
   await Promise.all(Array.from({length:Math.min(4,total)},download));tell(true,saved!==total);
  }catch(e){tell(true,true)}
 })())});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const p=new URL(e.request.url).pathname;const media=/\/(bookimg)\//.test(p);
 const network=()=>fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();e.waitUntil(caches.open(media?PRE+'media':V).then(c=>c.put(e.request,copy)).catch(()=>{}))}return res});
 const cached=async()=>{const core=await caches.open(V);return await core.match(e.request,{ignoreSearch:true})||await caches.match(e.request,{ignoreSearch:true})};
 if(e.request.mode==='navigate'){
  e.respondWith(new Promise(res=>{let done=false;const fb=()=>cached().then(r=>r||caches.match('./index.html')).then(r=>{if(!done&&r){done=true;res(r)}});const t=setTimeout(fb,3500);
   network().then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));
 }else if(/\.(?:js|css)$/.test(new URL(e.request.url).pathname)){
  // ملف بإصدار (?v=): المطابقة التامة فقط، فلا يُقدَّم إصدار قديم؛ دون إصدار: الشبكة أولًا. المحفوظ بلا إصدار احتياط عند انقطاع الشبكة فقط.
  const exact=()=>caches.match(e.request);const loose=()=>caches.match(e.request,{ignoreSearch:true});
  e.respondWith((new URL(e.request.url).search?exact().then(r=>r||network()):network()).catch(()=>loose()).then(r=>r||loose()).then(r=>r||Response.error()));
 }else e.respondWith(cached().then(r=>r||network()).catch(()=>Response.error()));
});
