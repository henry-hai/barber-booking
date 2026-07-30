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

export type LogoVariant = "a" | "b" | "c" | "d";

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
  slip: [-5, 1.5]
};

const GEOMETRY: Record<LogoVariant, IGeometry> = {
  a: BASE,
  /* Thinner cuts. */
  b: { ...BASE, cutWidth: 2.5 },
  /* A harder slip, if the slice should read more violent. */
  c: { ...BASE, slip: [-8, 2.5] },
  /* Heavier strokes, cuts closer to the crossbar. */
  d: { ...BASE, stroke: 32, leftCut: [29, 53], rightCut: [111, 33] }
};

export const CYAN_TOP = "#4aaeea";
export const CYAN_BOTTOM = "#0be6f9";
export const WORDMARK_INK = "#262f4c";

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
 * Full lockup. All three lines centre as a block, and Est. 2013 carries the
 * same top-to-bottom gradient as the mark, as the original does.
 */
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
  showEst = true
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
}) {
  const estBottom = accent ?? CYAN_BOTTOM;
  const estTop = accentEnd ?? CYAN_TOP;

  return (
    <div className="flex items-center" style={{ gap: size * 0.14 }}>
      <LogoMark size={size} variant={variant} tone={tone} toneEnd={toneEnd} flat={flat} />
      <div className="flex flex-col items-center leading-none">
        {lines.map((line) => (
          <div
            key={line}
            className={`uppercase ${wordClass}`}
            style={{ color: ink, fontSize: size * 0.315, lineHeight: 1.16, letterSpacing: "0.015em" }}
          >
            {line}
          </div>
        ))}
        {showEst && (
          <div
            className={`uppercase ${wordClass}`}
            style={{
              fontSize: size * 0.175,
              letterSpacing: "0.2em",
              marginTop: size * 0.085,
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
