"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "../hooks/use-home";

// A dependable full-bleed Ladakh frame for when the CMS has no banner yet.
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1660303954454-cc270a0d48c4?w=2880&h=1620&fit=crop&auto=format&q=85";

// The banners are seeded at 1920px; ask Unsplash for a 4K-class source so the
// full-screen frame stays crisp on large displays (next/image sizes the rest).
function upscale(url: string): string {
  if (!url.includes("images.unsplash.com")) return url;
  return url
    .replace(/([?&])w=\d+/, "$1w=2880")
    .replace(/([?&])h=\d+/, "$1h=1620")
    .replace(/([?&])q=\d+/, "$1q=85");
}

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
    return <Skeleton className="-mt-16 h-svh min-h-[560px] w-full rounded-none" />;
  }

  const imageUrl = upscale(banners?.[0]?.imageUrl ?? FALLBACK_IMAGE);

  return (
    // -mt-16 pulls the hero up behind the (transparent) sticky navbar so the
    // image fills the top of the screen; pt-16 keeps the centred content clear
    // of the bar.
    <section className="relative -mt-16 flex h-svh min-h-[560px] w-full items-center justify-center overflow-hidden pt-16">
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
      {/* A soft top-to-bottom wash keeps the centered text legible without
          hiding the photograph. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-[oklch(0.2_0.06_265/0.7)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
        <h1 className="animate-rise text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-md [animation-delay:150ms] sm:text-5xl lg:text-6xl">
          Journeys across the roof of the world
        </h1>
        <p className="mt-5 max-w-2xl animate-rise text-base text-white/90 drop-shadow [animation-delay:300ms] sm:text-lg">
          High passes, still lakes, and ancient monasteries — plan your perfect Leh Ladakh trip.
        </p>

        {/* Destination search, styled after the centered search on
            thomascook.in — a single rounded bar that hands off to the package
            listing. */}
        <form
          onSubmit={onSearch}
          className="mt-9 flex w-full max-w-2xl animate-rise flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl ring-1 ring-white/40 backdrop-blur transition-shadow duration-300 [animation-delay:450ms] focus-within:ring-4 focus-within:ring-white/30 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <MapPin className="size-5 shrink-0 text-primary" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search destinations, tours, or hotels"
              aria-label="Search destinations, tours, or hotels"
              className="h-11 w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-500 sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="group/search inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none active:scale-[0.98]"
          >
            Search
            <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover/search:translate-x-0.5" />
          </button>
        </form>
      </div>
    </section>
  );
}
