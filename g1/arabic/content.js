/* أنشطة أصلية داعمة؛ الإحالات إلى صفحات الكتاب المطبوع، لا إلى ترتيب ملف PDF. */
(()=>{
  'use strict';
  const symbol=(value,caption='')=>({type:'symbol',value,caption});
  const choice=label=>({label,scene:symbol(label)});
  const books=[
    {id:'p1',title:'لغتنا الجميلة - الجزء الأول',pdfOffset:4,url:'https://elearn.azureedge.net/Books/c1/ar1-p1.pdf'},
    {id:'p2',title:'لغتنا الجميلة - الجزء الثاني',pdfOffset:4,url:'https://elearn.azureedge.net/Books/c1/ar1-p2.pdf'}
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
  // أمثلة دعم أصلية؛ أشكال الاتصال لا تضيف وصلة بعد الحرف غير المتصل.
  const support={
    'ر':[['ر','ـر'],'رَمْلٌ','هَذَا رَمْلٌ.'],
    'د':[['د','ـد'],'دَارٌ','هَذِهِ دَارٌ.'],
    'ب':[['ب','بـ','ـبـ','ـب'],'بَابٌ','هَذَا بَابٌ.'],
    'م':[['م','مـ','ـمـ','ـم'],'مَوْزٌ','هَذَا مَوْزٌ.'],
    'ن':[['ن','نـ','ـنـ','ـن'],'نُورٌ','هَذَا نُورٌ.'],
    'س':[['س','سـ','ـسـ','ـس'],'سَمَكٌ','هَذَا سَمَكٌ.'],
    'ز':[['ز','ـز'],'زَيْتُونٌ','هَذَا زَيْتُونٌ.'],
    'ح':[['ح','حـ','ـحـ','ـح'],'حَلِيبٌ','هَذَا حَلِيبٌ.'],
    'ل':[['ل','لـ','ـلـ','ـل'],'لَيْمُونٌ','هَذَا لَيْمُونٌ.'],
    'ت':[['ت','تـ','ـتـ','ـت'],'تَمْرٌ','هَذَا تَمْرٌ.'],
    'ج':[['ج','جـ','ـجـ','ـج'],'جَمَلٌ','هَذَا جَمَلٌ.'],
    'ف':[['ف','فـ','ـفـ','ـف'],'فِيلٌ','هَذَا فِيلٌ.'],
    'ع':[['ع','عـ','ـعـ','ـع'],'عَيْنٌ','هَذِهِ عَيْنٌ.'],
    'ش':[['ش','شـ','ـشـ','ـش'],'شَمْسٌ','هَذِهِ شَمْسٌ.'],
    'ص':[['ص','صـ','ـصـ','ـص'],'صَقْرٌ','هَذَا صَقْرٌ.'],
    'ق':[['ق','قـ','ـقـ','ـق'],'قَلَمٌ','هَذَا قَلَمٌ.'],
    'ث':[['ث','ثـ','ـثـ','ـث'],'ثَوْبٌ','هَذَا ثَوْبٌ.'],
    'خ':[['خ','خـ','ـخـ','ـخ'],'خُبْزٌ','هَذَا خُبْزٌ.'],
    'ذ':[['ذ','ـذ'],'ذُرَةٌ','هَذِهِ ذُرَةٌ.'],
    'غ':[['غ','غـ','ـغـ','ـغ'],'غُرَابٌ','هَذَا غُرَابٌ.'],
    'ط':[['ط','طـ','ـطـ','ـط'],'طَائِرٌ','هَذَا طَائِرٌ.'],
    'ك':[['ك','كـ','ـكـ','ـك'],'كَأْسٌ','هَذِهِ كَأْسٌ.'],
    'ض':[['ض','ضـ','ـضـ','ـض'],'ضِرْسٌ','هَذَا ضِرْسٌ.'],
    'ه':[['ه','هـ','ـهـ','ـه'],'هِلَالٌ','هَذَا هِلَالٌ.'],
    'و':[['و','ـو'],'وَرْدَةٌ','هَذِهِ وَرْدَةٌ.'],
    'أ':[['أ','إ','ء'],'أَسَدٌ','هَذَا أَسَدٌ.'],
    'ظ':[['ظ','ظـ','ـظـ','ـظ'],'ظِلٌّ','هَذَا ظِلٌّ.'],
    'ي':[['ي','يـ','ـيـ','ـي'],'يَدٌ','هَذِهِ يَدٌ.']
  };
  const practice=(word,sentence)=>[
    {title:'أقرأ مع الكبير',text:`أقرأ: ${word} ثُمَّ ${sentence} يساعدني الكبير في الأصوات التي لم أتعلمها بعد؛ هذه أمثلة دعم جديدة.`},
    {title:'أكتب على ورقة',text:`أنظر إلى ${word} وأنسخها، وألاحظ موضع الحرف واتجاهه مع الكبير.`},
    {title:'أسمع وأكتب',text:`يقرأ الكبير الكلمة ${word}، ثم يحجبها. أحاول كتابتها وأقارن بالنموذج معه. هذا تدريب شفهي وورقي لا يصححه الموقع.`}
  ];
  function letterUnit(row,index,term){
    const [letter,name,page]=row,book=term===1?'p1':'p2';
    const distractor=letter==='ر'?'د':letter==='د'?'ر':letter==='ب'?'ت':letter==='ن'?'ب':letter==='س'?'ش':letter==='ح'?'ج':letter==='ج'?'ح':letter==='ص'?'ض':letter==='ض'?'ص':letter==='ط'?'ظ':letter==='ظ'?'ط':letter==='ع'?'غ':letter==='غ'?'ع':letter==='ق'?'ف':letter==='ف'?'ق':letter==='ث'?'ت':letter==='خ'?'ح':letter==='ذ'?'د':letter==='و'?'ر':letter==='ه'?'م':letter==='أ'?'ا':letter==='ي'?'ب':'ل';
    const otherLetter=distractor===letter?'ب':distractor;
    const unitId=`ar-${book}-${index+1}`,[forms,word,sentence]=support[letter];
    const lessons=[{
      id:`${unitId}-letter`,title:`أتعرف حرف ${name}`,goal:'أتعرف شكل الحرف، ثم أميزه بين حرفين.',book,page,
      steps:[
        {text:`هذا حرف ${name}. أسمّيه بمساعدة شخص كبير.`,scene:symbol(letter,`حرف ${name}`)},
        {text:'أتأمل شكل الحرف. أرسمه بإصبعي في الهواء، ثم على ورقة.',scene:symbol(letter)},
        {text:letter==='أ'?'ألاحظ الهمزة فوق الألف وتحتها، وعلى السطر. أبحث عنها مع الكبير في كلمات صفحة ٦٨.':'قد يتغير شكل الحرف عندما يتصل بما قبله أو بما بعده. ألاحظ الأشكال مع الكبير، ولا أضيف وصلة لا يقبلها الحرف.',scene:symbol(forms.join('  '))}
      ],
      tasks:[
        {prompt:`أين حرف ${name}؟`,choices:[choice(letter),choice(otherLetter)],answer:0,explain:`هذا هو حرف ${name}: ${letter}.`},
        {prompt:'أختار الحرف المطابق للشكل.',scene:symbol(letter),choices:[choice(otherLetter),choice(letter)],answer:1,explain:'الشكلان متطابقان. أنتبه إلى النقاط وشكل الحرف.'}
      ]
    }];
    const long=letter==='أ'?[]:[`${letter}َا`,`${letter}ُو`,`${letter}ِي`];
    const short=letter==='أ'?['أَ','أُ','إِ']:[`${letter}َ`,`${letter}ُ`,`${letter}ِ`];
    const syllable=long[0],other=letter==='أ'?'أَ':`${otherLetter}َا`;
    if(letter!=='أ')lessons.push({id:`${unitId}-syllable`,title:'أقرأ مقطعًا بالألف',goal:'أربط الحرف بالألف، وأقرأ المقطع مع شخص كبير.',book,page:page+3,
      steps:[{text:'ألاحظ الحرف مع الألف. أقرأ المقطع بمساعدة شخص كبير.',scene:symbol(syllable)},{text:'أقرأ ببطء، ثم أكتب المقطع على ورقة.',scene:symbol(syllable)}],
      tasks:[{prompt:`أختار المقطع الذي يبدأ بحرف ${name}.`,choices:[choice(other),choice(syllable)],answer:1,explain:`المقطع ${syllable} يبدأ بحرف ${name}.`},{prompt:'أختار المقطع المطابق.',scene:symbol(syllable),choices:[choice(syllable),choice(other)],answer:0,explain:`نقرأ هذا المقطع: ${syllable}.`}]});
    lessons.push({id:`${unitId}-phonics`,title:letter==='أ'?'أقرأ الهمزة بحركاتها':'أقارن مقاطع المدّ والحركات',goal:'أقرأ مع الكبير؛ أبدأ بالمدّ، ثم أقارن الحركات القصيرة.',book,page:page+3,referenceLabel:'تدريب دعم؛ أراجع صفحة الحرف ومقاطعه في الكتاب.',
      phonics:{letter,forms,long,short},steps:letter==='أ'?[
        {text:'ألاحظ الهمزة مع الفتحة والضمة والكسرة. يقرأ الكبير، ثم أحاول بعده.',scene:symbol(short.join('  '))},
        {text:'أبحث عن الهمزة في هذه الكلمات، وأقرأ مع الكبير.',scene:symbol('أَمْجَدُ  أُمٌّ  إِسْرَاءُ  مَاءٌ')}
      ]:[
        ...long.map((value,i)=>({text:['ألاحظ المدّ بالألف. يقرأ الكبير المقطع، ثم أحاول بعده.','ألاحظ المدّ بالواو. أطيل الصوت بعد الضمة بمساعدة الكبير.','ألاحظ المدّ بالياء. أطيل الصوت بعد الكسرة بمساعدة الكبير.'][i],scene:symbol(value)})),
        {text:'أقارن الآن الحركات القصيرة: الفتحة، ثم الضمة، ثم الكسرة. لا أضيف حرف مدّ.',scene:symbol(short.join('  '))}
      ],tasks:letter==='أ'?[
        {prompt:'أختار الهمزة التي تحت الألف.',choices:[choice('إِ'),choice('أَ')],answer:0,explain:'إِ: الهمزة تحت الألف، ومعها الكسرة.'},
        {prompt:'أختار الهمزة على السطر.',choices:[choice('أ'),choice('ء')],answer:1,explain:'هذا شكل الهمزة على السطر: ء.'},
        {prompt:'أختار الشكل المطابق.',scene:symbol('أُ'),choices:[choice('إِ'),choice('أُ')],answer:1,explain:'أُ: همزة مع الضمة.'}
      ]:[
        {prompt:'أختار المقطع المطابق للمدّ بالألف.',scene:symbol(syllable),choices:[choice(other),choice(syllable)],answer:1,explain:`نقرأ هذا المقطع مع الكبير: ${syllable}.`},
        {prompt:'أختار المقطع المطابق للمدّ بالواو.',scene:symbol(long[1]),choices:[choice(long[1]),choice(long[2])],answer:0,explain:`المقطع المطابق: ${long[1]}.`},
        {prompt:'أختار المقطع المطابق للمدّ بالياء.',scene:symbol(long[2]),choices:[choice(long[0]),choice(long[2])],answer:1,explain:`المقطع المطابق: ${long[2]}.`},
        {prompt:'أختار الحرف مع الكسرة، دون حرف مدّ.',choices:[choice(short[2]),choice(long[2])],answer:0,explain:`${short[2]} حركة قصيرة، و${long[2]} مقطع ممدود.`}
      ]});
    const otherWord=letter==='ق'?'ثَوْبٌ':'قَلَمٌ';
    lessons.push({id:`${unitId}-word`,title:'الحرف في كلمة وجملة',goal:'ألاحظ اتصال الحرف، وأقرأ كلمة وجملة دعم مع الكبير.',book,page:page+3,
      referenceLabel:'أمثلة دعم أصلية؛ لا تحل محل كلمات درس الكتاب.',guidedPractice:practice(word,sentence),
      steps:[{text:'أبحث عن حرف الدرس في الكلمة. يساعدني الكبير في بقية الحروف.',scene:symbol(word)},{text:'أقرأ جملة قصيرة مع الكبير، ثم أقول جملة من عندي.',scene:symbol(sentence)}],
      tasks:[{prompt:`أختار الكلمة التي تبدأ بحرف ${name}؛ ثم أقرؤها مع الكبير.`,choices:[choice(word),choice(otherWord)],answer:0,explain:`تبدأ ${word} بحرف ${name}.`},{prompt:'أختار الجملة التي تحتوي الكلمة السابقة.',scene:symbol(word),choices:[{label:'هَذَا قَلَمٌ.'},{label:sentence}],answer:1,explain:`الجملة: ${sentence}`},{prompt:'أختار شكل الحرف المطابق، وألاحظ الوصلة مع الكبير.',scene:symbol(forms.at(-1)),choices:[choice(forms.at(-1)),choice(otherLetter)],answer:0,explain:`هذا شكل من أشكال حرف ${name}: ${forms.at(-1)}.`}]
    });
    if(letter==='ق')lessons.at(-1).tasks[1].choices[0].label='هَذَا ثَوْبٌ.';
    return {id:unitId,title:`حرف ${name}`,term,book,page,lessons};
  }
  const prep={id:'ar-prep',title:'التهيئة',term:1,book:'p1',page:2,lessons:[{
    id:'ar-prep-match',title:'أنظر وأطابق',goal:'ألاحظ الصورة، وأختار الصورة المطابقة.',book:'p1',page:2,
    steps:[{text:'أنظر إلى الصورة. أقول اسمها بمساعدة شخص كبير.',scene:{type:'items',icons:['book']}},{text:'أبحث عن الصورة نفسها. أبدأ بنشاط قصير، وأستريح حين أحتاج.',scene:{type:'items',icons:['bag']}}],
    tasks:[{prompt:'أختار الصورة المطابقة.',scene:{type:'items',icons:['book']},choices:[{label:'كتاب',scene:{type:'items',icons:['book']}},{label:'كرة',scene:{type:'items',icons:['ball']}}],answer:0,explain:'كتاب مع كتاب: الصورتان متطابقتان.'},{prompt:'أختار الصورة المطابقة.',scene:{type:'items',icons:['bag']},choices:[{label:'قلم',scene:{type:'items',icons:['pen']}},{label:'حقيبة',scene:{type:'items',icons:['bag']}}],answer:1,explain:'هذه حقيبة، مثل الصورة التي رأيناها.'}]
  }]};
  function revision(id,term,page,letters){
    const book=term===1?'p1':'p2';
    const task=(letter,i)=>({prompt:'أختار الحرف المطابق.',scene:symbol(letter),choices:[choice(letters[(i+1)%letters.length]),choice(letter)],answer:1,explain:`الحرف المطابق هو: ${letter}.`});
    return {id,title:'المراجعة',term,book,page,lessons:[
      {id:`${id}-lesson`,title:'أبدأ المراجعة بحرفين',book,page,reviewTargets:letters.slice(0,2),goal:'أميز الحرفين الأولين في مجموعة المراجعة.',steps:[{text:'أسمّي هذين الحرفين مع الكبير.',scene:symbol(letters.slice(0,2).join('  '))}],tasks:letters.slice(0,2).map(task)},
      {id:`${id}-all`,title:'أراجع كل الحروف',book,page,reviewTargets:letters,goal:'أراجع كل حرف، وأقرأ مقاطعه مع الكبير.',guidedPractice:[{title:'مراجعة شفهية وكتابية',text:'يقرأ الكبير كل حرف ومقاطع المدّ الثلاثة المناسبة له. أحاول بعده، ثم أنسخ كلمة من صفحة المراجعة وأقرأها. لا يسجّل الموقع تقييم هذه المهمة.'}],steps:[{text:'أسمّي كل هذه الحروف مع الكبير. لكل حرف سؤال؛ يمكنني الاستراحة ثم العودة.',scene:symbol(letters.join('  '))}],tasks:letters.map(task)}]};
  }
  const units=[prep];
  const revisions1={2:36,5:61,8:90,11:122,14:150,17:179};
  letters1.forEach((row,i)=>{units.push(letterUnit(row,i,1));if(revisions1[i])units.push(revision(`ar-p1-review-${i}`,1,revisions1[i],letters1.slice(i-2,i+1).map(x=>x[0])));});
  letters2.forEach((row,i)=>{units.push(letterUnit(row,i,2));if(i===4||i===9)units.push(revision(`ar-p2-review-${i}`,2,i===4?45:90,letters2.slice(i-4,i+1).map(x=>x[0])));});
  function storyUnit(id,title,page,steps,tasks){
    return {id,title,term:2,book:'p2',page,lessons:[{id:`${id}-reading`,title:'أقرأ وأفهم مع الكبير',goal:'أقرأ الدرس من الكتاب مع الكبير، ثم أجرب نشاط الدعم.',book:'p2',page:page+3,
      referenceLabel:'القراءة الأصلية في المصدر؛ المشاهد التالية نشاط دعم مختصر.',guidedPractice:[
        {title:'أقرأ نص الكتاب',text:'نفتح صفحة القراءة المحددة في المصدر. يقرأ الكبير أولًا، ثم أقرأ معه جملة قصيرة. الرابط يحتاج إلى الإنترنت؛ يمكن استعمال الكتاب الورقي.'},
        {title:'أحكي وأفكر',text:'أذكر الشخصيات، ثم ما حدث أولًا وبعد ذلك. أسأل: لماذا حدث ذلك؟ يساعدني الكبير في الرجوع إلى النص.'},
        {title:'أكتب وأقارن',text:'أختار مع الكبير كلمة من القراءة وأنسخها. يحجبها ويمليها عليّ، ثم نقارن بالنموذج. لا تُصحح الكتابة آليًا.'}
      ],steps:[{text:'هذه مشاهد دعم مختصرة، وليست نص القراءة الأصلي. نقرأ الدرس من المصدر مع الكبير، ثم نعود إلى هذه الأنشطة.',scene:{type:'items',icons:['book']}},...steps],tasks}]};
  }
  units.push(
    storyUnit('ar-help','نساعد الكبير',93,[
      {text:'رَأَى ثَابِتٌ وَخِتَامُ رَجُلًا كَبِيرَ السِّنِّ يَحْمِلُ سَلَّةَ خُضَارٍ.',scene:{type:'items',icons:['boy','girl','basket']}},
      {text:'حَمَلَتْ خِتَامُ السَّلَّةَ، وَسَاعَدَ ثَابِتٌ الرَّجُلَ عَلَى السَّيْرِ.',scene:{type:'items',icons:['hand','basket']}}
    ],[
      {prompt:'ماذا حملت ختام؟',choices:[{label:'سلة خضار',scene:{type:'items',icons:['basket']}},{label:'كرة',scene:{type:'items',icons:['ball']}}],answer:0,explain:'حملت ختام سلة الخضار.'},
      {prompt:'أي تصرف نتعلمه؟',choices:[{label:'ترك من يحتاج إلى مساعدة.'},{label:'مساعدة الكبير باحترام.'}],answer:1,explain:'نتعلم مساعدة الكبير واحترامه.'}
    ]),
    storyUnit('ar-country','وطني أجمل',101,[
      {text:'يَسْكُنُ عُصْفُورٌ صَغِيرٌ فِي شَجَرَةِ زَيْتُونٍ.',scene:{type:'items',icons:['bird','tree']}},
      {text:'عُرِضَ عَلَيْهِ عُشٌّ أَوْسَعُ، لَكِنَّهُ اخْتَارَ الْبَقَاءَ فِي وَطَنِهِ.',scene:{type:'items',icons:['nest','leaf']}}
    ],[
      {prompt:'أين كان يعيش العصفور الصغير؟',choices:[{label:'في شجرة زيتون',scene:{type:'items',icons:['tree']}},{label:'في سيارة',scene:{type:'items',icons:['car']}}],answer:0,explain:'كان عشه في شجرة زيتون.'},
      {prompt:'ماذا اختار العصفور؟',choices:[{label:'البقاء في وطنه.'},{label:'ترك وطنه.'}],answer:0,explain:'أحب العصفور وطنه واختار البقاء فيه.'}
    ]),
    storyUnit('ar-water','الماء',109,[
      {text:'عَطِشَ ظَافِرٌ، وَلَمْ يَجِدْ مَاءً لِيَشْرَبَ. عَرَفَ أَنَّ تَرْكَ الصُّنْبُورِ مَفْتُوحًا يُهْدِرُ الْمَاءَ.',scene:{type:'items',icons:['tap','water']}},
      {text:'قَرَّرَ أَنْ يُحَافِظَ عَلَى الْمَاءِ وَأَلَّا يُسْرِفَ فِيهِ.',scene:{type:'items',icons:['water','hand']}}
    ],[
      {prompt:'ماذا احتاج ظافر ليشرب؟',choices:[{label:'الماء',scene:{type:'items',icons:['water']}},{label:'كتابًا',scene:{type:'items',icons:['book']}}],answer:0,explain:'كان ظافر يشعر بالعطش واحتاج إلى الماء.'},
      {prompt:'كيف أحافظ على الماء؟',choices:[{label:'أترك الصنبور مفتوحًا.'},{label:'أغلق الصنبور بعد الاستعمال.'}],answer:1,explain:'أغلق الصنبور، وأستعمل حاجتي من الماء.'}
    ]),
    storyUnit('ar-butterfly','الفراشة والنحلة',117,[
      {text:'شَاهَدَتْ فَرَاشَةٌ نَحْلَةً بَيْنَ الْأَزْهَارِ، وَظَنَّتْ أَنَّهَا تُفْسِدُهَا.',scene:{type:'items',icons:['butterfly','bee','flower']}},
      {text:'بَيَّنَتِ النَّحْلَةُ أَنَّهَا تَجْمَعُ الرَّحِيقَ لِصُنْعِ الْعَسَلِ؛ فَهِيَ لَا تُفْسِدُ الْأَزْهَارَ.',scene:{type:'items',icons:['bee','flower']}}
    ],[
      {prompt:'من التقت الفراشة؟',choices:[{label:'نحلة',scene:{type:'items',icons:['bee']}},{label:'قطة',scene:{type:'items',icons:['cat']}}],answer:0,explain:'التقت الفراشة نحلة بين الأزهار.'},
      {prompt:'أين كانت النحلة تنتقل؟',choices:[{label:'بين الأزهار',scene:{type:'items',icons:['flower','flower']}},{label:'بين السيارات',scene:{type:'items',icons:['car','car']}}],answer:0,explain:'كانت تنتقل من زهرة إلى أخرى.'}
    ]),
    storyUnit('ar-monkey','القرد الطماع',125,[
      {text:'وَجَدَ الْقِرْدُ خَوْخَةً، ثُمَّ تَرَكَهَا لِيَأْخُذَ مَوْزَةً.',scene:{type:'items',icons:['monkey','peach','banana']}},
      {text:'تَرَكَ طَعَامَهُ وَرَكَضَ خَلْفَ أَرْنَبٍ، فَلَمْ يُمْسِكْهُ، وَعَادَ بِلَا طَعَامٍ.',scene:{type:'items',icons:['monkey','rabbit']}}
    ],[
      {prompt:'أي ثمرة وجدها القرد أولًا؟',choices:[{label:'خوخة',scene:{type:'items',icons:['peach']}},{label:'موزة',scene:{type:'items',icons:['banana']}}],answer:0,explain:'وجد خوخة أولًا، ثم استبدلها بموزة.'},
      {prompt:'كيف عاد القرد إلى البيت؟',choices:[{label:'معه الأرنب.'},{label:'جائعًا بلا طعام.'}],answer:1,explain:'لم يمسك الأرنب، وعاد جائعًا.'}
    ])
  );
  const causes={
    'ar-butterfly':{prompt:'لِمَاذَا تَجْمَعُ النَّحْلَةُ الرَّحِيقَ؟',choices:[{label:'لِتَصْنَعَ الْعَسَلَ.'},{label:'لِتُفْسِدَ الْأَزْهَارَ.'}],answer:0,explain:'تَجْمَعُ النَّحْلَةُ الرَّحِيقَ لِصُنْعِ الْعَسَلِ.'},
    'ar-help':{prompt:'لِمَاذَا حَمَلَتْ خِتَامُ السَّلَّةَ؟',choices:[{label:'لِتُخَفِّفَ الْحِمْلَ عَنِ الرَّجُلِ.'},{label:'لِتَلْعَبَ بِالسَّلَّةِ.'}],answer:0,explain:'سَاعَدَتْ خِتَامُ الرَّجُلَ كَبِيرَ السِّنِّ وَخَفَّفَتْ عَنْهُ الْحِمْلَ.'},
    'ar-country':{prompt:'لِمَاذَا اخْتَارَ الْعُصْفُورُ الْبَقَاءَ؟',choices:[{label:'لِأَنَّهُ يُحِبُّ وَطَنَهُ.'},{label:'لِأَنَّ الْعُشَّ الْآخَرَ صَغِيرٌ.'}],answer:0,explain:'اخْتَارَ الْبَقَاءَ لِحُبِّهِ وَطَنَهُ، رَغْمَ الْعُشِّ الْأَوْسَعِ.'},
    'ar-water':{prompt:'مَاذَا يَحْدُثُ إِذَا تَرَكْنَا الصُّنْبُورَ مَفْتُوحًا؟',choices:[{label:'نُحَافِظُ عَلَى الْمَاءِ.'},{label:'نَهْدِرُ الْمَاءَ.'}],answer:1,explain:'تَرْكُ الصُّنْبُورِ مَفْتُوحًا يُهْدِرُ الْمَاءَ؛ أُغْلِقُهُ بَعْدَ الِاسْتِعْمَالِ.'},
    'ar-monkey':{prompt:'لِمَاذَا عَادَ الْقِرْدُ جَائِعًا؟',choices:[{label:'لِأَنَّهُ تَرَكَ طَعَامَهُ وَلَمْ يُمْسِكِ الْأَرْنَبَ.'},{label:'لِأَنَّهُ أَكَلَ طَعَامَهُ كُلَّهُ.'}],answer:0,explain:'تَرَكَ طَعَامَهُ وَطَارَدَ الْأَرْنَبَ، فَفَقَدَ الطَّعَامَ وَلَمْ يَظْفَرْ بِالْأَرْنَبِ.'}
  };
  units.forEach(unit=>{if(causes[unit.id]){const reading=unit.lessons[0];unit.lessons.push({id:unit.id+'-cause',title:'أفهم السبب والنتيجة',book:reading.book,page:reading.page,goal:'أربط الحدث بسببه بعد القراءة مع الكبير.',referenceLabel:reading.referenceLabel,steps:reading.steps.slice(1),tasks:[causes[unit.id]]});}});
  window.G1_COURSE={id:'arabic',title:'لغتنا الجميلة',key:'bustan_g1_arabic_v1',books,traceGroups:[...letters1,...letters2].map(([letter,name])=>({label:'حرف '+name,forms:[...support[letter][0],...(letter==='أ'?['أَ','أُ','إِ']:[letter+'َ',letter+'ُ',letter+'ِ'])]})),sourceNote:'أنشطة قصيرة أصلية داعمة للحروف والمقاطع والفهم. ترتيب الدروس وإحالات الصفحات من كتاب لغتنا الجميلة بجزأيه المنشور في البوابة التعليمية الفلسطينية. ملخصات القصص صياغة تعليمية مختصرة، وليست نصوص القراءة الأصلية. لا تمثل الأنشطة تغطية كاملة للاستماع والمحادثة والقراءة والكتابة. تُقرأ التعليمات مع شخص كبير عند الحاجة.',units,foundations:[{...prep.lessons[0],id:'ar-foundation-match'}]};
})();
