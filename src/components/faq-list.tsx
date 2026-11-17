import type { Faq } from "@/db/schema";
import { paragraphs } from "@/lib/format";
import { PlusIcon } from "@/components/icons";

/** Native <details> accordion: accessible and works without JavaScript. */
export function FaqList({ faqs }: { faqs: Pick<Faq, "id" | "question" | "answer">[] }) {
  return (
    <div className="border-t border-line">
      {faqs.map((f, i) => (
        <details key={f.id} className="group border-b border-line" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16.5px] [&::-webkit-details-marker]:hidden">
            {f.question}
            <PlusIcon size={18} className="shrink-0 transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <div className="prose-posh max-w-[62ch] pb-6 pr-10 leading-relaxed text-stone">
            {paragraphs(f.answer).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
