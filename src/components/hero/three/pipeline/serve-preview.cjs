const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require(process.env.FM_ESBUILD || 'esbuild');
const cwd = process.cwd();
const outdir = path.join(__dirname,'verification');
fs.mkdirSync(outdir,{recursive:true});
esbuild.buildSync({entryPoints:[path.join(__dirname,'preview.tsx')],bundle:true,minify:true,format:'esm',target:'es2022',outfile:path.join(outdir,'preview.js'),define:{'process.env.NODE_ENV':'"production"'},loader:{'.js':'jsx'}});
const css=fs.readFileSync(path.join(cwd,'src/app/globals.css'),'utf8');
const declarations=css.match(/--[\w-]+\s*:\s*[^;{}]+;/g).filter(s=>!s.startsWith('--hp'));
const html='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{'+declarations.join('')+'}body{margin:0;background:var(--bg);overflow:hidden}</style></head><body><div id="root"></div><script type="module" src="/preview.js"></script></body></html>';
http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(url.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
  const file=url.pathname==='/preview.js'?path.join(outdir,'preview.js'):path.resolve(cwd,'public','.'+url.pathname);
  if(!file.startsWith(path.join(cwd,'public')+path.sep)&&file!==path.join(outdir,'preview.js')){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.glb')?'model/gltf-binary':'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(4310,'127.0.0.1',()=>console.log('Scene preview http://127.0.0.1:4310'));
