'use strict';
// sync.js: opt-in; only the account's students (added by the parent) live on the device; stale local-only profiles are purged;
// linked progress is imported, pushed, pulled on entry pages; grade is fixed by the parent; harmless offline.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),profiles=fs.readFileSync(path.join(root,'profiles.js'),'utf8'),sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
function server(){const s={students:[],progress:{},calls:[],auth:true,next:1};
 s.fetch=async(url,opt={})=>{const u=new URL(url),p=u.pathname.replace('/admin-api/api/',''),m=opt.method||'GET',body=opt.body?JSON.parse(opt.body):null;s.calls.push(m+' '+p);
  const json=(o,st=200)=>({ok:st<300,status:st,json:async()=>o});
  if(p==='site')return json({announcement:''});
  if(p==='session')return json(s.auth?{authenticated:true,csrf:'t',user:{name:'أم سامي',email:'p@x'},access:s.access||{allowed:true,kind:'trial',subjects:null},students:s.students,site:{announcement:''},urls:{account:'/a',subscribe:'/s'}}:{authenticated:false,site:{},urls:{}});
  if(!s.auth)return json({},401);
  assert.equal(opt.headers['X-CSRF-TOKEN']||(m==='GET'?'t':''),'t');
  if(p==='students'){const f=s.students.find(x=>x.local_id===body.local_id);return f?json({student:f}):json({message:'no'},403)}
  const mm=p.match(/^students\/(\d+)\/(progress|import)$/),id=+mm[1],store=s.progress[id];
  const rejected=[];if(body)for(const [k,v] of Object.entries(body.items)){if(k==='bustan_grade'||(s.deny||[]).includes(k)){rejected.push(k);continue}if(!store[k]||v.updated>store[k].updated)store[k]=v}
  return json({items:store,rejected});};
 return s}
