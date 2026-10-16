'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||path.join(__dirname,'../profiles.js'),'utf8');
const seed=()=>new Map(Object.entries({bustan_profiles:JSON.stringify([{id:'pA',name:'A'},{id:'pB',name:'B'}]),bustan_owner:'pA',bustan_session:JSON.stringify({id:'pA',token:'x'}),abboud_math_v1:'A-old',bustan_p_pA__abboud_math_v1:'A-older',bustan_p_pB__abboud_math_v1:'B-old'}));
const tails=new WeakMap(),held=new WeakSet();
function environment(map,options={}){
 const locks={request(name,fn){const tail=tails.get(map)||Promise.resolve(),run=async()=>{held.add(map);try{return await fn()}finally{held.delete(map)}},job=tail.then(run,run);tails.set(map,job.catch(()=>{}));return job}};
 const c={console,Uint8Array,Date,Math,navigator:{locks}};c.window=c;c.crypto={getRandomValues:a=>a.forEach((_,i)=>a[i]=Math.random()*256|0)};
 c.localStorage={getItem(k){const v=map.get(k)||null;if(options.get)options.get(k,v);return v},setItem(k,v){if(options.set)options.set(k,String(v));map.set(k,String(v))},removeItem(k){if(options.remove)options.remove(k);map.delete(k)}};
 c.addEventListener=()=>{};vm.createContext(c);vm.runInContext(source,c);return c.PROFILES;
}
async function main(){const results={};
 {const map=seed(),other=environment(map);let hook=false,pending;const p=environment(map,{get(k){if(hook&&k==='bustan_transition'){hook=false;pending=other.login('pB')}}});await Promise.all([p.ready,other.ready]);const write=p.writer('abboud_math_v1');hook=true;const ok=await write('A-new');await pending;results.writeSwitchRace={ok,owner:map.get('bustan_owner'),working:map.get('abboud_math_v1'),slotB:map.get('bustan_p_pB__abboud_math_v1')};assert.equal(p.backup().data.pB.abboud_math_v1,'B-old');assert.equal(p.backup().data.pA.abboud_math_v1,'A-new');}
 {const map=seed(),p=environment(map,{set(k,v){if(k==='abboud_math_v1'&&v==='restored')throw Error('quota')}});await p.ready;let threw=false;try{await p.restore({app:'bustan-backup-v1',profiles:[{id:'pA',name:'A'}],data:{pA:{abboud_math_v1:'restored'}}})}catch(e){threw=true}results.restoreQuota={threw,working:map.get('abboud_math_v1'),slot:map.get('bustan_p_pA__abboud_math_v1'),error:p.error()};assert.equal(threw,true);assert.equal(p.backup().data.pA.abboud_math_v1,'A-old');}
 {const map=seed(),a=environment(map),b=environment(map);await Promise.all([a.ready,b.ready]);await Promise.all([a.create('newA','idle','1234'),b.create('newB','idle','1234')]);results.concurrentCreate=JSON.parse(map.get('bustan_profiles')).map(p=>p.name);assert.equal(results.concurrentCreate.length,4);}
 {const map=seed(),p=environment(map);await p.ready;const write=p.writer('abboud_math_v1');await p.restore({app:'bustan-backup-v1',profiles:[{id:'pA',name:'A'}],data:{pA:{abboud_math_v1:'restored'}}});const ok=await write('A-memory-before-restore');results.writeAfterRestore={ok,working:map.get('abboud_math_v1'),slot:map.get('bustan_p_pA__abboud_math_v1')};assert.equal(ok,false);assert.equal(p.backup().data.pA.abboud_math_v1,'restored');}
 {const map=new Map(Object.entries({bustan_profiles:JSON.stringify([{id:'pA',name:'A'},{id:'pB',name:'B'}]),bustan_owner:'pA',bustan_session:JSON.stringify({id:'pA',token:'x'}),abboud_math_v1:'a'.repeat(100),bustan_p_pA__abboud_math_v1:'a'.repeat(100),bustan_p_pB__bustan_g8_english_v1:'b'.repeat(200),bustan_p_pB__bustan_g6_math_v1:'c'.repeat(200)}));
  const size=()=>[...map.values()].reduce((s,v)=>s+v.length,0);let cap=Infinity;
  const options={set(k,v){if(k==='bustan_transition'&&cap===Infinity)cap=size()+v.length+150;if(size()-(map.get(k)||'').length+v.length>cap)throw Error('quota')}};
  const p=environment(map,options);await p.ready;const ok=await p.login('pB'),again=environment(map,options);await again.ready;
  results.rollbackQuota={ok,current:again.current(),journal:map.has('bustan_transition'),mathWorking:map.get('abboud_math_v1')?.length,englishWorking:map.get('bustan_g8_english_v1')?.length,backupMath:again.backup().data.pA.abboud_math_v1?.length,error:again.error()};assert.equal(results.rollbackQuota.journal,false);assert.equal(results.rollbackQuota.backupMath,100);}
 {const map=new Map([['abboud_math_v1',JSON.stringify({name:'Old student',points:123})]]);let fail=true;const p=environment(map,{set(k){if(fail&&k==='bustan_profiles')throw Error('quota')}});await p.ready;const initial={profiles:p.list(),owner:map.get('bustan_owner'),error:p.error()};fail=false;await p.create('New student','idle','1234');results.migrationQuota={initial,profiles:p.list().map(p=>p.name),backedUp:Object.keys(p.backup().data),legacySlot:map.get('bustan_p_p1__abboud_math_v1')};assert.equal(p.find('p1').name,'Old student');assert.equal(JSON.parse(p.backup().data.p1.abboud_math_v1).points,123);}
 console.log(JSON.stringify(results,null,2));console.log('All six independently reproduced prior defects are blocked with awaited APIs and shared Web Locks.');
 // Replay the committed result of another tab between an unprotected initial list read and migration.
 // If migration holds the shared lock, this competing commit cannot interleave and is not injected.
 {const initial=()=>new Map([['abboud_math_v1','{"name":"Old student","points":123}']]);
  const finished=initial(),other=environment(finished);await other.ready;await other.create('New student','idle','1234');
  const late=initial();let injected=false;
  const p=environment(late,{get(k,v){if(!injected&&!held.has(late)&&k==='bustan_profiles'&&v===null){injected=true;late.clear();for(const [a,b] of finished)late.set(a,b)}}});await p.ready;
  const names=p.list().map(p=>p.name);console.log('Initial migration interleaving:',JSON.stringify({injected,names,backupProfiles:p.backup().profiles.length}));
  assert.ok(names.includes('Old student'),'unlocked initializer must not erase the legacy student after another tab committed');
  if(injected)assert.ok(names.includes('New student'),'unlocked initializer must not erase the concurrently created profile');
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
