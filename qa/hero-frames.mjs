/**
 * Hero timing verification (v3 Part 1.6): captures t=0, t=3s, t=6s, and
 * after first scroll, at desktop (1440×900) and mobile (390×844).
 *
 *   node qa/hero-frames.mjs [baseUrl] [outDir]
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4100";
const OUT = process.argv[3] ?? "qa/shots/hero-frames";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});

async function run(width, height, suffix) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  // full cinematic, fallback path, fresh visit (no seen flag persists in a new context)
  await page.goto(`${BASE}/?hero=full&3d=off`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.screenshot({ path: join(OUT, `t0${suffix}.png`) });
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: join(OUT, `t3${suffix}.png`) });
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: join(OUT, `t6${suffix}.png`) });
  await page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "instant" }));
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: join(OUT, `scrolled${suffix}.png`) });
  await page.close();
}

await run(1440, 900, "");
await run(390, 844, "-m");
await browser.close();
console.log("hero frames →", OUT);
