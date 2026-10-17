/* بيانات توضيحية مصطنعة بالكامل للواجهة؛ لا تُقرأ من ملفات الطلاب الحقيقية.
   completed وtotal أعداد أمثلة للعرض، وليست أعداد دروس المنهاج الفعلية.
   assessment نتيجة افتراضية من مئة، وليست تقديرًا حقيقيًا لأي طالب. */
window.ADMIN_DEMO = {
  students: [
    {
      id: 'demo-abboud', name: 'عبّود', grade: 8,
      avatar: '../assets/img/av-think.webp',
      subjects: [
        {id: 'math', name: 'الرياضيات', completed: 4, total: 18, assessment: 60, focus: 'مراجعة مقارنة الكسور'},
        {id: 'arabic', name: 'اللغة العربية', completed: 6, total: 20, assessment: 75, focus: 'تدريب على التمييز بين الجملة الاسمية والفعلية'},
        {id: 'english', name: 'اللغة الإنجليزية', completed: 3, total: 16, assessment: 65, focus: 'مراجعة المفردات الأساسية في سياق جملة'},
        {id: 'science', name: 'العلوم والحياة', completed: 5, total: 18, assessment: 70, focus: 'قراءة وحدات القياس في أمثلة مصوّرة'}
      ]
    },
    {
      id: 'demo-mira', name: 'ميرا', grade: 6,
      avatar: '../assets/img/av-read.webp',
      subjects: [
        {id: 'math', name: 'الرياضيات', completed: 8, total: 18, assessment: 80, focus: 'تدريب على العمليات على الكسور'},
        {id: 'arabic', name: 'اللغة العربية', completed: 9, total: 20, assessment: 85, focus: 'مراجعة علامات الترقيم في نص قصير'},
        {id: 'english', name: 'اللغة الإنجليزية', completed: 6, total: 16, assessment: 75, focus: 'ربط الكلمات بصورها ومعانيها'},
        {id: 'science', name: 'العلوم والحياة', completed: 7, total: 18, assessment: 80, focus: 'مراجعة خطوات الطريقة العلمية'}
      ]
    }
  ],
  courses: [
    {id: 'g8-math', grade: 8, subject: 'math', name: 'الرياضيات', path: '../g8/math/', description: 'دروس المنهاج الفلسطيني، وأساسيات ومختبر ومغامرات تفاعلية.', status: 'متاحة'},
    {id: 'g8-arabic', grade: 8, subject: 'arabic', name: 'اللغة العربية', path: '../g8/arabic/', description: 'نصوص لغتنا الجميلة، والقواعد والبلاغة والإملاء، وأنشطة للإعراب.', status: 'متاحة'},
    {id: 'g8-english', grade: 8, subject: 'english', name: 'اللغة الإنجليزية', path: '../g8/english/', description: 'وحدات English for Palestine، ومسار لتأسيس الحروف والأصوات، وتسجيلات متاحة للتدريب.', status: 'متاحة'},
    {id: 'g8-science', grade: 8, subject: 'science', name: 'العلوم والحياة', path: '../g8/science/', description: 'دروس العلوم والحياة، وأنشطة ومحاكاة للطاقة والذرة والموجات والدارات.', status: 'متاحة'},
    {id: 'g6-math', grade: 6, subject: 'math', name: 'الرياضيات', path: '../g6/math/', description: 'دروس المنهاج الفلسطيني بصور الكتاب، وأساسيات ومختبر ومغامرات تفاعلية.', status: 'متاحة'},
    {id: 'g6-arabic', grade: 6, subject: 'arabic', name: 'اللغة العربية', path: '../g6/arabic/', description: 'نصوص لغتنا الجميلة، والقواعد والإملاء، ومختبر للهمزة والإعراب.', status: 'متاحة'},
    {id: 'g6-english', grade: 6, subject: 'english', name: 'اللغة الإنجليزية', path: '../g6/english/', description: 'وحدات English for Palestine، ومسار لتأسيس الحروف والأصوات، وتسجيلات متاحة للتدريب.', status: 'متاحة'},
    {id: 'g6-science', grade: 6, subject: 'science', name: 'العلوم والحياة', path: '../g6/science/', description: 'دروس العلوم والحياة بصور الكتاب، وأساسيات وأنشطة ومختبر تفاعلي.', status: 'متاحة'}
  ]
};
