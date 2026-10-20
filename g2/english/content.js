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

  // Added targets retain separate IDs: old completions must not complete new learning.
  const numberWords=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  const indic=value=>String(value).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const getUnit=number=>units.find(u=>u.id.endsWith('-u'+number));
  const question=(prompt,correct,wrong,explain,scene)=>({prompt,choices:[{label:wrong},{label:correct}],answer:1,explain,...(scene?{scene}:{})});
  function supplement(number,suffix,title,steps,tasks,words=[]){
    const u=getUnit(number);
    const lesson={id:u.id+'-'+suffix,title,book:u.book,page:u.page,referenceKind:'unit-start',goal:'أفهم المثال، ثم أجرّب في موقف واضح.',steps,tasks,vocabulary:words};
    u.lessons.push(lesson);return lesson;
  }
  function addWords(number,entries){
    for(let start=0;start<entries.length;start+=2){
      const pair=entries.slice(start,start+2),other=pair.length===2?pair[1]:['book','كتاب','book'];
      supplement(number,'more-words-'+(start/2+1),'أتعرف '+pair.map(e=>e[1]).join(' و'),pair.map(e=>({text:e[0]+' تعني: '+e[1]+'. أقرأها مع شخص كبير.',...(e[2]?{scene:{type:'items',icons:[e[2]]}}:{scene:{type:'symbol',value:e[0]}})})),pair.map((e,i)=>question(e[2]?'أختار الكلمة المناسبة للصورة.':'أي كلمة تعني: '+e[1]+'؟',e[0],(pair[i?0:1]||other)[0],e[0]+' تعني: '+e[1]+'.',e[2]?{type:'items',icons:[e[2]]}:null)),pair.map(e=>e[0]));
    }
  }
  function addNumbers(number,values,icon){
    for(let start=0;start<values.length;start+=2){
      const pair=values.slice(start,start+2);
      supplement(number,'numbers-'+pair[0],'أعدّ وأقول بالإنجليزية',pair.map(n=>({text:indic(n)+' نقولها بالإنجليزية: '+numberWords[n]+'. أعدّ العناصر مع شخص كبير.',scene:{type:'count',icon,count:n}})),pair.map(n=>question('أعدّ العناصر، ثم أختار اسم العدد بالإنجليزية.',numberWords[n],numberWords[n===20?19:n+1],indic(n)+' نقولها: '+numberWords[n]+'.',{type:'count',icon,count:n})),pair.map(n=>numberWords[n]));
    }
  }
  function addDialogue(number,suffix,title,models,tasks){
    return supplement(number,suffix,title,models.map(m=>typeof m==='string'?{text:m}:m),tasks);
  }
  function addReviews(number,sourceNumbers){
    const pool=sourceNumbers.flatMap(n=>getUnit(n).lessons.map(lesson=>({lesson,task:lesson.tasks[lesson.tasks.length-1]})));
    for(let start=0;start<pool.length;start+=4){
      const rows=pool.slice(start,start+4),review=supplement(number,'mixed-review-'+(start/4+1),'أراجع كلمات ومواقف',rows.map(({task})=>({text:task.explain,...(task.scene?{scene:task.scene}:{})})),rows.map(({task})=>({...task,choices:task.choices.map(c=>({...c}))})));
      review.reviewOf=rows.map(({lesson})=>lesson.id);
    }
  }

  addNumbers(2,[11,12,13],'fish');addNumbers(3,[14,15,16],'bird');addNumbers(4,[17,18,19,20],'hand');
  addWords(2,[['kunafeh','كنافة'],['rice','أرز'],['meat','لحم'],['salad','سلطة'],['ice cream','مثلجات'],['chocolate','شوكولاتة']]);
  addWords(3,[['bird','طائر','bird'],['flower','زهرة','flower'],['tree','شجرة','tree']]);
  addWords(4,[['hair','شعر'],['shoulder','كتف']]);
  addWords(6,[['jump','اقفز'],['hop','احجل على قدم واحدة'],['clap','صفق'],['open','افتح'],['close','أغلق'],['come here','تعال إلى هنا'],['go there','اذهب إلى هناك'],['be quiet','التزم الهدوء']]);
  addWords(7,[['computer','حاسوب'],['rug','بساط'],['TV','تلفاز']]);
  addWords(8,[['mosque','مسجد'],['church','كنيسة'],['shop','متجر'],['park','متنزه'],['playground','ملعب']]);
  addWords(10,[['playing football','لعب كرة القدم','ball'],['dancing','الرقص'],['swimming','السباحة'],['drawing','الرسم'],['singing','الغناء'],['playing with friends','اللعب مع الأصدقاء']]);
  addWords(11,[['ship','سفينة'],['bus','حافلة','bus'],['van','شاحنة صغيرة'],['car','سيارة','car'],['bike','دراجة','bike']]);
  addWords(12,[['flag','علم','flag'],['pen','قلم حبر','pen'],['keyboard','لوحة مفاتيح'],['mouse','فأرة الحاسوب'],['ruler','مسطرة'],['eraser','ممحاة'],['crayon','قلم تلوين']]);
  addWords(13,[['sweater','كنزة'],['socks','جوارب','socks'],['hat','قبعة'],['pyjamas','ملابس النوم'],['boots','حذاء طويل الساق']]);
  addWords(15,[['grandfather','جد'],['grandmother','جدة'],['cousin','ابن أو ابنة العم أو العمة أو الخال أو الخالة'],['dad','أب','dad'],['mum','أم','mum'],['brother','أخ','boy'],['sister','أخت','girl'],['blonde','أشقر'],['brown','بني']]);
  addWords(16,[['mountain','جبل'],['river','نهر'],['town','بلدة'],['tree','شجرة','tree'],['flower','زهرة','flower'],['the sea','البحر'],['Hebron','الخليل'],['Haifa','حيفا'],['Bethlehem','بيت لحم'],['Gaza','غزة'],['Jerusalem','القدس'],['Nablus','نابلس']]);
  addWords(17,[['candles','شموع'],['balloons','بالونات','balloon'],['cake','كعكة'],['party','حفلة'],['birthday','عيد ميلاد'],['present','هدية'],['happy','سعيد'],['sad','حزين']]);
  addDialogue(1,'age-talk','أسأل عن العمر وأجيب',[
    'How old are you? تعني: كم عمرك؟ I’m eight. تعني: عمري ثماني سنوات.',
    'How old is she? تعني: كم عمرها؟ She’s seven. تعني: عمرها سبع سنوات.'
  ],[
    question('يسأل شخص ميرا: How old are you? وعمرها ثماني سنوات. تختار:','I’m eight.','My name’s Mira.','أجيب عن العمر: I’m eight.'),
    question('عمر الصبي سبع سنوات. ما الرد على How old is he?','He’s seven.','She’s eight.','he للصبي، وseven تعني سبعة.')
  ]);
  addDialogue(1,'who-talk','أسأل عن شخصية وأعرفها',[
    {text:'Who’s that boy? تعني: من ذلك الولد؟ That’s Sami. تعني: ذلك سامي.',scene:{type:'items',icons:['boy']}},
    {text:'Who’s that girl? تعني: من تلك البنت؟ That’s Mira. تعني: تلك ميرا.',scene:{type:'items',icons:['girl']}}
  ],[
    question('أريد معرفة اسم الولد الذي يشير إليه شخص كبير. ماذا أسأل؟','Who’s that boy?','How old are you?','Who’s that boy? للسؤال عن هوية الولد.'),
    question('أقرأ: That’s Mira. من الشخصية؟','Mira.','Sami.','That’s Mira. تعني تلك ميرا.')
  ]);
  addDialogue(2,'likes-question','أسأل عما تحبه الشخصية',[
    'What does she like? تعني: ماذا تحب؟ She likes rice. تعني: هي تحب الأرز.',
    'What does he like? تعني: ماذا يحب؟ He likes fish. تعني: هو يحب السمك.'
  ],[
    question('سامي يحب السمك. أي رد يناسب What does he like?','He likes fish.','She likes rice.','he لسامي، وfish تعني السمك.'),
    question('أي سؤال أسأل به عما تحبه ميرا؟','What does she like?','What’s your name?','What does she like? للسؤال عما تحبه.')
  ]);
  addDialogue(3,'garden-number','أعدّ ما في الحديقة',[
    {text:'Three birds. تعني: ثلاثة طيور. ألاحظ أن كلمة bird تصبح birds عند الحديث عن أكثر من طائر.',scene:{type:'count',icon:'bird',count:3}},
    {text:'A bird has two legs. للطائر ساقان. في الصورة طائر واحد.',scene:{type:'items',icons:['bird']}}
  ],[
    question('أعدّ الطيور وأختار الوصف.','Three birds.','Two birds.','في الصورة ثلاثة طيور.',{type:'count',icon:'bird',count:3}),
    question('أكمل الجملة: A bird ... two legs.','has','have','مع طائر واحد نستعمل has.')
  ]);
  addDialogue(4,'we-have','أستعمل ضمائر مختلفة',[
    'I have hair. تعني: لي شعر. You have hair. تعني: لك شعر.',
    'We have hair. تعني: لنا شعر. He has a nose. تعني: له أنف.'
  ],[
    question('أكمل: We ... hair.','have','has','مع We نستعمل have.'),
    question('أكمل: You ... hair.','have','has','مع You نستعمل have.'),
    question('أكمل: He ... a nose.','has','have','مع He نستعمل has.')
  ]);
  addDialogue(4,'touch-command','أفهم تعليمة تخص الجسم',[
    'Touch your hair. تعني: المس شعرك. أستطيع الإشارة إلى الصورة بدل لمس جسمي.',
    'Open your mouth. تعني: افتح فمك. Close your mouth. تعني: أغلق فمك. أفهم الأمر دون ضرورة تنفيذ الحركة.'
  ],[
    question('أي تعليمة تعني: المس شعرك؟','Touch your hair.','Close your mouth.','Touch تعني المس، وhair تعني الشعر.'),
    question('أي تعليمة تعني: أغلق فمك؟','Close your mouth.','Open your mouth.','Close تعني أغلق.')
  ]);
  addDialogue(6,'safe-actions','أفهم الحركة والمكان',[
    'Jump. تعني: اقفز. Hop. تعني: احجل على قدم واحدة. Clap. تعني: صفق. أفهم الحركات بالإشارة أو المشاهدة؛ التنفيذ اختياري في مكان آمن مع شخص كبير.',
    'Come here. تعني: تعال إلى هنا. Go there. تعني: اذهب إلى هناك. Be quiet. تعني: التزم الهدوء.'
  ],[
    question('أي تعليمة تعني: صفق؟','Clap.','Jump.','Clap. تعني صفق.'),
    question('ما معنى: Come here.؟','تعال إلى هنا.','اذهب إلى هناك.','Come here. تعني تعال إلى هنا.'),
    question('أختار تعليمة تعني: التزم الهدوء.','Be quiet.','Go there.','Be quiet. تعني التزم الهدوء.')
  ]);
  addDialogue(7,'home-on','أفهم موضع اللعبة',[
    'The bus is on the box. تعني: الحافلة على الصندوق. المقصود هنا لعبة على شكل حافلة.',
    'ألاحظ الفرق بين on على، وin داخل، وunder تحت. أجرب بلعبة وصندوق آمن مع شخص كبير.'
  ],[
    question('أختار معنى: The bus is on the box.','الحافلة على الصندوق.','الحافلة تحت الصندوق.','on تعني على.'),
    question('أكمل بمعنى داخل: The bus is ... the box.','in','under','in تعني داخل.')
  ]);
  addDialogue(8,'town-between','أفهم علاقة ثلاثة أماكن',[
    'between تعني: بين شيئين أو مكانين. The park is between the church and the school.',
    'الجملة تصف متنزهًا بين الكنيسة والمدرسة. at the playground تعني: في الملعب، وat my house تعني: في منزلي.'
  ],[
    question('أقرأ: The park is between the church and the school. أين المتنزه؟','بين الكنيسة والمدرسة.','تحت المدرسة.','between تعني بين.'),
    question('أكمل: The park is ... the church and the school.','between','under','لدينا موضعان يحيطان بالمتنزه، فنستعمل between.'),
    question('أي عبارة تعني: في الملعب؟','at the playground','at my house','playground تعني الملعب.')
  ]);
  addDialogue(10,'hobby-question','أسأل عن الهواية وأجيب',[
    'What do you like? تعني: ماذا تحب؟ I like drawing. تعني: أحب الرسم.',
    'We like playing football. تعني: نحب لعب كرة القدم. What does she like? She likes swimming.'
  ],[
    question('ميرا تحب الرسم. كيف تجيب عن What do you like?','I like drawing.','I like swimming.','drawing تعني الرسم.'),
    question('أكمل: We ... playing football.','like','likes','مع We نستعمل like.'),
    question('أختار ردًا عن هواية فتاة تحب السباحة.','She likes swimming.','He likes reading.','She لفتاة، وswimming السباحة.')
  ]);
  addDialogue(11,'this-these','أميز المفرد والجمع',[
    {text:'This car is fast. تعني: هذه السيارة سريعة. This لشيء واحد.',scene:{type:'count',icon:'car',count:1}},
    {text:'These cars are slow. تعني: هذه السيارات بطيئة. These لأكثر من شيء.',scene:{type:'count',icon:'car',count:3}}
  ],[
    question('أنظر إلى الصور وأكمل: ... cars are slow.','These','This','هناك أكثر من سيارة، فنستعمل These.',{type:'count',icon:'car',count:3}),
    question('أنظر إلى الصورة وأكمل: ... car is fast.','This','These','هناك سيارة واحدة، فنستعمل This.',{type:'count',icon:'car',count:1}),
    question('أي كلمة تعني: بطيء؟','slow','fast','slow تعني بطيئًا، وfast سريعًا.')
  ]);
  addDialogue(12,'see-classroom','أسأل عما أراه',[
    {text:'What can you see? تعني: ماذا ترى؟ I can see a flag. تعني: أرى علمًا.',scene:{type:'items',icons:['flag']}},
    'The keyboard is next to the mouse. تعني: لوحة المفاتيح بجانب فأرة الحاسوب.'
  ],[
    question('أرى الصورة. ما الرد على What can you see?','I can see a flag.','I can see a cat.','الصورة لعلم: I can see a flag.',{type:'items',icons:['flag']}),
    question('أكمل بمعنى بجانب: The keyboard is ... the mouse.','next to','under','next to تعني بجانب.')
  ]);
  addDialogue(13,'shopping-talk','أطلب ملابس في المتجر',[
    'My sweater is small. تعني: كنزتي صغيرة. I’d like a new sweater. تعني: أود كنزة جديدة.',
    'I’d like new boots. أود حذاءً جديدًا طويل الساق. يقول البائع: Here you are. تفضل. وأرد: Thank you. شكرًا.'
  ],[
    question('أريد طلب كنزة جديدة من البائع. ماذا أقول؟','I’d like a new sweater.','My name’s Mira.','I’d like a new sweater. طلب مهذب لكنزة جديدة.'),
    question('يقدم البائع الملابس ويقول: Here you are. كيف أشكره؟','Thank you.','Goodbye.','Thank you. عبارة شكر.'),
    question('أكمل طلب حذاء جديد: I’d like new ...','boots.','hair.','boots حذاء طويل الساق، وhair شعر.')
  ]);
  addDialogue(13,'shopping-colours','أصف الملابس وحجمها',[
    'a blue shirt تعني: قميص أزرق. a red sweater تعني: كنزة حمراء.',
    'My sweater is small. كنزتي صغيرة. My sweater is big. كنزتي كبيرة.'
  ],[
    question('أي وصف يعني: قميص أزرق؟','a blue shirt','a red shirt','blue تعني أزرق.'),
    question('أختار معنى: My sweater is small.','كنزتي صغيرة.','كنزتي كبيرة.','small تعني صغيرًا.')
  ]);
  addDialogue(15,'family-description','أتعرف إلى أسرتي وأصفها',[
    'This is my grandfather. تعني: هذا جدي. This is my grandmother. تعني: هذه جدتي.',
    'He has blonde hair and green eyes. تعني: له شعر أشقر وعينان خضراوان. She has brown eyes. تعني: لها عينان بنيتان.'
  ],[
    question('أريد التعريف بجدتي. أي عبارة أستعمل؟','This is my grandmother.','This is my grandfather.','grandmother تعني الجدة.'),
    question('أقرأ: He has blonde hair and green eyes. ما لون شعره؟','أشقر.','بني.','blonde تصف الشعر الأشقر.'),
    question('أقرأ: She has brown eyes. ما لون عينيها؟','بني.','أخضر.','brown تعني بنيًا.')
  ]);
  addDialogue(15,'height-talk','أصف طول الشخصية',[
    'I’m very tall. تعني: أنا طويل جدًا. He’s short. تعني: هو قصير.',
    'I have black hair and brown eyes. تعني: لي شعر أسود وعينان بنيتان.'
  ],[
    question('أي عبارة تعني: هو قصير؟','He’s short.','She’s tall.','He’s short. تعني هو قصير.'),
    question('أقرأ: I have black hair and brown eyes. ما لون الشعر؟','أسود.','أشقر.','black تعني أسود.')
  ]);
  addDialogue(16,'city-talk','أسأل عن مدينة الشخصية',[
    'Where are you from? I’m from Hebron. السؤال عن المكان، والجواب: أنا من الخليل.',
    'Where’s she from? She’s from Gaza. تعني: من أين هي؟ هي من غزة. يختلف السؤال بحسب من نتحدث عنه.'
  ],[
    question('ميرا من غزة. ما الرد على Where’s she from?','She’s from Gaza.','He’s from Haifa.','She’s from Gaza. تعني هي من غزة.'),
    question('أقرأ: I’m from Hebron. ما المدينة؟','الخليل.','نابلس.','Hebron اسم الخليل بالإنجليزية.')
  ]);
  addDialogue(16,'country-landscape','أصف مشهدًا من بلدي',[
    'I can see a mountain. تعني: أرى جبلًا. I can see the sea. تعني: أرى البحر.',
    'I can see trees and flowers. تعني: أرى أشجارًا وأزهارًا.'
  ],[
    question('أي جملة تعني: أرى البحر؟','I can see the sea.','I can see a river.','the sea تعني البحر.'),
    question('أقرأ: I can see trees and flowers. ماذا أرى؟','أشجارًا وأزهارًا.','سيارات وقطارات.','trees أشجار، وflowers أزهار.')
  ]);
  addDialogue(17,'feelings-talk','أسأل عن الشعور وأجيب',[
    'How do you feel? تعني: كيف تشعر؟ I feel happy. تعني: أشعر بالسعادة.',
    'I feel sad. تعني: أشعر بالحزن. أستطيع تسمية شعوري، ولا توجد مشاعر ممنوعة.'
  ],[
    question('أريد أن أسأل صديقي عن شعوره. ماذا أقول؟','How do you feel?','What’s your name?','How do you feel? سؤال عن الشعور.'),
    question('أي جملة تعني: أشعر بالحزن؟','I feel sad.','I feel happy.','sad تعني حزينًا.')
  ]);
  addDialogue(17,'birthday-age','أعدّ الشموع وأذكر العمر',[
    {text:'Seven candles. تعني: سبع شموع. في مشهد التدريب نعدّ بالونات بدل الشموع.',scene:{type:'count',icon:'balloon',count:7}},
    'في هذا الحوار عمر ميرا سبع سنوات: How old are you? I’m seven. لا نستنتج العمر الحقيقي لشخص من عدد البالونات.'
  ],[
    question('في الحوار عمر ميرا سبع سنوات. كيف تجيب عن How old are you?','I’m seven.','I’m eight.','seven تعني سبعة.'),
    question('أعدّ البالونات وأختار العدد بالإنجليزية.','seven','six','عدد البالونات سبعة.',{type:'count',icon:'balloon',count:7})
  ]);

  const personScene=person=>({type:'symbol',value:'ألاحظ الشخصية.',person});
  const familyScene=focus=>({type:'symbol',value:'ألاحظ الأسرة.',family:{focus}});
  const position=(object,relation,reference='box')=>({type:'symbol',value:'ألاحظ مكان الشيء.',position:{object,reference,relation}});
  const lessonById=id=>units.flatMap(u=>u.lessons).find(l=>l.id===id);
  const home=lessonById('en2-u7-place');
  home.steps[0].scene=position('bus','in');home.steps[1].scene=position('bus','under');
  home.tasks[0].scene=position('bus','in');home.tasks[1].scene=position('bus','under');
  home.tasks[0].prompt='ألاحظ الحافلة اللعبة. أين هي؟';
  home.tasks[1].prompt='ألاحظ الحافلة اللعبة وأكمل: The bus is ... the box.';
  home.tasks[1].choices=[{label:'on'},{label:'under'}];home.tasks[1].answer=1;
  const on=lessonById('en2-u7-home-on');
  on.steps[0]={text:'The bus is on the box. الحافلة اللعبة على الصندوق.',scene:position('bus','on')};
  on.steps[1].scene=position('bus','in');on.tasks[0].scene=position('bus','on');on.tasks[1].scene=position('bus','in');
  on.tasks[0].prompt='ألاحظ الحافلة اللعبة وأختار وصف مكانها.';
  on.tasks[0].choices=[{label:'The bus is under the box.'},{label:'The bus is on the box.'}];
  on.tasks[1].prompt='ألاحظ الحافلة اللعبة وأكمل: The bus is ... the box.';
  const pen=lessonById('en2-u12-place');
  pen.steps[0].scene=position('pencil','on','desk');pen.steps[1].scene=position('pencil','under','desk');
  pen.tasks[0].scene=position('pencil','on','desk');pen.tasks[1].scene=position('pencil','under','desk');
  const town=lessonById('en2-u8-town-between');
  town.steps[0]={text:'ألاحظ الكنيسة والمتنزه والمدرسة. The park is between the church and the school. المتنزه بين الكنيسة والمدرسة.',scene:{type:'symbol',value:'ألاحظ الأماكن الثلاثة.',town:true}};
  town.tasks[0].scene={type:'symbol',value:'ألاحظ الأماكن الثلاثة.',town:true};town.tasks[0].prompt='ألاحظ ترتيب الأماكن. أين المتنزه؟';
  town.tasks[1].scene={type:'symbol',value:'ألاحظ الأماكن الثلاثة.',town:true};town.tasks[1].prompt='ألاحظ الرسم وأكمل: The park is ... the church and the school.';
  const hair=lessonById('en2-u15-describe');
  hair.steps[0].scene=personScene({role:'boy',hair:'short'});hair.steps[1].scene=personScene({role:'girl',hair:'long'});
  hair.tasks[0].scene=personScene({role:'boy',hair:'short'});hair.tasks[1].scene=personScene({role:'girl',hair:'long'});
  hair.tasks[0].prompt='أنظر إلى شعر الشخصية. كيف يبدو؟';hair.tasks[1].prompt='أنظر إلى شعر الشخصية وأكمل: She has ... hair.';
  const family=lessonById('en2-u15-family-description');
  family.steps[0]={text:'This is my grandfather. هذا جدي. This is my grandmother. هذه جدتي. الإطار الأزرق المسمى أنا للولد الذي نتحدث عن أسرته؛ والإطار الأخضر للجدة.',scene:familyScene('grandmother')};
  family.steps[1]={text:'He has blonde hair and green eyes. له شعر أشقر وعينان خضراوان. ألاحظ ألوان الشخصية.',scene:personScene({role:'boy',hair:'short',hairColor:'blonde',eyeColor:'green'})};
  family.tasks[0].scene=familyScene('grandmother');family.tasks[0].prompt='ألاحظ شجرة الأسرة. كيف أعرّف بالشخص داخل الإطار الأخضر؟';
  family.tasks[1].scene=personScene({role:'boy',hair:'short',hairColor:'blonde',eyeColor:'green'});family.tasks[1].prompt='ألاحظ الشخصية. ما لون شعرها؟';
  family.tasks[2].scene=personScene({role:'girl',hair:'long',hairColor:'brown',eyeColor:'brown'});family.tasks[2].prompt='ألاحظ الشخصية. ما لون عينيها؟';
  const height=lessonById('en2-u15-height-talk');
  height.steps[0]={text:'He’s tall. هو طويل. أقارن مستوى الرأس بعلامات القياس الثابتة.',scene:personScene({role:'boy',height:'tall'})};
  height.steps[1]={text:'He’s short. هو قصير. أستعمل علامات القياس نفسها، ولا أصف شخصًا لإغاظته.',scene:personScene({role:'boy',height:'short'})};
  height.tasks[0]={...question('أقارن الشخصية بعلامات القياس. أي وصف يناسبها؟','He’s short.','He’s tall.','هذه الشخصية أقصر عند استعمال علامات القياس نفسها.',personScene({role:'boy',height:'short'}))};
  height.tasks[1]={...question('ألاحظ الشخصية. ما لون الشعر؟','أسود.','أشقر.','black تعني أسود.',personScene({role:'boy',hairColor:'black',eyeColor:'brown'}))};
  const safe=lessonById('en2-u6-safe-actions');
  safe.steps[0]={text:'Clap. تعني: صفق. Jump. تعني: اقفز. أفهم الحركة بالمشاهدة؛ تنفيذها اختياري في مكان آمن مع شخص كبير.',scene:personScene({pose:'clap'})};
  safe.tasks[0]={...question('ألاحظ حركة الشخصية. أي تعليمة تناسبها؟','Clap.','Jump.','الشخصية تصفق بيديها: Clap.',personScene({pose:'clap'}))};
  addDialogue(6,'see-jump','أتعرف حركة القفز',[
    {text:'Jump. تعني: اقفز. ألاحظ القدمين فوق الأرض. المشاهدة تكفي ولا يلزم أن أقفز.',scene:personScene({pose:'jump'})},
    {text:'Stand up. تعني: قف. الشخص واقف وقدماه على الأرض.',scene:personScene({pose:'stand'})}
  ],[
    question('ألاحظ الشخصية فوق الأرض. ما الحركة؟','Jump.','Sit down.','الشخصية تقفز: Jump.',personScene({pose:'jump'})),
    question('ألاحظ الشخصية على الكرسي. أي تعليمة تناسبها؟','Sit down.','Jump.','الشخصية جالسة: Sit down.',personScene({pose:'sit'}))
  ]);
  // Relationship evidence, rather than a boy or girl alone.
  for(const lesson of units.flatMap(u=>u.lessons)){
    for(const task of lesson.tasks){
      const word=task.choices[task.answer].label;
      if(task.scene?.type==='items'&&['brother','sister'].includes(word))task.scene=familyScene(word);
    }
    for(const row of [...lesson.steps,...lesson.tasks,...lesson.tasks.flatMap(t=>t.choices)]){
      const label=row.text||row.label||'';
      if(row.scene?.type==='items'&&row.scene.icons.length===1&&['boy','girl'].includes(row.scene.icons[0])&&/brother|sister/.test(label))row.scene=familyScene(/brother/.test(label)?'brother':'sister');
    }
    lesson.referenceKind='unit-start';
  }

  addReviews(5,[1,2,3,4]);addReviews(9,[6,7,8]);addReviews(14,[10,11,12,13]);addReviews(18,[10,11,12,13,15,16,17]);

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
  for(const lesson of [...window.G1_COURSE.units.flatMap(unit=>unit.lessons),...window.G1_COURSE.foundations]){
    lesson.referenceKind='unit-start';
    lesson.referenceLabel='نشاط مساند للوحدة؛ مرجع بداية الوحدة:';
  }
})();
