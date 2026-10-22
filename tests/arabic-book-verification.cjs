'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),plain=v=>JSON.parse(JSON.stringify(v));
const load=(g,old=false)=>{const x={window:{}};vm.runInNewContext(old?cp.execFileSync('git',['show','origin/main:g'+g+'/arabic/content.js'],{cwd:root,encoding:'utf8'}):read(`g${g}/arabic/content.js`),x);if(g===2&&!old)vm.runInNewContext(read('g2/arabic/book-skills.js'),x);return x.window.G1_COURSE;};
for(const g of [1,2]){const c=load(g),before=load(g,true),lessons=c.units.flatMap(u=>u.lessons),ids=lessons.map(l=>l.id);assert.equal(ids.length,new Set(ids).size);assert.equal(c.key,before.key);
 const retired=new Set(c.retiredLessonIds||[]);for(const l of before.units.flatMap(u=>u.lessons)){if(retired.has(l.id))continue;const current=lessons.find(n=>n.id===l.id);assert.ok(current,l.id);assert.deepEqual(plain(current.tasks),plain(l.tasks),'Previously completed objective is unchanged: '+l.id);}
 for(const l of lessons){for(const t of l.tasks){assert.ok(t.answer>=0&&t.answer<t.choices.length);assert.equal(new Set(t.choices.map(c=>c.label)).size,t.choices.length,'No ambiguous duplicate option: '+l.id);}}
}
const first=load(1),letterUnits=first.units.filter(u=>u.lessons.some(l=>l.phonics));assert.equal(letterUnits.length,28);
for(const u of letterUnits){const book=u.lessons.find(l=>l.id.endsWith('-book-practice-v2')),extra=u.lessons.find(l=>l.phonics);assert.ok(book);assert.ok(u.lessons.indexOf(book)<u.lessons.indexOf(extra));assert.ok(extra.optional&&extra.title.startsWith('إثراء:'));assert.ok(book.tasks.some(t=>t.choices[t.answer].label===book.bookWord));}
assert.deepEqual(plain(letterUnits[0].lessons.find(l=>l.bookTargets).bookTargets),['رَا'],'First letter does not prematurely require all three long vowels');
assert.deepEqual(plain(letterUnits[1].lessons.find(l=>l.bookTargets).bookTargets),['دَا','دُو']);
assert.equal(first.units.flatMap(u=>u.lessons).filter(l=>l.id.endsWith('-book-language-v2')).length,8,'Verified spelling targets have independent progress IDs');
const second=load(2);assert.equal(second.units.length,30);
for(const u of second.units){const l=u.lessons.find(l=>l.id.endsWith('-book-skills'));assert.ok(l&&l.references.length===2);assert.equal(l.references[0].page,u.page+3);assert.ok(l.guidedPractice.every(p=>p.text.length>25));assert.ok(l.steps.every(s=>s.text.length>10));assert.equal(l.tasks.length,2);assert.match(l.referenceLabel,/صياغة مساندة/);}
for(const [id,term] of [['ar2-p1-5','الْحِجَارَة'],['ar2-p1-7','يَرْكَبُه'],['ar2-p2-2','الْحِيلَة'],['ar2-p2-9','الْأَمَانَة'],['ar2-p2-15','إِعْدَادِ الطَّعَام']]){const l=second.units.find(u=>u.id===id).lessons[0];assert.ok(l.steps[0].text.replaceAll('حِجَارَةً','الْحِجَارَة').includes(term),'Central verified event is present offline: '+id);}
const index=read('g2/arabic/index.html');assert.ok(index.indexOf('content.js')<index.indexOf('book-skills.js')&&index.indexOf('book-skills.js')<index.indexOf('../shared/early.js'));
assert.match(read('g2/arabic/sw.js'),/"book-skills.js"/,'New objectives are cached for offline use');assert.equal(second.books.find(b=>b.id==='p2').pdfOffset,4);
console.log('Arabic book verification: referenced sequence, 30 book skill activities, old objectives and progress preserved, offline module wiring passed.');
