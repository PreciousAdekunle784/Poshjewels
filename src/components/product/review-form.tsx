"use client";

import { keepValues } from "@/lib/form-submit";
import { useActionState, useState } from "react";
import { submitReviewAction, type FormState } from "@/app/actions/forms";

export function ReviewForm({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(submitReviewAction, null);
  const err = (k: string) => state?.errors?.[k];

  if (state?.ok) {
    return (
      <p className="border border-line bg-paper p-5 text-[14.5px]" role="status">
        {state.message}
      </p>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline">
        Write a review
      </button>
    );
  }
  return (
    <form onSubmit={keepValues(action)} className="grid max-w-xl gap-4" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <fieldset>
        <legend className="field-label">Your rating</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} className="peer sr-only" required />
              <span className="flex h-10 w-10 items-center justify-center border border-line text-[14px] peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-1">
                {n}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-[12.5px] text-stone">1 = poor, 5 = excellent</p>
        {err("rating") && <p className="mt-1 text-[13px] text-oxblood">{err("rating")}</p>}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label">Name</span>
          <input name="name" className="field" autoComplete="name" aria-invalid={!!err("name")} />
          {err("name") && <span className="mt-1 block text-[13px] text-oxblood">{err("name")}</span>}
        </label>
        <label>
          <span className="field-label">Email (not published)</span>
          <input name="email" type="email" className="field" autoComplete="email" aria-invalid={!!err("email")} />
          {err("email") && <span className="mt-1 block text-[13px] text-oxblood">{err("email")}</span>}
        </label>
      </div>
      <label>
        <span className="field-label">Your review</span>
        <textarea name="body" className="field" aria-invalid={!!err("body")} />
        {err("body") && <span className="mt-1 block text-[13px] text-oxblood">{err("body")}</span>}
      </label>
      <p className="text-[12.5px] text-stone">Reviews are checked before they appear. Use the email from your order and your review will be marked as a verified purchase.</p>
      {state && !state.ok && <p className="text-[13.5px] text-oxblood">{state.message}</p>}
      <div>
        <button className="btn btn-solid" disabled={pending}>
          {pending ? "Sending…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
