// T12: observable molecule-building and ionic-lattice behavior, without a DOM dependency.
// Terminology checked against the Palestinian grade-eight science teacher guide,
// printed p.156 / PDF p.159: ionic NaCl crystal, equal positive/negative ion counts.
// https://www.wepal.net/upload/legacy/2019/01-2019/content/5c4624d5d4df1.pdf
// This is a targeted comparison, not certification of every textbook page.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(grade){
 const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:false,attributes:{},setAttribute(k,v){this.attributes[k]=v},classList:{toggle(){}}});return nodes.get(id)};
 const buttons=['H','O','C','N'].map(s=>({dataset:{s}}));
 const A={S:{done:{'qa:preserve':37},seen:{}},R:{},esc:String,ic:()=>'',ar:n=>String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),pick:a=>a[0],shuffle:a=>a.slice(),rnd:()=>0,save(){},addXP(){},quiz(){},fig(){},toast(){},$:s=>node(s.slice(1)),$$:s=>s==='#ab [data-s]'?buttons:[]};
 const c={window:{APP:A,CFG:{grade}},console,setTimeout(){},requestAnimationFrame(){},cancelAnimationFrame(){}};vm.createContext(c);
 for(const name of ['content.js','sc-gen.js','sc.js'])vm.runInContext(fs.readFileSync(path.join(root,`g${grade}/science/${name}`),'utf8'),c,{filename:`g${grade}/science/${name}`});
 A.SIM.atoms.init();return{A,node,buttons,html:A.SIM.atoms.html()};
}
let checks=0;
for(const grade of [6,8]){
 const {A,node,buttons,html}=load(grade);assert.ok(html.includes('مركّب أيونيّ'));assert.ok(html.includes('النّسبة')||html.includes('نسبة'));assert.equal(A.S.done['lab:atoms'],undefined);
 buttons.find(b=>b.dataset.s==='N').onclick();assert.equal(A.S.done['lab:atoms'],undefined,'Wrong atom must not complete the molecule');node('ar0').onclick();
 for(const [name,formula,counts] of [['الماء','H2O',{H:2,O:1}],['ثاني أكسيد الكربون','CO2',{C:1,O:2}],['الأكسجين','O2',{O:2}],['الميثان','CH4',{C:1,H:4}],['الأمونيا','NH3',{N:1,H:3}]]){
  assert.ok(node('at').innerHTML.includes(name));assert.ok(!node('at').innerHTML.includes('الصّوديوم'));
  for(const [s,n] of Object.entries(counts))for(let i=0;i<n;i++)buttons.find(b=>b.dataset.s===s).onclick();
  assert.ok(node('av').innerHTML.includes(formula.replace(/(\d)/g,'<sub>$1</sub>')));assert.equal(A.S.done['lab:atoms'],100);node('anext').onclick();checks++;
 }
 assert.ok(node('at').innerHTML.includes('الماء'),'Next cycle excludes the ionic compound');
 node('aionic').onclick();assert.equal(node('amolecular').hidden,true);assert.equal(node('aionmodel').hidden,false);assert.equal(node('aionic').attributes['aria-pressed'],'true');
 for(const [wide,count] of [[false,2],[true,8]]){
  if(wide)node('asize').onclick();const drawing=node('alattice').innerHTML;
  assert.equal((drawing.match(/>Na⁺<\/text>/g)||[]).length,count);assert.equal((drawing.match(/>Cl⁻<\/text>/g)||[]).length,count);assert.ok(drawing.includes('<title>'));
  assert.ok(node('aratio').innerHTML.includes(A.ar(count)));assert.ok(node('aratio').innerHTML.includes('١ : ١'));assert.ok(node('aratio').innerHTML.includes('صفرًا'));checks++;
 }
 node('amolecules').onclick();assert.equal(node('amolecular').hidden,false);assert.equal(node('aionmodel').hidden,true);assert.equal(A.S.done['qa:preserve'],37);checks++;
}
console.log(`PASS science atoms: ${checks} molecule, ionic ratio, navigation and preservation cases`);
