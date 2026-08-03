"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/** Structural shape shared by HotelImage and PackageImage — the gallery only
 * ever needs these fields, so it doesn't care which feature the rows came from. */
export interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isCover: boolean;
}

interface MediaGalleryProps {
  images: GalleryImage[];
  /** Fallback alt text when an image has none of its own. */
  title: string;
}

export function MediaGallery({ images, title }: MediaGalleryProps) {
  const sorted = [...images].sort(
    (a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0) || a.displayOrder - b.displayOrder
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return <div className="aspect-[16/9] w-full rounded-2xl bg-muted" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>

      {sorted.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition-all",
                i === activeIndex && "ring-primary"
              )}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === activeIndex}
            >
              <Image
                src={image.url}
                alt={image.altText ?? title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
