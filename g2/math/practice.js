/* تلميح يظهر بعد الخطأ الأول: طريقة الحل لا الجواب. */
(() => {
  'use strict';
  const C = window.G1_COURSE;
  const generic = /أطبق المفهوم|أطبق مفاهيم الوحدة|أقرأ السؤال وأختار/;
  const byType = (task) => {
    const text = task.prompt + ' ' + (task.scene && task.scene.value ? task.scene.value : '');
    const type = task.scene && task.scene.type;
    if (type === 'clock' || /الوقت|الساعة|دقيقة/.test(text)) return 'العقرب القصير للساعات، والطويل للدقائق؛ كل رقم يمرّ به الطويل خمس دقائق.';
    if (type === 'fraction' || /اسم الجزء|كسر|الكسرين|ربعًا|ثمنًا|(^|\s)(ثلث|نصف)|أجزاء|جزأين|الجزء|ربع (مجموعة|الشكل|الواحد)|خمس مجموعة|ثمن مجموعة/.test(text)) return 'عدّ الأجزاء المتساوية كلها، ثم سمِّ الجزء الواحد منها.';
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
