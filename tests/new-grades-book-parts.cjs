'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),base=process.env.CACHE_BASE_REF||'origin/main';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const before=file=>execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const plain=value=>JSON.parse(JSON.stringify(value));
const ar=s=>String(s).replace(/[0-9]/g,n=>'٠١٢٣٤٥٦٧٨٩'[n]);
const load=text=>{const c={window:{}};vm.runInNewContext(text,c);return c.window.UNITS};
let lessons=0,questions=0;
for(const grade of [4,5,7])for(const subject of ['math','arabic','english','science']){
  const dir=`g${grade}/${subject}/`,units=load(read(dir+'content.js')),old=load(before(dir+'content.js'));
  assert.deepEqual(plain(units.map(({part,...u})=>u)),plain(old.map(({part,...u})=>u)),dir+'changes only unit part metadata, preserving IDs, content and progress keys');
  for(const u of units){const parts=new Set(u.les.map(l=>l.pg>=1000?2:1));assert.equal(parts.size,1,dir+'unit has one book part');assert.equal(u.part,[...parts][0],dir+u.id+' has correct part');}
  assert.deepEqual([...new Set(units.map(u=>u.part))],[1,2],dir+'provides both book parts');
  const done={[units[0].les[0].id]:100,[units.find(u=>u.part===2).les[0].id]:75},savedDone=plain(done);
  const side={querySelectorAll:()=>[],after:()=>{}},app={R:{},S:{done,seen:{}},ar,esc:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),$:()=>side,$$:()=>[],save:()=>{}};
  const context={window:{APP:app,UNITS:units,CFG:{subject,title:'اختبار',lesmode:true}},document:{head:{appendChild:()=>{}},createElement:()=>({}),addEventListener:()=>{}},MutationObserver:class{observe(){}},queueMicrotask:()=>{},setTimeout:()=>{}};
  vm.createContext(context);vm.runInContext(read(dir+'les.js'),context);
  for(const extra of ['arx.js','entask.js'])if(fs.existsSync(path.join(root,dir,extra)))vm.runInContext(read(dir+extra),context);
  vm.runInContext(read(dir+'explore.js'),context);
  const noEncodedPages=text=>{for(const m of String(text).matchAll(/ص\s*([0-9٠-٩]+)/g)){const n=+m[1].replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));assert.ok(n<1000,dir+'must not show encoded page '+m[1]);}};
  for(const part of [1,2]){
    const selected=units.filter(u=>u.part===part),ids=selected.flatMap(u=>u.les.map(l=>l.id)),html=app.R.home(String(part));
    assert.ok(html.includes(`href="#/home/${part}" aria-current="page"`),dir+'selected part is identified');
    assert.ok(html.includes(`aria-valuemax="${ids.length}"`)&&html.includes('aria-valuenow="1"'),dir+'counts selected part progress');
    const lessonLinks=[...html.matchAll(/<li><a href="#\/u\/([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(lessonLinks,plain(ids),dir+'journey shows only selected part lessons');noEncodedPages(html);
  }
  assert.deepEqual(app.S.done,savedDone,dir+'switching book parts preserves mastery');
  for(const l of app.gen.LES){
    lessons++;const part=l.u.part,html=app.R.u(l.id);noEncodedPages(html);assert.ok(!/ج[١٢]\s*ج[١٢]/.test(html),dir+l.id+'must not repeat the part marker');
    assert.ok(html.includes('كتاب الطالب ص '+app.bookPage(l,l.pg)),dir+l.id+' uses printed page and part');
    assert.ok(html.includes(`href="#/home/${part}"`),dir+l.id+' returns to its book part');
    app.gen.bookQs(l).forEach((q,i)=>{questions++;noEncodedPages(q.q);noEncodedPages(q.ex);q.o.forEach(noEncodedPages);assert.equal(q.a,l.bmc[i][2],'answer index is retained');});
  }
  const p2=app.gen.LES.find(l=>l.u.part===2);
  assert.equal(app.bookPage(p2,1006),'٦ ج٢');assert.equal(app.bookPage(p2,'١٠٠٦–١٠٠٨'),'٦–٨ ج٢');assert.equal(app.bookPage(units[0],6),'٦ ج١');
  assert.equal(app.bookText(p2,'<p>تمرين (ص 1006) و(ص ٦ ج٢)</p>'),'<p>تمرين (ص ٦ ج٢) و(ص ٦ ج٢)</p>','Appended lesson activities use the same part-aware references');
  assert.equal(app.bookText(p2,'مراجعة (ص ٦ ج١)'), 'مراجعة (ص ٦ ج١)','An explicit reference to another part is preserved');
  const badge='<span>كتاب الطالب ص ٦ ج٢</span>';
  assert.equal(app.bookText(p2,badge),badge,'Formatting rendered HTML is idempotent at closing tags');
  const fixture={...p2,bmc:[['أقارن الأعداد (ص ١٠٠٦ ج٢) و(ص 1007).',['١ (ص 1006)','٢'],0,1006]]};
  const q=app.gen.bookQs(fixture)[0];assert.ok(q.q.includes('ص ٦ ج٢')&&q.q.includes('ص ٧ ج٢'));assert.ok(q.ex.includes('ص ٦ ج٢'));assert.ok(!/ج٢\s*ج٢/.test(q.q));
  if(['content.js','les.js','explore.js'].some(file=>before(dir+file).replace(/\r\n/g,'\n')!==read(dir+file).replace(/\r\n/g,'\n'))){const version=s=>s.match(/const V='([^']+)'/)[1];assert.notEqual(version(read(dir+'sw.js')),version(before(dir+'sw.js')),dir+'cache version changes with the material');}
}
console.log(`new-grades-book-parts: 12 subjects, ${lessons} lessons and ${questions} book questions verified`);
