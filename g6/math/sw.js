// عامل الخدمة: تخزين كل ملفات الموقع للعمل دون اتصال (مسارات نسبية تعمل تحت أي مجلد فرعي)
const V='g6math-v4-20261016-save1-copy1-m21-m22',F=["../../profiles.js", "favicon.svg", "favicon-32.png", "apple-touch-icon.png", "./", "./adventures.css", "./app.js", "./bookfig.js", "./bookimg/S1-1-1-p4-6.webp", "./bookimg/S1-1-1-p6-5.webp", "./bookimg/S1-1-2-p10-9.webp", "./bookimg/S1-1-2-p11-2.webp", "./bookimg/S1-1-3-p13-2.webp", "./bookimg/S1-1-3-p14-11.webp", "./bookimg/S1-1-4-p17-7.webp", "./bookimg/S1-2-1-p29-2.webp", "./bookimg/S1-2-1-p29-6.webp", "./bookimg/S1-2-2-p36-5.webp", "./bookimg/S1-2-2-p38-2.webp", "./bookimg/S1-2-3-p43-3.webp", "./bookimg/S1-2-3-p44-4.webp", "./bookimg/S1-2-4-p46-4.webp", "./bookimg/S1-2-4-p48-1.webp", "./bookimg/S1-2-5-p51-2.webp", "./bookimg/S1-2-5-p51-4.webp", "./bookimg/S1-2-6-p55-4.webp", "./bookimg/S1-2-6-p56-2.webp", "./bookimg/S1-2-7-p59-4.webp", "./bookimg/S1-2-7-p60-8.webp", "./bookimg/S1-3-1-p69-3.webp", "./bookimg/S1-3-1-p70-7.webp", "./bookimg/S1-3-2-p75-4.webp", "./bookimg/S1-3-2-p76-3.webp", "./bookimg/S1-3-3-p78-2.webp", "./bookimg/S1-3-4-p81-2.webp", "./bookimg/S1-3-4-p81-7.webp", "./bookimg/S1-4-1-p90-1.webp", "./bookimg/S1-4-1-p90-4.webp", "./bookimg/S1-4-2-p92-4.webp", "./bookimg/S1-4-2-p94-2.webp", "./bookimg/S1-4-3-p96-2.webp", "./bookimg/S1-4-4-p100-3.webp", "./bookimg/S2-5-1-p4-8.webp", "./bookimg/S2-5-2-p9-6.webp", "./bookimg/S2-5-2-p9-7.webp", "./bookimg/S2-5-3-p13-7.webp", "./bookimg/S2-5-3-p15-6.webp", "./bookimg/S2-5-4-p17-2.webp", "./bookimg/S2-5-4-p18-14.webp", "./bookimg/S2-6-1-p27-5.webp", "./bookimg/S2-6-1-p28-1.webp", "./bookimg/S2-6-2-p32-10.webp", "./bookimg/S2-6-2-p32-4.webp", "./bookimg/S2-6-3-p37-6.webp", "./bookimg/S2-7-1-p45-3.webp", "./bookimg/S2-7-1-p46-2.webp", "./bookimg/S2-7-2-p48-5.webp", "./bookimg/S2-7-2-p49-3.webp", "./bookimg/S2-7-3-p53-2.webp", "./bookimg/S2-7-3-p53-7.webp", "./bookimg/S2-7-4-p57-5.webp", "./bookimg/S2-7-4-p58-3.webp", "./bookimg/S2-7-5-p60-4.webp", "./bookimg/S2-7-5-p61-4.webp", "./bookimg/S2-7-6-p65-2.webp", "./bookimg/S2-7-6-p65-6.webp", "./bookimg/S2-7-7-p68-2.webp", "./bookimg/S2-7-7-p70-3.webp", "./bookimg/S2-8-1-p79-6.webp", "./bookimg/S2-8-1-p79-7.webp", "./bookimg/S2-8-2-p82-2.webp", "./bookimg/S2-8-3-p86-4.webp", "./bookimg/S2-8-3-p86-8.webp", "./cases.js", "./content.js", "./content5.js", "./data.js", "./fonts/OFL.txt", "./fonts/baloo-arabic.woff2", "./fonts/baloo-latin.woff2", "./fonts/cairo-arabic.woff2", "./fonts/cairo-latin.woff2", "./fx.js", "./gen.js", "./gen5.js", "./hw.js", "./icon-192.png", "./icon-512.png", "./icons.js", "./img/cover-b1.webp", "./img/cover-b2.webp", "./img/cover-b3.webp", "./img/cover-b4.webp", "./img/cover-basics.webp", "./img/cover-scene-explorer.webp", "./img/cover-scene-glass.webp", "./img/cover-scene-house.webp", "./img/cover-scene-market.webp", "./img/cover-scene-tower.webp", "./img/cover-scene-triangle.webp", "./img/cover-scene-village.webp", "./img/cover-u1.webp", "./img/cover-u2.webp", "./img/cover-u3.webp", "./img/cover-u4.webp", "./img/cover-u5.webp", "./img/cover-u6.webp", "./img/cover-u7.webp", "./img/cover-u8.webp", "./img/rank-1.webp", "./img/rank-2.webp", "./img/rank-3.webp", "./img/rank-4.webp", "./img/rank-5.webp", "./img/rank-6.webp", "./img/rank-7.webp", "./img/rank-8.webp", "./img/zaytoun-celebrate.webp", "./img/zaytoun-discovery-v2.webp", "./img/zaytoun-encourage.webp", "./img/zaytoun-garden-v2.webp", "./img/zaytoun-idle.webp", "./img/zaytoun-pencil.webp", "./img/zaytoun-read.webp", "./img/zaytoun-read2.webp", "./img/zaytoun-teacher.webp", "./img/zaytoun-think.webp", "./img/zaytoun-welcome.webp", "./index.html", "./lab.js", "./lab5.js", "./laboratory.css", "./lesson-visuals.css", "./lesson-visuals.js", "./manifest.webmanifest", "./numerals.js", "./style.css", "./switch.css", "./typography.css", "./ui7.css", "./units.css", "./v4.js", "./zaytoun.css", "./zaytoun.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith('g6math-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
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













