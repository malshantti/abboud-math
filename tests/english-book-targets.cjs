'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const window={};vm.runInNewContext(read('g1/english/content.js'),{window});const C=window.G1_COURSE,lessons=C.units.flatMap(u=>u.lessons);
const letters=[];
for(const [unit,set,page] of [[6,'ac',35],[7,'eo',41],[8,'dgq',47],[11,'ilt',11],[12,'bhp',17],[13,'mnr',23],[15,'vwx',35],[16,'juy',41],[17,'fksz',47]]){
 const L=C.units[unit-1].lessons.find(l=>l.id===`en-u${unit}-book-letters-${set}`);assert(L,'Verified lowercase group remains in its source unit');assert.equal(L.page,page);assert.equal(L.tasks.length,set.length);assert(L.guidedPractice.length,'Writing practice is explicit and manual');assert(L.references.some(r=>r.page===page&&r.pdfPage===page),'Source is the inspected writing page');
 for(const [i,letter] of [...set].entries()){
  const T=L.tasks[i],valid=T.choices.map((choice,index)=>choice.label.includes(letter)?index:-1).filter(i=>i>=0);assert.deepEqual(Array.from(valid),[T.answer],'Only one offered word contains the target letter '+letter);letters.push(letter);
 }
}
assert.equal(new Set(letters).size,26,'All lowercase letters are addressed in their actual book groups');
assert.equal([...letters].sort().join(''),'abcdefghijklmnopqrstuvwxyz');
assert(lessons.find(l=>l.id==='en-u1-letter-pairs').referenceLabel.includes('تدريب إضافي'),'Extra uppercase pairing is not presented as the first book period');
const fruit=lessons.find(l=>l.id==='en-u16-book-one-many');for(const T of fruit.tasks){const correct=T.choices[T.answer].label;assert(T.scene.count>1?/They’re|these/.test(correct):/What’s|It’s/.test(correct),'Singular or plural agrees with the pictured quantity');}
const context={window:{}};vm.runInNewContext(read('g1/shared/art.js'),context);vm.runInNewContext(read('g1/shared/language-art.js'),context);const art=context.window.G1_ART;
const colour=lessons.find(l=>l.id==='en-u12-book-two-colours');for(const T of colour.tasks){const rendered=art.scene(T.scene);assert(rendered.includes('<svg')&&rendered.includes('مظلة'),'The two-colour question has a real local drawing');const expected=[T.scene.colour.first,T.scene.colour.second].join(' and ');assert.equal(T.choices[T.answer].label.toLowerCase(),expected+'.');}
const sizes=lessons.find(l=>l.id==='en-u16-book-size-comparison');for(const T of sizes.tasks){assert.equal(T.choices[T.answer].label,T.scene.sizes.target===0?'very small':'very big','The highlighted extreme matches the comparative description');assert(art.scene(T.scene).includes('أربع كرات'),'The size comparison displays its visual reference group');}
for(const bad of [{colour:{first:'__proto__',second:'<script>'}},{sizes:{target:'" onload="x'}}])assert(!/<script|onload=|\[object Object\]/.test(art.scene({type:'symbol',value:'ألاحظ',...bad})),'New scene descriptors escape unsafe values');
const second={};vm.runInNewContext(read('g2/english/content.js'),{window:second});const D=second.G1_COURSE,upper=[];
for(const [unit,set,page] of [[1,'ac',9],[2,'eo',15],[3,'dgq',21],[4,'ilt',25],[5,'bhp',31],[6,'mnr',37],[7,'juy',45],[8,'vwx',49],[9,'fksz',57]]){
 const L=D.units[unit-1].lessons.find(l=>l.id===`en2-u${unit}-book-letter-pairs-${set}`);assert(L,'Part A capitals occur in their actual unit, including Revision');assert.equal(L.page,page);
 for(const [i,letter] of [...set].entries()){const T=L.tasks[i];assert.equal(T.choices[T.answer].label,letter.toUpperCase());assert.equal(T.choices.filter(c=>c.label===letter.toUpperCase()).length,1);upper.push(letter);}
}
assert.equal([...upper].sort().join(''),'abcdefghijklmnopqrstuvwxyz');
const firstNumbers=D.units[0].lessons.filter(l=>l.id.includes('-book-number-review-')).flatMap(l=>l.tasks);assert.equal(firstNumbers.length,10);for(const T of firstNumbers)assert(T.scene.count>=1&&T.scene.count<=10,'Second grade reviews quantities before its new 11–20 targets');
const devices=D.units[11].lessons.find(l=>l.id==='en2-u12-book-desk-relationships');assert.deepEqual(Array.from(devices.tasks,T=>T.choices[T.answer].label),['next to','between']);
for(const T of devices.tasks)assert(art.scene(T.scene).includes('<svg'),'Spatial item relationship has actual visual evidence');
const secondLessons=D.units.flatMap(u=>u.lessons),candles=secondLessons.find(l=>l.id==='en2-u17-book-count-candles');
for(const T of candles.tasks){assert.equal((art.scene(T.scene).match(/<rect /g)||[]).length,T.scene.birthdayCandles,'The picture has exactly the number of birthday candles being counted');assert.equal(T.choices[T.answer].label,T.scene.birthdayCandles===7?'Seven candles.':'Five candles.');}
const red=art.scene({type:'symbol',value:'ألاحظ',person:{hairColor:'red',eyeColor:'blue'}});assert(red.includes('#b85b3b')&&red.includes('#467fa7')&&red.includes('شعره أحمر')&&red.includes('عيناه زرقاوان'),'Actual book hair and eye colours are represented consistently');
console.log('English inspected-book targets: lowercase progression, unique letter questions, singular/plural quantities, visual colour/size evidence.');
