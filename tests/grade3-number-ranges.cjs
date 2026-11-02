'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const elements=new Map(),element=s=>{if(!elements.has(s))elements.set(s,{textContent:'',hidden:false,classList:{toggle(){}},setAttribute(){}});return elements.get(s)};
const modes=['4','5'].map(compareDigits=>({dataset:{compareDigits},classList:{toggle(){}},setAttribute(){}}));
const signs=['>','<','='].map(s=>({dataset:{s}}));
let state=0x143,queue=[];
const rnd=n=>{if(queue.length){const v=queue.shift();assert.ok(v>=0&&v<n,'Forced random branch stays in range');return v}state=(Math.imul(1664525,state)+1013904223)>>>0;return Math.floor(state/2**32*n)};
const app={rnd,ar:String,shuffle:a=>a.slice(),esc:String,$:element,$$:s=>s==='[data-compare-digits]'?modes:s==='[data-s]'?signs:[],addXP(){},R:{},S:{done:{},seen:{}},save(){},checkAch(){},ic:()=>''};
let pending=null;
const c={window:{APP:app,CFG:{subject:'math'}},setTimeout(fn){pending=fn;return 1},clearTimeout(){pending=null}};vm.createContext(c);
vm.runInContext(read('g3/math/content.js'),c);vm.runInContext(read('g3/math/math.js'),c);
const {gen,labs}=c.window.G3X;
function comparisonQuestion(q,lo,hi){
 const numbers=q.q.match(/\d+/g).map(Number);assert.ok(numbers.every(n=>n>=lo&&n<=hi),'Every compared number fits its lesson');
 if(q.keep){const [a,b]=numbers,s=a>b?'>':a<b?'<':'=';assert.equal(q.o[q.a],s,'Comparison key agrees with numbers')}
 else {assert.ok(q.o.every(n=>+n>=lo&&+n<=hi),'Every ordering choice fits its lesson');assert.equal(+q.o[q.a],q.q.includes('الأكبر')?Math.max(...numbers):Math.min(...numbers))}
 assert.equal(new Set(q.o).size,q.o.length,'Choices remain unique');
}
for(const [key,lo,hi] of [['cmp4',1000,9999],['cmp5',10000,99999]]){
 for(let i=0;i<6000;i++)comparisonQuestion(gen[key](),lo,hi);
 for(const forced of [[1,hi-lo,1,1,String(hi).length-1],[1,0,1,0,String(lo).length-1],[0,hi-lo,hi-lo,hi-lo],[0,0,0,0]]){
  queue=forced.slice();comparisonQuestion(gen[key](),lo,hi);assert.equal(queue.length,0);
 }
}
queue=[0,999];const borrow=gen.subBorrow();assert.equal(+borrow.o[borrow.a],1,'2000 minus 1999 is one');assert.ok(borrow.o.every(n=>+n>=0),'No negative distractor for a positive difference');
for(const key of ['subNo','subBorrow'])for(let i=0;i<4000;i++){
 const q=gen[key](),[a,b]=q.q.match(/\d+/g).map(Number);assert.equal(+q.o[q.a],a-b);assert.ok(q.o.every(n=>Number.isInteger(+n)&&+n>=0),'Subtraction choices are nonnegative whole numbers');
}
vm.runInContext(read('g3/shared/g3.js'),c);
assert.ok(app.R.u('m3').includes('href="#/l/compare/4"'));
assert.ok(app.R.u('m11').includes('href="#/l/compare/5"'));
assert.ok(app.R.l('compare','5').includes('data-compare-digits="5" aria-pressed="true"'));
for(const mode of [undefined,'4','5','unexpected']){
 app.R.after_l('compare',mode);const digits=mode==='5'?5:4;
 for(let i=0;i<1000;i++){
  element('#cn').onclick();const [a,b]=['#ca','#cb'].map(s=>+element(s).textContent);assert.ok([a,b].every(n=>String(n).length===digits),'Lab respects its selected digit count');
  assert.equal(element('#cm').hidden,true,'New numbers clear prior feedback');
  signs.find(x=>x.dataset.s===(a>b?'>':a<b?'<':'=')).onclick();assert.equal(element('#cm').textContent,'صحيح!');
 }
}
labs.compare.init('4');modes[1].onclick();assert.ok(+element('#ca').textContent>=10000);assert.ok(+element('#cb').textContent>=10000);modes[0].onclick();assert.ok(+element('#ca').textContent<=9999);assert.ok(+element('#cb').textContent<=9999);
{const a=+element('#ca').textContent,b=+element('#cb').textContent;signs.find(x=>x.dataset.s===(a>b?'>':a<b?'<':'=')).onclick();assert.equal(typeof pending,'function');app.stopSim();assert.equal(pending,null,'Leaving the lab cancels its delayed next comparison');}
const base=process.env.CACHE_BASE_REF||'origin/main',previous=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replace(/\r\n/g,'\n'),changed=f=>read(f).replace(/\r\n/g,'\n')!==previous(f),version=s=>s.match(/const V=['"]([^'"]+)/)[1];
for(const subject of ['math','arabic','english','science'])if(changed('g3/shared/g3.js')||(subject==='math'&&['content.js','math.js'].some(f=>changed('g3/math/'+f)))){const f='g3/'+subject+'/sw.js';assert.notEqual(version(read(f)),version(previous(f)),'Changed shared renderer receives changed subject caches')}
console.log('PASS grade3 number ranges: 12000 comparisons, 8000 subtraction questions, boundary branches and contextual lab modes');
