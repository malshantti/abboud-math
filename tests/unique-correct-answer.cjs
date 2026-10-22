/* Every generated multiple-choice question has exactly one correct option.
   Run: node tests/unique-correct-answer.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const SAMPLES=3000,SUPS='⁰¹²³⁴⁵⁶⁷⁸⁹';
const west=t=>String(t).replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).replace(/[\u2066-\u2069\u00a0]/g,' ');
function value(t){t=west(t).replace(/\s/g,'').replace(/−/g,'-');let m;
 if(m=t.match(/^(-?\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/))return (+m[1])**+[...m[2]].map(c=>SUPS.indexOf(c)).join('');
 t=t.replace(/(\d),(\d)/g,'$1.$2');
 if(m=t.match(/^(-?\d+(?:\.\d+)?)%$/))return +m[1]/100;
 if(m=t.match(/^(-?\d+(?:\.\d+)?)$/))return +m[1];
 if(m=t.match(/^(-?\d+)\/(\d+)$/))return +m[1]/+m[2];
 return null}
let seed=20261022,checks=0;
const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(const grade of ['g6','g8']){
 const ctx=vm.createContext({Math:math,console,document:{addEventListener(){}}});ctx.window=ctx;
 for(const f of ['data.js','content.js','content5.js','gen.js','gen5.js','review.js'])vm.runInContext(read(grade+'/math/'+f),ctx,{filename:grade+'/'+f});
 const ids=new Set(Object.keys(ctx.GEN));(read(grade+'/math/data.js').match(/S\d-\d+-\d+/g)||[]).forEach(i=>ids.add(i));
 for(const id of ids)for(let i=0;i<SAMPLES;i++){
  const item=ctx.genFor(id,i);
  for(const s of item.steps){if(!Array.isArray(s.choices))continue;const where=`${grade} ${id}: ${s.q} | ${s.choices.map(c=>(c.ok?'*':'')+c.t).join(' ; ')}`;
   const texts=s.choices.map(c=>west(c.t).replace(/\s/g,''));
   assert.equal(s.choices.filter(c=>c.ok).length,1,'exactly one option is marked correct: '+where);
   assert.equal(new Set(texts).size,texts.length,'options are distinct: '+where);
   assert.equal(texts.filter(t=>t===west(s.a).replace(/\s/g,'')).length,1,'correct answer appears once: '+where);
   // خيارات متكافئة القيمة (مثل 4/4 و 1) — إلا في المقارنة التي جوابها «متساويان»
   if(s.a!=='متساويان'){const vs=s.choices.map(c=>value(c.t));
    vs.forEach((v,k)=>{if(v!==null)vs.forEach((w,j)=>{if(j>k&&w!==null)assert.ok(Math.abs(v-w)>1e-9,'two options with the same value: '+where)})})}
   const q=west(s.q),pv=q.match(/(?:القيمة المنزلية|قيمة|منزلة)\s*(?:لل|ا)رقم (\d) في (?:العدد )?(\d+)/);
   if(pv){assert.notEqual(pv[1],'0','asked digit is not 0: '+where);
    assert.equal(pv[2].split(pv[1]).length-1,1,'asked digit appears exactly once: '+where);
    const pos=pv[2].length-1-pv[2].indexOf(pv[1]),right=String(+pv[1]*10**pos);
    assert.equal(west(s.a),right,'place value is computed from the single position: '+where);
    s.choices.filter(c=>!c.ok).forEach(c=>assert.notEqual(west(c.t),right,where))}
   checks++}}
}
// البنوك الثابتة في كل الصفوف
const files=['g1/math/content.js','g1/math/foundations.js','g2/math/content.js','g2/math/foundations.js','g6/math/content.js','g8/math/content.js'];
for(const f of files){if(!fs.existsSync(path.join(root,f)))continue;const t=west(read(f));
 for(const m of t.matchAll(/(?:قيمة|منزلة)\s*(?:لل|ا)رقم (\d) في (?:العدد )?(\d+)/g)){assert.notEqual(m[1],'0',f+': '+m[0]);assert.equal(m[2].split(m[1]).length-1,1,f+': '+m[0]);checks++}}
console.log(`unique-correct-answer passed: ${checks} questions checked.`);
