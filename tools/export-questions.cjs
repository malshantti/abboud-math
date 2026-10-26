#!/usr/bin/env node
// يصدّر عيّنات من مولّدات الأسئلة لمادة إلى JSON لاستيرادها في قاعدة البيانات (بنك الأسئلة).
// الاستعمال: node tools/export-questions.cjs g6 math [عدد_العينات=3] > backend/database/data/questions-g6-math.json
const fs=require('fs'),vm=require('vm'),path=require('path');
const [g,s,nArg]=process.argv.slice(2);const N=+nArg||3;const dir=path.join(__dirname,'..',g,s);
const files={math:['data.js','content.js','content5.js','gen.js','gen5.js','review.js']}[s];
if(!files){console.error('unsupported subject');process.exit(1)}
const ctx={console,Math,JSON,Date,setTimeout,clearTimeout};ctx.window=ctx;ctx.document={currentScript:null,documentElement:{dataset:{}},querySelector:()=>null,addEventListener(){}};ctx.localStorage={getItem:()=>null,setItem(){}};ctx.addEventListener=()=>{};ctx.location={pathname:`/${g}/${s}/`,href:`https://x/${g}/${s}/`};
vm.createContext(ctx);for(const f of files)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f});
const C=ctx.CURR,out=[];let seq=0;
C.semesters.forEach(se=>se.units.forEach(u=>u.lessons.forEach(l=>{if(!ctx.GEN[l.id])return;const seen=new Set();
 for(let k=0,tries=0;k<N&&tries<N*6;tries++){let it;try{it=ctx.genFor(l.id)}catch(e){break}const st=it&&it.steps&&it.steps[0];if(!st||!st.choices||seen.has(st.q))continue;seen.add(st.q);k++;
  out.push({lesson:l.id,lesson_title:(l.number?l.number+' ':'')+l.title,unit:u.title,position:++seq,q:st.q,choices:st.choices.map(c=>({t:String(c.t),ok:!!c.ok,m:c.m||''})),hint:st.hint||'',explain:it.explain||''})}})));
process.stdout.write(JSON.stringify({grade:+g.slice(1),subject:s,generated:new Date().toISOString().slice(0,10),items:out},null,0));
console.error('lessons',new Set(out.map(o=>o.lesson)).size,'items',out.length);
