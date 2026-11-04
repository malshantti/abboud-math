/* العدد والمعدود — shared helper for generated questions (g6/g7 math…).
   arCount(n, noun, opts) → "<n> <correct form>"; the number itself is never changed.
   Forms: 1 → singular, 2 → dual, 3–10 → plural (genitive), 11–99 → accusative singular (تمييز منصوب),
   100+ / round hundreds → genitive singular (by the last two digits: 03–10 plural, 11–99 accusative),
   non-integers → genitive singular. opts.case:'o' gives the oblique dual (…ين/…تين) after verbs/prepositions;
   opts.fmt formats the digits (e.g. Arabic-Indic). */
(function (root) {
  const N = {
    'يوم': ['يوم', 'يومان', 'يومين', 'أيام', 'يومًا'],
    'ساعة': ['ساعة', 'ساعتان', 'ساعتين', 'ساعات', 'ساعةً'],
    'دقيقة': ['دقيقة', 'دقيقتان', 'دقيقتين', 'دقائق', 'دقيقةً'],
    'أسبوع': ['أسبوع', 'أسبوعان', 'أسبوعين', 'أسابيع', 'أسبوعًا'],
    'شهر': ['شهر', 'شهران', 'شهرين', 'أشهر', 'شهرًا'],
    'سنة': ['سنة', 'سنتان', 'سنتين', 'سنوات', 'سنةً'],
    'وحدة': ['وحدة', 'وحدتان', 'وحدتين', 'وحدات', 'وحدةً'],
    'شيكل': ['شيكل', 'شيكلان', 'شيكلين', 'شواكل', 'شيكلًا'],
    'دينار': ['دينار', 'ديناران', 'دينارين', 'دنانير', 'دينارًا'],
    'قرش': ['قرش', 'قرشان', 'قرشين', 'قروش', 'قرشًا'],
    'كتاب': ['كتاب', 'كتابان', 'كتابين', 'كتب', 'كتابًا'],
    'دفتر': ['دفتر', 'دفتران', 'دفترين', 'دفاتر', 'دفترًا'],
    'قلم': ['قلم', 'قلمان', 'قلمين', 'أقلام', 'قلمًا'],
    'طالب': ['طالب', 'طالبان', 'طالبين', 'طلاب', 'طالبًا'],
    'صف': ['صف', 'صفان', 'صفين', 'صفوف', 'صفًا'],
    'نقطة': ['نقطة', 'نقطتان', 'نقطتين', 'نقاط', 'نقطةً'],
    'مرة': ['مرة', 'مرتان', 'مرتين', 'مرات', 'مرةً'],
    'شجرة': ['شجرة', 'شجرتان', 'شجرتين', 'أشجار', 'شجرةً'],
    'درجة': ['درجة', 'درجتان', 'درجتين', 'درجات', 'درجةً'],
    'سؤال': ['سؤال', 'سؤالان', 'سؤالين', 'أسئلة', 'سؤالًا'],
    'محاولة': ['محاولة', 'محاولتان', 'محاولتين', 'محاولات', 'محاولةً'],
    'درس': ['درس', 'درسان', 'درسين', 'دروس', 'درسًا'],
    'طالبة': ['طالبة', 'طالبتان', 'طالبتين', 'طالبات', 'طالبةً'],
    'عدد': ['عدد', 'عددان', 'عددين', 'أعداد', 'عددًا'],
    'كرة': ['كرة', 'كرتان', 'كرتين', 'كرات', 'كرةً'],
    'عامل': ['عامل', 'عاملان', 'عاملين', 'عمّال', 'عاملًا'],
    'متر': ['متر', 'متران', 'مترين', 'أمتار', 'مترًا'],
  };
  function form(n, noun, opts) {
    const f = N[noun]; if (!f) throw new Error('arCount: unknown noun ' + noun);
    const o = opts && opts.case === 'o';
    n = Math.abs(Number(n));
    if (!Number.isInteger(n)) return f[0];
    if (n === 1) return f[0];
    if (n === 2) return o ? f[2] : f[1];
    const r = n % 100;
    if (n >= 100 && r <= 2) return f[0];
    if (r >= 3 && r <= 10) return f[3];
    if (r >= 11) return f[4];
    return f[0];
  }
  function arCount(n, noun, opts) { const fmt = opts && opts.fmt; return (fmt ? fmt(n) : String(n)) + ' ' + form(n, noun, opts); }
  arCount.form = form; arCount.nouns = N;
  if (typeof module !== 'undefined' && module.exports) module.exports = arCount;
  if (root) root.arCount = arCount;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
