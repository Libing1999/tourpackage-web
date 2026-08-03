"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, GripVertical, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/spinner";
import { getErrorMessage } from "@/utils/errors";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/features/cms/types";
import { useReorderGallery } from "../hooks/use-media";

/**
 * Drag-to-reorder, with up/down buttons alongside.
 *
 * <p>The buttons aren't a fallback — they're the keyboard path. HTML5 drag
 * and drop is mouse-only, so a drag-only control would put reordering out of
 * reach for anyone not using a pointer.
 *
 * <p>Order is applied locally first and saved explicitly, so a drag doesn't
 * fire a request per hop across the list.
 */
export function GalleryReorder({ images }: { images: GalleryImage[] }) {
  const reorder = useReorderGallery();
  const [order, setOrder] = useState<GalleryImage[]>(images);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Re-seed when the server list changes (a new upload, a delete) so the
  // local order doesn't hold a stale set.
  useEffect(() => setOrder(images), [images]);

  const dirty =
    order.length === images.length && order.some((image, i) => image.id !== images[i]?.id);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
  };

  const save = () => {
    reorder.mutate(
      order.map((image) => image.id),
      {
        onSuccess: () => toast.success("Order saved"),
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border bg-background p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Order</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Drag a photo, or use the arrows. This is the order visitors see on the gallery page.
          </p>
        </div>
        <Button type="button" size="sm" onClick={save} disabled={!dirty || reorder.isPending}>
          {reorder.isPending ? <Spinner /> : <Save />}
          Save order
        </Button>
      </div>

      <ol className="flex flex-wrap gap-3">
        {order.map((image, index) => (
          <li
            key={image.id}
            draggable
            onDragStart={() => setDraggingId(image.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!draggingId) return;
              const from = order.findIndex((i) => i.id === draggingId);
              if (from !== -1 && from !== index) move(from, index);
              setDraggingId(null);
            }}
            className={cn(
              "group relative w-28 cursor-grab rounded-xl border bg-card p-1.5 transition-opacity active:cursor-grabbing",
              draggingId === image.id && "opacity-40"
            )}
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.altText ?? ""} className="size-full object-cover" />
              <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-medium text-white">
                {index + 1}
              </span>
              <GripVertical className="absolute top-1 right-1 size-4 text-white/70" />
            </div>

            <div className="mt-1 flex justify-center gap-0.5">
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={`Move ${image.caption ?? "image"} earlier`}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={`Move ${image.caption ?? "image"} later`}
                disabled={index === order.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ChevronDown />
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
