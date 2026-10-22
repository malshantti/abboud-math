/* «استمع إلى الشرح»: pre-recorded clips only, one per explanation item, sequential, quiet, lazy, highlighted; files exist.
   Run: node tests/lesson-narration.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;
for(const g of ['g6','g8']){const dir=path.join(root,g,'math');
 const c0={};c0.window=c0;vm.runInNewContext(fs.readFileSync(path.join(dir,'narration.js'),'utf8'),c0);const N=c0.MATH_NARR;
 assert.ok(N&&N.base==='narration/'&&Object.keys(N.L).length>0,g+': manifest');
 // every listed clip exists and is small mp3; every lesson with content has narration
 for(const [id,ks] of Object.entries(N.L))for(const k of ks){const f=path.join(dir,'narration',id,k+'.mp3');assert.ok(fs.existsSync(f),f);const sz=fs.statSync(f).size;assert.ok(sz>1000&&sz<600000,f+' '+sz);checks++}
 const cx={console,document:{addEventListener(){}}};cx.window=cx;vm.createContext(cx);for(const f of ['data.js','content.js','content5.js'])vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),cx);
 for(const id of Object.keys(cx.CONTENT))assert.ok(N.L[id],g+': narration for '+id);
 // keys map to rendered data-nk markers
 const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');for(const m of ['data-nk="idea"','data-nk="r${i}"','data-nk="act"','data-nk="ex${i}"','data-nk="goal"','window.MATH_NARR.L[id]','استمع إلى الشرح'])assert.ok(app.includes(m),g+' app.js '+m);
 for(const ks of Object.values(N.L))for(const k of ks)assert.match(k,/^(goal|idea|act|r\d+|ex\d+|err\d+)$/);
 assert.ok(!fs.readFileSync(path.join(dir,'sw.js'),'utf8').includes('narration/'),'clips are not precached');
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert.ok(html.indexOf('narration-player.js')<html.indexOf('app.js'));
 // player behaviour with fake DOM
 const marks=new Map(),audios=[];let generated=0,listeners={};
 const el=k=>{if(!marks.has(k))marks.set(k,{k,classList:{s:new Set(),add(c){this.s.add(c)},remove(c){this.s.delete(c)},toggle(c,on){on?this.s.add(c):this.s.delete(c)},contains(c){return this.s.has(c)}},scrollIntoView(){}});return marks.get(k)};
 const btn={dataset:{id:'S1-1-1'},attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{toggle(){}},innerHTML:'',closest(){return btn}};const stEl={textContent:''};
 class Audio{constructor(){audios.push(this);this.paused=true}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
 const doc={addEventListener:(t,f)=>listeners['d'+t]=f,getElementById:i=>i==='narr'?btn:i==='narr-st'?stEl:null,querySelector:s=>el(s.match(/"(.+)"/)[1]),querySelectorAll:()=>[...marks.values()].filter(e=>e.classList.contains('narr-on')).map(e=>({classList:{remove:c=>e.classList.remove(c)}}))};
 const ctx={document:doc,Audio,addEventListener:(t,f)=>listeners[t]=f,MATH_NARR:{base:'narration/',L:{'S1-1-1':['goal','idea','r0']}},speechSynthesis:{speak(){generated++}},SpeechSynthesisUtterance:function(){generated++}};ctx.window=ctx;
 vm.runInNewContext(fs.readFileSync(path.join(dir,'narration-player.js'),'utf8'),ctx);const P=ctx.MATH_NARR_PLAYER;
 listeners.dclick({target:btn});assert.equal(audios.length,1);const au=audios[0];assert.equal(au.preload,'none');assert.ok(au.volume<=0.35);assert.equal(au.src,'narration/S1-1-1/goal.mp3');assert.ok(el('goal').classList.contains('narr-on'));assert.equal(P.state,'playing');
 au.onended();assert.equal(au.src,'narration/S1-1-1/idea.mp3');assert.ok(el('idea').classList.contains('narr-on'));assert.ok(!el('goal').classList.contains('narr-on'),'one highlight at a time');
 listeners.dclick({target:btn});assert.equal(P.state,'paused');assert.ok(au.paused);listeners.dclick({target:btn});assert.equal(P.state,'playing');assert.equal(au.src,'narration/S1-1-1/idea.mp3','resume same clip');
 au.onerror();assert.equal(au.src,'narration/S1-1-1/r0.mp3','broken clip is skipped');au.onended();assert.equal(P.state,'idle');assert.ok(!el('r0').classList.contains('narr-on'));
 listeners.dclick({target:btn});listeners.hashchange();assert.equal(P.state,'idle');assert.ok(au.paused,'stops on navigation');
 assert.equal(audios.length,1,'single reused element');assert.equal(generated,0,'no speech synthesis');checks+=12}
console.log(`lesson-narration passed: ${checks} checks.`);
