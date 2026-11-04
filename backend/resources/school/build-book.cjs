#!/usr/bin/env node
// Builds textbook question banks for grades whose content.js has no «bmc»:
//  - g6-math from book/g6-math.txt (questions transcribed from the Palestinian textbook exercises; format
//    "#LESSONID" then "page|question|correct|wrong…"), lesson titles from g6/math/data.js.
//  - g6-arabic from the textbook glossary («معاني المفردات») and the grammar questions in g6/arabic/content.js.
//  - g6-english: gap-fill of word-box words in sentences printed in g6/english/content.js.
// The correct option is always index 0 (the quiz shuffles). Run: node backend/resources/school/build-book.cjs
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '../../..'), OUT = path.join(__dirname, 'bank');
const load = (f) => { const w = {}; w.window = w; vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), w); return w; };
const write = (code, units) => { fs.writeFileSync(path.join(OUT, code + '.json'), JSON.stringify(units)); console.log(code, units.reduce((a, u) => a + u.les.reduce((b, l) => b + l.q.length, 0), 0)); };
const uniq = (a) => [...new Set(a)];
// pick n distractors from pool (deterministic), excluding the answer
const pick = (pool, ans, n, seed) => { const p = uniq(pool).filter((x) => x && x !== ans); const o = []; for (let i = 0; i < p.length && o.length < n; i++) o.push(p[(seed + i * 7) % p.length]); return uniq(o).slice(0, n); };

function g6math() {
  const C = load('g6/math/data.js').CURR, src = {}; let cur = null;
  for (const line of fs.readFileSync(path.join(__dirname, 'book/g6-math.txt'), 'utf8').split('\n')) {
    if (line.startsWith('#')) { cur = line.slice(1).trim(); src[cur] = []; continue; }
    const p = line.split('|'); if (!cur || p.length < 4) continue;
    src[cur].push([p[1], p.slice(2), 0, +p[0] || 0]);
  }
  const units = [];
  for (const s of C.semesters) for (const u of s.units) units.push({ id: u.id, t: u.title, les: u.lessons.map((l) => ({ id: l.id, t: l.number + ' ' + l.title, q: src[l.id] || [] })) });
  write('g6-math', units);
}

function g6arabic() {
  const U = load('g6/arabic/content.js').UNITS, units = [];
  const strip = (s) => String(s).replace(/[.،]+$/, '').trim();
  U.forEach((u, i) => {
    const S = u.sec, voc = [...(S.read && S.read.voc || []).map((v) => [...v, S.read.pg]), ...(S.poem && S.poem.voc || []).map((v) => [...v, S.poem.pg])];
    const means = voc.map((v) => strip(v[1]));
    const read = voc.map((v, k) => { const d = pick(means, strip(v[1]), 3, k + i); return d.length < 2 ? null : ['ما معنى كلمة «' + v[0] + '» كما وردت في الدرس؟', [strip(v[1]), ...d], 0, v[2]]; }).filter(Boolean);
    const les = [];
    if (read.length) les.push({ id: u.id + 'L1', t: 'مفردات: ' + S.read.t + (S.poem ? ' / ' + S.poem.t : ''), q: read });
    if (S.grammar && S.grammar.q && S.grammar.q.length) les.push({ id: u.id + 'L2', t: S.grammar.t, q: S.grammar.q.map((q) => [q[0], [q[1][q[2]], ...q[1].filter((_, k) => k !== q[2])], 0, S.grammar.pg]) });
    units.push({ id: u.id, t: 'الوحدة ' + (i + 1) + ': ' + (S.read ? S.read.t : u.id), les });
  });
  write('g6-arabic', units);
}

function g6english() {
  const E = load('g6/english/content.js').EN_CONTENT, units = [];
  for (const u of E.units) {
    const voc = u.vocabulary || [], ar = voc.map((v) => v.arabic), words = voc.map((v) => v.word);
    // Gap-fill only from sentences printed in the Pupil's Book (word-box examples, readings, speech bubbles).
    const sents = uniq([...voc.map((v) => v.example), ...(u.texts || []).flatMap((t) => t.paragraphs || []).flatMap((p) => p.split(/(?<=[.!?])\s+/)), ...(u.dialogues || []).flatMap((d) => (d.lines || []).map((l) => l.text))].filter((x) => x && x.length < 140));
    const L1 = [], seen = new Set();
    voc.forEach((v, k) => {
      const re = new RegExp('\\b' + v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      sents.filter((x) => re.test(x)).slice(0, 2).forEach((x, j) => {
        if (seen.has(x)) return; seen.add(x); const d = pick(words, v.word, 3, k + j + 3); if (d.length < 2) return;
        L1.push(['Complete the sentence from the unit: ' + x.replace(re, '_____'), [v.word, ...d], 0, u.page]);
      });
    });
    const les = [];
    if (L1.length) les.push({ id: 'U' + u.number + 'L1', t: 'Vocabulary in context — مفردات الوحدة في جمل الكتاب', q: L1 });
    units.push({ id: 'U' + u.number, t: 'Unit ' + u.number + ': ' + u.title, les });
  }
  write('g6-english', units);
}
g6math(); g6arabic(); g6english();
