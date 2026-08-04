# Brand assets

## `logo-lockup-1200x627.png`

The studio lockup on the site's bone background, 1200x627.

A 1.91:1 frame with the mark centred and room around it, so it survives the
crops that link previews and profile headers apply. It is what to hand anything
wanting a single image of the brand.

**PNG rather than JPEG here, deliberately.** The note about preferring JPEG
applies to screenshots of photographs, where PNG is several times larger for no
gain. This is flat colour with hard diagonal edges, which is the case PNG is
actually good at: it compresses to 73 KB and keeps the razor cuts clean, while
JPEG would put ringing artefacts along every edge.

## Where the logo actually lives

**`web/components/Logo.tsx` is the source of truth**, not this PNG. The mark is
an inline SVG and the wordmark is DOM text in Michroma, so the lockup only
exists once a browser has composed the two. There is no vector file to copy out
of the repo, and editing this PNG would not change the site.

Both were rebuilt from a row-by-row scan of the original screenshot; that
component's header records the measurements, including the 7.4 degree slant and
the 12-unit slip on the sliced pieces.

## Regenerating it

`export-logo.mjs` loads the live site with Playwright at a device scale factor
of 10, screenshots the header lockup, trims it, and composes it onto the bone
background. Run it from `web/`, because that is where its dependencies resolve:

```bash
cd web
cp ../brand/export-logo.mjs .
node ./export-logo.mjs ../brand/logo-lockup-1200x627.png
rm ./export-logo.mjs
```

It waits on `document.fonts.ready` before capturing. Without that you get the
fallback typeface instead of Michroma, which is not obvious in a thumbnail and
very obvious at full size.

Change the mark in `Logo.tsx`, deploy, then rerun this to bring the PNG back
into step.
