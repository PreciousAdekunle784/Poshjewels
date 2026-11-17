export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display inline-flex items-baseline whitespace-nowrap uppercase leading-none tracking-[0.16em] ${className}`} style={{ fontWeight: 500 }}>
      Posh<span className="mx-[0.35em] inline-block h-[0.2em] w-[0.2em] translate-y-[-0.32em] rotate-45 bg-champagne" aria-hidden />Jewel
    </span>
  );
}
