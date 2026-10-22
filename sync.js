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
const K={roster:'bustan_roster',account:'bustan_account',on:'bustan_sync',state:'bustan_sync_state',access:'bustan_sync_access',dismiss:'bustan_banner_dismissed',trialDismiss:'bustan_trial_dismissed'};
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
 let ctl=null,timer=0;if(opt.timeout&&typeof AbortController==='function'){ctl=new AbortController();timer=setTimeout(()=>ctl.abort(),opt.timeout)}
 if(opt.body!==undefined){headers['Content-Type']='application/json';headers['X-CSRF-TOKEN']=csrf}
 const r=await fetch(API+path,{method:opt.method||(opt.body===undefined?'GET':'POST'),credentials:'same-origin',cache:'no-store',headers,body:opt.body===undefined?undefined:JSON.stringify(opt.body),keepalive:!!opt.keepalive,signal:ctl?ctl.signal:undefined}).finally(()=>timer&&clearTimeout(timer));
 if(r.status===401||r.status===419){session=null;throw Error('auth')}
 if(!r.ok)throw Error('http '+r.status);
 return r.json();
}

// ---- شريط الإعلان (للجميع) ----
function banner(site){
 const text=site&&site.announcement;
 if(!text||get(K.dismiss)===fnv(text)||document.getElementById('bustan-banner'))return;
 const c=site.announcement_color||{},col=v=>/^#[0-9a-f]{3,8}$/i.test(v||'')?v:null;
 const b=document.createElement('div');b.id='bustan-banner';b.setAttribute('role','note');
 b.style.cssText='position:relative;z-index:9998;background:'+(col(c.bg)||'#fff4d6')+';border-bottom:2px solid '+(col(c.line)||'#f0d58a')+';color:'+(col(c.ink)||'#5a4000')+';padding:10px 56px 10px 16px;text-align:center;font:700 16px/1.7 inherit;direction:rtl';
 const t=document.createElement('span');t.textContent=text;b.append(t);
 if(/^https?:\/\//i.test(site.announcement_link||'')){const a=document.createElement('a');a.href=site.announcement_link;a.rel='noopener';a.textContent='التفاصيل';a.style.cssText='color:inherit;font-weight:800;margin-inline-start:8px;text-decoration:underline';b.append(' ',a)}
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
 if(!subject||!access)return;
 const P=window.PROFILES,me=P&&P.current&&P.current(),[gc,sc]=subject.split('-'),g=+gc.slice(1);
 const ent=me&&P.roster&&P.roster()?P.entitlement(me.id,g,sc):(access.subjects==null?(access.allowed===false?'locked':'ok'):access.subjects.includes(subject)?'ok':'locked');
 if(ent==='ok')return;
 const show=()=>{if(document.getElementById('bustan-locked'))return;const app=document.querySelector('#app');if(app)app.inert=true;
  const d=document.createElement('div');d.id='bustan-locked';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','bustan-locked-t');
  d.style.cssText='position:fixed;inset:0;z-index:10000;background:#fbf8efee;display:grid;place-items:center;padding:20px;direction:rtl';
  d.innerHTML='<div style="max-width:460px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;box-shadow:0 4px 0 #e2e7d9;padding:26px;text-align:center;font:17px/1.9 inherit;color:#29392b"><h2 id="bustan-locked-t" style="margin:0 0 8px;color:#3e5729"></h2><p style="margin:0 0 18px"></p><a style="display:inline-flex;align-items:center;min-height:48px;padding:10px 24px;border-radius:16px;background:#1f9d55;color:#fff;font-weight:700;text-decoration:none;box-shadow:0 4px 0 #13693a"></a><p style="margin:16px 0 0"><a style="color:#3e5729"></a></p></div>';
  const other=ent==='grade'||ent==='none';
  d.querySelector('h2').textContent=other?(ent==='grade'?'هذه المادة ليست من صف الطالب':'هذا الملف ليس من أبناء الحساب'):access.kind==='expired'?'انتهت الفترة التجريبية':'هذه المادة غير مشمولة باشتراكك';
  d.querySelector('p').textContent=other?'يحدّد ولي الأمر صف كل طالب من صفحة الحساب، ويتعلّم الطالب مواد صفه فقط.':'تقدّم طفلك محفوظ ولن يضيع. اشترك في هذه المادة لمتابعة الدروس، والدفع عبر واتساب.';
  const [go,back]=d.querySelectorAll('a');go.textContent=other?'إدارة الأبناء':'اشترك';go.href=other?new URL('admin-api/account',root).href:urls.subscribe;back.textContent='العودة إلى البداية';back.href=new URL('login.html',root).href;
  document.body.append(d);go.focus()};
 document.body?show():addEventListener('DOMContentLoaded',show);
}

// ---- شريط الفترة التجريبية (صفحات الدروس فقط) ----
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
function daysText(n){if(n===1)return 'يوم واحد';if(n===2)return 'يومان';const m=n%100;return AR(n)+(m>=3&&m<=10?' أيام':m<=2?' يوم':' يومًا')}
function trialDays(a){if(!a||a.kind!=='trial')return 0;const t=Date.parse(a.ends_at);if(isFinite(t)){const ms=t-Date.now();return ms>0?Math.max(1,Math.ceil(ms/864e5)):0}return a.days_left>0?a.days_left:0}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function trialBanner(access){
 const n=trialDays(access),old=document.getElementById('bustan-trial');if(old&&!n)old.remove();
 if(!subject||!n||get(K.trialDismiss)===today())return;
 const show=()=>{let b=document.getElementById('bustan-trial');if(!b){b=document.createElement('div');b.id='bustan-trial';b.setAttribute('role','note');
  b.style.cssText='position:relative;z-index:9998;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;background:#eef7e4;border-bottom:2px solid #cfe3b8;color:#3e5729;padding:8px 52px 8px 12px;font:700 15px/1.6 inherit;direction:rtl';
  b.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="flex:none"><path d="M12 21c0-6 0-9 0-11" stroke="#1f9d55" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M12 12C12 7 8.5 4.5 4 5c0 5 3.5 7.5 8 7zM12 10c0-4 3-6.5 8-6.5 0 4.5-3 7-8 6.5z" fill="#58cc02"/></svg><span></span><a style="display:inline-flex;align-items:center;min-height:36px;padding:4px 16px;border-radius:12px;background:#1f9d55;color:#fff;text-decoration:none;box-shadow:0 3px 0 #13693a">اشترك</a><button type="button" aria-label="إخفاء اليوم" style="position:absolute;inset-inline-start:6px;top:50%;transform:translateY(-50%);width:44px;height:44px;border:0;background:none;color:inherit;cursor:pointer;display:grid;place-items:center"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>';
  b.querySelector('a').href=new URL('admin-api/account/subscribe',root).href;
  b.querySelector('button').onclick=()=>{set(K.trialDismiss,today());b.remove()};document.body.prepend(b)}
  b.querySelector('span').textContent='تجربة مجانية: باقٍ لك '+daysText(n)};
 document.body?show():addEventListener('DOMContentLoaded',show);
}

// ---- الدخول إلزامي قبل أي درس ----
// صفحة مادة دون حساب مسجَّل: تحويل إلى دخول/تسجيل ولي الأمر ثم العودة إلى الصفحة نفسها.
// من سجّل الدخول من قبل على هذا الجهاز (bustan_account) يتابع دون إنترنت أو مع اتصال ضعيف؛ لا نُقفل إلا حين يؤكد الخادم أن الجلسة انتهت.
const loginUrl=()=>new URL('admin-api/account/login',root).href+'?return='+encodeURIComponent(location.href);
function reveal(){try{delete document.documentElement.dataset.gate}catch(e){}}
function requireLogin(){set(K.account,null);set(K.access,null);set(K.roster,null);location.replace(loginUrl())}
function offlineNotice(){
 const show=()=>{if(document.getElementById('bustan-signin'))return;reveal();const app=document.querySelector('#app');if(app)app.inert=true;
  const d=document.createElement('div');d.id='bustan-signin';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
  d.style.cssText='position:fixed;inset:0;z-index:10000;background:#fbf8ef;display:grid;place-items:center;padding:20px;direction:rtl';
  d.innerHTML='<div style="max-width:460px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;padding:26px;text-align:center;font:17px/1.9 inherit;color:#29392b"><h2 style="margin:0 0 8px;color:#3e5729">سجّل الدخول أولًا</h2><p style="margin:0 0 18px">يلزم الاتصال بالإنترنت مرة واحدة لتسجيل الدخول بحساب ولي الأمر. بعدها تعمل الدروس على هذا الجهاز حتى دون إنترنت.</p><a style="display:inline-flex;align-items:center;min-height:48px;padding:10px 24px;border-radius:16px;background:#1f9d55;color:#fff;font-weight:700;text-decoration:none">تسجيل الدخول</a></div>';
  d.querySelector('a').href=loginUrl();document.body.append(d)};
 document.body?show():addEventListener('DOMContentLoaded',show);
 addEventListener('online',()=>location.reload(),{once:true});
}
// وضع الصيانة من لوحة الإدارة: يُعرض بدل الصفحة لغير المشرفين (الخادم لا يرسله للمشرفين).
function maintenance(site){
 const m=site&&site.maintenance;if(!m)return false;
 const show=()=>{if(document.getElementById('bustan-maint'))return;reveal();const app=document.querySelector('#app');if(app)app.inert=true;
  const d=document.createElement('div');d.id='bustan-maint';d.setAttribute('role','alertdialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','bustan-maint-t');
  d.style.cssText='position:fixed;inset:0;z-index:10001;background:#fbf8ef;display:grid;place-items:center;padding:20px;direction:rtl';
  d.innerHTML='<div style="max-width:480px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;padding:26px;text-align:center;font:17px/1.9 inherit;color:#29392b;box-shadow:0 5px 0 #e2e7d9"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6f9e23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 005 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 01-5-5l2.5 2.5 2-2z"/><path d="M3 21l6-6"/></svg><h2 id="bustan-maint-t" style="margin:6px 0 8px;color:#3e5729">البستان في صيانة مؤقتة</h2><p style="margin:0;white-space:pre-line"></p></div>';
  d.querySelector('p').textContent=m.message||'';document.body.append(d)};
 document.body?show():addEventListener('DOMContentLoaded',show);return true}
function remember(s){set(K.account,JSON.stringify({email:s.user.email,name:s.user.name,t:Date.now()}));set(K.on,'1')}
async function lessonGate(){
 const had=J(K.account,null);
 if(had)reveal();// جهاز سبق تسجيل الدخول عليه: الدرس يفتح فورًا ونتحقق في الخلفية
 if(!navigator.onLine){if(!had)offlineNotice();else{const c=J(K.access,null);if(c){gate(c,{subscribe:new URL('admin-api/account/subscribe',root).href});trialBanner(c)}}return false}
 try{session=await api('session',{timeout:had?15000:10000})}
 catch(e){if(had){const c=J(K.access,null);if(c){gate(c,{subscribe:new URL('admin-api/account/subscribe',root).href});trialBanner(c)}}else offlineNotice();return false}// شبكة ضعيفة أو خطأ خادم: لا إقفال لمن سجّل سابقًا
 csrf=session.csrf||'';banner(session.site);
 if(maintenance(session.site))return false;
 if(!session.authenticated){requireLogin();return false}
 remember(session);set(K.access,JSON.stringify(session.access));reveal();gate(session.access,session.urls);trialBanner(session.access);return true;
}

// ---- المزامنة ----
async function sync(){
 if(!enabled()||!web||!window.PROFILES||!navigator.onLine)return;
 const P=window.PROFILES;await P.ready;
 if(!session||!session.authenticated)return;
 let st=J(K.state,{});if(st.user!==session.user.email)st={user:session.user.email,map:{},base:{}};// عائلة أخرى على الجهاز نفسه: ربط جديد
 const save=()=>set(K.state,JSON.stringify(st));
 const servers=new Map(session.students.map(s=>[s.id,s]));
 let backup=P.backup();const local=backup.profiles;
 // ١) ملف محلي يعرفه الخادم (local_id) يُربط بطالبه ويُستورد تقدّمه. الملفات الأخرى لا تُرفع.
 for(const p of local){
  if(st.map[p.id]&&servers.has(st.map[p.id]))continue;
  const data=backup.data[p.id]||{};
  // لا يُنشأ طالب من الجهاز: يضيف ولي الأمر أبناءه من صفحة الحساب. يُربط الملف المحلي فقط إن كان الخادم يعرفه.
  const s=session.students.find(x=>x.local_id===p.id);if(!s)continue;
  st.map[p.id]=s.id;st.base[p.id]={};
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
 // ٢ب) قائمة أبناء الحساب، وإزالة الملفات المحلية التي لا تخصّه، وتثبيت صف كل طالب كما حدّده ولي الأمر.
 for(const [lid,sid] of Object.entries(st.map))if(!servers.has(sid)){delete st.map[lid];delete st.base[lid]}
 const roster=Object.entries(st.map).map(([local,sid])=>{const s=servers.get(sid);return {sid,local,name:s.name,grade:s.grade||null}});
 set(K.roster,JSON.stringify({email:session.user.email,access:session.access,students:roster}));save();
 if(entryPage){const keep=new Set(Object.keys(st.map));for(const p of P.list())if(!keep.has(p.id))await P.remove(p.id);
  for(const r of roster){const p=P.find(r.local);if(p&&r.grade&&P.dataOf(r.local,'bustan_grade')!==r.grade)await P.restore({app:'bustan-backup-v1',profiles:[p],data:{[r.local]:{bustan_grade:String(r.grade)}}})}}
 try{if(typeof CustomEvent==='function')dispatchEvent(new CustomEvent('bustan-roster'))}catch(e){}
 // ٣) رفع ما تغيّر محليًا، وسحب ما تغيّر على الخادم (السحب في صفحات الدخول فقط).
 backup=P.backup();
 for(const [lid,sid] of Object.entries(st.map)){
  const p=P.find(lid);if(!p){delete st.map[lid];delete st.base[lid];save();continue}
  const data=backup.data[lid]||{},base=st.base[lid]||(st.base[lid]={}),items={},now=Date.now();
  Object.entries(data).forEach(([k,v])=>{if(k!=='bustan_grade'&&typeof v==='string'&&base[k]!==fnv(v))items[k]={value:v,updated:now}});
  const res=Object.keys(items).length?await api('students/'+sid+'/progress',{method:'PUT',body:{items}}):(entryPage?await api('students/'+sid+'/progress'):null);
  if(!res)continue;
  const pull={};(res.rejected||[]).forEach(k=>{if(items[k])base[k]=fnv(items[k].value)});// رفضه الخادم (صف آخر أو مادة غير مشمولة): لا يُعاد إرساله، ويبقى محليًا
  Object.entries(res.items||{}).forEach(([k,v])=>{if(typeof v.value!=='string'||k==='bustan_grade')return;
   if(items[k]&&items[k].value===v.value){base[k]=fnv(v.value);return}
   if(entryPage&&data[k]!==v.value&&!items[k])pull[k]=v.value;});
  if(Object.keys(pull).length){await P.restore({app:'bustan-backup-v1',profiles:[p],data:{[lid]:pull}});Object.entries(pull).forEach(([k,v])=>base[k]=fnv(v))}
  save();
 }
}
function run(){if(busy)return busy;busy=sync().catch(e=>{if(window.console)console.warn('bustan sync:',e&&e.message)}).finally(()=>{busy=null});return busy}

async function start(){
 if(!web)return;
 if(subject){if(!await lessonGate())return;badge();await run();setInterval(run,20000);addEventListener('online',run);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')run()});return}
 if(!enabled()){try{const s=await (await fetch(API+'site',{credentials:'same-origin'})).json();banner(s);maintenance(s)}catch(e){}badge();return}
 try{session=await api('session');csrf=session.csrf||'';banner(session.site);if(maintenance(session.site)){badge();return}
  if(session.authenticated){remember(session);set(K.access,JSON.stringify(session.access));gate(session.access,session.urls)}else set(K.account,null)
 }catch(e){const cached=J(K.access,null);if(cached)gate(cached,{subscribe:new URL('admin-api/account/subscribe',root).href})}// دون إنترنت: آخر حالة معروفة
 badge();
 if(!session||!session.authenticated)return;
 await run();
 setInterval(run,20000);
 addEventListener('online',run);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')run()});
}
window.BUSTAN_SYNC={run,enabled,daysText,disable(){set(K.on,null);set(K.roster,null);set(K.state,null);set(K.access,null);set(K.account,null)}};
document.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
})();
