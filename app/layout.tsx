import type { Metadata, Viewport } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";

const host = Host_Grotesk({
  variable: "--font-host",
  subsets: ["latin"],
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
  themeColor: "#0b1626",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={host.variable}>
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
