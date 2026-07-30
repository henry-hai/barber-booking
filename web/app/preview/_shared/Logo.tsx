/*
 * The mark, rebuilt as vector from measurements taken off the original.
 *
 * Construction, from a row-by-row scan of the screenshot:
 *
 *   bounding box   132 x 144
 *   slant          7.4 degrees
 *   stroke         30 units, 22.7% of the width
 *   crossbar       42% to 58% of the height
 *   left cut       centred at (29, 50)
 *   right cut      centred at (111, 30)
 *   cut angle      about 12 degrees, rising to the right
 *   gradient       #4aaeea at the top to #0be6f9 at the base
 *   wordmark ink   #262f4c, sampled from the file. Dark navy, not black.
 *
 * The piece above each cut is displaced left and slightly down, so the letter
 * reads as having been sliced and let slip rather than merely gapped. That is
 * what makes it a razor mark instead of a broken H.
 *
 * The fragments are lifted out by masking, not by drawing separate shapes. A
 * mask with maskUnits in user space resolves inside whatever transform its
 * element sits in, so a masked rect placed inside a translated group moves the
 * mask and the fill together, which slides one fragment cleanly.
 */

export type LogoVariant = "a" | "b" | "c" | "d" | "e";

interface IGeometry {
  slant: number;
  stroke: number;
  cutAngle: number;
  cutWidth: number;
  leftCut: [number, number];
  rightCut: [number, number];
  /* How far the sliced-off top slips: left, and a little down. */
  slip: [number, number];
}

const BASE: IGeometry = {
  slant: 7.4,
  stroke: 30,
  cutAngle: -12,
  cutWidth: 3.5,
  leftCut: [29, 50],
  rightCut: [111, 30],
  slip: [-8.5, 1.5]
};

const GEOMETRY: Record<LogoVariant, IGeometry> = {
  a: BASE,
  /* Thinner cuts. */
  b: { ...BASE, cutWidth: 2.5 },
  /* A harder slip again, if the slice should read more violent. */
  c: { ...BASE, slip: [-12, 2.5] },
  /* Heavier strokes, cuts closer to the crossbar. */
  d: { ...BASE, stroke: 32, leftCut: [29, 53], rightCut: [111, 33] },
  /* C and D together: heavier strokes, cuts near the crossbar, harder slip. */
  e: { ...BASE, stroke: 32, leftCut: [29, 53], rightCut: [111, 33], slip: [-12, 2.5] }
};

export const CYAN_TOP = "#4aaeea";
export const CYAN_BOTTOM = "#0be6f9";
export const WORDMARK_INK = "#262f4c";

/*
 * How Est. 2013 is coloured.
 *
 * The cyan gradient matches the mark, but cyan on bone is a low-contrast pair
 * and the line is the smallest thing in the lockup, so it is the first thing to
 * become unreadable. Darker treatments trade brand match for legibility.
 */
export type EstColor = "gradient" | "deep" | "darkcyan" | "ink" | "black";

export const EST_COLORS: Record<EstColor, { from: string, to: string, label: string }> = {
  gradient: { from: CYAN_TOP, to: CYAN_BOTTOM, label: "Cyan gradient" },
  /*
   * The same direction as the mark, pushed darker so it holds on bone.
   *
   * Direction is worth stating because it is easy to get backwards. The mark
   * runs deep blue at the top to vivid cyan at the base. In HSL the top is
   * actually the lighter value, but perceived brightness runs the other way
   * (luma 152 at the top against 167 at the base), which is why it reads as
   * getting lighter downward. These stops keep that: luma 71 to 128, so the
   * base is unmistakably the brighter end.
   */
  deep: { from: "#0d3f57", to: "#22c3dd", label: "Deep gradient" },
  darkcyan: { from: "#0b6f85", to: "#0aa3bd", label: "Dark cyan" },
  ink: { from: WORDMARK_INK, to: WORDMARK_INK, label: "Navy ink" },
  black: { from: "#141414", to: "#141414", label: "Near black" }
};

export const EST_COLOR_OPTIONS = (Object.keys(EST_COLORS) as EstColor[])
  .map((key) => ({ id: key, label: EST_COLORS[key].label }));

