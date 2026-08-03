"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/pagination";
import { AdminPageHeader } from "@/features/admin/components/admin-page";
import { useProfileQuery } from "@/features/auth/hooks/use-auth";
import { canManageContent } from "@/features/auth/permissions";
import { getErrorMessage } from "@/utils/errors";
import { cn } from "@/lib/utils";
import { formatBytes, type MediaAsset } from "../api";
import { useDeleteMedia, useMediaList } from "../hooks/use-media";
import { MediaUploader } from "./media-uploader";

const FOLDERS = ["general", "gallery", "hotels", "packages", "blog", "banners"] as const;

interface MediaLibraryProps {
  /** When set, clicking an image selects it instead of just showing it —
   * this is what makes the same component usable as a picker. */
  onSelect?: (asset: MediaAsset) => void;
  selectedUrl?: string;
  /** Hides the page heading when embedded in a picker dialog. */
  embedded?: boolean;
}

export function MediaLibrary({ onSelect, selectedUrl, embedded }: MediaLibraryProps) {
  const { data: admin } = useProfileQuery();
  const canManage = canManageContent(admin?.role);

  const [folder, setFolder] = useState<string>("gallery");
  const [page, setPage] = useState(0);

  const { data, isPending, isError } = useMediaList({ folder, page, size: 24 });
  const remove = useDeleteMedia();

  return (
    <>
      {!embedded ? (
        <AdminPageHeader
          title="Media Library"
          description="Uploaded images. Everything here is resized and compressed on upload, and served with a long cache."
        />
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={folder === f ? "default" : "outline"}
            onClick={() => {
              setFolder(f);
              setPage(0);
            }}
          >
            {f}
          </Button>
        ))}
      </div>

      {canManage ? (
        <div className="mb-6">
          <MediaUploader folder={folder} />
        </div>
      ) : null}

      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Couldn&apos;t load the media library.
        </p>
      ) : !data || data.content.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing in <span className="font-medium">{folder}</span> yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {data.content.map((asset) => {
              const selected = selectedUrl === asset.url;

              return (
                <figure key={asset.id} className="group relative">
                  <button
                    type="button"
                    disabled={!onSelect}
                    onClick={() => onSelect?.(asset)}
                    aria-label={onSelect ? `Select ${asset.originalFilename}` : asset.originalFilename}
                    className={cn(
                      "relative block aspect-square w-full overflow-hidden rounded-xl border bg-muted",
                      onSelect && "cursor-pointer transition-colors hover:border-primary",
                      selected && "ring-2 ring-primary"
                    )}
                  >
                    {/* Plain img: these URLs come from whichever storage
                        provider is configured, and next/image only permits
                        hosts listed in next.config. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.thumbnailUrl ?? asset.url}
                      alt={asset.originalFilename}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    {selected ? (
                      <span className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>

                  <figcaption className="mt-1">
                    <p className="truncate text-xs text-foreground" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {asset.width}×{asset.height} · {formatBytes(asset.sizeBytes)}
                    </p>
                  </figcaption>

                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="secondary"
                      aria-label={`Copy URL for ${asset.originalFilename}`}
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        toast.success("URL copied");
                      }}
                    >
                      <Copy />
                    </Button>
                    {canManage ? (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="secondary"
                        aria-label={`Delete ${asset.originalFilename}`}
                        disabled={remove.isPending}
                        onClick={() => {
                          if (
                            !confirm(
                              `Delete "${asset.originalFilename}"? Anything still using this image will show a broken link.`
                            )
                          )
                            return;
                          remove.mutate(asset.id, {
                            onSuccess: () => toast.success("Image deleted"),
                            onError: (error) => toast.error(getErrorMessage(error)),
                          });
                        }}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </figure>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge variant="outline">{data.totalElements} image(s)</Badge>
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </>
  );
}
