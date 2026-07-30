/*
 * The mark, rebuilt as vector.
 *
 * Geometry and colour are measured off the original screenshot rather than
 * guessed: the mark's bounding box is 132x144, each stroke runs ~23% of the
 * width, the crossbar sits between 38% and 53% of the height, and the razor cut
 * crosses at ~40%. The gradient samples #4aaeea at the top and #0be6f9 at the
 * bottom, which is what makes it read as lighter at the base.
 *
 * `variant` exists so the slant and the cut can be compared side by side at
 * /preview/logo without editing this file. Once one is chosen the rest go.
 */

export type LogoVariant = "a" | "b" | "c" | "d";

interface IGeometry {
  slant: number;      // degrees of italic lean
  cutAngle: number;   // degrees the razor line runs at
  cutWidth: number;   // thickness of the cut, in viewBox units
  cutY: number;       // height at which the cut crosses
  stroke: number;     // stroke width, in viewBox units
}

const GEOMETRY: Record<LogoVariant, IGeometry> = {
  /* Measured mean: subtle lean, thin cut where the original has it. */
  a: { slant: 10, cutAngle: -14, cutWidth: 4.5, cutY: 56, stroke: 30 },
  /* Steeper lean, matching the right stroke's measured 12.4 degrees. */
  b: { slant: 13, cutAngle: -16, cutWidth: 4, cutY: 54, stroke: 31 },
  /* Thinnest cut, shallowest angle. The most restrained of the four. */
  c: { slant: 10, cutAngle: -10, cutWidth: 3.25, cutY: 58, stroke: 31 },
  /* Heaviest strokes, cut riding higher across the crossbar's top edge. */
  d: { slant: 12, cutAngle: -18, cutWidth: 5, cutY: 50, stroke: 33 }
};

export const CYAN_TOP = "#4aaeea";
export const CYAN_BOTTOM = "#0be6f9";
export const WORDMARK_INK = "#14212a";

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
  /* Bottom of the gradient. Defaults to the measured cyan. */
  tone?: string;
  /* Top of the gradient. */
  toneEnd?: string;
  /* Single colour, no gradient. For monochrome placements. */
  flat?: string;
  className?: string;
}) {
  const geometry = GEOMETRY[variant];
  const bottom = tone ?? CYAN_BOTTOM;
  const top = toneEnd ?? CYAN_TOP;
  const id = `lm-${variant}-${(flat ?? bottom).replace(/[^a-z0-9]/gi, "")}`;

  /* 132x144 is the measured bounding box; the extra width absorbs the slant. */
  return (
    <svg
      width={size * 0.917}
      height={size}
      viewBox="-14 0 160 144"
      fill="none"
      className={className}
      role="img"
      aria-label="Henry Hai Studio"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>

        <mask id={`${id}-m`}>
          <rect x="-20" y="-10" width="200" height="170" fill="black" />
          <g transform={`skewX(-${geometry.slant})`}>
            {/* left stroke, right stroke, crossbar */}
            <rect x="6" y="0" width={geometry.stroke} height="144" fill="white" />
            <rect x={126 - geometry.stroke} y="0" width={geometry.stroke} height="144" fill="white" />
            <rect x="6" y="55" width="120" height="21" fill="white" />
          </g>
          {/* the razor line */}
          <rect
            x="-40" y={geometry.cutY} width="230" height={geometry.cutWidth}
            fill="black"
            transform={`rotate(${geometry.cutAngle} 66 ${geometry.cutY})`}
          />
        </mask>
      </defs>

      <rect
        x="-20" y="-10" width="200" height="170"
        fill={flat ?? `url(#${id}-g)`}
        mask={`url(#${id}-m)`}
      />
    </svg>
  );
}

/*
 * Mark plus wordmark. The wordmark class comes from the caller so the typeface
 * can be swapped at /preview/logo without touching this component.
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
  name = "Henry Hai Studio",
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
  name?: string;
  showEst?: boolean;
}) {
  /* "Henry Hai Studio" sets on two lines the way the original did. */
  const parts = name.split(" ");
  const first = parts.slice(0, -1).join(" ");
  const second = parts[parts.length - 1];

  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} variant={variant} tone={tone} toneEnd={toneEnd} flat={flat} />
      {/* Wordmark and Est. share a column so Est. centres under the type. */}
      <div className="flex flex-col items-center leading-none">
        <div
          className={`uppercase leading-[1.02] tracking-[0.01em] ${wordClass}`}
          style={{ color: ink, fontSize: size * 0.335 }}
        >
          <div>{first}</div>
          <div>{second}</div>
        </div>
        {showEst && (
          <div
            className={`mt-[0.35em] uppercase tracking-[0.3em] ${wordClass}`}
            style={{ color: accent ?? CYAN_BOTTOM, fontSize: size * 0.155 }}
          >
            Est. 2013
          </div>
        )}
      </div>
    </div>
  );
}
