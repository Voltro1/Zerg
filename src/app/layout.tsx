import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Zerg — Creator Marketplace for E-Commerce",
    template: "%s | Zerg",
  },
  description:
    "Connect e-commerce store owners with world-class designers, writers, and content creators. Buy digital products or commission custom work.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Zerg",
    title: "Zerg — Creator Marketplace for E-Commerce",
    description: "Hire creators. Sell digital assets. Grow your store.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zerg — Creator Marketplace",
    description: "Hire creators. Sell digital assets. Grow your store.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
