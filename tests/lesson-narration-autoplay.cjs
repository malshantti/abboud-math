/* Lesson narration autoplay: default on, waits for a first gesture if blocked, «إيقاف الصوت» remembers the choice,
   «استمع إلى الشرح» re-enables it, navigation stops it. Run: node tests/lesson-narration-autoplay.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(setImmediate)};
(async()=>{let checks=0;for(const g of ['g6','g8']){
 const src=fs.readFileSync(path.join(__dirname,'..',g,'math','narration-player.js'),'utf8');
 const ls=new Map(),L={},W={},auds=[];let block=true;
 class Audio{constructor(){auds.push(this);this.paused=true}play(){if(block){const e=new Error('blocked');e.name='NotAllowedError';return Promise.reject(e)}this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
 const mk=()=>({hidden:false,attrs:{},innerHTML:'',classList:{toggle(){},add(){},remove(){},contains(){return false}},setAttribute(k,v){this.attrs[k]=v}});
 const btn=Object.assign(mk(),{dataset:{id:'L1'}});btn.closest=s=>s==='#narr'?btn:null;let stopEl=null;
 const body={appendChild(c){stopEl=c}};
 const doc={body,addEventListener:(t,f)=>(L[t]=L[t]||[]).push(f),removeEventListener:(t,f)=>{L[t]=(L[t]||[]).filter(x=>x!==f)},createElement:()=>{const e=mk();e.closest=s=>s==='#narr-stop'?e:null;return e},
  getElementById:i=>i==='narr'?btn:i==='narr-stop'?stopEl:null,querySelector:()=>null,querySelectorAll:()=>[]};
 const ctx={document:doc,Audio,addEventListener:(t,f)=>W[t]=f,setTimeout:f=>f(),localStorage:{getItem:k=>ls.has(k)?ls.get(k):null,setItem:(k,v)=>ls.set(k,String(v))},MATH_NARR:{base:'narration/',L:{L1:['idea','r0']}}};ctx.window=ctx;
 vm.runInNewContext(src,ctx);const P=ctx.MATH_NARR_PLAYER;const fire=(t,e)=>(L[t]||[]).slice().forEach(f=>f(e));
 assert.equal(P.auto,true);P.autostart();await flush();assert.equal(P.state,'waiting','blocked autoplay waits');assert.ok(stopEl&&!stopEl.hidden,'stop button visible');checks+=3;
 block=false;fire('pointerdown',{});await flush();assert.equal(P.state,'playing','first gesture starts');assert.equal(auds[0].src,'narration/L1/idea.mp3');assert.ok(auds[0].volume<=0.35);checks+=3;
 P.autostart();assert.equal(auds.length,1,'no double start');
 fire('click',{target:stopEl});assert.equal(P.state,'idle');assert.equal(ls.get('math_narr_auto'),'0','stop remembered');assert.ok(stopEl.hidden);assert.equal(P.auto,false);checks+=4;
 W.hashchange();P.autostart();assert.equal(P.state,'idle','no autoplay after user stopped it');checks++;
 fire('click',{target:btn});await flush();assert.equal(P.state,'playing');assert.equal(ls.get('math_narr_auto'),'1','listen re-enables autoplay');checks+=2;
 W.hashchange();assert.equal(P.state,'idle','navigation stops');assert.ok(auds[0].paused);checks+=2;
 fire('change',{target:{id:'narr-auto',checked:false}});assert.equal(ls.get('math_narr_auto'),'0');checks++;
}console.log(`lesson-narration-autoplay passed: ${checks} checks.`)})().catch(e=>{console.error(e);process.exitCode=1});
