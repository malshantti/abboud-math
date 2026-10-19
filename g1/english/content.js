/* Original short activities, aligned to the official book contents; not reproduced book exercises. */
(()=>{
  'use strict';
  const sym=(value,caption='')=>({type:'symbol',value,caption});
  const picture=(icon,caption='')=>({type:'items',icons:[icon],caption});
  const sceneFor=entry=>entry[2]&&typeof entry[2]==='object'?{...entry[2],caption:entry[1]}:entry[2]?picture(entry[2],entry[1]):sym(entry[0],entry[1]);
  const imageOnly=entry=>{const scene=sceneFor(entry);delete scene.caption;return scene;};
  const option=entry=>({label:entry[1],scene:imageOnly(entry)});
  function vocabulary(id,title,book,page,entries){
    const [first,second]=entries;
    return {id,title,book,page,goal:'أتعرف كلمتين مع صورتيهما، ثم أختار بهدوء.',steps:entries.map(entry=>({text:`${entry[0]} تعني: ${entry[1]}. أقولها بمساعدة شخص كبير.`,scene:sceneFor(entry)})),tasks:[
      {prompt:`أختار الصورة التي تدل على: ${first[0]}`,choices:[option(second),option(first)],answer:1,explain:`${first[0]} تعني ${first[1]}.`},
      {prompt:'أختار الكلمة المناسبة للصورة.',scene:imageOnly(second),choices:[{label:second[0]},{label:first[0]}],answer:0,explain:`الكلمة المناسبة هي ${second[0]}.`}
    ]};
  }
  function wordsUnit(number,title,term,page,pairs){
    const book=term===1?'p1':'p2',id=`en-u${number}`;
    return {id,title,term,book,page,lessons:pairs.map((entries,i)=>vocabulary(`${id}-l${i+1}`,i===0?'أتعرف الكلمات':'ألعب بالكلمات',book,page,entries))};
  }
  const greeting=(id,title,book,page,morning)=>({id,title,book,page,goal:'أختار التحية المناسبة مع مساعدة شخص كبير.',steps:[
    {text:morning?'أبدأ الصباح بتحية: Good morning.':'عندما ألتقي صديقي أقول: Hello!',scene:picture(morning?'sun':'boy')},
    {text:morning?'بعد الظهر أقول: Good afternoon.':'عندما أغادر أقول: Goodbye!',scene:picture('girl')}
  ],tasks:[
    {prompt:morning?'ما تحية الصباح؟':'كيف أحيّي صديقي عند اللقاء؟',scene:picture(morning?'sun':'boy'),choices:[{label:morning?'Good morning':'Hello'},{label:morning?'Good afternoon':'Goodbye'}],answer:0,explain:morning?'Good morning تحية الصباح.':'Hello تحية نقولها عند اللقاء.'},
    {prompt:morning?'ما التحية بعد الظهر؟':'ماذا أقول عند المغادرة؟',choices:[{label:morning?'Good morning':'Hello'},{label:morning?'Good afternoon':'Goodbye'}],answer:1,explain:morning?'Good afternoon تحية نقولها بعد الظهر.':'Goodbye نقولها عند المغادرة.'}
  ]});
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
    wordsUnit(13,'My clothes',2,22,[[['t-shirt','قميص قصير الكمين','shirt'],['shoes','حذاء','shoes']],[['dress','فستان','dress'],['jeans','بنطال جينز','jeans']]]),
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
  window.G1_COURSE={id:'english',title:'اللغة الإنجليزية',key:'bustan_g1_english_v1',books:[{id:'p1',title:'English for Palestine 1A',url:'https://elearn.azureedge.net/Books/c1/en1-p1.pdf'},{id:'p2',title:'English for Palestine 1B',url:'https://elearn.azureedge.net/Books/c1/en1-p2.pdf'}],sourceNote:'أنشطة أصلية قصيرة لدعم مفردات English for Palestine بجزأيه. العناوين وترتيب الوحدات وأرقام الصفحات من فهارس الكتابين الرسميين. هذه الأنشطة لا تنقل تمارين الكتاب ولا تمثل تغطية كاملة لجميع الفترات ومهارات الاستماع والمحادثة والكتابة. يمكن لشخص كبير قراءة الكلمة للطفل؛ لا توجد تسجيلات صوتية جديدة ضمن هذه الإضافة.',units,foundations:[greeting('en-foundation','أبدأ بتحية','p1',4,false)]};
})();