/* Splits the two strokes. The left never passes 48, the right never falls
   below 81, so anything between separates them safely. */
const MIDLINE = 66;

/* Generous bounds so masks and knockouts always cover the whole canvas. */
const FIELD = { x: -60, y: -60, width: 280, height: 280 };

export function LogoMark({
  size = 48,
  variant = "a",
  tone,
  toneEnd,
  flat,
  className = ""
}: {
  size?: number;
  variant?: LogoVariant;
  tone?: string;
  toneEnd?: string;
  flat?: string;
  className?: string;
}) {
  const g = GEOMETRY[variant];
  const bottom = tone ?? CYAN_BOTTOM;
  const top = toneEnd ?? CYAN_TOP;
  const id = `lm-${variant}-${(flat ?? bottom).replace(/[^a-z0-9]/gi, "")}`;

  const leftX = 18;
  const rightX = 99;
  const half = g.cutWidth / 2;
  const fill = flat ?? `url(#${id}-g)`;

  /* The letter itself, drawn white into every mask. */
  const shape = (
    <g transform={`skewX(-${g.slant})`}>
      <rect x={leftX} y="0" width={g.stroke} height="144" fill="white" />
      <rect x={rightX} y="0" width={g.stroke} height="144" fill="white" />
      <rect x={leftX} y="60.5" width={rightX + g.stroke - leftX} height="23" fill="white" />
    </g>
  );

  /* Black rect removing everything above the cut band's lower edge. */
  const knockAbove = (cut: [number, number]) => (
    <rect
      x={FIELD.x} y={cut[1] + half - 300} width={FIELD.width} height="300" fill="black"
      transform={`rotate(${g.cutAngle} ${cut[0]} ${cut[1]})`}
    />
  );

  /* Black rect removing everything below the cut band's upper edge. */
  const knockBelow = (cut: [number, number]) => (
    <rect
      x={FIELD.x} y={cut[1] - half} width={FIELD.width} height="300" fill="black"
      transform={`rotate(${g.cutAngle} ${cut[0]} ${cut[1]})`}
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
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>

        {/* Half-planes, used to confine each knockout to its own stroke. */}
        <clipPath id={`${id}-left`}>
          <rect x={FIELD.x} y={FIELD.y} width={MIDLINE - FIELD.x} height={FIELD.height} />
        </clipPath>
        <clipPath id={`${id}-right`}>
          <rect x={MIDLINE} y={FIELD.y} width={FIELD.width} height={FIELD.height} />
        </clipPath>

        {/* The body: the letter below both cuts, including the crossbar. Each
            knockout is clipped to its own half so one cut cannot eat the
            other stroke. */}
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" {...FIELD}>
          {shape}
          <g clipPath={`url(#${id}-left)`}>{knockAbove(g.leftCut)}</g>
          <g clipPath={`url(#${id}-right)`}>{knockAbove(g.rightCut)}</g>
        </mask>

        {/* The sliced-off top of the left stroke. */}
        <mask id={`${id}-topLeft`} maskUnits="userSpaceOnUse" {...FIELD}>
          {shape}
          {knockBelow(g.leftCut)}
          <rect x={MIDLINE} y={FIELD.y} width={FIELD.width} height={FIELD.height} fill="black" />
        </mask>

        {/* The sliced-off top of the right stroke. */}
        <mask id={`${id}-topRight`} maskUnits="userSpaceOnUse" {...FIELD}>
          {shape}
          {knockBelow(g.rightCut)}
          <rect x={FIELD.x} y={FIELD.y} width={MIDLINE - FIELD.x} height={FIELD.height} fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${id}-body)`}>{canvas}</g>

      {/* Both tops slip together, down and to the left. */}
      <g transform={`translate(${g.slip[0]} ${g.slip[1]})`}>
        <g mask={`url(#${id}-topLeft)`}>{canvas}</g>
        <g mask={`url(#${id}-topRight)`}>{canvas}</g>
      </g>
    </svg>
  );
}

