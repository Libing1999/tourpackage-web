import type { Metadata } from "next";

import { BlogContent } from "@/features/cms/components/blog-content";
import { metadataForPath } from "@/features/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/blog");
}

export default function BlogPage() {
  return <BlogContent />;
}
