"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "./section-heading";
import { useFaqs } from "../hooks/use-home";

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function FaqSection() {
  const { data: faqs, isPending, isError } = useFaqs();

  if (isError || (!isPending && (!faqs || faqs.length === 0))) {
    return null;
  }

  const categories = faqs
    ? Array.from(new Set(faqs.map((faq) => faq.category)))
    : [];

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading blockKey="home.faq" />

      {isPending ? (
        <div className="mt-10 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <Reveal className="mt-10 flex flex-col gap-8">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {toTitleCase(category)}
              </h3>
              <Accordion className="w-full">
                {faqs!
                  .filter((faq) => faq.category === category)
                  .map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>
          ))}
        </Reveal>
      )}
    </section>
  );
}
