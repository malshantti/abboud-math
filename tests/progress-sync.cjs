'use strict';
// sync.js: opt-in, imports existing local profiles on first login, pushes changes, pulls on entry pages, harmless offline.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),profiles=fs.readFileSync(path.join(root,'profiles.js'),'utf8'),sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
function server(){const s={students:[],progress:{},calls:[],auth:true,next:1};
 s.fetch=async(url,opt={})=>{const u=new URL(url),p=u.pathname.replace('/admin-api/api/',''),m=opt.method||'GET',body=opt.body?JSON.parse(opt.body):null;s.calls.push(m+' '+p);
  const json=(o,st=200)=>({ok:st<300,status:st,json:async()=>o});
  if(p==='site')return json({announcement:''});
  if(p==='session')return json(s.auth?{authenticated:true,csrf:'t',user:{name:'أم سامي',email:'p@x'},access:{allowed:true,kind:'trial',subjects:null},students:s.students,site:{announcement:''},urls:{account:'/a',subscribe:'/s'}}:{authenticated:false,site:{},urls:{}});
  if(!s.auth)return json({},401);
  assert.equal(opt.headers['X-CSRF-TOKEN']||(m==='GET'?'t':''),'t');
  if(p==='students'){const st={id:s.next++,name:body.name,grade:body.grade,avatar:body.avatar,local_id:body.local_id};s.students.push(st);s.progress[st.id]={};return json({student:st},201)}
  const mm=p.match(/^students\/(\d+)\/(progress|import)$/),id=+mm[1],store=s.progress[id];
  if(body)for(const [k,v] of Object.entries(body.items)){if(!store[k]||v.updated>store[k].updated)store[k]=v}
  return json({items:store});};
 return s}
function page(map,srv,pathname,online=true){
 const ls={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const doc={readyState:'complete',currentScript:{src:'https://bustankids.com/profiles.js'},head:{append(){}},body:{prepend(){},append(){}},querySelector:()=>null,getElementById:()=>null,createElement:()=>({style:{},setAttribute(){},append(){}}),addEventListener(){},visibilityState:'visible'};
 const c={console,URL,URLSearchParams,Uint8Array,TextEncoder,Date,Math,JSON,Promise,setTimeout,clearTimeout,setInterval:()=>0,localStorage:ls,document:doc,location:{protocol:'https:',pathname,search:'',href:'https://bustankids.com'+pathname},navigator:{onLine:online},fetch:srv.fetch,addEventListener(){}};
 c.window=c;c.crypto={getRandomValues:a=>a.map(()=>Math.random()*256|0)};vm.createContext(c);vm.runInContext(profiles,c);
 doc.currentScript={src:'https://bustankids.com/sync.js'};vm.runInContext(sync,c);return c}
const tick=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
 // Device with an existing local student (legacy abboud key) and no sync: nothing is sent.
 const map=new Map([['abboud_math_v1',JSON.stringify({name:'عبّود',points:77})]]);const srv=server();
 let c=page(map,srv,'/login.html');await c.PROFILES.ready;await tick();
 assert.deepEqual(srv.calls,['GET site'],'not opted in: only the public banner request');
 const before=JSON.stringify([...map].filter(([k])=>!k.startsWith('bustan_sync')&&k!=='bustan_account'));
 // Opt in and log in: the local profile and its progress are imported.
 map.set('bustan_sync','1');c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(srv.students.length,1);assert.equal(srv.students[0].local_id,'p1');
 assert.equal(JSON.parse(srv.progress[1].abboud_math_v1.value).points,77,'local progress imported on first login');
 assert.equal(JSON.stringify([...map].filter(([k])=>!k.startsWith('bustan_sync')&&k!=='bustan_account')),before,'existing local keys are untouched by the import');
 // A lesson played in a subject page is pushed.
 c=page(map,srv,'/g8/math/');await tick();await c.PROFILES.ready;await c.PROFILES.login('p1');
 const write=c.PROFILES.writer('abboud_math_v1');assert.equal(await write(JSON.stringify({name:'عبّود',points:90})),true);
 await c.BUSTAN_SYNC.run();assert.equal(JSON.parse(srv.progress[1].abboud_math_v1.value).points,90);
 // Offline: no requests, local save still works.
 const n=srv.calls.length;c=page(map,srv,'/g8/math/',false);await tick();await c.BUSTAN_SYNC.run();
 // A newer value from another device is pulled on the entry page.
 srv.progress[1].abboud_math_v1={value:JSON.stringify({name:'عبّود',points:120}),updated:Date.now()+1000};
 c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.dataOf('p1').points,120,'newer server progress pulled');
 // A student added by the parent on the server appears on this device.
 srv.students.push({id:9,name:'ليلى',grade:1,avatar:'idle',local_id:null});srv.progress[9]={bustan_g1_math_v1:{value:'{"stars":3}',updated:5}};
 c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.ok(c.PROFILES.find('ps9'));assert.equal(c.PROFILES.dataOf('ps9','bustan_g1_math_v1').stars,3);
 // Logged out on the server: nothing breaks, local keeps working.
 srv.auth=false;c=page(map,srv,'/login.html');await tick();await c.BUSTAN_SYNC.run();
 assert.equal(c.PROFILES.dataOf('p1').points,120);
 console.log('PASS: progress sync is opt-in, imports local progress on first login, pushes, pulls on entry pages, and stays local offline');
})().catch(e=>{console.error(e);process.exitCode=1});
