'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const c={window:{}};vm.runInNewContext(read('g4/math/content.js'),c);
const unit=c.window.UNITS.find(u=>u.id==='U1'),lesson=unit.les.find(l=>l.id==='U1L3'),b=lesson.bmc[8];
assert.ok(b[0].includes('٧ الأوّل من اليسار في العدد ٣٢٩٠٧٧٤'),'The repeated digit is identified by its position');
const number='3290774',index=number.indexOf('7'),value=7*10**(number.length-index-1);
assert.equal(value,700);assert.equal(Number(b[1][b[2]]),value,'The key matches the specified occurrence');
assert.equal(b[1].filter(o=>Number(o)===value).length,1,'One correct answer');
assert.equal(b[3],18,'The textbook reference is retained');
const ar=s=>String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const app={R:{},S:{done:{},seen:{}},ar,esc:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),save:()=>{}};
c.window.APP=app;c.window.CFG={subject:'math'};vm.runInNewContext(read('g4/math/les.js'),c);
const q=app.gen.bookQs(lesson)[8];assert.ok(q.q.includes('٧ الأوّل من اليسار'));assert.equal(Number(q.o[q.a]),value);assert.ok(q.q.includes('١٨ ج١'));
const base=process.env.CACHE_BASE_REF||'origin/main',previous=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replace(/\r\n/g,'\n');
if(read('g4/math/content.js').replace(/\r\n/g,'\n')!==previous('g4/math/content.js')){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read('g4/math/sw.js')),version(previous('g4/math/sw.js')),'Changed content receives a changed cache');}
console.log('PASS grade4 place value: identified digit, mathematical key, lesson adapter and cache change');
