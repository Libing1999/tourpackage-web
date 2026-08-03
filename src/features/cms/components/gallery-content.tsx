"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";
import { useBlock } from "../site-content-provider";
import type { GalleryImage } from "../types";
import { cn } from "@/lib/utils";

const ALL = "All";

export function GalleryContent({ images }: { images: GalleryImage[] }) {
  const heading = useBlock("page.gallery");
  const [category, setCategory] = useState(ALL);

  // Categories come from the images themselves, so adding a photo in a new
  // category adds the filter with it — no second list to keep in sync.
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(images.map((i) => i.category))).sort()],
    [images]
  );

  const visible = category === ALL ? images : images.filter((i) => i.category === category);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            {heading?.eyebrow ? (
              <p className="text-sm font-semibold tracking-wider text-primary uppercase">
                {heading.eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {heading?.title}
            </h1>
            {heading?.subtitle ? (
              <p className="mt-3 text-muted-foreground">{heading.subtitle}</p>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {images.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-16 text-center">
              <p className="text-sm text-muted-foreground">No photos have been published yet.</p>
            </div>
          ) : (
            <>
              {categories.length > 2 ? (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {categories.map((c) => (
                    <Button
                      key={c}
                      variant={c === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {visible.map((image, i) => (
                  // The span belongs on the grid item, which is this wrapper —
                  // putting it on the figure inside did nothing but squash the
                  // image, since the figure isn't a direct child of the grid.
                  <Reveal
                    key={image.id}
                    delayMs={Math.min(i, 8) * 50}
                    className={cn(i % 7 === 0 && "lg:col-span-2")}
                  >
                    <figure
                      className={cn(
                        "group relative w-full overflow-hidden rounded-xl bg-muted",
                        // Every seventh image runs wide, to break up an
                        // otherwise very uniform grid.
                        i % 7 === 0 ? "aspect-square lg:aspect-[2/1]" : "aspect-square"
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText ?? image.caption ?? "Gallery photograph"}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {image.caption ? (
                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
