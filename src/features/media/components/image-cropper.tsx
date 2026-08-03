"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Crop box in *displayed* pixels; converted to natural pixels on apply. */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ASPECTS = [
  { label: "Free", value: 0 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
] as const;

const MIN_SIZE = 40;

interface ImageCropperProps {
  file: File | null;
  onCancel: () => void;
  onApply: (cropped: File) => void;
}

/**
 * Crops before upload, on a canvas.
 *
 * <p>Client-side rather than sending crop coordinates to the server: the
 * cropped result is what gets uploaded, so the server never stores pixels the
 * editor didn't want, and the user sees exactly what they'll get. It also
 * keeps {@code ImageProcessor} to one job — resize and compress — instead of
 * also carrying crop geometry.
 *
 * <p>Hand-rolled for the same reason the charts are: the interaction is a
 * draggable rectangle over an image, and a cropping library would be a large
 * dependency for that.
 */
export function ImageCropper({ file, onCancel, onApply }: ImageCropperProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [aspect, setAspect] = useState<number>(0);
  const [drag, setDrag] = useState<{ mode: "move" | "resize"; startX: number; startY: number; from: Rect } | null>(
    null
  );

  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setRect(null);
    // Revoking on cleanup rather than after load: the <img> keeps using this
    // URL for as long as the dialog is open.
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /** Starts with a centred box covering most of the image. */
  const initialiseRect = () => {
    const img = imageRef.current;
    if (!img) return;

    const w = img.clientWidth;
    const h = img.clientHeight;
    let width = w * 0.8;
    let height = h * 0.8;

    if (aspect > 0) {
      height = width / aspect;
      if (height > h * 0.9) {
        height = h * 0.9;
        width = height * aspect;
      }
    }

    setRect({ x: (w - width) / 2, y: (h - height) / 2, width, height });
  };

  useEffect(() => {
    if (src && imageRef.current?.complete) {
      initialiseRect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  const clamp = (next: Rect): Rect => {
    const img = imageRef.current;
    if (!img) return next;

    const maxW = img.clientWidth;
    const maxH = img.clientHeight;

    let { x, y, width, height } = next;
    width = Math.max(MIN_SIZE, Math.min(width, maxW));
    height = Math.max(MIN_SIZE, Math.min(height, maxH));

    if (aspect > 0) {
      height = width / aspect;
      if (height > maxH) {
        height = maxH;
        width = height * aspect;
      }
    }

    x = Math.max(0, Math.min(x, maxW - width));
    y = Math.max(0, Math.min(y, maxH - height));
    return { x, y, width, height };
  };

  const onPointerDown = (mode: "move" | "resize") => (e: React.PointerEvent) => {
    if (!rect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ mode, startX: e.clientX, startY: e.clientY, from: rect });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !rect) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    setRect(
      clamp(
        drag.mode === "move"
          ? { ...drag.from, x: drag.from.x + dx, y: drag.from.y + dy }
          : { ...drag.from, width: drag.from.width + dx, height: drag.from.height + dy }
      )
    );
  };

  const apply = () => {
    const img = imageRef.current;
    if (!img || !rect || !file) return;

    // Displayed pixels -> natural pixels, so the crop is applied at full
    // resolution rather than at whatever size the dialog happened to show.
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width * scaleX);
    canvas.height = Math.round(rect.height * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      rect.x * scaleX,
      rect.y * scaleY,
      rect.width * scaleX,
      rect.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // PNG keeps transparency; the server decides final format and compression
    // either way, so nothing is lost by not re-encoding to JPEG here.
    canvas.toBlob((blob) => {
      if (!blob) return;
      onApply(new File([blob], file.name, { type: "image/png" }));
    }, "image/png");
  };

  return (
    <Dialog open={file !== null} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Drag the box to move it, or its corner to resize. Skip cropping to upload the whole image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {ASPECTS.map((a) => (
            <Button
              key={a.label}
              type="button"
              size="sm"
              variant={aspect === a.value ? "default" : "outline"}
              onClick={() => setAspect(a.value)}
            >
              {a.label}
            </Button>
          ))}
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto w-fit touch-none select-none"
          onPointerMove={onPointerMove}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imageRef}
              src={src}
              alt="Image being cropped"
              onLoad={initialiseRect}
              draggable={false}
              className="max-h-[52vh] w-auto rounded-lg"
            />
          ) : null}

          {rect ? (
            <div
              role="group"
              aria-label="Crop area"
              className={cn(
                "absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]",
                drag && "select-none"
              )}
              style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
              onPointerDown={onPointerDown("move")}
            >
              <span
                role="button"
                aria-label="Resize crop area"
                className="absolute -right-1.5 -bottom-1.5 size-4 cursor-nwse-resize rounded-full border-2 border-white bg-primary"
                onPointerDown={onPointerDown("resize")}
              />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="ghost" onClick={() => file && onApply(file)}>
            Skip crop
          </Button>
          <Button type="button" onClick={apply}>
            Apply crop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
