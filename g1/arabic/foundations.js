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
 C.foundations.push({id,title,book:u.book||'p1',page:u.page,goal,steps:steps.map(([text,scene])=>({text,scene})),tasks,referenceKind:'unit-start',referenceLabel:'كتابي:'});};
add('ar-found-dir-v2','ar-prep','أقرأ من اليمين','أبدأ القراءة من اليمين.',[
 ['أبدأ من اليمين.',sym('دَار')],
 ['حرفًا حرفًا: دَ، ا، ر.',sym('د ا ر')],
 ['في الجملة أبدأ من اليمين.',sym('نَامَ بَابَا.')]
],[t('من أين أبدأ القراءة؟',null,['من اليمين','من اليسار'],0,'العربية تُقرأ من اليمين.'),t('ما أول حرف في «دَار»؟',sym('دَار'),['ر','د'],1,'نبدأ من اليمين: د.'),t('ما أول كلمة في «نَامَ بَابَا»؟',sym('نَامَ بَابَا.'),['نَامَ','بَابَا'],0,'الكلمة التي على اليمين: نَامَ.')]);
add('ar-found-haraka','ar-p1-1','الحركات القصيرة','أميّز الفتحة والضمة والكسرة.',[
 ['الفتحة خط صغير فوق الحرف: رَ.',sym('رَ')],
 ['الضمة واو صغيرة فوق الحرف: رُ.',sym('رُ')],
 ['الكسرة خط صغير تحت الحرف: رِ. أقرأ: رَ، رُ، رِ.',sym('رَ رُ رِ')]
],[t('أي حرف عليه فتحة؟',null,['دَ','دُ','دِ'],0,'الفتحة خط فوق الحرف: دَ.'),t('أي حرف عليه ضمة؟',null,['بِ','بُ'],1,'الضمة واو صغيرة فوق الحرف: بُ.'),t('أين توضع الكسرة؟',null,['تحت الحرف','فوق الحرف'],0,'الكسرة خط صغير تحت الحرف، مثل: مِ.')]);
add('ar-found-madd-v2','ar-p1-3','المدود الثلاثة','أمدّ الصوت بالألف والواو والياء.',[
 ['ألف بعد الفتحة: بَا.',sym('بَا')],
 ['واو بعد الضمة، وياء بعد الكسرة.',sym('بَا بُو بِي')],
 ['كلمة فيها مدّ بالواو.',sym('دُود')]
],[t('أيّها فيه مدّ بالألف؟',null,['دُو','دَا','دِي'],1,'الألف بعد الفتحة: دَا.'),t('أيّها فيه مدّ بالياء؟',null,['بِي','بُو'],0,'الياء بعد الكسرة: بِي.'),t('في «دُود» مدّ بـ:',sym('دُود'),['الألف','الواو','الياء'],1,'بعد ضمة الدال واو مدّ.')]);
add('ar-found-sentence-v2','ar-p1-5','حرف وكلمة وجملة','أفرّق بين الحرف والكلمة والجملة.',[
 ['هذا حرف.',sym('ن')],
 ['هذه كلمة.',sym('نَامَ')],
 ['هذه جملة.',sym('نَامَ بَابَا.')]
],[t('أيّها حرف؟',null,['بَاب','ب'],1,'«ب» حرف واحد.'),t('أيّها كلمة؟',null,['دَار','د'],0,'«دَار» كلمة.'),t('أيّها جملة؟',null,['نَامَ بَابَا.','بَابَا'],0,'«نَامَ بَابَا» جملة.')]);
})();
/* ضبط مفاتيح الصوت: نص العرض هو مفتاح التسجيل، فلا يتكرر نص واحد بنطقين مختلفين. */
(()=>{const C=window.G1_COURSE;if(!C)return;const EN=C.id==='english',AR=/[\u0621-\u064a]/;
 const tag=n=>{let s='';do{s+=n&1?'\u200c':'\u200b';n>>=1;}while(n);return s;};
 const all=[...C.units.flatMap(u=>u.lessons),...(C.foundations||[])];
 const seen=new Map();let k=0;
 const fix=(node,field)=>{const d=node[field];if(!node.say||typeof d!=='string')return;
  if(EN&&node.lang==='en'&&AR.test(d)){
   if(field==='text'&&d.includes(' — ')){const [e,...a]=d.split(' — ');if(!AR.test(e)){node.text=e.trim();if(node.scene)node.scene={...node.scene,caption:a.join(' — ').trim()};else node.scene={type:'symbol',value:e.trim(),caption:a.join(' — ').trim()};}}
   else if(field==='prompt'&&node.listen)node.prompt='Listen and choose.';
   else{delete node.say;delete node.lang;return;}
  }
  const cur=node[field],prev=seen.get(cur);
  if(prev!==undefined&&prev!==node.say){node[field]=cur+tag(++k);}else seen.set(cur,node.say);
 };
 for(const l of all){(l.steps||[]).forEach(s=>fix(s,'text'));(l.tasks||[]).forEach(t=>fix(t,'prompt'));}
})();
