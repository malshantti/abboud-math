// T05: isolated storage, real profile functions, and a shared Web Locks model. No browser data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../profiles.js'),'utf8');let checks=0;
const ok=(value,message)=>{assert.ok(value,message);checks++};
const eq=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++};
const profiles=JSON.stringify([{id:'pA',name:'طالب أ',avatar:'idle'},{id:'pB',name:'طالب ب',avatar:'read'}]);
const seed=()=>({bustan_profiles:profiles,bustan_owner:'pA',bustan_session:JSON.stringify({id:'pA',t:1}),abboud_math_v1:'{"points":123}',bustan_g8_science_v1:'{"xp":50}',bustan_p_pB__abboud_math_v1:'{"points":456}'});
function storage(initial=seed()){let writes=0,fail=()=>false,readHook=null;const m=new Map(Object.entries(initial));let tail=Promise.resolve();
 return {m,getItem(k){const v=m.has(k)?m.get(k):null;if(readHook)readHook(k,v);return v},setItem(k,v){writes++;if(fail(k,v,writes))throw Error('QuotaExceededError');m.set(k,String(v))},removeItem(k){writes++;if(fail(k,null,writes))throw Error('StorageError');m.delete(k)},
  fail(fn){writes=0;fail=fn},hook(fn){readHook=fn},count:()=>writes,locks:{request(name,fn){const p=tail.then(fn,fn);tail=p.catch(()=>{});return p}}};}
function load(ls){const events=[];const c={localStorage:ls,navigator:{locks:ls.locks},crypto:crypto.webcrypto,console,Date,TextEncoder,Uint8Array,URL,Blob,setTimeout,clearTimeout,addEventListener:(n,f)=>events.push({n,f})};c.window=c;
 vm.runInNewContext(source,c);return {P:c.PROFILES,events};}
