#!/usr/bin/env node
// صفحات المواد لمحركات البحث + sitemap.xml
// الاستعمال:  node tools/seo-pages.cjs
// - يكتب في كل g<الصف>/<المادة>/index.html قسمًا ثابتًا (.seo-intro) فيه: H1، وصف المادة،
//   وحدات الكتاب ودروسه (من ملفات المحتوى نفسها)، روابط مواد الصف، وزر «ابدأ التعلّم»، وJSON-LD.
// - الزائر بلا جلسة (ومنه Googlebot) يرى هذا القسم فقط ولا يُشغَّل التطبيق؛ الطالب المسجّل لا يراه.
//   حارس الرأس يحوّل السكربتات اللاحقة إلى text/plain للزائر حتى لا يكتب التطبيق في التخزين.
// - يعيد كتابة sitemap.xml من المجلدات الموجودة (lastmod = آخر commit للمجلد).
// إعادة التشغيل آمنة: يستبدل ما بين علامات seo-guard و seo-intro فقط.
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..'), SITE = 'https://bustankids.com/';

const catalog = (() => { const g = {}; g.window = g; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'catalog.js'), 'utf8'), g); return g.CATALOG || Object.values(g).find(v => v && v.subjects); })();
const gradeName = id => catalog.grades.find(g => g.id === id).name;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function loadContent(dir) {
  const files = fs.readdirSync(dir).filter(f => /^(illustrations|content.*|data)\.js$/.test(f)).sort((a, b) => (a === 'illustrations.js' ? -1 : b === 'illustrations.js' ? 1 : a.localeCompare(b)));
  const noop = () => {}, el = () => ({ style: {}, setAttribute: noop, appendChild: noop });
  const g = { console: { log: noop, warn: noop }, localStorage: { getItem: () => null, setItem: noop }, addEventListener: noop, navigator: {}, location: { hash: '' }, setTimeout: noop,
    document: { documentElement: { dataset: {} }, addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: el } };
  g.window = g; g.self = g; vm.createContext(g);
  for (const f of files) { try { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), g); } catch (e) { /* ملف يعتمد على الواجهة؛ نكتفي بما حُمّل */ } }
  return g;
}

function units(g) {
  const T = x => (x && (x.title || x.t || x.name)) || '';
  let u = null;
  if (g.G1_COURSE) u = g.G1_COURSE.units.map(x => ({ t: x.title, l: (x.lessons || []).map(T) }));
  else if (g.G3) u = g.G3.units.map(x => ({ t: x.t, l: (x.les || []).map(T) }));
  else if (g.CURR && g.CURR.semesters) u = g.CURR.semesters.flatMap(s => s.units.map(x => ({ t: x.title, l: (x.lessons || []).map(T) })));
  else if ((g.ENC || g.EN_CONTENT || {}).units) u = (g.ENC || g.EN_CONTENT).units.map(x => ({ t: (x.n || x.number) ? `Unit ${x.n || x.number}: ${x.title}` : x.title,
    l: [...(x.texts || []).map(T), ...(x.grammar || []).map(T)] }));
  else if (Array.isArray(g.UNITS)) u = g.UNITS.map(x => x.sec ? { t: (x.sec.read && x.sec.read.t) || '', l: Object.values(x.sec).map(s => s && s.t).filter(Boolean).slice(1) } : { t: x.t, l: (x.les || []).map(T) });
  if (!u) return [];
  // عناوين متكررة في أكثر من وحدتين (مثل «المفردات») لا تصف الدرس، فتُحذف.
  const seen = {}; u.forEach(x => new Set(x.l).forEach(l => { seen[l] = (seen[l] || 0) + 1; }));
  return u.map(x => ({ t: String(x.t).trim(), l: [...new Set(x.l)].filter(l => l && seen[l] <= 2 && l !== x.t).map(s => String(s).trim()) })).filter(x => x.t || x.l.length);
}

