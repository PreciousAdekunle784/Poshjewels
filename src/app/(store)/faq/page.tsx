import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/lib/catalog";
import { FaqList } from "@/components/faq-list";

export const metadata: Metadata = { title: "FAQ", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const faqs = await getFaqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <div className="wrap grid gap-10 pb-24 pt-10 lg:grid-cols-12 lg:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="lg:col-span-4">
        <h1 className="display text-[40px] lg:text-[52px]">Frequently asked questions</h1>
        <p className="mt-4 text-stone">
          Still need help?{" "}
          <Link href="/contact" className="link text-espresso">
            Contact us
          </Link>
        </p>
      </header>
      <div className="lg:col-span-7 lg:col-start-6">
        {faqs.length ? <FaqList faqs={faqs} /> : <p className="text-stone">Questions will appear here soon.</p>}
      </div>
    </div>
  );
}
