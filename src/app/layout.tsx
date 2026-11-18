import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Imbue } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

/** Display: a condensed, high-contrast didone with an optical-size axis. Wordmark, headlines, menu. */
const imbue = Imbue({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-imbue",
  display: "swap",
});

/** Interface and reading: navigation, product information, prices, body copy, buttons.
 *  A grotesk with ink traps and characterful g/y, still highly legible at small sizes. */
const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-familjen",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Necklaces, Earrings, Bracelets & Rings`, template: `%s · ${SITE_NAME}` },
  description:
    "Posh Jewel: necklaces, earrings, bracelets, rings and jewellery sets chosen to be worn every day and remembered on the days that matter. Delivery across Nigeria.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_NG" },
};

export const viewport: Viewport = {
  themeColor: "#f5efe6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth" className={`${imbue.variable} ${familjen.variable}`} suppressHydrationWarning>
      <head>
        {/* Scroll reveals only hide content when JavaScript is running, so nothing is lost without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='1'" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