function guard(rel, redirect) {
  // الزائر بلا جلسة: صفحة تعريف ثابتة، والسكربتات التالية لا تعمل.
  // الطالب: كما كان (g3–g8 تحوّل الجلسة المعلّقة أو مالكًا مختلفًا إلى الدخول؛ g1–g2 يتولاها early.js).
  const red = redirect ? `try{if(s.pending||localStorage.getItem('bustan_owner')!==s.id)location.replace('../../login.html?next='+encodeURIComponent('${rel}'+location.hash))}catch(e){}` : '';
  return `<!-- seo-guard:start -->
<style>.seo-intro{display:none}html[data-guest] body>*{display:none!important}html[data-guest] body{display:block!important;margin:0;padding:0;background:#fbf9f0!important;min-height:0!important}html[data-guest] body>.seo-intro{display:block!important}
.seo-intro{max-width:760px;margin:0 auto;padding:20px 16px 48px;color:#24331c;font:16px/1.75 Cairo,Baloo,G1Cairo,Tahoma,sans-serif;text-align:right}.seo-intro a{color:#507a12}.si-crumbs{font-size:14px;color:#5b6b5d}.si-top{display:flex;gap:14px;align-items:center;margin:14px 0 4px}.si-top img{flex:none}.seo-intro h1{font-size:clamp(24px,5vw,34px);line-height:1.35;margin:0}.si-lead{font-size:17px;margin:10px 0 8px}.si-about{margin:0 0 18px;color:#3d4c35}.si-cta{display:inline-block;background:#6f9e23;color:#fff!important;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:999px;font-size:18px}.si-cta:hover{background:#507a12}.seo-intro h2{font-size:21px;margin:34px 0 12px}.si-units{list-style:none;padding:0;margin:0;display:grid;gap:10px}.si-units>li{background:#fff;border:1px solid #e8e6d6;border-radius:14px;padding:12px 16px}.si-units h3{font-size:17px;margin:0}.si-units ul{margin:6px 0 0;padding:0 20px 0 0;color:#3d4c35;font-size:15px}.si-subj{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none}.si-subj a{display:inline-block;border:1px solid #e8e6d6;background:#fff;border-radius:999px;padding:6px 14px;text-decoration:none}.si-foot{margin-top:30px;font-size:14px;color:#5b6b5d}</style>
<script>(function(){var d=document.documentElement,s=null;try{s=JSON.parse(localStorage.getItem('bustan_session')||'null')}catch(e){}if(!s){d.setAttribute('data-guest','');var k=function(n){if(n.tagName==='SCRIPT'&&(!n.type||/(java|ecma)script|module/i.test(n.type)))n.type='text/plain'};new MutationObserver(function(r){for(var i=0;i<r.length;i++)for(var j=0;j<r[i].addedNodes.length;j++)k(r[i].addedNodes[j])}).observe(d,{childList:true,subtree:true});return}d.setAttribute('data-member','');${red}})();</script>
<!-- seo-guard:end -->`;
}

