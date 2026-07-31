/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /* Every marketing page is statically generated at build time; the only
     dynamic piece is the booking form, which POSTs to the Express API. */
  images: {
    /* The portfolio photos are local files under public/img, so no remote
       patterns are needed. These are the widths next/image will generate. */
    imageSizes: [64, 128, 224, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920]
  }
};

export default nextConfig;
