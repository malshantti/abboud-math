/* تفاعلات صفحة الزائر: عيّنات من الدروس الحقيقية. كل شيء في الذاكرة فقط؛ لا يُكتب أي شيء في localStorage. */
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
