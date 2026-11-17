"use client";

import { useActionState } from "react";
import { subscribeAction, type FormState } from "@/app/actions/forms";

export function NewsletterForm({ source, tone = "light" }: { source: string; tone?: "light" | "dark" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeAction, null);
  const dark = tone === "dark";
  return (
    <form action={action} className="w-full" noValidate>
      <input type="hidden" name="source" value={source} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className={`flex border-b ${dark ? "border-ivory/50 focus-within:border-ivory" : "border-espresso/60 focus-within:border-espresso"}`}>
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          className={`h-12 min-w-0 flex-1 bg-transparent outline-none ${dark ? "placeholder:text-ivory/60" : "placeholder:text-stone"}`}
          aria-describedby={`nl-${source}-msg`}
        />
        <button type="submit" disabled={pending} className="cta-link shrink-0 self-center disabled:opacity-50">
          <span>{pending ? "Subscribing…" : "Subscribe"}</span>
          <span className="arrow" aria-hidden />
        </button>
      </div>
      <p id={`nl-${source}-msg`} role="status" className={`mt-2 min-h-[1.25rem] text-[13px] ${state && !state.ok ? (dark ? "text-[#f0b9a8]" : "text-oxblood") : dark ? "text-ivory/80" : "text-stone"}`}>
        {state?.message}
      </p>
    </form>
  );
}
