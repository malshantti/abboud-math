'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=source=>{const ctx={window:{}};vm.runInNewContext(source,ctx);return ctx.window.G1_COURSE;};
const words=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
let checked=0;
for(const grade of [1,2]){
 const file=`g${grade}/english/content.js`,C=load(read(file)),before=load(cp.execFileSync('git',['show','origin/main:'+file],{cwd:root,encoding:'utf8'}));
 const lessons=C.units.flatMap(u=>u.lessons),all=[...lessons,...C.foundations],ids=new Set(all.map(l=>l.id));
 assert.equal(ids.size,all.length,'New targets have unique IDs');
 assert.equal(C.key,before.key,'Progress namespace is preserved');
 for(const old of [...before.units.flatMap(u=>u.lessons),...before.foundations])assert(ids.has(old.id),'Existing completion remains addressable: '+old.id);
 const targets=new Set();
 for(const l of all){
  for(const t of l.tasks){
   assert(t.answer>=0&&t.answer<t.choices.length);
   assert.equal(new Set(t.choices.map(c=>c.label)).size,t.choices.length);
   if(t.scene?.type==='count'&&words.includes(t.choices[t.answer].label)){
    assert.equal(t.choices[t.answer].label,words[t.scene.count],'The English number names the visible quantity');targets.add(t.scene.count);checked++;
   }
   for(const row of [t,...t.choices])if(row.scene?.position){
    assert(['ball','bus','pencil'].includes(row.scene.position.object));assert(['in','on','under'].includes(row.scene.position.relation));assert(['box','desk'].includes(row.scene.position.reference));
   }
  }
  if(l.reviewOf){for(const id of l.reviewOf)assert(ids.has(id),'Review source must exist');assert(l.id.includes('mixed-review'),'Review is a separate activity');}
 }
 for(let n=grade===1?1:11;n<=(grade===1?10:20);n++)assert(targets.has(n),'Number has a quantity recognition question: '+n);
 for(const [review,source] of [[5,[1,2,3,4]],[9,[6,7,8]],[14,[10,11,12,13]],[18,grade===1?[15,16,17]:[10,11,12,13,15,16,17]]]){
  const u=C.units[review-1],covered=new Set(u.lessons.flatMap(l=>l.reviewOf||[]));
  for(const n of source)for(const l of C.units[n-1].lessons)assert(covered.has(l.id),'Every source activity contributes to a new review: '+l.id);
 }
 const ctx={window:{}};vm.runInNewContext(read(`g${grade}/shared/art.js`),ctx);const original=ctx.window.G1_ART;
 vm.runInNewContext(read(`g${grade}/shared/language-art.js`),ctx);const art=ctx.window.G1_ART;
 assert.equal(art.scene({type:'count',count:3,icon:'apple'}),original.scene({type:'count',count:3,icon:'apple'}),'Existing scenes retain renderer behavior');
 for(const [field,values] of Object.entries({pose:['sit','stand','jump','clap'],hair:['short','long'],height:['short','tall'],hairColor:['blonde','brown','black'],eyeColor:['green','brown']})){
  const renders=values.map(value=>art.scene({type:'symbol',value:'ألاحظ الشخصية.',person:{[field]:value}}));assert.equal(new Set(renders).size,values.length,field+' must change what the child sees');
 }
 for(const focus of ['brother','sister','grandfather','grandmother']){
  const html=art.scene({type:'symbol',value:'ألاحظ الأسرة.',family:{focus}});assert(html.includes('أنا')&&html.includes('#2272a3')&&html.includes('#588a32'),'Relative self and target have different visual markers');
 }
 const unsafe=art.scene({type:'symbol',value:'ألاحظ الشخصية.',person:{pose:'<script>',hairColor:'" onload="alert(1)',eyeColor:'<img>'}});
 assert(!/<script|onload=|<img/.test(unsafe),'Untrusted descriptors cannot inject markup');
 const index=read(`g${grade}/english/index.html`),sw=read(`g${grade}/english/sw.js`);
 assert(index.indexOf('../shared/language-art.js')>index.indexOf('../shared/art.js')&&index.indexOf('../shared/language-art.js')<index.indexOf('../shared/early.js'),'Scene extension is ready before the application captures it');
 assert(sw.includes('"../shared/language-art.js"'),'Language scenes are available offline');
 const oldSw=cp.execFileSync('git',['show',`origin/main:g${grade}/english/sw.js`],{cwd:root,encoding:'utf8'});
 const dependencies=[`g${grade}/english/content.js`,`g${grade}/english/index.html`,`g${grade}/shared/language-art.js`];
 const changed=dependencies.some(file=>{
  let old;try{old=cp.execFileSync('git',['show','origin/main:'+file],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});}catch{return true;}
  return old.replace(/\r\n/g,'\n')!==read(file).replace(/\r\n/g,'\n');
 });
 if(changed)assert.notEqual(sw.match(/const V='([^']+)'/)[1],oldSw.match(/const V='([^']+)'/)[1],'Changed dependency receives changed cache version');
}
console.log('Early English curriculum: preserved IDs, quantity answers ('+checked+'), review coverage, visual evidence, safe local offline scenes.');
