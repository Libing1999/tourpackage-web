import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd, organizationSchema, websiteSchema } from "@/features/seo/structured-data";
import { fetchSeoSettings } from "@/features/seo/api";
import { SITE_NAME } from "@/features/seo/metadata";
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
  // Defaults for any route that doesn't set its own — a page with no
  // OpenGraph tags shares as a bare link.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: env.appUrl,
  },
  twitter: { card: "summary_large_image" },
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
  const settings = await fetchSeoSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Site-wide structured data. In the layout rather than on the homepage
            so a crawler that lands on any page still learns who runs the site —
            and so the sitelinks search box is offered from everywhere. */}
        <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />
        <Providers siteContent={siteContent}>{children}</Providers>
      </body>
    </html>
  );
}
