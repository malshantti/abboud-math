// T21: lesson links and process changes, with no quantitative claims or mastery awards.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),nodes=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{toggle(){}}});return nodes.get(id)};
const buttons=(key,values)=>values.map(value=>({dataset:{[key]:value},attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v}}));
const phases=buttons('phase',['day','night']),surface=buttons('surface',['quake','volcano','fold','fault','weather','erosion','deposit']);
const S={done:{'U6L2':62,'lab:photo':100},seen:{},xp:54};
const A={S,R:{},esc:String,ic:()=>'',ar:String,pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,save(){},addXP(){assert.fail('Viewing the visual must not award mastery')},quiz(){assert.fail('This is an explanatory view')},fig:()=>'',$:s=>node(s.slice(1)),$$:s=>s==='[data-phase]'?phases:s==='[data-surface]'?surface:[]};
const c={window:{APP:A,CFG:{grade:6}},console,setTimeout(){},requestAnimationFrame(){},cancelAnimationFrame(){}};vm.createContext(c);
for(const name of ['content.js','sc-gen.js','sc.js'])vm.runInContext(fs.readFileSync(path.join(root,'g6/science',name),'utf8'),c);
const lessons=c.window.UNITS.flatMap(u=>u.les);
for(const [id,sim]of [['U6L2','respiration'],['U7L2','surface']]){assert.equal(lessons.find(l=>l.id===id).sim,sim);assert.ok(A.R.u(id).includes('href="#/l/'+sim+'"'));assert.ok(A.R.lab().includes('href="#/l/'+sim+'"'));assert.ok(A.R.l(sim).includes('href="#/u/'+id+'"'));}
const before=JSON.stringify(S.done),xp=S.xp;
A.SIM.respiration.init();assert.match(node('plant-status').textContent,/معًا/);assert.equal((node('plant-processes').innerHTML.match(/class="lesson-flow"/g)||[]).length,4);
phases[1].onclick();assert.equal(phases[1].attributes['aria-pressed'],'true');assert.match(node('plant-status').textContent,/يستمرّ التّنفّس/);assert.match(node('plant-status').textContent,/لا يحدث البناء/);assert.equal((node('plant-processes').innerHTML.match(/class="lesson-flow"/g)||[]).length,2,'Only respiration arrows remain in darkness');
phases[0].onclick();assert.match(node('plant-status').textContent,/صافي تبادل الغازات/);
A.SIM.surface.init();const drawings=new Set();for(const b of surface){b.onclick();assert.equal(b.attributes['aria-pressed'],'true');drawings.add(node('surface-picture').innerHTML);assert.ok(node('surface-picture').innerHTML.includes('<title>'));if(b.dataset.surface==='weather')assert.match(node('surface-description').innerHTML,/في مكانها/);if(b.dataset.surface==='erosion')assert.match(node('surface-description').innerHTML,/ينتقل/);if(b.dataset.surface==='deposit')assert.match(node('surface-description').innerHTML,/يستقرّ/);}
assert.equal(drawings.size,7);assert.equal(JSON.stringify(S.done),before);assert.equal(S.xp,xp);console.log('PASS linked science visuals: correct lesson links, light/dark processes, seven factors, unchanged results');
