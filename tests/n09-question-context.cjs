'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const subjects=['g4/english','g5/math','g7/english'];
const expected={
 'g4/english':{U6L2:[0,1],U9L1:[11,12],U3L1:[0,1],U4L1:[9],U18L1:[10]},
 'g5/math':{U5L1:[0,1,2,6,7,8,9],U5L2:[0,1,2,3,4,5,6,7,8,9],U5L3:[0,1,2,3,5,6,7,9]},
 'g7/english':{U3L2:[0,1,2,3,4,5,6,7],U1L2:[11],U7L2:[9,11]}
};
function load(subject){
 const node={style:{},classList:{add(){},remove(){},contains(){return false}},dataset:{},setAttribute(){}};
 const ctx={window:{CFG:{key:'test',subject:subject.endsWith('english')?'english':'math'}},document:{querySelector:()=>node,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},location:{hash:''},addEventListener(){},console};
 vm.createContext(ctx);for(const file of ['content.js','core.js','les.js'])vm.runInContext(read(subject+'/'+file),ctx,{filename:subject+'/'+file});
 return {ctx,lessons:ctx.window.APP.gen.LES,app:ctx.window.APP};
}
const loaded={};let checked=0;
for(const subject of subjects){
 const state=loaded[subject]=load(subject),sw=read(subject+'/sw.js');
 for(const [id,indices] of Object.entries(expected[subject])){
  const lesson=state.lessons.find(lesson=>lesson.id===id),bank=state.app.gen.bookQs(lesson);
  for(const index of indices){
   const item=lesson.bmc[index],question=bank[index];assert.ok(question.context,subject+' '+id+' '+index+' has context after shuffling');
   assert.ok(fs.existsSync(path.join(root,subject,question.img)),'Source image is local');
   assert.ok(sw.includes(JSON.stringify(question.img)),'Source image is preloaded for offline questions, not dependent on prior lesson visits');
   assert.equal(question.context.page,Number(question.img.match(/p(\d+)\.webp$/)[1]),'The caption identifies the actual source page, including cross-page exercises');
   assert.equal(question.a,item[2]);
   state.app.quiz([question],{});const html=state.app.R.quiz();
   assert.ok(html.includes('<dialog')&&html.includes('العودة إلى السؤال'),'The source can be read and closed inside the attempt');
   assert.ok(html.includes('aria-labelledby="qcontext-dialog-title"'),'The source dialog has an accessible name');
   if(question.context.rows){assert.ok(html.includes('scope="col"')&&html.includes('scope="row"'),'Table headings remain readable and associated with data');assert.ok(question.context.rows.every(row=>row.length===question.context.headers.length));}
   if(question.context.paragraphs)assert.ok(html.includes('dir="ltr"'),'English source text uses the reading direction of the book');
   checked++;
  }
 }
}
const get=(subject,id,index)=>loaded[subject].lessons.find(lesson=>lesson.id===id).bmc[index];
const answer=item=>item[1][item[2]],rows=item=>Array.from(item[5].rows,row=>Array.from(row));
const sunday=get('g4/english','U6L2',0);assert.equal(answer(sunday),rows(sunday).find(row=>row[0]==='Sunday')[1]);
const tuesday=get('g4/english','U6L2',1);assert.equal(answer(tuesday),rows(tuesday).find(row=>row[1]==='English, science, Arabic')[0]);
assert.ok(get('g4/english','U9L1',12)[5].paragraphs.join(' ').includes('On Saturdays I ride my bike.'));
const total=get('g5/math','U5L1',2);assert.equal(Number(answer(total)),rows(total).reduce((sum,row)=>sum+Number(row[1]),0));
const marks=get('g5/math','U5L1',8);assert.equal(Number(answer(marks)),Number(rows(marks).find(row=>row[0]==='8')[1]));
const grapes=get('g5/math','U5L2',4);assert.equal(Number(answer(grapes).match(/\d+/)[0]),rows(grapes).reduce((sum,row)=>sum+Number(row[1]),0));
const temperature=get('g5/math','U5L3',6);assert.equal(answer(temperature),rows(temperature).reduce((min,row)=>Number(row[1])<Number(min[1])?row:min)[0]);
for(const id of ['U5L1','U5L2','U5L3'])for(const item of loaded['g5/math'].lessons.find(lesson=>lesson.id===id).bmc)assert.doesNotMatch(item[0],/الجدول نفسه|البيانات نفسها|التمثيل نفسه/,'Statistics prompts do not refer to another randomly ordered question');
const koko=get('g7/english','U3L2',0)[5].paragraphs.join(' ');for(const fact of ['two thousand words','hundreds of kilometres','Bees dance when they find food','He talks to them in their languages'])assert.ok(koko.includes(fact),'The passage contains the information needed by every comprehension question');
const usually=get('g7/english','U1L2',11);assert.match(usually[0],/immediately after aren’t/);assert.match(answer(usually),/aren’t usually/);assert.match(usually[5].feedback,/مواضع أخرى/);
for(const index of [9,11]){const yet=get('g7/english','U7L2',index);assert.match(yet[0],/yet at the end/);assert.match(answer(yet),/yet[.?]$/);assert.match(yet[5].feedback,/مواضع أخرى/);}
// Source strings are escaped even when a future editor inserts markup.
const app=loaded['g4/english'].app;app.quiz([{q:'test',o:['one','two'],a:0,img:'bookimg/p36.webp',context:{title:'<img onerror="test">',page:36,paragraphs:['<script>test</script>']}}],{});
const escaped=app.R.quiz();assert.ok(escaped.includes('&lt;script&gt;test&lt;/script&gt;'));assert.ok(!escaped.includes('<img onerror='));
const base=process.env.CACHE_BASE_REF||'origin/main',previous=file=>execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const version=text=>{const match=text.match(/\bconst V='([^']+)'/);assert.ok(match);return match[1];};
for(const subject of subjects)if(['content.js','core.js','core.css','les.js'].some(file=>read(subject+'/'+file).replace(/\r\n/g,'\n')!==previous(subject+'/'+file).replace(/\r\n/g,'\n')))assert.notEqual(version(read(subject+'/sw.js')),version(previous(subject+'/sw.js')),'Every changed subject has a new cache version without pinning the release name');
console.log('PASS: '+checked+' independent question contexts, source data, constrained grammar tasks, accessible escaped rendering and offline cache updates');
