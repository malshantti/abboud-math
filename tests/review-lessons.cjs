/* Every math lesson (incl. «تمارين عامة») has content with examples and its own generator from its unit.
   Run: node tests/review-lessons.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let n=0;
for(const g of ['g6','g8']){const dir=path.join(root,g,'math');
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert.ok(/<script src="review\.js\?v=\d+">/.test(html),g+' loads review.js');
 assert.ok(fs.readFileSync(path.join(dir,'sw.js'),'utf8').includes(html.match(/review\.js\?v=\d+/)[0]),g+' sw caches review.js');
 const ctx=vm.createContext({Math,console,document:{addEventListener(){}}});ctx.window=ctx;
 for(const f of ['data.js','content.js','content5.js','gen.js','gen5.js','review.js'])vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx);
 ctx.CURR.semesters.forEach(s=>s.units.forEach(u=>u.lessons.forEach(l=>{n++;
  assert.ok(ctx.GEN[l.id],g+' '+l.id+' has a generator');const c=ctx.CONTENT[l.id];assert.ok(c&&c.t&&c.ex&&c.ex.length,g+' '+l.id+' has content with examples');
  for(let i=0;i<20;i++)assert.ok(ctx.genFor(l.id,i).steps.length,g+' '+l.id+' generates')})));}
console.log('review-lessons: '+n+' lessons ok');
