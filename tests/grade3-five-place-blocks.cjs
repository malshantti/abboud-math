'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),ar=s=>String(s).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const number=s=>Number(String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const elements=new Map(),element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',hidden:true});return elements.get(s)};
let buttons=[],nextRandom=0,xp=0,toasts=[];
const app={ar,rnd:n=>{assert.ok(nextRandom>=0&&nextRandom<n);return nextRandom},shuffle:a=>a,esc:String,$:element,$$:s=>s==='[data-add]'?buttons:[],addXP:n=>{xp+=n},toast:s=>toasts.push(s),R:{},S:{done:{},seen:{}}};
const c={window:{APP:app,CFG:{subject:'math'}}};vm.createContext(c);vm.runInContext(read('g3/math/content.js'),c);vm.runInContext(read('g3/math/math.js'),c);
const lesson=id=>c.window.G3.units.flatMap(u=>u.les).find(l=>l.id===id),labs=c.window.G3X.labs;
assert.equal(lesson('m9').lab,'blocks5');assert.equal(lesson('m1').lab,'blocks');assert.equal(lesson('m2').lab,'blocks');
function init(id){elements.clear();xp=0;toasts=[];const html=labs[id].html();buttons=[...html.matchAll(/data-add="(\d+)"/g)].map(m=>({dataset:{add:m[1]}}));labs[id].init();return html}
function build(target){for(const b of buttons){const count=Math.floor(target/Number(b.dataset.add))%10;for(let i=0;i<count;i++)b.onclick()}}
for(const [id,places,min,max] of [['blocks',4,1000,9999],['blocks5',5,10000,99999]]){
 const html=init(id);assert.equal(buttons.length,places);assert.equal(number(element('#bn').textContent),0);assert.ok(element('#bmsg').hidden);assert.equal(element('#bst').innerHTML.match(/class="g3-block-place"/g).length,places);
 assert.equal(buttons.some(b=>b.dataset.add==='10000'),places===5,'Only the five-place activity has ten-thousand pieces');
 assert.ok(!/[0-9]/.test(element('#bx').textContent),'Place counts use Indic digits');assert.ok(html.includes('aria-live="polite"'));
 build(max);assert.equal(number(element('#bn').textContent),max);assert.equal(xp,0,'Exploration does not grant challenge points');
 const svgCount=(element('#bst').innerHTML.match(/class="g3-block-piece"/g)||[]).length;assert.equal(svgCount,places*9,'A visible piece represents each count');
 for(const b of buttons)b.onclick();assert.equal(number(element('#bn').textContent),max,'Adding beyond a full place cannot overflow the activity');assert.ok(toasts.length>0);
 element('#bclr').onclick();assert.equal(number(element('#bn').textContent),0);assert.equal((element('#bst').innerHTML.match(/class="g3-block-piece"/g)||[]).length,0);
 buttons.at(-1).onclick();assert.equal(number(element('#bn').textContent),1);element('#bclr').onclick();
 for(const target of [min,max]){
  nextRandom=target-min;element('#bgoal').onclick();assert.equal(number(element('#bn').textContent),0);assert.equal(element('#bmsg').textContent,'ابنِ العدد '+ar(target));assert.equal(element('#bmsg').hidden,false);
  const before=xp;build(target);assert.equal(number(element('#bn').textContent),target);assert.equal(element('#bmsg').textContent,'أحسنت! بنيت العدد '+ar(target)+'.');assert.equal(xp,before+10);
  element('#bclr').onclick();assert.equal(element('#bmsg').hidden,true,'A completed challenge is cleared');build(target);assert.equal(xp,before+10,'Rebuilding without a new challenge cannot award twice');element('#bclr').onclick();
 }
 for(let i=0;i<100;i++){
  const target=min+Math.floor(i/99*(max-min));nextRandom=target-min;element('#bgoal').onclick();build(target);assert.equal(number(element('#bn').textContent),target);assert.ok(element('#bmsg').textContent.startsWith('أحسنت!'));
 }
}
init('blocks5');build(37492);assert.equal(element('#bx').textContent,'عشرات الآلاف: ٣، الآلاف: ٧، المئات: ٤، العشرات: ٩، الآحاد: ٢');assert.equal((element('#bst').innerHTML.match(/class="g3-block-piece"/g)||[]).length,25);
const base=process.env.CACHE_BASE_REF||'origin/main',previous=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');
if(['content.js','math.js'].some(f=>read('g3/math/'+f).replace(/\r\n/g,'\n')!==previous('g3/math/'+f))){const version=s=>s.match(/const V=['"]([^'"]+)/)[1];assert.notEqual(version(read('g3/math/sw.js')),version(previous('g3/math/sw.js')),'Changed builder receives a changed subject cache')}
console.log('PASS grade3 blocks: zero/full bounds, four/five places, 204 completed challenges, visible counts and single rewards');
