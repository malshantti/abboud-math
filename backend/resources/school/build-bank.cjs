// Builds bank/{g4-math…}.json (textbook MCQs per lesson, from each grade's content.js «bmc») for the school quiz builder and homework picker.
// Run from the repo root: node backend/resources/school/build-bank.cjs
const fs=require('fs'),vm=require('vm'),path=require('path');const out={};
for(let g=1;g<=8;g++)for(const s of ['math','arabic','english','science']){const f=`g${g}/${s}/content.js`;if(!fs.existsSync(f))continue;const w={};
 try{vm.runInNewContext(fs.readFileSync(f,'utf8'),{window:w})}catch(e){continue}
 if(!Array.isArray(w.UNITS))continue;const units=w.UNITS.map(u=>({id:String(u.id||''),t:String(u.t||''),les:(u.les||[]).filter(l=>l.id).map(l=>({id:String(l.id),t:String(l.t||''),
  q:(l.bmc||[]).filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&Array.isArray(x[1])&&x[1].length>=2&&Number.isInteger(x[2])&&x[2]>=0&&x[2]<x[1].length).map(x=>[x[0],x[1].map(String),x[2],x[3]||null])}))})).filter(u=>u.id&&u.les.length);
 if(units.length)out[`g${g}-${s}`]=units}
const dir=path.join(__dirname,'bank');fs.mkdirSync(dir,{recursive:true});for(const k in out)fs.writeFileSync(path.join(dir,k+'.json'),JSON.stringify(out[k]));
for(const k in out)console.log(k,out[k].length,'units',out[k].reduce((a,u)=>a+u.les.length,0),'lessons',out[k].reduce((a,u)=>a+u.les.reduce((b,l)=>b+l.q.length,0),0),'qs');
