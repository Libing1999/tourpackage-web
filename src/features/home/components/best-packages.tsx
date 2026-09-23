import { SectionHeading, SectionLink } from "./section-heading";
import { PackageCard } from "./package-card";
import { CardGridSkeleton } from "./card-grid-skeleton";
import { Reveal } from "@/components/common/reveal";
import { useBestPackages } from "../hooks/use-home";

export function BestPackages() {
  const { data: packages, isPending, isError } = useBestPackages(8);

  if (isError || (!isPending && (!packages || packages.length === 0))) {
    return null;
  }

  return (
    <section id="packages" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        blockKey="home.packages"
        align="start"
        action={<SectionLink href="/packages">View all packages</SectionLink>}
      />

      {isPending ? (
        <CardGridSkeleton
          count={4}
          cardClassName="aspect-auto h-80"
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages!.map((pkg, i) => (
            <Reveal key={pkg.id} delayMs={(i % 4) * 70}>
              <PackageCard pkg={pkg} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
