/* ملفات الطلاب على هذا الجهاز (دون خادم).
   كل ملف له نسخة خاصة من مفاتيح التقدّم. المفاتيح «العاملة» (التي يقرؤها موقع المادة مباشرة) تخص صاحبها المسجَّل في bustan_owner.
   عند الدخول بملف آخر: نحفظ المفاتيح العاملة في ملف صاحبها أولًا، ثم نحمّل مفاتيح الملف الجديد. لا يُحذف شيء قبل حفظه.
   الرقم السري قفل خفيف لمنع الخلط بين الإخوة على الجهاز نفسه، وليس حماية أمنية: يُخزَّن مُجزّأً (SHA-256 مع ملح) في المتصفح. */
(function(){
'use strict';
const LS=window.localStorage;
const PER=['abboud_math_v1','bustan_g8_english_v1','en_rate','en_sfx','abboud_coach_cfg','bustan_last','bustan_grade','bustan_student_name'];// مفاتيح خاصة بكل طالب
const K={list:'bustan_profiles',session:'bustan_session',owner:'bustan_owner',fails:'bustan_pin_fails'};
const slot=(id,k)=>`bustan_p_${id}__${k}`;
const get=k=>{try{return LS.getItem(k)}catch(e){return null}};
const set=(k,v)=>{try{v==null?LS.removeItem(k):LS.setItem(k,v)}catch(e){}};
const J=(k,d)=>{try{const v=JSON.parse(get(k));return v==null?d:v}catch(e){return d}};
const list=()=>J(K.list,[]);
const saveList=a=>set(K.list,JSON.stringify(a));
const AVATARS=['idle','encourage','think','celebrate','read'];
function migrate(){
  if(get(K.list)!=null)return;
  const st=J('abboud_math_v1',null);const out=[];
  if(st){// تقدّم عبّود الموجود يصبح ملفه الأول، ويبقى في المفاتيح العاملة كما هو
    out.push({id:'p1',name:(st.name||'عبّود').slice(0,24),avatar:'idle',pin:null,salt:null,created:Date.now(),migrated:true});
    set(K.owner,'p1');set(K.session,JSON.stringify({id:'p1',t:Date.now(),pending:true}));
  }
  saveList(out);
}
// يحفظ المفاتيح العاملة في ملف صاحبها
function stash(){
  const o=get(K.owner);if(!o)return;
  PER.forEach(k=>{const v=get(k);set(slot(o,k),v)});
}
// يحمّل ملف طالب إلى المفاتيح العاملة
function load(id){
  if(get(K.owner)===id)return;
  stash();
  PER.forEach(k=>set(k,get(slot(id,k))));
  set(K.owner,id);
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
const P={
  PER,AVATARS,list,
  find:id=>list().find(p=>p.id===id)||null,
  current(){const s=J(K.session,null);if(!s||s.pending)return null;const p=this.find(s.id);return p&&get(K.owner)===p.id?p:null},
  async create(name,avatar,pin){
    const a=list();const id='p'+(Date.now().toString(36))+(Math.random()*1e4|0).toString(36);
    const salt=newSalt();const p={id,name:name.trim().slice(0,24),avatar:AVATARS.includes(avatar)?avatar:'idle',pin:await hash(pin,salt),salt,created:Date.now()};
    a.push(p);saveList(a);
    stash();PER.forEach(k=>set(k,null));set(K.owner,id);// ملف جديد يبدأ بتقدّم فارغ
    set('bustan_student_name',p.name);
    set(K.session,JSON.stringify({id,t:Date.now()}));return p;
  },
  async setPin(id,pin){const a=list();const p=a.find(x=>x.id===id);if(!p)return false;p.salt=newSalt();p.pin=await hash(pin,p.salt);delete p.migrated;saveList(a);return true},
  async check(id,pin){const p=this.find(id);if(!p||!p.pin)return false;return (await hash(pin,p.salt))===p.pin},
  lockedFor(id){const f=J(K.fails,{})[id];if(!f||f.n<5)return 0;const left=f.t+30000-Date.now();return left>0?left:0},
  fail(id){const all=J(K.fails,{});const f=all[id]||{n:0,t:0};if(Date.now()-f.t>30000&&f.n>=5)f.n=0;f.n++;f.t=Date.now();all[id]=f;set(K.fails,JSON.stringify(all));return f.n},
  clearFails(id){const all=J(K.fails,{});delete all[id];set(K.fails,JSON.stringify(all))},
  login(id){load(id);this.clearFails(id);set(K.session,JSON.stringify({id,t:Date.now()}));const p=this.find(id);if(p&&!get('bustan_student_name'))set('bustan_student_name',p.name)},
  // خروج: نحفظ تقدّم الطالب في ملفه ونُبقي نسخة العمل له (لا شيء يضيع)، وننهي الجلسة فقط
  logout(){stash();set(K.session,null)},
  rename(id,name){const a=list();const p=a.find(x=>x.id===id);if(p){p.name=name.trim().slice(0,24);saveList(a)}},
  // رقم ولي الأمر (قفل خفيف أيضًا) يحمي الإعدادات ومسح التقدّم والاستيراد
  hasParent:()=>!!J('bustan_parent',null),
  async setParent(pin){const salt=newSalt();set('bustan_parent',JSON.stringify({salt,pin:await hash('parent:'+pin,salt)}))},
  async checkParent(pin){const p=J('bustan_parent',null);if(!p)return false;return (await hash('parent:'+pin,p.salt))===p.pin},
  // قراءة تقدّم كل الطلاب على هذا الجهاز (للتقرير)
  dataOf(id,k){k=k||'abboud_math_v1';const v=get(K.owner)===id?get(k):get(slot(id,k));try{return JSON.parse(v)}catch(e){return null}},
  // نسخة احتياطية لكل الطلاب (الأرقام السرية تبقى مُجزّأة)
  backup(){const ps=list();const data={};ps.forEach(p=>{data[p.id]={};PER.forEach(k=>{const v=get(K.owner)===p.id?get(k):get(slot(p.id,k));if(v!=null)data[p.id][k]=v})});return{app:'bustan-backup-v1',exported:new Date().toISOString(),profiles:ps,data}},
  restore(b){if(!b||b.app!=='bustan-backup-v1'||!Array.isArray(b.profiles))throw Error('bad');stash();const a=list();
    b.profiles.forEach(p=>{if(!p||!p.id||!/^p[\w]+$/.test(p.id))return;const i=a.findIndex(x=>x.id===p.id);const q={id:p.id,name:String(p.name||'').slice(0,24),avatar:AVATARS.includes(p.avatar)?p.avatar:'idle',pin:p.pin||null,salt:p.salt||null,created:p.created||Date.now()};if(!q.pin)q.migrated=true;if(i>=0)a[i]=q;else a.push(q);
      const d=(b.data||{})[p.id]||{};PER.forEach(k=>{if(typeof d[k]==='string'){set(slot(p.id,k),d[k]);if(get(K.owner)===p.id)set(k,d[k])}})});
    saveList(a);return a.length},
  avatarSrc:(a,base)=>(base||'')+'assets/img/av-'+(AVATARS.includes(a)?a:'idle')+'.webp'
};
migrate();
window.PROFILES=P;
})();
