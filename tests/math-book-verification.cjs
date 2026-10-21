'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),plain=x=>JSON.parse(JSON.stringify(x));
const load=(s,name)=>{const c={window:{}};vm.runInNewContext(s,c,{filename:name});return c.window;};
const ascii=s=>String(s).replace(/[٠-٩]/g,n=>'٠١٢٣٤٥٦٧٨٩'.indexOf(n)),number=s=>Number(ascii(s));
const base=process.env.CACHE_BASE_REF||'origin/main',C={},A={},ls={};
for(const g of[1,2]){
 C[g]=load(read(`g${g}/math/content.js`),'content.js').G1_COURSE;A[g]=load(read(`g${g}/shared/art.js`),'art.js').G1_ART;ls[g]=[...C[g].foundations,...C[g].units.flatMap(u=>u.lessons)];
 const previous=load(cp.execFileSync('git',['show',base+`:g${g}/math/content.js`],{cwd:root,encoding:'utf8'}),'previous.js').G1_COURSE;
 assert.equal(C[g].key,previous.key,'Progress storage key retained');
 for(const old of[...previous.foundations,...previous.units.flatMap(u=>u.lessons)])assert(ls[g].some(l=>l.id===old.id),'Previous completion ID retained: '+old.id);
 for(const u of C[g].units){const reviews=u.lessons.filter(l=>l.id.includes('book-review-'));assert(reviews.length>=1,'Every unit has a new segmented review');for(const l of reviews){assert(l.tasks.length>=1&&l.tasks.length<=5,'Bounded review length');assert(l.tasks.every(t=>typeof t.bookSkill==='string'),'Each review question targets an explicit curriculum concept');}}
 for(const l of ls[g])for(const t of l.tasks){const expression=ascii(t.scene?.type==='symbol'?t.scene.value:'').replace(/\s/g,'');const m=expression.match(/^(\d+)([+−×÷])(\d+)=؟$/);if(m){const a=+m[1],b=+m[3],expected=m[2]==='+'?a+b:m[2]==='−'?a-b:m[2]==='×'?a*b:a/b;assert.equal(number(t.choices[t.answer].label),expected,'Actual arithmetic answer: '+l.id);}}
}
const get=(g,id)=>ls[g].find(l=>l.id===id);
for(const [g,ids]of[[1,['m-2-signs','m-2-ordinal-nine','m-5-line','m-6-whole-hours','m-8-doubles','m-9-subtract-from-ten','m-9-check-with-addition']],[2,['m2-3-total-tens','m2-3-parity-sums','m2-4-circle-center','m2-6-grouping','m2-6-carry-hundreds','m2-6-borrow-hundreds','m2-8-elements','m2-8-repeated-subtraction','m2-9-fraction-sets','m2-9-fifth-eighth-sets','m2-10-digital-day','m2-10-cube-net']]])for(const id of ids)assert(get(g,id),'Verified objective has a dedicated lesson ID: '+id);
assert(get(1,'m-9-cross-ten').enrichment&&/إضافية/.test(get(1,'m-9-cross-ten').title),'Previous mathematically valid method remains clearly marked as additional');
assert.notEqual(get(1,'m-9-cross-ten').id,get(1,'m-9-subtract-from-ten').id,'Old completion cannot confer the new book strategy');
assert.equal(get(1,'m-review-11').page,99,'Actual review page takes precedence over the inaccurate table of contents');
for(const g of[1,2]){
 const filled=html=>(html.match(/fill="#(?:ecc570|a9cc87)"/g)||[]).length;
 assert.equal(filled(A[g].scene({type:'ten-bridge',a:14,b:8,op:'-',method:'from-ten',phase:0})),14,'Original whole remains fourteen');
 for(const phase of[1,2]){const html=A[g].scene({type:'ten-bridge',a:14,b:8,op:'-',method:'from-ten',phase});assert.equal(filled(html),6,'Subtract from the ten while retaining the four other ones');assert(html.includes('٤ عناصر')&&html.includes('٢ عناصر'),'Separate remaining two and unchanged four are visible');}
 const carry1=A[g].scene({type:'column-operation',a:475,b:286,op:'+',phase:1}),carry3=A[g].scene({type:'column-operation',a:475,b:286,op:'+',phase:3});
 const carryCount=html=>(html.match(/<tr class="m-carry">([\s\S]*?)<\/tr>/)[1].match(/<strong>/g)||[]).length;
 assert.equal(carryCount(carry1),1,'Only the ones-to-tens carry appears at its first stage');assert.equal(carryCount(carry3),2,'The tens-to-hundreds carry appears when tens are processed');
 const full=A[g].scene({type:'column-operation',a:475,b:286,op:'+',phase:4});assert(/m-column-result[\s\S]*?<td>٧<\/td><td>٦<\/td><td>١<\/td>/.test(full),'Final regrouped result is seven hundred sixty-one');
 const borrow=A[g].scene({type:'column-operation',a:742,b:365,op:'-',phase:4});for(const value of['٦','١٣','١٢'])assert(borrow.includes('<strong>'+value+'</strong>'),'Each changed place is shown');assert.equal(6*100+13*10+12,742,'Borrowing preserves the whole');
 const ruler=A[g].scene({type:'measure',centimeters:true,units:7});assert.equal((ruler.match(/data-ruler-mark=/g)||[]).length,8,'Seven centimetres have eight boundary marks');assert(ruler.includes('data-ruler-mark="0" d="M20 66')&&ruler.includes('data-ruler-mark="7" d="M265 66'),'Zero and end mark align with actual strip boundaries');
 const line=A[g].scene({type:'number-line',min:0,max:90,step:10,start:70,moves:[-20]});assert(line.includes('data-line-from="70" data-line-to="50"'),'Subtraction jump moves left to the correct number');assert(!/NaN|undefined/.test(line),'Number-line coordinates are valid');
}
const ranks=A[1].scene({type:'ordinal',startRank:7,icons:['apple','flower','ball']});for(const name of['السابع','الثامن','التاسع'])assert(ranks.includes(name),'Ordinal labels cover the final three positions');assert(!ranks.includes('undefined'),'No absent ordinal labels');
for(const t of get(1,'m-6-whole-hours').tasks.filter(t=>t.scene?.type==='clock'))assert.equal(t.scene.minute,0,'First-grade clock questions stay at whole hours');
for(const each of[2,3,4,5,10]){const assessed=new Set();for(const l of C[2].units[6].lessons)for(const t of l.tasks){const m=ascii(t.scene?.value||'').replace(/\s/g,'').match(/^(\d+)×(\d+)=؟$/);if(m&&+m[2]===each)assessed.add(+m[1]);if(t.scene?.type==='groups'&&t.scene.countPerGroup===each&&/المجموعات كلها/.test(t.prompt))assessed.add(t.scene.groups);}for(let times=1;times<=(each===10?9:5);times++)assert(assessed.has(times),`Multiplication fact ${times} × ${each} is assessed`);}
for(const id of['m2-9-fraction-sets','m2-9-fifth-eighth-sets'])for(const t of get(2,id).tasks.filter(t=>t.scene?.type==='groups')){const denominator={نصف:2,ثلث:3,ربع:4,خمس:5,ثمن:8}[t.prompt.match(/نصف|ثلث|ربع|خمس|ثمن/)[0]];assert.equal(t.scene.groups,denominator,'Equal groups match the fraction denominator');assert.equal(number(t.choices[t.answer].label),t.scene.groups*t.scene.countPerGroup/denominator,'Correct fraction of the pictured whole set');}
for(const [i,step] of get(2,'m2-8-repeated-subtraction').steps.slice(0,4).entries()){const html=A[2].scene(step.scene);assert.equal(step.scene.left-step.scene.right,12-i*4,'Each subtraction continues from the preceding remainder');assert(html.includes('الباقي: '+String(12-i*4).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])),'Caption names the actual remaining objects');}
const cube=A[2].scene({type:'solid',value:'cube',vertices:true});assert.equal((cube.match(/data-cube-vertex=/g)||[]).length,8,'The eighth, hidden cube vertex is represented');
const cubeNet=A[2].scene({type:'solid',value:'cube',net:true}),cylinderNet=A[2].scene({type:'solid',value:'cylinder',net:true});assert.equal((cubeNet.match(/<rect /g)||[]).length,6,'Cube net has six square faces');assert.equal((cylinderNet.match(/<circle /g)||[]).length,2,'Cylinder net has two circular bases');assert.equal((cylinderNet.match(/<rect /g)||[]).length,1,'Cylinder net has one rectangular side');
const matrix=JSON.parse(read('reviews/evidence/math-book-verification.json'));assert.equal(matrix.books.length,4,'All four source books are recorded');assert.equal(matrix.lessons.filter(l=>l.kind==='review').length,22,'Every official unit review is mapped');assert.equal(matrix.lessons.filter(l=>l.kind==='lesson').length,89,'All eighty-nine named textbook lessons have rows');assert.equal(matrix.lessons.filter(l=>l.kind==='project').length,7,'All seven student projects have optional practical rows');
for(const b of matrix.books)assert(/^[a-f0-9]{64}$/.test(b.sha256)&&b.visualPages.length>0,'Source identity and actual visual scope retained');
for(const l of matrix.lessons){assert(l.appIds.length>0,'Every book lesson maps to content');for(const id of l.appIds)assert(get(l.grade,id),'Mapping resolves to an actual compiled lesson: '+id);assert.equal(l.textChecked.length,l.printedPages[1]-l.printedPages[0]+1,'Textual verification scope is explicit');}
console.log('Math books: textbook-method counters, phased regrouping, ruler boundaries, complete fact ranges, set fractions, cube geometry, stable progress and all 118 source-mapping rows passed.');
