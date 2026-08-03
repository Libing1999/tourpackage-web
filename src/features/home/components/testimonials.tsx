import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "./section-heading";
import { TestimonialCard } from "./testimonial-card";
import { useFeaturedTestimonials } from "../hooks/use-home";

export function Testimonials() {
  const { data: testimonials, isPending, isError } = useFeaturedTestimonials(6);

  if (isError || (!isPending && (!testimonials || testimonials.length === 0))) {
    return null;
  }

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading blockKey="home.testimonials" />

      {isPending ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials!.map((testimonial, i) => (
            <Reveal key={testimonial.id} delayMs={i * 60}>
              <TestimonialCard testimonial={testimonial} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
