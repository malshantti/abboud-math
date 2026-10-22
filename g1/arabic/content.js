/* أنشطة أصلية داعمة؛ الإحالات إلى صفحات الكتاب المطبوع. النص الظاهر للطفل قصير، وكل خطوة لها صوت. */
(()=>{
  'use strict';
  const symbol=(value,caption='')=>({type:'symbol',value,caption});
  const items=(...icons)=>({type:'items',icons});
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
  const spokenRaw={'ر':'الرَّاءُ','د':'الدَّالُ','ب':'الْبَاءُ','م':'الْمِيمُ','ن':'النُّونُ','س':'السِّينُ','ز':'الزَّايُ','ح':'الْحَاءُ','ل':'اللَّامُ','ت':'التَّاءُ','ج':'الْجِيمُ','ف':'الْفَاءُ','ع':'الْعَيْنُ','ش':'الشِّينُ','ص':'الصَّادُ','ق':'الْقَافُ','ث':'الثَّاءُ','خ':'الْخَاءُ','ذ':'الذَّالُ','غ':'الْغَيْنُ','ط':'الطَّاءُ','ك':'الْكَافُ','ض':'الضَّادُ','ه':'الْهَاءُ','و':'الْوَاوُ','أ':'الْهَمْزَةُ','ظ':'الظَّاءُ','ي':'الْيَاءُ'};
  const spoken=Object.fromEntries(Object.entries(spokenRaw).map(([k,v])=>[k,v.replace(/\u064f$/,'\u0650')]));
  // حروف متشابهة في الشكل أو الصوت؛ المشتّت دائمًا من مجموعة الحرف نفسه.
  const lookAlike={'ب':['ت','ث'],'ت':['ث','ب'],'ث':['ت','ب'],'ج':['ح','خ'],'ح':['ج','خ'],'خ':['ح','ج'],'ر':['ز','د'],'ز':['ر','ذ'],'د':['ذ','ر'],'ذ':['د','ز'],'س':['ش','ص'],'ش':['س','ص'],'ص':['ض','س'],'ض':['ص','ش'],'ط':['ظ','ص'],'ظ':['ط','ض'],'ع':['غ','ح'],'غ':['ع','خ'],'ف':['ق','غ'],'ق':['ف','غ'],'م':['ن','ب'],'ن':['ب','ت'],'ل':['ك','ن'],'ك':['ل','ق'],'ه':['م','ة'],'و':['ر','ز'],'أ':['إ','ء'],'ي':['ب','ن']};
  // كلمات من حروف تعلّمها الطفل حتى الدرس فقط. الجزء الأول: لا تنوين ولا شدة، والسكون بعد درس الحاء فقط.
  // [الكلمة، الأيقونة، الجملة، مقاطع الإملاء]
  const support={
    'ر':['رَا',null,'',['رَ','ا']],
    'د':['دَار','house','',['دَ','ا','ر']],
    'ب':['بَاب','door','بَاب دَار.',['بَ','ا','ب']],
    'م':['مَامَا','mum','دَار مَامَا.',['مَ','ا','مَ','ا']],
    'ن':['نَامَ',null,'نَامَ بَابَا.',['نَ','ا','مَ']],
    'س':['سَامِر','boy','رَسَمَ سَامِر.',['سَ','ا','مِ','ر']],
    'ز':['زَبِيب',null,'زَارَنَا مَازِن.',['زَ','بِي','ب']],
    'ح':['حَمَام','bird','نَامَ حَامِد.',['حَ','مَ','ا','م']],
    'ل':['لَيْمُون','lemon','نَزَلَ بِلَال.',['لَ','يْ','مُو','ن']],
    'ت':['تُوت',null,'نَزَلَتْ تَالَا.',['تُو','ت']],
    'ج':['جَمَل',null,'جَلَسَ جَمِيل.',['جَ','مَ','ل']],
    'ف':['فِيل','elephant','فَرِحَ فَادِي.',['فِي','ل']],
    'ع':['عَيْن','eye','عَادَ سَعِيد.',['عَ','يْ','ن']],
    'ش':['شَمْس','sun','شَرِبَ شَادِي.',['شَ','مْ','س']],
    'ص':['صُوص','hen','صَعِدَ صَالِح.',['صُو','ص']],
    'ق':['قَلَم','pen','رَسَمَ قَاسِم.',['قَ','لَ','م']],
    'ث':['ثَوْب','shirt','جَلَسَ ثَابِت.',['ثَ','وْ','ب']],
    'خ':['خُبْز','bread','خَرَجَ خَالِد.',['خُ','بْ','ز']],
    'ذ':['ذُرَة',null,'ذَهَبَ مُنْذِر.',['ذُ','رَ','ة']],
    'غ':['غُرَاب','bird','غَسَلَ غَازِي يَدَهُ.',['غُ','رَا','ب']],
    'ط':['طَمَاطِم',null,'طَبَخَ طَارِقٌ طَعَامًا.',['طَ','مَا','طِ','م']],
    'ك':['كِتَاب','book','كَتَبَ كَرِيمٌ.',['كِ','تَا','ب']],
    'ض':['ضِفْدَع',null,'ضَحِكَ ضِيَاءٌ.',['ضِ','فْ','دَ','ع']],
    'ه':['هِلَال',null,'هَذِهِ هَالَةُ.',['هِ','لَا','ل']],
    'و':['وَرْدَة','flower','وَقَفَ وَلِيدٌ.',['وَ','رْ','دَ','ة']],
    'أ':['أَرْنَب','rabbit','أَكَلَ أَحْمَدُ.',['أَ','رْ','نَ','ب']],
    'ظ':['ظَرْف',null,'ظَهَرَ الْقَمَرُ.',['ظَ','رْ','ف']],
    'ي':['يَد','hand','يَلْعَبُ يَاسِرٌ.',['يَ','د']]
  };
  const forms={'ر':['ر','ـر'],'د':['د','ـد'],'ز':['ز','ـز'],'ذ':['ذ','ـذ'],'و':['و','ـو'],'أ':['أ','إ','ء']};
  const formsOf=l=>forms[l]||[l,l+'ـ','ـ'+l+'ـ','ـ'+l];
  const firstLetter=t=>String(t).normalize('NFC').replace(/[\u064b-\u065f\u0670]/g,'')[0];
  // تنويع موضع الإجابة بثبات؛ لا نعتمد على الترتيب الظاهر.
  let turn=0;
  const ask=(prompt,correct,wrongs,explain,extra={})=>{const list=[].concat(wrongs),at=(turn++)%(list.length+1);list.splice(at,0,correct);return {prompt,choices:list.map(v=>typeof v==='string'?choice(v):v),answer:at,explain,...extra};};
  const listen=(say,correct,wrongs,explain,prompt='أَسْتَمِعُ، وَأَخْتَارُ.')=>ask(prompt,correct,wrongs,explain,{listen:true,say});
  const step=(text,scene,say)=>({text,scene,say:say||text});
  const practice=word=>[
    {title:'أكتب',text:'أنسخ «'+word+'» على ورقة.'},
    {title:'أسمع وأكتب',text:'يملي الكبير الكلمة، فأكتبها، ثم نقارن.'}
  ];
  function letterUnit(row,index,term){
    const [letter,name,page]=row,book=term===1?'p1':'p2',unitId=`ar-${book}-${index+1}`;
    const [like1,like2]=lookAlike[letter],[word,icon,sentence,parts]=support[letter],F=formsOf(letter),sound=letter==='أ'?'أَ':letter+'َ';
    const lessons=[];
    lessons.push({id:`${unitId}-letter-v2`,title:`حرف ${name}`,goal:'أعرف الحرف، وأسمع صوته.',book,page,
      steps:[step(`هذا حرف ${name}.`,symbol(letter),`هَذَا حَرْفُ ${spoken[letter]}. ${sound}`),step('أرسمه بإصبعي.',symbol(F.join('  ')),'أَرْسُمُ الْحَرْفَ بِإِصْبَعِي.')],
      tasks:[
        listen(sound,letter,[like1,like2],`صوت حرف ${name}: ${sound}`,'أَسْتَمِعُ، وَأَخْتَارُ الْحَرْفَ.'),
        ask('أختار الحرف نفسه.',letter,[like1],`الحرف نفسه: ${letter}. أنتبه إلى النقاط.`,{scene:symbol(letter),say:'أَخْتَارُ الْحَرْفَ نَفْسَهُ.'}),
        ask('أختار الحرف في آخر الكلمة.',F.at(-1),[formsOf(like1).at(-1)],`حرف ${name} في آخر الكلمة: ${F.at(-1)}`,{say:'أَخْتَارُ الْحَرْفَ فِي آخِرِ الْكَلِمَةِ.'})
      ]});
    const long=letter==='أ'?[]:letter==='ي'?['يَا','يُو']:letter==='و'?['وَا','وِي']:[`${letter}َا`,`${letter}ُو`,`${letter}ِي`];
    const short=letter==='أ'?['أَ','أُ','إِ']:[`${letter}َ`,`${letter}ُ`,`${letter}ِ`];
    const likeLong=v=>v.replace(letter,like1);
    lessons.push({id:`${unitId}-phonics-v2`,title:letter==='أ'?'الهمزة وحركاتها':'المدود والحركات',goal:'أقرأ الحرف مع الحركات والمدود.',book,page:page+3,phonics:{letter,forms:F,long,short},
      steps:[...(long.length?[step('أمدّ الصوت.',symbol(long.join('  ')),long.join('، '))]:[]),step('حركات قصيرة.',symbol(short.join('  ')),short.join('، '))],
      tasks:[
        ...long.map(v=>listen(v,v,[likeLong(v),...(long.length>1?[long.find(x=>x!==v)]:[])],'نقرأ: '+v,'أَسْتَمِعُ، وَأَخْتَارُ الْمَقْطَعَ.')),
        listen(short[2],short[2],letter==='أ'?[short[0],short[1]]:[long[long.length-1],short[0]],short[2]+' حركة قصيرة.','أَسْتَمِعُ، وَأَخْتَارُ.'),
        ...(letter==='أ'?[listen('ءْ','ء',['أ','إ'],'الهمزة على السطر: ء','أَسْتَمِعُ، وَأَخْتَارُ الْهَمْزَةَ عَلَى السَّطْرِ.')]:[])
      ]});
    if(letter!=='ر'){
      const order=[...letters1,...letters2].map(r=>r[0]),pos=order.indexOf(letter),otherWord=order.slice(0,pos).reverse().map(l=>support[l][0]).find(w=>firstLetter(w)!==letter)||'رَا';
      lessons.push({id:`${unitId}-word-v2`,title:'أقرأ كلمة',goal:'أقرأ كلمة فيها الحرف.',book,page:page+3,guidedPractice:practice(word),
        steps:[step(word,icon?items(icon):symbol(word),word),...(sentence?[step(sentence,symbol(sentence),sentence)]:[])],
        tasks:[
          ask(`أختار كلمة تبدأ بحرف ${name}.`,word,[otherWord],`${word} تبدأ بحرف ${name}.`,{say:`أَخْتَارُ كَلِمَةً تَبْدَأُ بِحَرْفِ ${spoken[letter]}.`}),
          listen(word,word,[otherWord],'سمعت: '+word,'أَسْتَمِعُ، وَأَخْتَارُ الْكَلِمَةَ.'),
          ...(sentence?[listen(sentence,sentence,[sentenceOther(sentence)],'سمعت: '+sentence,'أَسْتَمِعُ، وَأَخْتَارُ الْجُمْلَةَ.')]:[])
        ]});
    }
    // إملاء: أستمع ثم أختار ترتيب الحروف الصحيح.
    const right=parts.join(' '),swapped=parts.slice().reverse().join(' '),wrongLetter=parts.map((p,i)=>i===0?p.replace(letter,like1):p).join(' ');
    lessons.push({id:`${unitId}-dictation-v2`,title:'أستمع وأكتب',goal:'أسمع، وأرتّب الحروف.',book,page:page+3,guidedPractice:[{title:'أكتب',text:'يملي الكبير، فأكتب على ورقة.'}],
      steps:[step('أسمع، ثم أرتّب.',symbol(right),word)],
      tasks:[listen(word,right,[...new Set([swapped,wrongLetter])].filter(v=>v!==right),'الترتيب: '+right,'أَسْتَمِعُ، وَأَخْتَارُ التَّرْتِيبَ الصَّحِيحَ.')]});
    return {id:unitId,title:`حرف ${name}`,term,book,page,lessons};
  }
  const lessonsWords=[];
  const sentenceOther=s=>{const w=s.replace(/\.$/,'').split(' ');return w.length>1?w.slice().reverse().join(' ')+'.':s.replace(/\.$/,'')+'؟';};
  const prep={id:'ar-prep',title:'التهيئة',term:1,book:'p1',page:2,lessons:[{
    id:'ar-prep-match',title:'أنظر وأطابق',goal:'أختار الصورة نفسها.',book:'p1',page:2,
    steps:[step('هذا كتاب.',items('book'),'هَذَا كِتَابٌ.'),step('هذه حقيبة.',items('bag'),'هَذِهِ حَقِيبَةٌ.')],
    tasks:[{prompt:'أختار الصورة المطابقة.',scene:{type:'items',icons:['book']},choices:[{label:'كتاب',scene:{type:'items',icons:['book']}},{label:'كرة',scene:{type:'items',icons:['ball']}}],answer:0,explain:'كتاب مع كتاب: الصورتان متطابقتان.'},{prompt:'أختار الصورة المطابقة.',scene:{type:'items',icons:['bag']},choices:[{label:'قلم',scene:{type:'items',icons:['pen']}},{label:'حقيبة',scene:{type:'items',icons:['bag']}}],answer:1,explain:'هذه حقيبة، مثل الصورة التي رأيناها.'}]
  }]};
  function revision(id,term,page,letters){
    const book=term===1?'p1':'p2';
    const task=letter=>listen(letter==='أ'?'أَ':letter+'َ',letter,[lookAlike[letter][0]],'هذا حرف '+letter,'أَسْتَمِعُ، وَأَخْتَارُ الْحَرْفَ.');
    return {id,title:'المراجعة',term,book,page,lessons:[
      {id:`${id}-all-v2`,title:'أراجع الحروف',book,page,reviewTargets:letters,goal:'أسمع الحرف، وأختاره.',steps:[step('أراجع.',symbol(letters.join('  ')),letters.map(l=>spoken[l]).join('، '))],tasks:letters.map(task)},
      {id:`${id}-words-v2`,title:'أراجع الكلمات',book,page,goal:'أسمع الكلمة، وأختارها.',steps:[step('أقرأ.',symbol(letters.map(l=>support[l][0]).join('  ')),letters.map(l=>support[l][0]).join('، '))],
        tasks:letters.map((l,i)=>listen(support[l][0],support[l][0],[support[letters[(i+1)%letters.length]][0]],'سمعت: '+support[l][0],'أَسْتَمِعُ، وَأَخْتَارُ الْكَلِمَةَ.'))}]};
  }
  const units=[prep];
  for(const [l] of [...letters1,...letters2])lessonsWords.push(support[l][0]);
  const revisions1={2:36,5:61,8:90,11:122,14:150,17:179};
  letters1.forEach((row,i)=>{units.push(letterUnit(row,i,1));if(revisions1[i])units.push(revision(`ar-p1-review-${i}`,1,revisions1[i],letters1.slice(i-2,i+1).map(x=>x[0])));});
  letters2.forEach((row,i)=>{units.push(letterUnit(row,i,2));if(i===4||i===9)units.push(revision(`ar-p2-review-${i}`,2,i===4?45:90,letters2.slice(i-4,i+1).map(x=>x[0])));});
  // نصوص قراءة قصيرة أصلية بمستوى الطفل، مشكولة كاملة، جملة في كل خطوة.
  function storyUnit(id,title,page,sentences,tasks,cause){
    const reading={id:`${id}-reading-v2`,title:'أقرأ وأفهم',goal:'أسمع النص جملة جملة، وأقرؤه.',book:'p2',page:page+3,
      guidedPractice:[{title:'أحكي',text:'أحكي ما حدث أولًا، ثم بعد ذلك.'},{title:'أكتب',text:'أنسخ جملة من النص.'}],
      passage:sentences.map(s=>s[0]),steps:sentences.map(([text,icons])=>step(text,items(...icons),text)),tasks};
    return {id,title,term:2,book:'p2',page,lessons:[reading,{id:`${id}-cause-v2`,title:'لماذا؟',goal:'أعرف السبب.',book:'p2',page:page+3,steps:[step(sentences.at(-1)[0],items(...sentences.at(-1)[1]),sentences.at(-1)[0])],tasks:[cause]}]};
  }
  const q=(say,correct,wrongs,explain)=>ask(say,correct,wrongs,explain,{say});
  units.push(
    storyUnit('ar-help','نساعد الكبير',93,[
      ['رَأَى ثَابِتٌ جَدَّهُ يَحْمِلُ سَلَّةً.',['boy','basket']],
      ['قَالَ ثَابِتٌ: أَحْمِلُهَا عَنْكَ يَا جَدِّي.',['boy','hand']],
      ['حَمَلَ ثَابِتٌ السَّلَّةَ إِلَى الْبَيْتِ.',['basket','house']],
      ['فَرِحَ الْجَدُّ، وَقَالَ: شُكْرًا يَا ثَابِتُ.',['house','boy']]
    ],[
      q('مَاذَا كَانَ الْجَدُّ يَحْمِلُ؟',{label:'سَلَّةً',scene:items('basket')},[{label:'كُرَةً',scene:items('ball')}],'كان الجد يحمل سلة.'),
      q('مَاذَا قَالَ الْجَدُّ؟','شُكْرًا يَا ثَابِتُ.',['إِلَى اللِّقَاءِ.'],'قال الجد: شكرًا.')
    ],q('لِمَاذَا حَمَلَ ثَابِتٌ السَّلَّةَ؟','لِيُسَاعِدَ جَدَّهُ.','لِيَلْعَبَ بِهَا.','ساعد ثابت جده.')),
    storyUnit('ar-country','وطني أجمل',101,[
      ['فِي شَجَرَةِ الزَّيْتُونِ عُشٌّ صَغِيرٌ.',['tree','nest']],
      ['فِي الْعُشِّ عُصْفُورٌ يُغَرِّدُ.',['nest','bird']],
      ['قَالَ لَهُ صَدِيقُهُ: تَعَالَ إِلَى عُشٍّ كَبِيرٍ.',['bird','bird']],
      ['قَالَ الْعُصْفُورُ: عُشِّي فِي وَطَنِي أَجْمَلُ.',['bird','tree']]
    ],[
      q('أَيْنَ الْعُشُّ؟',{label:'فِي شَجَرَةِ الزَّيْتُونِ',scene:items('tree')},[{label:'فِي السَّيَّارَةِ',scene:items('car')}],'العش في شجرة الزيتون.'),
      q('مَنْ فِي الْعُشِّ؟',{label:'عُصْفُورٌ',scene:items('bird')},[{label:'قِطَّةٌ',scene:items('cat')}],'في العش عصفور.')
    ],q('لِمَاذَا بَقِيَ الْعُصْفُورُ؟','لِأَنَّهُ يُحِبُّ وَطَنَهُ.','لِأَنَّ الْعُشَّ الْكَبِيرَ بَعِيدٌ.','يحب العصفور وطنه.')),
    storyUnit('ar-water','الماء',109,[
      ['عَطِشَ ظَافِرٌ، فَفَتَحَ الصُّنْبُورَ.',['boy','tap']],
      ['شَرِبَ ظَافِرٌ الْمَاءَ.',['water','boy']],
      ['ثُمَّ أَغْلَقَ الصُّنْبُورَ جَيِّدًا.',['tap','hand']],
      ['الْمَاءُ نِعْمَةٌ، نُحَافِظُ عَلَيْهِ.',['water']]
    ],[
      q('مَاذَا شَرِبَ ظَافِرٌ؟',{label:'الْمَاءَ',scene:items('water')},[{label:'الْحَلِيبَ',scene:items('milk')}],'شرب ظافر الماء.'),
      q('مَاذَا فَعَلَ بَعْدَ أَنْ شَرِبَ؟','أَغْلَقَ الصُّنْبُورَ.','تَرَكَ الصُّنْبُورَ مَفْتُوحًا.','أغلق الصنبور.')
    ],q('لِمَاذَا نُغْلِقُ الصُّنْبُورَ؟','لِنُحَافِظَ عَلَى الْمَاءِ.','لِيَسِيلَ الْمَاءُ.','نحافظ على الماء.')),
    storyUnit('ar-butterfly','الفراشة والنحلة',117,[
      ['طَارَتْ فَرَاشَةٌ فِي الْحَدِيقَةِ.',['butterfly','flower']],
      ['رَأَتْ نَحْلَةً عَلَى زَهْرَةٍ.',['bee','flower']],
      ['قَالَتِ الْفَرَاشَةُ: مَاذَا تَفْعَلِينَ؟',['butterfly','bee']],
      ['قَالَتِ النَّحْلَةُ: أَجْمَعُ الرَّحِيقَ لِأَصْنَعَ الْعَسَلَ.',['bee','flower']]
    ],[
      q('مَنْ رَأَتِ الْفَرَاشَةُ؟',{label:'نَحْلَةً',scene:items('bee')},[{label:'قِطَّةً',scene:items('cat')}],'رأت الفراشة نحلة.'),
      q('أَيْنَ كَانَتِ النَّحْلَةُ؟',{label:'عَلَى زَهْرَةٍ',scene:items('flower')},[{label:'عَلَى سَيَّارَةٍ',scene:items('car')}],'كانت على زهرة.')
    ],q('لِمَاذَا تَجْمَعُ النَّحْلَةُ الرَّحِيقَ؟','لِتَصْنَعَ الْعَسَلَ.','لِتُفْسِدَ الْأَزْهَارَ.','تَجْمَعُ النَّحْلَةُ الرَّحِيقَ لِصُنْعِ الْعَسَلِ.')),
    storyUnit('ar-monkey','القرد الطماع',125,[
      ['وَجَدَ الْقِرْدُ خَوْخَةً.',['monkey','peach']],
      ['رَأَى مَوْزَةً، فَتَرَكَ الْخَوْخَةَ.',['monkey','banana']],
      ['رَأَى أَرْنَبًا، فَتَرَكَ الْمَوْزَةَ وَرَكَضَ.',['monkey','rabbit']],
      ['هَرَبَ الْأَرْنَبُ، وَبَقِيَ الْقِرْدُ جَائِعًا.',['rabbit','monkey']]
    ],[
      q('مَاذَا وَجَدَ الْقِرْدُ أَوَّلًا؟',{label:'خَوْخَةً',scene:items('peach')},[{label:'مَوْزَةً',scene:items('banana')}],'وجد خوخة أولًا.'),
      q('كَيْفَ بَقِيَ الْقِرْدُ؟','جَائِعًا.','شَبْعَانَ.','بقي القرد جائعًا.')
    ],q('لِمَاذَا بَقِيَ الْقِرْدُ جَائِعًا؟','لِأَنَّهُ تَرَكَ طَعَامَهُ.','لِأَنَّهُ أَكَلَ كَثِيرًا.','ترك طعامه، فلم يأكل.'))
  );
  // مقاطع صفحة الدرس كما يعرضها الكتاب.
  const bookPhonics={
    'ر':[['رَا'],'رَامِي'], 'د':[['دَا','دُو'],'دَار'], 'ب':[['بَا','بُو','بِي'],'بَاب'],
    'م':[['مَا','مُو','مِي'],'دِيمَا'], 'ن':[['نَا','نُو','نِي','نَ'],'نَادِر'], 'س':[['سَا','سُو','سِي','سَ'],'سَامِي'],
    'ز':[['زَا','زُو','زِي','زِ'],'مَازِن'], 'ح':[['حَا','حُو','حِي','حْ'],'حَامِد'], 'ل':[['لَا','لُو','لِي','لِ'],'بِلَال'],
    'ت':[['تَا','تُو','تِي','تُ'],'تُرَاب'], 'ج':[['جَا','جُو','جِي','جْ'],'جَابِر'], 'ف':[['فَا','فُو','فِي'],'فِيل'],
    'ع':[['عَا','عُو','عِي'],'سَعِيد'], 'ش':[['شَا','شُو','شِي'],'شَادِي'], 'ص':[['صَا','صُو','صِي'],'صُوص'],
    'ق':[['قَا','قُو','قِي'],'نُقُود'], 'ث':[['ثَا','ثُو','ثِي'],'ثَابِت'], 'خ':[['خَا','خُو','خِي'],'نَخِيل'],
    'ذ':[['ذَا','ذُو','ذِي'],'جُذُور'], 'غ':[['غَا','غُو','غِي'],'رَغِيف'], 'ط':[['طَا','طُو','طِي'],'طَارِق'],
    'ك':[['كَا','كُو','كِي'],'كَامِل'], 'ض':[['ضَا','ضُو','ضِي'],'رَضِيع'], 'ه':[['هَا','هُو','هِي'],'هَالَة'],
    'و':[['وَا','وِي','وَ'],'وَاصِف'], 'أ':[['أَ','أُ','إِ'],'إِسْرَاء'], 'ظ':[['ظَا','ظُو','ظِي'],'ظَافِر'], 'ي':[['يَا','يُو','يَ'],'يَاسِر']
  };
  units.forEach(unit=>{
    const phonics=unit.lessons.find(l=>l.phonics);if(!phonics)return;
    const letter=phonics.phonics.letter,[targets,word]=bookPhonics[letter],page=unit.page+3,like=lookAlike[letter][0];
    const swap=v=>{const w=v.replace(letter,like);return w!==v?w:targets.find(x=>x!==v);};
    unit.lessons.splice(1,0,{id:unit.id+'-book-practice-v2',title:'مقاطع الدرس',book:unit.book,page,
      goal:'أقرأ مقاطع صفحة الدرس.',bookTargets:targets,bookWord:word,
      steps:[step('أقرأ المقاطع.',symbol(targets.join('  ')),targets.join('، ')),step('كلمة من الكتاب.',symbol(word),word)],
      tasks:[...targets.slice(0,3).map(v=>listen(v,v,[swap(v)],'سمعت: '+v,'أَسْتَمِعُ، وَأَخْتَارُ الْمَقْطَعَ.')),ask('أختار الكلمة نفسها.',word,[word==='بَاب'?'دَار':'بَاب'],'الكلمة: '+word,{scene:symbol(word),say:'أَخْتَارُ الْكَلِمَةَ نَفْسَهَا.'})]});
    phonics.optional=true;phonics.title='إثراء: '+phonics.title;
  });
  const languageSkills={
    'ذ':['التاء المبسوطة والمربوطة','بَيْتٌ، زَهْرَةٌ','أي كلمة تنتهي بتاء مربوطة؟','زَهْرَةٌ','بَيْتٌ'],
    'غ':['تنوين الضم','قَلَمٌ','أي كلمة فيها تنوين ضم؟','قَلَمٌ','قَلَمُ'],
    'ط':['تنوين الفتح','قَلَمًا','أي كلمة فيها تنوين فتح؟','قَلَمًا','قَلَمَ'],
    'ك':['تنوين الكسر','قَلَمٍ','أي كلمة فيها تنوين كسر؟','قَلَمٍ','قَلَمِ'],
    'و':['الشدة','جَدِّي','أي كلمة فيها شدة؟','جَدِّي','يَدِي'],
    'أ':['الألف الممدودة','آ  أَ','أختار الألف الممدودة.','آ','أَ'],
    'ظ':['أل التعريف','بَابٌ، الْبَابُ','أي كلمة فيها أل التعريف؟','الْبَابُ','بَابٌ'],
    'ي':['الياء والألف المقصورة','ي  ى','أختار الألف المقصورة.','ى','ي']
  };
  const plainSay={'أي كلمة تنتهي بتاء مربوطة؟':'أَيُّ كَلِمَةٍ تَنْتَهِي بِتَاءٍ مَرْبُوطَةٍ؟','أي كلمة فيها تنوين ضم؟':'أَيُّ كَلِمَةٍ فِيهَا تَنْوِينُ ضَمٍّ؟','أي كلمة فيها تنوين فتح؟':'أَيُّ كَلِمَةٍ فِيهَا تَنْوِينُ فَتْحٍ؟','أي كلمة فيها تنوين كسر؟':'أَيُّ كَلِمَةٍ فِيهَا تَنْوِينُ كَسْرٍ؟','أي كلمة فيها شدة؟':'أَيُّ كَلِمَةٍ فِيهَا شَدَّةٌ؟','أختار الألف الممدودة.':'أَخْتَارُ الْأَلِفَ الْمَمْدُودَةَ.','أي كلمة فيها أل التعريف؟':'أَيُّ كَلِمَةٍ فِيهَا أَلِ التَّعْرِيفِ؟','أختار الألف المقصورة.':'أَخْتَارُ الْأَلِفَ الْمَقْصُورَةَ.'};
  units.forEach(unit=>{const p=unit.lessons.find(l=>l.phonics);if(unit.term!==2||!p||!languageSkills[p.phonics.letter])return;const [title,model,prompt,correct,wrong]=languageSkills[p.phonics.letter];
    unit.lessons.splice(2,0,{id:unit.id+'-book-language-v2',title,goal:'ألاحظ المثال.',book:unit.book,page:unit.page+4,sourceSkills:title,steps:[step(model,symbol(model),model.replace(/  /g,'، '))],tasks:[ask(prompt,correct,[wrong],'الإجابة: '+correct,{say:plainSay[prompt]})]});});
  // معرّفات قديمة استُبدلت بأهداف جديدة؛ لا يُحتسب إنجازها القديم للأهداف الجديدة.
  const retiredLessonIds=[];
  for(const u of units)if(/^ar-p[12]-\d+$/.test(u.id))for(const s of ['letter','book-practice','syllable','phonics','word',...(u.term===2?['book-language']:[])])retiredLessonIds.push(u.id+'-'+s);
  for(const u of units)if(u.id.includes('review'))retiredLessonIds.push(u.id+'-lesson',u.id+'-all');
  for(const id of ['ar-help','ar-country','ar-water','ar-butterfly','ar-monkey'])retiredLessonIds.push(id+'-reading',id+'-cause');
  retiredLessonIds.push('ar-found-dir','ar-found-madd','ar-found-sentence');
  for(const l of units.flatMap(u=>u.lessons))l.referenceLabel='كتابي:';
  window.G1_COURSE={id:'arabic',title:'لغتنا الجميلة',key:'bustan_g1_arabic_v1',books,retiredLessonIds,traceGroups:[...letters1,...letters2].map(([letter,name])=>({label:'حرف '+name,forms:[...formsOf(letter),...(letter==='أ'?['أَ','أُ','إِ']:[letter+'َ',letter+'ُ',letter+'ِ'])]})),sourceNote:'أنشطة أصلية قصيرة تتبع ترتيب حروف لغتنا الجميلة للصف الأول بجزأيه. نصوص القراءة قصيرة أصلية بمستوى الطفل.',units,foundations:[{...prep.lessons[0],id:'ar-foundation-match'}]};
})();
