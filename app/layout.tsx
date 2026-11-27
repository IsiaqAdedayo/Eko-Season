import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ShortlistBar } from "../components/shortlist";
import { SiteHeader } from "../components/site-header";
import { SITE_URL } from "../lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const TITLE = "Èkó Season — Detty December in Lagos";
const DESCRIPTION =
  "Where to go, what to eat, who is playing and how to move around Lagos this December.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Èkó Season",
    locale: "en_NG",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    // The image comes from app/opengraph-image.tsx, generated per request.
  },
  // Card type only: X falls back to each page's og:title/og:image, so this
  // doesn't stomp on a place page's own preview.
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
        >
          Skip to content
        </a>
        <div id="main" tabIndex={-1}>
          <SiteHeader />
          {children}
        </div>
        <ShortlistBar />
      </body>
    </html>
  );
}
