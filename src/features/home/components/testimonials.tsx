import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";
import { TestimonialCard } from "./testimonial-card";
import { useFeaturedTestimonials } from "../hooks/use-home";

export function Testimonials() {
  const { data: testimonials, isPending, isError } = useFeaturedTestimonials(6);

  if (isError || (!isPending && (!testimonials || testimonials.length === 0))) {
    return null;
  }

  // The first review leads as a pull quote; up to two more stack beside it,
  // and any beyond that run in a row underneath.
  const [lead, ...others] = testimonials ?? [];
  const beside = others.slice(0, 2);
  const below = others.slice(2);

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading blockKey="home.testimonials" align="start" />

      {isPending ? (
        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Skeleton className="h-80 w-full rounded-2xl lg:col-span-7" />
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <Reveal className={cn(beside.length > 0 ? "lg:col-span-7" : "lg:col-span-12")}>
              <TestimonialCard testimonial={lead!} featured />
            </Reveal>
            {beside.length > 0 ? (
              <div className="flex flex-col gap-5 lg:col-span-5">
                {beside.map((testimonial, i) => (
                  <Reveal key={testimonial.id} delayMs={(i + 1) * 90} direction="right" className="flex-1">
                    <TestimonialCard testimonial={testimonial} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>

          {below.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {below.map((testimonial, i) => (
                <Reveal key={testimonial.id} delayMs={i * 70}>
                  <TestimonialCard testimonial={testimonial} />
                </Reveal>
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
