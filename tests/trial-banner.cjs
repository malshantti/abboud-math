'use strict';
// Trial banner: Arabic count wording, shown only for trial, hidden for paid, dismiss for the day, offline from cache.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
function page(map,{access,online=true}={}){
 const nodes=[];let banner=null;
 const ls={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const json=o=>({ok:true,status:200,json:async()=>o});
 const fetch=async url=>{const p=new URL(url).pathname.replace('/admin-api/api/','');
  if(p==='session')return json({authenticated:true,csrf:'t',user:{name:'x',email:'p@x'},access,students:[],site:{},urls:{account:'/a',subscribe:'/s'}});return json({items:{}})};
 const el=()=>{const n={id:'',style:{},dataset:{},innerHTML:'',setAttribute(){},append(){},remove(){banner=null},focus(){},kids:{span:{textContent:''},a:{href:''},button:{}}};n.querySelector=s=>n.kids[s]||{};n.querySelectorAll=()=>[{focus(){}},{}];return n};
 const doc={readyState:'complete',documentElement:{dataset:{}},currentScript:{src:'https://bustankids.com/sync.js'},head:{append(){}},body:{prepend(n){banner=n},append(n){nodes.push(n)}},querySelector:()=>null,getElementById:id=>id==='bustan-trial'?banner:null,createElement:el,addEventListener(){}};
 const c={console,URL,URLSearchParams,Date,Math,JSON,Promise,AbortController,setTimeout,clearTimeout,setInterval:()=>0,localStorage:ls,document:doc,
  location:{protocol:'https:',pathname:'/g6/math/',search:'',href:'https://bustankids.com/g6/math/',replace(){},reload(){}},navigator:{onLine:online},fetch,addEventListener(){}};
 c.window=c;vm.createContext(c);vm.runInContext(sync,c);return {c,get banner(){return banner},nodes};
}
const tick=()=>new Promise(r=>setTimeout(r,40));
(async()=>{
 const T=page(new Map(),{access:{kind:'paid',subjects:['g6-math']}}).c.BUSTAN_SYNC.daysText;
 assert.equal(T(1),'يوم واحد');assert.equal(T(2),'يومان');assert.equal(T(3),'٣ أيام');assert.equal(T(10),'١٠ أيام');assert.equal(T(11),'١١ يومًا');assert.equal(T(100),'١٠٠ يوم');
 const acct=JSON.stringify({email:'p@x',name:'x'}),ends=d=>new Date(Date.now()+d*864e5-6e4).toISOString();
 let m=new Map([['bustan_account',acct]]);let p=page(m,{access:{allowed:true,kind:'trial',ends_at:ends(3),days_left:3,subjects:null}});await tick();
 assert.ok(p.banner,'trial banner shown');assert.equal(p.banner.kids.span.textContent,'تجربة مجانية: باقٍ لك ٣ أيام');assert.equal(p.banner.kids.a.href,'https://bustankids.com/admin-api/account/subscribe');
 p.banner.kids.button.onclick();assert.ok(m.get('bustan_trial_dismissed'));
 p=page(m,{access:{allowed:true,kind:'trial',ends_at:ends(3),subjects:null}});await tick();assert.equal(p.banner,null,'dismissed for today');
 m.delete('bustan_trial_dismissed');p=page(m,{online:false});await tick();assert.ok(p.banner,'offline uses cached access');assert.equal(p.banner.kids.span.textContent,'تجربة مجانية: باقٍ لك ٣ أيام');
 p=page(new Map([['bustan_account',acct]]),{access:{allowed:true,kind:'paid',subjects:['g6-math']}});await tick();assert.equal(p.banner,null,'paid: nothing');assert.equal(p.nodes.length,0);
 p=page(new Map([['bustan_account',acct]]),{access:{allowed:false,kind:'expired',subjects:[]}});await tick();assert.equal(p.banner,null);assert.equal(p.nodes.length,1,'expired: existing lock');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html.replace(/<[^>]+>/g,''),/مجاني بالكامل حتى ٢٨\/١١، بدون دفع/);assert.doesNotMatch(html,/٣ أيام|ثلاثة أيام/);assert.match(html,/href="admin-api\/account\/register">إنشاء حساب/);
 console.log('PASS: trial banner');
})().catch(e=>{console.error(e);process.exit(1)});
