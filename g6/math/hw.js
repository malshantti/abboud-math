// لوحة الكتابة: مُعرِّف خط يدوي محلي (سحابة نقاط $P + قواعد هندسية) + محلل تعابير + فاحص تكافؤ الخطوات
(function(){
// ---------- قوالب الرموز (مرسومة برمجياً في مربع وحدة 0..1، y للأسفل) ----------
const arc=(cx,cy,rx,ry,a0,a1,n=14)=>{const p=[];for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180;p.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)])}return p};
const L=(...p)=>p;
const GL={
 '0':[[arc(.5,.5,.38,.5,-90,270,24)],[arc(.5,.5,.32,.5,-100,250,24)]],
 '1':[[L([.5,0],[.5,1])],[L([.25,.25],[.55,0],[.55,1])],[L([.3,.2],[.55,0],[.55,1]),L([.3,1],[.8,1])]],
 '2':[[[...arc(.5,.3,.38,.3,190,370,10),[.12,1],[.9,1]]],[[...arc(.5,.28,.36,.28,180,400,12),[.1,1],[.92,.98]]]],
 '3':[[[...arc(.48,.25,.36,.25,200,450,10),...arc(.48,.73,.4,.27,-90,160,10)]],[L([.15,0],[.85,0],[.45,.42]),arc(.48,.7,.4,.3,-90,160,10)]],
 '4':[[L([.72,1],[.72,0],[.05,.68],[.95,.68])],[L([.2,0],[.12,.62],[.92,.62]),L([.72,.2],[.72,1])]],
 '5':[[[...L([.85,0],[.22,0],[.18,.45]),...arc(.47,.7,.38,.3,-120,150,10)]],[L([.2,0],[.17,.45]),arc(.47,.7,.38,.3,-120,150,10),L([.2,0],[.85,0])]],
 '6':[[[...arc(.6,.4,.42,.42,-80,-180,6),...arc(.5,.7,.35,.3,180,540,16)]],[[[.75,0],[.3,.4],...arc(.5,.72,.32,.28,200,560,16)]]],
 '7':[[L([.08,0],[.92,0],[.35,1])],[L([.08,0],[.92,0],[.45,1]),L([.35,.5],[.8,.5])]],
 '8':[[[...arc(.5,.26,.28,.26,90,-270,14),...arc(.5,.74,.36,.26,-90,270,16)]],[[...arc(.5,.25,.3,.25,0,360,14),...arc(.5,.75,.34,.25,-90,270,14)]]],
 '9':[[[...arc(.5,.3,.36,.3,0,360,16),[.86,.3],[.8,1]]],[[...arc(.48,.28,.34,.28,10,370,16),[.82,.32],[.82,1]]]],
 '+':[[L([.5,0],[.5,1]),L([0,.5],[1,.5])],[L([0,.5],[1,.5]),L([.5,0],[.5,1])]],
 'x':[[L([0,0],[1,1]),L([1,0],[0,1])],[[...arc(.25,.5,.25,.5,-90,90,6)],[...arc(.75,.5,.25,.5,90,270,6)]],[L([.1,.05],[.9,.95]),L([.9,.05],[.1,.95])]],
 '(':[[arc(1,.5,.8,.5,120,240,12)],[arc(.95,.5,.7,.5,110,250,12)]],
 ')':[[arc(0,.5,.8,.5,-60,60,12)],[arc(.05,.5,.7,.5,-70,70,12)]],
 '/':[[L([.9,0],[.1,1])],[L([.75,0],[.25,1])]],
};
// ---------- $P Point-Cloud Recognizer (Vatavu, Anthony, Wobbrock 2012) ----------
const N=32;
function resample(pts,n){const I=pathLen(pts)/(n-1);let D=0;const out=[pts[0]];pts=pts.map(p=>p.slice());
 for(let i=1;i<pts.length;i++){if(pts[i][2]===pts[i-1][2]){const d=dist(pts[i-1],pts[i]);if(D+d>=I&&d>0){const t=(I-D)/d;const q=[pts[i-1][0]+t*(pts[i][0]-pts[i-1][0]),pts[i-1][1]+t*(pts[i][1]-pts[i-1][1]),pts[i][2]];out.push(q);pts.splice(i,0,q);D=0}else D+=d}}
 while(out.length<n)out.push(pts[pts.length-1]);return out.slice(0,n)}
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function pathLen(p){let d=0;for(let i=1;i<p.length;i++)if(p[i][2]===p[i-1][2])d+=dist(p[i-1],p[i]);return d||1}
function norm(strokes){let pts=[];strokes.forEach((s,k)=>s.forEach(p=>pts.push([p[0],p[1],k])));if(pts.length<2)pts.push([pts[0][0]+.01,pts[0][1],0]);
 pts=resample(pts,N);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});
 const s=Math.max(x1-x0,y1-y0)||1;pts=pts.map(p=>[(p[0]-x0)/s,(p[1]-y0)/s,p[2]]);const c=pts.reduce((a,p)=>[a[0]+p[0]/N,a[1]+p[1]/N],[0,0]);return pts.map(p=>[p[0]-c[0],p[1]-c[1]])}
