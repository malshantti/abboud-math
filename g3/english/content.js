// English for Palestine 3A — الصفّ الثالث، الفصل الأوّل. الوحدات والكلمات والتراكيب كما في فهرس كتاب الطالب (ص 3).
window.AR_AUDIO={};
(function(){
const E=s=>'<span class="ltr en">'+s+'</span>';
const tbl=r=>'<table class="ltr en">'+r.map(x=>'<tr><td>'+x[0]+'</td><td dir="rtl">'+x[1]+'</td></tr>').join('')+'</table>';
const Q=(q,a,...w)=>({q,o:[a,...w],a:0,html:true});
const U=[
 ['All about me','كلّ شيء عنّي',4,
  [['Good morning','صباح الخير'],['Good afternoon','مساء الخير'],['How are you? — Fine, thanks.','كيف حالك؟ — بخير، شكرًا.'],['What\'s your name? — My name\'s Walid.','ما اسمك؟ — اسمي وليد.'],['How old are you? — I\'m nine.','كم عمرك؟ — عمري تسع سنوات.'],['Where are you from? — I\'m from Bethlehem.','من أين أنت؟ — أنا من بيت لحم.']],
  [Q('What\'s your name?','My name\'s Hamzah.','I\'m 8.','I\'m from Jerusalem.'),Q('How old are you?','I\'m 8.','I\'m fine.','My name\'s Rana.'),Q('How are you?','I\'m fine.','I\'m from Gaza.','I\'m 9.'),Q('Where are you from?','I\'m from Jerusalem.','I\'m fine.','My name\'s Walid.'),Q('Manar is a girl. ___ name is Manar.','Her','His','He'),Q('Walid is a boy. ___ 9.','He\'s','She\'s','Her'),Q('Hala is a girl. ___ from Haifa.','She\'s','He\'s','His')],
  'His / Her — He\'s / She\'s'],
 ['He\'s a doctor','إنّه طبيب',10,
  [['doctor','طبيب'],['nurse','ممرّض'],['police officer','شرطيّ'],['teacher','معلّم'],['dentist','طبيب أسنان'],['farmer','مزارع'],['driver','سائق'],['uncle / aunt','عمّ / عمّة']],
  [Q('What\'s his job? He\'s a ___ . (يعالج الأسنان)','dentist','farmer','driver'),Q('He drives a bus. He\'s a ___ .','driver','nurse','teacher'),Q('She works in a school. She\'s a ___ .','teacher','farmer','doctor'),Q('Who\'s he? He\'s my ___ . (والد أبي)','grandfather','aunt','sister'),Q('What\'s her job?','She\'s a nurse.','He\'s a nurse.','I\'m 8.'),Q('three = ؟','3','5','2'),Q('He grows olives. He\'s a ___ .','farmer','police officer','dentist')],
  'What\'s his/her job? He\'s/She\'s a …'],
 ['At the market','في السوق',16,
  [['apples','تفّاح'],['figs','تين'],['onions','بصل'],['melon','شمّام'],['oranges','برتقال'],['carrots','جزر'],['tomatoes','بندورة'],['bananas','موز'],['grapes','عنب'],['potatoes','بطاطا']],
  [Q('🍌 = ?','bananas','grapes','figs'),Q('🥕 = ?','carrots','onions','potatoes'),Q('🍅 = ?','tomatoes','apples','oranges'),Q('I\'d like figs, please. — ___','Here you are.','I\'m fine.','My name\'s Ali.'),Q('That\'s 10 ___ .','dinars','apples','teachers'),Q('I ___ like carrots. (لا أحبّ)','don\'t','am','is'),Q('🍇 = ?','grapes','melon','bananas')],
  'I\'d like … please. / I don\'t like …'],
 ['At the zoo','في حديقة الحيوان',22,
  [['tiger','نمر'],['fox','ثعلب'],['giraffe','زرافة'],['elephant','فيل'],['snake','أفعى'],['monkey','قرد'],['grey / brown / orange','رماديّ / بنّيّ / برتقاليّ'],['It has no legs.','ليس له أرجل.']],
  [Q('It has no legs. It\'s a ___ .','snake','monkey','tiger'),Q('It\'s big and grey. It\'s an ___ .','elephant','fox','snake'),Q('It has a long neck. It\'s a ___ .','giraffe','fox','monkey'),Q('🐒 = ?','monkey','tiger','giraffe'),Q('🦊 = ?','fox','elephant','snake'),Q('seven = ؟','7','6','9'),Q('The tiger is ___ and black.','orange','grey','blue')],
  'It\'s … / It has …'],
 ['Revision','مراجعة الوحدات 1–4',28,null,null,null],
 ['I don\'t feel well','لا أشعر أنّي بخير',34,
  [['head','رأس'],['stomach','معدة'],['back','ظهر'],['foot / feet','قدم / أقدام'],['tooth / teeth','سنّ / أسنان'],['What\'s the matter?','ما بك؟'],['My head hurts.','رأسي يؤلمني.'],['Go to the doctor. / Have a rest. / Take this medicine.','اذهب إلى الطبيب. / خذ قسطًا من الراحة. / خذ هذا الدواء.']],
  [Q('My teeth hurt. — Go to the ___ .','dentist','farmer','zoo'),Q('What\'s the matter?','My head hurts.','I\'m 9.','It\'s sunny.'),Q('one tooth, two ___','teeth','tooths','foots'),Q('one foot, two ___','feet','foots','teeth'),Q('I feel tired. — Go to ___ .','bed','school','the market'),Q('Take this ___ .','medicine','banana','car'),Q('معدة = ?','stomach','back','head')],
  'What\'s the matter? My … hurts.'],
 ['My day','يومي',40,
  [['I get up.','أستيقظ.'],['I go to school.','أذهب إلى المدرسة.'],['I watch cartoons.','أشاهد الرسوم المتحرّكة.'],['I play computer games.','ألعب ألعاب الحاسوب.'],['I do homework.','أكتب الواجب.'],['I go to bed.','أذهب إلى النوم.'],['in the morning / afternoon / evening / at night','في الصباح / بعد الظهر / المساء / في الليل']],
  [Q('When do you get up?','In the morning.','At the zoo.','I\'m fine.'),Q('I go to ___ at night.','bed','school','the market'),Q('أكتب الواجب = ?','I do homework.','I watch cartoons.','I get up.'),Q('What do you do in the afternoon?','I play computer games.','My head hurts.','It\'s cold.'),Q('in the ___ (المساء)','evening','morning','night'),Q('I ___ cartoons.','watch','go','get'),Q('I go to school in the ___ .','morning','night','evening')],
  'What do you do in the …? / When do you …?'],
 ['It\'s sunny','الجوّ مشمس',46,
  [['sunny','مشمس'],['rainy','ماطر'],['windy','عاصف'],['cloudy','غائم'],['hot / cold','حارّ / بارد'],['beach','شاطئ'],['park','حديقة عامّة'],['swimming pool','بركة سباحة'],['playground','ساحة لعب'],['river','نهر']],
  [Q('☀️ What\'s the weather?','It\'s sunny.','It\'s rainy.','It\'s cloudy.'),Q('🌧️ What\'s the weather?','It\'s rainy.','It\'s hot.','It\'s windy.'),Q('☁️ = ?','cloudy','sunny','windy'),Q('Where are they? 🏖️','at the beach','at the zoo','at school'),Q('ماطر = ?','rainy','windy','cold'),Q('It\'s hot. Let\'s go to the ___ .','swimming pool','doctor','bed'),Q('They are ___ the park.','at','is','he')],
  'What\'s the weather? It\'s … / at the …'],
 ['Revision','مراجعة الوحدات 1–8',52,null,null,null]];
const units=[],lev=[];
U.forEach((u,i)=>{const n=i+1;
 if(!u[3]){const pool=[].concat(...U.slice(0,i).filter(x=>x[3]).map(x=>x[4]));
  units.push({id:'u'+n,t:'Unit '+n+' — '+u[0]+' ('+u[1]+')',les:[{id:'e'+n,t:u[0]+' — '+u[1],pg:u[2],goals:['أراجع كلمات الوحدات السابقة وتراكيبها.'],steps:[{h:'نراجع معًا',b:'<p>نراجع ما تعلّمناه في الوحدات '+(n===5?'1–4':'1–8')+'. اضغط «تدرّب» لأسئلة متنوّعة.</p>'+tbl([].concat(...U.slice(0,i).filter(x=>x[3]).map(x=>x[3].slice(0,2))))}],qs:pool.filter((_,k)=>k%2===0)}]});return}
 const voc=u[3],w=voc.map(x=>x[1]);
 units.push({id:'u'+n,t:'Unit '+n+' — '+u[0]+' ('+u[1]+')',les:[
  {id:'e'+n+'w',t:'Words — كلمات الوحدة',pg:u[2],goals:['أتعرّف كلمات وحدة «'+u[0]+'».','أربط الكلمة بمعناها.'],
   steps:[{h:'كلمات جديدة',say:'en'+n+'-words',b:tbl(voc),ck:{q:'<span class="ltr en">'+voc[0][0]+'</span> = ؟',o:[voc[0][1],voc[1][1],voc[2][1]],a:0}}],
   qs:voc.map((v,k)=>Q('<span class="ltr en">'+v[0]+'</span> = ؟',v[1],w[(k+1)%w.length],w[(k+2)%w.length]))},
  {id:'e'+n+'l',t:'Language — '+u[5],pg:u[2]+2,goals:['أستخدم التركيب: '+u[5]+'.'],
   steps:[{h:'نقول ونجيب',say:'en'+n+'-lang',b:'<p class="ltr en">'+u[5]+'</p>'+tbl(voc.filter(v=>/[?.]/.test(v[0])).concat(voc).slice(0,4)),ck:{q:u[4][0].q,o:u[4][0].o,a:0}}],
   qs:u[4]}]});
});
window.G3={sub:'english',name:'English — الصفّ الثالث',term:'Student\'s Book 3A: Units 1–9',
intro:'كلمات وتراكيب كتاب English for Palestine 3A، مع أسئلة «تحقّق».',
source:'المصدر: English for Palestine 3A — وزارة التربية والتعليم الفلسطينيّة (Macmillan)، فهرس ص 3.',units,
basics:[
 {id:'jobs',t:'Jobs',d:'المهن — Unit 2',ic:'user',ask:'ما معنى الكلمة؟',ltr:true,cards:U[1][3].map(v=>[v[0],v[1]])},
 {id:'food',t:'Food',d:'الطعام — Unit 3',ic:'leaf',ask:'ما معنى الكلمة؟',ltr:true,cards:U[2][3].map(v=>[v[0],v[1]])},
 {id:'animals',t:'Animals',d:'الحيوانات — Unit 4',ic:'heart',ask:'ما معنى الكلمة؟',ltr:true,cards:U[3][3].slice(0,6).map(v=>[v[0],v[1]])},
 {id:'weather',t:'Weather',d:'الطقس — Unit 8',ic:'bolt',ask:'ما معنى الكلمة؟',ltr:true,cards:U[7][3].slice(0,5).map(v=>[v[0],v[1]])},
 {id:'nums',t:'Numbers 1–10',d:'الأعداد — Units 2 & 4',ic:'puzzle',ask:'ما العدد؟',ltr:true,cards:['one','two','three','four','five','six','seven','eight','nine','ten'].map((x,i)=>[x,String(i+1)])}]};
})();
