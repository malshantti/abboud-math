// بنك أسئلة رياضيات الصف الأول: ١٢ سؤالًا لكل وحدة، إجابة صحيحة، اختيارات فريدة، تشكيل في نص القراءة.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.join(__dirname,'../g1/math'),ctx={window:{}};ctx.window.window=ctx.window;vm.createContext(ctx);
for(const f of ['content.js','bank.js'])vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx);
const C=ctx.window.G1_COURSE,D='٠١٢٣٤٥٦٧٨٩',n=s=>Number(String(s).replace(/[٠-٩]/g,c=>D.indexOf(c)));
const words=['صِفْر','وَاحِد','اثْنَان','ثَلَاثَة','أَرْبَعَة','خَمْسَة','سِتَّة','سَبْعَة','ثَمَانِيَة','تِسْعَة'];
let total=0;
for(const u of C.units){assert.ok(Array.isArray(u.bank)&&u.bank.length===12,u.id+' bank size');
  for(const t of u.bank){total++;assert.strictEqual(t.answer,0);assert.ok(t.choices.length>=2);
    const labels=t.choices.map(c=>c.label);assert.strictEqual(new Set(labels).size,labels.length,u.id+' dup '+labels);
    assert.ok(/[\u064B-\u0652]/.test(t.say)&&/[\u064B-\u0652]/.test(t.sayExplain),'tashkeel');
    for(const c of t.choices)assert.ok(c.say,'choice say');
    const m=/^([٠-٩]+) ([+−]) ([٠-٩]+) = ([٠-٩]+)$/.exec(t.explain);
    if(m){const a=n(m[1]),b=n(m[3]),r=n(m[4]);assert.strictEqual(m[2]==='+'?a+b:a-b,r,t.explain);if(t.prompt==='ما الناتج؟')assert.strictEqual(n(t.choices[0].label),r);}
    if(t.scene&&t.scene.type==='count')assert.strictEqual(n(t.choices[0].label),t.scene.count);
    if(t.scene&&t.scene.type==='place-value')assert.strictEqual(n(t.choices[0].label),t.scene.tens*10+t.scene.ones);
    if(t.scene&&t.scene.type==='measure')assert.strictEqual(n(t.choices[0].label),t.scene.units);
    for(const c of t.choices)if(/^[٠-٩]+$/.test(c.label)&&n(c.label)<10)assert.strictEqual(c.say,words[n(c.label)]);
  }}
const ee=fs.readFileSync(path.join(__dirname,'../g1/shared/early.js'),'utf8');assert.ok(ee.includes('concat(unit.bank||[])'));
console.log('grade1-math-bank ok',total);
