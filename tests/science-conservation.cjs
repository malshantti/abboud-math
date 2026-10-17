// T13: the lesson, generator and idealized pendulum all state necessary assumptions.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');const root=path.resolve(__dirname,'..');let cases=0;
for(const grade of [6,8]){
 const A={S:{done:{},seen:{}},R:{},esc:String,ic:()=>'',ar:String,pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,save(){},addXP(){},quiz(){},fig(){},toast(){}};
 const c={window:{APP:A,CFG:{grade}},console,setTimeout(){},requestAnimationFrame(){},cancelAnimationFrame(){}};vm.createContext(c);
 for(const file of ['content.js','sc-gen.js','sc.js'])vm.runInContext(fs.readFileSync(path.join(root,`g${grade}/science/${file}`),'utf8'),c,{filename:file});
 const sim=A.SIM.energy.html();for(const word of ['الاحتكاك','مقاومة الهواء','جـ = ١٠ م/ث²'])assert.ok(sim.includes(word));cases++;
 for(let i=0;i<200;i++){const q=c.window.SCG.cons();for(const term of ['من السكون','بإهمال مقاومة الهواء','جـ = ١٠ م/ث²'])assert.ok(q.q.includes(term));assert.equal(parseFloat(q.o[q.a]),q.chk.m*10*q.chk.h);cases++;}
 if(grade===8){const l=c.window.UNITS.flatMap(u=>u.les).find(l=>l.id==='U2L3');assert.ok(!l.pts[2].includes('بإهمال الاحتكاك ومقاومة الهواء'),'The textbook statement remains unchanged');assert.ok(l.pts[2].includes('هو مقدار ثابت'));const rendered=A.R.u('U2L3');assert.ok(rendered.includes(l.pts[2]));assert.ok(rendered.includes('بإهمال الاحتكاك ومقاومة الهواء'));assert.ok(rendered.includes('افتراض النموذج')); cases++;}
}
console.log(`PASS science conservation: ${cases} lesson, model and generated-answer cases`);
