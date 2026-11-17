"use client";

import { useOptimistic, useState, useTransition } from "react";
import { removeSampleProductsAction, toggleProductFlagAction, updateStockAction } from "@/app/admin/actions";

export function FlagToggle({ id, flag, value, label }: { id: number; flag: "isPublished" | "isNewArrival" | "isBestSeller" | "isFeatured"; value: boolean; label: string }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={label}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleProductFlagAction(id, flag, !optimistic);
        })
      }
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${optimistic ? "bg-espresso" : "bg-line"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-ivory transition-transform ${optimistic ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function StockInput({ variantId, name, stock }: { variantId: number; name: string; stock: number }) {
  const [value, setValue] = useState(String(stock));
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [, start] = useTransition();
  function commit() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) {
      setValue(String(stock));
      return;
    }
    if (n === stock) return;
    setState("saving");
    start(async () => {
      await updateStockAction(variantId, n);
      setState("saved");
      setTimeout(() => setState("idle"), 1200);
    });
  }
  return (
    <label className="flex items-center gap-1.5 text-[12.5px]">
      {name && <span className="text-stone">{name}</span>}
      <input
        value={value}
        inputMode="numeric"
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className={`tabular w-12 border px-1.5 py-1 text-center text-[13px] ${Number(value) === 0 ? "border-oxblood/50 text-oxblood" : "border-line"} ${state === "saved" ? "bg-[#e3eadf]" : "bg-paper"}`}
        aria-label={`Stock${name ? ` for ${name}` : ""}`}
      />
    </label>
  );
}

export function RemoveSamples({ count }: { count: number }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-[13px] text-moss">{msg}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Remove all ${count} sample products? Products you have edited are kept.`)) return;
          start(async () => {
            const r = await removeSampleProductsAction();
            setMsg(r?.message ?? null);
          });
        }}
        className="btn btn-outline !min-h-9 !px-3"
      >
        {pending ? "Removing…" : "Remove sample products"}
      </button>
    </div>
  );
}
