/* Arabic content: no doubled harakat on one letter, no empty Quran brackets.
   Run: node tests/arabic-text-sanity.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const f of ['g6/arabic/content.js','g8/arabic/content.js']){const s=fs.readFileSync(path.join(root,f),'utf8');
 const d=s.match(/.{0,20}[\u064B-\u0650\u0652][\u064B-\u0650\u0652].{0,10}/u);assert.ok(!d,f+' doubled harakat: '+(d&&d[0]));
 assert.ok(!/﴿\s*﴾/.test(s),f+' has empty Quran brackets');}
console.log('arabic-text-sanity passed');
