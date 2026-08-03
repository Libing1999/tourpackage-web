"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaLibrary } from "./media-library";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  id?: string;
  placeholder?: string;
}

/**
 * A URL field with a "browse" button onto the media library.
 *
 * <p>The text input stays editable on purpose: seeded content points at
 * external URLs, and an editor may legitimately want to paste one rather than
 * upload. The picker is a convenience over that field, not a replacement for it.
 */
export function MediaPicker({ value, onChange, id, placeholder }: MediaPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-2">
        {value ? (
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-full object-cover" />
          </div>
        ) : null}

        <Input
          id={id}
          value={value}
          placeholder={placeholder ?? "https://… or choose from the library"}
          onChange={(e) => onChange(e.target.value)}
        />

        <Button type="button" variant="outline" onClick={() => setOpen(true)} aria-label="Browse media library">
          <ImageIcon /> Browse
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
            <DialogDescription>
              Choose an existing image, or upload a new one. Uploads are cropped, resized and
              compressed before they&apos;re stored.
            </DialogDescription>
          </DialogHeader>

          <MediaLibrary
            embedded
            selectedUrl={value}
            onSelect={(asset) => {
              onChange(asset.url);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
