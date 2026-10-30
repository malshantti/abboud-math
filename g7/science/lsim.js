window.LSIM_EXTRA=[{"id": "x-s-mitosis-U1L3", "k": "sim", "sim": "mitosis", "t": "انقسام الخلية والنمو", "s": "محاكاة تفاعلية: النمو", "ic": "flask", "les": ["U1L3"]}, {"id": "x-s-muscle-U1L4", "k": "sim", "sim": "muscle", "t": "العضلات والحركة", "s": "محاكاة تفاعلية: الحركة", "ic": "flask", "les": ["U1L4"]}, {"id": "x-s-kidney-U1L5", "k": "sim", "sim": "kidney", "t": "الكلية والإخراج", "s": "محاكاة تفاعلية: الإخراج", "ic": "flask", "les": ["U1L5"]}, {"id": "x-s-reflex-U1L6", "k": "sim", "sim": "reflex", "t": "الفعل المنعكس والاستجابة", "s": "محاكاة تفاعلية: الاستجابة", "ic": "flask", "les": ["U1L6"]}];
/* ربط كل درس بمحاكاة المختبر المناسبة (l.sim) على نمط الصف السادس */
(function(){const A=window.APP,L=window.LAB;if(!A||!A.R||!A.R.u||!L)return;const {esc,ic,R}=A;
 (window.LSIM_EXTRA||[]).forEach(x=>{if(!L.items.some(i=>i.id===x.id))L.items.push(x)});
 const by={};L.items.filter(i=>i.k==='sim'&&window.SIMS&&window.SIMS[i.sim]).forEach(i=>(i.les||[]).forEach(id=>{(by[id]=by[id]||[]).push(i)}));
 (window.UNITS||[]).forEach(u=>u.les.forEach(l=>{if(by[l.id])l.sim=by[l.id][0].id}));
 const orig=R.u;R.u=id=>{const h=orig(id),xs=by[id];if(!xs)return h;
  const t=xs.map(it=>'<a class="tile c2 lsim" href="#/l/'+it.id+'" style="margin:12px 0;display:flex"><span class="ti">'+ic('flask')+'</span><b>جرّب في المختبر: '+esc(it.t)+'</b><small>محاكاة تفاعليّة مرتبطة بهذا الدّرس</small></a>').join('');
  const k=h.lastIndexOf('<button class="btn big" id="go"');return k<0?h+t:h.slice(0,k)+t+h.slice(k)};
})();
