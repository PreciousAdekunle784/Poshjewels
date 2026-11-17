export function SectionHeadingClient({ id, title, copy, children }: { id: string; title: string; copy?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
      <div>
        <h2 id={id} className="display text-[32px] lg:text-[42px]">
          {title}
        </h2>
        {copy && <p className="mt-2 text-stone">{copy}</p>}
      </div>
      {children}
    </div>
  );
}
