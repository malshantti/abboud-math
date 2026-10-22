/* G6 Unit 2 lessons S1-2-1 … S1-2-8: generator answers, genuine distractors, book content, demos.
   Run: node tests/u2-geometry.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,'g6/math',p),'utf8');
const ctx=vm.createContext({console,document:{addEventListener(){}}});ctx.window=ctx;
for(const f of ['content.js','content5.js','gen.js','gen5.js'])vm.runInContext(read(f),ctx,{filename:f});
const n=t=>parseFloat(String(t).replace(',','.'));
const kindA=(a,b,c)=>{const m=Math.max(a,b,c);return m<90?'حاد الزوايا':m===90?'قائم الزاوية':'منفرج الزاوية'};
const tri=s=>{s=[...s].sort((x,y)=>x-y);return s[0]+s[1]>s[2]};
function check(id,s,seen){const q=s.q,a=s.a,wrong=s.choices.filter(c=>!c.ok).map(c=>c.t);let m;
 assert.equal(s.choices.filter(c=>c.ok).length,1,q);assert.ok(wrong.length>=2,'at least two distractors: '+q);assert.ok(!wrong.includes(a),q);
 if(m=q.match(/^مثلث قياسات زواياه (\d+)° ، (\d+)° ، (\d+)°/)){seen.add('kind3');assert.equal(+m[1]+ +m[2]+ +m[3],180);assert.equal(a,kindA(+m[1],+m[2],+m[3]),q)}
 else if(m=q.match(/^مثلث قياس زاويتين فيه (\d+)° و (\d+)°/)){seen.add('kind2');assert.equal(a,kindA(+m[1],+m[2],180-m[1]-m[2]),q)}
 else if(m=q.match(/^لرسم المثلث (\S+) (\S+) (\S+) علمنا/)){seen.add('incl');assert.equal(a,m[2])}
 else if(m=q.match(/^نرسم مثلثًا أطوال أضلاعه (\d+) سم ، (\d+) سم ، (\d+) سم/)){seen.add('sss');assert.ok(tri([+m[1],+m[2],+m[3]]));assert.equal(a,`${m[1]} سم و ${m[2]} سم`)}
 else if(m=q.match(/و ب = (\d+)° و جـ = (\d+)°\. ما قياس الزاوية أ/)){seen.add('asa');assert.equal(n(a),180-m[1]-m[2])}
 else if(q==='أيّ مجموعات الأطوال الآتية تصلح لرسم مثلث؟'){seen.add('ineq');assert.ok(tri(a.split(' ، ').map(Number)),q+a);wrong.forEach(w=>assert.ok(!tri(w.split(' ، ').map(Number)),w))}
 else if(m=q.match(/قياس إحدى زاويتي القاعدة (\d+)°\. ما قياس زاوية الرأس/)){seen.add('apex');assert.equal(n(a),180-2*m[1])}
 else if(m=q.match(/^مثلث فيه زاويتان قياسهما (\d+)° و (\d+)°/)){seen.add('third');assert.equal(n(a),180-m[1]-m[2])}
 else if(m=q.match(/^مثلث أطوال أضلاعه (\d+) سم ، (\d+) سم ، (\d+) سم\. ما نوعه/)){seen.add('sides');const s=[+m[1],+m[2],+m[3]];assert.ok(tri(s));const u=new Set(s).size;assert.equal(a,u===1?'متساوي الأضلاع':u===2?'متساوي الساقين':'مختلف الأضلاع')}
 else if(m=q.match(/^ضلعان في مثلث طولاهما (\d+) سم و (\d+) سم.*ما (أطول|أقصر)/)){seen.add('range');const x=+m[1],y=+m[2];assert.equal(n(a),m[3]==='أطول'?x+y-1:Math.abs(x-y)+1);wrong.forEach(w=>{if(/^\d+ سم$/.test(w))assert.ok(!tri([x,y,n(w)])||m[3]==='أطول'&&n(w)<x+y-1||m[3]==='أقصر'&&n(w)>Math.abs(x-y)+1,w)})}
 else if(m=q.match(/طول قاعدته (\d+) سم\. العمود النازل/)){seen.add('halfBase');assert.equal(n(a),m[1]/2)}
 else if(m=q.match(/زاوية رأسه (\d+)°\. العمود النازل/)){seen.add('halfApex');assert.equal(n(a),m[1]/2)}
 else if(m=q.match(/ب د = (\d+) سم\. ما طول ب جـ/)){seen.add('fullBase');assert.equal(n(a),2*m[1])}
 else if(m=q.match(/زاوية رأسه (\d+)°\. ما قياس كل من زاويتي القاعدة/)){seen.add('baseAng');assert.equal(n(a),(180-m[1])/2)}
 else if(m=q.match(/^مثلث طول قاعدته (\d+) سم وارتفاعه (\d+) سم/)){seen.add('area');assert.equal(n(a),m[1]*m[2]/2)}
 else if(m=q.match(/^مثلث مساحته (\d+) سم² وطول قاعدته (\d+) سم/)){seen.add('height');assert.equal(n(a),2*m[1]/m[2])}
 else if(m=q.match(/ضلعي القائمة (\d+) سم و (\d+) سم، وطول الضلع الثالث (\d+)/)){seen.add('rightArea');assert.equal(m[1]**2+m[2]**2,m[3]**2);assert.equal(n(a),m[1]*m[2]/2)}
 else if(m=q.match(/مربعة طول ضلعها (\d+) سم قُسمت/)){seen.add('candy');assert.equal(n(a),m[1]**2/2)}
 else if(/شبه المنحرف|رباعي|ساقاه|قاعدتاه/.test(q)&&!/°| سم|السور|ما اسم الشكل:/.test(q)&&!/زاويتا/.test(q)){seen.add('trapName');
  if(m=q.match(/في شبه المنحرف (\S+) (\S+) (\S+) (\S+)، الضلع/)){const [_,p,qq,r,s]=m;if(/ما ساقاه/.test(q))assert.equal(a,`${p} ${qq} و ${r} ${s}`);else assert.equal(a,`${p} ${s} و ${qq} ${r}`)}}
 else if(m=q.match(/زاويتي القاعدة الكبرى (\d+)°/)){seen.add('isoTrap');assert.equal(n(a),180-m[1])}
 else if(m=q.match(/^ثلاث زوايا في شكل رباعي قياساتها (\d+)° ، (\d+)° ، (\d+)°/)){seen.add('quad');assert.equal(n(a),360-m[1]-m[2]-m[3])}
 else if(m=q.match(/قائم الزاوية، إحدى زاويتيه غير القائمتين (\d+)°/)){seen.add('rightTrap');assert.equal(n(a),180-m[1])}
 else if(m=q.match(/السور حولها (\d+) م، وطولا قاعدتيها (\d+) م و (\d+) م/)){seen.add('fence');assert.equal(n(a),(m[1]-m[2]-m[3])/2)}
 else if(m=q.match(/متساوي الساقين طول أحد قطريه (\d+) سم/)){seen.add('diagEq');assert.equal(n(a),+m[1])}
 else if(m=q.match(/فيه أ ب = (\d+) سم\. ما طول جـ د/)){seen.add('oppSide');assert.equal(n(a),+m[1])}
 else if(m=q.match(/قياس إحدى زواياه (\d+)°\. ما قياس كل من الزاويتين المجاورتين/)){seen.add('adj');assert.equal(n(a),180-m[1])}
 else if(m=q.match(/^قطر في متوازي أضلاع طوله (\d+) سم/)){seen.add('diagHalf');assert.equal(n(a),m[1]/2)}
 else if(m=q.match(/سلك طوله (\d+) سم متوازي أضلاع، طول أحد أضلاعه (\d+) سم/)){seen.add('wire');assert.equal(n(a),(m[1]-2*m[2])/2)}
 else if(m=q.match(/^ما اسم الشكل: متوازي أضلاع (.+)؟$/)){seen.add('family');assert.equal(a,{'تساوت زواياه واختلفت أضلاعه':'مستطيل','تساوت أضلاعه واختلفت زواياه':'معين','تساوت أضلاعه وزواياه':'مربع'}[m[1]])}
 else if(m=q.match(/زاويتا إحدى قاعدتيه متساويتان، وكل منهما (\d+)°/)){seen.add('trapBase');assert.equal(n(a),180-m[1])}
 else if(/متوازي الأضلاع|متوازي أضلاع؟|المعين متوازي/.test(q)){seen.add('famQ');assert.ok(['شبه المنحرف','أضلاعه','القاعدتان'].includes(a))}
 else assert.fail(id+' unknown question: '+q)}
const want={'S1-2-1':['kind3','kind2','incl','sss','asa'],'S1-2-2':['ineq','apex','third','sides','range'],'S1-2-3':['halfBase','halfApex','fullBase','baseAng'],'S1-2-4':['area','height','rightArea','candy'],
 'S1-2-5':['trapName'],'S1-2-6':['isoTrap','quad','rightTrap','fence','diagEq'],'S1-2-7':['oppSide','adj','diagHalf','wire','family'],'S1-2-8':['famQ','trapBase','ineq','area','wire']};
let cnt=0;for(const id in want){const seen=new Set();for(let i=0;i<3000;i++){check(id,ctx.genFor(id).steps[0],seen);cnt++}for(const k of want[id])assert.ok(seen.has(k),id+' type generated: '+k)}
const all=id=>{const C=ctx.CONTENT[id];return [C.t,...C.r,C.act,...C.ex.flat(),...(C.err||[]).flat()].join('\n')};
for(const [id,res] of Object.entries({'S1-2-1':[/6 سم ، 5 سم ، 3 سم/,/70°/,/100°/,/المحصورة/,/10 سم/,/50°/],'S1-2-2':[/60°/,/2 ، 4 ، 6/,/16 سم/,/64 سم/,/30 سم/,/17 ، 17 ، 17/,/15 < 16/],
 'S1-2-3':[/5 سم/,/12,5 سم/,/محور تماثل/,/مستطيل/],'S1-2-4':[/24 سم²/,/36 قطعة/,/8 سم/,/امتداد/],'S1-2-5':[/قاعدتي/,/ساقي/,/مهما امتدّا/],'S1-2-6':[/140°/,/20 م/,/270°/,/60°/,/محور تماثل واحد/],
 'S1-2-7':[/7 سم/,/8 سم/,/معين/,/مربع/,/115°/,/140°/],'S1-2-8':[/شبه المنحرف/,/70°/,/د أ = 8/,/18 سم²/]}))for(const r of res)assert.match(all(id),r,id+' '+r);
for(let k=1;k<=8;k++){const C=ctx.CONTENT['S1-2-'+k];assert.ok(C.err.length>=3,k+' err');assert.ok(C.ex.length>=6,k+' ex');assert.ok(!/[٠-٩]/.test(all('S1-2-'+k)),'source digits stay Latin (rendered as Arabic-Indic)')}
const V=read('lesson-visuals.js');for(const [id,t] of [['S1-2-1','triKind'],['S1-2-2','triSides'],['S1-2-3','isoAltitude'],['S1-2-4','triangleArea'],['S1-2-5','trapezoid'],['S1-2-6','trapIso'],['S1-2-7','paraProps'],['S1-2-8','triSides']]){assert.ok(V.includes(`'${id}':'${t}'`),id);assert.ok(new RegExp(`STEPS=\\{[^\\n]*${t}:\\[`).test(V),t+' steps');assert.ok(new RegExp(`INSTR=\\{[^\\n]*${t}:'`).test(V),t+' instructions')}
console.log(`u2-geometry passed: ${cnt} generated items.`);
