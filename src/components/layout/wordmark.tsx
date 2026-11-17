/**
 * The Posh Jewel wordmark: one family, two weights. "Posh" is set heavy, "Jewel" in the hairline
 * weight, separated only by a hair space — the same weight contrast used to emphasise headlines.
 */
export function Wordmark({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap leading-none ${className}`}
      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.015em", fontOpticalSizing: "auto", ...style }}
      aria-label="Posh Jewel"
      role="img"
    >
      <span style={{ fontWeight: 650 }} aria-hidden>
        Posh
      </span>
      <span style={{ fontWeight: 160, marginLeft: "0.06em" }} aria-hidden>
        Jewel
      </span>
    </span>
  );
}
