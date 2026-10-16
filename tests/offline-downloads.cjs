// Run: node tests/offline-downloads.cjs. Real workers and core handlers, isolated cache/network/DOM.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');let checks=0;
const tick=()=>new Promise(r=>setImmediate(r));
function timers(){let seq=0;const pending=new Map();return{setTimeout(f,ms){pending.set(++seq,{f,ms});return seq},clearTimeout(id){pending.delete(id)},fire(ms){for(const [id,t]of [...pending])if(t.ms===ms){pending.delete(id);t.f()}},pending}}
function workerFixture(folder){const scope='https://example.test/abboud-math/'+folder+'/',base=new URL(scope),handlers={},clock=timers(),index={text:async()=>read(folder+'/media.js')};
 const w={};vm.runInNewContext(read(folder+'/media.js'),{window:w});const files=w.MEDIA,absolute=files.map(f=>new URL(f,scope).href),saved=new Map(),fail=new Set(),adds=[];let active=0,maxActive=0,hang='',hasIndex=true;
 const media={match:async u=>saved.get(String(u)),async add(req){const u=req.url;adds.push(u);active++;maxActive=Math.max(maxActive,active);try{if(u===hang)return await new Promise((_,reject)=>req.signal.addEventListener('abort',()=>reject(Error('aborted'))));if(fail.has(u))throw Error('offline');await Promise.resolve();saved.set(u,{ok:true})}finally{active--}}};
 const ctx={URL,Request,Response,AbortController,...clock,self:{registration:{scope},addEventListener:(n,f)=>handlers[n]=f},location:{origin:base.origin},caches:{open:async name=>name.endsWith('-media')?media:{match:async()=>hasIndex?index:null}},fetch:async()=>{throw Error('unexpected fetch')}};
 vm.runInNewContext(read(folder+'/sw.js'),ctx);
 async function send(overrides={},url=scope+'index.html'){const messages=[],waits=[],data={type:'cache-media',token:'test-'+Math.random(),files,...overrides};handlers.message({data,source:{url,postMessage:m=>messages.push(m)},waitUntil:p=>waits.push(p)});assert.equal(waits.length,1);checks++;await Promise.all(waits);return messages}
 return{files,absolute,fail,adds,saved,index,clock,send,handlers,setHang:u=>hang=u,maxActive:()=>maxActive,setIndexMissing:()=>hasIndex=false,setFetch:f=>ctx.fetch=f};
}
function coreFixture(folder,mode='success'){
 const nodes=new Map(),listeners=[],messages=new Set(),clock=timers(),store=new Map(),scripts=[];const get=s=>{if(!nodes.has(s))nodes.set(s,{style:{},textContent:'',disabled:false,classList:{},remove(){},focus(){}});return nodes.get(s)};
 let ctx,previousToken;const worker={scriptURL:'https://example.test/abboud-math/'+(mode==='wrong-worker'?'':folder+'/')+'sw.js',postMessage(d){assert.ok(messages.size>0,'Listener must exist before a fast worker reply');checks++;
  if(mode==='post-error')throw Error('disconnected');if(mode==='timeout')return;
  const emit=(x,source=worker)=>{for(const f of [...messages])f({data:x,source})},base={type:'cache-media-progress',token:d.token,total:3,saved:3,remaining:0,done:true};
  emit({cached:1});emit({...base,token:'other'});emit(base,{});if(previousToken)emit({...base,token:previousToken,saved:0,remaining:3,error:true});
  if(mode==='partial'){emit({...base,saved:1,remaining:2,done:false});emit({...base,saved:1,remaining:2,error:true})}else emit(base);previousToken=d.token;
 }};
 const sw={controller:mode==='missing-worker'?null:worker,addEventListener:(n,f)=>messages.add(f),removeEventListener:(n,f)=>messages.delete(f)};
 ctx={window:{CFG:{key:'test-progress'}},document:{querySelector:get,querySelectorAll:()=>[],addEventListener:(n,f)=>{if(n==='click')listeners.push(f)},createElement:()=>({remove(){}}),head:{append(s){scripts.push(s);if(mode==='index-error')s.onerror();else if(mode!=='index-timeout'){ctx.window.MEDIA=mode==='empty-index'?[]:['bookimg/1.webp','bookimg/2.webp','bookimg/3.webp'];s.onload()}}},body:{append(){}}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},navigator:{serviceWorker:sw},location:{href:'https://example.test/abboud-math/'+folder+'/index.html#/home'},URL,addEventListener(){},Date,console,...clock};
 vm.runInNewContext(read(folder+'/core.js'),ctx);const click=()=>listeners.forEach(f=>f({target:{closest:s=>s==='#offbtn'?get('#offbtn'):null}}));
 return{click,get,store,messages,clock,scripts,setMode:m=>mode=m};
}
function rootFixture(){const scope='https://example.test/abboud-math/',clock=timers(),handlers={},saved=new Map(),puts=[],reads=[];let fetchResolve,fetchReject;
 const ctx={URL,Response,location:{origin:new URL(scope).origin},self:{registration:{scope},addEventListener:(n,f)=>handlers[n]=f},...clock,fetch:()=>new Promise((r,j)=>{fetchResolve=r;fetchReject=j}),caches:{match:async u=>{const key=typeof u==='string'?u:u.url;reads.push(key);return saved.get(key)?.clone()},open:async()=>({put:async(req,r)=>{saved.set(req.url,r);puts.push(req.url)}})}};
 vm.runInNewContext(read('sw.js'),ctx);
 function request(file,mode='cors'){let response;const waits=[],url=new URL(file,scope).href;handlers.fetch({request:{url,mode,method:'GET'},respondWith:p=>response=p,waitUntil:p=>waits.push(p)});return{response,waits,url}}
 return{saved,puts,reads,clock,request,resolve:r=>fetchResolve(r),reject:()=>fetchReject(Error('offline')),scope};
}
async function run(){for(const grade of [6,8])for(const subject of ['arabic','science']){const folder='g'+grade+'/'+subject,x=workerFixture(folder),n=x.files.length;
 x.absolute.forEach(u=>x.fail.add(u));let ms=await x.send(),last=ms.at(-1);assert.equal(last.saved,0);assert.equal(last.remaining,n);assert.equal(last.error,true);assert.equal(last.done,true);checks+=4;
 x.fail.clear();x.fail.add(x.absolute[0]);x.fail.add(x.absolute[1]);ms=await x.send();last=ms.at(-1);assert.equal(last.saved,n-2);assert.equal(last.remaining,2);assert.equal(x.saved.size,n-2);checks+=3;
 x.fail.clear();const before=x.adds.length;ms=await x.send();assert.equal(x.adds.length-before,2);assert.equal(ms.at(-1).saved,n);assert.equal(ms.at(-1).error,false);assert.ok(ms.every(m=>m.remaining===n-m.saved));checks+=4;
 const unchanged=x.adds.length;await x.send();assert.equal(x.adds.length,unchanged);assert.ok(x.maxActive()<=4);checks+=2;
 for(const bad of ['https://evil.test/bookimg/a.webp','../science/bookimg/a.webp','bookimg/not-in-manifest.webp','bookimg/%2e%2e/%2e%2e/profiles.js']){last=(await x.send({files:[bad,...x.files.slice(1)]})).at(-1);assert.equal(last.error,true);assert.equal(last.saved,0);assert.equal(x.adds.length,unchanged);checks+=3}
 assert.equal((await x.send({files:[]})).at(-1).error,true);checks++;
 assert.equal((await x.send({},'https://evil.test/')).at(-1).error,true);assert.equal((await x.send({},'https://example.test/abboud-math/login.html')).at(-1).error,true);checks+=2;
 x.index.text=async()=> 'window.MEDIA=invalid';assert.equal((await x.send()).at(-1).error,true);checks++;
 // A request that hangs is aborted, counted as incomplete, and can be retried.
 const h=workerFixture(folder);h.setHang(h.absolute[0]);const pending=h.send();await tick();h.clock.fire(45000);last=(await pending).at(-1);assert.equal(last.remaining,1);assert.equal(last.error,true);checks+=2;
 const fallback=workerFixture(folder);fallback.setIndexMissing();fallback.setFetch(async()=>new Response(read(folder+'/media.js')));assert.equal((await fallback.send()).at(-1).saved,n);checks++;
 const stuckIndex=workerFixture(folder);stuckIndex.setIndexMissing();stuckIndex.setFetch(()=>new Promise(()=>{}));const stuck=stuckIndex.send();await tick();stuckIndex.clock.fire(45000);assert.equal((await stuck).at(-1).error,true);checks++;
 for(const mode of ['success','partial','index-error','empty-index','post-error','missing-worker','wrong-worker','index-timeout','timeout']){const c=coreFixture(folder,mode);c.click();if(mode==='index-timeout')c.clock.fire(20000);if(mode==='timeout')c.clock.fire(65000);
  assert.equal(c.store.has('test-progress_off'),mode==='success');assert.equal(c.get('#offbtn').disabled,false);assert.equal(c.messages.size,0);checks+=3;
  if(mode==='partial'){assert.match(c.get('#offstatus').textContent,/حُفظ ١ من ٣/);c.setMode('success');c.click();assert.equal(c.store.get('test-progress_off'),'1');checks+=2}
 }
 console.log('Passed '+folder+' manifest validation, failed/partial/resumed downloads, worker timeout and core UI states.');
 }
 for(const file of ['login.html','login.js','g8/science/index.html','g8/science/core.js']){const x=rootFixture(),r=x.request(file,file.endsWith('.html')?'navigate':'cors');x.saved.set(r.url,new Response('cached'));x.clock.fire(3500);assert.equal(await(await r.response).text(),'cached');assert.ok(r.waits.length);x.resolve(new Response('fresh'));await Promise.all(r.waits);assert.equal(await x.saved.get(r.url).text(),'fresh');checks+=3}
 for(const file of ['missing.js','missing.css','g8/science/missing.js','g8/science/missing.css']){const x=rootFixture(),r=x.request(file);x.saved.set(new URL('index.html',x.scope).href,new Response('HTML'));x.reject();assert.equal((await r.response).type,'error');assert.ok(!x.reads.some(u=>u.endsWith('/index.html')));checks+=2}
 const offline=rootFixture(),r=offline.request('unvisited-route','navigate');offline.saved.set(new URL('index.html',offline.scope).href,new Response('home'));offline.reject();assert.equal(await(await r.response).text(),'home');checks++;
 const uncached=rootFixture(),fresh=uncached.request('new.js');uncached.clock.fire(3500);await tick();uncached.resolve(new Response('new script'));assert.equal(await(await fresh.response).text(),'new script');checks++;
 console.log('Passed '+checks+' offline-download and cached-network assertions.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
