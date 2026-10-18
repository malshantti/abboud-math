// Run: node tests/quiz-builder.cjs. Production validation and UI, using synthetic drafts only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'admin/quiz-builder.js'),'utf8');
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
const equal=(value,expected,message)=>{assert.deepEqual(value,expected,message);checks++;};
const clone=value=>JSON.parse(JSON.stringify(value));
const sample={version:'bustan-quiz-draft-v1',metadata:{title:'اختبار توضيحي',grade:6,subject:'math',durationMinutes:20},questions:[
 {id:'question-a',type:'mcq',prompt:'اختر ناتج ١ + ١.',points:2,reference:{book:'مرجع تجريبي',page:12},options:['١','٢','٣','٤'],answer:1},
 {id:'question-b',type:'tf',prompt:'المربع له أربعة أضلاع.',points:1,reference:{book:'',page:null},answer:true},
 {id:'question-c',type:'short',prompt:'اكتب اسم شكل له ثلاثة أضلاع.',points:3,reference:{book:'',page:null},acceptedAnswers:['مثلث','المثلث']}
]};
function load(){
 const blobs=[],window={confirm:()=>true};
 const context={window,AbortController,Blob,TextEncoder,TextDecoder,atob,btoa,setTimeout:callback=>{callback();return 1;},clearTimeout(){},
  URL:{createObjectURL(blob){blobs.push(blob);return 'blob:synthetic-quiz';},revokeObjectURL(){}},document:{createElement(){return {click(){},remove(){}};}}};
 for(const key of ['localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest'])for(const target of [context,window])Object.defineProperty(target,key,{get(){throw Error('Unexpected access to live facility '+key);}});
 vm.runInNewContext(fs.readFileSync(path.join(root,'admin/math-editor.js'),'utf8'),context);
 vm.runInNewContext(source,context);
 return {api:window.QUIZ_BUILDER,window,blobs};
}
const loaded=load(),validate=loaded.api.validateDraft;
check(typeof loaded.api.mount==='function'&&typeof validate==='function','Normal integration API is available');
for(const facility of [/\bfetch\s*\(/,/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket|EventSource)\b/,/\bsendBeacon\s*\(/,/profiles\.js|bustan_profiles|bustan_session/])check(!facility.test(source),'Designer has no live storage, profiles, or publishing network client');
function accepted(value,message,options){let result;assert.doesNotThrow(()=>{result=validate(value,options);},message);check(result.ok,message);equal(Array.from(result.errors),[],message+' has no errors');check(result.draft&&result.draft!==value,message+' returns a fresh canonical draft');return result.draft;}
function rejected(value,message,options){let result;assert.doesNotThrow(()=>{result=validate(value,options);},message);equal(result.ok,false,message);equal(result.draft,null,message+' exposes no partial canonical draft');check(Array.isArray(result.errors)&&result.errors.length>0&&result.errors.every(error=>typeof error==='string'&&error.trim()),message+' explains the error');}
accepted(sample,'Three supported question types');
for(const input of [null,undefined,0,true,'draft',[],{}, {...sample,version:'unrecognised'}])rejected(input,'Unsupported root/schema');
function invalid(change,message){const value=clone(sample);change(value);rejected(value,message);}
for(const title of ['', '   ',161,{},'ع'.repeat(161)])invalid(d=>d.metadata.title=title,'Invalid title');
for(const grade of [0,7,'6',null,{},true])invalid(d=>d.metadata.grade=grade,'Grade must be a supported number');
for(const subject of ['history','__proto__',null,6,{}, {toString:1,valueOf:1}])invalid(d=>d.metadata.subject=subject,'Subject must be a supported string without coercion');
for(const duration of [0,301,-1,1.5,'20',undefined,NaN,Infinity])invalid(d=>d.metadata.durationMinutes=duration,'Duration must be null or a bounded integer');
for(const duration of [null,1,300]){const value=clone(sample);value.metadata.durationMinutes=duration;accepted(value,'Valid optional duration boundary');}
for(const grade of [6,8])for(const subject of ['math','arabic','english','science']){const value=clone(sample);Object.assign(value.metadata,{grade,subject});accepted(value,'Available grade/subject combination');}
invalid(d=>d.questions=[],'At least one question is required');
invalid(d=>d.questions=Array.from({length:101},(_,i)=>({...clone(sample.questions[0]),id:'q-'+i})),'Question limit excludes one hundred and one');
const maximum=clone(sample);maximum.questions=Array.from({length:100},(_,i)=>({...clone(sample.questions[0]),id:'q-'+i}));accepted(maximum,'One hundred questions are supported');
for(const value of [null,[],true,'question'])invalid(d=>d.questions[0]=value,'Question must be a record');
invalid(d=>d.questions[1].id=d.questions[0].id,'Question identifiers must be unique');
for(const id of ['', '1bad','-bad','Bad','a'.repeat(51),null,{}])invalid(d=>d.questions[0].id=id,'Question identifier boundary');
for(const type of ['essay','__proto__',null,5,{}, {toString:1,valueOf:1}])invalid(d=>d.questions[0].type=type,'Question type cannot coerce untrusted objects');
for(const prompt of ['', '  ',{},true,'س'.repeat(3001)])invalid(d=>d.questions[0].prompt=prompt,'Prompt boundary');
for(const points of [0,-1,101,1.1,'2',null,NaN,Infinity])invalid(d=>d.questions[0].points=points,'Points must be a bounded integer');
for(const reference of [null,[],{}, {book:'',page:0},{book:'',page:2001},{book:'',page:'12'},{book:'ع'.repeat(201),page:null}])invalid(d=>d.questions[0].reference=reference,'Book/page reference boundary');
for(const options of [null,['أ','ب','ج'],['أ','ب','ج','د','هـ'],['أ','ب','ج',''],['أ','ب','ج','أ'],['A',' A ','C','D'],['أ','ب','ج',{}],['أ','ب','ج','ع'.repeat(501)]])invalid(d=>d.questions[0].options=options,'Four distinct nonblank bounded MCQ choices');
for(const answer of [-1,4,1.5,'1',null,true,undefined])invalid(d=>d.questions[0].answer=answer,'MCQ answer must index an available choice');
for(const answer of [0,1,'true',null,undefined])invalid(d=>d.questions[1].answer=answer,'True/false answer must be boolean');
for(const answer of [false,true]){const value=clone(sample);value.questions[1].answer=answer;accepted(value,'Both true/false answer values are valid');}
for(const answers of [null,[],[''],['  '],['A',' A '],['مثلث',{}],['ع'.repeat(501)],Array.from({length:11},(_,i)=>'answer '+i)])invalid(d=>d.questions[2].acceptedAnswers=answers,'Short answers have bounded, distinct accepted values');
const boundaries=clone(sample);boundaries.metadata.title='ع'.repeat(160);Object.assign(boundaries.questions[0],{id:'a'.repeat(50),prompt:'س'.repeat(3000),points:100,reference:{book:'ع'.repeat(200),page:2000},options:['أ'.repeat(500),'ب','ج','د'],answer:3});boundaries.questions[2].acceptedAnswers=Array.from({length:10},(_,i)=>'answer '+i);accepted(boundaries,'Upper inclusive text, score, reference, and answer limits');
const original=JSON.stringify(sample),canonical=accepted(sample,'Canonical copy isolation');canonical.metadata.title='changed';canonical.questions[0].options[0]='changed';canonical.questions[0].reference.book='changed';equal(JSON.stringify(sample),original,'Validation and subsequent canonical edits never mutate source data');
const extras=clone(sample);extras.token='do not export';extras.metadata.privateStudent='do not export';extras.questions[0].extra='do not export';extras.questions[0].reference.secret='do not export';const clean=accepted(extras,'Unknown fields are omitted');equal(Object.keys(clean).sort(),['metadata','questions','version'],'Only public root schema fields remain');check(!JSON.stringify(clean).includes('do not export'),'Canonical export discards unknown private fields');

// Embedded, locally generated one-pixel rasters keep these checks deterministic
// and independent of production illustrations or network/image-decoder access.
const imageFixtures={
 png:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf1kAAAAASUVORK5CYII=',
 jpeg:'/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==',
 webp:'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAUAmJaQAA3AA/vz0AAA='
};
const imageOf=(format='png')=>({dataUrl:'data:image/'+format+';base64,'+imageFixtures[format],mime:'image/'+format,width:1,height:1,alt:'رسم توضيحي للسؤال'});
function imageDraft(image){const value=clone(sample);value.questions[0].image=image;return value;}
function imageValidationChecks(){
 for(const format of ['png','jpeg','webp']){
  const image=imageOf(format),value=imageDraft(image),original=JSON.stringify(value),canonical=accepted(value,'Signed '+format+' raster is a portable question image');
  equal(clone(canonical.questions[0].image),image,'Image fields round-trip without losing raster metadata: '+format);
  canonical.questions[0].image.alt='changed';equal(JSON.stringify(value),original,'Canonical image is isolated from the imported object: '+format);
 }
 const stripped=imageOf();stripped.secret='private';const image=accepted(imageDraft(stripped),'Image unknown fields are removed').questions[0].image;
 equal(Object.keys(image).sort(),['alt','dataUrl','height','mime','width'],'Only the five public image fields survive canonical validation');
 for(const invalidImage of [null,[],true,'image',{}, {...imageOf(),mime:'image/svg+xml'}, {...imageOf(),mime:'IMAGE/PNG'}, {...imageOf(),mime:'image/jpeg'}, {...imageOf(),dataUrl:'https://example.invalid/question.png'}, {...imageOf(),dataUrl:'blob:untrusted'}, {...imageOf(),dataUrl:'data:image/svg+xml;base64,PHN2Zy8+'}, {...imageOf(),dataUrl:'data:image/png;base64,PGltZyBvbmVycm9yPTE+'}, {...imageOf(),dataUrl:'data:image/png;base64,%%%%'}, {...imageOf(),dataUrl:'data:image/png;base64,AAA'}, {...imageOf(),dataUrl:'data:image/png;base64,'}, {...imageOf(),width:2}, {...imageOf(),height:2}, {...imageOf(),width:'1'}, {...imageOf(),height:0}, {...imageOf(),width:1601}, {...imageOf(),alt:null}, {...imageOf(),alt:'ع'.repeat(301)}]){
  rejected(imageDraft(invalidImage),'Malformed or untrusted image cannot enter a student-ready draft');
  rejected(imageDraft(invalidImage),'Incomplete authoring still rejects unsafe images',{allowIncomplete:true});
 }
 for(const alt of ['', '   ']){const image={...imageOf(),alt};rejected(imageDraft(image),'A student-ready image needs meaningful alternative text');accepted(imageDraft(image),'A missing image description can be saved during authoring',{allowIncomplete:true});}
 accepted(imageDraft({...imageOf(),alt:'ع'.repeat(300)}),'Alternative text allows the inclusive three-hundred-character boundary');
 for(const format of ['png','jpeg','webp']){
  const signature=Buffer.from(imageFixtures[format],'base64');signature[0]^=255;
  rejected(imageDraft({...imageOf(format),dataUrl:'data:image/'+format+';base64,'+signature.toString('base64')}),'Declared MIME cannot hide a damaged '+format+' signature');
 }
 const truncated=Buffer.from(imageFixtures.png,'base64').subarray(0,24);
 rejected(imageDraft({...imageOf(),dataUrl:'data:image/png;base64,'+truncated.toString('base64')}),'A truncated raster header cannot supply trusted dimensions');
 const brokenRiff=Buffer.from(imageFixtures.webp,'base64');brokenRiff.writeUInt32LE(1,4);
 rejected(imageDraft({...imageOf('webp'),dataUrl:'data:image/webp;base64,'+brokenRiff.toString('base64')}),'WebP RIFF length must agree with the embedded payload');
 const largeBytes=Buffer.alloc(500*1024);Buffer.from(imageFixtures.png,'base64').copy(largeBytes);
 const largeImage={...imageOf(),dataUrl:'data:image/png;base64,'+largeBytes.toString('base64')};
 accepted(imageDraft(largeImage),'Embedded raster accepts the inclusive five-hundred-KiB boundary');
 rejected(imageDraft({...largeImage,dataUrl:'data:image/png;base64,'+Buffer.concat([largeBytes,Buffer.from([0])]).toString('base64')}),'Embedded raster rejects one byte above five hundred KiB');
 const below=clone(sample);below.questions=Array.from({length:18},(_,i)=>({...clone(sample.questions[0]),id:'image-'+i,image:largeImage}));
 accepted(below,'Many legal images still fit under the complete twelve-MiB JSON allowance');
 const above=clone(below);above.questions.push({...clone(below.questions[0]),id:'image-18'});
 rejected(above,'Individually legal images cannot bypass the aggregate twelve-MiB JSON bound');
 rejected(above,'Incomplete authoring cannot bypass the aggregate JSON image bound',{allowIncomplete:true});
 const duplicateRoots=clone(sample);duplicateRoots.questions[0].options=['','','',''];
 duplicateRoots.questions[0].optionMath=[{version:1,tokens:[{kind:'root',value:'٩'}]},{version:1,tokens:[{kind:'root',value:'٩',index:''}]},{version:1,tokens:[{kind:'root',value:'١٦'}]},{version:1,tokens:[{kind:'root',value:'٢٥'}]}];
 rejected(duplicateRoots,'Identical visible square roots cannot become different choices through missing versus empty optional index');
 accepted(duplicateRoots,'Duplicate mathematical choices may remain in an editable authoring draft',{allowIncomplete:true});
 // Construct a portable draft whose compact JSON fits, but whose indented
 // export crosses the file bound. This exercises the actual serialization
 // guard rather than assuming that summed image bytes equal a JSON file.
 const near=clone(below);near.questions.push({...clone(sample.questions[0]),id:'image-18',image:imageOf()});
 const baseBytes=Buffer.from(imageFixtures.png,'base64'),spare=12*1024*1024-Buffer.byteLength(JSON.stringify(near))-32;
 const finalBytes=Buffer.alloc(baseBytes.length+Math.floor(spare/4)*3);baseBytes.copy(finalBytes);
 near.questions[18].image.dataUrl='data:image/png;base64,'+finalBytes.toString('base64');
 check(Buffer.byteLength(JSON.stringify(near))<=12*1024*1024,'Near-capacity import really is below the file byte bound');
 check(Buffer.byteLength(JSON.stringify(near,null,2))>12*1024*1024,'Indented JSON really crosses the same bound');
 rejected(near,'Draft validation accounts for the actual indented export size');
 rejected(near,'Incomplete authoring cannot bypass the indented-file bound',{allowIncomplete:true});
 return near;
}

function incompleteValidationChecks(){
 const options={allowIncomplete:true};
 const empty=clone(sample);empty.metadata.title='';empty.questions=[];
 accepted(empty,'An empty authoring draft can be saved',options);
 rejected(empty,'An empty authoring draft is not a student-ready quiz');
 const partial=clone(sample);partial.metadata.title='';
 for(const question of partial.questions){question.prompt='';question.points=null;}
 partial.questions[0].options=['','','',''];partial.questions[0].answer=null;
 partial.questions[1].answer=null;partial.questions[2].acceptedAnswers=[];
 accepted(partial,'Unfinished questions retain their editable structure',options);
 rejected(partial,'Unfinished questions cannot become a student preview');
 const duplicate=clone(sample);duplicate.questions[0].options=['A',' A ','C','D'];
 accepted(duplicate,'Duplicate choices may remain during authoring',options);
 rejected(duplicate,'Duplicate choices still block student-ready validation');
 const badEdits=[
  draft=>draft.metadata.title=null,draft=>draft.metadata.title='ع'.repeat(161),
  draft=>draft.metadata.grade='6',draft=>draft.metadata.subject={toString:1,valueOf:1},
  draft=>draft.metadata.durationMinutes=0,draft=>draft.metadata.durationMinutes='invalid',
  draft=>draft.questions[0].prompt={},draft=>draft.questions[0].prompt='س'.repeat(3001),
  draft=>draft.questions[0].points=0,draft=>draft.questions[0].points=101,
  draft=>draft.questions[0].points='1',draft=>draft.questions[0].type={toString:1,valueOf:1},
  draft=>draft.questions[1].id=draft.questions[0].id,draft=>draft.questions[0].id='bad id',
  draft=>draft.questions[0].options=['أ','ب','ج'],draft=>draft.questions[0].options[0]={},
  draft=>draft.questions[0].options[0]='س'.repeat(501),draft=>draft.questions[0].answer=4,
  draft=>draft.questions[0].answer='1',draft=>draft.questions[1].answer='true',
  draft=>draft.questions[2].acceptedAnswers=null,draft=>draft.questions[2].acceptedAnswers=[{}],
  draft=>draft.questions[2].acceptedAnswers=Array.from({length:11},(_,i)=>'answer '+i),
  draft=>draft.questions[0].reference.page=0,draft=>draft.questions[0].reference.page='invalid',
  draft=>draft.questions=Array.from({length:101},(_,i)=>({...clone(sample.questions[0]),id:'q-'+i}))
 ];
 for(const edit of badEdits){const value=clone(sample);edit(value);rejected(value,'Incomplete mode preserves schema types and upper bounds',options);}
 for(const value of [null,undefined,[],{}, {...sample,version:'wrong'}])rejected(value,'Incomplete mode cannot bypass the root schema',options);
 return partial;
}

// Exercise production mount/import/export/preview through its delegated DOM events.
// This fixture creates no real browser storage, login, API, or test-only product API.
function harness(){
 const loaded=load(),nodes=new Map(),listeners=new Map();
 const root={innerHTML:'',isConnected:true,contains:()=>true,appendChild(){},querySelector(selector){return selector.startsWith('#')?node(selector.slice(1)):null;},
  addEventListener(type,callback,options){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(callback);options?.signal?.addEventListener('abort',()=>listeners.get(type).delete(callback));}};
 function node(id){if(!nodes.has(id)){
  const select=['qb-grade','qb-subject','qb-answer'].includes(id),textarea=['qb-prompt','qb-accepted'].includes(id);
  nodes.set(id,{id,tagName:select?'SELECT':textarea?'TEXTAREA':id==='qb-file'?'INPUT':id.startsWith('qb-add-')?'BUTTON':'INPUT',value:'',textContent:'',innerHTML:'',hidden:true,checked:false,open:false,files:[],dataset:{},selectionStart:null,selectionEnd:null,
   focus(){},click(){},setSelectionRange(){},insertAdjacentHTML(where,html){this.innerHTML+=html;},showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},
   hasAttribute(name){return name==='data-qb-option'&&/^qb-option-\d$/.test(id);},matches(selector){return selector.includes(this.tagName.toLowerCase());},closest(selector){return selector==='button'?this:null;}});
  if(/^qb-option-\d$/.test(id))nodes.get(id).dataset.qbOption=id.slice(-1);
 }return nodes.get(id);}
 const emit=(type,target)=>{for(const callback of [...(listeners.get(type)||[])])callback({target});};
 const click=id=>{const button=node(id);button.tagName='BUTTON';emit('click',button);};
 // The nested widget's own DOM is covered by browser QA; keep its real
 // validation/rendering here while isolating quiz import/export event behavior.
 loaded.window.MATH_EDITOR.mount=()=>({destroy(){}});
 loaded.api.mount(root);
 return {...loaded,root,node,click,emit,async import(value,extra={}){const input=node('qb-file');input.files=[{size:100,text:async()=>JSON.stringify(value),...extra}];emit('change',input);await new Promise(setImmediate);},async exported(){const before=loaded.blobs.length;click('qb-export');check(loaded.blobs.length===before+1,'Serializable draft exports an actual JSON Blob');return JSON.parse(await loaded.blobs.at(-1).text());}};
}
(async()=>{
 const nearCapacity=imageValidationChecks();
 const capacityUI=harness();await capacityUI.import(sample);await capacityUI.import(nearCapacity);
 check(!capacityUI.node('qb-errors').hidden,'An oversized serialized draft import gives a visible error');
 equal(await capacityUI.exported(),sample,'Rejected near-capacity import preserves the existing editable draft');
 const partial=incompleteValidationChecks();
 const letterChoices=clone(sample);letterChoices.questions[0].options=['A','a','B','b'];accepted(letterChoices,'Letter case remains meaningful in answer choices');
 invalid(d=>d.questions[0].options=['3','٣','4','5'],'Equivalent numeral scripts cannot create duplicate choices');
 const ui=harness();const blank=await ui.exported();equal(blank.questions,[],'Empty authoring draft can be saved before the first question');equal(blank.metadata.title,'','Saving a blank title does not invent quiz content');ui.click('qb-preview');equal(ui.node('qb-preview-dialog').open,false,'Empty authoring draft cannot open a student preview');check(!ui.node('qb-errors').hidden,'Student preview explains what is incomplete');
 const preview=clone(sample);preview.metadata.title='<img src=x onerror=alert()>';preview.questions[2].acceptedAnswers=['الإجابة السرية للمعلّم'];preview.questions[2].prompt='<script>unsafe()</script>';
 await ui.import(preview);equal(await ui.exported(),preview,'Import/export round trip preserves valid draft and answers');
 ui.click('qb-preview');check(ui.node('qb-preview-dialog').open,'Student preview opens as a dialog');let sheet=ui.node('qb-preview-sheet').innerHTML;
 check(!sheet.includes('الإجابة السرية للمعلّم'),'Student preview omits accepted short answers');check(!sheet.includes('class="qb-key"'),'Student preview has no correct-answer markers');check(!sheet.includes('<script>unsafe()')&&!sheet.includes('<img src=x'),'Imported markup is not interpreted as HTML');check(sheet.includes('&lt;script&gt;')&&sheet.includes('&lt;img'),'Untrusted prompts and titles are escaped');
 ui.node('qb-teacher-key').checked=true;ui.emit('change',ui.node('qb-teacher-key'));check(ui.node('qb-preview-sheet').innerHTML.includes('الإجابة السرية للمعلّم'),'Teacher explicitly reveals the answer key');
 ui.click('qb-preview');equal(ui.node('qb-teacher-key').checked,false,'Every new preview resets the teacher-key toggle');check(!ui.node('qb-preview-sheet').innerHTML.includes('الإجابة السرية للمعلّم'),'Reopened student preview cannot leak an earlier teacher key');
 const imageQuiz=clone(preview);imageQuiz.questions[0].image={...imageOf(),alt:'<img src=x onerror=alert()> "وصف" & صورة'};
 await ui.import(imageQuiz);equal(await ui.exported(),imageQuiz,'A question image survives actual file import and JSON Blob export');ui.click('qb-preview');sheet=ui.node('qb-preview-sheet').innerHTML;
 check(sheet.includes(imageQuiz.questions[0].image.dataUrl),'Student preview includes the validated embedded raster without a network URL');
 check(sheet.includes('alt="&lt;img src=x onerror=alert()&gt; &quot;وصف&quot; &amp; صورة"'),'Image alternative text is escaped as an HTML attribute');
 check(!sheet.includes('<img src=x onerror=alert()>'),'Image descriptions cannot inject a second HTML element');
 await ui.import(preview);
 await ui.import({...clone(sample),version:'wrong'});equal(await ui.exported(),preview,'Rejected import preserves the existing draft');
 await ui.import(null,{text:async()=>'{broken json'});equal(await ui.exported(),preview,'Malformed JSON preserves the existing draft');
 let oversizedRead=false;await ui.import(sample,{size:12*1024*1024+1,text:async()=>{oversizedRead=true;return JSON.stringify(sample);}});equal(oversizedRead,false,'Oversized import is rejected before reading/parsing');equal(await ui.exported(),preview,'Oversized import preserves the draft');
 let allowedRead=false;await ui.import(preview,{size:12*1024*1024,text:async()=>{allowedRead=true;return JSON.stringify(preview);}});equal(allowedRead,true,'The full inclusive twelve-MiB import allowance reaches the parser');equal(await ui.exported(),preview,'Accepted larger-file allowance still validates the same schema');
 ui.window.confirm=()=>false;await ui.import(sample);equal(await ui.exported(),preview,'Cancelled replacement preserves the draft');ui.window.confirm=()=>true;
 await ui.import(partial);equal(await ui.exported(),partial,'Incomplete question text, choices, points and answers survive import/export');ui.node('qb-preview-dialog').open=false;ui.click('qb-preview');equal(ui.node('qb-preview-dialog').open,false,'Saving an unfinished quiz does not make it student-ready');
 for(const [id,restored]of [['qb-duration','20'],['qb-page','12'],['qb-points','']]){
  ui.node(id).value='invalid';ui.emit('input',ui.node(id));const before=ui.blobs.length;ui.click('qb-export');equal(ui.blobs.length,before,'Invalid numeric input cannot be silently saved as a missing value: '+id);check(!ui.node('qb-errors').hidden,'Numeric input errors are visible: '+id);ui.node(id).value=restored;ui.emit('input',ui.node(id));
 }
 equal(await ui.exported(),partial,'Repairing invalid numeric fields restores the authoring draft');
 await ui.import(blank);equal(await ui.exported(),blank,'An empty saved draft imports without assuming a first question');
 const mathQuiz=clone(sample);mathQuiz.questions[0].math={version:1,tokens:[{kind:'fraction',numerator:'١',denominator:'٢'},{kind:'root',value:'٩'},{kind:'power',base:'س',exponent:'٢'}]};
 mathQuiz.questions[0].options=['','','',''];mathQuiz.questions[0].optionMath=[2,3,4,5].map(denominator=>({version:1,tokens:[{kind:'fraction',numerator:'١',denominator:String(denominator).replace(/\d/g,digit=>'٠١٢٣٤٥٦٧٨٩'[digit])}]}));
 mathQuiz.questions[1].math={version:1,tokens:[{kind:'text',value:'<img src=x onerror=alert()>'}]};
 await ui.import(mathQuiz);equal(await ui.exported(),mathQuiz,'Question and choice math survive actual JSON Blob import/export');ui.click('qb-preview');sheet=ui.node('qb-preview-sheet').innerHTML;
 check((sheet.match(/class="me-fraction"/g)||[]).length>=5,'Student preview renders question and all four option fractions');check(sheet.includes('class="me-root"')&&sheet.includes('class="me-power"'),'Student preview renders roots and powers');check(!sheet.includes('<img src=x')&&sheet.includes('&lt;img'),'Math text is escaped inside a real quiz preview');check(!sheet.includes('class="qb-key"'),'Mathematical choices do not expose a correct-answer marker');
 ui.node('qb-teacher-key').checked=true;ui.emit('change',ui.node('qb-teacher-key'));const teacherKey=ui.node('qb-preview-sheet').innerHTML.match(/<div class="qb-key">([\s\S]*?)<\/div>/)[1];check(teacherKey.includes('class="me-fraction"'),'Teacher key renders the selected formula instead of escaped HTML markup');
 const author=harness();for(const type of ['mcq','tf','short']){author.node('qb-add-'+type).dataset.qbAdd=type;author.click('qb-add-'+type);}
 author.node('qb-prompt').value='سؤال قصير قيد التأليف';author.emit('input',author.node('qb-prompt'));author.node('qb-points').value='٥';author.emit('input',author.node('qb-points'));
 const authored=await author.exported();equal(authored.questions.map(question=>question.type),['mcq','tf','short'],'All question types can be added through the editor');equal(authored.questions[2].prompt,'سؤال قصير قيد التأليف','Editing a question updates the actual exported draft');equal(authored.questions[2].points,5,'Arabic Indic point input becomes a numeric score');
 author.node('move-test').dataset.qbMove='up';author.click('move-test');equal((await author.exported()).questions.map(question=>question.type),['mcq','short','tf'],'Question ordering changes the exported draft');
 author.node('remove-test').dataset.qbRemove=authored.questions[2].id;author.click('remove-test');equal((await author.exported()).questions.map(question=>question.type),['mcq','tf'],'Deleting a question removes its data from export');
 await ui.import(maximum);ui.node('qb-add-mcq').dataset.qbAdd='mcq';ui.click('qb-add-mcq');equal((await ui.exported()).questions.length,100,'Editor cannot add a question beyond the one-hundred-question limit');
 const css=fs.readFileSync(path.join(root,'admin/quiz-builder.css'),'utf8');check(!/@import\b|https?:\/\//.test(css),'Designer styles use no external fonts or libraries');
 console.log('PASS: '+checks+' quiz schema, limits, import/export, state preservation, escaping, and answer-key privacy checks');
})().catch(error=>{console.error(error);process.exitCode=1;});
