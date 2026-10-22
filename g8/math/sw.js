// عامل الخدمة: تخزين كل ملفات الموقع للعمل دون اتصال (مسارات نسبية تعمل تحت أي مجلد فرعي)
const V='g8math-20261017-batch3-g2-profiles-launch20261021-sync1-gate1-trial1-f1-picker1-pv1-students1-onedevice1-logo1-ach1-cb1',F=["favicon.svg", "favicon-32.png", "apple-touch-icon.png", "./", "./bookfig.js", "./bookimg/S1-3-1-p65-1.webp", "./bookimg/S1-3-1-p65-3.webp", "./bookimg/S1-3-2-p70-3.webp", "./bookimg/S1-3-2-p71-8.webp", "./bookimg/S1-3-3-p75-4.webp", "./bookimg/S1-3-4-p79-5.webp", "./bookimg/S1-3-4-p81-1.webp", "./bookimg/S1-3-5-p83-0.webp", "./bookimg/S1-3-5-p83-3.webp", "./bookimg/S1-3-5-p85-1.webp", "./bookimg/S1-4-1-p93-4.webp", "./bookimg/S1-4-1-p94-3.webp", "./bookimg/S2-6-1-p37-3.webp", "./bookimg/S2-6-1-p38-5.webp", "./bookimg/S2-6-2-p42-2.webp", "./bookimg/S2-6-3-p47-5.webp", "./bookimg/S2-6-3-p48-3.webp", "./bookimg/S2-6-4-p50-3.webp", "./bookimg/S2-6-4-p51-2.webp", "./bookimg/S2-6-4-p51-3.webp", "./bookimg/S2-6-5-p56-5.webp", "./bookimg/S2-6-5-p57-3.webp", "./bookimg/S2-7-1-p67-2.webp", "./bookimg/S2-7-2-p71-2.webp", "./bookimg/S2-7-3-p75-1.webp", "./bookimg/S2-7-3-p76-1.webp", "../../profiles.js?v=20261022ach2","../../sync.js?v=20261022ach2","../../shell.js?v=20261022ach2","../../shell.css?v=20261022ach2", "app.js", "cases.js", "content.js", "content5.js", "data.js", "fonts/OFL.txt", "fonts/baloo-arabic.woff2", "fonts/baloo-latin.woff2", "fonts/cairo-arabic.woff2", "fonts/cairo-latin.woff2", "fx.js", "gen.js", "gen5.js", "hw.js", "icon-192.png", "icon-512.png", "icons.js", "img/cover-basics.webp", "img/cover-scene-explorer.webp", "img/cover-scene-glass.webp", "img/cover-scene-house.webp", "img/cover-scene-market.webp", "img/cover-scene-tower.webp", "img/cover-scene-triangle.webp", "img/cover-scene-village.webp", "img/cover-u1.webp", "img/cover-u2.webp", "img/cover-u3.webp", "img/cover-u4.webp", "img/cover-u5.webp", "img/cover-u6.webp", "img/cover-u7.webp", "img/cover-u8.webp", "img/rank-1.webp", "img/rank-2.webp", "img/rank-3.webp", "img/rank-4.webp", "img/rank-5.webp", "img/rank-6.webp", "img/rank-7.webp", "img/rank-8.webp", "img/zaytoun-celebrate.webp", "img/zaytoun-encourage.webp", "img/zaytoun-idle.webp", "img/zaytoun-pencil.webp", "img/zaytoun-read.webp", "img/zaytoun-read2.webp", "img/zaytoun-teacher.webp", "img/zaytoun-think.webp", "img/zaytoun-welcome.webp", "index.html", "lab.js", "lab5.js", "manifest.webmanifest", "style.css", "ui7.css", "v4.js", "zaytoun.js", "numerals.js", "zaytoun.css", "adventures.css", "laboratory.css", "units.css", "typography.css", "lesson-visuals.css", "lesson-visuals.js", "switch.css", "img/zaytoun-garden-v2.webp", "img/zaytoun-discovery-v2.webp"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&(k.startsWith('g8math-')||k.startsWith('zaytoun-'))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const network=()=>fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(V).then(c=>c.put(e.request,copy))}return res});
 // الملفات: المحفوظ أولًا ثم التحديث في الخلفية (سريع على الشبكات الضعيفة). الصفحة: الشبكة مع مهلة قصيرة ثم المحفوظ.
 const cached=()=>caches.match(e.request,{ignoreSearch:true});
 if(e.request.mode==='navigate'){
  e.respondWith(new Promise(res=>{let done=false;const fb=()=>cached().then(r=>r||caches.match('./index.html')).then(r=>{if(!done&&r){done=true;res(r)}});const t=setTimeout(fb,3500);
   network().then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));
 }else if(/\.(?:js|css)$/.test(new URL(e.request.url).pathname)){
  e.respondWith(cached().then(r=>{const n=network().catch(()=>null);if(r){e.waitUntil(n);return r}return n.then(x=>x||Response.error())}));
 }else e.respondWith(cached().then(r=>r||network()).catch(()=>Response.error()));
});













