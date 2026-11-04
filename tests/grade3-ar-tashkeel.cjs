// Grade 3 Arabic: every lesson story is fully vocalized (book style: long vowels unmarked).
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const ctx={};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'g3/arabic/content.js'),'utf8'),ctx);
let n=0;for(const u of ctx.G3.units){const l=u.les[0],t=l.steps[0].b.replace(/<[^>]+>/g,' ');
 const words=t.match(/[\u0621-\u064A\u064B-\u0652\u0670]+/g)||[];
 const OK=new Set(['في','هذا','يا','ما','لا','دينا','يافا','ماذا','عُلا','جُحا','فيها']);for(const w of words){if(!OK.has(w)&&w.replace(/[\u064B-\u0652\u0670]/g,'').length>1)assert.match(w,/[\u064B-\u0652]/,`${l.id}: unvocalized word ${w}`)}
 n++}
assert.equal(n,15);console.log('PASS grade3-ar-tashkeel: 15 stories vocalized');
