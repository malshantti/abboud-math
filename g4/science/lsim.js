window.LSIM_EXTRA=[{"id": "x-s-digest-U1L5", "k": "sim", "sim": "digest", "t": "رحلة الطعام في الجهاز الهضمي", "s": "محاكاة تفاعلية: صحة الجهاز الهضمي وسلامته", "ic": "flask", "les": ["U1L5"]}, {"id": "x-s-breath-U1L7", "k": "sim", "sim": "breath", "t": "رحلة الهواء في الجهاز التنفسي", "s": "محاكاة تفاعلية: صحة الجهاز التنفسي وسلامته", "ic": "flask", "les": ["U1L7"]}, {"id": "x-s-chain-U5L2", "k": "sim", "sim": "chain", "t": "السلسلة الغذائية في النظام البيئي", "s": "محاكاة تفاعلية: النظام البيئي", "ic": "flask", "les": ["U5L2"]}];
/* ربط كل درس بمحاكاة المختبر المناسبة (l.sim) على نمط الصف السادس */
(function(){const A=window.APP,L=window.LAB;if(!A||!A.R||!A.R.u||!L)return;const {esc,ic,R}=A;
 (window.LSIM_EXTRA||[]).forEach(x=>{if(!L.items.some(i=>i.id===x.id))L.items.push(x)});
 const by={};L.items.filter(i=>i.k==='sim'&&window.SIMS&&window.SIMS[i.sim]).forEach(i=>(i.les||[]).forEach(id=>{(by[id]=by[id]||[]).push(i)}));
 (window.UNITS||[]).forEach(u=>u.les.forEach(l=>{if(by[l.id])l.sim=by[l.id][0].id}));
 const orig=R.u;R.u=id=>{const h=orig(id),xs=by[id];if(!xs)return h;
  const t=xs.map(it=>'<a class="tile c2 lsim" href="#/l/'+it.id+'" style="margin:12px 0;display:flex"><span class="ti">'+ic('flask')+'</span><b>جرّب في المختبر: '+esc(it.t)+'</b><small>محاكاة تفاعليّة مرتبطة بهذا الدّرس</small></a>').join('');
  const k=h.lastIndexOf('<button class="btn big" id="go"');return k<0?h+t:h.slice(0,k)+t+h.slice(k)};
})();
