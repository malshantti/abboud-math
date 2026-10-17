// T19: optional placement round must guide practice without changing saved progress.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(grade){
 let html='',nodes=new Map(),options=[];
 const original={seen:{'P1U1:read':1},done:{'b:kalima':80},xp:170,hearts:4,qs:14,ok:12,log:[{k:'b:kalima',pc:80}]};
 const S=structuredClone(original);
 const forbidden=()=>assert.fail('The optional round must not save, award XP or invoke the scored quiz.');
 const A={S,R:{},save:forbidden,addXP:forbidden,checkAch:forbidden,quiz:forbidden,esc:s=>String(s??''),ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice().reverse(),rnd:()=>0,say:()=>'',fig:()=>'',ar:s=>String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),$:s=>nodes.get(s)||null,$$:s=>s==='[data-foundation-option]'?options:[]};
 const window={APP:A,CFG:{grade,ap:'g'+grade+'ar',title:'اللغة العربية'}};
 const context={window,document:{},console};vm.createContext(context);
 for(const file of ['content.js','ar-banks.js','ar.js'])vm.runInContext(fs.readFileSync(path.join(root,'g'+grade,'arabic',file),'utf8'),context,{filename:file});
 A.render=()=>{
  html=A.R.basics();nodes=new Map();options=[];
  for(const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){
   const attrs=m[1],id=/\bid="([^"]+)"/.exec(attrs),opt=/\bdata-foundation-option="(\d+)"/.exec(attrs);
   const node={disabled:/\bdisabled\b/.test(attrs),label:m[2],dataset:opt?{foundationOption:opt[1]}:{},classList:{toggle(){}},setAttribute(){}};
   if(id)nodes.set('#'+id[1],node);if(opt)options.push(node);
  }
  A.R.after_basics();assert.deepEqual(S,original,'Diagnostic actions must preserve the whole learning state.');
 };
 A.render();
 return {A,window,get html(){return html},get options(){return options},click(id){const n=nodes.get(id);assert.ok(n,id);assert.equal(n.disabled,false,id);n.onclick()},answer(text){const n=options.find(n=>n.label===text);assert.ok(n,text);n.onclick()}};
}
for(const grade of [6,8]){
 const skills=['haraka','kalima','shams','jumla','damir','wasl','taa','alif'].concat(grade===8?['hamza']:[]);
 const app=load(grade);assert.ok(app.html.includes('لا تقيس الإتقان'));assert.ok(app.html.includes('href="#/b/haraka"'));assert.equal(app.A.foundationRoundActive(),false);
 app.click('#foundation-start');assert.ok(app.html.includes('السؤال ١ من '+app.A.ar(skills.length)));assert.equal(app.A.foundationRoundActive(),true);
 // Leaving early retains access to every foundation and writes no result.
 app.click('#foundation-close');assert.ok(app.html.includes('من أين أبدأ؟'));assert.ok(app.html.includes('href="#/b/alif"'));assert.equal(app.A.foundationRoundActive(),false);
 for(const wrongSkills of [['shams','wasl'],[]]){
  app.click('#foundation-start');
  for(const skill of skills){
   const q=app.A.gen.BQ[skill](grade)[0];
   // The production options have been shuffled (reverse in this deterministic fixture).
   assert.equal(app.options.at(-1).label,q.o[q.a]);
   const chosen=wrongSkills.includes(skill)?q.o.find((x,i)=>i!==q.a):q.o[q.a];
   app.answer(chosen);app.click('#foundation-check');
   assert.ok(app.html.includes(wrongSkills.includes(skill)?'الإجابة الصحيحة:':'إجابة صحيحة.'));
   assert.ok(app.html.includes(q.o[q.a]));app.click('#foundation-next');
  }
  assert.ok(app.html.includes('نقطة بدايتك'));assert.ok(app.html.includes('لا تُحفظ نتيجتها'));assert.equal(app.A.foundationRoundActive(),false);
  if(wrongSkills.length){assert.ok(app.html.includes('لنبدأ بمراجعة <b>اللّام الشّمسيّة والقمريّة</b>'));assert.ok(app.html.includes('href="#/b/wasl"'));}
  else assert.ok(app.html.includes('سؤال واحد لا يكفي للحكم على إتقانها'));
 }
 // A new page has no remembered diagnostic or recommendation.
 assert.ok(!load(grade).html.includes('<h3>نقطة بدايتك</h3>'));
}
console.log('Passed: optional foundation rounds, shuffled answers, feedback, ordered recommendations, early exit and unchanged learning state in both Arabic grades (T19).');
