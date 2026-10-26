// عامل خدمة صفحة الدخول. كل مادة لها عامل خدمة خاص في مجلدها (مثل g8/math/sw.js) بنطاق ذلك المجلد.
// يحذف ذاكرة الموقع القديم (zaytoun-*) الذي كان على الجذر، ولا يلمس ذاكرة المواد.
const V='entry-v35-20261022-legal-revfix1-report1-acc1-pub1-rul1-rul2-perf1-perf2-nw1-nw2-med1-nw3-bk4-bk5b-bk6-pwa1-ux2-ux3',SUB='entrysub-v1',F=["./", "index.html", "login.html", "login.css?v=34", "login.js?v=35", "profiles.js?v=20261027ux3", "sync.js?v=20261026bk5", "shell.js?v=20261022shell1", "shell.css?v=20261022shell1", "assets/img/z-idle.webp", "assets/img/z-read.webp", "assets/img/z-think.webp", "assets/img/z-celebrate.webp", "assets/img/z-welcome-body.webp", "assets/img/z-welcome-hand.webp", "assets/img/av-idle.webp", "assets/img/av-encourage.webp", "assets/img/av-think.webp", "assets/img/av-celebrate.webp", "assets/img/av-read.webp", "welcome.css", "welcome.js?v=20261027ux2", "assets/img/visitor-hero-v1.webp", "entry.css?v=20261026bk2", "entry.js?v=20261027ux2", "app-install.js?v=20261026pwa1", "assets/brand/icon-maskable-192.png", "catalog.js?v=20261026rul2", "manifest.webmanifest", "assets/fonts/baloo-arabic.woff2", "assets/fonts/baloo-latin.woff2", "assets/fonts/cairo-arabic.woff2", "assets/fonts/cairo-latin.woff2", "assets/img/zaytoun-welcome.webp", "assets/img/zaytoun-think.webp", "assets/icon-192.png", "assets/icon-512.png", "assets/brand/favicon.svg", "assets/brand/favicon-32.png", "assets/brand/apple-touch-icon.png", "assets/img/zaytoun-read.webp", "landing.css", "landing.js", "assets/brand/logo-horizontal.webp", "assets/brand/logo-horizontal.png", "assets/brand/logo-mascot.webp", "assets/brand/logo-mascot.png", "assets/brand/logo-mascot-sm.webp", "assets/brand/logo-mascot-sm.png", "assets/brand/icon-maskable-512.png", "assets/landing/shot-g1-math.webp", "assets/landing/shot-g1-arabic.webp", "assets/landing/shot-g1-english.webp", "assets/landing/shot-g8-science.webp", "assets/landing/shot-g6-math.webp", "assets/landing/en-olive.mp3", "assets/landing/en-egg.mp3", "assets/landing/en-bread.mp3", "assets/landing/demo-math-1.mp3", "assets/landing/demo-math-2.mp3", "assets/landing/demo-math-3.mp3", "assets/landing/demo-ar-1.mp3", "assets/landing/demo-ar-2.mp3", "assets/landing/demo-ar-3.mp3", "assets/landing/demo-sc-1.mp3", "assets/landing/demo-sc-2.mp3", "assets/landing/demo-sc-3.mp3", "assets/landing/demo-fr-1.mp3"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('entry-')&&k!==V)||k.startsWith('zaytoun-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// عند تعليق الشبكة نعرض المحفوظ سريعًا، ونبقي تحديثه حيًّا في الخلفيّة.
function networkFirst(e,cacheName,fallback,store){const network=fetch(e.request,/\.(?:js|css)$/.test(new URL(e.request.url).pathname)?{cache:'no-cache'}:undefined).then(async res=>{if(res.ok&&store){try{const c=await caches.open(cacheName);await c.put(e.request,res.clone())}catch(e){}}return res});e.waitUntil(network.catch(()=>{}));
 const cached=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||(fallback?caches.match(fallback):null));
 return new Promise(resolve=>{let done=false;const finish=r=>{if(!done&&r){done=true;clearTimeout(timer);resolve(r)}};
  const timer=setTimeout(()=>cached().then(finish).catch(()=>{}),3500);
  network.then(finish).catch(()=>cached().then(r=>finish(r||Response.error())).catch(()=>finish(Response.error())));
 })}
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 const base=new URL('./',self.registration.scope).pathname,rel=u.pathname.slice(base.length);
 // لوحة الإدارة وواجهة المزامنة خاصة وحيّة: لا تُخزَّن أبدًا
 // أسعار الموقع العامة: الشبكة أولًا دائمًا، والنسخة المحفوظة احتياط عند الانقطاع فقط
 if(rel==='admin-api/api/public/prices'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(async res=>{if(res.ok)try{const c=await caches.open(SUB);await c.put(e.request,res.clone())}catch(e){}return res}).catch(()=>caches.match(e.request).then(r=>r||Response.error())));return}
 if(rel.startsWith('admin-api/'))return;
 // طلبات المواد تمرّ إلى الشبكة أو إلى عامل خدمة المادة؛ نخدم من ذاكرتها عند انقطاع الاتصال
 if(/^g\d+\//.test(rel)){const fallback=e.request.mode==='navigate'?new URL(rel.split('/').slice(0,2).join('/')+'/index.html',self.registration.scope).href:null;e.respondWith(networkFirst(e,SUB,fallback,!/\.mp3$/.test(u.pathname)));return}
 const network=()=>fetch(e.request).then(async res=>{if(res.ok)try{const c=await caches.open(V);await c.put(e.request,res.clone())}catch(e){}return res});
 if(e.request.mode==='navigate'||/\.(?:js|css)$/.test(u.pathname))e.respondWith(networkFirst(e,V,e.request.mode==='navigate'?new URL('index.html',self.registration.scope).href:null,true));
 else e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||network()).catch(()=>Response.error()));
});
// إشعارات التذكير اليومي (Web Push). لا تخزين، فقط العرض وفتح بستان عند الضغط.
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data&&e.data.text()}}
 const base=new URL('./',self.registration.scope).href;
 e.waitUntil(self.registration.showNotification(d.title||'بستان التعلّم',{body:d.body||'درسك اليوم جاهز في بستان 🌱',icon:base+'assets/icon-192.png',badge:base+'assets/brand/favicon-32.png',dir:'rtl',lang:'ar',tag:d.tag||'bustan',renotify:false,data:{url:new URL(d.url||'./',base).href}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||new URL('./',self.registration.scope).href;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(new URL(w.url).origin===location.origin&&'focus' in w){w.navigate&&w.navigate(url).catch(()=>{});return w.focus()}}return clients.openWindow(url)}))});