function cloudD(a,b,start){const m=new Array(N).fill(false);let sum=0,i=start;do{let mn=1e9,idx=-1;for(let j=0;j<N;j++)if(!m[j]){const d=dist(a[i],b[j]);if(d<mn){mn=d;idx=j}}m[idx]=true;const w=1-((i-start+N)%N)/N;sum+=w*mn;i=(i+1)%N}while(i!==start);return sum}
function greedy(a,b){const step=Math.floor(Math.pow(N,.5));let mn=1e9;for(let i=0;i<N;i+=step)mn=Math.min(mn,cloudD(a,b,i),cloudD(b,a,i));return mn}
// تنويعات: ميلان وتمدد بسيطان لكل قالب
const TPL=[];Object.entries(GL).forEach(([ch,vs])=>vs.forEach(v=>[[0,1],[.18,1],[-.15,1],[0,.75],[.1,1.25]].forEach(([sl,asp])=>TPL.push({ch,p:norm(v.map(s=>s.map(([x,y])=>[(x+sl*(1-y))*asp,y])))}))));
function classify(strokes,allowed){const p=norm(strokes);let best=null,bd=1e9;for(const t of TPL){if(allowed&&!allowed.includes(t.ch))continue;const d=greedy(p,t.p);if(d<bd){bd=d;best=t.ch}}return{ch:best,score:bd}}
// ---------- تقطيع السطر إلى رموز + قواعد هندسية ----------
const bb=ss=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;ss.forEach(s=>s.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}));return{x0,y0,x1,y1,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,cy:(y0+y1)/2}};
function groupStrokes(strokes){const it=strokes.map(s=>({s:[s],b:bb([s])})).sort((a,b)=>a.b.x0-b.b.x0);const g=[];
 for(const o of it){const last=g[g.length-1];if(last){const b=last.b,ov=Math.min(b.x1,o.b.x1)-Math.max(b.x0,o.b.x0),mw=Math.min(b.w,o.b.w)||1;
  if(ov>0.35*mw||ov>-3||(ov>-4&&(o.b.w<8&&o.b.h<8))){last.s.push(...o.s);last.b=bb(last.s);continue}}g.push({s:o.s.slice(),b:o.b})}return g}
