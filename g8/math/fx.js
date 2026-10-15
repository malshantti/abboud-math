// مؤثرات: الشخصية "زيتون" (صور مولّدة)، القصاصات، النقاط المنبثقة، النوافذ، الحلقات، الرادار
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)');const reduced=()=>RM.matches;
const POSE={welcome:'welcome',happy:'celebrate',celebrate:'celebrate',think:'think',sad:'encourage',encourage:'encourage',teacher:'teacher',read:'read',idle:'idle',pencil:'pencil'};
const img=p=>`img/zaytoun-${POSE[p]||p}.webp`;
// صور الشخصية مُحمّلة مسبقاً لتبديل الوضعيات بسلاسة
Object.values(POSE).forEach(p=>{const i=new Image();i.src=img(p)});
const MASCOT=(pose,cls)=>`<img class="zay ${cls||''}" src="${img(pose||'welcome')}" alt="زيتون" width="170" height="200" decoding="async">`;
const HAPPY=['أحسنت!','ممتاز!','عبقري!','رائع!','واو، ما شاء الله!','تمام التمام!'];
const SAD=['ولا يهمك، جرّب مرة ثانية','قريب جداً! ركّز','الخطأ جزء من التعلّم','خذ نفساً وحاول مجدداً'];
function mascot(state,msg){const m=document.getElementById('mascot');if(!m)return;const im=m.querySelector('img.zay');
 if(im){const src=img(state==='idle'?'think':state);if(!im.src.endsWith(src)){im.src=src}}
 m.classList.remove('happy','sad','idle');void m.offsetWidth;m.classList.add(state||'idle');
 const b=m.querySelector('.m-bubble');if(b){if(msg){b.textContent=msg;b.classList.add('show')}else b.classList.remove('show')}
 clearTimeout(mascot.t);if(state!=='idle')mascot.t=setTimeout(()=>{m.classList.remove('happy','sad');m.classList.add('idle');if(im)im.src=img('think');b&&b.classList.remove('show')},2600)}
// قصاصات Canvas
let cv,cx,parts=[],raf=0;
function confetti(x,y,n,spread){if(reduced())return;
 if(!cv){cv=document.createElement('canvas');cv.id='confetti';document.body.appendChild(cv);cx=cv.getContext('2d')}
 const dpr=devicePixelRatio||1;cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';
 x=(x==null?innerWidth/2:x)*dpr;y=(y==null?innerHeight/3:y)*dpr;
 const cols=['#f43f5e','#f59e0b','#22c55e','#06b6d4','#8b5cf6','#facc15','#84cc16'];
 for(let i=0;i<(n||60);i++){const a=Math.random()*Math.PI*2,v=(2+Math.random()*(spread||7))*dpr;
  parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4*dpr,r:(3+Math.random()*4)*dpr,c:cols[i%cols.length],rot:Math.random()*6,vr:(Math.random()-.5)*.4,life:90+Math.random()*40,sh:i%3,dpr})}
 if(!raf)raf=requestAnimationFrame(tick)}
function tick(){cx.clearRect(0,0,cv.width,cv.height);parts=parts.filter(p=>p.life-->0);
 parts.forEach(p=>{p.vy+=.25*p.dpr;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;cx.save();cx.globalAlpha=Math.min(1,p.life/30);cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillStyle=p.c;
  if(p.sh===0)cx.fillRect(-p.r,-p.r/2,p.r*2,p.r);else if(p.sh===1){cx.beginPath();cx.arc(0,0,p.r*.7,0,7);cx.fill()}else{cx.beginPath();cx.ellipse(0,0,p.r*.55,p.r*.9,0,0,7);cx.fill();cx.fillStyle='#4d7c0f';cx.fillRect(-1,-p.r*1.1,2,p.r*.4)}cx.restore()});
 raf=parts.length?requestAnimationFrame(tick):0;if(!raf)cx.clearRect(0,0,cv.width,cv.height)}
const burst=el=>{if(!el)return confetti();const r=el.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2,36,5)};
const mega=()=>{confetti(innerWidth*.2,innerHeight*.4,80,9);setTimeout(()=>confetti(innerWidth*.8,innerHeight*.4,80,9),180);setTimeout(()=>confetti(innerWidth/2,innerHeight*.25,100,11),360)};
function pop(txt,el){const d=document.createElement('div');d.className='xp-pop';d.textContent=txt;
 let x=innerWidth/2,y=innerHeight/2;if(el){const r=el.getBoundingClientRect();x=r.left+r.width/2;y=r.top}
 else{const h=document.getElementById('hpts');if(h){const r=h.getBoundingClientRect();x=r.left;y=r.bottom+10}}
 d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1300)}
