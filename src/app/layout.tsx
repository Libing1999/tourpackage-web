import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { fetchSiteContent } from "@/features/cms/api";
import { env } from "@/utils/env";
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
  metadataBase: new URL(env.appUrl),
  title: {
    default: "TourPackage",
    template: "%s — TourPackage",
  },
  description: "Travel agency booking platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched here rather than per-page: navigation and section copy are needed
  // on every route, and doing it in the layout puts them in the first HTML
  // response instead of after hydration.
  const siteContent = await fetchSiteContent();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers siteContent={siteContent}>{children}</Providers>
      </body>
    </html>
  );
}
