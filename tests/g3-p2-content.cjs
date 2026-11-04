// الصفّ الثالث، الفصل الثاني: content-p2.js لكلّ مادّة يُحمَّل بعد content.js، ويضيف وحدات بمعرّفات فريدة، ولكلّ درس خطوات وأسئلة صالحة.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
let n=0;
for(const sub of ['math','arabic','science','english']){
 const d=path.join(__dirname,'../g3',sub),p2=path.join(d,'content-p2.js');if(!fs.existsSync(p2))continue;n++;
 const w={};w.window=w;w.G3ART={picture:()=>''};vm.createContext(w);
 vm.runInContext(fs.readFileSync(path.join(d,'content.js'),'utf8'),w);const before=w.G3.units.length;
 vm.runInContext(fs.readFileSync(p2,'utf8'),w);const G=w.G3;
 assert.ok(G.units.length>before,sub+' adds units');assert.ok(G.units[before].part,sub+' first p2 unit has part');
 const ids=new Set();for(const u of G.units)for(const l of u.les){assert.ok(!ids.has(l.id),'dup '+l.id);ids.add(l.id);
  assert.ok(l.steps.length>0,l.id);if(G.units.indexOf(u)>=before){assert.ok((l.qs||[]).length>=4,l.id+' qs');assert.ok(l.pg>0,l.id+' pg')}
  for(const q of (l.qs||[]).concat(l.steps.filter(s=>s.ck).map(s=>s.ck))){assert.ok(q.o.length>=2&&q.a>=0&&q.a<q.o.length,l.id);assert.strictEqual(new Set(q.o).size,q.o.length,l.id+' '+q.q)}}
 assert.ok(G.units.length<=30,'ORD covers');
 const html=fs.readFileSync(path.join(d,'index.html'),'utf8'),sw=fs.readFileSync(path.join(d,'sw.js'),'utf8');
 assert.ok(html.indexOf('"content.js?v=')<html.indexOf('"content-p2.js?v='),sub+' order');assert.ok(sw.includes('"content-p2.js?v='),sub+' sw');
 console.log('g3-p2',sub,G.units.length,'units',ids.size,'lessons');
}
assert.ok(n>=1);
