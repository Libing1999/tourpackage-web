"use client";

import Link from "next/link";
import { Camera, Globe, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";

import { Logo } from "@/components/common/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicSettings } from "@/features/home/hooks/use-home";
import { useBlock, useSiteContent } from "@/features/cms/site-content-provider";

// Lucide dropped brand/trademark logos (Facebook, Instagram, etc.) from its
// icon set, so these use generic icons that gesture at each platform
// instead (camera for a photo-sharing app, video for a video platform).
const SOCIAL_ICONS: Record<string, typeof Globe> = {
  social_facebook: Globe,
  social_instagram: Camera,
  social_twitter: MessageCircle,
  social_youtube: Video,
};

export function SiteFooter() {
  const { data: settings, isPending } = usePublicSettings();
  // Links and tagline come from the CMS; contact details stay in settings,
  // which is where an admin already edits them.
  const quickLinks = useSiteContent()?.footer ?? [];
  const tagline = useBlock("footer.tagline")?.subtitle;

  const socialLinks = settings
    ? Object.entries(SOCIAL_ICONS)
        .filter(([key]) => settings[key])
        .map(([key, Icon]) => ({ key, Icon, href: settings[key] }))
    : [];

  return (
    <footer className="relative border-t bg-muted/40">
      {/* A thin brand rule along the top edge. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Logo />
            {isPending ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <p className="text-sm text-muted-foreground">{tagline}</p>
            )}
            {socialLinks.length > 0 ? (
              <div className="mt-2 flex items-center gap-2">
                {socialLinks.map(({ key, Icon, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="inline-block text-sm text-muted-foreground transition-[color,translate] duration-200 ease-out-soft hover:translate-x-0.5 hover:text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">Contact Us</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {isPending ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : (
                <>
                  {settings?.contact_email ? (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Mail className="mt-0.5 size-4 shrink-0" />
                      <a href={`mailto:${settings.contact_email}`} className="transition-colors hover:text-primary">
                        {settings.contact_email}
                      </a>
                    </li>
                  ) : null}
                  {settings?.contact_phone ? (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Phone className="mt-0.5 size-4 shrink-0" />
                      <a href={`tel:${settings.contact_phone}`} className="transition-colors hover:text-primary">
                        {settings.contact_phone}
                      </a>
                    </li>
                  ) : null}
                  {settings?.contact_whatsapp ? (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="mt-0.5 size-4 shrink-0" />
                      <a
                        href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-primary"
                      >
                        {settings.contact_whatsapp} (WhatsApp)
                      </a>
                    </li>
                  ) : null}
                  {settings?.contact_address ? (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      <span>{settings.contact_address}</span>
                    </li>
                  ) : null}
                </>
              )}
            </ul>
          </div>

        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings?.site_name ?? "TourPackage"}. All rights reserved.
          </p>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
