"use client";

import { Reveal } from "@/components/common/reveal";
import { useBlock } from "@/features/cms/site-content-provider";

/**
 * Pulls its own copy from the CMS by key, so a section renders
 * `<SectionHeading blockKey="home.hotels" />` and nothing about the wording
 * lives in the component.
 *
 * <p>Renders nothing when the block is missing or inactive — deactivating a
 * block in the CMS hides its heading, and an unreachable CMS degrades to no
 * heading rather than to stale copy baked into the bundle.
 */
export function SectionHeading({ blockKey }: { blockKey: string }) {
  const block = useBlock(blockKey);

  if (!block || (!block.title && !block.eyebrow)) {
    return null;
  }

  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      {block.eyebrow ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-primary/[0.07] px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase ring-1 ring-primary/10">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          {block.eyebrow}
        </p>
      ) : null}
      {block.title ? (
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {block.title}
        </h2>
      ) : null}
      {block.subtitle ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{block.subtitle}</p> : null}
    </Reveal>
  );
}
