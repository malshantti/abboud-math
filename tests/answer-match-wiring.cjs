// Typed-answer checks in g4 (all), g5 science and g7 math use the shared answer-match.js.
const fs=require('fs'),assert=require('assert'),path=require('path');const R=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const A=require('../answer-match.js');
for(const d of ['g4/math','g4/arabic','g4/english','g4/science','g5/science','g7/math']){
 assert.ok(/answer-match\.js\?v=/.test(R(d+'/index.html')),d+' index loads answer-match');assert.ok(R(d+'/sw.js').includes('../../answer-match.js?v='),d+' sw caches answer-match');
 assert.ok(R(d+'/lab.js').includes('BUSTAN_ANS.value'),d+' lab uses value()');}
for(const d of ['g4/math','g4/arabic','g4/english','g4/science'])assert.ok(R(d+'/std.js').includes('BUSTAN_ANS.match'),d+' std');
assert.ok(R('g4/english/entask.js').includes('BUSTAN_ANS.match'));
assert.ok(A.match('٠٫٥','1/2')&&A.match('Apple ','apple')&&!A.match('3','4'));assert.strictEqual(A.value('٢٫٥'),2.5);
console.log('answer-match wiring ok');
