import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { NewsletterForm } from "./newsletter-form";
import { Wordmark } from "./wordmark";

function socialUrl(kind: "instagram" | "tiktok" | "whatsapp", value: string) {
  if (/^https?:\/\//.test(value)) return value;
  const handle = value.replace(/^@/, "");
  if (kind === "instagram") return `https://instagram.com/${handle}`;
  if (kind === "tiktok") return `https://www.tiktok.com/@${handle}`;
  return `https://wa.me/${handle.replace(/[^\d]/g, "")}`;
}

export async function Footer() {
  const { brand, contact } = await getSettings(["brand", "contact"]);
  const socials = [
    contact.instagram && { kind: "instagram" as const, label: "Instagram", Icon: InstagramIcon, href: socialUrl("instagram", contact.instagram) },
    contact.tiktok && { kind: "tiktok" as const, label: "TikTok", Icon: TikTokIcon, href: socialUrl("tiktok", contact.tiktok) },
    contact.whatsapp && { kind: "whatsapp" as const, label: "WhatsApp", Icon: WhatsAppIcon, href: socialUrl("whatsapp", contact.whatsapp) },
  ].filter(Boolean) as { kind: string; label: string; Icon: typeof InstagramIcon; href: string }[];

  const columns = [
    {
      title: "Shop",
      links: [
        ["/shop", "Shop all"],
        ["/collections/new-arrivals", "New arrivals"],
        ["/shop/necklaces", "Necklaces"],
        ["/shop/earrings", "Earrings"],
        ["/shop/bracelets", "Bracelets"],
        ["/shop/rings", "Rings"],
        ["/shop/sets", "Jewellery sets"],
      ],
    },
    {
      title: "Help",
      links: [
        ["/contact", "Contact us"],
        ["/faq", "FAQ"],
        ["/pages/shipping", "Shipping & delivery"],
        ["/pages/returns", "Returns & exchanges"],
        ["/account", "Your orders"],
      ],
    },
    {
      title: "Posh Jewel",
      links: [
        ["/about", "About"],
        ["/collections", "Collections"],
        ["/wishlist", "Wishlist"],
        ["/pages/privacy", "Privacy policy"],
        ["/pages/terms", "Terms of service"],
      ],
    },
  ];

  return (
    <footer className="bg-cocoa text-ivory">
      <div className="wrap grid gap-12 pb-10 pt-16 lg:grid-cols-[1.1fr_1.9fr] lg:gap-20 lg:pt-20">
        <div className="max-w-sm">
          <Wordmark className="text-[22px]" />
          <p className="mt-5 text-[14px] leading-relaxed text-ivory/75">{brand.footerDescription}</p>
          <p className="label mt-10 text-ivory/90">Newsletter</p>
          <div className="mt-1">
            <NewsletterForm source="footer" tone="dark" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="label text-ivory/60">{col.title}</p>
              <ul className="mt-4 grid gap-2.5 text-[14px]">
                {col.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-ivory/85 hover:text-ivory hover:underline hover:underline-offset-4">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="label text-ivory/60">Get in touch</p>
            <ul className="mt-4 grid gap-2.5 text-[14px] text-ivory/85">
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="break-all hover:underline hover:underline-offset-4">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:underline hover:underline-offset-4">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.address && <li className="whitespace-pre-line">{contact.address}</li>}
              {contact.hours && <li className="text-ivory/60">{contact.hours}</li>}
              {!contact.email && !contact.phone && (
                <li>
                  <Link href="/contact" className="hover:underline hover:underline-offset-4">
                    Send us a message
                  </Link>
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-5 flex gap-3">
                {socials.map(({ kind, label, Icon, href }) => (
                  <li key={kind}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="block text-ivory/80 hover:text-ivory">
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-ivory/15 py-6 text-[12.5px] text-ivory/55 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Posh Jewel. All rights reserved.</p>
        <p>Prices in Nigerian Naira (₦)</p>
      </div>
    </footer>
  );
}
