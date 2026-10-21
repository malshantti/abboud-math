'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const normalize=x=>JSON.parse(JSON.stringify(x));
function course(g,withExtra){const context={window:{}};vm.createContext(context);vm.runInContext(read(`g${g}/life/content.js`),context);if(withExtra)vm.runInContext(read(`g${g}/life/book-activities.js`),context);return context;}
for(const g of [1,2]){
 const ctx=course(g,true),C=ctx.window.G1_COURSE,original=course(g,false).window.G1_COURSE;
 const lessons=[...C.foundations,...C.units.flatMap(u=>u.lessons)],previous=[...original.foundations,...original.units.flatMap(u=>u.lessons)],added=lessons.filter(l=>!previous.some(p=>p.id===l.id));
 assert(added.length>=18,'Verified source gaps now have separate short activities');
 assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 for(const old of previous){const current=lessons.find(l=>l.id===old.id);assert.deepEqual(normalize(current),normalize(old),'Old lesson and completion meaning unchanged: '+old.id);}
 vm.runInContext(read(`g${g}/shared/art.js`),ctx);vm.runInContext(read(`g${g}/shared/life-art.js`),ctx);
 for(const L of added){
  assert(L.id.startsWith(g===1?'l-book-':'l2-book-'));assert(L.steps.length>=1&&L.steps.length<=6);assert(L.tasks.length>=2&&L.tasks.length<=4);
  assert(C.books.some(b=>b.id===L.book));assert(Number.isInteger(L.page)&&L.page>0);
  for(const task of L.tasks){assert(task.choices.length>=2&&task.choices.length<=4);assert(new Set(task.choices.map(c=>c.label)).size===task.choices.length);assert(task.choices[task.answer]);}
  for(const scene of [...L.steps.map(s=>s.scene),...L.tasks.map(t=>t.scene)].filter(Boolean)){
   const rendered=ctx.window.G1_ART.scene(scene);assert(rendered&&!rendered.includes('رسم توضيحي'),'Every claimed drawing has a real local renderer');
   assert(!/<script\b|onerror\s*=|onload\s*=/.test(rendered));
  }
  assert(!/\p{Extended_Pictographic}/u.test(JSON.stringify(L)));
 }
 vm.runInContext(read(`g${g}/shared/early.js`),ctx);
 const completed=Object.fromEntries(previous.map(L=>[L.id,{at:'2026-10-21T10:00:00Z',attempts:1}]));
 const kept=ctx.window.G1_PROGRESS.normalize({version:1,completed,last:previous[0].id,rounds:1},lessons.map(l=>l.id));
 assert.equal(Object.keys(kept.completed).length,previous.length);assert(added.every(l=>!kept.completed[l.id]),'Old progress never credits new book objectives');
 const sw=read(`g${g}/life/sw.js`);assert(sw.includes('"book-activities.js"'));
 const html=read(`g${g}/life/index.html`);assert(html.indexOf('book-activities.js')>html.indexOf('content.js'));assert(html.indexOf('book-activities.js')<html.indexOf('early.js'));
 const base=process.env.CACHE_BASE_REF||'origin/main',dep=`g${g}/life/book-activities.js`;
 let old=null;try{old=cp.execFileSync('git',['show',base+':'+dep],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch{}
 if(old===null||old.replace(/\r\n/g,'\n')!==read(dep).replace(/\r\n/g,'\n')){const oldSW=cp.execFileSync('git',['show',base+`:g${g}/life/sw.js`],{cwd:root,encoding:'utf8'});assert.notEqual(sw.match(/const V='([^']+)'/)[1],oldSW.match(/const V='([^']+)'/)[1]);}
 const find=id=>lessons.find(l=>l.id===id),answer=t=>t.choices[t.answer].label;
 if(g===1){
  assert.deepEqual(normalize(find('l-book-months').tasks.map(answer)),['١٢','آذار','٤']);
  assert.deepEqual(normalize(find('l-book-relatives').tasks.map(answer)),['العمّ','الخالة','العمّة']);
  assert.deepEqual(normalize(find('l-book-covering').tasks.map(answer)),['ريش','صوف','قشور']);
  assert.equal(find('l-book-summer').page,101);assert(find('l-book-crossing').homeActivity.text.includes('داخل البيت'));
 }else{
  assert.deepEqual(normalize(find('l2-book-push-pull').tasks.map(answer)),['دفع','سحب']);
  assert.deepEqual(normalize(find('l2-book-edible-parts').tasks.map(answer)),['الجذر','ساق أرضية','الأوراق']);
  assert.equal(answer(find('l2-book-water-properties').tasks[1]),'يأخذ شكل الإناء الآخر');
  assert.equal(answer(find('l2-book-leaves').tasks[0]),'الزيتون');
  assert.equal(answer(find('l2-book-animal-food').tasks[2]),'القوارت');
 }
}
console.log('PASS verified life book skills: objectives, local scenes, answer keys, old progress and offline module');
