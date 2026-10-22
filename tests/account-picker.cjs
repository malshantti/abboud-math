'use strict';
// The student picker shows only the account's students (no local creation), the grade is fixed by the parent,
// and subjects open only for the student's grade with an active trial or subscription.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const login=read('login.js'),entry=read('entry.js'),sync=read('sync.js');
assert.doesNotMatch(login,/طالب جديد|id="add"|P\.create\(/,'no create-student card or local creation in the picker');
assert.match(login,/إدارة الطلاب من صفحة الحساب/);assert.match(login,/admin-api\/account/);
assert.match(login,/P\.roster\(\)/,'picker lists the server roster');
assert.match(entry,/fixedG/);assert.match(entry,/>اشترك</);assert.match(entry,/إدارة الأبناء/);
assert.doesNotMatch(sync,/api\('students',\{body/,'sync never creates students on the server');
for(const f of [login,entry,sync])assert.doesNotMatch(f,/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,'no emoji');
// Entitlement rules from profiles.js
const map=new Map(),ls={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
const c={console,URL,Uint8Array,TextEncoder,Date,Math,JSON,Promise,setTimeout,localStorage:ls,navigator:{},location:{protocol:'file:',pathname:'/'}};c.window=c;
vm.createContext(c);vm.runInContext(read('profiles.js'),c);const P=c.PROFILES;
const roster=access=>map.set('bustan_roster',JSON.stringify({email:'p@x',access,students:[{sid:1,local:'ps1',name:'ليلى',grade:2},{sid:2,local:'ps2',name:'سامي',grade:null}]}));
roster({allowed:true,kind:'trial',subjects:null});
assert.equal(P.entitlement('ps1',2,'math'),'ok','trial: own grade open');
assert.equal(P.entitlement('ps1',8,'math'),'grade','other grade closed');
assert.equal(P.entitlement('ps2',2,'math'),'grade','no grade set by the parent: closed');
assert.equal(P.entitlement('px',2,'math'),'none','not an account student');
roster({allowed:true,kind:'paid',subjects:['g2-arabic']});
assert.equal(P.entitlement('ps1',2,'arabic'),'ok');assert.equal(P.entitlement('ps1',2,'math'),'locked');
roster({allowed:false,kind:'expired',subjects:[]});assert.equal(P.entitlement('ps1',2,'arabic'),'locked');
console.log('PASS: picker shows account students only, grade fixed by the parent, subjects gated by grade and trial/subscription');
