/*
 * The barbershop mark, rebuilt as vector.
 *
 * The original only survives as a screenshot, so this is a reconstruction of
 * the idea rather than a trace: an italic H with a razor line cut clean through
 * it. Being vector, it recolors per direction, scales to any size, and prints.
 *
 * `tone` colors the H, `ink` the wordmark, so a direction can pair a cyan mark
 * with ink type or go monochrome.
 */

export function LogoMark({
  size = 48,
  tone = "#22d3ee",
  toneEnd,
  className = ""
}: {
  size?: number;
  tone?: string;
  toneEnd?: string;
  className?: string;
}) {
  /* Unique per instance so multiple logos on one page do not share defs. */
  const id = `mk-${tone.replace(/[^a-z0-9]/gi, "")}-${toneEnd?.replace(/[^a-z0-9]/gi, "") ?? "s"}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="img"
      aria-label="Henry Hai's Barbershop"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={toneEnd ?? tone} />
          <stop offset="100%" stopColor={tone} />
        </linearGradient>

        {/* The razor line: a diagonal band subtracted from the letterform. */}
        <mask id={`${id}-cut`}>
          <rect x="0" y="0" width="120" height="120" fill="black" />
          <g transform="skewX(-11)">
            <rect x="26" y="8" width="21" height="104" fill="white" />
            <rect x="73" y="8" width="21" height="104" fill="white" />
            <rect x="26" y="52" width="68" height="19" fill="white" />
          </g>
          <rect
            x="-20" y="40" width="170" height="11"
            fill="black"
            transform="rotate(-15 60 46)"
          />
        </mask>
      </defs>

      <rect
        x="0" y="0" width="120" height="120"
        fill={`url(#${id}-g)`}
        mask={`url(#${id}-cut)`}
      />
    </svg>
  );
}

/* Mark plus wordmark. `stacked` puts the type under the mark. */
export function Logo({
  size = 44,
  tone = "#22d3ee",
  toneEnd,
  ink = "#1e2a44",
  accent,
  wordClass = "",
  showEst = true
}: {
  size?: number;
  tone?: string;
  toneEnd?: string;
  ink?: string;
  accent?: string;
  wordClass?: string;
  showEst?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} tone={tone} toneEnd={toneEnd} />
      <div className="leading-none">
        <div
          className={`font-semibold uppercase leading-[1.05] tracking-[0.02em] ${wordClass}`}
          style={{ color: ink, fontSize: size * 0.32 }}
        >
          <div>Henry Hai&rsquo;s</div>
          <div>Barbershop</div>
        </div>
        {showEst && (
          <div
            className="mt-1 font-medium uppercase tracking-[0.28em]"
            style={{ color: accent ?? tone, fontSize: size * 0.17 }}
          >
            Est. 2013
          </div>
        )}
      </div>
    </div>
  );
}
