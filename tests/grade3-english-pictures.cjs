'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,'g3/english',f),'utf8');
let choice=0,xp=0,buttons=[];const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',hidden:false});return elements.get(id)};
const app={rnd:n=>choice%n,shuffle:a=>a.slice(),$:element,$$:()=>{buttons=[...element('#bl').innerHTML.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map(m=>({textContent:m[1],disabled:false}));return buttons},addXP:n=>xp+=n};
const c={window:{APP:app}};vm.createContext(c);
for(const f of ['illustrations.js','content.js','english.js']){assert.ok(!/\p{Extended_Pictographic}/u.test(read(f)),f+' contains no emoji');vm.runInContext(read(f),c)}
const art=c.window.G3ART,units=c.window.G3.units;
assert.equal(art.keys.length,24);assert.equal(new Set(art.keys).size,24);
for(const key of art.keys){const svg=art.picture(key);assert.match(svg,/viewBox="0 0 160 128"/);assert.match(svg,/role="img" aria-label="[\u0600-\u06ff ]+"/);assert.ok(!svg.includes('aria-label="'+key+'"'),'English spelling is not revealed by the picture label');assert.ok(!/<(?:script|image|foreignObject)\b|https?:\/\//i.test(svg.replace('http://www.w3.org/2000/svg','')),'Self-contained drawing');}
assert.match(art.picture('figs'),/aria-label="تين"/);assert.notEqual(art.picture('figs'),art.picture('grapes'));
const language=id=>units.flatMap(u=>u.les).find(l=>l.id===id);
for(const [id,index,key,answer] of [['e3l',0,'bananas','bananas'],['e3l',1,'carrots','carrots'],['e3l',2,'tomatoes','tomatoes'],['e3l',6,'grapes','grapes'],['e4l',3,'monkey','monkey'],['e4l',4,'fox','fox'],['e8l',0,'sunny',"It's sunny."],['e8l',1,'rainy',"It's rainy."],['e8l',2,'cloudy','cloudy'],['e8l',3,'beach','at the beach']]){
 const q=language(id).qs[index];assert.ok(q.q.includes(art.picture(key)),id+' uses the correct cue');assert.equal(q.o[q.a],answer);assert.equal(q.o.filter(o=>o===answer).length,1);
}
assert.ok(language('e3l').steps[0].ck.q.includes(art.picture('bananas')),'Step check uses the same picture');
let checked=0;
for(const [lab,words] of Object.entries({food:['figs','melon','grapes','apples','carrots','onions'],zoo:['tiger','fox','snake','monkey','giraffe'],body:['head','back','foot','teeth'],weather:['sunny','rainy','windy','cloudy','cold','hot']}))for(const [i,word] of words.entries()){
 choice=i;const before=xp;c.window.G3X.labs[lab].init();assert.equal(element('#hint').innerHTML,art.picture(word));assert.equal(element('#bw').textContent,'');assert.equal(buttons.map(b=>b.textContent).sort().join(''),word.split('').sort().join(''));
 for(const letter of word){const b=buttons.find(b=>!b.disabled&&b.textContent===letter);assert.ok(b);b.onclick();}
 assert.equal(element('#bw').textContent,word);assert.equal(xp,before+5);assert.match(element('#bm').textContent,/Well done/);checked++;
}
const html=read('index.html'),worker=read('sw.js');assert.ok(html.indexOf('illustrations.js')<html.indexOf('content.js'),'Pictures load before content');assert.ok(worker.includes('illustrations.js?v='),'Picture module is available offline');
const base=process.env.CACHE_BASE_REF||'origin/main',old=cp.execFileSync('git',['show',base+':g3/english/content.js'],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n');
if(old!==read('content.js').replace(/\r\n/g,'\n')){const version=s=>s.match(/const V='([^']+)'/)[1];const oldWorker=cp.execFileSync('git',['show',base+':g3/english/sw.js'],{cwd:root,encoding:'utf8'});assert.notEqual(version(worker),version(oldWorker));}
console.log('PASS: 24 local picture cues, 10 question mappings, '+checked+' spelling targets, Indic-ready content and offline dependency');
