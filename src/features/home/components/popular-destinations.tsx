import { SectionHeading } from "./section-heading";
import { DestinationCard } from "./destination-card";
import { CardGridSkeleton } from "./card-grid-skeleton";
import { Reveal } from "@/components/common/reveal";
import { cn } from "@/lib/utils";
import { usePopularDestinations } from "../hooks/use-home";
import type { Destination } from "../types";

const LG_COLS = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;
const LG_SPAN = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" } as const;

type Cols = keyof typeof LG_COLS;
type Span = keyof typeof LG_SPAN;

/**
 * Wide-screen mosaic for five or more destinations: the first tile takes a
 * 2×2 block and the rest flow around it. Picks the column count that leaves
 * the last row full; when neither does, the last tile stretches to close the
 * gap, so the grid never ends in a hole.
 */
function mosaicFor(count: number): { cols: Cols; lastSpan: Span } {
  for (const cols of [4, 3] as const) {
    // The two rows beside the lead tile hold (cols - 2) tiles each.
    const rest = count - 1 - 2 * (cols - 2);
    if (rest >= 0 && rest % cols === 0) return { cols, lastSpan: 1 };
  }
  const leftover = (count - 5) % 4;
  return { cols: 4, lastSpan: (4 - leftover + 1) as Span };
}

export function PopularDestinations() {
  const { data: destinations, isPending, isError } = usePopularDestinations(8);

  if (isError || (!isPending && (!destinations || destinations.length === 0))) {
    return null;
  }

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading blockKey="home.destinations" align="start" />

      {isPending ? (
        <CardGridSkeleton count={6} className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3" />
      ) : (
        <DestinationMosaic destinations={destinations!} />
      )}
    </section>
  );
}

function DestinationMosaic({ destinations }: { destinations: Destination[] }) {
  const count = destinations.length;

  // Too few to build a mosaic around: an even row of tiles.
  if (count < 5) {
    return (
      <div className={cn("mt-10 grid gap-3 sm:gap-4", count === 1 ? "grid-cols-1" : "grid-cols-2", count === 3 && "lg:grid-cols-3", count === 4 && "lg:grid-cols-4")}>
        {destinations.map((destination, i) => (
          <Reveal key={destination.id} delayMs={i * 70} className={count === 1 ? "aspect-[21/9]" : "aspect-[4/5] sm:aspect-[4/3]"}>
            <DestinationCard destination={destination} featured={count === 1} />
          </Reveal>
        ))}
      </div>
    );
  }

  const { cols, lastSpan } = mosaicFor(count);
  // On two-column screens the lead tile runs full width, which leaves the last
  // tile alone on its row when the remainder is odd; it runs full width too.
  const lastIsWideOnMobile = (count - 1) % 2 === 1;

  return (
    <div className={cn("mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[15rem]", LG_COLS[cols])}>
      {destinations.map((destination, i) => {
        const featured = i === 0;
        const last = i === count - 1;
        return (
          <Reveal
            key={destination.id}
            delayMs={Math.min(i, 6) * 70}
            className={cn(
              "lg:aspect-auto",
              featured
                ? "col-span-2 aspect-[16/10] sm:aspect-[2/1] lg:row-span-2"
                : last && lastIsWideOnMobile
                  ? "col-span-2 aspect-[16/10] sm:aspect-[2/1]"
                  : "aspect-[4/5] sm:aspect-[4/3]",
              featured ? "lg:col-span-2" : last ? LG_SPAN[lastSpan] : "lg:col-span-1"
            )}
          >
            <DestinationCard destination={destination} featured={featured} />
          </Reveal>
        );
      })}
    </div>
  );
}
