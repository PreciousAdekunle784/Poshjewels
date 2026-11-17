"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { searchSuggestAction } from "@/app/actions/search";
import { formatNaira } from "@/lib/format";
import { CloseIcon, SearchIcon } from "@/components/icons";

type Suggestion = Awaited<ReturnType<typeof searchSuggestAction>>[number];

const SUGGESTED = [
  { label: "Hoops", q: "hoop" },
  { label: "Pearls", q: "pearl" },
  { label: "Pendants", q: "pendant" },
  { label: "Gift sets", q: "set" },
];

export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => start(async () => setResults(await searchSuggestAction(term))), 220);
    return () => clearTimeout(t);
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-espresso/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search" className="relative bg-ivory">
        <form
          className="wrap flex h-16 items-center gap-3 border-b border-line lg:h-[76px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
          role="search"
        >
          <SearchIcon className="shrink-0 text-stone" />
          <label htmlFor="site-search" className="sr-only">
            Search jewellery
          </label>
          <input
            id="site-search"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search necklaces, hoops, rings…"
            className="h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-stone/70"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="button" onClick={onClose} className="-mr-2 p-2" aria-label="Close search">
            <CloseIcon />
          </button>
        </form>
        <div className="wrap max-h-[70vh] overflow-y-auto py-6">
          {q.trim().length < 2 ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="label text-stone">Try</span>
              {SUGGESTED.map((s) => (
                <button key={s.q} type="button" className="link text-[15px]" onClick={() => setQ(s.q)}>
                  {s.label}
                </button>
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-stone">{pending ? "Searching…" : `Nothing matches “${q.trim()}”. Try a broader word, like “ring” or “gold”.`}</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/product/${r.slug}`} className="group block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                        {r.image && <Image src={r.image} alt={r.name} fill sizes="(min-width:1024px) 16vw, 45vw" className="object-cover" />}
                      </div>
                      <p className="mt-2 text-[14px] leading-snug group-hover:underline">{r.name}</p>
                      <p className="tabular text-[13px] text-stone">{formatNaira(r.price)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/search?q=${encodeURIComponent(q.trim())}`} className="link label mt-6 inline-block">
                See all results
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
