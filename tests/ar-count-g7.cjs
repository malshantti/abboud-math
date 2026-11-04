// g7 math generators (mgen.js) must use correct العدد والمعدود forms via ar-count.js.
global.window=global;require('../ar-count.js');const fs=require('fs'),assert=require('assert'),path=require('path');
eval(fs.readFileSync(path.join(__dirname,'..','g7/math/mgen.js'),'utf8'));
const pat=[/(?:^|[^\d.,/−-])(?:1|2) (?:درجات|وحدات|شواكل|عمّال|أيام)/,/(?:^|[^\d.,/−-])(?:1[1-9]|[2-9]\d) (?:درجات|وحدات|شواكل|عمّال|أيام)/,/(?:^|[^\d.,/−-])(?:[3-9]|10) (?:درجةً|وحدةً|شيكلًا|عاملًا|يومًا)/];
const bad=[];let n=0;for(const k of Object.keys(window.MG)){if(typeof window.MG[k]!=='function')continue;for(let i=0;i<40;i++){let q;try{q=window.MG[k]()}catch(e){continue}n++;const t=JSON.stringify(q).replace(/[\u2066\u2069]/g,'');for(const re of pat)if(re.test(t)){bad.push(k+' '+t.match(re)[0]);break}}}
assert.ok(n>100,'generators ran: '+n);assert.deepStrictEqual(bad,[],bad.slice(0,5).join(' | '));console.log('ar-count g7 ok',n);
