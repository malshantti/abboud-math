'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
for(const subject of ['math','arabic','english','science']){
 const prefix='g4/'+subject+'/',s=read(prefix+'std.js'),lab=read(prefix+'lab.js');
 const state={done:{'lab:old':80}},listeners=[],els={},R={};let save=0;
 const A={$:id=>els[id]||(els[id]={addEventListener:(...x)=>listeners.push(x)}),save:()=>save++};
 const c={S:state,A,R,L:{items:[]},SUB:subject,T:{},LI:{},oldAL:()=>{},window:{},sv:()=>save++,Math};
 vm.runInNewContext(s.slice(s.indexOf('R.after_l=id=>'),s.indexOf('const LI={};')),c);
 R.after_l('one');R.after_l('two');assert.equal(listeners.length,0,'Navigation must not accumulate completion click listeners');assert.deepEqual(state.done,{'lab:old':80});
 vm.runInNewContext(lab.slice(lab.indexOf('const done='),lab.indexOf('\n',lab.indexOf('const done=')))+'\nthis.record=done;',c);
 c.record('zero',0);assert.equal(state.done['lab:zero'],0);c.record('old',20);assert.equal(state.done['lab:old'],80);c.record(undefined,100);assert.equal(state.done['lab:undefined'],undefined);c.record('correct',75);assert.equal(state.done['lab:correct'],75);
 let tick,buttons=[];const elements={};const el=id=>elements[id]||(elements[id]={remove(){},innerHTML:''});
 const rc={A:{$:el,$$:()=>buttons,addXP(){}},AR:String,ST:{},S:state,sv(){},shuffle:a=>a,fin:(id,n)=>{state.done[id]=Math.max(state.done[id]||0,n)},setInterval:f=>{tick=f;return 1},clearInterval(){},Math};
 vm.runInNewContext(s.slice(s.indexOf('function race('),s.indexOf('LI.race='))+'\nthis.run=race;',rc);
 function round(answers){state.done['lab:race']=0;buttons=[{dataset:{i:'0'}},{dataset:{i:'1'}}];rc.run({},()=>({q:'q',o:['yes','no'],a:0}));el('#rg').onclick();answers.forEach(i=>buttons[i].onclick());for(let i=0;i<60;i++)tick();return state.done['lab:race']}
 assert.equal(round([]),0,'Idle timer is not mastery');assert.equal(round([1]),0);assert.equal(round([0,1]),50);assert.equal(round([0]),100);
 if(subject==='english')assert.match(s,/const it=\{id:'sb',k:'build'/,'Sentence builder keeps its actual progress key');
 const base=process.env.CACHE_BASE_REF||'origin/main';const old=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');
 if(s!==old(prefix+'std.js')||lab!==old(prefix+'lab.js'))assert.notEqual(read(prefix+'sw.js').match(/const V='([^']+)'/)[1],old(prefix+'sw.js').match(/const V='([^']+)'/)[1]);
}
console.log('PASS lab completion: navigation, zero score, preserved progress, idle and scored races, builder ID, cache changes');
