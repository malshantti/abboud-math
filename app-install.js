/* تثبيت بستان كتطبيق + التذكير اليومي بالإشعارات.
   - يظهر الاقتراح فقط بعد أن ينهي الطفل أول نشاط (يوجد تقدّم محفوظ للطالب الحالي)، ولا يظهر أبدًا عند فتح بستان مثبّتًا.
   - أندرويد/كروم: زر «تثبيت» عبر beforeinstallprompt. iOS Safari: شرح «مشاركة ← إضافة إلى الشاشة الرئيسية».
   - متصفحات فيسبوك/إنستغرام الداخلية: لا اقتراح تثبيت، بل زر الفتح في المتصفح.
   - × يخفيه ٧ أيام. طلب إذن الإشعارات بعد التثبيت أو بعد درس فقط، باقتراح لطيف أولًا. */
(function(){
'use strict';
if(window.BUSTAN_INSTALL||!/^https?:$/.test(location.protocol))return;
const LS=window.localStorage,ua=navigator.userAgent||'',me=document.currentScript,root=new URL('./',me&&me.src||location.href);
const API=new URL('admin-api/api/',root).href,DAY=864e5,WEEK=7*DAY;
const get=k=>{try{return LS.getItem(k)}catch(e){return null}},set=(k,v)=>{try{LS.setItem(k,v)}catch(e){}};
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1),android=/Android/i.test(ua);
const inApp=/FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram|Messenger|MessengerForiOS|musical_ly|TikTok|BytedanceWebview|Snapchat|Line\//i.test(ua)||(android&&/; wv\)/.test(ua))||(ios&&!/Safari\//.test(ua)&&!/CriOS|FxiOS|EdgiOS/.test(ua));
const snoozed=k=>{const t=+get(k)||0;return t&&Date.now()-t<WEEK};
let deferred=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;window.dispatchEvent(new Event('bk-installable'))});
addEventListener('appinstalled',()=>{set('bustan_installed',String(Date.now()));close('bk-install');setTimeout(()=>offerPush(true),1500)});

// هل أنهى الطالب الحالي نشاطًا واحدًا على الأقل؟
function didActivity(){
 try{const P=window.PROFILES;if(!P)return false;const cur=P.current&&P.current();if(!cur)return false;
  const data=(P.backup().data||{})[cur.id]||{};
  return Object.keys(data).some(k=>/^(abboud_math_v1|bustan_g\d+_[a-z]+_v1)$/.test(k)&&String(data[k]||'').length>20)}catch(e){return false}
}

function css(){if(document.getElementById('bk-install-css'))return;const s=document.createElement('style');s.id='bk-install-css';s.textContent=`
.bk-sheet{position:fixed;inset:auto 12px calc(12px + env(safe-area-inset-bottom)) 12px;z-index:2147483000;max-width:460px;margin:0 auto;background:#fff;border-radius:22px;box-shadow:0 18px 50px rgba(40,60,20,.28);padding:16px 16px 14px;direction:rtl;font-family:inherit;color:#2d3a1f;animation:bkUp .35s ease both;border:2px solid #e6efd6}
@keyframes bkUp{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.bk-sheet .bk-row{display:flex;gap:12px;align-items:center}.bk-sheet img.bk-z{width:64px;height:64px;flex:none;object-fit:contain}
.bk-sheet h3{margin:0 0 4px;font-size:17px;line-height:1.5}.bk-sheet p{margin:0;font-size:14px;line-height:1.7;color:#4c5a3b}
.bk-sheet .bk-x{position:absolute;top:8px;left:8px;width:36px;height:36px;border:0;border-radius:50%;background:#f1f5ea;color:#4c5a3b;font-size:20px;line-height:1;cursor:pointer}
.bk-sheet .bk-btns{display:flex;gap:8px;margin-top:12px}.bk-sheet .bk-btn{flex:1;min-height:48px;border-radius:14px;border:0;font:inherit;font-size:16px;font-weight:700;cursor:pointer;background:#647b43;color:#fff}
.bk-sheet .bk-btn.ghost{background:#f1f5ea;color:#4c5a3b}
.bk-steps{margin:10px 0 0;padding:10px 12px;background:#f8faf3;border-radius:14px;font-size:14px;line-height:2}.bk-steps b{color:#2d3a1f}
.bk-ico{display:inline-flex;vertical-align:middle;width:26px;height:26px;border-radius:7px;background:#e8f0fe;color:#1a73e8;align-items:center;justify-content:center;margin:0 4px}
.bk-ico svg{width:17px;height:17px}`;document.head.append(s)}
function close(id,snoozeKey){const el=document.getElementById(id);if(el)el.remove();if(snoozeKey)set(snoozeKey,String(Date.now()))}
const zay=new URL('assets/img/zaytoun-welcome.webp',root).href;
const share='<span class="bk-ico" aria-label="مشاركة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg></span>';
const plus='<span class="bk-ico" aria-label="إضافة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg></span>';
function sheet(id,html,snoozeKey){css();close(id);const d=document.createElement('div');d.className='bk-sheet';d.id=id;d.setAttribute('role','dialog');d.setAttribute('aria-live','polite');
 d.innerHTML='<button class="bk-x" type="button" aria-label="إغلاق">×</button>'+html;d.querySelector('.bk-x').onclick=()=>close(id,snoozeKey);document.body.append(d);return d}

