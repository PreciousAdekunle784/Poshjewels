"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type WishlistValue = { ids: number[]; ready: boolean; has: (id: number) => boolean; toggle: (id: number) => void; remove: (id: number) => void };
const WishlistContext = createContext<WishlistValue | null>(null);
const KEY = "pj_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(parsed)) setIds(parsed.filter((n) => Number.isInteger(n)));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const toggle = useCallback((id: number) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])), []);
  const remove = useCallback((id: number) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const value = useMemo(() => ({ ids, ready, has: (id: number) => ids.includes(id), toggle, remove }), [ids, ready, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