function recLine(strokes,H){if(!strokes.length)return'';H=H||80;
 // كسر بخط أفقي: خط مسطح طويل وفوقه وتحته رموز ضمن مداه
 const flats=strokes.map((s,i)=>({i,b:bb([s])})).filter(o=>o.b.w>H*.35&&o.b.h<o.b.w*.22).sort((a,b)=>b.b.w-a.b.w);
 for(const f of flats){const inside=strokes.filter((s,i)=>i!==f.i&&(()=>{const b=bb([s]);return b.cx>f.b.x0-4&&b.cx<f.b.x1+4})());
  const up=inside.filter(s=>bb([s]).cy<f.b.cy-3),dn=inside.filter(s=>bb([s]).cy>f.b.cy+3);
  if(up.length&&dn.length&&!(up.length===1&&dn.length===1&&bb(up).w<6&&bb(dn).w<6)){const rest=strokes.filter((s,i)=>i!==f.i&&!inside.includes(s));
   const L=rest.filter(s=>bb([s]).cx<f.b.x0),Rr=rest.filter(s=>bb([s]).cx>f.b.x1);const wrap=t=>t.length>1?'('+t+')':t;
   return recLine(L,H)+wrap(recLine(up,H*.7))+'/'+wrap(recLine(dn,H*.7))+recLine(Rr,H)}}
 const gs=groupStrokes(strokes);const hs=gs.map(g=>g.b.h).filter(h=>h>H*.25).sort((a,b)=>a-b);const med=hs.length?hs[hs.length>>1]:H*.6;
 return gs.map(g=>{const b=g.b,n=g.s.length,dots=g.s.filter(s=>{const q=bb([s]);return q.w<med*.18&&q.h<med*.18}),lines=g.s.filter(s=>!dots.includes(s));
  const flat=s=>{const q=bb([s]);return q.h<Math.max(q.w*.3,med*.12)&&q.w>med*.2};
  if(n===1&&flat(g.s[0]))return'-';
  if(dots.length===2&&lines.length===1&&flat(lines[0]))return'÷';
  if(n===2&&g.s.every(flat))return'=';
  if(n===1&&b.h>med*.5){const s=g.s[0],dx=Math.abs(s[s.length-1][0]-s[0][0]),a0=s[0],a1=s[s.length-1],ch=Math.hypot(a1[0]-a0[0],a1[1]-a0[1])||1,dev=Math.max(...s.map(p=>Math.abs((a1[0]-a0[0])*(a0[1]-p[1])-(a0[0]-p[0])*(a1[1]-a0[1]))/ch)),straight=dev<ch*.07&&ch>b.h*.85;
   const top=a0[1]<a1[1]?a0:a1,bot=a0[1]<a1[1]?a1:a0,slant=(top[0]-bot[0])/(b.h||1);
   if(straight){if(Math.abs(slant)<.2)return'1';if(slant>.2)return'/'}
   if(dev>ch*.07&&dev<ch*.3&&b.w<b.h*.55){const mid=s[s.length>>1],cxl=(a0[0]+a1[0])/2;return mid[0]<cxl?'(':')'}}
  const r=classify(g.s);if(r.ch==='1'&&n===1){const q=classify(g.s,'023456789'.split(''));return q.ch}if(r.ch==='x'&&b.h<med*.62)return'×';if(r.ch==='+'&&n===1)return classify(g.s,'0123456789()/'.split('')).ch;return r.ch}).join('')}
