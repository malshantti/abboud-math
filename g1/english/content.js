/* Original short activities, aligned to the official book contents; not reproduced book exercises. */
(()=>{
  'use strict';
  const sym=(value,caption='')=>({type:'symbol',value,caption});
  const picture=(icon,caption='')=>({type:'items',icons:[icon],caption});
  const sceneFor=entry=>entry[2]&&typeof entry[2]==='object'?{...entry[2],caption:entry[1]}:entry[2]?picture(entry[2],entry[1]):sym(entry[0],entry[1]);
  const imageOnly=entry=>{const scene=sceneFor(entry);delete scene.caption;return scene;};
  const option=entry=>({label:entry[1],scene:imageOnly(entry),say:entry[0],sayLang:'en'});
  const ICONS=new Set('apple orange ball fish flower book leaf eye ear nose hand house school flag boy girl sun water tree car bag cat dog door chair pen bird nest bee monkey banana peach basket tap doll kite balloon shorts jeans taxi lemon goat pencil desk applejuice orangejuice bread cheese egg olive milk cup head face mouth leg finger mum dad baby bus train bike plane boat shirt trousers shoes socks dress bed table window rock rabbit hen duck butterfly cow horse elephant zoo home'.split(' '));
  const look=word=>{const key=String(word).toLowerCase().replace(/[^a-z]/g,'');return ICONS.has(key)?picture(key):sym(word);};
  // Rotate the correct position; the shared engine may shuffle again.
  let turn=0;
  const place=(correct,wrongs)=>{const list=wrongs.filter((w,i,a)=>w&&w.label!==correct.label&&a.findIndex(x=>x.label===w.label)===i),at=(turn++)%(list.length+1);list.splice(at,0,correct);return {choices:list,answer:at};};
  const POOL=[['cat','قطة','cat'],['dog','كلب','dog'],['egg','بيضة','egg'],['book','كتاب','book'],['bus','حافلة','bus'],['bed','سرير','bed'],['milk','حليب','milk'],['hand','يد','hand'],['kite','طائرة ورقية','kite'],['apple','تفاحة','apple']];
  const extra=(entries)=>POOL.find(p=>!entries.some(e=>e[0]===p[0]));
  function vocabulary(id,title,book,page,entries){
    const [first,second]=entries,third=extra(entries);
    return {id,title,book,page,goal:'أسمع الكلمة، وأقولها.',steps:entries.map(entry=>({text:`${entry[0]} — ${entry[1]}`,scene:imageOnly(entry),say:entry[0],sayLang:'en'})),tasks:[
      {prompt:'أستمع، وأختار الصورة.',listen:true,say:first[0],sayLang:'en',...place(option(first),[option(second),option(third)]),explain:`${first[0]} — ${first[1]}`},
      {prompt:'ما اسم الصورة؟',scene:imageOnly(second),...place({label:second[0]},[{label:first[0]},{label:third[0]}]),explain:`${second[0]} — ${second[1]}`}
    ]};
  }
  function wordsUnit(number,title,term,page,pairs){
    const book=term===1?'p1':'p2',id=`en-u${number}`;
    return {id,title,term,book,page,lessons:pairs.map((entries,i)=>vocabulary(`${id}-l${i+1}`,i===0?'أتعرف الكلمات':'ألعب بالكلمات',book,page,entries))};
  }
  const greeting=(id,title,book,page,morning)=>{
    const opts=morning?['Good morning','Good afternoon','Goodbye']:['Hello','Goodbye','Thank you'];
    const pick=(i,rest)=>{let t=turn++%3;const list=rest.map(x=>({label:x,say:x,sayLang:'en'}));list.splice(t,0,{label:opts[i],say:opts[i],sayLang:'en'});return {choices:list,answer:t};};
    return {id,title,book,page,goal:'أسمع التحية، وأقولها.',steps:[
      {text:morning?'Good morning — صباح الخير':'Hello — مرحبًا',scene:picture(morning?'sun':'boy'),say:morning?'Good morning!':'Hello!',sayLang:'en'},
      {text:morning?'Good afternoon — مساء الخير':'Goodbye — إلى اللقاء',scene:picture('girl'),say:morning?'Good afternoon!':'Goodbye!',sayLang:'en'}
    ],tasks:[
      {prompt:morning?'تحية الصباح؟':'ماذا أقول عند اللقاء؟',scene:picture(morning?'sun':'boy'),...pick(0,opts.filter((_,i)=>i!==0)),explain:morning?'Good morning — صباح الخير':'Hello — مرحبًا'},
      {prompt:morning?'التحية بعد الظهر؟':'ماذا أقول عند المغادرة؟',...pick(1,opts.filter((_,i)=>i!==1)),explain:morning?'Good afternoon — مساء الخير':'Goodbye — إلى اللقاء'}
    ]};
  };
  const units=[
    {id:'en-u1',title:'Hello!',term:1,book:'p1',page:4,lessons:[greeting('en-u1-l1','أحيّي صديقي','p1',4,false),greeting('en-u1-l2','تحيات اليوم','p1',4,true)]},
    wordsUnit(2,'Let’s eat!',1,10,[[['bread','خبز','bread'],['cheese','جبن','cheese']],[['egg','بيضة','egg'],['olive','حبّة زيتون','olive']]]),
    wordsUnit(3,'Animals',1,16,[[['cat','قطة','cat'],['dog','كلب','dog']],[['rabbit','أرنب','rabbit'],['goat','ماعز','goat']]]),
    wordsUnit(4,'My body',1,22,[[['hand','يد','hand'],['nose','أنف','nose']],[['head','رأس','head'],['leg','ساق','leg']]]),
    wordsUnit(5,'Revision',1,28,[[['cat','قطة','cat'],['egg','بيضة','egg']],[['hand','يد','hand'],['dog','كلب','dog']]]),
    wordsUnit(6,'My classroom',1,34,[[['book','كتاب','book'],['bag','حقيبة','bag']],[['pencil','قلم رصاص','pencil'],['desk','طاولة دراسية','desk']]]),
    wordsUnit(7,'My family',1,40,[[['Mum','أمي','mum'],['Dad','أبي','dad']],[['sister','أخت','girl'],['brother','أخ','boy']]]),
    wordsUnit(8,'Let’s drink!',1,46,[[['water','ماء','water'],['milk','حليب','milk']],[['apple juice','عصير تفاح','applejuice'],['orange juice','عصير برتقال','orangejuice']]]),
    wordsUnit(9,'Revision',1,52,[[['book','كتاب','book'],['milk','حليب','milk']],[['Mum','أمي','mum'],['bag','حقيبة','bag']]]),
    wordsUnit(10,'Let’s play!',2,4,[[['ball','كرة','ball'],['doll','دمية','doll']],[['kite','طائرة ورقية','kite'],['balloon','بالون','balloon']]]),
    wordsUnit(11,'Transport',2,10,[[['car','سيارة','car'],['bus','حافلة','bus']],[['bike','دراجة','bike'],['taxi','سيارة أجرة','taxi']]]),
    wordsUnit(12,'Colours',2,16,[[['red','أحمر',{type:'shape',value:'circle',color:'red'}],['green','أخضر',{type:'shape',value:'circle',color:'green'}]],[['blue','أزرق',{type:'shape',value:'circle',color:'blue'}],['yellow','أصفر',{type:'shape',value:'circle',color:'yellow'}]]]),
    wordsUnit(13,'My clothes',2,22,[[['t-shirt','قميص قصير الكمَّيْن','shirt'],['shoes','حذاء','shoes']],[['dress','فستان','dress'],['jeans','بنطال جينز','jeans']]]),
    wordsUnit(14,'Revision',2,28,[[['car','سيارة','car'],['ball','كرة','ball']],[['shoes','حذاء','shoes'],['dress','فستان','dress']]]),
    wordsUnit(15,'My bedroom',2,34,[[['bed','سرير','bed'],['table','طاولة','table']],[['window','نافذة','window'],['door','باب','door']]]),
    wordsUnit(16,'In my country',2,40,[[['apple','تفاحة','apple'],['orange','برتقالة','orange']],[['olive','حبّة زيتون','olive'],['lemon','ليمونة','lemon']]]),
    {id:'en-u17',title:'My friends',term:2,book:'p2',page:46,lessons:[{
      id:'en-u17-l1',title:'أعرّف بصديقي',book:'p2',page:46,goal:'أستخدم عبارة قصيرة للتعريف بصديق.',steps:[
        {text:'أشير إلى صديقي وأقول: This is my friend.',scene:{type:'items',icons:['boy','girl']}},
        {text:'أقول العبارة بمساعدة شخص كبير، ثم أعرّفه بصديق آخر.',scene:{type:'items',icons:['girl','boy']}}
      ],tasks:[
        {prompt:'كيف أعرّف بصديقي؟',scene:{type:'items',icons:['boy','girl']},choices:[{label:'This is my friend.'},{label:'Goodbye!'}],answer:0,explain:'This is my friend. تعني: هذا صديقي.'},
        {prompt:'ماذا تعني This is my friend.؟',choices:[{label:'هذا صديقي.'},{label:'إلى اللقاء.'}],answer:0,explain:'نستعمل العبارة للتعريف بصديق.'}
      ]
    },{
      id:'en-u17-l2',title:'أقف وأجلس',book:'p2',page:46,goal:'أفهم تعليمتين قصيرتين، وأنفذهما إذا كان المكان آمنًا.',steps:[
        {text:'Stand up. تعني: قف. أنفذها إذا استطعت بأمان.',scene:picture('boy')},
        {text:'Sit down. تعني: اجلس.',scene:picture('chair')}
      ],tasks:[
        {prompt:'أي عبارة تعني: قف؟',choices:[{label:'Sit down.'},{label:'Stand up.'}],answer:1,explain:'Stand up. تعني: قف.'},
        {prompt:'أي عبارة تعني: اجلس؟',scene:picture('chair'),choices:[{label:'Sit down.'},{label:'Stand up.'}],answer:0,explain:'Sit down. تعني: اجلس.'}
      ]
    }]},
    wordsUnit(18,'Revision',2,52,[[['apple','تفاحة','apple'],['bed','سرير','bed']],[['window','نافذة','window'],['orange','برتقالة','orange']]])
  ];

  // Added targets retain separate IDs: old completions must not complete new learning.
  const numberWords=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  const indic=value=>String(value).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  const getUnit=number=>units.find(u=>u.id.endsWith('-u'+number));
  const AR_POOL=['إلى اللقاء.','هذا قلم.'],EN_POOL=['It’s a cat.','Thank you.','Five taxis.'],PLACES=['in','on','under'];
  const thirdFor=(correct,wrong)=>{
    if(numberWords.includes(correct)){const n=numberWords.indexOf(correct);return numberWords.find((w,i)=>i>0&&i!==n&&w!==wrong&&Math.abs(i-n)<=3);}
    if(PLACES.includes(correct))return PLACES.find(x=>x!==correct&&x!==wrong);
    if(/^(very |They’re|It’s an orange|What’s this\?|What are these\?)/.test(correct))return null;
    if(/[\u0600-\u06ff]/.test(correct))return AR_POOL.find(x=>x!==correct&&x!==wrong);
    if(/^[a-z]+$/.test(correct))return null;
    return EN_POOL.find(x=>x!==correct&&x!==wrong);
  };
  const question=(prompt,correct,wrong,explain,scene)=>{const t=thirdFor(correct,wrong);return {prompt,...place({label:correct},[{label:wrong},...(t?[{label:t}]:[])]),explain,...(scene?{scene}:{})};};
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
    const pool=sourceNumbers.flatMap(n=>getUnit(n).lessons.filter(lesson=>!lesson.id.includes('-book-')).map(lesson=>({lesson,task:lesson.tasks[lesson.tasks.length-1]})));
    for(let start=0;start<pool.length;start+=4){
      const rows=pool.slice(start,start+4),review=supplement(number,'mixed-review-'+(start/4+1),'أراجع كلمات ومواقف',rows.map(({task})=>({text:task.explain,...(task.scene?{scene:task.scene}:{})})),rows.map(({task})=>({...task,choices:task.choices.map(c=>({...c}))})));
      review.reviewOf=rows.map(({lesson})=>lesson.id);
    }
  }

  addNumbers(2,[1,2,3],'egg');
  addNumbers(3,[4,5,6],'cat');
  addNumbers(4,[7,8,9,10],'hand');
  addWords(2,[['nut','حبة مكسرات'],['melon','بطيخ'],['date','تمرة']]);
  addWords(3,[['insect','حشرة'],['kitten','هرة صغيرة'],['lion','أسد'],['zebra','حمار وحشي']]);
  addWords(4,[['finger','إصبع','finger'],['face','وجه','face'],['mouth','فم','mouth']]);
  addWords(6,[['board','لوح الكتابة'],['teacher','معلم أو معلمة']]);
  addWords(7,[['baby','طفل رضيع','baby'],['me','أنا']]);
  addWords(8,[['tea','شاي'],['coffee','قهوة']]);
  addWords(10,[['yo-yo','لعبة اليويو'],['skates','حذاء تزلج']]);
  addWords(11,[['van','شاحنة صغيرة']]);
  addWords(12,[['white','أبيض'],['black','أسود'],['umbrella','مظلة']]);
  addWords(13,[['shorts','سروال قصير','shorts'],['skirt','تنورة']]);
  addWords(15,[['chair','كرسي','chair'],['box','صندوق']]);
  addWords(16,[['grape','حبة عنب'],['banana','موزة','banana'],['fig','تينة']]);
  addDialogue(1,'say-name','أسأل عن الاسم',[
    'What’s your name? تعني: ما اسمك؟',
    {text:'My name’s Mira. تعني: اسمي ميرا. أختار اسمي عند الحديث عن نفسي.',scene:{type:'items',icons:['girl']}}
  ],[
    question('يسأل الطفل: What’s your name? تقول ميرا:','My name’s Mira.','Goodbye!','My name’s Mira. تعني: اسمي ميرا.'),
    question('أريد معرفة اسم صديقي. ماذا أسأله؟','What’s your name?','Good afternoon.','What’s your name? سؤال عن الاسم.')
  ]);
  addDialogue(1,'greeting-variants','أفهم تحية قصيرة',[
    'Hi! تحية قصيرة عند اللقاء. Bye! تحية عند المغادرة.',
    'أرد على Hi! بتحية Hello!، وأقول Bye! عندما أغادر.'
  ],[
    question('ألتقي صديقي فيقول: Hi! كيف أرد؟','Hello!','Goodbye!','Hello! تحية عند اللقاء.'),
    question('أي تحية أقولها عند المغادرة؟','Bye!','Hi!','Bye! تحية عند المغادرة.')
  ]);
  addDialogue(6,'whats-this','أسأل عن أدوات الصف',[
    {text:'What’s this? تعني: ما هذا؟ أشير إلى قلم الرصاص وأسأل.',scene:{type:'items',icons:['pencil']}},
    {text:'It’s a pencil. تعني: إنه قلم رصاص.',scene:{type:'items',icons:['pencil']}}
  ],[
    question('أرى الصورة وأسمع سؤال شخص كبير: What’s this? أختار الرد.','It’s a pencil.','It’s a cat.','الصورة لقلم رصاص: It’s a pencil.',{type:'items',icons:['pencil']}),
    question('أريد أن أسأل عن اسم شيء. أي سؤال أستعمل؟','What’s this?','What’s your name?','What’s this? سؤال عن شيء.')
  ]);
  addDialogue(7,'family-talk','أعرّف بفرد من أسرتي',[
    'Who’s this? تعني: من هذا؟ أستعملها للسؤال عن شخص.',
    'This is my brother. تعني: هذا أخي. This is my sister. تعني: هذه أختي.'
  ],[
    question('تريد ميرا التعريف بأخيها. ماذا تقول؟','This is my brother.','This is my sister.','my brother تعني أخي.'),
    question('أريد أن أسأل عن شخص. ماذا أقول؟','Who’s this?','What’s this?','Who’s this? سؤال عن شخص.')
  ]);
  addDialogue(8,'drink-talk','أسأل عن المشروب',[
    {text:'What’s this? سؤال عن شيء. It’s water. تعني: إنه ماء.',scene:{type:'items',icons:['water']}},
    {text:'It’s milk. تعني: إنه حليب. ألاحظ صورة المشروب قبل الإجابة.',scene:{type:'items',icons:['milk']}}
  ],[
    question('ما الرد المناسب للصورة عن السؤال: What’s this?','It’s water.','It’s milk.','الصورة للماء: It’s water.',{type:'items',icons:['water']}),
    question('أشاهد الحليب. أي عبارة أستعمل؟','It’s milk.','It’s water.','milk تعني حليبًا.',{type:'items',icons:['milk']})
  ]);
  addDialogue(10,'where-toy','أسأل عن لعبتي',[
    'Where’s my ball? تعني: أين كرتي؟',
    'Here! تعني: هنا! There! تعني: هناك! أستعين بشخص كبير للإشارة إلى مكان قريب ثم بعيد.'
  ],[
    question('أبحث عن كرتي. أي سؤال أستعمل؟','Where’s my ball?','What’s your name?','Where’s my ball? سؤال عن مكان الكرة.'),
    question('يشير شخص كبير إلى مكان بعيد ويقول: There! ما المقصود؟','هناك!','هنا!','There! تعني هناك، أما Here! فتعني هنا.')
  ]);
  addDialogue(11,'how-many','أعدّ وسائل النقل',[
    {text:'How many taxis? تعني: كم سيارة أجرة؟ أعدّ الصور أولًا.',scene:{type:'count',icon:'taxi',count:3}},
    {text:'Three taxis. تعني: ثلاث سيارات أجرة.',scene:{type:'count',icon:'taxi',count:3}}
  ],[
    question('أعدّ الصور. ما جواب How many taxis?','Three taxis.','Five taxis.','العدد ثلاثة، فنقول Three taxis.',{type:'count',icon:'taxi',count:3}),
    question('أي سؤال أستعمل لمعرفة العدد؟','How many taxis?','Where’s my ball?','How many? سؤال عن العدد.')
  ]);
  addDialogue(12,'colour-talk','أسأل عن اللون',[
    {text:'What colour? تعني: ما اللون؟ هذا اللون نقول عنه Red.',scene:{type:'shape',value:'circle',color:'red'}},
    {text:'هذا اللون نقول عنه Blue. أقول اللون بعد ملاحظته.',scene:{type:'shape',value:'circle',color:'blue'}}
  ],[
    question('أنظر إلى اللون. ما الرد على What colour?','Red.','Blue.','الدائرة حمراء: Red.',{type:'shape',value:'circle',color:'red'}),
    question('أي سؤال أستعمل لمعرفة اللون؟','What colour?','How many taxis?','What colour? سؤال عن اللون.')
  ]);
  addDialogue(13,'clothes-colour','أصف لون الملابس',[
    'a red skirt تعني: تنورة حمراء. أقول اللون قبل اسم قطعة الملابس بالإنجليزية.',
    'blue jeans تعني: بنطال جينز أزرق.'
  ],[
    question('أختار وصفًا يعني: تنورة حمراء.','a red skirt','a blue skirt','red تعني أحمر، وskirt تعني تنورة.'),
    question('أي وصف يعني: بنطال جينز أزرق؟','blue jeans','red jeans','blue تعني أزرق، وjeans بنطال جينز.')
  ]);
  addDialogue(15,'bedroom-place','أفهم مكان لعبتي',[
    'in تعني: داخل. on تعني: على. under تعني: تحت.',
    'It’s under the bed. تعني: إنها تحت السرير. أضع لعبة آمنة تحت كرسي ثم فوقه بمساعدة شخص كبير.'
  ],[
    question('أختار معنى: It’s under the bed.','إنها تحت السرير.','إنها على السرير.','under تعني تحت.'),
    question('أكمل بمعنى داخل: It’s ... the box.','in','on','in تعني داخل، وon تعني على.'),
    question('أكمل بمعنى على: It’s ... the bed.','on','under','on تعني على.')
  ]);
  addDialogue(16,'size-talk','أصف الحجم',[
    'big تعني: كبير. small تعني: صغير.',
    'It’s very big. تعني: إنه كبير جدًا. أختار شيئًا كبيرًا وآخر صغيرًا حولي وأصفهما.'
  ],[
    question('أي وصف يعني: إنه صغير؟','It’s small.','It’s big.','small تعني صغيرًا.'),
    question('ما معنى very big؟','كبير جدًا.','صغير جدًا.','very هنا تعني جدًا.')
  ]);
  addDialogue(17,'friends-height','أصف صديقي وأفهم حركة',[
    'I’m short. تعني: أنا قصير. He’s tall. تعني: هو طويل. She’s tall. تعني: هي طويلة.',
    'Jump up and down. تعني: اقفز إلى أعلى وإلى أسفل. أفهم التعليمة، ويمكنني الإشارة بدل الحركة، ولا أقفز إلا في مكان آمن وبمساعدة شخص كبير.'
  ],[
    question('أي عبارة تعني: هي طويلة؟','She’s tall.','I’m short.','She’s tall. تعني هي طويلة.'),
    question('ما معنى: Jump up and down.؟','اقفز إلى أعلى وإلى أسفل.','اجلس.','الجملة تعليمة للقفز؛ لا يلزم تنفيذها للإجابة.')
  ]);

  const personScene=person=>({type:'symbol',value:'ألاحظ الشخصية.',person});
  const familyScene=focus=>({type:'symbol',value:'ألاحظ الأسرة.',family:{focus}});
  const position=(object,relation,reference='box')=>({type:'symbol',value:'ألاحظ مكان الشيء.',position:{object,reference,relation}});
  const lessonById=id=>units.flatMap(u=>u.lessons).find(l=>l.id===id);
  // A family relationship is shown relative to the blue frame labelled أنا.
  const family=lessonById('en-u7-l2');
  for(const row of [family.steps[0],family.tasks[0].choices[1]])row.scene=familyScene('sister');
  for(const row of [family.steps[1],family.tasks[0].choices[0],family.tasks[1]])row.scene=familyScene('brother');
  family.steps.forEach(s=>s.text+=' الإطار الأزرق المسمى أنا للولد الذي نتحدث عن أسرته، والأخ أو الأخت داخل الإطار الأخضر.');
  const movement=lessonById('en-u17-l2');
  movement.steps[0].scene=personScene({pose:'stand'});movement.steps[1].scene=personScene({pose:'sit'});
  movement.tasks[0].scene=personScene({pose:'stand'});movement.tasks[1].scene=personScene({pose:'sit'});
  movement.tasks[0].prompt='أنظر إلى الشخصية الواقفة. أي تعليمة تناسبها؟';
  movement.tasks[1].prompt='أنظر إلى الشخصية الجالسة. أي تعليمة تناسبها؟';
  const bedroom=lessonById('en-u15-bedroom-place');
  bedroom.steps[0]={text:'ألاحظ الكرة داخل الصندوق: in. الكرة على الصندوق: on. الكرة تحت الصندوق: under.',scene:position('ball','in')};
  bedroom.steps[1]={text:'It’s under the box. تعني: إنها تحت الصندوق. أجرب بلعبة وصندوق آمن مع شخص كبير.',scene:position('ball','under')};
  bedroom.tasks[0]={...question('ألاحظ مكان الكرة وأختار وصفه.','It’s under the box.','It’s on the box.','الكرة تحت الصندوق: under.',position('ball','under'))};
  bedroom.tasks[1]={...question('ألاحظ الكرة وأكمل: It’s ... the box.','in','on','الكرة داخل الصندوق: in.',position('ball','in'))};
  bedroom.tasks[2]={...question('ألاحظ الكرة وأكمل: It’s ... the box.','on','under','الكرة على الصندوق: on.',position('ball','on'))};
  // Short uppercase / lowercase copying is manual practice, not automatically assessed.
  addDialogue(1,'letter-pairs','أتعرف الحرف الصغير والكبير',[
    'في نهاية الكتاب أجد الحروف الصغيرة. a وA صورتان للحرف نفسه، وكذلك b وB.',
    'أستعمل مختبر الحروف لرسم الحروف الصغيرة مع شخص كبير. هذا تدريب حر؛ لا يمنحني الموقع حكمًا على جودة خطي.'
  ],[
    question('أي حرف صغير يقابل A؟','a','b','a هو الحرف الصغير المقابل لـ A.'),
    question('أي حرف صغير يقابل B؟','b','a','b هو الحرف الصغير المقابل لـ B.')
  ]);
  const allLessons=units.flatMap(u=>u.lessons);
  allLessons.forEach(l=>{l.referenceKind||='unit-start';});


  // The actual writing pages introduce these lowercase sets in this order.
  // Phonics: letter sound + a standard key word that starts (x: ends) with that sound.
  const letterExamples={a:'apple',b:'ball',c:'cat',d:'dog',e:'egg',f:'fish',g:'goat',h:'hand',i:'insect',j:'jeans',k:'kite',l:'lemon',m:'milk',n:'nose',o:'olive',p:'pen',q:'queen',r:'rabbit',s:'sun',t:'taxi',u:'umbrella',v:'van',w:'window',x:'fox',y:'yo-yo',z:'zoo'};
  const sounds={a:'/a/',c:'/k/',e:'/e/',i:'/i/',o:'/o/',q:'/kw/',u:'/u/',x:'/ks/',y:'/y/'};
  const soundOf=l=>sounds[l]||'/'+l+'/';
  const phonicsPool=['cat','dog','sun','egg','bed','hen','bus','milk','kite','fish','goat','hand','pen','box'];
  for(const [number,letters,page] of [[6,'ac',35],[7,'eo',41],[8,'dgq',47],[11,'ilt',11],[12,'bhp',17],[13,'mnr',23],[15,'vwx',35],[16,'juy',41],[17,'fksz',47]]){
    const unit=getUnit(number),set=[...letters];
    const L=supplement(number,'book-letters-'+letters,'أصوات الحروف '+set.join(' '),set.map(letter=>({text:`${letter} ${soundOf(letter)} — ${letterExamples[letter]}`,scene:look(letterExamples[letter]),say:`${letter}. ${letterExamples[letter]}.`,sayLang:'en'})),set.map(letter=>{
      const example=letterExamples[letter],wrongs=phonicsPool.filter(w=>!w.includes(letter)&&w[0]!==example[0]).slice((letter.charCodeAt(0))%5,(letter.charCodeAt(0))%5+2);
      const opt=w=>({label:w,scene:look(w),say:w,sayLang:'en'});
      return {prompt:letter==='x'?`أي كلمة تنتهي بصوت ${soundOf(letter)}؟`:`أي صورة تبدأ بصوت ${soundOf(letter)}؟`,scene:sym(letter),say:`${letter}. ${example}.`,sayLang:'en',...place(opt(example),wrongs.map(opt)),explain:`${example}: ${letter} ${soundOf(letter)}`};
    }));
    L.goal='أسمع صوت الحرف، وأجد صورة تبدأ به.';
    L.page=page;L.references=[{book:unit.book,page,pdfPage:page}];L.referenceKind='verified-pages';
    L.guidedPractice=[{title:'أتتبع ثم أنسخ',text:'أتتبع الحرف في الكراس صفحة '+indic(page)+'، ثم أنسخه.'}];
  }
  const extraLetters=lessonById('en-u1-letter-pairs');
  extraLetters.title='تدريب إضافي: صورتا الحرف';
  extraLetters.referenceLabel='تدريب إضافي على الصغير والكبير؛ لا ينقل ورقة من الكتاب. مرجع الأبجدية:';
  extraLetters.references=[{book:'p1',page:62,pdfPage:62}];
  const fruit=supplement(16,'book-one-many','أسأل عن ثمرة وعن ثمار',[
    {text:'عن ثمرة واحدة أسأل: What’s this? وأجيب: It’s an orange.',scene:{type:'count',icon:'orange',count:1}},
    {text:'عن أكثر من ثمرة أسأل: What are these? وأجيب: They’re oranges.',scene:{type:'count',icon:'orange',count:3}}
  ],[
    question('ألاحظ الثمار. ما الرد المناسب عن What are these?','They’re oranges.','It’s an orange.','تظهر أكثر من برتقالة؛ أستعمل They’re oranges.',{type:'count',icon:'orange',count:3}),
    question('ألاحظ ثمرة واحدة. أي سؤال يناسبها؟','What’s this?','What are these?','عن ثمرة واحدة أسأل What’s this?',{type:'count',icon:'orange',count:1})
  ]);fruit.page=40;fruit.references=[{book:'p2',page:40,pdfPage:40}];fruit.referenceKind='verified-pages';fruit.referenceLabel='نشاط مساند للمفرد والجمع؛ الصفحة المتحققة:';
  const placeQuestion=supplement(15,'book-where-answer','أسأل عن مكان شيء وأجيب',[
    {text:'Where’s the ball? تعني: أين الكرة؟ أنظر إلى مكانها قبل الإجابة.',scene:position('ball','on')},
    {text:'It’s on the box. تعني: إنها على الصندوق. أقول السؤال والجواب مع الكبير.',scene:position('ball','on')}
  ],[
    question('أي سؤال أسأل به عن مكان الكرة؟','Where’s the ball?','What colour?','Where’s للسؤال عن مكان الشيء.'),
    question('أنظر إلى الكرة. ما جواب Where’s the ball?','It’s on the box.','It’s under the box.','الكرة على الصندوق: on.',position('ball','on'))
  ]);placeQuestion.references=[{book:'p2',page:36,pdfPage:36}];placeQuestion.referenceKind='verified-pages';placeQuestion.referenceLabel='حوار أصلي مساند لعلاقة المكان؛ الصفحة المتحققة:';
  const colourPair=supplement(12,'book-two-colours','أصف لونين معًا',[
    {text:'ألاحظ المظلة: What colour? Red and black. أحمر وأسود.',scene:{type:'symbol',value:'ألاحظ اللونين.',colour:{first:'red',second:'black'}}},
    {text:'and تعني و. ألاحظ اللونين قبل أن أصفهما.',scene:{type:'symbol',value:'ألاحظ اللونين.',colour:{first:'blue',second:'white'}}}
  ],[
    question('ألاحظ لونَي المظلة. ما الوصف المناسب؟','Red and black.','Blue and white.','لونا المظلة أحمر وأسود.',{type:'symbol',value:'ألاحظ اللونين.',colour:{first:'red',second:'black'}}),
    question('ألاحظ لونَي المظلة. ما الوصف المناسب؟','Blue and white.','Red and green.','لونا المظلة أزرق وأبيض.',{type:'symbol',value:'ألاحظ اللونين.',colour:{first:'blue',second:'white'}})
  ]);colourPair.references=[{book:'p2',page:18,pdfPage:18},{book:'p2',page:21,pdfPage:21}];colourPair.referenceKind='verified-pages';colourPair.referenceLabel='تدريب أصلي على اللونين؛ الصفحات المتحققة:';
  const sizes=supplement(16,'book-size-comparison','أقارن الأحجام في الرسم',[
    {text:'أنظر إلى الكرات معًا. الكرة داخل الإطار الأخضر كبيرة مقارنة بالكرات الأخرى: big.',scene:{type:'symbol',value:'أقارن الأحجام.',sizes:{target:2}}},
    {text:'هذه الكرة أصغر من الكرات الأخرى: very small. أستعمل المقارنة نفسها قبل الوصف.',scene:{type:'symbol',value:'أقارن الأحجام.',sizes:{target:0}}}
  ],[
    question('أي وصف يناسب الكرة داخل الإطار الأخضر؟','very small','very big','الكرة داخل الإطار هي الأصغر في هذه المجموعة: very small.',{type:'symbol',value:'أقارن الأحجام.',sizes:{target:0}}),
    question('أي وصف يناسب الكرة داخل الإطار الأخضر؟','very big','very small','الكرة داخل الإطار هي الأكبر في هذه المجموعة: very big.',{type:'symbol',value:'أقارن الأحجام.',sizes:{target:3}})
  ]);sizes.references=[{book:'p2',page:42,pdfPage:42},{book:'p2',page:44,pdfPage:44}];sizes.referenceKind='verified-pages';sizes.referenceLabel='نشاط مساند لوصف الحجم؛ الصفحات المتحققة:';

  // Keep established review IDs on their original targets; book additions get new IDs.
  function addBookReviews(number,sources){
    const pool=sources.flatMap(n=>getUnit(n).lessons.filter(l=>l.id.includes('-book-')&&!l.reviewOf).map(lesson=>({lesson,task:lesson.tasks[lesson.tasks.length-1]})));
    for(let start=0;start<pool.length;start+=4){
      const rows=pool.slice(start,start+4),L=supplement(number,'book-review-'+(start/4+1),'أراجع مهارات الكتاب',rows.map(({task})=>({text:task.explain,...(task.scene?{scene:task.scene}:{})})),rows.map(({task})=>({...task,choices:task.choices.map(choice=>({...choice}))})));
      L.reviewOf=rows.map(({lesson})=>lesson.id);L.referenceLabel='مراجعة أصلية للمهارات المضافة؛ صفحات مرجعية:';
      const seen=new Set();L.references=rows.flatMap(({lesson})=>lesson.references||[{book:lesson.book,page:lesson.page}]).filter(ref=>{const key=ref.book+':'+ref.page;if(seen.has(key))return false;seen.add(key);return true;});
    }
  }
  addReviews(5,[1,2,3,4]);addReviews(9,[6,7,8]);addReviews(14,[10,11,12,13]);addReviews(18,[15,16,17]);
  addBookReviews(5,[1,2,3,4]);addBookReviews(9,[6,7,8]);addBookReviews(14,[10,11,12,13]);addBookReviews(18,[15,16,17]);

  // Each word unit: vocabulary, listen, say, then a spoken chant (voice only, no instruments).
  const chants={1:['Hello, hello!','Hello, Tala!','Goodbye, goodbye!','Goodbye, Sami!'],2:['Bread and cheese,','Bread and cheese,','One, two, three,','Eat with me!'],3:['Cat, cat, dog, dog,','Rabbit, goat, and lion!'],4:['Head and hand,','Nose and face,','Leg and finger,','Mouth in place!'],6:['Book and bag,','Pencil and desk,','Stand up, sit down,','Now we rest!'],7:['Mum and Dad,','Sister, brother,','Baby and me,','We love each other!'],8:['Water, milk,','Tea for me,','Apple juice,','One, two, three!'],10:['Ball and doll,','Kite and yo-yo,','Where’s my ball?','Here! There!'],11:['Car and bus,','Bike and van,','How many taxis?','Five taxis!'],12:['Red and green,','Blue and white,','Yellow and black,','What colour? Bright!'],13:['T-shirt, shoes,','Shorts and jeans,','A red skirt,','Blue jeans!'],15:['Bed and table,','Chair and box,','Window, door,','In, on, under!'],16:['Orange, lemon,','Grape and fig,','Apple, olive,','Very big!'],17:['Stand up!','Sit down!','Jump up and down!','This is my friend!']};
  for(const u of units){
    const n=+u.id.split('u')[1];if([5,9,14,18].includes(n))continue;
    const words=[...new Map(u.lessons.flatMap(l=>l.steps).filter(s=>s.sayLang==='en'&&/^[A-Za-z’' -]+$/.test(s.say||'')&&s.say.split(' ').length<=2).map(s=>[s.say,s])).values()];
    if(words.length>=3){
      const listenTasks=words.slice(0,4).map((w,i)=>{const others=words.filter(x=>x!==w).slice(i%2,i%2+2);const opt=x=>({label:x.say,scene:x.scene,say:x.say,sayLang:'en'});return {prompt:'أستمع، وأختار الصورة.',listen:true,say:w.say,sayLang:'en',...place(opt(w),others.map(opt)),explain:w.text};});
      u.lessons.push({id:u.id+'-listen',title:'أستمع وأختار',book:u.book,page:u.page,goal:'أسمع الكلمة، وأختار صورتها.',steps:words.slice(0,4).map(w=>({...w})),tasks:listenTasks});
      u.lessons.push({id:u.id+'-say',title:'أسمع وأقول',book:u.book,page:u.page,goal:'أسمع، ثم أقول بصوت واضح.',speaking:true,
        steps:words.slice(0,4).map(w=>({text:w.text+' — أقولها',scene:w.scene,say:w.say,sayLang:'en'})),
        tasks:[{prompt:'أقول الكلمة، ثم أختار صورتها.',scene:{type:'symbol',value:words[0].say},say:words[0].say,sayLang:'en',...place({label:words[0].say,scene:words[0].scene},[{label:words[1].say,scene:words[1].scene}]),explain:words[0].text}]});
    }
    if(chants[n]){const lines=chants[n];u.lessons.push({id:u.id+'-chant',title:'أنشودة بالكلام',book:u.book,page:u.page,goal:'أسمع الأنشودة، وأردّدها بصوتي.',chant:true,
      steps:lines.map(line=>({text:line,scene:look(line.split(/[ ,!?]/)[0]),say:line,sayLang:'en'})),
      tasks:[{prompt:'أستمع، وأختار السطر.',listen:true,say:lines[0],sayLang:'en',...place({label:lines[0]},[{label:lines.find(l=>l!==lines[0])},{label:lines.at(-1)!==lines[0]?lines.at(-1):lines[2]}]),explain:lines.join(' ')}]});}
  }
  // Classroom phrases (unit 6).
  const phrases=[['Stand up.','قف.','boy'],['Sit down.','اجلس.','chair'],['Open your book.','افتح كتابك.','book'],['Listen.','استمع.','ear'],['Look.','انظر.','eye']];
  getUnit(6).lessons.push({id:'en-u6-classroom-phrases',title:'كلمات الصف',book:'p1',page:34,goal:'أفهم ما يقوله المعلم.',
    steps:phrases.map(([en,ar,icon])=>({text:`${en} — ${ar}`,scene:picture(icon),say:en,sayLang:'en'})),
    tasks:phrases.slice(2).map(([en,ar,icon],i)=>({prompt:'أستمع، وأختار الصورة.',listen:true,say:en,sayLang:'en',...place({label:ar,scene:picture(icon)},phrases.filter(p=>p[0]!==en).slice(i,i+2).map(p=>({label:p[1],scene:picture(p[2])}))),explain:`${en} — ${ar}`}))});
  // New listening/speaking lessons get their own review IDs; old reviews keep their objectives.
  const isSkill=l=>/-(listen|say|chant|classroom-phrases)$/.test(l.id);
  for(const [number,sources] of [[5,[1,2,3,4]],[9,[6,7,8]],[14,[10,11,12,13]],[18,[15,16,17]]]){
    const pool=sources.flatMap(n=>getUnit(n).lessons.filter(isSkill).map(lesson=>({lesson,task:lesson.tasks[0]})));
    for(let start=0;start<pool.length;start+=4){
      const rows=pool.slice(start,start+4),L=supplement(number,'skills-review-'+(start/4+1),'أستمع وأراجع',rows.map(({task})=>({text:task.explain,...(task.scene?{scene:task.scene}:{}),say:task.say,sayLang:'en'})),rows.map(({task})=>({...task,choices:task.choices.map(c=>({...c}))})));
      L.reviewOf=rows.map(({lesson})=>lesson.id);
    }
  }
  const shortSteps={
    'en-u1-greeting-variants':[['Hi! — مرحبًا','Hi!'],['Bye! — إلى اللقاء','Bye!']],
    'en-u1-letter-pairs':[['A a — B b','A, a. B, b.'],['أرسم الحرف بإصبعي.','a, b']],
    'en-u7-l2':[['sister — أخت','sister'],['brother — أخ','brother']],
    'en-u7-family-talk':[['Who’s this? — من هذا؟','Who’s this?'],['This is my brother. — هذا أخي.','This is my brother.']],
    'en-u8-drink-talk':[['What’s this? It’s water. — إنه ماء.','What’s this? It’s water.'],['It’s milk. — إنه حليب.','It’s milk.']],
    'en-u12-colour-talk':[['What colour? Red. — أحمر','What colour? Red.'],['Blue. — أزرق','Blue.']],
    'en-u12-book-two-colours':[['Red and black. — أحمر وأسود','What colour? Red and black.'],['Blue and white. — أزرق وأبيض','Blue and white.']],
    'en-u15-bedroom-place':[['in — داخل، on — على، under — تحت','in, on, under'],['It’s under the box. — تحت الصندوق','It’s under the box.']],
    'en-u16-book-one-many':[['What’s this? It’s an orange.','What’s this? It’s an orange.'],['What are these? They’re oranges.','What are these? They’re oranges.']],
    'en-u16-book-size-comparison':[['big — كبير','big'],['very small — صغير جدًا','very small']],
    'en-u17-l1':[['This is my friend. — هذا صديقي.','This is my friend.'],['This is my friend.','This is my friend.']],
    'en-u17-friends-height':[['I’m short. He’s tall. — أنا قصير، هو طويل.','I’m short. He’s tall. She’s tall.'],['Jump up and down. — اقفز.','Jump up and down.']]
  };
  for(const l of units.flatMap(u=>u.lessons)){const o=shortSteps[l.id];if(o)o.forEach(([text,say],i)=>{if(l.steps[i])Object.assign(l.steps[i],{text,say,sayLang:'en'});});}
  for(const l of units.flatMap(u=>u.lessons))if(/-listen$|-say$/.test(l.id)&&l.id.startsWith('en-u7'))l.steps.forEach(st=>{st.text=st.text.replace(/ الإطار الأزرق.*?الأخضر\./,'');});
  // Every English word, sentence and option can be heard; Arabic text stays short.
  const latin=/[A-Za-z][A-Za-z’'.,!? -]*[A-Za-z.!?]|[A-Za-z]/g;
  const englishOf=text=>(String(text).match(latin)||[]).map(x=>x.trim()).filter(Boolean).join(' ');
  for(const l of units.flatMap(u=>u.lessons)){
    l.steps.forEach((st,i)=>{if(!st.say&&l.reviewOf&&l.tasks[i]){const c=l.tasks[i].choices[l.tasks[i].answer].label;const e=/[A-Za-z]/.test(c)?c:englishOf(l.tasks[i].prompt);if(e){st.text=e+' — '+st.text.split(/[.؛]/)[0];st.say=e;st.sayLang='en';}}});
    for(const st of l.steps){
      const original=st.text;st.text=String(st.text).replace(/\s*(أقولها|أقرأها|أقول العبارة|أستعين|أختار شيئًا|أجرب|أضع)[^.]*?(بمساعدة|مع) (شخص كبير|الكبير)[^.]*\.?/g,'').replace(/ بمساعدة شخص كبير| مع شخص كبير| مع الكبير/g,'').trim();
      const parts=st.text.split(/(?<=[\u0600-\u06ff][.!؟])\s+(?=[\u0600-\u06ff])/);if(parts.length>1&&/[A-Za-z]/.test(parts[0]))st.text=parts[0];
      if(!st.text)st.text=original.split(/[.،]/)[0];
      st.text=st.text.replace(/^([A-Za-z][^\u0600-\u06ff]*?) تعني: ([^.]+)\.?$/,'$1 — $2');
      if(!st.say){const en=englishOf(st.text);if(en){st.say=en;st.sayLang='en';}}
      if(st.text.length>45&&/[\u0600-\u06ff]/.test(st.text))st.text=st.text.split(/[.؛:]/)[0].slice(0,45);
    }
    for(const t of l.tasks){
      for(const c of t.choices)if(!c.say&&/[A-Za-z]/.test(c.label)){c.say=c.label;c.sayLang='en';}
      if(!t.say){const en=englishOf(t.prompt);if(en){t.say=en;t.sayLang='en';}}
    }
  }
  window.G1_COURSE={id:'english',title:'اللغة الإنجليزية',key:'bustan_g1_english_v1',books:[{id:'p1',title:'English for Palestine 1A',url:'https://elearn.azureedge.net/Books/c1/en1-p1.pdf'},{id:'p2',title:'English for Palestine 1B',url:'https://elearn.azureedge.net/Books/c1/en1-p2.pdf'}],sourceNote:'أنشطة أصلية قصيرة لدعم مفردات English for Palestine بجزأيه. أرقام بدء الوحدات من الفهرس، والأنشطة الإضافية تحيل إلى صفحات الكتاب التي روجعت. هذه الأنشطة لا تنقل تمارين الكتاب ولا تمثل تغطية كاملة لجميع الفترات ومهارات الاستماع والمحادثة والكتابة. يمكن لشخص كبير قراءة الكلمة للطفل؛ لا توجد تسجيلات صوتية جديدة ضمن هذه الإضافة.',units,foundations:[greeting('en-foundation','أبدأ بتحية','p1',4,false)]};
  for(const lesson of [...window.G1_COURSE.units.flatMap(unit=>unit.lessons),...window.G1_COURSE.foundations]){
    lesson.referenceKind||='unit-start';
    lesson.referenceLabel||='نشاط مساند للوحدة؛ مرجع بداية الوحدة:';
    if(lesson.id.includes('-book-'))lesson.referenceLabel='نشاط مساند؛ مرجع الكتاب:';
    if(lesson.referenceKind==='verified-pages'&&lesson.references?.[0])lesson.page=lesson.references[0].page;
  }
  // Third choice for any task still offering two: same script, same word count, not already present.
  {
    const C=window.G1_COURSE,all=C.units.flatMap(u=>u.lessons),labels=[...new Set(all.flatMap(l=>l.tasks.flatMap(t=>t.choices.map(c=>c.label))))];
    const kind=x=>(/[A-Za-z]/.test(x)?'en':'ar')+':'+x.trim().split(/\s+/).length+':'+(/[.?!]$/.test(x)?'s':'w')+':'+(x===x.toLowerCase()?'l':'u');
    all.forEach((l,li)=>l.tasks.forEach((t,ti)=>{
      if(t.choices.length!==2||t.choices.some(c=>c.scene))return;
      const right=t.choices[t.answer].label,have=new Set(t.choices.map(c=>c.label.toLowerCase()));
      const cands=labels.filter(x=>kind(x)===kind(right)&&!have.has(x.toLowerCase())&&x.length>1);
      if(!cands.length)return;
      const pick=cands[(li*7+ti*3)%cands.length],c={label:pick};
      if(/[A-Za-z]/.test(pick)){c.say=pick;c.sayLang='en';}
      const at=(li+ti)%3;t.choices.splice(at,0,c);if(at<=t.answer)t.answer++;
    }));
  }
})();
