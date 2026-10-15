/* فهرس الصفوف والمواد — المصدر الوحيد لصفحة الدخول.
   لإضافة مادة: أنشئ مجلدها (مثل g7/science/) ثم أضف سطراً في entries بالحالة 'active'.
   الحالات: 'active' = متاحة، 'soon' أو غياب السطر = «قريبًا». انظر ADDING-SUBJECTS.md */
window.CATALOG = {
  version: 1,
  grades: [
    {id: 1,  name: 'الصف الأول',        stage: 'المرحلة الأساسية الدنيا'},
    {id: 2,  name: 'الصف الثاني',       stage: 'المرحلة الأساسية الدنيا'},
    {id: 3,  name: 'الصف الثالث',       stage: 'المرحلة الأساسية الدنيا'},
    {id: 4,  name: 'الصف الرابع',       stage: 'المرحلة الأساسية الدنيا'},
    {id: 5,  name: 'الصف الخامس',       stage: 'المرحلة الأساسية العليا'},
    {id: 6,  name: 'الصف السادس',       stage: 'المرحلة الأساسية العليا'},
    {id: 7,  name: 'الصف السابع',       stage: 'المرحلة الأساسية العليا'},
    {id: 8,  name: 'الصف الثامن',       stage: 'المرحلة الأساسية العليا'},
    {id: 9,  name: 'الصف التاسع',       stage: 'المرحلة الأساسية العليا'},
    {id: 10, name: 'الصف العاشر',       stage: 'المرحلة الأساسية العليا'},
    {id: 11, name: 'الصف الحادي عشر',   stage: 'المرحلة الثانوية'},
    {id: 12, name: 'الصف الثاني عشر',   stage: 'المرحلة الثانوية'}
  ],
  subjects: [
    {id: 'math',    name: 'الرياضيات',            icon: 'math',    color: 'g'},
    {id: 'arabic',  name: 'اللغة العربية',         icon: 'arabic',  color: 'o'},
    {id: 'english', name: 'اللغة الإنجليزية',      icon: 'english', color: 'b'},
    {id: 'science', name: 'العلوم والحياة',        icon: 'science', color: 'p'},
    {id: 'islamic', name: 'التربية الإسلامية',     icon: 'islamic', color: 'y'},
    {id: 'social',  name: 'الدراسات الاجتماعية',   icon: 'social',  color: 'r'},
    {id: 'tech',    name: 'التكنولوجيا',           icon: 'tech',    color: 'b'}
  ],
  entries: [
    {grade: 8, subject: 'math', status: 'active', path: 'g8/math/',
     title: 'رياضيات الصف الثامن', desc: 'دروس المنهاج الفلسطيني بجزأيه، مختبر تفاعلي، ومغامرات مع زيتون.'},
    {grade: 8, subject: 'english', status: 'active', path: 'g8/english/',
     title: 'الإنجليزية للصف الثامن', desc: 'وحدات كتاب English for Palestine 8 مع الصوت لكل كلمة وجملة، ومسار تأسيس للحروف والأصوات.'}
  ]
};
