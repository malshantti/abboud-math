/* G6 Unit 1 lessons S1-1-3 … S1-1-6: generator answers, genuine distractors, book content, demos.
   Run: node tests/u1-powers-roots.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,'g6/math',p),'utf8');
const ctx=vm.createContext({console,document:{addEventListener(){}}});ctx.window=ctx;
for(const f of ['content.js','content5.js','gen.js','gen5.js'])vm.runInContext(read(f),ctx,{filename:f});
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹',SC='[⁰¹²³⁴⁵⁶⁷⁸⁹]';
const pv=t=>{const m=t.match(new RegExp('^(\\d+)('+SC+'+)$'));return m?(+m[1])**+[...m[2]].map(c=>SUP.indexOf(c)).join(''):NaN};
const num=t=>+String(t).replace(' سم²','').replace(' سم','').replace(',','.');
const cbrt=n=>Math.round(Math.cbrt(n)),isSq=n=>Number.isInteger(Math.sqrt(n)),isCb=n=>cbrt(n)**3===n;
const nearRoot=(N,k)=>{let lo=Math.floor(Math.round(N**(1/k)*1e6)/1e6);if((lo+1)**k<=N)lo++;return N-lo**k<(lo+1)**k-N?lo:lo+1};
function check(id,s,seen){const q=s.q,a=s.a,wrong=s.choices.filter(c=>!c.ok).map(c=>c.t);let m;
 assert.equal(s.choices.filter(c=>c.ok).length,1,q);assert.ok(wrong.length>=2,'at least two distractors: '+q);
 if(m=q.match(/^أيهما أكبر: (\S+) أم (\S+)؟$/)){seen.add('cmp');const A=pv(m[1]),B=pv(m[2]);assert.equal(a,A>B?m[1]:A<B?m[2]:'متساويان',q)}
 else if(m=q.match(/^أرتّب (تصاعديًا|تنازليًا): (.+)$/)){seen.add('order');const vals=a.split(' ، ').map(pv);for(let i=1;i<vals.length;i++)assert.ok(m[1]==='تصاعديًا'?vals[i]>vals[i-1]:vals[i]<vals[i-1],q);
  wrong.forEach(w=>{assert.deepEqual(w.split(' ، ').sort(),m[2].split(' ، ').sort(),'distractor is a permutation: '+w)})}
 else if(m=q.match(/^أكمل النمط: (.+) ، …$/)){seen.add('pattern');const t=m[1].split(' ، ');const b=+t[0].match(/^\d+/)[0],e=SUP.indexOf(t[0].slice(-1));assert.equal(a,(b+3)+SUP[e+3],q)}
 else if(m=q.match(new RegExp('^أجد قيمة (\\d+'+SC+') \\+ (\\d+'+SC+')$'))){seen.add('powsum');assert.equal(+a,pv(m[1])+pv(m[2]),q)}
 else if(m=q.match(/^√(\d+) = ؟$/)){seen.add('sqrt');assert.equal((+a)**2,+m[1],q)}
 else if(m=q.match(/^∛(\d+) = ؟$/)){seen.add('cbrt');assert.equal((+a)**3,+m[1],q)}
 else if(q==='أي الأعداد الآتية مربع كامل؟'){seen.add('isSq');assert.ok(isSq(+a));wrong.forEach(w=>assert.ok(!isSq(+w),q+' '+w))}
 else if(q==='أيّ الأعداد الآتية مكعب كامل؟'){seen.add('isCb');assert.ok(isCb(+a));wrong.forEach(w=>assert.ok(!isCb(+w),q+' '+w))}
 else if(m=q.match(/^لوحة مربعة مساحتها (\d+) سم²/)){seen.add('area');assert.equal(num(a)**2,+m[1])}
 else if(m=q.match(/^مكعب حجمه (\d+) سم³\. ما طول حرفه؟$/)){seen.add('vol');assert.equal(num(a)**3,+m[1])}
 else if(m=q.match(/^مكعب حجمه (\d+) سم³\. ما مساحة أحد أوجهه؟$/)){seen.add('face');assert.equal(num(a),cbrt(+m[1])**2)}
 else if(m=q.match(/^(\d+) = ([\d × ]+)\. أجد (√|∛)(\d+) بالتحليل/)){seen.add('fact'+m[3]);const k=m[3]==='√'?2:3;assert.equal(m[2].split(' × ').reduce((x,y)=>x*y,1),+m[1]);assert.equal((+a)**k,+m[1],q);wrong.forEach(w=>assert.notEqual(num(w)**k,+m[1]))}
 else if(m=q.match(/^أقدّر قيمة (√|∛)(\d+)$/)){seen.add('est'+m[1]);const k=m[1]==='√'?2:3,N=+m[2];assert.ok(k===2?!isSq(N):!isCb(N),q);assert.equal(+a,nearRoot(N,k),q)}
 else if(m=q.match(/^(√|∛)(\d+) \+ √(\d+) = ؟$/)){seen.add('rootsum');assert.equal(+a,(m[1]==='√'?Math.sqrt(+m[2]):cbrt(+m[2]))+Math.sqrt(+m[3]),q)}
 else if(m=q.match(/^√\((\d+)² × (\d+)²\) = ؟$/)){seen.add('sqprod');assert.equal(+a,m[1]*m[2])}
 else if(m=q.match(new RegExp('^(\\d+'+SC+') \\+ (\\d+)√(\\d+) \\+ ∛(\\d+) = ؟$'))){seen.add('mix');assert.equal(+a,pv(m[1])+m[2]*Math.sqrt(+m[3])+cbrt(+m[4]),q)}
 else if(id==='S1-1-6'){seen.add('other');assert.ok(!/المنزلية|منزلة/.test(q),'unit review stays in unit 1: '+q)}
 else assert.fail(id+' unknown question: '+q)}
const want={'S1-1-3':['cmp','order','pattern','powsum'],'S1-1-4':['sqrt','isSq','area','fact√','est√','rootsum'],'S1-1-5':['cbrt','vol','isCb','fact∛','est∛','rootsum'],'S1-1-6':['sqprod','face','mix','other','cmp','est√']};
let n=0;for(const id in want){const seen=new Set();for(let i=0;i<3000;i++){check(id,ctx.genFor(id).steps[0],seen);n++}for(const k of want[id])assert.ok(seen.has(k),id+' type generated: '+k)}
const all=id=>{const C=ctx.CONTENT[id];return [C.act,...C.ex.flat(),...(C.err||[]).flat()].join('\n')};
for(const [id,res] of Object.entries({'S1-1-3':[/2⁶ = 64/,/3⁴ = 81/,/2⁸ = 256/,/9² = 3⁴/,/3⁴ ، 5⁴ ، 4⁵/,/2⁴ = 4²/,/5⁶ ، 6⁷/,/3⁵ ، 3⁴ ، 6²/],
 'S1-1-4':[/36 م²/,/√2025 = 45/,/√324 = 2 × 3 × 3 = 18/,/√12 ≈ 3/,/√80 ≈ 9/,/√√16 = 2/,/80 م/,/41/,/√250 ≈ 16/,/√300 ≈ 17/],
 'S1-1-5':[/729/,/∛343 = 7/,/∛512 = 2 × 2 × 2 = 8/,/∛72 ≈ 4/,/∛200 ≈ 6/,/∛√64/,/60 سم³/,/14/,/∛115 ≈ 5/,/∛30 ≈ 3/],
 'S1-1-6':[/5³ × 3²/,/33/,/√140 ≈ 12/,/2⁴ × 3²/,/2⁷/,/110/,/1,8/,/1000/]}))for(const r of res)assert.match(all(id),r,id);
for(const id of ['S1-1-3','S1-1-4','S1-1-5','S1-1-6'])assert.ok((ctx.CONTENT[id].err||[]).length>=3,id+' has أناقش الخطأ items');
const V=read('lesson-visuals.js');for(const [id,t] of [['S1-1-3','powerCompare'],['S1-1-4','sqrtLine'],['S1-1-5','cbrtLine'],['S1-1-6','unitMix']]){assert.ok(V.includes(`'${id}':'${t}'`),id);assert.ok(V.includes(` ${t}:{name:`),t);assert.ok(new RegExp(`STEPS=\\{[^\\n]*${t}:\\[`).test(V),t+' steps')}
console.log(`u1-powers-roots passed: ${n} generated items.`);