// فقرة تعريف لكل مادة: جملة حسب نوع المادة تذكر موضوعات من وحداتها الفعلية، ثم عدد الوحدات.
const topicOf = u => {
  const clean = s => String(s || '').replace(/^Unit \d+\s*[:—-]\s*/, '').replace(/^(الوحدة|الدرس|الدّرس|الدروس|الدّروس)[^:]*:\s*/, '')
    .replace(/^(قراءة|استماع)\s*:\s*/, '').replace(/\s*—\s*الجزء (الأول|الثاني)$/, '').replace(/\s*\([\d٠-٩]+\)$/, '').trim();
  let t = clean(u.t);
  // وحدة بلا اسم خاص («الوحدة الأولى»، «الدروس 4–6») أو اسمها قائمة دروس: نأخذ أول درس فيها.
  if (!t || /^(الوحدة|الدرس|الدروس|الدّروس)(\s|$)/.test(t) || t.includes('،')) t = clean(u.l[0]);
  return t;
};
const joinAr = a => a.length < 2 ? (a[0] || '') : a.slice(0, -1).join('، ') + '، و' + a[a.length - 1];
const unitsAr = n => n === 1 ? 'وحدة واحدة' : n === 2 ? 'وحدتين' : n <= 10 ? `${n} وحدات` : `${n} وحدة`;
function about(p) {
  const { subj, name, grade, list } = p, gl = 'لل' + gradeName(grade).slice(2);
  const picks = [...new Set(list.filter(u => !/revision|مراجعة|تهيئة|التهيئة/i.test(u.t)).map(topicOf).filter(t => t && t.length <= 60))];
  const step = Math.max(1, Math.floor(picks.length / 3)), topics = joinAr([0, step, step * 2].map(i => picks[i]).filter((t, i, a) => t && a.indexOf(t) === i).map(t => `«${t}»`));
  const s1 = {
    math: `في ${name} ${gl} يتعلّم طفلك موضوعات الكتاب مثل ${topics}. يشرح كل درس الفكرة خطوة بخطوة، ثم يتدرّب الطفل عليها بأسئلة تفاعلية.`,
    arabic: `في ${name} ${gl} يتدرّب طفلك على دروس الكتاب ومنها ${topics}، قراءةً وفهمًا ومفرداتٍ وتدريبات.`,
    english: `في ${name} ${gl} يتعلّم طفلك كلمات وجملًا من وحدات كتاب English for Palestine، مثل ${topics}، ثم يجيب عن أسئلة قصيرة تثبّت ما تعلّمه.`,
    science: `في ${name} ${gl} يستكشف طفلك موضوعات مثل ${topics}، بشرح مبسّط وأسئلة تفاعلية مرتبطة بالكتاب.`,
    life: `في ${name} ${gl} يتعرّف طفلك إلى موضوعات مثل ${topics}، بصور وأنشطة قصيرة تناسب عمره.`,
  }[subj] || `في ${name} ${gl} يتعلّم طفلك موضوعات مثل ${topics}.`;
  return topics ? `${s1} تسير الدروس بترتيب الكتاب المدرسي في ${unitsAr(list.length)}، ويتابع وليّ الأمر تقدّم طفله من تقرير التعلّم.` : '';
}

