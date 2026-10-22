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
root.querySelectorAll('[data-quiz]').forEach(function(panel){
 var fb=panel.querySelector('.L-fb'),opts=[].slice.call(panel.querySelectorAll('.L-opt')),slot=panel.querySelector('[data-slot]'),done=false;
 function answer(btn){
  if(done)return;var ok=btn.hasAttribute('data-ok');
  opts.forEach(function(o){o.classList.remove('is-no')});
  btn.classList.add(ok?'is-ok':'is-no');
  fb.className='L-fb '+(ok?'is-ok':'is-no');fb.textContent=ok?fb.dataset.okText:fb.dataset.noText;
  if(slot){slot.textContent=btn.textContent;slot.classList.toggle('is-filled',ok);if(!ok)setTimeout(function(){if(!done){slot.textContent='؟'}},900)}
  if(ok){done=true;panel.classList.add('is-solved');celebrate();var say=panel.querySelector('.L-say');if(say)play(say.dataset.audio,say)}
  else if(btn.dataset.audio)play(btn.dataset.audio);
 }
 opts.forEach(function(btn){btn.addEventListener('click',function(){if(btn.dataset.dragged){delete btn.dataset.dragged;return}answer(btn)})});
 if(!slot)return;
 // سحب البطاقة إلى المربّع؛ الضغط وحده يعمل أيضًا
 opts.forEach(function(btn){
  btn.addEventListener('pointerdown',function(e){
   if(done||e.button>0)return;var sx=e.clientX,sy=e.clientY,ghost=null;
   function move(ev){var dx=ev.clientX-sx,dy=ev.clientY-sy;
    if(!ghost){if(Math.abs(dx)+Math.abs(dy)<8)return;ghost=btn.cloneNode(true);ghost.classList.add('is-drag');ghost.setAttribute('aria-hidden','true');var r=btn.getBoundingClientRect();ghost.style.width=r.width+'px';ghost.style.height=r.height+'px';document.body.appendChild(ghost);btn.style.opacity='.35'}
    ghost.style.left=(ev.clientX-ghost.offsetWidth/2)+'px';ghost.style.top=(ev.clientY-ghost.offsetHeight/2)+'px';
    var s=slot.getBoundingClientRect();slot.classList.toggle('is-over',ev.clientX>s.left-20&&ev.clientX<s.right+20&&ev.clientY>s.top-20&&ev.clientY<s.bottom+20);ev.preventDefault()}
   function up(){removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
    if(ghost){ghost.remove();btn.style.opacity='';btn.dataset.dragged='1';setTimeout(function(){delete btn.dataset.dragged},50);if(slot.classList.contains('is-over'))answer(btn)}
    slot.classList.remove('is-over')}
   addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up);
  });
 });
});
var check=document.getElementById('check-fraction'),ffb=document.getElementById('fraction-feedback');
if(check&&ffb)check.addEventListener('click',function(){setTimeout(function(){if(ffb.dataset.state==='correct')celebrate()},0)});
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

