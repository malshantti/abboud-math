'use strict';
// Maintenance mode and coloured/linked announcement from the settings center (sync.js on lesson pages).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),sync=fs.readFileSync(path.join(root,'sync.js'),'utf8');
function page(map,{access,online=true,site={}}={}){
 const nodes=[];let banner=null;
 const ls={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const json=o=>({ok:true,status:200,json:async()=>o});
 const fetch=async url=>{const p=new URL(url).pathname.replace('/admin-api/api/','');
  if(p==='session')return json({authenticated:true,csrf:'t',user:{name:'x',email:'p@x'},access,students:[],site,urls:{account:'/a',subscribe:'/s'}});return json({items:{}})};
 const el=()=>{const n={id:'',style:{},dataset:{},innerHTML:'',setAttribute(){},append(){},remove(){banner=null},focus(){},kids:{span:{textContent:''},a:{href:''},button:{}}};n.querySelector=s=>n.kids[s]||{};n.querySelectorAll=()=>[{focus(){}},{}];return n};
 const doc={readyState:'complete',documentElement:{dataset:{}},currentScript:{src:'https://bustankids.com/sync.js'},head:{append(){}},body:{prepend(n){banner=n},append(n){nodes.push(n)}},querySelector:()=>null,getElementById:id=>id==='bustan-trial'?banner:null,createElement:el,addEventListener(){}};
 const c={console,URL,URLSearchParams,Date,Math,JSON,Promise,AbortController,setTimeout,clearTimeout,setInterval:()=>0,localStorage:ls,document:doc,
  location:{protocol:'https:',pathname:'/g6/math/',search:'',href:'https://bustankids.com/g6/math/',replace(){},reload(){}},navigator:{onLine:online},fetch,addEventListener(){}};
 c.window=c;vm.createContext(c);vm.runInContext(sync,c);return {c,get banner(){return banner},nodes};
}
const tick=()=>new Promise(r=>setTimeout(r,40));
(async()=>{
 const acct=JSON.stringify({email:'p@x',name:'x'});
 let p=page(new Map([['bustan_account',acct]]),{access:{allowed:true,kind:'trial',subjects:null},site:{maintenance:{message:'نعود بعد ساعة'}}});await tick();
 const m=p.nodes.find(n=>n.id==='bustan-maint');assert.ok(m,'maintenance overlay shown');assert.equal(p.banner,null,'no trial banner under maintenance');
 assert.equal(p.nodes.filter(n=>n.id==='bustan-signin').length,0);
 // Staff: the server sends maintenance:null, so lessons open normally.
 p=page(new Map([['bustan_account',acct]]),{access:{allowed:true,kind:'staff',subjects:null},site:{maintenance:null}});await tick();
 assert.equal(p.nodes.filter(n=>n.id==='bustan-maint').length,0);
 const src=fs.readFileSync(path.join(root,'sync.js'),'utf8');
 assert.match(src,/announcement_color/);assert.match(src,/announcement_link/);assert.match(src,/\^https\?:/);
 console.log('PASS: maintenance mode');
})().catch(e=>{console.error(e);process.exit(1)});
