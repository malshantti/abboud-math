/* الأساسيات: خلاصة كل درس وقواعد «أتعلّم» من كتاب الصف نفسه، ومراجعة المتطلبات السابقة. */
(function(){
const C=window.CURR,K=window.CONTENT||{},V=window.V||{};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const I=(n,c)=>window.ICON?window.ICON(n,c||'sm'):'';
const T=[['sum','خلاصة الدروس','فكرة كل درس في سطرين، مرتّبة حسب الوحدات.','book'],['rules','قواعد «أتعلّم»','القواعد كما وردت في صناديق «أتعلّم» في الكتاب.','star'],['pre','قبل أن تبدأ','مراجعة مهارات الصفوف السابقة التي تحتاجها.','book']];
const units=()=>C.semesters.flatMap(s=>s.units.map(u=>Object.assign({sem:s},u)));
const back='<p><a class="back" href="#/basics">'+I('back')+' الأساسيات</a></p>';
function view(arg){
 if(arg==='sum'||arg==='rules'){const r=arg==='rules';return back+'<h1>'+(r?'قواعد «أتعلّم»':'خلاصة الدروس')+'</h1>'+units().map(u=>{const ls=u.lessons.filter(l=>K[l.id]&&(r?K[l.id].r&&K[l.id].r.length:K[l.id].t));if(!ls.length)return'';
  return '<details class="card bas-unit"><summary><b>'+esc(u.title)+'</b></summary>'+ls.map(l=>{const c=K[l.id];return '<div class="bas-l"><a href="#/lesson/'+l.id+'"><b>'+esc(l.number?l.number+' ':'')+esc(l.title)+'</b></a>'+(r?'<ul>'+c.r.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+esc(c.t)+'</p>')+(c.pg?'<small class="bas-pg">كتاب الطالب · ص '+esc(c.pg)+'</small>':'')+'</div>'}).join('')+'</details>'}).join('')}
 if(arg==='pre')return back+'<h1>قبل أن تبدأ</h1>'+C.prerequisites.map(p=>{const c=K[p.id];return '<div class="card bas-l"><a href="#/lesson/'+p.id+'"><b>'+esc(p.title)+'</b></a>'+(c&&c.t?'<p>'+esc(c.t)+'</p>':'')+'</div>'}).join('');
 return '<h1>'+I('book')+' الأساسيات</h1><p class="muted">كل ما تحتاجه من الكتاب في مكان واحد للمراجعة السريعة.</p><div class="bas-grid">'+T.map(t=>'<a class="card bas-tile" href="#/basics/'+t[0]+'">'+I(t[3])+'<b>'+t[1]+'</b><small>'+t[2]+'</small></a>').join('')+'</div>';
}
window.BASICS_VIEW=view;
const st=document.createElement('style');st.textContent='.bas-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.bas-tile{display:flex;flex-direction:column;gap:6px;min-height:120px;text-decoration:none;color:inherit;padding:18px}.bas-tile b{font-size:18px}.bas-tile small,.bas-pg{font-size:14px;color:var(--mut,#667)}.bas-unit summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:17px}.bas-l{padding:10px 0;border-top:1px solid var(--line,#e5e5e5)}.bas-l p,.bas-l li{font-size:16px;line-height:1.8}.bas-l a{display:inline-block;min-height:44px;line-height:44px}';document.head.appendChild(st);
})();
