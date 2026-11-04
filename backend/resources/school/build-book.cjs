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

// Science g6/g8: term ↔ definition questions, only for terms whose name is found in the textbook text
// (/workspace/arsci/books/sc{g}-p{1,2}.txt, pdftotext). Lesson structure from g{g}/science/content.js.
function science(g) {
  const U = load('g' + g + '/science/content.js').UNITS;
  const N = (s) => String(s).replace(/[\u064B-\u0652\u0640\s]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  const bookDir = process.env.BOOKS || '/workspace/arsci/books';
  const B = N(['p1', 'p2'].map((p) => { try { return fs.readFileSync(path.join(bookDir, 'sc' + g + '-' + p + '.txt'), 'utf8'); } catch (e) { return ''; } }).join(' '));
  if (B.length < 1000) { console.log('g' + g + '-science: textbook text not found, skipped'); return; }
  const units = U.map((u) => {
    const all = u.les.flatMap((l) => (l.terms || []).filter((x) => B.includes(N(x[0]))));
    const names = all.map((x) => x[0]), defs = all.map((x) => x[1]);
    return { id: u.id, t: u.t, les: u.les.map((l) => {
      const T = (l.terms || []).filter((x) => B.includes(N(x[0]))), q = [];
      T.forEach((x, k) => {
        const d1 = pick(defs, x[1], 3, k), d2 = pick(names, x[0], 3, k + 1);
        if (d1.length >= 2) q.push(['ما المقصود بـ«' + x[0] + '»؟', [x[1], ...d1], 0, l.pg]);
        if (d2.length >= 2) q.push(['«' + x[1].replace(/[.。]$/, '') + '». ما المصطلح العلمي الدال على العبارة؟', [x[0], ...d2], 0, l.pg]);
      });
      return { id: l.id, t: l.t, q };
    }) };
  });
  write('g' + g + '-science', units);
}
const only = process.argv[2];
if (!only || only === 'g6') { g6math(); g6arabic(); g6english(); }
if (!only || only === 'sci') { science(6); science(8); }

