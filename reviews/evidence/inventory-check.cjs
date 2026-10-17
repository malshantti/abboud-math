const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),out={commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),subjects:[],brokenStatic:[],emoji:[]};
const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:root}).toString('utf8').split('\0').filter(Boolean);
function run(file,append=''){const x={window:{},self:{addEventListener(){}},console};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8')+append,x,{filename:file});return x;}
for(const grade of [6,8])for(const subject of ['math','english','arabic','science']){
 const base=`g${grade}/${subject}`,files=tracked.filter(f=>f.startsWith(base+'/')),sizes=files.map(f=>({file:f,bytes:fs.statSync(path.join(root,f)).size}));
 const total=a=>a.reduce((s,x)=>s+x.bytes,0),audio=sizes.filter(f=>/\.mp3$/.test(f.file)),images=sizes.filter(f=>/\.(?:png|webp|jpe?g)$/.test(f.file));
 const sw=run(base+'/sw.js',';this.precache=typeof F!=="undefined"?F:typeof FILES!=="undefined"?FILES:[];');
 const precache=sw.precache,missing=precache.filter(f=>!fs.existsSync(path.resolve(root,base,f)));const precacheBytes=precache.reduce((s,f)=>{let p=path.resolve(root,base,f);if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');return s+(fs.existsSync(p)?fs.statSync(p).size:0)},0);
 const record={path:base,files:files.length,bytes:total(sizes),audioFiles:audio.length,audioBytes:total(audio),imageFiles:images.length,imageBytes:total(images),largest:sizes.sort((a,b)=>b.bytes-a.bytes).slice(0,5),largestAudio:audio.sort((a,b)=>b.bytes-a.bytes).slice(0,3),precacheFiles:precache.length,precacheBytes,missingPrecache:missing};
 if(subject==='english'){
  const x=run(base+'/audio-manifest.js').window.EN_AUDIO;
  const missingAudio=[];for(const [text,item] of Object.entries(x.map||{}))for(const file of typeof item==='string'?[item]:[item.f,item.s].filter(Boolean))if(!fs.existsSync(path.join(root,base,x.base,file)))missingAudio.push({text,file});
  record.audioEntries=Object.keys(x.map).length;record.missingAudio=missingAudio;
  const ar=run(base+'/audio-ar.js').window.EN_AUDIO_AR;record.arabicAudioEntries=Object.keys(ar.map||{}).length;record.missingArabicAudio=Object.entries(ar.map||{}).filter(([t,f])=>!fs.existsSync(path.join(root,base,ar.base,f))).map(([text,file])=>({text,file}));
  const img=run(base+'/bookimg.js').window.EN_IMG;record.missingBookImages=Object.values(img).flat().filter(i=>!fs.existsSync(path.join(root,base,'bookimg',i.f))).map(i=>i.f);
 }else if(subject==='arabic')record.arabicAudioEntries=Object.keys(run(base+'/audio-ar.js').window.AR_AUDIO).length;
 out.subjects.push(record);
}
for(const file of tracked.filter(f=>/\.(?:html|css|js)$/.test(f))){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 for(const [i,line] of s.split(/\r?\n/).entries()){
  const matches=[...line.matchAll(/\p{Extended_Pictographic}/gu)].map(m=>({codepoint:'U+'+m[0].codePointAt(0).toString(16).toUpperCase(),offset:m.index,context:line.slice(Math.max(0,m.index-45),m.index+65)}));
  if(matches.length)out.emoji.push({file,line:i+1,matches:matches.slice(0,8),count:matches.length});
 }
 if(file.endsWith('.html'))for(const m of s.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){
  const ref=m[1];if(/^(?:https?:|data:|\/)/.test(ref))continue;let target=path.resolve(root,path.dirname(file),ref);if(!fs.existsSync(target))out.brokenStatic.push({file,ref});
 }
}
const dest=path.resolve(__dirname,'inventory.json');fs.writeFileSync(dest,JSON.stringify(out,null,2));
console.log(JSON.stringify({commit:out.commit,subjects:out.subjects.map(s=>({path:s.path,files:s.files,mb:+(s.bytes/1048576).toFixed(2),audioFiles:s.audioFiles,audioMB:+(s.audioBytes/1048576).toFixed(2),precacheFiles:s.precacheFiles,precacheMB:+(s.precacheBytes/1048576).toFixed(2),missingPrecache:s.missingPrecache,missingAudio:s.missingAudio?.length,missingArabicAudio:s.missingArabicAudio?.length,missingBookImages:s.missingBookImages?.length,arabicAudioEntries:s.arabicAudioEntries,largestAudio:s.largestAudio})),brokenStatic:out.brokenStatic,emoji:out.emoji},null,2));
