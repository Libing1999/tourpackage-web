"use client";

import { useSearchParams } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { GoogleMap } from "@/components/common/google-map";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsletterSection } from "@/features/home/components/newsletter-section";
import { usePublicSettings } from "@/features/home/hooks/use-home";
import { useBlock } from "@/features/cms/site-content-provider";
import { InquiryForm } from "./inquiry-form";

/** Shown only until `/public/settings` answers — the real values come from the
 * backend, so this is a placeholder for the map query, never a fallback that
 * would render wrong contact details if the request failed. */
const MAP_PLACEHOLDER_ADDRESS = "San Francisco, CA";

interface ContactDetail {
  icon: typeof Mail;
  label: string;
  value?: string;
  href?: string;
}

export function ContactPageContent() {
  const searchParams = useSearchParams();
  const { data: settings, isPending } = usePublicSettings();
  const hero = useBlock("page.contact");

  // Set by the "Ask about this trip" link on a package detail page.
  const packageId = searchParams.get("packageId") ?? undefined;
  const packageTitle = searchParams.get("packageTitle") ?? undefined;

  const address = settings?.contact_address;
  const email = settings?.contact_email;
  const phone = settings?.contact_phone;
  const businessHours = settings?.business_hours;

  const details: ContactDetail[] = [
    { icon: Mail, label: "Email", value: email, href: email ? `mailto:${email}` : undefined },
    { icon: Phone, label: "Phone", value: phone, href: phone ? `tel:${phone.replace(/\s/g, "")}` : undefined },
    { icon: MapPin, label: "Office", value: address },
    { icon: Clock, label: "Business hours", value: businessHours },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {hero?.title}
            </h1>
            {hero?.subtitle ? <p className="mt-3 text-muted-foreground">{hero.subtitle}</p> : null}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* items-start so the form card sizes to its content instead of
              stretching to match the taller sidebar column. */}
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border bg-background p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground">Send us a message</h2>
              <p className="mb-6 mt-1 text-sm text-muted-foreground">
                Fields marked optional help us answer faster, but skip them if you&apos;re just
                asking a question.
              </p>
              <InquiryForm packageId={packageId} packageTitle={packageTitle} />
            </div>

            <aside className="flex flex-col gap-6">
              <div className="rounded-2xl border bg-background p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">Company information</h2>
                <dl className="flex flex-col gap-5">
                  {details.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex gap-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-0.5 text-sm text-foreground">
                          {isPending ? (
                            <Skeleton className="h-4 w-40" />
                          ) : href && value ? (
                            <a href={href} className="hover:underline">
                              {value}
                            </a>
                          ) : (
                            (value ?? "—")
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              <GoogleMap
                address={address ?? MAP_PLACEHOLDER_ADDRESS}
                title={settings?.site_name}
                className="h-72 lg:h-80"
              />
            </aside>
          </div>
        </div>

        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  );
}
