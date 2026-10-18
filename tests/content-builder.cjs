// Run: node tests/content-builder.cjs. Synthetic authoring bundles; no student storage.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
const equal=(value,expected,message)=>{assert.deepEqual(value,expected,message);checks++;};
const clone=value=>JSON.parse(JSON.stringify(value));
const common=(id,type)=>({id,type,grade:6,subject:'math',term:1,title:'عنوان تجريبي',description:'وصف تعليمي تجريبي',order:1,reference:{book:'مرجع للتجربة فقط',page:12},unitId:null,lessonId:null});
const question=()=>({prompt:'اختر ناتج ١ + ١.',options:['١','٢','٣','٤'],answer:1,feedback:'نضم واحدًا إلى واحد فنحصل على اثنين.'});
const sample={version:'bustan-content-draft-v1',items:[
 {...common('unit-one','unit'),objectives:['يتعرف الطالب إلى المثال التوضيحي.']},
 {...common('lesson-one','lesson'),unitId:'unit-one',steps:[{id:'step-one',title:'نفهم الفكرة',body:'هذا شرح توضيحي، وليس نقلًا من كتاب.'}],check:question()},
 {...common('adventure-one','adventure'),lessonId:'lesson-one',template:'path',stages:[{id:'stage-one',...question()}]},
 {...common('lab-one','lab'),lessonId:'lesson-one',template:'fraction',config:{parts:4,selected:2}}
]};
function load(){
 const window={},context={window,AbortController,Blob,TextEncoder,TextDecoder,atob,btoa,setTimeout,clearTimeout,URL};
 for(const key of ['localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest','WebSocket'])for(const target of [context,window])Object.defineProperty(target,key,{get(){throw Error('Unexpected live facility '+key);}});
 for(const file of ['math-editor.js','quiz-builder.js','content-preview.js','content-builder.js']){
  const filename=path.join(root,'admin',file);if(fs.existsSync(filename)){vm.runInNewContext(fs.readFileSync(filename,'utf8'),context,{filename});Object.assign(context,window);}
 }
 return {api:window.CONTENT_BUILDER||context.CONTENT_BUILDER,window};
}
const loaded=load(),api=loaded.api;
check(api&&typeof api.mount==='function'&&typeof api.validateBundle==='function','Public authoring and bundle-validation API');
function accepted(value,message,options){let result;assert.doesNotThrow(()=>result=api.validateBundle(value,options),message);check(result.ok,message+': '+JSON.stringify(result.errors));check((result.bundle||result.value)!==value,message+' returns an isolated canonical copy');return result.bundle||result.value;}
function rejected(value,message,options){let result;assert.doesNotThrow(()=>result=api.validateBundle(value,options),message);equal(result.ok,false,message);check(Array.isArray(result.errors)&&result.errors.length>0,message+' explains rejection');check(!(result.bundle||result.value),message+' exposes no partially accepted bundle');}
function invalid(change,message,options){const value=clone(sample);change(value);rejected(value,message,options);}
accepted(sample,'A linked unit, lesson, adventure, and fraction laboratory');
for(const value of [null,undefined,[],{},true,1,'bundle',{...sample,version:'unsupported'}])rejected(value,'Unsupported bundle root or version');
for(const value of [null,{},'items',true])invalid(d=>d.items=value,'Items must be an array');
for(const value of [null,[],true,'item'])invalid(d=>d.items[0]=value,'Every item must be a record');
for(const field of ['grade','term'])for(const value of [null,'1',{},NaN,Infinity])invalid(d=>d.items[0][field]=value,'Structural numeric fields cannot coerce: '+field);
for(const grade of [0,7,9])invalid(d=>d.items[0].grade=grade,'Unsupported grade');
for(const term of [0,3,-1,1.5])invalid(d=>d.items[0].term=term,'Only the two textbook terms');
for(const field of ['subject','type'])for(const value of [null,{},true,{toString:null},{toString:'not callable'},'__proto__','unsupported'])invalid(d=>d.items[0][field]=value,'Unsupported or coercing enum: '+field);
for(const value of [{toString:null},{toString:'not callable'},[],null])invalid(d=>d.items[3].template=value,'Laboratory template enums never coerce JSON objects');
invalid(d=>d.items[1].id=d.items[0].id,'Duplicate content identifiers');
invalid(d=>d.items[1].steps[0].id=d.items[0].id,'Nested and item identifiers share the same namespace');
invalid(d=>d.items[2].stages[0].id=d.items[1].steps[0].id,'Stage and step identifiers cannot collide');
for(const id of ['',null,{},'bad id','../unit','a'.repeat(201)])invalid(d=>d.items[0].id=id,'Malformed or excessive identifier');
for(const property of ['grade','subject','term']){
 invalid(d=>{d.items[1][property]=property==='grade'?8:property==='term'?2:'science';},'Lesson and unit must agree on '+property);
 invalid(d=>{d.items[2][property]=property==='grade'?8:property==='term'?2:'science';},'Adventure and its lesson must agree on '+property);
}
for(const options of [undefined,{allowIncomplete:true}]){
 invalid(d=>d.items=d.items.filter(x=>x.type!=='unit'),'Deleting a unit cannot silently orphan its children',options);
 invalid(d=>d.items=d.items.filter(x=>x.type!=='lesson'),'Deleting a linked lesson cannot silently orphan activities',options);
 invalid(d=>d.items[1].unitId='missing-unit','An explicit missing unit is rejected',options);
 invalid(d=>d.items[2].lessonId='missing-lesson','An explicit missing lesson is rejected',options);
 invalid(d=>d.items[1].unitId='lesson-one','A lesson identifier cannot substitute for a unit',options);
 invalid(d=>d.items[2].lessonId='lab-one','A laboratory identifier cannot substitute for a lesson',options);
}
const original=JSON.stringify(sample),canonical=accepted(sample,'Source bundle remains isolated');canonical.items[0].objectives[0]='changed';canonical.items[1].steps[0].body='changed';canonical.items[1].check.options[0]='changed';equal(JSON.stringify(sample),original,'Canonical edits cannot mutate imported bundle');
const extras=clone(sample);extras.privateToken='never export';extras.items[0].privateStudent='never export';extras.items[1].reference.secret='never export';extras.items[1].steps[0].secret='never export';const clean=accepted(extras,'Unknown fields are removed');check(!JSON.stringify(clean).includes('never export'),'Canonical data excludes unknown private fields');
const incomplete=clone(sample);for(const item of incomplete.items){item.title='';item.description='';item.reference={book:'',page:null};}incomplete.items[0].objectives=[];incomplete.items[1].steps[0].title='';incomplete.items[1].steps[0].body='';incomplete.items[1].check={prompt:'',options:['','','',''],answer:null,feedback:''};incomplete.items[2].stages[0]={id:'stage-one',prompt:'',options:['','','',''],answer:null,feedback:''};
accepted(incomplete,'Unfinished text and answers remain portable editable drafts',{allowIncomplete:true});
rejected(incomplete,'Unfinished teaching content cannot pass student-ready validation');
const unlinked=clone(sample);for(const item of unlinked.items){item.unitId=null;item.lessonId=null;}
accepted(unlinked,'Explicitly empty parent selections remain editable',{allowIncomplete:true});
rejected(unlinked,'Student-ready lessons and activities need their selected parents');
for(const options of [undefined,{allowIncomplete:true}]){
 invalid(d=>d.items[1].steps[0].body={},'Incomplete mode never accepts text objects',options);
 invalid(d=>d.items[1].check.options=['أ','ب','ج'],'A check retains its structural four-choice schema',options);
 invalid(d=>d.items[1].check.answer=4,'Answer indexes stay inside four choices',options);
 invalid(d=>d.items[1].check.answer='1','Answer indexes cannot coerce text',options);
 invalid(d=>d.items[3].template='untrusted-template','Only implemented laboratory templates are accepted',options);
 invalid(d=>d.items[3].config.parts='4','Fraction part counts are numeric',options);
 invalid(d=>d.items[3].config.parts=0,'A fraction cannot have zero parts',options);
 invalid(d=>d.items[3].config.selected=5,'Selected fraction parts cannot exceed the denominator',options);
 invalid(d=>d.items[3].config.selected=-1,'Selected fraction parts cannot be negative',options);
}
invalid(d=>d.items[1].check.options=['١',' ١ ','٣','٤'],'Student-ready choices are visibly distinct');
invalid(d=>d.items[1].check.feedback='','A ready check must explain its answer');
invalid(d=>d.items[0].reference={book:'',page:null},'Student-ready units require a traceable book reference');
const numberLine=clone(sample);Object.assign(numberLine.items[3],{template:'number-line',config:{min:-5,max:5,point:0}});accepted(numberLine,'A point on an ordered integer number line');
for(const config of [{min:-20,max:0,point:-20},{min:0,max:20,point:20}]){const value=clone(numberLine);value.items[3].config=config;accepted(value,'The documented number-line endpoints and maximum span are accepted');}
for(const config of [{min:-21,max:-1,point:0},{min:1,max:21,point:2},{min:-20,max:20,point:0}]){const value=clone(numberLine);value.items[3].config=config;rejected(value,'Number-line outer limits and maximum span remain enforced');}
for(const config of [{min:5,max:5,point:5},{min:5,max:-5,point:0},{min:-5,max:5,point:6},{min:-5,max:5,point:-6},{min:'-5',max:5,point:0},{min:-5,max:5,point:NaN}]){const value=clone(numberLine);value.items[3].config=config;rejected(value,'Invalid number-line interval or point');rejected(value,'Incomplete mode still protects laboratory bounds',{allowIncomplete:true});}
const observe=clone(sample);Object.assign(observe.items[3],{template:'observe',config:{question:'ماذا تلاحظ في الرسم؟',observations:['ملاحظة توضيحية أولى','ملاحظة توضيحية ثانية']}});accepted(observe,'An observation activity contains authored notes without invented physical behaviour');
for(const selected of [1,12]){const value=clone(sample);value.items[3].config={parts:12,selected};accepted(value,'Fraction laboratory accepts its documented upper denominator and target endpoints');}
for(const config of [{parts:1,selected:1},{parts:13,selected:1},{parts:4,selected:0},{parts:4.5,selected:1},{parts:4,selected:1.5}])invalid(d=>d.items[3].config=config,'Fraction laboratory rejects unsupported endpoints and noninteger parts');
for(const observations of [['واحدة'],Array(13).fill('مشاهدة'),['الأولى',{}]]){const value=clone(observe);value.items[3].config.observations=observations;rejected(value,'Observation counts and text types are bounded');}
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf1kAAAAASUVORK5CYII=';
const image={dataUrl:'data:image/png;base64,'+png,mime:'image/png',width:1,height:1,alt:'صورة توضيحية تجريبية'};
const illustrated=clone(sample);illustrated.items[1].steps[0].image=image;const imageClean=accepted(illustrated,'A signed portable PNG can accompany a lesson step');equal(clone(imageClean.items[1].steps[0].image),image,'Raster metadata round-trips');
const covered=clone(sample);covered.items[0].image=image;accepted(covered,'Unit cover images reuse the same raster descriptor');
invalid(d=>d.items[0].image={...image,alt:''},'A student-ready unit cover requires alternative text');
const partialImage=clone(sample);partialImage.items[0].image={...image,alt:''};accepted(partialImage,'Unfinished image descriptions remain portable drafts',{allowIncomplete:true});
for(const badImage of [{...image,dataUrl:'https://example.invalid/image.png'},{...image,dataUrl:'blob:untrusted'},{...image,mime:'image/svg+xml',dataUrl:'data:image/svg+xml;base64,PHN2Zy8+'},{...image,width:2},{...image,dataUrl:'data:image/png;base64,PGltZyBvbmVycm9yPTE+'}])for(const options of [undefined,{allowIncomplete:true}])invalid(d=>d.items[1].steps[0].image=badImage,'Unsafe image sources and forged raster metadata are rejected',options);
invalid(d=>d.items[1].steps[0].image={...image,alt:''},'Student-ready lesson images need an accessible description');
const mathematical=clone(sample);mathematical.items[1].steps[0].math={version:1,tokens:[{kind:'fraction',numerator:'١',denominator:'٢'}]};accepted(mathematical,'The existing structured fraction editor is shared by lesson steps');
for(const math of [{version:100,tokens:[]},{version:1,tokens:[{kind:'html',value:'<script>bad</script>'}]}])invalid(d=>d.items[1].steps[0].math=math,'Lesson math accepts only the validated mathematical AST');
for(const options of [undefined,{allowIncomplete:true}])invalid(d=>d.items[1].steps[0].math={version:1,tokens:[{kind:'fraction',numerator:'١',denominator:'٠'}]},'A zero denominator is rejected even in a partial teaching draft',options);
const notMath=clone(mathematical);for(const item of notMath.items)item.subject='science';Object.assign(notMath.items[3],{template:'observe',config:clone(observe.items[3].config)});rejected(notMath,'A nonmath lesson cannot silently retain a hidden formula');
const normalized=clone(sample);normalized.items[1].title='الخطوة 12';normalized.items[1].steps[0].body='مثال 34';const normalizedResult=accepted(normalized,'Visible lesson digits normalize to Arabic Indic');equal(normalizedResult.items[1].title,'الخطوة ١٢','Titles normalize numerals');equal(normalizedResult.items[1].steps[0].body,'مثال ٣٤','Lesson bodies normalize numerals');equal(normalizedResult.items[1].id,'lesson-one','Stable identifiers remain machine-safe');
const excessive=clone(sample);excessive.secret='ع'.repeat(7*1024*1024);rejected(excessive,'The raw UTF-8 import bound cannot be bypassed by an unknown large field',{allowIncomplete:true});
for(const sourceFile of ['content-builder.js','content-preview.js']){
 const source=fs.readFileSync(path.join(root,'admin',sourceFile),'utf8');
 check(!/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|\bfetch\s*\(/.test(source),sourceFile+' never reads progress or publishes through a pretend API');
}
console.log('Content builder: '+checks+' checks passed.');