const copy=(p,id)=>JSON.parse(JSON.stringify(p.backup().data[id]));
async function main(){
 // Failure at every write in switching: no success claim on partial progress and no loss of A.
 const probe=storage(),p0=load(probe).P;await p0.ready;probe.fail(()=>false);ok(await p0.login('pB'));const steps=probe.count();
 for(let n=1;n<=steps;n++){const ls=storage(),{P}=load(ls);await P.ready;ls.fail((k,v,i)=>i===n);const success=await P.login('pB');
  eq(P.dataOf('pA','abboud_math_v1').points,123,'A preserved at switch write '+n);
  eq(P.dataOf('pB','abboud_math_v1').points,456,'B preserved at switch write '+n);
  eq(ls.getItem('bustan_owner'),success?'pB':'pA');ok(!ls.getItem('bustan_transition'),'journal recovered at write '+n);
 }
 const ls=storage(),a=load(ls).P,b=load(ls).P;await Promise.all([a.ready,b.ready]);
 const writer=a.writer('abboud_math_v1');ok(await writer('{"points":124}'));ok(await b.login('pB'));eq(await writer('{"points":999}'),false);eq(b.dataOf('pB','abboud_math_v1').points,456);eq(a.dataOf('pA','abboud_math_v1').points,124);
 // Old cached subject code (before this release) saves only to the working key. For the logged-in owner that write is newer, so it must win and reach B's own copy; A is untouched.
 ls.setItem('abboud_math_v1','{"points":999}');eq(b.dataOf('pB','abboud_math_v1').points,999);eq(JSON.parse(b.readProgress('abboud_math_v1')).points,999);
 ok(await a.login('pA'));eq(JSON.parse(a.readProgress('abboud_math_v1')).points,124);
 const fresh=a.writer('abboud_math_v1');ls.fail(k=>k==='bustan_p_pA__abboud_math_v1');eq(await fresh('{"points":125}'),false);ok(a.error());eq(ls.getItem('bustan_p_pA__abboud_math_v1'),'{"points":124}');eq(JSON.parse(a.backup().data.pA.abboud_math_v1).points,125,'failed save remains exportable');
 ls.fail(()=>false);ok(await fresh('{"points":125}'));eq(ls.getItem('bustan_p_pA__abboud_math_v1'),'{"points":125}');
 // Concurrent creation must keep both profiles; state belonging to the old students survives.
 const concurrent=storage(),ca=load(concurrent).P,cb=load(concurrent).P;const created=await Promise.all([ca.create('جديد أ','read','1234'),cb.create('جديد ب','idle','1234')]);
 eq(ca.list().length,4);created.forEach(p=>ok(ca.find(p.id)));eq(ca.dataOf('pA','abboud_math_v1').points,123);eq(ca.dataOf('pB','abboud_math_v1').points,456);
 // Restore retains merge semantics, but is checked and invalidates every writer with the old token.
 const restoreData={app:'bustan-backup-v1',profiles:[{id:'pA',name:'طالب أ',pin:'test',salt:'test'}],data:{pA:{abboud_math_v1:'{"points":1}'}}};
 const rl=storage(),rp=load(rl).P;const stale=rp.writer('abboud_math_v1');ok(await stale('{"points":124}'));eq(await rp.restore(restoreData),2);eq(rp.dataOf('pA','abboud_math_v1').points,1);eq(rp.dataOf('pA','bustan_g8_science_v1').xp,50);eq(await stale('{"points":888}'),false);eq(rp.dataOf('pA','abboud_math_v1').points,1);
 const restoreProbe=storage(),restoreP=load(restoreProbe).P;restoreProbe.fail(()=>false);await restoreP.restore(restoreData);const restoreSteps=restoreProbe.count();
 for(let n=1;n<=restoreSteps;n++){const s=storage(),p=load(s).P;s.fail((k,v,i)=>i===n);let success=false;try{await p.restore(restoreData);success=true}catch(e){}
  eq(p.dataOf('pA','abboud_math_v1').points,success?1:123,'restore rollback '+n);eq(p.dataOf('pA','bustan_g8_science_v1').xp,50);ok(!s.getItem('bustan_restore'));
 }
 // A persistent failure leaves a recoverable original in the journal/slots; a later load recovers it.
 const stuck=storage(),sp=load(stuck).P;stuck.fail((k,v)=>k==='abboud_math_v1'&&v!==null);eq(await sp.login('pB'),false);eq(sp.dataOf('pA','abboud_math_v1').points,123);eq(JSON.parse(sp.backup().data.pA.abboud_math_v1).points,123);stuck.fail(()=>false);const reopened=load(stuck).P;ok(await reopened.ready);eq(reopened.dataOf('pA','abboud_math_v1').points,123);ok(!stuck.getItem('bustan_transition'));
 // Migration never hides an old student if list persistence fails.
 const legacy=storage({abboud_math_v1:'{"name":"قديم","points":123}'});legacy.fail(k=>k==='bustan_profiles');const lp=load(legacy).P;eq(await lp.ready,false);eq(legacy.getItem('bustan_owner'),null);eq(JSON.parse(lp.backup().data.p1.abboud_math_v1).points,123);await assert.rejects(lp.create('جديد','read','1234'));checks++;legacy.fail(()=>false);const migrated=load(legacy).P;ok(await migrated.ready);ok(migrated.find('p1'));eq(migrated.dataOf('p1','abboud_math_v1').points,123);
 // The keys used by existing installations remain unchanged; each app uses the guarded reader/writer.
 const expected=['abboud_math_v1','bustan_g8_english_v1','bustan_g6_math_v1','bustan_g6_english_v1','bustan_g6_arabic_v1','bustan_g6_science_v1','bustan_g8_arabic_v1','bustan_g8_science_v1','en_rate','en_sfx','en_zay','abboud_coach_cfg','bustan_last','bustan_grade','bustan_student_name'];eq(Array.from(migrated.PER),[...expected,'bustan_g1_math_v1','bustan_g1_arabic_v1','bustan_g1_english_v1','bustan_g1_life_v1','bustan_g2_math_v1','bustan_g2_arabic_v1','bustan_g2_english_v1','bustan_g2_life_v1','bustan_g3_math_v1','bustan_g3_arabic_v1','bustan_g3_english_v1','bustan_g3_science_v1','bustan_report_v1','bustan_g4_math_v1','bustan_g5_math_v1','bustan_g7_math_v1','bustan_g4_arabic_v1','bustan_g5_arabic_v1','bustan_g7_arabic_v1']);
 for(const grade of [6,8])for(const subject of ['math','english','arabic','science']){const dir=path.join(__dirname,'../g'+grade,subject),text=fs.readFileSync(path.join(dir,['math','english'].includes(subject)?'app.js':'core.js'),'utf8');ok(text.includes('PROFILES.writer('));ok(text.includes('PROFILES.readProgress('));const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');ok(sw.includes('../../profiles.js'));}
 console.log('T05 progress safety: '+checks+' checks passed; '+steps+' switch and '+restoreSteps+' restore failure positions.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
