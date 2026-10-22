/* صوت الصف الأول: مقاطع مسجّلة مسبقًا فقط (edge-tts)، بلا موسيقى ولا توليد كلام في المتصفح.
   اسم الملف بصمة للنص المنطوق؛ أي تغيير في النص يولّد ملفًا جديدًا. انظر g1/shared/AUDIO.md. */
(function(root){
  'use strict';
  /* cyrb53: بصمة سريعة متطابقة في المتصفح وفي سكربت البناء. */
  function hash(str){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}
    h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
    return (4294967296*(2097151&h2)+(h1>>>0)).toString(16).padStart(14,'0');}
  const clean=t=>String(t??'').replace(/\s+/g,' ').trim();
  const langOf=(t,lang)=>lang||(/[\u0621-\u064a]/.test(t)||!/[A-Za-z]/.test(t)?'ar':'en');
  const key=(text,lang)=>{const t=clean(text);return hash(langOf(t,lang)+'|'+t);};
  /* نصوص المحرّك الثابتة؛ يجمعها سكربت البناء مع نصوص المادة. */
  const ENGINE={retry:'لِنَنْظُرْ مَرَّةً أُخْرَى. جَرِّبِ اخْتِيَارًا آخَرَ.',good:'أَحْسَنْتَ!',done:'أَحْسَنْتَ، أَتْمَمْتَ الْخُطْوَةَ!'};
  const api={hash,key,clean,langOf,ENGINE};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(!root||typeof document==='undefined'){if(root)root.G1_AUDIO=api;return;}
  const AUTO='g1_audio_auto',BASE=(()=>{const s=document.currentScript&&document.currentScript.src;return s?s.replace(/audio\.js(\?.*)?$/,'audio/'):'../shared/audio/';})();
  const index=()=>root.G1_AUDIO_INDEX||{};
  const file=(text,lang)=>{const f=index()[key(text,lang)];return f?BASE+f+'.mp3':null;};
  const has=(text,lang)=>!!file(text,lang);
  const store=()=>{try{return root.localStorage;}catch(_){return null;}};
  const auto=()=>{const s=store();return !s||s.getItem(AUTO)!=='0';};
  let player=null,queue=[],cur=null,token=0;
  const ICON='<svg class="g1-say-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 18h8l11-9v30l-11-9H8z" fill="currentColor"/><path d="M32 17a9 9 0 0 1 0 14M36 11a17 17 0 0 1 0 26" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
  const OFF='<svg class="g1-say-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 18h8l11-9v30l-11-9H8z" fill="currentColor"/><path d="m33 19 10 10m0-10L33 29" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mark(btn){document.querySelectorAll('.g1-say.g1-playing').forEach(b=>b.classList.remove('g1-playing'));if(btn)btn.classList.add('g1-playing');}
  function stop(){token++;queue=[];if(player){player.onended=player.onerror=null;player.pause();}cur=null;mark(null);}
  function next(t){if(t!==token)return;const item=queue.shift();if(!item){cur=null;mark(null);return;}
    if(!player){player=new Audio();player.preload='auto';}
    cur=item;mark(item.btn);player.onended=()=>next(t);player.onerror=()=>next(t);player.src=item.src;
    let p;try{p=player.play();}catch(_){return next(t);}if(p&&p.catch)p.catch(()=>{if(t===token){queue=[];cur=null;mark(null);}});}
  /* play('نص') أو play([{text,lang},…]) — يوقف أي صوت سابق، ويتجاوز النصوص بلا تسجيل. */
  function play(items,lang,btn){stop();const list=(Array.isArray(items)?items:[items]).map(x=>typeof x==='string'?{text:x,lang}:x).map(x=>({src:file(x.text,x.lang||lang),btn})).filter(x=>x.src);if(!list.length)return false;queue=list;next(token);return true;}
  /* يشغّل تلقائيًا ما لم يوقف الطفل الصوت التلقائي. */
  function autoplay(items,lang){if(!auto())return false;return play(items,lang);}
  function setAuto(on){const s=store();try{s&&s.setItem(AUTO,on?'1':'0');}catch(_){}if(!on)stop();document.querySelectorAll('[data-say-auto]').forEach(b=>{b.setAttribute('aria-pressed',String(on));b.innerHTML=(on?ICON:OFF)+'<span>'+(on?'الصَّوْتُ يَعْمَلُ':'الصَّوْتُ مُتَوَقِّفٌ')+'</span>';});}
  /* زر 🔊 بأيقونة SVG؛ يعيد '' إن لم يوجد تسجيل للنص. */
  function button(text,opts){opts=opts||{};const t=clean(text),l=langOf(t,opts.lang);if(!has(t,l))return '';
    return '<button type="button" class="g1-say'+(opts.size?' g1-say-'+opts.size:'')+(opts.className?' '+opts.className:'')+'" data-say="'+esc(t)+'" data-say-lang="'+l+'" aria-label="'+esc(opts.label||'اسْتَمِعْ')+'">'+ICON+'</button>';}
  function autoToggle(){const on=auto();return '<button type="button" class="g1-say-toggle" data-say-auto aria-pressed="'+on+'">'+(on?ICON:OFF)+'<span>'+(on?'الصَّوْتُ يَعْمَلُ':'الصَّوْتُ مُتَوَقِّفٌ')+'</span></button>';}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-say],[data-say-auto]');if(!b)return;e.preventDefault();e.stopPropagation();
    if(b.hasAttribute('data-say-auto')){setAuto(!auto());return;}
    if(cur&&cur.btn===b){stop();return;}play(b.dataset.say,b.dataset.sayLang,b);},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  root.G1_AUDIO=Object.assign(api,{file,has,play,autoplay,stop,button,autoToggle,setAuto,get auto(){return auto();},ICON});
})(typeof window!=='undefined'?window:null);
