/* واجهة عرض مستقلة. جميع الأرقام من demo-data.js، ولا تُقرأ ملفات الطلاب. */
(() => {
  'use strict';
  const data = window.ADMIN_DEMO;
  const content = document.getElementById('page-content');
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    quiz: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m7 9 2 2 3-4M14 9h3M8 15h9M8 18h6"/>',
    students: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/>',
    book: '<path d="M12 6c-3-3-7-3-10-2v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15M5 8h3M16 8h3M5 12h3M16 12h3"/>',
    link: '<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
    arrow: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    leaf: '<path d="M20 3C8 2 2 7 5 14c3 7 14 5 15-11ZM4 21l11-12M9 16v-5M13 12h4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 8-8M16 3h5v5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    math: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
    arabic: '<path d="M4 8v5c0 4 16 4 16 0V8M12 20v.1M9 4h6"/>',
    english: '<path d="m3 20 6-16 6 16M5 15h8M17 13h5m-5 0v7m0-5c2-3 5-1 5 1v4"/>',
    science: '<path d="M9 3h6M10 3v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M7 15h10M10 18h.1"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    sort: '<path d="M12 4v16M7 9l5-5 5 5"/>'
  };
  const titles = {overview:'نظرة عامة',students:'الطلاب',curriculum:'المنهاج والدروس','quiz-builder':'مصمم الاختبارات',integration:'الربط بالخادم'};
  const subjects = {math:'الرياضيات',arabic:'اللغة العربية',english:'اللغة الإنجليزية',science:'العلوم والحياة'};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = value => String(value).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const icons = root => root.querySelectorAll('[data-icon]').forEach(el => {el.innerHTML = icon(el.dataset.icon);});
  const grade = g => g === 8 ? 'الصف الثامن' : 'الصف السادس';
  const totals = s => s.subjects.reduce((a, x) => ({completed:a.completed+x.completed,total:a.total+x.total}), {completed:0,total:0});
  const progress = (v, max) => max ? Math.round(v / max * 100) : 0;
  const chip = text => `<span class="chip">${esc(text)}</span>`;
  let toastTimer;
  function toast(message) {const el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},4000);}
  function heading(kicker, title, description, action='') {return `<div class="page-heading"><div><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action}</div>`;}
  function stat(label, value, note, type, color) {return `<article class="stat-card"><span class="stat-icon ${color}">${icon(type)}</span><div><p>${label}</p><strong class="stat-value">${n(value)}</strong><span class="stat-note">${note}</span></div></article>`;}
  function studentRow(s) {const t=totals(s);return `<div class="student-row"><img class="avatar" src="${esc(s.avatar)}" width="54" height="54" alt=""><div class="student-info"><h3>${esc(s.name)}</h3><p>${grade(s.grade)} <span aria-hidden="true">·</span> ${n(s.subjects.length)} مواد</p></div><div class="student-metrics"><span>${n(t.completed)} من ${n(t.total)} درسًا</span><div class="mini-progress" role="progressbar" aria-label="الدروس المكتملة التجريبية لدى ${esc(s.name)}" aria-valuenow="${t.completed}" aria-valuemax="${t.total}" aria-valuemin="0"><span style="width:${progress(t.completed,t.total)}%"></span></div></div><button class="icon-btn" data-student="${esc(s.id)}" aria-label="تفاصيل ${esc(s.name)}">${icon('arrow')}</button></div>`;}
  function overview() {
    const done=data.students.reduce((a,s)=>a+totals(s).completed,0);
    const all=data.students.reduce((a,s)=>a+totals(s).total,0);
    const bars=Object.entries(subjects).map(([id,name])=>{const rows=data.students.flatMap(s=>s.subjects.filter(x=>x.id===id));const completed=rows.reduce((a,x)=>a+x.completed,0),total=rows.reduce((a,x)=>a+x.total,0);const pct=progress(completed,total);return `<div class="bar-group"><span class="bar-value">${n(pct)}٪</span><div class="bar-track"><span class="bar-fill ${id}" style="height:${pct}%"></span></div><span class="bar-label">${esc(name)}</span><small>${n(completed)} من ${n(total)}</small></div>`;}).join('');
    content.innerHTML=heading('نزرع الفهم، خطوة خطوة','أهلًا محمد، كيف ينمو البستان؟','نظرة هادئة على التقدّم، ومساحة أكبر لمساندة كل طالب.',`<button class="button secondary" data-action="export">${icon('download')}تصدير نموذج التقرير</button>`)+
      `<div class="stats-grid">${stat('الطلاب في المعاينة',data.students.length,'ملفات تجريبية','students','green')}${stat('المواد المتاحة',data.courses.length,'للصفين السادس والثامن','book','blue')}${stat('الدروس المكتملة',done,`من ${n(all)} درسًا في بيانات العرض`,'check','gold')}${stat('خطوات مقترحة',Math.min(2,data.students.length),'خطوة توضيحية لكل طالب','target','purple')}</div>`+
      `<div class="overview-grid"><div><section class="panel"><div class="panel-head"><div><span class="eyebrow">قريبون من كل خطوة</span><h2>طلاب البستان</h2></div><a class="text-link" href="#students">عرض الطلاب ${icon('arrow')}</a></div><div class="student-list">${data.students.slice(0,5).map(studentRow).join('')}</div></section><section class="panel chart-panel"><div class="panel-head"><div><span class="eyebrow">الصورة الأوسع</span><h2>إنجاز الدروس حسب المادة</h2></div><span class="chip">مثال توضيحي</span></div><p class="chart-description">نسبة الدروس المكتملة من الدروس المحددة في نموذج البيانات؛ لا تعبّر عن إتقان موحّد بين المواد.</p><div class="bars">${bars}</div><details class="chart-table"><summary>قراءة الأرقام كنص</summary><ul>${Object.entries(subjects).map(([id,name])=>{const rows=data.students.flatMap(s=>s.subjects.filter(x=>x.id===id));return `<li>${name}: ${n(rows.reduce((a,x)=>a+x.completed,0))} من ${n(rows.reduce((a,x)=>a+x.total,0))} درسًا.</li>`;}).join('')}</ul></details></section></div><div class="aside-stack"><section class="hero-tip"><div><span class="eyebrow">للتعلّم وقته</span><h2>الفهم قبل السرعة.</h2><p>الخطوة الصغيرة المناسبة أفضل من درس جديد قبل استيعاب الأساس.</p><a href="#students" class="text-link">نختار الخطوة التالية ${icon('arrow')}</a></div><img src="../assets/img/av-read.webp" width="112" height="112" alt="شخصية زيتون تقرأ"></section><section class="panel"><div class="panel-head"><h2>نبدأ من هنا</h2>${icon('leaf')}</div><p class="muted">اقتراحات من بيانات المعاينة</p><div class="focus-list">${data.students.slice(0,2).map(s=>`<button class="focus-item" data-student="${esc(s.id)}"><span class="subject-icon math">${icon('target')}</span><span><b>${esc(s.name)}</b><small>${esc(s.subjects[0].focus)}</small></span>${icon('arrow')}</button>`).join('')}</div></section><section class="notice"><b>نافذة على التعلّم</b><p>هذا العرض يساعد على تخطيط الواجهة. سجل التقدّم الفعلي والمزامنة يحتاجان إلى ربط الخادم.</p><a href="#integration" class="text-link">تفاصيل الربط ${icon('arrow')}</a></section></div></div>`;
  }
  const studentList = {page:1,size:10,sort:'name',direction:1};
  const studentName = name => String(name).replace(/[\u064B-\u065F\u0670\u0640]/g,'').trim().toLocaleLowerCase('ar');
  const nameOrder = new Intl.Collator('ar',{numeric:true,sensitivity:'base'});
  function students() {
    studentList.page=1;studentList.size=10;
    content.innerHTML=heading('مسار مختلف، واهتمام واحد','كل طالب له خطوته','ابحث عن الطالب، وقارن التقدّم، وافتح تفاصيله من قائمة واحدة.')+
      `<div class="toolbar"><label class="field"><span>ابحث عن طالب</span><input class="input" id="student-search" type="search" placeholder="اسم الطالب" autocomplete="off"></label><label class="field"><span>الصف</span><select class="select" id="student-grade"><option value="all">جميع الصفوف</option><option value="8">الصف الثامن</option><option value="6">الصف السادس</option></select></label><span class="filter-summary" id="student-count" role="status"></span></div>
      <section class="students-table-panel" aria-label="قائمة الطلاب"><p class="table-scroll-hint" id="student-scroll-hint">يمكن تمرير الجدول أفقيًا لعرض بقية الأعمدة.</p><div class="students-table-wrap" role="region" aria-label="جدول متابعة الطلاب" aria-describedby="student-scroll-hint" tabindex="0"><table class="students-table"><caption class="table-caption">قائمة الطلاب وتقدّمهم — بيانات تجريبية</caption><thead><tr><th scope="col" id="student-name-heading"><button class="sort-button" id="student-sort-name">الطالب <span aria-hidden="true" id="student-name-sort-mark"></span><span class="sr-only">، ترتيب حسب الاسم</span></button></th><th scope="col" id="student-grade-heading"><button class="sort-button" id="student-sort-grade">الصف <span aria-hidden="true" id="student-grade-sort-mark"></span><span class="sr-only">، ترتيب حسب الصف</span></button></th><th scope="col" class="optional-column">المواد</th><th scope="col">الدروس المكتملة</th><th scope="col"><span class="sr-only">إجراءات الطالب</span></th></tr></thead><tbody id="student-results"></tbody></table></div><div class="pagination"><div class="pagination-summary"><span id="student-range"></span><label class="page-size" for="student-page-size">في الصفحة <select class="select" id="student-page-size"><option value="10">١٠</option><option value="25">٢٥</option><option value="50">٥٠</option></select></label></div><nav class="pagination-controls" aria-label="صفحات قائمة الطلاب"><button class="button secondary small" id="student-previous">السابقة</button><span class="current-page" id="student-page-status" role="status"></span><button class="button secondary small" id="student-next">التالية</button></nav></div></section>`;
    document.getElementById('student-search').addEventListener('input',()=>filterStudents());
    document.getElementById('student-grade').addEventListener('change',()=>filterStudents());
    document.getElementById('student-page-size').addEventListener('change',()=>{const size=Number(document.getElementById('student-page-size').value);studentList.size=[10,25,50].includes(size)?size:10;filterStudents();});
    document.getElementById('student-previous').addEventListener('click',()=>{studentList.page--;filterStudents(false);});
    document.getElementById('student-next').addEventListener('click',()=>{studentList.page++;filterStudents(false);});
    ['name','grade'].forEach(key=>document.getElementById('student-sort-'+key).addEventListener('click',()=>{studentList.direction=studentList.sort===key?-studentList.direction:1;studentList.sort=key;filterStudents();}));
    filterStudents();
  }
  function filterStudents(resetPage=true) {
    if(resetPage)studentList.page=1;
    const query=studentName(document.getElementById('student-search').value),g=document.getElementById('student-grade').value;
    const rows=data.students.filter(s=>(g==='all'||String(s.grade)===g)&&studentName(s.name).includes(query));
    rows.sort((a,b)=>{const primary=studentList.sort==='grade'?a.grade-b.grade:nameOrder.compare(a.name,b.name);return primary*studentList.direction||nameOrder.compare(a.name,b.name)||nameOrder.compare(a.id,b.id);});
    const pages=Math.max(1,Math.ceil(rows.length/studentList.size));studentList.page=Math.max(1,Math.min(studentList.page,pages));
    const start=(studentList.page-1)*studentList.size,pageRows=rows.slice(start,start+studentList.size);
    document.getElementById('student-count').textContent=`عدد النتائج: ${n(rows.length)}`;
    document.getElementById('student-results').innerHTML=pageRows.length?pageRows.map(s=>{const t=totals(s);return `<tr><th scope="row"><div class="student-cell"><img class="avatar" src="${esc(s.avatar)}" width="42" height="42" alt=""><div><span class="student-name">${esc(s.name)}</span><small class="cell-subtext">ملف تجريبي</small></div></div></th><td>${grade(s.grade)}</td><td class="optional-column">${n(s.subjects.length)}</td><td><div class="table-progress"><span class="completion-number">${n(t.completed)} من ${n(t.total)}</span><div class="mini-progress" role="progressbar" aria-label="الدروس المكتملة التجريبية لدى ${esc(s.name)}" aria-valuenow="${t.completed}" aria-valuemin="0" aria-valuemax="${t.total}"><span style="width:${progress(t.completed,t.total)}%"></span></div></div></td><td class="student-actions"><button class="button secondary small" data-student="${esc(s.id)}" aria-label="تفاصيل ${esc(s.name)}">التفاصيل ${icon('arrow')}</button></td></tr>`;}).join(''):'<tr><td colspan="5"><div class="empty-state"><h2>لم نجد طالبًا بهذه البيانات</h2><p>جرّب اسمًا آخر أو اعرض جميع الصفوف.</p></div></td></tr>';
    document.getElementById('student-range').textContent=rows.length?`النتائج ${n(start+1)}–${n(start+pageRows.length)} من ${n(rows.length)}`:'لا توجد نتائج';
    document.getElementById('student-page-status').textContent=`الصفحة ${n(studentList.page)} من ${n(pages)}`;
    document.getElementById('student-previous').disabled=studentList.page<=1;
    document.getElementById('student-next').disabled=studentList.page>=pages;
    ['name','grade'].forEach(key=>{document.getElementById('student-'+key+'-heading').setAttribute('aria-sort',studentList.sort===key?(studentList.direction===1?'ascending':'descending'):'none');document.getElementById('student-'+key+'-sort-mark').innerHTML=studentList.sort===key?icon('sort'):'';});
  }
  function curriculum() {
    content.innerHTML=heading('المحتوى في مكان واحد','نراجع المنهاج بعين المعلّم','وصول مباشر إلى المواد الحالية. فتح المادة لا يعني اعتماد محتواها أو اكتمال تدقيقها.')+`<div class="toolbar"><label class="field"><span>الصف</span><select class="select" id="course-grade"><option value="all">جميع الصفوف</option><option value="8">الصف الثامن</option><option value="6">الصف السادس</option></select></label><label class="field"><span>المادة</span><select class="select" id="course-subject"><option value="all">جميع المواد</option>${Object.entries(subjects).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><span class="muted" id="course-count" role="status"></span></div><div class="curriculum-grid" id="course-results"></div><p class="notice">أزرار الفتح تذهب إلى الموقع الحالي، وقد يطلب اختيار ملف طالب. إدارة الدروس وحفظ تعديلات المحتوى تُضاف عند ربط Laravel.</p>`;
    ['course-grade','course-subject'].forEach(id=>document.getElementById(id).addEventListener('change',filterCourses));filterCourses();
  }
  function filterCourses() {
    const gradeValue=document.getElementById('course-grade').value,subjectValue=document.getElementById('course-subject').value;
    const rows=data.courses.filter(c=>(gradeValue==='all'||String(c.grade)===gradeValue)&&(subjectValue==='all'||c.subject===subjectValue));
    document.getElementById('course-count').textContent=`عدد المواد: ${n(rows.length)}`;
    document.getElementById('course-results').innerHTML=rows.length?rows.map(c=>`<article class="course-card"><div class="course-top"><span class="subject-icon ${esc(c.subject)}">${icon(c.subject)}</span>${chip(grade(c.grade))}</div><h2>${esc(c.name)}</h2><p>${esc(c.description)}</p><div class="course-meta"><span class="muted">مادة قائمة على الموقع</span><a class="text-link" href="${esc(c.path)}" target="_blank" rel="noopener">فتح المادة ${icon('arrow')}</a></div></article>`).join(''):'<div class="empty-state"><p>لا توجد مواد بهذه الخيارات.</p></div>';
  }
  function integration() {
    content.innerHTML=heading('الخطوة التالية','واجهة جاهزة لتوصيل البيانات','هذه نسخة واجهة فقط. يتولى Laravel تسجيل الدخول والصلاحيات والحفظ والمزامنة.')+`<section class="panel"><div class="panel-head"><h2>حالة الربط</h2><span class="chip warning">لم يُربط الخادم بعد</span></div><div class="connection-list">${[['مصدر البيانات','ملف عرض محلي، مستقل عن تقدّم الطلاب المحفوظ.'],['حسابات المشرفين','تُضاف مصادقة Laravel وصلاحيات كل مستخدم في الخادم.'],['حفظ التقدّم والمزامنة','غير متاحين في هذه المعاينة؛ لا تُرسل الواجهة الحالية أي بيانات.'],['التقارير','التصدير هنا يحتوي بيانات العرض التجريبية فقط.'],['العمل دون اتصال','تُحفظ ملفات المعاينة العامة. بيانات الطلاب الخاصة مستقبلًا لا تُخزّن تلقائيًا.']].map(([title,desc])=>`<div class="connection-item"><span class="subject-icon math">${icon('link')}</span><div><h3>${title}</h3><p>${desc}</p></div></div>`).join('')}</div><a class="button secondary" href="LARAVEL-HANDOFF.md" target="_blank" rel="noopener">دليل تسليم الواجهة ${icon('arrow')}</a></section><section class="notice"><h2>معنى الأرقام قبل ربطها</h2><p>إنجاز القراءة يختلف عن نتيجة التدريب، ونتيجة التدريب لا تكفي وحدها لإثبات الإتقان. ينبغي إبقاء هذه المؤشرات منفصلة في قاعدة البيانات والتقارير.</p><p>قرارات مطابقة الكتاب وسلوك استعادة النسخة الاحتياطية ما زالت مستقلة عن تصميم هذه اللوحة.</p></section>`;
  }
  function detail(id) {
    const s=data.students.find(x=>x.id===id);if(!s)return;
    document.getElementById('dialog-title').textContent=`متابعة ${s.name}`;
    document.getElementById('dialog-content').innerHTML=`<div class="detail-intro"><img class="avatar" src="${esc(s.avatar)}" width="64" height="64" alt=""><div><b>${grade(s.grade)}</b><p>أرقام توضيحية للمعاينة فقط</p></div></div><div class="detail-grid">${s.subjects.map(x=>`<article class="detail-cell"><span class="subject-icon ${x.id}">${icon(x.id)}</span><h3>${esc(x.name)}</h3><dl class="definition-list"><div><dt>دروس مكتملة</dt><dd>${n(x.completed)} من ${n(x.total)}</dd></div><div><dt>نتيجة تدريب توضيحية</dt><dd>${n(x.assessment)}٪</dd></div></dl><p><b>خطوة مقترحة:</b> ${esc(x.focus)}</p></article>`).join('')}</div><p class="notice">نتيجة التدريب هنا قيمة تجريبية مستقلة. لا تُقرأ أي بيانات من ملف الطالب على هذا الجهاز، ولا يُعد هذا التقرير تقييمًا فعليًا.</p>`;
    document.getElementById('student-dialog').showModal();
  }
  function exportReport() {
    const rows=[['بيانات تجريبية فقط — بستان التعلم'],['الطالب','الصف','المادة','الدروس المكتملة','مجموع الدروس','نتيجة تدريب تجريبية']];
    data.students.forEach(s=>s.subjects.forEach(x=>rows.push([s.name,grade(s.grade),x.name,n(x.completed),n(x.total),n(x.assessment)+'٪'])));
    const csv='\uFEFF'+rows.map(row=>row.map(cell=>'"'+String(cell).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='bustan-demo-report.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('تم تصدير نموذج التقرير ببيانات تجريبية.');
  }
  function closeMenu() {const inside=document.getElementById('sidebar').contains(document.activeElement);document.body.classList.remove('menu-open');document.getElementById('main-content').inert=false;document.getElementById('menu-toggle').setAttribute('aria-expanded','false');document.getElementById('menu-backdrop').hidden=true;if(inside)document.getElementById('menu-toggle').focus();}
  function quizBuilder() {
    if(window.QUIZ_BUILDER)window.QUIZ_BUILDER.mount(content);
    else content.innerHTML='<p class="notice" role="alert">تعذر تحميل مصمم الاختبارات. أعد تحميل الصفحة للتحقق من ملفات الواجهة.</p>';
  }
  function render() {
    let view=location.hash.slice(1)||'overview';if(!titles[view])view='overview';
    document.querySelectorAll('[data-view]').forEach(el=>{if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    document.getElementById('breadcrumb-current').textContent=titles[view];document.title=titles[view]+' | بستان التعلّم';
    ({overview,students,curriculum,'quiz-builder':quizBuilder,integration})[view]();closeMenu();
  }
  document.getElementById('menu-toggle').addEventListener('click',()=>{const open=!document.body.classList.contains('menu-open');document.body.classList.toggle('menu-open',open);document.getElementById('main-content').inert=open;document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open));document.getElementById('menu-backdrop').hidden=!open;if(open)document.querySelector('.nav-item').focus();});
  document.getElementById('menu-backdrop').addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu-open')){closeMenu();document.getElementById('menu-toggle').focus();}});
  window.matchMedia('(min-width:821px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
  document.getElementById('close-dialog').addEventListener('click',()=>document.getElementById('student-dialog').close());
  content.addEventListener('click',e=>{const student=e.target.closest('[data-student]');if(student)detail(student.dataset.student);if(e.target.closest('[data-action="export"]'))exportReport();});
  function connection() {document.getElementById('connection-status').textContent=navigator.onLine?'متصل بالشبكة':'معاينة دون اتصال';}
  window.addEventListener('online',connection);window.addEventListener('offline',connection);window.addEventListener('hashchange',()=>{render();document.getElementById('main-content').focus();});
  icons(document);connection();
  if(!data) {content.innerHTML='<p class="notice">تعذر تحميل بيانات المعاينة. أعد تحميل الصفحة بعد التحقق من ملفات الواجهة.</p>';return;}
  render();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>toast('تعذر تجهيز المعاينة دون اتصال. يمكنك متابعة التصفح.'));
})();
