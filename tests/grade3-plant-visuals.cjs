'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),elements=new Map();
let points=[],cards=[],xp=0;
function element(dataset={}){return{dataset,hidden:false,disabled:false,attrs:{},textContent:'',html:'',classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v},focus(){this.focused=true},insertAdjacentHTML(_,s){this.html+=s},set innerHTML(s){this.html=s;if(this===get('#gchoices'))cards=[...s.matchAll(/<button class="chip germ-card" data-stage="(\d)">([\s\S]*?)<\/button>/g)].map(m=>Object.assign(element({stage:m[1]}),{html:m[2]}))},get innerHTML(){return this.html}}}
function get(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector)}
const app={$:get,$$:s=>s==='[data-part]'?points:s==='#gchoices button'?cards:[],shuffle:a=>a.slice(),ar:n=>String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),addXP:n=>{xp+=n}};
const c={window:{APP:app}};vm.createContext(c);vm.runInContext(read('g3/science/content.js'),c);vm.runInContext(read('g3/science/science.js'),c);
const {parts,germ}=c.window.G3X.labs,partHtml=parts.html();
const names=['الجذر','الساق','الورقة','الزهرة','الثمرة'],keys=['root','stem','leaf','flower','fruit'];
const semantics=['يمتصّ الماء ويثبّت النبات','تنقل الماء','تصنع الغذاء','تكوّن الثمرة','تحمي البذور'];
assert.equal((partHtml.match(/class="plant-hotspot"/g)||[]).length,5);
assert.ok(partHtml.includes('role="group"')&&partHtml.includes('role="button" tabindex="0"'),'Diagram positions are keyboard-operable buttons');
points=keys.map(key=>element({part:key}));parts.init();
points[1].onclick();assert.equal(xp,0);assert.ok(get('#pfeedback').textContent.includes('حاول'));assert.ok(get('#pprompt').textContent.includes(names[0]));
for(let i=0;i<points.length;i++){
 assert.equal(get('#pprompt').textContent,'أين '+names[i]+'؟');
 let prevented=false;points[i].onkeydown({key:i%2?' ':'Enter',preventDefault(){prevented=true}});assert.equal(prevented,true);
 assert.ok(get('#pfeedback').textContent.includes(semantics[i]));assert.equal(points[i].attrs['aria-disabled'],'true');
 points[i].onclick();assert.equal(xp,0,'Repeated answers cannot award progress early');get('#pnext').onclick();
}
assert.equal(xp,10,'The five-part activity retains its existing total reward');
assert.ok(get('#pprompt').textContent.includes('أحسنت'));get('#pagain').onclick();assert.ok(get('#pprompt').textContent.includes('الجذر'));
const source=c.window.G3.units.flatMap(u=>u.les).find(l=>l.id==='s3').steps[1].b.replace(/<[^>]+>/g,'');
const labels=['تمتصّ الماء','تنتفخ','يتشقّق الغلاف','يخرج الجذير','تخرج الريشة','تظهر الأوراق'];
let previous=-1;for(const [i,label] of labels.entries()){const at=source.indexOf(i===0?'تمتصّ البذرة الماء':label);assert.ok(at>previous,'Illustrated sequence follows the existing lesson text');previous=at}
germ.init();assert.equal(cards.length,6);
for(let i=0;i<cards.length;i++){
 assert.ok(cards[i].html.includes('<svg')&&cards[i].html.includes(labels[i]),'Each selectable stage has a drawing and its existing caption');
 assert.equal(cards[i].html.includes('data-growth="root"'),i>=3,'The root appears only from its stated stage');
 assert.equal(cards[i].html.includes('data-growth="shoot"'),i>=4,'The shoot appears after the root');
 assert.equal(cards[i].html.includes('data-growth="leaves"'),i===5,'Leaves appear last');
 assert.ok(cards[i].html.includes('data-seed-size="'+(i?'swollen':'small')+'"'),'Swelling follows water absorption');
}
cards[5].onclick();assert.equal(get('#gsequence').html,'');assert.equal(xp,10,'Wrong order does not grant a reward');
for(let i=0;i<cards.length;i++){cards[i].onclick();assert.equal(cards[i].disabled,true);assert.equal((get('#gsequence').html.match(/<li>/g)||[]).length,i+1);assert.equal(xp,i===5?18:10)}
cards[5].onclick();assert.equal(xp,18,'Disabled stage cannot reward twice');assert.ok(get('#gfeedback').textContent.includes('أحسنت'));
get('#gagain').onclick();assert.equal(get('#gsequence').html,'');assert.ok(cards.every(b=>!b.disabled));
assert.ok(!/animation:|transition:/.test(partHtml),'The diagrams do not require motion');
const base=process.env.CACHE_BASE_REF||'origin/main',normalize=s=>s.replace(/\r\n/g,'\n'),before=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
if(normalize(read('g3/science/science.js'))!==normalize(before('g3/science/science.js'))){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read('g3/science/sw.js')),version(before('g3/science/sw.js')));}
console.log('PASS grade-three plant visuals: five keyboard locations, existing functions, six ordered drawing stages and unchanged rewards');
