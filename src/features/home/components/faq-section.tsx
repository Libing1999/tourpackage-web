"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

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
    <section id="faq" className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
        {/* The heading stays in view while the questions scroll past it. */}
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-8 lg:sticky lg:top-28">
            <SectionHeading blockKey="home.faq" align="start" />
            <Reveal delayMs={120}>
              <Link
                href="/contact"
                className="group/help flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card ring-1 ring-foreground/[0.07] transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageCircle className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">Still have a question?</span>
                  <span className="block text-sm text-muted-foreground">Get in touch with our team</span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-[translate,color] duration-200 ease-out-soft group-hover/help:translate-x-0.5 group-hover/help:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          {isPending ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {categories.map((category, i) => (
                <Reveal key={category} delayMs={Math.min(i, 3) * 80}>
                  <h3 className="mb-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {toTitleCase(category)}
                  </h3>
                  <Accordion className="w-full rounded-2xl bg-card px-5 shadow-card ring-1 ring-foreground/[0.07] sm:px-6">
                    {faqs!
                      .filter((faq) => faq.category === category)
                      .map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger className="py-4 text-[0.95rem] hover:text-primary hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
