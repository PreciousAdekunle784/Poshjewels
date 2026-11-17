import Link from "next/link";

type Common = { children: React.ReactNode; className?: string };

/** Drawn arrow used by CTAs: a hairline that lengthens on hover. */
export function Arrow() {
  return <span className="arrow" aria-hidden />;
}

/** Primary shopping action: ticket-like, label left, arrow right, ink wipes across on hover. */
export function Cta({ href, children, tone = "solid", className = "" }: Common & { href: string; tone?: "solid" | "outline" | "light" }) {
  return (
    <Link href={href} className={`btn btn-${tone} btn-cta ${className}`}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

/** Secondary editorial link: short hairline grows to full width, arrow slides in. */
export function CtaLink({ href, children, className = "" }: Common & { href: string }) {
  return (
    <Link href={href} className={`cta-link ${className}`}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}
