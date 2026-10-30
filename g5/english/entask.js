/* مهامّ الاستماع والكتابة لكلّ وحدة (على نمط EN_TASKS في الصف السادس) — الكلمات والجمل من كتاب الطّالب */
(function(){const A=window.APP;if(!A||!A.R||!A.R.u)return;const {esc,R}=A;const U=window.UNITS||[];
 const LAT=/^[A-Za-z][A-Za-z '’\-]*$/;const pgT=p=>p?(p>1000?'ص '+(p-1000)+' ج٢':'ص '+p):'';
 const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
 const T={};U.forEach(u=>{const w=[],s=[];let pg=0;u.les.forEach(l=>{pg=pg||l.pg;(l.terms||[]).forEach(t=>{if(LAT.test(t[0])&&!w.some(x=>x.en===t[0]))w.push({en:t[0],ar:t[1],pg:l.pg})});
   (l.ex||[]).forEach(e=>{const m=/^[^()]*?___[^()]*/.exec(e[0]);const p=(/ص (\d+)/.exec(e[0])||[])[1];if(m&&/^[A-Za-z]/.test(e[1])){let q=m[0].replace(/^(Read and circle|Complete|Fill in the blanks?|Choose)\s*:\s*/i,'').trim();const full=q.replace('___',e[1]).replace(/\s+/g,' ');if(/^[A-Za-z][A-Za-z0-9 ,.'’?!\-]+$/.test(full)&&full.split(' ').length>=3)s.push({en:full,pg:p?+p:l.pg})}})});
  T[u.id]={words:w,sents:s,pg};});
 window.EN_TASKS=window.EN_TASKS||T;
 const st=document.createElement('style');st.textContent='.ent{margin:16px 0}.ent .b{border:1px solid #d9e4c8;border-radius:14px;padding:12px;margin:10px 0;background:#fbfdf7}.ent .chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;direction:ltr}.ent button.ch{border:1px solid #b8cba0;background:#fff;border-radius:999px;padding:6px 12px;font:inherit;cursor:pointer}.ent button.ch.ok{background:#5b8a3a;color:#fff}.ent button.ch.no{background:#f6dcd6}.ent .fb{min-height:1.4em;font-weight:700}.ent input{font:inherit;padding:6px 10px;border:1px solid #b8cba0;border-radius:10px;direction:ltr;width:100%;max-width:340px}';document.head.appendChild(st);
 const say=t=>{try{const u=new SpeechSynthesisUtterance(t);u.lang='en-GB';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u);return true}catch(e){return false}};
 const play=(t)=>'<button class="ch play" data-say="'+esc(t)+'">🔊 Listen — استمع</button>';
 function html(l){const t=T[l.u?l.u.id:(U.find(u=>u.les.includes(l))||{}).id];if(!t||t.words.length<3)return '';
  const W=sh(t.words).slice(0,4),tg=W[0];let h='<section class="ent card"><h3>مهامّ الوحدة: استماع وكتابة</h3><p class="mut small">الكلمات والجمل من كتاب الطّالب لهذه الوحدة.</p>';
  h+='<div class="b" data-k="listen" data-a="'+esc(tg.en)+'"><b>١) Listen and choose — استمع واختر</b> <span class="mut small">('+pgT(tg.pg)+')</span><div class="chips">'+play(tg.en)+'</div><div class="chips">'+sh(W).map(w=>'<button class="ch opt" data-v="'+esc(w.en)+'">'+esc(w.en)+'</button>').join('')+'</div><div class="fb"></div><button class="ch show mut small" data-show="'+esc(tg.en)+'">لا يعمل الصّوت؟ اعرض الكلمة</button></div>';
  const D=sh(t.words)[0];
  h+='<div class="b" data-k="write" data-a="'+esc(D.en)+'"><b>٢) Listen and write — استمع واكتب</b> <span class="mut small">('+pgT(D.pg)+')</span><p class="mut small">معناها: '+esc(D.ar)+'</p><div class="chips">'+play(D.en)+'</div><input placeholder="Write the word" autocomplete="off" spellcheck="false"> <button class="ch chk">Check — تحقّق</button><div class="fb"></div></div>';
  if(t.sents.length){const S=sh(t.sents)[0];const ws=S.en.replace(/[.?!]$/,'').split(' ');
   h+='<div class="b" data-k="order" data-a="'+esc(ws.join(' '))+'"><b>٣) Listen and write the sentence in order — رتّب الجملة</b> <span class="mut small">('+pgT(S.pg)+')</span><div class="chips">'+play(S.en)+'</div><div class="chips src">'+sh(ws.map((w,i)=>'<button class="ch w" data-i="'+i+'" data-w="'+esc(w)+'">'+esc(w)+'</button>')).join('')+'</div><div class="chips out" style="min-height:40px;border-bottom:2px dashed #b8cba0"></div><button class="ch reset">Again — أعد</button><div class="fb"></div></div>'}
  return h+'</section>'}
 function bind(){document.querySelectorAll('.ent [data-say]').forEach(b=>b.onclick=()=>{if(!say(b.dataset.say))b.nextElementSibling;});
  document.querySelectorAll('.ent .show').forEach(b=>b.onclick=()=>{b.textContent=b.dataset.show});
  document.querySelectorAll('.ent [data-k=listen]').forEach(x=>{const fb=x.querySelector('.fb');x.querySelectorAll('.opt').forEach(o=>o.onclick=()=>{const ok=o.dataset.v===x.dataset.a;o.classList.add(ok?'ok':'no');fb.textContent=ok?'Well done! أحسنت ✓':'Try again — حاول مرّة أخرى'})});
  document.querySelectorAll('.ent [data-k=write]').forEach(x=>{const fb=x.querySelector('.fb'),i=x.querySelector('input');x.querySelector('.chk').onclick=()=>{const ok=i.value.trim().toLowerCase()===x.dataset.a.toLowerCase();fb.textContent=ok?'Well done! أحسنت ✓':'Not yet — الصّواب: '+x.dataset.a}});
  document.querySelectorAll('.ent [data-k=order]').forEach(x=>{const fb=x.querySelector('.fb'),out=x.querySelector('.out'),src=x.querySelector('.src');const chk=()=>{if(src.querySelectorAll('.w').length)return;const s=[...out.children].map(c=>c.dataset.w).join(' ');fb.textContent=s===x.dataset.a?'Well done! أحسنت ✓':'Not yet — الصّواب: '+x.dataset.a};
   src.querySelectorAll('.w').forEach(w=>w.onclick=()=>{out.appendChild(w);w.onclick=null;chk()});x.querySelector('.reset').onclick=()=>{[...out.children].forEach(w=>{src.appendChild(w);w.onclick=()=>{out.appendChild(w);w.onclick=null;chk()}});fb.textContent=''}})}
 const find=id=>{let r;U.forEach(u=>u.les.forEach(l=>{if(l.id===id)r=l}));return r};
 const orig=R.u;R.u=id=>{const h=orig(id),l=find(id);const x=l?html(l):'';if(!x)return h;const k=h.lastIndexOf('<button class="btn big" id="go"');return k<0?h+x:h.slice(0,k)+x+h.slice(k)};
 const oa=R.after_u;R.after_u=function(){const r=oa?oa.apply(this,arguments):undefined;bind();return r};
})();
