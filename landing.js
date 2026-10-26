/* تفاعلات صفحة الزائر: عيّنات من الدروس الحقيقية. كل شيء في الذاكرة فقط؛ لا يُكتب أي شيء في localStorage (عدا تفضيل كتم الجولة الصوتية أدناه). */
(function(){
'use strict';
var root=document.getElementById('visitor-home');if(!root)return;
var splash=document.getElementById('L-splash');
function hideSplash(){if(splash)splash.classList.add('is-done')}
if(document.readyState==='complete')hideSplash();else{addEventListener('load',hideSplash,{once:true});setTimeout(hideSplash,1200)}
var top=document.getElementById('L-top'),sticky=root.querySelector('.L-sticky'),hero=root.querySelector('.L-hero-copy .L-cta');
function onScroll(){var y=scrollY;if(top)top.classList.toggle('is-stuck',y>8);if(sticky&&hero){var r=hero.getBoundingClientRect();sticky.classList.toggle('is-on',r.bottom<0&&(innerHeight+y)<document.documentElement.scrollHeight-260)}}
addEventListener('scroll',onScroll,{passive:true});onScroll();
var cheer=root.querySelector('.L-cheer');
function celebrate(){if(!cheer)return;cheer.classList.remove('is-on');void cheer.offsetWidth;cheer.classList.add('is-on')}
var audio=null;
function play(src,btn){try{if(audio)audio.pause();audio=new Audio(src);if(btn){btn.classList.add('is-playing');audio.onended=audio.onerror=function(){btn.classList.remove('is-playing')}}var p=audio.play();if(p&&p.catch)p.catch(function(){if(btn)btn.classList.remove('is-playing')})}catch(e){}}
root.querySelectorAll('.L-say').forEach(function(b){b.addEventListener('click',function(){play(b.dataset.audio,b)})});
var demo=root.querySelector('[data-demo-group]'),RM=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var AR=function(n){return String(n).replace(/\d/g,function(d){return'٠١٢٣٤٥٦٧٨٩'[d]})};
// أصوات خفيفة تشبه نقرة الإصبع والتصفيق (لا آلات موسيقية)، تُولَّد من ضجيج قصير
var actx=null;
function tap(t,f,g,d){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();var c=actx,n=c.sampleRate*d|0,buf=c.createBuffer(1,n,c.sampleRate),a=buf.getChannelData(0);for(var i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,4);var s=c.createBufferSource(),bp=c.createBiquadFilter(),v=c.createGain();s.buffer=buf;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=1.2;v.gain.value=g;s.connect(bp);bp.connect(v);v.connect(c.destination);s.start(c.currentTime+t)}catch(e){}}
function sfx(k){if(k==='ok'){tap(0,1400,.5,.09);tap(.13,1500,.55,.09);tap(.26,1300,.6,.12)}else if(k==='no')tap(0,320,.5,.12);else tap(0,2200,.25,.04)}
function burst(x,y){if(RM.matches||!demo)return;var cols=['#ffc83d','#6f9e23','#2e9fd8','#f08a3c','#8b6cc9','#e5534b'];
 for(var i=0;i<22;i++){var s=document.createElement('i'),a=Math.PI*2*i/22+Math.random()*.4,d=60+Math.random()*70;s.className='L-spark'+(i%3?'':' is-star');s.style.left=x+'px';s.style.top=y+'px';s.style.background=cols[i%6];s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',(Math.sin(a)*d-30)+'px');s.style.setProperty('--r',(Math.random()*540-270)+'deg');demo.appendChild(s);setTimeout(s.remove.bind(s),1100)}}
function rel(el){var b=demo.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-b.left+r.width/2,y:r.top-b.top+r.height/2,w:r.width,h:r.height}}
var PRAISE=['أحسنت!','ممتاز!','رائع!','إجابة صحيحة!'],pi=0;
function praise(){if(!cheer)return;var b=cheer.querySelector('.L-bubble');if(b)b.textContent=PRAISE[pi++%PRAISE.length];celebrate()}
// أسئلة إضافية حقيقية من الدروس نفسها؛ السؤال الأول هو المكتوب في الصفحة
function balls(a,b){var h='';for(var i=0;i<a;i++)h+='<span class="L-ball"></span>';h+='<b>+</b>';for(i=0;i<b;i++)h+='<span class="L-ball L-ball-new"></span>';return'<div class="L-balls" data-visual aria-hidden="true">'+h+'<b>=</b><span class="L-slot" data-slot>؟</span></div>'}
function letter(c,f){return'<div class="L-letter" data-visual aria-hidden="true"><span>'+c+'</span><small>'+f+'</small></div>'}
var MORE={
 math:[{h:'عدد الكرات ٣. أضفت ٢. كم أصبح عددها؟',a:'assets/landing/demo-math-2.mp3',v:balls(3,2),o:[['٤'],['٦'],['٥',1]],ok:'أحسنت! عندما نضمّ ٢ إلى ٣ نحصل على ٥.',no:'عُدّ الكرات الصفراء ثم أكمل العدّ على الكرات الزرقاء.'},
       {h:'عدد الكرات ١. أضفت ٣. كم أصبح عددها؟',a:'assets/landing/demo-math-3.mp3',v:balls(1,3),o:[['٤',1],['٣'],['٥']],ok:'ممتاز! عندما نضمّ ٣ إلى ١ نحصل على ٤.',no:'ابدأ من ١ وعُدّ ثلاث خطوات إلى الأمام.'}],
 ar:[{m:'درس «حرف الباء»',h:'أيّ كلمة تبدأ بحرف الباء؟',a:'assets/landing/demo-ar-2.mp3',v:letter('ب','ب · بـ · ـب'),o:[['زَيْتُونٌ'],['<b>بَ</b>ابٌ',1],['مَوْزٌ']],ok:'أحسنت! «بَابٌ» تبدأ بالباء وتنتهي بالباء أيضًا.',no:'انطق الكلمة ببطء، واستمع إلى أول صوت فيها.'},
     {m:'درس «حرف الميم»',h:'أيّ كلمة تبدأ بحرف الميم؟',a:'assets/landing/demo-ar-3.mp3',v:letter('م','م · مـ · ـم'),o:[['بَابٌ'],['زَيْتُونٌ'],['<b>مَ</b>وْزٌ',1]],ok:'رائع! «مَوْزٌ» تبدأ بحرف الميم.',no:'ابحث عن الكلمة التي يبدأ نطقها بصوت «مَـ».'}],
 en:[{w:'egg',a:'assets/landing/en-egg.mp3',k:'بيضة',ok:'أحسنت! كلمة egg تعني «بيضة».',no:'ليست هذه. اضغط زر الصوت واستمع مرة أخرى.'},
     {w:'bread',a:'assets/landing/en-bread.mp3',k:'خبز',ok:'أحسنت! كلمة bread تعني «خبز».',no:'ليست هذه. اضغط زر الصوت واستمع مرة أخرى.'}],
 sc:[{h:'عدسة عينية تكبيرها ١٠× وعدسة شيئية تكبيرها ١٠×. ما مقدار التكبير؟',a:'assets/landing/demo-sc-2.mp3',o:[['٢٠×'],['١٠٠×',1],['١٠×']],ok:'صحيح! نضرب ١٠ في ١٠ فيكون الناتج ١٠٠، أي أن مقدار التكبير ١٠٠ مرة.',no:'نضرب تكبير العينية في تكبير الشيئية.'},
     {h:'عدسة عينية تكبيرها ٥× وعدسة شيئية تكبيرها ٤٠×. ما مقدار التكبير؟',a:'assets/landing/demo-sc-3.mp3',o:[['٢٠٠×',1],['٤٥×'],['٤٠×']],ok:'صحيح! نضرب ٥ في ٤٠ فيكون الناتج ٢٠٠، أي أن مقدار التكبير ٢٠٠ مرة.',no:'تذكّر: التكبير الكلي هو حاصل ضرب تكبير العينية في تكبير الشيئية.'}]
};
root.querySelectorAll('[data-quiz]').forEach(function(panel){
 var fb=panel.querySelector('.L-fb'),box=panel.querySelector('.L-opts'),next=panel.querySelector('[data-next]'),count=panel.querySelector('[data-count]'),h3=panel.querySelector('h3'),meta=panel.querySelector('.L-q-meta span:last-child');
 var set=MORE[panel.dataset.qset]||[],first={h:h3.innerHTML,v:(panel.querySelector('[data-visual]')||{}).outerHTML,o:box.innerHTML,ok:fb.dataset.okText,no:fb.dataset.noText,m:meta&&meta.textContent},qs=[first].concat(set),qi=0,done=false,slot;
 var pics={};[].forEach.call(box.children,function(b){pics[b.getAttribute('aria-label')]=b.outerHTML.replace(' data-ok','')});
 function opts(){return[].slice.call(box.querySelectorAll('.L-opt'))}
 function render(i){var q=qs[i];qi=i;done=false;panel.classList.remove('is-solved');
  if(q===first){h3.innerHTML=q.h;box.innerHTML=q.o}
  else if(q.w){var say=panel.querySelector('.L-say');say.dataset.audio=q.a;say.querySelector('span').textContent=q.w;box.innerHTML=Object.keys(pics).map(function(k){var h=pics[k];return k===q.k?h.replace('class="L-opt"','class="L-opt" data-ok'):h}).join('')}
  else{h3.innerHTML=q.h;var tile=box.classList.contains('L-tiles');box.innerHTML=q.o.map(function(o){return'<button type="button" class="L-opt'+(tile?' L-tile':'')+'"'+(o[1]?' data-ok':'')+'>'+o[0]+'</button>'}).join('')}
  if(q.w)h3.innerHTML=first.h;
  // في سؤال الإنجليزية الأول يحمل زرّ الصوت كلمة olive
  if(q===first&&panel.dataset.qset==='en'){var s=panel.querySelector('.L-say');s.dataset.audio='assets/landing/en-olive.mp3';s.querySelector('span').textContent='olive'}
  else if(!q.w){var s2=panel.querySelector('.L-say');if(s2){if(q.a)s2.dataset.audio=q.a;else if(q===first&&panel.dataset.qset==='math')s2.dataset.audio='assets/landing/demo-math-1.mp3';else if(q===first&&panel.dataset.qset==='ar')s2.dataset.audio='assets/landing/demo-ar-1.mp3';else if(q===first&&panel.dataset.qset==='sc')s2.dataset.audio='assets/landing/demo-sc-1.mp3'}}
  var vis=panel.querySelector('[data-visual]');if(vis&&q.v&&!q.w){vis.outerHTML=q.v}
  if(meta&&q.m)meta.textContent=q.m;else if(meta&&first.m)meta.textContent=first.m;
  slot=panel.querySelector('[data-slot]');
  fb.className='L-fb';fb.textContent='';fb.dataset.okText=q.ok;fb.dataset.noText=q.no;
  if(count)count.textContent='السؤال '+AR(i+1)+' من '+AR(qs.length);
  if(next)next.hidden=true;
  var sayBtn=panel.querySelector('.L-say');if(sayBtn&&sayBtn.dataset.audio&&panel.dataset.qset!=='en')setTimeout(function(){play(sayBtn.dataset.audio,sayBtn)},400)}
 render(0);
 function answer(btn){
  if(done)return;var ok=btn.hasAttribute('data-ok');
  opts().forEach(function(o){o.classList.remove('is-no')});
  void btn.offsetWidth;btn.classList.add(ok?'is-ok':'is-no');
  fb.className='L-fb';void fb.offsetWidth;fb.className='L-fb '+(ok?'is-ok':'is-no');fb.textContent=ok?fb.dataset.okText:fb.dataset.noText;
  if(slot){slot.textContent=btn.textContent;slot.classList.toggle('is-filled',ok);slot.classList.remove('is-no');if(!ok){void slot.offsetWidth;slot.classList.add('is-no');setTimeout(function(){if(!done){slot.textContent='؟';slot.classList.remove('is-no')}},900)}}
  if(ok){done=true;panel.classList.add('is-solved');sfx('ok');praise();var at=rel(slot||btn);burst(at.x,at.y);
   if(next){next.firstChild.textContent=qi<qs.length-1?'السؤال التالي':'ابدأ الأسئلة من جديد';next.hidden=false}
   var say=panel.querySelector('.L-say');if(say)setTimeout(function(){play(say.dataset.audio,say)},500)}
  else{sfx('no');if(btn.dataset.audio)play(btn.dataset.audio)}
 }
 if(next)next.addEventListener('click',function(){render((qi+1)%qs.length);var f=box.querySelector('.L-opt');if(f)f.focus({preventScroll:true})});
 box.addEventListener('click',function(e){var btn=e.target.closest('.L-opt');if(!btn)return;if(btn.dataset.dragged){delete btn.dataset.dragged;return}answer(btn)});
 // سحب البطاقة إلى المربّع؛ الضغط وحده يعمل أيضًا
 box.addEventListener('pointerdown',function(e){
  var btn=e.target.closest('.L-tile');if(!btn||!slot||done||e.button>0)return;var sx=e.clientX,sy=e.clientY,ghost=null;
  function move(ev){var dx=ev.clientX-sx,dy=ev.clientY-sy;
   if(!ghost){if(Math.abs(dx)+Math.abs(dy)<8)return;ghost=btn.cloneNode(true);ghost.classList.add('is-drag');ghost.setAttribute('aria-hidden','true');var r=btn.getBoundingClientRect();ghost.style.width=r.width+'px';ghost.style.height=r.height+'px';document.body.appendChild(ghost);btn.style.opacity='.35';sfx('tap')}
   ghost.style.left=(ev.clientX-ghost.offsetWidth/2)+'px';ghost.style.top=(ev.clientY-ghost.offsetHeight/2)+'px';
   var s=slot.getBoundingClientRect();slot.classList.toggle('is-over',ev.clientX>s.left-20&&ev.clientX<s.right+20&&ev.clientY>s.top-20&&ev.clientY<s.bottom+20);ev.preventDefault()}
  function up(){removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
   if(ghost){ghost.remove();btn.style.opacity='';btn.dataset.dragged='1';setTimeout(function(){delete btn.dataset.dragged},50);if(slot.classList.contains('is-over'))answer(btn)}
   slot.classList.remove('is-over')}
  addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up);
 });
});
// يد إرشاد: عند ظهور العرض تسحب بطاقة نحو المربّع وتعود، وتتوقف عند أول تفاعل
if(demo){
 var hand=demo.querySelector('.L-hand'),touched=false,anim=[],seen=false;
 function stopHint(){anim.forEach(function(a){try{a.cancel()}catch(e){}});anim=[];if(hand){var g=hand.querySelector('.L-ghost');if(g)g.remove();hand.style.opacity=0;hand.hidden=true}}
 function touch(){if(touched)return;touched=true;demo.classList.add('is-touched');stopHint()}
 ['pointerdown','keydown'].forEach(function(t){demo.addEventListener(t,touch,{capture:true,passive:true})});
 function hint(){stopHint();if(touched||RM.matches||!hand||!hand.animate)return;
  var panel=demo.querySelector('.L-panel:not([hidden])');if(!panel)return;
  var tile=panel.querySelector('.L-tile:not([data-ok])')||panel.querySelector('.L-opt:not([data-ok])')||panel.querySelector('[data-piece]'),slot=panel.querySelector('[data-slot]');if(!tile)return;
  hand.hidden=false;var a=rel(tile),T=2800,it=3,o={duration:T,iterations:it,delay:700,easing:'ease-in-out'};
  if(slot){var b=rel(slot),g=tile.cloneNode(true);g.classList.add('L-ghost');g.removeAttribute('data-ok');g.style.width=a.w+'px';g.style.height=a.h+'px';g.style.left=(-a.w/2)+'px';g.style.top=(-a.h/2)+'px';hand.insertBefore(g,hand.firstChild);
   anim.push(hand.animate([{transform:'translate('+a.x+'px,'+(a.y+30)+'px)',opacity:0},{transform:'translate('+a.x+'px,'+a.y+'px)',opacity:1,offset:.12},{transform:'translate('+a.x+'px,'+a.y+'px)',opacity:1,offset:.22},{transform:'translate('+b.x+'px,'+b.y+'px)',opacity:1,offset:.55},{transform:'translate('+b.x+'px,'+b.y+'px)',opacity:1,offset:.66},{transform:'translate('+a.x+'px,'+a.y+'px)',opacity:1,offset:.9},{transform:'translate('+a.x+'px,'+(a.y+30)+'px)',opacity:0}],o));
   anim.push(g.animate([{opacity:0,transform:'scale(1)'},{opacity:0,offset:.18},{opacity:1,transform:'scale(1.08) rotate(-4deg)',offset:.24},{opacity:1,transform:'scale(1.08) rotate(-4deg)',offset:.62},{opacity:1,transform:'scale(1.08) rotate(-4deg)',offset:.86},{opacity:0,transform:'scale(1)',offset:.9},{opacity:0}],o))}
  else anim.push(hand.animate([{transform:'translate('+(a.x+40)+'px,'+(a.y+50)+'px)',opacity:0},{transform:'translate('+a.x+'px,'+a.y+'px) scale(1)',opacity:1,offset:.35},{transform:'translate('+a.x+'px,'+(a.y+6)+'px) scale(.88)',opacity:1,offset:.45},{transform:'translate('+a.x+'px,'+a.y+'px) scale(1)',opacity:1,offset:.6},{transform:'translate('+(a.x+40)+'px,'+(a.y+50)+'px)',opacity:0}],o));
  anim[0].onfinish=stopHint}
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!seen||!anim.length){seen=true;hint()}}else stopHint()})},{threshold:.6}).observe(demo);
 demo.querySelectorAll('[role=tab]').forEach(function(t){t.addEventListener('click',function(){setTimeout(function(){if(!touched)hint()},60)})});
 window.__bustanDemoHint=hint;
 // تلميح التمرير في شريط المواد على الهاتف
 var tw=demo.querySelector('.L-tabs-wrap'),tb=demo.querySelector('.L-tabs');
 if(tw&&tb){var upd=function(){var more=tw.querySelector('.L-tabs-more');if(more)more.hidden=tb.scrollWidth<=tb.clientWidth+6;tw.classList.toggle('is-end',Math.abs(tb.scrollLeft)+tb.clientWidth>=tb.scrollWidth-6)};tb.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd()}
}
var check=document.getElementById('check-fraction'),ffb=document.getElementById('fraction-feedback');
if(check&&ffb)check.addEventListener('click',function(){setTimeout(function(){if(ffb.dataset.state==='correct'){sfx('ok');praise();var at=rel(check);burst(at.x,at.y)}else if(ffb.dataset.state!=='idle')sfx('no')},0)});
})();
// دوّار شاشات الهاتف: انتقال كل 3 ثوانٍ، حلقة سلسة بنسخ مكرّرة، يتوقف عند اللمس/التمرير ويستأنف، ويحترم تقليل الحركة.
(function(){
'use strict';
var box=document.querySelector('.L-phones');if(!box||!window.matchMedia)return;
var mq=matchMedia('(max-width:767px)'),rm=matchMedia('(prefers-reduced-motion: reduce)');
var orig=[].slice.call(box.children),n=orig.length,clones=[],timer=0,resume=0,paused=false,settle=0;
function items(){return [].slice.call(box.children)}
function center(el){var r=el.getBoundingClientRect(),b=box.getBoundingClientRect();return r.left+r.width/2-(b.left+b.width/2)}
function current(){var it=items(),best=0,d=1e9;it.forEach(function(el,i){var c=Math.abs(center(el));if(c<d){d=c;best=i}});return best}
function go(i,smooth){var el=items()[i];if(el)box.scrollBy({left:center(el),behavior:smooth?'smooth':'instant'})}
function wrap(){var i=current();if(i>=n){box.style.scrollSnapType='none';go(i-n,false);box.offsetWidth;box.style.scrollSnapType=''}}
function tick(){if(paused||document.hidden)return;go(current()+1,true)}
function stop(){clearInterval(timer);timer=0}
function start(){stop();if(!clones.length||rm.matches)return;timer=setInterval(tick,3000)}
function pause(){paused=true;clearTimeout(resume)}
function later(){clearTimeout(resume);resume=setTimeout(function(){paused=false},4000)}
function setup(){
 if(mq.matches&&!clones.length){orig.forEach(function(el){var c=el.cloneNode(true);c.setAttribute('aria-hidden','true');c.setAttribute('data-clone','');c.querySelectorAll('img').forEach(function(im){im.alt='';im.loading='eager'});box.appendChild(c);clones.push(c)});requestAnimationFrame(function(){go(0,false)})}
 else if(!mq.matches&&clones.length){clones.forEach(function(c){c.remove()});clones=[];box.scrollLeft=0}
 start();
}
box.addEventListener('scroll',function(){clearTimeout(settle);settle=setTimeout(wrap,160)},{passive:true});
if('onscrollend' in box)box.addEventListener('scrollend',wrap);
box.addEventListener('pointerenter',pause);box.addEventListener('pointerleave',later);
box.addEventListener('touchstart',pause,{passive:true});box.addEventListener('touchend',later,{passive:true});
box.addEventListener('focusin',pause);box.addEventListener('focusout',later);
(mq.addEventListener?mq.addEventListener('change',setup):mq.addListener(setup));
(rm.addEventListener?rm.addEventListener('change',start):rm.addListener(start));
setup();
})();

