/* Original short support activities; references identify book units, not copied exercises. */
(()=>{
  'use strict';
  const picture=icon=>({type:'items',icons:[icon]});
  const sym=value=>({type:'symbol',value});
  const option=label=>({label});
  function words(id,book,page,first,second){
    const scene=entry=>entry[2]?picture(entry[2]):sym(entry[0]);
    return {id,title:'أتعرف الكلمات وأستخدمها',book,page,goal:'أربط كلمة بمعناها، ثم أختار الكلمة المناسبة.',steps:[first,second].map(entry=>({text:entry[0]+' تعني: '+entry[1]+'. أقرأها مع شخص كبير عند الحاجة.',scene:scene(entry)})),tasks:first[2]&&second[2]?[
      {prompt:'أختار الصورة التي تدل على: '+first[0],choices:[{label:second[1],scene:scene(second)},{label:first[1],scene:scene(first)}],answer:1,explain:first[0]+' تعني: '+first[1]+'.'},
      {prompt:'أختار الكلمة المناسبة للصورة.',scene:scene(second),choices:[option(second[0]),option(first[0])],answer:0,explain:'الكلمة المناسبة هي: '+second[0]+'.'}
    ]:[
      {prompt:'أي كلمة تعني: '+first[1]+'؟',choices:[option(first[0]),option(second[0])],answer:0,explain:first[0]+' تعني: '+first[1]+'.'},
      {prompt:'أي كلمة تعني: '+second[1]+'؟',choices:[option(first[0]),option(second[0])],answer:1,explain:second[0]+' تعني: '+second[1]+'.'}
    ]};
  }
  function language(id,book,page,title,steps,tasks){return {id,title,book,page,goal:'أفهم عبارة قصيرة، ثم أختار معناها أو أكملها في سياق واضح.',steps,tasks};}
  function unit(number,title,term,page,lessons){return {id:'en2-u'+number,title,term,book:term===1?'p1':'p2',page,lessons};}
  function complete(prompt,correct,wrong,explain){return {prompt,choices:[option(wrong),option(correct)],answer:1,explain};}
  const units=[
    unit(1,'Hi, I’m …',1,4,[language('en2-u1-name','p1',4,'أعرّف بنفسي',[
      {text:'عندما أعرّف بنفسي أقول: My name’s Mira.',scene:picture('girl')},
      {text:'أسأل عن الاسم: What’s your name? وأسأل عن العمر: How old are you?'}
    ],[
      complete('أي سؤال أسأل به عن الاسم؟','What’s your name?','How old are you?','What’s your name? سؤال عن الاسم.'),
      complete('أقرأ: My name’s Mira. ما اسم المتحدثة؟','Mira','Salwa','الجملة تقول: اسمي ميرا.')
    ])]),
    unit(2,'In the kitchen',1,10,[words('en2-u2-words','p1',10,['fish','سمك','fish'],['chicken','دجاج']),language('en2-u2-likes','p1',10,'أفهم ما تحبه الشخصية',[
      {text:'She likes rice. تعني: هي تحب الأرز.'},
      {text:'He likes fish. تعني: هو يحب السمك.',scene:picture('fish')}
    ],[
      complete('أقرأ: He likes fish. ماذا يحب؟','fish','rice','يحب السمك: fish.'),
      complete('أكمل: She ... rice.','likes','like','مع She نقول: She likes rice.')
    ])]),
    unit(3,'In the garden',1,16,[words('en2-u3-words','p1',16,['bee','نحلة','bee'],['butterfly','فراشة','butterfly']),language('en2-u3-bird','p1',16,'أصف الطائر',[
      {text:'A bird has two legs. تعني: للطائر ساقان.',scene:picture('bird')},
      {text:'It has two legs. يمكن أن نستعمل It بدل تكرار اسم الطائر.'}
    ],[
      complete('أكمل: A bird ... two legs.','has','have','مع A bird نقول has.'),
      complete('أقرأ: It has two legs. ما معنى two؟','اثنان.','ثلاثة.','two تعني اثنين؛ وفي الجملة للطائر ساقان.')
    ])]),
    unit(4,'My body',1,22,[words('en2-u4-words','p1',22,['ear','أذن','ear'],['eye','عين','eye']),language('en2-u4-have','p1',22,'أصف جزءًا من جسمي',[
      {text:'I have a nose. تعني: لي أنف.',scene:picture('nose')},
      {text:'She has a nose. تعني: لها أنف.'}
    ],[
      complete('أكمل: I ... a nose.','have','has','نقول: I have a nose.'),
      complete('أكمل: She ... a nose.','has','have','نقول: She has a nose.')
    ])]),
    unit(5,'Revision',1,28,[words('en2-u5-review','p1',28,['bird','طائر','bird'],['eye','عين','eye'])]),
    unit(6,'Jump!',1,34,[language('en2-u6-instructions','p1',34,'أفهم التعليمات',[
      {text:'Open your mouth. تعني: افتح فمك. Close your mouth. تعني: أغلق فمك.',scene:picture('mouth')},
      {text:'Don’t sit down. تعني: لا تجلس. أفهم التعليمة، ولا أنفذ حركة إلا إذا كانت آمنة ومناسبة لي.'}
    ],[
      complete('أي تعليمة تعني: افتح فمك؟','Open your mouth.','Close your mouth.','Open تعني افتح.'),
      complete('ما معنى Don’t sit down.؟','لا تجلس.','اجلس.','Don’t تجعل التعليمة نهيًا عن الفعل.')
    ])]),
    unit(7,'My home',1,40,[words('en2-u7-words','p1',40,['sofa','أريكة'],['telephone','هاتف']),language('en2-u7-place','p1',40,'أفهم مكان الشيء',[
      {text:'The bus is in the box. تعني: الحافلة داخل الصندوق.'},
      {text:'The bus is under the box. تعني: الحافلة تحت الصندوق.'}
    ],[
      complete('أقرأ: The bus is in the box. أين الحافلة؟','داخل الصندوق.','تحت الصندوق.','in هنا تعني داخل.'),
      complete('أي كلمة تعني: تحت؟','under','on','under تعني تحت، أما on فتعني على.')
    ])]),
    unit(8,'My town',1,46,[words('en2-u8-words','p1',46,['school','مدرسة','school'],['house','منزل','house']),language('en2-u8-next','p1',46,'أفهم وصف المكان',[
      {text:'next to تعني: بجانب. The house is next to the school.'},
      {text:'الجملة تعني: المنزل بجانب المدرسة.'}
    ],[
      complete('أكمل بمعنى بجانب: The house is ... the school.','next to','under','next to تعني بجانب.'),
      complete('أقرأ: The house is next to the school. ما الذي بجانب المدرسة؟','المنزل.','السمكة.','The house تعني المنزل.')
    ])]),
    unit(9,'Revision',1,52,[language('en2-u9-review','p1',52,'أراجع التعليمات والمكان',[
      {text:'أراجع: Open تعني افتح، وClose تعني أغلق.'},
      {text:'أراجع: in داخل، وunder تحت.'}
    ],[
      complete('أي كلمة تعني: أغلق؟','Close','Open','Close تعني أغلق.'),
      complete('أكمل بمعنى داخل: The bus is ... the box.','in','under','نقول in عندما يكون الشيء داخل الصندوق.')
    ])]),
    unit(10,'My hobbies',2,4,[language('en2-u10-hobbies','p2',4,'أتحدث عن هواية',[
      {text:'I like reading. تعني: أحب القراءة.',scene:picture('book')},
      {text:'She likes reading. تعني: هي تحب القراءة.'}
    ],[
      complete('أي عبارة تعني: أحب القراءة؟','I like reading.','I like swimming.','reading تعني القراءة.'),
      complete('أكمل: She ... reading.','likes','like','نقول She likes reading.')
    ])]),
    unit(11,'Transport',2,10,[words('en2-u11-words','p2',10,['plane','طائرة','plane'],['train','قطار','train'])]),
    unit(12,'Let’s find out!',2,16,[words('en2-u12-words','p2',16,['pencil','قلم رصاص','pencil'],['book','كتاب','book']),language('en2-u12-place','p2',16,'أفهم مكان القلم',[
      {text:'The pencil is on the desk. تعني: قلم الرصاص على الطاولة الدراسية.'},
      {text:'The pencil is under the desk. تعني: قلم الرصاص تحت الطاولة الدراسية.'}
    ],[
      complete('أقرأ: The pencil is on the desk. أين قلم الرصاص؟','على الطاولة الدراسية.','تحت الطاولة الدراسية.','on تعني على.'),
      complete('أكمل بمعنى تحت: The pencil is ... the desk.','under','on','under تعني تحت.')
    ])]),
    unit(13,'Let’s go shopping!',2,22,[words('en2-u13-words','p2',22,['shoes','حذاء','shoes'],['shirt','قميص','shirt'])]),
    unit(14,'Revision',2,28,[words('en2-u14-review','p2',28,['train','قطار','train'],['pencil','قلم رصاص','pencil'])]),
    unit(15,'Guess who?',2,34,[language('en2-u15-describe','p2',34,'أقرأ وصفًا قصيرًا',[
      {text:'He has short hair. تعني: له شعر قصير.'},
      {text:'She has long hair. تعني: لها شعر طويل.'}
    ],[
      complete('أقرأ: He has short hair. كيف شعره؟','قصير.','طويل.','short تعني قصيرًا.'),
      complete('أكمل بمعنى طويل: She has ... hair.','long','short','long تعني طويلًا.')
    ])]),
    unit(16,'My country',2,40,[language('en2-u16-country','p2',40,'أعرّف ببلدي',[
      {text:'I’m from Palestine. تعني: أنا من فلسطين.',scene:picture('flag')},
      {text:'Where are you from? سؤال نسأل به عن بلد الشخص.'}
    ],[
      complete('أي سؤال أسأل به عن البلد؟','Where are you from?','What’s your name?','Where are you from? تعني: من أي بلد أنت؟'),
      complete('أقرأ: I’m from Palestine. من أي بلد المتحدث؟','فلسطين.','بلد لم يذكره.','Palestine تعني فلسطين.')
    ])]),
    unit(17,'Happy birthday!',2,46,[language('en2-u17-birthday','p2',46,'أفهم التهنئة',[
      {text:'Happy birthday! تهنئة بمناسبة عيد الميلاد.',scene:picture('balloon')},
      {text:'Thank you. عبارة للشكر، ويمكن أن نرد بها على التهنئة.'}
    ],[
      complete('أي عبارة تهنئة بعيد الميلاد؟','Happy birthday!','Good night!','Happy birthday! تهنئة بعيد الميلاد.'),
      complete('كيف أشكر صديقي على تهنئته؟','Thank you.','Goodbye.','Thank you. تعني شكرًا.')
    ])]),
    unit(18,'Revision',2,52,[language('en2-u18-review','p2',52,'أراجع ما أقول عن نفسي',[
      {text:'I like reading. أحب القراءة.',scene:picture('book')},
      {text:'I’m from Palestine. أنا من فلسطين.',scene:picture('flag')}
    ],[
      complete('أكمل بمعنى أحب القراءة: I like ...','reading.','swimming.','reading تعني القراءة.'),
      complete('أكمل: I’m ... Palestine.','from','under','from تعني من في هذه الجملة.')
    ])])
  ];
  window.G1_COURSE={grade:2,id:'english',title:'اللغة الإنجليزية',key:'bustan_g2_english_v1',books:[{id:'p1',title:'English for Palestine 2A',url:'https://elearn.azureedge.net/Books/c2/en2-p1.pdf'},{id:'p2',title:'English for Palestine 2B',url:'https://elearn.azureedge.net/Books/c2/en2-p2.pdf'}],sourceNote:'أنشطة أصلية قصيرة لدعم كلمات وتراكيب الصف الثاني. عناوين الوحدات وإحالات بداية الوحدة من الكتابين الرسميين؛ لا تنقل هذه الأنشطة تمارين الكتاب، ولا تمثل تغطية كاملة لجميع الفترات أو مهارات الاستماع والمحادثة والقراءة والكتابة. لا توجد تسجيلات جديدة في هذه الإضافة. يقرأ شخص كبير الكلمة عند الحاجة، ويُرجع إلى الكتاب والمعلم.',units,foundations:[language('en2-foundation','p1',4,'أربط الكلمة بجملة',[
    {text:'book تعني كتابًا.',scene:picture('book')},
    {text:'This is a book. تعني: هذا كتاب.'}
  ],[
    {...complete('أكمل وفق الصورة: This is a ...', 'book.','fish.','الصورة لكتاب. نقول This is a book.'),scene:picture('book')},
    {prompt:'أختار الكلمة المناسبة للصورة.',scene:picture('fish'),choices:[option('fish'),option('book')],answer:0,explain:'fish تعني سمكة.'}
  ])],lab:{title:'أرتب جملة بالإنجليزية',prompt:'تدريب ترتيب الكلمات حسب التلميح، من اليسار إلى اليمين. لا يقيس النشاط إتقان الكتابة أو النطق.',items:[
    {words:['My','name','is','Mira.'],scene:picture('girl'),hint:'أبدأ بكلمة My، ثم name. أعرّف بالاسم.'},
    {words:['I','like','reading.'],scene:picture('book'),hint:'أبدأ بكلمة I، ثم like.'},
    {words:['She','likes','fish.'],scene:picture('fish'),hint:'أبدأ بكلمة She، ثم likes.'},
    {words:['I','am','from','Palestine.'],scene:picture('flag'),hint:'أبدأ بكلمة I، ثم am، ثم from.'}
  ]}};
})();
