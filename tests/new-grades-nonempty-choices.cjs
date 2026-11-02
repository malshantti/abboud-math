'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let questions=0,target;
for(const grade of [4,5,7])for(const subject of ['math','arabic','english','science']){
 const c={window:{}};vm.runInNewContext(read(`g${grade}/${subject}/content.js`),c);
 for(const unit of c.window.UNITS)for(const lesson of unit.les)for(const [i,b] of (lesson.bmc||[]).entries()){
  const place=`g${grade}/${subject}/${lesson.id}/${i}`;
  assert.ok(b[1].length>=2,place+' has at least two choices');assert.ok(Number.isInteger(b[2])&&b[2]>=0&&b[2]<b[1].length,place+' has a valid answer key');
  b[1].forEach((option,index)=>assert.ok(typeof option==='string'&&option.trim().length,place+' choice '+index+' has visible text'));questions++;
  if(grade===7&&subject==='math'&&lesson.id==='U5L1'&&i===4){target=b;const app={R:{},S:{done:{},seen:{}},ar:s=>String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),save:()=>{}};c.window.APP=app;c.window.CFG={subject};vm.runInNewContext(read('g7/math/les.js'),c);const q=app.gen.bookQs(lesson)[i];assert.deepEqual(Array.from(q.o),['حاصرتين { }','قوسين ( )','عارضتين']);assert.equal(q.o[q.a],'حاصرتين { }');assert.ok(q.q.includes('٦ ج٢'),'Printed page reference survives');}
 }
}
assert.ok(target);assert.equal(target[3],1006);assert.equal(target[1][target[2]],'حاصرتين { }');
const base=process.env.CACHE_BASE_REF||'origin/main',before=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replace(/\r\n/g,'\n');
if(read('g7/math/content.js').replace(/\r\n/g,'\n')!==before('g7/math/content.js')){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read('g7/math/sw.js')),version(before('g7/math/sw.js')));}
console.log('PASS: '+questions+' book questions across 12 subjects have nonempty choices and valid keys; repaired sets question retains its correct answer');
