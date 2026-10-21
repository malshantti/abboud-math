'use strict';
// Sign-in is mandatory before any lesson: no account -> redirect to account login with a return URL;
// a device that logged in before keeps working offline / on weak internet; server-confirmed logout locks again.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),profiles=fs.readFileSync(path.join(root,'profiles.js'),'utf8'),sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
function page(map,{pathname='/g1/math/',online=true,auth=true,fail=false}={}){
 const calls=[],replaced=[],ds={};
 const ls={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const fetch=async(url)=>{const p=new URL(url).pathname.replace('/admin-api/api/','');calls.push(p);if(fail)throw Error('network');
  const json=o=>({ok:true,status:200,json:async()=>o});
  if(p==='session')return json(auth?{authenticated:true,csrf:'t',user:{name:'أم سامي',email:'p@x'},access:{allowed:true,kind:'trial',subjects:null},students:[],site:{},urls:{account:'/a',subscribe:'/s'}}:{authenticated:false,site:{},urls:{}});
  if(p==='site')return json({});
  if(p==='students')return json({student:{id:1}});
  return json({items:{}});};
 const el=()=>({style:{},dataset:{},setAttribute(){},append(){},querySelector:()=>({}),querySelectorAll:()=>[{},{}],focus(){}});
 const doc={readyState:'complete',documentElement:{dataset:ds},currentScript:{src:'https://bustankids.com/profiles.js'},head:{append(){}},body:{prepend(){},append(n){doc.appended.push(n)}},appended:[],querySelector:()=>null,getElementById:()=>null,createElement:el,addEventListener(){},visibilityState:'visible'};
 const href='https://bustankids.com'+pathname;
 const c={console,URL,URLSearchParams,Uint8Array,TextEncoder,Date,Math,JSON,Promise,AbortController,setTimeout,clearTimeout,setInterval:()=>0,localStorage:ls,document:doc,
  location:{protocol:'https:',pathname,search:'',href,replace:u=>replaced.push(u),reload(){}},navigator:{onLine:online},fetch,addEventListener(){}};
 c.window=c;c.crypto={getRandomValues:a=>a.map(()=>Math.random()*256|0)};vm.createContext(c);vm.runInContext(profiles,c);
 const hidden=ds.gate==='checking';
 doc.currentScript={src:'https://bustankids.com/sync.js'};vm.runInContext(sync,c);
 return {c,calls,replaced,ds,doc,hidden}}
const tick=()=>new Promise(r=>setTimeout(r,40));
(async()=>{
 const progress=JSON.stringify({stars:4});
 // 1) No account: lesson hidden, then redirected to login with return to the same lesson. Progress untouched.
 let map=new Map([['bustan_g1_math_v1',progress]]);
 let p=page(map,{auth:false});assert.equal(p.hidden,true,'lesson hidden until the account is checked');await tick();
 assert.deepEqual(p.replaced,['https://bustankids.com/admin-api/account/login?return='+encodeURIComponent('https://bustankids.com/g1/math/')]);
 assert.equal(map.get('bustan_g1_math_v1'),progress);
 // 2) Logged in: lesson opens, account remembered.
 p=page(map,{auth:true});await tick();
 assert.deepEqual(p.replaced,[]);assert.equal(p.ds.gate,undefined,'lesson revealed');
 assert.equal(JSON.parse(map.get('bustan_account')).email,'p@x');
 // 3) Offline later: opens immediately from the stored account, no request, no redirect.
 p=page(map,{online:false,pathname:'/g8/science/'});assert.equal(p.hidden,false);await tick();
 assert.deepEqual(p.calls,[]);assert.deepEqual(p.replaced,[]);
 // 4) Weak internet (request fails): still no lockout.
 p=page(map,{fail:true,pathname:'/g2/arabic/'});await tick();assert.deepEqual(p.replaced,[]);assert.equal(p.ds.gate,undefined);
 // 5) Server says logged out: lock again and drop the stored account; progress kept.
 p=page(map,{auth:false});await tick();assert.equal(p.replaced.length,1);assert.equal(map.has('bustan_account'),false);
 assert.equal(map.get('bustan_g1_math_v1'),progress);
 // 6) Never logged in and offline: no redirect loop, a sign-in notice is shown instead.
 p=page(new Map(),{online:false});await tick();assert.deepEqual(p.replaced,[]);assert.equal(p.doc.appended.length,1);
 // 7) Entry pages are not gated.
 p=page(new Map(),{pathname:'/login.html',auth:false});assert.equal(p.hidden,false);await tick();assert.deepEqual(p.replaced,[]);
 // 8) Visitor page sends a signed-in account without an open student to the student picker.
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/bustan_account[\s\S]*location\.replace\('login\.html'\)/);
 console.log('PASS: lessons require sign-in, return to the lesson, stay open offline for signed-in devices, entry pages stay public');
})().catch(e=>{console.error(e);process.exitCode=1});
