/**
 * Part 4 handoff exports for the 3D build:
 *   public/3d/reference/coupe-side.svg           assembled side elevation
 *   public/3d/reference/coupe-side-exploded.svg  parts at exploded offsets (baked transforms)
 *   public/3d/reference/hero-composition.json    measured layout boxes (1440×900)
 *
 *   node qa/export-reference.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4100";
const OUT = "public/3d/reference";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

async function grabHeroSvg(url, bake) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 1500));
  return page.evaluate((bakeTransforms) => {
    const svg = document.querySelector(".hero-car-slot svg.car-svg");
    if (!svg) return null;
    const clone = svg.cloneNode(true);
    if (bakeTransforms) {
      const live = svg.querySelectorAll("[data-part]");
      const cloned = clone.querySelectorAll("[data-part]");
      live.forEach((el, i) => {
        const t = getComputedStyle(el).transform;
        const c = cloned[i];
        c.removeAttribute("style");
        if (t && t !== "none") c.setAttribute("transform", t.replace(/matrix\(([^)]+)\)/, "matrix($1)"));
      });
    } else {
      clone.querySelectorAll("[data-part]").forEach((c) => c.removeAttribute("style"));
    }
    clone.removeAttribute("class");
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("viewBox", "0 0 1200 500");
    return clone.outerHTML;
  }, bake);
}

const banner =
  "<!-- Farnsworth Motors — proportion & choreography reference for the 3D build.\n" +
  "     Generated from HeroFallback (src/components/car/carArt.tsx) by qa/export-reference.mjs.\n" +
  "     Part groups carry data-part ids from docs/HERO-CONTRACT.md. -->\n";

const assembled = await grabHeroSvg(`${BASE}/?hero=static&3d=off`, false);
if (!assembled) throw new Error("assembled hero svg not found");
writeFileSync(`${OUT}/coupe-side.svg`, banner + assembled);

const exploded = await grabHeroSvg(`${BASE}/?hero=exploded&3d=off`, true);
if (!exploded) throw new Error("exploded hero svg not found");
writeFileSync(`${OUT}/coupe-side-exploded.svg`, banner + exploded);

/* composition boxes, measured from the real layout */
await page.goto(`${BASE}/?hero=static&3d=off`, { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 1200));
const comp = await page.evaluate(() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const car = document.querySelector(".hero-car-slot svg.car-svg")?.getBoundingClientRect();
  const band = document.querySelector(".hero-band")?.getBoundingClientRect();
  if (!car || !band) return null;
  const r = (n) => Math.round(n * 1000) / 1000;
  return {
    viewport: { w: vw, h: vh },
    carBox: {
      x: r(car.x / vw),
      y: r(car.y / vh),
      w: r(car.width / vw),
      h: r(car.height / vh),
    },
    wordmarkBand: { y0: r(band.top / vh), y1: r(band.bottom / vh) },
    groundlineY: r((car.y + car.height * (452 / 500)) / vh),
  };
});
if (!comp) throw new Error("composition measurement failed");
writeFileSync(
  `${OUT}/hero-composition.json`,
  JSON.stringify(comp, null, 2) + "\n"
);

await browser.close();
console.log("exported:", comp);
