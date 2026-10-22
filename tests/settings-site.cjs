'use strict';
// Settings center → landing: hero, FAQ, footer links, voice on/off/volume/autoplay and price cards come from /admin-api/api/site and /public/prices.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),src=fs.readFileSync(path.join(root,'landing.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function el(tag){const e={tag,hidden:false,attrs:{},children:[],textContent:'',className:'',classList:{s:new Set(),add(c){this.s.add(c)},remove(c){this.s.delete(c)},toggle(c,on){on?this.s.add(c):this.s.delete(c)},contains(c){return this.s.has(c)}},
 setAttribute(k,v){this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]??null},addEventListener(){},append(...c){c.forEach(x=>{if(typeof x!=='string'){x.parentNode=this}this.children.push(x)})},appendChild(c){this.append(c);return c},
 remove(){this.removed=true},contains(){return false},querySelector(s){return(this.q=this.q||{})[s]||(this.q[s]=el())},querySelectorAll(){return[]}};return e}
function run(site,prices){
 const sel={},all={};
 const reg=(s,e)=>(sel[s]=e,e);
 const badge=reg('[data-site="badge"]',el('p'));badge.q={span:el('span')};
 const h1=el('h1');const tag=reg('.L-hero .L-tagline',el('p')),lead=reg('.L-hero .L-lead',el('p'));
 const faq=reg('[data-site="faq"]',el('div'));const foot=reg('[data-site="footer"]',el('p'));
 const fb=reg('[data-site="facebook"]',el('a'));fb.hidden=true;const ig=reg('[data-site="instagram"]',el('a'));ig.hidden=true;const em=reg('[data-site="email"]',el('a'));em.hidden=true;
 const pay=reg('[data-site="pay"]',el('p'));pay.hidden=true;
 const body=el('body');
 const doc={readyState:'complete',body,createElement:el,getElementById:id=>id==='visitor-home'?el():id==='L-hero-title'?h1:null,querySelector:s=>sel[s]||(sel[s]=el()),querySelectorAll:s=>all[s]||[]};
 const json=o=>Promise.resolve({ok:true,json:()=>Promise.resolve(o)});
 class A{constructor(){this.volume=1;this.paused=true}play(){this.paused=false;return Promise.resolve()}pause(){}}
 const listeners={};
 const ctx={document:doc,Audio:A,localStorage:{getItem:()=>null,setItem(){}},fetch:u=>json(u.includes('prices')?prices:site),IntersectionObserver:class{observe(){}},
  setTimeout:(f,ms)=>ms>=2000?0:setTimeout(f,0),setInterval:()=>0,clearInterval(){},clearTimeout(){},Date,Promise,addEventListener:(t,f)=>{listeners[t]=f},removeEventListener(){},matchMedia:null,scrollY:0,innerHeight:800};
 ctx.window=ctx;vm.runInNewContext(src.slice(src.indexOf('// إعدادات الموقع')),ctx);
 return {ctx,h1,tag,lead,faq,foot,fb,ig,em,badge,pay,body,listeners};
}
const flush=async()=>{for(let i=0;i<10;i++)await new Promise(setImmediate)};
(async()=>{
 // Static fallbacks stay in the HTML for offline/failed fetch.
 assert.match(html,/data-site="badge"/);assert.match(html,/data-site="faq"/);assert.match(html,/data-site="footer"/);assert.match(html,/data-site="pay"/);
 assert.match(html,/نزرع الفهم، ونحصد المعرفة — المنهاج الفلسطيني كاملًا/);
 const site={tagline:'شعار',hero:{title:'عنوان',mark:'مميّز',subtitle:'وصف',badge:'شارة'},faq:[{q:'س١',a:'ج١'},{q:'س٢',a:'ج٢'}],
  contact:{facebook:'https://facebook.com/b',instagram:'javascript:alert(1)',email:'info@bustankids.com',footer:'تذييل',whatsapp:'970599000000'},voice:{enabled:true,volume:60,autoplay:false}};
 let x=run(site,{groups:[],payment_instructions:'ادفع ثم أرسل الرمز'});await flush();
 assert.equal(x.tag.textContent,'شعار');assert.equal(x.lead.textContent,'وصف');assert.equal(x.badge.q.span.textContent,'شارة');
 assert.equal(x.h1.children[0],'عنوان');assert.equal(x.h1.children[2].textContent,'مميّز');
 assert.equal(x.faq.children.length,2);assert.equal(x.faq.children[1].children[0].textContent,'س٢');
 assert.equal(x.foot.textContent,'تذييل');assert.equal(x.fb.hidden,false);assert.equal(x.fb.href,'https://facebook.com/b');
 assert.equal(x.ig.hidden,true,'unsafe url is not shown');assert.equal(x.em.href,'mailto:info@bustankids.com');
 assert.equal(x.pay.textContent,'ادفع ثم أرسل الرمز');assert.equal(x.pay.hidden,false);
 const pill=x.body.children[0],v=x.ctx.__bustanVoice;
 assert.equal(pill.hidden,false,'pill visible');assert.equal(v.state().enabled,false,'autoplay off: nothing starts by itself');assert.equal(x.listeners.pointerup,undefined,'no gesture arming');
 // Voice switched off: the pill is removed.
 x=run({...site,voice:{enabled:false,volume:35,autoplay:true}},{groups:[]});await flush();
 assert.equal(x.body.children[0].removed,true);assert.equal(x.body.children[0].hidden,true);
 console.log('PASS: settings → landing');
})().catch(e=>{console.error(e);process.exit(1)});
