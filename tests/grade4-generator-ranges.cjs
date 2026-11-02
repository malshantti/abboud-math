'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let random=Math.random;
const c={window:{},Math:Object.assign(Object.create(Math),{random:()=>random()})};
vm.createContext(c);vm.runInContext(read('g4/math/content.js'),c);vm.runInContext(read('g4/math/mgen.js'),c);
const lessons=c.window.UNITS.flatMap(u=>u.les),lesson=id=>lessons.find(l=>l.id===id),g=c.window.MG;
assert.ok(lesson('U1L1').gen.includes('g4place6'));
assert.ok(!lesson('U1L1').gen.includes('g4place'));
assert.ok(lesson('U1L2').gen.includes('g4place')&&lesson('U1L3').gen.includes('g4place'),'Millions lessons retain their seven-digit generator');
assert.deepEqual(Array.from(lesson('U3L3').gen),['g4div']);assert.deepEqual(Array.from(lesson('U3L4').gen),['g4divr']);
const nums=s=>String(s).replace(/[,\u2066\u2069]/g,'').match(/\d+/g).map(Number);
for(const edge of [0,1-Number.EPSILON]){
 random=()=>edge;
 const six=nums(g.g4place6().q).at(-1),seven=nums(g.g4place().q).at(-1);
 assert.equal(six,edge?999999:100000);assert.equal(seven,edge?9999999:1000000);
 const reading=g.g4read();for(const option of reading.o)assert.ok(nums(option)[0]>=0&&nums(option)[0]<=999999,'Reading distractors stay within the lesson limit at both endpoints');
}
// Exhaust the divisor/remainder endpoints rather than rely only on random samples.
for(let d=2;d<=9;d++)for(const high of [false,true]){
 let sequence=[(d-2+.1)/8,high?1-Number.EPSILON:0];random=()=>sequence.shift()??0;
 const q=g.g4div(),[n,divisor]=nums(q.q),quotient=nums(q.o[q.a])[0];
 assert.equal(divisor,d);assert.ok(n>=10&&n<=99);assert.equal(n,divisor*quotient);
 for(let remainder=1;remainder<d;remainder++){
  sequence=[(d-2+.1)/8,(remainder-1+.1)/(d-1),high?1-Number.EPSILON:0];random=()=>sequence.shift()??0;
  const q=g.g4divr(),[n,divisor]=nums(q.q),[quotient,actualRemainder]=nums(q.o[q.a]);
  assert.equal(divisor,d);assert.equal(actualRemainder,remainder);assert.ok(n>=10&&n<=99);assert.equal(n,divisor*quotient+remainder);
 }
}
let seed=78329;random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
for(let i=0;i<2000;i++){
 const reading=g.g4read();for(const option of reading.o)assert.ok(nums(option)[0]>=0&&nums(option)[0]<=999999);
 for(const key of ['g4place6','g4place']){const q=g[key](),[digit,n]=nums(q.q),value=nums(q.o[q.a])[0];assert.ok(n>=(key==='g4place6'?100000:1000000)&&n<=(key==='g4place6'?999999:9999999));assert.ok(value>0&&String(value)[0]===String(digit));}
 for(const key of ['g4div','g4divr']){const q=g[key](),[n,d]=nums(q.q),a=nums(q.o[q.a]);assert.ok(n>=10&&n<=99);assert.ok(d>=2&&d<=9);assert.equal(n,d*a[0]+(key==='g4divr'?a[1]:0));if(key==='g4divr')assert.ok(a[1]>0&&a[1]<d);assert.equal(q.o.filter(x=>x===q.o[q.a]).length,1);}
}
const base=process.env.CACHE_BASE_REF||'origin/main',normalize=s=>s.replace(/\r\n/g,'\n'),before=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
if(['content.js','mgen.js'].some(f=>normalize(read('g4/math/'+f))!==normalize(before('g4/math/'+f)))){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read('g4/math/sw.js')),version(before('g4/math/sw.js')));}
console.log('PASS grade-four generator ranges: lesson links, six/seven-digit limits, bounded reading distractors, all divisor/remainder endpoints and 10000 seeded questions');
