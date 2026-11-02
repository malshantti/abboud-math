'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,'g5/science',f),'utf8');
const c={window:{},document:{createElement:()=>({}),head:{appendChild(){}},addEventListener(){} }};vm.runInNewContext(read('labdata.js'),c);
const expected=new Map([[34,'بعض خصائص العنصر'],[37,'أحاكي المركّب'],[75,'المولّد الكهربائي'],[83,'أيّهما أختار؟'],[1052,'الصّاعقة'],[1053,'مانعة الصّواعق']]);
let seen=0;const app={R:{},S:{seen:{},done:{},labn:{}},esc:String,ic:()=>'',fig:n=>'<img src="bookimg/'+n+'">',shuffle:a=>a.slice(),ar:n=>String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),save:()=>{}};
c.window.APP=app;c.window.CFG={};vm.runInNewContext(read('lab.js'),c);
for(const item of c.window.LAB.items)for(const a of item.acts||[])if(expected.has(a[0])&&[9,11,1,2,3].includes(a[1])){
 const title=expected.get(a[0]);assert.equal(a[2],title);assert.ok(fs.existsSync(path.join(root,'g5/science/bookimg/p'+a[0]+'.webp')));
 const html=app.R.l(item.id);assert.ok(html.includes(title));assert.ok(html.includes('data-n="'+item.id+':'+a[0]+':'+a[1]+'"'),'Notebook storage key is stable');seen++;
}
assert.equal(seen,6);
const base=process.env.CACHE_BASE_REF||'origin/main',before=f=>cp.execFileSync('git',['show',base+':g5/science/'+f],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replace(/\r\n/g,'\n');
if(before('labdata.js')!==read('labdata.js').replace(/\r\n/g,'\n')){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read('sw.js')),version(before('sw.js')));}
console.log('PASS: six textbook-verified activity titles render with original notebook keys and page images');
