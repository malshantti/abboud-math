const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
function store(seed,fail){const m=new Map(Object.entries(seed));return {m,getItem:k=>m.has(k)?m.get(k):null,setItem(k,v){if(fail&&fail(k))throw Error('QuotaExceededError');m.set(k,String(v))},removeItem:k=>m.delete(k)}}
function profiles(ls){const x={window:{localStorage:ls},console};vm.runInNewContext(fs.readFileSync(path.join(root,'profiles.js'),'utf8'),x);return x.window.PROFILES;}
const list=JSON.stringify([{id:'pA',name:'طالب أ',avatar:'idle'},{id:'pB',name:'طالب ب',avatar:'read'}]);
const seed={bustan_profiles:list,bustan_owner:'pA',bustan_session:JSON.stringify({id:'pA'}),abboud_math_v1:JSON.stringify({points:123}),bustan_g8_science_v1:JSON.stringify({xp:50})};
const a=store(seed,k=>k.startsWith('bustan_p_pA__'));profiles(a).login('pB');
const quota={workingMath:a.getItem('abboud_math_v1'),oldProfileMath:a.getItem('bustan_p_pA__abboud_math_v1'),owner:a.getItem('bustan_owner')};
const b=store(seed);profiles(b).restore({app:'bustan-backup-v1',profiles:[{id:'pA',name:'طالب أ',avatar:'idle',pin:'fake',salt:'test'}],data:{pA:{abboud_math_v1:JSON.stringify({points:1})}}});
const restore={math:JSON.parse(b.getItem('abboud_math_v1')),science:JSON.parse(b.getItem('bustan_g8_science_v1'))};
const c=store(seed);const p1=profiles(c),p2=profiles(c);const staleState=JSON.parse(c.getItem('abboud_math_v1'));p2.login('pB');c.setItem('abboud_math_v1',JSON.stringify({...staleState,points:124}));const tabs={currentProfile:p1.current().name,secondStudentMath:p1.dataOf('pB','abboud_math_v1'),firstStudentMath:p1.dataOf('pA','abboud_math_v1')};
async function swResult(){let handler,post;const cache={match:async()=>null,add:async()=>{throw Error('Network unavailable')}};const ctx={self:{addEventListener(n,h){if(n==='message')handler=h}},caches:{open:async()=>cache},console};vm.runInNewContext(fs.readFileSync(path.join(root,'g8/science/sw.js'),'utf8'),ctx);handler({data:{cacheAll:['bookimg/missing.webp']},source:{postMessage:x=>post=x}});await new Promise(r=>setImmediate(r));return post;}
swResult().then(cache=>console.log(JSON.stringify({quota,restore,tabs,cacheMessageAfterEveryDownloadFails:cache},null,2)));
