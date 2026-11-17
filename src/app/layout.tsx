import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
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
    <html lang="en-NG" data-scroll-behavior="smooth" className={`${bodoni.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
