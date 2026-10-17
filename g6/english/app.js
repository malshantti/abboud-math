/* الإنجليزية للصف السادس: التوجيه، والدروس، والتدريب، والاستماع، والنطق، والاختبارات، وتحديد المستوى، والتقرير. */
(function(){
'use strict';
const KEY='bustan_g6_english_v1',$=s=>document.querySelector(s),app=$('#app');
const E=window.ENC,I=(n,c)=>window.ICON?ICON(n,c):'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ICS={spk:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 010 7M18.5 6a8 8 0 010 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
 mic:'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0012 0M12 17v4M9 21h6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
 slow:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M3 17h13a4 4 0 004-4 5 5 0 00-10 0v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="20" cy="9" r="1.6" fill="currentColor"/></svg>',
 stop:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>'};
const AUB=(t,o)=>{o=o||{};return `<button class="au${o.big?' big':''}" type="button" data-say="${esc(t)}"${o.v?` data-v="${esc(o.v)}"`:''} aria-label="استمع: ${esc(t)}" title="استمع">${ICS.spk}${o.label?`<span>${o.label}</span>`:''}</button>`};
const EN=(t,tag)=>`<${tag||'span'} class="en" dir="ltr" lang="en">${esc(t)}</${tag||'span'}>`;
const today=()=>new Date().toISOString().slice(0,10);
/* ---------- الحالة ---------- */
const blank=()=>({v:1,xp:0,streak:0,lastDay:'',units:{},skills:{},place:null,wrong:[],log:[],min:0});
const storedProgress=()=>window.PROFILES&&PROFILES.readProgress?PROFILES.readProgress(KEY):localStorage.getItem(KEY);
let S;try{S=Object.assign(blank(),JSON.parse(storedProgress()||'null')||{})}catch(e){S=blank()}
const writeProgress=window.PROFILES&&PROFILES.writer?PROFILES.writer(KEY):v=>{try{localStorage.setItem(KEY,v);return true}catch(e){return false}};
const save=()=>{if(window.__noSave)return;return writeProgress(JSON.stringify(S))};
const U=id=>S.units[id]||(S.units[id]={lesson:0,prac:{n:0,ok:0},quiz:{best:null,last:null,n:0},speak:{n:0,best:0}});
function day(){const d=today();if(S.lastDay===d)return;const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak=S.lastDay===y?S.streak+1:1;S.lastDay=d;save()}
const addSkill=(k,ok)=>{const s=S.skills[k]||(S.skills[k]={n:0,ok:0});s.n++;if(ok)s.ok++};
const pct=(a,b)=>b?Math.round(100*a/b):null;
let t0=Date.now();setInterval(()=>{if(document.visibilityState==='visible'){S.min=(S.min||0)+1;save()}},60000);
function hdr(){$('#hstreak').textContent=S.streak||0;$('#hpts').textContent=S.xp||0;const lv=1+Math.floor((S.xp||0)/200);$('#hlvl').textContent=lv;$('#hxp').style.width=((S.xp||0)%200)/2+'%';$('#hxpt').textContent=((S.xp||0)%200)+' / 200'}
/* ---------- مساعدات الواجهة ---------- */
const allUnits=()=>E.units;
const unitStatus=id=>{const u=S.units[id];if(!u)return'new';if(u.quiz.best!=null&&u.quiz.best>=80)return'mastered';return u.lesson||u.prac.n?'learning':'new'};
const stLabel={new:'لم تبدأ',learning:'قيد التعلّم',mastered:'متقنة'};
function speedBar(){const r=AU.rate();return `<div class="speed" role="group" aria-label="سرعة الصوت"><button type="button" data-rate="1" class="${r>=1?'on':''}">سرعة عادية</button><button type="button" data-rate="0.75" class="${r<1?'on':''}">${ICS.slow} بطيئة</button></div>`}
function page(label,html,tab){$('#page-label').textContent=label;app.innerHTML=html;const t=(window.EN_SEC_TABS||{})[location.hash.slice(2).split('/')[0]]||tab;document.querySelectorAll('.tabs a[data-t]').forEach(a=>a.classList.toggle('on',a.dataset.t===t));window.scrollTo(0,0);hdr()}
document.addEventListener('click',e=>{const zb=e.target.closest('.zbtn');if(zb){AU.zay(+zb.dataset.z);return}const ab=e.target.closest('.arb');if(ab){e.preventDefault();AU.playAr(ab.dataset.ar,{btn:ab});return}const b=e.target.closest('.au');if(b){e.preventDefault();if(b.classList.contains('playing')){AU.stop();return}AU.play(b.dataset.say,{btn:b,voice:b.dataset.v});return}
 const r=e.target.closest('[data-rate]');if(r){AU.setRate(+r.dataset.rate);document.querySelectorAll('.speed button').forEach(x=>x.classList.toggle('on',(+x.dataset.rate<1)===(+r.dataset.rate<1)));return}});
const FEM=/^(nadia|tina|huda|grandma|mum|mother|sara|sarah|rania|lina|maha|reem|amal|layla|leila|mrs|miss|ms|woman|girl|aunt|noor|nour|hana|dana|salma|maryam|fatima|aisha|zeina|samira|sana|muna|rasha|suha|wafa|basma|lubna|ruba|hiba|jenny|alba|teacher \(f\))/i;
const gOf=l=>l.g?(/^f/i.test(l.g)?'f':'m'):(FEM.test(l.sp||'')?'f':'m');
/* ---------- الصفحة الرئيسية ---------- */
let zWel=0;function homeLegacy(){day();if(!zWel++)setTimeout(()=>AU.zay(0),600);const us=allUnits();const ms=us.filter(u=>unitStatus(u.id)==='mastered').length;
 const pl=S.place;const sem=n=>us.filter(u=>u.sem===n);
 const card=u=>{const st=unitStatus(u.id),q=S.units[u.id]&&S.units[u.id].quiz.best;return `<a class="card tap ucard-en st-${st}" href="#/u/${u.id}"><span class="un">${u.n}</span><span class="ut">${EN(u.title,'b')}<small>${u.revision?'مراجعة':stLabel[st]}${q!=null?' · أفضل نتيجة '+q+'%':''}</small></span>${st==='mastered'?I('check','ic'):''}</a>`};
 page('رحلتي',`
 <section class="hero-en card"><button class="zbtn" type="button" data-z="0" aria-label="استمع إلى زيتون"><img src="img/zaytoun-teacher.webp" alt="" width="96" height="112"></button><div><h1>أهلًا بك في الإنجليزية</h1><p>اضغط زر الاستماع ${ICS.spk} لسماع التسجيل المتاح، ثم كرّر بصوتك. عند غياب الصوت يمكنك قراءة النص والمتابعة.</p>${speedBar()}</div></section>
 ${E.sample?`<div class="note warn">${I('warn','ic')} المحتوى المعروض الآن عيّنة مؤقتة من الوحدة الأولى، وسيُستبدل بمحتوى الكتاب الكامل.</div>`:''}
 ${!pl?`<a class="card tap cta" href="#/place">${I('target','ic')}<span><b>ابدأ باختبار تحديد المستوى</b><small>٣٠ سؤالًا قصيرًا في الأساسيات والقواعد والمفردات والاستماع، نعرف بعدها من أين تبدأ.</small></span></a>`:`<div class="card place-res"><b>نتيجة تحديد المستوى: ${pl.score}%</b><p>${pl.rec.length?'ننصحك بالبدء بمسار التأسيس: '+pl.rec.map(id=>`<a href="#/f/${id}">${esc(E.byId[id].ar)}</a>`).join('، '):'مستواك في الأساسيات جيد؛ تابع وحدات الكتاب.'}</p><a href="#/place" class="small-note">إعادة الاختبار</a></div>`}
 <h2 class="sec-title">${I('seed','ic')} التأسيس</h2>
 <a class="card tap found-cta" href="#/found"><span><b>الحروف والأصوات والكلمات الأساسية</b><small>${E.found.length} مراحل قصيرة: أصوات الحروف، والقراءة، والكلمات الأكثر تكرارًا، وقواعد أساسية.</small></span>${I('arrow','ic')}</a>
 <h2 class="sec-title">${I('book','ic')} الفصل الأول: الكتاب 6A</h2><div class="ugrid">${sem(1).map(card).join('')}</div>
 <h2 class="sec-title">${I('book','ic')} الفصل الثاني: الكتاب 6B</h2><div class="ugrid">${sem(2).map(card).join('')}</div>
 <div class="card kpis"><div><b>${ms}</b><small>وحدات متقنة</small></div><div><b>${S.wrong.length}</b><small>أسئلة للمراجعة</small></div><div><b>${S.min||0}</b><small>دقيقة تعلّم</small></div></div>
 ${S.wrong.length?`<a class="btn wide" href="#/review">${I('review','ic')} راجع أخطائي</a>`:''}`,'home')}
/* ---------- التأسيس ---------- */
function foundLegacy(){page('التأسيس',`<h1 class="h1">مسار التأسيس</h1><p class="muted">هذا المسار ليس من الكتاب المدرسي؛ أُعدّ لتقوية الأساسيات قبل دروس الصف السادس وفي أثنائها.</p>${speedBar()}
 <div class="ugrid">${E.found.map((f,i)=>{const st=unitStatus(f.id);return `<a class="card tap ucard-en st-${st}" href="#/f/${f.id}"><span class="un">${i+1}</span><span class="ut"><b>${esc(f.ar)}</b><small>${EN(f.title)} · ${stLabel[st]}</small></span>${st==='mastered'?I('check','ic'):''}</a>`}).join('')}</div>`,'found')}
function fmod(id){const f=E.byId[id];if(!f)return go('#/found');const u=U(id);u.lesson=1;save();
 const it=f.items;const vl=xs=>`<ul class="vlist">${xs.map(x=>`<li>${AUB(x.en)}<span class="vw">${EN(x.en,'b')}${x.ar?`<small>${esc(x.ar)}</small>`:''}</span></li>`).join('')}</ul>`;
 const grid=f.kind==='letters'?`<div class="letters">${it.map(x=>`<div class="lt"><b dir="ltr">${esc(x.letter.toUpperCase()+' '+x.letter)}</b>${x.sound?`<small dir="ltr">${esc(x.sound)}</small>`:''}${AUB(x.say||x.en)}<span class="en" dir="ltr">${esc(x.en)}</span><small>${esc(x.ar)}</small></div>`).join('')}</div>`:
 f.groups?f.groups.map(g=>`<div class="grp"><h3 dir="auto">${esc(g.title)}</h3>${g.ar?`<p class="muted">${esc(g.ar)}</p>${AU.hasAr(g.ar)?`<button class="btn ghost sm arb" type="button" data-ar="${esc(g.ar)}">${ICS.spk} استمع إلى الشرح</button>`:''}`:''}${f.kind==='phonics'?`<div class="chips-en">${g.items.map(x=>`<span class="chip-en">${AUB(x.en)}${EN(x.en)}</span>`).join('')}</div>`:vl(g.items)}</div>`).join(''):vl(it);
 page(f.ar,`<a class="back" href="#/found">${I('back','ic')} التأسيس</a><h1 class="h1">${esc(f.ar)}</h1><p class="muted">${esc(f.desc)}</p>${speedBar()}
 <div class="card"><div class="row-h"><b>استمع وكرّر</b><button class="btn sec sm" id="playall" type="button">${ICS.spk} استمع إلى الكل</button></div>${grid}</div>
 ${actions(id)}`,'found');
 $('#playall').onclick=async e=>{const b=e.currentTarget;if(b.dataset.on){b.dataset.on='';AU.stop();return}b.dataset.on=1;await AU.playSeq(it.map(x=>({en:x.say||x.en})),{stopped:()=>!b.dataset.on});b.dataset.on=''}}
function actions(id){const u=E.byId[id];const sp=!!(u.kind||u.vocab&&u.vocab.length||u.sentences&&u.sentences.length||u.dialogues&&u.dialogues.length);return `<div class="acts">
 <a class="act-b" href="#/p/${id}/mix">${I('dumbbell','ic')}<b>تدريب</b><small>أسئلة متنوعة مع شرح</small></a>
 <a class="act-b" href="#/p/${id}/listen">${ICS.spk}<b>استماع</b><small>استمع واختر</small></a>
 <a class="act-b" href="#/p/${id}/spell">${I('pen','ic')}<b>إملاء</b><small>استمع واكتب</small></a>
 ${u.dialogues&&u.dialogues.length?`<a class="act-b" href="#/p/${id}/order">${I('chat','ic')}<b>رتّب الحوار</b><small>استمع ثم رتّب</small></a>`:''}
 ${wordsOf(id).length?`<a class="act-b" href="#/w/${id}/0">${ICS.mic}<b>نطق الكلمات</b><small>مقاطع ونبر ونصائح</small></a>`:''}${sp?`<a class="act-b" href="#/s/${id}">${ICS.mic}<b>نطق الجمل</b><small>تكلّم وقارن</small></a>`:''}
 <a class="act-b quiz" href="#/q/${id}">${I('quiz','ic')}<b>اختبار</b><small>عشرة أسئلة، والإتقان 80%</small></a></div>`}
/* ---------- درس الوحدة ---------- */
function unit(id){const u=E.byId[id];if(!u)return go('#/home');U(id).lesson=1;save();
 const voc=u.vocab.length?`<div class="card"><div class="row-h"><h2>${I('cards','ic')} المفردات</h2><button class="btn sec sm" id="pv" type="button">${ICS.spk} استمع إلى الكل</button></div><ul class="vlist">${u.vocab.map((w,wi)=>{const im=IMG(id).find(x=>x.words.includes(w.en));return `<li>${AUB(w.en)}${im?`<img class="vthumb" src="bookimg/${im.f}" loading="lazy" decoding="async" alt="${esc(w.en)}" title="من كتاب الطالب ص ${im.p}">`:''}<span class="vw">${EN(w.en,'b')}${pronOf(w.en)?`<span class="ipa-s" dir="ltr">${esc(pronOf(w.en).words.map(x=>x.ipa).join(' '))}</span>`:''}<small>${esc(w.ar)}</small>${w.ex?`<span class="ex-en">${AUB(w.ex)}${EN(w.ex)}</span>`:''}</span><a class="lp" href="#/w/${id}/${wi}" aria-label="تعلّم نطق ${esc(w.en)}" title="تعلّم النطق">${ICS.mic}</a></li>`}).join('')}</ul></div>`:'';
 const dlg=u.dialogues.map((d,k)=>`<div class="card dlg-en"><div class="row-h"><h2>${I('chat','ic')} ${EN(d.title)}</h2><button class="btn sec sm pd" data-k="${k}" type="button">${ICS.spk} استمع إلى الحوار</button></div>${(()=>{const ims=IMG(id).filter(i=>d.page&&i.p==d.page).slice(0,3);return ims.length?`<div class="bkrow">${ims.map(i=>FIG(i)).join('')}</div>`:''})()}${d.lines.map((l,j)=>`<div class="ln g-${gOf(l)}" data-k="${k}" data-j="${j}">${AUB(l.en,{v:l.sp})}<p dir="ltr" lang="en">${l.sp?`<b>${esc(l.sp)}:</b> `:''}${esc(l.en)}</p></div>`).join('')}</div>`).join('');
 const txt=u.texts.map((t,k)=>{const ss=t.en.split(/\n\s*\n/).map(p=>p.split(/(?<=[.!?])\s+(?=[A-Z"'])/));return `<div class="card rd"><div class="row-h"><h2>${I('book','ic')} ${EN(t.title)}</h2><button class="btn sec sm pt" data-k="${k}" type="button">${ICS.spk} استمع إلى النص</button></div>${(()=>{const ims=IMG(id).filter(i=>t.page&&i.p==t.page).slice(0,3);return ims.length?`<div class="bkrow">${ims.map(i=>FIG(i)).join('')}</div>`:''})()}<div class="rtext" dir="ltr" lang="en" data-k="${k}">${ss.map(p=>`<p>${p.map(s=>`<span class="sn" data-say="${esc(s)}" tabindex="0" role="button">${esc(s)}</span>`).join(' ')}</p>`).join('')}</div><small class="muted">اضغط أي جملة لتسمعها وحدها.</small></div>`}).join('');
 const gr=u.grammar.length?`<div class="card"><h2>${I('bulb','ic')} القواعد</h2>${u.gramEn.length?`<div class="chips-en">${u.gramEn.map(t=>`<span class="tag-en" dir="ltr" lang="en">${esc(t)}</span>`).join('')}</div>`:''}${u.grammar.map(g=>`<div class="gr"><b dir="auto">${esc(g.title)}</b>${g.ar?`<p>${esc(g.ar)}</p>${AU.hasAr(g.ar)?`<button class="btn ghost sm arb" type="button" data-ar="${esc(g.ar)}">${ICS.spk} استمع إلى الشرح</button>`:''}`:''}${g.examples.length?`<ul>${g.examples.map(x=>`<li>${AUB(x)}${EN(x)}</li>`).join('')}</ul>`:''}</div>`).join('')}${GEN.hasGrammar(id)?`<a class="btn sec" href="#/p/${id}/grammar">${I('dumbbell','ic')} تدرّب على القواعد</a>`:''}</div>`:'';
 const pr=u.pron.length?`<div class="card"><h2>${ICS.mic} النطق</h2>${u.pron.map(p=>`<div class="gr"><b dir="ltr" lang="en">${esc(p.title)}</b><div class="chips-en">${p.words.map(w=>`<span class="chip-en">${AUB(w)}${EN(w)}</span>`).join('')}</div></div>`).join('')}</div>`:'';
 const sn=u.sentences.length?`<div class="card"><h2>${I('pencil','ic')} جمل مهمة</h2><ul class="vlist">${u.sentences.map(s=>`<li>${AUB(s.en)}<span class="vw">${EN(s.en)}${s.ar?`<small>${esc(s.ar)}</small>`:''}</span></li>`).join('')}</ul></div>`:'';
 const ev=u.everyday.length?`<div class="card"><h2>${I('chat','ic')} عبارات يومية</h2><ul class="vlist">${u.everyday.map(s=>`<li>${AUB(s)}${EN(s)}</li>`).join('')}</ul></div>`:'';
 const empty=!(u.vocab.length||u.dialogues.length||u.texts.length||u.sentences.length);
 page('الوحدة '+u.n,`<a class="back" href="#/home">${I('back','ic')} الوحدات</a>
 <div class="uhead"><span class="un big">${u.n}</span><div><h1 class="h1">${EN(u.title)}</h1><small class="muted">${u.sem===1?'الكتاب 6A':'الكتاب 6B'}${u.page?' · صفحة '+esc(u.page):''}</small></div></div>
 ${u.task?`<p class="muted fn">مهمة الوحدة: <span dir="ltr" lang="en">${esc(u.task)}</span></p>`:''}${u.functions.length?`<p class="muted fn">في هذه الوحدة: <span dir="ltr" lang="en">${u.functions.map(esc).join(' · ')}</span></p>`:''}
 ${(window.EN_TASKS||{})[u.id]?`<a class="card tap cta tk-cta" href="#/x/${u.id}">${I('target','ic')}<span><b>مهارات الوحدة من حصص الكتاب</b><small>استماع ثانٍ، وصح أو خطأ، واستمع واكتب، ومهام كتابة قصيرة، مع رقم الصفحة.</small></span></a>`:''}
 ${speedBar()}<button class="btn ghost sm" id="offl" type="button">${I('download','ic')} نزّل صوت الوحدة وصورها للاستخدام دون إنترنت (${mb(AU.bytes(unitTexts(u))+OIMG(u.id).reduce((a,i)=>a+i.z,0))})</button>
 ${empty?`<div class="note">${I('clock','ic')} محتوى هذه الوحدة من الكتاب قيد الإعداد. تستطيع الآن التدرّب على قواعدها.</div>`:''}
 ${(()=>{const used=new Set([...u.dialogues.map(d=>d.page),...u.texts.map(t=>t.page)].filter(Boolean).map(String));const rest=IMG(id).filter(i=>!used.has(String(i.p)));return rest.length?`<details class="card bkgal"><summary>${I('book','ic')} صور من كتاب الطالب (${rest.length})</summary><div class="bkgrid">${rest.map(i=>FIG(i)).join('')}</div></details>`:''})()}${voc}${dlg}${txt}${sn}${ev}${gr}${pr}${actions(id)}`,'home');
 $('#pv')&&($('#pv').onclick=e=>toggleSeq(e.currentTarget,u.vocab.map(w=>({en:w.en}))));
 document.querySelectorAll('.pd').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;toggleSeq(b,u.dialogues[k].lines.map((l,j)=>({en:l.en,voice:l.sp,g:gOf(l),el:document.querySelector(`.ln[data-k="${k}"][data-j="${j}"]`)})))});
 document.querySelectorAll('.pt').forEach(b=>b.onclick=()=>{const els=[...document.querySelectorAll(`.rtext[data-k="${b.dataset.k}"] .sn`)];toggleSeq(b,els.map(el=>({en:el.dataset.say,el})))});
 document.querySelectorAll('.sn').forEach(el=>{const f=()=>{hl(el);AU.play(el.dataset.say).then(()=>el.classList.remove('hl'))};el.onclick=f;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
 $('#offl').onclick=()=>offline(u,$('#offl'));
 offStatus(u).then(r=>{const b=$('#offl');if(!b||!r.total)return;const st=document.createElement('p');st.className='muted small-note offst';
  if(r.have>=r.total){b.insertAdjacentHTML('afterend','<span class="badge-off">متاح دون إنترنت</span>');b.hidden=true}
  else if(navigator.onLine===false){st.innerHTML='<b>هذه الوحدة غير منزّلة على هذا الجهاز.</b> أنت الآن دون إنترنت، فقد لا تعمل بعض الأصوات والصور ('+r.have+' من '+r.total+' محفوظة). اتصل بالإنترنت ثم اضغط زر التنزيل.';b.after(st)}
  else if(r.have)st.textContent='محفوظ على هذا الجهاز: '+r.have+' من '+r.total+' ملفًا.',b.after(st)})}
const mb=b=>b>=1e6?(b/1e6).toFixed(1).replace('.0','')+' ميغابايت':Math.max(1,Math.round(b/1e3))+' كيلوبايت';
const IMG=id=>(window.EN_IMG||{})[id]||[];
/* صور الوحدة + صور المفردات من الجزء نفسه (تُستخدم في «استمع واختر الصورة») */
const OIMG=id=>{const m=IMG(id),bs=new Set(m.map(i=>i.b)),s=new Set(m.map(i=>i.f));return m.concat(Object.values(window.EN_IMG||{}).flat().filter(i=>i.words.length&&bs.has(i.b)&&!s.has(i.f)))};
const FIG=(i,cls)=>`<figure class="bk${cls?' '+cls:''}"><img src="bookimg/${i.f}" loading="lazy" decoding="async" width="${i.w}" height="${i.h}" alt="صورة من كتاب الطالب صفحة ${i.p}"><figcaption>من كتاب الطالب ص ${i.p}</figcaption></figure>`;
function hl(el){document.querySelectorAll('.hl').forEach(x=>x.classList.remove('hl'));if(el){el.classList.add('hl')}}
async function toggleSeq(b,lines){if(b.dataset.on){b.dataset.on='';AU.stop();hl(null);return}b.dataset.on=1;b.classList.add('playing');await AU.playSeq(lines,{stopped:()=>!b.dataset.on,each:l=>hl(l.el)});b.dataset.on='';b.classList.remove('playing');hl(null)}
function unitTexts(u){return[...u.vocab.flatMap(w=>[w.en,w.ex]),...u.dialogues.flatMap(d=>d.lines.map(l=>l.en)),...u.texts.flatMap(t=>[t.en,...t.en.split(/\n\s*\n/).flatMap(p=>p.split(/(?<=[.!?])\s+(?=[A-Z"'])/))]),...u.sentences.map(s=>s.en),...u.grammar.flatMap(g=>g.examples),...u.pron.flatMap(p=>p.words),...u.everyday].filter(Boolean)}
const offFiles=u=>AU.files(u.all||unitTexts(u)).concat((u.all?Object.values(window.EN_IMG||{}).flat():OIMG(u.id)).map(i=>'bookimg/'+i.f));
async function offStatus(u){const fs=offFiles(u);if(!fs.length||!('caches' in window))return{have:0,total:fs.length};const c=await caches.open('g6en-audio-v1');let have=0;for(const f of fs)if(await c.match(f,{ignoreVary:true}))have++;return{have,total:fs.length}}
// تنزيل قابل للاستئناف: يتخطّى المحفوظ، ويعيد المحاولة ثلاث مرات، ويعرض التقدّم، ويتوقف بوضوح إن انقطع الاتصال
async function offline(u,b){const fs=offFiles(u);if(!fs.length){b.textContent='لا توجد ملفات صوت لهذه الوحدة بعد. يمكنك قراءة النصوص والمتابعة.';return}if(!('caches' in window)){b.textContent='المتصفح لا يدعم التخزين دون إنترنت.';return}
 if(b.dataset.run)return;b.dataset.run=1;b.disabled=true;let pr=b.nextElementSibling;if(!pr||!pr.classList.contains('dlp')){pr=document.createElement('div');pr.className='dlp';b.after(pr)}
 pr.innerHTML='<progress max="'+fs.length+'" value="0"></progress><small class="muted" role="status"></small>';const bar=pr.querySelector('progress'),msg=pr.querySelector('small');
 const c=await caches.open('g6en-audio-v1');let n=0,fail=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
 for(const f of fs){if(!document.body.contains(b))break;let ok=false;
  for(let t=0;t<3&&!ok;t++){try{if(await c.match(f,{ignoreVary:true})){ok=true;break}if(navigator.onLine===false)throw 0;const r=await fetch(f,{cache:'no-cache'});if(!r.ok)throw r.status;await c.put(f,r);ok=true}catch(e){if(navigator.onLine===false)break;await wait(400*(t+1))}}
  if(ok)n++;else fail.push(f);bar.value=n+fail.length;msg.textContent='جارٍ التنزيل: '+n+' من '+fs.length+(fail.length?' (تعذّر '+fail.length+')':'')}
 delete b.dataset.run;if(!document.body.contains(b))return;b.disabled=false;
 if(!fail.length){try{localStorage.setItem('en_off_'+(u.id||'all'),'1')}catch(e){}b.textContent='متاح دون إنترنت ✓ ('+n+' ملفًا محفوظًا على هذا الجهاز)';msg.textContent='اكتمل التنزيل.';b.disabled=true}
 else{b.textContent='أكمل التنزيل ('+fail.length+' ملفات متبقية)';msg.textContent=(navigator.onLine===false?'انقطع الاتصال بالإنترنت. ':'تعذّر تنزيل بعض الملفات. ')+'حُفظ '+n+' من '+fs.length+'، واضغط «أكمل التنزيل» للمتابعة من حيث توقّف.'}}
/* ---------- محرّك الأسئلة ---------- */
let SES=null;
function start(id,mode,quiz){const u=E.byId[id];if(!u)return go('#/home');const n=quiz?10:8;const qs=[];let guard=0;const keys=new Set();
 while(qs.length<n&&guard++<200){let q;if(mode==='review'){const w=S.wrong[guard%Math.max(1,S.wrong.length)];const uu=w&&E.byId[w.u];q=uu&&GEN.forUnit(uu,w.k)}else q=GEN.forUnit(u,quiz?null:({mix:null,listen:'listen',spell:'spell',order:'order',grammar:'grammar'}[mode]));
  if(!q||GEN.valid(q))continue;const k=q.type+(q.en||'')+(q.audio||'')+q.ans+(q.lines?q.lines[0].en:'');if(keys.has(k)&&guard<150)continue;keys.add(k);q.u=mode==='review'?(S.wrong[guard%Math.max(1,S.wrong.length)]||{}).u:id;q.k=mode==='review'?null:({listen:'listen',spell:'spell',order:'order',grammar:'grammar'}[mode]||null);qs.push(q)}
 if(!qs.length){page('تدريب',`<a class="back" href="${back(id)}">${I('back','ic')} رجوع</a><div class="note">لا توجد أسئلة من هذا النوع لهذه الوحدة بعد.</div>`,'home');return}
 SES={id,mode,quiz,qs,i:0,ok:0,res:[],z:{}};SES.zp=AU.zay(quiz?15:mode==='order'?14:mode==='spell'?13:mode==='listen'?11:10);show()}
const back=id=>/^F/.test(id)?'#/f/'+id:'#/u/'+id;
const modeName={mix:'تدريب',listen:'استماع',spell:'إملاء',order:'ترتيب الحوار',grammar:'قواعد',review:'مراجعة الأخطاء',place:'تحديد المستوى'};
function show(){const s=SES,q=s.qs[s.i];const u=E.byId[s.id];const lab=s.quiz?'اختبار':modeName[s.mode];
 const top=`<div class="qtop-en"><a class="back" href="${s.mode==='place'?'#/home':back(s.id)}">${I('x','ic')}</a><div class="bar"><i style="width:${100*s.i/s.qs.length}%"></i></div><b class="qcount">السؤال ${s.i+1} من ${s.qs.length}</b></div>`;
 let body='';const aud=q.audio?`<div class="qa">${AUB(q.audio,{big:1,label:'استمع'})}${speedBar()}</div>`:'';
 if(q.type==='mc'||q.type==='listen'){const arOpt=/[\u0600-\u06FF]/.test(q.ans);body=`${aud}${q.en?`<p class="qen" dir="ltr" lang="en">${esc(q.en).replace('___','<span class="gap">_____</span>')}</p>`:''}<div class="opts-en${arOpt?' ar':''}">${q.opts.map((o,i)=>`<button class="opt" type="button" data-i="${i}" ${arOpt?'':'dir="ltr" lang="en"'}>${esc(o)}</button>`).join('')}</div>`}
 else if(q.type==='pic')body=`${aud}<div class="opts-pic">${q.opts.map((o,i)=>`<button class="opt pic" type="button" data-i="${i}" aria-label="الصورة ${i+1}"><img src="bookimg/${o}" alt="" decoding="async"><small>ص ${q.pages[o]}</small></button>`).join('')}</div>`;
 else if(q.type==='spell')body=`${aud}<input id="sp" class="spin" dir="ltr" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type here">${q.hint?`<small class="muted">المعنى: ${esc(q.hint)}</small>`:''}<button class="btn wide" id="chk" type="button">تحقّق</button>`;
 else if(q.type==='build')body=`${aud}<div class="bline" id="bl" dir="ltr"></div><div class="tiles-en" dir="ltr">${q.tiles.map((t,i)=>`<button class="tile-en" type="button" data-i="${i}">${esc(t)}</button>`).join('')}</div><button class="btn wide" id="chk" type="button">تحقّق</button>`;
 else if(q.type==='order'){const ord=q.ord||(q.ord=shuffle(q.lines.map((_,i)=>i)));body=`<div class="qa"><button class="btn sec" id="pall" type="button">${ICS.spk} استمع إلى الحوار</button>${speedBar()}</div><div class="bline col" id="bl"></div><div class="olines">${ord.map(i=>`<button class="oline" type="button" data-i="${i}" dir="ltr" lang="en">${q.lines[i].sp?`<b>${esc(q.lines[i].sp)}:</b> `:''}${esc(q.lines[i].en)}</button>`).join('')}</div><button class="btn wide" id="chk" type="button">تحقّق</button>`}
 page(lab,`${top}<div class="card qcard-en"><p class="qp">${esc(q.prompt)}</p>${body}<div id="fb"></div></div>`,'home');
 {const zp=s.zp||Promise.resolve();s.zp=null;const zk=q.type==='listen'?12:q.type==='spell'?13:q.type==='order'?14:null;s.z=s.z||{};const z2=zk!=null&&!s.z[zk]&&s.i>0?(s.z[zk]=1,zp.then(()=>AU.zay(zk))):zp;if(zk!=null)s.z[zk]=1;if(q.audio)z2.then(()=>setTimeout(()=>{const b=document.querySelector('.qa .au');b&&AU.play(q.audio,{btn:b})},250))}
 if(q.type==='mc'||q.type==='listen'||q.type==='pic')document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>answer(q.opts[+b.dataset.i]===q.ans,q.opts[+b.dataset.i],b));
 if(q.type==='spell'){const inp=$('#sp');inp.focus();const f=()=>{const v=inp.value;if(!v.trim())return;const nn=x=>AU.norm(x).replace(/[^a-z0-9' ]/g,'').replace(/\s+/g,' ').trim();answer(nn(v)===nn(q.ans),v)};$('#chk').onclick=f;inp.onkeydown=e=>{if(e.key==='Enter')f()}}
 if(q.type==='build'||q.type==='order'){const picked=[];const bl=$('#bl');const sel=q.type==='build'?'.tile-en':'.oline';
  const draw=()=>{bl.innerHTML=picked.map((i,k)=>`<button type="button" class="${q.type==='build'?'tile-en':'oline'} in" data-k="${k}" dir="ltr">${esc(q.type==='build'?q.tiles[i]:q.lines[i].en)}</button>`).join('');bl.querySelectorAll('.in').forEach(b=>b.onclick=()=>{const i=picked.splice(+b.dataset.k,1)[0];document.querySelector(`${sel}:not(.in)[data-i="${i}"]`).hidden=false;draw()})};
  document.querySelectorAll(sel).forEach(b=>b.onclick=()=>{if(b.classList.contains('in'))return;picked.push(+b.dataset.i);b.hidden=true;draw();if(q.type==='order')AU.play(q.lines[+b.dataset.i].en,{g:gOf(q.lines[+b.dataset.i])})});
  if(q.type==='order')$('#pall').onclick=e=>toggleSeq(e.currentTarget,q.lines.map(l=>({en:l.en,voice:l.sp,g:gOf(l)})));
  $('#chk').onclick=()=>{if(q.type==='build'){if(picked.length<q.tiles.length)return;const got=picked.map(i=>q.tiles[i]).join(' ');const nn=x=>String(x).toLowerCase().replace(/[’]/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();answer(nn(got)===nn(q.ans),got)}else{if(picked.length<q.lines.length)return;answer(picked.every((v,i)=>v===i),'')}}}}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}if(a.length>1&&a.every((v,i)=>v===i))[a[0],a[1]]=[a[1],a[0]];return a}
function answer(ok,given,btn){const s=SES,q=s.qs[s.i];if(q.done)return;q.done=1;AU.sfx(ok?'ok':'bad');
 document.querySelectorAll('.opt').forEach(b=>{b.disabled=true;if(q.opts[+b.dataset.i]===q.ans)b.classList.add('ok')});if(btn&&!ok)btn.classList.add('bad');document.querySelectorAll('#chk,.tile-en,.oline').forEach(b=>b.disabled=true);
 if(ok)s.ok++;s.res.push({ok,sk:q.skill});addSkill(q.skill,ok);if(q.type==='listen'||q.type==='order'||q.type==='build')addSkill('listening_all',ok);
 if(s.mode!=='place'){if(ok){S.xp+=s.quiz?10:5;const w=S.wrong.findIndex(x=>x.u===q.u&&x.s===q.skill);if(s.mode==='review'&&w>=0)S.wrong.splice(w,1)}else if(!S.wrong.some(x=>x.u===q.u&&x.s===q.skill)){S.wrong.push({u:q.u,s:q.skill,k:q.k,t:Date.now()});if(S.wrong.length>40)S.wrong.shift()}
  const uu=U(s.id);if(!s.quiz&&s.mode!=='review'){uu.prac.n++;if(ok)uu.prac.ok++}}
 save();hdr();
 if(!ok){s.wr=(s.wr||0)+1;if(s.wr===1||s.wr%3===0)setTimeout(()=>AU.zay(q.audio&&s.wr===1?18:4),300)}
 const arA=q.type!=='pic'&&/[\u0600-\u06FF]/.test(q.ans);const correct=q.type==='order'?q.lines.map(l=>(l.sp?l.sp+': ':'')+l.en).join('\n'):arA?(q.audio||q.en):(q.full||q.ans);const why=!ok&&q.why&&q.why[given];
 $('#fb').innerHTML=`<div class="fb-en ${ok?'ok':'bad'}" role="status"><b>${ok?'إجابة صحيحة':'ليست صحيحة هذه المرة'}</b>${why?`<p>${esc(why)}</p>`:''}${!ok&&q.type==='spell'?`<p>كتبت: <span dir="ltr" lang="en" class="given">${esc(given)}</span></p>`:''}<p class="corr">${AUB(q.type==='order'?q.lines[0].en:q.type==='spell'?q.ans:correct)}<span dir="ltr" lang="en">${esc(correct).replace(/\n/g,'<br>')}</span>${arA?` <b>= ${esc(q.ans)}</b>`:''}</p><button class="btn wide" id="nx" type="button">${s.i+1<s.qs.length?'السؤال التالي':'النتيجة'}</button></div>`;
 $('#nx').focus();$('#nx').onclick=()=>{AU.stop();s.i++;s.i<s.qs.length?show():finish()}}
function finish(){const s=SES,p=pct(s.ok,s.qs.length);
 if(s._done){const cb=s._done;s._done=null;cb(p,s);return}
 if(s.mode==='place')return placeDone();
 const uu=U(s.id);if(s.quiz){uu.quiz.n++;uu.quiz.last=p;uu.quiz.best=Math.max(uu.quiz.best==null?0:uu.quiz.best,p);S.xp+=p>=80?30:0}else if(s.mode!=='place'&&s.mode!=='review'){uu.modes=uu.modes||{};uu.modes[s.mode]=Math.max(uu.modes[s.mode]||0,p)}
 S.log.push({d:today(),u:s.id,m:s.quiz?'quiz':s.mode,ok:s.ok,n:s.qs.length});if(S.log.length>300)S.log.splice(0,S.log.length-300);save();hdr();
 const pass=p>=80;setTimeout(()=>AU.zay(s.quiz?(pass?16:17):9),500);if(pass&&window.FX&&FX.confetti)try{FX.confetti()}catch(e){}
 page('النتيجة',`<div class="card done-en"><img src="img/zaytoun-${pass?'celebrate':'encourage'}.webp" alt="" width="120" height="140"><h1>${p}%</h1><p>${s.ok} من ${s.qs.length} إجابات صحيحة.</p><p>${s.quiz?(pass?'أتقنت هذه الوحدة. أحسنت.':'الإتقان يحتاج إلى 80%. راجع الدرس ثم حاول مرة أخرى.'):(pass?'عمل ممتاز.':'كل محاولة تقرّبك. تدرّب مرة أخرى.')}</p>
 <a class="btn wide" href="#/${s.quiz?'q':'p'}/${s.id}${s.quiz?'':'/'+s.mode}?r=${Date.now()}">${I('refresh','ic')} مرة أخرى</a><a class="btn sec wide" href="${s.mode==='review'?'#/home':back(s.id)}">العودة إلى ${s.mode==='review'?'الرئيسية':'الدرس'}</a></div>`,'home')}
/* ---------- تحديد المستوى ---------- */
const PLAN=[['F1','letter','phon'],['F1','letter','phon'],['F2','vowel','phon'],['F2','vowel','phon'],['F3','listen','phon'],['F4','listen','phon'],
 ['F5','listen','sight'],['F5','listen','sight'],['F5','spell','sight'],['F5','meaning','sight'],
 ['F6','grammar','basic'],['F6','grammar','basic'],['F6','grammar','basic'],['F7','grammar','basic'],['F7','grammar','basic'],['F7','grammar','basic'],
 ['U1','grammar','g8'],['U3','grammar','g8'],['U6','grammar','g8'],['U8','grammar','g8'],['U10','grammar','g8'],['U12','grammar','g8'],
 ['U1','vocab','g8v'],['U6','vocab','g8v'],['U10','vocab','g8v'],['U15','vocab','g8v'],
 ['U2','listen','g8l'],['U7','listen','g8l'],['U11','listen','g8l'],['U16','listen','g8l']];
function place(){page('تحديد المستوى',`<div class="card"><img src="img/zaytoun-think.webp" alt="" width="90" height="105" class="fl"><h1 class="h1">اختبار تحديد المستوى</h1><p>${PLAN.length} سؤالًا: أصوات الحروف، والكلمات الأساسية، والقواعد الأساسية، ثم قواعد الصف السادس ومفرداته واستماعه. استخدم السماعة؛ لا بأس إن لم تعرف الإجابة.</p><button class="btn wide" id="go" type="button">ابدأ</button></div>`,'home');
 $('#go').onclick=()=>{const keys=new Set();const kq=q=>q.type+'|'+(q.en||'')+'|'+(q.audio||'')+'|'+q.ans;
  const mk=(id,k)=>{const u=E.byId[id];if(!u)return null;if(u.kind&&k!=='grammar')return GEN.vocabQ(u.items,k);if(k==='grammar')return GEN.G[id]?GEN.G[id]():null;
   if(k==='vocab'){const V=(u.vocab||[]).filter(x=>x.ar);return V.length>=4?GEN.vocabQ(V,'meaning'):null}if(k==='listen'){const q=GEN.forUnit(u,'listen');return q&&q.type!=='order'?q:null}return null};
  const qs=PLAN.map(([id,k,ps])=>{let q=null;for(let t=0;t<40;t++){const c=mk(id,k);if(!c||GEN.valid(c))continue;if(keys.has(kq(c)))continue;q=c;break}if(q){keys.add(kq(q));q.u=id;q.ps=ps}return q}).filter(Boolean);SES={id:'place',mode:'place',qs,i:0,ok:0,res:[]};show()}}
function placeDone(){const s=SES;const by={};s.qs.forEach((q,i)=>{const r=by[q.ps]||(by[q.ps]={n:0,ok:0});r.n++;if(s.res[i]&&s.res[i].ok)r.ok++});const sc=k=>by[k]?pct(by[k].ok,by[k].n):null;
 const rec=[];if(sc('phon')<75)rec.push('F1','F2','F3','F4');if(sc('sight')<75)rec.push('F5');if(sc('basic')<75)rec.push('F6','F7');
 S.place={d:today(),score:pct(s.ok,s.qs.length),skills:{phon:sc('phon'),sight:sc('sight'),basic:sc('basic'),g8:sc('g8'),g8v:sc('g8v'),g8l:sc('g8l')},rec};save();
 const row=(k,n)=>`<li><span>${n}</span><div class="bar"><i style="width:${sc(k)||0}%"></i></div><b>${sc(k)}%</b></li>`;
 page('النتيجة',`<div class="card done-en"><h1>${S.place.score}%</h1><ul class="sbars">${row('phon','أصوات الحروف والقراءة')}${row('sight','الكلمات الأساسية')}${row('basic','القواعد الأساسية')}${row('g8','قواعد الصف السادس')}${row('g8v','مفردات الصف السادس')}${row('g8l','استماع الصف السادس')}</ul>
 <p>${rec.length?'ننصحك بأن تبدأ بهذه المراحل من مسار التأسيس، ثم تتابع وحدات الكتاب:':'أساسياتك جيدة. ابدأ بالوحدة الأولى من الكتاب.'}</p>${rec.map(id=>`<a class="btn sec wide" href="#/f/${id}">${esc(E.byId[id].ar)}</a>`).join('')}<a class="btn wide" href="#/home">إلى الرئيسية</a></div>`,'home')}
/* ---------- النطق ---------- */
function speak(id){const u=E.byId[id];if(!u)return go('#/home');U(id).speak=U(id).speak||{n:0,best:0};U(id).speak.n++;save();const items=(u.kind?u.items.map(x=>x.en):[...u.vocab.map(w=>w.en),...u.sentences.map(s=>s.en),...u.dialogues.flatMap(d=>d.lines.map(l=>l.en))]).filter(t=>t.split(' ').length<=14).slice(0,20);
 const mode=SPEECH.srReady()?'sr':SPEECH.canRec()?'rec':'none';
 page('النطق',`<a class="back" href="${back(id)}">${I('back','ic')} رجوع</a><h1 class="h1">تدريب النطق</h1><p class="muted">${mode==='sr'?'استمع إلى النموذج، ثم اضغط زر الميكروفون وانطق الجملة. سنُظهر لك الكلمات التي فُهمت.':mode==='rec'?'استمع إلى النموذج، ثم سجّل صوتك واستمع إليه وقارنه بالنموذج.':'هذا المتصفح لا يدعم الميكروفون. استمع وكرّر بصوت مرتفع.'}</p>${speedBar()}
 <ul class="splist">${items.map((t,i)=>`<li data-i="${i}"><div class="sprow">${AUB(t)}${EN(t,'b')}${mode!=='none'?`<button class="mic" type="button" data-i="${i}" aria-label="سجّل نطقك">${ICS.mic}</button>`:''}</div><div class="spres" id="r${i}"></div></li>`).join('')}</ul>`,'home');
 const uu=U(id);
 document.querySelectorAll('.mic').forEach(b=>b.onclick=async()=>{const i=+b.dataset.i,t=items[i],out=$('#r'+i);AU.stop();
  if(mode==='sr'&&!b.dataset.fallback){b.classList.add('rec');out.innerHTML='<small>تكلّم الآن…</small>';try{const r=await SPEECH.recognize(t);b.classList.remove('rec');uu.speak.n++;uu.speak.best=Math.max(uu.speak.best,r.pct);addSkill('speaking',r.pct>=70);save();
    out.innerHTML=`<p dir="ltr" class="marks">${r.marks.map(m=>`<span class="${m.ok?'ok':'bad'}">${esc(m.w)}</span>`).join(' ')}</p><small>${r.pct>=85?'نطق ممتاز':r.pct>=60?'جيد، كرّر الكلمات الحمراء':'استمع بالسرعة البطيئة ثم حاول مرة أخرى'} (${r.pct}%)</small>`;AU.sfx(r.pct>=70?'ok':'bad')}
   catch(err){b.classList.remove('rec');if(String(err)==='not-allowed'||String(err)==='service-not-allowed'||String(err)==='network'){b.dataset.fallback=1;out.innerHTML='<small>تعذّر التعرّف على الكلام. اضغط الميكروفون مرة أخرى لتسجيل صوتك والاستماع إليه.</small>'}else out.innerHTML='<small>لم نسمع شيئًا. اضغط الميكروفون وتكلّم بوضوح.</small>'}return}
  if(!SPEECH.canRec()){out.innerHTML='<small>التسجيل غير متاح في هذا المتصفح.</small>';return}
  if(b.classList.contains('rec')){const url=await SPEECH.recStop();b.classList.remove('rec');b.innerHTML=ICS.mic;uu.speak.n++;save();out.innerHTML=`<div class="cmp"><span>صوتك:</span><audio controls src="${url}"></audio><span>النموذج:</span>${AUB(t)}</div><div class="self"><button class="btn sec sm" type="button" data-s="1">قريب من النموذج</button><button class="btn ghost sm" type="button" data-s="0">أحتاج تدريبًا</button></div>`;out.querySelectorAll('[data-s]').forEach(x=>x.onclick=()=>{addSkill('speaking',x.dataset.s==='1');save();out.querySelector('.self').innerHTML='<small>تم الحفظ.</small>'});return}
  try{await SPEECH.recStart();b.classList.add('rec');b.innerHTML=ICS.stop;out.innerHTML='<small>جارٍ التسجيل… اضغط مرة أخرى للإيقاف.</small>'}catch(e){out.innerHTML='<small>لم يُسمح باستخدام الميكروفون.</small>'}})}

/* ---------- تعليم نطق الكلمة ---------- */
const TIPN={p:'p و b',v:'v و f',th:'th',silent:'حروف صامتة',magic_e:'e الصامتة',short:'الحركات القصيرة',cluster:'ساكنان متتاليان',ng:'ng',schwa:'الحركة الضعيفة',r:'r البريطانية',stress:'النبر'};
const wordsOf=id=>{const u=E.byId[id];if(!u)return[];return u.kind?(u.items||[]).map(x=>({en:x.en,ar:x.ar})):u.vocab.map(w=>({en:w.en,ar:w.ar}))};
function pronOf(w){const P=window.EN_PRON||{};return P[w]||P[w.toLowerCase()]||null}
function sylHTML(pi,marks){let k=0;return pi.words.map(x=>`<span class="pw">${x.syl.map((sy,j)=>{const st=x.syl.length>1&&j===x.st;let cls='sy'+(st?' st':'');if(marks){const seg=marks.slice(k,k+sy.replace(/[^A-Za-z']/g,'').length);k+=seg.length;cls+=seg.length&&seg.every(Boolean)?' good':seg.some(v=>!v)?' miss':''}return `<span class="${cls}">${esc(sy)}</span>`}).join('<i class="dot">·</i>')}</span>`).join(' ')}
let zW=0;function word(id,i){const ws=wordsOf(id);i=Math.max(0,Math.min(ws.length-1,+i||0));const w=ws[i];if(!w)return go(back(id));const pi=pronOf(w.en);const uu=U(id);uu.words=uu.words||{};
 const tips=pi?[...new Set(pi.words.flatMap(x=>x.tips).concat(pi.words.some(x=>x.syl.length>1)?['stress']:[]))]:[];const T=window.EN_TIPS||{};
 const mode=SPEECH.srReady()?'sr':SPEECH.canRec()?'rec':'none';const rec=uu.words[w.en];
 page('نطق الكلمات',`<div class="qtop-en"><a class="back" href="${back(id)}">${I('x','ic')}</a><div class="bar"><i style="width:${100*(i+1)/ws.length}%"></i></div><b class="qcount">الكلمة ${i+1} من ${ws.length}</b></div>
 <div class="card wcard"><div class="wtop"><h1 dir="ltr" lang="en">${esc(w.en)}</h1>${w.ar?`<p class="muted">${esc(w.ar)}</p>`:''}</div>
 ${pi?`<div class="sylrow" dir="ltr" id="syl">${sylHTML(pi)}</div><p class="small-note muted">المقاطع مفصولة بنقطة، والمقطع المنبور مميَّز بخط تحته.</p>
 <div class="pgrid"><div><small>النطق البريطاني بالرموز الصوتية (IPA)</small><b dir="ltr" class="ipa">${esc(pi.phrase||pi.words.map(x=>x.ipa).join(' '))}</b>${pi.phrase?'<small class="muted">في العبارة تُنطق الكلمات الصغيرة بصيغتها الضعيفة.</small>':''}</div><div><small>بالحروف العربية (للتقريب فقط، فبعض الأصوات لا مقابل لها)</small><b class="arg">${esc(pi.words.map(x=>x.ar).join('  '))}</b></div></div>`:'<p class="muted">لا يتوفر تقسيم صوتي لهذه الكلمة؛ استمع وكرّر.</p>'}
 <div class="steps"><div class="step"><span class="sn1">1</span><div><b>استمع</b><p>بطيئًا أولًا، ثم بالسرعة العادية.</p><button class="btn" id="sn" type="button">${ICS.spk} استمع: بطيء ثم عادي</button> ${AUB(w.en)}</div></div>
 <div class="step"><span class="sn1">2</span><div><b>قلها أنت</b>${mode==='sr'?'<p>اضغط الميكروفون وانطق الكلمة. سنلوّن المقاطع: الأخضر صحيح، والأحمر يحتاج إلى تدريب.</p>':mode==='rec'?'<p class="note">التعرّف على الكلام غير متاح '+(navigator.onLine===false?'دون إنترنت':'في هذا المتصفح')+'. سجّل صوتك، وسنقارن إيقاعه وطوله بالنموذج (تقدير تقريبي).</p>':'<p>هذا المتصفح لا يدعم الميكروفون. كرّر الكلمة بصوت مرتفع بعد سماعها.</p>'}
 ${mode!=='none'?`<button class="mic big" id="say" type="button" aria-label="انطق الكلمة">${ICS.mic}</button>`:''}<div id="sres">${rec&&rec.best!=null?`<small class="muted">أفضل نتيجة سابقة: ${rec.best}%</small>`:''}</div></div></div></div>
 ${tips.length?`<div class="tips"><h2>${I('bulb','ic')} انتبه إلى</h2>${tips.map(t=>`<div class="tip"><b>${TIPN[t]||t}</b><p>${esc(T[t]||'')}</p>${({stress:5,p:6,v:7,th:8})[t]!=null&&AU.zt(({stress:5,p:6,v:7,th:8})[t])&&AU.hasAr(AU.zt(({stress:5,p:6,v:7,th:8})[t]))?`<button class="btn ghost sm arb" type="button" data-ar="${esc(AU.zt(({stress:5,p:6,v:7,th:8})[t]))}">${ICS.spk} زيتون يشرح</button>`:''}</div>`).join('')}</div>`:''}
 <div class="wnav"><a class="btn sec" href="#/w/${id}/${Math.max(0,i-1)}" ${i===0?'aria-disabled="true"':''}>السابقة</a><a class="btn" href="#/w/${id}/${i+1<ws.length?i+1:i}" id="wnext">${i+1<ws.length?'الكلمة التالية':'آخر كلمة'}</a></div></div>`,'speak');
 $('#sn').onclick=e=>{const b=e.currentTarget;b.classList.add('playing');AU.slowThenNormal(w.en).then(()=>b.classList.remove('playing'))};
 setTimeout(async()=>{if(!zW++)await AU.zay(1);await AU.slowThenNormal(w.en);if(zW===1)AU.zay(19)},400);
 const say=$('#say');if(!say)return;const out=$('#sres');
 say.onclick=async()=>{AU.stop();
  if(mode==='sr'&&!say.dataset.fb){say.classList.add('rec');out.innerHTML='<small>انطق الكلمة الآن…</small>';
   try{const r=await SPEECH.sayWord(w.en.replace(/\s*\(.*?\)/g,''));if(!document.body.contains(out))return;say.classList.remove('rec');const R=uu.words[w.en]||(uu.words[w.en]={n:0,best:0});R.n++;R.best=Math.max(R.best,r.pct);addSkill('speaking',r.pct>=80);save();
    if(pi)$('#syl').innerHTML=sylHTML(pi,r.marks);const bad=pi?pi.words.flatMap(x=>x.syl).filter((sy,j)=>false):[];
    out.innerHTML=`<p class="${r.pct>=80?'okt':'badt'}"><b>${r.pct>=90?'نطق ممتاز':r.pct>=80?'جيد جدًا':r.pct>=50?'قريب؛ ركّز على المقاطع الحمراء':'لم تتضح الكلمة'}</b> (${r.pct}%)</p><small class="muted">سمعنا: <span dir="ltr" lang="en">${esc(r.heard||'—')}</span></small><div class="retry"><button class="btn sec sm" id="again" type="button">${I('refresh','ic')} حاول مرة أخرى</button><button class="btn ghost sm" id="slowa" type="button">${ICS.slow} استمع ببطء</button></div>`;
    AU.sfx(r.pct>=80?'ok':'bad');setTimeout(()=>AU.zay(r.pct>=90?2:r.pct>=50?3:4),250);$('#again').onclick=()=>say.click();$('#slowa').onclick=()=>AU.play(w.en,{rate:0.75})}
   catch(err){if(!document.body.contains(out))return;say.classList.remove('rec');if(/not-allowed|service-not-allowed|network/.test(String(err))){say.dataset.fb=1;out.innerHTML='<small>التعرّف على الكلام غير متاح الآن (يحتاج إلى إنترنت وإذن الميكروفون). اضغط الميكروفون مرة أخرى لتسجيل صوتك، وسنقارن إيقاعه وطوله بالنموذج (تقدير تقريبي).</small>'}else out.innerHTML='<small>لم نسمع شيئًا. اضغط الميكروفون وانطق بوضوح.</small>'}return}
  if(say.classList.contains('rec')){const url=await SPEECH.recStop();if(!document.body.contains(out))return;say.classList.remove('rec');say.innerHTML=ICS.mic;
  out.innerHTML=`<div class="cmp"><span>صوتك:</span><audio controls src="${url}"></audio><span>النموذج:</span>${AUB(w.en)}</div><div id="envr"><small class="muted">جارٍ مقارنة تسجيلك بالنموذج…</small></div>`;
  let r=null;try{const bl=SPEECH.lastBlob();r=bl&&await SPEECH.envScore(w.en.replace(/\s*\(.*?\)/g,''),bl)}catch(e){r=null}const er=$('#envr');if(!er)return;
  const R=uu.words[w.en]||(uu.words[w.en]={n:0,best:0});
  if(r&&!r.silent){R.n++;R.best=Math.max(R.best,r.pct);addSkill('speaking',r.pct>=70);save();
   const lm=r.ratio>1.5?'كلامك أبطأ من النموذج.':r.ratio<.6?'كلامك أقصر أو أسرع من النموذج؛ انطق كل مقطع.':'طول كلامك قريب من النموذج.';
   er.innerHTML=`<p class="${r.pct>=70?'okt':'badt'}"><b>تقدير الإيقاع والطول: ${r.pct}%</b></p><small>${lm}</small><p class="muted small-note">تقدير تقريبي يعمل دون إنترنت: يقارن إيقاع صوتك وطوله بالنموذج، ولا يتعرّف على الأصوات نفسها. استمع إلى تسجيلك وقارنه بأذنك.</p>`;AU.sfx(r.pct>=70?'ok':'bad')}
  else if(r&&r.silent)er.innerHTML='<p class="badt"><b>لم نسمع صوتًا واضحًا.</b></p><small>اقترب من الميكروفون وتكلّم بصوت أعلى، ثم حاول مرة أخرى.</small>';
  else{er.innerHTML=`<p class="muted small-note">لا يوجد تسجيل نموذجي لهذه الكلمة للمقارنة الآلية. قيّم نفسك:</p><div class="retry"><button class="btn sec sm" type="button" data-s="1">قريب من النموذج</button><button class="btn ghost sm" type="button" data-s="0">أحتاج تدريبًا</button></div>`;er.querySelectorAll('[data-s]').forEach(x=>x.onclick=()=>{R.n++;if(x.dataset.s==='1')R.best=Math.max(R.best,80);addSkill('speaking',x.dataset.s==='1');save();er.querySelector('.retry').innerHTML='<small>تم الحفظ.</small>'})}
  return}
  try{await SPEECH.recStart();say.classList.add('rec');say.innerHTML=ICS.stop;out.innerHTML='<small>جارٍ التسجيل… اضغط مرة أخرى للإيقاف.</small>'}catch(e){out.innerHTML='<small>لم يُسمح باستخدام الميكروفون.</small>'}}}
/* ---------- مراكز الاستماع والنطق ---------- */
function hub(kind){const list=[...E.found.map(f=>({id:f.id,t:f.ar,s:f.title})),...E.units.map(u=>({id:u.id,t:'الوحدة '+u.n,s:u.title}))];
 page(kind==='listen'?'الاستماع':'النطق',`<h1 class="h1">${kind==='listen'?'تمارين الاستماع':'تدريب النطق'}</h1>${speedBar()}<div class="ugrid">${list.map(x=>`<a class="card tap ucard-en" href="#/${kind==='listen'?'p':'w'}/${x.id}${kind==='listen'?'/listen':'/0'}"><span class="ut"><b>${esc(x.t)}</b><small dir="ltr" lang="en">${esc(x.s)}</small></span>${kind==='listen'?ICS.spk:ICS.mic}</a>`).join('')}</div>`,kind)}
/* ---------- التقرير ---------- */
const SKN={grammar:'القواعد',writing:'الكتابة',reading:'القراءة',truefalse:'الفهم (صح أو خطأ)',listening:'الاستماع',listening_all:'الاستماع (كل الأنواع)',dictation:'الإملاء',vocab:'المفردات',phonics:'الأصوات',speaking:'النطق'};
function enSummary(st){if(!st)return null;const us=E.units;const m=us.filter(u=>st.units&&st.units[u.id]&&st.units[u.id].quiz.best>=80).length;const sk=st.skills||{};const li=sk.listening_all||{n:0,ok:0};let gn=0,go=0;Object.entries(sk).forEach(([k,v])=>{if(!SKN[k]||k==='grammar'){gn+=v.n;go+=v.ok}});
 const lq=(st.log||[]).filter(l=>l.m==='quiz').slice(-1)[0];return{m,total:us.length,listen:pct(li.ok,li.n),gram:pct(go,gn),place:st.place?st.place.score:null,rec:st.place?st.place.rec.length:0,last:lq?{d:lq.d,p:pct(lq.ok,lq.n)}:null,min:st.min||0,wrong:(st.wrong||[]).length}}
function report(){const P=window.PROFILES;const me=P&&P.current&&P.current();const ps=P&&P.list?P.list():[];
 const rows=(ps.length?ps:[{id:'-',name:'أنا'}]).map(p=>{let d=null;if(!me||me.id===p.id)d=enSummary(S);else{try{d=enSummary(P.dataOf(p.id,KEY))}catch(e){}}return{p,d}});
 const sk=Object.entries(S.skills).sort((a,b)=>b[1].n-a[1].n);
 const sm=enSummary(S),wk=sk.filter(([k,v])=>v.n>=3).sort((a,b)=>pct(a[1].ok,a[1].n)-pct(b[1].ok,b[1].n))[0];
 page('تقرير التعلّم',`<h1 class="h1">تقرير الإنجليزية</h1>
 <div class="card parent-sum"><h2>ملخّص لوليّ الأمر</h2><p>وحدات الكتاب المتقنة: ${sm.m} من ${sm.total}${S.place?'، ونتيجة تحديد المستوى '+S.place.score+'%':''}، ومدة التعلّم: ${S.min||0} دقيقة.</p><p>${wk?'المهارة التي تحتاج إلى تدريب أكثر: '+(SKN[wk[0]]||'القواعد')+' ('+pct(wk[1].ok,wk[1].n)+'%). ':'لا توجد بيانات كافية عن المهارات بعد. '}${sm.wrong?'عدد الأخطاء في قائمة المراجعة: '+sm.wrong+'.':''}</p></div>
 <div class="card kpis"><div><b>${E.units.filter(u=>unitStatus(u.id)==='mastered').length} من ${E.units.length}</b><small>وحدات متقنة</small></div><div><b>${S.min||0}</b><small>دقيقة</small></div><div><b>${S.place?S.place.score+'%':'—'}</b><small>تحديد المستوى</small></div></div>
 <div class="card"><h2>الوحدات</h2><table class="tbl"><thead><tr><th>الوحدة</th><th>الحالة</th><th>دقة التدريب</th><th>أفضل اختبار</th></tr></thead><tbody>${[...E.found,...E.units].filter(u=>S.units[u.id]).map(u=>{const x=S.units[u.id];return `<tr><td>${u.n?'الوحدة '+u.n:esc(u.ar)}</td><td>${stLabel[unitStatus(u.id)]}</td><td>${x.prac.n?pct(x.prac.ok,x.prac.n)+'%':'—'}</td><td>${x.quiz.best!=null?x.quiz.best+'%':'—'}</td></tr>`}).join('')||'<tr><td colspan="4">لم تبدأ أي وحدة بعد.</td></tr>'}</tbody></table></div>
 <div class="card"><h2>المهارات</h2><ul class="sbars">${sk.map(([k,v])=>`<li><span>${SKN[k]?SKN[k]:`القواعد: <bdi dir="ltr" lang="en">${esc(k)}</bdi>`}</span><div class="bar"><i style="width:${pct(v.ok,v.n)}%"></i></div><b>${pct(v.ok,v.n)}%</b></li>`).join('')||'<li>لا توجد بيانات بعد.</li>'}</ul></div>
 <div class="card"><h2>${I('users','ic')} كل الطلاب على هذا الجهاز</h2><table class="tbl" id="allst"><thead><tr><th>الطالب</th><th>وحدات متقنة</th><th>الاستماع</th><th>القواعد</th><th>آخر اختبار</th><th>تحديد المستوى</th></tr></thead><tbody>${rows.map(({p,d})=>`<tr><td>${esc(p.name)}</td>${d?`<td>${d.m} من ${d.total}</td><td>${d.listen==null?'—':d.listen+'%'}</td><td>${d.gram==null?'—':d.gram+'%'}</td><td>${d.last?d.last.p+'%':'—'}</td><td>${d.place==null?'—':d.place+'%'}</td>`:'<td colspan="5">لا توجد بيانات</td>'}</tr>`).join('')}</tbody></table>
 <div class="acts-row" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button class="btn sec" id="csv" type="button">${I('download','ic')} تنزيل التقرير (CSV)</button><a class="btn ghost" href="../math/#/report">تقرير الرياضيات</a></div></div>
 <div class="card"><h2>الإعدادات</h2><button class="btn sec" id="offall" type="button">${I('download','ic')} نزّل صوت كل الوحدات وصورها للاستخدام دون إنترنت (${mb(AU.bytes([...E.units.flatMap(unitTexts),...E.found.flatMap(f=>f.items.map(x=>x.say||x.en))])+Object.values(window.EN_IMG||{}).flat().reduce((a,i)=>a+i.z,0))})</button><p class="muted small-note">دون تنزيل، يُحفظ كل مقطع صوتي تلقائيًا بعد أول مرة تسمعه فيها.</p><label class="sw-l"><input type="checkbox" id="zay" ${localStorage.getItem('en_zay')==='0'?'':'checked'}> صوت زيتون بالعربية (إرشادات وتشجيع)</label><label class="sw-l"><input type="checkbox" id="sfx" disabled> مؤثرات الإجابة غير متاحة؛ ننتظر تسجيلات بشرية معتمدة</label><p class="muted small-note">الصوت: ${AU.count()?'تسجيلات متاحة ('+AU.count()+' عبارة).':'لا توجد تسجيلات متاحة بعد.'} عند غياب التسجيل أو فشله تظهر رسالة ويمكنك المتابعة بالنص.</p></div>`,'report');
 $('#offall').onclick=()=>offline({vocab:[],dialogues:[],texts:[],sentences:[],grammar:[],pron:[],everyday:[],all:[...E.units.flatMap(unitTexts),...E.found.flatMap(f=>f.items.map(x=>x.say||x.en))]},$('#offall'));$('#zay').onchange=e=>localStorage.setItem('en_zay',e.target.checked?'1':'0');$('#sfx').onchange=e=>localStorage.setItem('en_sfx',e.target.checked?'1':'0');
 $('#csv').onclick=()=>{const csv='\ufeff'+[['الطالب','وحدات متقنة','عدد الوحدات','دقة الاستماع %','دقة القواعد %','آخر اختبار %','تاريخ آخر اختبار','تحديد المستوى %','دقائق'],...rows.map(({p,d})=>d?[p.name,d.m,d.total,d.listen,d.gram,d.last&&d.last.p,d.last&&d.last.d,d.place,d.min]:[p.name])].map(r=>r.map(x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='english-report-'+today()+'.csv';a.click()}}

/* ---------- تشغيل مجموعة أسئلة (للتحدّي اليومي وغيره) ---------- */
function runSet(qs,o){if(!qs||!qs.length){page(o.label||'تدريب',`<a class="back" href="${o.back||'#/home'}">${I('back','ic')} رجوع</a><div class="note">لا توجد أسئلة متاحة الآن.</div>`,'home');return}
 SES={id:o.id||'set',mode:o.mode||'mix',quiz:!!o.quiz,qs,i:0,ok:0,res:[],z:{},_done:o.onDone,_back:o.back||'#/home',_label:o.label||'تدريب'};show()}

/* ---------- أقسام الواجهة المطابقة للرياضيات ---------- */
const SEC=window.EN_SEC({E,esc,I,ICS,AUB,EN,page,save,hdr,U,unitStatus,go,S:()=>S,day,GEN,addSkill,runSet,
 zayWelcome:()=>{if(!window.__zw){window.__zw=1;setTimeout(()=>AU.zay(0),500)}}});
const TK=window.EN_TASKUI({E,esc,I,ICS,AUB,page,save,U,addSkill,toggleSeq});
const home=SEC.home,found=SEC.found;window.EN_SEC_TABS=SEC.tabs;
/* ---------- التوجيه ---------- */
function go(h){location.hash=h}
function route(){AU.stop();const h=(location.hash||'#/home').replace(/\?.*$/,'');const p=h.slice(2).split('/');
 try{document.body.dataset.route=p[0]||'home';switch(p[0]){case'u':return unit(p[1]);case'f':return fmod(p[1]);case'found':return found();case'journey':case'map':return SEC.journey();case'p':return start(p[1],p[2]||'mix',false);case'q':return start(p[1],'mix',true);case's':return speak(p[1]);case'w':return word(p[1],p[2]);case'place':case'diag':return place();case'review':return S.wrong.length?start(S.wrong[0].u,'review',false):home();case'report':return report();case'listen':return hub('listen');case'speak':return hub('speak');case'play':return SEC.play();case'adv':return SEC.adv(p[1]);case'detective':return SEC.detective();case'lab':return SEC.lab(p[1]||'');case'daily':return SEC.daily();case'friends':return SEC.friends();case'x':return TK.tasks(p[1],p[2]);case'ach':return SEC.ach();case'game':return SEC.game();default:return home()}}catch(e){console.error(e);home()}}
window.addEventListener('hashchange',route);
document.querySelectorAll('[data-ic]').forEach(el=>{if(!el.querySelector('svg'))el.insertAdjacentHTML('afterbegin',ICS[el.dataset.ic]||I(el.dataset.ic,'ic'))});
const tb=$('#theme');const thI=()=>{tb.innerHTML=I(document.documentElement.dataset.theme==='dark'?'sun':'moon')};if(tb){thI();tb.onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;thI();try{localStorage.setItem('abboud_theme',t)}catch(e){}}};
try{const P=window.PROFILES,c=P&&P.current&&P.current();if(c){if($('#side-name'))$('#side-name').textContent=c.name;const a=$('.student-avatar');if(a)a.textContent=Array.from((c.name||'').trim())[0]||'ع'}}catch(e){}
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.EN_APP={S:()=>S,ses:()=>SES,show:()=>show(),enSummary};
route();
})();
