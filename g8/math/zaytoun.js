/* Zaytoun's visual layer. The existing curriculum, exercises and saved progress remain the source of truth. */
window.ZAYTOUN_UI = function (A) {
  'use strict';
  const {V, esc, C} = A, I = window.ICON;
  let semester = 0, query = '';
  const cleanTitle = t => t.replace(/^الوحدة [^:]+:\s*/, '');
  const mastery = u => {
    const lessons = u.lessons.filter(l => !l.review);
    const done = lessons.filter(l => A.sk(l.id).status === 'mastered').length;
    return {done, total: lessons.length, percent: Math.round(done / lessons.length * 100)};
  };
  V.journey = V.home;
  A.tabs({journey:'home', report:'report'});
  const arrow = '<span aria-hidden="true">←</span>';
  const courseIcons = ['fraction', 'tiles', 'triangle', 'chart', 'scale', 'compass', 'house', 'target'];
  V.unit = id => {
    const u=A.UNITS[id];
    if(!u)return '<p>لم نجد هذه الوحدة. <a href="#/home">ارجع إلى الدروس</a></p>';
    const lessons=u.lessons.filter(l=>!l.review),m=mastery(u),n=Number(id.slice(1)),best=A.sk(id).best;
    const next=lessons.find(l=>!['mastered','locked'].includes(A.status(l.id)))||lessons.find(l=>A.status(l.id)!=='mastered');
    const missing=next?.prerequisites?.find(p=>['weak','untested'].includes(A.sk(p).status));
    const nextId=missing||next?.id, nextHref=nextId?'#/lesson/'+nextId:'#/quiz/'+id;
    const states={mastered:['check','أتقنتها'],learning:['book','نكمّل التعلّم'],weak:['dumbbell','نقوّيها معًا'],locked:['lock','نقوّي الأساس أولًا'],untested:['book','جاهز للاكتشاف']};
    const relatedLabs=Object.entries(window.LAB.T).filter(([,t])=>t.skills.some(skill=>lessons.some(l=>l.id===skill))).slice(0,3);
    return `<div class="unit-hub unit-tone-${(n-1)%4}"><div class="unit-breadcrumb"><a href="#/home">رحلتي</a><span aria-hidden="true">/</span><span>${u.sem.id==='S1'?'الفصل الأول':'الفصل الثاني'}</span><span aria-hidden="true">/</span><b>الوحدة ${n}</b></div>
      <header class="unit-intro"><div class="unit-intro-copy"><span class="unit-kicker">كل فكرة جديدة تُبنى على ما قبلها</span><h1>${esc(cleanTitle(u.title))}</h1><p>${lessons.length} دروس، وخطوات صغيرة تقرّبك من الفهم.</p><a class="unit-start" href="${nextHref}">${missing?'نقوّي الأساس':next?'نبدأ الخطوة التالية':'جاهز لاختبار الوحدة؟'} ${arrow}</a></div><span class="unit-emblem" aria-hidden="true">${I(courseIcons[n-1])}<span class="unit-emblem-note">خطوة بخطوة</span></span></header>
      <div class="unit-layout"><section class="unit-lessons" aria-labelledby="unit-lessons-heading"><div class="unit-section-heading"><h2 id="unit-lessons-heading">طريقك في هذه الوحدة</h2><span>كل درس، فكرة جديدة.</span></div><div class="unit-lesson-list">${lessons.map((l,i)=>{const st=A.status(l.id),[ic,label]=states[st]||states.untested;return `<a class="unit-lesson-row ${st==='mastered'?'lesson-mastered':''}" href="#/lesson/${l.id}"><span class="lesson-step">${st==='mastered'?I('check'):i+1}</span><div class="lesson-row-copy"><small>الدرس <bdi dir="ltr">${esc(l.number)}</bdi>${l.page?' · صفحة '+l.page:''}</small><h3>${esc(l.title)}</h3><span class="lesson-state state-${st}">${I(ic)} ${label}</span></div><span class="lesson-row-arrow" aria-hidden="true">←</span></a>`;}).join('')}</div>
        <a class="unit-exam" href="#/quiz/${id}"><span class="unit-exam-icon">${I('trophy')}</span><div><span>تمارين عامة</span><h3>اختبار الوحدة</h3><p>${Math.min(16,Math.max(10,2*lessons.length))} سؤالًا · الاجتياز من 80%${best!=null?' · أفضل نتيجة لك '+best+'%':''}</p></div><span class="exam-action">ابدأ الاختبار ${arrow}</span></a>
        <div class="unit-reading"><details><summary>${I('target')} ماذا ستتعلّم؟ <small>نتاجات الوحدة من الكتاب</small></summary><ul>${u.unit_objectives_verified.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></details><details><summary>${I('bulb')} أفكار تحتاج انتباهك <small>أخطاء شائعة نتعلّم منها</small></summary><ul>${u.misconceptions.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></details></div>
      </section><aside class="unit-aside" aria-label="تقدّم الوحدة وخطوتك التالية"><section class="unit-progress-panel"><span class="unit-kicker">قطاف هذه الوحدة</span><div class="unit-progress-number"><b>${m.percent}<span>%</span></b><span>${m.done} من ${m.total}<small>دروس متقنة</small></span></div><div class="unit-progress-track" role="progressbar" aria-label="إتقان الوحدة" aria-valuenow="${m.percent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${m.percent}%"></i></div><p>${m.done?'تابع من حيث توقفت.':'الدرس الأول هو نقطة البداية. لنبدأ.'}</p></section>
        <section class="unit-next"><img src="img/zaytoun-read.webp" alt="زيتون يقرأ معك" width="170" height="200"><span class="unit-kicker">${missing?'قبل أن نبدأ':'خطوتك القادمة'}</span><h2>${nextId?esc(A.title(nextId)):'اجمع أفكارك في الاختبار'}</h2><p>${missing?'هذه المهارة تساعدك تفهم الدرس الجديد بثقة.':'خذ فكرة واحدة كل مرة. زيتون معك في الطريق.'}</p><a href="${nextHref}">${missing?'نجهّز جذورنا':'نتعلّم معًا'} ${arrow}</a></section>
        ${relatedLabs.length?`<section class="unit-lab-links"><span class="unit-kicker">نفهمها بالتجربة</span><h2>الفكرة أوضح بيدك</h2>${relatedLabs.map(([key,t])=>`<a href="#/lab/${key}">${I(t.icon)}<span>${esc(t.title)}</span>${arrow}</a>`).join('')}</section>`:''}
      </aside></div><footer class="adventure-footer">${I('seed')} كل درس تتقنه يمهّد للدرس الذي يليه.</footer></div>`;
  };
  const originalLab = V.lab;
  let labCategory = 'all';
  const labMeta = {
    nl:{category:'numbers',tone:'blue',verb:'امشِ على خط الأعداد',desc:'حرّك النقطة وشاهد الجمع والطرح خطوة بخطوة.',drawing:'<path d="M18 84h224"/><path d="m237 78 7 6-7 6M37 76v16M80 76v16M123 76v16M166 76v16M209 76v16"/><path class="diagram-accent" d="M80 66q22-55 43 0t43 0"/><circle class="diagram-solid" cx="166" cy="84" r="9"/><g class="diagram-label"><text x="37" y="112">−2</text><text x="80" y="112">−1</text><text x="123" y="112">0</text><text x="166" y="112">1</text><text x="209" y="112">2</text></g>'},
    fr:{category:'numbers',tone:'green',verb:'ابنِ الكسر بنفسك',desc:'قسّم البيتزا، لوّن الأجزاء، وافهم معنى الكسر.',drawing:'<circle cx="130" cy="77" r="47" class="diagram-paper"/><path class="diagram-fill" d="M130 77V30a47 47 0 1 1-47 47Z"/><path d="M83 77h94M130 30v94"/>'},
    at:{category:'algebra',tone:'green',verb:'المقدار الجبري على صورة شكل',desc:'رتّب البلاطات واكتشف كيف تتكوّن المقادير.',drawing:'<rect class="diagram-fill" x="65" y="20" width="76" height="76" rx="5"/><rect class="diagram-soft" x="147" y="20" width="24" height="76" rx="4"/><rect class="diagram-soft" x="177" y="20" width="24" height="76" rx="4"/><rect class="diagram-soft" x="65" y="102" width="76" height="24" rx="4"/><rect class="diagram-paper" x="147" y="102" width="24" height="24" rx="4"/><rect class="diagram-paper" x="177" y="102" width="24" height="24" rx="4"/><text class="diagram-label" x="103" y="66">س²</text>'},
    bs:{category:'algebra',tone:'gold',verb:'حافظ على تساوي الكفّتين',desc:'جرّب العمليات على الطرفين، واعزل المتغيّر.',drawing:'<path d="M130 31v88M98 121h64M63 47h134M72 49 47 86h50ZM188 49l-25 37h50Z"/><path class="diagram-soft" d="M47 86h50a25 21 0 0 1-50 0ZM163 86h50a25 21 0 0 1-50 0Z"/><circle class="diagram-solid" cx="130" cy="42" r="7"/><text class="diagram-label" x="72" y="70">س</text><text class="diagram-label" x="188" y="70">4</text>'},
    py:{category:'geometry',tone:'orange',verb:'لاحظ النظرية بالرسم',desc:'غيّر الأضلاع وقارن مساحات المربعات الثلاثة.',drawing:'<path class="diagram-paper" d="m112 55 50 50h-50Z"/><path class="diagram-soft" d="M62 55h50v50H62Z"/><path class="diagram-fill" d="M112 105h50v28h-50Z"/><path class="diagram-light" d="m112 55 50 50 50-50-50-50Z"/><path d="M112 94h11v11"/>'},
    trig:{category:'geometry',tone:'blue',verb:'زاوية تغيّر الحكاية',desc:'غيّر الزاوية، واكتشف المقابل والمجاور والوتر.',drawing:'<path class="diagram-soft" d="M48 118 209 32v86Z"/><path d="M192 118v-17h17M85 118q0-18-12-28"/><text class="diagram-label" x="96" y="111">س</text><circle class="diagram-solid" cx="209" cy="32" r="5"/>'},
    prob:{category:'data',tone:'purple',verb:'الاحتمال بالتجربة',desc:'ارمِ النرد وقارن نتائج التجربة بالاحتمال.',drawing:'<rect class="diagram-paper" x="48" y="37" width="76" height="76" rx="15" transform="rotate(-12 86 75)"/><g class="diagram-solid"><circle cx="67" cy="58" r="5"/><circle cx="104" cy="95" r="5"/><circle cx="85" cy="76" r="5"/></g><circle class="diagram-soft" cx="181" cy="77" r="40"/><path d="M181 37v80M141 77h80M153 49l56 56"/><path class="diagram-accent" d="m181 77 26-17"/>'},
    pie:{category:'data',tone:'orange',verb:'للبيانات صورة تحكي',desc:'أدخل التكرارات وشاهدها قطاعات دائرية.',drawing:'<circle class="diagram-paper" cx="130" cy="77" r="48"/><path class="diagram-fill" d="M130 77V29a48 48 0 0 1 42 72Z"/><path class="diagram-soft" d="m130 77 42 24a48 48 0 0 1-83 0Z"/><path d="M130 29v48l42 24M130 77l-41 24"/>'}
  };
  const labRows = () => Object.entries(window.LAB.T).filter(([k]) => labCategory==='all'||labMeta[k]?.category===labCategory).map(([k,t]) => {
    const m=labMeta[k], n=A.S().labs[k]||0;
    return `<a class="experiment-row tone-${m.tone}" href="#/lab/${k}"><div class="experiment-diagram" aria-hidden="true"><svg viewBox="0 0 260 150">${m.drawing}</svg></div><div class="experiment-copy"><span class="experiment-name">${esc(t.title)}</span><h3>${m.verb}</h3><p>${m.desc}</p><span class="experiment-link">${n?n+' تجارب ناجحة':'جرّب بنفسك'} ${arrow}</span></div></a>`;
  }).join('');
  V.lab = key => {
    if(key) return originalLab(key);
    return `<div class="lab-hub"><header class="lab-intro"><div><span class="eyebrow">مختبر الأفكار الصغيرة</span><h1>الفكرة أوضح، <span>عندما تجرّبها.</span></h1><p>حرّك ولوّن وغيّر، ثم لاحظ النتيجة.</p></div><span class="lab-count">${I('lab')} ${Object.keys(window.LAB.T).length} أدوات للاكتشاف</span></header>
      <a href="#/lab/fr" class="lab-spotlight"><div class="lab-spotlight-copy"><span class="experiment-name">ابدأ بشيء تعرفه</span><h2>قطعة بيتزا.<br><span>وفكرة كاملة عن الكسور.</span></h2><p>كيف يبدو ثلاثة أرباع؟ قسّم الدائرة،<br>لوّن أجزاءها، ولاحظ الإجابة.</p><span class="spotlight-button">نجرّب الكسور ${arrow}</span></div><div class="fraction-scene" aria-hidden="true"><span class="fraction-note">الفهم يبدأ بالتجربة</span><svg viewBox="0 0 300 250"><ellipse cx="149" cy="218" rx="91" ry="12" fill="#dbe3c9"/><circle cx="150" cy="120" r="90" fill="#fffdf6" stroke="#c6d3ad" stroke-width="2"/><path d="M150 120V30a90 90 0 1 1-90 90Z" fill="#a3b47c"/><path d="M60 120h180M150 30v180" stroke="#f7f7e9" stroke-width="7"/><circle cx="150" cy="120" r="90" fill="none" stroke="#c6d3ad" stroke-width="2"/></svg><span class="fraction-caption" dir="ltr">3 <span>/</span> 4</span><img src="img/zaytoun-pencil.webp" alt="" width="170" height="200"></div></a>
      <section class="experiments-section" aria-labelledby="experiments-heading"><div class="lab-tools-heading"><h2 id="experiments-heading">أي فكرة تريد أن تستكشف؟</h2><span>اختر أداة وجرّبها.</span></div><div class="lab-categories" aria-label="مجال الأدوات">${[['all','كل الأدوات'],['numbers','الأعداد والكسور'],['algebra','الجبر'],['geometry','الهندسة'],['data','البيانات والاحتمالات']].map(([id,title])=>`<button type="button" data-lab-category="${id}" class="${labCategory===id?'selected':''}" aria-pressed="${labCategory===id}">${title}</button>`).join('')}</div><div class="experiment-list" id="experiment-list">${labRows()}</div></section>
      <a class="lab-race-link" href="#/game"><span class="race-mark">${I('race')}</span><span><small>أنشطة أخرى للتعلّم</small><b>اختبر سرعتك في سباق الأعداد.</b></span><span class="race-action">جاهز للسباق ${arrow}</span></a><footer class="adventure-footer">${I('seed')} جرّب، لاحظ، وافهم. كل تجربة تقرّبك من الفكرة.</footer></div>`;
  };
  V.play = () => {
    const s = A.S(), village = Math.min(6,Object.values(s.village.done).filter(Boolean).length);
    const solved = s.det.solved, taught = s.teach.n, written = s.board.done;
    const stars = A.ALLSK.filter(id => A.sk(id).status === 'mastered').length;
    return `<div class="adventure-hub">
      <header class="adventure-intro"><div><span class="eyebrow">الخطوة التالية</span><h1>كل فكرة، <span>باب لمغامرة.</span></h1><p>اليوم أنت المعلّم، أو المحقّق، أو باني القرية.<br>اختر نشاطًا يطبّق ما تعلّمته في الدروس.</p></div><a href="#/home" class="adventure-home">${I('map')} ارجع لرحلتك ${arrow}</a></header>
      <section class="story-worlds" aria-label="قصص وتحدّيات">
        <a class="world-card village-world" href="#/village"><img src="img/zaytoun-garden-v2.webp" alt="زيتون ينتظرك في قرية بين أشجار الزيتون" width="1536" height="1024" fetchpriority="high"><div class="world-copy"><span class="world-label">${I('olive')} حكاية تبنيها بيدك</span><h2>قرية صغيرة.<br><span>أفكارك تصنع فرقًا كبيرًا.</span></h2><p>أصلح البئر، ابنِ المدرسة، وأعد الحياة للقرية.<br>كل مسألة تحلّها، تترك أثرًا في الحكاية.</p><span class="world-button">${village?'نكمل الحكاية':'ادخل الحكاية'} ${arrow}</span></div><div class="world-bottom"><span>${I('flag')} ${village ? village+' من 6 فصول مكتملة' : '6 فصول تنتظر أفكارك'}</span><span class="chapter-dots" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i class="${i<village?'complete':''}"></i>`).join('')}</span></div></a>
        <a class="world-card detective-world" href="#/detective"><div class="detective-art"><img src="img/zaytoun-discovery-v2.webp" alt="زيتون يفحص الأشكال بعدسة المحقّق" width="1536" height="1024"></div><div class="detective-copy"><span class="world-label">${I('search')} قضية تحتاج عينك</span><h2>في الحلّ…<br><span>يوجد خطأ في الحل.</span></h2><p>اقرأ الدليل، اكتشف الخطأ،<br>وفسّر كيف نصلحه.</p><div class="detective-foot"><span>${solved ? solved+' قضايا محلولة' : 'أول قضية بانتظارك'}</span><span class="round-arrow" aria-hidden="true">←</span></div></div></a>
      </section>
      <section class="thinking-activities" aria-labelledby="thinking-heading"><div class="adventure-section-title"><div><span class="eyebrow">الفكرة لها أكثر من طريق</span><h2 id="thinking-heading">اختر نشاطًا</h2></div><span class="section-note">أنشطة مساندة للدروس.</span></div>
        <div class="activity-grid">
          <a class="activity-card teacher-activity" href="#/teach"><span class="activity-visual character-visual"><img src="img/zaytoun-teacher.webp" alt="زيتون مستعد ليتعلّم منك" width="170" height="200" loading="lazy"></span><div class="activity-copy"><span class="activity-kicker">بدّل الأدوار</span><h3>اليوم، أنت المعلّم.</h3><p>حاول زيتون حل المسألة؛ ساعده على الفهم،<br>وتحقّق من فهمك.</p><span class="activity-status">${taught?taught+' مرّات علّمت زيتون':'الشرح يعمّق الفهم'}</span></div><span class="activity-arrow" aria-hidden="true">↖</span></a>
          <a class="activity-card coach-activity" href="#/coach"><span class="activity-visual character-visual"><img src="img/zaytoun-think.webp" alt="زيتون يفكّر معك" width="170" height="200" loading="lazy"><span class="thinking-bubble" aria-hidden="true">لماذا؟</span></span><div class="activity-copy"><span class="activity-kicker">نفكّر معًا</span><h3>السؤال أهم من الجواب.</h3><p>احكِ كيف فكّرت. زيتون يسألك،<br>وأنت تكتشف الخطوة التالية.</p><span class="activity-status">${s.coach.n?s.coach.n+' حوارات مع زيتون':'خذ وقتك في التفكير'}</span></div><span class="activity-arrow" aria-hidden="true">↖</span></a>
          <a class="activity-card board-activity" href="#/board"><span class="activity-visual board-visual" aria-hidden="true"><svg viewBox="0 0 180 145"><rect x="12" y="15" width="151" height="112" rx="12" fill="#fbfaf4" stroke="#c5b994" stroke-width="2"/><path d="M35 47h65M35 63h92M35 79h52" stroke="#c5b994" stroke-width="2" stroke-linecap="round"/><path d="m97 108 29-54 10 6-29 54-13 9z" fill="#bb9255"/><path d="m126 54 7-12q3-5 7-2l3 2q4 3 1 7l-8 11" fill="#708361"/><path d="m97 108 10 6-13 9z" fill="#e6d5b2"/><path d="m43 106 11-11 12 11 23-25" fill="none" stroke="#829769" stroke-width="3" stroke-linecap="round"/></svg></span><div class="activity-copy"><span class="activity-kicker">أعطِ الفكرة مساحة</span><h3>حلّها خطوة بخطوة.</h3><p>اكتب خطواتك بيدك، رتّب أفكارك،<br>واكتب الحل سطرًا بعد سطر.</p><span class="activity-status">${written?written+' حلول على لوحتك':'لوحة الكتابة بانتظارك'}</span></div><span class="activity-arrow" aria-hidden="true">↖</span></a>
          <a class="activity-card sky-activity" href="#/sky"><span class="activity-visual sky-visual" aria-hidden="true"><svg viewBox="0 0 180 145"><path d="m32 98 36-55 49 15 32 50-75 5-6-70" fill="none" stroke="#b2a4c4" stroke-width="1.5" stroke-dasharray="4 4"/><g fill="#a18bad"><path d="m68 32 3 8 9 3-9 3-3 8-3-8-8-3 8-3zM117 48l3 7 8 3-8 3-3 7-3-7-8-3 8-3zM74 102l3 8 9 3-9 3-3 8-3-8-8-3 8-3z"/><circle cx="32" cy="98" r="4"/><circle cx="149" cy="108" r="4"/></g><g fill="#c5bbd0"><circle cx="33" cy="29" r="2"/><circle cx="139" cy="30" r="2"/><circle cx="106" cy="117" r="2"/><circle cx="25" cy="65" r="1.5"/><circle cx="151" cy="73" r="1.5"/></g></svg></span><div class="activity-copy"><span class="activity-kicker">لكل مهارة نجمة</span><h3>سماء تكبر معك.</h3><p>المهارات التي تتقنها تظهر مضيئة.<br>راجع المهارات الخافتة لتثبّتها.</p><span class="activity-status">${stars?stars+' مهارات متقنة':'أضئ أول نجمة في سمائك'}</span></div><span class="activity-arrow" aria-hidden="true">↖</span></a>
        </div>
      </section>
      <section class="more-paths" aria-label="طرق أخرى للتعلّم"><h2>وسائل أخرى للتعلّم</h2><div class="pathways"><a href="#/lab"><span class="pathway-icon">${I('lab')}</span><span><b>المختبر</b><small>حرّك وجرّب ولاحظ الفكرة.</small></span>${arrow}</a><a href="#/game"><span class="pathway-icon">${I('race')}</span><span><b>سباق الأعداد</b><small>جاهز لتحدّي السرعة؟</small></span>${arrow}</a><a href="#/friends"><span class="pathway-icon">${I('users')}</span><span><b>تحدّيات الأصدقاء <em>تجريبي</em></b><small>اكتشف فكرة التحدّي الجماعي.</small></span>${arrow}</a></div></section>
      <footer class="adventure-footer">${I('olive')} لا توجد طريقة واحدة للفهم. اكتشف طريقتك.</footer>
    </div>`;
  };
  function courses() {
    const units = C.semesters[semester].units;
    const filtered = units.filter(u => cleanTitle(u.title).includes(query) || u.lessons.some(l => l.title.includes(query)));
    return filtered.length ? filtered.map(u => {
      const m = mastery(u), n = Number(u.id.slice(1));
      return `<a class="course-card course-${(n-1)%4}" href="#/unit/${u.id}">
        <div class="course-top"><span class="course-symbol">${I(courseIcons[n-1])}</span><span class="course-number">الوحدة ${n}</span><span class="course-arrow" aria-hidden="true">↖</span></div>
        <h3>${esc(cleanTitle(u.title))}</h3><p>${m.total} دروس <span>·</span> ${m.done ? m.done+' دروس متقنة' : 'بانتظار أول خطوة'}</p>
        <div class="course-progress" role="progressbar" aria-label="إتقان ${esc(cleanTitle(u.title))}" aria-valuenow="${m.percent}" aria-valuemin="0" aria-valuemax="100"><i style="width:${m.percent}%"></i></div>
        <div class="course-foot"><span>${m.percent ? 'أكمل ما بدأته' : 'اكتشف الوحدة'}</span><b>${m.percent}%</b></div></a>`;
    }).join('') : '<div class="course-empty">لم نجد وحدة بهذا الاسم. جرّب اسم درس أو وحدة أخرى.</div>';
  }
  V.home = () => {
    const s = A.S(), num = Number.isFinite(s.goal) && s.goal > 0 ? s.goal : 10;
    const daily = Math.min(A.dailyN(), num), pct = Math.round(daily / num * 100);
    const completed = A.ALLSK.filter(id => A.sk(id).status === 'mastered').length;
    const next = A.nextStep() || C.prerequisites.find(p => A.status(p.id) !== 'mastered')?.id;
    const nextHref = !s.diag ? '#/diag' : next ? '#/lesson/'+next : '#/review';
    const rv = A.dueReviews().length, level = A.level(), xp = s.points % 200;
    const dailyDone = s.dch && s.dch.date === new Date().toISOString().slice(0,10) && s.dch.done;
    return `<div class="dashboard">
      <div class="welcome-row"><div><div class="eyebrow"><span class="tiny-leaf" aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false" style="vertical-align:-1px"><path d="M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8z" fill="currentColor"/></svg></span> تعلّم كل يوم</div><h1>أهلًا ${esc(s.name)}، <span>ما الدرس التالي؟</span></h1><p>دروس الرياضيات للصف الثامن وفق المنهاج الفلسطيني.</p></div><a class="map-link" href="#/journey">${I('map')} خريطة رحلتي ${arrow}</a></div>
      <div class="dashboard-grid"><div class="learning-column">
        <section class="garden-hero" aria-labelledby="garden-heading"><img class="garden-art" src="img/zaytoun-garden-v2.webp" alt="زيتون في قرية بين أشجار الزيتون ومسارات الاكتشاف" width="1536" height="1024" fetchpriority="high"><div class="garden-copy"><span class="hero-label"><i></i> الدرس التالي</span><h2 id="garden-heading">نتعلّم الرياضيات<br><span>خطوة بعد خطوة.</span></h2><p>من الفكرة الأولى إلى التمارين العامة،<br>وفق ترتيب الكتاب المدرسي.</p><a class="garden-cta" href="${nextHref}">${s.diag ? 'نكمل الرحلة' : 'ابدأ الدرس'} ${arrow}</a><span class="hero-footnote">${I('compass')} ${s.diag ? 'خطوتك التالية جاهزة' : 'نبدأ باكتشاف مستواك'}</span></div><span class="art-caption">ابدأ من هنا <span aria-hidden="true"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false" style="vertical-align:-1px"><path d="M8 0l1.8 6.2L16 8l-6.2 1.8L8 16l-1.8-6.2L0 8l6.2-1.8z" fill="currentColor"/></svg></span></span></section>
        <div class="quick-actions"><a class="quick-action" href="#/daily"><span class="quick-icon sun-icon">${I('bolt')}</span><span><b>تحدّي اليوم</b><small>${dailyDone ? 'أنجزته، أحسنت.' : '5 مسائل للتفكير'}</small></span>${arrow}</a><a class="quick-action" href="#/review"><span class="quick-icon review-icon">${I('review')}</span><span><b>نتمرّن ونتمكّن</b><small>${rv ? rv+' مهارات للمراجعة' : 'كل محاولة تعلّمك شيئًا'}</small></span>${arrow}</a><a class="quick-action" href="#/lab"><span class="quick-icon lab-icon">${I('lab')}</span><span><b>جرّبها بيدك</b><small>الفكرة أوضح في المختبر</small></span>${arrow}</a></div>
        <section class="courses-section" aria-labelledby="courses-heading"><div class="section-heading"><div><span class="eyebrow">من فكرة… إلى مهارة</span><h2 id="courses-heading">ماذا سنكتشف اليوم؟</h2></div><a href="#/journey" class="text-link">المسار الكامل ${arrow}</a></div>
          <div class="course-controls"><div class="semester-tabs" aria-label="الفصل الدراسي"><button type="button" data-sem="0" aria-pressed="${semester===0}" class="${semester===0?'active':''}">الفصل الأول</button><button type="button" data-sem="1" aria-pressed="${semester===1}" class="${semester===1?'active':''}">الفصل الثاني</button></div><label class="course-search">${I('search')}<input id="course-search" type="search" placeholder="ابحث عن درس…" aria-label="ابحث في وحدات الفصل" value="${esc(query)}"></label></div>
          <div class="course-grid" id="course-grid" aria-live="polite">${courses()}</div>
          <a class="basics-strip" href="#/map"><span class="basics-icon">${I('seed')}</span><span><b>الجذور القوية تصنع شجرة قوية</b><small>راجع الأساسيات، وانطلق بثقة في دروسك.</small></span><span class="basics-link">نقوّي الأساس ${arrow}</span></a>
        </section>
        <section class="adventure-section" aria-labelledby="adventure-heading"><div class="section-heading"><div><span class="eyebrow">الفهم خارج صفحات الكتاب</span><h2 id="adventure-heading">مساحة صغيرة للمغامرة</h2></div><a href="#/play" class="text-link">كل المغامرات ${arrow}</a></div><div class="adventure-grid"><a class="story-card village-story" href="#/village"><img src="img/zaytoun-garden-v2.webp" alt="قرية الزيتون" width="1536" height="1024" loading="lazy"><div><span class="story-tag">تعلّم بقصة</span><h3>قرية تحتاج أفكارك</h3><p>ابنِ بيتًا، ازرع بستانًا، وحلّ الحكاية.</p><span>لنبدأ الحكاية ${arrow}</span></div></a><a class="story-card detective-story" href="#/detective"><img src="img/zaytoun-discovery-v2.webp" alt="عالم مصغّر من الأشكال وأدوات اكتشاف الرياضيات" width="1536" height="1024" loading="lazy"><div><span class="story-tag">تحدّي تفكير</span><h3>عينك على الخطأ</h3><p>مسألة للتفكير.</p><span>كن المحقّق ${arrow}</span></div></a></div></section>
        <footer class="garden-footer"><span><svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align:-3px" aria-hidden="true" focusable="false"><path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z" fill="currentColor" opacity=".85"/><path d="M5 19c4-4 7-7 10-11" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg> زيتون</span> نزرع الفهم، ونحصد المعرفة <span></span></footer>
      </div><aside class="growth-column" aria-label="تقدّمك وأهدافك">
        <section class="daily-card"><div class="aside-heading"><h2>قطاف اليوم</h2><span class="aside-icon">${I('target')}</span></div><p>قليلٌ كل يوم، كثيرٌ مع الوقت.</p><div class="daily-ring" style="--progress:${pct*3.6}deg"><div><b dir="ltr">${daily}<span> / ${num}</span></b><small>إجابات صحيحة</small></div></div><div class="goal-message">${pct>=100 ? 'حققت هدف اليوم. أحسنت.' : daily ? 'تقدّمك مستمر.' : 'ابدأ بالدرس الأول.'}</div><a class="aside-button" href="${nextHref}">${pct>=100 ? 'نكتشف المزيد' : 'نزرع أول خطوة'} ${arrow}</a></section>
        <section class="level-card"><div class="aside-heading"><h2>شجرتك تكبر</h2><span class="level-badge">${I('seed')}</span></div><div class="level-detail"><span><b>المستوى ${level}</b><small>${esc(window.FX.lvInfo(level).name)}</small></span><img src="img/rank-${Math.min(8,level)}.webp" alt="شارة مستواك" width="58" height="58"></div><div class="level-track" role="progressbar" aria-label="نقاط المستوى" aria-valuenow="${xp}" aria-valuemin="0" aria-valuemax="200"><i style="width:${xp/2}%"></i></div><div class="level-meta"><span>إلى المستوى التالي</span><b dir="ltr">${xp} / 200 XP</b></div><div class="growth-stats"><span><b>${completed}</b><small>مهارات متقنة</small></span><span><b>${s.streak}</b><small>أيام متتالية</small></span></div></section>
        <section class="coach-note"><span class="note-tape" aria-hidden="true"></span><img src="img/zaytoun-think.webp" alt="زيتون يفكّر" width="105" height="124" loading="lazy"><span class="handwritten">زيتون يقول لك</span><h3>«ليس مطلوبًا أن تعرف الإجابة فورًا،<br>المهم تجرّب تفهم.»</h3><p>الغلط بداية فكرة جديدة،<br>لنكتشفها معًا.</p><a href="#/coach">فكّر مع زيتون ${arrow}</a></section>
        <a class="next-step-card" href="${nextHref}"><span class="eyebrow">خطوتك القادمة</span><span class="next-step-icon">${I(s.diag?'book':'compass')}</span><b>${!s.diag ? 'اكتشف نقطة بدايتك' : next ? esc(A.title(next)) : 'راجع ما تعلّمته'}</b><small>${!s.diag ? 'رحلة تحديد المستوى' : 'رحلة تناسب تقدّمك'}</small>${arrow}</a>
      </aside></div></div>`;
  };
  document.addEventListener('click', e => {
    const category = e.target.closest('[data-lab-category]');
    if(category){labCategory=category.dataset.labCategory;document.querySelectorAll('[data-lab-category]').forEach(b=>{b.classList.toggle('selected',b===category);b.setAttribute('aria-pressed',String(b===category));});document.querySelector('#experiment-list').innerHTML=labRows();return;}
    if (e.target.closest('.skip-link')) {e.preventDefault();document.querySelector('#app').focus();document.querySelector('#app').scrollIntoView({block:'start'});return;}
    const button = e.target.closest('[data-sem]');
    if (!button) return;
    semester = Number(button.dataset.sem); query = '';
    document.querySelectorAll('[data-sem]').forEach(b => {b.classList.toggle('active', b===button);b.setAttribute('aria-pressed', String(b===button));});
    const search = document.querySelector('#course-search'); if (search) search.value = '';
    document.querySelector('#course-grid').innerHTML = courses();
  });
  document.addEventListener('input', e => {
    if (e.target.id !== 'course-search') return;
    query = e.target.value.trim(); document.querySelector('#course-grid').innerHTML = courses();
  });
  const labels = {home:'رحلتي', journey:'خريطة الرحلة', unit:'دروس الوحدة', lesson:'نتعلّم خطوة بخطوة', play:'المغامرات', lab:'المختبر', friends:'الترتيب', ach:'إنجازاتي', report:'تقرير التعلّم', map:'جذور المعرفة', diag:'اكتشف مستواك', coach:'نفكّر مع زيتون', daily:'تحدّي اليوم', review:'نتمرّن ونتمكّن', detective:'محقق الأخطاء', village:'قصة القرية'};
  function syncHeader() {
    const s = A.S(), r = (location.hash || '#/home').split('/')[1];
    document.querySelector('#page-label').textContent = labels[r] || 'بستان التعلّم';
    document.querySelector('#side-name').textContent = s.name;
    document.querySelector('.student-avatar').textContent = Array.from(s.name.trim())[0] || 'ع';
    document.querySelectorAll('.tabs a[data-t]').forEach(a => {if (a.classList.contains('on')) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
  }
  new MutationObserver(syncHeader).observe(document.querySelector('#app'), {childList:true});
  new MutationObserver(syncHeader).observe(document.querySelector('#hname'), {childList:true});
  if(window.LESSON_VISUALS)window.LESSON_VISUALS.install(A);
};

