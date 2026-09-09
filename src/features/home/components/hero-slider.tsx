"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

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
    <section className="relative -mt-16 flex h-svh min-h-[560px] w-full items-center justify-center pt-16">
      <Image
        src={imageUrl}
        alt="The Himalayan landscapes of Leh Ladakh"
        fill
        priority
        sizes="100vw"
        quality={90}
        className="object-cover"
      />
      {/* A soft top-to-bottom wash keeps the centered text legible without
          hiding the photograph. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          Journeys across the roof of the world
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/90 drop-shadow sm:text-lg">
          High passes, still lakes, and ancient monasteries — plan your perfect Leh Ladakh trip.
        </p>

        {/* Destination search, styled after the centered search on
            thomascook.in — a single rounded bar that hands off to the package
            listing. */}
        <form
          onSubmit={onSearch}
          className="mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="size-4" />
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