// ---- افتح في المتصفح (للمتصفحات الداخلية) ----
function openInBrowser(){
 const url=new URL(location.href);url.searchParams.delete('fbclid');const href=url.href,hp=href.replace(/^https?:\/\//,'');
 if(android){location.href='intent://'+hp+'#Intent;scheme=https;package=com.android.chrome;end';setTimeout(()=>{if(!document.hidden)location.href='intent://'+hp+'#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end'},1200)}
 else if(ios){location.href='x-safari-'+href;setTimeout(()=>{if(!document.hidden)iosOverlay(href)},1200)}
}
function iosOverlay(href){const d=sheet('bk-inapp-help','<div class="bk-row"><img class="bk-z" src="'+zay+'" alt=""><div><h3>افتح بستان في Safari</h3><p>اضغط <b>⋯</b> في أعلى الشاشة ثم «فتح في Safari»، لتثبّته على شاشتك.</p></div></div><div class="bk-btns"><button class="bk-btn ghost" type="button" data-copy>نسخ الرابط</button></div>');
 d.querySelector('[data-copy]').onclick=e=>{(navigator.clipboard?navigator.clipboard.writeText(href):Promise.reject()).then(()=>{e.target.textContent='نُسخ الرابط ✓'}).catch(()=>{prompt('انسخ الرابط:',href)})}}
function inAppCard(){sheet('bk-install','<div class="bk-row"><img class="bk-z" src="'+zay+'" alt=""><div><h3>ثبّت بستان على شاشتك</h3><p>افتح بستان في المتصفح لتثبّته وتفتحه بضغطة زي أي تطبيق.</p></div></div><div class="bk-btns"><button class="bk-btn" type="button" data-open>افتح بالمتصفح</button></div>','bustan_install_dismissed').querySelector('[data-open]').onclick=openInBrowser}

// ---- اقتراح التثبيت ----
function installCard(){
 if(ios){sheet('bk-install','<div class="bk-row"><img class="bk-z" src="'+zay+'" alt=""><div><h3>ثبّت بستان على شاشتك وافتحه بضغطة زي أي تطبيق</h3></div></div><div class="bk-steps">١. اضغط زر المشاركة '+share+' أسفل الشاشة<br>٢. اختر <b>«إضافة إلى الشاشة الرئيسية»</b> '+plus+'<br>٣. اضغط <b>«إضافة»</b></div>','bustan_install_dismissed');return true}
 if(!deferred)return false;
 const d=sheet('bk-install','<div class="bk-row"><img class="bk-z" src="'+zay+'" alt=""><div><h3>ثبّت بستان على شاشتك وافتحه بضغطة زي أي تطبيق</h3><p>بلا متجر تطبيقات، ويأخذ مساحة صغيرة.</p></div></div><div class="bk-btns"><button class="bk-btn" type="button" data-install>تثبيت</button><button class="bk-btn ghost" type="button" data-later>لاحقًا</button></div>','bustan_install_dismissed');
 d.querySelector('[data-later]').onclick=()=>close('bk-install','bustan_install_dismissed');
 d.querySelector('[data-install]').onclick=async()=>{const e=deferred;deferred=null;if(!e)return close('bk-install');e.prompt();let c=null;try{c=await e.userChoice}catch(x){}close('bk-install',c&&c.outcome==='accepted'?null:'bustan_install_dismissed')};
 return true}

// ---- الإشعارات ----
const pushCapable=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const b64u=s=>{const p='='.repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,c=>c.charCodeAt(0))};
async function api(path,body){const opt={credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}};
 if(body){const s=await fetch(API+'session',opt).then(r=>r.json());opt.method='POST';opt.headers['Content-Type']='application/json';opt.headers['X-CSRF-TOKEN']=s.csrf||'';opt.body=JSON.stringify(body);if(!s.authenticated)throw Error('auth')}
 const r=await fetch(API+path,opt);if(!r.ok)throw Error('http '+r.status);return r.json()}
