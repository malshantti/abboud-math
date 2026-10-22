// دروس «تمارين عامة»: مراجعة الوحدة بأمثلة محلولة من دروسها ومولّد أسئلة مختلط منها
(function(){const C=window.CURR,CT=window.CONTENT=window.CONTENT||{},G=window.GEN;if(!C||!G)return;
C.semesters.forEach(s=>s.units.forEach(u=>{const ls=u.lessons.filter(l=>!/تمارين عامة/.test(l.title)),rv=u.lessons.filter(l=>/تمارين عامة/.test(l.title));
 const gens=ls.map(l=>l.id).filter(id=>G[id]);if(!gens.length)return;
 rv.forEach(l=>{const unitName=u.title.split(':')[0];
  if(!G[l.id])G[l.id]=i=>G[gens[Math.floor(Math.random()*gens.length)]](i);
  if(!CT[l.id]){const ex=[];ls.forEach(x=>{const c=CT[x.id];if(c&&c.ex&&c.ex[0])ex.push([x.number+' '+x.title+': '+c.ex[0][0],c.ex[0][1]])});
   CT[l.id]={b:s.id==='S2'?2:1,pg:String(l.page),goal:'في هذا الدرس نراجع '+unitName+' كلها: '+ls.map(x=>x.title).join('، ')+'.',
    t:'هذه تمارين عامة على '+unitName+'. اقرأ مثالًا محلولًا من كل درس لتتذكّر الفكرة، ثم ابدأ التدريب: الأسئلة مختلطة من جميع دروس الوحدة.',ex}}})}));
})();
