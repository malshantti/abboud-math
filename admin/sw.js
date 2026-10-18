/* كاش ملفات المعاينة العامة فقط. لا نخزّن بيانات الطلاب أو طلبات API. */
const VERSION='bustan-admin-demo-v7-math-symbol-spacing';
const FILES=['./','index.html','admin.css','admin.js','demo-data.js','LARAVEL-HANDOFF.md','quiz-builder.js','quiz-builder.css','QUIZ-BUILDER.md','math-editor.js','math-editor.css','MATH-EDITOR.md','../assets/brand/favicon.svg','../assets/img/av-read.webp','../assets/img/av-think.webp','../assets/img/av-encourage.webp','../assets/fonts/baloo-arabic.woff2','../assets/fonts/baloo-latin.woff2','../assets/fonts/cairo-arabic.woff2','../assets/fonts/cairo-latin.woff2'];
const PUBLIC=new Set(FILES.map(file=>new URL(file,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bustan-admin-demo-')&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);url.search='';url.hash='';
  if(!PUBLIC.has(url.href))return;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok&&response.type!=='opaque')event.waitUntil(caches.open(VERSION).then(cache=>cache.put(url.href,response.clone())).catch(()=>{}));return response;}).catch(()=>caches.open(VERSION).then(cache=>cache.match(url.href))));
});
