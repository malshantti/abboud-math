/* ملفات الطلاب على هذا الجهاز (دون خادم).
   كل ملف له نسخة خاصة من مفاتيح التقدّم. المفاتيح «العاملة» (التي يقرؤها موقع المادة مباشرة) تخص صاحبها المسجَّل في bustan_owner.
   عند الدخول بملف آخر: نحفظ المفاتيح العاملة في ملف صاحبها أولًا، ثم نحمّل مفاتيح الملف الجديد. لا يُحذف شيء قبل حفظه.
   الرقم السري قفل خفيف لمنع الخلط بين الإخوة على الجهاز نفسه، وليس حماية أمنية: يُخزَّن مُجزّأً (SHA-256 مع ملح) في المتصفح. */
(function(){
'use strict';
const LS=window.localStorage;
const PER=['abboud_math_v1','bustan_g8_english_v1','bustan_g6_math_v1','bustan_g6_english_v1','bustan_g6_arabic_v1','bustan_g6_science_v1','bustan_g8_arabic_v1','bustan_g8_science_v1','en_rate','en_sfx','en_zay','abboud_coach_cfg','bustan_last','bustan_grade','bustan_student_name','bustan_g1_math_v1','bustan_g1_arabic_v1','bustan_g1_english_v1','bustan_g1_life_v1'];// مفاتيح خاصة بكل طالب
const K={list:'bustan_profiles',session:'bustan_session',owner:'bustan_owner',fails:'bustan_pin_fails',transition:'bustan_transition',restore:'bustan_restore'};
const slot=(id,k)=>`bustan_p_${id}__${k}`;
const get=k=>{try{return LS.getItem(k)}catch(e){return null}};
const set=(k,v)=>{try{v==null?LS.removeItem(k):LS.setItem(k,v);return true}catch(e){return false}};
const required=(k,v)=>{if(!set(k,v))throw Error('storage')};
const J=(k,d)=>{try{const v=JSON.parse(get(k));return v==null?d:v}catch(e){return d}};
const list=()=>{const r=J(K.restore,null);if(r&&Object.hasOwn(r,K.list)){try{return JSON.parse(r[K.list])||[]}catch(e){return[]}}return J(K.list,[])};
const saveList=a=>set(K.list,JSON.stringify(a));
const AVATARS=['idle','encourage','think','celebrate','read'];
const PROGRESS=[...PER.slice(0,8),'bustan_g1_math_v1','bustan_g1_arabic_v1','bustan_g1_english_v1','bustan_g1_life_v1'],storeKey=id=>slot(id,'store_v1');
const canonical=id=>!!id&&get(storeKey(id))==='1';
let queue=Promise.resolve();const drafts=new Map();
// Web Locks يسلّسل الحفظ والتبديل والاستعادة بين تبويبات الأصل نفسه، ويعمل دون شبكة.
function locked(fn){const run=()=>window.navigator&&navigator.locks?navigator.locks.request('bustan-progress',fn):fn();const job=queue.then(run,run);queue=job.catch(()=>{});return job}
let lastError='';
const storageError=()=>{lastError='تعذّر الحفظ على هذا الجهاز. أبقِ هذه الصفحة مفتوحة، واحفظ نسخة من التقدّم قبل إعادة المحاولة.';return false};
// تبقى المفاتيح العاملة أصلًا صالحًا حتى اكتمال نسخها. وعند التحميل تكون نسخة صاحبها مرجع الرجوع.
function recover(){
 const raw=get(K.transition);if(!raw)return true;
 try{const m=JSON.parse(raw);if(!m||!['saving','loading'].includes(m.phase))throw Error('transition');
  if(m.phase==='loading'){
   PER.forEach(k=>required(k,null));
   PER.forEach(k=>required(k,m.from?LS.getItem(slot(m.from,k)):(m.before||{})[k]));
   required(K.list,m.list);required(K.owner,m.from);required(K.session,m.session);
  }
  required(K.transition,null);return true;
 }catch(e){return storageError()}
}
function recoverRestore(){const raw=get(K.restore);if(!raw)return true;try{const before=JSON.parse(raw);Object.keys(before).forEach(k=>required(k,null));Object.entries(before).forEach(([k,v])=>required(k,v));required(K.restore,null);return true}catch(e){return storageError()}}
function switchProfile(id,name,profiles){
 if(!recoverRestore()||!recover())return false;
 const m={from:get(K.owner),to:id,session:get(K.session),list:get(K.list),phase:'saving'};
 try{
  if(!m.from){m.before={};PER.forEach(k=>m.before[k]=LS.getItem(k))}
  required(K.transition,JSON.stringify(m));
  if(!stash())throw Error('storage');
  m.phase='loading';required(K.transition,JSON.stringify(m));
  PER.forEach(k=>required(k,LS.getItem(slot(id,k))));
  required(storeKey(id),'1');
  if(profiles)required(K.list,JSON.stringify(profiles));
  if(name&&!get('bustan_student_name'))required('bustan_student_name',name);
  required(K.owner,id);required(K.session,JSON.stringify({id,t:Date.now(),token:newSalt()}));
  required(K.transition,null);lastError='';return true;
 }catch(e){recover();return storageError()}
}
function migrate(){
  if(get(K.list)!=null)return true;
  const st=J('abboud_math_v1',null);const out=[];
  try{
  if(st){// تقدّم عبّود الموجود يصبح ملفه الأول، ويبقى في المفاتيح العاملة كما هو
    out.push({id:'p1',name:(st.name||'عبّود').slice(0,24),avatar:'idle',pin:null,salt:null,created:Date.now(),migrated:true});
    PER.forEach(k=>required(slot('p1',k),LS.getItem(k)));required(storeKey('p1'),'1');
  }
  required(K.list,JSON.stringify(out));
  if(st){required(K.owner,'p1');required(K.session,JSON.stringify({id:'p1',t:Date.now(),pending:true}))}
  return true;
  }catch(e){return storageError()}
}
// يحفظ المفاتيح العاملة في ملف صاحبها. إن كتبت نسخة قديمة مخزّنة من موقع المادة في المفتاح العامل وحده، فالمفتاح العامل هو الأحدث ويُنسخ إلى ملف الطالب.
function stash(){
  const o=get(K.owner);if(!o)return true;
  try{PER.forEach(k=>{const w=LS.getItem(k);if(!canonical(o)||!PROGRESS.includes(k)||(w!=null&&w!==LS.getItem(slot(o,k))))required(slot(o,k),w)});required(storeKey(o),'1');return true}catch(e){return storageError()}
}
async function hash(pin,salt){
  const msg=`bustan:${salt}:${pin}`;
  if(window.crypto&&crypto.subtle&&window.isSecureContext){
    const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(msg));
    return 'sha256:'+[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  let h=2166136261;for(const c of msg)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return 'fnv:'+h.toString(16);// احتياط لصفحات file://
}
const newSalt=()=>{const a=new Uint8Array(8);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256|0)}).getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')};
function profileValue(id,k){const r=J(K.restore,null),sk=slot(id,k);if(r&&Object.hasOwn(r,sk))return r[sk];const m=J(K.transition,null),d=drafts.get(id+'|'+k);if(d&&d.session===get(K.session)&&get(K.owner)===id)return d.value;if(get(K.owner)===id&&!(m&&m.phase==='loading')){const w=get(k);if(!(PROGRESS.includes(k)&&canonical(id))||w!=null)return w}return get(sk)}
// يُنشأ الحارس مرةً حين تقرأ المادة حالتها، لا حين تحاول حفظها بعد تغيير الطالب.
function writer(key){
 const student=P.current(),owner=student&&student.id,session=get(K.session);let latest=get(key),notice=null,frozen=false;
 const owns=()=>!!owner&&get(K.owner)===owner&&get(K.session)===session;
 const download=()=>{const backup=P.backup();if(student&&!backup.profiles.some(p=>p.id===owner))backup.profiles.push(student);backup.data[owner]=backup.data[owner]||{};if(latest!=null)backup.data[owner][key]=latest;
  const url=URL.createObjectURL(new Blob([JSON.stringify(backup)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='نسخة-التقدم-غير-المحفوظ.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 function show(changed){
  if(typeof document==='undefined'||!document.body)return;
  if(!notice){notice=document.createElement('aside');notice.setAttribute('role','alert');notice.style.cssText='position:fixed;z-index:9999;bottom:16px;left:16px;right:16px;max-width:680px;margin:auto;padding:16px;border:2px solid #a8332a;border-radius:16px;background:#fff6ec;color:#49251c;font:inherit;box-shadow:0 4px 20px #0003;line-height:1.8';document.body.append(notice)}
  notice.replaceChildren();const text=document.createElement('p');text.style.margin='0 0 8px';text.textContent=changed?'تغيّر ملف الطالب في تبويب آخر. توقف هذا التبويب لحماية التقدّم. يمكنك تنزيل نسخة ثم فتح ملفك من جديد.':lastError||'تعذّر الحفظ. أبقِ الصفحة مفتوحة واحفظ نسخة من تقدّمك، ثم أعد المحاولة.';notice.append(text);
  const backup=document.createElement('button');backup.type='button';backup.className='btn';backup.textContent='تنزيل نسخة من التقدّم';backup.onclick=download;notice.append(backup);
  if(changed){const link=document.createElement('a');link.href=new URL('login.html?switch=1',document.querySelector('script[src$="profiles.js"]').src).href;link.textContent='فتح ملفي';link.style.marginInlineStart='12px';notice.append(link)}
  else{const retry=document.createElement('button');retry.type='button';retry.className='btn';retry.style.marginInlineStart='12px';retry.textContent='أعِد الحفظ';retry.onclick=()=>write(latest);notice.append(retry)}
 }
 function freeze(){frozen=true;if(typeof document!=='undefined'){const app=document.querySelector('#app');if(app)app.inert=true}show(true)}
 function write(value){latest=value;if(frozen||!owns()){freeze();return Promise.resolve(false)}
  drafts.set(owner+'|'+key,{session,value});
  return locked(()=>{
   if(frozen||!owns()){freeze();return false}
   if(get(K.transition)||get(K.restore)||!stash()||!set(slot(owner,key),value)){storageError();show(false);return false}
   // تبقى نسخة العمل للتوافق، لكن المصدر المعتمد للحفظ والقراءة هو ملف الطالب.
   if(owns()&&!get(K.transition)&&!set(key,value))set(key,null);
   if(notice){notice.remove();notice=null}lastError='';return true;
  });
 }
 if(typeof window.addEventListener==='function')window.addEventListener('storage',e=>{if([K.owner,K.session].includes(e.key)&&!owns())freeze()});
 return write;
}
const P={
  PER,AVATARS,list,writer,
  readProgress:key=>{const m=J(K.transition,null);if(m&&m.phase==='loading')return m.from?get(slot(m.from,key)):(m.before||{})[key]||null;const p=P.current();return p?profileValue(p.id,key):get(key)},
  error:()=>lastError,
  find:id=>list().find(p=>p.id===id)||null,
  current(){if(get(K.transition)||get(K.restore))return null;const s=J(K.session,null);if(!s||s.pending)return null;const p=this.find(s.id);return p&&get(K.owner)===p.id?p:null},
  async create(name,avatar,pin){
    const id='p'+(Date.now().toString(36))+(Math.random()*1e4|0).toString(36);
    const salt=newSalt();const p={id,name:name.trim().slice(0,24),avatar:AVATARS.includes(avatar)?avatar:'idle',pin:await hash(pin,salt),salt,created:Date.now()};
    return locked(()=>{if(!migrate())throw Error(lastError);const a=list();a.push(p);if(!switchProfile(id,p.name,a))throw Error(lastError);return p});
  },
  async setPin(id,pin){const salt=newSalt(),value=await hash(pin,salt);return locked(()=>{const a=list(),p=a.find(x=>x.id===id);if(!p)return false;p.salt=salt;p.pin=value;delete p.migrated;if(!saveList(a))return storageError();return true})},
  async check(id,pin){const p=this.find(id);if(!p||!p.pin)return false;return (await hash(pin,p.salt))===p.pin},
  lockedFor(id){const f=J(K.fails,{})[id];if(!f||f.n<5)return 0;const left=f.t+30000-Date.now();return left>0?left:0},
  fail(id){const all=J(K.fails,{});const f=all[id]||{n:0,t:0};if(Date.now()-f.t>30000&&f.n>=5)f.n=0;f.n++;f.t=Date.now();all[id]=f;set(K.fails,JSON.stringify(all));return f.n},
  clearFails(id){const all=J(K.fails,{});delete all[id];set(K.fails,JSON.stringify(all))},
  login(id){return locked(()=>{const p=this.find(id);if(!p||!switchProfile(id,p.name))return false;this.clearFails(id);return true})},
  // خروج: نحفظ تقدّم الطالب في ملفه ونُبقي نسخة العمل له (لا شيء يضيع)، وننهي الجلسة فقط
  logout(){return locked(()=>{if(!recoverRestore()||!recover()||!stash()||!set(K.session,null))return storageError();lastError='';return true})},
  rename(id,name){return locked(()=>{const a=list();const p=a.find(x=>x.id===id);if(p){p.name=name.trim().slice(0,24);return saveList(a)}return false})},
  // رقم ولي الأمر (قفل خفيف أيضًا) يحمي الإعدادات ومسح التقدّم والاستيراد
  hasParent:()=>!!J('bustan_parent',null),
  async setParent(pin){const salt=newSalt();set('bustan_parent',JSON.stringify({salt,pin:await hash('parent:'+pin,salt)}))},
  async checkParent(pin){const p=J('bustan_parent',null);if(!p)return false;return (await hash('parent:'+pin,p.salt))===p.pin},
  // قراءة تقدّم كل الطلاب على هذا الجهاز (للتقرير)
  dataOf(id,k){k=k||'abboud_math_v1';try{return JSON.parse(profileValue(id,k))}catch(e){return null}},
  // نسخة احتياطية لكل الطلاب (الأرقام السرية تبقى مُجزّأة)
  backup(){const ps=list(),legacy=!ps.length&&J('abboud_math_v1',null);if(legacy)ps.push({id:'p1',name:legacy.name||'عبّود',avatar:'idle',migrated:true});const data={};ps.forEach(p=>{data[p.id]={};PER.forEach(k=>{const v=legacy?get(k):profileValue(p.id,k);if(v!=null)data[p.id][k]=v})});return{app:'bustan-backup-v1',exported:new Date().toISOString(),profiles:ps,data}},
  restore(b){return locked(()=>{if(!b||b.app!=='bustan-backup-v1'||!Array.isArray(b.profiles))throw Error('bad');if(!recoverRestore()||!recover()||!stash())throw Error('storage');const a=list(),changes=new Map();
    b.profiles.forEach(p=>{if(!p||!p.id||!/^p[\w]+$/.test(p.id))return;const i=a.findIndex(x=>x.id===p.id);const q={id:p.id,name:String(p.name||'').slice(0,24),avatar:AVATARS.includes(p.avatar)?p.avatar:'idle',pin:p.pin||null,salt:p.salt||null,created:p.created||Date.now()};if(!q.pin)q.migrated=true;if(i>=0)a[i]=q;else a.push(q);
      const d=(b.data||{})[p.id]||{};PER.forEach(k=>{if(typeof d[k]==='string'){changes.set(slot(p.id,k),d[k]);if(get(K.owner)===p.id)changes.set(k,d[k])}});changes.set(storeKey(p.id),'1')});
    changes.set(K.list,JSON.stringify(a));const s=J(K.session,null);if(s)changes.set(K.session,JSON.stringify({...s,t:Date.now(),token:newSalt()}));
    const before={};changes.forEach((v,k)=>before[k]=LS.getItem(k));
    try{required(K.restore,JSON.stringify(before));changes.forEach((v,k)=>required(k,null));changes.forEach((v,k)=>required(k,v));required(K.restore,null);drafts.clear();lastError='';return a.length}
    catch(e){recoverRestore();storageError();throw Error(lastError)}
  })},
  avatarSrc:(a,base)=>(base||'')+'assets/img/av-'+(AVATARS.includes(a)?a:'idle')+'.webp'
};
window.PROFILES=P;
const pending=!!(get(K.transition)||get(K.restore));
P.ready=locked(()=>recoverRestore()&&recover()&&migrate()).then(ok=>{if(ok&&pending&&typeof location!=='undefined')location.reload();return ok});
})();
