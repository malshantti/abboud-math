// Run: node tests/report-log.cjs. report-log.js records time and answers (button gets ok/bad after a click) into bustan_report_v1.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'report-log.js'), 'utf8');
const profiles = fs.readFileSync(path.join(root, 'profiles.js'), 'utf8');
const php = fs.readFileSync(path.join(root, 'backend/app/Support/Ar.php'), 'utf8');
let checks = 0;
assert.ok(/const PER=\[[^\]]*'bustan_report_v1'/.test(profiles), 'report key is per student'); checks++;
assert.ok(profiles.includes("new URL('report-log.js',me)"), 'profiles.js loads report-log.js on subject pages'); checks++;
assert.ok(/SYNC_KEYS = \[[^\]]*'bustan_report_v1'/.test(php), 'server accepts the report key'); checks++;
for (const f of fs.readdirSync(root).filter(d => /^g\d+$/.test(d)).flatMap(g => fs.readdirSync(path.join(root, g)).map(s => path.join(g, s, 'sw.js')))) {
  if (!fs.existsSync(path.join(root, f))) continue;
  assert.ok(fs.readFileSync(path.join(root, f), 'utf8').includes('../../report-log.js?v='), f + ' caches report-log.js for offline'); checks++;
}
let jsdom; try { jsdom = require('jsdom'); } catch (e) { console.log('report-log: ' + checks + ' static checks passed (jsdom not installed; DOM test skipped)'); process.exit(0); }
const dom = new jsdom.JSDOM('<div id="app"><h2>القوى والجذور</h2><div class="task"><p class="q">ما قيمة ٢ أس ٣؟</p><div class="cs"><button id="a">٦</button><button id="b">٨</button></div></div></div>', { url: 'https://bustankids.com/g8/math/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.HTMLElement.prototype.getBoundingClientRect = () => ({ width: 100, height: 20 });
w.eval(src);
const a = w.document.getElementById('a'), b = w.document.getElementById('b');
a.click(); a.classList.add('bad');
setTimeout(() => {
  b.classList.add('ok');
  setTimeout(() => {
    b.click(); b.classList.add('ok');
    setTimeout(() => {
      const d = JSON.parse(w.localStorage.getItem('bustan_report_v1')), s = d.subj['g8-math'];
      assert.equal(s.n, 2); assert.equal(s.ok, 1); checks += 2;
      assert.deepEqual([s.wrong[0].q, s.wrong[0].a, s.wrong[0].c, s.wrong[0].l], ['ما قيمة ٢ أس ٣؟', '٦', '٨', 'القوى والجذور']); checks++;
      assert.equal(s.lessons['القوى والجذور'].n, 2); checks++;
      assert.deepEqual(Object.values(s.dn)[0], [2, 1]); checks++;
      console.log('report-log: ' + checks + ' checks passed');
      w.close();
    }, 50);
  }, 700);
}, 10);
