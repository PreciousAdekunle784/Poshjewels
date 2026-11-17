"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Route changes cross-fade: the old page leaves quickly, the new one settles up into place.
 * Keyed by pathname, so filtering, form submissions and other same-page updates never animate.
 * Named elements inside (product photographs) morph between pages instead.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
