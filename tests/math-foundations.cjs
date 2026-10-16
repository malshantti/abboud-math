/* T08: run with node tests/math-foundations.cjs; no dependencies or student storage. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let seed=20261016,checks=0;
const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const ctx=vm.createContext({Math:math,console});ctx.window=ctx;
for(const f of ['content.js','content5.js','gen.js','gen5.js'])vm.runInContext(read('g8/math/'+f),ctx,{filename:f});
const eq=(a,b)=>a[0]*b[1]===b[0]*a[1];
function number(s){s=s.replace(/[−]/g,'-').replace(/[\u2066-\u2069]/g,'').trim();
 const mixed=s.match(/^\((\d+) و (\d+)\/(\d+)\)$/);if(mixed)return[+mixed[1]*mixed[3]+ +mixed[2],+mixed[3]];
 s=s.replace(/^\((.*)\)$/,'$1');const m=s.match(/^(-?\d+)(?:\/(\d+))?$/);assert.ok(m,'number: '+s);return[+m[1],m[2]?+m[2]:1]}
function calculate(a,op,b){switch(op){case '+':return[a[0]*b[1]+b[0]*a[1],a[1]*b[1]];case '−':return[a[0]*b[1]-b[0]*a[1],a[1]*b[1]];case '×':return[a[0]*b[0],a[1]*b[1]];case '÷':assert.notEqual(b[0],0);return[a[0]*b[1],a[1]*b[0]];default:assert.fail(op)}}
const ops=['+','−','×','÷'],targets=['add','subtract','multiply','divide'];
for(const id of ['P01','P04'])for(let i=0;i<1600;i++){
 const item=ctx.genFor(id,i),s=item.steps[0],q=s.q.replace(/\u00a0/g,' ').replace(/^احسب في أبسط صورة: /,'').replace(/ = ؟$/,'');
 const parts=q.split(/ ([+−×÷]) /);assert.equal(parts.length,3);assert.equal(parts[1],ops[i%4]);
 const answer=calculate(number(parts[0]),parts[1],number(parts[2]));assert.ok(eq(number(s.a),answer),`${id}: ${q} = ${s.a}`);
 assert.equal(s.choices.filter(c=>c.ok).length,1);for(const c of s.choices)assert.equal(eq(number(c.t),answer),!!c.ok,`${q}: ${c.t}`);
 assert.ok(item.targets.includes(targets[i%4]));
 if(id==='P04'){assert.equal(item.targets.includes('mixed'),i%8>=4);assert.equal(/ و /.test(q),i%8>=4);if(parts[1]==='−')assert.ok(answer[0]>=0)}
 checks++;
}
// Random practice must still reach every operation and mixed numbers.
for(const id of ['P01','P04']){const reached=new Set();for(let i=0;i<400;i++)ctx.genFor(id).targets.forEach(t=>reached.add(t));for(const t of ctx.MATH_TARGETS[id])assert.ok(reached.has(t))}
assert.equal(ctx.mathTargetsMet('P04',{add:true,subtract:true,multiply:true,divide:true}),false);
assert.equal(ctx.mathTargetsMet('P01',{add:true,subtract:true,multiply:true}),false);
assert.equal(ctx.mathTargetsMet('P04',{add:true,subtract:true,multiply:true,divide:true,mixed:true}),true);
// Exercise the actual quiz engine and mastery callback with asynchronous user answers.
const app=read('g8/math/app.js');
const run=app.slice(app.indexOf('function quizRun('),app.indexOf('// عند نفاد'));
const view=app.slice(app.indexOf('V.quiz=id=>'),app.indexOf('// ---------- مراجعة الأخطاء'));
function quiz(id,correct,stripTargets=false,initial='untested'){
 const queue=[],seen=[],skills={[id]:{status:initial}},els={},original=ctx.genFor;let result;
 const c={window:ctx,Math:math,Date,cur:null,V:{},UNITS:{},S:{points:0,quizzes:[],hearts:100},
  $:s=>els[s]||(els[s]={innerHTML:''}),setBar(){},mmss:()=>'',save(){},countCorrect(){},checkAch(){},
  addPts(n){c.S.points+=n},sk:k=>skills[k]||(skills[k]={status:'untested'}),hearts:()=>100,I:()=>'',
  FX:{mega(){}},ltop:()=>'',setTimeout:f=>queue.push(f),showDone:(el,r)=>result=r,
  renderItem:(box,gid,item,mode,done)=>{seen.push(item);queue.push(()=>done(correct(seen.length-1,item),false,null))}};
 if(stripTargets)ctx.genFor=(gid,index)=>Object.assign({},original(gid,index),{targets:['add']});
 try{vm.createContext(c);vm.runInContext(run+'\n'+view,c);c.V.quiz(id);while(queue.length)queue.shift()();}
 finally{ctx.genFor=original}
 return{seen,skill:skills[id],result,S:c.S};
}
for(const id of ['P01','P04']){const r=quiz(id,()=>true);assert.equal(r.seen.length,8);assert.equal(r.skill.status,'mastered');assert.equal(r.S.quizzes[0].score,100);assert.equal(r.result.party,true)}
const incomplete=quiz('P04',()=>true,true);assert.equal(incomplete.skill.status,'learning');assert.equal(incomplete.result.party,false);assert.match(incomplete.result.sub,/عن كل عملية/);
const prior=quiz('P04',()=>false,false,'mastered');assert.equal(prior.skill.status,'mastered','do not downgrade saved mastery');
assert.match(ctx.CONTENT.P01.t,/والصفر/);assert.match(ctx.CONTENT.P01.t,/ليس موجبًا ولا سالبًا/);
const repeat=ctx.CONTENT['S1-1-1'].ex[2].join(' ');assert.equal((repeat.match(/5̅2̅/g)||[]).length,3);assert.doesNotMatch(repeat,/(?<!5̅)2̅/);assert.match(repeat,/52\/99/);
assert.match(ctx.CONTENT['S1-1-2'].r[0],/أ ≥ 0، ب > 0/);
assert.match(ctx.CONTENT['S1-3-4'].ex[2][0],/طولا ضلعي القائمة/);
for(let i=0;i<200;i++){const s=ctx.genFor('S1-3-4').steps[0];if(/محيط المثلث/.test(s.q))assert.match(s.q,/طولا ضلعي القائمة/)}
// Test the final display normalizer used by lesson rendering, not only raw CONTENT.
assert.match(ctx.NRM(ctx.CONTENT['S1-1-1'].t),/الأعداد الطبيعية \(ط\)/);
assert.equal(ctx.NRM(ctx.CONTENT['S1-1-1'].r[1]),'ط ⊂ ص ⊂ ن');
assert.equal(ctx.NRM('المجموعة ط، والعدد π غير نسبي.'),'المجموعة ط، والعدد π غير نسبي.');
assert.match(ctx.NRM(ctx.CONTENT.P16.t),/محيط الدائرة = 2\s*π نق/);
assert.match(ctx.MISC.circ,/2π نق/);assert.match(ctx.MISC.cone3,/⅓ π نق² ع/);
let circleCases=0;
for(let i=0;i<400;i++){
 const s=ctx.genFor('P16').steps[0];if(!s.q.includes('π'))continue;
 const radius=s.q.match(/نصف قطرها (\d+)سم/),diameter=!radius&&s.q.match(/قطرها (\d+)سم/);assert.ok(radius||diameter,s.q);
 const value=+(radius||diameter)[1],expected=/مساحتها/.test(s.q)?3.14*value*value:radius?6.28*value:3.14*value;
 assert.equal(parseFloat(s.a.replace(',','.')),+expected.toFixed(2));assert.doesNotMatch(s.hint,/(?<![\u0621-\u065f\u0670\u0640])ط(?![\u0621-\u065f\u0670\u0640])/);circleCases++;
}
assert.ok(circleCases>200);
for(let i=0;i<100;i++){
 const s=ctx.genFor('U6').steps[0],r=+s.q.match(/(?:نصف قطرها|نصف قطر قاعدته) (\d+)سم/)[1],h=+s.q.match(/ارتفاع(?:ها|ه) (\d+)سم/)[1];
 const coefficient=r*r*h*(/مخروط/.test(s.q)?1/3:1);assert.equal(s.a,coefficient+'π سم³');assert.match(s.hint,/π نق² ع/);
}
console.log(`T08 passed: ${checks} independently calculated generator cases, distractors, coverage, quiz mastery, and content regressions.`);
