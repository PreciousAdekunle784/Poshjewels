"use client";

import { keepValues } from "@/lib/form-submit";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { uploadImagesAction } from "@/app/admin/actions";

/** A form bound to a server action that shows a saved/error message. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save changes",
  className = "",
  resetOnSuccess,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} onSubmit={keepValues(formAction)} className={`grid gap-4 ${className}`}>
      {children}
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-solid" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state && (
          <p className={`text-[13.5px] ${state.ok ? "text-moss" : "text-oxblood"}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

export function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field" {...props} />
      {hint && <span className="mt-1 block text-[12.5px] text-stone">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea className="field" {...props} />
      {hint && <span className="mt-1 block text-[12.5px] text-stone">{hint}</span>}
    </label>
  );
}

export function Check({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 h-4 w-4 accent-espresso" {...props} />
      <span>
        <span className="block">{label}</span>
        {hint && <span className="block text-[12.5px] text-stone">{hint}</span>}
      </span>
    </label>
  );
}

/** Single image picker that uploads immediately and writes the resulting URL to a hidden input. */
export function ImageField({ name, label, defaultValue, folder = "content" }: { name: string; label: string; defaultValue?: string | null; folder?: "content" | "products" }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <span className="field-label">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="h-20 w-16 shrink-0 overflow-hidden bg-bone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url && <img src={url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="grid gap-1.5">
          <label className="btn btn-outline !min-h-9 cursor-pointer !px-3 !text-[11px]">
            {pending ? "Uploading…" : url ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("files", file);
                fd.append("folder", folder);
                start(async () => {
                  const res = await uploadImagesAction(fd);
                  if (res.urls[0]) {
                    setUrl(res.urls[0]);
                    setError(null);
                  } else setError(res.errors[0] ?? "Upload failed.");
                });
                e.target.value = "";
              }}
            />
          </label>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="text-left text-[12.5px] text-stone underline">
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-[13px] text-oxblood">{error}</p>}
    </div>
  );
}

/** Small button that calls a server action, with a confirmation prompt for destructive actions. */
export function ActionButton({ action, children, confirm: confirmText, className = "" }: { action: () => Promise<unknown>; children: React.ReactNode; confirm?: string; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={`disabled:opacity-50 ${className}`}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        start(async () => {
          await action();
        });
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
