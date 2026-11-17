import { Reveal } from "@/components/motion/reveal";
import { Words, plain } from "@/components/motion/words";

export function SectionHeadingClient({ id, title, copy, children }: { id: string; title: string; copy?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-9 flex items-end justify-between gap-6 lg:mb-12">
      <div>
        <Reveal as="h2" kind="words" id={id} className="display t-section" aria-label={plain(title)}>
          <Words text={title} />
        </Reveal>
        {copy && <p className="mt-3 text-stone">{copy}</p>}
      </div>
      {children}
    </div>
  );
}
