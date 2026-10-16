// T05 follow-up: progress saved by old cached code (working key only) is never hidden or lost by the new profiles.js.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),{webcrypto}=require('crypto');
const store=new Map();const LS={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const src=fs.readFileSync(path.join(__dirname,'../profiles.js'),'utf8');
function load(){const w={localStorage:LS,navigator:{},crypto:webcrypto,isSecureContext:true,TextEncoder,Uint8Array,addEventListener(){},location:{reload(){}}};w.window=w;vm.runInNewContext(src,w);return w.PROFILES}
const K='abboud_math_v1',pts=v=>JSON.parse(v).points;
(async()=>{
 let P=load();await P.ready;
 const a=await P.create('عبود','idle','1111');await P.writer(K)('{"points":10}');
 const m=await P.create('ميرا','idle','2222');await P.writer(K)('{"points":20}');
 await P.login(a.id);assert.strictEqual(pts(P.readProgress(K)),10);
 LS.setItem(K,'{"points":15}');// old cached app.js saves
 P=load();await P.ready;assert.strictEqual(pts(P.readProgress(K)),15,'new code reads old-code save');
 assert.strictEqual(P.dataOf(a.id,K).points,15,'report sees it');
 await P.login(m.id);assert.strictEqual(pts(P.readProgress(K)),20,'switch keeps Mira');
 await P.login(a.id);assert.strictEqual(pts(P.readProgress(K)),15,'switch back keeps old-code save');
 LS.setItem(K,'{"points":17}');P=load();await P.ready;const w=P.writer(K);await w('{"points":18}');
 await P.login(m.id);await P.login(a.id);assert.strictEqual(pts(P.readProgress(K)),18,'new save after old save');
 const b=P.backup();assert.strictEqual(pts(b.data[a.id][K]),18);assert.strictEqual(pts(b.data[m.id][K]),20);
 console.log('stale-code save: ok');
})().catch(e=>{console.error(e);process.exit(1)});