/*
 * Full lockup, proportioned off the original.
 *
 * Measured there: the mark is 142 tall against a 90 tall text block, so the H
 * runs 1.578 times the type and overhangs it by 25 above and 27 below. The gap
 * between the mark and the type is 18, or 0.127 of the mark's height.
 *
 * Everything below is expressed as a fraction of the mark's height so those
 * ratios hold at any size. The type is small relative to the mark by design;
 * that is what the original does, so the lockup needs to be set large enough
 * for Est. 2013 to stay legible rather than the type being scaled up to fix it.
 */
const TEXT_BLOCK = 1 / 1.578;   /* text block height, as a fraction of the mark */
const LINE_HEIGHT = 1.16;
const EST_RATIO = 0.43;         /* Est. 2013 size, as a fraction of a name line */
const EST_GAP = 0.25;           /* space above Est., as a fraction of a name line */
const GAP_RATIO = 0.127;        /* mark-to-type gap, as a fraction of the mark */

export function Logo({
  size = 46,
  variant = "a",
  tone,
  toneEnd,
  flat,
  ink = WORDMARK_INK,
  accent,
  accentEnd,
  wordClass = "",
  lines = ["Henry Hai", "Studio"],
  showEst = true,
  estScale = 1,
  estColor = "gradient",
  estMin = 0
}: {
  size?: number;
  variant?: LogoVariant;
  tone?: string;
  toneEnd?: string;
  flat?: string;
  ink?: string;
  accent?: string;
  accentEnd?: string;
  wordClass?: string;
  lines?: string[];
  showEst?: boolean;
  /*
   * Enlarges Est. 2013 beyond the faithful ratio. The original's proportions
   * were drawn for a 502px wide mark; scaled into a navbar, Est. 2013 lands
   * around 6px and stops being readable. Large placements should leave this at
   * 1; small ones need roughly 1.5.
   */
  estScale?: number;
  estColor?: EstColor;
  /*
   * Floor for the Est. 2013 size, in pixels.
   *
   * The faithful ratio puts this line near 7px in a navbar, and a gradient
   * cannot exist at 7px: the glyphs are about 5px tall and sit in the middle of
   * the line box, so they sample only a sliver of the ramp and render as a flat
   * mid-tone. Any direction read off that is antialiasing, not gradient. Small
   * placements need a floor.
   */
  estMin?: number;
}) {
  const scheme = EST_COLORS[estColor];
  /* `from` is always the top stop and `to` always the base. Fixed, not
     switchable: a toggle here labelled its own state rather than its action,
     so clicking it turned the correct default into the wrong one. */
  const estTop = accentEnd ?? scheme.from;
  const estBottom = accent ?? scheme.to;

  /* Solve the name line size so the whole block lands at TEXT_BLOCK of the
     mark's height: the name lines, the gap, and Est. itself. */
  const blockHeight = size * TEXT_BLOCK;
  const estUnits = showEst ? EST_GAP + EST_RATIO * estScale * LINE_HEIGHT : 0;
  const lineSize = blockHeight / (lines.length * LINE_HEIGHT + estUnits);

  return (
    <div className="flex items-center" style={{ gap: size * GAP_RATIO }}>
      <LogoMark size={size} variant={variant} tone={tone} toneEnd={toneEnd} flat={flat} />
      <div className="flex flex-col items-center leading-none">
        {lines.map((line) => (
          <div
            key={line}
            className={`whitespace-nowrap uppercase ${wordClass}`}
            style={{ color: ink, fontSize: lineSize, lineHeight: LINE_HEIGHT, letterSpacing: "0.015em" }}
          >
            {line}
          </div>
        ))}
        {showEst && (
          <div
            className={`whitespace-nowrap uppercase ${wordClass}`}
            style={{
              fontSize: Math.max(lineSize * EST_RATIO * estScale, estMin),
              /* Hugs the glyphs, so the gradient box is the type rather than
                 the line box. Without this the ramp is mostly leading. */
              lineHeight: 1,
              letterSpacing: "0.2em",
              marginTop: lineSize * EST_GAP,
              /* letter-spacing leaves a trailing gap after the last character,
                 which pushes the line left of centre. This pulls it back. */
              textIndent: "0.2em",
              backgroundImage: `linear-gradient(to bottom, ${estTop}, ${estBottom})`,
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
