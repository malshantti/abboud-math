/* مزامنة التقدّم مع حساب ولي الأمر (اختيارية).
   - دون تفعيل: لا تفعل شيئًا سوى عرض شريط الإعلان العام إن وُجد. يبقى الحفظ محليًا كما هو تمامًا.
   - بعد التفعيل (زر «افتح الموقع وزامن هذا الجهاز» في صفحة الحساب، أو ?sync=1): عند أول دخول تُستورد ملفات الطلاب
     وتقدّمهم المحلي إلى الخادم، ثم يُرفع كل تغيير لاحق. دون إنترنت يبقى كل شيء محليًا ويُزامَن عند عودة الاتصال.
   - لا تغيّر مفاتيح profiles.js؛ تقرأ عبر PROFILES.backup() وتكتب عبر PROFILES.restore() فقط، وفي صفحات الدخول فقط. */
(function(){
'use strict';
if(window.BUSTAN_SYNC)return;
const LS=window.localStorage,me=document.currentScript,root=new URL('./',me&&me.src||location.href);
const API=window.BUSTAN_API||new URL('admin-api/api/',root).href;
const K={on:'bustan_sync',state:'bustan_sync_state',access:'bustan_sync_access',dismiss:'bustan_banner_dismissed'};
const get=k=>{try{return LS.getItem(k)}catch(e){return null}},set=(k,v)=>{try{v==null?LS.removeItem(k):LS.setItem(k,v)}catch(e){}};
const J=(k,d)=>{try{const v=JSON.parse(get(k));return v==null?d:v}catch(e){return d}};
const web=/^https?:$/.test(location.protocol);
const subjectMatch=location.pathname.match(/\/(g\d+)\/([a-z]+)\//),subject=subjectMatch?subjectMatch[1]+'-'+subjectMatch[2]:null;
const entryPage=!subject;// السحب من الخادم يجري في صفحات الدخول فقط، قبل أن يقرأ موقع المادة حالته.
const fnv=s=>{if(s==null)return'∅';let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return s.length+':'+h.toString(36)};
if(web&&new URLSearchParams(location.search).get('sync')==='1')set(K.on,'1');
const enabled=()=>get(K.on)==='1';
let csrf='',session=null,busy=null;

async function api(path,opt){
 opt=opt||{};const headers={'Accept':'application/json'};
 if(opt.body!==undefined){headers['Content-Type']='application/json';headers['X-CSRF-TOKEN']=csrf}
 const r=await fetch(API+path,{method:opt.method||(opt.body===undefined?'GET':'POST'),credentials:'same-origin',cache:'no-store',headers,body:opt.body===undefined?undefined:JSON.stringify(opt.body),keepalive:!!opt.keepalive});
 if(r.status===401||r.status===419){session=null;throw Error('auth')}
 if(!r.ok)throw Error('http '+r.status);
 return r.json();
}

// ---- شريط الإعلان (للجميع) ----
function banner(text){
 if(!text||get(K.dismiss)===fnv(text)||document.getElementById('bustan-banner'))return;
 const b=document.createElement('div');b.id='bustan-banner';b.setAttribute('role','note');
 b.style.cssText='position:relative;z-index:9998;background:#fff4d6;border-bottom:2px solid #f0d58a;color:#5a4000;padding:10px 56px 10px 16px;text-align:center;font:700 16px/1.7 inherit;direction:rtl';
 const t=document.createElement('span');t.textContent=text;b.append(t);
 const x=document.createElement('button');x.type='button';x.setAttribute('aria-label','إخفاء الإعلان');x.textContent='×';
 x.style.cssText='position:absolute;inset-inline-start:8px;top:50%;transform:translateY(-50%);min-width:44px;min-height:44px;border:0;background:none;font-size:24px;color:inherit;cursor:pointer';
 x.onclick=()=>{set(K.dismiss,fnv(text));b.remove()};b.append(x);
 document.body.prepend(b);
}

// ---- شارة الحساب في صفحة الدخول ----
function badge(){
 if(!entryPage||!/login\.html$|\/$/.test(location.pathname)||!document.querySelector('.login'))return;
 let a=document.getElementById('bustan-account');
 if(!a){a=document.createElement('a');a.id='bustan-account';a.style.cssText='position:fixed;z-index:9997;bottom:14px;inset-inline-start:14px;display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:999px;background:#fff;border:2px solid #e2e7d9;box-shadow:0 3px 0 #e2e7d9;color:#3e5729;font:700 15px/1.5 inherit;text-decoration:none';document.body.append(a)}
 if(session&&session.authenticated){a.textContent='متزامن مع حساب '+session.user.name;a.href=session.urls.account}
 else{a.textContent='حساب ولي الأمر: احفظ التقدّم على الخادم';a.href=new URL('admin-api/account/login',root).href;a.onclick=()=>set(K.on,'1')}
}

// ---- قفل المادة غير المشترك فيها ----
function gate(access,urls){
 if(!subject||!access||access.subjects==null||access.subjects.includes(subject))return;
 const show=()=>{if(document.getElementById('bustan-locked'))return;const app=document.querySelector('#app');if(app)app.inert=true;
  const d=document.createElement('div');d.id='bustan-locked';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','bustan-locked-t');
  d.style.cssText='position:fixed;inset:0;z-index:10000;background:#fbf8efee;display:grid;place-items:center;padding:20px;direction:rtl';
  d.innerHTML='<div style="max-width:460px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;box-shadow:0 4px 0 #e2e7d9;padding:26px;text-align:center;font:17px/1.9 inherit;color:#29392b"><h2 id="bustan-locked-t" style="margin:0 0 8px;color:#3e5729"></h2><p style="margin:0 0 18px"></p><a style="display:inline-flex;align-items:center;min-height:48px;padding:10px 24px;border-radius:16px;background:#1f9d55;color:#fff;font-weight:700;text-decoration:none;box-shadow:0 4px 0 #13693a"></a><p style="margin:16px 0 0"><a style="color:#3e5729"></a></p></div>';
  d.querySelector('h2').textContent=access.kind==='expired'?'انتهت الفترة التجريبية':'هذه المادة غير مشمولة باشتراكك';
  d.querySelector('p').textContent='تقدّم طفلك محفوظ ولن يضيع. اشترك في هذه المادة لمتابعة الدروس، والدفع عبر واتساب.';
  const [go,back]=d.querySelectorAll('a');go.textContent='صفحة الاشتراك';go.href=urls.subscribe;back.textContent='العودة إلى البداية';back.href=new URL('login.html',root).href;
  document.body.append(d);go.focus()};
 document.body?show():addEventListener('DOMContentLoaded',show);
}

// ---- المزامنة ----
function grade(data){let g=parseInt(data&&data.bustan_grade,10);if(!g)try{g=JSON.parse(data.bustan_last).grade}catch(e){}return [1,2,6,8].includes(g)?g:null}
async function sync(){
 if(!enabled()||!web||!window.PROFILES||!navigator.onLine)return;
 const P=window.PROFILES;await P.ready;
 if(!session||!session.authenticated)return;
 let st=J(K.state,{});if(st.user!==session.user.email)st={user:session.user.email,map:{},base:{}};// عائلة أخرى على الجهاز نفسه: ربط جديد
 const save=()=>set(K.state,JSON.stringify(st));
 const servers=new Map(session.students.map(s=>[s.id,s]));
 let backup=P.backup();const local=backup.profiles;
 // ١) كل ملف محلي غير مربوط يُنشأ له طالب على الخادم ويُستورد تقدّمه كاملًا (أول دخول: لا شيء يضيع).
 for(const p of local){
  if(st.map[p.id]&&servers.has(st.map[p.id]))continue;
  const data=backup.data[p.id]||{};
  const found=session.students.find(s=>s.local_id===p.id);
  const s=found||(await api('students',{body:{name:p.name||'طالب',local_id:p.id,avatar:p.avatar,grade:grade(data)}})).student;
  servers.set(s.id,s);st.map[p.id]=s.id;st.base[p.id]={};
  const items={},now=Date.now();Object.entries(data).forEach(([k,v])=>{if(typeof v==='string')items[k]={value:v,updated:now}});
  const res=await api('students/'+s.id+'/import',{method:'POST',body:{items}});
  Object.keys(items).forEach(k=>{if(res.items[k]&&res.items[k].value===items[k].value)st.base[p.id][k]=fnv(items[k].value)});
  save();
 }
 // ٢) طلاب أضافهم ولي الأمر على الخادم أو من جهاز آخر: ينشأ لهم ملف على هذا الجهاز (في صفحات الدخول فقط).
 const mapped=new Set(Object.values(st.map));
 if(entryPage)for(const s of servers.values()){
  if(mapped.has(s.id))continue;
  const r=await api('students/'+s.id+'/progress');
  let id=s.local_id&&/^p\w+$/.test(s.local_id)&&!P.find(s.local_id)?s.local_id:'ps'+s.id;
  const data={};Object.entries(r.items||{}).forEach(([k,v])=>{if(typeof v.value==='string')data[k]=v.value});
  if(!data.bustan_grade&&s.grade)data.bustan_grade=String(s.grade);
  await P.restore({app:'bustan-backup-v1',profiles:[{id,name:s.name,avatar:s.avatar}],data:{[id]:data}});
  st.map[id]=s.id;st.base[id]={};Object.entries(data).forEach(([k,v])=>st.base[id][k]=fnv(v));save();
 }
 // ٣) رفع ما تغيّر محليًا، وسحب ما تغيّر على الخادم (السحب في صفحات الدخول فقط).
 backup=P.backup();
 for(const [lid,sid] of Object.entries(st.map)){
  const p=P.find(lid);if(!p){delete st.map[lid];delete st.base[lid];save();continue}
  const data=backup.data[lid]||{},base=st.base[lid]||(st.base[lid]={}),items={},now=Date.now();
  Object.entries(data).forEach(([k,v])=>{if(typeof v==='string'&&base[k]!==fnv(v))items[k]={value:v,updated:now}});
  const res=Object.keys(items).length?await api('students/'+sid+'/progress',{method:'PUT',body:{items}}):(entryPage?await api('students/'+sid+'/progress'):null);
  if(!res)continue;
  const pull={};
  Object.entries(res.items||{}).forEach(([k,v])=>{if(typeof v.value!=='string')return;
   if(items[k]&&items[k].value===v.value){base[k]=fnv(v.value);return}
   if(entryPage&&data[k]!==v.value&&!items[k])pull[k]=v.value;});
  if(Object.keys(pull).length){await P.restore({app:'bustan-backup-v1',profiles:[p],data:{[lid]:pull}});Object.entries(pull).forEach(([k,v])=>base[k]=fnv(v))}
  save();
 }
}
function run(){if(busy)return busy;busy=sync().catch(e=>{if(window.console)console.warn('bustan sync:',e&&e.message)}).finally(()=>{busy=null});return busy}

async function start(){
 if(!web)return;
 if(!enabled()){try{const s=await (await fetch(API+'site',{credentials:'same-origin'})).json();banner(s.announcement)}catch(e){}badge();return}
 try{session=await api('session');csrf=session.csrf||'';banner(session.site&&session.site.announcement);
  if(session.authenticated){set(K.access,JSON.stringify(session.access));gate(session.access,session.urls)}
 }catch(e){const cached=J(K.access,null);if(cached)gate(cached,{subscribe:new URL('admin-api/account/subscribe',root).href})}// دون إنترنت: آخر حالة معروفة
 badge();
 if(!session||!session.authenticated)return;
 await run();
 setInterval(run,20000);
 addEventListener('online',run);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')run()});
}
window.BUSTAN_SYNC={run,enabled,disable(){set(K.on,null);set(K.state,null);set(K.access,null)}};
document.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
})();
