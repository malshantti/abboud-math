/* بيانات المغامرات والمختبر في موقع الإنجليزية.
   المغامرات مبنية على حوارات وصور كتاب English for Palestine 6 (الوحدات 1 و7 و10 و13 و17). */
(function(){
const M=[
 {id:'camp',u:'U1',title:'العودة من المخيّم الصيفي',tag:'العطلة الصيفية',img:'A04-171',sum:'تعود إيمي من المخيّم ويدها مكسورة، وتحكي لرانيا ما حدث.',
  steps:[
  {t:'say',ar:'عادت إيمي إلى المدرسة بعد العطلة الصيفية، ورانيا تلاحظ أن ذراعها مكسورة. استمع إلى حوارهما.',img:'A04-171'},
  {t:'dlg',u:'U1',from:0,to:5,ar:'استمع إلى الحوار جملة جملة، أو اضغط «استمع إلى الكل».'},
  {t:'mc',ar:'ماذا حدث لذراع إيمي؟',say:'I fell down and broke it.',opts:['سقطت فانكسرت','جرحها كلب','أصابتها كرة'],a:0,why:'قالت إيمي: I fell down and broke it.'},
  {t:'gap',ar:'اختر الفعل في الماضي البسيط.',en:'I fell down and ___ it.',opts:['broke','break','breaking'],a:0,full:'I fell down and broke it.',why:'الحدث انتهى في الماضي، وماضي break هو broke.'},
  {t:'dlg',u:'U1',from:5,to:9,ar:'من ساعد إيمي؟ استمع إلى بقية الحوار.'},
  {t:'mc',ar:'من سمع إيمي حين سقطت؟',say:'My friend Ann heard me fall. She called a teacher and I went to hospital.',opts:['صديقتها آن','رانيا','المعلم'],a:0,en:1,why:'قالت إيمي: My friend Ann heard me fall.'},
  {t:'gap',ar:'سؤال في الماضي البسيط.',en:'___ you have a nice time at summer camp?',opts:['Did','Do','Was'],a:0,full:'Did you have a nice time at summer camp?',why:'نسأل عن الماضي بـ Did مع الفعل في صيغته الأصلية.'},
  {t:'order',ar:'رتّب الكلمات لتكوّن ما قالته إيمي.',say:'I fell down and broke it.',tiles:['I','fell','down','and','broke','it.']}
 ]},
 {id:'olives',u:'U7',title:'في بستان الزيتون',tag:'الزيتون والتراث',img:'A49-134',sum:'تزور رانيا وعمر الجدّين في موسم القطاف، ويتعلّمان ما نصنعه من الزيتون.',
  steps:[
  {t:'say',ar:'رانيا وعمر عند جدّهما وجدّتهما بين أشجار الزيتون. استمع إلى ما يقولونه.',img:'A49-134'},
  {t:'dlg',u:'U7',from:0,to:5},
  {t:'mc',ar:'كم عمر بعض هذه الأشجار؟',say:'Oh, let me think. My grandfather planted some of these trees, they are more than 150 years old.',opts:['أكثر من 150 سنة','50 سنة','10 سنوات'],a:0,en:1,why:'قال الجد: they are more than 150 years old.'},
  {t:'gap',ar:'رانيا تستأذن بأدب.',en:'I love your olives! ___ I try one?',opts:['May','Must','Should'],a:0,full:'I love your olives! May I try one? What do you do with them?',why:'للاستئذان بأدب نستعمل May I …?'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة للكلمة.',say:'soap',opts:['A55-70','A49-136','A41-136','B35-1'],a:0},
  {t:'dlg',u:'U7',from:5,to:12,ar:'الآن يسأل عمر جدّه عن مكان عصر الزيتون.'},
  {t:'mc',ar:'منذ متى يزرع الفلسطينيون الزيتون هنا؟',say:'Palestinians were growing olives here more than 5,000 years ago!',opts:['منذ أكثر من 5000 سنة','منذ 150 سنة','منذ 500 سنة'],a:0,en:1,why:'قال الجد: more than 5,000 years ago.'},
  {t:'order',ar:'رتّب الكلمات لتكوّن ما قاله عمر.',say:'May I help you?',tiles:['May','I','help','you?']}
 ]},
 {id:'deadsea',u:'U10',title:'رحلة إلى البحر الميت',tag:'أماكن في فلسطين',img:'B04-168',sum:'تحدّث رانيا إيمي عن البحر الميت: ملحه وطينه وحيواناته.',
  steps:[
  {t:'say',ar:'رانيا زارت البحر الميت، وإيمي لم تزره قط. استمع إلى حديثهما.',img:'B04-168'},
  {t:'dlg',u:'U10',from:0,to:6},
  {t:'mc',ar:'متى ذهبت رانيا إلى البحر الميت؟',say:'Yes, we went there two years ago.',opts:['قبل سنتين','في الصيف الماضي','لم تذهب قط'],a:0,why:'قالت رانيا: we went there two years ago.'},
  {t:'gap',ar:'سؤال بالمضارع التام عن التجربة.',en:'Have you ever ___ to the Dead Sea?',opts:['been','went','go'],a:0,full:'Have you ever been to the Dead Sea?',why:'بعد have نستعمل التصريف الثالث: been.'},
  {t:'dlg',u:'U10',from:6,to:14,ar:'لماذا يضع الناس طين البحر الميت على أجسامهم؟'},
  {t:'mc',ar:'لماذا يضع الناس طين البحر الميت على أجسامهم؟',say:"Ahhh, because it's a medicine and makes your skin feel great!",opts:['لأنه دواء ويفيد البشرة','لأنه بارد','لأنه جميل اللون'],a:0,en:1,why:"قالت رانيا: because it's a medicine and makes your skin feel great!"},
  {t:'pic',ar:'استمع واختر الصورة المناسبة للكلمة.',say:'oasis',opts:['B05-3','B05-2','B13-143','A49-134'],a:0},
  {t:'order',ar:'رتّب الكلمات لتكوّن ما قاله عمر.',say:"I've seen a jerboa and a gazelle.",tiles:["I've",'seen','a','jerboa','and','a','gazelle.']}
 ]},
 {id:'rain',u:'U13',title:'من أين يأتي المطر؟',tag:'العلوم والطبيعة',img:'B28-34',sum:'يجري الأستاذ علي تجربة مع الصف ليعرفوا كيف يتكوّن المطر.',
  steps:[
  {t:'say',ar:'في حصة العلوم يسأل الأستاذ علي: من أين يأتي المطر؟ استمع إلى إجابات الطلاب.',img:'B28-34'},
  {t:'dlg',u:'U13',from:0,to:8},
  {t:'mc',ar:'ماذا قالت رانيا عن الماء؟',say:'Water changes into vapour and the air becomes wet!',opts:['يتحول إلى بخار','يتجمد','يختفي'],a:0,en:1,why:'قالت رانيا: Water changes into vapour.'},
  {t:'gap',ar:'حقيقة علمية بالمضارع البسيط.',en:'I know hot air ___.',opts:['rises','rise','is rise'],a:0,full:'And the vapour is going up into the air. I know hot air rises.',why:'الحقائق العلمية بالمضارع البسيط، ومع المفرد نضيف s: rises.'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة للكلمة.',say:'rain',opts:['B35-1','B35-6','B41-1','B05-3'],a:0},
  {t:'dlg',u:'U13',from:12,to:16,ar:'كيف يتكوّن المطر؟ استمع إلى الخطوات.'},
  {t:'mc',ar:'ماذا يحدث للبخار حين يبرد؟',say:'The vapour cools and makes clouds.',opts:['يكوّن الغيوم','يصبح ملحًا','يصعد إلى الشمس'],a:0,en:1,why:'قال عمر: The vapour cools and makes clouds.'},
  {t:'order',ar:'رتّب الكلمات لتكوّن ما قاله عمر.',say:'The vapour cools and makes clouds.',tiles:['The','vapour','cools','and','makes','clouds.']}
 ]},
 {id:'manners',u:'U17',title:'آداب في كل مكان',tag:'الأخلاق الحميدة',img:'B56-33',sum:'في الطابور والمكتبة والصف: كيف نتصرّف بأدب ونتكلّم بوضوح؟',
  steps:[
  {t:'say',ar:'بن ورانيا وإيمي وأصدقاؤهم في أماكن مختلفة. استمع وتعلّم عبارات الأدب.',img:'B56-33'},
  {t:'dlg',u:'U17',from:0,to:4},
  {t:'mc',ar:'ماذا طلب بن من الأم وابنها؟',say:"Excuse me! Please don't push in! There's a queue here.",opts:['ألّا يتجاوزا الطابور','أن يتكلّما بهدوء','أن يكتبا بعناية'],a:0,en:1,why:"قال بن: Please don't push in! There's a queue here."},
  {t:'gap',ar:'اختر ظرف الحال المناسب.',en:'This is a library. Please talk ___.',opts:['quietly','quiet','quick'],a:0,full:'Excuse me, girls. This is a library. Please talk quietly.',why:'لوصف طريقة الكلام نستعمل الظرف quietly.'},
  {t:'dlg',u:'U17',from:4,to:12,ar:'والآن في الملعب وفي الصف.'},
  {t:'mc',ar:'لماذا طلب الأستاذ علي من إيمي أن تتكلّم بوضوح؟',say:"Amy, I can't hear you. Please speak clearly.",opts:['لأنه لا يسمعها','لأنها تكتب بسرعة','لأنها تأخرت'],a:0,en:1,why:"قال: I can't hear you. Please speak clearly."},
  {t:'gap',ar:'نصيحة أم عمر.',en:'Mum says we ___ take turns.',opts:['should','shouldn\'t','mustn\'t'],a:0,full:"Hey Jordan! You shouldn't interrupt while others are speaking. Mum says we should take turns.",why:'النصيحة بأن نتبادل الأدوار: should.'},
  {t:'order',ar:'رتّب الكلمات لتكوّن ما قاله الأستاذ علي.',say:'Amy, please write carefully.',tiles:['Amy,','please','write','carefully.']}
 ]}
];
const DET=[
 ['U1','She fell down the stairs.','She falled down the stairs.','fall فعل شاذ، وماضيه fell.'],
 ['U1','Did you have a nice time at summer camp?','Did you had a nice time at summer camp?','بعد Did نستعمل الفعل في صيغته الأصلية: have.'],
 ['U3','We were going down the river when the boat turned over.','We was going down the river when the boat turned over.','مع we نستعمل were في الماضي المستمر.'],
 ['U4','While the young ox was eating, the tiger attacked it.','While the young ox were eating, the tiger attacked it.','الفاعل مفرد (the young ox) فنستعمل was.'],
 ['U6',"You shouldn't eat lots of fried food.","You shouldn't to eat lots of fried food.",'لا نضع to بعد should أو shouldn\'t.'],
 ['U7','May I try one?','May I to try one?','بعد May يأتي الفعل مباشرة دون to.'],
 ['U8','You must wash your hands.','You must washing your hands.','بعد must يأتي الفعل في صيغته الأصلية: wash.'],
 ['U10','Have you ever been to the Dead Sea?','Have you ever went to the Dead Sea?','بعد have نستعمل التصريف الثالث: been وليس went.'],
 ['U12','They have been sick since last night.','They have been sick for last night.','last night نقطة بداية، فنستعمل since.'],
 ['U13','Hot air rises.','Hot air rise.','الفاعل مفرد، والحقيقة العلمية بالمضارع البسيط: rises.'],
 ['U16','She enjoys writing stories about explorers.','She enjoys to write stories about explorers.','بعد enjoy يأتي الفعل بصيغة ing.'],
 ['U17','Please speak clearly.','Please speak clear.','لوصف الفعل نستعمل الظرف clearly.']
];
/* آلة الأزمنة */
const SUBJ=[['I','أنا'],['She','هي'],['We','نحن']];
const VERBS=[
 {b:'play',s:'plays',ing:'playing',p:'played',pp:'played',o:'football',ar:'يلعب كرة القدم'},
 {b:'visit',s:'visits',ing:'visiting',p:'visited',pp:'visited',o:'Grandma',ar:'يزور الجدة'},
 {b:'swim',s:'swims',ing:'swimming',p:'swam',pp:'swum',o:'in the sea',ar:'يسبح في البحر'},
 {b:'write',s:'writes',ing:'writing',p:'wrote',pp:'written',o:'an email',ar:'يكتب رسالة إلكترونية'},
 {b:'ride',s:'rides',ing:'riding',p:'rode',pp:'ridden',o:'a horse',ar:'يركب حصانًا'}];
const TIMES=[
 {k:'ps',ar:'كل يوم',name:'المضارع البسيط',rule:'للعادات والحقائق. نضيف s مع he / she / it.',f:(s,v)=>[s,s==='She'?v.s:v.b,v.o,'every day']},
 {k:'past',ar:'أمس',name:'الماضي البسيط',rule:'لحدث انتهى في الماضي: التصريف الثاني (ed أو شاذ).',f:(s,v)=>[s,v.p,v.o,'yesterday']},
 {k:'pastc',ar:'حين اتصلت أمي',name:'الماضي المستمر',rule:'لحدث كان مستمرًا في الماضي: was / were + الفعل مع ing.',f:(s,v)=>[s,(s==='We'?'were':'was')+' '+v.ing,v.o,'when Mum called']},
 {k:'pp',ar:'من قبل',name:'المضارع التام',rule:'لتجربة حدثت قبل الآن: have / has + التصريف الثالث.',f:(s,v)=>[s,(s==='She'?'has':'have')+' '+v.pp,v.o,'before']}];
const tmSent=(si,vi,ti)=>{const p=TIMES[ti].f(SUBJ[si][0],VERBS[vi]);return{parts:p,text:p.filter(Boolean).join(' ')+'.'}};
/* عائلات الكلمات (القراءة الصوتية) */
const FAM=[
 {r:'at',on:['c','h','m','s','b','r']},
 {r:'en',on:['t','p','h','m']},
 {r:'ig',on:['b','p','d','w','f']},
 {r:'op',on:['t','h','m','st','sh']},
 {r:'ug',on:['b','h','m','r','j']},
 {r:'ip',on:['sh','ch','l','d','s','tr']},
 {r:'in',on:['p','w','b','t','ch','th']}];
const AR={cat:'قطة',hat:'قبعة',mat:'حصيرة',sat:'جلس',bat:'مضرب',rat:'جرذ',ten:'عشرة',pen:'قلم',hen:'دجاجة',men:'رجال',big:'كبير',pig:'خنزير',dig:'يحفر',wig:'شعر مستعار',fig:'تين',top:'قمة',hop:'يقفز',mop:'ممسحة',stop:'يتوقف',shop:'متجر',bug:'حشرة',hug:'عناق',mug:'كوب',rug:'سجادة صغيرة',jug:'إبريق',ship:'سفينة',chip:'رقاقة',lip:'شفة',dip:'يغمس',sip:'رشفة',trip:'رحلة',pin:'دبوس',win:'يفوز',bin:'سلة مهملات',tin:'علبة معدنية',chin:'ذقن',thin:'نحيف'};
window.EN_ADV={M,DET,SUBJ,VERBS,TIMES,tmSent,FAM,AR,
 audioTexts:()=>{const t=[];M.forEach(m=>m.steps.forEach(s=>{if(s.say)t.push(s.say);if(s.full)t.push(s.full);if(s.en&&s.t==='read')t.push(s.en)}));DET.forEach(d=>t.push(d[1]));
  SUBJ.forEach((_,si)=>VERBS.forEach((_,vi)=>TIMES.forEach((_,ti)=>t.push(tmSent(si,vi,ti).text))));FAM.forEach(f=>f.on.forEach(o=>t.push(o+f.r)));return t}};
})();
