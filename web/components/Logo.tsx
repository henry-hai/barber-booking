/*
 * The studio mark, rebuilt as vector from measurements taken off the original
 * logo screenshot (web/public/img/logo-original.jpg).
 *
 * Construction, from a row-by-row scan of that file:
 *
 *   bounding box   132 x 144
 *   slant          7.4 degrees
 *   stroke         32 units
 *   crossbar       42% to 58% of the height
 *   left cut       centred at (29, 53)
 *   right cut      centred at (111, 33)
 *   cut angle      about 12 degrees, rising to the right
 *   slip           the piece above each cut sits 12 left and 2.5 down
 *   gradient       #4aaeea at the top to #0be6f9 at the base
 *   wordmark ink   #262f4c, sampled from the file. Dark navy, not black.
 *
 * The two cuts and the slip are the whole character of it: the letter reads as
 * having been sliced and let slip, not merely gapped. Fragments are lifted out
 * by masking rather than drawn as separate shapes, because a mask with
 * maskUnits in user space resolves inside whatever transform its element sits
 * in, so a masked rect inside a translated group moves mask and fill together.
 *
 * Lockup proportions are measured too: the mark runs 1.578 times the height of
 * the text block and overhangs it by 25 above and 27 below, with a gap of 0.127
 * of the mark's height. Everything is expressed as a fraction so the ratios
 * hold at any size.
 */

import { michroma } from "@/lib/fonts";

const SLANT = 7.4;
const STROKE = 32;
const CUT_ANGLE = -12;
const CUT_WIDTH = 3.5;
const LEFT_CUT: [number, number] = [29, 53];
const RIGHT_CUT: [number, number] = [111, 33];
const SLIP: [number, number] = [-12, 2.5];

/* Splits the two strokes. The left never passes 48, the right never falls
   below 81, so anything between separates them safely. */
const MIDLINE = 66;

/* Generous bounds so masks and knockouts always cover the whole canvas. */
const FIELD = { x: -60, y: -60, width: 280, height: 280 };

export const CYAN_TOP = "#4aaeea";
export const CYAN_BOTTOM = "#0be6f9";
export const WORDMARK_INK = "#262f4c";

/*
 * Est. 2013 uses the dark cyan ramp, not the bright one.
 *
 * Direction matters and is easy to invert: this runs dark at the top to bright
 * at the base, matching the mark. It is also the smallest thing in the lockup,
 * so it carries a pixel floor; below about 8px a gradient stops rendering as a
 * gradient at all, because the glyphs sample only a sliver of the ramp.
 */
const EST_TOP = "#0b6f85";
const EST_BOTTOM = "#0aa3bd";
const EST_MIN_PX = 8;

const TEXT_BLOCK = 1 / 1.578;
const LINE_HEIGHT = 1.16;
const EST_RATIO = 0.43;
const EST_GAP = 0.25;
const GAP_RATIO = 0.127;

