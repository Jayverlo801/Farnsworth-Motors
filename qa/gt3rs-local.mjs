// Repeatable integration checks against the actual Next homepage, including a
// cold first-visit animation. Uses an isolated profile, not the user's browser.
import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.FM_PREVIEW_URL || "http://127.0.0.1:3000";
const out = join(process.cwd(), "qa/shots/gt3rs");
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true, args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = {};
const cases = [
  { name: "first-visit", query: "", canvas: true, mode: "full" },
  { name: "repeat-visit", query: "", canvas: true, mode: "short", seen: true },
  { name: "static", query: "hero=static", canvas: true, mode: "static" },
  { name: "mobile", query: "", width: 390, height: 844, mode: "static" },
  { name: "mobile-3d", query: "hero=skip&3d=on", width: 390, height: 844, canvas: true, mode: "short" },
  { name: "fallback", query: "3d=off", mode: "static" },
  { name: "reduced-motion", query: "hero=full", reduced: true, canvas: true, mode: "static" },
  { name: "no-webgl", query: "hero=static", noWebgl: true, mode: "static" },
  { name: "failed-model", query: "hero=static", failAsset: true, mode: "static" },
];
try {
  for (const test of cases.filter((item) => process.argv.length < 3 || process.argv.slice(2).includes(item.name))) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: test.width || 1440, height: test.height || 900, deviceScaleFactor: 1 });
    if (test.reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    const errors = [], warnings = [], models = [];
    report[test.name] = { passed: false, errors, warnings, models };
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (m) => {
      if (m.type() === "error" && !(test.failAsset && m.text().includes("Failed to load resource"))) errors.push(m.text());
      if (["warning", "warn"].includes(m.type())) warnings.push(m.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      if (r.url().endsWith(".glb")) models.push(r.url());
    });
    if (test.failAsset) {
      await page.setRequestInterception(true);
      page.on("request", (r) => r.url().endsWith("/gt3rs-study/high.glb") ? r.abort() : r.continue());
    }
    await page.evaluateOnNewDocument(({ seen, noWebgl }) => {
      if (seen) localStorage.setItem("fm:hero-seen:gt3rs-v1", "1");
      window.heroQA = { gpu: null, frames: [], delay: 0, canvasLost: 0 };
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (...args) {
        if (noWebgl && /^webgl/.test(args[0])) return null;
        const context = getContext.apply(this, args);
        if (args[0] === "webgl2" && context && this.isConnected) {
          const ext = context.getExtension("WEBGL_debug_renderer_info");
          window.heroQA.gpu = ext ? context.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
          this.addEventListener("webglcontextlost", () => { window.heroQA.canvasLost++; });
        }
        return context;
      };
      const clear = WebGL2RenderingContext.prototype.clear;
      WebGL2RenderingContext.prototype.clear = function (...args) {
        if (this.getParameter(this.FRAMEBUFFER_BINDING) === null) {
          const start = performance.now();
          while (performance.now() - start < window.heroQA.delay) { /* fault injection */ }
          window.heroQA.frames.push(performance.now());
        }
        return clear.apply(this, args);
      };
    }, { seen: !!test.seen, noWebgl: !!test.noWebgl });
    await page.goto(`${base}/?${test.query}`, { waitUntil: "networkidle0", timeout: 90000 });
    await page.waitForFunction(() => ["ready", "unavailable"].includes(document.querySelector(".hero-pin")?.dataset.heroState), { timeout: 25000 });
    const canvas = await page.$(".hero-canvas.is-ready canvas");
    if (!!canvas !== !!test.canvas) {
      await page.screenshot({ path: join(out, `${test.name}-failure.png`) });
      console.error(JSON.stringify({ test: test.name, errors, warnings, state: await page.$eval(".hero-pin", (el) => ({ ...el.dataset })) }));
    }
    assert.equal(!!canvas, !!test.canvas, `${test.name}: wrong renderer/fallback path`);
    assert.equal(await page.$eval(".hero-pin", (el) => el.dataset.heroMode), test.mode);
    if (test.name === "first-visit") await page.screenshot({ path: join(out, "assembly-start.png") });
    await page.waitForSelector(".hero-copy.is-visible", { timeout: 18000 });
    await sleep(test.canvas && test.mode !== "static" ? 2200 : 1200);
    await page.screenshot({ path: join(out, `${test.name}.png`) });
    assert.equal(await page.$("[data-nextjs-dialog]"), null, "Framework error overlay");
    const overflow = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map((el) => ({ tag: el.tagName, class: el.className, width: el.getBoundingClientRect().width })),
    }));
    assert.ok(overflow.scrollWidth <= overflow.width + 1, `Horizontal overflow: ${JSON.stringify(overflow)}`);
    assert.ok(await page.$eval(".hero-cta", (el) => el.getAttribute("href")), "Primary CTA missing");
    assert.ok(models.every((url) => url.includes("/3d/gt3rs-study/")), "Legacy coupe was fetched");
    if (!test.canvas) {
      assert.ok(await page.$eval(".hero-fallback img", (el) => el.complete && el.naturalWidth > 0 && el.src.includes("/gt3rs-study/hero-poster.webp")), "Matching Porsche fallback missing");
    } else {
      assert.ok(models.some((url) => url.endsWith(test.name === "mobile-3d" ? "/medium.glb" : "/high.glb")), "Wrong model quality");
      assert.equal(await page.evaluate(() => window.heroQA.canvasLost), 0, "Live renderer lost its context");
    }
    await page.screenshot({ path: join(out, `${test.name}.png`) });
    const stats = await page.evaluate(() => ({ gpu: window.heroQA.gpu, frames: window.heroQA.frames.slice(-90), state: { ...document.querySelector(".hero-pin").dataset } }));
    const idleBefore = await page.evaluate(() => window.heroQA.frames.length);
    if (test.mode === "static") {
      await sleep(500);
      assert.equal(await page.evaluate(() => window.heroQA.frames.length), idleBefore, "Static hero keeps rendering");
    }
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await sleep(800);
    const pausedFrames = await page.evaluate(() => window.heroQA.frames.length);
    await sleep(500);
    assert.equal(await page.evaluate(() => window.heroQA.frames.length), pausedFrames, "Offscreen hero keeps rendering");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await sleep(700);
    if (test.canvas) assert.ok(await page.$("canvas"), `${test.name}: renderer lost on scroll resume: ${warnings.join("; ")}`);
    if (test.name === "first-visit") {
      await page.evaluate(() => document.querySelector("canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
      await page.waitForSelector(".hero-fallback img");
      assert.equal(await page.$("canvas"), null, "Lost context was not released");
    }
    if (test.name === "repeat-visit") {
      await page.evaluate(() => { window.heroQA.delay = 55; });
      await page.waitForSelector(".hero-fallback img", { timeout: 12000 });
      assert.ok(warnings.some((message) => message.includes("low-fps")), "Low-FPS guard was not exercised");
    }
    assert.deepEqual(errors, [], `${test.name}: browser errors`);
    report[test.name] = {
      passed: true, ...stats, models: [...new Set(models)], errors, warnings,
      frames: stats.frames.length,
      measuredFps: test.canvas && test.mode !== "static" ? Math.round((stats.frames.length - 1) * 1000 / (stats.frames.at(-1) - stats.frames[0])) : null,
      offscreenPaused: true,
    };
    console.log(JSON.stringify({ test: test.name, ...report[test.name] }));
    writeFileSync(join(out, "integration-report.json"), JSON.stringify(report, null, 2));
    await context.close();
  }
} finally {
  writeFileSync(join(out, "integration-report.json"), JSON.stringify(report, null, 2));
  await browser.close();
}
