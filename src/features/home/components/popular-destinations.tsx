import { SectionHeading } from "./section-heading";
import { DestinationCard } from "./destination-card";
import { CardGridSkeleton } from "./card-grid-skeleton";
import { Reveal } from "@/components/common/reveal";
import { usePopularDestinations } from "../hooks/use-home";

export function PopularDestinations() {
  const { data: destinations, isPending, isError } = usePopularDestinations(8);

  if (isError || (!isPending && (!destinations || destinations.length === 0))) {
    return null;
  }

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading blockKey="home.destinations" />

      {isPending ? (
        <CardGridSkeleton
          count={8}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        />
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {destinations!.map((destination, i) => (
            <Reveal key={destination.id} delayMs={i * 60}>
              <DestinationCard destination={destination} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
