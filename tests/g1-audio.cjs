/* صوت الصف الأول: بصمات ثابتة، كل مدخل في الفهرس له ملف، لا موسيقى، وتوزيع موضع الإجابة الصحيحة. */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),AU=require('../g1/shared/audio.js');
assert.equal(AU.key('  أَهْلًا  '),AU.key('أَهْلًا'),'Whitespace-insensitive key');
assert.notEqual(AU.key('cat','en'),AU.key('cat','ar'),'Language is part of key');
assert.equal(AU.hash('abc').length,14,'Hash length');
for(const s of ['math','life','arabic','english']){
  const html=fs.readFileSync(path.join(root,'g1',s,'index.html'),'utf8');
  assert(html.indexOf('audio-index.js')<html.indexOf('shared/audio.js')&&html.indexOf('shared/audio.js')<html.indexOf('shared/early.js'),'Audio scripts load before engine: '+s);
  const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'g1',s,'audio-index.js'),'utf8'),ctx);
  for(const f of Object.values(ctx.window.G1_AUDIO_INDEX)){assert(/^[0-9a-f]{14}$/.test(f),'Hash name');const p=path.join(root,'g1/shared/audio',f+'.mp3');assert(fs.existsSync(p)&&fs.statSync(p).size>500,'Clip exists: '+s+' '+f);}
  const sw=fs.readFileSync(path.join(root,'g1',s,'sw.js'),'utf8');assert(sw.includes('"../shared/audio.js"')&&sw.includes('"audio-index.js"'),'Audio player precached: '+s);
}
const tools=fs.readFileSync(path.join(root,'g1/shared/voice/build.cjs'),'utf8')+fs.readFileSync(path.join(root,'g1/shared/voice/tts.py'),'utf8');
assert(tools.includes('ar-SA-HamedNeural')&&tools.includes('en-GB-SoniaNeural')&&tools.includes("'-b:a', '48k'")&&tools.includes("rate='-5%'"),'Voice settings');
assert(!/music|instrument|speechSynthesis/i.test(fs.readFileSync(path.join(root,'g1/shared/audio.js'),'utf8')),'No music or browser TTS');
/* ترتيب الاختيارات */
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'g1/shared/early.js'),'utf8'),ctx);
const order=ctx.window.G1_ORDER;assert(order,'Order exported');
for(const n of [2,3,4]){const counts=Array(n).fill(0);
  for(let run=0;run<300;run++){const session={};let last=-1;
    for(let q=0;q<8;q++){const answer=q%n,task={answer,choices:Array.from({length:n},(_,i)=>({label:String(i)}))};
      const out=order(task,session);assert.equal(out.length,n);assert.equal(new Set(out.map(x=>x.i)).size,n,'Permutation');
      const pos=out.findIndex(x=>x.i===answer);assert.notEqual(pos,last,'Correct position never repeats in a row');last=pos;counts[pos]++;}}
  const min=Math.min(...counts),max=Math.max(...counts);assert(min>max*0.6,'Balanced positions for '+n+': '+counts);}
console.log('g1-audio ok');
