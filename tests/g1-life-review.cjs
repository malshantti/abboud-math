'use strict';
/* مراجعة الحياة للصف الأول: جملة قصيرة لكل خطوة، وثلاثة اختيارات، وصور، ودمج المكرر، والهوية الوطنية. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),c={window:{}};vm.createContext(c);
for(const f of['content.js','book-activities.js','foundations.js'])vm.runInContext(fs.readFileSync(path.join(root,'g1/life',f),'utf8'),c);
const C=c.window.G1_COURSE,lessons=[...C.foundations,...C.units.flatMap(u=>u.lessons)],get=id=>lessons.find(l=>l.id===id);
const harakat=/[\u064B-\u0652]/;
for(const l of lessons.filter(l=>!l.mergedInto)){
 for(const s of l.steps){assert(s.say&&harakat.test(s.say),'Voweled step: '+l.id);assert(s.text.split(/\s+/).length<=7&&!/[.؟!].+[.؟!]/.test(s.text.slice(0,-1)),'One short sentence: '+l.id+' '+s.text);}
 for(const t of l.tasks){assert.equal(t.choices.length,3,'3 choices: '+l.id);assert(harakat.test(t.say)&&harakat.test(t.sayExplain),'Voweled task: '+l.id);
  for(const ch of t.choices)assert(ch.say&&harakat.test(ch.say),'Voweled choice: '+l.id+' '+ch.label);
  assert.equal(new Set(t.choices.map(x=>x.label)).size,3,'Distinct choices: '+l.id);}
}
for(const id of['l-1-2','l-1-3','l-2-1','l-3-2','l-5-3'])assert(get(id).tasks.every(t=>t.choices.every(ch=>ch.scene)),'Picture choices: '+id);
for(const[id,into]of[['l-1-touch-taste','l-1-1'],['l-book-taste-texture','l-1-1'],['l-found-senses','l-1-1'],['l-book-soil','l-3-3'],['l-found-seasons','l-book-months']])assert.equal(get(id).mergedInto,into,'Merged: '+id);
const id2=JSON.stringify(get('l-2-3'))+JSON.stringify(get('l-book-flag-capital'));
for(const w of['الْقُدْسُ عَاصِمَةُ','عَلَمُ فِلَسْطِينَ','خَرِيطَةُ فِلَسْطِينَ','الزَّيْتُونِ'])assert(id2.includes(w),'National identity: '+w);
assert(fs.existsSync(path.join(root,'g1/life/palestine-outline.svg')),'Map asset');
assert(/'jerusalem'/.test(fs.readFileSync(path.join(root,'g1/shared/life-art.js'),'utf8')),'Jerusalem drawing');
console.log('g1 life review ok');
