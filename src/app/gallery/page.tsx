import type { Metadata } from "next";

import { GalleryContent } from "@/features/cms/components/gallery-content";
import { fetchGallery } from "@/features/cms/api";
import { metadataForPath } from "@/features/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/gallery");
}

export default async function GalleryPage() {
  const images = await fetchGallery();
  return <GalleryContent images={images} />;
}
