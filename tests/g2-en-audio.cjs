// الصف الثاني الإنجليزية: كل مفتاح صوت له ملفّا عادي/بطيء موجودان، والسكربتات موصولة في index.html وsw.js.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const d=path.join(__dirname,'../g2/english'),w={};w.window=w;vm.createContext(w);vm.runInContext(fs.readFileSync(path.join(d,'audio-en.js'),'utf8'),w);
const m=w.EN_AUDIO.map;assert.ok(Object.keys(m).length>300);for(const [t,e] of Object.entries(m)){assert.ok(/[A-Za-z]/.test(t));for(const f of [e.f,e.s])assert.ok(fs.existsSync(path.join(d,'audio',f)),f)}
const html=fs.readFileSync(path.join(d,'index.html'),'utf8'),sw=fs.readFileSync(path.join(d,'sw.js'),'utf8');
for(const f of ['audio-en.js','audio.js','en-audio-ui.js','en-audio.css']){assert.ok(html.includes(f+'?v='),f);assert.ok(sw.includes('"'+f+'?v='),f)}
assert.ok(html.indexOf('audio-en.js')<html.indexOf('"audio.js')&&html.indexOf('"audio.js')<html.indexOf('en-audio-ui.js'));
console.log('g2-en-audio ok',Object.keys(m).length);
