import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd, organizationSchema, websiteSchema } from "@/features/seo/structured-data";
import { fetchSeoSettings } from "@/features/seo/api";
import { SITE_NAME } from "@/features/seo/metadata";
import { fetchSiteContent } from "@/features/cms/api";
import { env } from "@/utils/env";
import "./globals.css";

// Poppins mirrors the typeface thomascook.in uses for its UI. It carries the
// whole site through the --font-sans token the Tailwind theme resolves against.
const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: "Leh Ladakh tour packages, treks, and camping trips across the Himalayas.",
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
  const [siteContent, settings] = await Promise.all([fetchSiteContent(), fetchSeoSettings()]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
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
