"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search } from "lucide-react";

import { MaskedHeading } from "@/components/common/masked-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "../hooks/use-home";

// A dependable full-bleed Ladakh frame for when the CMS has no banner yet.
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1660303954454-cc270a0d48c4?w=2880&h=1620&fit=crop&auto=format&q=85";

// The headline's letters are windows onto this photograph whatever the banner
// is. Its pale slopes and sky stay bright against the darkened frame, where a
// dusk banner showing through the letters would sink into it. The letters span
// at most about a thousand pixels, so it is not the 4K-class banner source.
const LETTER_FILL_IMAGE =
  "https://images.unsplash.com/photo-1660303954454-cc270a0d48c4?w=1920&h=1080&fit=crop&auto=format&q=85";

// The banners are seeded at 1920px; ask Unsplash for a 4K-class source so the
// full-screen frame stays crisp on large displays (next/image sizes the rest).
function upscale(url: string): string {
  if (!url.includes("images.unsplash.com")) return url;
  return url
    .replace(/([?&])w=\d+/, "$1w=2880")
    .replace(/([?&])h=\d+/, "$1h=1620")
    .replace(/([?&])q=\d+/, "$1q=85");
}

// Shared by the section and its loading placeholder so the page does not jump
// when the banner arrives. The height is capped so an ultra-tall display does
// not push the headline far from the search bar.
const HERO_SIZE = "-mt-16 h-svh max-h-[1000px] min-h-[600px] w-full";

export function HeroSlider() {
  const { data: banners, isPending } = useBanners();
  const router = useRouter();
  const [term, setTerm] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = term.trim();
    router.push(q ? `/packages?q=${encodeURIComponent(q)}` : "/packages");
  }

  if (isPending) {
    return <Skeleton className={`${HERO_SIZE} rounded-none`} />;
  }

  const imageUrl = upscale(banners?.[0]?.imageUrl ?? FALLBACK_IMAGE);

  return (
    // -mt-16 pulls the hero up behind the (transparent) sticky navbar so the
    // image fills the top of the screen; pt-16 keeps the content clear of the bar.
    // Phones skip the padding so the shorter copy centres on the whole screen.
    <section className={`relative flex items-center overflow-hidden bg-ink md:pt-16 ${HERO_SIZE}`}>
      {/* The photo settles in from a slight zoom once, on load. */}
      <Image
        src={imageUrl}
        alt="The Himalayan landscapes of Leh Ladakh"
        fill
        priority
        sizes="100vw"
        quality={90}
        className="animate-settle object-cover"
      />
      {/* The headline's letters are cut from the photograph itself, so the
          wash dims the frame around them, most of all in a pool behind the
          centred copy, for the letters to read as the brightest thing on it. */}
      <div className="absolute inset-0 bg-[oklch(0.18_0.06_265/0.5)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,oklch(0.16_0.06_265/0.45),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[oklch(0.16_0.05_265/0.6)] to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        {/* Type scales with the column, so the headline holds two balanced
            lines on wide screens; the floor keeps it a headline on phones. */}
        <MaskedHeading
          tag="h1"
          text="Journeys across the roof of the world"
          src={LETTER_FILL_IMAGE}
          trigger="mount"
          fillScale={1.3}
          brightness={1.1}
          saturation={1.15}
          textScale={0.085}
          minSize={34}
          className="text-white"
        />
        <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-white/85 [animation-delay:240ms] sm:text-lg">
          High passes, still lakes, and ancient monasteries — plan your perfect Leh Ladakh trip.
        </p>

        {/* Destination search: a single bar that hands off to the package
            listing, the page's primary action. Below md it moves into the
            navbar as an icon (see SiteNavbar) so the copy sits centred. */}
        <form
          onSubmit={onSearch}
          role="search"
          className="mt-8 hidden w-full max-w-xl animate-rise flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_24px_60px_-20px_oklch(0.1_0.05_265/0.6)] ring-1 ring-white/60 transition-shadow duration-300 [animation-delay:360ms] focus-within:ring-4 focus-within:ring-white/35 sm:flex-row sm:items-center md:flex"
        >
          <div className="flex flex-1 items-center gap-2.5 px-3">
            <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search destinations, tours, or hotels"
              aria-label="Search destinations, tours, or hotels"
              className="h-12 w-full bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500"
            />
          </div>
          <button
            type="submit"
            className="group/search inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[background-color,box-shadow,scale] duration-200 ease-out-soft hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none active:scale-[0.98] dark:bg-[oklch(0.34_0.13_265)] dark:text-white dark:hover:bg-[oklch(0.3_0.12_265)]"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </form>

        <div className="mt-6 animate-rise [animation-delay:480ms]">
          <Link
            href="/packages"
            className="group/browse inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-3 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            Or browse all packages
            <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover/browse:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
