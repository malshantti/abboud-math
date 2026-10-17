// عامل خدمة صفحة الدخول. كل مادة لها عامل خدمة خاص في مجلدها (مثل g8/math/sw.js) بنطاق ذلك المجلد.
// يحذف ذاكرة الموقع القديم (zaytoun-*) الذي كان على الجذر، ولا يلمس ذاكرة المواد.
const V='entry-v12-20261017-visitor1',SUB='entrysub-v1',F=["./", "index.html", "login.html", "login.css", "login.js", "profiles.js", "assets/img/z-idle.webp", "assets/img/z-read.webp", "assets/img/z-think.webp", "assets/img/z-celebrate.webp", "assets/img/z-welcome-body.webp", "assets/img/z-welcome-hand.webp", "assets/img/av-idle.webp", "assets/img/av-encourage.webp", "assets/img/av-think.webp", "assets/img/av-celebrate.webp", "assets/img/av-read.webp", "welcome.css", "welcome.js", "assets/img/visitor-hero-v1.webp", "entry.css", "entry.js", "catalog.js", "manifest.webmanifest", "assets/fonts/baloo-arabic.woff2", "assets/fonts/baloo-latin.woff2", "assets/fonts/cairo-arabic.woff2", "assets/fonts/cairo-latin.woff2", "assets/img/zaytoun-welcome.webp", "assets/img/zaytoun-think.webp", "assets/icon-192.png", "assets/icon-512.png", "assets/brand/favicon.svg", "assets/brand/favicon-32.png", "assets/brand/apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('entry-')&&k!==V)||k.startsWith('zaytoun-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// عند تعليق الشبكة نعرض المحفوظ سريعًا، ونبقي تحديثه حيًّا في الخلفيّة.
function networkFirst(e,cacheName,fallback,store){const network=fetch(e.request).then(async res=>{if(res.ok&&store){try{const c=await caches.open(cacheName);await c.put(e.request,res.clone())}catch(e){}}return res});e.waitUntil(network.catch(()=>{}));
 const cached=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(fallback?caches.match(fallback):null));
 return new Promise(resolve=>{let done=false;const finish=r=>{if(!done&&r){done=true;clearTimeout(timer);resolve(r)}};
  const timer=setTimeout(()=>cached().then(finish).catch(()=>{}),3500);
  network.then(finish).catch(()=>cached().then(r=>finish(r||Response.error())).catch(()=>finish(Response.error())));
 })}
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 const base=new URL('./',self.registration.scope).pathname,rel=u.pathname.slice(base.length);
 // طلبات المواد تمرّ إلى الشبكة أو إلى عامل خدمة المادة؛ نخدم من ذاكرتها عند انقطاع الاتصال
 if(/^g\d+\//.test(rel)){const fallback=e.request.mode==='navigate'?new URL(rel.split('/').slice(0,2).join('/')+'/index.html',self.registration.scope).href:null;e.respondWith(networkFirst(e,SUB,fallback,!/\.mp3$/.test(u.pathname)));return}
 const network=()=>fetch(e.request).then(async res=>{if(res.ok)try{const c=await caches.open(V);await c.put(e.request,res.clone())}catch(e){}return res});
 if(e.request.mode==='navigate'||/\.(?:js|css)$/.test(u.pathname))e.respondWith(networkFirst(e,V,e.request.mode==='navigate'?new URL('index.html',self.registration.scope).href:null,true));
 else e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||network()).catch(()=>Response.error()));
});
