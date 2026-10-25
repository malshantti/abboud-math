// يتحقق أن كل ملف JS/CSS محلي في صفحات المواد مرقّم بـ ?v (لتجاوز ذاكرة Cloudflare) ومحفوظ في قائمة F لعامل خدمة المادة.
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..');let n=0;
for(const g of fs.readdirSync(root).filter(d=>/^g\d+$/.test(d)))for(const s of fs.readdirSync(path.join(root,g))){
 const dir=path.join(root,g,s),html=path.join(dir,'index.html'),sw=path.join(dir,'sw.js');if(!fs.existsSync(html)||!fs.existsSync(sw))continue;
 const h=fs.readFileSync(html,'utf8'),w=fs.readFileSync(sw,'utf8');
 const F=JSON.parse(w.slice(w.indexOf('F=[')+2,w.indexOf(']',w.indexOf('F=['))+1)).map(u=>u.replace(/\?.*$/,'').replace(/^\.\//,''));
 assert.ok(/const V='[^']+'/.test(w),g+'/'+s+' sw.js has V');
 for(const m of h.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css))(\?[^"]*)?"/g)){
  assert.ok(m[2]&&/v=/.test(m[2]),`${g}/${s}: ${m[1]} بلا رقم إصدار ?v`);
  assert.ok(F.includes(m[1].replace(/^\.\//,'')),`${g}/${s}: ${m[1]} غير موجود في F داخل sw.js`);n++}
}
console.log('sw-versions ok',n,'refs');
