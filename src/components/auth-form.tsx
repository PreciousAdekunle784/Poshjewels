"use client";

import { keepValues } from "@/lib/form-submit";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";

export function AuthForm({
  action,
  fields,
  submitLabel,
  next,
  admin,
}: {
  action: (prev: AuthState, fd: FormData) => Promise<AuthState>;
  fields: { name: string; label: string; type?: string; autoComplete?: string }[];
  submitLabel: string;
  next?: string;
  admin?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);
  return (
    <form onSubmit={keepValues(formAction)} className="grid gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {admin && <input type="hidden" name="admin" value="1" />}
      {fields.map((f) => (
        <label key={f.name} className="block">
          <span className="field-label">{f.label}</span>
          <input name={f.name} type={f.type ?? "text"} autoComplete={f.autoComplete} className="field" aria-invalid={!!state?.errors?.[f.name]} required />
          {state?.errors?.[f.name] && <span className="mt-1 block text-[13px] text-oxblood">{state.errors[f.name]}</span>}
        </label>
      ))}
      {state?.message && (
        <p className="text-[14px] text-oxblood" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn btn-solid mt-2 w-full" disabled={pending}>
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
