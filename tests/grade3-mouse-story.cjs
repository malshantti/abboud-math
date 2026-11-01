// N06: preserve the cause/effect of the official reading (Arabic 3 part 1 pp. 28–29).
// Source: https://elearn.azureedge.net/Books/c3/ar3-p1.pdf#page=32
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(read('g3/arabic/content.js'),ctx);
const lessons=ctx.G3.units.flatMap(u=>u.les),lesson=lessons.find(l=>l.id==='a3r');
assert.ok(lesson,'The existing lesson ID is retained');
const story=lesson.steps[0].b;
assert.match(story,/ملخّص القصّة/,'Distinguish the teaching summary from the original reading');
assert.match(story,/رفض الخروج منه/,'The snake refuses to leave; the mouse wants her home back');
assert.doesNotMatch(story,/خافت الفأرة أن يخرج|منع الثعبان من الخروج/);
assert.match(story,/بالقفز على وجهه/,'The summary explains how she wakes the sleeping man');
assert.ok(story.indexOf('لحق بها الرجل')<story.indexOf('فرأى الثعبان'),'The chase leads the man to the snake');
assert.match(story,/بعصاه/);
const why=lesson.qs.find(q=>q.q==='لماذا فكّرت الفأرة في حيلة؟');
assert.ok(why);assert.equal(why.o[why.a],'لإخراج الثعبان من جحرها بعد رفضه الخروج');
assert.notEqual(why.o.indexOf('لمنع الثعبان من الخروج'),why.a,'The reversed motive is not rewarded');
assert.match(lesson.goals[0],/^أقرأ ملخّص/);
assert.equal(lesson.steps[0].say,null,'Unverified existing audio is not paired with the revised summary');
assert.equal(ctx.AR_AUDIO['a3-story'],'a3-story.mp3','The audio mapping is preserved for later review');
assert.ok(fs.existsSync(path.join(root,'g3/arabic/audio/a3-story.mp3')),'The original recording remains on disk');
assert.equal(lessons.find(l=>l.id==='a2r').steps[0].say,'a2-story','Other lessons retain their narration');
for(const l of lessons)for(const q of l.qs||[]){assert.ok(q.a>=0&&q.a<q.o.length);assert.equal(new Set(q.o).size,q.o.length)}
const base=process.env.CACHE_BASE_REF||'origin/main',version=s=>s.match(/const V=['"]([^'"]+)/)[1];
assert.notEqual(version(read('g3/arabic/sw.js')),version(cp.execFileSync('git',['show',base+':g3/arabic/sw.js'],{cwd:root,encoding:'utf8'})));
console.log('PASS grade3-mouse-story: motive, event order, comprehension, lesson identity, audio preservation and cache');
