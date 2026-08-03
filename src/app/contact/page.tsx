import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactPageContent } from "@/features/contact/components/contact-page-content";
import { Spinner } from "@/components/common/spinner";
import { metadataForPath } from "@/features/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPath("/contact");
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
