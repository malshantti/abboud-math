/* سجلّ رحلة العائلات (funnel_events): أحداث صغيرة تُرسل دون انتظار (sendBeacon) ولا توقف الموقع أبدًا.
   - معرّف زائر عشوائي في localStorage (وفي كوكي bk_vid ليربطه الخادم بالحساب عند التسجيل). لا أسماء ولا بريد ولا إجابات.
   - مصدر الزيارة (utm/fbclid/المُحيل) لمعرفة القادمين من إعلان فيسبوك.
   - كل شيء داخل try/catch، ويعمل بعد تحميل الصفحة. */
(function(){
'use strict';
try{
if(window.BUSTAN_TRACK||!/^https?:$/.test(location.protocol)||navigator.webdriver)return;
var LS=null;try{LS=window.localStorage}catch(e){}
var g=function(k){try{return LS?LS.getItem(k):null}catch(e){return null}},s=function(k,v){try{LS&&LS.setItem(k,v)}catch(e){}};
var me=document.currentScript,root;try{root=new URL('./',me&&me.src||location.href)}catch(e){return}
var API=new URL('admin-api/api/t',root).href,path=location.pathname;
if(/\/admin-api\/(admin|login)/.test(path))return;// لوحة الإدارة ليست رحلة عائلة
function rid(){var a='';try{var b=new Uint8Array(12);crypto.getRandomValues(b);for(var i=0;i<b.length;i++)a+=('0'+b[i].toString(16)).slice(-2)}catch(e){a=(Date.now().toString(36)+Math.random().toString(36).slice(2)).slice(0,24)}return 'v'+a}
var vid=g('bk_vid');if(!vid||!/^[A-Za-z0-9_-]{8,40}$/.test(vid)){vid=rid();s('bk_vid',vid)}
function ck(n,v){try{document.cookie=n+'='+v+';path=/;max-age=34560000;SameSite=Lax'+(location.protocol==='https:'?';Secure':'')}catch(e){}}
if(document.cookie.indexOf('bk_vid='+vid)<0)ck('bk_vid',vid);
// المصدر: أحدث رابط إعلان، وإلا أول مصدر معروف.
var q;try{q=new URLSearchParams(location.search)}catch(e){q={get:function(){return null}}}
var cur={};['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){var v=q.get(k);if(v)cur[k]=String(v).slice(0,80)});
if(q.get('fbclid'))cur.fbclid=1;
var ref='';try{if(document.referrer){var rh=new URL(document.referrer).hostname;if(rh&&rh!==location.hostname)ref=rh}}catch(e){}
if(ref)cur.ref=ref;
var ft=null;try{ft=JSON.parse(g('bk_src')||'null')}catch(e){}
var fresh=Object.keys(cur).length>0;
if(fresh&&(cur.fbclid||cur.utm_source||!ft)){ft=cur;s('bk_src',JSON.stringify(cur))}
function code(o){if(!o)return 'direct';var u=((o.utm_source||'')+' '+(o.utm_medium||'')).toLowerCase(),r=(o.ref||'').toLowerCase();
 if(o.fbclid||/\b(fb|facebook|ig|instagram|meta|messenger)\b/.test(u)||/(facebook|instagram|fb)\.(com|me)/.test(r)||/FBAN|FBAV|FB_IAB|Instagram/.test(navigator.userAgent))return 'fb';
 if(/google/.test(u)||/google\./.test(r))return 'google';return(u.trim()||r)?'other':'direct'}
var C=code(ft);ck('bk_src',C);
var last={};
function send(e,x){try{x=x||{};var k=e+'|'+(x.p||'')+'|'+(x.s||'');var now=Date.now();if(e!=='answers'&&last[k]&&now-last[k]<3000)return;last[k]=now;
 var b={e:e,v:vid,c:C};for(var i in x)b[i]=x[i];var j=JSON.stringify(b);
 if(navigator.sendBeacon&&navigator.sendBeacon(API,new Blob([j],{type:'text/plain'})))return;
 if(window.fetch)fetch(API,{method:'POST',body:j,keepalive:true,credentials:'same-origin',headers:{'Content-Type':'text/plain'}}).catch(function(){});
}catch(e){}}
window.BUSTAN_TRACK={send:send,vid:vid};
function once(k){var f='bk_once_'+k;try{if(sessionStorage.getItem(f))return false;sessionStorage.setItem(f,1)}catch(e){}return true}
function idle(fn){var run=function(){try{fn()}catch(e){}};if(window.requestIdleCallback)requestIdleCallback(run,{timeout:3000});else setTimeout(run,600)}
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){idle(fn)});else idle(fn)}
ready(function(){
 var inapp=/FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger/.test(navigator.userAgent);
 if(inapp&&once('inapp'))send('inapp',{m:{app:/Instagram/.test(navigator.userAgent)?'instagram':'facebook'}});
 // الصفحة الرئيسية
 if(/^\/(index\.html)?$/.test(path)){
  var v={p:'landing'};if(fresh||!g('bk_seen')){v.src=fresh?cur:(ft||{});s('bk_seen','1')}
  send('visit',v);
  var pr=document.querySelector('[data-price-group]');pr=pr&&(pr.closest('section')||pr);
  if(pr&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){io.disconnect();send('pricing_view',{p:'pricing'})}})},{threshold:.25});io.observe(pr)}
  document.addEventListener('click',function(ev){try{var a=ev.target.closest&&ev.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';
   if(/account\/register/.test(h))send('cta_click',{p:'landing',m:{to:'register'}});else if(/account\/login|login\.html/.test(h))send('cta_click',{p:'landing',m:{to:'login'}});else if(/wa\.me|whatsapp/.test(h))send('wa_click',{p:'landing',m:{where:'landing'}})}catch(e){}},true);
  return;
 }
 if(/\/login\.html$/.test(path)){send('page_view',{p:'login_site'});return}
 var m=path.match(/\/(g\d+)\/([a-z]+)\//);
 if(m){lesson(m[1]+'-'+m[2]);return}
 var a=path.match(/\/admin-api\/account(?:\/([a-z-]+))?/);if(!a)return;
 var pg=a[1]||'account';
 if(pg==='register'){
  send('register_view',{p:'register'});
  var f=document.querySelector('form[action*="account/register"]');
  if(f){var st=function(){f.removeEventListener('focusin',st,true);if(once('regstart'))send('register_start',{p:'register',m:{method:'email'}})};f.addEventListener('focusin',st,true)}
  document.addEventListener('click',function(ev){try{var b=ev.target.closest&&ev.target.closest('a[href*="account/google"]');if(b)send('register_start',{p:'register',m:{method:'google'}})}catch(e){}},true);
 }else if(pg==='login'){send('page_view',{p:'login'})}
 else if(pg==='forgot-password'){send('page_view',{p:'forgot'})}
 else if(pg==='subscribe'){
  var sf=document.getElementById('subf');
  if(sf){var t=0,sel=function(){clearTimeout(t);t=setTimeout(function(){var bs=[].slice.call(sf.querySelectorAll('input[name="plans[]"]:checked'));if(bs.length)send('subjects_selected',{p:'subscribe',n:bs.length,m:{plans:bs.map(function(b){return b.value}).join(',').slice(0,60)}})},1500)};
   sf.addEventListener('change',function(ev){if(ev.target&&ev.target.type==='checkbox')sel()});
   sf.addEventListener('submit',function(){var n=sf.querySelectorAll('input[name="plans[]"]:checked').length;if(n)send('wa_click',{p:'subscribe',n:n,m:{where:'form'}})})}
  document.addEventListener('click',function(ev){try{var b=ev.target.closest&&ev.target.closest('a.wa[href]');if(b)send('wa_click',{p:'subscribe',m:{where:'pending'}})}catch(e){}},true);
 }else if(pg==='account'){send('page_view',{p:'account'})}
});
// صفحات المواد: أول فتح لكل مادة، وعدد الإجابات (فرق العدّاد في سجلّ التقرير، مرة في الدقيقة على الأكثر).
function lesson(subj){
 var lo={};try{lo=JSON.parse(g('bk_lo')||'{}')||{}}catch(e){}
 if(!lo[subj]){lo[subj]=Date.now();s('bk_lo',JSON.stringify(lo));send('lesson_open',{p:'lesson',s:subj,m:{first:1}})}
 else if(once('lo_'+subj))send('lesson_open',{p:'lesson',s:subj});
 var cnt=function(){try{var d=JSON.parse(g('bustan_report_v1')||'null');var x=d&&d.subj&&d.subj[subj];return x?(+x.n||0):0}catch(e){return 0}};
 var an={};try{an=JSON.parse(g('bk_an')||'{}')||{}}catch(e){}
 if(an[subj]==null||an[subj]>cnt()){an[subj]=cnt();s('bk_an',JSON.stringify(an))}
 var lastT=0;
 function flush(force){try{var n=cnt(),d=n-(an[subj]||0);if(d<0){an[subj]=n;s('bk_an',JSON.stringify(an));return}
  if(d>0&&(force||Date.now()-lastT>60000)){lastT=Date.now();an[subj]=n;s('bk_an',JSON.stringify(an));send('answers',{p:'lesson',s:subj,n:d})}}catch(e){}}
 setInterval(function(){flush(false)},60000);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush(true)});
 addEventListener('pagehide',function(){flush(true)});
}
}catch(e){}
})();
