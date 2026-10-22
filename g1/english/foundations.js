/* دروس «أساسياتي»: شرح متدرج من السهل إلى الأصعب، مرتبط بوحدات الكتاب الفلسطيني. صياغة تعليمية أصلية. */
(()=>{
'use strict';
const C=window.G1_COURSE;if(!C)return;
const sym=value=>({type:'symbol',value});
const pic=(...icons)=>({type:'items',icons});
const shape=value=>({type:'shape',value});
const count=(count,icon='apple')=>({type:'count',icon,count});
const op=(left,operator,right,icon='ball')=>({type:'operation',left,right,operator,icon});
const t=(prompt,scene,labels,answer,explain)=>({prompt,...(scene?{scene}:{}),choices:labels.map(label=>({label:String(label),...(/[A-Za-z]/.test(label)?{say:String(label),sayLang:'en'}:{})})),answer,explain,...(/^[A-Za-z]/.test(prompt)?{say:prompt,sayLang:'en'}:{})});
const add=(id,unitId,title,goal,steps,tasks)=>{const u=C.units.find(x=>x.id===unitId)||C.units[0];
 C.foundations.push({id,title,book:u.book||'p1',page:u.page,goal,steps:steps.map(([text,scene,say])=>({text,scene,say:say||text,sayLang:'en'})),tasks,referenceKind:'unit-start',referenceLabel:'درس تأسيسي مساند؛ مرجع بداية الوحدة «'+u.title+'»:'});};
add('en-found-numbers','en-u2','Numbers 1 to 5','أعدّ بالإنجليزية من واحد إلى خمسة.',[
 ['one — واحد ١',count(1),'one'],
 ['two — اثنان ٢',count(2),'two'],
 ['three — ثلاثة ٣',count(3),'three'],
 ['four — أربعة ٤',count(4),'four'],
 ['five — خمسة ٥',count(5),'five']
],[t('How many?',count(2),['two','three','one'],0,'اثنان: two.'),t('How many?',count(5),['four','three','five'],2,'خمسة: five.'),t('ما معنى three؟',null,['٥','٣','١'],1,'three تعني ثلاثة.')]);
add('en-found-colours','en-u12','Colours','أتعرف أسماء ثلاثة ألوان.',[
 ['yellow — أصفر',pic('sun'),'yellow'],
 ['green — أخضر',pic('tree'),'green'],
 ['red — أحمر',pic('apple'),'red']
],[t('What colour is the tree?',pic('tree'),['red','green','yellow'],1,'الشجرة خضراء: green.'),t('What colour is the sun?',pic('sun'),['yellow','blue','green'],0,'الشمس صفراء: yellow.'),t('ماذا تعني red؟',null,['أخضر','أصفر','أحمر'],2,'red تعني أحمر.')]);
add('en-found-classroom','en-u6','My classroom','أسمّي أشياء في صفي.',[
 ['This is a book.',pic('book')],
 ['This is a pen. This is a bag.',pic('pen','bag')],
 ['This is a chair. This is a desk.',pic('chair','desk')]
],[t('What is this?',pic('book'),['a book','a bag'],0,'This is a book.'),t('What is this?',pic('pen'),['a chair','a pen'],1,'This is a pen.'),t('What is this?',pic('desk'),['a desk','a door'],0,'This is a desk.')]);
})();
