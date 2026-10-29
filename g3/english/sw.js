// عامل خدمة English للصفّ الثالث: ملفّات المادّة تُحفظ عند التثبيت، والصوت (عند تسجيله) يُحفظ عند أوّل تشغيل. لا نحفظ تقدّم الطفل هنا.
const V='g3en-20261027g3c-fn1-tr1-20261029g457',PRE='g3en-',F=["./", "index.html", "manifest.webmanifest", "../../profiles.js?v=20261029g457", "../../report-log.js?v=20261026rul1", "../../sync.js?v=20261029fm1", "../../shell.js?v=20261029g457", "../../shell.css?v=20261029g457", "../../assets/icon-192.png", "content.js?v=20261027g3c", "english.js?v=20261027g3b", "../shared/core.js?v=20261027g3b", "../shared/g3.js?v=20261027g3b", "../shared/core.css?v=20261027g3b", "../shared/g3.css?v=20261027g3b", "../shared/fonts/cairo-arabic.woff2", "../shared/fonts/cairo-latin.woff2", "../shared/fonts/baloo-arabic.woff2", "../shared/fonts/naskh.woff2", "../shared/img/rank-1.webp", "../shared/img/rank-2.webp", "../shared/img/rank-3.webp", "../shared/img/rank-4.webp", "../shared/img/rank-5.webp", "../shared/img/rank-6.webp", "../shared/img/rank-7.webp", "../shared/img/rank-8.webp", "../shared/img/zaytoun-celebrate.webp", "../shared/img/zaytoun-discovery-v2.webp", "../shared/img/zaytoun-encourage.webp", "../shared/img/zaytoun-read.webp", "../shared/img/zaytoun-teacher.webp", "../shared/img/zaytoun-think.webp", "../shared/img/zaytoun-welcome.webp"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k.startsWith(PRE)&&!k.endsWith('-media')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 const p=new URL(e.request.url).pathname;const media=/\/audio\//.test(p);
 const network=()=>fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(media?PRE+'media':V).then(c=>c.put(e.request,copy))}return res});
 const cached=()=>caches.match(e.request,{ignoreSearch:true});
 if(e.request.mode==='navigate'){
  e.respondWith(new Promise(res=>{let done=false;const fb=()=>cached().then(r=>r||caches.match('./index.html')).then(r=>{if(!done&&r){done=true;res(r)}});const t=setTimeout(fb,3500);
   network().then(r=>{clearTimeout(t);if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);fb().then(()=>{if(!done){done=true;res(Response.error())}})})}));
 }else if(/\.(?:js|css)$/.test(p)){
  e.respondWith(cached().then(r=>{const n=network().catch(()=>null);if(r){e.waitUntil(n);return r}return n.then(x=>x||Response.error())}));
 }else e.respondWith(cached().then(r=>r||network()).catch(()=>Response.error()));
});
