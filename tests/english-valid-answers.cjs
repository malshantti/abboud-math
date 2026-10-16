// T04: run with node tests/english-valid-answers.cjs (no network or packages).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'g6/english/gen.js'),'utf8'),{window},{filename:'g6/english/gen.js'});
const gen=window.GEN;
let seed=104,checks=0;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function choose(first){const values=first.slice();gen.setRng(()=>values.length?values.shift():random())}
function valid(q){assert.equal(gen.valid(q),'');assert.equal(q.opts.filter(o=>o===q.ans).length,1);checks++}
// Cover every U11 verb context, in both the negative and participle branches.
const contexts=['used goggles and flippers','ridden a camel','seen coral','been on a boat'];
contexts.forEach((text,i)=>{
 choose([(i+.5)/contexts.length,0]);const q=gen.G.U11();valid(q);
 assert.equal(q.en,"I've ___ "+text+'.');assert.equal(q.ans,'never');
 assert.ok(!q.opts.includes('not ever'),'A valid alternative must not be marked wrong.');
 assert.ok(q.opts.includes('did not'));assert.ok(q.why['did not'].includes('have مع did'));
 choose([(i+.5)/contexts.length,.9]);const positive=gen.G.U11();valid(positive);
 assert.equal(positive.ans,text.split(' ')[0]);
});
// Cover all U16 records, including the verbs that allow either construction.
const answers=['writing','shouting','to be','to give','playing'];
answers.forEach((answer,i)=>{
 choose([(i+.5)/answers.length]);const q=gen.G.U16();valid(q);assert.equal(q.ans,answer);
 if(i===1||i===4){
  const validAlternative=i===1?'to shout':'to play';
  assert.ok(!q.opts.includes(validAlternative));
  for(const option of q.opts.filter(o=>o!==q.ans)){
   assert.ok(q.why[option].includes('ing أو to + الفعل'),'Feedback must preserve both valid constructions.');
  }
 }
});
// Exercise the normal grammar API and the revision units that reuse these banks.
gen.setRng(random);
for(const id of ['U11','U14','U16','U18'])for(let i=0;i<250;i++){
 const q=gen.forUnit({id,vocab:[],dialogues:[],texts:[],sentences:[],grammar:[],seeds:[]},'grammar');valid(q);
 if(q.ans==='never')assert.ok(!q.opts.includes('not ever'));
 if(q.en==='I hate ___!')assert.ok(!q.opts.includes('to shout'));
}
const sw=fs.readFileSync(path.join(root,'g6/english/sw.js'),'utf8');
assert.ok(sw.includes("V='g6en-")&&!sw.includes("V='g6en-v4-20261016'"));assert.ok(sw.includes('"gen.js"'));
console.log('Passed '+checks+' English answer checks (T04 / EN-02 / EN-03).');
