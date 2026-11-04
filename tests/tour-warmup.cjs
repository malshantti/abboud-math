// Welcome tour must not open on top of the first-visit warm-up question (#bWarm from sync.js).
const fs=require('fs'),path=require('path');const t=fs.readFileSync(path.join(__dirname,'..','tour.js'),'utf8');
if(!/getElementById\('bWarm'\)/.test(t)||!/warmPending\(\)/.test(t)){console.error('FAIL tour.js does not wait for the warm-up question');process.exit(1)}
const s=fs.readFileSync(path.join(__dirname,'..','sync.js'),'utf8');if(!/d\.id='bWarm'/.test(s)||!/'bustan_warm_g'/.test(s)){console.error('FAIL sync.js warm-up id/key changed; update tour.js');process.exit(1)}
console.log('tour-warmup OK');
