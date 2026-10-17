// Compare versions with Git rather than pinning release names. Before a PR:
// CACHE_BASE_REF=origin/main node tests/cache-updates.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const version=(text,file)=>{const match=text.match(/\bconst\s+V\s*=\s*(['"])([^'"\r\n]+)\1/);assert.ok(match,'Cache version declared: '+file);return match[2];};
for(const grade of [6,8])for(const subject of ['math','english','arabic','science']){
 const file=`g${grade}/${subject}/sw.js`;
 version(fs.readFileSync(path.join(root,file),'utf8'),file);
}
let base=process.env.CACHE_BASE_REF;
if(!base){try{git('rev-parse','--verify','origin/main');base='origin/main';}catch{console.log('PASS: eight cache declarations; no Git base available for change comparison');process.exit(0);}}
git('rev-parse','--verify',base); // An explicit invalid reference must fail.
const files=git('diff','--name-only',base,'--','g6','g8').split(/\r?\n/).filter(Boolean);
// New untracked files are not yet in a Git diff, so include them before staging.
files.push(...git('ls-files','--others','--exclude-standard','--','g6','g8').split(/\r?\n/).filter(Boolean));
const subjects=new Set(files.map(file=>file.match(/^(g[68]\/(?:math|english|arabic|science))\//)?.[1]).filter(Boolean));
for(const subject of subjects){
 const file=subject+'/sw.js';
 const previous=version(git('show',base+':'+file),file+' at '+base);
 const current=version(fs.readFileSync(path.join(root,file),'utf8'),file);
 assert.notEqual(current,previous,'Subject changed without a new cache version: '+subject);
}
console.log(`PASS: eight cache declarations; ${subjects.size} changed subjects have new versions against ${base}`);
