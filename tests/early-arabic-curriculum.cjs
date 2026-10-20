'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),plain=v=>JSON.parse(JSON.stringify(v));
const load=code=>{const context={window:{}};vm.runInNewContext(code,context);return context.window.G1_COURSE;};
const course=g=>load(read(`g${g}/arabic/content.js`)),base=process.env.CACHE_BASE_REF||'origin/main';
const old=g=>load(cp.execFileSync('git',['show',`${base}:g${g}/arabic/content.js`],{cwd:root,encoding:'utf8'}));
const flatten=c=>[...c.units.flatMap(u=>u.lessons),...(c.foundations||[])];
const clean=t=>String(t).normalize('NFC').replace(/[\u064b-\u065f\u0670]/g,'');
for(const grade of [1,2]){
  const current=course(grade),prior=old(grade),lessons=flatten(current),ids=lessons.map(l=>l.id);
  assert.equal(new Set(ids).size,ids.length,'Every lesson has its own progress record');
  assert.equal(current.key,prior.key,'Existing student storage key is retained');
  for(const before of flatten(prior)){
    const after=lessons.find(l=>l.id===before.id);assert.ok(after,'Old completed activity still exists: '+before.id);
    assert.equal(after.tasks.length,before.tasks.length,'New skills must not inherit an old completion: '+before.id);
    assert.deepEqual(plain(after.tasks.map(t=>t.choices[t.answer].label)),plain(before.tasks.map(t=>t.choices[t.answer].label)),'Old activity retains its answer meanings: '+before.id);
    if(grade===1)assert.deepEqual(plain(after.tasks),plain(before.tasks),'Previously completed tasks do not acquire new objectives');
  }
  const code=read(`g${grade}/shared/early.js`),start=code.indexOf('  function reference(lesson) {'),end=code.indexOf('  function home()',start);
  const context={C:{books:[{id:'p1',title:'كتاب',url:'https://elearn.edu.ps/book.pdf',pdfOffset:4},{id:'p2',title:'جزء ثانٍ',url:'https://elearn.edu.ps/book2.pdf'}]},shown:t=>String(t??'').replaceAll('<','&lt;'),esc:t=>String(t).replaceAll('"','&quot;'),ar:n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])};
  vm.createContext(context);vm.runInContext(code.slice(start,end)+'\nthis.renderReference=reference;',context);
  const result=context.renderReference({references:[{book:'p1',page:8},{book:'p2',page:5}],referenceLabel:'نشاط دعم',homeActivity:{title:'تجربة',text:'<نص منزلي>'}});
  assert.match(result,/#page=12/,'Known PDF offset is applied');assert.match(result,/الصفحة المطبوعة ٨/);
  assert.match(result,/book2.pdf"/,'Unknown PDF offset does not pretend the printed page is a PDF page');
  assert.match(result,/لا يصححها الموقع ولا يسجّل إتقانها/);assert.match(result,/&lt;نص منزلي>/);assert.doesNotMatch(result,/data-action=/,'Home activity cannot award mastery');
  assert.ok(!context.renderReference({references:[{book:'missing',page:2}]}),'Unknown book cannot create a broken reference');
}
const first=course(1);
for(const unit of first.units.filter(u=>/^ar-p[12]-\d+$/.test(u.id))){
  const phonics=unit.lessons.find(l=>l.id.endsWith('-phonics')),word=unit.lessons.find(l=>l.id.endsWith('-word'));
  assert.ok(phonics&&word,'Letter has independent phonics and connected reading support');
  assert.ok(clean(word.tasks[0].choices[word.tasks[0].answer].label).startsWith(phonics.phonics.letter),'The answer really starts with the target letter');
  assert.ok(word.tasks[0].choices.filter((_,i)=>i!==word.tasks[0].answer).every(c=>!clean(c.label).startsWith(phonics.phonics.letter)),'No distractor also starts with the target letter');
  assert.ok(word.guidedPractice.some(p=>p.title.includes('أكتب')),'Manual writing is a separate guided practice');
  if(phonics.phonics.letter==='أ'){
    assert.deepEqual(plain(phonics.phonics.forms),['أ','إ','ء']);
    assert.ok(phonics.tasks.some(t=>t.choices[t.answer].label==='إِ'));assert.ok(phonics.tasks.some(t=>t.choices[t.answer].label==='ء'));
  }else{
    assert.equal(phonics.phonics.long.length,3);assert.equal(phonics.phonics.short.length,3);
    for(const value of phonics.phonics.long)assert.ok(phonics.tasks.some(t=>t.choices[t.answer].label===value),'Every displayed long vowel is a question target');
    assert.ok(phonics.tasks.some(t=>t.choices[t.answer].label===phonics.phonics.short[2]),'Short vowel is distinct from long vowel');
  }
}
for(const unit of first.units.filter(u=>u.id.includes('review'))){
  const all=unit.lessons.find(l=>l.id.endsWith('-all'));
  assert.deepEqual(plain(all.tasks.map(t=>t.choices[t.answer].label)),plain(all.reviewTargets),'No review target is permanently omitted');
}
const cause=first.units.find(u=>u.id==='ar-butterfly').lessons.find(l=>l.id.endsWith('-cause'));
assert.ok(cause.tasks[0].choices[cause.tasks[0].answer].label.includes('الْعَسَلَ'),'Bee activity assesses the central purpose, under its new progress ID');
for(const lesson of course(2).units.flatMap(u=>u.lessons)){
  assert.match(lesson.referenceLabel,/نص دعم أصلي/,'Support reading is not presented as a textbook passage');
  assert.equal(lesson.guidedPractice.length,4,'Book reading, discussion, composition and dictation have explicit adult guidance');
  const reading=lesson.steps[1].text;assert.match(reading,/[\u064b-\u0652]/,'Support reading has a vocalized model');
  const target=lesson.steps[2].scene.value;assert.ok(clean(reading).includes(clean(target)),'Glossary target actually occurs in its support reading');
}
assert.match(read('g1/shared/early.js'),/toLowerCase\(\),letter/,'English tracing offers lower and uppercase letters');
console.log('Early Arabic curriculum: old progress, phonics targets, full reviews, explicit support/source labels and ungraded home activities passed.');
