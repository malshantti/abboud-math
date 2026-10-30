// عامل الخدمة: تخزين كل ملفات الموقع للعمل دون اتصال (مسارات نسبية تعمل تحت أي مجلد فرعي)
const V='g8math-20261017-batch3-g2-profiles-launch20261021-sync1-gate1-trial1-f1-picker1-pv1-students1-onedevice1-logo1-ach1-cb1-flow36-narr37-fresh38-s112v39-shell1-pf2-path1-rev40-report1-acc1-pub1-rul1-rul2-perf1-perf2-nw1-nw2-med1-nw3-bk5-bk6-ux1-ux2-ux3-ux4-g3a-fn1-tr1-20261029g457-20261029ar1-20261029en1-20261029en1-20261029sc1-20261029ar2-20261029sc2-20261029ar3-20261029en3-20261029ma3-20261029en4-20261029en5-20261029en6-20261029ar4-20261029ma4-20261029sc4-20261029sc5-20261029hp1-20261029hp1-20261029hp2-20261029ex1-20261029p2a-20261029m7p2-20261029m4p2-20261029m5p2-20261029s4p2-20261029a4p2-20261029a5p2-20261029a7p2-20261029mrev-20261029arev-20261029mrev2-20261029arev2-20261029arev3-20261029ab1-20261029ab2-20261029ab3-20261029lab4-20261029lab5-20261029lab7-20261029sim4-20261029sim4-20261029sim5-20261029sim5-20261029sim7-20261029sim7-20261030gst1-20261030gst2-20261030gst2b',F=["favicon.svg", "review.js?v=40", "favicon-32.png", "apple-touch-icon.png", "./", "./bookfig.js?v=39", "./bookimg/S1-3-1-p65-1.webp", "./bookimg/S1-3-1-p65-3.webp", "./bookimg/S1-3-2-p70-3.webp", "./bookimg/S1-3-2-p71-8.webp", "./bookimg/S1-3-3-p75-4.webp", "./bookimg/S1-3-4-p79-5.webp", "./bookimg/S1-3-4-p81-1.webp", "./bookimg/S1-3-5-p83-0.webp", "./bookimg/S1-3-5-p83-3.webp", "./bookimg/S1-3-5-p85-1.webp", "./bookimg/S1-4-1-p93-4.webp", "./bookimg/S1-4-1-p94-3.webp", "./bookimg/S2-6-1-p37-3.webp", "./bookimg/S2-6-1-p38-5.webp", "./bookimg/S2-6-2-p42-2.webp", "./bookimg/S2-6-3-p47-5.webp", "./bookimg/S2-6-3-p48-3.webp", "./bookimg/S2-6-4-p50-3.webp", "./bookimg/S2-6-4-p51-2.webp", "./bookimg/S2-6-4-p51-3.webp", "./bookimg/S2-6-5-p56-5.webp", "./bookimg/S2-6-5-p57-3.webp", "./bookimg/S2-7-1-p67-2.webp", "./bookimg/S2-7-2-p71-2.webp", "./bookimg/S2-7-3-p75-1.webp", "./bookimg/S2-7-3-p76-1.webp", "../../profiles.js?v=20261030gst2b","../../report-log.js?v=20261026rul1","../../sync.js?v=20261030gst2b","../../shell.js?v=20261029g457","../../shell.css?v=20261029g457", "app.js?v=40ux1","narration.js?v=39","narration-player.js?v=39", "cases.js?v=39", "content.js?v=39", "content5.js?v=39", "data.js?v=39", "fonts/OFL.txt", "fonts/baloo-arabic.woff2", "fonts/baloo-latin.woff2", "fonts/cairo-arabic.woff2", "fonts/cairo-latin.woff2", "fx.js?v=39", "gen.js?v=39", "gen5.js?v=39", "hw.js?v=39", "icon-192.png", "icon-512.png", "icons.js?v=39", "img/cover-basics.webp", "img/cover-scene-explorer.webp", "img/cover-scene-glass.webp", "img/cover-scene-house.webp", "img/cover-scene-market.webp", "img/cover-scene-tower.webp", "img/cover-scene-triangle.webp", "img/cover-scene-village.webp", "img/cover-u1.webp", "img/cover-u2.webp", "img/cover-u3.webp", "img/cover-u4.webp", "img/cover-u5.webp", "img/cover-u6.webp", "img/cover-u7.webp", "img/cover-u8.webp", "img/rank-1.webp", "img/rank-2.webp", "img/rank-3.webp", "img/rank-4.webp", "img/rank-5.webp", "img/rank-6.webp", "img/rank-7.webp", "img/rank-8.webp", "img/zaytoun-celebrate.webp", "img/zaytoun-encourage.webp", "img/zaytoun-idle.webp", "img/zaytoun-pencil.webp", "img/zaytoun-read.webp", "img/zaytoun-read2.webp", "img/zaytoun-teacher.webp", "img/zaytoun-think.webp", "img/zaytoun-welcome.webp", "index.html", "lab.js?v=39", "lab5.js?v=39", "manifest.webmanifest", "style.css?v=39", "ui7.css?v=39", "v4.js?v=39", "zaytoun.js?v=39p1ux1", "numerals.js?v=39", "zaytoun.css?v=39", "adventures.css?v=39", "laboratory.css?v=39", "units.css?v=39p1", "typography.css?v=39", "lesson-visuals.css?v=39", "lesson-visuals.js?v=39", "switch.css?v=39", "img/zaytoun-garden-v2.webp", "img/zaytoun-discovery-v2.webp"];
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
  // ملف بإصدار (?v=): المطابقة التامة فقط، فلا يُقدَّم إصدار قديم؛ دون إصدار: الشبكة أولًا. المحفوظ بلا إصدار احتياط عند انقطاع الشبكة فقط.
  const exact=()=>caches.match(e.request);const loose=()=>caches.match(e.request,{ignoreSearch:true});
  e.respondWith((new URL(e.request.url).search?exact().then(r=>r||network()):network()).catch(()=>loose()).then(r=>r||loose()).then(r=>r||Response.error()));
 }else e.respondWith(cached().then(r=>r||network()).catch(()=>Response.error()));
});













