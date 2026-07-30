/*
 * The mark, rebuilt as vector from measurements taken off the original.
 *
 * Scanning the screenshot row by row gives the real construction, which is not
 * one slash across the letter but TWO short cuts, each crossing a single stroke,
 * both sitting above the crossbar with the right one higher than the left:
 *
 *   bounding box   132 x 144
 *   slant          7.4 degrees (left edge travels 18px over 138px of height)
 *   stroke         30 units, 22.7% of the width
 *   crossbar       42% to 58% of the height
 *   left cut       centred at (29, 50), i.e. 22% across, 35% down
 *   right cut      centred at (111, 30), i.e. 84% across, 21% down
 *   cut angle      about 12 degrees, rising to the right
 *   gradient       #4aaeea at the top to #0be6f9 at the base
 *
 * The viewBox spans the full slanted extent so the bottom-left of the left
 * stroke is never clipped, which the previous build got wrong.
 */

export type LogoVariant = "a" | "b" | "c" | "d";

interface IGeometry {
  slant: number;
  stroke: number;
  cutAngle: number;
  cutWidth: number;
  /* Centres of the two cuts, in the final slanted coordinate space. */
  leftCut: [number, number];
  rightCut: [number, number];
}

const BASE: IGeometry = {
  slant: 7.4,
  stroke: 30,
  cutAngle: -12,
  cutWidth: 4,
  leftCut: [29, 50],
  rightCut: [111, 30]
};

const GEOMETRY: Record<LogoVariant, IGeometry> = {
  /* Straight off the measurements. */
  a: BASE,
  /* Thinner cuts. */
  b: { ...BASE, cutWidth: 3 },
  /* Steeper cuts, as the upscaled crop reads at the right stroke. */
  c: { ...BASE, cutAngle: -14, cutWidth: 4.5 },
  /* Heavier strokes, cuts sitting a touch closer to the crossbar. */
  d: { ...BASE, stroke: 32, leftCut: [29, 53], rightCut: [111, 33] }
};

export const CYAN_TOP = "#4aaeea";
export const CYAN_BOTTOM = "#0be6f9";
export const WORDMARK_INK = "#22314a";

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

  /* Pre-skew stroke positions. skewX shifts x by -y*tan(slant), so a stroke
     placed at 18 lands at 0 by the baseline, matching the measurement. */
  const leftX = 18;
  const rightX = 99;

  return (
    <svg
      width={size * 0.917}
      height={size}
      viewBox="0 0 132 144"
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

        <mask id={`${id}-m`}>
          <rect x="-30" y="-20" width="220" height="200" fill="black" />
          <g transform={`skewX(-${g.slant})`}>
            <rect x={leftX} y="0" width={g.stroke} height="144" fill="white" />
            <rect x={rightX} y="0" width={g.stroke} height="144" fill="white" />
            {/* crossbar, 42% to 58% of the height */}
            <rect x={leftX} y="60.5" width={rightX + g.stroke - leftX} height="23" fill="white" />
          </g>

          {/* The two razor cuts, placed in final space so the measured centres
              apply directly. Each is short enough to touch only its own stroke. */}
          <rect
            x={g.leftCut[0] - 36} y={g.leftCut[1] - g.cutWidth / 2}
            width="72" height={g.cutWidth} fill="black"
            transform={`rotate(${g.cutAngle} ${g.leftCut[0]} ${g.leftCut[1]})`}
          />
          <rect
            x={g.rightCut[0] - 36} y={g.rightCut[1] - g.cutWidth / 2}
            width="72" height={g.cutWidth} fill="black"
            transform={`rotate(${g.cutAngle} ${g.rightCut[0]} ${g.rightCut[1]})`}
          />
        </mask>
      </defs>

      <rect
        x="-30" y="-20" width="220" height="200"
        fill={flat ?? `url(#${id}-g)`}
        mask={`url(#${id}-m)`}
      />
    </svg>
  );
}

/*
 * Full lockup. All three lines are centred as a block, and the gap to the mark
 * is tightened to match the original, where the type sits close to the H.
 */
export function Logo({
  size = 46,
  variant = "a",
  tone,
  toneEnd,
  flat,
  ink = WORDMARK_INK,
  accent,
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
  wordClass?: string;
  lines?: string[];
  showEst?: boolean;
}) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.15 }}>
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
              color: accent ?? CYAN_BOTTOM,
              fontSize: size * 0.175,
              letterSpacing: "0.2em",
              marginTop: size * 0.085,
              /* letter-spacing adds a trailing gap on the last character, which
                 pushes the line left of centre. This pulls it back. */
              textIndent: "0.2em"
            }}
          >
            Est. 2013
          </div>
        )}
      </div>
    </div>
  );
}
