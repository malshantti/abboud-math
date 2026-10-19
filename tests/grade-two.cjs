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
const A=load('g2/shared/art.js').G1_ART;
const css=read('g2/shared/early.css');
ok(!/@import\b|url\(\s*['"]?https?:/i.test(css),'Grade-two styles use no external stylesheets or CDN fonts');
for(const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)){
  if(match[1].startsWith('data:'))continue;
  ok(fs.existsSync(path.resolve(root,'g2/shared',match[1])),'Local style asset exists: '+match[1]);
}
const catalog=load('catalog.js').CATALOG;
equal([...(catalog.gradeSubjects?.[2]||[])].sort(),['arabic','english','life','math'],'Grade two lists its four approved subjects');
for(const subject of ['math','arabic','english','life']){
  const entries=catalog.entries.filter(entry=>entry.grade===2&&entry.subject===subject);
  equal(entries.length,1,'One grade-two catalog entry per subject');
  equal(entries[0].status,'active','Grade-two subject is available');
  equal(entries[0].path,`g2/${subject}/`,'Catalog points to the independent second-grade application');
}
const baseRef=process.env.CACHE_BASE_REF||'origin/main';
const rootWorkerBefore=execFileSync('git',['show',baseRef+':sw.js'],{cwd:root,encoding:'utf8'});
const rootPublicChanged=['catalog.js','profiles.js','entry.js'].some(file=>execFileSync('git',['show',baseRef+':'+file],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n')!==read(file).replace(/\r\n/g,'\n'));
if(rootPublicChanged)ok(read('sw.js').match(/const V=['"]([^'"]+)/)[1]!==rootWorkerBefore.match(/const V=['"]([^'"]+)/)[1],'Changed catalog and shared profiles receive a new root cache release');
// Shared profile keys must reach the already installed subject applications too.
for(const grade of [6,8])for(const subject of ['math','english','arabic','science']){
  const file=`g${grade}/${subject}/sw.js`,current=read(file);
  ok(current.includes('../../profiles.js'),'Existing subject caches the shared profiles module');
  const base=process.env.CACHE_BASE_REF||'origin/main';
  const previous=execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8'});
  const oldProfiles=execFileSync('git',['show',base+':profiles.js'],{cwd:root,encoding:'utf8'});
  if(oldProfiles.replace(/\r\n/g,'\n')!==read('profiles.js').replace(/\r\n/g,'\n'))ok(current.match(/const V=['"]([^'"]+)/)[1]!==previous.match(/const V=['"]([^'"]+)/)[1],'Changed shared profile dependency receives a changed subject cache version');
}
const progress=load('g2/shared/early.js').G1_PROGRESS;
const numeral=value=>String(value).replace(/[٠-٩]/g,n=>'٠١٢٣٤٥٦٧٨٩'.indexOf(n)).trim();
const number=value=>/^\d+$/.test(numeral(value))?Number(numeral(value)):NaN;
const supportedScenes=new Set(['count','items','symbol','shape','operation','fraction','place-value','groups','clock']);
const allIds=new Set(),usedIcons=new Set(),courses=[];
function visibleText(value,where){ok(typeof value==='string'&&value.trim().length>0,'Visible text: '+where);ok(!/[0-9۰-۹]/.test(value),'Visible numbers use Arabic-Indic digits: '+where);ok(!/[\p{Extended_Pictographic}]/u.test(value),'No emoji in visible text: '+where);}
function validateScene(scene,where){
  if(scene==null)return;
  ok(supportedScenes.has(scene.type),'Supported scene: '+where);
  const icon=name=>{ok(typeof name==='string'&&name.length>0,'Icon name: '+where);usedIcons.add(name);ok(A.icon(name)!==A.icon('__unsupported__'),'Icon has an actual drawing: '+name+' at '+where);ok(!A.scene({type:'items',icons:[name]}).includes('رسم توضيحي'),'Real supported icon with an accessible name: '+name+' at '+where);};
  if(scene.type==='count'){ok(Number.isInteger(scene.count)&&scene.count>=0&&scene.count<=20,'Count 0–20: '+where);icon(scene.icon);}
  if(scene.type==='items'){ok(Array.isArray(scene.icons)&&scene.icons.length>0&&scene.icons.length<=20,'Items count: '+where);scene.icons.forEach(icon);}
  if(scene.type==='shape'){ok(['circle','square','triangle','rectangle'].includes(scene.value),'Known shape: '+where);if(scene.color)ok(['red','blue','green','yellow','purple','orange'].includes(scene.color),'Named shape colour: '+where);}
  if(scene.type==='symbol')visibleText(scene.value,where+'/symbol');
  if(scene.caption)visibleText(scene.caption,where+'/caption');
  if(scene.type==='operation'){ok(['+','-'].includes(scene.operator),'Arithmetic operator: '+where);for(const key of ['left','right'])ok(Number.isInteger(scene[key])&&scene[key]>=0&&scene[key]<=20,'Arithmetic quantity: '+where);if(scene.operator==='-')ok(scene.right<=scene.left,'Non-negative subtraction: '+where);icon(scene.icon);}
  if(scene.type==='fraction'){ok([2,3,4,5,8].includes(scene.parts),'Equal curriculum fraction parts: '+where);ok(Number.isInteger(scene.selected)&&scene.selected>0&&scene.selected<=scene.parts,'Shaded fraction part: '+where);}
  if(scene.type==='place-value')for(const key of ['hundreds','tens','ones'])ok(Number.isInteger(scene[key]??0)&&(scene[key]??0)>=0&&(scene[key]??0)<=9,'Decimal place value: '+where);
  if(scene.type==='clock'){ok(Number.isInteger(scene.hour)&&scene.hour>=1&&scene.hour<=12,'Clock hour: '+where);ok(scene.minute===0,'Grade-two activities use full hours only: '+where);}
  if(scene.type==='groups'){for(const key of ['groups','countPerGroup'])ok(Number.isInteger(scene[key])&&scene[key]>=0&&scene[key]<=10,'Bounded equal groups: '+where);ok(scene.groups*scene.countPerGroup<=100,'Bounded multiplication picture: '+where);icon(scene.icon);}
  const rendered=A.scene(scene);ok(!/<script\b|onerror\s*=|onload\s*=/i.test(rendered),'Safe scene HTML: '+where);
}
function validateMath(task,where){
  const scene=task.scene,answer=task.choices[task.answer].label;
  if(scene?.type==='count'&&Number.isFinite(number(answer))){
    if(/بالتساوي|في كل مجموعة/.test(task.prompt)&&/كم/.test(task.prompt)){
      const quantities=numeral(task.prompt).match(/\d+/g)?.map(Number)||[],divisor=/طفلين/.test(task.prompt)?2:quantities[1];
      equal(quantities[0],scene.count,'Division picture matches the story total: '+where);ok(Number.isInteger(divisor)&&divisor>0,'Explicit equal-sharing / grouping divisor: '+where);equal(number(answer),scene.count/divisor,'Correct division of pictured total: '+where);
    }else equal(number(answer),scene.count,'Correct pictured count: '+where);
  }
  if(scene?.type==='operation')equal(number(answer),scene.operator==='+'?scene.left+scene.right:scene.left-scene.right,'Correct pictured arithmetic: '+where);
  if(scene?.type==='place-value'&&Number.isFinite(number(answer))){const expected=/كم (?:عشرة|عشرات)/.test(task.prompt)?scene.tens:/كم (?:مئة|مئات)/.test(task.prompt)?scene.hundreds:/كم (?:واحد|آحاد)/.test(task.prompt)?scene.ones:(scene.hundreds||0)*100+scene.tens*10+scene.ones;equal(number(answer),expected,'Correct pictured place value: '+where);}
  if(scene?.type==='groups'&&Number.isFinite(number(answer)))equal(number(answer),/كم مجموعة|عدد المجموعات/.test(task.prompt)?scene.groups:/كل مجموعة/.test(task.prompt)&&!/المجموع/.test(task.prompt)?scene.countPerGroup:scene.groups*scene.countPerGroup,'Correct equal groups: '+where);
  if(scene?.type==='fraction'&&scene.selected===1){const named={2:'نصف',3:'ثلث',4:'ربع',5:'خمس',8:'ثمن'}[scene.parts];ok(answer===named||numeral(answer).replace(/\s/g,'')==='1/'+scene.parts,'Correct pictured unit fraction: '+where);}
  if(scene?.type==='shape'&&/اسم هذا الشكل/.test(task.prompt))equal(answer,{circle:'دائرة',square:'مربع',triangle:'مثلث',rectangle:'مستطيل'}[scene.value],'Correct pictured shape: '+where);
  if(scene?.type==='symbol'){
    const text=numeral(scene.value).replace(/\s/g,'').replace(/−/g,'-').replace(/؟/g,'?');
    let match=text.match(/^(\d+)\+\?=(\d+)$/);
    if(match)equal(number(answer),Number(match[2])-Number(match[1]),'Correct missing addend: '+where);
    match=text.match(/^(\d+)([+\-×÷])(\d+)(?:=\?)?$/);
    if(match&&Number.isFinite(number(answer))){const left=Number(match[1]),right=Number(match[3]),op=match[2];equal(number(answer),op==='+'?left+right:op==='-'?left-right:op==='×'?left*right:left/right,'Correct arithmetic expression: '+where);}
    match=text.match(/^(\d+)\?(\d+)$/);
    if(match&&['<','>','='].includes(answer))equal(answer,Number(match[1])<Number(match[2])?'<':Number(match[1])>Number(match[2])?'>':'=','Correct comparison relation: '+where);
    match=text.match(/^(\d+)[،,](\d+)$/);
    if(match&&/أكبر|أصغر/.test(task.prompt))equal(number(answer),(/أكبر/.test(task.prompt)?Math.max:Math.min)(Number(match[1]),Number(match[2])),'Correct comparison between displayed numbers: '+where);
    match=text.match(/^(\d+)[،,]\?$/);
    if(match&&/التالي/.test(task.prompt))equal(number(answer),Number(match[1])+1,'Correct next integer: '+where);
    match=text.match(/^\?[،,](\d+)$/);
    if(match&&/السابق/.test(task.prompt))equal(number(answer),Number(match[1])-1,'Correct previous integer: '+where);
  }
  if(/أي عدد زوجي/.test(task.prompt))equal(number(answer)%2,0,'Chosen even integer: '+where);
  if(/أي عدد فردي/.test(task.prompt))equal(number(answer)%2,1,'Chosen odd integer: '+where);
  if(/أي ترتيب تصاعدي|أي ترتيب تنازلي/.test(task.prompt)){
    const numbers=numeral(answer).split(/[،,]/).map(Number),ascending=/تصاعدي/.test(task.prompt);
    ok(numbers.length>=2&&numbers.every(Number.isFinite)&&numbers.every((value,i)=>i===0||(ascending?value>=numbers[i-1]:value<=numbers[i-1])),'Chosen ordered sequence: '+where);
  }
  if(scene?.type==='shape'&&/كم (?:رأسًا|ضلعًا)/.test(task.prompt)){
    const counts={circle:0,triangle:3,square:4,rectangle:4};equal(number(answer),counts[scene.value],'Shape sides / vertices: '+where);
  }
  if(scene?.type==='items'&&/كم تفاحة/.test(task.prompt))equal(number(answer),scene.icons.filter(icon=>icon==='apple').length,'Count only the requested fruit in mixed data: '+where);
}
for(const subject of ['math','arabic','english','life']){
  const file=`g2/${subject}/content.js`,C=load(file).G1_COURSE;
  equal(C.id,subject,'Course identifier');equal(C.grade,2,'Second-grade course metadata');equal(C.key,`bustan_g2_${subject}_v1`,'Dedicated progress key');
  visibleText(C.title,subject+'/title');
  ok(typeof C.sourceNote==='string'&&C.sourceNote.length>40,'Honest source note: '+subject);
  visibleText(C.sourceNote,subject+'/source-note');
  equal(C.books.map(b=>b.id),['p1','p2'],'Both official book parts: '+subject);
  for(const book of C.books){const url=new URL(book.url);ok(url.protocol==='https:'&&['elearn.edu.ps','elearn.azureedge.net','www.wepal.net'].includes(url.hostname),'Public book-source host: '+subject);visibleText(book.title.replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),subject+'/book/'+book.id);}
  ok(C.units.length>0,'Units exist');equal([...new Set(C.units.map(u=>u.term))].sort(),[1,2],'Both semesters: '+subject);
  let lessonCount=0,taskCount=0;
  function id(value,kind){ok(typeof value==='string'&&/^[A-Za-z0-9_-]+$/.test(value),'Stable '+kind+' identifier');ok(!allIds.has(value),'Unique identifier: '+value);allIds.add(value);}
  function lesson(L,term){
    id(L.id,'lesson');lessonCount++;ok(C.books.some(b=>b.id===L.book),'Referenced book: '+L.id);if(term)equal(L.book,`p${term}`,'Book matches semester: '+L.id);
    ok(Number.isInteger(L.page)&&L.page>0&&L.page<300,'Printed reference page: '+L.id);for(const key of ['title','goal'])visibleText(L[key],L.id+'/'+key);
    ok(Array.isArray(L.steps)&&L.steps.length>=1&&L.steps.length<=6,'Short explanation before practice: '+L.id);ok(Array.isArray(L.tasks)&&L.tasks.length>=1&&L.tasks.length<=6,'Short practice: '+L.id);
    L.steps.forEach((step,i)=>{visibleText(step.text,L.id+'/step'+i);validateScene(step.scene,L.id+'/step'+i);});
    L.tasks.forEach((task,i)=>{
      const where=L.id+'/task'+i;taskCount++;
      visibleText(task.prompt,where+'/prompt');visibleText(task.explain,where+'/explain');
      ok(Array.isArray(task.choices)&&task.choices.length>=2&&task.choices.length<=4,'Small choice set: '+where);
      ok(Number.isInteger(task.answer)&&task.answer>=0&&task.answer<task.choices.length,'Valid correct-answer index: '+where);
      const labels=task.choices.map(c=>c.label);labels.forEach((label,j)=>visibleText(label,where+'/option'+j));
      equal(new Set(labels.map(label=>label.normalize('NFC').trim().replace(/\s+/g,' '))).size,labels.length,'Distinct options: '+where);
      validateScene(task.scene,where);task.choices.forEach((choice,j)=>validateScene(choice.scene,where+'/choice'+j));
      if(subject==='math')validateMath(task,where);
      if(subject==='english'){
        const picturedWords={bee:'bee',butterfly:'butterfly',ear:'ear',eye:'eye',bird:'bird',school:'school',house:'house',plane:'plane',train:'train',pencil:'pencil',book:'book',shoes:'shoes',shirt:'shirt',fish:'fish'};
        const selected=task.choices[task.answer],word=task.prompt.match(/أختار الصورة التي تدل على:\s*([A-Za-z]+)$/)?.[1];
        if(word&&picturedWords[word])equal(selected.scene?.icons,[picturedWords[word]],'English word selects its actual picture: '+where);
        if(task.prompt==='أختار الكلمة المناسبة للصورة.'&&task.scene?.type==='items'&&task.scene.icons.length===1){const expected=Object.entries(picturedWords).find(([,icon])=>icon===task.scene.icons[0])?.[0];ok(expected,'Known picture-word reference: '+where);equal(selected.label,expected,'English word describes the picture: '+where);ok(task.choices.every(choice=>!choice.scene),'Word-recognition options do not give away the answer with duplicate pictures: '+where);}
      }
    });
  }
  for(const unit of C.units){id(unit.id,'unit');visibleText(unit.title,unit.id+'/title');ok([1,2].includes(unit.term),'Valid semester: '+unit.id);ok(C.books.some(b=>b.id===unit.book),'Unit book reference');equal(unit.book,`p${unit.term}`,'Unit book matches semester');ok(Number.isInteger(unit.page)&&unit.page>0,'Unit printed reference page');ok(unit.lessons.length>0,'Unit activities exist');unit.lessons.forEach(L=>lesson(L,unit.term));}
  (C.foundations||[]).forEach(L=>lesson(L));
  if(subject==='arabic'||subject==='english'){
    ok(C.lab&&Array.isArray(C.lab.items)&&C.lab.items.length>=3,'Language word-order laboratory has multiple sentences');
    visibleText(C.lab.title,subject+'/lab/title');visibleText(C.lab.prompt,subject+'/lab/prompt');
    C.lab.items.forEach((item,i)=>{const where=subject+'/lab/'+i;ok(Array.isArray(item.words)&&item.words.length>=2&&item.words.length<=8,'Short sentence word bank: '+where);item.words.forEach((word,j)=>visibleText(word,where+'/word'+j));visibleText(item.hint,where+'/hint');validateScene(item.scene,where);});
  }
  if(subject==='life'){
    ok(C.lab&&Array.isArray(C.lab.items)&&C.lab.items.length>=3,'Life classification laboratory has multiple examples');
    visibleText(C.lab.title,'life/lab/title');visibleText(C.lab.prompt,'life/lab/prompt');
    ok(Array.isArray(C.lab.categories)&&C.lab.categories.length>=2&&C.lab.categories.length<=4,'Small classification category set');
    C.lab.categories.forEach((label,i)=>visibleText(label,'life/lab/category'+i));equal(new Set(C.lab.categories).size,C.lab.categories.length,'Distinct classification categories');
    const organisms=new Set(['tree','cat','bird','boy','girl','seed','rabbit','cow','bee','hen']),nonliving=new Set(['rock','chair','ball','book','pen','pencil','car']);
    C.lab.items.forEach((item,i)=>{visibleText(item.label,'life/lab/item'+i);ok(Number.isInteger(item.category)&&item.category>=0&&item.category<C.lab.categories.length,'Classification answer is a valid category');validateScene({type:'items',icons:[item.icon]},'life/lab/item'+i);ok(organisms.has(item.icon)||nonliving.has(item.icon),'Independently recognizable classification example');equal(C.lab.categories[item.category],organisms.has(item.icon)?'كائن حيّ':'شيء غير حيّ','Scientifically correct living / nonliving classification');});
    const illustrations={'l2-1-3':'thobe','l2-6-2':'moon','l2-6-3':'compass'};
    for(const [id,icon] of Object.entries(illustrations)){const L=C.units.flatMap(unit=>unit.lessons).find(lesson=>lesson.id===id);ok(L?.steps.some(step=>step.scene?.type==='items'&&step.scene.icons.includes(icon)),'Actual subject illustration instead of an unrelated placeholder: '+id);}
  }
  const serialized=JSON.stringify(C);ok(!/[\p{Extended_Pictographic}]/u.test(serialized),'No emoji: '+subject);
  const index=read(`g2/${subject}/index.html`);ok(/lang="ar"/.test(index)&&/dir="rtl"/.test(index),'Arabic RTL page');ok(index.includes('الصف الثاني')&&!index.includes('الصف الأول'),'Page identifies the second grade');for(const asset of ['../../profiles.js','content.js','../shared/art.js','../shared/early.js','../shared/early.css'])ok(index.includes(asset),'Local page dependency: '+asset);ok(!/<(?:script|link)\b[^>]*(?:src|href)="https?:/i.test(index),'No remote code or font dependency');
  const manifest=JSON.parse(read(`g2/${subject}/manifest.webmanifest`));ok(manifest.name.includes('الصف الثاني')&&!manifest.name.includes('الصف الأول'),'Install name identifies grade two');equal(manifest.scope,'./','Manifest stays inside this subject');
  courses.push({subject,units:C.units.length,lessons:lessonCount,tasks:taskCount,key:C.key});
}
// Rendering is bounded and text is escaped, including malformed descriptors.
for(let count=0;count<=20;count++){const html=A.scene({type:'count',count,icon:'apple'});equal((html.match(/class="g1-art-object"/g)||[]).length,count,'Exact visual count '+count);ok(html.includes('role="img"')&&html.includes('aria-label='),'Count accessible name');}
equal((A.scene({type:'count',count:999,icon:'apple'}).match(/g1-art-object/g)||[]).length,20,'Defensive count cap');
for(const value of ['٢ + ؟ = ٥','12 - 2 = ?','٣ ، ٤ ، ٥','Hello'])ok(A.scene({type:'symbol',value}).includes('dir="ltr"'),'Symbols maintain LTR: '+value);
for(const value of ['ب','بَا','هذا كتاب'])ok(A.scene({type:'symbol',value}).includes('dir="rtl"'),'Arabic letters maintain RTL');
const hostile='<img src=x onerror="alert(1)">';const escaped=A.scene({type:'symbol',value:hostile,caption:hostile});ok(!escaped.includes('<img')&&escaped.includes('&lt;img'),'Symbol and caption HTML escaping');
ok(A.scene({type:'items',icons:['eye','ear']}).includes('aria-label="عين، أذن"'),'Items describe actual illustrations');ok(A.scene({type:'shape',value:'triangle'}).includes('aria-label="مثلث"'),'Shape accessible name');ok(!A.icon('__proto__').includes('[object'),'Unknown icon cannot access prototype');ok(!A.scene({type:'shape',value:'constructor',color:'__proto__'}).includes('[object'),'Shape keys cannot access prototype');
for(const parts of [2,3,4,5,8])for(const selected of [1,parts]){const html=A.scene({type:'fraction',parts,selected});equal((html.match(/<rect /g)||[]).length,parts,'Exact equal fraction parts');equal((html.match(/fill="#9cbd7c"/g)||[]).length,selected,'Exact number of shaded fraction parts');ok(html.includes(`width="${240/parts}"`),'Equal widths for fraction pieces');}
for(const [tens,ones] of [[0,0],[1,4],[3,4],[9,9]]){const html=A.scene({type:'place-value',tens,ones});equal((html.match(/fill="#b2ca8c"/g)||[]).length,tens*10,'Ten blocks per rod');equal((html.match(/fill="#f1d28e"/g)||[]).length,ones,'Distinct unit blocks');ok(html.includes('role="img"'),'Place value accessible');}
ok(!A.scene({type:'place-value',tens:2,ones:5}).includes('٢٥'),'Place-value question does not print or announce its numeric answer');
for(const [hundreds,tens,ones] of [[0,0,0],[1,0,0],[3,1,2],[9,9,9]]){
  const html=A.scene({type:'place-value',hundreds,tens,ones});
  equal((html.match(/data-hundred-cell="1"/g)||[]).length,hundreds*100,'Exactly one hundred cells per hundred panel');
  equal((html.match(/fill="#b2ca8c"/g)||[]).length,tens*10,'Hundreds do not replace ten rods');
  equal((html.match(/fill="#f1d28e"/g)||[]).length,ones,'Hundreds do not replace individual units');
  if(hundreds)ok(!html.includes('>'+String(hundreds*100+tens*10+ones).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])+'<'),'Place-value scene does not print the requested whole number');
}
for(const [groups,countPerGroup] of [[0,0],[2,3],[3,4],[5,2],[10,10]]){
  const html=A.scene({type:'groups',groups,countPerGroup,icon:'ball'});
  equal((html.match(/class="g2-group"/g)||[]).length,groups,'Exact number of visually separate equal groups');
  equal((html.match(/class="g2-group-object"/g)||[]).length,groups*countPerGroup,'Exact total of equal-group objects');
  ok(html.includes('role="img"')&&html.includes('aria-label='),'Equal groups have an accessible description');
  if(groups&&countPerGroup)ok(!html.includes('>'+String(groups*countPerGroup).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])+'<'),'Equal groups do not print their total');
}
const boundedGroups=A.scene({type:'groups',groups:100000,countPerGroup:100000,icon:'ball'});
equal((boundedGroups.match(/class="g2-group-object"/g)||[]).length,100,'Malformed equal-group counts cannot create unbounded DOM');
const boundedHundreds=A.scene({type:'place-value',hundreds:100000,tens:100000,ones:100000});
equal((boundedHundreds.match(/data-hundred-cell="1"/g)||[]).length,900,'Hundreds are bounded to a three-digit number');
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
  const scope=`https://example.test/abboud-math/g2/${subject}/`;
  const context={URL,Request,Response,fetch:async()=>{throw Error('Network unavailable');},self:{registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>cache,keys:async()=>[`${subject}-foreign`],delete:async name=>{deleted.push(name);}},importScripts:()=>{}};
  const file=`g2/${subject}/sw.js`;vm.createContext(context);vm.runInContext(read(file)+'\nthis.workerConfig={V,PREFIX,F};',context);const cfg=context.workerConfig;
  equal(cfg.PREFIX,`g2${subject}-`,'Second-grade worker has its own cache namespace');
  ok(typeof cfg.V==='string'&&cfg.V.startsWith(cfg.PREFIX),'Worker version belongs to subject namespace');ok(Array.isArray(cfg.F)&&cfg.F.length>12,'Public dependency manifest exists');equal(new Set(cfg.F).size,cfg.F.length,'No duplicate cache dependencies');
  for(const asset of cfg.F){const resolved=new URL(asset,scope);equal(resolved.origin,new URL(scope).origin,'Same-origin offline dependency');const relative=decodeURIComponent(resolved.pathname).replace(/^\/abboud-math\//,'');ok(fs.existsSync(path.join(root,relative)),'Cached file exists: '+relative);ok(!/^g(?:1|6|8)\//.test(relative),'Grade two does not depend on another grade application');ok(!/\.(mp3|wav|ogg|m4a)$/i.test(relative),'No unapproved audio dependency');ok(!/api|backup|draft/i.test(relative),'No private cache entry');}
  for(const asset of ['content.js','../shared/early.js','../shared/art.js','../shared/early.css','../../profiles.js'])ok(cfg.F.includes(asset),'Cached essential asset: '+asset);
  let base=process.env.CACHE_BASE_REF||'origin/main';try{const old=execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});const prior=old.match(/\bconst\s+V\s*=\s*['"]([^'"]+)/)?.[1];if(old!==read(file))ok(cfg.V!==prior,'Changed SW uses changed cache version, without hard-coded release');}catch(error){if(error.code==='ERR_ASSERTION')throw error;/* New subject has no prior cache release. */}
  vm.runInContext(read('g2/shared/offline.js'),context);let wait;handlers.install({waitUntil:p=>wait=p});await wait;equal(added,cfg.F.map(file=>new URL(file,scope).href),'Install caches exact public manifest');
  const fetch=async(url,method='GET')=>{served=false;let response;handlers.fetch({request:{url,method},respondWith:p=>{served=true;response=p;}});return {served,response:response?await response:null};};
  let event=await fetch(scope+'content.js?v=cache-test');ok(event.served,'Public content query uses canonical cached URL');equal(await event.response.text(),'offline-cached','Cached response works when network throws');
  for(const [url,method] of [[scope+'private-progress.json','GET'],['https://other.test/abboud-math/g2/'+subject+'/content.js','GET'],[scope+'content.js','POST']])ok(!(await fetch(url,method)).served,'Private, foreign or mutable request is not intercepted');
  context.caches.keys=async()=>[cfg.V,cfg.PREFIX+'old',`unrelated-${subject}`];handlers.activate({waitUntil:p=>wait=p});await wait;equal(deleted,[cfg.PREFIX+'old'],'Only old caches of this subject removed');
}
async function verifyProfiles(){
  const values=new Map(),LS={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
  const context={localStorage:LS,navigator:{},crypto:webcrypto,isSecureContext:true,TextEncoder,Uint8Array,addEventListener(){}};context.window=context;vm.runInNewContext(read('profiles.js'),context);const P=context.PROFILES;ok(await P.ready,'Profile storage initializes');
  let previousKeys=[];try{const old=execFileSync('git',['show',baseRef+':profiles.js'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});previousKeys=[...old.match(/const PER=\[([^\]]+)\]/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);}catch{}
  ok(previousKeys.length>=15,'Previous student keys were read from Git for a meaningful preservation check');
  for(const key of previousKeys)ok(P.PER.includes(key),'Existing profile key retained: '+key);
  for(const subject of ['math','arabic','english','life'])ok(P.PER.includes(`bustan_g1_${subject}_v1`),'Grade-one reserved progress key retained: '+subject);
  for(const C of courses)ok(P.PER.includes(C.key),'Grade-two progress participates in switching and backup');
  const first=await P.create('طفل أول','idle','1111'),writers={};for(const C of courses){writers[C.key]=P.writer(C.key);ok(await writers[C.key](JSON.stringify({marker:'first-'+C.subject})),'Save first child '+C.subject);}
  const legacyKey='abboud_math_v1',reservedKey='bustan_g1_math_v1';
  ok(await P.writer(legacyKey)(JSON.stringify({points:73})),'Save an existing grade-eight subject');
  ok(await P.writer(reservedKey)(JSON.stringify({marker:'reserved-grade-one'})),'Save reserved grade-one progress');
  const second=await P.create('طفل ثان','idle','2222');for(const C of courses){equal(P.readProgress(C.key),null,'New child cannot inherit first child progress');ok(await P.writer(C.key)(JSON.stringify({marker:'second-'+C.subject})),'Save second child '+C.subject);equal(await writers[C.key](JSON.stringify({marker:'stale'})),false,'Stale child writer cannot overwrite '+C.subject);}
  ok(await P.login(first.id),'Switch back to first child');for(const C of courses)equal(JSON.parse(P.readProgress(C.key)).marker,'first-'+C.subject,'First child isolated: '+C.subject);
  equal(JSON.parse(P.readProgress(legacyKey)).points,73,'Existing grade-eight progress survives grade-two switching');
  equal(JSON.parse(P.readProgress(reservedKey)).marker,'reserved-grade-one','Grade-one progress survives grade-two switching');
  const backup=P.backup();for(const C of courses){equal(JSON.parse(backup.data[first.id][C.key]).marker,'first-'+C.subject,'Backup retains first child subject');equal(JSON.parse(backup.data[second.id][C.key]).marker,'second-'+C.subject,'Backup retains second child subject');}
  await P.restore(backup);ok(await P.login(second.id),'Restored second child can open');for(const C of courses)equal(JSON.parse(P.readProgress(C.key)).marker,'second-'+C.subject,'Restored subject stays isolated');
  ok(await P.login(first.id),'Restored first child can open');
  equal(JSON.parse(P.readProgress(legacyKey)).points,73,'Backup restore retains existing grade-eight progress');
  equal(JSON.parse(P.readProgress(reservedKey)).marker,'reserved-grade-one','Backup restore retains reserved grade-one progress');
}
(async()=>{for(const C of courses)await verifyWorker(C.subject);await verifyProfiles();console.log(JSON.stringify({checks,courses,usedIcons:usedIcons.size},null,2));console.log('Grade two: curriculum structure, picture/math integrity, accessible scenes, cache policy, and student isolation passed.');})().catch(error=>{console.error(error);process.exitCode=1;});
