"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";

export function QuantityStepper({
  value,
  max,
  onChange,
  small,
  label = "item",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  small?: boolean;
  label?: string;
}) {
  const h = small ? "h-9" : "h-12";
  const w = small ? "w-9" : "w-11";
  return (
    <div className={`inline-flex items-center border border-line ${h}`}>
      <button
        type="button"
        className={`flex ${h} ${w} items-center justify-center disabled:opacity-30`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={`Decrease quantity of ${label}`}
      >
        <MinusIcon size={14} />
      </button>
      <span className="tabular w-8 text-center text-sm" aria-live="polite" aria-label={`Quantity ${value}`}>
        {value}
      </span>
      <button
        type="button"
        className={`flex ${h} ${w} items-center justify-center disabled:opacity-30`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <PlusIcon size={14} />
      </button>
    </div>
  );
}