// إعدادات الموقع من لوحة الإدارة (الواجهة، الأسئلة، التذييل، الجولة الصوتية). النصوص المكتوبة في الصفحة احتياط عند تعذّر الاتصال.
(function(){
'use strict';
if(!document.getElementById('visitor-home'))return;
var p=null;
try{if(typeof fetch==='function')p=Promise.race([
 fetch('/admin-api/api/site',{cache:'no-cache',credentials:'same-origin',headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null}).catch(function(){return null}),
 new Promise(function(r){setTimeout(function(){r(null)},2500)})])}catch(e){p=null}
window.__bustanSite=p||Promise.resolve(null);
function txt(sel,v){var el=document.querySelector(sel);if(el&&typeof v==='string'&&v.trim())el.textContent=v.trim();return el}
function safe(u){return typeof u==='string'&&/^https?:\/\//i.test(u)?u:''}
function fill(d){
 if(!d)return;var h=d.hero||{};
 var badge=document.querySelector('[data-site="badge"]');if(badge&&typeof h.badge==='string'){var t=badge.querySelector('span');if(h.badge.trim()){if(t)t.textContent=h.badge.trim();badge.hidden=false}else badge.hidden=true}
 var h1=document.getElementById('L-hero-title');if(h1&&h.title&&h.title.trim()){h1.textContent='';h1.append(h.title.trim());if(h.mark&&h.mark.trim()){h1.append(document.createElement('br'));var m=document.createElement('span');m.className='L-mark';m.textContent=h.mark.trim();h1.append(m)}}
 txt('.L-hero .L-tagline',d.tagline);txt('.L-hero .L-lead',h.subtitle);
 if(Array.isArray(d.faq)&&d.faq.length){var box=document.querySelector('[data-site="faq"]');if(box){[].slice.call(box.querySelectorAll('details')).forEach(function(x){x.remove()});
  d.faq.forEach(function(i){var de=document.createElement('details'),su=document.createElement('summary'),pa=document.createElement('p');su.textContent=i.q;pa.textContent=i.a;de.append(su,pa);box.append(de)})}}
 var c=d.contact||{};txt('[data-site="footer"]',c.footer);
 [['facebook',safe(c.facebook)],['instagram',safe(c.instagram)],['email',c.email&&/^[^\s@]+@[^\s@]+$/.test(c.email)?'mailto:'+c.email:'']].forEach(function(x){var a=document.querySelector('[data-site="'+x[0]+'"]');if(a){if(x[1]){a.href=x[1];a.hidden=false}else a.hidden=true}});
 if(c.whatsapp&&/^\d{8,20}$/.test(c.whatsapp))[].forEach.call(document.querySelectorAll('a[href^="https://wa.me/"]'),function(a){a.href='https://wa.me/'+c.whatsapp;var n=a.querySelector('[data-wa-num]');if(n)n.textContent=String('00'+c.whatsapp).replace(/\d/g,function(x){return'٠١٢٣٤٥٦٧٨٩'[x]})});
 if(d.registration_open===false)[].forEach.call(document.querySelectorAll('a[href$="account/register"]'),function(a){a.href=a.getAttribute('href').replace(/register$/,'login')});
}
window.__bustanSite.then(fill);window.__bustanSiteFill=fill;
})();

// جولة صوتية: زرّ «استمع» ظاهر فورًا فوق شريط «جرّب مجانًا»؛ مقطع لكل قسم عند ظهوره (مرّة واحدة، بلا تداخل)، مع ترجمة نصّية.
// يحفظ اختيار الكتم فقط في المفتاح bustan_landing_voice ("off"/"on")؛ لا يلمس أي مفتاح آخر. الصوت يُحمَّل عند الحاجة (preload=none).
(function(){
'use strict';
var root=document.getElementById('visitor-home');if(!root||typeof Audio==='undefined')return;
var CLIPS=[["welcome","#L-top","أَهْلًا وَسَهْلًا بِكَ فِي «بُسْتَانِ التَّعَلُّم». أَنَا زَيْتُون، وَيَسُرُّنِي أَنْ أَصْحَبَكَ فِي جَوْلَةٍ قَصِيرَةٍ عَلَى هٰذِهِ الصَّفْحَةِ. هُنَا نَزْرَعُ الفَهْمَ، وَنَحْصُدُ المَعْرِفَةَ؛ دُرُوسٌ تَفَاعُلِيَّةٌ مُطَابِقَةٌ لِلْمِنْهَاجِ الفِلَسْطِينِيِّ، صُمِّمَتْ لِيَفْهَمَ طِفْلُكَ دَرْسَهُ وَيُحِبَّ أَنْ يَتَعَلَّمَهُ. تَعَالَ نَكْتَشِفْ مَعًا كَيْفَ يَصْنَعُ البُسْتَانُ فَرْقًا حَقِيقِيًّا فِي يَوْمِ طِفْلِكَ."],["hero",".L-hero","فِي البِدَايَةِ، تَرَى وَعْدَنَا لَكَ: دُرُوسٌ قَصِيرَةٌ بِالصَّوْتِ وَالصُّورَةِ، مُرَتَّبَةٌ كَمَا فِي كِتَابِ المَدْرَسَةِ، وَمُطَابِقَةٌ لِلْمِنْهَاجِ الفِلَسْطِينِيِّ كَامِلًا. مَوَادُّ دِرَاسِيَّةٌ كَثِيرَةٌ، بِلَا إِعْلَانَاتٍ، وَتَعْمَلُ حَتَّى مَعَ إِنْتَرْنِتٍ ضَعِيفٍ. وَأَنَا زَيْتُون أُشَجِّعُ طِفْلَكَ عِنْدَ كُلِّ إِجَابَةٍ، وَأَنْتَ تُتَابِعُ تَقَدُّمَهُ مِنْ حِسَابِكَ."],["demos","#L-demos","وَهُنَا لَا نَطْلُبُ مِنْكَ أَنْ تُصَدِّقَنَا، بَلْ أَنْ تُجَرِّبَ بِنَفْسِكَ. هٰذِهِ أَسْئِلَةٌ حَقِيقِيَّةٌ مِنْ دُرُوسِ البُسْتَانِ: رِيَاضِيَّاتٌ وَلُغَتُنَا الجَمِيلَةُ وَإِنْجِلِيزِيَّةٌ وَعُلُومٌ وَكُسُورٌ. اخْتَرْ مَادَّةً وَأَجِبْ، وَشَاهِدْ كَيْفَ يَتَلَقَّى طِفْلُكَ التَّشْجِيعَ وَالتَّصْحِيحَ فَوْرًا."],["screens",".L-screens","هٰذِهِ شَاشَاتٌ حَقِيقِيَّةٌ مِنْ دَاخِلِ البُسْتَانِ، لَا صُوَرٌ تَوْضِيحِيَّةٌ. هٰكَذَا تَبْدُو دُرُوسُ طِفْلِكَ عَلَى هَاتِفِكَ أَوْ جِهَازِ البَيْتِ: مِنْ لُغَتِنَا الجَمِيلَةِ وَالرِّيَاضِيَّاتِ، إِلَى مُخْتَبَرِ العُلُومِ. مَا تَرَاهُ هُنَا، هُوَ تَمَامًا مَا سَيَعِيشُهُ طِفْلُكَ."],["how","#L-how","أَرْبَعُ خُطُوَاتٍ فَقَطْ، وَتَبْدَأُ اللَّيْلَةَ: أَنْشِئْ حِسَابَ وَلِيِّ أَمْرٍ وَاحِدًا لِلْعَائِلَةِ، ثُمَّ أَضِفْ مِلَفًّا لِكُلِّ طِفْلٍ وَاخْتَرْ صَفَّهُ وَمَادَّتَهُ. يَتَعَلَّمُ طِفْلُكَ بِشَرْحٍ قَصِيرٍ وَأَسْئِلَةٍ بِتَصْحِيحٍ فَوْرِيٍّ، وَتُتَابِعُ أَنْتَ مَا أَنْجَزَهُ وَمَا يَحْتَاجُ إِلَى مُرَاجَعَةٍ، مِنْ أَيِّ جِهَازٍ."],["curriculum","#L-curriculum","كُلُّ دَرْسٍ هُنَا مُطَابِقٌ لِكُتُبِ المِنْهَاجِ الفِلَسْطِينِيِّ، بِوَحَدَاتِهَا وَتَرْتِيبِهَا وَصَفَحَاتِهَا، وَيَذْكُرُ مَرْجِعَهُ فِي الكِتَابِ. اخْتَرْ صَفَّ طِفْلِكَ لِتَرَى مَوَادَّهُ كُلَّهَا؛ فَيُرَاجِعُ طِفْلُكَ مَا أَخَذَهُ فِي الصَّفِّ تَمَامًا."],["benefits",".L-benefits","صَمَّمْنَا البُسْتَانَ لِيَطْمَئِنَّ قَلْبُكَ: تَقَدُّمُ طِفْلِكَ مَحْفُوظٌ فِي حِسَابِكَ فَلَا يَضِيعُ، وَالدُّرُوسُ المُنَزَّلَةُ تَعْمَلُ دُونَ اتِّصَالٍ. بِيئَةٌ آمِنَةٌ لَا غُرَبَاءَ فِيهَا وَلَا رَوَابِطَ خَارِجِيَّةَ، وَبِلَا إِعْلَانَاتٍ إِطْلَاقًا، مَعَ صَوْتٍ مُرَافِقٍ يَنْطِقُ كُلَّ كَلِمَةٍ. وَقْتُ الشَّاشَةِ كُلُّهُ لِلتَّعَلُّمِ."],["pricing","#L-pricing","أَسْعَارُنَا وَاضِحَةٌ: تَدْفَعُ فَقَطْ لِلْمَوَادِّ الَّتِي يَحْتَاجُهَا طِفْلُكَ، وَتَرَى سِعْرَ كُلِّ مَادَّةٍ وَمُدَّةَ اشْتِرَاكِهَا هُنَا فِي هٰذَا القِسْمِ. وَالأَيَّامُ الأُولَى مَجَّانِيَّةٌ لِكُلِّ المَوَادِّ، ثُمَّ تَشْتَرِكُ بِسُهُولَةٍ عَبْرَ وَاتْسَاب."],["faq",".L-faq","وَهُنَا أَجْوِبَةُ أَسْئِلَتِكَ قَبْلَ أَنْ تَبْدَأَ: لَا يُخْصَمُ أَيُّ مَبْلَغٍ تِلْقَائِيًّا بَعْدَ التَّجْرِبَةِ، وَيُمْكِنُكَ إِضَافَةُ أَكْثَرَ مِنْ طِفْلٍ. يَعْمَلُ البُسْتَانُ عَلَى الهَاتِفِ وَالجِهَازِ اللَّوْحِيِّ وَالحَاسُوبِ دُونَ تَثْبِيتِ تَطْبِيقٍ، وَهُوَ سَنَدٌ لِلْكِتَابِ وَالمُعَلِّمِ، لَا بَدِيلٌ عَنْهُمَا."],["final",".L-final","ازْرَعِ اليَوْمَ بِذْرَةَ فَهْمٍ، وَاحْصُدْ غَدًا ثِقَةَ طِفْلِكَ. ثَلَاثَةُ أَيَّامٍ مَجَّانِيَّةٌ لِكُلِّ المَوَادِّ، دُونَ بِطَاقَةٍ وَدُونَ الْتِزَامٍ. لَا تُؤَجِّلْ مَا يَسْتَحِقُّهُ طِفْلُكَ؛ اضْغَطِ الآنَ عَلَى «جَرِّبْ كُلَّ المَوَادِّ مَجَّانًا»، وَابْدَأْ رِحْلَتَهُ مَعَنَا فِي بُسْتَانِ التَّعَلُّم. أَنَا زَيْتُون، وَبِانْتِظَارِكُمَا!"]];
var KEY='bustan_landing_voice',VOL=0.35,AUTO=true,DIR='assets/landing/voice/';
function pref(){try{return localStorage.getItem(KEY)}catch(e){return null}}
function save(v){try{localStorage.setItem(KEY,v)}catch(e){}}
var muted=pref()==='off',enabled=false,played={},queue=[],cur=null,curId=null,armed=false;
var ICON_ON='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
var ICON_OFF='<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>';
var pill=document.createElement('div');pill.className='L-voice';pill.hidden=true;
pill.innerHTML='<button type="button" class="L-voice-play"><img src="assets/brand/logo-mascot-sm.webp" width="30" height="40" alt=""><span>استمع إلى جولة البُستان</span><i aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 1.5v9l7-4.5z" fill="currentColor"/></svg></i></button><button type="button" class="L-voice-mute" aria-pressed="false"></button>';
var cap=document.createElement('p');cap.className='L-voice-cap';cap.hidden=true;cap.setAttribute('aria-live','polite');
document.body.appendChild(pill);document.body.appendChild(cap);
var playBtn=pill.querySelector('.L-voice-play'),muteBtn=pill.querySelector('.L-voice-mute');
// عنصر صوت واحد يُعاد استخدامه: يُفتَح داخل أول لمسة حقيقية فيسمح iOS Safari بتشغيل المقاطع التالية منه.
var au=new Audio();au.preload='none';
function ui(){muteBtn.setAttribute('aria-pressed',muted?'true':'false');muteBtn.setAttribute('aria-label',muted?'تشغيل صوت الجولة':'كتم صوت الجولة');muteBtn.innerHTML=muted?ICON_OFF:ICON_ON;playBtn.hidden=enabled&&!muted;pill.classList.toggle('is-on',enabled&&!muted)}
function sec(c){return c&&document.querySelector(c[1])}
function mark(c,on){var el=sec(c);if(el)el.classList.toggle('is-speaking',on)}
function fade(a,to,ms,done){clearInterval(a._f);var from=a.volume,t0=Date.now();a._f=setInterval(function(){var k=Math.min(1,(Date.now()-t0)/ms);a.volume=Math.max(0,Math.min(1,from+(to-from)*k));if(k>=1){clearInterval(a._f);if(done)done()}},30)}
function byId(id){for(var i=0;i<CLIPS.length;i++)if(CLIPS[i][0]===id)return CLIPS[i]}
function finish(){var c=byId(curId);mark(c,false);cap.hidden=true;cur=null;curId=null;next()}
au.onended=function(){if(cur)finish()};au.onerror=function(){if(cur)finish()};
var stopping=0;
function stop(cb){if(!cur){if(cb)cb();return}var c=byId(curId),tok=++stopping;cur=null;curId=null;mark(c,false);cap.hidden=true;fade(au,0,350,function(){if(tok===stopping&&!cur)au.pause();if(cb)cb()})}
// يستدعي play() متزامنًا (داخل معالج اللمسة نفسه عند الحاجة).
function start(id,silentFail){var c=byId(id);if(!c||played[id])return Promise.resolve(false);played[id]=1;
 var tok=++stopping;clearInterval(au._f);au.src=DIR+id+'.mp3';au.volume=0;cur=au;curId=id;
 var p;try{p=au.play()}catch(e){p=Promise.reject(e)}
 return Promise.resolve(p).then(function(){if(tok!==stopping)return true;fade(au,VOL,500);mark(c,true);cap.textContent=c[2];cap.hidden=false;return true},function(){if(tok!==stopping)return false;cur=null;curId=null;if(silentFail)played[id]=0;else finish();return false})}
function next(){if(cur||!enabled||muted)return;while(queue.length){var id=queue.shift();if(!played[id]){start(id);return}}}
function want(id){if(played[id]||id===curId)return;
 if(!enabled||muted)return;
 if(cur&&curId!=='welcome'){queue=[id];stop(next)}else{if(queue.indexOf(id)<0)queue.push(id);next()}}
function queueVisible(){visible.forEach(function(id){if(queue.indexOf(id)<0&&!played[id])queue.push(id)})}
function enable(){if(muted)return Promise.resolve(false);enabled=true;ui();queue=[];queueVisible();
 // محاولة التشغيل التلقائي ما زالت معلّقة: أعِد play() داخل هذه اللمسة نفسها
 if(curId==='welcome'&&au.paused){played.welcome=0;cur=null;curId=null}
 if(played.welcome){next();return Promise.resolve(true)}
 return start('welcome',true).then(function(ok){if(!ok){enabled=false;ui()}else off();return ok})}
var visible=[];
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){var id=e.target.getAttribute('data-voice');var i=visible.indexOf(id);if(e.isIntersecting){if(i<0)visible.push(id);want(id)}else if(i>=0)visible.splice(i,1)})},{threshold:0.5});
 CLIPS.forEach(function(c){if(c[0]==='welcome')return;var el=sec(c);if(el){el.setAttribute('data-voice',c[0]);io.observe(el)}})}
