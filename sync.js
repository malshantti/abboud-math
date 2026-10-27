/* مزامنة التقدّم مع حساب العائلة (اختيارية).
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
// الحساب إلزامي: صفحة اختيار الطالب تتحقق دائمًا من الحساب المرتبط بهذا الجهاز وتعرض أبناءه فقط.
if(web&&(new URLSearchParams(location.search).get('sync')==='1'||/\/login\.html$/.test(location.pathname)))set(K.on,'1');
const enabled=()=>get(K.on)==='1';
let csrf='',session=null,busy=null;

async function api(path,opt){
 opt=opt||{};const headers={'Accept':'application/json'};
 let ctl=null,timer=0;if(opt.timeout&&typeof AbortController==='function'){ctl=new AbortController();timer=setTimeout(()=>ctl.abort(),opt.timeout)}
 if(opt.body!==undefined){headers['Content-Type']='application/json';headers['X-CSRF-TOKEN']=csrf}
 const r=await fetch(API+path,{method:opt.method||(opt.body===undefined?'GET':'POST'),credentials:'same-origin',cache:'no-store',headers,body:opt.body===undefined?undefined:JSON.stringify(opt.body),keepalive:!!opt.keepalive,signal:ctl?ctl.signal:undefined}).finally(()=>timer&&clearTimeout(timer));
 if(r.status===401||r.status===419){session=null;let j=null;try{j=await r.json()}catch(e){}if(j&&j.revoked)kicked(j.message);throw Error('auth')}
 if(!r.ok)throw Error('http '+r.status);
 return r.json();
}

// ---- شريط الإعلان (للجميع) ----
// قواعد التعلّم من لوحة الإدارة («المواد والتحفيز»): مواد مخفية، وإظهار الشارات، ومضاعف النقاط. تُحفظ محليًا لتعمل دون اتصال.
function applyRules(r){
 if(!r||typeof r!=='object')return;window.BUSTAN_RULES=r;
 const html=document.documentElement;html.classList.toggle('bk-no-badges',r.badges===false);
 if(r.badges===false&&!document.getElementById('bk-rules-css')){const st=document.createElement('style');st.id='bk-rules-css';st.textContent='.bk-no-badges .badges,.bk-no-badges .ach,.bk-no-badges .bk-sec-h:has(+.ach),.bk-no-badges .bk-sec-h:has(+.badges),.bk-no-badges .ach-sec,.bk-no-badges [data-bk-badges]{display:none!important}';(document.head||html).append(st)}
 const m=location.pathname.match(/\/g(\d{1,2})\/([a-z][a-z0-9]{1,19})\//);
 if(m&&Array.isArray(r.hidden)&&r.hidden.includes('g'+m[1]+'-'+m[2])){const show=()=>{if(document.getElementById('bustan-hidden'))return;reveal();const app=document.querySelector('#app');if(app)app.inert=true;
  const d=document.createElement('div');d.id='bustan-hidden';d.setAttribute('role','alertdialog');d.setAttribute('aria-modal','true');
  d.style.cssText='position:fixed;inset:0;z-index:10001;background:#fbf8ef;display:grid;place-items:center;padding:20px;direction:rtl';
  d.innerHTML='<div style="max-width:460px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;padding:26px;text-align:center;font:17px/1.9 inherit;color:#29392b;box-shadow:0 5px 0 #e2e7d9"><h2 style="margin:0 0 6px;font-size:22px">هذه المادة غير متاحة حاليًا</h2><p style="margin:0 0 14px">أخفتها إدارة البستان مؤقتًا، وتقدّمك فيها محفوظ. اختر مادة أخرى من صفحة الدخول.</p><a href="'+new URL('./',root).href+'" style="display:inline-block;background:#6f9e23;color:#fff;border-radius:14px;padding:10px 22px;font-weight:800;text-decoration:none">العودة إلى المواد</a></div>';
  document.body.append(d)};document.body?show():addEventListener('DOMContentLoaded',show)}
 try{dispatchEvent(new CustomEvent('bustan-rules',{detail:r}))}catch(e){}
}
function rules(site){const r=site&&site.rules;if(!r||typeof r!=='object')return;const t=JSON.stringify(r);if(t!==get('bustan_rules'))set('bustan_rules',t);applyRules(r)}
// تُطبَّق النقاط عبر BK_XP في كل محرّك مادة: n × المضاعف (٠ يوقف النقاط الجديدة).
window.BK_XP=n=>{const r=window.BUSTAN_RULES,k=r&&typeof r.points==='number'&&r.points>=0&&r.points<=5?r.points:1;return Math.round((+n||0)*k)};
try{applyRules(JSON.parse(get('bustan_rules')||'null'))}catch(e){}
// مكتبة الوسائط: صور وأصوات استبدلتها الإدارة. الخريطة {الأصل: البديل} نسبيًا لجذر الموقع، وتُحفظ محليًا.
let MEDIA=null;const mediaFix=u=>{if(!MEDIA||!u||typeof u!=='string'||u.startsWith('data:')||u.startsWith('blob:'))return u;
 try{const a=new URL(u,location.href);if(a.origin!==root.origin||!a.pathname.startsWith(root.pathname))return u;const k=decodeURIComponent(a.pathname.slice(root.pathname.length));const v=MEDIA[k];return v?new URL(v,root).href:u}catch(e){return u}};
function mediaHooks(){if(window.__bkMedia)return;window.__bkMedia=1;
 const wrap=(P,prop)=>{const d=P&&Object.getOwnPropertyDescriptor(P,prop);if(!d||!d.set)return;Object.defineProperty(P,prop,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){d.set.call(this,mediaFix(v))}})};
 wrap(window.HTMLImageElement&&HTMLImageElement.prototype,'src');wrap(window.HTMLMediaElement&&HTMLMediaElement.prototype,'src');wrap(window.HTMLSourceElement&&HTMLSourceElement.prototype,'src');
 const sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){return sa.call(this,n,(n==='src'||n==='href'&&this.tagName==='image')&&/^(IMG|AUDIO|SOURCE|VIDEO|image)$/.test(this.tagName)?mediaFix(v):v)};
 if(window.Audio){const A=window.Audio;const W=function(u){return arguments.length?new A(mediaFix(u)):new A()};W.prototype=A.prototype;try{Object.setPrototypeOf(W,A)}catch(e){}window.Audio=W}
 if(window.fetch){const f=window.fetch;window.fetch=function(i,o){return f.call(this,typeof i==='string'?mediaFix(i):i,o)}}
 const fix=n=>{if(n.nodeType!==1)return;const l=n.matches&&n.matches('img[src],audio[src],source[src],video[src]')?[n]:[];if(n.querySelectorAll)l.push(...n.querySelectorAll('img[src],audio[src],source[src],video[src]'));
  for(const e of l){const s=e.getAttribute('src'),t=mediaFix(s);if(t!==s){e.src=t;if(e.tagName==='SOURCE'&&e.parentNode&&e.parentNode.load)e.parentNode.load()}}};
 const go=()=>{fix(document.documentElement);new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes')fix(m.target);else m.addedNodes.forEach(fix)}}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']})};
 document.documentElement?go():addEventListener('DOMContentLoaded',go)}
function applyMedia(m){if(!m||typeof m!=='object'||Array.isArray(m)||!Object.keys(m).length){MEDIA=null;return}MEDIA=m;mediaHooks()}
function media(site){if(!site||!('media' in site))return;const m=site.media&&typeof site.media==='object'?site.media:{};const t=JSON.stringify(m);if(t!==(get('bustan_media')||'{}'))set('bustan_media',Object.keys(m).length?t:null);applyMedia(m)}
try{applyMedia(JSON.parse(get('bustan_media')||'null'))}catch(e){}
function banner(site){
 rules(site);media(site);
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
 else{a.textContent='حساب العائلة: احفظ التقدّم على الخادم';a.href=new URL('admin-api/account/login',root).href;a.onclick=()=>set(K.on,'1')}
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
  d.querySelector('p').textContent=other?'يحدّد الأهل صف كل طالب من صفحة الحساب، ويتعلّم الطالب مواد صفه فقط.':'تقدّم طفلك محفوظ ولن يضيع. اشترك في هذه المادة لمتابعة الدروس، والدفع عبر واتساب.';
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
// صفحة مادة دون حساب مسجَّل: تحويل إلى دخول/تسجيل الأهل ثم العودة إلى الصفحة نفسها.
// من سجّل الدخول من قبل على هذا الجهاز (bustan_account) يتابع دون إنترنت أو مع اتصال ضعيف؛ لا نُقفل إلا حين يؤكد الخادم أن الجلسة انتهت.
const loginUrl=()=>new URL('admin-api/account/login',root).href+'?return='+encodeURIComponent(location.href);
// ---- جهاز واحد لكل حساب: آخر دخول يغلق الجلسة على الجهاز السابق ----
const KICK='bustan_kicked',KICK_ACK='bustan_kick_ack',KICK_MSG='تم تسجيل الدخول إلى هذا الحساب من جهاز آخر، لذلك أُغلقت الجلسة هنا.';
function kicked(msg){
 set(K.account,null);set(K.access,null);set(K.roster,null);set(KICK,'1');// التقدّم المحلي يبقى محفوظًا؛ يُفتح بعد الدخول من جديد
 // أغلق المستخدم الإشعار سابقًا: يتابع كزائر غير مسجَّل (الدروس تبقى مقفلة) دون إعادة إظهاره
 if(get(KICK_ACK)){set(KICK,null);if(subject){requireLogin();return}try{dispatchEvent(new CustomEvent('bustan-roster'))}catch(e){}return}
 const show=()=>{reveal();const app=document.querySelector('#app,#main');if(app)app.inert=true;if(document.getElementById('bustan-kicked'))return;
  const d=document.createElement('div');d.id='bustan-kicked';d.setAttribute('role','alertdialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','bustan-kicked-t');d.setAttribute('aria-describedby','bustan-kicked-p');
  d.style.cssText='position:fixed;inset:0;z-index:10003;background:#fbf8efee;display:grid;place-items:center;padding:20px;direction:rtl;font-family:Cairo,Tahoma,sans-serif';
  d.innerHTML='<div style="width:100%;max-width:440px;background:#fff;border:2px solid #e2e7d9;border-radius:24px;box-shadow:0 5px 0 #e2e7d9;padding:28px 22px;text-align:center;color:#29392b;position:relative" data-box><button type="button" data-x aria-label="إغلاق" style="position:absolute;top:8px;inset-inline-start:8px;width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:14px;background:#f2f5ec;color:#3e5729;font:700 26px/1 sans-serif;cursor:pointer">×</button><span style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:20px;background:#eaf1df;color:#4e6635;margin-bottom:10px"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M11 18.5h2"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg></span><h2 id="bustan-kicked-t" style="margin:0 0 8px;font:800 23px/1.45 Baloo,Cairo,sans-serif;color:#3e5729">أُغلقت الجلسة على هذا الجهاز</h2><p id="bustan-kicked-p" style="margin:0 0 20px;font-size:17px;line-height:1.9"></p><a style="display:flex;align-items:center;justify-content:center;min-height:52px;padding:10px 24px;border-radius:16px;background:#6c854c;color:#fff;font:800 18px/1.4 Baloo,Cairo,sans-serif;text-decoration:none;box-shadow:0 4px 0 #4e6635">تسجيل الدخول مرة أخرى</a><p style="margin:14px 0 0;font-size:14px;color:#7b8479;line-height:1.8">تقدّم الطلاب محفوظ. يبقى الحساب مفتوحًا على جهاز واحد في الوقت نفسه.</p></div>';
  d.querySelector('#bustan-kicked-p').textContent=msg||KICK_MSG;
  d.querySelector('a').href=entryPage?new URL('admin-api/account/login',root).href+'?return='+encodeURIComponent(new URL('login.html?sync=1',root).href):loginUrl();
  // إغلاق: الجهاز يعود زائرًا غير مسجَّل (نوقف وضع المزامنة) فتظهر الصفحة الرئيسية للزوّار، والدروس تبقى مقفلة
  const close=()=>{set(KICK,null);set(KICK_ACK,'1');set(K.on,null);removeEventListener('keydown',esc);d.remove();location.replace(new URL('./',root).href)};
  const esc=e=>{if(e.key==='Escape')close()};addEventListener('keydown',esc);
  d.querySelector('[data-x]').addEventListener('click',close);d.addEventListener('click',e=>{if(!e.target.closest('[data-box]'))close()});
  document.body.append(d);d.querySelector('a').focus()};
 document.body?show():addEventListener('DOMContentLoaded',show);
 try{dispatchEvent(new CustomEvent('bustan-roster'))}catch(e){}
}
// فحص دوري (كل دقيقة والصفحة مفتوحة، وعند العودة إليها): الجهاز الذي أُغلقت جلسته يُقفل عند أول اتصال.
let watching=false;
function watch(){if(watching)return;watching=true;
 const check=()=>{if(!navigator.onLine||document.visibilityState==='hidden'||document.getElementById('bustan-kicked'))return;
  api('session',{timeout:15000}).then(s=>{if(s.authenticated)return;if(s.revoked)kicked(s.message);else if(subject)requireLogin()}).catch(()=>{})};
 setInterval(check,60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});addEventListener('online',check)}
function reveal(){try{delete document.documentElement.dataset.gate}catch(e){}}
function requireLogin(){set(K.account,null);set(K.access,null);set(K.roster,null);location.replace(loginUrl())}
function offlineNotice(){
 const show=()=>{if(document.getElementById('bustan-signin'))return;reveal();const app=document.querySelector('#app');if(app)app.inert=true;
  const d=document.createElement('div');d.id='bustan-signin';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
  d.style.cssText='position:fixed;inset:0;z-index:10000;background:#fbf8ef;display:grid;place-items:center;padding:20px;direction:rtl';
  d.innerHTML='<div style="max-width:460px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;padding:26px;text-align:center;font:17px/1.9 inherit;color:#29392b"><h2 style="margin:0 0 8px;color:#3e5729">سجّل الدخول أولًا</h2><p style="margin:0 0 18px">يلزم الاتصال بالإنترنت مرة واحدة لتسجيل الدخول بحساب العائلة. بعدها تعمل الدروس على هذا الجهاز حتى دون إنترنت.</p><a style="display:inline-flex;align-items:center;min-height:48px;padding:10px 24px;border-radius:16px;background:#1f9d55;color:#fff;font-weight:700;text-decoration:none">تسجيل الدخول</a></div>';
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
function remember(s){set(KICK,null);set(KICK_ACK,null);set(K.account,JSON.stringify({email:s.user.email,name:s.user.name,t:Date.now()}));set(K.on,'1')}
async function lessonGate(){
 const had=J(K.account,null);
 if(had)reveal();// جهاز سبق تسجيل الدخول عليه: الدرس يفتح فورًا ونتحقق في الخلفية
 if(!navigator.onLine){if(!had)offlineNotice();else{const c=J(K.access,null);if(c){gate(c,{subscribe:new URL('admin-api/account/subscribe',root).href});trialBanner(c)}}return false}
 try{session=await api('session',{timeout:had?15000:10000})}
 catch(e){if(had){const c=J(K.access,null);if(c){gate(c,{subscribe:new URL('admin-api/account/subscribe',root).href});trialBanner(c)}}else offlineNotice();return false}// شبكة ضعيفة أو خطأ خادم: لا إقفال لمن سجّل سابقًا
 csrf=session.csrf||'';banner(session.site);
 if(maintenance(session.site))return false;
 if(!session.authenticated){if(session.revoked||get(KICK))kicked(session.message);else requireLogin();return false}
 remember(session);set(K.access,JSON.stringify(session.access));reveal();gate(session.access,session.urls);trialBanner(session.access);watch();return true;
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
  // لا يُنشأ طالب من الجهاز: يضيف الأهل أبناءه من صفحة الحساب. يُربط الملف المحلي فقط إن كان الخادم يعرفه.
  const s=session.students.find(x=>x.local_id===p.id);if(!s)continue;
  st.map[p.id]=s.id;st.base[p.id]={};
  const items={},now=Date.now();Object.entries(data).forEach(([k,v])=>{if(typeof v==='string')items[k]={value:v,updated:now}});
  let res;try{res=await api('students/'+s.id+'/import',{method:'POST',body:{items}})}catch(e){if(e.message==='auth')throw e;continue}// يُعاد في الجولة التالية
  Object.keys(items).forEach(k=>{if(res.items[k]&&res.items[k].value===items[k].value)st.base[p.id][k]=fnv(items[k].value)});
  save();
 }
 // ٢) قائمة الطلاب على هذا الجهاز تُستبدل بقائمة الخادم (لا دمج): كل طالب سجّله الأهل يصير له ملف هنا،
 //    وتُحذف الملفات المحلية التي لا ترتبط بطالب من الحساب (من حساب آخر أو من النسخة القديمة)، ولا يُحفظ تقدّمها إلا إن كانت مرتبطة بطالب.
 for(const [lid,sid] of Object.entries(st.map))if(!servers.has(sid)){delete st.map[lid];delete st.base[lid]}
 if(entryPage){
  const bySid=new Map(Object.entries(st.map).map(([l,s])=>[s,l]));
  for(const s of servers.values()){
   let id=bySid.get(s.id);const have=id&&P.find(id);
   const data={};
   if(!have){
    try{const r=await api('students/'+s.id+'/progress');Object.entries(r.items||{}).forEach(([k,v])=>{if(typeof v.value==='string')data[k]=v.value})}catch(e){if(e.message==='auth')throw e}// يُنشأ الملف حتى لو تعذّر سحب التقدّم؛ يُسحب في الجولة التالية
    id=s.local_id&&/^p\w+$/.test(s.local_id)&&!P.find(s.local_id)?s.local_id:'ps'+s.id;
   }
   if(s.grade)data.bustan_grade=String(s.grade);
   const cur=P.find(id)||{},pin=s.pin&&s.pin.hash?{pin:s.pin.hash,salt:s.pin.salt}:{pin:cur.pin||null,salt:cur.salt||null};// الرقم السري الذي حدّده الأهل هو المرجع
   if(!have||cur.name!==s.name||cur.pin!==pin.pin||(s.grade&&String(P.dataOf(id,'bustan_grade'))!==data.bustan_grade))
    await P.restore({app:'bustan-backup-v1',profiles:[{id,name:s.name,avatar:s.avatar||cur.avatar,created:cur.created,...pin}],data:{[id]:data}});
   if(!have){st.map[id]=s.id;st.base[id]={};Object.entries(data).forEach(([k,v])=>st.base[id][k]=fnv(v))}
   save();
  }
 }
 const roster=Object.entries(st.map).map(([local,sid])=>{const s=servers.get(sid);return {sid,local,name:s.name,grade:s.grade||null,grade_name:s.grade_name||null,subjects:Array.isArray(s.subjects)?s.subjects.map(x=>x.name):null}});
 set(K.roster,JSON.stringify({email:session.user.email,access:session.access,students:roster,pin_on:session.pin_required===true,t:Date.now()}));save();
 if(entryPage){const keep=new Set(Object.keys(st.map));for(const p of P.list())if(!keep.has(p.id))await P.remove(p.id)}
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
  if(session.authenticated){remember(session);set(K.access,JSON.stringify(session.access));gate(session.access,session.urls);watch()}
  else if(session.revoked||get(KICK)){kicked(session.message);badge();return}
  else{set(K.account,null);set(K.roster,null);set(K.access,null);try{dispatchEvent(new CustomEvent('bustan-roster'))}catch(e){}}// لا حساب مرتبط: صفحة الدخول تحوّل إلى تسجيل الدخول
 }catch(e){const cached=J(K.access,null);if(cached)gate(cached,{subscribe:new URL('admin-api/account/subscribe',root).href})}// دون إنترنت: آخر حالة معروفة
 badge();
 if(!session||!session.authenticated)return;
 await run();
 setInterval(run,20000);
 addEventListener('online',run);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')run()});
}
// رقم سري اختاره الطفل على هذا الجهاز: يُحفظ في الحساب ليعمل على أي جهاز (لا يستبدل رقمًا حدّده الأهل).
async function pushPin(localId){try{const P=window.PROFILES;if(!P)return false;const p=P.find(localId),st=P.accountStudent(localId);if(!p||!p.pin||!st||!st.sid||!/^sha256:/.test(p.pin))return false;
 if(!csrf){session=await api('session',{timeout:10000});csrf=session.csrf||''}
 const r=await api('students/'+st.sid+'/pin',{body:{salt:p.salt,hash:p.pin},timeout:10000});return !!(r&&r.saved)}catch(e){return false}}
window.BUSTAN_SYNC={run,enabled,daysText,pushPin,disable(){set(K.on,null);set(K.roster,null);set(K.state,null);set(K.access,null);set(K.account,null)}};
document.readyState==='loading'?addEventListener('DOMContentLoaded',start):start();
})();
