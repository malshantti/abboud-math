// Run every regression: node tests/<file>.cjs (no external packages required).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ar=x=>String(x).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const visible=html=>String(html).replace(/<[^>]*>/g,'');let checks=0;
for(const grade of [6,8]){
const nodes={z:{value:'8'},zv:{},bv:{},bo:{}},A={S:{done:{},seen:{}},R:{},ar,esc:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,save(){},addXP(){},quiz(){},fig(){},toast(){},$:s=>nodes[s.slice(1)],$$:()=>[]};
const context={window:{APP:A,CFG:{grade}},console,setTimeout(){},requestAnimationFrame(){},cancelAnimationFrame(){}};vm.createContext(context);
for(const name of ['content.js','sc-gen.js','sc.js'])vm.runInContext(fs.readFileSync(path.join(root,`g${grade}/science/${name}`),'utf8'),context,{filename:`g${grade}/science/${name}`});
for(const sim of ['microscope','speed']){const html=A.SIM[sim].html();assert.ok(!/[0-9]/.test(visible(html)),`g${grade} ${sim}: displayed numeric labels must use Arabic Indic digits`);checks++;}
A.SIM.bohr.init();for(const z of [1,8,11,20]){nodes.z.value=String(z);nodes.z.oninput();assert.ok(nodes.bv.innerHTML.includes('>'+ar(z)+'p</text>'));assert.equal(nodes.zv.textContent,ar(z));assert.ok(!/[0-9]/.test(visible(nodes.bv.innerHTML)),`g${grade} Bohr redraw ${z}: localized nucleus`);checks++;}
const SG=context.window.SCG;for(let i=0;i<100;i++)for(const type of ['mag','pe']){const q=SG[type]();const spans=[...q.q.matchAll(/<span class="ltr">(.*?)<\/span>/g)].map(m=>visible(m[1]));assert.ok(spans.length>0);assert.ok(spans.every(s=>!/[0-9]/.test(s)));assert.ok(Number.isFinite(q.chk.c),'Internal calculation stays numeric');checks++;}
// Chemical symbols, charges and subscripts retain the notation already used by the book bank.
const calcium=SG.CAT.find(x=>x[0]==='Ca'),chloride=SG.AN.find(x=>x[0]==='Cl');assert.equal(SG.formula(calcium,chloride),'CaCl<sub>2</sub>');assert.ok(A.SIM.formula.html().includes('<sup>2+</sup>'));checks++;
}
console.log('PASS science display numerals: '+checks+' initial/redraw/generator/chemical notation checks');
