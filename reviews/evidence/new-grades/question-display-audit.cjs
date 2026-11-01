const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../../..'),out=process.env.BUSTAN_AUDIT_OUT||path.join(require('os').tmpdir(),'bustan-new-grades-audit');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--no-startup-window'],...(process.env.BUSTAN_BROWSER?{executablePath:process.env.BUSTAN_BROWSER}:{})});
 const grade=7,subject='math';
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await c.newPage();
  const r={grade,subject,pages:[],errors:[],badResponses:[],failed:[]};
  r.consoleErrors=[];p.on("console",m=>{if(m.type()==="error")r.consoleErrors.push({text:m.text(),offline:r.phase==="offline"})});p.on('pageerror',e=>r.errors.push(e.message));p.on('response',x=>{if(x.status()>=400)r.badResponses.push({status:x.status(),url:x.url()})});p.on('requestfailed',x=>r.failed.push({url:x.url(),error:x.failure()?.errorText}));
  await c.addInitScript(({grade})=>{if(!localStorage.getItem('bustan_session')){localStorage.setItem('bustan_profiles',JSON.stringify([{id:'audit',name:'طالب المراجعة',avatar:'idle',pin:null,salt:null,created:Date.now()}]));localStorage.setItem('bustan_owner','audit');localStorage.setItem('bustan_session',JSON.stringify({id:'audit',t:Date.now(),token:'audit-fixture'}));localStorage.setItem('bustan_grade',String(grade));localStorage.setItem('bustan_sync_state',JSON.stringify({user:'audit@example.invalid',map:{audit:1},base:{audit:{}}}));localStorage.setItem('bustan_account',JSON.stringify({email:'audit@example.invalid',name:'حساب اختبار',t:Date.now()}));localStorage.setItem('bustan_sync_access',JSON.stringify({allowed:true,kind:'trial',subjects:null}));}}, {grade});
  // The static preview has no Laravel API. Read-only authenticated fixture; no real accounts or remote writes.
  await c.route('**/admin-api/api/**',route=>{const req=route.request();return route.fulfill({contentType:'application/json',body:JSON.stringify(req.url().endsWith('/session')?{authenticated:true,csrf:'fixture',user:{name:'حساب اختبار',email:'audit@example.invalid'},access:{allowed:true,kind:'trial',subjects:null},students:[{id:1,local_id:"audit",name:"طالب المراجعة",grade,subjects:null}],site:{},urls:{}}:{items:{}})})});

 await p.goto('http://127.0.0.1:4199/abboud-math/g7/math/#/u/U5L1',{waitUntil:'networkidle'});
 await p.evaluate(()=>{let l=APP.gen.LES.find(l=>l.id==='U5L1');APP.quiz([APP.gen.bookQs(l)[4]],{key:'audit-only',title:'فحص عرض السؤال',back:'#/home'})});
 await p.waitForTimeout(500);
 const question=await p.locator('#app').innerText();const options=await p.locator('.opt').allTextContents();
 console.log(JSON.stringify({question,options}));
 fs.writeFileSync(path.join(out,'g7-question-evidence.json'),JSON.stringify({question,options},null,2));
 await c.close();await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});