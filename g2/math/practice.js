/* تلميح يظهر بعد الخطأ الأول: طريقة الحل لا الجواب. */
(() => {
  'use strict';
  const C = window.G1_COURSE;

  // ── تدريب إضافي: ٦ أسئلة على الأقل لكل درس و١٠ لكل «مراجعة الوحدة»، بأعداد ثابتة لكل درس (مولّد بذرة). ──
  // مدى حقائق الضرب كما في الكتاب (الجزء الثاني ص٤٠، ٤٣، ٥٢، ٥٥): ١× إلى ٥× للأعداد ٢ و٣ و٤ و٥، وحتى ٩ عشرات للعدد ١٠.
  const N = v => String(v).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const seedOf = s => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sym = value => ({ type: 'symbol', value });
  const pv = v => ({ type: 'place-value', hundreds: Math.floor(v / 100), tens: Math.floor(v / 10) % 10, ones: v % 10 });
  const mk = (prompt, scene, correct, wrongs, explain) => {
    const labels = [String(correct)];
    for (const w of wrongs) { const x = String(w); if (x && !labels.includes(x) && labels.length < 3) labels.push(x); }
    return labels.length < 2 ? null : { prompt, scene, choices: labels.map(label => ({ label })), answer: 0, explain };
  };
  const num = (c, ws, ex, prompt = 'أوجد الناتج.', scene = null) => mk(prompt, scene, N(c), ws.filter(w => w >= 0 && w !== c).map(N), ex);
  const sign = (a, b) => a > b ? '>' : a < b ? '<' : '=';
  const compare = (a, b) => mk('اختر الإشارة الصحيحة.', sym(N(a) + ' ؟ ' + N(b)), sign(a, b), ['>', '<', '='].filter(s => s !== sign(a, b)),
    a === b ? 'العددان متساويان.' : N(a) + (a > b ? ' أكبر من ' : ' أصغر من ') + N(b) + '؛ نقارن المنزلة الكبرى أولًا.');
  const order = (xs, up) => { const s = [...xs].sort((p, q) => up ? p - q : q - p), list = v => v.map(N).join('، ');
    const wrong1 = [...s].reverse(), wrong2 = [s[1], s[0], s[2]];
    return mk(up ? 'أي ترتيب تصاعدي (من الأصغر إلى الأكبر)؟' : 'أي ترتيب تنازلي (من الأكبر إلى الأصغر)؟', null, list(s), [list(wrong1), list(wrong2)], up ? 'نبدأ بالعدد الأصغر.' : 'نبدأ بالعدد الأكبر.'); };
  const add = (a, b) => num(a + b, [a + b + 10, a + b - 10, a + b + 1, a + b - 1], N(a) + ' + ' + N(b) + ' = ' + N(a + b) + '.', 'أوجد الناتج.', sym(N(a) + ' + ' + N(b) + ' = ؟'));
  const addCarry = (a, b) => { const c = a + b, noCarry = (Math.floor(a / 10) + Math.floor(b / 10)) * 10 + (a + b) % 10;
    return num(c, [noCarry, c + 10, c - 1], N(a) + ' + ' + N(b) + ' = ' + N(c) + '. إذا صار مجموع منزلة عشرة أو أكثر نحمل إلى المنزلة التالية.', 'أوجد الناتج.', sym(N(a) + ' + ' + N(b) + ' = ؟')); };
  const sub = (a, b) => { const c = a - b, digits = v => String(v).padStart(3, '0').split('').map(Number), A = digits(a), B = digits(b);
    const swap = Number(A.map((d, i) => Math.abs(d - B[i])).join(''));
    return num(c, [swap, c + 10, c - 10, c + 1], N(a) + ' − ' + N(b) + ' = ' + N(c) + '.', 'أوجد الناتج.', sym(N(a) + ' − ' + N(b) + ' = ؟')); };
  const pick = (r, list) => list[Math.floor(r() * list.length)];
  const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const digitsNoCarry = (r, places) => { let a = 0, b = 0; for (let p = 0; p < places; p++) { const x = int(r, p === places - 1 ? 1 : 0, 8), y = int(r, p === places - 1 ? 1 : 0, 9 - x); a += x * 10 ** p; b += y * 10 ** p; } return [a, b]; };
  const digitsNoBorrow = (r, places) => { let a = 0, b = 0; for (let p = 0; p < places; p++) { const x = int(r, p === places - 1 ? 2 : 1, 9), y = int(r, p === places - 1 ? 1 : 0, x - (p === places - 1 ? 1 : 0)); a += x * 10 ** p; b += y * 10 ** p; } return [a, b]; };
  const valueOf = (n, r) => { const s = String(n), i = int(r, 0, s.length - 2), d = Number(s[i]), v = d * 10 ** (s.length - 1 - i);
    return d === 0 ? null : num(v, [d, d * 10 ** (s.length - 2 - i), d * 10 ** (s.length - i)].filter(x => x !== v), 'الرقم ' + N(d) + ' قيمته ' + N(v) + ' حسب منزلته.', 'ما قيمة الرقم ' + N(d) + ' في العدد ' + N(n) + '؟', sym(N(n))); };
  const represented = n => num(n, [Number(String(n).split('').reverse().join('')), n + 10, n - 1], 'نقرأ المئات ثم العشرات ثم الآحاد: ' + N(n) + '.', 'ما العدد الممثّل؟', pv(n));
  const nextPrev = (n, next) => num(next ? n + 1 : n - 1, next ? [n - 1, n + 10, n + 2] : [n + 1, n - 10, n - 2], (next ? 'التالي أكبر بواحد: ' : 'السابق أصغر بواحد: ') + N(next ? n + 1 : n - 1) + '.', 'ما العدد ' + (next ? 'التالي' : 'السابق') + ' للعدد ' + N(n) + '؟');
  const parity = (r, digits, even) => { const lo = 10 ** (digits - 1), hi = 10 ** digits - 1, x = []; while (x.length < 3) { const v = int(r, lo, hi); if (!x.includes(v) && (x.length === 0 ? v % 2 === (even ? 0 : 1) : v % 2 === (even ? 1 : 0))) x.push(v); }
    return num(x[0], x.slice(1), 'آحاد ' + N(x[0]) + ' هو ' + N(x[0] % 10) + '؛ فهو ' + (even ? 'زوجي.' : 'فردي.'), even ? 'أي عدد زوجي؟' : 'أي عدد فردي؟'); };
  const rows = (a, b) => ({ type: 'data-table', rows: [{ label: 'التفاح', icon: 'apple', count: a }, { label: 'البرتقال', icon: 'orange', count: b }] });
  const dataQ = r => { let a = int(r, 1, 6), b = int(r, 1, 6); if (a === b) b = a === 6 ? 5 : a + 1; const k = int(r, 0, 3);
    if (k === 0) return num(a, [b, a + b], 'نعدّ صور التفاح فقط: ' + N(a) + '.', 'كل صورة تمثّل ثمرة واحدة. كم تفاحة؟', rows(a, b));
    if (k === 1) return mk('أي الثمرتين أكثر عددًا؟', rows(a, b), a > b ? 'التفاح' : 'البرتقال', [a > b ? 'البرتقال' : 'التفاح', 'العددان متساويان'], N(Math.max(a, b)) + ' أكثر من ' + N(Math.min(a, b)) + '.');
    if (k === 2) return num(a + b, [Math.abs(a - b), a + b + 1], N(a) + ' + ' + N(b) + ' = ' + N(a + b) + '.', 'كم ثمرة في البيانات كلها؟', rows(a, b));
    return num(Math.abs(a - b), [a + b, Math.abs(a - b) + 1], N(Math.max(a, b)) + ' − ' + N(Math.min(a, b)) + ' = ' + N(Math.abs(a - b)) + '.', 'ما الفرق بين عدد التفاح وعدد البرتقال؟', rows(a, b)); };
  const grp = g => g === 1 ? 'مجموعة واحدة' : g === 2 ? 'مجموعتان' : N(g) + ' مجموعات';
  const times = (g, n) => num(g * n, [g + n, g * n + n, g * n - n], N(g) + ' × ' + N(n) + ' = ' + N(g * n) + '؛ ' + grp(g) + '، في كل منها ' + N(n) + '.', 'أوجد الناتج.', sym(N(g) + ' × ' + N(n) + ' = ؟'));
  const groupsQ = (g, n) => num(g * n, [g + n, g * n + n, g * n - n], grp(g) + '، في كل منها ' + N(n) + '؛ المجموع ' + N(g * n) + '.', 'ما عدد الكرات في المجموعات كلها؟', { type: 'groups', groups: g, countPerGroup: n, icon: 'ball' });
  const skip = (step, r) => { const s = int(r, 1, 3) * step, seq = [s, s + step, s + 2 * step];
    return num(s + 3 * step, [s + 3 * step + 1, s + 2 * step + 1, s + 4 * step], 'نزيد ' + N(step) + ' في كل مرة.', 'أكمل العدّ ' + ['', '', 'اثنين اثنين', 'ثلاثة ثلاثة', 'أربعة أربعة', 'خمسة خمسة', '', '', '', '', 'عشرة عشرة'][step] + '.', sym(seq.map(N).join(' ، ') + ' ، ؟')); };
  const divide = (d, q) => num(q, [d, q + 1, d * q], N(d * q) + ' ÷ ' + N(d) + ' = ' + N(q) + '؛ لأن ' + N(d) + ' × ' + N(q) + ' = ' + N(d * q) + '.', 'أوجد الناتج.', sym(N(d * q) + ' ÷ ' + N(d) + ' = ؟'));
  const share = (d, q, r) => { const thing = pick(r, [['تفاحة', 'تفاحات'], ['قلمًا', 'أقلام'], ['كرة', 'كرات']]);
    return num(q, [d, q + 1, d * q], N(d * q) + ' ÷ ' + N(d) + ' = ' + N(q) + '.', 'وزّعنا ' + N(d * q) + ' ' + thing[1] + ' بالتساوي على ' + N(d) + ' أطفال. كم لكل طفل؟'); };
  const FR = { 2: 'نصف', 3: 'ثلث', 4: 'ربع', 5: 'خمس', 8: 'ثمن' };
  const fracName = (parts, set) => mk('قُسم الشكل إلى أجزاء متساوية. ما اسم الجزء المظلل؟', { type: 'fraction', parts, selected: 1 }, FR[parts], set.filter(p => p !== parts).map(p => FR[p]), 'الشكل مقسوم إلى ' + N(parts) + ' أجزاء متساوية؛ الجزء الواحد ' + FR[parts] + '.');
  const fracOfSet = (parts, each) => num(each, [parts, parts * each, each + 1], FR[parts] + ' المجموعة هو نصيب جزء واحد من ' + N(parts) + ' أجزاء متساوية: ' + N(each) + '.', 'ما ' + FR[parts] + ' مجموعة من ' + N(parts * each) + ' كرات؟', { type: 'groups', groups: parts, countPerGroup: each, icon: 'ball' });
  const HOURS = ['', 'الواحدة', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة'];
  const MIN = { 0: 'تمامًا', 5: 'وخمس دقائق', 10: 'وعشر دقائق', 15: 'وخمس عشرة دقيقة', 20: 'وعشرون دقيقة', 30: 'وثلاثون دقيقة' };
  const clockQ = r => { const h = int(r, 1, 12), m = pick(r, [0, 5, 10, 15, 20, 30]), t = (hh, mm) => HOURS[hh] + ' ' + MIN[mm];
    const other = m === 0 ? 5 : 0, h2 = h === 12 ? 1 : h + 1;
    return mk('ما الوقت؟', { type: 'clock', hour: h, minute: m }, t(h, m), [t(h, other), t(h2, m)], 'القصير يدل على الساعة ' + HOURS[h] + '، والطويل على الدقائق: ' + MIN[m] + '.'); };
  const pool = (r, list) => { const [p, scene, c, ws, ex] = pick(r, list); return mk(p, scene, c, ws, ex); };
  const shape = v => ({ type: 'shape', value: v }), solid = v => ({ type: 'solid', value: v });
  const SHAPES = [
    ['كم ضلعًا للمستطيل؟', shape('rectangle'), '٤', ['٣', '٥'], 'للمستطيل أربعة أضلاع.'], ['كم رأسًا للمربع؟', shape('square'), '٤', ['٣', '٢'], 'للمربع أربعة رؤوس.'],
    ['كم ضلعًا للمثلث؟', shape('triangle'), '٣', ['٤', '٢'], 'للمثلث ثلاثة أضلاع.'], ['ما اسم الشكل المرسوم؟', shape('triangle'), 'مثلث', ['مربع', 'دائرة'], 'ثلاثة أضلاع وثلاثة رؤوس: مثلث.'],
    ['ما اسم الشكل المرسوم؟', shape('rectangle'), 'مستطيل', ['مثلث', 'دائرة'], 'أربعة أضلاع، وكل ضلعين متقابلين متساويان: مستطيل.'], ['ما اسم الشكل المرسوم؟', shape('circle'), 'دائرة', ['مربع', 'مثلث'], 'حدّها منحنٍ وليس لها رؤوس: دائرة.'],
    ['ما نوع الخط؟', { type: 'line-kind', value: 'straight' }, 'قطعة مستقيمة', ['خط منحني'], 'الخط لا ينحني.'], ['ما نوع الخط؟', { type: 'line-kind', value: 'curved' }, 'خط منحني', ['قطعة مستقيمة'], 'الخط ينحني.'],
    ['كم رأسًا للدائرة؟', shape('circle'), '٠', ['١', '٤'], 'ليس للدائرة رؤوس.']];
  const SOLIDS = [
    ['ما اسم المجسم؟', solid('cylinder'), 'أسطوانة', ['مكعب', 'دائرة'], 'للأسطوانة قاعدتان دائريتان.'], ['كم وجهًا للمكعب؟', solid('cube'), '٦', ['٤', '٨'], 'للمكعب ستة أوجه مربعة.'],
    ['كم رأسًا للمكعب؟', { type: 'solid', value: 'cube', vertices: true }, '٨', ['٦', '٤'], 'للمكعب ثمانية رؤوس.'], ['أي وحدة أنسب لقياس طول الصف؟', null, 'المتر', ['السنتمتر'], 'الصف طويل؛ نقيسه بالمتر.'],
    ['أي وحدة أنسب لقياس طول قلم رصاص؟', null, 'السنتمتر', ['المتر'], 'القلم قصير؛ نقيسه بالسنتمتر.'], ['كم سنتمترًا في المتر؟', null, '١٠٠', ['١٠', '١٠٠٠'], 'المتر مئة سنتمتر.'],
    ['كم ساعة في اليوم؟', null, '٢٤', ['١٢', '٦٠'], 'اليوم أربع وعشرون ساعة.'], ['كم دقيقة في الساعة؟', null, '٦٠', ['٢٤', '١٠٠'], 'الساعة ستون دقيقة.'],
    ['كم قاعدة دائرية للأسطوانة؟', solid('cylinder'), '٢', ['١', '٤'], 'للأسطوانة قاعدتان دائريتان.'], ['ما شكل كل وجه من أوجه المكعب؟', solid('cube'), 'مربع', ['دائرة', 'مثلث'], 'أوجه المكعب الستة مربعات.'],
    ['ما الأشكال التي تكوّن شبكة الأسطوانة؟', { type: 'solid', value: 'cylinder', net: true }, 'مستطيل ودائرتان', ['ستة مربعات', 'ثلاثة مثلثات'], 'نلف المستطيل ونضع دائرتين.'], ['كم مربعًا في شبكة المكعب؟', { type: 'solid', value: 'cube', net: true }, '٦', ['٤', '٨'], 'ستة مربعات تكوّن أوجه المكعب.']];
  const SOLID3D = SOLIDS.slice(0, 3).concat(SOLIDS.slice(8));

  const gen = {
    'm2-1-1': r => compare(int(r, 10, 99), int(r, 10, 99)),
    'm2-1-2': r => r() < .5 ? order([int(r, 10, 33), int(r, 34, 66), int(r, 67, 99)], r() < .5) : nextPrev(int(r, 11, 98), r() < .5),
    'm2-1-3': r => r() < .5 ? valueOf(int(r, 21, 98), r) : represented(int(r, 12, 98)),
    'm2-1-4': r => parity(r, 2, r() < .5),
    'm2-2-1': r => add(...digitsNoCarry(r, 2)),
    'm2-2-number-line': r => { const s = int(r, 1, 8) * 10, m = (r() < .5 ? 1 : -1) * int(r, 1, 4) * 10, e = s + m; return e < 0 || e > 90 ? null : num(e, [e + 10, e - 10, s], N(s) + (m > 0 ? ' + ' : ' − ') + N(Math.abs(m)) + ' = ' + N(e) + '.', 'إلى أي عدد نصل؟', { type: 'number-line', start: s, moves: [m], min: 0, max: 90, step: 10 }); },
    'm2-2-three-addends': r => { const a = int(r, 1, 3) * 10 + int(r, 0, 3), b = int(r, 1, 3) * 10 + int(r, 0, 3), c = int(r, 1, 3) * 10 + int(r, 0, 3), s = a + b + c; return num(s, [s + 10, s - 1, s + 1], 'نجمع الآحاد ثم العشرات: ' + N(s) + '.', 'ما مجموع الأعداد الثلاثة؟', sym(N(a) + ' + ' + N(b) + ' + ' + N(c) + ' = ؟')); },
    'm2-2-2': r => sub(...digitsNoBorrow(r, 2)),
    'm2-3-1': r => r() < .5 ? represented(int(r, 101, 199)) : nextPrev(int(r, 101, 198), r() < .5),
    'm2-3-hundreds': r => represented(int(r, 2, 9) * 100 + int(r, 0, 9) * 10 + int(r, 0, 9)),
    'm2-3-2': r => valueOf(int(r, 111, 999), r),
    'm2-3-total-tens': r => { const n = int(r, 120, 989); return num(Math.floor(n / 10), [Math.floor(n / 10) % 10, Math.floor(n / 100)], 'المئات والعشرات معًا: ' + N(Math.floor(n / 10)) + ' عشرة كاملة.', 'كم عشرة كاملة في العدد ' + N(n) + '؟', sym(N(n))); },
    'm2-3-3': r => { const a = int(r, 100, 999); return compare(a, r() < .3 ? a - a % 10 + int(r, 0, 9) : int(r, 100, 999)); },
    'm2-3-4': r => order([int(r, 100, 399), int(r, 400, 699), int(r, 700, 999)], r() < .5),
    'm2-3-neighbors': r => nextPrev(int(r, 1, 9) * 100 + pick(r, [0, 99, 9, 90]), r() < .5),
    'm2-3-parity-sums': r => parity(r, 3, r() < .5),
    'm2-4-lines': r => pool(r, SHAPES), 'm2-4-1': r => pool(r, SHAPES.slice(0, 6)), 'm2-4-2': r => pool(r, SHAPES), 'm2-4-circle-center': r => pool(r, SHAPES),
    'm2-5-classify': dataQ, 'm2-5-1': dataQ, 'm2-5-build-table': dataQ,
    'm2-6-1': r => add(...digitsNoCarry(r, 3)),
    'm2-6-2': r => { const a = int(r, 15, 69), b = int(r, 15, 29); return (a % 10) + (b % 10) < 10 || a + b > 99 ? null : addCarry(a, b); },
    'm2-6-carry-hundreds': r => { const a = int(r, 150, 589), b = int(r, 160, 389); return a + b > 999 ? null : addCarry(a, b); },
    'm2-6-3': r => sub(...digitsNoBorrow(r, 3)),
    'm2-6-4': r => { const a = int(r, 31, 98), b = int(r, 12, a - 10); return a % 10 >= b % 10 ? null : sub(a, b); },
    'm2-6-borrow-hundreds': r => { const a = int(r, 300, 950), b = int(r, 111, a - 100); return a % 10 >= b % 10 ? null : sub(a, b); },
    'm2-6-5': r => { const a = int(r, 12, 89), b = int(r, 11, 59); return r() < .5 ? num(a, [b, a + b], 'تبديل العددين لا يغيّر المجموع.', 'ما العدد الناقص؟', sym(N(a) + ' + ' + N(b) + ' = ' + N(b) + ' + ؟')) : num(a, [0, a + 1], 'إضافة الصفر لا تغيّر العدد.', 'أوجد الناتج.', sym(N(a) + ' + ٠ = ؟')); },
    'm2-6-grouping': r => { const a = int(r, 11, 40), b = int(r, 11, 30), c = int(r, 11, 30); return num(c, [b, a], 'نغيّر موضع الأقواس فقط، والأعداد نفسها.', 'ما العدد الناقص؟', sym('(' + N(a) + ' + ' + N(b) + ') + ' + N(c) + ' = ' + N(a) + ' + (' + N(b) + ' + ؟)')); },
    'm2-7-1': r => skip(pick(r, [2, 3, 4, 5, 10]), r),
    'm2-7-2': r => groupsQ(int(r, 2, 5), int(r, 2, 5)),
    'm2-7-elements': r => { const g = int(r, 2, 5), n = int(r, 2, 5); if (g === n) return null; return num(g, [n, g * n], 'عدد المجموعات ' + N(g) + '؛ هو المضروب فيه.', 'لدينا ' + grp(g) + '، في كل منها ' + (n === 2 ? 'كرتان' : N(n) + ' كرات') + '. ما العدد الذي يبيّن عدد المجموعات؟', { type: 'groups', groups: g, countPerGroup: n, icon: 'ball' }); },
    'm2-7-times-2': r => r() < .5 ? times(int(r, 1, 5), 2) : groupsQ(int(r, 1, 5), 2), 'm2-7-times-complete-2': r => r() < .7 ? times(int(r, 1, 5), 2) : groupsQ(int(r, 1, 5), 2),
    'm2-7-times-3': r => r() < .5 ? times(int(r, 1, 5), 3) : groupsQ(int(r, 1, 5), 3), 'm2-7-times-complete-3': r => r() < .7 ? times(int(r, 1, 5), 3) : groupsQ(int(r, 1, 5), 3),
    'm2-7-times-4': r => r() < .5 ? times(int(r, 1, 5), 4) : groupsQ(int(r, 1, 5), 4), 'm2-7-times-complete-4': r => r() < .7 ? times(int(r, 1, 5), 4) : groupsQ(int(r, 1, 5), 4),
    'm2-7-times-5': r => r() < .5 ? times(int(r, 1, 5), 5) : groupsQ(int(r, 1, 5), 5), 'm2-7-times-complete-5': r => r() < .7 ? times(int(r, 1, 5), 5) : groupsQ(int(r, 1, 5), 5),
    'm2-7-times-10': r => times(int(r, 1, 5), 10), 'm2-7-times-complete-10': r => times(int(r, 1, 9), 10), 'm2-7-times-ten-more': r => times(int(r, 2, 9), 10),
    'm2-8-1': r => share(int(r, 2, 5), int(r, 2, 5), r), 'm2-8-2': r => divide(int(r, 2, 5), int(r, 2, 5)), 'm2-8-3': r => divide(int(r, 2, 5), int(r, 1, 5)),
    'm2-8-elements': r => { const d = int(r, 2, 5), q = int(r, 2, 5); if (d === q) return null; const k = int(r, 0, 2), names = ['المقسوم', 'المقسوم عليه', 'ناتج القسمة'], vals = [d * q, d, q];
      return num(vals[k], vals.filter((_, i) => i !== k), names[k] + ' هنا ' + N(vals[k]) + '.', 'ما ' + names[k] + ' في هذه الجملة؟', sym(N(d * q) + ' ÷ ' + N(d) + ' = ' + N(q))); },
    'm2-8-repeated-subtraction': r => { const d = int(r, 2, 5), q = int(r, 2, 5), seq = Array.from({ length: q + 1 }, (_, i) => d * (q - i));
      return num(q, [q + 1, d], 'نعدّ مرات الطرح حتى الصفر: ' + N(q) + '.', 'وصلنا من ' + N(d * q) + ' إلى صفر بطرح ' + N(d) + ' كل مرة. كم مرة طرحنا؟', sym(seq.map(N).join(' ← '))); },
    'm2-9-1': r => r() < .6 ? fracName(pick(r, [2, 3, 4]), [2, 3, 4]) : fracOfSet(pick(r, [2, 3, 4]), int(r, 2, 4)),
    'm2-9-fraction-sets': r => fracOfSet(pick(r, [2, 3, 4]), int(r, 2, 4)),
    'm2-9-2': r => r() < .5 ? fracName(pick(r, [5, 8]), [4, 5, 8]) : fracOfSet(pick(r, [5, 8]), int(r, 1, 3)), 'm2-9-fifth-eighth-sets': r => fracOfSet(pick(r, [5, 8]), int(r, 1, 3)),
    'm2-9-compare': r => { const [a, b] = pick(r, [[2, 4], [3, 5], [2, 8], [4, 8], [3, 4], [2, 3]]); return r() < .5 ? mk('الشكلان متساويان في الحجم. أيّ الكسرين أكبر؟', null, FR[a], [FR[b]], 'كلما قلّ عدد الأجزاء المتساوية كبر الجزء: ' + FR[a] + ' أكبر من ' + FR[b] + '.') : mk('الشكلان متساويان في الحجم. أيّ الكسرين أصغر؟', null, FR[b], [FR[a]], 'كلما زاد عدد الأجزاء المتساوية صغر الجزء: ' + FR[b] + ' أصغر من ' + FR[a] + '.'); },
    'm2-10-1': r => pool(r, SOLIDS.slice(3, 6)), 'm2-10-2': clockQ, 'm2-10-minutes': clockQ, 'm2-10-digital-day': clockQ,
    'm2-10-3': r => pool(r, SOLID3D), 'm2-10-cylinder': r => pool(r, SOLID3D), 'm2-10-cube-net': r => pool(r, SOLID3D),
    'm2-11-1': dataQ, 'm2-11-record': dataQ, 'm2-11-2': dataQ
  };
  const key = t => t.prompt + '|' + JSON.stringify(t.scene || null) + '|' + t.choices[t.answer].label;
  const fill = (lesson, makers, target) => {
    const r = rng(seedOf(lesson.id)), seen = new Set(lesson.tasks.map(key));
    for (let tries = 0; lesson.tasks.length < target && tries < 200; tries++) {
      const t = makers[tries % makers.length](r);
      if (t && !seen.has(key(t))) { seen.add(key(t)); lesson.tasks.push(t); }
    }
  };
  for (const unit of C.units) {
    const own = unit.lessons.filter(l => gen[l.id]);
    for (const lesson of own) fill(lesson, [gen[lesson.id]], 6);
    const review = unit.lessons.find(l => /^m2-review-\d+$/.test(l.id));
    if (review && own.length) fill(review, own.map(l => gen[l.id]), 10);
  }

  const generic = /أطبق المفهوم|أطبق مفاهيم الوحدة|أقرأ السؤال وأختار/;
  const byType = (task) => {
    const text = task.prompt + ' ' + (task.scene && task.scene.value ? task.scene.value : '');
    const type = task.scene && task.scene.type;
    if (type === 'clock' || /الوقت|الساعة|دقيقة/.test(text)) return 'العقرب القصير للساعات، والطويل للدقائق؛ كل رقم يمرّ به الطويل خمس دقائق.';
    if (type === 'fraction' || /اسم الجزء|كسر|الكسرين|ربعًا|ثمنًا|(^|\s)(ثلث|نصف)|أجزاء|جزأين|الجزء|ربع (مجموعة|الشكل|الواحد)|خمس مجموعة|ثمن مجموعة/.test(text)) return 'عدّ الأجزاء المتساوية كلها، ثم سمِّ الجزء الواحد منها.';
    if (/بطرح|طرحنا/.test(text)) return 'عُدَّ مرات الطرح حتى تصل إلى الصفر؛ عدد المرات هو ناتج القسمة.';
    if (/أكمل العدّ/.test(text)) return 'انظر كم نزيد من عدد إلى الذي بعده، ثم زد المقدار نفسه.';
    if (/÷|وزّع|وزعنا|أوزّع|في كل علبة|كم علبة|كم مجموعة|كم كيسًا/.test(text)) return 'وزّع بالتساوي، أو فكّر: أيّ عدد إذا ضربته يعطيني المقسوم؟';
    if (type === 'shape' || type === 'solid' || type === 'line-kind' || /شكل|ضلع|رأس|رؤوس|مجسم|مجسّم|مكعب|أسطوانة|دائرة|مربع|مستطيل|مثلث|منحن|مستقيم/.test(text)) return 'عدّ الأضلاع والرؤوس، ولاحظ إن كان الحدّ مستقيمًا أو منحنيًا.';
    if (/×/.test(text) || type === 'groups') return 'اجمع العدد نفسه مرات بعدد المجموعات، أو عُدَّ عدًّا قفزيًّا.';
    if (/−/.test(text)) return 'ابدأ بالآحاد. إذا كان رقم الآحاد في الأعلى أصغر، نستلف عشرة من العشرات.';
    if (/\+/.test(text)) return 'ابدأ بالآحاد ثم العشرات ثم المئات، وإذا صار المجموع عشرة أو أكثر نحمل إلى المنزلة التالية.';
    if (/السابق|التالي|يلي|القفزة|العد /.test(text) || type === 'number-line') return 'عُدَّ خطوة خطوة إلى الأمام للتالي، وإلى الخلف للسابق.';
    if (/الوحدة الأنسب|سنتمتر|متر|طول/.test(text) || type === 'measure') return 'نقيس الأطوال القصيرة بالسنتمتر، والطويلة بالمتر؛ والمتر مئة سنتمتر.';
    if (/إشارة|أكبر|أصغر|تصاعدي|تنازلي|ترتيب/.test(text)) return 'قارن المئات أولًا، ثم العشرات، ثم الآحاد.';
    if (/زوجي|فردي/.test(text)) return 'انظر إلى رقم الآحاد: ٠ و٢ و٤ و٦ و٨ زوجية، و١ و٣ و٥ و٧ و٩ فردية.';
    if (/قيمة الرقم|عشرة كاملة|العدد الممثّل|العدد الممثل|رمز العدد/.test(text) || type === 'place-value') return 'حدّد منزلة كل رقم: الآحاد ثم العشرات ثم المئات.';
    if (type === 'data-table' || type === 'items' || /صورة|البيانات|سألت|إجابة/.test(text)) return 'عدّ الصور في كل صف وحدها، ثم قارن أو اجمع.';
    return '';
  };
  for (const lesson of [...C.units.flatMap(u => u.lessons), ...(C.foundations || [])]) {
    const own = lesson.goal && !generic.test(lesson.goal) ? lesson.goal : '';
    for (const task of lesson.tasks) if (!task.hint) task.hint = byType(task) || own;
    if (!lesson.hint && own) lesson.hint = own;
  }
})();
