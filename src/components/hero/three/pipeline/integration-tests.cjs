// Integration QA uses a separate browser profile, never the user's live session.
const {chromium} = require(process.env.FM_PLAYWRIGHT || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.join(__dirname,'verification');
const base = process.env.FM_PREVIEW_URL || 'http://127.0.0.1:3000';
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const report = {};
  try {
    for (const test of [
      {name:'desktop',query:'hero=static',width:1440,height:1000},
      {name:'mobile',query:'hero=skip',width:390,height:844},
      {name:'fallback',query:'hero=static&3d=off',width:1440,height:1000},
      {name:'reduced-motion',query:'hero=full',width:390,height:844,reducedMotion:'reduce'},
    ]) {
      const page = await browser.newPage({viewport:{width:test.width,height:test.height},deviceScaleFactor:1,
        reducedMotion:test.reducedMotion || 'no-preference'});
      const errors=[],warnings=[],models=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);if(r.url().endsWith('.glb'))models.push(r.url())});
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});
      await page.addInitScript(()=>{
        window.heroDraws=0;
        const draw=WebGL2RenderingContext.prototype.drawElements;
        WebGL2RenderingContext.prototype.drawElements=function(...args){window.heroDraws++;return draw.apply(this,args)};
      });
      await page.goto(`${base}/?${test.query}`,{waitUntil:'networkidle',timeout:90000});
      await page.locator('.hero-copy.is-visible').waitFor({timeout:15000});
      await page.waitForTimeout(2300);
      const canvas=await page.locator('canvas').count();
      assert.equal(canvas,test.name==='desktop'?1:0,`${test.name}: incorrect rendering path`);
      if(canvas)assert.equal(await page.locator('.hero-canvas.is-ready').count(),1);
      assert.ok(await page.locator('html').evaluate(el=>el.scrollWidth<=innerWidth+1),`${test.name}: horizontal overflow`);
      assert.equal(await page.locator('.hero-copy .hero-cta').evaluate(el=>getComputedStyle(el.parentElement).opacity),'1');
      await page.screenshot({path:path.join(output,`integrated-${test.name}.png`)});
      // Reduced motion must override ?hero=full and should not keep rendering.
      if(test.reducedMotion){
        const before=await page.evaluate(()=>window.heroDraws);
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(()=>window.heroDraws),before,'Reduced motion runs a continuous animation');
      }
      await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
      await page.waitForTimeout(700);
      const before=await page.evaluate(()=>window.heroDraws);
      await page.waitForTimeout(500);
      assert.equal(await page.evaluate(()=>window.heroDraws),before,'Offscreen hero keeps rendering');
      assert.deepEqual(errors,[],`${test.name}: browser errors`);
      report[test.name]={canvas,models,errors,warnings,offscreenPaused:true};
      await page.close();
    }
    fs.writeFileSync(path.join(output,'integration-report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
