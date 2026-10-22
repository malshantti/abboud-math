'use strict';
/* مراجعة رياضيات الصف الأول: أسئلة قصيرة، ونص منطوق مشكول، ومشتتات متنوعة، ومهام سحب وخط أعداد صحيحة. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),c={window:{}};vm.createContext(c);
for(const f of['content.js','foundations.js'])vm.runInContext(fs.readFileSync(path.join(root,'g1/math',f),'utf8'),c);
const C=c.window.G1_COURSE,lessons=[...C.foundations,...C.units.flatMap(u=>u.lessons)];
const num=s=>Number(String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const harakat=/[\u064B-\u0652]/;let plusMinusOnly=0,numeric=0,kinds={build:0,line:0},bigSigns=0;
for(const l of lessons){
 assert(l.tasks.length>=5&&l.tasks.length<=8,'5-8 questions: '+l.id);
 for(const s of l.steps)assert(s.say&&harakat.test(s.say),'Voweled step audio: '+l.id);
 for(const t of l.tasks){
  const words=t.prompt.replace(/[٠-٩+−=:،.؟]/g,' ').trim().split(/\s+/).filter(Boolean).length;
  assert(words<=6,'Short prompt ('+words+' words): '+l.id+' '+t.prompt);
  assert(t.say&&harakat.test(t.say),'Voweled prompt audio: '+l.id);assert(t.sayExplain&&harakat.test(t.sayExplain),'Voweled feedback: '+l.id);
  for(const ch of t.choices)if(/[ء-ي]/.test(ch.label)||/^[٠-٩]+$/.test(ch.label))assert(ch.say&&harakat.test(ch.say),'Voweled choice: '+l.id+' '+ch.label);
  if(t.kind){kinds[t.kind]++;const v=num(t.choices[t.answer].label);if(t.kind==='line')assert(v>=t.min&&v<=t.max&&t.max-t.min<=10,'Reachable tick: '+l.id);if(t.kind==='build')assert(v>=0&&v<=t.pool&&t.pool<=14,'Enough objects: '+l.id);if(t.start!==undefined&&t.scene)assert.equal(v,eval(String(t.scene.value).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('−','-')),'Jump lands on answer: '+l.id);}
  if(t.choices.every(ch=>/^[٠-٩]+$/.test(ch.label))&&t.choices.length>2){numeric++;const r=num(t.choices[t.answer].label);if(t.choices.every(ch=>Math.abs(num(ch.label)-r)<=1))plusMinusOnly++;}
  if(t.choices.some(ch=>ch.big))bigSigns++;
 }
}
assert(plusMinusOnly/numeric<0.4,'Distractors are not only one more/one less: '+plusMinusOnly+'/'+numeric);
assert(kinds.build>=15&&kinds.line>=15,'Many drag-to-count and number-line tasks');assert(bigSigns>=10,'Big comparison sign buttons');
const m23=JSON.stringify(lessons.find(l=>l.id==='m-2-3'));assert(!/تصاعدي|تنازلي/.test(m23),'Child words for ordering');
const reviews=C.units.map(u=>u.lessons.filter(l=>/review/.test(l.id)).reduce((s,l)=>s+l.tasks.length,0));assert(reviews.every(n=>n>=15),'Each unit has at least fifteen review questions');
const E=fs.readFileSync(path.join(root,'g1/shared/early.js'),'utf8');assert(/kind==='line'/.test(E)&&/kind==='build'/.test(E)&&/pointerdown/.test(E),'Engine renders number-line and drag tasks');
console.log('G1 math review: '+lessons.length+' lessons, '+kinds.build+' drag, '+kinds.line+' number-line, '+bigSigns+' sign tasks, distractor variety '+plusMinusOnly+'/'+numeric+'.');
