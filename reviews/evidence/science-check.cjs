const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
for(const grade of ['g6','g8']){
 const c={window:{}};vm.createContext(c);
 for(const f of ['content.js','sc-gen.js'])vm.runInContext(fs.readFileSync(path.join(root,grade,'science',f),'utf8'),c);
 for(const u of c.window.UNITS)for(const l of u.les){
  if(['energy','wave','ptable','photo','earth'].includes(l.sim))console.log(grade,l.id,l.t,JSON.stringify({sim:l.sim,pts:l.pts,terms:l.terms,gen:c.window.SCG.BY[l.sim]}));
 }
 console.log(grade,'cons sample',c.window.SCG.cons());
 const els={},queue=[];const el=id=>els[id]||(els[id]={value:'0',checked:true,innerHTML:'',textContent:'',setAttribute(k,v){this[k]=v;}});
 const app={esc:String,ar:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,S:{done:{},seen:{}},R:{},quiz(){},fig(){},save(){},addXP(){},$:s=>el(s.replace(/^#/,'')),$$:()=>[]};
 c.window.APP=app;c.window.CFG={grade:+grade.slice(1)};c.document={getElementById:el};c.requestAnimationFrame=f=>(queue.push(f),queue.length);c.cancelAnimationFrame=()=>{};
 vm.runInContext(fs.readFileSync(path.join(root,grade,'science','sc.js'),'utf8'),c);
 const en=c.window.UNITS.flatMap(u=>u.les).find(l=>l.id==='U2L1');
 if(grade==='g8')console.log('U2L1 generated types',app.gen.numQs(en,3).map(q=>q.chk.t));
 app.SIM.circuit.init();console.log(grade,'series wire',el('cv').innerHTML.match(/<path d="[^"]+" stroke="#4a5c30"[^>]+>/g));
 el('fa').value='8';el('fb').value='5';app.SIM.force.init();queue.pop()();const x1=el('box').transform;el('fa').value=el('fb').value='5';queue.pop()();const x2=el('box').transform;queue.pop()();const x3=el('box').transform;
 console.log(grade,'force balanced after motion',[x1,x2,x3],el('fo').innerHTML);
 for(const u of c.window.UNITS)for(const l of u.les)if(l.sim==='circuit'||l.sim==='atoms')console.log(grade,l.id,'book images',JSON.stringify(l.img));
}
