// N01: textbook spellings and answer keys, including the actual lesson question adapter.
// References: Arabic grade 7, part 1 pp. 20, 99; part 2 p. 118.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={console};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(read('g7/arabic/content.js'),ctx);
ctx.CFG={subject:'arabic'};
ctx.APP={esc:String,ic:()=>'',pick:a=>a[0],shuffle:a=>a.slice(),S:{seen:{},done:{}},R:{},quiz(){}};
vm.runInContext(read('g7/arabic/les.js'),ctx);
const lessons=ctx.UNITS.flatMap(u=>u.les),lesson=id=>lessons.find(l=>l.id===id);
const markless=t=>String(t).replace(/[\u064B-\u0652\u0640]/g,'');
function question(id,word){const q=ctx.APP.gen.bookQs(lesson(id)).find(q=>markless(q.q).includes(word));assert.ok(q,'Question exists for '+word);return q}
const terminal=question('U10L3','تضيء');
assert.equal(terminal.o[terminal.a],'السطر','تضيء has terminal hamza on the line, not on ya');
assert.notEqual(terminal.o.indexOf('ياء لأنّ ما قبلها مكسور'),terminal.a);
const middle=question('U2L3','تؤذي');
assert.equal(middle.o[middle.a],'ساكنة وما قبلها مضموم','تُؤْذي matches the textbook word and explanation');
assert.ok(!ctx.APP.gen.bookQs(lesson('U2L3')).some(q=>markless(q.q).includes('تؤدي')));
const optimism=lesson('U2L3').ex.find(e=>e[0].includes('تفاؤل'));
assert.ok(optimism[1].includes('ألف مدّ ساكنة'));
assert.ok(!optimism[1].includes('ما قبلها مفتوح'));
const despair=lesson('U6L3').ex[0];
assert.equal(markless(despair[1]).split(':')[0],'يأس','No extra ya in the completed word');
assert.ok(despair[1].includes('الهمزة ساكنة وما قبلها مفتوح'));
assert.equal(markless(lesson('U20L2').t),'المحفوظات: صوني دموعك');
console.log('PASS grade7-arabic-hamza: source spelling, hamza rationale, lesson answer keys and poem title');
