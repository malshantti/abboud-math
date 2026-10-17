// T11: exercise the real P2U1 spelling lesson; textbook page g6/arabic/bookimg/p2-12.webp.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const grade of [6,8]){
 const button={},calls=[];
 const A={S:{seen:{},done:{}},R:{},save(){},esc:s=>String(s??''),ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,quiz:(qs,meta)=>calls.push({qs,meta}),say:()=>'',fig:()=>'',ar:String,$:s=>s==='#go'?button:null,$$:()=>[]};
 const window={APP:A,CFG:{grade,ap:'g'+grade+'ar',title:'اللغة العربية'}};
 const context={window,document:{},console};vm.createContext(context);
 const dir=path.join(root,'g'+grade,'arabic');
 for(const file of ['content.js','ar-banks.js','ar.js'])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
 const unit=window.UNITS.find(u=>u.id==='P2U1');
 const bank=window.ARB.farqa;
 const expected=Array.from(bank,x=>({q:x[0].includes('___')?'اختر الصّواب: <span class="ar">'+x[0].replace('___','ــــ')+'</span>':x[0],o:Array.from(x[1]),a:0,arOpt:1,ex:x[2]}));
 const plain=x=>JSON.parse(JSON.stringify(x));
 assert.deepEqual(plain(A.gen.imlaQs(unit,8)),expected,'P2U1 must use the discriminating-alif bank, not general silent-letter questions.');
 assert.deepEqual(plain(A.gen.secQs(unit,'imla')),expected);
 // Click through the production lesson handler, preserving the existing progress key.
 A.R.after_u('P2U1','imla');button.onclick();
 assert.deepEqual(plain(calls[0].qs),expected);assert.equal(calls[0].meta.key,'P2U1:imla');
 assert.equal(calls[0].meta.back,'#/u/P2U1/imla');
 assert.ok(expected.some(q=>q.o[0]==='كَتَبوا')); // واو الجماعة
 assert.ok(expected.some(q=>q.o[0]==='يَدْعو')); // واو أصلية
 assert.ok(expected.some(q=>q.o[0]==='مُعَلِّمو')); // جمع مذكر سالم مضاف
 if(grade===6){
  assert.ok(unit.sec.imla.img.some(x=>x[0]==='p2-12.webp'));
  const following=window.UNITS.find(u=>u.id==='P2U2');
  assert.deepEqual(plain(A.gen.imlaQs(following,8).map(q=>q.ex)),plain(window.ARB.zaid.map(x=>x[2])),'The following silent-letter lesson keeps its own bank.');
 }
}
console.log('Passed: actual P2U1 spelling generators and lesson button use the discriminating-alif bank; adjacent lesson unchanged (T11).');
