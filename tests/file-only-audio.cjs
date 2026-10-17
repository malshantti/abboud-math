// T20: missing/broken recordings must never trigger generated speech or noise.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function fixture(grade){
 const nodes=new Map(),audios=[],store=new Map([['en_sfx','1'],['en_rate','1']]);let mode='normal',generated=0;
 const make=()=>({textContent:'',attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{values:new Set(),add(k){this.values.add(k)},remove(k){this.values.delete(k)},contains(k){return this.values.has(k)}},closest(){return host}});
 const host={append(node){nodes.set(node.id,node)}};
 const document={body:host,getElementById:id=>nodes.get(id),querySelector:()=>host,querySelectorAll:()=>[],createElement:make};
 class Audio{constructor(src){if(mode==='construct-error')throw Error('unsupported file');this.src=src;audios.push(this)}play(){return mode==='reject'?Promise.reject(Error('playback blocked')):Promise.resolve()}pause(){this.paused=true}}
 const context={document,Audio,console,setTimeout:f=>{f();return 1},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},EN_AUDIO:{base:'audio/',files:{hello:{f:'hello.mp3',s:'hello-slow.mp3',z:100}}},EN_AUDIO_AR:{base:'audio-ar/',map:{'شرح':'explain.mp3'}}};
 context.speechSynthesis={getVoices(){generated++;return[]},speak(){generated++},cancel(){generated++}};
 context.SpeechSynthesisUtterance=function(){generated++};context.AudioContext=function(){generated++};context.window=context;
 vm.runInNewContext(fs.readFileSync(path.join(root,`g${grade}/english/audio.js`),'utf8'),context);
 return{context,AU:context.AU,audios,nodes,store,button:make(),mode:m=>mode=m,generated:()=>generated};
}
(async()=>{let cases=0;for(const grade of [6,8]){
 const f=fixture(grade),{AU,audios,button,nodes}=f;
 assert.equal(await AU.play('missing phrase',{btn:button}),false);assert.equal(audios.length,0);assert.equal(nodes.get('audio-status').attributes.role,'status');assert.match(nodes.get('audio-status').textContent,/غير متاح/);cases++;
 let pending=AU.play('hello',{btn:button});await Promise.resolve();assert.equal(audios.at(-1).src,'audio/hello.mp3');assert.ok(button.classList.contains('playing'));audios.at(-1).onended();assert.equal(await pending,true);assert.equal(button.classList.contains('playing'),false);cases++;
 AU.setRate(.75);pending=AU.play('hello',{btn:button});assert.equal(audios.at(-1).src,'audio/hello-slow.mp3');assert.equal(audios.at(-1).playbackRate,1);audios.at(-1).onended();assert.equal(await pending,true);cases++;
 pending=AU.play('hello',{btn:button});audios.at(-1).onerror();assert.equal(await pending,false);assert.match(nodes.get('audio-status').textContent,/يمكنك قراءة النص/);assert.equal(button.classList.contains('playing'),false);cases++;
 f.mode('reject');assert.equal(await AU.play('hello',{btn:button}),false);assert.equal(button.classList.contains('playing'),false);cases++;
 f.mode('construct-error');assert.equal(await AU.play('hello',{btn:button}),false);cases++;
 f.mode('normal');pending=AU.playAr('شرح',{btn:button});assert.equal(audios.at(-1).src,'audio-ar/explain.mp3');audios.at(-1).onerror();assert.equal(await pending,false,'Broken Arabic recording must not report success');cases++;
 assert.equal(await AU.playAr('غير موجود',{btn:button}),false);cases++;
 pending=AU.play('hello',{btn:button});const interrupted=audios.at(-1);AU.stop();assert.equal(await pending,false);assert.ok(interrupted.paused);assert.equal(button.classList.contains('playing'),false);cases++;
 assert.equal(AU.sfx('ok'),false);assert.equal(AU.sfx('bad'),false);assert.equal(f.generated(),0,'Neither speech synthesis nor noise generator may be used');assert.equal(f.context.EN_AUDIO_STATS.tts,0);assert.equal(f.store.get('en_sfx'),'1','Existing preference is preserved');cases++;
 const app=fs.readFileSync(path.join(root,`g${grade}/english/app.js`),'utf8');assert.ok(!app.includes('سيُستخدم نطق المتصفح'));assert.ok(!app.includes('طبيعية محفوظة'));assert.match(app,/id="sfx" disabled/);
}console.log(`PASS file-only audio: ${cases} playback, failure, cancellation and no-generation cases`);})().catch(e=>{console.error(e);process.exitCode=1});
