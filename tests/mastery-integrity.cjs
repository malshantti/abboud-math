// Run: node tests/mastery-integrity.cjs. Uses real core event handlers and isolated saved states.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');let checks=0;
function load(grade,subject,saved={}){
 const dir=path.join(root,'g'+grade,subject),key='test-progress',store=new Map([[key,JSON.stringify(saved)]]),nodes=new Map();
 const node=()=>{const n={style:{},dataset:{},className:'',focus(){},click(){},insertAdjacentHTML(){},remove(){}};
  n.classList={contains:c=>n.className.split(' ').includes(c),add:c=>{n.className+=' '+c},remove:c=>{n.className=n.className.split(' ').filter(x=>x!==c).join(' ')},toggle(){}};return n};
 const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},opts=[node(),node()];opts.forEach((n,i)=>n.dataset.i=String(i));
 let html='';Object.defineProperty(get('#app'),'innerHTML',{get:()=>html,set:s=>{html=s;get('#fb').className='fb'}});get('#app').firstChild=node();
 const cfg={grade,key,title:'اختبار',ap:'test'},w={CFG:cfg};
 const ctx={window:w,document:{querySelector:get,querySelectorAll:s=>s==='.opt'?opts:[],addEventListener(){},createElement:node,createTreeWalker:()=>({nextNode:()=>false}),body:{append(){}}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},NodeFilter:{SHOW_TEXT:4},addEventListener(){},Date,console,setTimeout:()=>0,cancelAnimationFrame(){},scrollTo(){},location:{hash:''},Blob,File:class{},URL:{createObjectURL(b){ctx.download=b;return 'blob:test'},revokeObjectURL(){}},navigator:{}};
 vm.createContext(ctx);
 for(const name of ['content.js','core.js',subject==='science'?'sc-gen.js':'ar-banks.js',subject==='science'?'sc.js':'ar.js'])vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),ctx,{filename:path.join(dir,name)});
 const A=w.APP;
 function answer(correct){opts[correct?0:1].onclick();get('#qchk').onclick();get('#qnext').onclick()}
 function start(key,answers){const meta={key,title:'اختبار الدرس',back:'#/home'},qs=answers.map((_,i)=>({q:'سؤال '+i,o:['صواب','خطأ'],a:0,keep:1}));A.quiz(qs,meta);A.render();answers.forEach(answer);return meta}
 return {A,w,cfg,get,start,answer,html:()=>html,store,key,ctx,dir,persisted:()=>JSON.parse(store.get(key))};
}
async function run(){for(const grade of [6,8])for(const subject of ['arabic','science']){
 const x=load(grade,subject,{xp:123,done:{legacy:100},ach:['u20'],log:[{t:1,k:'legacy',n:'قديم',pc:100}]});
 const key=x.cfg.sections()[0].key,meta=x.start(key,[true,true,true,true,true,true,true,true,true,false]);
 assert.equal(x.A.S.done[key],90);assert.equal(x.A.S.xp,213);assert.equal(x.A.S.qs,10);assert.equal(x.A.S.ok,9);checks+=4;
 x.get('#again').onclick();x.answer(true);
 assert.equal(x.A.S.done[key],90);assert.equal(x.A.S.xp,243);assert.equal(x.A.S.qs,11);assert.equal(x.A.S.ok,10);assert.equal(meta.review,undefined);
 assert.equal(x.persisted().log.at(-1).review,true);assert.equal(x.persisted().log.at(-1).pc,100);assert.match(x.html(),/لا يغيّر نتيجة إتقان الدرس/);checks+=8;
 // Failed correction sessions can be repeated; neither attempt changes the initial assessment.
 x.start(key,[false,false]);x.get('#again').onclick();x.answer(false);x.answer(true);x.get('#again').onclick();x.answer(true);
 assert.equal(x.A.S.done[key],90);assert.ok(x.A.S.log.slice(-2).every(l=>l.review));checks+=2;
 // A fresh full assessment still upgrades mastery; lower later marks and legacy achievements survive.
 x.start(key,Array(10).fill(true));assert.equal(x.A.S.done[key],100);x.start(key,[false]);assert.equal(x.A.S.done[key],100);
 assert.equal(x.A.S.done.legacy,100);assert.ok(x.A.S.ach.includes('u20'));assert.equal(x.A.S.log[0].t,1);checks+=5;
 const reopened=load(grade,subject,x.persisted());assert.deepEqual(reopened.persisted().done,x.persisted().done);assert.equal(reopened.A.S.log.at(-1).review,undefined);checks+=2;
 // Tests use the real curriculum keys, including extra activities saved by labs without a quiz log.
 const sections=x.cfg.sections(),n=sections.length,all=Object.fromEntries(sections.map(i=>[i.key,100]));
 const extra={'lab:bohr':100,'adv:match':80,'b:units':70,'T:U1':90,'lab:sort':1};
 const studentA={done:{...all,...extra},xp:321,days:{},log:[]},studentB={done:{[sections[0].key]:69,'lab:bohr':100},log:[]};
 const before=JSON.stringify(studentA);x.w.PROFILES={list:()=>[{id:'a',name:'أ'},{id:'b',name:'ب'}],dataOf:id=>id==='a'?studentA:studentB};x.store.set('bustan_session',JSON.stringify({id:'a'}));
 const report=x.A.R.report();assert.match(report,new RegExp('big-n">'+n+'/'+n+'<'));assert.ok(report.includes('4 أنشطة بنتيجة ٧٠٪ فأكثر'));assert.ok(report.includes('<td>0/'+n+'</td><td>1</td>'));assert.equal(JSON.stringify(studentA),before);checks+=4;
 x.A.R.after_report();x.get('#csv').onclick();const csv=await x.ctx.download.text();assert.ok(csv.includes('"'+n+'/'+n+'","4"'));assert.ok(csv.includes('"0/'+n+'","1"'));assert.ok(csv.includes('أقسام المنهاج المتقنة'));checks+=3;
 // Extra activity scores cannot unlock curriculum milestones; old unlocks are never revoked.
 const milestones=load(grade,subject,{done:Object.fromEntries(Array.from({length:25},(_,i)=>['lab:extra'+i,100])),ach:['u20']});
 milestones.A.checkAch();assert.ok(!milestones.A.S.ach.includes('u5'));assert.ok(milestones.A.S.ach.includes('u20'));
 for(const i of milestones.cfg.sections().slice(0,5))milestones.A.S.done[i.key]=70;milestones.A.checkAch();assert.ok(milestones.A.S.ach.includes('u5'));checks+=3;
 console.log('Passed '+grade+'/'+subject+': full assessment, repeat corrections, persistence, reports, CSV and milestones.');
 }
 console.log('Passed '+checks+' mastery-integrity assertions using four actual subject engines.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
