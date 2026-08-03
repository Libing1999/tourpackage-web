"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Crop, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/spinner";
import { getErrorMessage } from "@/utils/errors";
import { cn } from "@/lib/utils";
import { formatBytes, type MediaAsset } from "../api";
import { useUploadMedia } from "../hooks/use-media";
import { ImageCropper } from "./image-cropper";

interface MediaUploaderProps {
  folder: string;
  onUploaded?: (assets: MediaAsset[]) => void;
}

/**
 * Multi-file picker with an optional crop step, then one batch upload.
 *
 * <p>Files are staged locally first so they can be cropped or removed before
 * anything is sent. The upload itself is a single request — the API treats a
 * batch as all-or-nothing, so uploading one at a time would turn a partial
 * failure into "some of these landed, work out which".
 */
export function MediaUploader({ folder, onUploaded }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();

  const [staged, setStaged] = useState<File[]>([]);
  const [cropping, setCropping] = useState<{ file: File; index: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));

    if (images.length < files.length) {
      toast.error("Only image files can be uploaded");
    }
    setStaged((prev) => [...prev, ...images]);
  };

  const replaceAt = (index: number, file: File) =>
    setStaged((prev) => prev.map((f, i) => (i === index ? file : f)));

  const removeAt = (index: number) => setStaged((prev) => prev.filter((_, i) => i !== index));

  const submit = () => {
    if (staged.length === 0) return;

    upload.mutate(
      { files: staged, folder },
      {
        onSuccess: (assets) => {
          toast.success(`${assets.length} image${assets.length === 1 ? "" : "s"} uploaded`);
          setStaged([]);
          if (inputRef.current) inputRef.current.value = "";
          onUploaded?.(assets);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <ImagePlus className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Drop images here, or choose files</p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or GIF · up to 10 MB each · resized and compressed on upload
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Choose images to upload"
          onChange={(e) => addFiles(e.target.files)}
        />
        <Button type="button" variant="outline" className="mt-1" onClick={() => inputRef.current?.click()}>
          Choose images
        </Button>
      </div>

      {staged.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {staged.map((file, index) => (
              <div key={`${file.name}-${index}`} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="size-full object-cover"
                  />
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground" title={file.name}>
                  {file.name} · {formatBytes(file.size)}
                </p>

                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="secondary"
                    aria-label={`Crop ${file.name}`}
                    onClick={() => setCropping({ file, index })}
                  >
                    <Crop />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="secondary"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeAt(index)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={submit} disabled={upload.isPending}>
              {upload.isPending ? <Spinner /> : null}
              Upload {staged.length} image{staged.length === 1 ? "" : "s"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStaged([])}
              disabled={upload.isPending}
            >
              Clear
            </Button>
          </div>
        </>
      ) : null}

      <ImageCropper
        file={cropping?.file ?? null}
        onCancel={() => setCropping(null)}
        onApply={(cropped) => {
          if (cropping) replaceAt(cropping.index, cropped);
          setCropping(null);
        }}
      />
    </div>
  );
}
