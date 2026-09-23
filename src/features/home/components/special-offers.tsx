"use client";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { CarouselControls, SectionHeading, SectionLink } from "./section-heading";
import { PackageCard } from "./package-card";
import { useSpecialOffers } from "../hooks/use-home";

export function SpecialOffers() {
  const { data: offers, isPending, isError } = useSpecialOffers(6);

  if (isError || (!isPending && (!offers || offers.length === 0))) {
    return null;
  }

  return (
    // The page's one dark band. A faint wash of light from the top-left corner
    // keeps the navy from reading as a flat block.
    <section
      id="offers"
      className="relative overflow-hidden bg-ink bg-[radial-gradient(70%_90%_at_0%_0%,oklch(1_0_0/0.07),transparent)] py-16 text-ink-foreground lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isPending ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl bg-ink-foreground/10" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: offers!.length > 3 }} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              blockKey="home.offers"
              align="start"
              tone="inverse"
              className="lg:col-span-4 lg:flex-col lg:items-start lg:justify-start lg:self-center"
              action={
                <>
                  <SectionLink href="/packages" tone="inverse">
                    All packages
                  </SectionLink>
                  <div className="hidden items-center gap-2 sm:flex">
                    <CarouselControls tone="inverse" />
                  </div>
                </>
              }
            />
            {/* Room for the hover lift and shadow inside the clipping viewport. */}
            <Reveal className="-my-4 min-w-0 lg:col-span-8" direction="right">
              <CarouselContent className="-ml-5 py-4">
                {offers!.map((offer) => (
                  <CarouselItem key={offer.id} className="basis-[84%] pl-5 sm:basis-1/2">
                    <PackageCard pkg={offer} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Reveal>
          </Carousel>
        )}
      </div>
    </section>
  );
}
