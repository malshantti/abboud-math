// Run: node tests/admin-lesson-totals.cjs. The admin student page shows "lessons done of total";
// the PHP totals must equal the ALLSK list the math apps use (prerequisites + non-review lessons).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const php = fs.readFileSync(path.join(root, 'backend/app/Support/Ar.php'), 'utf8');
const totals = Object.fromEntries([...php.match(/LESSON_TOTALS = \[([^\]]+)\]/)[1].matchAll(/'(\w+)' => (\d+)/g)].map(m => [m[1], +m[2]]));
const dirs = {bustan_g6_math_v1: 'g6/math', abboud_math_v1: 'g8/math'};
let checks = 0;
for (const [key, dir] of Object.entries(dirs)) {
  const app = fs.readFileSync(path.join(root, dir, 'app.js'), 'utf8');
  assert.ok(app.includes("KEY='" + key + "'"), dir + ' uses ' + key); checks++;
  assert.ok(/ALLSK=\[\.\.\.C\.prerequisites\.map\(p=>p\.id\),\.\.\.Object\.values\(LES\)\.filter\(l=>!l\.review\)/.test(app), dir + ': ALLSK definition unchanged'); checks++;
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, dir, 'data.js'), 'utf8'), ctx);
  const C = ctx.CURR; let n = C.prerequisites.length;
  C.semesters.forEach(s => s.units.forEach(u => u.lessons.forEach(l => { if (!/تمارين عامة/.test(l.title)) n++; })));
  assert.equal(totals[key], n, key + ' total matches ' + dir); checks++;
}
console.log('admin-lesson-totals: ' + checks + ' checks passed');
