import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const c = await getSetting("contact");
  const rows = [
    c.email && { label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.phone && { label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.whatsapp && { label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/[^\d]/g, "")}` },
    c.address && { label: "Address", value: c.address },
    c.hours && { label: "Hours", value: c.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];
  return (
    <div className="wrap grid gap-12 pb-24 pt-10 lg:grid-cols-12 lg:pt-14">
      <div className="lg:col-span-4">
        <h1 className="display text-[40px] lg:text-[52px]">Contact us</h1>
        <p className="mt-4 max-w-[38ch] text-stone">
          Questions about a piece, an order or a gift? Send a message and we&rsquo;ll reply by email. You may find a quick answer in our{" "}
          <Link href="/faq" className="link text-espresso">
            FAQ
          </Link>
          .
        </p>
        {rows.length > 0 && (
          <dl className="mt-10 grid gap-5 border-t border-line pt-8">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="label text-stone">{r.label}</dt>
                <dd className="mt-1 whitespace-pre-line">
                  {r.href ? (
                    <a href={r.href} className="link">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="lg:col-span-7 lg:col-start-6">
        <ContactForm />
      </div>
    </div>
  );
}
