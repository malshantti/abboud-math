const A=require('../answer-match.js'),assert=require('assert');
const yes=[['0.5','1/2'],['٠٫٥','½'],['1 1/2','1.5'],['٣','3'],['  Cat. ','cat'],["it’s","it's"],['البيت','بيت'],['مُسَاعَدَة','مساعده'],['1,500','1500'],['-2','−2']];
const no=[['11/2','1 1/2'],['0.6','1/2'],['cats','cat'],['بيت','بنت'],['','0'],['abc','ab c'],['2','12'],['ال','']];
for(const [g,a] of yes)assert.ok(A.match(g,a),g+' ≡ '+a);for(const [g,a] of no)assert.ok(!A.match(g,a),g+' ≠ '+a);
assert.strictEqual(A.value('٣/٤'),0.75);assert.ok(Number.isNaN(A.value('x')));console.log('answer-match ok',yes.length+no.length);
