import { SectionHeading } from "./section-heading";
import { HotelCard } from "./hotel-card";
import { CardGridSkeleton } from "./card-grid-skeleton";
import { Reveal } from "@/components/common/reveal";
import { useTopHotels } from "../hooks/use-home";

export function TopHotels() {
  const { data: hotels, isPending, isError } = useTopHotels(8);

  if (isError || (!isPending && (!hotels || hotels.length === 0))) {
    return null;
  }

  return (
    <section id="hotels" className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading blockKey="home.hotels" />

        {isPending ? (
          <CardGridSkeleton
            count={8}
            cardClassName="aspect-auto h-72"
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          />
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {hotels!.map((hotel, i) => (
              <Reveal key={hotel.id} delayMs={i * 60}>
                <HotelCard hotel={hotel} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
