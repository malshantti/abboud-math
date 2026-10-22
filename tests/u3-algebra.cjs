/* G6 Unit 3 lessons S1-3-1 … S1-3-5 (algebra): generator answers, genuine distractors, book content, demos.
   Run: node tests/u3-algebra.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,'g6/math',p),'utf8');
const ctx=vm.createContext({console,document:{addEventListener(){}}});ctx.window=ctx;
for(const f of ['content.js','content5.js','gen.js','gen5.js'])vm.runInContext(read(f),ctx,{filename:f});
const cf=s=>s===''?1:+s;const TM=(a,v)=>(a===1?'':a)+v;
function check(id,s,seen){const q=s.q,a=s.a,wrong=s.choices.filter(c=>!c.ok).map(c=>c.t);let m;
 assert.equal(s.choices.filter(c=>c.ok).length,1,q);assert.ok(wrong.length>=2,'at least two distractors: '+q);assert.ok(!wrong.includes(a),q);
 {const J=[q,a,...wrong].join(' | ');assert.ok(!/undefined|NaN/.test(J),'junk: '+J);assert.ok(!/(^|[^\d])1[سصعأ]/.test(J),'written coefficient 1: '+J)}
 if(m=q.match(/^ما معامل الحد الجبري (\d*)([سصع])( [سصع])?؟$/)){seen.add('coef');assert.equal(+a,cf(m[1]))}
 else if(m=q.match(/^ما القيمة العددية للحد (\d+)([سصع]) عندما \2 = (\d+)؟$/)){seen.add('val');assert.equal(+a,m[1]*m[3])}
 else if(m=q.match(/^ما القيمة العددية للحد (\d*)س ص عندما س = (\d+)، ص = (\d+)؟$/)){seen.add('val2');assert.equal(+a,cf(m[1])*m[2]*m[3])}
 else if(q==='أي الصيغ الآتية حد جبري؟'){seen.add('isTerm');assert.match(a,/^\d+[سصع]$/);wrong.forEach(w=>assert.match(w,/[+−]/))}
 else if(m=q.match(/^ما المتغير في الحد الجبري (\d+)([سصع])؟$/)){seen.add('vari');assert.equal(a,m[2])}
 else if(m=q.match(/^يربح لاعب (\d+) نقاط.*فاز ([سصع]) مرة/)){seen.add('word');assert.equal(a,m[1]+m[2])}
 else if(m=q.match(/^ما القيمة العددية للمقدار (\d+)س ([+−]) (\d+)ص عندما س = (\d+)، ص = (\d+)؟$/)){seen.add('eval2');assert.equal(+a,m[1]*m[4]+(m[2]==='+'?1:-1)*m[3]*m[5])}
 else if(m=q.match(/^ما القيمة العددية للمقدار (\d+)س \+ (\d+) عندما س = (\d+)؟$/)){seen.add('evalC');assert.equal(+a,m[1]*m[3]+ +m[2])}
 else if(m=q.match(/^ما عدد الحدود في المقدار الجبري (.+)؟$/)){seen.add('count');assert.equal(+a,m[1].split(/ [+−] /).length)}
 else if(m=q.match(/^أعبّر جبريًا: (.+)$/)){seen.add('words');const p=m[1];let e;
  if(m=p.match(/^باقي طرح (\d+) من (\d+) أمثال العدد س$/))e=`${m[2]}س − ${m[1]}`;else if(m=p.match(/^أقل من ضعفي عدد بمقدار (\d+)$/))e=`2س − ${m[1]}`;
  else if(m=p.match(/^عدد ما مضافًا إليه (\d+)$/))e=`س + ${m[1]}`;else if(m=p.match(/^عدد ما مضروبًا بـ (\d+)$/))e=`${m[1]}س`;
  else if(m=p.match(/^ضعفا عدد مضافًا إلى (\d+)$/))e=`2س + ${m[1]}`;else if(m=p.match(/^باقي طرح ص من (\d+) أمثال س$/))e=`${m[1]}س − ص`;else assert.fail(p);assert.equal(a,e)}
 else if(m=q.match(/س = (\d+) م، ص = (\d+) م، فما محيطه/)){seen.add('perim2');assert.equal(a,`${2*m[1]+2*m[2]} م`)}
 else if(m=q.match(/وبعد (\d+) يومًا دفع (\d+) دينارًا/)){seen.add('driver');assert.equal(a,`${m[1]}س − ${m[2]}`)}
 else if(m=q.match(/^أي الحدود الآتية يشبه الحد (\d+)([سصع])؟$/)){seen.add('like');assert.match(a,new RegExp('^\\d+'+m[2]+'$'));wrong.forEach(w=>assert.notEqual(w.replace(/^\d+/,''),m[2]))}
 else if(m=q.match(/^(\d+)([سصع]) ([+−]) (\d+)\2 = ؟$/)){seen.add('add');assert.equal(a,TM(m[3]==='+'?+m[1]+ +m[4]:m[1]-m[4],m[2]))}
 else if(m=q.match(/^أبسّط: (\d+)س \+ (\d+)ص \+ (\d+)س$/)){seen.add('mixed');assert.equal(a,`${+m[1]+ +m[3]}س + ${m[2]}ص`)}
 else if(m=q.match(/^أبسّط: (\d+)س \+ (\d*)ص \+ (\d+)ص − (\d*)س$/)){seen.add('four');assert.equal(a,`${TM(m[1]-cf(m[4]),'س')} + ${TM(cf(m[2])+ +m[3],'ص')}`)}
 else if(m=q.match(/^مستطيل طوله (\d+)س سم وعرضه (\d*)س سم/)){seen.add('perim3');assert.equal(a,`${2*(+m[1]+cf(m[2]))}س سم`)}
 else if(m=q.match(/عمل (\d+) أيام في الأسبوع الأول و (\d+) أيام/)){seen.add('wage');assert.equal(a,`${+m[1]+ +m[2]}س`)}
 else if(m=q.match(/^(\d+)([سصع]) × (\d+)([سصع]) = ؟$/)){seen.add('mul');assert.equal(a,`${m[1]*m[3]}${m[2]} ${m[4]}`)}
 else if(m=q.match(/^(\d+)\(س ([+−]) (\d+)\) = ؟$/)){seen.add('dist');assert.equal(a,`${m[1]}س ${m[2]} ${m[1]*m[3]}`)}
 else if(m=q.match(/^(\d+)س\((\d+) \+ (\d+)ص\) = ؟$/)){seen.add('distT');assert.equal(a,`${m[1]*m[2]}س + ${m[1]*m[3]}س ص`)}
 else if(m=q.match(/^ما العامل المشترك الأكبر للحدين (\d+)س ص و (\d+)س؟$/)){seen.add('gcf');const g=(x,y)=>y?g(y,x%y):x;assert.equal(a,`${g(+m[1],+m[2])}س`)}
 else if(m=q.match(/^ما العامل المشترك الأكبر للحدين (\d+)أ ب و (\d+)أ ب؟$/)){seen.add('gcf2');const g=(x,y)=>y?g(y,x%y):x;assert.equal(a,`${g(+m[1],+m[2])}أ ب`)}
 else if(m=q.match(/^جدار مستطيل طوله (\d+)ص وعرضه (\d+)س/)){seen.add('area');assert.equal(a,`${m[1]*m[2]}ص س`)}
 else if(m=q.match(/^أكمل: ⬜\((\d+) \+ (\d+)ك\) = (\d+)ل \+ (\d+)ل ك$/)){seen.add('fill');const k=m[3]/m[1];assert.equal(k,m[4]/m[2]);assert.equal(a,`${k}ل`)}
 else if(m=q.match(/^\((\d+)س \+ (\d+)ص\)\((\d+)ع \+ (\d+)ل\) = ؟$/)){seen.add('prod');const [A,B,C,D]=m.slice(1).map(Number);assert.equal(a,`${A*C}س ع + ${A*D}س ل + ${B*C}ص ع + ${B*D}ص ل`)}
 else if(m=q.match(/يصبح لديه 2س − (\d+) دينار\. كم يصبح لديه إذا وضع (\d+) دينار/)){seen.add('trader');assert.equal(a,`${2*m[2]-m[1]} دينار`)}
 else if(m=q.match(/^يبيع مصنع س حذاء رجاليًا بسعر (\d+) دينارًا، و ص حذاء ولاديًا بسعر (\d+)/)){seen.add('shoes');assert.equal(a,`${m[1]}س + ${m[2]}ص`)}
 else assert.fail(id+' unknown question: '+q)}
const want={'S1-3-1':['coef','val','val2','isTerm','vari','word'],'S1-3-2':['eval2','evalC','count','words','perim2','driver'],'S1-3-3':['like','add','mixed','four','perim3','wage'],
 'S1-3-4':['mul','dist','distT','gcf','gcf2','area','fill'],'S1-3-5':['prod','trader','shoes','coef','dist','add','words']};
let cnt=0;for(const id in want){const seen=new Set();for(let i=0;i<3000;i++){check(id,ctx.genFor(id).steps[0],seen);cnt++}for(const k of want[id])assert.ok(seen.has(k),id+' type generated: '+k)}
const all=id=>{const C=ctx.CONTENT[id];return [C.t,...C.r,C.act,...C.ex.flat(),...(C.err||[]).flat()].join('\n')};
for(const [id,res] of Object.entries({'S1-3-1':[/5س/,/50 نقطة/,/120 كغم/,/105/,/المعامل يساوي 1/],'S1-3-2':[/20س \+ 4ص/,/34 م/,/20س − 150/,/3س − ص/,/= 9/],
 'S1-3-3':[/10000س/,/8س/,/9س/,/س \+ 5ص/,/10س/],'S1-3-4':[/12ص س/,/15أب/,/6س \+ 10س ص/,/7س − 21/,/2س/,/3أب/,/6س/,/4س ص/,/3ل/],'S1-3-5':[/3500/,/16س \+ 9ص/,/10س ص/,/18ص ل/,/مشروعي/]}))for(const r of res)assert.match(all(id),r,id+' '+r);
for(let k=1;k<=5;k++){const C=ctx.CONTENT['S1-3-'+k];assert.ok(C.err.length>=3,k+' err');assert.ok(C.ex.length>=8,k+' ex');assert.ok(!/[٠-٩]/.test(all('S1-3-'+k)),'source digits stay Latin')}
const Vs=read('lesson-visuals.js');for(const [id,t] of [['S1-3-1','termParts'],['S1-3-2','substitute'],['S1-3-3','likeTerms'],['S1-3-4','areaDistribute'],['S1-3-5','areaDistribute']]){assert.ok(Vs.includes(`'${id}':'${t}'`),id);assert.ok(new RegExp(`STEPS=\\{[^\\n]*${t}:\\[`).test(Vs),t+' steps');assert.ok(new RegExp(`INSTR=\\{[^\\n]*${t}:'`).test(Vs),t+' instructions')}
console.log(`u3-algebra passed: ${cnt} generated items.`);