export function LogoMark({
  size = 48,
  flat,
  className = ""
}: {
  size?: number;
  /* Single colour instead of the gradient, for print and monochrome uses. */
  flat?: string;
  className?: string;
}) {
  const id = `hh-${(flat ?? "grad").replace(/[^a-z0-9]/gi, "")}`;
  const half = CUT_WIDTH / 2;
  const fill = flat ?? `url(#${id}-g)`;
  const leftX = 18;
  const rightX = 99;

  const shape = (
    <g transform={`skewX(-${SLANT})`}>
      <rect x={leftX} y="0" width={STROKE} height="144" fill="white" />
      <rect x={rightX} y="0" width={STROKE} height="144" fill="white" />
      <rect x={leftX} y="60.5" width={rightX + STROKE - leftX} height="23" fill="white" />
    </g>
  );

  /* Removes everything above the cut band's lower edge. */
  const knockAbove = (cut: [number, number]) => (
    <rect
      x={FIELD.x} y={cut[1] + half - 300} width={FIELD.width} height="300" fill="black"
      transform={`rotate(${CUT_ANGLE} ${cut[0]} ${cut[1]})`}
    />
  );

  /* Removes everything below the cut band's upper edge. */
  const knockBelow = (cut: [number, number]) => (
    <rect
      x={FIELD.x} y={cut[1] - half} width={FIELD.width} height="300" fill="black"
      transform={`rotate(${CUT_ANGLE} ${cut[0]} ${cut[1]})`}
    />
  );

  const canvas = <rect {...FIELD} fill={fill} />;

  return (
    <svg
      width={size * 0.917}
      height={size}
      viewBox="-7 0 139 147"
      fill="none"
      className={className}
      role="img"
      aria-label="Henry Hai Studio"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0%" stopColor={CYAN_TOP} />
          <stop offset="100%" stopColor={CYAN_BOTTOM} />
        </linearGradient>

        {/* Half-planes, confining each knockout to its own stroke. */}
        <clipPath id={`${id}-left`}>
          <rect x={FIELD.x} y={FIELD.y} width={MIDLINE - FIELD.x} height={FIELD.height} />
        </clipPath>
        <clipPath id={`${id}-right`}>
          <rect x={MIDLINE} y={FIELD.y} width={FIELD.width} height={FIELD.height} />
        </clipPath>

        {/* The body of the letter, below both cuts, including the crossbar. */}
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" {...FIELD}>
          {shape}
          <g clipPath={`url(#${id}-left)`}>{knockAbove(LEFT_CUT)}</g>
          <g clipPath={`url(#${id}-right)`}>{knockAbove(RIGHT_CUT)}</g>
        </mask>

        <mask id={`${id}-topLeft`} maskUnits="userSpaceOnUse" {...FIELD}>
          {shape}
          {knockBelow(LEFT_CUT)}
          <rect x={MIDLINE} y={FIELD.y} width={FIELD.width} height={FIELD.height} fill="black" />
        </mask>

        <mask id={`${id}-topRight`} maskUnits="userSpaceOnUse" {...FIELD}>
          {shape}
          {knockBelow(RIGHT_CUT)}
          <rect x={FIELD.x} y={FIELD.y} width={MIDLINE - FIELD.x} height={FIELD.height} fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${id}-body)`}>{canvas}</g>

      {/* Both sliced tops slip together, left and a little down. */}
      <g transform={`translate(${SLIP[0]} ${SLIP[1]})`}>
        <g mask={`url(#${id}-topLeft)`}>{canvas}</g>
        <g mask={`url(#${id}-topRight)`}>{canvas}</g>
      </g>
    </svg>
  );
}

/*
 * The full lockup.
 *
 * `estScale` exists because the original's proportions were drawn at 502px
 * wide, and at those ratios Est. 2013 lands near 7px in a navbar. Small
 * placements enlarge it; large ones leave it faithful.
 */
export function Logo({
  size = 54,
  ink = WORDMARK_INK,
  estScale = 1.6,
  showEst = true,
  className = ""
}: {
  size?: number;
  ink?: string;
  estScale?: number;
  showEst?: boolean;
  className?: string;
}) {
  const lines = ["Henry Hai", "Studio"];
  const blockHeight = size * TEXT_BLOCK;
  const estUnits = showEst ? EST_GAP + EST_RATIO * estScale * LINE_HEIGHT : 0;
  const lineSize = blockHeight / (lines.length * LINE_HEIGHT + estUnits);

  return (
    <div className={`flex items-center ${className}`} style={{ gap: size * GAP_RATIO }}>
      <LogoMark size={size} />
      <div className="flex flex-col items-center leading-none">
        {lines.map((line) => (
          <div
            key={line}
            className={`whitespace-nowrap uppercase ${michroma.className}`}
            style={{ color: ink, fontSize: lineSize, lineHeight: LINE_HEIGHT, letterSpacing: "0.015em" }}
          >
            {line}
          </div>
        ))}
        {showEst && (
          <div
            className={`whitespace-nowrap uppercase ${michroma.className}`}
            style={{
              fontSize: Math.max(lineSize * EST_RATIO * estScale, EST_MIN_PX),
              /* Hugs the glyphs, so the gradient box is the type rather than
                 the line box. Without this the ramp is mostly leading. */
              lineHeight: 1,
              letterSpacing: "0.2em",
              marginTop: lineSize * EST_GAP,
              /* letter-spacing leaves a trailing gap after the last character,
                 which pushes the line left of centre. This pulls it back. */
              textIndent: "0.2em",
              backgroundImage: `linear-gradient(to bottom, ${EST_TOP}, ${EST_BOTTOM})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent"
            }}
          >
            Est. 2013
          </div>
        )}
      </div>
    </div>
  );
}
