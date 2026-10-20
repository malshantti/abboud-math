'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=(source,name)=>{const c={window:{}};vm.runInNewContext(source,c,{filename:name});return c.window;};
const base=process.env.CACHE_BASE_REF||'origin/main';
const old=p=>cp.execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8'});
const lessons=c=>[...c.foundations,...c.units.flatMap(u=>u.lessons)];
const digit=v=>String(v).replace(/[0-9]/g,x=>'٠١٢٣٤٥٦٧٨٩'[x]);
const courses={},art={};
for(const g of[1,2]){
 const p=`g${g}/math/content.js`,c=load(read(p),p).G1_COURSE,previous=load(old(p),p).G1_COURSE;
 courses[g]=c;art[g]=load(read(`g${g}/shared/art.js`),'art.js').G1_ART;
 assert.equal(c.key,previous.key,'Storage key remains unchanged');
 const ids=new Set(lessons(c).map(l=>l.id));for(const l of lessons(previous))assert(ids.has(l.id),'Existing completion ID retained: '+l.id);
 assert.equal(ids.size,lessons(c).length,'No colliding lesson IDs');
 for(const l of lessons(c)){
  for(const t of l.tasks){assert(t.answer>=0&&t.answer<t.choices.length,'Answer exists: '+l.id);assert.equal(new Set(t.choices.map(v=>v.label)).size,t.choices.length,'Distinct choices: '+l.id);}
  for(const scene of [...l.steps.map(s=>s.scene),...l.tasks.flatMap(t=>[t.scene,...t.choices.map(ch=>ch.scene)])].filter(Boolean)){
   const html=art[g].scene(scene);assert(!/NaN|undefined|<script\b|onerror=/i.test(html),'Valid, safe math scene: '+l.id);
  }
 }
 for(const sub of['math','english','arabic','life']){
  const worker=`g${g}/${sub}/sw.js`,version=s=>s.match(/const V=['"]([^'"]+)/)[1];
  assert.notEqual(version(read(worker)),version(old(worker)),'Every shared-art consumer gets a new cache version');
 }
 const refs=lessons(c).flatMap(l=>l.references||[]);assert(refs.every(r=>c.books.some(b=>b.id===r.book)&&Number.isInteger(r.page)&&r.page>0),'Each multiple reference is a real book/page pair');
}
const find=(g,id)=>lessons(courses[g]).find(l=>l.id===id);
assert(courses[1].units[2].lessons.findIndex(l=>l.id==='m-3-3')<courses[1].units[2].lessons.findIndex(l=>l.id==='m-3-2'),'Number composition precedes addition');
for(const [g,ids]of[[1,['m-2-ordinal','m-6-week','m-8-ten-transfer','m-9-cross-ten','m-11-lines','m-11-solids']],[2,['m2-4-lines','m2-10-minutes','m2-10-cylinder','m2-11-record']]])for(const id of ids)assert(find(g,id),'New objective has its own completion ID: '+id);
assert.equal(find(2,'m2-10-2').tasks.length,2,'Already completed whole-hour activity gains no minute-reading requirement');
assert.equal(find(2,'m2-10-minutes').tasks.length,4,'Minute skills have separate assessment');
assert.equal(find(1,'m-6-2').tasks.length,2,'Existing before/after activity remains valid');
for(const g of[1,2]){
 const A=art[g],filled=html=>(html.match(/fill="#(?:ecc570|a9cc87)"/g)||[]).length;
 for(const phase of[0,1,2])assert.equal(filled(A.scene({type:'ten-bridge',a:8,b:7,op:'+',phase})),15,'Completing ten conserves all fifteen counters');
 [13,10,5].forEach((total,phase)=>assert.equal(filled(A.scene({type:'ten-bridge',a:13,b:8,op:'-',phase})),total,'Cross-ten subtraction shows the correct remaining quantity'));
 const borrow=A.scene({type:'column-operation',a:64,b:28,op:'-',phase:3});
 assert(borrow.includes('<s>٦</s><strong>٥</strong>')&&borrow.includes('<s>٤</s><strong>١٤</strong>'),'Borrowing changes six tens/four ones to five tens/fourteen ones');
 assert(/m-column-result[^]*?<td>٣<\/td><td>٦<\/td>/.test(borrow),'Regrouping produces thirty-six');
 const carry=A.scene({type:'column-operation',a:47,b:36,op:'+',phase:3});
 assert(/m-carry[^]*?<strong>١<\/strong>/.test(carry),'Ten ones are carried to tens');
 assert(/m-column-result[^]*?<td>٨<\/td><td>٣<\/td>/.test(carry),'Addition gives eighty-three');
 const number=A.scene({type:'number-writing',value:8});assert(number.includes('data-m-number="8"')&&number.includes('لا يُقيّم الموقع'),'Handwriting practice explicitly has no automatic mastery claim');
 const data=A.scene({type:'data-table',rows:[{label:'<unsafe>',icon:'apple',count:3}]});assert(data.includes('&lt;unsafe&gt;')&&!data.includes('<unsafe>'),'Data labels are escaped');
 const between=A.scene({type:'position',object:'bus',reference:'school',relation:'between'});assert(between.includes('بين مدرسة ومنزل')&&between.includes(A.icon('house')),'Between shows the two references named in its accessible description');
 for(const relation of['in','on','under','next to','between'])assert(A.scene({type:'position',object:'ball',reference:'box',relation}).includes('m-position-object'),'All requested positional pictures exist');
}
const clock=art[2].scene({type:'clock',hour:4,minute:15});
const expectedHour=[80+Math.sin((4+15/60)*Math.PI/6)*35,80-Math.cos((4+15/60)*Math.PI/6)*35];
assert(clock.includes(`L${expectedHour[0]} ${expectedHour[1]}`),'Hour hand moves continuously with minutes');
assert(clock.includes('data-clock-minute="15"'),'Quarter-hour minute hand is retained');
assert(find(1,'m-4-2').tasks[0].explain.includes('الجزء المضاف، وهو ٢'),'Subtraction explanation removes the specified added part');
for(const g of[1,2])for(const u of courses[g].units)assert(u.lessons.some(l=>/review/.test(l.id)),'Each unit has a separate original review question');
for(const g of[1,2]){
 const source=read(`g${g}/shared/early.js`),prelude=source.match(/  const ar=[\s\S]*?(?=  const direction)/)[0],reference=source.match(/  function reference\(lesson\) \{[\s\S]*?\n  \}/)[0];
 const context={C:{books:[{id:'p1',title:'كتاب اختبار',url:'https://elearn.edu.ps/book.pdf',pdfOffset:4}]}},fn=vm.runInNewContext(prelude+'\n'+reference+'\nreference',context);
 const html=fn({book:'p1',page:45,references:[{book:'p1',page:45},{book:'p1',page:48}]});
 assert.equal((html.match(/<a /g)||[]).length,2,'Merged skills show both official references');
 assert(html.includes('#page=49')&&html.includes('#page=52')&&html.includes('٤٥')&&html.includes('٤٨'),'Printed page labels stay distinct from offset PDF destinations');
 const practical=fn({book:'p1',page:1,homeActivity:{title:'تجربة <مع الكبير>',text:'نرسم <شكلًا>'}});
 assert(practical.includes('لا يصححها الموقع ولا يسجّل إتقانها')&&practical.includes('&lt;شكلًا&gt;'),'Practical instructions are escaped and explicitly ungraded');
 const legacy=fn({book:'p1',page:3});assert.equal((legacy.match(/<a /g)||[]).length,1,'Legacy single-reference lessons still work');
}
console.log('Early math: stable completion IDs, prerequisite order, exact counter conservation, regrouping, clock angles, references and shared-cache invalidation passed.');
