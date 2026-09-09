const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const esbuild=require(process.env.FM_ESBUILD||'esbuild');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.FM_PLAYWRIGHT||'playwright');
const output=path.join(__dirname,'verification');
(async()=>{
 const fixture=path.join(output,'diagram-fixture.cjs');
 esbuild.buildSync({entryPoints:[path.join(__dirname,'diagram-fixture.tsx')],bundle:true,platform:'node',outfile:fixture,jsx:'automatic'});
 execFileSync(process.execPath,[fixture],{stdio:'inherit'});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const report={};
 try{for(const view of ['top','side']){
   const file=`public/3d/diagram/coupe-${view}.svg`;
   assert.ok(fs.statSync(file).size<40000);
   const page=await browser.newPage({viewport:{width:1200,height:620}});
   const css=fs.readFileSync('src/app/globals.css','utf8').replace('@import "tailwindcss";','');
   await page.setContent(`<style>${css}:root{--bg:#0b0b0c;--bg-2:#151517;--text-2:#99999f}body{margin:0;padding:24px}</style>${fs.readFileSync(path.join(output,`diagram-${view}.html`),'utf8')}`);
   const tinted=await page.locator('svg [id][data-part]').evaluateAll(groups=>groups.filter(g=>[...g.querySelectorAll('path,rect,circle,line,ellipse')].some(p=>getComputedStyle(p).stroke==='rgb(138, 74, 62)')).map(g=>g.id).sort());
   assert.deepEqual(tinted,['quarter_RR','rear_bumper']);
   assert.equal(await page.locator('svg [id][data-part]').count(),44);
   await page.screenshot({path:path.join(output,`diagram-${view}.png`)});
   report[view]={bytes:fs.statSync(file).size,contractParts:44,tinted};
   await page.close();
 }}finally{await browser.close()}
 fs.writeFileSync(path.join(output,'diagram-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
