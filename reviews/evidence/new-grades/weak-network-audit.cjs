const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../..'),out=process.env.BUSTAN_AUDIT_OUT||path.join(require('os').tmpdir(),'bustan-new-grades-audit');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--no-startup-window'],...(process.env.BUSTAN_BROWSER?{executablePath:process.env.BUSTAN_BROWSER}:{})});
 const results=[];
 for(const grade of [7])for(const subject of ['science']){
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();
  const r={grade,subject,pages:[],errors:[],badResponses:[],failed:[]};
  p.on('pageerror',e=>r.errors.push(e.message));p.on('response',x=>{if(x.status()>=400)r.badResponses.push({status:x.status(),url:x.url()})});p.on('requestfailed',x=>r.failed.push({url:x.url(),error:x.failure()?.errorText}));
  await c.addInitScript(({grade})=>{if(!localStorage.getItem('bustan_session')){localStorage.setItem('bustan_profiles',JSON.stringify([{id:'audit',name:'طالب المراجعة',avatar:'idle',pin:null,salt:null,created:Date.now()}]));localStorage.setItem('bustan_owner','audit');localStorage.setItem('bustan_session',JSON.stringify({id:'audit',t:Date.now(),token:'audit-fixture'}));localStorage.setItem('bustan_grade',String(grade));localStorage.setItem('bustan_sync_state',JSON.stringify({user:'audit@example.invalid',map:{audit:1},base:{audit:{}}}));localStorage.setItem('bustan_account',JSON.stringify({email:'audit@example.invalid',name:'حساب اختبار',t:Date.now()}));localStorage.setItem('bustan_sync_access',JSON.stringify({allowed:true,kind:'trial',subjects:null}));}}, {grade});
  // The static preview has no Laravel API. Read-only authenticated fixture; no real accounts or remote writes.
  await c.route('**/admin-api/api/**',route=>{const req=route.request();return route.fulfill({contentType:'application/json',body:JSON.stringify(req.url().endsWith('/session')?{authenticated:true,csrf:'fixture',user:{name:'حساب اختبار',email:'audit@example.invalid'},access:{allowed:true,kind:'trial',subjects:null},students:[{id:1,local_id:"audit",name:"طالب المراجعة",grade,subjects:null}],site:{},urls:{}}:{items:{}})})});
  const cdp=await c.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:400,downloadThroughput:65536,uploadThroughput:32768});const weakStarted=Date.now();
  const base=`http://127.0.0.1:4199/abboud-math/g${grade}/${subject}/`;
  async function capture(label){await p.waitForTimeout(180);r.pages.push({label,url:p.url(),...await p.evaluate(()=>({title:document.querySelector('#app h1,#app h2')?.textContent,text:document.querySelector('#app')?.innerText.slice(0,160),overflow:document.documentElement.scrollWidth>innerWidth+1,width:innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),gate:document.documentElement.dataset.gate,inert:document.querySelector('#app')?.inert}))})}
  try{
   await p.goto(base+'#/home',{waitUntil:'networkidle',timeout:30000});await p.evaluate(()=>document.fonts.ready);r.weakHomeMs=Date.now()-weakStarted;await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await p.waitForTimeout(1000);if(await p.locator('#bWarm').count()){const bs=p.locator('#bWarmO button');for(let k=0;k<await bs.count();k++){if(!await p.locator('#bWarm').count())break;await bs.nth(k).click();await p.waitForTimeout(850);}}await capture('home-mobile');r.offlineButton=await p.locator('#offbtn').count();
   await p.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:12000}).catch(()=>{});
   r.sw=await p.evaluate(async()=>({controller:!!navigator.serviceWorker.controller,caches:await caches.keys()}));
   const ids=await p.evaluate(()=>{const u=window.UNITS||window.G3?.units;return {first:u?.[0]?.les?.[0]?.id,last:u?.at(-1)?.les?.at(-1)?.id}});
   for(const route of ['u/'+ids.first,'u/'+ids.last,'basics','play','lab','report']){
    await p.evaluate(h=>{location.hash=h},'#/'+route);await capture(route);
    if(route==='lab'||route==='play'){
     const link=p.locator('#app a[href^="#/l/"],#app a[href^="#/adv/"]').first();if(await link.count()){await link.click();await capture(route+'-activity');}
    }
   }
   await p.setViewportSize({width:1366,height:900});await p.evaluate(()=>location.hash='#/u/'+((window.UNITS||window.G3?.units)[0].les[0].id));await capture('lesson-desktop');
   if(grade===7&&subject==='math'||grade===4&&subject==='arabic'||grade===3&&subject==='science')await p.screenshot({path:path.join(out,`g${grade}-${subject}-desktop.png`),fullPage:true});
   await c.setOffline(true);await p.reload({waitUntil:'domcontentloaded',timeout:20000});await capture('offline-reload-visited-lesson');
   await p.evaluate(h=>location.hash=h,'#/u/'+ids.last);await capture('offline-last-lesson');
   r.offline=await p.evaluate(()=>({controller:!!navigator.serviceWorker.controller,text:document.querySelector('#app')?.innerText.slice(0,100),inert:document.querySelector('#app')?.inert}));
  }catch(e){r.fatal=e.message}
  results.push(r);fs.writeFileSync(path.join(out,'weak-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({grade,subject,fatal:r.fatal,errors:r.errors,bad:r.badResponses.length,overflow:r.pages.filter(p=>p.overflow).map(p=>p.label),offline:r.offline,sw:r.sw?.controller,weakHomeMs:r.weakHomeMs,offlineButton:r.offlineButton}));
  await c.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
