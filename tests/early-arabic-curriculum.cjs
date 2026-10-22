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
  const retired=new Set(current.retiredLessonIds||[]);
  for(const before of flatten(prior)){
    if(retired.has(before.id)){assert.ok(!ids.includes(before.id),'Retired objective is really replaced: '+before.id);continue;}
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
{const x={window:{}};vm.runInNewContext(read('g1/arabic/content.js'),x);vm.runInNewContext(read('g1/arabic/foundations.js'),x);first.foundations=x.window.G1_COURSE.foundations;}
const order=[];for(const u of first.units)if(/^ar-p[12]-\d+$/.test(u.id))order.push(u.lessons.find(l=>l.phonics).phonics.letter);
const pairs=[['ب','ت','ث'],['ج','ح','خ'],['ر','ز'],['د','ذ'],['س','ش'],['ص','ض'],['ط','ظ'],['ع','غ'],['ف','ق']];
const teacherNote=/أمثلة دعم|لا تحل محل|الكبير|المصدر|صياغة|إثراء إضافي|مساند/;
for(const unit of first.units.filter(u=>/^ar-p[12]-\d+$/.test(u.id))){
  const phonics=unit.lessons.find(l=>l.id.endsWith('-phonics-v2')),word=unit.lessons.find(l=>l.id.endsWith('-word-v2')),letter=phonics.phonics.letter,pos=order.indexOf(letter);
  const known=new Set([...order.slice(0,pos+1),'ا','و','ي','ى','ة',' ','.','؟','،']);
  const tanween=/[\u064b-\u064d]/,shadda=/\u0651/,sukoon=/\u0652/;
  if(unit.term===1)for(const L of unit.lessons)for(const text of [...L.steps.map(s=>s.scene?.value||''),...L.tasks.flatMap(t=>t.choices.map(c=>c.label))].filter(t=>/[\u0621-\u064a]/.test(t)&&!(L.bookWord&&clean(t)===clean(L.bookWord)))){
    for(const ch of clean(text))if(/[\u0621-\u064a]/.test(ch)&&!known.has(ch)&&!(L.id.endsWith('-letter-v2')||L.id.includes('phonics')||L.id.includes('book-practice')||L.id.includes('dictation')))assert.fail('Book one uses an untaught letter '+ch+' in '+L.id+': '+text);
    assert.ok(!tanween.test(text)&&!shadda.test(text),'No tanween or shadda before taught: '+L.id+' '+text);
    if(pos<order.indexOf('ح'))assert.ok(!sukoon.test(text),'No sukoon before taught: '+L.id+' '+text);
  }
  const letterLesson=unit.lessons.find(l=>l.id.endsWith('-letter-v2')),first0=letterLesson.tasks[0];
  assert.ok(first0.listen&&first0.say,'Letter starts with a listening task');
  const group=pairs.find(g=>g.includes(letter));
  if(group)assert.ok(first0.choices.some(c=>c.label!==letter&&group.includes(c.label)),'Distractor is a look-alike letter: '+letter);
  assert.ok(!first0.choices.some(c=>c.label==='ل')||['ك','ل'].includes(letter),'No lam fallback distractor: '+letter);
  assert.ok(unit.lessons.some(l=>l.id.endsWith('-dictation-v2')&&l.tasks.every(t=>t.listen)),'Dictation by listening: '+unit.id);
  if(letter!=='ر'){
    assert.ok(word,'Connected reading: '+unit.id);
    assert.ok(clean(word.tasks[0].choices[word.tasks[0].answer].label).startsWith(letter),'The answer really starts with the target letter');
    assert.ok(word.tasks[0].choices.filter((_,i)=>i!==word.tasks[0].answer).every(c=>!clean(c.label).startsWith(letter)),'No distractor also starts with the target letter');
    assert.ok(word.guidedPractice.some(p=>p.title.includes('أكتب')),'Manual writing is a separate guided practice');
  }
  assert.ok(!JSON.stringify(phonics).includes('يِي')&&!JSON.stringify(phonics).includes('وُو'),'No awkward repeated long vowel');
  for(const value of phonics.phonics.long)assert.ok(phonics.tasks.some(t=>t.choices[t.answer].label===value),'Every displayed long vowel is a question target');
  for(const L of unit.lessons){
    assert.ok(!teacherNote.test(L.referenceLabel||''),'No teacher note in child UI: '+L.id);
    for(const s of L.steps){assert.ok(s.text.length<=40,'One short line per step: '+L.id+' '+s.text);assert.ok(s.scene,'Every step has a picture or symbol: '+L.id);assert.ok(s.say,'Every step can be heard: '+L.id);}
    for(const t of L.tasks)assert.ok(t.say,'Every task can be heard: '+L.id);
    const answers=L.tasks.map(t=>t.answer);if(L.tasks.length>2)assert.ok(new Set(answers).size>1,'Answer position varies: '+L.id);
  }
}
for(const unit of first.units.filter(u=>u.id.includes('review'))){
  const all=unit.lessons.find(l=>l.id.endsWith('-all-v2'));
  assert.deepEqual(plain(all.tasks.map(t=>t.choices[t.answer].label)),plain(all.reviewTargets),'No review target is permanently omitted');
  assert.ok(all.steps.length===1&&all.steps[0].text.length<20,'Short review');
}
for(const id of ['ar-help','ar-country','ar-water','ar-butterfly','ar-monkey']){
  const reading=first.units.find(u=>u.id===id).lessons[0];
  assert.ok(reading.passage.length>=4,'Real short passage: '+id);
  for(const s of reading.steps){assert.match(s.text,/[\u064e-\u0650]/);assert.equal(s.say,s.text,'Sentence audio matches the text');assert.ok(s.text.split(' ').length<=8,'Child-level sentence: '+s.text);}
  assert.ok(!reading.steps.some(s=>/ملخص|مشاهد دعم/.test(s.text)),'No summary disclaimer');
}
const cause=first.units.find(u=>u.id==='ar-butterfly').lessons.find(l=>l.id.endsWith('-cause-v2'));
assert.ok(cause.tasks[0].choices[cause.tasks[0].answer].label.includes('الْعَسَلَ'),'Bee activity assesses the central purpose, under its new progress ID');
const listening=first.units.flatMap(u=>u.lessons).flatMap(l=>l.tasks).filter(t=>t.listen).length;assert.ok(listening>=150,'Many listening tasks: '+listening);
for(const f of first.foundations)for(const s of f.steps)assert.ok(!/[\u064b-\u064d]/.test(s.scene?.value||''),'No tanween in early foundations: '+f.id);
for(const lesson of course(2).units.flatMap(u=>u.lessons)){
  assert.match(lesson.referenceLabel,/نص دعم أصلي/,'Support reading is not presented as a textbook passage');
  assert.equal(lesson.guidedPractice.length,4,'Book reading, discussion, composition and dictation have explicit adult guidance');
  const reading=lesson.steps[1].text;assert.match(reading,/[\u064b-\u0652]/,'Support reading has a vocalized model');
  const target=lesson.steps[2].scene.value;assert.ok(clean(reading).includes(clean(target)),'Glossary target actually occurs in its support reading');
}
assert.match(read('g1/shared/early.js'),/toLowerCase\(\),letter/,'English tracing offers lower and uppercase letters');
console.log('Early Arabic curriculum: old progress, phonics targets, full reviews, explicit support/source labels and ungraded home activities passed.');