// جولة صوتية: زرّ «استمع» ظاهر فورًا فوق شريط «جرّب مجانًا»؛ مقطع لكل قسم عند ظهوره (مرّة واحدة، بلا تداخل)، مع ترجمة نصّية.
// يحفظ اختيار الكتم فقط في المفتاح bustan_landing_voice ("off"/"on")؛ لا يلمس أي مفتاح آخر. الصوت يُحمَّل عند الحاجة (preload=none).
(function(){
'use strict';
var root=document.getElementById('visitor-home');if(!root||typeof Audio==='undefined')return;
var CLIPS=[["welcome","#L-top","أَهْلًا وَسَهْلًا بِكَ فِي «بُسْتَانِ التَّعَلُّم». أَنَا زَيْتُون، وَيَسُرُّنِي أَنْ أَصْحَبَكَ فِي جَوْلَةٍ قَصِيرَةٍ عَلَى هٰذِهِ الصَّفْحَةِ. هُنَا نَزْرَعُ الفَهْمَ، وَنَحْصُدُ المَعْرِفَةَ؛ دُرُوسٌ تَفَاعُلِيَّةٌ مُطَابِقَةٌ لِلْمِنْهَاجِ الفِلَسْطِينِيِّ، صُمِّمَتْ لِيَفْهَمَ طِفْلُكَ دَرْسَهُ وَيُحِبَّ أَنْ يَتَعَلَّمَهُ. تَعَالَ نَكْتَشِفْ مَعًا كَيْفَ يَصْنَعُ البُسْتَانُ فَرْقًا حَقِيقِيًّا فِي يَوْمِ طِفْلِكَ."],["hero",".L-hero","فِي البِدَايَةِ، تَرَى وَعْدَنَا لَكَ: دُرُوسٌ قَصِيرَةٌ بِالصَّوْتِ وَالصُّورَةِ، مُرَتَّبَةٌ كَمَا فِي كِتَابِ المَدْرَسَةِ، وَمُطَابِقَةٌ لِلْمِنْهَاجِ الفِلَسْطِينِيِّ كَامِلًا. مَوَادُّ دِرَاسِيَّةٌ كَثِيرَةٌ، بِلَا إِعْلَانَاتٍ، وَتَعْمَلُ حَتَّى مَعَ إِنْتَرْنِتٍ ضَعِيفٍ. وَأَنَا زَيْتُون أُشَجِّعُ طِفْلَكَ عِنْدَ كُلِّ إِجَابَةٍ، وَأَنْتَ تُتَابِعُ تَقَدُّمَهُ مِنْ حِسَابِكَ."],["demos","#L-demos","وَهُنَا لَا نَطْلُبُ مِنْكَ أَنْ تُصَدِّقَنَا، بَلْ أَنْ تُجَرِّبَ بِنَفْسِكَ. هٰذِهِ أَسْئِلَةٌ حَقِيقِيَّةٌ مِنْ دُرُوسِ البُسْتَانِ: رِيَاضِيَّاتٌ وَلُغَتُنَا الجَمِيلَةُ وَإِنْجِلِيزِيَّةٌ وَعُلُومٌ وَكُسُورٌ. اخْتَرْ مَادَّةً وَأَجِبْ، وَشَاهِدْ كَيْفَ يَتَلَقَّى طِفْلُكَ التَّشْجِيعَ وَالتَّصْحِيحَ فَوْرًا."],["screens",".L-screens","هٰذِهِ شَاشَاتٌ حَقِيقِيَّةٌ مِنْ دَاخِلِ البُسْتَانِ، لَا صُوَرٌ تَوْضِيحِيَّةٌ. هٰكَذَا تَبْدُو دُرُوسُ طِفْلِكَ عَلَى هَاتِفِكَ أَوْ جِهَازِ البَيْتِ: مِنْ لُغَتِنَا الجَمِيلَةِ وَالرِّيَاضِيَّاتِ، إِلَى مُخْتَبَرِ العُلُومِ. مَا تَرَاهُ هُنَا، هُوَ تَمَامًا مَا سَيَعِيشُهُ طِفْلُكَ."],["how","#L-how","أَرْبَعُ خُطُوَاتٍ فَقَطْ، وَتَبْدَأُ اللَّيْلَةَ: أَنْشِئْ حِسَابَ وَلِيِّ أَمْرٍ وَاحِدًا لِلْعَائِلَةِ، ثُمَّ أَضِفْ مِلَفًّا لِكُلِّ طِفْلٍ وَاخْتَرْ صَفَّهُ وَمَادَّتَهُ. يَتَعَلَّمُ طِفْلُكَ بِشَرْحٍ قَصِيرٍ وَأَسْئِلَةٍ بِتَصْحِيحٍ فَوْرِيٍّ، وَتُتَابِعُ أَنْتَ مَا أَنْجَزَهُ وَمَا يَحْتَاجُ إِلَى مُرَاجَعَةٍ، مِنْ أَيِّ جِهَازٍ."],["curriculum","#L-curriculum","كُلُّ دَرْسٍ هُنَا مُطَابِقٌ لِكُتُبِ المِنْهَاجِ الفِلَسْطِينِيِّ، بِوَحَدَاتِهَا وَتَرْتِيبِهَا وَصَفَحَاتِهَا، وَيَذْكُرُ مَرْجِعَهُ فِي الكِتَابِ. اخْتَرْ صَفَّ طِفْلِكَ لِتَرَى مَوَادَّهُ كُلَّهَا؛ فَيُرَاجِعُ طِفْلُكَ مَا أَخَذَهُ فِي الصَّفِّ تَمَامًا."],["benefits",".L-benefits","صَمَّمْنَا البُسْتَانَ لِيَطْمَئِنَّ قَلْبُكَ: تَقَدُّمُ طِفْلِكَ مَحْفُوظٌ فِي حِسَابِكَ فَلَا يَضِيعُ، وَالدُّرُوسُ المُنَزَّلَةُ تَعْمَلُ دُونَ اتِّصَالٍ. بِيئَةٌ آمِنَةٌ لَا غُرَبَاءَ فِيهَا وَلَا رَوَابِطَ خَارِجِيَّةَ، وَبِلَا إِعْلَانَاتٍ إِطْلَاقًا، مَعَ صَوْتٍ مُرَافِقٍ يَنْطِقُ كُلَّ كَلِمَةٍ. وَقْتُ الشَّاشَةِ كُلُّهُ لِلتَّعَلُّمِ."],["pricing","#L-pricing","أَسْعَارُنَا وَاضِحَةٌ: تَدْفَعُ فَقَطْ لِلْمَوَادِّ الَّتِي يَحْتَاجُهَا طِفْلُكَ، وَتَرَى سِعْرَ كُلِّ مَادَّةٍ وَمُدَّةَ اشْتِرَاكِهَا هُنَا فِي هٰذَا القِسْمِ. وَالأَيَّامُ الأُولَى مَجَّانِيَّةٌ لِكُلِّ المَوَادِّ، ثُمَّ تَشْتَرِكُ بِسُهُولَةٍ عَبْرَ وَاتْسَاب."],["faq",".L-faq","وَهُنَا أَجْوِبَةُ أَسْئِلَتِكَ قَبْلَ أَنْ تَبْدَأَ: لَا يُخْصَمُ أَيُّ مَبْلَغٍ تِلْقَائِيًّا بَعْدَ التَّجْرِبَةِ، وَيُمْكِنُكَ إِضَافَةُ أَكْثَرَ مِنْ طِفْلٍ. يَعْمَلُ البُسْتَانُ عَلَى الهَاتِفِ وَالجِهَازِ اللَّوْحِيِّ وَالحَاسُوبِ دُونَ تَثْبِيتِ تَطْبِيقٍ، وَهُوَ سَنَدٌ لِلْكِتَابِ وَالمُعَلِّمِ، لَا بَدِيلٌ عَنْهُمَا."],["final",".L-final","ازْرَعِ اليَوْمَ بِذْرَةَ فَهْمٍ، وَاحْصُدْ غَدًا ثِقَةَ طِفْلِكَ. ثَلَاثَةُ أَيَّامٍ مَجَّانِيَّةٌ لِكُلِّ المَوَادِّ، دُونَ بِطَاقَةٍ وَدُونَ الْتِزَامٍ. لَا تُؤَجِّلْ مَا يَسْتَحِقُّهُ طِفْلُكَ؛ اضْغَطِ الآنَ عَلَى «جَرِّبْ كُلَّ المَوَادِّ مَجَّانًا»، وَابْدَأْ رِحْلَتَهُ مَعَنَا فِي بُسْتَانِ التَّعَلُّم. أَنَا زَيْتُون، وَبِانْتِظَارِكُمَا!"]];
var KEY='bustan_landing_voice',VOL=0.35,DIR='assets/landing/voice/';
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
// تفعيل المستخدم الحقيقي فقط (لا تمرير ولا عجلة): أول نقرة/لمسة/مفتاح في أي مكان يبدأ الترحيب.
var evs=['pointerup','click','touchend','keydown'];
function gesture(e){if(e&&e.target&&pill.contains&&pill.contains(e.target))return;if(muted||enabled){off();return}
 if(e&&e.type==='keydown'&&(e.key==='Escape'||e.key==='Tab'||e.altKey||e.ctrlKey||e.metaKey))return;
 enable()}
function arm(){if(armed||muted||enabled)return;armed=true;evs.forEach(function(t){addEventListener(t,gesture,{capture:true,passive:true})})}
function off(){if(!armed)return;armed=false;evs.forEach(function(t){removeEventListener(t,gesture,true)})}
function show(){if(!pill.hidden)return;pill.hidden=false;ui();if(muted)return;arm();
 // محاولة تشغيل تلقائي بصوت منخفض؛ إن منعها المتصفح يبقى الزرّ ظاهرًا وتنتظر أول تفعيل حقيقي
 if(!enabled)start('welcome',true).then(function(ok){if(ok&&!enabled){enabled=true;queueVisible();ui();off()}})}
show();
window.__bustanVoice={want:want,enable:enable,state:function(){return{enabled:enabled,muted:muted,cur:curId,played:played,queue:queue.slice()}}};
})();

