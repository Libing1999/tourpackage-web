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
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">{block.eyebrow}</p>
      ) : null}
      {block.title ? (
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {block.title}
        </h2>
      ) : null}
      {block.subtitle ? <p className="mt-3 text-muted-foreground">{block.subtitle}</p> : null}
    </Reveal>
  );
}