async function subscribe(){
 const cfg=await api('push/key');if(!cfg.enabled||!cfg.key)throw Error('off');
 const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(cfg.key)});
 const j=sub.toJSON();await api('push/subscribe',{endpoint:j.endpoint,keys:j.keys,platform:ios?'ios':android?'android':'desktop'});set('bustan_push_on','1');return sub}
window.BUSTAN_PUSH={subscribe};
async function offerPush(afterInstall){
 if(!pushCapable()||inApp||Notification.permission==='denied'||document.getElementById('bk-install'))return;
 if(Notification.permission==='granted'){if(get('bustan_push_on')!=='1')subscribe().catch(()=>{});return}
 if(snoozed('bustan_push_dismissed'))return;
 let cfg;try{cfg=await api('push/key')}catch(e){return}if(!cfg.enabled||cfg.reminders===null)return;// يلزم حساب مسجَّل
 const d=sheet('bk-push','<div class="bk-row"><img class="bk-z" src="'+zay+'" alt=""><div><h3>'+(afterInstall?'تمّ! بستان على شاشتك 🌱':'نذكّرك بدرس اليوم؟')+'</h3><p>إشعار واحد عصر كل يوم: «درسك اليوم جاهز في بستان 🌱». لا يصل إن درس طفلك قبله.</p></div></div><div class="bk-btns"><button class="bk-btn" type="button" data-yes>نعم، ذكّرني</button><button class="bk-btn ghost" type="button" data-no>لاحقًا</button></div>','bustan_push_dismissed');
 d.querySelector('[data-no]').onclick=()=>close('bk-push','bustan_push_dismissed');
 d.querySelector('[data-yes]').onclick=async()=>{let p='default';try{p=await Notification.requestPermission()}catch(e){}
  if(p!=='granted'){close('bk-push','bustan_push_dismissed');return}
  try{await subscribe();d.innerHTML='<div class="bk-row"><img class="bk-z" src="'+zay+'" alt=""><div><h3>سنذكّرك كل يوم 🌱</h3><p>يمكنك إيقاف التذكير من صفحة حسابك متى شئت.</p></div></div>';setTimeout(()=>close('bk-push'),3500)}catch(e){close('bk-push','bustan_push_dismissed')}}
}

function run(){
 if(standalone()){offerPush(!!get('bustan_installed'));return}// مثبّت: لا اقتراح تثبيت أبدًا
 if(!didActivity())return;// لا شيء قبل أول نشاط، ولا طلب إذن عند أول زيارة
 if(snoozed('bustan_install_dismissed')){offerPush(false);return}
 if(inApp){inAppCard();return}
 if(installCard())return;
 // كروم قد يرسل beforeinstallprompt متأخرًا
 let shown=false;addEventListener('bk-installable',()=>{if(!shown&&!document.getElementById('bk-push')){shown=installCard()}},{once:true});
 setTimeout(()=>{if(!shown&&!document.getElementById('bk-install'))offerPush(false)},4000);
}
window.BUSTAN_INSTALL={run,didActivity,installCard,offerPush};
// صفحة اختيار المادة تحمّل profiles.js لاحقًا: ننتظرها قليلًا ثم نقرّر مرة واحدة.
const start=()=>{let n=0;const t=setInterval(async()=>{n++;const ready=document.documentElement.dataset.entry==='student'&&window.PROFILES;
 if(ready||n>20||standalone()){clearInterval(t);try{if(window.PROFILES&&window.PROFILES.ready)await window.PROFILES.ready}catch(e){}run()}},600)};
document.readyState==='complete'?start():addEventListener('load',start);
})();