// ---------- محلل التعابير ----------
function parse(src){const s=window.AR_NUM.normalize(src).replace(/\s+/g,'').replace(/[س]/g,'x').replace(/[×*·]/g,'*').replace(/÷/g,':');let i=0;
 const peek=()=>s[i],eat=c=>{if(s[i]===c){i++;return true}return false};
 function E(){let a=T_();for(;;){if(eat('+')){const b=T_(),A=a;a=x=>A(x)+b(x)}else if(eat('-')){const b=T_(),A=a;a=x=>A(x)-b(x)}else return a}}
 function T_(){let a=U();for(;;){if(eat('*')){const b=U(),A=a;a=x=>A(x)*b(x)}else if(eat('/')||eat(':')){const b=U(),A=a;a=x=>A(x)/b(x)}else if(peek()&&/[0-9x(.]/.test(peek())){const b=F(),A=a;a=x=>A(x)*b(x)}else return a}}
 function U(){if(eat('-')){const a=U();return x=>-a(x)}if(eat('+'))return U();return F()}
 function F(){let a;if(eat('(')){a=E();if(!eat(')'))throw Error('قوس غير مغلق')}else if(eat('x'))a=x=>x;else{const m=s.slice(i).match(/^\d+(\.\d+)?/);if(!m)throw Error('رمز غير متوقع عند '+(s[i]||'النهاية'));i+=m[0].length;const v=+m[0];a=()=>v}
  if(eat('^')){const e=F(),A=a;a=x=>Math.pow(A(x),e(x))}else if(eat('²')){const A=a;a=x=>A(x)*A(x)}return a}
 const f=E();if(i<s.length)throw Error('رمز غير متوقع: '+s[i]);return f}
function parseLine(t){t=t.trim().replace(/^=/,'');const parts=t.split('=');if(parts.length>2)throw Error('أكثر من علامة =');return parts.length===2?{eq:true,L:parse(parts[0]),R:parse(parts[1]),raw:t}:{eq:false,f:parse(parts[0]),raw:t}}
const close=(a,b)=>Math.abs(a-b)<1e-6*Math.max(1,Math.abs(a),Math.abs(b));
function root(l){const g=x=>l.L(x)-l.R(x);const g0=g(0),g1=g(1),g2=g(2);if(!close(g2-2*g1+g0,0))return{nonlin:true};const k=g1-g0;if(close(k,0))return close(g0,0)?{all:true}:{none:true};return{x:-g0/k}}
const XS=[-2.5,-1,0.5,1.75,3];const same=(f,g)=>XS.every(x=>close(f(x),g(x)));
// task:{type:'eq'|'expr'|'num',start,traps:[{line,mis}]}
function check(task,lines){lines=lines.map(window.AR_NUM.normalize);const st=parseLine(task.start);const ref=task.type==='eq'?root(st):null;const out=[];
 for(let k=0;k<lines.length;k++){const t=lines[k];if(!t.trim()){out.push({k,ok:null});continue}let l;try{l=parseLine(t)}catch(e){out.push({k,ok:false,err:'لم أستطع قراءة السطر: '+e.message});return{lines:out,stop:k}}
  let ok;if(task.type==='eq'){if(!l.eq)ok=false;else{const r=root(l);ok=r.x!=null&&close(r.x,ref.x)}}
  else{const f=l.eq?l.R:l.f;ok=task.type==='num'?close(f(0),st.f(0)):same(f,st.f);if(l.eq&&ok)ok=task.type==='num'?close(l.L(0),st.f(0)):same(l.L,st.f)}
  if(!ok){let mis=null;for(const tr of task.traps||[]){try{const q=parseLine(tr.line);if(task.type==='eq'&&l.eq){const a=root(l),b=root(q);if(a.x!=null&&b.x!=null&&close(a.x,b.x)){mis=tr.mis;break}}
    else if(!l.eq&&!q.eq&&(task.type==='num'?close(l.f(0),q.f(0)):same(l.f,q.f))){mis=tr.mis;break}}catch(e){}}
   out.push({k,ok:false,mis,err:task.type==='eq'&&!l.eq?'كل سطر في حل المعادلة يجب أن يكون معادلة فيها =':null});return{lines:out,stop:k}}
  out.push({k,ok:true})}
 const filled=lines.filter(t=>t.trim());const last=(filled[filled.length-1]||'').replace(/\s/g,'').replace(/[−–]/g,'-');
 const done=task.type==='eq'?/^x=-?\d+(\.\d+)?$|^-?\d+(\.\d+)?=x$|^x=-?\d+\/\d+$/.test(last.replace('س','x')):task.type==='num'?/^=?-?\d+(\/\d+)?$|^=?-?\(?\d+\)?\/\(?\d+\)?$/.test(last):filled.length>0;
 return{lines:out,stop:-1,done}}
// ---------- أداة لوحة الرسم لسطر واحد ----------
function Pad(cv,onEnd){const ctx=cv.getContext('2d');let strokes=[],curS=null;const dpr=window.devicePixelRatio||1;
 const fit=()=>{const r=cv.getBoundingClientRect();cv.width=r.width*dpr;cv.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()};
 const col=()=>getComputedStyle(cv).color||'#1e1b4b';
 function draw(){const r=cv.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.strokeStyle='rgba(124,92,255,.25)';ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(8,r.height*.82);ctx.lineTo(r.width-8,r.height*.82);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=col();ctx.lineWidth=3.4;ctx.lineCap=ctx.lineJoin='round';strokes.concat(curS?[curS]:[]).forEach(s=>{ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(s.length===1)ctx.lineTo(s[0][0]+.1,s[0][1]);ctx.stroke()})}
 const pos=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};let tm=null;
 cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);curS=[pos(e)];clearTimeout(tm);draw()});
 cv.addEventListener('pointermove',e=>{if(!curS)return;const p=pos(e),l=curS[curS.length-1];if(dist(p,l)>1.5){curS.push(p);draw()}});
 const up=()=>{if(!curS)return;strokes.push(curS);curS=null;draw();clearTimeout(tm);tm=setTimeout(()=>onEnd&&onEnd(),550)};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 fit();return{fit,undo(){strokes.pop();draw();onEnd&&onEnd()},clear(){strokes=[];draw()},rec(){return recLine(strokes,cv.getBoundingClientRect().height)},get n(){return strokes.length},strokes:()=>strokes}}
const pretty=t=>window.AR_NUM.arabic(t).replace(/-/g,'−').replace(/\*/g,'×').replace(/x/g,'س');
window.HW={GL,classify,recLine,parse,parseLine,check,Pad,pretty,norm};
})();
