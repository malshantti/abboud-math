'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=(source,window={})=>{const context={window};vm.runInNewContext(source,context);return context.window;};
const plain=value=>JSON.parse(JSON.stringify(value));
for(const grade of [1,2]){
 const file=`g${grade}/life/content.js`,C=load(read(file)).G1_COURSE;
 const old=load(cp.execFileSync('git',['show',(process.env.CACHE_BASE_REF||'origin/main')+':'+file],{cwd:root,encoding:'utf8'})).G1_COURSE;
 const lessons=[...C.foundations,...C.units.flatMap(u=>u.lessons)],oldLessons=[...old.foundations,...old.units.flatMap(u=>u.lessons)];
 assert.equal(C.key,old.key,'Existing storage key remains intact');
 for(const L of oldLessons){
  const current=lessons.find(l=>l.id===L.id);assert(current,'Old completion ID preserved: '+L.id);
  assert.equal(current.tasks.length,L.tasks.length,'No new assessed objective in an already completed ID');
  for(let i=0;i<L.tasks.length;i++){
   assert.equal(current.tasks[i].answer,L.tasks[i].answer,'Previous answer mapping preserved');
   assert.deepEqual(plain(current.tasks[i].choices),plain(L.tasks[i].choices),'Previous choices preserved');
  }
 }
 const progress=load(read(`g${grade}/shared/early.js`)).G1_PROGRESS;
 const completed=Object.fromEntries(oldLessons.map(l=>[l.id,{at:'2026-10-20T10:00:00Z',attempts:1}]));
 const normalized=progress.normalize({version:1,completed,rounds:0,last:oldLessons[0].id},lessons.map(l=>l.id));
 assert.deepEqual(Object.keys(normalized.completed).sort(),Object.keys(completed).sort(),'Old progress survives; new objectives not credited');
 const window=load(read(`g${grade}/shared/art.js`));const original=window.G1_ART;
 load(read(`g${grade}/shared/life-art.js`),window);
 assert.equal(window.G1_ART.icon,original.icon,'Existing icon system reused');
 assert.equal(window.G1_ART.scene({type:'shape',value:'circle'}),original.scene({type:'shape',value:'circle'}),'Other scene types unchanged');
 for(const L of lessons){
  for(const s of [...L.steps.map(x=>x.scene),...L.tasks.flatMap(x=>[x.scene,...x.choices.map(c=>c.scene)])].filter(Boolean)){
   const rendered=window.G1_ART.scene(s);assert(rendered,'Every educational scene renders');
   assert(!/<script\b|onerror\s*=|onload\s*=/i.test(rendered),'Scenes cannot inject event handlers');
  }
 }
 for(const descriptor of [{kind:'plant',focus:'<script>'},{kind:'state',state:'<img onerror=alert(1)>'},{kind:'__proto__'}]){
  assert(!/<script\b|onerror\s*=/.test(window.G1_ART.scene({type:'symbol',value:'آمن',life:descriptor})));
 }
 const sw=read(`g${grade}/life/sw.js`),prevSW=cp.execFileSync('git',['show',(process.env.CACHE_BASE_REF||'origin/main')+`:g${grade}/life/sw.js`],{cwd:root,encoding:'utf8'});
 const dependencies=[file,`g${grade}/life/index.html`,`g${grade}/shared/life-art.js`,`g${grade}/shared/early.js`,`g${grade}/shared/art.js`,`g${grade}/shared/early.css`,'assets/early/early-ui.css'];
 if(grade===2)dependencies.push('g2/life/palestine-outline.svg');
 const changed=dependencies.some(dep=>{try{return read(dep).replace(/\r\n/g,'\n')!==cp.execFileSync('git',['show',(process.env.CACHE_BASE_REF||'origin/main')+':'+dep],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).replace(/\r\n/g,'\n');}catch{return true;}});
 if(changed)assert.notEqual(sw.match(/const V='([^']+)'/)[1],prevSW.match(/const V='([^']+)'/)[1],'Changed dependency requires a changed cache version, without a fixed expected name');
 assert(sw.includes('../shared/life-art.js'),'Offline diagram module');
 const idx=read(`g${grade}/life/index.html`);assert(idx.indexOf('life-art.js')>idx.indexOf('art.js'));assert(idx.indexOf('life-art.js')<idx.indexOf('early.js'));
 if(grade===1){
  const animal=lessons.find(l=>l.id==='l-5-1').tasks[0];assert(animal.prompt.includes('يعيش'));assert(!animal.prompt.includes('يسبح'));
  for(const id of ['l-1-touch-taste','l-3-water-well','l-4-zaatar'])assert(lessons.some(l=>l.id===id),'Distinct objective keeps its own completion ID');
  const senses=lessons.find(l=>l.id==='l-1-touch-taste');assert.deepEqual(plain(senses.tasks.map(t=>t.choices[t.answer].label)),['اللسان','بالجلد']);
  const well=lessons.find(l=>l.id==='l-3-water-well');assert.equal(well.page,83);assert(well.homeActivity.text.includes('لا نذهب إلى بئر'));
  const zaatar=lessons.find(l=>l.id==='l-4-zaatar');assert(zaatar.references.some(r=>r.page===16));assert(lessons.find(l=>l.id==='l-4-2').referenceLabel.includes('تدريب إضافي'));
 }else{
  const states=lessons.find(l=>l.id==='l2-3-states');assert.deepEqual(plain(states.tasks.map(t=>t.choices[t.answer].label)),['صلبة','سائلة','غازيّة']);assert(states.steps[1].text.includes('لا نراه'));
  assert(lessons.find(l=>l.id==='l2-2-oil-order').tasks[0].choices[0].label.startsWith('نقطف الثمار، ثم ننقلها إلى المعصرة'));
  assert(!lessons.find(l=>l.id==='l2-2-2').goal.includes('أرتّب'),'Existing recognition lesson does not claim sequence assessment');
  const map=lessons.find(l=>l.id==='l2-1-map');assert.equal(map.page,8);assert.equal(map.tasks[0].choices[map.tasks[0].answer].scene.life.kind,'map');
  assert(sw.includes('palestine-outline.svg'));
  const svg=read('g2/life/palestine-outline.svg');assert(svg.includes('tw2-p1.pdf')&&svg.includes('printed 8'),'Traceable official geographical reference');assert(!/<image\b|https?:\/\/[^\s]+\.(png|jpg)/i.test(svg),'No remote raster needed offline');
  assert(lessons.find(l=>l.id==='l2-4-1').homeActivity.text.includes('الجزء الناقص'));
 }
}
console.log('PASS life curriculum: precise prompts, new objective IDs, old progress, diagrams, sources, offline assets');
