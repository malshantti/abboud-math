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
add('en2-found-letters','en2-u1','Letters and sounds','أربط الحرف بصوته وكلمة تبدأ به.',[
 ['a is for apple.',pic('apple')],
 ['b is for ball. c is for cat.',pic('ball','cat')],
 ['d is for dog. أقول الصوت أولًا ثم الكلمة.',pic('dog')]
],[t('Which word starts with b?',null,['ball','cat'],0,'ball starts with b.'),t('Which word starts with c?',pic('cat'),['dog','cat'],1,'cat starts with c.'),t('apple starts with:',pic('apple'),['a','d'],0,'apple starts with a.')]);
add('en2-found-this','en2-u7','This is my ...','أستعمل This is لأقدّم شيئًا.',[
 ['This is my bag.',pic('bag')],
 ['This is my house.',pic('house')],
 ['It is big. It is small. نصف الشيء بعد This is.',pic('elephant','cat')]
],[t('Choose: ___ is my pen.',pic('pen'),['This','He'],0,'This is my pen.'),t('What is this?',pic('house'),['It is a house.','It is a car.'],0,'It is a house.'),t('The elephant is ___.',pic('elephant'),['big','small'],0,'The elephant is big.')]);
add('en2-found-can','en2-u6','I can ...','أعبّر عما أستطيع فعله.',[
 ['I can jump.',pic('boy')],
 ['I can run. I can swim.',pic('girl')],
 ['Fish can swim. Birds can fly.',pic('fish','bird')]
],[t('Birds can ___.',pic('bird'),['fly','swim'],0,'Birds can fly.'),t('Fish can ___.',pic('fish'),['fly','swim'],1,'Fish can swim.'),t('Choose the correct sentence.',null,['I can jump.','I jump can.'],0,'We say: I can jump.')]);
})();
