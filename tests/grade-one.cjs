'use strict';
// Structural, mathematical, accessibility, offline-policy and student-isolation checks.
// Browser layout / real service-worker installation are verified separately.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
const equal=(actual,expected,message)=>{assert.deepEqual(plain(actual),plain(expected),message);checks++;};
const load=file=>{const context={window:{}};vm.runInNewContext(read(file),context,{filename:file});return context.window;};
const A=load('g1/shared/art.js').G1_ART;
// Shared profile keys must reach the already installed subject applications too.
for(const grade of [6,8])for(const subject of ['math','english','arabic','science']){
  const file=`g${grade}/${subject}/sw.js`,current=read(file);
  ok(current.includes('../../profiles.js'),'Existing subject caches the shared profiles module');
  const base=process.env.CACHE_BASE_REF||'origin/main';
  const previous=execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8'});
  const oldProfiles=execFileSync('git',['show',base+':profiles.js'],{cwd:root,encoding:'utf8'});
  if(oldProfiles.replace(/\r\n/g,'\n')!==read('profiles.js').replace(/\r\n/g,'\n'))ok(current.match(/const V=['"]([^'"]+)/)[1]!==previous.match(/const V=['"]([^'"]+)/)[1],'Changed shared profile dependency receives a changed subject cache version');
}
const progress=load('g1/shared/early.js').G1_PROGRESS;
const numeral=value=>String(value).replace(/[٠-٩]/g,n=>'٠١٢٣٤٥٦٧٨٩'.indexOf(n)).trim();
const number=value=>/^\d+$/.test(numeral(value))?Number(numeral(value)):NaN;
const supportedScenes=new Set(['number-line','ten-bridge','column-operation','ordinal','line-kind','solid','week-table','measure','data-table','survey','number-writing','clock','position','count','items','symbol','shape','operation','fraction','place-value']);
const allIds=new Set(),usedIcons=new Set(),courses=[];
function validateScene(scene,where){
  if(scene==null)return;
  ok(supportedScenes.has(scene.type),'Supported scene: '+where);
  const icon=name=>{ok(typeof name==='string'&&name.length>0,'Icon name: '+where);usedIcons.add(name);ok(!A.scene({type:'items',icons:[name]}).includes('رسم توضيحي'),'Real supported icon, not fallback: '+name+' at '+where);};
  if(scene.type==='count'){ok(Number.isInteger(scene.count)&&scene.count>=0&&scene.count<=20,'Count 0–20: '+where);icon(scene.icon);}
  if(scene.type==='items'){ok(Array.isArray(scene.icons)&&scene.icons.length>0&&scene.icons.length<=20,'Items count: '+where);scene.icons.forEach(icon);}
  if(scene.type==='shape'){ok(['circle','square','triangle','rectangle'].includes(scene.value),'Known shape: '+where);if(scene.color)ok(['red','blue','green','yellow','purple','orange'].includes(scene.color),'Named shape colour: '+where);}
  if(scene.type==='symbol')ok(typeof scene.value==='string'&&scene.value.length>0,'Visible symbol: '+where);
  if(scene.type==='operation'){ok(['+','-'].includes(scene.operator),'Arithmetic operator: '+where);for(const key of ['left','right'])ok(Number.isInteger(scene[key])&&scene[key]>=0&&scene[key]<=20,'Arithmetic quantity: '+where);if(scene.operator==='-')ok(scene.right<=scene.left,'Non-negative subtraction: '+where);icon(scene.icon);}
  if(scene.type==='fraction'){ok([2,4].includes(scene.parts),'Equal halves or quarters: '+where);ok(Number.isInteger(scene.selected)&&scene.selected>0&&scene.selected<=scene.parts,'Shaded fraction part: '+where);}
  if(scene.type==='place-value')for(const key of ['tens','ones'])ok(Number.isInteger(scene[key])&&scene[key]>=0&&scene[key]<=9,'Decimal place value: '+where);
  const rendered=A.scene(scene);ok(!/<script\b|onerror\s*=|onload\s*=/i.test(rendered),'Safe scene HTML: '+where);
}
function validateMath(task,where){
  const scene=task.scene,answer=task.choices[task.answer].label;
  if(scene?.type==='count'&&Number.isFinite(number(answer)))equal(number(answer),scene.count,'Correct pictured count: '+where);
  if(scene?.type==='operation')equal(number(answer),scene.operator==='+'?scene.left+scene.right:scene.left-scene.right,'Correct pictured arithmetic: '+where);
  if(scene?.type==='place-value')equal(number(answer),/كم عشرة/.test(task.prompt)?scene.tens:scene.tens*10+scene.ones,'Correct pictured place value: '+where);
  if(scene?.type==='fraction'&&scene.selected===1)equal(answer,scene.parts===2?'نصف':'ربع','Correct pictured fraction: '+where);
  if(scene?.type==='shape'&&/اسم هذا الشكل/.test(task.prompt))equal(answer,{circle:'دائرة',square:'مربع',triangle:'مثلث',rectangle:'مستطيل'}[scene.value],'Correct pictured shape: '+where);
  if(scene?.type==='symbol'){
    const text=numeral(scene.value).replace(/\s/g,'').replace(/−/g,'-').replace(/؟/g,'?');
    let match=text.match(/^(\d+)\+\?=(\d+)$/);
    if(match)equal(number(answer),Number(match[2])-Number(match[1]),'Correct missing addend: '+where);
    match=text.match(/^(\d+)([+-])(\d+)(?:=\?)?$/);
    if(match&&Number.isFinite(number(answer)))equal(number(answer),match[2]==='+'?Number(match[1])+Number(match[3]):Number(match[1])-Number(match[3]),'Correct arithmetic expression: '+where);
  }
}
for(const subject of ['math','arabic','english','life']){
  const file=`g1/${subject}/content.js`,C=load(file).G1_COURSE;
  equal(C.id,subject,'Course identifier');equal(C.key,`bustan_g1_${subject}_v1`,'Dedicated progress key');
  ok(typeof C.sourceNote==='string'&&C.sourceNote.length>40,'Honest source note: '+subject);
  equal(C.books.map(b=>b.id),['p1','p2'],'Both official book parts: '+subject);
  for(const book of C.books){const url=new URL(book.url);ok(url.protocol==='https:'&&['elearn.edu.ps','elearn.azureedge.net','www.wepal.net'].includes(url.hostname),'Public book-source host: '+subject);ok(book.title.length>3,'Book title');}
  ok(C.units.length>0,'Units exist');equal([...new Set(C.units.map(u=>u.term))].sort(),[1,2],'Both semesters: '+subject);
  let lessonCount=0,taskCount=0;
  function id(value,kind){ok(typeof value==='string'&&/^[A-Za-z0-9_-]+$/.test(value),'Stable '+kind+' identifier');ok(!allIds.has(value),'Unique identifier: '+value);allIds.add(value);}
  function lesson(L,term){
    id(L.id,'lesson');lessonCount++;ok(C.books.some(b=>b.id===L.book),'Referenced book: '+L.id);if(term)equal(L.book,`p${term}`,'Book matches semester: '+L.id);
    ok(Number.isInteger(L.page)&&L.page>0&&L.page<300,'Printed reference page: '+L.id);for(const key of ['title','goal'])ok(typeof L[key]==='string'&&L[key].length>0,'Visible '+key+': '+L.id);
    ok(Array.isArray(L.steps)&&L.steps.length>=1&&L.steps.length<=6,'Short explanation before practice: '+L.id);ok(Array.isArray(L.tasks)&&L.tasks.length>=1&&L.tasks.length<=6,'Short practice: '+L.id);
    L.steps.forEach((step,i)=>{ok(typeof step.text==='string'&&step.text.length>0,'Explanation text: '+L.id);validateScene(step.scene,L.id+'/step'+i);});
    L.tasks.forEach((task,i)=>{const where=L.id+'/task'+i;taskCount++;ok(typeof task.prompt==='string'&&task.prompt.length>0,'Question prompt: '+where);ok(typeof task.explain==='string'&&task.explain.length>0,'Explanatory feedback: '+where);ok(Array.isArray(task.choices)&&task.choices.length>=2&&task.choices.length<=4,'Small choice set: '+where);ok(Number.isInteger(task.answer)&&task.answer>=0&&task.answer<task.choices.length,'Valid correct-answer index: '+where);const labels=task.choices.map(c=>c.label);ok(labels.every(label=>typeof label==='string'&&label.trim().length>0),'Nonempty options: '+where);equal(new Set(labels.map(label=>label.trim())).size,labels.length,'Distinct options: '+where);validateScene(task.scene,where);task.choices.forEach((choice,i)=>validateScene(choice.scene,where+'/choice'+i));if(subject==='math')validateMath(task,where);});
  }
  for(const unit of C.units){id(unit.id,'unit');ok([1,2].includes(unit.term),'Valid semester: '+unit.id);ok(C.books.some(b=>b.id===unit.book),'Unit book reference');equal(unit.book,`p${unit.term}`,'Unit book matches semester');ok(Number.isInteger(unit.page)&&unit.page>0,'Unit printed reference page');ok(unit.lessons.length>0,'Unit activities exist');unit.lessons.forEach(L=>lesson(L,unit.term));}
  (C.foundations||[]).forEach(L=>lesson(L));
  const serialized=JSON.stringify(C);ok(!/[\p{Extended_Pictographic}]/u.test(serialized),'No emoji: '+subject);
  const index=read(`g1/${subject}/index.html`);ok(/lang="ar"/.test(index)&&/dir="rtl"/.test(index),'Arabic RTL page');for(const asset of ['../../profiles.js','content.js','../shared/art.js','../shared/early.js','../shared/early.css'])ok(index.includes(asset),'Local page dependency: '+asset);ok(!/<(?:script|link)\b(?![^>]*rel="canonical")[^>]*(?:src|href)="https?:/i.test(index),'No remote code or font dependency');
  courses.push({subject,units:C.units.length,lessons:lessonCount,tasks:taskCount,key:C.key});
}
const English=load('g1/english/content.js').G1_COURSE;
for(const L of English.units.flatMap(u=>u.lessons).filter(l=>l.goal.startsWith('أتعرف كلمتين'))){
  ok(L.tasks[1].choices.every(c=>!c.scene),'Word recognition options have no picture clues: '+L.id);
  ok(!L.tasks[1].scene.caption,'Picture prompt does not reveal its translation: '+L.id);
}
// Rendering is bounded and text is escaped, including malformed descriptors.
for(let count=0;count<=20;count++){const html=A.scene({type:'count',count,icon:'apple'});equal((html.match(/class="g1-art-object"/g)||[]).length,count,'Exact visual count '+count);ok(html.includes('role="img"')&&html.includes('aria-label='),'Count accessible name');}
equal((A.scene({type:'count',count:999,icon:'apple'}).match(/g1-art-object/g)||[]).length,20,'Defensive count cap');
for(const value of ['٢ + ؟ = ٥','12 - 2 = ?','٣ ، ٤ ، ٥','Hello'])ok(A.scene({type:'symbol',value}).includes('dir="ltr"'),'Symbols maintain LTR: '+value);
for(const value of ['ب','بَا','هذا كتاب'])ok(A.scene({type:'symbol',value}).includes('dir="rtl"'),'Arabic letters maintain RTL');
const hostile='<img src=x onerror="alert(1)">';const escaped=A.scene({type:'symbol',value:hostile,caption:hostile});ok(!escaped.includes('<img')&&escaped.includes('&lt;img'),'Symbol and caption HTML escaping');
ok(A.scene({type:'items',icons:['eye','ear']}).includes('aria-label="عين، أذن"'),'Items describe actual illustrations');ok(A.scene({type:'shape',value:'triangle'}).includes('aria-label="مثلث"'),'Shape accessible name');ok(!A.icon('__proto__').includes('[object'),'Unknown icon cannot access prototype');ok(!A.scene({type:'shape',value:'constructor',color:'__proto__'}).includes('[object'),'Shape keys cannot access prototype');
for(const parts of [2,4]){const html=A.scene({type:'fraction',parts,selected:1});equal((html.match(/<rect /g)||[]).length,parts,'Exact equal fraction parts');equal((html.match(/fill="#9cbd7c"/g)||[]).length,1,'Exactly one shaded fraction part');ok(html.includes(`width="${240/parts}"`),'Equal widths for fraction pieces');}
for(const [tens,ones] of [[0,0],[1,4],[3,4],[9,9]]){const html=A.scene({type:'place-value',tens,ones});equal((html.match(/fill="#b2ca8c"/g)||[]).length,tens*10,'Ten blocks per rod');equal((html.match(/fill="#f1d28e"/g)||[]).length,ones,'Distinct unit blocks');ok(html.includes('role="img"'),'Place value accessible');}
ok(!A.scene({type:'place-value',tens:2,ones:5}).includes('٢٥'),'Place-value question does not print or announce its numeric answer');
const plus=A.scene({type:'operation',left:2,right:3,operator:'+',icon:'ball'}),minus=A.scene({type:'operation',left:5,right:2,operator:'-',icon:'ball'});equal((plus.match(/class="g1-icon"/g)||[]).length,5,'Addition visualises both groups');equal((minus.match(/stroke="#9c5f4c"/g)||[]).length,2,'Subtraction crosses exactly removed objects');ok(!plus.includes('= ٥'),'Addition task does not print answer');
// Normalization rejects foreign / malformed records, without touching input.
const ids=['allowed-one','allowed-two'],valid={version:1,completed:{'allowed-one':{at:'2026-10-18T10:00:00Z',attempts:2},foreign:{at:'2026-10-18T10:00:00Z',attempts:1},'allowed-two':{at:'invalid',attempts:1}},rounds:3,last:'foreign'},before=JSON.stringify(valid),normalized=progress.normalize(valid,ids);
equal(Object.keys(normalized.completed),['allowed-one'],'Only course activity IDs survive');equal(normalized.last,null,'Foreign last activity rejected');equal(normalized.rounds,3,'Valid rounds retained');equal(JSON.stringify(valid),before,'Normalization does not mutate input');
for(const raw of [null,[],{},'{invalid',JSON.stringify({version:2})])equal(progress.normalize(raw,ids),{version:1,completed:{},rounds:0,last:null},'Malformed progress resets safely');
for(const attempts of [-1,0,1.5,10001])equal(Object.keys(progress.normalize({version:1,completed:{'allowed-one':{at:'2026-10-18T10:00:00Z',attempts}}},ids).completed),[],'Invalid attempt count excluded');
// Exercise each SW's real allowlist and fetch policy; no network is needed here.
async function verifyWorker(subject){
  const handlers={},deleted=[],added=[];let served=false;
  const cache={addAll:async files=>{for(const request of files)ok(request.cache==='reload','Cache install bypasses stale HTTP responses');added.push(...files.map(request=>request.url));},match:async()=>new Response('offline-cached'),put:async()=>{}};
  const scope=`https://example.test/abboud-math/g1/${subject}/`;
  const context={URL,Request,Response,fetch:async()=>{throw Error('Network unavailable');},self:{registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>cache,keys:async()=>[`${subject}-foreign`],delete:async name=>{deleted.push(name);}},importScripts:()=>{}};
  const file=`g1/${subject}/sw.js`;vm.createContext(context);vm.runInContext(read(file)+'\nthis.workerConfig={V,PREFIX,F};',context);const cfg=context.workerConfig;
  ok(typeof cfg.V==='string'&&cfg.V.startsWith(cfg.PREFIX),'Worker version belongs to subject namespace');ok(Array.isArray(cfg.F)&&cfg.F.length>12,'Public dependency manifest exists');equal(new Set(cfg.F).size,cfg.F.length,'No duplicate cache dependencies');
  for(const asset of cfg.F){const resolved=new URL(asset,scope);equal(resolved.origin,new URL(scope).origin,'Same-origin offline dependency');const relative=decodeURIComponent(resolved.pathname).replace(/^\/abboud-math\//,'');ok(fs.existsSync(path.join(root,relative)),'Cached file exists: '+relative);ok(!/\.(mp3|wav|ogg|m4a)$/i.test(relative),'No unapproved audio dependency');ok(!/api|backup|draft/i.test(relative),'No private cache entry');}
  for(const asset of ['content.js','../shared/early.js','../shared/art.js','../shared/early.css','../../profiles.js'])ok(cfg.F.some(u=>u.split('?')[0]===asset),'Cached essential asset: '+asset);
  let base=process.env.CACHE_BASE_REF||'origin/main';try{const old=execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});const prior=old.match(/\bconst\s+V\s*=\s*['"]([^'"]+)/)?.[1];if(old.replace(/\r\n/g,'\n')!==read(file).replace(/\r\n/g,'\n'))ok(cfg.V!==prior,'Changed SW uses changed cache version, without hard-coded release');}catch(error){if(error.code==='ERR_ASSERTION')throw error;/* New subject has no prior cache release. */}
  vm.runInContext(read('g1/shared/offline.js'),context);let wait;handlers.install({waitUntil:p=>wait=p});await wait;equal(added,cfg.F.map(file=>new URL(file,scope).href),'Install caches exact public manifest');
  const fetch=async(url,method='GET')=>{served=false;let response;handlers.fetch({request:{url,method},respondWith:p=>{served=true;response=p;}});return {served,response:response?await response:null};};
  let event=await fetch(scope+'content.js?v=cache-test');ok(event.served,'Public content query uses canonical cached URL');equal(await event.response.text(),'offline-cached','Cached response works when network throws');
  for(const [url,method] of [[scope+'private-progress.json','GET'],['https://other.test/abboud-math/g1/'+subject+'/content.js','GET'],[scope+'content.js','POST']])ok(!(await fetch(url,method)).served,'Private, foreign or mutable request is not intercepted');
  context.caches.keys=async()=>[cfg.V,cfg.PREFIX+'old',`unrelated-${subject}`];handlers.activate({waitUntil:p=>wait=p});await wait;equal(deleted,[cfg.PREFIX+'old'],'Only old caches of this subject removed');
}
async function verifyProfiles(){
  const values=new Map(),LS={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  const context={localStorage:LS,navigator:{},crypto:webcrypto,isSecureContext:true,TextEncoder,Uint8Array,addEventListener(){}};context.window=context;vm.runInNewContext(read('profiles.js'),context);const P=context.PROFILES;ok(await P.ready,'Profile storage initializes');
  let previousKeys=[];try{const old=execFileSync('git',['show','origin/main:profiles.js'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});previousKeys=[...old.match(/const PER=\[([^\]]+)\]/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);}catch{}
  for(const key of previousKeys)ok(P.PER.includes(key),'Existing profile key retained: '+key);
  for(const C of courses)ok(P.PER.includes(C.key),'Grade-one progress participates in switching and backup');
  const first=await P.create('طفل أول','idle','1111'),writers={};for(const C of courses){writers[C.key]=P.writer(C.key);ok(await writers[C.key](JSON.stringify({marker:'first-'+C.subject})),'Save first child '+C.subject);}
  const second=await P.create('طفل ثان','idle','2222');for(const C of courses){equal(P.readProgress(C.key),null,'New child cannot inherit first child progress');ok(await P.writer(C.key)(JSON.stringify({marker:'second-'+C.subject})),'Save second child '+C.subject);equal(await writers[C.key](JSON.stringify({marker:'stale'})),false,'Stale child writer cannot overwrite '+C.subject);}
  ok(await P.login(first.id),'Switch back to first child');for(const C of courses)equal(JSON.parse(P.readProgress(C.key)).marker,'first-'+C.subject,'First child isolated: '+C.subject);
  const backup=P.backup();for(const C of courses){equal(JSON.parse(backup.data[first.id][C.key]).marker,'first-'+C.subject,'Backup retains first child subject');equal(JSON.parse(backup.data[second.id][C.key]).marker,'second-'+C.subject,'Backup retains second child subject');}
  await P.restore(backup);ok(await P.login(second.id),'Restored second child can open');for(const C of courses)equal(JSON.parse(P.readProgress(C.key)).marker,'second-'+C.subject,'Restored subject stays isolated');
}
(async()=>{for(const C of courses)await verifyWorker(C.subject);await verifyProfiles();console.log(JSON.stringify({checks,courses,usedIcons:usedIcons.size},null,2));console.log('Grade one: curriculum structure, picture/math integrity, accessible scenes, cache policy, and student isolation passed.');})().catch(error=>{console.error(error);process.exitCode=1;});
