// عامل الخدمة: تخزين كل ملفات الموقع للعمل دون اتصال (مسارات نسبية تعمل تحت أي مجلد فرعي)
const V='g8math-v10b-20261015',F=['./',"app.js","cases.js","content.js","content5.js","data.js","fonts/OFL.txt","fonts/baloo-arabic.woff2","fonts/baloo-latin.woff2","fonts/cairo-arabic.woff2","fonts/cairo-latin.woff2","fx.js","gen.js","gen5.js","hw.js","icon-192.png","icon-512.png","icons.js","img/cover-basics.webp","img/cover-scene-explorer.webp","img/cover-scene-glass.webp","img/cover-scene-house.webp","img/cover-scene-market.webp","img/cover-scene-tower.webp","img/cover-scene-triangle.webp","img/cover-scene-village.webp","img/cover-u1.webp","img/cover-u2.webp","img/cover-u3.webp","img/cover-u4.webp","img/cover-u5.webp","img/cover-u6.webp","img/cover-u7.webp","img/cover-u8.webp","img/rank-1.webp","img/rank-2.webp","img/rank-3.webp","img/rank-4.webp","img/rank-5.webp","img/rank-6.webp","img/rank-7.webp","img/rank-8.webp","img/zaytoun-celebrate.webp","img/zaytoun-encourage.webp","img/zaytoun-idle.webp","img/zaytoun-pencil.webp","img/zaytoun-read.webp","img/zaytoun-read2.webp","img/zaytoun-teacher.webp","img/zaytoun-think.webp","img/zaytoun-welcome.webp","index.html","lab.js","lab5.js","manifest.webmanifest","style.css","ui7.css","v4.js","zaytoun.js","numerals.js","zaytoun.css","adventures.css","laboratory.css","units.css","typography.css","lesson-visuals.css","lesson-visuals.js","switch.css","img/zaytoun-garden-v2.webp","img/zaytoun-discovery-v2.webp"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&(k.startsWith('g8math-')||k.startsWith('zaytoun-'))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const network=()=>fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(V).then(c=>c.put(e.request,copy))}return res});
 // Fresh application code online; the full cached site remains available offline.
 if(e.request.mode==='navigate'||/\.(?:js|css)$/.test(new URL(e.request.url).pathname)){
  e.respondWith(network().catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
 }else e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||network()).catch(()=>Response.error()));
});













