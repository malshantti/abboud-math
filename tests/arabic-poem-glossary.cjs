// T09: node tests/arabic-poem-glossary.cjs — local textbook page p2-117.webp.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'g8/arabic');
// Compare actual precache resources after URL parsing; query versions are not resource names.
const resourcePath=value=>{const url=new URL(value,'https://bustan.test/course/subject/');assert.equal(url.origin,'https://bustan.test','Local resource stays on the site origin');return url.pathname};
const cachePaths=source=>{const match=source.match(/\bF\s*=\s*(\[[\s\S]*?\])\s*[,;]/);assert.ok(match,'Service worker declares its precache list');return new Set(JSON.parse(match[1]).map(resourcePath))};
const A={S:{seen:{},done:{}},R:{},save(){},esc:s=>String(s??''),ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,quiz(){},say:()=>'',fig:()=>''};
const window={APP:A,CFG:{grade:8,ap:'g8ar',title:'اللغة العربية'}};
const context={window,document:{},console};vm.createContext(context);
for(const file of ['content.js','ar-banks.js','ar.js'])vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
const unit=window.UNITS.find(u=>u.id==='P2U7'),poem=unit.sec.poem;
const plain=s=>s.normalize('NFC').replace(/[\u064B-\u0652\u0670\u0640]/g,'');
// Independently transcribed wording of all eleven margin entries on page 117.
const expected=[
 ['كئيبة','حزينة.'],['عبس وذبيان','قبيلتان وقعت بينهما حرب طويلة.'],
 ['جاثم','ملازم لمكانه.'],['التجهم','العبوس، والغضب.'],
 ['الإغضاء','إرخاء جفن العين الأعلى عليها، وهو كناية عن التغافل.'],
 ['أنثني','أرتد.'],['دها','أصاب.'],['العاني','الأسير المعذب.'],
 ['الجدب','القحط.'],['الأدران','الأوساخ، والأمراض.'],['الصرح','القصر العالي.']
];
assert.deepEqual(JSON.parse(JSON.stringify(poem.voc)).map(v=>v.map(plain)),expected);
assert.ok(poem.voc.every(v=>!/[0-9٠-٩]/.test(v.join(' '))),'Verse numbers must not enter the glossary.');
// The actual lesson renderer must show every corrected word and definition.
const html=A.R.u('P2U7','poem'),start=html.indexOf('<div class="voc">');
assert.ok(start>=0);const displayed=html.slice(start,html.indexOf('</div></div>',start)+12);
for(const [word,meaning] of poem.voc){assert.ok(displayed.includes('<b>'+word+'</b>'));assert.ok(displayed.includes(meaning));}
// Exercise the production generator: every eligible poem entry yields a question.
const questions=A.gen.vocabQs({sec:{poem}},poem.voc.length);
assert.equal(questions.length,expected.length);
for(const [word,meaning] of poem.voc){
 const q=questions.find(q=>q.ex===word+': '+meaning);assert.ok(q,word);
 assert.equal(q.o[q.a],meaning);assert.equal(q.o.length,4);assert.equal(new Set(q.o).size,4);
 assert.ok(q.q.includes(word));
}
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');assert.ok(/const V='g8ar-[^']+'/.test(sw));assert.ok(cachePaths(sw).has(resourcePath('content.js')));
console.log('Passed: eleven textbook glossary entries, lesson display and generated questions (T09).');
