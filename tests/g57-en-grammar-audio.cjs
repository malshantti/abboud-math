// صوت قواعد الإنجليزية للصفين ٥ و٧: كل نقطة إنجليزية في دروس اللغة لها ملفان (عادي/بطيء) موجودان وفي MEDIA.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
for(const g of ['g5','g7']){const d=path.join(__dirname,'..',g,'english'),w={};w.window=w;vm.createContext(w);for(const f of ['content.js','audio-en.js','media.js'])vm.runInContext(fs.readFileSync(path.join(d,f),'utf8'),w);
 let n=0;for(const u of w.UNITS)for(const l of u.les)for(const p of l.pts||[]){const t=String(p).trim();if(!/^[A-Za-z]/.test(t))continue;const e=w.EN_AUDIO.map[t];assert.ok(e,g+' missing '+t);for(const f of [e.f,e.s]){assert.ok(fs.existsSync(path.join(d,'audio',f)),f);assert.ok(w.MEDIA.includes('audio/'+f),f)}n++}
 assert.ok(n>=50);console.log(g,'grammar audio ok',n)}
