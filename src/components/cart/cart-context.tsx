"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { refreshCartAction } from "@/app/actions/cart";

export type CartLine = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantName: string | null;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  isOpen: boolean;
  notice: string | null;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pj_cart_v1";

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.variantId === "number") : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  useEffect(() => {
    setLines(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable: cart lives for this tab only */
    }
  }, [lines, ready]);

  const refresh = useCallback(async () => {
    const current = linesRef.current;
    if (current.length === 0) return;
    try {
      const fresh = await refreshCartAction(current.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
      const messages: string[] = [];
      const next: CartLine[] = [];
      for (const l of current) {
        const f = fresh.find((x) => x.variantId === l.variantId);
        if (!f) {
          messages.push(`${l.name} is no longer available and was removed.`);
          continue;
        }
        if (f.stock <= 0) {
          messages.push(`${f.name} has sold out and was removed.`);
          continue;
        }
        const quantity = Math.min(l.quantity, f.stock);
        if (quantity < l.quantity) messages.push(`Only ${f.stock} of ${f.name} left — quantity updated.`);
        if (f.price !== l.price) messages.push(`The price of ${f.name} has changed.`);
        next.push({ ...l, ...f, quantity });
      }
      setLines(next);
      setNotice(messages.length ? messages.join(" ") : null);
    } catch {
      /* offline or server error: keep the local cart */
    }
  }, []);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId);
      if (existing) {
        return prev.map((l) => (l.variantId === line.variantId ? { ...l, ...line, quantity: Math.min(line.stock, l.quantity + quantity) } : l));
      }
      return [...prev, { ...line, quantity: Math.min(line.stock, quantity) }];
    });
    setNotice(null);
    setOpen(true);
  }, []);

  const setQuantity = useCallback((variantId: number, quantity: number) => {
    setLines((prev) =>
      prev.flatMap((l) => (l.variantId !== variantId ? [l] : quantity <= 0 ? [] : [{ ...l, quantity: Math.min(quantity, Math.max(1, l.stock)) }])),
    );
  }, []);

  const remove = useCallback((variantId: number) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      isOpen,
      notice,
      open,
      close,
      add,
      setQuantity,
      remove,
      clear,
      refresh,
    }),
    [lines, ready, isOpen, notice, open, close, add, setQuantity, remove, clear, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
