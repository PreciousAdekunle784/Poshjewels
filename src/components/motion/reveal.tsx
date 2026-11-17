"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * One IntersectionObserver for the whole page: elements are revealed once and then unobserved,
 * so there are no scroll listeners and nothing to clean up after the reveal.
 */
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (typeof IntersectionObserver === "undefined") return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = "";
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
  );
  return observer;
}

export type RevealKind = "rise" | "unveil" | "words";

export function Reveal({
  as: Tag = "div",
  kind = "rise",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    if (!io) {
      el.dataset.revealed = "";
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} data-reveal={kind} className={className} style={{ ...style, "--rv-delay": `${delay}ms` } as CSSProperties} {...rest}>
      {kind === "unveil" ? <div className="rv-inner relative h-full w-full">{children}</div> : children}
    </Tag>
  );
}
