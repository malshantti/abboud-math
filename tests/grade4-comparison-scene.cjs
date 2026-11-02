'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),context={window:{}};vm.runInNewContext(read('g4/math/lesson-visuals.js'),context);const LV=context.window.LESSON_VISUALS;
assert.equal(LV.TYPES.U1L4,'wholeCompare');assert.equal(LV.TYPES.U2L5,'round','Rounding remains in its lesson');
assert.notEqual(LV.TYPES.U1L4,'compare','The fractional comparison engine is not used');
for(const [a,b,cmp,place] of [[3290774,3290744,'>','العشرات'],[3290744,3290774,'<','العشرات'],[1000000,999999,'>','الملايين'],[9999999,9999999,'=',''],[0,0,'=',''],[0,1,'<','الآحاد'],[10,9,'>','العشرات'],[1000001,1000000,'>','الآحاد'],[1000010,1000000,'>','العشرات'],[2000000,1000000,'>','الملايين']]){
 const m=LV.model('wholeCompare',{a,b});assert.equal(m.cmp,cmp,a+' vs '+b);assert.equal(m.place,place);assert.deepEqual(Array.from(m.order),[Math.min(a,b),Math.max(a,b)]);assert.equal(m.steps[2],(a+' '+cmp+' '+b).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]));
 for(let step=0;step<3;step++){const svg=LV.scene(m,step);assert.ok(svg.includes('<svg'));assert.ok(!/undefined|NaN|Infinity/.test(svg));assert.equal(svg.includes('lv-gold-soft'),step>=1&&a!==b);assert.ok(!svg.includes('≈'),'Comparison never shows rounding');}
 if(a===b)assert.equal(m.different,-1);else{assert.ok(m.different>=0);for(let i=0;i<m.different;i++)assert.equal(m.firstDigits[i],m.secondDigits[i],'Only equal higher places are skipped');}
}
const round=LV.model('round',{a:4372,b:2});assert.equal(round.result,4400);
const base=process.env.CACHE_BASE_REF||'origin/main',previous=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replace(/\r\n/g,'\n');
if(read('g4/math/lesson-visuals.js').replace(/\r\n/g,'\n')!==previous('g4/math/lesson-visuals.js')){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read('g4/math/sw.js')),version(previous('g4/math/sw.js')));}
console.log('PASS grade4 comparison scene: ordering, unequal lengths, every place, equality and unchanged rounding');
