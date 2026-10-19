/* أنشطة أصلية داعمة؛ الإحالات إلى صفحات الكتاب المطبوع، لا إلى ترتيب ملف PDF. */
(()=>{
  'use strict';
  const symbol=(value,caption='')=>({type:'symbol',value,caption});
  const choice=label=>({label,scene:symbol(label)});
  const books=[
    {id:'p1',title:'لغتنا الجميلة - الجزء الأول',url:'https://elearn.azureedge.net/Books/c1/ar1-p1.pdf'},
    {id:'p2',title:'لغتنا الجميلة - الجزء الثاني',url:'https://elearn.azureedge.net/Books/c1/ar1-p2.pdf'}
  ];
  const letters1=[
    ['ر','الراء',17],['د','الدال',23],['ب','الباء',29],
    ['م','الميم',39],['ن','النون',45],['س','السين',53],
    ['ز','الزاي',65],['ح','الحاء',73],['ل','اللام',81],
    ['ت','التاء',93],['ج','الجيم',103],['ف','الفاء',113],
    ['ع','العين',125],['ش','الشين',133],['ص','الصاد',141],
    ['ق','القاف',153],['ث','الثاء',161],['خ','الخاء',169]
  ];
  const letters2=[['ذ','الذال',5],['غ','الغين',13],['ط','الطاء',21],['ك','الكاف',29],['ض','الضاد',37],['ه','الهاء',49],['و','الواو',57],['أ','الهمزة',65],['ظ','الظاء',73],['ي','الياء',81]];
  function letterUnit(row,index,term){
    const [letter,name,page]=row,book=term===1?'p1':'p2';
    const distractor=letter==='ر'?'د':letter==='د'?'ر':letter==='ب'?'ت':letter==='ن'?'ب':letter==='س'?'ش':letter==='ح'?'ج':letter==='ج'?'ح':letter==='ص'?'ض':letter==='ض'?'ص':letter==='ط'?'ظ':letter==='ظ'?'ط':letter==='ع'?'غ':letter==='غ'?'ع':letter==='ق'?'ف':letter==='ف'?'ق':letter==='ث'?'ت':letter==='خ'?'ح':letter==='ذ'?'د':letter==='و'?'ر':letter==='ه'?'م':letter==='أ'?'ا':letter==='ي'?'ب':'ل';
    const otherLetter=distractor===letter?'ب':distractor;
    const unitId=`ar-${book}-${index+1}`;
    const lessons=[{
      id:`${unitId}-letter`,title:`أتعرف حرف ${name}`,goal:'أتعرف شكل الحرف، ثم أميزه بين حرفين.',book,page,
      steps:[
        {text:`هذا حرف ${name}. أسمّيه بمساعدة شخص كبير.`,scene:symbol(letter,`حرف ${name}`)},
        {text:'أتأمل شكل الحرف. أرسمه بإصبعي في الهواء، ثم على ورقة.',scene:symbol(letter)}
      ],
      tasks:[
        {prompt:`أين حرف ${name}؟`,choices:[choice(letter),choice(otherLetter)],answer:0,explain:`هذا هو حرف ${name}: ${letter}.`},
        {prompt:'أختار الحرف المطابق للشكل.',scene:symbol(letter),choices:[choice(otherLetter),choice(letter)],answer:1,explain:'الشكلان متطابقان. أنتبه إلى النقاط وشكل الحرف.'}
      ]
    }];
    if(letter!=='أ'){
      const syllable=`${letter}َا`,other=`${otherLetter}َا`;
      lessons.push({id:`${unitId}-syllable`,title:'أقرأ مقطعًا',goal:'أربط الحرف بالألف، وأقرأ المقطع مع شخص كبير.',book,page:page+3,steps:[
        {text:'ألاحظ الحرف مع الألف. أقرأ المقطع بمساعدة شخص كبير.',scene:symbol(syllable)},
        {text:'أقرأ ببطء، ثم أكتب المقطع على ورقة.',scene:symbol(syllable)}
      ],tasks:[
        {prompt:`أختار المقطع الذي يبدأ بحرف ${name}.`,choices:[choice(other),choice(syllable)],answer:1,explain:`المقطع ${syllable} يبدأ بحرف ${name}.`},
        {prompt:'أختار المقطع المطابق.',scene:symbol(syllable),choices:[choice(syllable),choice(other)],answer:0,explain:`نقرأ هذا المقطع: ${syllable}.`}
      ]});
    }
    return {id:unitId,title:`حرف ${name}`,term,book,page,lessons};
  }
  const prep={id:'ar-prep',title:'التهيئة',term:1,book:'p1',page:2,lessons:[{
    id:'ar-prep-match',title:'أنظر وأطابق',goal:'ألاحظ الصورة، وأختار الصورة المطابقة.',book:'p1',page:2,
    steps:[{text:'أنظر إلى الصورة. أقول اسمها بمساعدة شخص كبير.',scene:{type:'items',icons:['book']}},{text:'أبحث عن الصورة نفسها. أبدأ بنشاط قصير، وأستريح حين أحتاج.',scene:{type:'items',icons:['bag']}}],
    tasks:[{prompt:'أختار الصورة المطابقة.',scene:{type:'items',icons:['book']},choices:[{label:'كتاب',scene:{type:'items',icons:['book']}},{label:'كرة',scene:{type:'items',icons:['ball']}}],answer:0,explain:'كتاب مع كتاب: الصورتان متطابقتان.'},{prompt:'أختار الصورة المطابقة.',scene:{type:'items',icons:['bag']},choices:[{label:'قلم',scene:{type:'items',icons:['pen']}},{label:'حقيبة',scene:{type:'items',icons:['bag']}}],answer:1,explain:'هذه حقيبة، مثل الصورة التي رأيناها.'}]
  }]};
  function revision(id,term,page,letters){
    const book=term===1?'p1':'p2';
    return {id,title:'المراجعة',term,book,page,lessons:[{id:`${id}-lesson`,title:'أراجع الحروف',book,page,goal:'أميز الحروف التي تعلمتها.',steps:[{text:'أسمّي هذه الحروف بمساعدة شخص كبير.',scene:symbol(letters.join('  '))}],tasks:letters.slice(0,2).map((letter,i)=>({prompt:'أختار الحرف المطابق.',scene:symbol(letter),choices:[choice(letters[(i+1)%letters.length]),choice(letter)],answer:1,explain:`الحرف المطابق هو: ${letter}.`}))}]};
  }
  const units=[prep];
  const revisions1={2:36,5:61,8:90,11:122,14:150,17:179};
  letters1.forEach((row,i)=>{units.push(letterUnit(row,i,1));if(revisions1[i])units.push(revision(`ar-p1-review-${i}`,1,revisions1[i],letters1.slice(i-2,i+1).map(x=>x[0])));});
  letters2.forEach((row,i)=>{units.push(letterUnit(row,i,2));if(i===4||i===9)units.push(revision(`ar-p2-review-${i}`,2,i===4?45:90,letters2.slice(i-4,i+1).map(x=>x[0])));});
  function storyUnit(id,title,page,steps,tasks){
    return {id,title,term:2,book:'p2',page,lessons:[{id:`${id}-reading`,title:'أقرأ وأفهم',goal:'أفهم حدثًا قصيرًا من الدرس مع شخص كبير.',book:'p2',page:page+3,steps,tasks}]};
  }
  units.push(
    storyUnit('ar-help','نساعد الكبير',93,[
      {text:'قدّم ثابت وختام العون لرجل مسنّ يحمل الخضار.',scene:{type:'items',icons:['boy','girl','basket']}},
      {text:'حملت ختام السلة، وساعد ثابت الرجل على السير.',scene:{type:'items',icons:['hand','basket']}}
    ],[
      {prompt:'ماذا حملت ختام؟',choices:[{label:'سلة خضار',scene:{type:'items',icons:['basket']}},{label:'كرة',scene:{type:'items',icons:['ball']}}],answer:0,explain:'حملت ختام سلة الخضار.'},
      {prompt:'أي تصرف نتعلمه؟',choices:[{label:'ترك من يحتاج إلى مساعدة.'},{label:'مساعدة الكبير باحترام.'}],answer:1,explain:'نتعلم مساعدة الكبير واحترامه.'}
    ]),
    storyUnit('ar-country','وطني أجمل',101,[
      {text:'يسكن عصفور صغير في شجرة زيتون.',scene:{type:'items',icons:['bird','tree']}},
      {text:'عُرض عليه عش أوسع، لكنه اختار البقاء في وطنه.',scene:{type:'items',icons:['nest','leaf']}}
    ],[
      {prompt:'أين كان يعيش العصفور الصغير؟',choices:[{label:'في شجرة زيتون',scene:{type:'items',icons:['tree']}},{label:'في سيارة',scene:{type:'items',icons:['car']}}],answer:0,explain:'كان عشه في شجرة زيتون.'},
      {prompt:'ماذا اختار العصفور؟',choices:[{label:'البقاء في وطنه.'},{label:'ترك وطنه.'}],answer:0,explain:'أحب العصفور وطنه واختار البقاء فيه.'}
    ]),
    storyUnit('ar-water','الماء',109,[
      {text:'احتاج ظافر إلى الماء، وعرف أن ترك الصنبور مفتوحًا يهدره.',scene:{type:'items',icons:['tap','water']}},
      {text:'قرر أن يحافظ على الماء وألا يسرف فيه.',scene:{type:'items',icons:['water','hand']}}
    ],[
      {prompt:'ماذا احتاج ظافر ليشرب؟',choices:[{label:'الماء',scene:{type:'items',icons:['water']}},{label:'كتابًا',scene:{type:'items',icons:['book']}}],answer:0,explain:'كان ظافر يشعر بالعطش واحتاج إلى الماء.'},
      {prompt:'كيف أحافظ على الماء؟',choices:[{label:'أترك الصنبور مفتوحًا.'},{label:'أغلق الصنبور بعد الاستعمال.'}],answer:1,explain:'أغلق الصنبور، وأستعمل حاجتي من الماء.'}
    ]),
    storyUnit('ar-butterfly','الفراشة والنحلة',117,[
      {text:'شاهدت فراشة نحلة تزور الأزهار، فسألتها عن عملها.',scene:{type:'items',icons:['butterfly','bee','flower']}},
      {text:'نتحدث مع شخص كبير عن النحلة، ثم نقرأ الدرس من الكتاب.',scene:{type:'items',icons:['bee','book']}}
    ],[
      {prompt:'من التقت الفراشة؟',choices:[{label:'نحلة',scene:{type:'items',icons:['bee']}},{label:'قطة',scene:{type:'items',icons:['cat']}}],answer:0,explain:'التقت الفراشة نحلة بين الأزهار.'},
      {prompt:'أين كانت النحلة تنتقل؟',choices:[{label:'بين الأزهار',scene:{type:'items',icons:['flower','flower']}},{label:'بين السيارات',scene:{type:'items',icons:['car','car']}}],answer:0,explain:'كانت تنتقل من زهرة إلى أخرى.'}
    ]),
    storyUnit('ar-monkey','القرد الطماع',125,[
      {text:'وجد القرد خوخة، ثم تركها ليأخذ موزة.',scene:{type:'items',icons:['monkey','peach','banana']}},
      {text:'ترك طعامه وركض خلف أرنب، فلم يمسكه، وعاد بلا طعام.',scene:{type:'items',icons:['monkey','rabbit']}}
    ],[
      {prompt:'أي ثمرة وجدها القرد أولًا؟',choices:[{label:'خوخة',scene:{type:'items',icons:['peach']}},{label:'موزة',scene:{type:'items',icons:['banana']}}],answer:0,explain:'وجد خوخة أولًا، ثم استبدلها بموزة.'},
      {prompt:'كيف عاد القرد إلى البيت؟',choices:[{label:'معه الأرنب.'},{label:'جائعًا بلا طعام.'}],answer:1,explain:'لم يمسك الأرنب، وعاد جائعًا.'}
    ])
  );
  window.G1_COURSE={id:'arabic',title:'لغتنا الجميلة',key:'bustan_g1_arabic_v1',books,sourceNote:'أنشطة قصيرة أصلية داعمة للحروف والمقاطع والفهم. ترتيب الدروس وإحالات الصفحات من كتاب لغتنا الجميلة بجزأيه المنشور في البوابة التعليمية الفلسطينية. ملخصات القصص صياغة تعليمية مختصرة، وليست نصوص القراءة الأصلية. لا تمثل الأنشطة تغطية كاملة للاستماع والمحادثة والقراءة والكتابة. تُقرأ التعليمات مع شخص كبير عند الحاجة.',units,foundations:[{...prep.lessons[0],id:'ar-foundation-match'}]};
})();
