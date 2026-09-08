const {chromium}=require(process.env.FM_PLAYWRIGHT||'playwright');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text())});
  await page.goto('http://127.0.0.1:4310/?mode=static&quality=high');
  await page.waitForFunction(()=>window.heroTest?.events.some(e=>e.name==='ready'||e.name==='unavailable'),{},{timeout:20000}).catch(e=>errors.push(String(e)));
  await page.waitForTimeout(2500);
  await page.screenshot({path:path.join(__dirname,'verification','scene-static.png')});
  console.log(JSON.stringify({errors,events:await page.evaluate(()=>window.heroTest?.events),canvas:await page.locator('canvas').count(),renderer:await page.locator('canvas').evaluate(c=>{const gl=c.getContext('webgl2');const e=gl.getExtension('WEBGL_debug_renderer_info');return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'unknown'})},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
