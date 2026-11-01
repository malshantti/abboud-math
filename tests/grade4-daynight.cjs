// N03: compare the rendered city's location with the Sun-facing hemisphere.
// Run with --original to verify that the regression test rejects origin/main.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),original=process.argv.includes('--original'),base=process.env.CACHE_BASE_REF||'origin/main';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const previous=file=>cp.execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8'});
const nodes=Object.fromEntries(['hr','hrv','dv','do'].map(id=>[id,{value:'8',innerHTML:'',textContent:''}]));
const A={S:{done:{'qa:preserve':37},seen:{}},R:{},esc:String,ic:()=>'',ar:n=>String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),shuffle:a=>a.slice(),pick:a=>a[0],rnd:()=>0,save(){},$:s=>nodes[s.slice(1)],$$:()=>[]};
const context={window:{APP:A,CFG:{grade:4}},console,setTimeout(){},requestAnimationFrame(){},cancelAnimationFrame(){}};
vm.createContext(context);vm.runInContext(original?previous('g4/science/sims.js'):read('g4/science/sims.js'),context);
context.window.SIMS.daynight.init();
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
let checks=0;
for(let hour=0;hour<24;hour++){
 nodes.hr.value=String(hour);nodes.hr.oninput();
 const drawing=nodes.dv.innerHTML,circles=[...drawing.matchAll(/<circle\b[^>]*>/g)].map(m=>attrs(m[0]));
 const sun=circles.find(c=>+c.r===50),earth=circles.find(c=>+c.r===90),city=circles.find(c=>+c.r===9);
 assert.ok(sun&&earth&&city,'Sun, Earth and city are drawn');
 assert.ok(+sun.cx<+earth.cx,'The Sun is drawn to the left of Earth');
 assert.match(drawing,/<path d="M420 40 A90 90 0 0 0 420 220 Z" fill="#2f7fb5"\/>/,'The illuminated semicircle faces the Sun');
 const dx=+city.cx-+earth.cx,expectedDay=hour>6&&hour<18;
 if(hour===6||hour===18){
  assert.ok(Math.abs(dx)<1e-7,'Sunrise and sunset lie on the boundary between day and night');
  assert.match(nodes.do.innerHTML,hour===6?/الشروق/:/الغروب/);
 }else{
  assert.equal(dx<0,expectedDay,`At ${hour}:00 the city must be on the ${expectedDay?'illuminated':'dark'} hemisphere`);
  assert.match(nodes.do.innerHTML,expectedDay?/<b>النهار<\/b>/:/<b>الليل<\/b>/);
 }
 if(hour===0)assert.ok(+city.cx>+earth.cx+80,'Midnight city faces away from the Sun');
 if(hour===12)assert.ok(+city.cx<+earth.cx-80,'Noon city faces the Sun');
 assert.equal(nodes.hrv.textContent,A.ar(hour),'Time uses Arabic-Indic digits');
 checks++;
}
assert.equal(A.S.done['qa:preserve'],37,'Existing progress is preserved');
if(!original){
 const version=text=>text.match(/\bconst\s+V\s*=\s*['"]([^'"]+)/)?.[1];
 assert.ok(version(read('g4/science/sw.js')),'The subject has a cache version');
 const normalize=text=>text.replace(/\r\n/g,'\n');
 if(normalize(read('g4/science/sims.js'))!==normalize(previous('g4/science/sims.js')))
  assert.notEqual(version(read('g4/science/sw.js')),version(previous('g4/science/sw.js')),'The changed simulation receives a changed cache version');
}
console.log(`PASS grade-four day/night: ${checks} hourly positions, transition labels, numerals, progress and changed cache`);
