/*
 * Exports the studio lockup as a PNG.
 *
 * The mark is an inline SVG and the wordmark is DOM text in Michroma, so there
 * is no single asset to copy out of the repo. Rendering the live header at a
 * high device scale factor captures both together with the gradient and the
 * measured proportions intact.
 */

import { chromium } from "playwright";
import sharp from "sharp";
import path from "path";

const OUT = process.argv[2];
const BONE = "#f5f2ee";

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 10 });

await page.goto("https://henryhaistudio.com", { waitUntil: "networkidle" });
/* Michroma is a web font; screenshotting before it lands gives a fallback. */
await page.evaluate(() => document.fonts.ready);

const logo = page.locator("header a[aria-label]").first();
const shot = await logo.screenshot({ omitBackground: true });

const meta = await sharp(shot).metadata();
console.log(`captured ${meta.width}x${meta.height}`);

/* Trim the transparent margin the anchor carries, then sit it on the bone
   background the site uses so it does not look cut out against a white card. */
const trimmed = await sharp(shot).trim().toBuffer();
const t = await sharp(trimmed).metadata();

/* 1.91:1, the ratio link previews and profile headers expect. The mark takes
   the middle of it so it survives the crops some of those surfaces apply. */
const W = 1200, H = 627;
const target = Math.round(H * 0.42);
const scaled = await sharp(trimmed)
  .resize({ height: target, fit: "inside" })
  .toBuffer();

await sharp({
  create: { width: W, height: H, channels: 3, background: BONE }
})
  .composite([{ input: scaled, gravity: "centre" }])
  .png()
  .toFile(OUT);

console.log(`trimmed ${t.width}x${t.height} -> ${OUT} at ${W}x${H}`);
await browser.close();
