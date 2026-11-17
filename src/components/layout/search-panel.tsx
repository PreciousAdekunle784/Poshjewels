"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { searchSuggestAction } from "@/app/actions/search";
import { formatNaira } from "@/lib/format";

type Suggestion = Awaited<ReturnType<typeof searchSuggestAction>>[number];

const SUGGESTED = [
  { label: "Hoops", q: "hoop" },
  { label: "Pearls", q: "pearl" },
  { label: "Pendants", q: "pendant" },
  { label: "Gift sets", q: "set" },
];

/** Search lifts open under the header; the query is typed in display type, results arrive as a contact sheet. */
export function SearchPanel({ open, top, onClose }: { open: boolean; top: number; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 150);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => start(async () => setResults(await searchSuggestAction(term))), 220);
    return () => clearTimeout(t);
  }, [q]);

  const i = (n: number) => ({ "--i": n }) as CSSProperties;

  return (
    <>
      <div className={`fixed inset-x-0 bottom-0 z-20 bg-espresso/30 transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} style={{ top }} onClick={onClose} aria-hidden />
      <div data-open={open} aria-hidden={!open} inert={!open} role="dialog" aria-label="Search" className="panel fixed inset-x-0 z-30 max-h-[80vh] overflow-y-auto bg-ivory" style={{ top }}>
        <div className="wrap pb-10 pt-8">
          <form
            role="search"
            className="rise"
            style={i(0)}
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <div className="flex items-end gap-6 border-b border-espresso/60 pb-2 focus-within:border-espresso">
              <label htmlFor="site-search" className="sr-only">
                Search jewellery
              </label>
              <input
                id="site-search"
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What are you looking for?"
                className="display min-w-0 flex-1 bg-transparent text-[clamp(34px,4vw,56px)] outline-none placeholder:text-stone/60"
                autoComplete="off"
                enterKeyHint="search"
              />
              <button type="button" onClick={onClose} className="cta-link mb-2 text-stone hover:text-espresso">
                Close
              </button>
            </div>
          </form>

          <div className="mt-7 min-h-[60px]">
            {q.trim().length < 2 ? (
              <div className="fade flex flex-wrap items-center gap-x-7 gap-y-3" style={i(2)}>
                <span className="label text-stone">Try</span>
                {SUGGESTED.map((s) => (
                  <button key={s.q} type="button" className="cta-link" onClick={() => setQ(s.q)}>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            ) : results.length === 0 ? (
              <p className="text-stone">{pending ? "Searching…" : `Nothing matches “${q.trim()}”. Try a broader word, like “ring” or “gold”.`}</p>
            ) : (
              <>
                <ul className="grid grid-cols-3 gap-x-4 gap-y-6 lg:grid-cols-6">
                  {results.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/product/${r.slug}`} className="group block" onClick={onClose}>
                        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                          {r.image && <Image src={r.image} alt={r.name} fill sizes="(min-width:1024px) 16vw, 30vw" className="object-cover" />}
                        </div>
                        <p className="t-product mt-2 group-hover:underline group-hover:underline-offset-4">{r.name}</p>
                        <p className="t-price">{formatNaira(r.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/search?q=${encodeURIComponent(q.trim())}`} className="cta-link mt-6" onClick={onClose}>
                  <span>See every result</span>
                  <span className="arrow" aria-hidden />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
