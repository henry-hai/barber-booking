import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`
  },
  description: site.description,
  keywords: [
    "barber", "barbershop", "haircut", "fade", "line-up", "beard trim",
    "Irvine barber", "Milpitas barber", "Orange County barber"
  ],
  authors: [{ name: "Henry Hai Nguyen" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
    locale: "en_US",
    images: [
      {
        url: site.ogImage,
        width: 1200,
        height: 630,
        alt: `${site.name} interior`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [site.ogImage]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* The navbar and its top offset belong to the marketing page, not to every
       route, so that other routes can present their own chrome. */
    <html lang="en">
      <body className="bg-gray-100 font-sans leading-relaxed text-gray-800">
        {children}
      </body>
    </html>
  );
}
