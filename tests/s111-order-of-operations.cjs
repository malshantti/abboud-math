/* G6 S1-1-1 (أولويات العمليات): generator types and lesson content.
   Run: node tests/s111-order-of-operations.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,'g6/math',p),'utf8');
const ctx=vm.createContext({console,document:{addEventListener(){}}});ctx.window=ctx;
for(const f of ['content.js','content5.js','gen.js','gen5.js'])vm.runInContext(read(f),ctx,{filename:f});
const ev=q=>Function('return ('+q.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')+')')();
const seen=new Set();let n=0;
for(let i=0;i<4000;i++){const s=ctx.genFor('S1-1-1',i).steps[0];const q=s.q.replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632);
 const wrong=s.choices.filter(c=>!c.ok).map(c=>+c.t);
 wrong.forEach(w=>assert.ok(Number.isInteger(w)&&w>=0,'distractor is a whole number: '+q+' '+w));
 let m;
 if(m=q.match(/^أناقش الخطأ: حلّ طالب (.+?) = .+?\. ما الناتج الصحيح؟$/)){seen.add('err');const v=ev(m[1]);assert.ok(Number.isInteger(v));assert.equal(+s.a,v,q);
  const shown=+q.match(/= (\d+)\. /)[1];assert.notEqual(shown,v);assert.ok(wrong.includes(shown),'shown wrong result is a distractor: '+q)}
 else{const e=q.replace(/ = ؟$/,'');assert.equal(+s.a,ev(e),q);
  if(/^\d+ − \d+ \+ \d+$/.test(e)){seen.add('addsub');const [a,b,c]=e.match(/\d+/g).map(Number);assert.ok(wrong.includes(a-(b+c)),q)}
  else if(/\(.+\)/.test(e)&&/−/.test(e)){seen.add('three');const [p,qq,r,x,u]=e.match(/\d+/g).map(Number);assert.ok(wrong.includes(p*qq-r*x+u),q)}
  else if(/^\d+ − \d+ ÷ \d+$/.test(e)){seen.add('subdiv');const [a,b,c]=e.match(/\d+/g).map(Number);assert.ok(wrong.includes((a-b)/c),q)}
  else if(/^\d+ ÷ \d+ × \d+$/.test(e)){seen.add('divmul');const [a,b,c]=e.match(/\d+/g).map(Number);assert.ok(wrong.includes(a/(b*c)),q)}}
 n++}
for(const k of ['err','addsub','three','subdiv','divmul'])assert.ok(seen.has(k),'type generated: '+k);
const C=ctx.CONTENT['S1-1-1'];
assert.match(C.act,/\(7 \+ 5\) × 500 = 12 × 500 = 6000/);
const ex=C.ex.map(e=>e.join(' '));
assert.ok(ex.some(e=>/^10 − 6 \+ 5 4 \+ 5 = 9/.test(e)));assert.ok(ex.some(e=>/= 17$/.test(e)));
for(const [w,fix] of C.err){const [lhs]=w.split(' = ');const right=+fix.match(/= (\d+)$/)[1];assert.equal(ev(lhs),right,w);assert.notEqual(+w.split(' = ').pop(),right)}
assert.ok(C.err.some(e=>e[0].startsWith('12 ÷ 6 ÷ 2'))&&C.err.some(e=>e[0].startsWith('16 − 4 ÷ 4')));
console.log(`s111-order-of-operations passed: ${n} generated items.`);
