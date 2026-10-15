/* بيانات المغامرات والمختبر في موقع الإنجليزية.
   المغامرات مبنية على حوارات ونصوص وصور كتاب English for Palestine 8 (الوحدات 2 و3 و11 و12 و13). */
(function(){
const M=[
 {id:'food',u:'U2',title:'مائدة فلسطينية في لندن',tag:'الطعام والموسيقى',img:'A17-1',sum:'تتذوّق مع الضيوف الصفيحة والكباب، وتسمع العود والطبلة.',
  steps:[
  {t:'say',ar:'عائلة كمال الفلسطينية تعيش في لندن، ودعت صديقيها تينا ومايك إلى عشاء فلسطيني. استمع إلى ما يقولونه حول المائدة.',img:'A17-1'},
  {t:'dlg',u:'U2',from:0,to:7,ar:'استمع إلى الحوار جملة جملة، أو اضغط «استمع إلى الكل».'},
  {t:'mc',ar:'ماذا قالت نادية عن الطعام الذي يشبه البيتزا؟',say:"But it isn't. It's sfeeha.",opts:['إنه صفيحة','إنه بيتزا','إنه كباب'],a:0,why:'قالت نادية: It\'s sfeeha.'},
  {t:'gap',ar:'اختر الكلمة المناسبة: الفاعل The kebabs جمع.',en:'The kebabs ___ delicious.',opts:['smell','smells','smelling'],a:0,full:'The kebabs smell delicious.',why:'مع الجمع لا نضيف s إلى فعل المضارع: The kebabs smell.'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة للكلمة.',say:'tasty',opts:['A18-4','A18-1','A18-3','A18-7'],a:0},
  {t:'dlg',u:'U2',from:7,to:14,ar:'الآن يبدأ الحديث عن الموسيقى العربية.'},
  {t:'mc',ar:'أيّ آلة يشبه صوتها صوت الغيتار؟',say:"That 'oud sounds like a guitar, Mr Kamal. Is it?",opts:["the 'oud",'the tablah','the piano'],a:0,en:1,why:"قال مايك: That 'oud sounds like a guitar."},
  {t:'gap',ar:'السيد كمال يتحدث عن قدرته في الماضي.',en:'I ___ play it quite well at the age of 18, but not now.',opts:['could','can','can\'t'],a:0,full:'I could play it quite well at the age of 18, but not now.',why:'نستعمل could للقدرة في الماضي.'},
  {t:'order',ar:'رتّب الكلمات لتكوّن ما قالته السيدة كمال.',say:'They taste delicious, too.',tiles:['They','taste','delicious,','too.']}
 ]},
 {id:'park',u:'U3',title:'رحلة إلى متنزّه وطني',tag:'الطبيعة والرحلات',img:'A37-2',sum:'تخطّط العائلة لرحلة تخييم ومشي بين الجبال والشلالات.',
  steps:[
  {t:'say',ar:'عائلة ياسمين تخطّط لرحلة، وضيفهم عمر يريد أن يعرف إلى أين سيذهبون. استمع إلى خطتهم.',img:'A37-2'},
  {t:'dlg',u:'U3',from:0,to:9},
  {t:'mc',ar:'إلى أين قرّرت العائلة أن تذهب؟',say:'Mountains … lakes … hiking … This means Yosemite!',opts:['Yosemite','the sea','London'],a:0,en:1,why:'قال العم: This means Yosemite!'},
  {t:'mc',ar:'ماذا يسأل عمر؟',say:"No, I haven't. It sounds fantastic. Have you ever been there?",opts:['هل زرتم هذا المكان من قبل؟','متى ستذهبون إلى هناك؟','كم يبعد هذا المكان؟'],a:0,why:'Have you ever …? تسأل عن تجربة حدثت من قبل.'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة.',say:'waterfall',opts:['A31-1','A38-2','A37-2','A32-41'],a:0},
  {t:'gap',ar:'عدنان لم يجد حذاءه الرياضي حتى الآن.',en:"I haven't found my trainers ___.",opts:['yet','already','just'],a:0,full:"I haven't found my trainers yet.",why:'نستعمل yet في النفي والسؤال بمعنى «حتى الآن».'},
  {t:'gap',ar:'العائلة تجاوزت لافتة المتنزه.',en:"We've ___ passed the sign for Yosemite.",opts:['already','yet','ever'],a:0,full:"We've already passed the sign for Yosemite.",why:'already تعني «بالفعل» في الجملة المثبتة.'},
  {t:'read',ar:'اقرأ واستمع إلى هذه الفقرة من نص Yosemite.',en:'Tony Ross works for Young Friends of Yosemite. His group has been there for three weeks. They clean the campsites and keep the paths safe.',img:'A32-41'},
  {t:'gap',ar:'اختر الكلمة المناسبة مع مدة زمنية.',en:'His group has been there ___ three weeks.',opts:['for','since','ago'],a:0,full:'His group has been there for three weeks.',why:'نستعمل for مع المدة (three weeks)، و since مع نقطة البداية.'},
  {t:'order',ar:'رتّب ما قالته ياسمين.',say:'We went on a school trip last year.',tiles:['We','went','on','a','school','trip','last','year.']}
 ]},
 {id:'wedding',u:'U11',title:'عرس فلسطيني',tag:'العادات والتقاليد',img:'B41-1',sum:'تشاهد مع العائلة فيديو العرس: السهرة والزفة والدبكة.',
  steps:[
  {t:'say',ar:'وصل فيديو عرس ابن عمّ نادية وسامي. قبل المشاهدة تقدّم السيدة كمال الكعك لضيوفها.',img:'B42-1'},
  {t:'dlg',u:'U11',from:0,to:7},
  {t:'gap',ar:'السيدة كمال تعرض الكعك على ضيوفها.',en:'___ you like another cake?',opts:['Would','Do','Are'],a:0,full:'Would you like another cake?',why:'نعرض شيئًا بأدب بقولنا: Would you like …?'},
  {t:'mc',ar:'لماذا رفضت تينا قطعة كعك أخرى؟',say:"No, thanks, Mrs Kamal. I'm full!",opts:['لأنها شبعت','لأنها لا تحب الكعك','لأنها مستعجلة'],a:0,why:"I'm full تعني: أنا شبعانة."},
  {t:'dlg',u:'U11',from:8,to:13,img:'B41-1',ar:'الآن تبدأ الزفة: العريس على الحصان والناس يهنّئونه.'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة.',say:'groom',opts:['B41-2','B44-2','B42-1','B41-3'],a:0},
  {t:'mc',ar:'من يتبع موكب العريس في سيارة؟',say:"The bride's following in a car. People are giving her their best wishes.",opts:['العروس','العريس','الضيوف'],a:0,why:"The bride's following in a car."},
  {t:'gap',ar:'اختر الكلمة التي تعبّر عن الغرض.',en:"He's riding round town ___ receive everyone's congratulations.",opts:['to','for','at'],a:0,full:"He's riding round town to receive everyone's congratulations.",why:'نعبّر عن الغرض بـ to + الفعل.'},
  {t:'read',ar:'اقرأ واستمع إلى العادة الفلسطينية في نص What a wedding!',en:'In Palestine, the bride sticks some bread dough to the front door of her new home. This shows that she and her husband will stay together all their lives.',img:'B44-2'},
  {t:'mc',ar:'ماذا تُلصق العروس الفلسطينية على باب بيتها الجديد؟',opts:['عجين الخبز','خاتمًا','وردة'],a:0,why:'the bride sticks some bread dough to the front door'},
  {t:'order',ar:'رتّب ردّ تينا المهذّب.',say:"No, thanks. I'm full!",tiles:['No,','thanks.',"I'm",'full!']}
 ]},
 {id:'names',u:'U12',title:'ماذا يعني اسمك؟',tag:'الأسماء والهاتف',img:'B53-2',sum:'المرشدة روز تتصل بعائلة حيفاوي لتتحقق من اسم ياسمين.',
  steps:[
  {t:'say',ar:'المرشدة الجديدة روز هيل تتصل بالسيد خالد حيفاوي لتتحقق من بيانات ابنته ياسمين.',img:'B53-2'},
  {t:'dlg',u:'U12',from:0,to:5},
  {t:'mc',ar:'ماذا تقول على الهاتف عندما تطلب من المتصل أن ينتظر قليلًا؟',opts:['Could you hold, please?','Could I speak to her, please?','Hello. Khalid Haifawi speaking.'],a:0,en:1,why:'Could you hold, please? تعني: هل يمكنك الانتظار من فضلك؟'},
  {t:'dlg',u:'U12',from:7,to:10,ar:'تتهجّى ياسمين اسمها للمرشدة.'},
  {t:'spell',ar:'استمع إلى ياسمين وهي تتهجّى اسمها، ثم اكتبه.',say:"Certainly. It's Y-a-s-m-double-e-n.",ans:'Yasmeen'},
  {t:'gap',ar:'الأب ينقل كلام المرشدة لياسمين.',en:"She ___ she's also trying to meet everyone.",opts:['says','say','saying'],a:0,full:"She says she's also trying to meet everyone.",why:'في الكلام المنقول: She says … ونضيف s لأن الفاعل مفرد غائب.'},
  {t:'mc',ar:'روز قالت: I need to check your details. كيف ينقل الأب كلامها؟',opts:['She says she needs to check your details.','She says I need to check your details.','She say she need check your details.'],a:0,en:1,why:'نغيّر الضمير (I ← she) ونضيف s إلى الفعل (needs).'},
  {t:'read',ar:'اقرأ واستمع إلى معنى اسم عائلة حيفاوي.',en:'Haifawi means the family were from Haifa long ago.',img:'B54-1'},
  {t:'mc',ar:'ماذا يعني اسم العائلة «حيفاوي»؟',opts:['أن العائلة كانت من حيفا قديمًا','أن العائلة تعمل في الصيد','أن اسم الجدّ حيفا'],a:0,why:'Haifawi means the family were from Haifa long ago.'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة.',say:'on the line',opts:['B59-2','B65-1','B41-3','B69-2'],a:0},
  {t:'order',ar:'رتّب الكلمات لتطلب التحدث مع ياسمين بأدب.',say:'Could I speak to her, please?',tiles:['Could','I','speak','to','her,','please?']}
 ]},
 {id:'andalus',u:'U13',title:'رحلة إلى الأندلس',tag:'التاريخ والحضارة',img:'B69-1',sum:'تساعد سامي ومايك في مشروع عن الأندلس وقرطبة وقصر الحمراء.',
  steps:[
  {t:'say',ar:'مايك يعمل على مشروع عن إسبانيا الإسلامية (الأندلس)، وسامي يساعده في البحث عن المعلومات.',img:'B69-2'},
  {t:'dlg',u:'U13',from:8,to:17},
  {t:'mc',ar:'في أي عام وصل المسلمون إلى إسبانيا؟',say:'Here it is. Listen, the Muslims arrived in the year 711, and they stayed for almost 800 years.',opts:['711','800','1890'],a:0,why:'the Muslims arrived in the year 711'},
  {t:'gap',ar:'اختر الحرف المناسب للفعل المركّب: يبحث في كتاب.',en:"I'll look ___ my History of Islam here.",opts:['up','off','over'],a:0,full:"I'll look up my History of Islam here.",why:'look up تعني: يبحث عن معلومة في كتاب أو قاموس.'},
  {t:'read',ar:'اقرأ واستمع إلى فقرة من نص The Muslims in Al-Andalus.',en:'They came with new crops and better ways of farming, and Al-Andalus soon grew rich. They set up their capital in Cordoba and built beautiful mosques and palaces.',img:'B75-3'},
  {t:'mc',ar:'أين أسّس المسلمون عاصمتهم في الأندلس؟',opts:['Cordoba','Granada','Rome'],a:0,en:1,why:'They set up their capital in Cordoba.'},
  {t:'pic',ar:'استمع واختر الصورة المناسبة.',say:'architecture',opts:['B69-1','B69-2','B73-1','B74-3'],a:0},
  {t:'gap',ar:'سامي ينصح مايك بإطفاء الحاسوب.',en:'I think you should turn ___ your computer.',opts:['off','up','down'],a:0,full:'I think you should turn off your computer.',why:'turn off تعني: يُطفئ.'},
  {t:'order',ar:'رتّب الجملة من النص.',say:'They set up their capital in Cordoba.',tiles:['They','set','up','their','capital','in','Cordoba.']}
 ]}
];
/* محقّق الأخطاء: جملة صحيحة من الكتاب وصيغة فيها خطأ واحد */
const DET=[
 ['U1','Grandma lives in Jenin.','Grandma live in Jenin.','مع المفرد الغائب نضيف s إلى فعل المضارع البسيط: lives.'],
 ['U1','Mum is using the phone in the kitchen now.','Mum is use the phone in the kitchen now.','المضارع المستمر: is + الفعل مع ing (is using).'],
 ['U2','The kebabs smell delicious.','The kebabs smells delicious.','الفاعل جمع (The kebabs) فلا نضيف s إلى الفعل.'],
 ['U2','People used to sing folk songs.','People used to singing folk songs.','بعد used to يأتي الفعل في صيغته الأصلية: used to sing.'],
 ['U3',"I haven't found my trainers yet.","I haven't find my trainers yet.",'المضارع التام: have + التصريف الثالث (found).'],
 ['U3','Have you ever been there?','Have you ever went there?','بعد have نستعمل التصريف الثالث: been وليس went.'],
 ['U3','My group have been here for three weeks.','My group have been here since three weeks.','مع المدة (three weeks) نستعمل for وليس since.'],
 ['U11','Would you like another cake?','Would you like to another cake?','بعد Would you like يأتي الاسم مباشرة: Would you like another cake?'],
 ['U11',"He's riding round town to receive everyone's congratulations.","He's riding round town for receive everyone's congratulations.",'للتعبير عن الغرض نستعمل to + الفعل.'],
 ['U12','Dad says you need to check my details.','Dad say you need to check my details.','الفاعل مفرد غائب (Dad) فنقول says.'],
 ['U13','Turn off your computer.','Turn of your computer.','الفعل المركّب الصحيح هو turn off (بحرفين f).'],
 ['U13','They took the country over very quickly.','They taked the country over very quickly.','take فعل شاذ، وماضيه took.']
];
/* آلة الأزمنة */
const SUBJ=[['I','أنا'],['She','هي'],['We','نحن']];
const VERBS=[
 {b:'play',s:'plays',ing:'playing',p:'played',pp:'played',o:'football',ar:'يلعب كرة القدم'},
 {b:'visit',s:'visits',ing:'visiting',p:'visited',pp:'visited',o:'Grandma',ar:'يزور الجدة'},
 {b:'eat',s:'eats',ing:'eating',p:'ate',pp:'eaten',o:'breakfast',ar:'يتناول الفطور'},
 {b:'write',s:'writes',ing:'writing',p:'wrote',pp:'written',o:'an email',ar:'يكتب رسالة إلكترونية'},
 {b:'go',s:'goes',ing:'going',p:'went',pp:'gone',o:'to school',ar:'يذهب إلى المدرسة'}];
const TIMES=[
 {k:'ps',ar:'كل يوم',name:'المضارع البسيط',rule:'للعادات والأفعال المتكرّرة. نضيف s مع he / she / it.',f:(s,v)=>[s,s==='She'?v.s:v.b,v.o,'every day']},
 {k:'pc',ar:'الآن',name:'المضارع المستمر',rule:'لحدث يجري الآن: am / is / are + الفعل مع ing.',f:(s,v)=>[s,(s==='I'?'am':s==='She'?'is':'are')+' '+v.ing,v.o,'now']},
 {k:'past',ar:'أمس',name:'الماضي البسيط',rule:'لحدث انتهى في الماضي: التصريف الثاني (ed أو شاذ).',f:(s,v)=>[s,v.p,v.o,'yesterday']},
 {k:'pp',ar:'بالفعل',name:'المضارع التام',rule:'لحدث تمّ قبل الآن: have / has + التصريف الثالث.',f:(s,v)=>[s,(s==='She'?'has':'have')+' already '+v.pp,v.o,'']},
 {k:'fut',ar:'غدًا',name:'المستقبل (going to)',rule:'لخطة في المستقبل: am / is / are + going to + الفعل.',f:(s,v)=>[s,(s==='I'?'am':s==='She'?'is':'are')+' going to '+v.b,v.o,'tomorrow']}];
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