playBtn.addEventListener('click',function(){muted=false;save('on');enable()});
muteBtn.addEventListener('click',function(){muted=!muted;save(muted?'off':'on');if(muted){queue=[];stop();off()}else enable();ui()});
// أول تفاعل في أي مكان يبدأ الترحيب. التمرير والعجلة ليسا تفعيلًا حقيقيًّا في كروم فتُجرَّب دون ضمان؛ اللمس والنقر والمفاتيح مضمونة.
var evs=['pointerdown','touchstart','keydown','scroll','wheel','pointerup','click','touchend'];
function gesture(e){if(e&&e.target&&pill.contains&&pill.contains(e.target))return;if(muted||enabled){off();return}
 if(e&&e.type==='keydown'&&(e.key==='Escape'||e.key==='Tab'||e.altKey||e.ctrlKey||e.metaKey))return;
 enable()}
function arm(){if(armed||muted||enabled)return;armed=true;evs.forEach(function(t){addEventListener(t,gesture,{capture:true,passive:true})})}
function off(){if(!armed)return;armed=false;evs.forEach(function(t){removeEventListener(t,gesture,true)})}
function onLoad(f){if(document.readyState==='complete')f();else addEventListener('load',function(){f()},{once:true})}
function show(){if(!pill.hidden)return;pill.hidden=false;ui();if(muted||!AUTO)return;arm();
 // بعد اكتمال تحميل الصفحة: محاولة تشغيل الترحيب تلقائيًّا بصوت منخفض؛ إن منعها المتصفح تبقى المستمعات مسلّحة حتى أول تفاعل
 onLoad(function(){if(enabled||muted||played.welcome||curId)return;start('welcome',true).then(function(ok){if(ok&&!enabled){enabled=true;queueVisible();ui();off()}else if(!ok)arm()})})}
