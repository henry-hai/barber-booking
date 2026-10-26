/*
 * next/image loader for the static export.
 *
 * On Vercel, next/image resizes on request. A static export has no server to
 * do that, and the alternative Next offers, `unoptimized`, would send the
 * 3.6 MB originals to every phone. So scripts/export-images.mjs pre-renders
 * every photo at each width next/image can ask for, as WebP, into
 * out/img/_r/<width>/, and this loader points at those files.
 *
 * Only wired in when STATIC_EXPORT is set (see next.config.mjs). The Vercel
 * build and the test suites never see it.
 */

import type { ImageLoaderProps } from "next/image";

export default function exportImageLoader({ src, width }: ImageLoaderProps): string {
  const match = /^\/img\/([^/]+)\.(jpe?g|png)$/i.exec(src);
  if (match === null) { return src; }
  return `/img/_r/${width}/${match[1]}.webp`;
}
