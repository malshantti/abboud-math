'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ctx=vm.createContext({window:{}});
vm.runInContext(read('g5/math/content.js'),ctx);
const lessons=ctx.window.UNITS.flatMap(unit=>unit.les);
const item=(id,index)=>lessons.find(lesson=>lesson.id===id).bmc[index-1];
const acceptedIndices=(question,predicate)=>Array.from(question[1]).flatMap((text,index)=>predicate(text)?[index]:[]);
const primeExample=item('U1L1',5);
const satisfiesPrimeExample=text=>{
 const match=text.match(/^(\d+)\s*=\s*(\d+)\s*\+\s*(\d+)$/);
 assert.ok(match,'Every option is an explicit sum: '+text);
 const [,total,left,right]=match.map(Number);
 const prime=total>2&&Array.from({length:Math.floor(Math.sqrt(total))-1},(_,i)=>i+2).every(divisor=>total%divisor!==0);
 return prime&&total===left+right&&left%2!==right%2;
};
assert.deepEqual(acceptedIndices(primeExample,satisfiesPrimeExample),[primeExample[2]],'The index-based grader accepts every option satisfying the odd/even example instruction');
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
for(const [index,numerator,denominator] of [[2,15,70],[4,15,90]]){
 const question=item('U2L2',index);
 assert.match(question[0],/بأبسط صورة/,'Restore the textbook constraint instead of rejecting equivalent fractions without explanation');
 const satisfiesInstruction=text=>{
  const match=text.match(/^(\d+)\/(\d+)$/);
  assert.ok(match,'Every fraction option has an explicit nonzero denominator: '+text);
  const [,n,d]=match.map(Number);assert.ok(d>0);
  return n*denominator===numerator*d&&gcd(n,d)===1;
 };
 assert.deepEqual(acceptedIndices(question,satisfiesInstruction),[question[2]],'Exactly the marked fraction satisfies both the product and simplest-form instruction');
 assert.ok(question[1].filter(text=>{const [n,d]=text.split('/').map(Number);return n*denominator===numerator*d;}).length>=2,'Equivalent values remain intentional distractors under the explicit simplification constraint');
}
const cacheVersion=text=>{const match=text.match(/\bconst V='([^']+)'/);assert.ok(match);return match[1];};
const base=process.env.CACHE_BASE_REF||'origin/main';
const previous=execFileSync('git',['show',base+':g5/math/sw.js'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const previousContent=execFileSync('git',['show',base+':g5/math/content.js'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
const currentVersion=cacheVersion(read('g5/math/sw.js'));
if(read('g5/math/content.js')!==previousContent)assert.notEqual(currentVersion,cacheVersion(previous),'Modified subject has a new cache version; do not pin a release name');
console.log('PASS: grade-five examples have exactly one answer satisfying their full instruction; cache update verified when subject content differs');
