// Standalone browser test, separate from the user's browser profile/session.
const { chromium } = require(process.env.FM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[];
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text())});
  page.on('response',r=>{if(r.url().endsWith('.glb'))console.log('MODEL',r.status(),r.url())});
  await page.goto('http://127.0.0.1:3000/?hero=static',{waitUntil:'networkidle',timeout:90000});
  await page.waitForTimeout(2500);
  const dir=path.resolve(__dirname,'verification');fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'integrated-static.png')});
  console.log(JSON.stringify({errors,tokens:await page.locator('.hero-visual').evaluate(el=>Object.fromEntries(['--bg','--bg-2','--surface','--line-strong','--text','--accent','--accent-warm'].map(k=>[k,getComputedStyle(el).getPropertyValue(k)]))),canvas:await page.locator('canvas').count(),ready:await page.locator('.hero-canvas.is-ready').count(),text:(await page.locator('body').innerText()).slice(0,700)},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
