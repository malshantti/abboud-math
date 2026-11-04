// Generated g6 math questions must use correct العدد والمعدود forms (ar-count.js) — 2 → dual, 3–10 plural, 11–99 accusative singular.
global.window=global;require('../ar-count.js');const fs=require('fs'),assert=require('assert'),path=require('path');
const R=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
for(const f of ['numerals.js','data.js','content.js','content5.js','gen.js'])eval(R('g6/math/'+f));
const pat=[/(?:^|[^\d.,/])(?:[3-9]|10) (?:يومًا|دينارًا|قرشًا|كتابًا|طالبًا|مرةً|شجرةً|وحدةً|شيكلًا|عاملًا)/,/(?:^|[^\d.,/])2 (?:أيام|دنانير|ساعات|وحدات|نقاط|مرات|صفوف|شواكل|عمّال)/,/(?:^|[^\d.,/])1 (?:وحدات|طلاب|مرات|أيام)/,/(?:^|[^\d.,/])(?:1[1-9]|[2-9]\d) (?:أيام|دنانير|ساعات|وحدات|نقاط|مرات|طلاب|أشجار|شواكل|عمّال)/];
const bad=[];let n=0;const scan=(k,q)=>{n++;const t=JSON.stringify(q).replace(/[\u2066\u2069]/g,'');for(const re of pat)if(re.test(t)){bad.push(k+' '+t.match(re)[0]);break}};
for(const k of Object.keys(window.GEN))for(let i=0;i<40;i++)scan(k,window.GEN[k]());
assert.deepStrictEqual(bad,[],bad.slice(0,5).join(' | '));console.log('ar-count generators ok',n);
