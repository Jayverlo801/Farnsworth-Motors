const {chromium}=require(process.env.FM_PLAYWRIGHT||'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const sharp=require('sharp');
const output=path.join(__dirname,'verification');
fs.mkdirSync(output,{recursive:true});
const report={};

function instrument(){
  window.heroGpu={draws:0,triangles:0,delay:0,times:[]};
  const proto=WebGL2RenderingContext.prototype;
  const clear=proto.clear,draw=proto.drawElements;
  proto.clear=function(...args){
    if(this.getParameter(this.FRAMEBUFFER_BINDING)===null){
      const start=performance.now();
      while(performance.now()-start<window.heroGpu.delay){}
      window.heroGpu.triangles=0;
      window.heroGpu.times.push(performance.now());
    }
    return clear.apply(this,args);
  };
  proto.drawElements=function(mode,count,...args){
    window.heroGpu.draws++;
    if(mode===this.TRIANGLES)window.heroGpu.triangles+=count/3;
    return draw.call(this,mode,count,...args);
  };
}

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  async function open(mode,quality='high',viewport={width:1440,height:810},setup){
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(instrument);
    if(setup)await setup(page);
    await page.goto(`http://127.0.0.1:4310/?mode=${mode}&quality=${quality}`);
    await page.waitForFunction(()=>window.heroTest?.events.length>0,{},{timeout:20000});
    return {page,errors};
  }
  const events=page=>page.evaluate(()=>window.heroTest.events);
  async function expectFail(page,reason){
    await page.waitForFunction(r=>window.heroTest.events.some(e=>e.name==='unavailable'&&e.reason===r),reason,{timeout:15000});
    await page.waitForTimeout(150);
    assert.equal((await events(page)).filter(e=>e.name==='unavailable').length,1);
    assert.equal(await page.locator('canvas').count(),0);
  }

  // Static is immediate at first real frame, then demand-rendered only.
  {
    const {page,errors}=await open('static');
    await page.waitForFunction(()=>window.heroGpu.triangles>80000,{},{timeout:20000});
    await page.waitForTimeout(300);
    const before=await page.evaluate(()=>window.heroGpu.draws);
    await page.waitForTimeout(650);
    assert.equal(await page.evaluate(()=>window.heroGpu.draws),before,'Static keeps drawing');
    const e=await events(page);
    assert.deepEqual(e.map(x=>x.name),['ready','assembled']);
    assert.ok(e[1].at-e[0].at<2,"Static callbacks should be in the same frame");
    report.static={events:e,framesWhileIdle:0,errors};
    await page.screenshot({path:path.join(output,'static-desktop.png')});
    await page.setViewportSize({width:2400,height:1350});
    await page.waitForTimeout(500);
    const png=await page.locator('canvas').screenshot();
    await sharp(png).webp({quality:94,effort:6}).toFile(path.join(output,'gt3rs-static-full-frame.webp'));
    // Validate poster dimensions and capture a reference for visual matching.
    const metadata=await sharp(path.join(output,'gt3rs-static-full-frame.webp')).metadata();
    assert.equal(metadata.width,2400);assert.equal(metadata.height,1350);
    report.poster={width:metadata.width,height:metadata.height,bytes:fs.statSync(path.join(output,'gt3rs-static-full-frame.webp')).size};
    await page.evaluate(()=>window.heroTest.dispose());
    await page.waitForTimeout(650);
    assert.equal(await page.locator('canvas').count(),0);
    await page.close();
  }
  // Full animation, pausing mid-assembly, a calm scroll handoff, then context loss.
  {
    const {page,errors}=await open('full');
    await page.screenshot({path:path.join(output,'full-exploded.png')});
    await page.waitForTimeout(1000);
    await page.evaluate(()=>window.heroTest.pause(true));
    await page.waitForTimeout(120);
    const before=await page.evaluate(()=>window.heroGpu.draws);
    await page.waitForTimeout(700);
    assert.equal(await page.evaluate(()=>window.heroGpu.draws),before,'Paused scene renders');
    await page.screenshot({path:path.join(output,'full-paused.png')});
    await page.evaluate(()=>window.heroTest.pause(false));
    await page.waitForFunction(()=>window.heroTest.events.some(e=>e.name==='assembled'),{},{timeout:15000});
    await page.waitForTimeout(2200);
    assert.equal((await events(page)).filter(e=>e.name==='ready').length,1);
    assert.equal((await events(page)).filter(e=>e.name==='assembled').length,1);
    assert.equal((await events(page)).filter(e=>e.name==='unavailable').length,0);
    await page.screenshot({path:path.join(output,'full-complete.png')});
    const times=await page.evaluate(()=>window.heroGpu.times.slice(-90));
    const fps=(times.length-1)*1000/(times.at(-1)-times[0]);
    report.full={events:await events(page),pausedDraws:0,measuredDesktopFps:fps,errors};
    await page.evaluate(()=>window.heroTest.scroll(.8));await page.waitForTimeout(250);
    await page.screenshot({path:path.join(output,'scroll-paint.png')});
    await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await expectFail(page,'context-lost');
    report.contextLoss='passed';await page.close();
  }
  {
    const {page,errors}=await open('short','medium',{width:390,height:844});
    await page.waitForFunction(()=>window.heroTest.events.some(e=>e.name==='assembled'),{},{timeout:6000});
    const e=await events(page);
    const duration=e.find(x=>x.name==='assembled').at-e.find(x=>x.name==='ready').at;
    assert.ok(duration<=2100,`Short assembly took ${duration} ms`);
    await page.waitForTimeout(900);
    await page.screenshot({path:path.join(output,'short-mobile.png')});
    report.shortMobile={assemblyMs:duration,events:e,errors};await page.close();
  }
  {
    const {page}=await open('static','medium',undefined,async p=>p.route('**/3d/gt3rs-study/medium.glb',route=>route.abort()));
    await expectFail(page,'model-fetch-failed');report.failedFetch='passed';await page.close();
  }
  {
    const {page}=await open('static','low',undefined,async p=>p.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args)};
    }));
    await expectFail(page,'no-webgl');report.noWebgl='passed';await page.close();
  }
  {
    const {page}=await open('full','medium');
    await page.waitForTimeout(600);
    await page.evaluate(()=>{window.heroGpu.delay=55});
    await expectFail(page,'low-fps');report.lowFps='passed';await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify({...report,failure:String(e)},null,2));process.exit(1)});
