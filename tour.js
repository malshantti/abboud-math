/* شرح الموقع: جولة قصيرة خطوة بخطوة لأول زيارة (صفحة الحساب، الاشتراك، اختيار الطفل، الصفحة الرئيسية للطفل، وصفحة الدرس).
   تُحفظ لكل حساب في localStorage، ويعيدها زر «شرح الموقع». أحداث tour_shown / tour_completed / tour_skipped في سجلّ الرحلة. */
(function(){
'use strict';
try{
if(window.BUSTAN_TOUR)return;
var path=location.pathname,me=document.currentScript;
var LS=null;try{LS=window.localStorage}catch(e){}
var g=function(k){try{return LS?LS.getItem(k):null}catch(e){return null}},s=function(k,v){try{LS&&LS.setItem(k,v)}catch(e){}};
function J(k){try{return JSON.parse(g(k)||'null')}catch(e){return null}}
// الحساب: البريد من صفحة الحساب (data-acct) أو من قائمة الطلاب المتزامنة على الجهاز.
var roster=J('bustan_roster');
var acct=(me&&me.dataset&&me.dataset.acct)||(roster&&roster.email)||'';
function h(x){var n=5381;for(var i=0;i<x.length;i++)n=((n<<5)+n+x.charCodeAt(i))>>>0;return n.toString(36)}
var KEY='bk_tour1_'+(acct?h(String(acct).toLowerCase()):'guest');
var st=J(KEY)||{seen:{}};if(!st.seen)st.seen={};
function save(){s(KEY,JSON.stringify(st))}
function q(sel){if(!sel)return null;var l=[].concat(sel);for(var i=0;i<l.length;i++){var x=l[i];var el=null;
  if(x.charAt(0)==='~'){var t=x.slice(1);el=[].slice.call(document.querySelectorAll('a,button,[role=tab],h2,h3')).filter(function(e){return e.offsetParent&&e.textContent.indexOf(t)>=0})[0]||null}
  else{try{el=[].slice.call(document.querySelectorAll(x)).filter(function(e){return e.offsetParent!==null||getComputedStyle(e).position==='fixed'})[0]||null}catch(e){}}
  if(el)return el}return null}
// ---------- المناطق والخطوات ----------
var area=null,page='other';
if(/\/admin-api\/account\/?$/.test(path)){area='account';page='account'}
else if(/\/admin-api\/account\/subscribe\/?$/.test(path)){area='subscribe';page='subscribe'}
else if(/\/login\.html$/.test(path)){area='picker';page='login_site'}
else if(/\/g\d+\/[a-z]+\//.test(path)){area='lesson';page='lesson'}
else if(/^\/(index\.html)?$/.test(path)){area='home';page='home'}
if(!area)return;
var STEPS={
 account:[
  {el:'[data-tour=add-child]',t:'أضف طفلك',b:'اكتب اسم طفلك واختر صفّه، ثم اضغط «إضافة». يمكنك إضافة كل أبنائك في الحساب نفسه.'},
  {el:'[data-tour=kids]',t:'أبناؤك',b:'هنا تجد أبناءك. يمكنك تعديل الاسم أو الصف متى شئت.'},
  {el:'[data-tour=start]',t:'ابدأ التعلّم',b:'اضغط هنا لفتح الدروس. يضغط طفلك على اسمه ويبدأ فورًا.'},
  {el:'[data-tour=report]',t:'تقرير التقدّم',b:'تابع ما تعلّمه طفلك، واعرف أين يحتاج إلى قليل من المساعدة.'},
  {el:'[data-tour=subscribe]',t:'الاشتراك والمواد',b:'بعد الأيام المجانية اختر مواد صف طفلك، وأرسل الطلب عبر واتساب. نفعّلها فور تأكيد الدفع.'},
  {el:'[data-tour=settings]',t:'الإعدادات',b:'فعّل التذكير اليومي ليصل طفلك إشعار لطيف بدرس اليوم. وتجد تفعيل البريد والأجهزة أسفل الصفحة.'},
  {el:'[data-tour=contact]',t:'تواصل معنا',b:'عندك سؤال؟ راسلنا عبر واتساب ويسعدنا أن نساعدك. ويمكنك إعادة هذا الشرح من زر «شرح الموقع».'}],
 subscribe:[
  {el:'[data-tour=sub-child]',t:'اختر طفلك',b:'اختر الطفل الذي تريد له الاشتراك، فتظهر مواد صفّه فقط.'},
  {el:'[data-tour=sub-plans]',t:'اختر المواد',b:'ضع علامة على المادة أو المواد التي يحتاجها طفلك. المواد المفعّلة من قبل لا تُطلب مرة ثانية.'},
  {el:'[data-tour=sub-send]',t:'أرسل الطلب عبر واتساب',b:'اضغط الزر مرة واحدة، فيُفتح واتساب برسالة جاهزة. بعد تأكيد الدفع نفعّل المواد ويصلك بريد بذلك.'},
  {el:'#pending',t:'طلباتك',b:'هنا تجد طلباتك التي تنتظر الدفع، فلا داعي لإرسالها مرة أخرى.'}],
 picker:[
  {el:'.profiles',t:'اختر طفلك',b:'يضغط طفلك على اسمه، فيدخل مباشرة إلى دروس صفّه.'},
  {el:'.manage',t:'إدارة الأبناء',b:'لإضافة طفل أو تعديل صفّه، افتح صفحة الحساب من هنا.'}],
 home:[
  {el:'#grades',t:'الصف',b:'هنا صفّ طفلك. اضغط عليه لترى المواد.'},
  {el:'#subjects',t:'المواد والدروس',b:'اختر مادة، فتظهر دروسها مرتبة خطوة بخطوة، وزيتون يرافق طفلك فيها.'},
  {el:'#userbar',t:'حساب الطالب',b:'من هنا يغيّر طفلك الملف أو يعود إلى قائمة الأبناء.'}],
 lesson:[
  {el:['nav','aside','.units','#units','.lessons'],t:'المواد والدروس',b:'هذه دروس المادة. ابدأ من أول درس، وكل درس قصير وممتع.'},
  {el:['~مختبر','~المختبر'],t:'المختبرات',b:'في المختبر يجرّب طفلك بيده ويلعب ليفهم أكثر.',opt:1},
  {el:['~تقرير','~إنجاز','~تقدّم'],t:'التقدّم',b:'هنا يرى طفلك ما أنجزه، والنجوم التي جمعها.',opt:1},
  {el:['[aria-label="خيارات الطالب"]','#theme','[aria-label*="الوضع"]'],t:'الإعدادات',b:'من هنا يغيّر طفلك الملف أو الوضع الليلي، أو يخرج.',opt:1}]
};
// الطفل في الصفحة الرئيسية/الدرس: فقط بعد ربط الجهاز بحساب. صفحة الهبوط للزوار لا تُعرض فيها جولة.
function ready(){
 if(area==='home'){var gr=document.getElementById('grades');return !!(gr&&gr.offsetParent&&roster)}
 if(area==='lesson'||area==='picker')return !!roster;
 return true}
// ---------- الواجهة ----------
var css='.bt-ov{position:fixed;inset:0;z-index:2147483000;pointer-events:none}.bt-ov.on{pointer-events:auto}'+
'.bt-hole{position:fixed;border-radius:18px;box-shadow:0 0 0 4px #ffd34d,0 0 0 9999px rgba(20,30,15,.62);transition:all .25s;pointer-events:none}'+
'.bt-card{position:fixed;z-index:2147483001;width:min(420px,calc(100vw - 24px));background:#fff;color:#24331c;border-radius:22px;padding:18px 18px 14px;box-shadow:0 12px 40px rgba(0,0,0,.3);font-family:Cairo,Baloo,system-ui,sans-serif;direction:rtl;text-align:right;line-height:1.75}'+
'.bt-card h3{margin:0 0 6px;font:800 22px/1.4 Baloo,Cairo,sans-serif;color:#2f5d1e}.bt-card p{margin:0;font-size:18px}'+
'.bt-n{font-size:14px;color:#6b7565;margin-bottom:4px}.bt-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}'+
'.bt-row button{min-height:48px;padding:8px 18px;border-radius:14px;border:2px solid #cfe3a8;background:#fff;color:#2f5d1e;font:800 17px Cairo,sans-serif;cursor:pointer}'+
'.bt-row .bt-next{background:#5a9e2f;border-color:#5a9e2f;color:#fff;flex:1}.bt-row .bt-skip{border-color:transparent;text-decoration:underline;color:#6b7565}'+
'.bt-off{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:16px;color:#4a5544;cursor:pointer}.bt-off input{width:22px;height:22px;margin:0}'+
'.bt-fab{position:fixed;z-index:2147482000;bottom:14px;left:14px;min-height:44px;padding:8px 14px;border-radius:999px;border:2px solid #cfe3a8;background:#fff;color:#2f5d1e;font:800 15px Cairo,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.15);cursor:pointer}'+
'.linkbtn{background:none;border:0;padding:0;color:inherit;font:inherit;text-decoration:underline;cursor:pointer;color:#2f6f9e}'+
'@media (max-width:600px){.bt-card{left:12px!important;right:12px!important;top:auto!important;bottom:12px!important;width:auto}.bt-card p{font-size:18px}.bt-fab{bottom:10px;left:10px}}'+
'@media (prefers-reduced-motion:reduce){.bt-hole{transition:none}}';
function track(e,x){try{x=x||{};x.p=page;x.m={area:area,step:x.step};delete x.step;
 if(window.BUSTAN_TRACK&&BUSTAN_TRACK.send){BUSTAN_TRACK.send(e,x);return}
 if(navigator.webdriver)return;var vid=g('bk_vid');if(!vid)return;
 var b=JSON.stringify({e:e,v:vid,p:x.p,m:x.m});var api=new URL('/admin-api/api/t',location.href).href;
 if(navigator.sendBeacon)navigator.sendBeacon(api,new Blob([b],{type:'text/plain'}))}catch(e){}}
var ov,hole,card,steps=[],i=0,lastFocus=null;
function build(){if(ov)return;var st_=document.createElement('style');st_.textContent=css;document.head.appendChild(st_);
 ov=document.createElement('div');ov.className='bt-ov';ov.innerHTML='<div class="bt-hole"></div>';hole=ov.firstChild;
 card=document.createElement('div');card.className='bt-card';card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','bt-t');card.hidden=true}
function place(el){
 if(el){el.scrollIntoView({block:'center',behavior:'auto'});var r=el.getBoundingClientRect(),p=8;
  hole.style.display='';hole.style.top=(r.top-p)+'px';hole.style.left=(r.left-p)+'px';hole.style.width=(r.width+2*p)+'px';hole.style.height=Math.min(r.height+2*p,innerHeight-20)+'px';
  var ch=card.offsetHeight||220,below=r.bottom+16,top=below+ch<innerHeight?below:Math.max(12,r.top-ch-16);
  card.style.top=top+'px';card.style.bottom='auto';var left=Math.min(Math.max(12,r.left+r.width/2-card.offsetWidth/2),innerWidth-card.offsetWidth-12);card.style.left=left+'px';card.style.right='auto'}
 else{hole.style.display='none';ov.style.background='rgba(20,30,15,.62)';card.style.top=Math.max(12,(innerHeight-(card.offsetHeight||220))/2)+'px';card.style.left=Math.max(12,(innerWidth-card.offsetWidth)/2)+'px'}
 if(el)ov.style.background=''}
function render(){var x=steps[i],el=q(x.el),last=i===steps.length-1;
 card.innerHTML='<div class="bt-n">الخطوة '+ar(i+1)+' من '+ar(steps.length)+'</div><h3 id="bt-t">'+x.t+'</h3><p>'+x.b+'</p>'+
  '<div class="bt-row"><button type="button" class="bt-next">'+(last?'تمّ، شكرًا':'التالي')+'</button>'+(i>0?'<button type="button" class="bt-back">السابق</button>':'')+(last?'':'<button type="button" class="bt-skip">تخطّي</button>')+'</div>'+
  '<label class="bt-off"><input type="checkbox" class="bt-dont"'+(st.off?' checked':'')+'> لا تُظهر الشرح مرة أخرى</label>';
 card.hidden=false;place(el);
 card.querySelector('.bt-next').onclick=function(){if(last)end('tour_completed');else{i++;render()}};
 var b=card.querySelector('.bt-back');if(b)b.onclick=function(){i--;render()};
 var sk=card.querySelector('.bt-skip');if(sk)sk.onclick=function(){end('tour_skipped')};
 card.querySelector('.bt-dont').onchange=function(e){st.off=e.target.checked?1:0;save()};
 card.querySelector('.bt-next').focus({preventScroll:true})}
function ar(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})}
function key(e){if(!card||card.hidden)return;if(e.key==='Escape')end('tour_skipped');else if(e.key==='Tab'){var f=[].slice.call(card.querySelectorAll('button,input'));if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}}
function onResize(){if(card&&!card.hidden)place(q(steps[i].el))}
function end(ev){st.seen[area]=1;save();track(ev,{step:i+1});card.hidden=true;ov.classList.remove('on');ov.remove();card.remove();
 removeEventListener('keydown',key,true);removeEventListener('resize',onResize);if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
function start(manual){build();
 steps=STEPS[area].filter(function(x){return q(x.el)||!x.opt});
 // خطوات لا يوجد عنصرها (مثل «أبناؤك» قبل إضافة طفل) تُعرض في الوسط فقط إن لم تكن اختيارية؛ في صفحة الحساب نُسقطها.
 if(area==='account'||area==='subscribe'||area==='picker'||area==='home')steps=steps.filter(function(x){return q(x.el)});
 if(!steps.length)return false;
 i=0;lastFocus=document.activeElement;document.body.appendChild(ov);document.body.appendChild(card);ov.classList.add('on');
 addEventListener('keydown',key,true);addEventListener('resize',onResize);
 render();track('tour_shown',{step:manual?'replay':'auto'});return true}
function fab(){if(document.querySelector('.bt-fab'))return;build();if(!document.querySelector('style[data-bt]')){}
 var b=document.createElement('button');b.type='button';b.className='bt-fab';b.textContent='شرح الموقع';b.setAttribute('aria-label','شرح الموقع: جولة قصيرة');
 b.onclick=function(){start(true)};document.body.appendChild(b)}
window.BUSTAN_TOUR={start:function(){return start(true)},reset:function(){st={seen:{}};save()}};
function boot(){
 document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-tour-replay]');if(t){e.preventDefault();start(true)}});
 var tries=0;(function wait(){if(!ready()){if(++tries<20)setTimeout(wait,500);return}
  build();if(!document.head.querySelector('style.bt-css')){}
  if(area!=='account')fab();
  if(!st.off&&!st.seen[area])setTimeout(function(){if(!st.seen[area])start(false)},area==='lesson'?1500:600)})()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
}catch(e){}
})();