// إعدادات الجولة من لوחة الإدارة: تشغيل/إيقاف، مستوى الصوت، البدء التلقائي. دون اتصال تبقى القيم الافتراضية.
Promise.resolve(window.__bustanSite||null).then(function(d){var v=d&&d.voice;
 if(v){if(v.enabled===false){pill.remove&&pill.remove();cap.remove&&cap.remove();return}
  if(typeof v.volume==='number')VOL=Math.max(0,Math.min(1,v.volume/100));if(v.autoplay===false)AUTO=false}
 show()});
window.__bustanVoice={want:want,enable:enable,state:function(){return{enabled:enabled,muted:muted,cur:curId,played:played,queue:queue.slice()}}};
})();

// الأسعار ومدة الاشتراك والتجربة من لوحة الإدارة؛ النصوص المكتوبة في الصفحة احتياط عند تعذّر الاتصال.
(function(){
var AR=function(n){return String(n).replace(/\d/g,function(d){return'٠١٢٣٤٥٦٧٨٩'[d]})};
function days(n){n=+n;if(n===1)return'يومًا واحدًا';if(n===2)return'يومين';if(n>=3&&n<=10)return AR(n)+' أيام';return AR(n)+' يومًا'}
function cur(n,c){if(c&&c!=='شيكل')return c;n=+n%100;if(n>=3&&n<=10)return'شواكل';if(n>=11&&n<=99)return'شيكلًا';return'شيكل'}
function fill(d){
 if(!d||!d.groups)return;
 var keys={};d.groups.forEach(function(g){keys[g.key]=1});
 [].forEach.call(document.querySelectorAll('[data-price-group]'),function(c){c.hidden=!keys[c.getAttribute('data-price-group')]});
 var note=document.querySelector('[data-site="pay"]');if(note&&typeof d.payment_instructions==='string'){note.textContent=d.payment_instructions;note.hidden=!d.payment_instructions.trim()}
 d.groups.forEach(function(g){var card=document.querySelector('[data-price-group="'+g.key+'"]');
  // صف مُسعَّر لا بطاقة له في الصفحة: بطاقة جديدة على نمط البطاقة الأولى
  if(!card){var tpl=document.querySelector('[data-price-group]');if(!tpl||!tpl.parentNode)return;card=tpl.cloneNode(true);card.setAttribute('data-price-group',g.key);card.hidden=false;card.classList.remove('L-plan-hot');
   var li=card.querySelector('ul li');if(li){var sv=li.querySelector('svg');li.textContent='';if(sv)li.append(sv);li.append((g.subjects||[]).join('، '))}
   [].slice.call(card.querySelectorAll('ul li')).slice(1).forEach(function(x){x.remove()});tpl.parentNode.append(card)}
  var t=card.querySelector('.L-plan-for'),b=card.querySelector('.L-price b'),f=card.querySelector('.L-from'),u=card.querySelector('.L-cur'),dd=card.querySelector('[data-days]');
  if(t&&g.title)t.textContent=g.title;if(b)b.textContent=g.max>g.min?AR(g.min)+'–'+AR(g.max):AR(g.min);if(f)f.hidden=true;if(u)u.textContent='₪';
  var l0=card.querySelector('ul li');if(l0&&g.subjects&&g.subjects.length){var s0=l0.querySelector('svg');l0.textContent='';if(s0)l0.append(s0);l0.append(g.subjects.join('، '))}if(dd)dd.textContent=(g.days_vary?'من ':'')+days(g.days)});
 var dy=d.groups.length?Math.min.apply(null,d.groups.map(function(g){return g.days})):0;
 if(dy)document.querySelectorAll('[data-days]').forEach(function(el){if(!el.closest('[data-price-group]'))el.textContent=days(dy)});
 if(typeof d.trial_days==='number'){var on=d.trial_days>0;
  document.querySelectorAll('[data-trial]').forEach(function(el){if(on)el.textContent=days(d.trial_days)});}
}
try{fetch('/admin-api/api/public/prices',{cache:'no-cache',credentials:'omit',headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null}).then(fill).catch(function(){})}catch(e){}
window.__bustanPrices=fill;
})();
