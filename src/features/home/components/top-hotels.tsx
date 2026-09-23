"use client";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Reveal } from "@/components/common/reveal";
import { CarouselControls, SectionHeading, SectionLink } from "./section-heading";
import { HotelCard } from "./hotel-card";
import { CardGridSkeleton } from "./card-grid-skeleton";
import { useTopHotels } from "../hooks/use-home";

export function TopHotels() {
  const { data: hotels, isPending, isError } = useTopHotels(8);

  if (isError || (!isPending && (!hotels || hotels.length === 0))) {
    return null;
  }

  return (
    <section id="hotels" className="border-y border-border/60 bg-secondary/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isPending ? (
          <>
            <SectionHeading blockKey="home.hotels" align="start" />
            <CardGridSkeleton
              count={4}
              cardClassName="aspect-auto h-80"
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            />
          </>
        ) : (
          // A carousel rather than a grid: the controls live in the header, and
          // on phones the next card peeks in to show there is more to swipe.
          <Carousel opts={{ align: "start" }}>
            <SectionHeading
              blockKey="home.hotels"
              align="start"
              action={
                <>
                  <SectionLink href="/hotels">View all hotels</SectionLink>
                  <div className="hidden items-center gap-2 sm:flex">
                    <CarouselControls />
                  </div>
                </>
              }
            />
            {/* The carousel viewport clips overflow, so padding gives the hover
                lift and shadow room, and the negative margin takes it back. */}
            <Reveal className="mt-8 -mb-8">
              <CarouselContent className="-ml-5 pt-2 pb-8">
                {hotels!.map((hotel) => (
                  <CarouselItem key={hotel.id} className="basis-[84%] pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <HotelCard hotel={hotel} />
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
