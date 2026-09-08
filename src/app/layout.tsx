import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Farnsworth Motors — Built Again.",
    template: "%s — Farnsworth Motors",
  },
  description: site.description,
  openGraph: {
    title: "Farnsworth Motors",
    description: site.description,
    siteName: "Farnsworth Motors",
    locale: "en_US",
    type: "website",
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
};

export const viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-bg font-sans text-ink antialiased`}
      >
        <noscript>
          {/* With JS disabled, show the assembled vehicle and the brand copy. */}
          <style>{`.car-part{transform:none!important}.hero-copy{opacity:1!important;pointer-events:auto!important}.reveal{opacity:1!important;transform:none!important}.car-shadow{opacity:1!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
