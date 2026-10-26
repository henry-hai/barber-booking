/*
 * Two builds come out of this file.
 *
 * The default is what Vercel runs: a static site with next/image resizing
 * photos on request. With STATIC_EXPORT=1 it becomes a plain export into out/
 * for the S3 bucket behind CloudFront, where there is no server to resize
 * anything, so the photos are pre-rendered by scripts/export-images.mjs and
 * served through lib/image-loader.ts instead. Nothing about the Vercel build
 * changes until Henry flips the switch.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  ...(staticExport ? { output: "export" } : {}),

  /* Every marketing page is statically generated at build time. The only
     dynamic piece is the booking form, which POSTs to the API. */
  images: {
    /* The portfolio photos are local files under public/img, so no remote
       patterns are needed. These are the widths next/image will generate. */
    imageSizes: [64, 128, 224, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    ...(staticExport ? { loader: "custom", loaderFile: "./lib/image-loader.ts" } : {})
  }
};

export default nextConfig;
