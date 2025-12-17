import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2up4up - Combine PDF Pages | Free 2-up & 4-up PDF Tool",
  description:
    "Free online tool to combine multiple PDF pages onto single sheets. Create 2-up or 4-up layouts for printing. Print 2 pages on 1 sheet or multiple pages per sheet. No uploads to server, 100% private.",
  keywords:
    "PDF combiner, 2-up printing, 4-up PDF, n-up PDF online, combine PDF pages, print multiple pages per sheet, print 2 pages on 1 sheet, PDF page layout tool",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "2up4up - Free PDF Page Combiner",
    description:
      "Combine multiple PDF pages onto single sheets. 2-up, 4-up layouts. Free & private.",
    url: "https://2up4up.vercel.app",
    type: "website",
    siteName: "2up4up",
  },
  twitter: {
    card: "summary_large_image",
    title: "2up4up - Free PDF Page Combiner",
    description:
      "Combine multiple PDF pages onto single sheets. 2-up, 4-up layouts. Free & private.",
  },
  alternates: {
    canonical: "https://2up4up.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "2up4up",
              url: "https://2up4up.vercel.app",
              description:
                "Free tool to combine PDF pages into 2-up or 4-up layouts",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
