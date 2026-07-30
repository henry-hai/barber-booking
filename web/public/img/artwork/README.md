# Artwork gallery images

The Artwork tab in the gallery expects four files in this directory:

```
artwork-1.jpg
artwork-2.jpg
artwork-3.jpg
artwork-4.jpg
```

They render in a single row at 224x280 (4:5), cropped with `object-cover`, so
portrait-oriented originals crop most naturally. Any resolution above 448x560
is fine -- `next/image` downscales and serves WebP -- but keep them as JPEG, as
PNG versions of photographs run several times larger and git keeps them forever.

Once the files are here:

1. Set `artworkPending` to `false` in `web/lib/gallery.ts`.
2. Replace the placeholder `alt` text in `artworkPhotos` in the same file with a
   real description of each piece.

Until then the tab renders labelled placeholder tiles naming each missing file.
