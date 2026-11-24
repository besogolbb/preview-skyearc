import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

// SkyeArc house type: Montserrat for headings, Open Sans for body (as skyearc.tech).
const display = Montserrat({
  variable: "--font-mont",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});
const body = Open_Sans({
  variable: "--font-open",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Concept preview",
  description: "Private concept preview built by skyeArc AI Technologies.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07213f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* Mandatory (claude.md): concept previews must never be indexed. */}
        <meta name="robots" content="noindex, nofollow" />
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
