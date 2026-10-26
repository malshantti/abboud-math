#!/usr/bin/env node
/* يجمع نصوص مادة من الصف الأول، ويولّد مقاطعها الناقصة، ويكتب g1/<subject>/audio-index.js.
   الاستعمال: node g1/shared/voice/build.cjs math life   (أو --dry لعرض العدّ فقط). انظر g1/shared/AUDIO.md. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const AU=require('../audio.js');
const G1=path.resolve(__dirname,'../..'),OUT=path.join(G1,'shared/audio');
const VOICE={ar:'ar-SA-HamedNeural',en:'en-GB-SoniaNeural'};
const args=process.argv.slice(2),dry=args.includes('--dry'),subjects=args.filter(a=>!a.startsWith('--'));
const HARAKAT=/[\u064B-\u0652]/;
function load(subject){const dir=path.join(G1,subject),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);
  for(const m of html.matchAll(/<script src="([^".?]+\.js)[^"]*"/g)){const src=m[1];if(src.startsWith('../')||src==='audio-index.js')continue;vm.runInContext(fs.readFileSync(path.join(dir,src),'utf8'),ctx,{filename:src});}
  return ctx.window.G1_COURSE;}
/* يجمع: نص الخطوة، نص السؤال، الشرح، تسميات الاختيارات، وأي مصفوفة speak: ['نص' أو {text,lang}]. */
function collect(course){const out=[];const add=(text,lang,spoken)=>{const t=AU.clean(text);if(t)out.push({text:t,lang:AU.langOf(t,lang),spoken:spoken?AU.clean(spoken):null});};
  const walk=node=>{if(Array.isArray(node))return node.forEach(walk);if(!node||typeof node!=='object')return;if(node.mergedInto)return;
    if(typeof node.text==='string'&&!('label' in node))add(node.text,node.lang,node.say);
    if(typeof node.prompt==='string')add(node.prompt,node.lang,node.say);
    if(typeof node.explain==='string')add(node.explain,'ar',node.sayExplain);
    if(Array.isArray(node.choices))node.choices.forEach(c=>add(c.label,c.lang,c.say));
    if(Array.isArray(node.speak))node.speak.forEach(x=>typeof x==='string'?add(x):add(x.text,x.lang,x.say));
    for(const [k,v] of Object.entries(node))if(v&&typeof v==='object'&&k!=='books')walk(v);};
  walk(course.units);walk(course.foundations||[]);if(course.speak)walk({speak:course.speak});
  Object.values(AU.ENGINE).forEach(t=>add(t,'ar'));return out;}
const total={clips:0,new:0};
for(const subject of subjects){const course=load(subject);if(!course)throw new Error('No G1_COURSE in '+subject);
  const sayFile=path.join(G1,subject,'voice/say.json'),say=fs.existsSync(sayFile)?JSON.parse(fs.readFileSync(sayFile,'utf8')):{};
  const index={},jobs=[],seen=new Set(),bare=[];
  const spokenOf={};
  for(const {text,lang,spoken:sp} of collect(course)){const k=AU.key(text,lang,sp);const spoken=AU.clean(sp||say[text]||text);if(seen.has(k)){if(spokenOf[k]!==spoken)console.warn('  different spoken text for the same display text (first kept): '+text);continue;}seen.add(k);spokenOf[k]=spoken;if(lang==='ar'&&/[\u0621-\u064a]{3}/.test(spoken)&&!HARAKAT.test(spoken))bare.push(text);
    const f=AU.hash(VOICE[lang]+'|'+spoken);index[k]=f;jobs.push({file:path.join(OUT,f+'.mp3'),text:spoken,voice:VOICE[lang]});}
  const missing=jobs.filter(j=>!fs.existsSync(j.file));
  console.log(subject+': '+jobs.length+' clips, '+missing.length+' to generate, '+bare.length+' Arabic texts without harakat (add to '+subject+'/voice/say.json)');
  {const uv=path.join(G1,subject,'voice/unvoweled.txt');fs.mkdirSync(path.dirname(uv),{recursive:true});fs.writeFileSync(uv,bare.length?bare.join('\n')+'\n':'');}
  total.clips+=jobs.length;total.new+=missing.length;if(dry)continue;
  if(missing.length){const tmp=path.join(require('os').tmpdir(),'g1-voice-'+subject+'.json');fs.writeFileSync(tmp,JSON.stringify(missing));
    const r=cp.spawnSync('python3',[path.join(__dirname,'tts.py'),tmp],{stdio:'inherit'});if(r.status)console.error('Some clips failed; rerun to retry.');}
  const ok={};for(const [k,f] of Object.entries(index))if(fs.existsSync(path.join(OUT,f+'.mp3')))ok[k]=f;
  /* تسجيلات نَوْرَس البشرية تتقدّم على edge-tts: human.json = {subject:{key:file}}. */
  {const hf=path.join(__dirname,'human.json'),hu=fs.existsSync(hf)?(JSON.parse(fs.readFileSync(hf,'utf8'))[subject]||{}):{};for(const [k,f] of Object.entries(hu))if(k in index&&fs.existsSync(path.join(OUT,f+'.mp3')))ok[k]=f;}
  fs.writeFileSync(path.join(G1,subject,'audio-index.js'),'/* مولَّد بـ g1/shared/voice/build.cjs — لا تحرّره يدويًا. */\nwindow.G1_AUDIO_INDEX=Object.assign(window.G1_AUDIO_INDEX||{},'+JSON.stringify(ok)+');\n');}
console.log('total',total);
