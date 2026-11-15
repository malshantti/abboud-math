// عدد المواد في الصفحة الرئيسية وبطاقات الأسعار يطابقان catalog.js ومجموعات الخادم
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');
global.window={};require(path.join(root,'catalog.js'));
const active=window.CATALOG.entries.filter(e=>e.status==='active');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const toW=s=>+s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const m=html.match(/<b>([٠-٩0-9]+)<\/b>مادة دراسية متاحة/);
assert.ok(m,'stat «مادة دراسية متاحة» exists');
assert.strictEqual(toW(m[1]),active.length,'landing subject count = active catalog entries');
// كل صف مفعّل في الفهرس له بطاقة سعر ثابتة (احتياط عند تعذّر الاتصال)، والمفاتيح مطابقة لـ PRICE_GROUPS في الخادم
const keys=[...html.matchAll(/data-price-group="([\d-]+)"/g)].map(x=>x[1]);
const php=fs.readFileSync(path.join(root,'backend/app/Models/Setting.php'),'utf8');
const def=php.match(/PRICE_GROUPS\s*=\s*\[(.*?)\];/)[1];
const serverKeys=[...def.matchAll(/\[([\d,\s]+)\]/g)].map(x=>x[1].split(',').map(n=>n.trim()).join('-'));
assert.deepStrictEqual(keys.sort(),serverKeys.sort(),'static price cards match server PRICE_GROUPS');
const covered=new Set(keys.flatMap(k=>k.split('-').map(Number)));
for(const g of new Set(active.map(e=>e.grade)))assert.ok(covered.has(g),'grade '+g+' has a price card');
assert.ok(!/\d\d\/\d\d/.test(html.replace(/<script[\s\S]*?<\/script>/g,'')),'dates use Arabic-Indic digits');
console.log('landing-stats ok',active.length);