// الأسعار ومدة الاشتراك والتجربة من لوحة الإدارة؛ النصوص المكتوبة في الصفحة احتياط عند تعذّر الاتصال.
(function(){
var AR=function(n){return String(n).replace(/\d/g,function(d){return'٠١٢٣٤٥٦٧٨٩'[d]})};
function days(n){n=+n;if(n===1)return'يومًا واحدًا';if(n===2)return'يومين';if(n>=3&&n<=10)return AR(n)+' أيام';return AR(n)+' يومًا'}
function cur(n,c){if(c&&c!=='شيكل')return c;n=+n%100;if(n>=3&&n<=10)return'شواكل';if(n>=11&&n<=99)return'شيكلًا';return'شيكل'}
function fill(d){
 if(!d||!d.groups)return;
 d.groups.forEach(function(g){var card=document.querySelector('[data-price-group="'+g.key+'"]');if(!card)return;
  var t=card.querySelector('.L-plan-for'),b=card.querySelector('.L-price b'),f=card.querySelector('.L-from'),u=card.querySelector('.L-cur'),dd=card.querySelector('[data-days]');
  if(t&&g.title)t.textContent=g.title;if(b)b.textContent=AR(g.min);if(f)f.hidden=!g.from;if(u)u.textContent=cur(g.min,d.currency);if(dd)dd.textContent=(g.days_vary?'من ':'')+days(g.days)});
 var dy=d.groups.length?Math.min.apply(null,d.groups.map(function(g){return g.days})):0;
 if(dy)document.querySelectorAll('[data-days]').forEach(function(el){if(!el.closest('[data-price-group]'))el.textContent=days(dy)});
 if(typeof d.trial_days==='number'){var on=d.trial_days>0;
  document.querySelectorAll('[data-trial]').forEach(function(el){if(on)el.textContent=days(d.trial_days)});}
}
try{fetch('/admin-api/api/public/prices',{cache:'no-cache',credentials:'omit',headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null}).then(fill).catch(function(){})}catch(e){}
window.__bustanPrices=fill;
})();
