/* يُستورد من عامل خدمة كل مادة بنطاق مستقل.
   المفتاح في الذاكرة هو الرابط دون ?v، فيطابق الطلب أيًّا كان رقم إصداره (profiles.js يمرّر رقمه إلى sync.js وshell.js).
   يُجلب كل ملف عند التثبيت برابطه الكامل (مع ?v) لتجاوز ذاكرة Cloudflare، ثم يُحفظ تحت المفتاح المجرّد. */
'use strict';
const KEY=file=>{const u=new URL(file,self.registration.scope);u.search='';u.hash='';return u.href};
const PUBLIC=new Set(F.map(KEY));
self.addEventListener('install',event=>event.waitUntil(caches.open(V).then(cache=>Promise.all(F.map(async file=>{const res=await fetch(new Request(new URL(file,self.registration.scope),{cache:'reload'}));if(!res.ok)throw Error('install '+file);await cache.put(KEY(file),res)}))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==V).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const key=KEY(event.request.url);
 if(!PUBLIC.has(key))return;
 event.respondWith(caches.open(V).then(async cache=>{const stored=await cache.match(key);if(stored)return stored;const response=await fetch(event.request);if(response.ok)await cache.put(key,response.clone());return response;}).catch(()=>fetch(event.request)));
});