function bump(id){const e=document.getElementById(id);if(!e)return;e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}
function modal(html,btn){const o=document.createElement('div');o.className='modal';o.setAttribute('role','dialog');
 o.innerHTML=`<div class="modal-box">${html}<button class="btn wide" data-x>${btn||'رائع! متابعة'}</button></div>`;
 o.onclick=e=>{if(e.target===o||e.target.hasAttribute('data-x')){o.classList.add('out');setTimeout(()=>o.remove(),250)}};document.body.appendChild(o);o.querySelector('[data-x]').focus()}
function toast(html){const t=document.createElement('div');t.className='toast';t.innerHTML=html;document.body.appendChild(t);setTimeout(()=>t.classList.add('out'),2800);setTimeout(()=>t.remove(),3200)}
function ring(pct,size,label,color){size=size||84;const r=size/2-7,c=2*Math.PI*r,off=c*(1-Math.max(0,Math.min(100,pct))/100);
 return`<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" class="ring-bg"/>
 <circle cx="${size/2}" cy="${size/2}" r="${r}" class="ring-fg" style="stroke:${color||'var(--accent)'};stroke-dasharray:${c};stroke-dashoffset:${c};--off:${off}"/></svg><div class="ring-t">${label!=null?label:Math.round(pct)+'%'}</div></div>`}
// رسم رادار للمجالات (قيم 0..1)
function radar(axes,size){size=size||300;const cx0=size/2,cy0=size/2,R=size/2-58,n=axes.length;const pt=(i,v)=>{const a=-Math.PI/2+2*Math.PI*i/n;return[cx0+Math.cos(a)*R*v,cy0+Math.sin(a)*R*v]};
 let g='';for(const k of[.25,.5,.75,1])g+=`<polygon class="rd-grid" points="${axes.map((_,i)=>pt(i,k).join(',')).join(' ')}"/>`;
 axes.forEach((a,i)=>{const[x,y]=pt(i,1);const[lx,ly]=pt(i,1.28);g+=`<line class="rd-axis" x1="${cx0}" y1="${cy0}" x2="${x}" y2="${y}"/><text x="${lx}" y="${ly}" class="rd-lbl" text-anchor="middle" dominant-baseline="middle">${a.label}</text><text x="${lx}" y="${ly+17}" class="rd-val" text-anchor="middle">${Math.round(a.v*100)}%</text>`});
 const poly=axes.map((a,i)=>pt(i,Math.max(.04,a.v)).join(',')).join(' ');
 return`<svg class="radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="رادار المهارات">${g}<polygon class="rd-shape" points="${poly}"/>${axes.map((a,i)=>{const[x,y]=pt(i,Math.max(.04,a.v));return`<circle class="rd-dot" cx="${x}" cy="${y}" r="5"/>`}).join('')}</svg>`}
const cover=k=>`<img class="cover" src="img/cover-${k}.webp" alt="" loading="lazy" decoding="async">`;
const LV=['مبتدئ','مستكشف','متدرّب','مجتهد','متقدّم','متمكّن','متميّز','متفوّق','متفوّق بامتياز'];
const lvInfo=l=>{const i=Math.min(l,9);return{name:LV[i-1],img:`img/rank-${Math.min(i,8)}.webp`,top:i===9}};
const rankImg=(l,size,cls)=>{const L=lvInfo(l);return`<img class="rank ${L.top?'legend':''} ${cls||''}" src="${L.img}" alt="${L.name}" width="${size||40}" height="${size||40}">`};
window.FX={MASCOT,mascot,confetti,burst,mega,pop,bump,modal,toast,ring,radar,cover,lvInfo,rankImg,HAPPY,SAD,reduced};
})();

// v7: احتفالات هادئة: لا قصاصات ورق ولا انفجارات إلا في شاشة إتمام الدرس
(function(){const F=window.FX;if(!F)return;const c=F.confetti,m=F.mega;F.burst=()=>{};const pp=F.pop;F.pop=function(){if(document.body.classList.contains('focus'))return;return pp&&pp.apply(this,arguments)};const tt=F.toast;F.toast=function(h){if(document.querySelector('.done-screen')||document.body.classList.contains('focus'))return setTimeout(()=>{if(!document.body.classList.contains('focus'))tt(h)},0);return tt.apply(this,arguments)};F.confetti=function(){if(document.querySelector('.done-screen'))return c&&c.apply(this,arguments)};F.mega=function(){if(document.querySelector('.done-screen'))return m&&m.apply(this,arguments)}})();
