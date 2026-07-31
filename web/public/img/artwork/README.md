# Artwork gallery images

`godfather-1.jpg` through `godfather-4.jpg` are four photographs of one piece:
"The Godfather", graphite on a dictionary page, drawn over the entries running
from `god` to `godfather`. Started at 16, revisited and finished at 24.

They render in a single row at 224x280 (4:5). The originals are 4:5 already, so
`object-cover` does not crop them.

## Adding or replacing images

Store them here as JPEG at roughly 2400x3000 -- `next/image` downscales and
serves WebP from there, and PNG versions of photographs run several times larger
with git keeping them forever. The originals here were 4000x5000 and 15 MB each;
downscaling took the set from 38 MB to under 5 MB with no visible loss at any
size the page could plausibly display them.

Then update `artworkPhotos` in `web/lib/gallery.ts` with the filename and a real
description of the piece for the `alt` text.

`artworkPending` in that same file switches the whole tab over to labelled
placeholder tiles naming each expected file, which is useful while photographs
for a new tab are still being taken.
