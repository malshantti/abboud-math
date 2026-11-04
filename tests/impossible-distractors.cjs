// Committee audit: no mathematically impossible angle distractors in triangle/quadrilateral generators.
const fs=require('fs'),vm=require('vm'),path=require('path');const R=path.join(__dirname,'..');let bad=0;
const src=f=>fs.readFileSync(path.join(R,f),'utf8');
for(const f of ['g4','g5','g7'].flatMap(g=>['math','arabic','english','science'].map(s=>`${g}/${s}/mgen.js`)).filter(f=>fs.existsSync(path.join(R,f)))){
  const t=src(f);if(/360-a-b/.test(t)){console.error('FAIL',f,'g4tri still offers 360-a-b');bad++}}
for(const [f,re] of [['g6/math/gen.js',/\(360-a-b\)\+'°',MIS\.tri360|\(360-2\*x\)\+'°'|\(d\+180\)\+'°'/],['g6/math/v4.js',/360-x-y\+'°'/],['g8/math/gen.js',/\(360-a-b\)\+'°',MIS\.tri360/],['g8/math/gen5.js',/360-x-y\+'°',MIS\.tri360|'0°',MIS\.tri360/]]){
  if(re.test(src(f))){console.error('FAIL',f);bad++}}
// static banks: [q,[opts],ci,...] triangle angle options must be < 180, right-triangle other angle < 90, remainder < divisor
const AR=s=>s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const pat=/\["((?:[^"\\]|\\.){3,400}?)",\s*\[((?:\s*"(?:[^"\\]|\\.)*"\s*,?)+)\],\s*(\d+)/g;
for(const g of ['g4','g5','g6','g7','g8'])for(const fn of fs.readdirSync(path.join(R,g,'math')).filter(x=>x.endsWith('.js')&&x!=='sw.js')){
  const t=src(`${g}/math/${fn}`);let m;while((m=pat.exec(t))){const q=AR(m[1]),opts=[...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x=>AR(x[1]));
   for(const o of opts){const v=parseFloat(o);if(isNaN(v))continue;
    if(/مثلث/.test(q)&&/زاوي/.test(q)&&!/مجموع|خارج/.test(q)&&/°/.test(o)&&v>=180){console.error('FAIL tri',g,fn,q,o);bad++}
    if(/مثلث/.test(q)&&/قائم/.test(q)&&/الزاوية الثالثة/.test(q)&&/°/.test(o)&&v>90){console.error('FAIL right',g,fn,q,o);bad++}
    const dv=q.match(/÷\s*(\d+)/),r=o.match(/الباقي\s*(\d+)/);if(/الباقي/.test(q)&&dv&&r&&+r[1]>=+dv[1]){console.error('FAIL rem',g,fn,q,o);bad++}}}}
if(bad){console.error(bad,'impossible distractors');process.exit(1)}console.log('impossible-distractors OK');
