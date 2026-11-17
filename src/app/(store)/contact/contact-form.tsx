"use client";

import { keepValues } from "@/lib/form-submit";
import { useActionState } from "react";
import { contactAction, type FormState } from "@/app/actions/forms";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, null);
  const err = (k: string) => state?.errors?.[k];
  if (state?.ok) {
    return (
      <div className="border border-line bg-paper p-6" role="status">
        <p className="display text-[24px]">Thank you.</p>
        <p className="mt-2 text-stone">{state.message}</p>
      </div>
    );
  }
  return (
    <form onSubmit={keepValues(action)} className="grid gap-5" noValidate>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="field-label">Name</span>
          <input name="name" className="field" autoComplete="name" aria-invalid={!!err("name")} />
          {err("name") && <span className="mt-1 block text-[13px] text-oxblood">{err("name")}</span>}
        </label>
        <label>
          <span className="field-label">Email</span>
          <input name="email" type="email" className="field" autoComplete="email" aria-invalid={!!err("email")} />
          {err("email") && <span className="mt-1 block text-[13px] text-oxblood">{err("email")}</span>}
        </label>
      </div>
      <label>
        <span className="field-label">Phone (optional)</span>
        <input name="phone" type="tel" className="field" autoComplete="tel" />
      </label>
      <label>
        <span className="field-label">Message</span>
        <textarea name="message" className="field" rows={6} aria-invalid={!!err("message")} placeholder="If it's about an order, include your order reference." />
        {err("message") && <span className="mt-1 block text-[13px] text-oxblood">{err("message")}</span>}
      </label>
      {state && !state.ok && <p className="text-[14px] text-oxblood">{state.message}</p>}
      <div>
        <button className="btn btn-solid" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
