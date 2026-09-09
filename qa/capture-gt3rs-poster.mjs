// Capture the real local WebGL scene, cropped to its exact vehicle envelope.
// The page uses the same width/height limits as frameModel, so the still keeps
// its proportions at every viewport rather than stretching a desktop image.
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { buildSync } = require(process.env.FM_ESBUILD || "esbuild");
const out = join(process.cwd(), "qa/shots/gt3rs");
mkdirSync(out, { recursive: true });
const geometryModule = join(out, "poster-geometry.cjs");
buildSync({
  stdin: {
    contents: 'export { measureModel, frameModel } from "./src/components/hero/three/composition"; export { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; export { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";',
    resolveDir: process.cwd(),
  },
  bundle: true, platform: "node", format: "cjs", outfile: geometryModule,
});
const { measureModel, frameModel, GLTFLoader, MeshoptDecoder } = require(geometryModule);
const bytes = readFileSync("public/3d/gt3rs-study/high.glb");
const { scene } = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  .parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const bounds = measureModel(scene);
const width = 2400, height = 1500;
const frame = frameModel(width, height, bounds);
const left = Math.round(width / 2 + (bounds.minX - frame.centerX) * frame.pixelsPerUnit);
const top = Math.round(height / 2 - (bounds.maxY - frame.centerY) * frame.pixelsPerUnit);
const carWidth = Math.round((bounds.maxX - bounds.minX) * frame.pixelsPerUnit);
const carHeight = Math.round((bounds.maxY - bounds.minY) * frame.pixelsPerUnit);
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true, args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${process.env.FM_PREVIEW_URL || "http://127.0.0.1:3000"}/?hero=static`, { waitUntil: "networkidle0", timeout: 90000 });
  await page.waitForSelector('.hero-pin[data-hero-state="ready"]', { timeout: 25000 });
  await page.waitForSelector('.hero-copy.is-visible');
  await new Promise((resolve) => setTimeout(resolve, 1600));
  const canvas = await page.$(".hero-canvas canvas");
  if (!canvas) throw new Error("The Porsche canvas is unavailable; refusing to capture a fallback as a poster.");
  const image = await canvas.screenshot();
  await sharp(image).extract({ left, top, width: carWidth, height: carHeight })
    .webp({ quality: 94, effort: 6 }).toFile("public/3d/gt3rs-study/hero-poster.webp");
  console.log(JSON.stringify({ source: "local WebGL high.glb, static pose", width: carWidth, height: carHeight, bytes: readFileSync("public/3d/gt3rs-study/hero-poster.webp").length, bounds, frame }, null, 2));
} finally { await browser.close(); }
