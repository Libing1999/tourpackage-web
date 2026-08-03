"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "./section-heading";
import { PackageCard } from "./package-card";
import { useSpecialOffers } from "../hooks/use-home";

export function SpecialOffers() {
  const { data: offers, isPending, isError } = useSpecialOffers(6);

  if (isError || (!isPending && (!offers || offers.length === 0))) {
    return null;
  }

  return (
    <section id="offers" className="bg-primary/5 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading blockKey="home.offers" />

        {isPending ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <Reveal className="mt-10">
            <Carousel opts={{ align: "start", loop: offers!.length > 3 }}>
              <CarouselContent>
                {offers!.map((offer) => (
                  <CarouselItem key={offer.id} className="sm:basis-1/2 lg:basis-1/3">
                    <PackageCard pkg={offer} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </Reveal>
        )}
      </div>
    </section>
  );
}
