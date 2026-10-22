/* G6 S1-1-2 (القوى): generator types, distractors and lesson content.
   Run: node tests/s112-powers.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,'g6/math',p),'utf8');
const ctx=vm.createContext({console,document:{addEventListener(){}}});ctx.window=ctx;
for(const f of ['content.js','content5.js','gen.js','gen5.js'])vm.runInContext(read(f),ctx,{filename:f});
const SUP='⁰¹²³⁴⁵⁶⁷⁸⁹',unsup=t=>t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>'^'+SUP.indexOf(c)).replace(/\^(\d)\^(\d)/g,'^$1$2');
const ev=t=>Function('return ('+unsup(t).replace(/\^/g,'**').replace(/×/g,'*').replace(/\+/g,'+')+')')();
const isPow=t=>/^\d+[⁰¹²³⁴⁵⁶⁷⁸⁹]+( × \d+[⁰¹²³⁴⁵⁶⁷⁸⁹]*)?$/.test(t);
const ORD={'الأولى':1,'الثانية':2,'الثالثة':3,'الرابعة':4,'الخامسة':5};
const seen=new Set();let n=0;
for(let i=0;i<4000;i++){const s=ctx.genFor('S1-1-2',i).steps[0];const q=s.q,ch=s.choices.map(c=>c.t),wrong=s.choices.filter(c=>!c.ok).map(c=>c.t);let m;
 assert.equal(s.choices.filter(c=>c.ok).length,1,q);assert.equal(new Set(ch).size,ch.length,'distinct choices: '+q);assert.ok(wrong.length>=2,q);
 if(m=q.match(/^أكتب ((?:\d+ × )+\d+) بالصورة الأسية$/)){seen.add('rep');const f=m[1].split(' × ');assert.ok(new Set(f).size===1);assert.equal(s.a,f[0]+SUP[f.length],q);wrong.forEach(w=>assert.ok(isPow(w),'power-form distractor: '+q+' '+w))}
 else if(m=q.match(/^أجد قيمة (\d+[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/)){seen.add('val');assert.equal(+s.a,ev(m[1]),q);const b=+m[1].match(/^\d+/)[0],e=SUP.indexOf(m[1].slice(-1));if(b*e!==ev(m[1]))assert.ok(wrong.includes(String(b*e)),q)}
 else if(m=q.match(/^أجد قيمة (.+ × .+)$/)){seen.add('prod');assert.equal(+s.a,ev(m[1]),q);wrong.forEach(w=>assert.notEqual(+w,ev(m[1])))}
 else if(m=q.match(/^أكتب العدد (\d+) بالصورة الأسية بالأساس (\d+)$/)){seen.add('base');assert.equal(ev(s.a),+m[1]);assert.ok(s.a.startsWith(m[2]));wrong.forEach(w=>{assert.ok(isPow(w));assert.notEqual(ev(w),+m[1])})}
 else if(m=q.match(/^أكتب العدد (\d+) بالصورة الأسية$/)){seen.add('fact');assert.equal(ev(s.a),+m[1],q);wrong.forEach(w=>{assert.ok(isPow(w),w);assert.notEqual(ev(w),+m[1])})}
 else if(m=q.match(/^القوة (\S+) للعدد (\d+) تُكتب:$/)){seen.add('words');assert.equal(s.a,m[2]+SUP[ORD[m[1]]],q);assert.ok(wrong.includes(`${m[2]} × ${ORD[m[1]]}`))}
 else assert.fail('unknown question: '+q);
 n++}
for(const k of ['rep','val','prod','base','fact','words'])assert.ok(seen.has(k),'type generated: '+k);
const C=ctx.CONTENT['S1-1-2'],ex=C.ex.map(e=>e.join(' ')),all=ex.join('\n');
assert.match(C.act,/10⁹/);assert.match(C.act,/المليار/);
for(const r of [/8³ = 512/,/56 = 2 × 2 × 2 × 7 = 2³ × 7/,/81 = 3 × 3 × 3 × 3 = 3⁴/,/3² × 2³ = 9 × 8 = 72/,/2⁵ \+ 1⁴ = 32 \+ 1 = 33/,/5¹/,/القوة الرابعة للعدد 2/])assert.match(all,r);
const km=ex.find(e=>/كم/.test(e));assert.ok(km&&/1000 × 100 × 10 ملم = 1000000 ملم = 10⁶ ملم/.test(km),'km→mm chain: '+km);
assert.ok(C.err.length>=3);assert.ok(C.err.some(e=>/^3⁴ = 3 × 4/.test(e[0])&&/81/.test(e[1])));assert.ok(C.err.some(e=>/^2³ × 2² = 6/.test(e[0])&&/32$/.test(e[1])));
const V=read('lesson-visuals.js');assert.match(V,/'S1-1-2':'power'/);assert.match(V,/power:\{name:/);
console.log(`s112-powers passed: ${n} generated items.`);
