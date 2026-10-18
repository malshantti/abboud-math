// Run: node tests/math-editor.cjs. Production AST validation/rendering without a DOM or network.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'admin/math-editor.js'),'utf8');
const window={},context={window,AbortController,Blob,TextEncoder,TextDecoder,atob,btoa};
for(const key of ['document','localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest'])Object.defineProperty(context,key,{get(){throw Error('Pure math API accessed '+key);}});
vm.runInNewContext(source,context);
const {validate,render,mount}=window.MATH_EDITOR;
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;},equal=(value,expected,message)=>{assert.deepEqual(value,expected,message);checks++;};
const json=value=>JSON.parse(JSON.stringify(value)),ast=tokens=>({version:1,tokens});
function accepted(value,message,options){let result;assert.doesNotThrow(()=>{result=validate(value,options);},message);check(result.ok,message);equal(Array.from(result.errors),[],message+' has no errors');check(result.value!==value,message+' returns its own canonical value');return result.value;}
function rejected(value,message,options){let result;assert.doesNotThrow(()=>{result=validate(value,options);},message);equal(result.ok,false,message);equal(result.value,null,message+' does not expose a partial expression');check(Array.isArray(result.errors)&&result.errors.length&&result.errors.every(error=>typeof error==='string'&&error.trim()),message+' gives a readable error');}
check(typeof mount==='function'&&typeof render==='function'&&typeof validate==='function','The public integration API is available');
check(!/\beval\s*\(|\bnew\s+Function\b|\bfetch\s*\(|\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest)\b/.test(source),'Math notation is not executable code or a network/storage operation');
const expression=ast([{kind:'text',value:'س = 12 + '},{kind:'fraction',numerator:'۳',denominator:'4'},{kind:'root',value:'25',index:'2'},{kind:'power',base:'ص',exponent:'3'}]);
const normalized=accepted(expression,'All four notation kinds');
equal(json(normalized),ast([{kind:'text',value:'س = ١٢ + '},{kind:'fraction',numerator:'٣',denominator:'٤'},{kind:'root',value:'٢٥',index:'٢'},{kind:'power',base:'ص',exponent:'٣'}]),'Western and Persian numerals normalize to Arabic Indic numerals');
for(const value of [null,undefined,[],true,1,'formula',{}, {version:2,tokens:[]}, {version:1,tokens:{}}])rejected(value,'Unsupported AST root');
rejected(ast([]),'Student-ready notation needs at least one token');accepted(ast([]),'An empty authoring expression can be retained',{allowIncomplete:true});
accepted(ast(Array.from({length:40},()=>({kind:'text',value:'س'}))),'Forty-token inclusive limit');
for(const options of [undefined,{allowIncomplete:true}])rejected(ast(Array.from({length:41},()=>({kind:'text',value:'س'}))),'Forty-one tokens are rejected in every mode',options);
for(const token of [null,[],true,'text',{}, {kind:'script',value:'x'}, {kind:'__proto__',value:'x'},{kind:{toString:1,valueOf:1},value:'x'}])rejected(ast([token]),'Token kinds cannot coerce untrusted objects');
const cases=[
 [{kind:'text',value:'س'},'value',200],
 [{kind:'fraction',numerator:'س',denominator:'ص'},'numerator',120],
 [{kind:'fraction',numerator:'س',denominator:'ص'},'denominator',120],
 [{kind:'root',value:'س'},'value',120],
 [{kind:'root',value:'س',index:'٣'},'index',120],
 [{kind:'power',base:'س',exponent:'٢'},'base',120],
 [{kind:'power',base:'س',exponent:'٢'},'exponent',120]
];
for(const [token,field,limit]of cases){
 accepted(ast([{...token,[field]:'س'.repeat(limit)}]),'Inclusive bound for '+token.kind+'.'+field);
 for(const value of [null,12,{},[],false,'س'.repeat(limit+1)])for(const options of [undefined,{allowIncomplete:true}])rejected(ast([{...token,[field]:value}]),'Type/length bound for '+token.kind+'.'+field,options);
 if(!(token.kind==='root'&&field==='index')){
  rejected(ast([{...token,[field]:''}]),'Blank '+token.kind+'.'+field+' blocks student-ready notation');
  accepted(ast([{...token,[field]:''}]),'Blank '+token.kind+'.'+field+' remains editable',{allowIncomplete:true});
 }
}
accepted(ast([{kind:'root',value:'س'}]),'Root index may be omitted');accepted(ast([{kind:'root',value:'س',index:''}]),'Root index may be blank');
for(const denominator of ['0','00','٠','٠٠','۰','۰۰','0.0','٠٫٠','۰٫۰۰','-0','−٠','+٠','٠٬٠٠٠','٠,٠','.0',' ٠ '])for(const options of [undefined,{allowIncomplete:true}])rejected(ast([{kind:'fraction',numerator:'١',denominator}]),'Numeric zero denominator is rejected after numeral normalization',options);
for(const denominator of ['١','1','س','ص + ١','٠٫١','-2'])accepted(ast([{kind:'fraction',numerator:'١',denominator}]),'Nonzero and symbolic denominators stay valid');
const original=JSON.stringify(expression),copy=accepted(expression,'Canonical notation is isolated');copy.tokens[0].value='changed';equal(JSON.stringify(expression),original,'Canonical edits do not mutate the author source');
const extras=ast([{kind:'text',value:'س',onclick:'secret',privateStudent:'secret'}]);extras.secret='secret';const cleaned=accepted(extras,'Only public AST fields are retained');equal(Object.keys(cleaned).sort(),['tokens','version'],'Canonical root omits unknown fields');equal(Object.keys(cleaned.tokens[0]).sort(),['kind','value'],'Canonical token omits unknown fields');
const payload='<img src=x onerror=alert()>';const unsafe=ast([{kind:'text',value:payload},{kind:'fraction',numerator:payload,denominator:'س'},{kind:'root',value:payload,index:payload},{kind:'power',base:payload,exponent:payload}]);
const safeHTML=render(unsafe);check(!safeHTML.includes('<img src=x'),'Imported text cannot create image elements');check(safeHTML.includes('&lt;img'),'Text is escaped in rendered notation');check(/role="math"/.test(safeHTML)&&/aria-label=/.test(safeHTML),'Rendered notation has an accessible text description');
const markup=render(expression);for(const kind of ['fraction','numerator','denominator','root','radicand','power'])check(markup.includes('me-'+kind),'Notation renders '+kind+' structurally');check(!/[0-9]/.test(markup.replace(/<[^>]*>/g,''))&&!/[0-9]/.test(markup.match(/aria-label="([^"]*)"/)[1]),'Rendered content and its accessible label use Arabic Indic numerals');
const separated=render(ast([{kind:'text',value:'س−ص+جـ+12'}]));
const displayedAtoms=Array.from(separated.matchAll(/<bdi[^>]*>([^<]*)<\/bdi>/g),match=>match[1]);
equal(displayedAtoms,['س','−','ص','+','جـ','+','١٢'],'Arabic variables cannot join or reverse operand order; جـ and multi-digit numbers stay intact');
const plainData=accepted(ast([{kind:'text',value:'س\u200c\u200e+\u200c\u200eص'}]),'Visual input markers are not stored');
equal(plainData.tokens[0].value,'س+ص','Saved text contains the mathematical characters without visual joining/direction controls');
check(render(ast([{kind:'fraction',numerator:'١',denominator:'٠'}])).includes('me-invalid'),'Invalid fractions cannot render as apparently valid notation');
const css=fs.readFileSync(path.join(root,'admin/math-editor.css'),'utf8');
check(/\.me-math-visual\s*\{[^}]*white-space\s*:\s*nowrap/.test(css),'A formula stays on one visual line');check(/\.me-fraction\s*\{[^}]*flex-direction\s*:\s*column/.test(css),'Fraction numerator and denominator stack vertically');check(/\.me-numerator\s*\{[^}]*border-bottom/.test(css),'A visible fraction bar separates numerator and denominator');check(!/@import\b|https?:\/\//.test(css),'The math editor has no CDN dependency');
vm.runInNewContext(fs.readFileSync(path.join(root,'admin/quiz-builder.js'),'utf8'),context);
const quiz={version:'bustan-quiz-draft-v1',metadata:{title:'اختبار صيغ تجريبي',grade:8,subject:'math',durationMinutes:null},questions:[{id:'math-question',type:'mcq',prompt:'اختر التعبير المناسب.',points:1,reference:{book:'',page:null},options:['أ','ب','ج','د'],answer:0}]};
const validateQuiz=window.QUIZ_BUILDER.validateDraft;
let result=validateQuiz(quiz);check(result.ok,'A legacy quiz without notation remains valid');check(!Object.hasOwn(result.draft.questions[0],'math'),'Legacy questions do not acquire invented notation');
const mathematical=json(quiz);mathematical.questions[0].math=expression;mathematical.questions[0].options=['','','',''];mathematical.questions[0].optionMath=[
 ast([{kind:'fraction',numerator:'1',denominator:'2'}]),ast([{kind:'fraction',numerator:'1',denominator:'3'}]),ast([{kind:'root',value:'9'}]),ast([{kind:'power',base:'2',exponent:'3'}])
];
result=validateQuiz(mathematical);check(result.ok,'Four mathematical choices may replace empty option text');equal(json(result.draft.questions[0].math),json(normalized),'Question notation survives quiz canonicalization');equal(result.draft.questions[0].optionMath.length,4,'All four choice expressions survive canonicalization');
const serialized=JSON.stringify(result.draft),roundTrip=validateQuiz(JSON.parse(serialized));check(roundTrip.ok,'Serialized mathematical quiz imports without losing validity');equal(JSON.stringify(roundTrip.draft),serialized,'Question and option notation survive a complete JSON round trip');
for(const malformed of [null,[],{version:1,tokens:[{kind:'fraction',numerator:'١',denominator:'٠'}]},{version:1,tokens:[{kind:'script',value:'x'}]}])for(const options of [undefined,{allowIncomplete:true}]){const value=json(quiz);value.questions[0].math=malformed;const checked=validateQuiz(value,options);check(!checked.ok&&checked.draft===null,'Quiz validation cannot bypass notation safety in either mode');}
for(const optionMath of [null,[],[null,null,null],[null,null,null,null,null],[null,null,null,'not an AST']]){const value=json(quiz);value.questions[0].optionMath=optionMath;check(!validateQuiz(value).ok,'Malformed option-expression arrays are rejected');}
const mixedDigits=json(quiz);mixedDigits.questions[0].options=['3','٣','4','5'];check(!validateQuiz(mixedDigits).ok,'Equivalent Arabic/Western numerals do not become different quiz choices');
const mixedCase=json(quiz);mixedCase.questions[0].options=['A','a','B','b'];check(validateQuiz(mixedCase).ok,'Letter case remains meaningful for quiz choices');
const blankFormula=json(quiz);blankFormula.questions[0].math=ast([{kind:'fraction',numerator:'',denominator:''}]);check(validateQuiz(blankFormula,{allowIncomplete:true}).ok,'Unfinished notation may be saved with an unfinished draft');check(!validateQuiz(blankFormula).ok,'Unfinished notation still blocks student-ready quiz validation');
console.log('PASS: '+checks+' math AST, numeral, boundary, zero denominator, canonical isolation, escaping and rendering checks');
