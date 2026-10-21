/* دروس «أساسياتي»: شرح متدرج من السهل إلى الأصعب، مرتبط بوحدات الكتاب الفلسطيني. صياغة تعليمية أصلية. */
(()=>{
'use strict';
const C=window.G1_COURSE;if(!C)return;
const sym=value=>({type:'symbol',value});
const pic=(...icons)=>({type:'items',icons});
const shape=value=>({type:'shape',value});
const count=(count,icon='apple')=>({type:'count',icon,count});
const op=(left,operator,right,icon='ball')=>({type:'operation',left,right,operator,icon});
const t=(prompt,scene,labels,answer,explain)=>({prompt,...(scene?{scene}:{}),choices:labels.map(label=>({label:String(label)})),answer,explain});
const add=(id,unitId,title,goal,steps,tasks)=>{const u=C.units.find(x=>x.id===unitId)||C.units[0];
 C.foundations.push({id,title,book:u.book||'p1',page:u.page,goal,steps:steps.map(([text,scene])=>({text,scene})),tasks,referenceKind:'unit-start',referenceLabel:'درس تأسيسي مساند؛ مرجع بداية الوحدة «'+u.title+'»:'});};
add('en-found-numbers','en-u2','Numbers 1 to 5','أعدّ بالإنجليزية من واحد إلى خمسة.',[
 ['one = ١، two = ٢، three = ٣.',count(3)],
 ['four = ٤، five = ٥.',count(5)],
 ['أعدّ التفاحات وأقول: one, two, three, four.',count(4)]
],[t('How many?',count(2),['two','three'],0,'نعدّ: one, two. العدد two.'),t('How many?',count(5),['four','five'],1,'نعدّ حتى five.'),t('ما الرقم الذي يعني three؟',null,['٣','٥'],0,'three تعني ثلاثة.')]);
add('en-found-colours','en-u12','Colours','أتعرف أسماء ثلاثة ألوان.',[
 ['The sun is yellow. الشمس صفراء.',pic('sun')],
 ['The tree is green. الشجرة خضراء.',pic('tree')],
 ['The apple is red. التفاحة حمراء.',pic('apple')]
],[t('What colour is the tree?',pic('tree'),['green','red'],0,'The tree is green.'),t('What colour is the sun?',pic('sun'),['blue','yellow'],1,'The sun is yellow.'),t('ماذا تعني red؟',null,['أحمر','أخضر'],0,'red تعني أحمر.')]);
add('en-found-classroom','en-u6','My classroom','أسمّي أشياء في صفي.',[
 ['This is a book.',pic('book')],
 ['This is a pen. This is a bag.',pic('pen','bag')],
 ['This is a chair. This is a desk.',pic('chair','desk')]
],[t('What is this?',pic('book'),['a book','a bag'],0,'This is a book.'),t('What is this?',pic('pen'),['a chair','a pen'],1,'This is a pen.'),t('What is this?',pic('desk'),['a desk','a door'],0,'This is a desk.')]);
})();
