// Public sample, protected chooser and stale-tab boundary; no browser or network dependency.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'welcome.js'),'utf8');let checks=0;
function fixture(options={}){
 const values=new Map(Object.entries(options.store||{})),writes=[],scripts=[],events={},nodes=new Map();
 const element=()=>({hidden:false,textContent:'',dataset:{},attrs:{'aria-pressed':'false'},events:{},addEventListener(t,f){this.events[t]=f},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},focus(){},querySelectorAll(){return[]}});
 const get=s=>{if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)};
 get('#student-home').hidden=true;get('#entry-message').hidden=true;
 const pieces=Array.from({length:4},element);
 const context={document:{title:'',querySelector:get,querySelectorAll:s=>s==='[data-piece]'?pieces:[],createElement:element,body:{append(s){scripts.push(s.src);queueMicrotask(()=>options.fail===s.src?s.onerror():s.onload())}},addEventListener:(t,f)=>events['document:'+t]=f,documentElement:{dataset:{}}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>{writes.push([k,v]);values.set(k,v)},removeItem:k=>{writes.push([k,null]);values.delete(k)}},location:{search:options.search||''},URLSearchParams,matchMedia:()=>({matches:true}),console};
 context.window={PROFILES:{ready:Promise.resolve(options.ready!==false),current:()=>options.current===false?null:{id:'p1'}},addEventListener:(t,f)=>events[t]=f,scrollTo(){}};
 vm.runInNewContext(source,context,{filename:'welcome.js'});
 return{values,writes,scripts,events,get,pieces,context};
}
const good={bustan_session:JSON.stringify({id:'p1'}),bustan_owner:'p1',bustan_profiles:JSON.stringify([{id:'p1',name:'طالب الاختبار'}]),abboud_math_v1:JSON.stringify({xp:29})};
const flush=async()=>{for(let i=0;i<12;i++)await new Promise(setImmediate)};
(async()=>{
 for(const options of [{},{store:{bustan_session:'broken'}},{store:{...good,bustan_owner:'p2'}},{store:{...good,bustan_profiles:'[]'}},{store:{...good,bustan_transition:'{}'}},{store:{...good,bustan_restore:'{}'}},{store:{...good,bustan_session:JSON.stringify({id:'p1',pending:true})}},{store:good,search:'?welcome=1'}]){
  const x=fixture(options),before=Array.from(x.values);await flush();assert.deepEqual(x.scripts,[]);assert.equal(x.get('#student-home').hidden,true);assert.equal(x.get('#visitor-home').hidden,false);assert.deepEqual(x.writes,[]);assert.deepEqual(Array.from(x.values),before);checks+=5;
 }
 const guest=fixture(),before=Array.from(guest.values);
 guest.pieces[0].events.click();guest.pieces[1].events.click();guest.get('#check-fraction').events.click();assert.equal(guest.get('#fraction-feedback').dataset.state,'correct');assert.equal(guest.get('#piece-count').textContent,'٢');
 guest.pieces[2].events.click();guest.get('#check-fraction').events.click();assert.equal(guest.get('#fraction-feedback').dataset.state,'try');guest.get('#reset-fraction').events.click();assert.equal(guest.get('#piece-count').textContent,'٠');assert.ok(guest.pieces.every(p=>p.getAttribute('aria-pressed')==='false'));assert.deepEqual(guest.writes,[]);assert.deepEqual(Array.from(guest.values),before);checks+=7;
 const student=fixture({store:good});await flush();assert.deepEqual(student.scripts,['profiles.js','catalog.js','entry.js']);assert.equal(student.get('#visitor-home').hidden,true);assert.equal(student.get('#student-home').hidden,false);assert.deepEqual(student.writes,[]);checks+=4;
 student.values.set('bustan_session',JSON.stringify({id:'p2'}));student.events.storage({key:'bustan_session'});assert.equal(student.get('#student-home').hidden,true);assert.equal(student.get('#visitor-home').hidden,false);assert.match(student.get('#entry-message').textContent,/تغيّر ملف الطالب/);checks+=3;
 const race=fixture({store:good});await flush();race.values.set('bustan_owner','p2');let stopped=0;race.events['document:click']({preventDefault(){stopped++},stopImmediatePropagation(){stopped++}});assert.equal(stopped,2);assert.equal(race.get('#student-home').hidden,true);checks+=2;
 const removed=fixture({store:good});await flush();removed.values.set('bustan_profiles','[]');removed.events.storage({key:'bustan_profiles'});assert.equal(removed.get('#student-home').hidden,true);assert.deepEqual(removed.writes,[]);checks+=2;
 for(const options of [{fail:'profiles.js'},{fail:'catalog.js'},{fail:'entry.js'},{current:false},{ready:false}]){const x=fixture({store:good,...options});await flush();assert.equal(x.get('#visitor-home').hidden,false);assert.equal(x.get('#student-home').hidden,true);assert.equal(x.get('#entry-message').hidden,false);assert.deepEqual(x.writes,[]);checks+=4}
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),css=fs.readFileSync(path.join(root,'welcome.css'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.ok(html.includes('id="visitor-home"')&&!html.includes('id="visitor-home" hidden'));assert.ok(html.includes('id="student-home" hidden'));assert.ok(html.includes('?welcome=1'));assert.ok(!/<script src="(?:profiles|catalog|entry)\.js"/.test(html));assert.ok(css.includes('prefers-reduced-motion'));checks+=5;
 for(const file of ['welcome.css','welcome.js','assets/img/visitor-hero-v1.webp']){assert.ok(sw.includes('"'+file+'"'));assert.ok(fs.existsSync(path.join(root,file)));checks+=2}
 // Compare with the selected merge base only while entry assets differ. A merged, clean
 // checkout is valid too; release identifiers are intentionally never pinned here.
 const base=process.env.CACHE_BASE_REF||'origin/main';
 const changed=cp.execFileSync('git',['diff','--name-only',base,'--','index.html','welcome.css','welcome.js','assets/img/visitor-hero-v1.webp','sw.js'],{cwd:root,encoding:'utf8'}).trim();
 if(changed){const previous=cp.execFileSync('git',['show',base+':sw.js'],{cwd:root,encoding:'utf8'}),version=text=>text.match(/\bconst\s+V\s*=\s*['"]([^'"]+)['"]/)[1];assert.notEqual(version(sw),version(previous),'Changed entry assets require a new root cache version');checks++}
 console.log('PASS visitor homepage: '+checks+' checks');
})().catch(e=>{console.error(e);process.exitCode=1});
