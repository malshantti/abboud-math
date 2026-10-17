// Visitor previews: real handlers, keyboard focus, selection and a storage boundary.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../welcome.js'),'utf8');
const groups=[],nodes=new Map(),values=new Map([['saved-progress','preserve me']]),writes=[];
function element(){return{dataset:{},hidden:false,textContent:'',attrs:{},events:{},focused:false,addEventListener(type,fn){this.events[type]=fn},getAttribute(key){return this.attrs[key]??null},setAttribute(key,value){this.attrs[key]=value},focus(){this.focused=true}}}
function group(count,vertical){
 const tabs=Array.from({length:count},(_,i)=>Object.assign(element(),{textContent:'خيار '+i,tabIndex:i===0?0:-1,attrs:{'aria-selected':String(i===0)}}));
 const panels=Array.from({length:count},(_,i)=>Object.assign(element(),{hidden:i!==0,querySelector:()=>({textContent:'شرح '+i})}));
 const status=element(),root=Object.assign(element(),{querySelectorAll:selector=>selector==='[role="tab"]'?tabs:panels,querySelector:selector=>selector==='[data-demo-status]'?status:{getAttribute:()=>vertical?'vertical':null}});
 groups.push(root);return{root,tabs,panels,status};
}
const subject=group(4,false),learning=group(3,false),journey=group(3,true);
const get=selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector)};
get('#student-home').hidden=true;
const context={document:{querySelector:get,querySelectorAll:selector=>selector==='[data-demo-group]'?groups:[],addEventListener(){},documentElement:{dataset:{}}},window:{addEventListener(){}},localStorage:{getItem:key=>values.get(key)||null,setItem:(...args)=>writes.push(args),removeItem:(...args)=>writes.push(args)},location:{search:'?welcome=1'},URLSearchParams,matchMedia:()=>({matches:true}),console};
vm.runInNewContext(source,context);
function selected(group,index){assert.equal(group.tabs.filter(tab=>tab.getAttribute('aria-selected')==='true').length,1);assert.equal(group.tabs[index].getAttribute('aria-selected'),'true');assert.deepEqual(group.panels.map(panel=>panel.hidden),group.panels.map((_,i)=>i!==index));assert.deepEqual(group.tabs.map(tab=>tab.tabIndex),group.tabs.map((_,i)=>i===index?0:-1));assert.equal(group.root.dataset.active,String(index));assert.ok(group.status.textContent.includes('شرح '+index))}
function key(group,index,key){let prevented=0;group.tabs[index].events.keydown({key,preventDefault(){prevented++}});return prevented}
for(const group of [subject,learning,journey]){group.tabs.forEach((tab,index)=>{tab.events.click();selected(group,index)});assert.equal(key(group,0,'End'),1);selected(group,group.tabs.length-1);assert.ok(group.tabs.at(-1).focused);assert.equal(key(group,group.tabs.length-1,'Home'),1);selected(group,0);assert.ok(group.tabs[0].focused)}
assert.equal(key(subject,0,'ArrowLeft'),1);selected(subject,1);assert.equal(key(subject,0,'ArrowRight'),1);selected(subject,3);assert.equal(key(subject,3,'ArrowLeft'),1);selected(subject,0);
assert.equal(key(journey,0,'ArrowDown'),1);selected(journey,1);assert.equal(key(journey,0,'ArrowUp'),1);selected(journey,2);assert.equal(key(journey,2,'ArrowDown'),1);selected(journey,0);
assert.equal(key(subject,0,'ArrowDown'),0);assert.equal(key(journey,0,'ArrowLeft'),0);assert.deepEqual(writes,[]);assert.equal(values.get('saved-progress'),'preserve me');
console.log('PASS visitor sections: all selections, RTL/vertical keyboard navigation, wrap, focus and unchanged storage');
