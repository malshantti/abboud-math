'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
let seed=20261101,sequence=[];
const math=Object.create(Math);
math.random=()=>sequence.length?sequence.shift():((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const ctx=vm.createContext({window:{},Math:math});
vm.runInContext(read('g5/math/mgen.js'),ctx);
const plain=text=>String(text).replace(/<[^>]+>/g,'').replace(/[\u2066-\u2069]/g,'');
const seen=new Set();let checks=0;
function check(question){
 const prompt=plain(question.q),options=Array.from(question.o,plain);
 assert.equal(options.length,4,'There are four distinct options');
 assert.equal(new Set(options).size,options.length,'Options are distinct');
 let expected;
 if(prompt.includes('أطوال أضلاعه')){
  const sides=prompt.match(/أضلاعه ([\d، ]+) سم/)[1].split('،').map(Number);
  assert.equal(sides.length,3);
  assert.ok(sides.every(side=>side>0));
  const sorted=[...sides].sort((a,b)=>a-b);
  assert.ok(sorted[0]+sorted[1]>sorted[2],'Lengths form a nondegenerate triangle: '+sides.join(', '));
  expected=new Set(sides).size===1?'متساوي الأضلاع':new Set(sides).size===2?'متساوي الساقين':'مختلف الأضلاع';
  assert.match(prompt,/التصنيف|تصنيفه/);
  assert.match(prompt,/الأكثر تحديدًا/,'Equilateral and isosceles overlap; request the most specific classification');
  if(expected==='متساوي الأضلاع')assert.match(question.ex,/أيضًا متساوي الساقين/,'The inclusive textbook definition remains explicit');
 }else{
  const angles=(prompt.match(/\d+(?=°)/g)||[]).map(Number);
  assert.equal(angles.length,3);
  assert.ok(angles.every(angle=>angle>0&&angle<180),'Angles are positive and below a straight angle');
  assert.equal(angles.reduce((sum,angle)=>sum+angle,0),180,'Triangle angles sum to 180 degrees');
  expected=angles.includes(90)?'قائم الزاوية':Math.max(...angles)>90?'منفرج الزاوية':'حادّ الزوايا';
 }
 assert.equal(options[question.a],expected,'The marked classification follows independently computed lengths/angles');
 assert.equal(options.filter(option=>option===expected).length,1,'Exactly one option is the requested classification');
 assert.ok(!options.some(option=>/متطابق الأضلاع|متطابق الضلعين/.test(option)),'Use the fifth-grade textbook terminology');
 seen.add(expected);checks++;
}
// Reproduce the former failure: this input used to emit 3,3,6 and accept it.
sequence=[0.1,0.4,0,0.99];check(ctx.window.MG.g5tri());
// Exercise the complete integer domain of the side-generation branches, including every boundary.
for(let kind=0;kind<3;kind++)for(let side=3;side<=12;side++){
 const limit=Math.min(3,side-1);
 for(let extra=1;extra<=(kind===1?limit:1);extra++){
  sequence=[0.1,(kind+0.1)/3,(side-3+0.1)/10,(extra-1+0.1)/limit];
  check(ctx.window.MG.g5tri());sequence=[];
 }
}
for(let i=0;i<10000;i++)check(ctx.window.MG.g5tri());
assert.equal(seen.size,6,'Both angle and side classifications are covered');
vm.runInContext(read('g5/math/content.js'),ctx);
const lesson=ctx.window.UNITS.flatMap(unit=>unit.les).find(lesson=>lesson.id==='U4L1');
const isosceles=lesson.terms.find(term=>term[0]==='المثلث متساوي الساقين');
assert.ok(isosceles);
assert.match(isosceles[1],/على الأقل/,'The definition includes equilateral triangles, matching textbook p75');
assert.ok(lesson.pts.some(point=>/متساوي الأضلاع هو أيضًا متساوي الساقين/.test(point)));
assert.equal(lesson.bmc[9][1][lesson.bmc[9][2]],'متساوي الساقين','The textbook containment question remains correct');
assert.doesNotMatch(read('g5/math/lab.js'),/متطابق الأضلاع|متطابق الضلعين/,'The linked triangle lab uses the same textbook terminology');
const version=text=>{const match=text.match(/\bconst V='([^']+)'/);assert.ok(match);return match[1];};
const base=process.env.CACHE_BASE_REF||'origin/main';
const previous=file=>execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).replace(/\r\n/g,'\n');
const currentVersion=version(read('g5/math/sw.js'));
if(['content.js','mgen.js','lab.js'].some(file=>read('g5/math/'+file)!==previous('g5/math/'+file)))assert.notEqual(currentVersion,version(previous('g5/math/sw.js')),'Subject modifications invalidate the cache without pinning its release name');
console.log('PASS: '+checks+' triangle questions, all side boundaries, unique classifications, textbook terminology and cache update');
