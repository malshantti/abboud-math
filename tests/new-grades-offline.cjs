// N08: custom lesson-mode homepages expose complete, resumable book downloads.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),base=process.env.CACHE_BASE_REF||'origin/main';
const version=s=>s.match(/\bconst\s+V\s*=\s*['"]([^'"]+)/)?.[1];
let count=0;
for(const grade of [4,5,7])for(const subject of ['math','arabic','english','science']){
 const folder=`g${grade}/${subject}`,core=read(folder+'/core.js'),source=core.slice(core.indexOf('function offline(){'),core.indexOf('let downloading=false;'));
 const html=vm.runInNewContext(source+';offline()',{C:{lesmode:true,audio:false},ic:()=>''});
 assert.match(html,/id="offbtn"/,'Lesson-mode homepage must offer book download');assert.match(html,/id="offstatus"/,'Download status is available');
 assert.match(core,/insertAdjacentHTML\('beforeend',offline\(\)\)/,'Custom home render receives the download UI');
 const c={window:{}};vm.runInNewContext(read(folder+'/media.js'),c);const files=Array.from(c.window.MEDIA);
 assert.ok(files.length>0);assert.equal(new Set(files).size,files.length,'Manifest has no duplicates');
 const expected=[];for(const dir of ['bookimg','audio']){const p=path.join(root,folder,dir);if(fs.existsSync(p))for(const f of fs.readdirSync(p,{recursive:true}))if(fs.statSync(path.join(p,f)).isFile())expected.push(dir+'/'+f.replace(/\\/g,'/'));}
 assert.deepEqual(files,expected.sort(),'All existing book pages and audio are included');
 assert.ok(files.every(f=>/^(bookimg|audio)\//.test(f)&&fs.existsSync(path.join(root,folder,f))));
 const sw=read(folder+'/sw.js'),ctx={self:{addEventListener(){}},files:null};vm.runInNewContext(sw+';files=F;',ctx);
 assert.ok(ctx.files.includes('../../assets/brand/logo-mascot-sm.webp'),'Shared logo is precached');assert.ok(ctx.files.includes('media.js'),'Download index is available offline');
 const old=cp.execFileSync('git',['show',base+':'+folder+'/sw.js'],{cwd:root,encoding:'utf8'});assert.ok(version(sw));const previous=file=>cp.execFileSync('git',['show',base+':'+folder+'/'+file],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');const comparable=s=>s.replace(/\r\n/g,'\n').replace(/(const V=)['"][^'"]+['"]/,'$1VERSION');if(['core.js','media.js'].some(file=>read(folder+'/'+file).replace(/\r\n/g,'\n')!==previous(file))||comparable(sw)!==comparable(old))assert.notEqual(version(sw),version(old),'Changed subject receives a changed cache version');
 count++;
}
console.log(`PASS new grades offline: ${count} complete manifests, lesson-mode buttons, precached logos/indexes and changed cache versions`);
