// نواة الرياضيات عند التثبيت؛ صور الكتاب عند العرض أو من زر التنزيل القابل للاستكمال.
const V='g6math-v5-20261017-batch3-g2-profiles-launch20261021b-sync1-gate1-trial1-f1',PRE='g6math-',F=["../../profiles.js","../../sync.js","favicon.svg","favicon-32.png","apple-touch-icon.png","./","./adventures.css","./app.js","./bookfig.js","./cases.js","./content.js","./content5.js","./data.js","./fonts/OFL.txt","./fonts/baloo-arabic.woff2","./fonts/baloo-latin.woff2","./fonts/cairo-arabic.woff2","./fonts/cairo-latin.woff2","./fx.js","./gen.js","./gen5.js","./hw.js","./icon-192.png","./icon-512.png","./icons.js","./img/cover-b1.webp","./img/cover-b2.webp","./img/cover-b3.webp","./img/cover-b4.webp","./img/cover-basics.webp","./img/cover-scene-explorer.webp","./img/cover-scene-glass.webp","./img/cover-scene-house.webp","./img/cover-scene-market.webp","./img/cover-scene-tower.webp","./img/cover-scene-triangle.webp","./img/cover-scene-village.webp","./img/cover-u1.webp","./img/cover-u2.webp","./img/cover-u3.webp","./img/cover-u4.webp","./img/cover-u5.webp","./img/cover-u6.webp","./img/cover-u7.webp","./img/cover-u8.webp","./img/rank-1.webp","./img/rank-2.webp","./img/rank-3.webp","./img/rank-4.webp","./img/rank-5.webp","./img/rank-6.webp","./img/rank-7.webp","./img/rank-8.webp","./img/zaytoun-celebrate.webp","./img/zaytoun-discovery-v2.webp","./img/zaytoun-encourage.webp","./img/zaytoun-garden-v2.webp","./img/zaytoun-idle.webp","./img/zaytoun-pencil.webp","./img/zaytoun-read.webp","./img/zaytoun-read2.webp","./img/zaytoun-teacher.webp","./img/zaytoun-think.webp","./img/zaytoun-welcome.webp","./index.html","./lab.js","./lab5.js","./laboratory.css","./lesson-visuals.css","./lesson-visuals.js","./manifest.webmanifest","./numerals.js","./style.css","./switch.css","./typography.css","./ui7.css","./units.css","./v4.js","./zaytoun.css","./zaytoun.js","./media.js","./offline.js"];
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
 }else if(/\.(?:js|css)$/.test(p)){
  e.respondWith(cached().then(r=>{const n=network().catch(()=>null);if(r){e.waitUntil(n);return r}return n.then(x=>x||Response.error())}));
 }else e.respondWith(cached().then(r=>r||network()).catch(()=>Response.error()));
});
