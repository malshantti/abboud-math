// Warm-up question: dialog semantics, skip/close, Esc, focus trap, no blocking of deep links, per-grade questions, honest wrong-answer feedback.
const fs=require('fs'),path=require('path');const s=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');
const need=[/role="dialog"/,/aria-modal="true"/,/id="bWarmX"/,/id="bWarmS"/,/e\.key==='Escape'/,/e\.key==='Tab'/,/aria-live="polite"/,/#\\\/\?\(home/];
for(const r of need)if(!r.test(s)){console.error('FAIL warm-up missing '+r);process.exit(1)}
if(/قريب! جرّب مرة ثانية/.test(s)){console.error('FAIL misleading wrong-answer feedback');process.exit(1)}
const m=s.match(/var WARM_Q=(\{[\s\S]*?\}\});/);if(!m){console.error('FAIL WARM_Q');process.exit(1)}
const Q=eval('('+m[1]+')');for(let g=1;g<=8;g++){if(!Q[g]){console.error('FAIL grade '+g);process.exit(1)}
 for(const [sub,q] of Object.entries(Q[g])){if(!Array.isArray(q[1])||q[1].length<3||!(q[2] in q[1])){console.error('FAIL '+g+sub);process.exit(1)}}}
if(Q[8].math[0]===Q[1].math[0]){console.error('FAIL grade 8 shares grade 1 question');process.exit(1)}
console.log('warmup-a11y OK');