function page(map,srv,pathname,online=true){
 const ls={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const doc={readyState:'complete',currentScript:{src:'https://bustankids.com/profiles.js'},head:{append(){}},body:{prepend(){},append(){}},querySelector:()=>null,getElementById:()=>null,createElement:()=>({style:{},setAttribute(){},append(){},querySelector:()=>({}),querySelectorAll:()=>[{focus(){}},{}],focus(){}}),addEventListener(){},visibilityState:'visible'};
 const c={console,URL,URLSearchParams,Uint8Array,TextEncoder,Date,Math,JSON,Promise,setTimeout,clearTimeout,setInterval:()=>0,localStorage:ls,document:doc,location:{protocol:'https:',pathname,search:'',href:'https://bustankids.com'+pathname},navigator:{onLine:online},fetch:srv.fetch,addEventListener(){}};
 c.window=c;c.crypto={getRandomValues:a=>a.map(()=>Math.random()*256|0)};vm.createContext(c);vm.runInContext(profiles,c);
 doc.currentScript={src:'https://bustankids.com/sync.js'};vm.runInContext(sync,c);return c}
const tick=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
 // Device with an existing local student (legacy abboud key) and no sync: nothing is sent.
 const map=new Map([['abboud_math_v1',JSON.stringify({name:'عبّود',points:77})]]);const srv=server();
 let c=page(map,srv,'/');await c.PROFILES.ready;await tick();
 assert.deepEqual(srv.calls,['GET site'],'homepage, not opted in: only the public banner request');
 { const m2=new Map(),s2=server();s2.auth=false;const c2=page(m2,s2,'/login.html');await c2.PROFILES.ready;await tick();
   assert.deepEqual(s2.calls,['GET session'],'the student picker always checks the linked account');assert.equal(m2.get('bustan_sync'),'1'); }
 const before=JSON.stringify([...map].filter(([k])=>!k.startsWith('bustan_sync')&&k!=='bustan_account'));
 // Opt in and log in. The parent has added this child on the account page (linked by local_id p1, grade 8): progress imported.
 srv.students.push({id:1,name:'عبّود',grade:8,avatar:'idle',local_id:'p1'});srv.progress[1]={};srv.next=2;
 map.set('bustan_sync','1');c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.ok(!srv.calls.includes('POST students'),'the site never creates students');
 assert.equal(JSON.parse(srv.progress[1].abboud_math_v1.value).points,77,'local progress imported on first login');
 assert.equal(c.PROFILES.dataOf('p1','bustan_grade'),8,'grade fixed to the one set by the parent');
 assert.deepEqual(c.PROFILES.roster().students.map(s=>[s.sid,s.local,s.grade]),[[1,'p1',8]]);
 assert.equal(c.PROFILES.entitlement('p1',8,'math'),'ok');assert.equal(c.PROFILES.entitlement('p1',6,'math'),'grade');
 // A lesson played in a subject page is pushed.
 c=page(map,srv,'/g8/math/');await tick();await c.PROFILES.ready;await c.PROFILES.login('p1');
 const write=c.PROFILES.writer('abboud_math_v1');assert.equal(await write(JSON.stringify({name:'عبّود',points:90})),true);
 await c.BUSTAN_SYNC.run();assert.equal(JSON.parse(srv.progress[1].abboud_math_v1.value).points,90);
 // Offline: no requests, local save still works.
 const n=srv.calls.length;c=page(map,srv,'/g8/math/',false);await tick();await c.BUSTAN_SYNC.run();assert.equal(srv.calls.length,n);
 // A newer value from another device is pulled on the entry page.
 srv.progress[1].abboud_math_v1={value:JSON.stringify({name:'عبّود',points:120}),updated:Date.now()+1000};
 c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.dataOf('p1').points,120,'newer server progress pulled');
 // A student added by the parent on the server appears on this device.
 srv.students.push({id:9,name:'ليلى',grade:1,avatar:'idle',local_id:null});srv.progress[9]={bustan_g1_math_v1:{value:'{"stars":3}',updated:5}};
 c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.ok(c.PROFILES.find('ps9'));assert.equal(c.PROFILES.dataOf('ps9','bustan_g1_math_v1').stars,3);
 // A stale local-only profile (made before this change) is purged and never uploaded.
 await c.PROFILES.create('غريب','idle','1234');const stray=c.PROFILES.list().find(p=>p.name==='غريب').id;
 c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.find(stray),null,'local-only profile removed');assert.ok(c.PROFILES.find('p1')&&c.PROFILES.find('ps9'));
 assert.equal([...map.keys()].some(k=>k.startsWith('bustan_p_'+stray+'__')),false,'its local slots removed');
 // The parent removes a student on the server: removed from the device too.
 srv.students=srv.students.filter(s=>s.id!==9);c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.find('ps9'),null);
 // Paid plan without this subject: locked; a rejected key is not re-sent in a loop.
 srv.access={allowed:true,kind:'paid',subjects:['g8-science']};
 c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.entitlement('p1',8,'math'),'locked');assert.equal(c.PROFILES.entitlement('p1',8,'science'),'ok');
 srv.deny=['abboud_math_v1'];c=page(map,srv,'/g8/math/');await tick();await c.PROFILES.ready;await c.PROFILES.login('p1');
 await c.PROFILES.writer('abboud_math_v1')(JSON.stringify({name:'عبّود',points:130}));await c.BUSTAN_SYNC.run();
 const puts=srv.calls.filter(x=>x==='PUT students/1/progress').length;await c.BUSTAN_SYNC.run();
 assert.equal(srv.calls.filter(x=>x==='PUT students/1/progress').length,puts,'rejected key not re-sent');
 assert.equal(c.PROFILES.dataOf('p1').points,130,'kept locally');
 // Logged out on the server: nothing breaks, local keeps working.
 srv.auth=false;c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.dataOf('p1').points,130);
 console.log('PASS: progress sync is opt-in, keeps only account students (purges local-only), fixes grade, enforces entitlement, pushes, pulls, stays local offline');
})().catch(e=>{console.error(e);process.exitCode=1});
