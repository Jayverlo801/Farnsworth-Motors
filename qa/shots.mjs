/**
 * Visual QA: drives the installed Chrome over the running site and captures
 * the hero plus every section at desktop and mobile widths.
 *
 *   node qa/shots.mjs [baseUrl] [outDir]
 *
 * Defaults: http://localhost:4100 and qa/shots/. Pass ?3d=off yourself if
 * you want to force the SVG fallback path.
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4100";
const OUT = process.argv[3] ?? "qa/shots";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const SECTIONS = [
  "statement",
  "featured",
  "process",
  "records",
  "before-after",
  "available",
  "why-rebuilt",
  "principles",
  "contact",
];

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});

async function settle(page, ms = 700) {
  await new Promise((r) => setTimeout(r, ms));
}

async function capture(width, height, suffix) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(`${BASE}/?hero=skip&3d=off`, { waitUntil: "networkidle0", timeout: 60000 });
  await settle(page, 1800); // hero short mode + wordmark
  await page.screenshot({ path: join(OUT, `hero${suffix}.png`) });

  for (const id of SECTIONS) {
    await page.evaluate((sel) => {
      document.getElementById(sel)?.scrollIntoView({ behavior: "instant", block: "start" });
      window.scrollBy(0, -60);
    }, id);
    await settle(page, 1100); // reveals
    await page.screenshot({ path: join(OUT, `${id}${suffix}.png`) });
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(page, 900);
  await page.screenshot({ path: join(OUT, `footer${suffix}.png`) });
  await page.close();
}

await capture(1440, 900, "");
await capture(390, 844, "-m");

await browser.close();
console.log(`done → ${OUT}`);
