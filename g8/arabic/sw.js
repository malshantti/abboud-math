// عامل الخدمة: الملفّات الأساسيّة تُحفظ عند التّثبيت، وصفحات الكتاب والصّوت تُحفظ عند أوّل عرض (أو دفعة واحدة من زرّ «حفظ للعمل دون اتّصال»).
const V='g8ar-20261016-design2-brand1-glossary1',PRE='g8ar-',F=["favicon.svg","favicon-32.png","apple-touch-icon.png","../../profiles.js", "./", "ar-banks.js", "ar.js", "audio-ar.js", "content.js", "core.css", "core.js", "explore.js", "explore.css", "fonts/OFL.txt", "fonts/baloo-arabic.woff2", "fonts/cairo-arabic.woff2", "fonts/cairo-latin.woff2", "fonts/naskh.woff2", "icon-192.png", "icon-512.png", "img/zaytoun-celebrate.webp", "img/zaytoun-discovery-v2.webp", "img/zaytoun-encourage.webp", "img/zaytoun-read.webp", "img/zaytoun-teacher.webp", "img/zaytoun-think.webp", "img/zaytoun-welcome.webp", "index.html", "manifest.webmanifest", "media.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith(PRE)&&!k.endsWith('-media')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data&&e.data.cacheAll){caches.open(PRE+'media').then(c=>Promise.all(e.data.cacheAll.map(u=>c.match(u).then(r=>r||c.add(u).catch(()=>0))))).then(()=>e.source&&e.source.postMessage({cached:1}))}});
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
