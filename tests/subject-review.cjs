// Run: node tests/subject-review.cjs — no dependencies or network required.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');let checks=0;
function load(grade,subject){
 const S={done:{},seen:{},log:[],ach:[]},R={},pending=[];let questions=[];
 const A={S,R,esc:s=>String(s??''),ic:()=>'<svg></svg>',ar:s=>String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),rnd:n=>Math.floor(Math.random()*n),pick:a=>a[0],shuffle:a=>a.slice(),save(){},addXP(){},toast(){},digits(){},$:()=>({querySelectorAll:()=>[],after(){}}),$$:()=>[],fig:()=>'',say:()=>'',quiz:qs=>{questions=qs}};
 const cfg={grade,subject,key:'test',title:'مراجعة',ap:'test'},w={APP:A,CFG:cfg};
 const ctx={window:w,document:{addEventListener(){},createElement(name){if(name!=='span')throw Error('Unexpected DOM render in unit check');return {}}},setTimeout:f=>pending.push(f),requestAnimationFrame:()=>1,cancelAnimationFrame(){},MutationObserver:class{observe(){}},queueMicrotask(){},location:{hash:''},console};
 vm.createContext(ctx);const dir=path.join(root,'g'+grade,subject);
 for(const name of ['content.js',subject==='science'?'sc-gen.js':'ar-banks.js',subject==='science'?'sc.js':'ar.js','explore.js'])vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),ctx,{filename:name});
 return {A,w,R,S,dir,run(){while(pending.length)pending.shift()();return questions}};
}
for(const grade of [6,8])for(const subject of ['arabic','science']){
 const x=load(grade,subject),{A,w,R,dir}=x,U=w.UNITS;
 for(const part of [1,2]){const html=R.home(String(part));for(const u of U.filter(u=>u.part===part))assert.ok(html.includes('الوحدة '+A.ar(subject==='science'?+u.id.slice(1):u.n)));checks++;}
 const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');assert.ok(sw.includes('design2'));for(const f of ['explore.js','explore.css'])assert.ok(sw.includes('"'+f+'"'));
 // Every indexed textbook image must exist; lesson references keep the original order.
 for(const u of U)for(const lesson of subject==='science'?u.les:Object.values(u.sec))for(const img of lesson.img||[]){assert.ok(fs.existsSync(path.join(dir,'bookimg',img[0])),img[0]);checks++;}
 if(subject==='science'){
  const expected=grade===6?{U1L1:['mag'],U2L1:[],U3L1:[],U3L2:['speed','speed2'],U3L3:['force']}:{U2L1:['ke'],U2L2:['pe'],U2L3:['cons'],U3L1:['config']};
  for(const [id,types] of Object.entries(expected)){const l=A.gen.LES.find(l=>l.id===id);assert.deepEqual(Array.from(new Set(A.gen.numQs(l,6).map(q=>q.chk.t))),types.map(t=>t==='cons'?'pe':t==='speed2'?'speed2':t));checks++;}
  for(const l of A.gen.LES){const terms=A.gen.terms(l);const norm=s=>s.replace(/[\u064B-\u0652\u0640]/g,'').trim();assert.equal(new Set(terms.map(t=>norm(t[0]))).size,terms.length);checks++;}
  if(grade===8){
   const solar=A.gen.LES.find(l=>l.id==='U8L1');const alias=s=>s.replace(/[\u064B-\u0652\u0640]/g,'').trim();
   assert.equal(A.gen.terms(solar).filter(t=>['الإكليل','الكورونا'].includes(alias(t[0]))).length,1);
   assert.ok(A.gen.termQs(solar,10).every(q=>q.o.filter(o=>['الإكليل','الكورونا'].includes(alias(o))).length<=1));
   assert.ok(A.gen.LES.find(l=>l.id==='U3L2').facts[0][0].includes('باستثناء الهيليوم'));checks+=3;
  }
  R.adv('calc','U2');const qs=x.run();if(grade===6)assert.equal(qs.length,0);else assert.ok(qs.every(q=>['ke','pe'].includes(q.chk.t)));checks++;
  R.adv('tf','U1');const facts=x.run();const first=U[0].les.flatMap(l=>l.facts.map(f=>f[0]));assert.ok(facts.every(q=>first.some(f=>q.q.includes(f))));checks++;
  for(const fn of ['mag','speed','speed2','force','ke','pe','cons','config','period','ionic','wave','period2'])for(let i=0;i<500;i++){
   const q=w.SCG[fn](),c=q.chk;assert.equal(q.a,0);assert.equal(q.o.length,4);assert.equal(new Set(q.o).size,4);assert.ok(!JSON.stringify(q).includes('NaN'));
   let expected;
   if(fn==='mag')expected=c.e*c.o;if(fn==='speed')expected=c.d/c.tm;if(fn==='speed2')expected=(c.d1+c.d2)/(c.t1+c.t2);if(fn==='force')expected=c.same?c.a+c.b:Math.abs(c.a-c.b);if(fn==='ke')expected=c.m*c.v*c.v/2;if(fn==='pe'||fn==='cons')expected=c.m*10*c.h;if(fn==='wave')expected=c.f*c.l;if(fn==='period2')expected=1/c.f;
   if(expected!==undefined)assert.ok(Math.abs(parseFloat(q.o[0])-expected)<0.0011,fn);
   if(fn==='config')assert.equal(w.SCG.conf(c.z).reduce((a,b)=>a+b),c.z);
   if(fn==='period')assert.equal(c.c,c.ask?w.SCG.conf(c.z).length:w.SCG.conf(c.z).at(-1));
   if(fn==='cons'){assert.ok(q.q.includes('من السكون'));assert.ok(q.q.includes('١٠ م/ث²'));}
   if(fn==='ionic'){const gcd=(a,b)=>b?gcd(b,a%b):a,g=gcd(c.c[2],c.a[2]);const sub=n=>n>1?'<sub>'+n+'</sub>':'';assert.equal(c.f,c.c[0]+sub(c.a[2]/g)+c.a[0]+sub(c.c[2]/g));}
   checks++;
  }
 }else{
  const poetryUnit=U.find(u=>u.sec.poem&&u.sec.poem.verses&&u.sec.poem.verses.length>=4);assert.ok(poetryUnit);
  R.adv('verses',poetryUnit.id);const qs=x.run();assert.ok(qs.length>0);assert.ok(qs.every(q=>q.ex.includes(poetryUnit.sec.poem.t)));checks++;
  const wasl=A.gen.BQ.wasl().find(q=>q.q.includes('اسْتَمِعْ'));assert.ok(wasl.ex.includes('الخماسيّ'));assert.ok(!wasl.ex.includes('السّداسيّ'));
  const hamza=A.gen.BQ.hamza().find(q=>q.q.includes('يَجْرُ'));assert.ok(hamza.ex.includes('متطرّفة'));assert.ok(hamza.ex.includes('الضّمّة'));checks+=2;
 }
}
const reading=load(8,'arabic').w.UNITS[0].sec.read.paras[0];assert.ok(reading.startsWith('لا شَكَّ'));assert.ok(reading.includes('عَلى حُسْنِ خَلْقِهِ'));assert.ok(!reading.includes('الإ بْداع'));checks++;
console.log('Passed '+checks+' curriculum, question, asset and offline-manifest checks.');
