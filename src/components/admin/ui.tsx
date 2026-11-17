import Link from "next/link";

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="display text-[30px]">{title}</h1>
        {description && <div className="mt-1 max-w-[70ch] text-stone">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, actions, className = "" }: { title?: string; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-ivory ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="label">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Empty({ children, href, cta }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="border border-dashed border-line px-6 py-12 text-center text-stone">
      <p>{children}</p>
      {href && cta && (
        <Link href={href} className="btn btn-solid mt-5">
          {cta}
        </Link>
      )}
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "neutral" | "good" | "warn" | "bad"; children: React.ReactNode }) {
  const tones = {
    neutral: "bg-bone text-espresso",
    good: "bg-[#e3eadf] text-moss",
    warn: "bg-[#f3e6cf] text-[#7a5a1c]",
    bad: "bg-[#f1ddd8] text-oxblood",
  };
  return <span className={`inline-block whitespace-nowrap px-2 py-0.5 text-[12px] ${tones[tone]}`}>{children}</span>;
}

export const th = "px-3 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.08em] text-stone";
export const td = "px-3 py-3 align-middle";
