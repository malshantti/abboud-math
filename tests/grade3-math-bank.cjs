// بنك رياضيات الصف الثالث: أسئلة ثابتة لكل درس + مولّد لكل درس، إجابات صحيحة واختيارات فريدة.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const dir=path.join(__dirname,'../g3/math'),w={};w.window=w;
w.APP={ar:x=>String(x),rnd:n=>Math.floor(Math.random()*n),shuffle:a=>a.slice().sort(()=>Math.random()-.5),esc:x=>x,$:()=>null,$$:()=>[]};
vm.createContext(w);vm.runInContext(fs.readFileSync(path.join(dir,'content.js'),'utf8'),w);
w.G3=w.G3||{units:(w.G3_COURSE||Object.values(w).find(v=>v&&v.units)).units};
vm.runInContext(fs.readFileSync(path.join(dir,'math.js'),'utf8'),w);
const D='٠١٢٣٤٥٦٧٨٩',num=s=>Number(String(s).replace(/[٠-٩]/g,c=>D.indexOf(c)));
let n=0;
for(const u of w.G3.units)for(const l of u.les){assert.ok(l.qs&&l.qs.length>=2,l.id+' qs');assert.ok(l.gen&&w.G3X.gen[l.gen],l.id+' gen');
  const all=l.qs.concat(Array.from({length:300},()=>w.G3X.gen[l.gen]()));
  for(const q of all){n++;assert.ok(q.o.length>=2&&q.a>=0&&q.a<q.o.length);assert.strictEqual(new Set(q.o.map(String)).size,q.o.length,l.id+' dup '+q.q+' '+q.o);
    const m=/^([٠-٩\d]+) ([+−]) ([٠-٩\d]+) = ؟/.exec(q.q);if(m)assert.strictEqual(num(q.o[q.a]),m[2]==='+'?num(m[1])+num(m[3]):num(m[1])-num(m[3]),q.q);}}
const st=w.G3.units.flatMap(u=>u.les).find(l=>l.id==='m8').qs;assert.strictEqual(st[0].o[0],'٨٩٩');assert.strictEqual(1587-688,899);assert.strictEqual(1951-190,1761);
console.log('grade3-math-bank ok',n);
