'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const elements=new Map();
const element=selector=>{if(!elements.has(selector))elements.set(selector,{value:'60',innerHTML:'',textContent:''});return elements.get(selector)};
const context={window:{APP:{$:element,ar:String,rnd:()=>0,shuffle:items=>items,esc:String}}};
vm.createContext(context);
vm.runInContext(read('g3/math/content.js'),context);
vm.runInContext(read('g3/math/math.js'),context);
const lab=context.window.G3X.labs.angle;
const bounds=lab.html().match(/viewBox="([\d ]+)"/)[1].split(' ').map(Number);
lab.init();
for(let angle=10;angle<=170;angle++){
  element('#ang').value=String(angle);element('#ang').oninput();
  const svg=element('#asv').innerHTML;
  assert.equal(element('#at').textContent,angle<90?'زاوية حادّة':angle===90?'زاوية قائمة':'زاوية منفرجة',`Classification at ${angle} degrees`);
  assert.equal(svg.includes('stroke="#c98a2e"'),angle===90,`Right-angle square only at 90, including 89/90/91`);
  const moving=svg.match(/<path d="M([\d.]+) ([\d.]+)L(-?[\d.]+) (-?[\d.]+)"/);
  assert.ok(moving,`Moving arm at ${angle}`);
  const [cx,cy,x,y]=moving.slice(1).map(Number),stroke=2.5;
  for(const [px,py] of [[cx,cy],[x,y]]){
    assert.ok(px-stroke>=bounds[0]&&px+stroke<=bounds[0]+bounds[2],`Horizontal stroke stays in frame at ${angle}`);
    assert.ok(py-stroke>=bounds[1]&&py+stroke<=bounds[1]+bounds[3],`Vertical stroke stays in frame at ${angle}`);
  }
  assert.ok(cx-7>=bounds[0]&&cx+7<=bounds[0]+bounds[2]&&cy-7>=bounds[1]&&cy+7<=bounds[1]+bounds[3],'Vertex circle stays visible');
  const fixed=svg.match(/<path d="M([\d.]+) ([\d.]+)H([\d.]+)"/);
  assert.ok(fixed&&Number(fixed[3])+stroke<=bounds[0]+bounds[2],'Fixed arm stays in frame');
  const expectedX=cx+150*Math.cos(angle*Math.PI/180),expectedY=cy-150*Math.sin(angle*Math.PI/180);
  assert.ok(Math.abs(x-expectedX)<0.06&&Math.abs(y-expectedY)<0.06,'Drawn arm matches the selected angle');
}
const base=process.env.CACHE_BASE_REF||'origin/main';
const oldMath=execFileSync('git',['show',base+':g3/math/math.js'],{cwd:root,encoding:'utf8'});
if(oldMath.replace(/\r\n/g,'\n')!==read('g3/math/math.js').replace(/\r\n/g,'\n')){
  const version=text=>text.match(/const V=['"]([^'"]+)/)[1];
  const before=execFileSync('git',['show',base+':g3/math/sw.js'],{cwd:root,encoding:'utf8'});
  assert.notEqual(version(read('g3/math/sw.js')),version(before),'Changed lab receives a changed subject cache');
}
console.log('grade-three-angles: classification and full drawing range verified (10–170 degrees)');
