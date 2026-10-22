// Run: node tests/math-downloads.cjs. Execute the real worker and downloader in isolated network/cache/DOM fixtures.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'g6/math'),read=f=>fs.readFileSync(path.join(dir,f),'utf8');let checks=0;
const scope='https://example.test/abboud-math/g6/math/',tick=()=>new Promise(r=>setImmediate(r));
function clock(){let id=0;const pending=new Map();return{setTimeout(f,ms){pending.set(++id,{f,ms});return id},clearTimeout(id){pending.delete(id)},fire(ms){for(const [id,t]of [...pending])if(t.ms===ms){pending.delete(id);t.f()}}}}
const mediaWindow={};vm.runInNewContext(read('media.js'),{window:mediaWindow});const files=Array.from(mediaWindow.MEDIA),urls=files.map(f=>new URL(f,scope).href);
function fixture(){const handlers={},time=clock(),stores=new Map(),operations=[],adds=[],fail=new Set(),quota=new Set();let active=0,maxActive=0,hang='',missingIndex=false,indexHang=false;
 const key=r=>new URL(typeof r==='string'?r:r.url,scope).href;
 class ScopedRequest extends Request{constructor(url,init){super(new URL(typeof url==='string'?url:url.url,scope),init)}}
 function cache(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return{
  async match(r){if(missingIndex&&name===current&&key(r)===new URL('media.js',scope).href)return undefined;return map.get(key(r))?.clone()},
  async put(r,res){const u=key(r);operations.push({op:'put',name,url:u});if(quota.has(u))throw Object.assign(Error('full'),{name:'QuotaExceededError'});map.set(u,res.clone())},
  async add(req){const u=key(req);adds.push(u);active++;maxActive=Math.max(maxActive,active);try{if(u===hang)await new Promise((_,reject)=>req.signal.addEventListener('abort',()=>reject(Error('aborted'))));if(fail.has(u))throw Error('offline');if(quota.has(u))throw Object.assign(Error('full'),{name:'QuotaExceededError'});map.set(u,new Response('image '+u))}finally{active--}},
  async addAll(requests){for(const r of requests)await this.add(r)}
 }}
 const context={URL,Request:ScopedRequest,Response,AbortController,...time,location:{origin:new URL(scope).origin},self:{registration:{scope},clients:{claim:async()=>operations.push({op:'claim'})},skipWaiting:async()=>operations.push({op:'skip'}),addEventListener:(n,f)=>handlers[n]=f},caches:{open:async n=>cache(n),keys:async()=>[...stores.keys()],delete:async n=>{operations.push({op:'delete',name:n});return stores.delete(n)},match:async r=>{for(const name of stores.keys()){const x=await cache(name).match(r);if(x)return x}}},fetch:async()=>indexHang?new Promise(()=>{}):new Response(read('media.js'))};
 vm.runInNewContext(read('sw.js'),context);const current=vm.runInNewContext(read('sw.js')+'\nV',{...context,self:{...context.self,addEventListener(){}}});
 const core=cache(current);stores.get(current).set(new URL('media.js',scope).href,new Response(read('media.js')));
 async function send(overrides={},source=scope+'index.html'){const out=[],waits=[];handlers.message({data:{type:'cache-media',token:'qa',files,...overrides},source:{url:source,postMessage:m=>out.push(m)},waitUntil:p=>waits.push(p)});assert.equal(waits.length,1);checks++;await Promise.all(waits);return out}
 async function activate(){const waits=[];handlers.activate({waitUntil:p=>waits.push(p)});await Promise.all(waits)}
 return{stores,operations,adds,fail,quota,time,send,activate,cache,current,handlers,maxActive:()=>maxActive,setHang:u=>hang=u,indexMissing:()=>missingIndex=true,indexHangs:()=>indexHang=true};
}
function ui(mode){const time=clock(),nodes=new Map(),clicks=[],messages=new Set(),writes=[],scripts=[];let context,oldToken;
 const get=s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',disabled:false,remove(){}});return nodes.get(s)};
 const worker={scriptURL:scope+'sw.js',postMessage(d){assert.ok(messages.size,'listener precedes fast reply');checks++;if(mode==='post-error')throw Error('disconnected');if(mode==='timeout')return;const emit=(m,source=worker)=>[...messages].forEach(f=>f({data:m,source})),base={type:'cache-media-progress',token:d.token,total:3,saved:3,remaining:0,done:true,error:false};
  emit({...base,token:'wrong',saved:0,remaining:3});emit({...base,saved:0,remaining:3},{});emit({...base,saved:3,remaining:1});if(oldToken)emit({...base,token:oldToken,saved:0,remaining:3});
  if(mode==='partial'){emit({...base,saved:1,remaining:2,done:false});emit({...base,saved:1,remaining:2,error:true})}else emit(base);oldToken=d.token;
 }};const sw={controller:mode==='missing-worker'?null:mode==='wrong-worker'?{...worker,scriptURL:'https://example.test/abboud-math/sw.js'}:worker,addEventListener:(n,f)=>messages.add(f),removeEventListener:(n,f)=>messages.delete(f)};
 const page={insertAdjacentHTML(where,html){assert.match(html,/role="status"/);assert.match(html,/حفظ الدروس/);checks+=2}};
 context={window:{},document:{querySelector:get,addEventListener:(n,f)=>{if(n==='click')clicks.push(f)},createElement:()=>({remove(){}}),head:{append(s){scripts.push(s);if(mode==='index-error')s.onerror();else if(mode!=='index-timeout'){context.window.MEDIA=mode==='empty-index'?[]:['bookimg/1.webp','bookimg/2.webp','bookimg/3.webp'];s.onload()}}}},navigator:{serviceWorker:sw},location:{href:scope+'index.html#/home'},URL,Date,Math,localStorage:{setItem:(...v)=>writes.push(v),removeItem:(...v)=>writes.push(v)},...time};vm.runInNewContext(read('offline.js'),context);
 context.window.MATH_OFFLINE('home',{querySelector:()=>page});const click=()=>clicks.forEach(f=>f({target:{closest:s=>s==='#math-offline-start'?get(s):null}}));
 return{get,click,time,messages,writes,setMode:m=>mode=m};
}
(async()=>{
 const ctx={self:{addEventListener(){}},URL,Request,Response,AbortController};const coreFiles=Array.from(vm.runInNewContext(read('sw.js')+'\nF',ctx));
 assert.ok(files.length>0);assert.equal(new Set(files).size,files.length);assert.equal(coreFiles.some(f=>f.includes('bookimg/')),false);checks+=3;
 const onDisk=fs.readdirSync(path.join(dir,'bookimg')).filter(f=>f.endsWith('.webp')).map(f=>'bookimg/'+f).sort();assert.deepEqual(files.slice().sort(),onDisk);checks++;
 const size=a=>a.reduce((sum,f)=>sum+(fs.statSync(path.resolve(dir,f==='./'?'index.html':f.split('?')[0])).size),0),coreBytes=size(coreFiles),bookBytes=size(files);assert.ok(bookBytes>0);assert.ok(coreBytes<coreBytes+bookBytes);checks+=2;console.log(JSON.stringify({coreFiles:coreFiles.length,bookImages:files.length,coreBytes,bookBytes,combinedBytes:coreBytes+bookBytes}));
 const installation=fixture(),installWaits=[];installation.handlers.install({waitUntil:p=>installWaits.push(p)});await Promise.all(installWaits);assert.equal(installation.adds.length,coreFiles.length);assert.equal(installation.adds.some(u=>u.includes('/bookimg/')),false);assert.ok(installation.operations.some(o=>o.op==='skip'));checks+=3;
 const x=fixture(),n=files.length;x.fail.add(urls[0]);x.fail.add(urls[1]);let out=await x.send(),last=out.at(-1);assert.equal(last.saved,n-2);assert.equal(last.remaining,2);assert.equal(last.error,true);assert.equal(last.done,true);assert.ok(out.every(m=>m.total===n&&m.remaining===n-m.saved));checks+=5;
 x.fail.clear();let before=x.adds.length;out=await x.send();last=out.at(-1);assert.equal(x.adds.length-before,2);assert.equal(last.saved,n);assert.equal(last.remaining,0);assert.equal(last.error,false);checks+=4;
 before=x.adds.length;await x.send();assert.equal(x.adds.length,before);assert.ok(x.maxActive()<=4);checks+=2;
 for(const bad of ['https://evil.test/bookimg/a.webp','../science/bookimg/a.webp','bookimg/not-listed.webp','bookimg/../../profiles.js','bookimg/'+files[0].split('/')[1]+'?x=1']){last=(await x.send({files:[bad,...files.slice(1)]})).at(-1);assert.equal(last.error,true);assert.equal(x.adds.length,before);checks+=2}
 for(const source of ['https://evil.test/','https://example.test/abboud-math/login.html']){assert.equal((await x.send({},source)).at(-1).error,true);checks++}
 assert.equal((await x.send({files:[]})).at(-1).error,true);checks++;
 const q=fixture();q.quota.add(urls[0]);last=(await q.send()).at(-1);assert.equal(last.saved,n-1);assert.equal(last.remaining,1);assert.equal(last.error,true);checks+=3;q.quota.clear();before=q.adds.length;assert.equal((await q.send()).at(-1).saved,n);assert.equal(q.adds.length-before,1);checks+=2;
 const h=fixture();h.setHang(urls[0]);const pending=h.send();await tick();h.time.fire(45000);last=(await pending).at(-1);assert.equal(last.saved,n-1);assert.equal(last.error,true);checks+=2;
 const slow=fixture();slow.indexMissing();slow.indexHangs();const wait=slow.send();await tick();slow.time.fire(45000);assert.equal((await wait).at(-1).error,true);checks++;
 const fallback=fixture();fallback.indexMissing();assert.equal((await fallback.send()).at(-1).saved,n);checks++;
 const migrate=fixture(),old='g6math-prior-version',other='g8math-unrelated';await migrate.cache(old).put(urls[0],new Response('saved image A'));await migrate.cache(old).put(urls[1],new Response('saved image B'));await migrate.cache(other).put(urls[0],new Response('unrelated'));
 await migrate.activate();assert.equal(migrate.stores.has(old),false);assert.equal(migrate.stores.has(other),true);assert.equal(await(await migrate.cache('g6math-media').match(urls[0])).text(),'saved image A');assert.equal(await(await migrate.cache('g6math-media').match(urls[1])).text(),'saved image B');const del=migrate.operations.findIndex(o=>o.op==='delete'&&o.name===old),copied=migrate.operations.map((o,i)=>({...o,i})).filter(o=>o.op==='put'&&o.name==='g6math-media');assert.ok(copied.every(o=>o.i<del));checks+=5;
 const full=fixture();await full.cache(old).put(urls[0],new Response('keep on quota'));full.quota.add(urls[0]);await full.activate();assert.equal(full.stores.has(old),true);assert.equal(await(await full.cache(old).match(urls[0])).text(),'keep on quota');assert.ok(full.operations.some(o=>o.op==='claim'));checks+=3;
 const noIndex=fixture();await noIndex.cache(old).put(urls[0],new Response('retained'));noIndex.indexMissing();await noIndex.activate();assert.equal(noIndex.stores.has(old),true);checks++;
 for(const mode of ['success','partial','index-error','empty-index','post-error','missing-worker','wrong-worker','index-timeout','timeout']){const c=ui(mode);c.click();if(mode==='index-timeout')c.time.fire(20000);if(mode==='timeout')c.time.fire(65000);assert.equal(c.get('#math-offline-start').disabled,false);assert.equal(c.messages.size,0);assert.ok(c.writes.every(w=>w[0]==='g6math_offline_done'));checks+=3;if(mode==='success'){assert.match(c.get('#math-offline-status').textContent,/اكتمل حفظ الدروس/);checks++}if(mode==='partial'){assert.match(c.get('#math-offline-status').textContent,/حُفظ ١ من ٣ صفحة؛ المتبقي ٢/);assert.match(c.get('#math-offline-start').textContent,/استكمال/);c.setMode('success');c.click();assert.match(c.get('#math-offline-status').textContent,/اكتمل حفظ الدروس/);checks+=3}}
 console.log('Passed '+checks+' math core/media, download, migration and offline UI checks.');
})().catch(e=>{console.error(e);process.exitCode=1});
