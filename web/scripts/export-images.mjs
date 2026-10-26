/*
 * Pre-renders the photos for the static export.
 *
 * Reads every JPEG and PNG in public/img and writes a WebP at each width in
 * next.config.mjs's imageSizes and deviceSizes into out/img/_r/<width>/.
 * lib/image-loader.ts maps next/image requests onto these paths. The
 * originals stay in out/img: the Open Graph image and the JSON-LD still point
 * at them by their plain paths.
 *
 * Runs after `next build` with STATIC_EXPORT=1 (see `npm run build:static`).
 * sharp is already in node_modules because Next depends on it.
 */

import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import nextConfig from "../next.config.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public", "img");
const OUT = path.join(ROOT, "out", "img");

const widths = [
  ...nextConfig.images.imageSizes,
  ...nextConfig.images.deviceSizes
].sort((a, b) => a - b);

try {
  await stat(path.join(ROOT, "out"));
} catch {
  console.error("No out/ directory. Run `STATIC_EXPORT=1 next build` first.");
  process.exit(1);
}

const files = (await readdir(SOURCE)).filter((name) => /\.(jpe?g|png)$/i.test(name));
let written = 0;

for (const file of files) {
  const base = file.replace(/\.(jpe?g|png)$/i, "");
  const image = sharp(path.join(SOURCE, file)).rotate();
  const { width: original } = await image.metadata();

  for (const width of widths) {
    const dir = path.join(OUT, "_r", String(width));
    await mkdir(dir, { recursive: true });
    /* Never upscale: a 1200px original asked for at 1920 is written at 1200,
       which is what next/image would have served too. */
    await image
      .clone()
      .resize({ width: Math.min(width, original ?? width), withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(dir, `${base}.webp`));
    written += 1;
  }
}

console.log(`Rendered ${written} files for ${files.length} photos at ${widths.length} widths.`);
