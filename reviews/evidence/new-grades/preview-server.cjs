// Read-only local audit preview. Exposes only public asset types on loopback.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json','.json':'application/json','.txt':'text/plain; charset=utf-8','.pdf':'application/pdf'};
http.createServer((req,res)=>{
 let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/abboud-math\//,'/').slice(1)}catch{res.writeHead(400).end();return}
 if(!rel||rel.endsWith('/'))rel+='index.html';const file=path.resolve(root,rel),type=mime[path.extname(file)];
 if(!file.startsWith(root+path.sep)||rel.split('/').some(x=>x.startsWith('.'))||!type){res.writeHead(404).end();return}
 fs.readFile(file,(e,bytes)=>{if(e){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'}).end(bytes)});
}).listen(4199,'127.0.0.1',()=>console.log('Audit: http://127.0.0.1:4199/abboud-math/'));
