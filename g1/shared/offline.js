/* يُستورد من عامل خدمة كل مادة بنطاق مستقل. */
'use strict';
const PUBLIC=new Set(F.map(file=>new URL(file,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(V).then(cache=>cache.addAll(F.map(file=>new Request(new URL(file,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==V).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;const url=new URL(event.request.url);url.search='';url.hash='';
 if(!PUBLIC.has(url.href))return;
 event.respondWith(caches.open(V).then(async cache=>{const stored=await cache.match(url.href);if(stored)return stored;const response=await fetch(event.request);if(response.ok)await cache.put(url.href,response.clone());return response;}).catch(()=>Response.error()));
});
