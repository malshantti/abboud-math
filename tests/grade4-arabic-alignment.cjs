// N10: source-page and subject alignment checked against the local book images.
// Every reading page below was visually read; this is not certification of an entire edition.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),base=process.env.CACHE_BASE_REF||'origin/main',original=process.argv.includes('--original');
const previous=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8'}),load=s=>{const c={window:{}};vm.createContext(c);vm.runInContext(s,c);return c};
const c=load(original?previous('g4/arabic/content.js'):read('g4/arabic/content.js')),U=c.window.UNITS,lessons=U.flatMap(u=>u.les),old=load(previous('g4/arabic/content.js')).window.UNITS.flatMap(u=>u.les);
assert.equal(lessons.length,30);assert.deepEqual(JSON.parse(JSON.stringify(lessons.map(l=>({id:l.id,t:l.t,pg:l.pg,img:l.img})))),JSON.parse(JSON.stringify(old.map(l=>({id:l.id,t:l.t,pg:l.pg,img:l.img})))),'Lesson identities and original book-page associations are preserved');
const pages=[8,16,26,36,46,58,68,76,86,96,106,116,124,134,142,1008,1020,1030,1040,1050,1060,1068,1080,1090,1100,1110,1120,1130,1142,1152];
for(const [i,l] of lessons.entries()){
 assert.equal(l.readPg,pages[i],`${l.id} reading page belongs to its title`);assert.ok(l.img.includes(l.readPg));assert.ok(fs.existsSync(path.join(root,'g4/arabic/bookimg/p'+l.readPg+'.webp')));
 assert.ok(l.pts[0].startsWith('ملخص تعليمي لنص «'+l.t+'»'),'An authored summary is not presented as a quotation');assert.ok(l.ex.length>0);assert.ok(l.bmc.length>=10,`${l.id} has a real assessment`);
 for(const b of l.bmc){assert.ok(l.img.includes((l.pg>=1000?1000:0)+(+b[3]%1000)),`${l.id}: question references a page of this lesson`);assert.ok(b[2]>=0&&b[2]<b[1].length);assert.equal(new Set(b[1]).size,b[1].length);}
}
const get=id=>lessons.find(l=>l.id===id),correct=b=>b[1][b[2]];
for(const [id,word] of [['U5L1','العَسَل'],['U5L2','مُساعَدَة'],['U5L3','الصَّيْف'],['U6L1','الساحة'],['U6L2','ربع'],['U6L3','حرفة'],['U7L1','معطف'],['U7L2','الضفادع'],['U7L3','الحجر'],['U8L1','الرحلة'],['U8L2','الحكيم'],['U8L3','إبراهيم'],['U9L1','سيّارة'],['U9L2','المعلّمة'],['U9L3','العجوز'],['U10L1','النهر'],['U10L2','دينار'],['U10L3','محمود']]){
 const l=get(id);assert.ok(l.bmc.some(b=>(b[0]+' '+correct(b)).includes(word)),`${id} questions concern its own reading`);
}
assert.match(get('U2L2').bmc[11][0],/الممرّضات … المريض/);assert.match(get('U2L2').bmc[12][0],/الفلّاحان … البئر/);assert.match(get('U2L3').bmc[11][0],/الشاعرات … الأشعار/);assert.match(get('U4L1').bmc[10][0],/المزارعات … القمح/);
assert.ok(get('U10L2').ex[0][0].includes('(ص 144)'), 'Verb table refers to its actual printed page');
assert.ok(get('U5L3').bmc.find(b=>b[0].includes('لون كوكب الزهرة'))[0].startsWith('وفق نص «ما أجمل السماء!»'), 'Textbook colour description is a reading comprehension question');
const A={esc:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),S:{seen:{},done:{}},R:{},quiz(){},save(){},ar:String};c.window.APP=A;c.window.CFG={subject:'arabic'};vm.runInContext(read('g4/arabic/les.js'),c);
for(const l of lessons){const qs=A.gen.bookQs(l),r=+l.readPg%1000;assert.equal(qs.length,l.bmc.length);assert.ok(A.R.u(l.id).includes('النص الأصلي في صور كتاب الطالب'));for(const [i,q]of qs.entries()){const pg=+l.bmc[i][3]%1000;if(pg>=r&&pg<=r+2){assert.equal(q.img,'bookimg/p'+l.readPg+'.webp','Reading questions include the correct original text, not another story');assert.match(q.pre,/النص الأصلي/);}}}
// A lesson without any questions does not offer an empty training button.
const empty={id:'qa-empty',t:'تجربة',pts:[],terms:[],ex:[],img:[],u:U[0]};A.gen.LES.push(empty);assert.ok(!A.R.u(empty.id).includes('id="go"'));
if(!original){const version=s=>s.match(/\bconst\s+V\s*=\s*['"]([^'"]+)/)?.[1];assert.ok(version(read('g4/arabic/sw.js')),'The Arabic book declares a cache version');if(['content.js','les.js','std.js'].some(file=>read('g4/arabic/'+file).replace(/\r\n/g,'\n')!==previous('g4/arabic/'+file).replace(/\r\n/g,'\n')))assert.notEqual(version(read('g4/arabic/sw.js')),version(previous('g4/arabic/sw.js')),'The changed Arabic book receives a changed cache version');}
console.log(`PASS grade-four Arabic: 30 reading/assessment alignments, ${lessons.reduce((n,l)=>n+l.bmc.length,0)} question sources, preserved IDs/pages, reading contexts and empty-state guard`);