function intro(p) {
  const { grade, subj, rel, name, lead, list, siblings } = p;
  const aboutText = about(p);
  const url = SITE + rel, gname = gradeName(grade), h1 = `${name} لل${gname.slice(2)} — المنهاج الفلسطيني`;
  const next = '../../login.html?next=' + encodeURIComponent(rel);
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'بستان التعلّم', item: SITE }, { '@type': 'ListItem', position: 2, name: `${name} — ${gname}`, item: url }] },
    { '@type': 'Course', name: h1, description: lead, url, inLanguage: subj === 'english' ? ['ar', 'en'] : 'ar', educationalLevel: gname,
      provider: { '@type': 'EducationalOrganization', '@id': SITE + '#org', name: 'بستان التعلّم', url: SITE },
      syllabusSections: list.slice(0, 60).map(u => ({ '@type': 'Syllabus', name: u.t || u.l[0] })) }] };
  const lis = list.map(u => `<li><h3>${esc(u.t || u.l[0])}</h3>${u.l.length ? `<ul>${u.l.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</li>`).join('\n');
  return `<!-- seo-intro:start -->
<section class="seo-intro" lang="ar" dir="rtl" aria-labelledby="si-h1">
<nav class="si-crumbs" aria-label="مسار الصفحة"><a href="../../">بستان التعلّم</a> › ${esc(gname)} › ${esc(name)}</nav>
<div class="si-top"><img src="../../assets/brand/logo-mascot-sm.webp" width="44" height="58" alt="زيتون، رفيق بستان التعلّم"><h1 id="si-h1">${esc(h1)}</h1></div>
<p class="si-lead">${esc(lead)}</p>
${aboutText ? `<p class="si-about">${esc(aboutText)}</p>\n` : ''}<a class="si-cta" href="${next}">ابدأ التعلّم</a>
${list.length ? `<h2>وحدات الكتاب ودروسه</h2>\n<ol class="si-units">\n${lis}\n</ol>` : ''}
${siblings.length ? `<h2>مواد ${esc(gname)} الأخرى</h2>\n<ul class="si-subj">${siblings.map(s => `<li><a href="../${s.id}/">${esc(s.name)}</a></li>`).join('')}</ul>` : ''}
<p class="si-foot">دروس تفاعلية مطابقة لترتيب كتاب ${esc(name)} ل${esc(gname.slice(2))} في المنهاج الفلسطيني، مع زيتون الذي يشجّع طفلك، وتقرير تقدّم لوليّ الأمر. <a href="../../">كل الصفوف والمواد</a></p>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</section>
<!-- seo-intro:end -->`;
}

const pages = [];
for (const gd of fs.readdirSync(ROOT).filter(d => /^g\d+$/.test(d)).sort((a, b) => a.slice(1) - b.slice(1))) {
  const grade = +gd.slice(1), order = (catalog.gradeSubjects && catalog.gradeSubjects[grade]) || catalog.subjects.map(s => s.id);
  const subs = fs.readdirSync(path.join(ROOT, gd)).filter(s => fs.existsSync(path.join(ROOT, gd, s, 'index.html')) && catalog.subjects.some(c => c.id === s))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  for (const subj of subs) pages.push({ grade, subj, rel: `${gd}/${subj}/`, dir: path.join(ROOT, gd, subj), all: subs });
}

for (const p of pages) {
  const file = path.join(p.dir, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const cat = catalog.subjects.find(s => s.id === p.subj);
  const first = title.split('—')[0].split(' لل')[0].trim();
  p.name = p.subj === 'science' && first && !/english/i.test(first) ? first : cat.name;
  // العنوان: «<المادة> لل<الصف> — المنهاج الفلسطيني | بستان التعلّم» في title وog وtwitter.
  const fullTitle = esc(`${p.name} لل${gradeName(p.grade).slice(2)} — المنهاج الفلسطيني | بستان التعلّم`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${fullTitle}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${fullTitle}$2`);
  p.lead = ((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&quot;/g, '"');
  p.list = units(loadContent(p.dir));
  p.siblings = p.all.filter(s => s !== p.subj).map(s => ({ id: s, name: catalog.subjects.find(c => c.id === s).name }));

  const oldGuard = /<script>\(function\(\)\{try\{var s=JSON\.parse\(localStorage\.getItem\('bustan_session'\)[^\n]*?\}\)\(\);<\/script>/;
  const g = guard(p.rel, oldGuard.test(html) || /seo-guard:start[\s\S]*?bustan_owner[\s\S]*?seo-guard:end/.test(html));
  if (/<!-- seo-guard:start -->/.test(html)) html = html.replace(/<!-- seo-guard:start -->[\s\S]*?<!-- seo-guard:end -->/, () => g);
  else if (oldGuard.test(html)) html = html.replace(oldGuard, () => g);
  else { const i = html.search(/<script/); if (i < 0 || i > html.indexOf('</head>')) throw new Error('no head script in ' + p.rel); html = html.slice(0, i) + g + '\n' + html.slice(i); }

  const block = intro(p);
  if (/<!-- seo-intro:start -->/.test(html)) html = html.replace(/<!-- seo-intro:start -->[\s\S]*?<!-- seo-intro:end -->/, () => block);
  else html = html.replace(/<body[^>]*>/, m => m + '\n' + block + '\n');
  fs.writeFileSync(file, html);
  console.log(p.rel.padEnd(12), `${p.list.length} وحدة، ${p.list.reduce((a, u) => a + u.l.length, 0)} درس`);
}

const lastmod = f => cp.execSync(`git log -1 --format=%cs -- "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim() || new Date().toISOString().slice(0, 10);
const urls = [['', 'index.html'], ['privacy.html', 'privacy.html'], ['terms.html', 'terms.html'], ...pages.map(p => [p.rel, p.rel])];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(([u, f]) => `  <url><loc>${SITE}${u}</loc><lastmod>${lastmod(f)}</lastmod></url>`).join('\n') + '\n</urlset>\n');
console.log(`sitemap.xml: ${urls.length} رابط`);
