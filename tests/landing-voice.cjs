// Landing voice tour: autoplay fallback, mute persistence (own key only), queue/switch, captions, sw precache.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),src=fs.readFileSync(path.join(root,'landing.js'),'utf8');
function fx({store={},block=false}={}){
 const ls=new Map(Object.entries(store)),audios=[],listeners={},secs={};let io;
 const el=()=>{const e={hidden:false,attrs:{},children:[],classList:{s:new Set(),add(c){this.s.add(c)},remove(c){this.s.delete(c)},toggle(c,on){on?this.s.add(c):this.s.delete(c)},contains(c){return this.s.has(c)}},
  setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},addEventListener(t,f){(this.on=this.on||{})[t]=f},appendChild(c){this.children.push(c)},contains(){return false},querySelector(s){return(this.q=this.q||{})[s]||(this.q[s]=el())},querySelectorAll(){return[]}};return e};
 const doc={readyState:'complete',body:el(),createElement:el,getElementById:id=>id==='visitor-home'?el():null,querySelector:s=>secs[s]||(secs[s]=el()),querySelectorAll:()=>[]};
 class A{constructor(){this.volume=1;this.paused=true;audios.push(this)}play(){if(block)return Promise.reject(new Error('NotAllowed'));this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
 const ctx={document:doc,Audio:A,localStorage:{getItem:k=>ls.has(k)?ls.get(k):null,setItem:(k,v)=>ls.set(k,String(v))},
  IntersectionObserver:class{constructor(cb){this.cb=cb;io=this}observe(){}},setTimeout:(f)=>f(),setInterval:(f)=>{f();return 0},clearInterval(){},Date:{now:(()=>{let t=0;return()=>t+=1000})()},Promise,
  addEventListener:(t,f)=>{listeners[t]=f},removeEventListener:(t)=>{delete listeners[t]},matchMedia:null,scrollY:0,innerHeight:800};
 ctx.window=ctx;
 const voice=src.slice(src.indexOf('// جولة صوتية'));vm.runInNewContext(voice,ctx);
 const pill=doc.body.children[0],cap=doc.body.children[1];
 const enter=s=>io.cb([{target:doc.querySelector(s),isIntersecting:true}]);
 return{ls,audios,listeners,pill,cap,enter,secs,v:ctx.__bustanVoice,unblock(){block=false}};
}
const flush=async()=>{for(let i=0;i<8;i++)await new Promise(setImmediate)};
(async()=>{
 const script=JSON.parse(fs.readFileSync('/workspace/landing-voice/script.json','utf8').toString());
 // autoplay allowed: welcome plays at low volume, caption visible, preload none
 let x=fx();await flush();assert.equal(x.pill.hidden,false);assert.equal(x.audios[0].src,'assets/landing/voice/welcome.mp3');assert.equal(x.audios[0].preload,'none');
 assert.ok(x.audios[0].volume<=0.35);assert.equal(x.cap.hidden,false);assert.equal(x.cap.textContent,script[0].text);
 x.enter('.L-hero');assert.equal(x.audios.length,1,'no overlap with welcome');x.audios[0].onended();await flush();assert.equal(x.audios[1].src,'assets/landing/voice/hero.mp3');
 assert.ok(x.secs['.L-hero'].classList.contains('is-speaking'));
 x.enter('#L-demos');await flush();assert.equal(x.audios[1].paused,true,'switch fades old');assert.equal(x.audios[2].src,'assets/landing/voice/demos.mp3');
 x.audios[2].onended();x.enter('#L-demos');await flush();assert.equal(x.audios.length,3,'each clip once');
 assert.deepEqual([...x.ls.keys()],[],'nothing written without a choice');
 // mute persists in own key
 x.pill.querySelector('.L-voice-mute').on.click();assert.deepEqual([...x.ls.entries()],[['bustan_landing_voice','off']]);
 // blocked autoplay keeps pill and arms gesture; first gesture starts tour
 x=fx({block:true});await flush();assert.equal(x.pill.querySelector('.L-voice-play').hidden,false);assert.ok(x.listeners.pointerdown);
 x.unblock();x.listeners.pointerdown({target:{}});await flush();assert.equal(x.audios.at(-1).paused,false);assert.ok(!x.listeners.pointerdown);
 // muted user: no autoplay, gesture does nothing
 x=fx({store:{bustan_landing_voice:'off'}});await flush();assert.equal(x.audios.length,0);assert.ok(!x.listeners.pointerdown);x.enter('.L-hero');assert.equal(x.audios.length,0);
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.ok(!/voice\/[^"]*\.mp3/.test(sw)&&!sw.includes('landing/voice'));
 assert.equal(fs.existsSync(path.join(root,'assets/landing/voice')),false,'placeholder mp3s must not ship');
 console.log('PASS landing voice');
})().catch(e=>{console.error(e);process.exitCode=1});
