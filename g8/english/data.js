/* تحويل محتوى الكتاب (content.json بأي من صيغه المتوقعة) إلى نموذج موحّد يستخدمه الموقع. */
(function(){
const raw=window.EN_CONTENT||window.EN_RAW||{units:[]};
const S=v=>v==null?'':String(v).trim();
const arr=v=>Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v):v?[v]:[];
const pickS=(o,ks)=>{for(const k of ks)if(o&&o[k]!=null&&S(o[k]))return S(o[k]);return''};
const word=w=>typeof w==='string'?{en:S(w),ar:''}:{en:pickS(w,['en','word','phrase','text','term','english']),ar:pickS(w,['ar','arabic','meaning','translation','gloss']),ex:pickS(w,['example','ex','sentence']),pos:pickS(w,['pos','type','category']),audio:pickS(w,['audio','file'])};
const line=l=>typeof l==='string'?(m=>m?{sp:S(m[1]),en:S(m[2])}:{sp:'',en:S(l)})(l.match(/^([A-Z][\w' .-]{0,20}?)\s*[:：]\s*(.+)$/)):{sp:pickS(l,['speaker','sp','name','who','character']),en:pickS(l,['text','en','line','say','sentence']),g:pickS(l,['gender','g','voice'])};
const sent=s=>typeof s==='string'?{en:S(s),ar:''}:{en:pickS(s,['en','text','sentence']),ar:pickS(s,['ar','arabic','translation'])};
function unit(u,i){const n=+(u.number||u.unit||u.n||(S(u.id).match(/\d+/)||[])[0]||i+1);
 const vocab=arr(u.vocabulary||u.vocab||u.words||u.key_words||u.keywords).map(word).filter(w=>w.en);
 const dialogues=arr(u.dialogues||u.dialogs||u.conversations||u.dialogue).map((d,k)=>({title:pickS(d,['title','name','context'])||'Dialogue '+(k+1),page:d.page||'',period:d.period||'',lines:arr(d.lines||d.turns||d.text||d).map(line).filter(l=>l.en)})).filter(d=>d.lines.length);
 const texts=arr(u.texts||u.readings||u.reading_texts||u.reading||u.passages).map((t,k)=>typeof t==='string'?{title:'Reading '+(k+1),en:S(t)}:{title:pickS(t,['title','name','topic'])||'Reading '+(k+1),en:arr(t.text||t.body||t.paragraphs||t.content||t.en).map(S).join('\n\n'),page:t.page||'',topic:pickS(t,['topic'])}).filter(t=>t.en);
 const grammar=arr(u.grammar||u.structure||u.structures).map(g=>typeof g==='string'?{title:g,ar:'',examples:[]}:{title:pickS(g,['title','name','point','structure']),ar:pickS(g,['ar','explanation_ar','explain','explanation','rule']),examples:arr(g.examples||g.example).map(S).filter(Boolean)}).filter(g=>g.title);
 const pron=arr(u.pronunciation||u.pron).map(p=>typeof p==='string'?{title:p,words:[]}:{title:pickS(p,['title','name','focus','point']),words:arr(p.words||p.examples||p.items).map(x=>typeof x==='string'?x:pickS(x,['en','word','text'])).filter(Boolean)}).filter(p=>p.title);
 const sentences=arr(u.sentences||u.key_sentences||u.examples).map(sent).filter(s=>s.en);
 const fn=arr(u.functions||u.contexts||u.function).map(x=>typeof x==='string'?x:pickS(x,['text','title','en'])).filter(Boolean);
 const everyday=arr(u.everyday_english||u.everyday||u.phrases).map(x=>typeof x==='string'?x:pickS(x,['en','text','phrase'])).filter(Boolean);
 return{id:'U'+n,n,sem:+(u.semester||u.term||(n<=7?1:2)),title:pickS(u,['title','name'])||'Unit '+n,titleAr:pickS(u,['title_ar','ar']),page:u.page||u.start_page||'',revision:/revision/i.test(pickS(u,['title','name']))||!!u.revision,
  gaza:u.gaza_module||u.module||'',vocab,dialogues,texts,grammar,pron,sentences,functions:fn,everyday,writing:arr(u.writing).map(x=>typeof x==='string'?x:pickS(x,['title','text'])).filter(Boolean),verified:u.verified!==false,notes:S(u.notes||u.note),gramEn:arr(u.grammar_en).map(S),task:S(u.task),seeds:arr(u.seeds||u.practice_seeds)}}
const units=arr(raw.units).map(unit).sort((a,b)=>a.n-b.n);
const F=(window.EN_FOUND||[]);
window.ENC={source:raw.source||raw.book||'',sample:!!raw.sample,units,found:F,byId:Object.fromEntries([...units.map(u=>[u.id,u]),...F.map(f=>[f.id,f])])};
})();
