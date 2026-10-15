// عامل خدمة صفحة الدخول. كل مادة لها عامل خدمة خاص في مجلدها (مثل g8/math/sw.js) بنطاق ذلك المجلد.
// يحذف ذاكرة الموقع القديم (zaytoun-*) الذي كان على الجذر، ولا يلمس ذاكرة المواد.
const V='entry-v6-20261015',F=['./','index.html','login.html','login.css','login.js','profiles.js','assets/img/z-idle.webp','assets/img/z-read.webp','assets/img/z-think.webp','assets/img/z-celebrate.webp','assets/img/z-welcome-body.webp','assets/img/z-welcome-hand.webp','assets/img/av-idle.webp','assets/img/av-encourage.webp','assets/img/av-think.webp','assets/img/av-celebrate.webp','assets/img/av-read.webp','entry.css','entry.js','catalog.js','manifest.webmanifest','assets/fonts/baloo-arabic.woff2','assets/fonts/baloo-latin.woff2','assets/fonts/cairo-arabic.woff2','assets/fonts/cairo-latin.woff2','assets/img/zaytoun-welcome.webp','assets/img/zaytoun-think.webp','assets/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('entry-')&&k!==V)||k.startsWith('zaytoun-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 const base=new URL('./',self.registration.scope).pathname,rel=u.pathname.slice(base.length);
 // طلبات المواد تمرّ إلى الشبكة أو إلى عامل خدمة المادة؛ نخدم من ذاكرتها عند انقطاع الاتصال
 if(/^g\d+\//.test(rel)){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match(new URL(rel.split('/').slice(0,2).join('/')+'/index.html',self.registration.scope).href):Response.error()))));return}
 const network=()=>fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(e.request,c))}return res});
 if(e.request.mode==='navigate'||/\.(?:js|css)$/.test(u.pathname))e.respondWith(network().catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
 else e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||network()).catch(()=>Response.error()));
});
