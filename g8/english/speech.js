/* تدريب النطق: التعرّف على الكلام إن توفّر في المتصفح، وإلا تسجيل الصوت وإعادة سماعه للمقارنة بالنموذج. */
(function(){
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const words=t=>AU.norm(t).replace(/[^a-z0-9' ]/g,' ').split(/\s+/).filter(Boolean);
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function score(target,heard){const T=words(target),H=words(heard);if(!T.length)return{pct:0,marks:[]};const used=new Set();const marks=T.map(w=>{let best=0,bi=-1;H.forEach((h,i)=>{if(used.has(i))return;const s=1-lev(w,h)/Math.max(w.length,h.length);if(s>best){best=s;bi=i}});if(best>=.75&&bi>=0)used.add(bi);return{w,ok:best>=.75}});return{pct:Math.round(100*marks.filter(m=>m.ok).length/T.length),marks}}
function recognize(target){return new Promise((res,rej)=>{if(!SR){rej('nosr');return}const r=new SR();r.lang='en-GB';r.interimResults=false;r.maxAlternatives=5;let got=false;
 r.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);let best={pct:-1};alts.forEach(a=>{const s=score(target,a);if(s.pct>best.pct)best={...s,heard:a}});res(best)};
 r.onerror=e=>rej(e.error||'err');r.onend=()=>{if(!got)rej('nospeech')};try{r.start()}catch(e){rej('start')}})}
let rec=null,chunks=[];
const canRec=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
async function recStart(){const s=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];rec=new MediaRecorder(s);rec.ondataavailable=e=>chunks.push(e.data);rec.start();return true}
function recStop(){return new Promise(res=>{if(!rec){res(null);return}rec.onstop=()=>{rec.stream.getTracks().forEach(t=>t.stop());const b=new Blob(chunks,{type:rec.mimeType||'audio/webm'});rec=null;res(URL.createObjectURL(b))};rec.stop()})}
// مطابقة الحروف: أي حروف الكلمة المستهدفة لم تظهر فيما سُمع (لتلوين المقاطع)
function charMarks(t,h){t=t.toLowerCase();h=String(h||'').toLowerCase().replace(/[^a-z']/g,'');const m=t.length,n=h.length,d=Array.from({length:m+1},(_,i)=>Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(t[i-1]===h[j-1]?0:1));const ok=Array(m).fill(false);let i=m,j=n;
 while(i>0&&j>0){if(t[i-1]===h[j-1]&&d[i][j]===d[i-1][j-1]){ok[i-1]=true;i--;j--}else if(d[i][j]===d[i-1][j-1]+1){i--;j--}else if(d[i][j]===d[i-1][j]+1)i--;else j--}return ok}
async function sayWord(target){const r=await recognize(target);const best=(r.heard||'');const tw=target.toLowerCase().replace(/[^a-z' ]/g,'');const hw=best.toLowerCase().replace(/[^a-z' ]/g,'');
 const tt=tw.replace(/\s/g,'');const marks=charMarks(tt,hw.replace(/\s/g,''));const pct=Math.round(100*marks.filter(Boolean).length/Math.max(1,tt.length));return{pct:Math.max(pct,r.pct===100?100:0),heard:best,marks}}
window.SPEECH={charMarks,sayWord,hasSR:!!SR,canRec,recognize,recStart,recStop,score,words};
})();
