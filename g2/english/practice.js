/* تدريب أدق: خيار ثالث من مفردات الوحدة نفسها، وتلميح بعد الخطأ الأول. نبقي الثنائيات النحوية الحقيقية (This/These، this/that) بخيارين. */
(() => {
  'use strict';
  const C = window.G1_COURSE;
  const NUM = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  const PREP = ['in','on','under','next to','between'];
  const PRON = ['I','You','He','She','We','It'];
  const fold = s => String(s).trim().replace(/[.!?]$/, '').toLowerCase();
  const isArabic = s => /[؀-ۿ]/.test(s);
  const units = [...C.units.map(u => ({ id: u.id, lessons: u.lessons })), { id: 'foundations', lessons: C.foundations || [] }];

  // معجم: الكلمة الإنجليزية ← معناها بالعربية وصورتها، من خطوات الشرح وأسئلة الصور.
  const gloss = {}, icon = {};
  for (const l of units.flatMap(u => u.lessons)) {
    for (const s of l.steps || []) { const m = /^(.+?) تعني: ([^.]+)\./.exec(s.text || ''); if (m && !isArabic(m[1])) gloss[fold(m[1])] = m[2].trim(); }
    for (const t of l.tasks) {
      const good = t.choices[t.answer];
      if (t.scene?.type === 'items' && t.scene.icons?.length === 1 && good && !isArabic(good.label)) icon[fold(good.label)] = t.scene.icons[0];
    }
  }
  const isWord = x => !isArabic(x) && x.replace(/\.$/, '').split(' ').length <= 3 && !/[?!]/.test(x) && !/^(I|I’m|He’s|She’s|It|It’s|This|These|My|His|Her|The|A|We|You)\b/.test(x);
  const vocabOf = u => {
    const words = new Set();
    for (const l of u.lessons) {
      (l.vocabulary || []).forEach(w => words.add(w));
      for (const s of l.steps || []) { const m = /^(.+?) تعني:/.exec(s.text || ''); if (m && isWord(m[1]) && !/\.$/.test(m[1])) words.add(m[1].trim()); }
    }
    return [...words].filter(w => !NUM.includes(fold(w)) && !PREP.includes(fold(w)));
  };
  const unitVocab = new Map(units.map(u => [u, vocabOf(u)]));
  // كل كلمة تأخذ بدائلها من الوحدة التي تُعلَّم فيها، حتى في دروس المراجعة.
  const homeOf = w => units.map(u => unitVocab.get(u)).find(list => list.some(x => fold(x) === fold(w)));
  const turn = (list, seed) => { const k = [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0) % Math.max(1, list.length); return list.slice(k).concat(list.slice(0, k)); };
  const sentences = u => [...new Set(u.lessons.flatMap(l => l.tasks.flatMap(t => t.choices.map(c => c.label))).filter(x => x && !isArabic(x) && /\s/.test(x) && /[.?!]$/.test(x)))];

  function third(task, u) {
    const labels = task.choices.map(c => c.label), low = labels.map(fold), has = x => low.includes(fold(x));
    const correct = labels[task.answer], pick = list => list.find(x => x && !has(x));
    if (task.choices.some(c => c.scene)) return null; // صور: يدويًا أدناه
    if (labels.every(isArabic)) return null; // نعالجها يدويًا أدناه
    if (low.every(x => NUM.includes(x))) { const n = NUM.indexOf(fold(correct)); return pick([NUM[n + 1], NUM[n - 1], NUM[n + 2], NUM[n - 2]]); }
    const counted = /^([a-z]+) ([a-z]+)\.$/i.exec(correct);
    if (counted && NUM.includes(counted[1].toLowerCase())) { const n = NUM.indexOf(counted[1].toLowerCase()), cap = s => s[0].toUpperCase() + s.slice(1); return pick([n + 1, n - 1, n + 2].filter(k => NUM[k]).map(k => cap(NUM[k]) + ' ' + counted[2] + '.')); }
    if (labels.every(x => /^[A-Za-z]$/.test(x))) {
      const up = correct === correct.toUpperCase(), base = correct.toLowerCase().charCodeAt(0);
      return pick([1, -1, 2, -2].map(d => String.fromCharCode(base + d)).filter(ch => /[a-z]/.test(ch)).map(ch => up ? ch.toUpperCase() : ch));
    }
    if (low.some(x => x === 'like' || x === 'likes')) return pick(['liking']);
    if (low.some(x => x === 'has' || x === 'have')) return pick(['is']);
    if (low.some(x => x === 'this' || x === 'these' || x === 'that')) return null;
    if (low.includes('from')) return pick(['on']);
    if (low.every(x => PREP.includes(x))) return pick(PREP.filter(p => p !== 'between' || /\band\b/.test(task.prompt)));
    if (labels.every(x => PRON.includes(x))) return pick(['He', 'They', 'I']);
    if (labels.every(isWord)) {
      const cap = labels[0][0] === labels[0][0].toUpperCase() && !/^[A-Z][a-z]+$/.test(correct) ? (s => s[0].toUpperCase() + s.slice(1)) : (s => s);
      const dot = /\.$/.test(correct) ? '.' : '';
      const pool = homeOf(correct.replace(/\.$/, '')) || unitVocab.get(u) || [];
      return pick(turn(pool, correct).map(w => cap(w) + dot));
    }
    const end = correct.slice(-1);
    return pick(turn(sentences(u), correct).filter(s => s.slice(-1) === end && fold(s) !== fold(correct) && !fold(s).includes(fold(correct)) && !fold(correct).includes(fold(s))));
  }

  // أسئلة خياراتها عربية: خيار ثالث مكتوب يدويًا (مفتاح: بداية نص السؤال).
  const arabicThird = {
    'أختار معنى: My sweater is small.': 'كنزتي جديدة.',
    'ما معنى Don’t sit down.؟': 'قف هنا.',
    'ما معنى: Come here.؟': 'التزم الهدوء.',
    'ما معنى very fast في وصف وسيلة نقل؟': 'كبيرة جدًا.',
    'أقرأ: This car is very slow.': 'صغيرة جدًا.',
    'أقرأ: I’m from Palestine.': 'من أي بلد آخر.',
    'أقرأ: I’m from Hebron.': 'غزة.',
    'أقرأ: I can see trees and flowers.': 'جبالًا وأنهارًا.',
    'أقرأ: He likes fish and rice.': 'الأرز فقط.',
    'أقرأ: It has two legs.': 'أربعة.',
    'أقرأ: The house is next to the school.': 'المسجد.',
    'ألاحظ ترتيب الأماكن. أين المتنزه؟': 'بجانب الكنيسة فقط.',
    'ألاحظ الحافلة اللعبة. أين هي؟': 'فوق الصندوق.',
    'أقرأ: The pencil is on the desk.': 'بجانب الطاولة الدراسية.',
    'أنظر إلى شعر الشخصية. كيف يبدو؟': 'مجعّد.',
    'ألاحظ الشخصية. ما لون شعرها؟': 'أسود.',
    'ألاحظ الشخصية. ما لون عينيها؟': 'أزرق.',
    'ألاحظ الشخصية. ما لون الشعر؟': 'بني.',
    'أقرأ: My name’s Mira.': 'Sami',
    'أقرأ: That’s Mira.': 'Tala.'
  };

  // أسئلة يحتاج خيارها الثالث صياغة يدوية (صورة أو عبارة كاملة).
  const pic = (label, name) => ({ label, scene: { type: 'items', icons: [name] } });
  const manualThird = {
    'أختار الصورة التي تدل على: bee': pic('زهرة', 'flower'),
    'أختار الصورة التي تدل على: ear': pic('أنف', 'nose'),
    'أختار الصورة التي تدل على: bird': pic('شجرة', 'tree'),
    'أختار الصورة التي تدل على: school': pic('حافلة', 'bus'),
    'أختار الصورة التي تدل على: plane': pic('سيارة', 'car'),
    'أختار الصورة التي تدل على: pencil': pic('علم', 'flag'),
    'أختار الصورة التي تدل على: shoes': pic('كتاب', 'book'),
    'أختار الصورة التي تدل على: train': pic('حافلة', 'bus'),
    'أي سؤال أسأل به عما تحبه ميرا؟': { label: 'How old is she?' },
    'أعدّ الطيور وأختار الوصف.': { label: 'Four birds.' },
    'ألاحظ الحافلة اللعبة وأختار وصف مكانها.': { label: 'The bus is in the box.' },
    'أرى الصورة. ما الرد على What can you see?': { label: 'I can see a pen.' },
    'أختار ردًا عن هواية فتاة تحب السباحة.': { label: 'She likes drawing.' },
    'أي عبارة تهنئة بعيد الميلاد؟': { label: 'Good morning!' },
    'أريد أن أسأل صديقي عن شعوره. ماذا أقول؟': { label: 'How old are you?' },
    'Choose: ___ is my pen.': { label: 'These' },
    'عمر الصبي سبع سنوات.': { label: 'She’s seven.' },
    'سامي يحب السمك.': { label: 'He likes rice.' },
    'أي تعليمة تعني: المس شعرك؟': { label: 'Touch your ear.' },
    'أي تعليمة تعني: أغلق فمك؟': { label: 'Touch your mouth.' },
    'أي تعليمة تعني: افتح فمك؟': { label: 'Touch your mouth.' },
    'أي عبارة تعني: لا تقفز؟': { label: 'Don’t clap.' },
    'أي عبارة تعني: لا تفتح الباب؟': { label: 'Close the door.' },
    'يقدم البائع الملابس ويقول': { label: 'Here you are.' },
    'كيف أشكر صديقي على تهنئته؟': { label: 'Happy birthday!' },
    'أي كلمة تعني: حذاء طويل الساق؟': { label: 'socks' },
    'أي كلمة تعني: بطيء؟': { label: 'big' },
    'أي كلمة تعني: بني؟': { label: 'blonde' },
    'أي جملة تعني: أشعر بالحزن؟': { label: 'Happy birthday!' },
    'أكمل بمعنى أحب القراءة': { label: 'drawing.' },
    'أتحدث عن اسم صديق، فأقول': { label: 'My' },
    'أتحدث عن اسم صديقة، فأقول': { label: 'My' },
    'أي عبارة تعني: في الملعب؟': { label: 'next to the playground' },
    'أي وصف يعني: قميص أزرق؟': { label: 'a blue hat' },
    'أكمل طلب حذاء جديد': { label: 'socks.' },
    'أنظر إلى شعر الشخصية وأكمل': { label: 'tall' },
    'ألاحظ شجرة الأسرة': { label: 'This is my sister.' },
    'أقارن الشخصية بعلامات القياس': { label: 'He’s very tall.' },
    'في الحوار عمر ميرا سبع سنوات': { label: 'I’m six.' },
    'أكمل وفق الصورة: This is a ...': { label: 'pen.' },
    'Which word starts with b?': { label: 'dog' },
    'Which word starts with c?': { label: 'ball' },
    'What is this?': { label: 'It is a pen.' },
    'The elephant is ___.': { label: 'blue' },
    'Birds can ___.': { label: 'read' },
    'Fish can ___.': { label: 'read' },
    'Choose the correct sentence.': { label: 'Jump I can.' },
    'ألاحظ الشخصية. ما لون عينيها؟||Blue.': { label: 'Brown.' },
    'ألاحظ الشخصية. ما لون شعرها؟||Red.': { label: 'Blonde.' }
  };

  function hint(task, lesson) {
    const low = task.choices.map(c => fold(c.label)), p = task.prompt;
    if (low.some(x => x === 'like' || x === 'likes' || x === 'liking')) return 'مع He وShe نضيف s إلى الفعل: She likes. ومع I وWe وYou نقول: like.';
    if (low.some(x => x === 'has' || x === 'have')) return 'نقول: I have وYou have وWe have، ونقول: He has وShe has وIt has.';
    if (low.some(x => x === 'this' || x === 'these')) return 'This لشيء واحد، وThese لأكثر من شيء.';
    if (low.some(x => x === 'that') || /قريب|بعيد/.test(p)) return 'this للشيء القريب منّي، وthat للشيء البعيد.';
    if (low.some(x => PREP.includes(x))) return 'انظر إلى الرسم: in داخل، on فوق، under تحت، next to بجانب، between بين شيئين.';
    if (low.some(x => NUM.includes(x)) || /أعدّ/.test(p)) return 'عدّ الأشياء واحدًا واحدًا بإصبعك، ثم اضغط «استمع» لتسمع اسم العدد.';
    if (low.every(x => /^[a-z]$/.test(x))) return 'قارن شكل الحرف بالحرف في السؤال، وقل اسمه بصوت مسموع.';
    if (/ألاحظ|أنظر|الصورة|الرسم/.test(p)) return 'انظر إلى الرسم جيدًا، واضغط «استمع» لتسمع الكلمات.';
    const first = (lesson.steps || []).find(s => s && s.text);
    return first ? 'ارجع إلى المثال: ' + first.text : 'اضغط «استمع» واسمع الكلمة مرة أخرى.';
  }

  units.forEach((u, index) => {
    for (const lesson of u.lessons) {
      for (const task of lesson.tasks) {
        if (!task.hint) task.hint = hint(task, lesson);
        if (task.choices.length >= 3) continue;
        let add = null;
        const exact = task.prompt + '||' + task.choices[task.answer].label;
        const manual = manualThird[exact] ? exact : Object.keys(manualThird).find(k => !k.includes('||') && task.prompt.startsWith(k));
        if (manual) add = manualThird[manual];
        else if (task.choices.every(c => isArabic(c.label)) || /^أقرأ: My name’s|^أقرأ: That’s/.test(task.prompt)) {
          const key = Object.keys(arabicThird).find(k => task.prompt.startsWith(k));
          if (key) add = { label: arabicThird[key] };
        } else {
          const x = third(task, u);
          if (x) add = typeof x === 'string' ? { label: x } : x;
        }
        if (add && !task.choices.some(c => fold(c.label) === fold(add.label))) task.choices.push(add);
      }
    }
  });
})();
