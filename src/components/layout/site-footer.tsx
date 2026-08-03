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
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
                    className="flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact Us</h3>
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
                      <a href={`mailto:${settings.contact_email}`} className="hover:text-foreground">
                        {settings.contact_email}
                      </a>
                    </li>
                  ) : null}
                  {settings?.contact_phone ? (
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Phone className="mt-0.5 size-4 shrink-0" />
                      <a href={`tel:${settings.contact_phone}`} className="hover:text-foreground">
                        {settings.contact_phone}
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

          <div>
            <h3 className="text-sm font-semibold text-foreground">Business Hours</h3>
            <div className="mt-4">
              {isPending ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="text-sm text-muted-foreground">{settings?.business_hours}</p>
              )}
            </div>
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
