"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBanners } from "../hooks/use-home";

export function HeroSlider() {
  const { data: banners, isPending, isError } = useBanners();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (isPending) {
    return <Skeleton className="h-[70svh] min-h-[420px] w-full rounded-none" />;
  }

  if (isError || !banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 6000, stopOnInteraction: true })]}
      >
        <CarouselContent className="ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="relative h-[70svh] min-h-[420px] pl-0">
              <Image
                src={banner.imageUrl}
                alt={banner.title ?? "TourPackage"}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl">
                  {banner.title ? (
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                      {banner.title}
                    </h1>
                  ) : null}
                  {banner.subtitle ? (
                    <p className="mt-4 text-lg text-white/90">{banner.subtitle}</p>
                  ) : null}
                  {banner.linkUrl && banner.buttonLabel ? (
                    <a
                      href={banner.linkUrl}
                      className={cn(buttonVariants({ size: "lg" }), "mt-6 w-fit")}
                    >
                      {banner.buttonLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 hidden sm:flex" />
        <CarouselNext className="right-4 hidden sm:flex" />
      </Carousel>

      {banners.length > 1 ? (
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
